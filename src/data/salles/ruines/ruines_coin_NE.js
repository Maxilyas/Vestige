// Salle : Ruines basses — Coin NE (tour de garde)
//
// Coin L : entrée par l'EST (côté droit), sortie par le NORD (en haut à droite).
// Le joueur arrive du couloir Est, monte par les paliers, sort par la porte N.
// Narratif : ancienne tour de garde, position d'observation perchée.
//
// PORTES : E (sol droit) et N (haut, à droite). Salle vise un combat
// vertical avec 1-2 sentinelles en hauteur.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteE, porteN
} from '../_format.js';

const W = 1600;
const H = 1100;
const Y_SOL = H - HAUTEUR_SOL;        // 1060
const Y_PALIER_HAUT = 200;            // sous porte N

export const ruines_coin_NE = {
    id: 'ruines_coin_NE',
    biome: 'ruines_basses',
    nom: 'Coin NE (tour de garde)',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['E', 'N'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['E', 'N'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),
            // Escalier qui monte côté droit
            plateforme(W - 200, 990,  120, { oneWay: true }),
            plateforme(W - 350, 920,  120, { oneWay: true }),
            plateforme(W - 200, 850,  120, { oneWay: true }),
            plateforme(W - 350, 780,  120, { oneWay: true }),
            plateforme(W - 200, 710,  120, { oneWay: true }),
            plateforme(W - 350, 640,  120, { oneWay: true }),
            plateforme(W - 200, 570,  120, { oneWay: true }),
            plateforme(W - 350, 500,  120, { oneWay: true }),
            plateforme(W - 200, 430,  120, { oneWay: true }),
            plateforme(W - 350, 360,  120, { oneWay: true }),
            plateforme(W - 200, 290,  120, { oneWay: true }),
            // Mezzanine sous porte N
            plateforme(W - 240, Y_PALIER_HAUT, 220, { oneWay: true })
        ];
        const portes = {};
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('N')) portes.N = porteN(W - 240, Y_PALIER_HAUT - 90);
        return {
            plateformes,
            obstacles: [],
            zones: [],
            portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
