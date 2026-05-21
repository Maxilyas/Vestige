// Salle : Halls Cendrés — Puits aux Cendres
//
// ARCHITECTURE : verticale. Murs latéraux pleins. Plafond fendu (cheminée
// d'air sortant). Paliers en quinconce. Sol-effrites en 3 endroits = pression
// descendante. Mur SECRET dans le mur lateral droit (niche coffre invisible).

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteS,
    mur, murLateralGauche, murLateralDroit,
    solEffrite, murSecret, brasier
} from '../_format.js';

const W = 1400;
const H = 1400;
const Y_SOL = H - HAUTEUR_SOL;        // 1360
const Y_PALIER_HAUT = 250;
const Y_PLAFOND = 60;

export const halls_puits_cendres = {
    id: 'halls_puits_cendres',
    biome: 'halls_cendres',
    nom: 'Puits aux Cendres',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['N', 'S'],
    archetypesCompatibles: ['puits', 'crypte'],

    generer({ portesActives = ['N', 'S'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),

            // ─── PLAFOND avec cheminée porte N
            plafondCathedrale(0,           W / 2 - 200, Y_PLAFOND + 60),
            plafondCathedrale(W / 2 + 200, W,           Y_PLAFOND + 60),

            // ─── MURS LATÉRAUX
            murLateralGauche(Y_PLAFOND + 60, Y_SOL),
            murLateralDroit(W, Y_PLAFOND + 60, Y_SOL),

            // ─── MEZZANINE PORTE N
            plateforme(W / 2, Y_PALIER_HAUT,      240, { oneWay: true }),
            plateforme(W / 2, Y_PALIER_HAUT + 70, 240, { oneWay: true }),

            // ─── ZIGZAG paliers
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

            // ─── NICHE COFFRE (latérale droite, près du palier zigzag, derrière mur secret)
            // Plus proche du palier W/2+100=800 pour rester dans le saut
            plateforme(W / 2 + 280, 880, 140, { oneWay: false })  // x=980
        ];

        const obstacles = [
            // 3 sols qui s'effritent
            solEffrite(W / 2 + 100, 670 - 7, 100),
            solEffrite(W / 2 - 100, 880 - 7, 100),
            solEffrite(W / 2 + 100, 1090 - 7, 100),

            // Mur SECRET entre zigzag et niche coffre droite (vertical)
            murSecret(W / 2 + 195, 870, 50, 110, { hp: 4, orientation: 'mur', dropSel: true }),

            // Brasier sur le sol final
            brasier(W / 2, Y_SOL, { largeur: 120, cycleMs: 4000, offsetMs: 0 })
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
