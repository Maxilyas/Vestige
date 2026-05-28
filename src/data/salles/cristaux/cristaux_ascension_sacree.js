// Salle : Cristaux Glacés — L'Ascension Sacrée (NSEO compact)
// (Phase 9.x — Migration Cristaux, pool diversité)
//
// INTENTION : grande ascension de marbre. Pyramide centrale vers la porte
// N, cristaux-tremplins (ressorts) qui dynamisent la montée. Portes O/E au
// sol, porte S sur palier surélevé. Toute config NSEO matchée.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteS, porteO, porteE,
    ressort, pieuSol
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const cristaux_ascension_sacree = {
    id: 'cristaux_ascension_sacree',
    biome: 'cristaux_glaces',
    nom: 'L\'Ascension Sacrée',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['hall', 'sanctuaire'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(60, 380, 24));
        plateformes.push(plafondCathedrale(580, W - 60, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Pyramide ascendante vers porte N
        plateformes.push(plateforme(150, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(810, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(290, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(670, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(480, 290, 200, { oneWay: true }));
        plateformes.push(plateforme(480, 200, 140, { oneWay: true }));
        plateformes.push(plateforme(480, 110, 130, { oneWay: true })); // sous porte N

        // Palier S surélevé
        plateformes.push(plateforme(480, 440, 140, { oneWay: true }));

        const obstacles = [
            ressort(220, Y_SOL),
            ressort(740, Y_SOL),
            pieuSol(480, Y_SOL)
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('N')) portes.N = porteN(480, 30);
        if (portesActives.includes('S')) portes.S = porteS(480, 440);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
