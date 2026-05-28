// Salle : Voile Inversé — Le Belvédère Penché (coin NO compact)
// (Phase 9.x — Migration Voile, fondation)
//
// INTENTION : ascension côté gauche vers une terrasse inclinée. Entrée sol/O,
// sortie N en haut. Miroir de l'Aile Arrachée.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteO,
    pieuSol
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const voile_coin_NO = {
    id: 'voile_coin_NO',
    biome: 'voile_inverse',
    nom: 'Le Belvédère Penché (NO)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'O'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['N', 'O'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(580, W - 60, 24));
        plateformes.push(sol(0, W, Y_SOL));

        plateformes.push(plateforme(810, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(600, 380, 110, { oneWay: true }));
        plateformes.push(plateforme(380, 320, 110, { oneWay: true }));
        plateformes.push(plateforme(180, 260, 110, { oneWay: true }));
        plateformes.push(plateforme(340, 190, 130, { oneWay: true }));
        plateformes.push(plateforme(480, 120, 150, { oneWay: true })); // sous porte N

        const obstacles = [pieuSol(680, Y_SOL)];

        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(480, 30);
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: W - 80, y: Y_SOL - 20 }
        };
    }
};
