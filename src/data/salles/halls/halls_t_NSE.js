// Salle : Halls Cendrés — Passage triple Est (T-NSE)
//
// Miroir de halls_t_NSO : escalier côté DROIT, mur lateral GAUCHE plein.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteE, porteN, porteS,
    mur, murLateralGauche,
    murSecret, brasier
} from '../_format.js';

const W = 2000;
const H = 1400;
const Y_SOL = H - HAUTEUR_SOL;        // 1360
const Y_PALIER_N = 250;
const Y_PLAFOND = 60;

export const halls_t_NSE = {
    id: 'halls_t_NSE',
    biome: 'halls_cendres',
    nom: 'Passage triple Est',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['N', 'S', 'E'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['N', 'S', 'E'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),

            // ─── PLAFOND avec cheminée porte N côté droit
            plafondCathedrale(0,      W - 400, Y_PLAFOND + 80),
            plafondCathedrale(W - 100, W,      Y_PLAFOND + 60),

            // ─── MURS LATÉRAUX
            murLateralGauche(Y_PLAFOND, Y_SOL),  // GAUCHE plein
            ...(portesActives.includes('E') ? [mur(W - 15, Y_PLAFOND, Y_SOL - 100)] : []),

            // ─── ESCALIER vertical côté droit
            plateforme(W - 280, 1290, 140, { oneWay: true }),
            plateforme(W - 460, 1210, 140, { oneWay: true }),
            plateforme(W - 280, 1130, 140, { oneWay: true }),
            plateforme(W - 460, 1050, 140, { oneWay: true }),
            plateforme(W - 280,  970, 140, { oneWay: true }),
            plateforme(W - 460,  890, 140, { oneWay: true }),
            plateforme(W - 280,  810, 140, { oneWay: true }),
            plateforme(W - 460,  730, 140, { oneWay: true }),
            plateforme(W - 280,  650, 140, { oneWay: true }),
            plateforme(W - 460,  570, 140, { oneWay: true }),
            plateforme(W - 280,  490, 140, { oneWay: true }),
            plateforme(W - 460,  410, 140, { oneWay: true }),
            plateforme(W - 280,  330, 140, { oneWay: true }),

            // ─── MEZZANINE PORTE N
            plateforme(W - 280, Y_PALIER_N + 70, 220, { oneWay: true }),
            plateforme(W - 280, Y_PALIER_N,      220, { oneWay: true }),

            // ─── NICHE COFFRE (à côté de la mezzanine, accès via mur secret latéral)
            plateforme(W - 560, Y_PALIER_N + 70, 160, { oneWay: false })
        ];

        const obstacles = [
            murSecret(W - 430, Y_PALIER_N + 70, 50, 90, { hp: 4, orientation: 'mur', dropSel: true }),
            brasier(400, Y_SOL, { largeur: 120, cycleMs: 3500, offsetMs: 0 })
        ];

        const portes = {};
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('S')) portes.S = porteS(300, Y_SOL);
        if (portesActives.includes('N')) portes.N = porteN(W - 280, Y_PALIER_N - 90);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
