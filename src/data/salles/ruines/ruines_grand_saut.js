// Salle : Ruines basses — Le Grand Saut (NSEO compact)
// (Phase 9.4 Vague 1 — pool diversité)
//
// INTENTION DESIGN : "Mario 1-1" — fosse mortelle centrale + 3 plateformes
// flottantes pour traverser. Punition = chute = retour Cité.
//   • Sol G et Sol D séparés par fosse 400 px (infranchissable au saut)
//   • 3 plateformes intermédiaires en zigzag (gaps edge ≤80 px)
//   • Pieux aux extrémités des sols forcent à sauter ferme dès l'entrée
//   • Ascension centrale vers porte N (3 paliers empilés)
//   • Palier S surélevé côté droit
//
// RYTHME : tension moyenne. La traversée demande 3 sauts précis.
// Mort = perte de progression, pas grave en début de run.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE, porteN, porteS,
    pieuSol
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const ruines_grand_saut = {
    id: 'ruines_grand_saut',
    biome: 'ruines_basses',
    nom: 'Le Grand Saut',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['hall', 'pont'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));

        // Sols séparés par fosse mortelle 280..680
        plateformes.push(sol(0, 280, Y_SOL));
        plateformes.push(sol(680, W, Y_SOL));

        // 3 plateformes flottantes (gaps edge ≤80 px)
        plateformes.push(plateforme(340, 440, 80, { oneWay: true }));  // P1
        plateformes.push(plateforme(480, 380, 80, { oneWay: true }));  // P2 (plus bas)
        plateformes.push(plateforme(620, 440, 80, { oneWay: true }));  // P3

        // Ascension centrale vers porte N (depuis P2)
        plateformes.push(plateforme(480, 290, 120, { oneWay: true }));
        plateformes.push(plateforme(480, 200, 120, { oneWay: true }));
        plateformes.push(plateforme(480, 110, 140, { oneWay: true }));

        // Palier S surélevé droit
        plateformes.push(plateforme(820, 440, 130, { oneWay: true }));

        // Pieux aux bords des sols (force saut ferme dès l'entrée)
        const obstacles = [
            pieuSol(240, Y_SOL),
            pieuSol(720, Y_SOL)
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
