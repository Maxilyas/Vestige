// Salle : Halls Cendrés — Cheminée de Braise (NS compact)
// (Phase 9.6 — Migration)
//
// INTENTION : verticale étroite. Brasiers étagés en quinconce sur paliers.
// Le brasier n'est PAS au sol — c'est UN PALIER qui brûle (foyer mobile).

import {
    HAUTEUR_SOL, sol, plateforme,
    porteN, porteS,
    brasier
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_cheminee_braise = {
    id: 'halls_cheminee_braise',
    biome: 'halls_cendres',
    nom: 'La Cheminée de Braise',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S'],
    archetypesCompatibles: ['puits', 'crypte'],

    generer({ portesActives = ['N', 'S'] } = {}) {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Paliers ascendants en quinconce
        plateformes.push(plateforme(220, 430, 120, { oneWay: true }));
        plateformes.push(plateforme(720, 430, 120, { oneWay: true }));   // foyer brasier
        plateformes.push(plateforme(380, 360, 120, { oneWay: true }));   // foyer brasier
        plateformes.push(plateforme(560, 290, 120, { oneWay: true }));   // foyer brasier
        plateformes.push(plateforme(380, 220, 120, { oneWay: true }));
        plateformes.push(plateforme(480, 130, 160, { oneWay: true }));   // palier N

        // Palier S surélevé
        plateformes.push(plateforme(480, 440, 140, { oneWay: true }));

        const obstacles = [
            // 3 brasiers cycliques sur les foyers (timing échelonné)
            brasier(720, 430, { cycleMs: 2400, offsetMs: 0,    largeur: 100 }),
            brasier(380, 360, { cycleMs: 2400, offsetMs: 800,  largeur: 100 }),
            brasier(560, 290, { cycleMs: 2400, offsetMs: 1600, largeur: 100 })
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
