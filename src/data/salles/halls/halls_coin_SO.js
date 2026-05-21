// Salle : Halls Cendrés — Coin SO (foyer éteint)
//
// ARCHITECTURE : coin en L (entrée O gauche, sortie S bas-gauche).
// Mur lateral DROIT plein. Plafond organique. Foyer éteint au centre (niche).

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteS,
    mur, murLateralDroit,
    eboulis, brasier
} from '../_format.js';

const W = 1600;
const H = 1100;
const Y_SOL = H - HAUTEUR_SOL;        // 1060
const Y_PLAFOND = 60;

export const halls_coin_SO = {
    id: 'halls_coin_SO',
    biome: 'halls_cendres',
    nom: 'Coin SO (foyer éteint)',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['O', 'S'],
    archetypesCompatibles: ['crypte', 'hall'],

    generer({ portesActives = ['O', 'S'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),

            // ─── PLAFOND organique
            plafondCathedrale(0,    500,  Y_PLAFOND + 80),
            plafondCathedrale(500,  900,  Y_PLAFOND + 180),
            plafondCathedrale(900,  1300, Y_PLAFOND + 80),
            plafondCathedrale(1300, W,    Y_PLAFOND + 180),

            // ─── MURS LATÉRAUX
            ...(portesActives.includes('O') ? [mur(15, Y_PLAFOND, Y_SOL - 100)] : []),
            murLateralDroit(W, Y_PLAFOND, Y_SOL),  // DROIT plein

            // ─── ESTRADE FOYER (niche pour le brasier)
            plateforme(1200, Y_SOL - 60, 200, { oneWay: false }),

            // ─── PALIERS d'ambiance (descente latérale)
            plateforme(700,  990, 160, { oneWay: true }),
            plateforme(900,  920, 160, { oneWay: true })
        ];

        const obstacles = [
            // Éboulis (anciens établis effondrés) bloquent le sol
            eboulis(500, Y_SOL - 110, { largeur: 80, hauteur: 110, hp: 2, dropSel: true }),

            // Brasier mourant SUR l'estrade foyer (cycle long, presque éteint)
            brasier(1200, Y_SOL - 60, { largeur: 140, cycleMs: 5500, offsetMs: 0 })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('S')) portes.S = porteS(W / 2, Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
