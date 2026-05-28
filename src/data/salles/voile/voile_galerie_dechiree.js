// Salle : Voile Inversé — La Galerie Déchirée (OE compact)
// (Phase 9.x — Migration Voile, fondation)
//
// INTENTION : salle de combat "propre" (respiration entre les pièges). La
// même galerie de marbre que les Cristaux, mais le sol est lézardé et une
// estrade brisée trône au centre. Identité du biome, lecture immédiate.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    pieuSol
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const voile_galerie_dechiree = {
    id: 'voile_galerie_dechiree',
    biome: 'voile_inverse',
    nom: 'La Galerie Déchirée',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'sanctuaire'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Estrade brisée centrale + corniches flanquantes
        plateformes.push(plateforme(480, 410, 200, { oneWay: true }));
        plateformes.push(plateforme(220, 360, 120, { oneWay: true }));
        plateformes.push(plateforme(740, 360, 120, { oneWay: true }));

        const obstacles = [pieuSol(360, Y_SOL), pieuSol(600, Y_SOL)];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
