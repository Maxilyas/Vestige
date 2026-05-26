// Salle : Ruines basses — Tour de Garde NE (coin NE compact)
// (Phase 9.3c)
//
// INTENTION : "ascension vers tour" — entrée par sol/O, sortie N en haut.
// Asymétrie : tout penche à droite (escalier d'ascension à droite).

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteE,
    pieuSol
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const ruines_coin_NE_compact = {
    id: 'ruines_coin_NE_compact',
    biome: 'ruines_basses',
    nom: 'Tour de Garde (NE)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'E'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['N', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(60, 380, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Escalier d'ascension : zigzag depuis bas-gauche vers haut-droite,
        // puis revient au centre pour atteindre la porte N (en haut).
        plateformes.push(plateforme(150, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(360, 380, 110, { oneWay: true }));
        plateformes.push(plateforme(580, 320, 110, { oneWay: true }));
        plateformes.push(plateforme(780, 260, 110, { oneWay: true }));
        plateformes.push(plateforme(620, 190, 130, { oneWay: true }));
        plateformes.push(plateforme(480, 120, 150, { oneWay: true })); // sous porte N

        const obstacles = [pieuSol(280, Y_SOL)]; // hazard léger au sol

        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(480, 30);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
