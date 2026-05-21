// Salle : Ruines basses — L'Arène des Ressorts
// (Phase 9.3 — Salle compacte 960×540)
//
// INTENTION DE DESIGN : "mobilité aérienne dynamique" (style Hollow Knight)
//   • 2 ressorts au sol pour catapulter vers les paliers hauts
//   • Architecture verticale en pyramide tronquée (4 niveaux)
//   • Combat fluide : possible au sol OU dans les paliers OU au sommet
//   • Le sommet héberge un drop sol (récompense exploration verticale)
//   • Les ressorts ne sont PAS obligatoires (zigzag accessible aux sauts
//     normaux 96 px max), mais ils raccourcissent la montée et dynamisent
//
// RYTHME : tension moyenne, plaisir du mouvement. Bonne salle "fun" qui
// peut tomber à tout moment du run.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    ressort
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;          // 500

export const ruines_arene_ressorts = {
    id: 'ruines_arene_ressorts',
    biome: 'ruines_basses',
    nom: 'L\'Arène des Ressorts',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['arene', 'hall'],
    rolesAutorises: ['main', 'alt'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];

        // Voûte décorative
        plateformes.push(plafondCathedrale(60, W - 60, 24));

        // Sol entier
        plateformes.push(sol(0, W, Y_SOL));

        // ─── Pyramide tronquée : 4 niveaux empilés ─────────────────────
        // Tous accessibles aux sauts normaux 96 px max (validateur OK)

        // Niveau 1 — paliers bas (sol + 70)
        plateformes.push(plateforme(150, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(810, 430, 110, { oneWay: true }));

        // Niveau 2 — paliers mid (niveau 1 + 70)
        plateformes.push(plateforme(300, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(660, 360, 110, { oneWay: true }));

        // Niveau 3 — plateforme centrale (niveau 2 + 70)
        plateformes.push(plateforme(480, 290, 200, { oneWay: true }));

        // Niveau 4 — palier sommet (niveau 3 + 90, limite saut)
        plateformes.push(plateforme(480, 200, 140, { oneWay: true }));

        // ─── 2 ressorts pour raccourcir la montée ─────────────────────
        // Placés sous les paliers bas mais légèrement décalés pour ne pas
        // catapulter exactement sur eux (le joueur les a comme outil, pas
        // comme accident).
        const obstacles = [
            ressort(240, Y_SOL),    // accélère montée gauche
            ressort(720, Y_SOL)     // accélère montée droite
        ];

        // ─── Portes ──────────────────────────────────────────────────
        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes,
            obstacles,
            zones: [],
            portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
