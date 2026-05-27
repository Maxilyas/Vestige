// Salle : Halls Cendrés — La Crypte Effondrée (NS compact, signature)
// (Phase 9.6 — Migration)
//
// SIGNATURE : descente verticale. Zigzag + 2 niches latérales cachées
// derrière mur fissuré. Un brasier unique sur palier mi-hauteur.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteN, porteS,
    brasier, murFissure
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_crypte_effondree = {
    id: 'halls_crypte_effondree',
    biome: 'halls_cendres',
    nom: 'La Crypte Effondrée',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S'],
    archetypesCompatibles: ['puits', 'crypte'],
    rolesAutorises: ['main', 'alt'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['N', 'S'] } = {}) {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Zigzag descente
        plateformes.push(plateforme(180, 430, 120, { oneWay: true }));
        plateformes.push(plateforme(440, 360, 120, { oneWay: true }));
        plateformes.push(plateforme(200, 290, 120, { oneWay: true }));
        plateformes.push(plateforme(440, 220, 120, { oneWay: true }));   // foyer brasier
        plateformes.push(plateforme(480, 130, 160, { oneWay: true }));

        // 2 niches latérales cachées (accessibles après cassure mur fissuré)
        plateformes.push(plateforme(820, 360, 100, { oneWay: true, tags: ['secret'] }));
        plateformes.push(plateforme(820, 220, 100, { oneWay: true, tags: ['secret'] }));

        // Palier S
        plateformes.push(plateforme(480, 440, 140, { oneWay: true }));

        const obstacles = [
            brasier(440, 220, { cycleMs: 2800, offsetMs: 0, largeur: 100 }),
            // 2 murs fissurés latéraux qui cachent les niches secrètes
            murFissure(740, 320, { largeur: 30, hauteur: 80, hp: 3, dropSel: true }),
            murFissure(740, 180, { largeur: 30, hauteur: 80, hp: 3, dropFragmentFamille: 'noir' })
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
