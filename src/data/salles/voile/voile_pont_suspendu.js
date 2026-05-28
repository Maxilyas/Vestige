// Salle : Voile Inversé — Le Pont Suspendu (OE compact)
// (Phase 9.x — Migration Voile, fondation)
//
// INTENTION : franchir un gouffre via un fragment de cité dérivant (navette
// mobile horizontale). Paliers de combat aux deux rives, pieux affleurants.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    plateformeMobile, pieuSol
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const voile_pont_suspendu = {
    id: 'voile_pont_suspendu',
    biome: 'voile_inverse',
    nom: 'Le Pont Suspendu',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['pont', 'hall'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));

        // Sol coupé : gouffre mortel central (300 → 660)
        plateformes.push(sol(0, 300, Y_SOL));
        plateformes.push(sol(660, W, Y_SOL));

        // Paliers latéraux de combat
        plateformes.push(plateforme(180, 410, 120, { oneWay: true }));
        plateformes.push(plateforme(780, 410, 120, { oneWay: true }));

        const obstacles = [
            // Fragment de cité dérivant : navette au-dessus du vide
            plateformeMobile(480, 430, 120, { axe: 'horizontale', amplitude: 160, periode: 3000 }),
            pieuSol(220, Y_SOL),
            pieuSol(740, Y_SOL)
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
