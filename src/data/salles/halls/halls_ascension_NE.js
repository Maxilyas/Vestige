// Salle : Halls Cendrés — Ascension du Forgeron (NE compact, alt)
// (Phase 9.6 — Pool diversité, fixed BFS v2)
//
// INTENTION : ascension via foyers surélevés en escalier zigzag.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteE,
    brasier
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_ascension_NE = {
    id: 'halls_ascension_NE',
    biome: 'halls_cendres',
    nom: 'L\'Ascension du Forgeron',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['E', 'N'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['E', 'N'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, 380, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // 3 foyers en escalier ascendant droite (vert 75 entre chaque)
        plateformes.push(plateforme(280, 420, 110));   // edges 225..335 — sol+80
        plateformes.push(plateforme(460, 345, 110));   // edges 405..515 — vert 75 depuis foyer 1
        plateformes.push(plateforme(640, 270, 110));   // edges 585..695 — vert 75 depuis foyer 2

        // Paliers retour vers porte N (vert 80 entre chaque)
        plateformes.push(plateforme(580, 190, 130, { oneWay: true }));   // edges 515..645 — depuis foyer 3
        plateformes.push(plateforme(480, 110, 150, { oneWay: true }));   // edges 405..555 — sous porte N

        // Palier safe gauche bas
        plateformes.push(plateforme(120, 430, 100, { oneWay: true }));

        const obstacles = [
            brasier(280, 420, { cycleMs: 2400, offsetMs: 0,    largeur: 100 }),
            brasier(460, 345, { cycleMs: 2400, offsetMs: 800,  largeur: 100 }),
            brasier(640, 270, { cycleMs: 2400, offsetMs: 1600, largeur: 100 })
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
