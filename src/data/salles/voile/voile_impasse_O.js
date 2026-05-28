// Salle : Voile Inversé — Le Sanctuaire Muré (impasse O compact)
// (Phase 9.x — Migration Voile, fondation)
//
// INTENTION : deadend. Entrée par la porte O (sol). Marches ascendantes vers
// un sanctuaire déchiré (coffre) en haut-droite. Miroir de la Niche Fixée.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteO
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const voile_impasse_O = {
    id: 'voile_impasse_O',
    biome: 'voile_inverse',
    nom: 'Le Sanctuaire Muré (O)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O'],
    archetypesCompatibles: ['crypte', 'hall'],
    rolesAutorises: ['deadend', 'alt'],

    generer() {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Marches ascendantes vers le sanctuaire (haut-droite)
        plateformes.push(plateforme(200, 430, 130, { oneWay: true }));
        plateformes.push(plateforme(380, 360, 130, { oneWay: true }));
        plateformes.push(plateforme(560, 290, 130, { oneWay: true }));
        plateformes.push(plateforme(720, 220, 140, { oneWay: true }));   // sanctuaire (coffre)

        const portes = { O: porteO(Y_SOL) };
        const coffreForce = { x: 720, y: 220 - 12 };

        return {
            plateformes, obstacles: [], zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 },
            coffreForce
        };
    }
};
