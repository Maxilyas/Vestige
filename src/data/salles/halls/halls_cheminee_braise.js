// Salle : Halls Cendrés — Cheminée de Braise
//
// ARCHITECTURE : verticale étroite. Murs latéraux pleins. Plafond fendu (la
// cheminée monte). Brasiers en quinconce sur les paliers (cycles décalés).
// Le brasier n'est PAS au sol — c'est UN PALIER qui brûle (foyer mobile).

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteS,
    mur, murLateralGauche, murLateralDroit,
    brasier
} from '../_format.js';

const W = 1400;
const H = 1500;
const Y_SOL = H - HAUTEUR_SOL;        // 1460
const Y_PALIER_HAUT = 250;
const Y_PLAFOND = 60;

export const halls_cheminee_braise = {
    id: 'halls_cheminee_braise',
    biome: 'halls_cendres',
    nom: 'Cheminée de Braise',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['N', 'S'],
    archetypesCompatibles: ['puits', 'crypte'],

    generer({ portesActives = ['N', 'S'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),

            // ─── PLAFOND : cheminée ouverte au centre
            plafondCathedrale(0,           W / 2 - 200, Y_PLAFOND + 60),
            plafondCathedrale(W / 2 + 200, W,           Y_PLAFOND + 60),

            // ─── MURS LATÉRAUX PLEINS
            murLateralGauche(Y_PLAFOND + 60, Y_SOL),
            murLateralDroit(W, Y_PLAFOND + 60, Y_SOL),

            // ─── MEZZANINE PORTE N
            plateforme(W / 2, Y_PALIER_HAUT,      240, { oneWay: true }),
            plateforme(W / 2, Y_PALIER_HAUT + 70, 240, { oneWay: true }),

            // ─── PALIERS QUINCONCE
            plateforme(W / 2 - 100, 320,  120, { oneWay: true }),
            plateforme(W / 2 + 100, 390,  120, { oneWay: true }),
            plateforme(W / 2 - 100, 460,  120, { oneWay: true }),
            plateforme(W / 2 + 100, 530,  120, { oneWay: true }),
            plateforme(W / 2 - 100, 600,  120, { oneWay: true }),
            plateforme(W / 2 + 100, 670,  120, { oneWay: true }),
            plateforme(W / 2 - 100, 740,  120, { oneWay: true }),
            plateforme(W / 2 + 100, 810,  120, { oneWay: true }),
            plateforme(W / 2 - 100, 880,  120, { oneWay: true }),
            plateforme(W / 2 + 100, 950,  120, { oneWay: true }),
            plateforme(W / 2 - 100, 1020, 120, { oneWay: true }),
            plateforme(W / 2 + 100, 1090, 120, { oneWay: true }),
            plateforme(W / 2 - 100, 1160, 120, { oneWay: true }),
            plateforme(W / 2 + 100, 1230, 120, { oneWay: true }),
            plateforme(W / 2 - 100, 1300, 120, { oneWay: true }),
            plateforme(W / 2 + 100, 1370, 120, { oneWay: true })
        ];

        const obstacles = [
            // Brasiers EN HAUTEUR sur les paliers eux-mêmes (les paliers brûlent)
            // Cycles décalés crée un puzzle d'attente.
            brasier(W / 2 - 100, 460, { largeur: 80, cycleMs: 3000, offsetMs: 0 }),
            brasier(W / 2 + 100, 670, { largeur: 80, cycleMs: 2800, offsetMs: 700 }),
            brasier(W / 2 - 100, 880, { largeur: 80, cycleMs: 2600, offsetMs: 1400 }),
            brasier(W / 2 + 100, 1090, { largeur: 80, cycleMs: 2400, offsetMs: 600 }),
            brasier(W / 2 - 100, 1300, { largeur: 80, cycleMs: 2200, offsetMs: 1100 })
        ];

        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(W / 2, Y_PALIER_HAUT - 90);
        if (portesActives.includes('S')) portes.S = porteS(W / 2, Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: W / 2, y: Y_PALIER_HAUT - 20 }
        };
    }
};
