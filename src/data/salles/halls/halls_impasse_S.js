// Salle : Halls Cendrés — Fosse aux Braises (impasse S compact)
// (Phase 9.6 — Migration, fixed BFS)

import {
    HAUTEUR_SOL, sol, plateforme,
    porteS,
    brasier, pieuSol
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_impasse_S = {
    id: 'halls_impasse_S',
    biome: 'halls_cendres',
    nom: 'Fosse aux Braises',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['S'],
    archetypesCompatibles: ['crypte', 'sanctuaire'],
    rolesAutorises: ['deadend'],

    generer({ portesActives = ['S'] } = {}) {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // 3 foyers brasiers surélevés au sol
        plateformes.push(plateforme(200, Y_SOL - 20, 80));
        plateformes.push(plateforme(480, Y_SOL - 20, 80));
        plateformes.push(plateforme(760, Y_SOL - 20, 80));

        // Palier S surélevé (entrée)
        plateformes.push(plateforme(480, 440, 140, { oneWay: true }));

        // Chaîne stepping vers estrade coffre
        plateformes.push(plateforme(150, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(810, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(300, 355, 110, { oneWay: true }));
        plateformes.push(plateforme(660, 355, 110, { oneWay: true }));
        plateformes.push(plateforme(480, 280, 130, { oneWay: true }));
        plateformes.push(plateforme(480, 200, 160, { oneWay: true }));   // estrade coffre

        const obstacles = [
            brasier(200, Y_SOL - 20, { cycleMs: 2400, offsetMs: 0,    largeur: 70 }),
            brasier(480, Y_SOL - 20, { cycleMs: 2400, offsetMs: 800,  largeur: 70 }),
            brasier(760, Y_SOL - 20, { cycleMs: 2400, offsetMs: 1600, largeur: 70 }),
            pieuSol(340, Y_SOL),
            pieuSol(620, Y_SOL)
        ];

        const portes = {};
        if (portesActives.includes('S')) portes.S = porteS(480, 440);

        const coffreForce = { x: 480, y: 200 - 12 };

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 480, y: 440 - 20 },
            coffreForce
        };
    }
};
