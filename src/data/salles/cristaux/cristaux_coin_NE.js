// Salle : Cristaux Glacés — La Tour de l'Oracle (coin NE compact)
// (Phase 9.x — Migration Cristaux)
//
// INTENTION : ascension vers une tour. Entrée par sol/E, sortie N en haut.
// Escalier de marbre en zigzag qui penche vers la droite puis revient.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteE,
    pieuSol
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const cristaux_coin_NE = {
    id: 'cristaux_coin_NE',
    biome: 'cristaux_glaces',
    nom: 'La Tour de l\'Oracle (NE)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'E'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['N', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(60, 380, 24));
        plateformes.push(sol(0, W, Y_SOL));

        plateformes.push(plateforme(150, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(360, 380, 110, { oneWay: true }));
        plateformes.push(plateforme(580, 320, 110, { oneWay: true }));
        plateformes.push(plateforme(780, 260, 110, { oneWay: true }));
        plateformes.push(plateforme(620, 190, 130, { oneWay: true }));
        plateformes.push(plateforme(480, 120, 150, { oneWay: true })); // sous porte N

        const obstacles = [pieuSol(280, Y_SOL)];

        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(480, 30);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
