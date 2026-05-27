// Salle : Halls Cendrés — Le Double Puits (NS compact, alt)
// (Phase 9.6 — Pool diversité)
//
// INTENTION : 2ème salle NS Halls — puits avec murs explosifs latéraux
// qui menacent quand on grimpe.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteN, porteS,
    murExplosif, brasier
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_double_puits_NS = {
    id: 'halls_double_puits_NS',
    biome: 'halls_cendres',
    nom: 'Le Double Puits',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S'],
    archetypesCompatibles: ['puits', 'crypte'],

    generer({ portesActives = ['N', 'S'] } = {}) {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Zigzag d'ascension central
        plateformes.push(plateforme(200, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(440, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(220, 290, 110, { oneWay: true }));
        plateformes.push(plateforme(460, 220, 110, { oneWay: true }));
        plateformes.push(plateforme(480, 130, 160, { oneWay: true }));

        // Foyer brasier décoratif au sol
        plateformes.push(plateforme(750, Y_SOL - 20, 80));

        // Palier S
        plateformes.push(plateforme(480, 440, 140, { oneWay: true }));

        const obstacles = [
            brasier(750, Y_SOL - 20, { cycleMs: 2800, offsetMs: 0, largeur: 70 }),
            // 2 murs explosifs latéraux qui menacent au passage
            murExplosif(650, 300, { largeur: 30, hauteur: 100, hp: 3, dropSel: true }),
            murExplosif(80, 280, { largeur: 30, hauteur: 100, hp: 3, dropFragmentFamille: 'noir' })
        ];

        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(480, 40);
        if (portesActives.includes('S')) portes.S = porteS(480, 440);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 480, y: 130 - 20 }
        };
    }
};
