// Salle : Halls Cendrés — Sanctuaire Éteint (impasse O compact)
// (Phase 9.6 — Migration, fixed BFS)

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_impasse_O = {
    id: 'halls_impasse_O',
    biome: 'halls_cendres',
    nom: 'Sanctuaire Éteint',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O'],
    archetypesCompatibles: ['sanctuaire'],
    rolesAutorises: ['deadend'],

    generer({ portesActives = ['O'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Foyer éteint surélevé
        plateformes.push(plateforme(580, Y_SOL - 30, 180));

        // Chaîne d'ascension vers estrade coffre
        plateformes.push(plateforme(200, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(380, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(580, 290, 130, { oneWay: true }));
        plateformes.push(plateforme(580, 210, 160, { oneWay: true }));   // estrade coffre

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);

        const coffreForce = { x: 580, y: 210 - 12 };

        return {
            plateformes, obstacles: [], zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 },
            coffreForce
        };
    }
};
