// Salle : Halls Cendrés — Coin NE (compact)
// (Phase 9.6 — Migration)
//
// INTENTION : ascension droite, sortie N en haut, entrée E au sol.
// Niche brasier à mi-hauteur, escalier vertical zigzag.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteE,
    brasier
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_coin_NE = {
    id: 'halls_coin_NE',
    biome: 'halls_cendres',
    nom: 'Le Coin du Forgeron (NE)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['E', 'N'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['E', 'N'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, 380, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Escalier ascension droite (zigzag vers porte N)
        plateformes.push(plateforme(170, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(380, 370, 110, { oneWay: true }));
        plateformes.push(plateforme(600, 310, 110, { oneWay: true }));   // foyer brasier
        plateformes.push(plateforme(780, 240, 110, { oneWay: true }));
        plateformes.push(plateforme(600, 170, 130, { oneWay: true }));
        plateformes.push(plateforme(480, 110, 150, { oneWay: true }));   // sous porte N

        const obstacles = [
            brasier(600, 310, { cycleMs: 2600, offsetMs: 0, largeur: 100 })
        ];

        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(480, 30);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
