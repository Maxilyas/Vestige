// Salle : Ruines basses — Carrefour des dépôts (T-SEO)
//
// T-shape inversé. Sol horizontal pour O-E. Trou S au centre-droit
// (éboulis bloquant). Mezzanine haute accessible par escalier latéral.

import {
    HAUTEUR_SOL, sol, plafond, plateforme,
    porteO, porteE, porteS,
    eboulis, rocQuiTombe
} from '../_format.js';

const W = 2400;
const H = 900;
const Y_SOL = H - HAUTEUR_SOL;        // 860
const Y_MEZZANINE = 380;
const X_TROU_S = Math.round(W * 0.6);

export const ruines_t_SEO = {
    id: 'ruines_t_SEO',
    biome: 'ruines_basses',
    nom: 'Carrefour des dépôts (T-SEO)',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['S', 'E', 'O'],
    archetypesCompatibles: ['crypte', 'hall'],

    generer({ portesActives = ['O', 'E', 'S'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),

            // ─── Plateformes combat sol (saut ≤70 depuis sol) ──────────
            plateforme(400,  790, 130, { oneWay: true }),
            plateforme(700,  790, 130, { oneWay: true }),
            plateforme(1000, 790, 130, { oneWay: true }),
            plateforme(1900, 790, 130, { oneWay: true }),
            plateforme(2150, 790, 130, { oneWay: true }),

            // ─── Escalier vers mezzanine côté gauche (resserré) ────────
            plateforme(200,  720, 110, { oneWay: true }),
            plateforme(80,   650, 110, { oneWay: true }),
            plateforme(200,  580, 110, { oneWay: true }),
            plateforme(80,   510, 110, { oneWay: true }),
            plateforme(200,  440, 110, { oneWay: true }),
            plateforme(330,  410, 110, { oneWay: true }),   // raccord vers mezzanine

            // ─── Escalier symétrique droite ────────────────────────────
            plateforme(W - 200, 720, 110, { oneWay: true }),
            plateforme(W - 80,  650, 110, { oneWay: true }),
            plateforme(W - 200, 580, 110, { oneWay: true }),
            plateforme(W - 80,  510, 110, { oneWay: true }),
            plateforme(W - 200, 440, 110, { oneWay: true }),

            // ─── Mezzanine haute (large, atteignable depuis 2 escaliers)
            plateforme(W / 2, Y_MEZZANINE, 1600, { oneWay: true })
        ];

        const obstacles = [
            // Éboulis devant la porte S au sol
            eboulis(X_TROU_S, Y_SOL - 110, { largeur: 120, hp: 4, dropSel: true }),
            // Roc qui tombe au-dessus de la zone porte S
            rocQuiTombe(X_TROU_S, 60, 720)
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('S')) portes.S = porteS(X_TROU_S, Y_SOL);

        return {
            plateformes,
            obstacles,
            zones: [],
            portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
