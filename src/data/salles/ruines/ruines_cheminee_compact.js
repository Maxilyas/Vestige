// Salle : Ruines basses — La Cheminée Étroite (NS compact, variante)
// (Phase 9.3c)
//
// INTENTION DE DESIGN : "montée centrale rapide" (style Spelunky cheminée)
//   • Cheminée centrale étroite avec ressorts pour montée rapide
//   • Alternative tactique : zigzag latéral plus lent mais safe
//   • Sols effrités sur les paliers centraux force timing
//   • Variante du Puits Vertical, plus tendue verticalement

import {
    HAUTEUR_SOL, sol, plateforme,
    porteN, porteS,
    ressort, solEffrite
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const ruines_cheminee_compact = {
    id: 'ruines_cheminee_compact',
    biome: 'ruines_basses',
    nom: 'La Cheminée Étroite',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S'],
    archetypesCompatibles: ['puits', 'crypte'],

    generer({ portesActives = ['N', 'S'] } = {}) {
        const plateformes = [];

        // Sol entier
        plateformes.push(sol(0, W, Y_SOL));

        // ─── Voie centrale rapide (sols effrités + ressort) ──────────
        // Le joueur monte directement via ressort, mais doit timer les
        // sols effrités qui s'effondrent.
        plateformes.push(solEffrite(480, 410, 120));
        plateformes.push(solEffrite(480, 320, 120));
        plateformes.push(solEffrite(480, 230, 120));

        // ─── Voie latérale safe (zigzag normal) ──────────────────────
        plateformes.push(plateforme(150, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(810, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(280, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(680, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(360, 290, 110, { oneWay: true }));
        plateformes.push(plateforme(600, 290, 110, { oneWay: true }));

        // Palier intermédiaire centré (relie voie latérale au sommet)
        plateformes.push(plateforme(480, 220, 130, { oneWay: true }));

        // Palier sommet sous porte N (90v depuis 220, overlap horiz)
        plateformes.push(plateforme(480, 130, 150, { oneWay: true }));

        // Palier S
        plateformes.push(plateforme(480, 440, 140, { oneWay: true }));

        const obstacles = [
            ressort(480, Y_SOL)    // ressort central pour montée rapide
        ];

        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(480, 40);
        if (portesActives.includes('S')) portes.S = porteS(480, 440);

        return {
            plateformes,
            obstacles,
            zones: [],
            portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
