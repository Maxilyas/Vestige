// Salle : Halls Cendrés — Carrefour des Dépôts (T-SEO)
//
// ARCHITECTURE : carrefour S+E+O. Plafond pas trop haut (intérieur dépôt).
// Anciens dépôts de charbon = éboulis répartis. Niche cachée gauche derrière
// mur secret (visuellement = paroi).

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE, porteS,
    mur, murLateralGauche, murLateralDroit,
    eboulis, brasier, murSecret
} from '../_format.js';

const W = 2400;
const H = 1100;
const Y_SOL = H - HAUTEUR_SOL;        // 1060
const Y_PLAFOND = 60;

export const halls_t_SEO = {
    id: 'halls_t_SEO',
    biome: 'halls_cendres',
    nom: 'Carrefour des Dépôts',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['S', 'E', 'O'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['S', 'E', 'O'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),

            // ─── PLAFOND organique
            plafondCathedrale(0,    600,  Y_PLAFOND + 80),
            plafondCathedrale(600,  1100, Y_PLAFOND + 180),
            plafondCathedrale(1100, 1500, Y_PLAFOND + 80),    // pic central
            plafondCathedrale(1500, 1900, Y_PLAFOND + 180),
            plafondCathedrale(1900, W,    Y_PLAFOND + 80),

            // ─── MURS LATÉRAUX
            ...(portesActives.includes('O') ? [mur(15, Y_PLAFOND, Y_SOL - 100)] : [murLateralGauche(Y_PLAFOND, Y_SOL)]),
            ...(portesActives.includes('E') ? [mur(W - 15, Y_PLAFOND, Y_SOL - 100)] : [murLateralDroit(W, Y_PLAFOND, Y_SOL)]),

            // ─── PALIERS ambiance
            plateforme(500,  990, 140, { oneWay: true }),
            plateforme(700,  920, 140, { oneWay: true }),
            plateforme(900,  850, 140, { oneWay: true }),
            plateforme(1100, 780, 140, { oneWay: false }),
            plateforme(1300, 850, 140, { oneWay: true }),
            plateforme(1500, 920, 140, { oneWay: true }),
            plateforme(1700, 990, 140, { oneWay: true }),

            // ─── NICHE COFFRE (latérale gauche, accès via mur secret)
            plateforme(380, 990, 160, { oneWay: false })
        ];

        const obstacles = [
            // Mur SECRET vertical (entre niche et palier 500)
            murSecret(465, 920, 50, 130, { hp: 4, orientation: 'mur', dropSel: true }),

            // Éboulis dépôts (anciens charbons)
            eboulis(700,  Y_SOL - 110, { largeur: 80, hauteur: 110, hp: 2 }),
            eboulis(1700, Y_SOL - 110, { largeur: 80, hauteur: 110, hp: 2 }),

            // Brasier central marqueur (porte S juste à côté)
            brasier(W / 2, Y_SOL, { largeur: 140, cycleMs: 3500, offsetMs: 0 })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('S')) portes.S = porteS(W / 2, Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
