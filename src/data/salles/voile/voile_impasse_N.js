// Salle : Voile Inversé — La Corniche du Vide (impasse N compact)
// (Phase 9.x — Migration Voile, fondation)
//
// INTENTION : deadend. Entrée par la porte N (haut), descente en puits
// déchiré jusqu'au coffre au sol. On ressort par où on est venu.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteN
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const voile_impasse_N = {
    id: 'voile_impasse_N',
    biome: 'voile_inverse',
    nom: 'La Corniche du Vide (N)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N'],
    archetypesCompatibles: ['crypte', 'puits'],
    rolesAutorises: ['deadend', 'alt'],

    generer() {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Zigzag de descente depuis la porte N
        plateformes.push(plateforme(480, 120, 150, { oneWay: true }));   // sous porte N
        plateformes.push(plateforme(420, 210, 130, { oneWay: true }));
        plateformes.push(plateforme(560, 290, 130, { oneWay: true }));
        plateformes.push(plateforme(380, 360, 130, { oneWay: true }));
        plateformes.push(plateforme(200, 430, 120, { oneWay: true }));

        const portes = { N: porteN(480, 30) };
        const coffreForce = { x: 480, y: 488 };

        return {
            plateformes, obstacles: [], zones: [], portes,
            spawnDefault: { x: 480, y: 120 - 20 },
            coffreForce
        };
    }
};
