// Salle : Halls Cendrés — Passage triple Ouest (T-NSO)
//
// ARCHITECTURE : 2 étages. Mur lateral DROIT plein. Escalier vertical côté
// gauche pour atteindre porte N. Mur SECRET dans le plafond → niche cachée
// au-dessus de la mezzanine.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteN, porteS,
    mur, murLateralDroit,
    murSecret, brasier
} from '../_format.js';

const W = 2000;
const H = 1400;
const Y_SOL = H - HAUTEUR_SOL;        // 1360
const Y_PALIER_N = 250;
const Y_PLAFOND = 60;

export const halls_t_NSO = {
    id: 'halls_t_NSO',
    biome: 'halls_cendres',
    nom: 'Passage triple Ouest',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['N', 'S', 'O'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['N', 'S', 'O'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),

            // ─── PLAFOND avec cheminée porte N côté gauche
            plafondCathedrale(0,    100, Y_PLAFOND + 60),
            plafondCathedrale(400,  W,   Y_PLAFOND + 80),

            // ─── MURS LATÉRAUX
            ...(portesActives.includes('O') ? [mur(15, Y_PLAFOND, Y_SOL - 100)] : []),
            murLateralDroit(W, Y_PLAFOND, Y_SOL),  // DROIT plein

            // ─── ESCALIER vertical côté gauche jusqu'à porte N
            plateforme(280,  1290, 140, { oneWay: true }),
            plateforme(460,  1210, 140, { oneWay: true }),
            plateforme(280,  1130, 140, { oneWay: true }),
            plateforme(460,  1050, 140, { oneWay: true }),
            plateforme(280,   970, 140, { oneWay: true }),
            plateforme(460,   890, 140, { oneWay: true }),
            plateforme(280,   810, 140, { oneWay: true }),
            plateforme(460,   730, 140, { oneWay: true }),
            plateforme(280,   650, 140, { oneWay: true }),
            plateforme(460,   570, 140, { oneWay: true }),
            plateforme(280,   490, 140, { oneWay: true }),
            plateforme(460,   410, 140, { oneWay: true }),
            plateforme(280,   330, 140, { oneWay: true }),

            // ─── MEZZANINE PORTE N
            plateforme(280, Y_PALIER_N + 70, 220, { oneWay: true }),
            plateforme(280, Y_PALIER_N,      220, { oneWay: true }),

            // ─── NICHE COFFRE (à côté de la mezzanine, accès via mur secret latéral)
            plateforme(560, Y_PALIER_N + 70, 160, { oneWay: false })  // proche mezz (gap 50)
        ];

        const obstacles = [
            // Mur SECRET vertical entre mezzanine et niche (cache la niche)
            murSecret(430, Y_PALIER_N + 70, 50, 90, { hp: 4, orientation: 'mur', dropSel: true }),
            // Brasier marqueur porte S (côté droit)
            brasier(W - 400, Y_SOL, { largeur: 120, cycleMs: 3500, offsetMs: 0 })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('S')) portes.S = porteS(W - 300, Y_SOL);
        if (portesActives.includes('N')) portes.N = porteN(280, Y_PALIER_N - 90);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
