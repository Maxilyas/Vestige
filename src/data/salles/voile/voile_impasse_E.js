// Salle : Voile Inversé — La Niche Fixée (impasse E compact)
// (Phase 9.x — Migration Voile, fondation)
//
// INTENTION : deadend. Entrée par la porte E (sol). Marches ascendantes vers
// une niche déchirée (coffre) accrochée en haut-gauche.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteE
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const voile_impasse_E = {
    id: 'voile_impasse_E',
    biome: 'voile_inverse',
    nom: 'La Niche Fixée (E)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['E'],
    archetypesCompatibles: ['crypte', 'hall'],
    rolesAutorises: ['deadend', 'alt'],

    generer() {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Marches ascendantes vers la niche (haut-gauche)
        plateformes.push(plateforme(760, 430, 130, { oneWay: true }));
        plateformes.push(plateforme(580, 360, 130, { oneWay: true }));
        plateformes.push(plateforme(400, 290, 130, { oneWay: true }));
        plateformes.push(plateforme(240, 220, 140, { oneWay: true }));   // niche (coffre)

        const portes = { E: porteE(W, Y_SOL) };
        const coffreForce = { x: 240, y: 220 - 12 };

        return {
            plateformes, obstacles: [], zones: [], portes,
            spawnDefault: { x: W - 80, y: Y_SOL - 20 },
            coffreForce
        };
    }
};
