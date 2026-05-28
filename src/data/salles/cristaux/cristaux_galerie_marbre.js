// Salle : Cristaux Glacés — La Galerie de Marbre (OE compact)
// (Phase 9.x — Migration Cristaux)
//
// INTENTION : "couloir de combat propre" (style Hollow Knight). Bus
// horizontal lisible, deux paliers latéraux + estrade centrale pour le
// combat aérien, pieux de givre au sol comme zones à éviter.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    pieuSol
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const cristaux_galerie_marbre = {
    id: 'cristaux_galerie_marbre',
    biome: 'cristaux_glaces',
    nom: 'La Galerie de Marbre',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'sanctuaire'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Paliers de combat aérien latéraux (sol+90, accessibles direct)
        plateformes.push(plateforme(185, 410, 140, { oneWay: true }));
        plateformes.push(plateforme(775, 410, 140, { oneWay: true }));

        // Estrade centrale surélevée (via les paliers latéraux, 70 vert)
        plateformes.push(plateforme(480, 340, 200, { oneWay: true }));

        const obstacles = [
            pieuSol(420, Y_SOL),
            pieuSol(540, Y_SOL)
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
