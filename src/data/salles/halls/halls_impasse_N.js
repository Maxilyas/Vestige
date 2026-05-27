// Salle : Halls Cendrés — Corniche Oubliée (impasse N compact)
// (Phase 9.6 — Migration, fixed BFS)
//
// Tous les paliers accessibles depuis le sol via stepping (sol+70, +140 via
// stepping, etc.) — pas seulement par drop depuis porte N.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteN,
    brasier
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_impasse_N = {
    id: 'halls_impasse_N',
    biome: 'halls_cendres',
    nom: 'Corniche Oubliée',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N'],
    archetypesCompatibles: ['puits', 'crypte'],
    rolesAutorises: ['deadend'],

    generer({ portesActives = ['N'] } = {}) {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Chaîne stepping ascendante (depuis sol y=500, vers porte N y=40)
        plateformes.push(plateforme(150, 430, 110, { oneWay: true }));   // sol+70
        plateformes.push(plateforme(810, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(300, 350, 110, { oneWay: true }));
        plateformes.push(plateforme(660, 350, 110, { oneWay: true }));
        plateformes.push(plateforme(480, 270, 160, { oneWay: true }));   // foyer brasier
        plateformes.push(plateforme(300, 190, 110, { oneWay: true }));
        plateformes.push(plateforme(660, 190, 110, { oneWay: true }));
        plateformes.push(plateforme(480, 110, 150, { oneWay: true }));   // sous porte N

        const obstacles = [
            brasier(480, 270, { cycleMs: 3000, offsetMs: 0, largeur: 140 })
        ];

        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(480, 30);

        // Coffre garanti au sommet (sous la porte d'entrée)
        const coffreForce = { x: 480, y: 110 - 12 };

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 480, y: 110 - 20 },
            coffreForce
        };
    }
};
