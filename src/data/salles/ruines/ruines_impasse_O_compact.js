// Salle : Ruines basses — Sanctuaire Scellé (impasse O compact)
// (Phase 9.3c)
// INTENTION : "deadend coffre" — entrée O, coffre dans le fond à droite.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale, murLateralDroit,
    porteO
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const ruines_impasse_O_compact = {
    id: 'ruines_impasse_O_compact',
    biome: 'ruines_basses',
    nom: 'Sanctuaire Scellé (O)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O'],
    archetypesCompatibles: ['sanctuaire', 'crypte'],
    rolesAutorises: ['deadend', 'alt'],

    generer() {
        const plateformes = [];
        plateformes.push(plafondCathedrale(60, W - 60, 24));
        plateformes.push(sol(0, W, Y_SOL));
        plateformes.push(murLateralDroit(W, 24, Y_SOL));

        // Paliers menant au coffre (au fond)
        plateformes.push(plateforme(220, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(420, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(620, 290, 110, { oneWay: true }));
        plateformes.push(plateforme(800, 220, 120, { oneWay: true }));

        const portes = { O: porteO(Y_SOL) };
        const coffreForce = { x: 800, y: 220 - 12 };

        return {
            plateformes, obstacles: [], zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 },
            coffreForce
        };
    }
};
