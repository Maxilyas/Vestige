// Salle : Ruines basses — La Tour qui Chute (NSEO compact)
// (Phase 9.4 Vague 1 — pool diversité)
//
// INTENTION DESIGN : "Celeste B-side" — ascension verticale 100% en sols
// effrités, chaque palier s'écroule au contact. Pas de fosse mortelle ici :
// la punition = retomber au sol + devoir recommencer l'ascension.
//   • 4 sols effrités en zigzag ascendant
//   • 2 paliers safe d'ancrage (entrée bas G, refuge mi-haut)
//   • Pieux au sol entre les zones d'arrivée (rate ton saut = mort)
//   • Palier N en haut centre (stable)
//   • Palier S surélevé latéral
//
// RYTHME : tension constante. Pas le droit de s'arrêter sur les effrités.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE, porteN, porteS,
    solEffrite, pieuSol
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const ruines_tour_chute = {
    id: 'ruines_tour_chute',
    biome: 'ruines_basses',
    nom: 'La Tour qui Chute',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['hall', 'puits'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Palier safe d'entrée G (sol+70)
        plateformes.push(plateforme(140, 430, 110, { oneWay: true }));

        // Ascension en sols effrités (zigzag 90 horiz / 70 vert)
        plateformes.push(solEffrite(300, 360, 90));
        plateformes.push(solEffrite(480, 290, 90));
        plateformes.push(solEffrite(660, 220, 90));

        // Refuge safe haut
        plateformes.push(plateforme(820, 220, 100, { oneWay: true }));

        // Palier N stable
        plateformes.push(plateforme(480, 130, 150, { oneWay: true }));

        // Palier S surélevé
        plateformes.push(plateforme(820, 440, 130, { oneWay: true }));

        // Pieux au sol entre paliers d'entrée (rate = douloureux)
        const obstacles = [
            pieuSol(400, Y_SOL),
            pieuSol(560, Y_SOL),
            pieuSol(720, Y_SOL)
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('N')) portes.N = porteN(480, 40);
        if (portesActives.includes('S')) portes.S = porteS(820, 440);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
