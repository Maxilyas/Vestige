// Salle : Ruines basses — Le Carrefour des Quatre Vents (NSEO compact)
// (Phase 9.3c — Fallback universel compact)
//
// INTENTION DE DESIGN : "carrefour central, lecture immédiate"
//   • 4 portes (NSEO) → matche n'importe quelle config du spanning tree
//   • Structure verticale en pyramide ascendante : sol → passerelle → sommet
//   • Porte N tout en haut (yTopPorte=30), accès via zigzag de paliers
//   • Porte S sur palier surélevé (le joueur descend par dessous)
//   • Portes O et E au sol
//
// Sert de fallback compact dans tirerSalleCompatible quand aucune salle
// compacte ne matche la config demandée (T-shape 3 portes, etc.). Doit
// rester FONCTIONNEL avant tout : densité modérée pour ne pas perdre le
// joueur dans toutes les directions.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE, porteN, porteS
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;          // 500

export const ruines_carrefour_compact = {
    id: 'ruines_carrefour_compact',
    biome: 'ruines_basses',
    nom: 'Le Carrefour des Quatre Vents',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['hall', 'sanctuaire'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];

        // Voûte (juste sous la porte N)
        plateformes.push(plafondCathedrale(60, 380, 24));
        plateformes.push(plafondCathedrale(580, W - 60, 24));

        // Sol entier
        plateformes.push(sol(0, W, Y_SOL));

        // ─── Pyramide ascendante centrale vers porte N ────────────────
        // Sol -> 430 latéraux (70 vert)
        plateformes.push(plateforme(150, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(810, 430, 110, { oneWay: true }));

        // 430 -> 360 (70 vert)
        plateformes.push(plateforme(290, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(670, 360, 110, { oneWay: true }));

        // 360 -> passerelle centrale 290 (70 vert)
        plateformes.push(plateforme(480, 290, 220, { oneWay: true }));

        // 290 -> 200 (sommet de l'ascension droite)
        plateformes.push(plateforme(480, 200, 140, { oneWay: true }));

        // 200 -> 110 (palier juste sous porte N)
        plateformes.push(plateforme(480, 110, 130, { oneWay: true }));

        // ─── Palier porte S surélevé (descente via passerelle) ────────
        // Joueur arrive sur passerelle 290, descend à travers, atterrit
        // sur palier S 430 ou 440 et descend encore via porte S.
        // (oneWay sur palier S permet la descente vers la salle suivante)
        plateformes.push(plateforme(480, 440, 140, { oneWay: true }));

        // ─── Portes ──────────────────────────────────────────────────
        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('N')) portes.N = porteN(480, 30);
        if (portesActives.includes('S')) portes.S = porteS(480, 440);

        return {
            plateformes,
            obstacles: [],
            zones: [],
            portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
