// Salle : Halls Cendrés — Chambre du Brasier (impasse E compact)
// (Phase 9.6 — Migration, fixed BFS)

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteE,
    brasier
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_impasse_E = {
    id: 'halls_impasse_E',
    biome: 'halls_cendres',
    nom: 'Chambre du Brasier',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['E'],
    archetypesCompatibles: ['sanctuaire'],
    rolesAutorises: ['deadend'],

    generer({ portesActives = ['E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Foyer central + brasier majeur
        plateformes.push(plateforme(480, Y_SOL - 25, 220));

        // Chaîne d'ascension paliers latéraux + estrade
        plateformes.push(plateforme(200, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(800, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(330, 360, 100, { oneWay: true }));
        plateformes.push(plateforme(630, 360, 100, { oneWay: true }));
        plateformes.push(plateforme(480, 285, 160, { oneWay: true }));
        plateformes.push(plateforme(480, 205, 180, { oneWay: true }));   // estrade coffre

        const obstacles = [
            brasier(480, Y_SOL - 25, { cycleMs: 2400, offsetMs: 0, largeur: 200 })
        ];

        const portes = {};
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        const coffreForce = { x: 480, y: 205 - 12 };

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: W - 80, y: Y_SOL - 20 },
            coffreForce
        };
    }
};
