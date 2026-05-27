// Salle : Ruines basses — Tour de Garde Délabrée (NE compact, alt)
// (Phase 9.4 Vague 1 — pool diversité)
//
// INTENTION DESIGN : Alternative à `ruines_coin_NE_compact` (qui est calme).
// Ici style Mario tower escape : ascension droite forcée avec sols effrités
// + pieux entre les paliers safe. Punition = retombe dans pieux.
//   • Sol entier avec pieux serrés au sol
//   • Ascension droite via 2 sols effrités + 3 paliers safe
//   • Palier N en haut centre

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteE,
    pieuSol, solEffrite
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const ruines_tour_garde_alt = {
    id: 'ruines_tour_garde_alt',
    biome: 'ruines_basses',
    nom: 'Tour de Garde Délabrée (NE)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'E'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['N', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Ascension droite zigzag (alterne effrité / safe)
        plateformes.push(plateforme(120, 430, 100, { oneWay: true }));  // safe G
        plateformes.push(solEffrite(290, 360, 90));
        plateformes.push(plateforme(450, 290, 100, { oneWay: true }));  // refuge mid
        plateformes.push(solEffrite(620, 220, 90));
        plateformes.push(plateforme(790, 150, 110, { oneWay: true }));  // haut D

        // Palier N (sommet centre)
        plateformes.push(plateforme(560, 80, 130, { oneWay: true }));

        const obstacles = [
            pieuSol(220, Y_SOL),
            pieuSol(380, Y_SOL),
            pieuSol(540, Y_SOL),
            pieuSol(700, Y_SOL)
        ];

        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(560, 30);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
