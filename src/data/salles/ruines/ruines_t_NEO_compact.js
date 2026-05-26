// Salle : Ruines basses — Forum des Trois Voies NEO (T-shape compact)
// (Phase 9.3c)
// INTENTION : "carrefour 3 voies" — passage E/O + montée centrale vers N.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteE, porteO
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const ruines_t_NEO_compact = {
    id: 'ruines_t_NEO_compact',
    biome: 'ruines_basses',
    nom: 'Forum des Trois Voies (NEO)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'E', 'O'],
    archetypesCompatibles: ['hall', 'sanctuaire'],

    generer({ portesActives = ['N', 'E', 'O'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(60, 380, 24));
        plateformes.push(plafondCathedrale(580, W - 60, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Pyramide ascendante centrée
        plateformes.push(plateforme(160, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(800, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(300, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(660, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(480, 290, 220, { oneWay: true }));
        plateformes.push(plateforme(480, 200, 140, { oneWay: true }));
        plateformes.push(plateforme(480, 110, 130, { oneWay: true }));

        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(480, 30);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);

        return {
            plateformes, obstacles: [], zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
