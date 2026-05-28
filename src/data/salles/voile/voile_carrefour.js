// Salle : Voile Inversé — Le Carrefour du Voile (NSEO compact)
// (Phase 9.x — Migration Voile, fallback universel)
//
// INTENTION : carrefour central, lecture immédiate. 4 portes (NSEO) → matche
// n'importe quelle config du spanning tree. Pyramide ascendante vers N,
// porte S sur palier surélevé, portes O/E au sol, pieu de lecture.
//
// Sert de fallback compact (cf. _index.js) quand aucune salle Voile ne matche
// la config demandée. Reste FONCTIONNEL avant tout.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE, porteN, porteS,
    pieuSol
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const voile_carrefour = {
    id: 'voile_carrefour',
    biome: 'voile_inverse',
    nom: 'Le Carrefour du Voile',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['hall', 'sanctuaire'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];

        plateformes.push(plafondCathedrale(60, 380, 24));
        plateformes.push(plafondCathedrale(580, W - 60, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Pyramide ascendante centrale vers porte N
        plateformes.push(plateforme(150, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(810, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(290, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(670, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(480, 290, 220, { oneWay: true }));
        plateformes.push(plateforme(480, 200, 140, { oneWay: true }));
        plateformes.push(plateforme(480, 110, 130, { oneWay: true }));

        // Palier porte S surélevé
        plateformes.push(plateforme(480, 440, 140, { oneWay: true }));

        const obstacles = [pieuSol(720, Y_SOL)];

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
