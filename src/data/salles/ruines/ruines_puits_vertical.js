// Salle : Ruines basses — Puits vertical
//
// Salle haute, étroite : transition verticale entre une cellule du nord
// et une cellule du sud. Le joueur descend (ou monte) par une série de
// paliers one-way en zigzag. Narratif : ancien puits d'eau séchée, racines
// pourpres qui descendent du plafond, écho de gouttes.
//
// PORTES : N (plafond) et S (sol) au centre.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteN, porteS
} from '../_format.js';

const W = 1600;
const H = 1300;
const Y_SOL = H - HAUTEUR_SOL;        // 1260
const Y_PLAFOND_PALIER = 130;         // mezzanine sous porte N

export const ruines_puits_vertical = {
    id: 'ruines_puits_vertical',
    biome: 'ruines_basses',
    nom: 'Puits vertical (eau séchée)',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['N', 'S'],
    archetypesCompatibles: ['puits', 'crypte'],

    generer({ portesActives = ['N', 'S'] } = {}) {
        // Paliers de zigzag : centres décalés de ±100 (au lieu de ±200/220
        // qui donnait un gap edge-to-edge de 310 px, infranchissable au saut
        // max 130). Avec ±100, gap edge-to-edge = 90 px → safe.
        const plateformes = [
            sol(0, W, Y_SOL),
            plateforme(W / 2 - 100, 1180, 110, { oneWay: true }),
            plateforme(W / 2 + 100, 1110, 110, { oneWay: true }),
            plateforme(W / 2 - 100, 1040, 110, { oneWay: true }),
            plateforme(W / 2 + 100, 970,  110, { oneWay: true }),
            plateforme(W / 2 - 100, 900,  110, { oneWay: true }),
            plateforme(W / 2 + 100, 830,  110, { oneWay: true }),
            plateforme(W / 2 - 100, 760,  110, { oneWay: true }),
            plateforme(W / 2 + 100, 690,  110, { oneWay: true }),
            plateforme(W / 2 - 100, 620,  110, { oneWay: true }),
            plateforme(W / 2 + 100, 550,  110, { oneWay: true }),
            plateforme(W / 2 - 100, 480,  110, { oneWay: true }),
            plateforme(W / 2 + 100, 410,  110, { oneWay: true }),
            plateforme(W / 2 - 100, 340,  110, { oneWay: true }),
            plateforme(W / 2 + 100, 270,  110, { oneWay: true }),
            // Mezzanine porte N
            plateforme(W / 2, Y_PLAFOND_PALIER + 70, 240, { oneWay: true }),
            plateforme(W / 2, Y_PLAFOND_PALIER,      240, { oneWay: true })
        ];
        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(W / 2, Y_PLAFOND_PALIER - 90);
        if (portesActives.includes('S')) portes.S = porteS(W / 2, Y_SOL);
        return {
            plateformes,
            obstacles: [],
            zones: [],
            portes,
            spawnDefault: { x: W / 2, y: Y_PLAFOND_PALIER - 20 }
        };
    }
};
