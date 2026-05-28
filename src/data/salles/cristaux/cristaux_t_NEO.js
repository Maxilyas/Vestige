// Salle : Cristaux Glacés — Le Forum Gelé (T NEO compact)
// (Phase 9.x — Migration Cristaux)
//
// INTENTION : forum à trois voies. Portes O/E au sol, ascension pyramidale
// de marbre vers la porte N au sommet.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteO, porteE,
    pieuSol
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const cristaux_t_NEO = {
    id: 'cristaux_t_NEO',
    biome: 'cristaux_glaces',
    nom: 'Le Forum Gelé (NEO)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'E', 'O'],
    archetypesCompatibles: ['hall', 'sanctuaire'],

    generer({ portesActives = ['N', 'E', 'O'] } = {}) {
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

        const obstacles = [pieuSol(480, Y_SOL)];

        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(480, 30);
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
