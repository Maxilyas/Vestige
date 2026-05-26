// Salle : Ruines basses — Atelier Scellé (impasse E compact)
// (Phase 9.3c)
// INTENTION : "deadend coffre" — entrée E, coffre dans le fond à gauche.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale, murLateralGauche,
    porteE,
    eboulis
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const ruines_impasse_E_compact = {
    id: 'ruines_impasse_E_compact',
    biome: 'ruines_basses',
    nom: 'Atelier Scellé (E)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['E'],
    archetypesCompatibles: ['crypte', 'hall'],
    rolesAutorises: ['deadend', 'alt'],

    generer() {
        const plateformes = [];
        plateformes.push(plafondCathedrale(60, W - 60, 24));
        plateformes.push(sol(0, W, Y_SOL));
        plateformes.push(murLateralGauche(24, Y_SOL));

        // Paliers menant au coffre (à gauche)
        plateformes.push(plateforme(740, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(540, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(340, 290, 110, { oneWay: true }));
        plateformes.push(plateforme(160, 220, 120, { oneWay: true }));

        // Petit blocage : éboulis cassable au sol près du coffre (récompense)
        const obstacles = [
            eboulis(200, Y_SOL - 110, { largeur: 80, hp: 2, dropSel: true })
        ];

        const portes = { E: porteE(W, Y_SOL) };
        const coffreForce = { x: 160, y: 220 - 12 };

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: W - 80, y: Y_SOL - 20 },
            coffreForce
        };
    }
};
