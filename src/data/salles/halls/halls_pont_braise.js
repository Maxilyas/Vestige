// Salle : Halls Cendrés — Pont de la Braise
//
// ARCHITECTURE : grand pont en pierre fragmenté traversant un GOUFFRE MORTEL.
// Pas de sol au centre — la chute = mort. Murs latéraux pleins. Brasiers
// flottants dans la fosse (lecture "abîme rougeoyant"). Plafond haut.
//
// Mur SECRET dans le mur lateral gauche (en bas, sous le sol côté gauche) :
// révèle une corniche de retour vers la porte O après chute volontaire ratée.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    mur, murLateralGauche, murLateralDroit,
    brasier, murSecret
} from '../_format.js';

const W = 2600;
const H = 1200;
const Y_SOL = H - HAUTEUR_SOL;        // 1160
const Y_PLAFOND = 60;
const Y_PONT = 580;

export const halls_pont_braise = {
    id: 'halls_pont_braise',
    biome: 'halls_cendres',
    nom: 'Pont de la Braise',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['pont', 'hall'],
    gouffreMort: true,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [
            // ─── SOL FRAGMENTÉ : 2 quais d'embarquement + abîme central
            sol(0,    400,  Y_SOL),    // quai gauche
            sol(2200, W,    Y_SOL),    // quai droite
            // GOUFFRE MORTEL au centre (400-2200)

            // ─── PLAFOND haut (cathédrale ouverte sur le vide)
            plafondCathedrale(0,    700,  Y_PLAFOND + 80),
            plafondCathedrale(700,  1300, Y_PLAFOND + 200),
            plafondCathedrale(1300, 1900, Y_PLAFOND + 200),
            plafondCathedrale(1900, W,    Y_PLAFOND + 80),

            // ─── MURS LATÉRAUX
            ...(portesActives.includes('O') ? [mur(15, Y_PLAFOND, Y_SOL - 100)] : [murLateralGauche(Y_PLAFOND, Y_SOL)]),
            ...(portesActives.includes('E') ? [mur(W - 15, Y_PLAFOND, Y_SOL - 100)] : [murLateralDroit(W, Y_PLAFOND, Y_SOL)]),

            // ─── PONT FRAGMENTÉ au-dessus du gouffre
            plateforme(500,    Y_PONT, 220, { oneWay: false }),  // tête de pont gauche
            plateforme(800,    Y_PONT, 180, { oneWay: true }),
            plateforme(1080,   Y_PONT, 140, { oneWay: true }),
            plateforme(1280,   Y_PONT, 140, { oneWay: true }),
            plateforme(1500,   Y_PONT, 200, { oneWay: false }),  // pile centrale du pont (refuge)
            plateforme(1720,   Y_PONT, 140, { oneWay: true }),
            plateforme(1920,   Y_PONT, 140, { oneWay: true }),
            plateforme(2100,   Y_PONT, 180, { oneWay: true }),
            plateforme(W - 500, Y_PONT, 220, { oneWay: false }), // tête de pont droite

            // ─── PALIERS D'ACCÈS AU PONT (depuis les quais)
            plateforme(180, Y_SOL - 80,  120, { oneWay: true }),
            plateforme(280, Y_SOL - 160, 120, { oneWay: true }),
            plateforme(380, Y_SOL - 240, 120, { oneWay: true }),
            plateforme(380, Y_SOL - 320, 120, { oneWay: true }),
            plateforme(380, Y_SOL - 400, 120, { oneWay: true }),    // 760
            plateforme(380, Y_SOL - 490, 120, { oneWay: true }),    // 670 (Δ90 du palier 760, Δ90 vers pont 580)
            plateforme(W - 180, Y_SOL - 80,  120, { oneWay: true }),
            plateforme(W - 280, Y_SOL - 160, 120, { oneWay: true }),
            plateforme(W - 380, Y_SOL - 240, 120, { oneWay: true }),
            plateforme(W - 380, Y_SOL - 320, 120, { oneWay: true }),
            plateforme(W - 380, Y_SOL - 400, 120, { oneWay: true }),
            plateforme(W - 380, Y_SOL - 490, 120, { oneWay: true })
        ];

        const obstacles = [
            // Brasiers FLOTTANTS dans la fosse (signal "abîme rougeoyant", pas
            // au sol — il n'y a PAS de sol au-dessous). Ils sont juste visuels
            // car le joueur meurt avant d'atteindre leur niveau (gouffre mortel
            // s'active sous y > H+30). Mais en passant près à hauteur de pont,
            // ils brûlent (placés à 950 = juste sous le pont 580).
            brasier(800,  900, { largeur: 120, cycleMs: 3000, offsetMs: 0 }),
            brasier(1300, 900, { largeur: 120, cycleMs: 3000, offsetMs: 1000 }),
            brasier(1800, 900, { largeur: 120, cycleMs: 3000, offsetMs: 2000 }),

            // Mur SECRET sous le quai gauche (révèle un coffre fortuit après
            // exploration des bords — récompense pour les curieux)
            murSecret(50, Y_SOL - 60, 60, 60, { hp: 4, orientation: 'mur', dropSel: true })
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
