// Salle : Halls Cendrés — Couloir Explosif
//
// ARCHITECTURE : couloir bas avec 2 murs explosifs visibles (runes rouges
// = avertissement). Murs latéraux pleins. Route haute alt safe via paliers.
// Casser à distance OU contourner.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    mur, murLateralGauche, murLateralDroit,
    murExplosif, brasier
} from '../_format.js';

const W = 2600;
const H = 1100;
const Y_SOL = H - HAUTEUR_SOL;        // 1060
const Y_PLAFOND = 60;

export const halls_couloir_explosif = {
    id: 'halls_couloir_explosif',
    biome: 'halls_cendres',
    nom: 'Couloir Explosif',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'pont'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),

            // ─── PLAFOND irrégulier
            plafondCathedrale(0,    600,  Y_PLAFOND + 80),
            plafondCathedrale(600,  1000, Y_PLAFOND + 180),
            plafondCathedrale(1000, 1400, Y_PLAFOND + 80),
            plafondCathedrale(1400, 1800, Y_PLAFOND + 180),
            plafondCathedrale(1800, W,    Y_PLAFOND + 80),

            // ─── MURS LATÉRAUX
            ...(portesActives.includes('O') ? [mur(15, Y_PLAFOND, Y_SOL - 100)] : [murLateralGauche(Y_PLAFOND, Y_SOL)]),
            ...(portesActives.includes('E') ? [mur(W - 15, Y_PLAFOND, Y_SOL - 100)] : [murLateralDroit(W, Y_PLAFOND, Y_SOL)]),

            // ─── ROUTE HAUTE (paliers safe au-dessus des murs explosifs)
            plateforme(280,  990, 130, { oneWay: true }),
            plateforme(480,  920, 130, { oneWay: true }),
            plateforme(700,  850, 140, { oneWay: true }),
            plateforme(920,  780, 140, { oneWay: true }),
            plateforme(1140, 710, 140, { oneWay: true }),
            plateforme(W / 2, 650, 380, { oneWay: false }),    // pont haut central
            plateforme(W - 1140, 710, 140, { oneWay: true }),
            plateforme(W - 920,  780, 140, { oneWay: true }),
            plateforme(W - 700,  850, 140, { oneWay: true }),
            plateforme(W - 480,  920, 130, { oneWay: true }),
            plateforme(W - 280,  990, 130, { oneWay: true })
        ];

        const obstacles = [
            // 2 murs explosifs au sol (rayon d'explosion 220 chacun)
            // Ces murs SONT visiblement dangereux (runes rouges) — c'est voulu :
            // contrairement à mur_secret, mur_explosif est un AVERTISSEMENT.
            murExplosif(900,  Y_SOL - 140, { largeur: 40, hauteur: 140, hp: 3, dropSel: true }),
            murExplosif(1700, Y_SOL - 140, { largeur: 40, hauteur: 140, hp: 3, dropSel: true }),

            // 1 brasier d'ambiance dans une niche entre les 2 murs explosifs
            brasier(W / 2, Y_SOL, { largeur: 100, cycleMs: 3500, offsetMs: 0 })
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
