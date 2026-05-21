// Salle : Halls Cendrés — Couloir des Brasiers
//
// ARCHITECTURE : couloir tendu, voûte basse, murs latéraux pleins.
// 3 brasiers SURÉLEVÉS dans des cuvettes de pierre (foyers) — pas au sol plat.
// Mur SECRET dans une portion du plafond → niche coffre haute.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    mur, murLateralGauche, murLateralDroit,
    brasier, murSecret
} from '../_format.js';

const W = 2600;
const H = 1000;
const Y_SOL = H - HAUTEUR_SOL;        // 960
const Y_PLAFOND = 60;

export const halls_couloir_brasiers = {
    id: 'halls_couloir_brasiers',
    biome: 'halls_cendres',
    nom: 'Couloir des Brasiers',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),

            // ─── PLAFOND ORGANIQUE (voûte basse irrégulière, stalactites)
            plafondCathedrale(0,        500,  Y_PLAFOND + 100),
            plafondCathedrale(500,      900,  Y_PLAFOND + 200),
            plafondCathedrale(900,      1300, Y_PLAFOND + 130),
            plafondCathedrale(1300,     1700, Y_PLAFOND + 200),
            plafondCathedrale(1700,     2100, Y_PLAFOND + 130),
            plafondCathedrale(2100,     W,    Y_PLAFOND + 100),

            // ─── MURS LATÉRAUX ──
            ...(portesActives.includes('O') ? [mur(15, Y_PLAFOND, Y_SOL - 100)] : [murLateralGauche(Y_PLAFOND, Y_SOL)]),
            ...(portesActives.includes('E') ? [mur(W - 15, Y_PLAFOND, Y_SOL - 100)] : [murLateralDroit(W, Y_PLAFOND, Y_SOL)]),

            // ─── FOYERS SURÉLEVÉS (cuvettes de pierre où les brasiers brûlent)
            plateforme(700,  Y_SOL - 60, 160, { oneWay: false }),
            plateforme(1300, Y_SOL - 60, 160, { oneWay: false }),
            plateforme(1900, Y_SOL - 60, 160, { oneWay: false }),

            // ─── MEZZANINE HAUTE (route alt safe au-dessus des brasiers)
            plateforme(360, 870, 140, { oneWay: true }),
            plateforme(560, 790, 140, { oneWay: true }),
            plateforme(760, 720, 140, { oneWay: true }),
            plateforme(960, 700, 140, { oneWay: true }),       // bridge vers pont (gap≤130)
            plateforme(W / 2, 650, 320, { oneWay: false }),    // pont haut central
            plateforme(W - 960, 700, 140, { oneWay: true }),
            plateforme(W - 760, 720, 140, { oneWay: true }),
            plateforme(W - 560, 790, 140, { oneWay: true }),
            plateforme(W - 360, 870, 140, { oneWay: true }),

            // ─── NICHE COFFRE CACHÉE (au-dessus du pont, accès via mur secret)
            plateforme(W / 2, 580, 200, { oneWay: false })  // palier coffre (Δ70 depuis pont 650)
        ];

        const obstacles = [
            // Brasiers SUR les foyers surélevés (visuellement justifiés)
            brasier(700,  Y_SOL - 60, { largeur: 100, offsetMs: 0 }),
            brasier(1300, Y_SOL - 60, { largeur: 100, offsetMs: 833 }),
            brasier(1900, Y_SOL - 60, { largeur: 100, offsetMs: 1667 }),

            // Mur SECRET dans le PLAFOND du pont central — révèle la niche coffre
            // Aucun indice visuel : c'est juste un morceau de plafond standard
            murSecret(W / 2, 620, 200, 30, { hp: 4, orientation: 'sol', dropSel: true })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
