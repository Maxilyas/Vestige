// Salle : Voile Inversé — L'Aile Arrachée (coin NE compact)
// (Phase 9.x — Migration Voile, fondation)
//
// INTENTION : ascension vers une aile brisée de la cité. Entrée sol/E, sortie
// N en haut. Escalier déchiré en zigzag qui penche à droite puis revient.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteE,
    pieuSol
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const voile_coin_NE = {
    id: 'voile_coin_NE',
    biome: 'voile_inverse',
    nom: 'L\'Aile Arrachée (NE)',
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
