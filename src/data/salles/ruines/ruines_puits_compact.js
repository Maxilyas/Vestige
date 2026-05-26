// Salle : Ruines basses — Le Puits Vertical (NS compact)
// (Phase 9.3c)
//
// INTENTION DE DESIGN : "transition verticale lisible" (style Hollow Knight)
//   • Porte N tout en haut (descente depuis l'étage précédent)
//   • Porte S sur palier surélevé (continuation vers le bas)
//   • Paliers zigzag de descente/montée — utilisables dans les deux sens
//   • Pas d'obstacle : pure traversée verticale
//   • Coffre haut (récompense pour la remontée si on est passé par S)

import {
    HAUTEUR_SOL, sol, plateforme,
    porteN, porteS
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const ruines_puits_compact = {
    id: 'ruines_puits_compact',
    biome: 'ruines_basses',
    nom: 'Le Puits Vertical',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S'],
    archetypesCompatibles: ['puits', 'crypte'],

    generer({ portesActives = ['N', 'S'] } = {}) {
        const plateformes = [];

        // Sol entier
        plateformes.push(sol(0, W, Y_SOL));

        // ─── Zigzag de paliers (zigzag serré : tous overlap horiz) ────
        plateformes.push(plateforme(200, 430, 130, { oneWay: true }));  // sol+70
        plateformes.push(plateforme(420, 360, 130, { oneWay: true }));  // 70v, 90h gap
        plateformes.push(plateforme(220, 290, 130, { oneWay: true }));  // 70v, 70h gap
        plateformes.push(plateforme(440, 220, 130, { oneWay: true }));  // 70v, 90h gap
        plateformes.push(plateforme(480, 130, 150, { oneWay: true }));  // 90v, overlap

        // Palier S surélevé (porte S au-dessus, joueur descend dessous)
        plateformes.push(plateforme(480, 440, 140, { oneWay: true }));

        // ─── Portes ──────────────────────────────────────────────────
        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(480, 40);
        if (portesActives.includes('S')) portes.S = porteS(480, 440);

        // Coffre forcé sur le palier sommet (récompense montée)
        const coffreForce = { x: 280, y: 290 - 12 };

        return {
            plateformes,
            obstacles: [],
            zones: [],
            portes,
            spawnDefault: { x: 480, y: 130 - 20 },
            coffreForce
        };
    }
};
