// Salle : Ruines basses — Caveau Profond (impasse S compact)
// (Phase 9.3c)
// INTENTION : "deadend vers le bas" — entrée S sur palier surélevé, coffre en bas.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteS
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const ruines_impasse_S_compact = {
    id: 'ruines_impasse_S_compact',
    biome: 'ruines_basses',
    nom: 'Caveau Profond (S)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['S'],
    archetypesCompatibles: ['crypte', 'puits'],
    rolesAutorises: ['deadend', 'alt'],

    generer() {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Paliers en cascade : tous atteignables depuis le sol par sauts
        // normaux (sol → 430 → 360 → 290 → 220 → 130).
        plateformes.push(plateforme(150, 430, 110, { oneWay: true }));  // sol+70
        plateformes.push(plateforme(810, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(320, 360, 130, { oneWay: true }));  // 70v, overlap
        plateformes.push(plateforme(640, 360, 130, { oneWay: true }));
        plateformes.push(plateforme(220, 290, 130, { oneWay: true }));  // 70v, 70h
        plateformes.push(plateforme(740, 290, 130, { oneWay: true }));
        plateformes.push(plateforme(480, 220, 200, { oneWay: true }));  // 70v, 95h
        plateformes.push(plateforme(480, 130, 160, { oneWay: true }));  // palier S 90v

        const portes = { S: porteS(480, 130) };
        const coffreForce = { x: 480, y: Y_SOL - 12 };

        return {
            plateformes, obstacles: [], zones: [], portes,
            spawnDefault: { x: 480, y: 130 - 20 },
            coffreForce
        };
    }
};
