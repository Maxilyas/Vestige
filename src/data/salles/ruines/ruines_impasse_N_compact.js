// Salle : Ruines basses — Corniche Oubliée (impasse N compact)
// (Phase 9.3c)
// INTENTION : "deadend vers le haut" — entrée N tout en haut, coffre au sol.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteN
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const ruines_impasse_N_compact = {
    id: 'ruines_impasse_N_compact',
    biome: 'ruines_basses',
    nom: 'Corniche Oubliée (N)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N'],
    archetypesCompatibles: ['puits', 'crypte'],
    rolesAutorises: ['deadend', 'alt'],

    generer() {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Cascade : tous les paliers atteignables depuis le sol par sauts
        // normaux (zigzag serré avec overlap horizontal).
        plateformes.push(plateforme(180, 430, 130, { oneWay: true }));  // sol+70
        plateformes.push(plateforme(420, 360, 130, { oneWay: true }));  // 70v, 90h
        plateformes.push(plateforme(660, 290, 130, { oneWay: true }));  // 70v, 110h
        plateformes.push(plateforme(420, 220, 130, { oneWay: true }));  // 70v, 110h
        plateformes.push(plateforme(480, 130, 150, { oneWay: true }));  // 90v, overlap

        const portes = { N: porteN(480, 40) };
        const coffreForce = { x: 150, y: Y_SOL - 12 };

        return {
            plateformes, obstacles: [], zones: [], portes,
            spawnDefault: { x: 480, y: 130 - 20 },
            coffreForce
        };
    }
};
