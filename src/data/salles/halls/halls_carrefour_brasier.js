// Salle : Halls Cendrés — Carrefour du Brasier (NSEO FALLBACK compact)
// (Phase 9.6 — Migration)
//
// FALLBACK : carrefour 4 portes universel. Sort uniquement quand le pool
// normal ne match aucune config (excluded by _index.js TOUTES_SALLES).
// Identité forte mais densité modérée.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteS, porteE, porteO,
    brasier
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_carrefour_brasier = {
    id: 'halls_carrefour_brasier',
    biome: 'halls_cendres',
    nom: 'Le Carrefour du Brasier',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['hall', 'sanctuaire'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, 380, 24));
        plateformes.push(plafondCathedrale(580, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Foyer central + brasier majeur sur estrade
        plateformes.push(plateforme(480, Y_SOL - 25, 140));

        // Pyramide ascendante centrale
        plateformes.push(plateforme(160, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(800, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(290, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(670, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(480, 290, 200, { oneWay: true }));
        plateformes.push(plateforme(480, 200, 140, { oneWay: true }));
        plateformes.push(plateforme(480, 110, 130, { oneWay: true }));

        // Palier S surélevé (sortie sud)
        plateformes.push(plateforme(480, 440, 140, { oneWay: true }));

        const obstacles = [
            brasier(480, Y_SOL - 25, { cycleMs: 3200, offsetMs: 0, largeur: 120 })
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
