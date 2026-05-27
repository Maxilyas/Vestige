// Salle : Halls Cendrés — Puits aux Cendres (NS compact)
// (Phase 9.6 — Migration, fixed BFS)
//
// INTENTION : descente verticale. Sols effrités en zigzag central.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteN, porteS,
    solEffrite, brasier
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_puits_cendres = {
    id: 'halls_puits_cendres',
    biome: 'halls_cendres',
    nom: 'Le Puits aux Cendres',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S'],
    archetypesCompatibles: ['puits'],

    generer({ portesActives = ['N', 'S'] } = {}) {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Paliers safe latéraux (sol+70)
        plateformes.push(plateforme(160, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(800, 430, 110, { oneWay: true }));

        // Zigzag de sols effrités (gap horiz ≤130, vert 90)
        plateformes.push(solEffrite(320, 360, 100));   // edges 270..370
        plateformes.push(solEffrite(480, 270, 100));   // edges 430..530 — gap 60 vs G effrité, vert 90
        plateformes.push(solEffrite(640, 360, 100));   // edges 590..690 — connect avec palier D

        // Palier N stable (vert 95 depuis effrité mid)
        plateformes.push(plateforme(480, 175, 160, { oneWay: true }));

        // Foyer brasier + palier S
        plateformes.push(plateforme(480, Y_SOL - 25, 140));
        plateformes.push(plateforme(480, 440, 140, { oneWay: true }));

        const obstacles = [
            brasier(480, Y_SOL - 25, { cycleMs: 2600, offsetMs: 0, largeur: 120 })
        ];

        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(480, 40);
        if (portesActives.includes('S')) portes.S = porteS(480, 440);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 480, y: 175 - 20 }
        };
    }
};
