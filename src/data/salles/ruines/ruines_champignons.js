// Salle : Ruines basses — Les Champignons Tueurs (NSEO compact)
// (Phase 9.4 Vague 1 — pool diversité)
//
// INTENTION DESIGN : "Mario bouncing" — fosse mortelle + paliers hauts
// uniquement atteignables via une chaîne de paliers ascendants. Ressorts
// catapultent le joueur depuis le sol pour gagner du temps.
//   • Sol G + Sol D séparés par fosse mortelle 360 px
//   • 5 paliers asymétriques permettant de traverser en hauteur
//   • 2 ressorts (un par sol) pour booster l'élan
//   • Pieux plafond au-dessus des paliers — punissent les sauts trop hauts
//   • Palier N central tout en haut
//   • Palier S surélevé latéral

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE, porteN, porteS,
    ressort, pieuPlafond
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const ruines_champignons = {
    id: 'ruines_champignons',
    biome: 'ruines_basses',
    nom: 'Les Champignons Tueurs',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['arene', 'hall'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));

        // Sols G et D, fosse mortelle 300..660
        plateformes.push(sol(0, 300, Y_SOL));
        plateformes.push(sol(660, W, Y_SOL));

        // Paliers ascendants en pont (gaps edge ≤90, vert 80)
        plateformes.push(plateforme(200, 420, 100, { oneWay: true }));  // haut G
        plateformes.push(plateforme(280, 340, 90, { oneWay: true }));   // mid G
        plateformes.push(plateforme(480, 270, 130, { oneWay: true }));  // centre
        plateformes.push(plateforme(680, 340, 90, { oneWay: true }));   // mid D
        plateformes.push(plateforme(760, 420, 100, { oneWay: true }));  // haut D

        // Palier N tout en haut
        plateformes.push(plateforme(480, 175, 130, { oneWay: true }));
        plateformes.push(plateforme(480, 95, 140, { oneWay: true }));

        // Palier S surélevé droit
        plateformes.push(plateforme(820, 440, 130, { oneWay: true }));

        // 2 ressorts (raccourcissent montée) + pieux plafond hazardeux
        const obstacles = [
            ressort(140, Y_SOL),
            ressort(810, Y_SOL),
            // Pieux plafond au-dessus du centre (punissent sauts catapultés)
            pieuPlafond(420, 200),
            pieuPlafond(480, 200),
            pieuPlafond(540, 200)
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('N')) portes.N = porteN(480, 30);
        if (portesActives.includes('S')) portes.S = porteS(820, 440);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
