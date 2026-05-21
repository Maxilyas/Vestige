// Salle : Halls Cendrés — Carrefour du Brasier (FALLBACK NSEO)
//
// ARCHITECTURE : carrefour 4 portes. Murs latéraux selon portes actives.
// Plafond avec cheminée N. Brasier majeur central sur estrade dédiée.
// Escalier vertical central jusqu'à porte N.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE, porteN, porteS,
    mur, murLateralGauche, murLateralDroit,
    brasier
} from '../_format.js';

const W = 2200;
const H = 1300;
const Y_SOL = H - HAUTEUR_SOL;        // 1260
const Y_PALIER_N = 250;
const Y_PLAFOND = 60;

export const halls_carrefour_brasier = {
    id: 'halls_carrefour_brasier',
    biome: 'halls_cendres',
    nom: 'Carrefour du Brasier',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['N', 'S', 'E', 'O'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),

            // ─── PLAFOND avec cheminée porte N centrale
            plafondCathedrale(0,           W / 2 - 200, Y_PLAFOND + 100),
            plafondCathedrale(W / 2 + 200, W,           Y_PLAFOND + 100),

            // ─── MURS LATÉRAUX
            ...(portesActives.includes('O') ? [mur(15, Y_PLAFOND, Y_SOL - 100)] : [murLateralGauche(Y_PLAFOND, Y_SOL)]),
            ...(portesActives.includes('E') ? [mur(W - 15, Y_PLAFOND, Y_SOL - 100)] : [murLateralDroit(W, Y_PLAFOND, Y_SOL)]),

            // ─── ESTRADE FOYER CENTRALE (brasier majeur dessus)
            plateforme(W / 2, Y_SOL - 60, 320, { oneWay: false }),

            // ─── ESCALIER vertical central vers porte N
            plateforme(W / 2 - 110, 1180, 130, { oneWay: true }),
            plateforme(W / 2 + 110, 1100, 130, { oneWay: true }),
            plateforme(W / 2 - 110, 1020, 130, { oneWay: true }),
            plateforme(W / 2 + 110,  940, 130, { oneWay: true }),
            plateforme(W / 2 - 110,  860, 130, { oneWay: true }),
            plateforme(W / 2 + 110,  780, 130, { oneWay: true }),
            plateforme(W / 2 - 110,  700, 130, { oneWay: true }),
            plateforme(W / 2 + 110,  620, 130, { oneWay: true }),
            plateforme(W / 2 - 110,  540, 130, { oneWay: true }),
            plateforme(W / 2 + 110,  460, 130, { oneWay: true }),
            plateforme(W / 2 - 110,  380, 130, { oneWay: true }),

            // ─── MEZZANINE porte N
            plateforme(W / 2, Y_PALIER_N + 70, 240, { oneWay: true }),
            plateforme(W / 2, Y_PALIER_N,      240, { oneWay: true })
        ];

        const obstacles = [
            // Brasier central majeur SUR l'estrade (permanent)
            brasier(W / 2, Y_SOL - 60, { largeur: 220, cycleMs: 3500, offsetMs: 0 })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('S')) portes.S = porteS(W / 2 - 600, Y_SOL);
        if (portesActives.includes('N')) portes.N = porteN(W / 2, Y_PALIER_N - 90);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
