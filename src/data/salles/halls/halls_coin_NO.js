// Salle : Halls Cendrés — Coin NO (cendrier suspendu)
//
// ARCHITECTURE : coin en L (entrée O, sortie N). Mur lateral DROIT plein.
// Plafond avec cheminée N (gauche). Mur EXPLOSIF visible bloque l'accès
// à une niche supérieure (warning rouge = avertissement, choix : casser ou pas).

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteN,
    mur, murLateralDroit,
    murExplosif, brasier
} from '../_format.js';

const W = 1600;
const H = 1200;
const Y_SOL = H - HAUTEUR_SOL;        // 1160
const Y_PALIER_HAUT = 250;
const Y_PLAFOND = 60;

export const halls_coin_NO = {
    id: 'halls_coin_NO',
    biome: 'halls_cendres',
    nom: 'Coin NO (cendrier suspendu)',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['O', 'N'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['O', 'N'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),

            // ─── PLAFOND avec cheminée porte N (côté gauche)
            plafondCathedrale(0,           100,         Y_PLAFOND + 60),
            plafondCathedrale(400,         W,           Y_PLAFOND + 80),

            // ─── MURS LATÉRAUX
            ...(portesActives.includes('O') ? [mur(15, Y_PLAFOND, Y_SOL - 100)] : []),
            murLateralDroit(W, Y_PLAFOND, Y_SOL),  // DROIT plein

            // ─── ESCALIER côté gauche (vers porte N)
            plateforme(200,  1090, 120, { oneWay: true }),
            plateforme(360,  1020, 130, { oneWay: true }),
            plateforme(200,   950, 130, { oneWay: true }),
            plateforme(360,   880, 130, { oneWay: true }),
            plateforme(200,   810, 130, { oneWay: true }),
            plateforme(360,   740, 130, { oneWay: true }),
            plateforme(200,   670, 130, { oneWay: true }),
            plateforme(360,   600, 130, { oneWay: true }),
            plateforme(200,   530, 130, { oneWay: true }),
            plateforme(360,   460, 130, { oneWay: true }),
            plateforme(200,   390, 130, { oneWay: true }),
            plateforme(360,   320, 130, { oneWay: true }),

            // ─── MEZZANINE porte N
            plateforme(240, Y_PALIER_HAUT, 220, { oneWay: true }),

            // ─── NICHE COFFRE (à droite, derrière mur explosif visible)
            plateforme(580, 600, 160, { oneWay: false })
        ];

        const obstacles = [
            // Mur EXPLOSIF visible (warning rouge) — RISQUE → récompense
            murExplosif(480, 530, { largeur: 40, hauteur: 130, hp: 3, dropSel: true, dropFragmentFamille: 'blanc' }),

            // Brasier d'ambiance au sol
            brasier(W / 2, Y_SOL, { largeur: 120, cycleMs: 4000, offsetMs: 0 })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('N')) portes.N = porteN(240, Y_PALIER_HAUT - 90);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
