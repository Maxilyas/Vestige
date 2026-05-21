// Salle : Halls Cendrés — Coin NE (tour-atelier)
//
// ARCHITECTURE : coin en L (entrée E droite, sortie N haut-droite). Mur
// lateral GAUCHE plein (fermeture L), plafond organique avec ouverture N.
// Niche brasier à mi-hauteur. Mur SECRET dans le mur lateral gauche (en bas).

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteE, porteN,
    mur, murLateralGauche,
    murSecret, brasier
} from '../_format.js';

const W = 1600;
const H = 1200;
const Y_SOL = H - HAUTEUR_SOL;        // 1160
const Y_PALIER_HAUT = 250;
const Y_PLAFOND = 60;

export const halls_coin_NE = {
    id: 'halls_coin_NE',
    biome: 'halls_cendres',
    nom: 'Coin NE (tour-atelier)',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['E', 'N'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['E', 'N'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),

            // ─── PLAFOND avec cheminée porte N (au-dessus du palier haut)
            plafondCathedrale(0,           W - 400,     Y_PLAFOND + 80),
            plafondCathedrale(W - 100,     W,           Y_PLAFOND + 60),

            // ─── MURS LATÉRAUX
            murLateralGauche(Y_PLAFOND + 60, Y_SOL),  // GAUCHE plein (pas de porte O)
            ...(portesActives.includes('E') ? [mur(W - 15, Y_PLAFOND, Y_SOL - 100)] : []),

            // ─── ESCALIER VERTICAL CÔTÉ DROIT (montée vers porte N)
            plateforme(W - 200, 1090, 120, { oneWay: true }),
            plateforme(W - 360, 1020, 130, { oneWay: true }),
            plateforme(W - 200,  950, 130, { oneWay: true }),
            plateforme(W - 360,  880, 130, { oneWay: true }),
            plateforme(W - 200,  810, 130, { oneWay: true }),
            plateforme(W - 360,  740, 130, { oneWay: true }),
            plateforme(W - 200,  670, 130, { oneWay: true }),
            plateforme(W - 360,  600, 130, { oneWay: true }),
            plateforme(W - 200,  530, 130, { oneWay: true }),
            plateforme(W - 360,  460, 130, { oneWay: true }),
            plateforme(W - 200,  390, 130, { oneWay: true }),
            plateforme(W - 360,  320, 130, { oneWay: true }),

            // ─── MEZZANINE PORTE N
            plateforme(W - 240, Y_PALIER_HAUT, 220, { oneWay: true }),

            // ─── NICHE COFFRE — déplacée près de l'escalier (Δ accessible)
            plateforme(W - 580, 1050, 180, { oneWay: false })   // proche palier W-360/1020
        ];

        const obstacles = [
            // Brasier d'ambiance au sol (foyer simple)
            brasier(W / 2, Y_SOL, { largeur: 120, cycleMs: 3500, offsetMs: 0 }),

            // Mur SECRET entre escalier et niche (vertical, gauche du palier W-580)
            murSecret(W - 480, 1010, 50, 100, { hp: 4, orientation: 'mur', dropSel: true })
        ];

        const portes = {};
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('N')) portes.N = porteN(W - 240, Y_PALIER_HAUT - 90);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
