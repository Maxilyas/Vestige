// Salle : Halls Cendrés — Fosse aux braises (impasse S)
//
// ARCHITECTURE : deadend vertical bas. Entrée par porte S (bas centre).
// Murs latéraux pleins. Coffre haut sur estrade. Brasiers au sol forment
// une fosse dangereuse — grimper évite la marche.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteS,
    mur, murLateralGauche, murLateralDroit,
    brasier
} from '../_format.js';

const W = 1400;
const H = 1000;
const Y_SOL = H - HAUTEUR_SOL;        // 960
const Y_PLAFOND = 60;

export const halls_impasse_S = {
    id: 'halls_impasse_S',
    biome: 'halls_cendres',
    nom: 'Fosse aux braises',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['S'],
    archetypesCompatibles: ['crypte', 'sanctuaire'],
    rolesAutorises: ['deadend', 'alt'],

    generer({ portesActives = ['S'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),

            // ─── PLAFOND voûte basse cintrée
            plafondCathedrale(0,    400, Y_PLAFOND + 80),
            plafondCathedrale(400,  900, Y_PLAFOND + 180),
            plafondCathedrale(900,  W,   Y_PLAFOND + 80),

            // ─── MURS LATÉRAUX PLEINS
            murLateralGauche(Y_PLAFOND, Y_SOL),
            murLateralDroit(W, Y_PLAFOND, Y_SOL),

            // ─── ESTRADES BRASIERS (cuvettes pour les feux, pas sol plat)
            plateforme(300,  Y_SOL - 50, 160, { oneWay: false }),
            plateforme(700,  Y_SOL - 50, 160, { oneWay: false }),
            plateforme(1100, Y_SOL - 50, 160, { oneWay: false }),

            // ─── ESTRADE HAUTE (coffre)
            plateforme(W / 2, 480, 280, { oneWay: false }),

            // ─── PALIERS de montée
            plateforme(280,  890, 130, { oneWay: true }),
            plateforme(440,  820, 130, { oneWay: true }),
            plateforme(280,  750, 130, { oneWay: true }),
            plateforme(440,  680, 130, { oneWay: true }),
            plateforme(280,  610, 130, { oneWay: true }),
            plateforme(440,  540, 130, { oneWay: true }),
            plateforme(W - 280, 890, 130, { oneWay: true }),
            plateforme(W - 440, 820, 130, { oneWay: true }),
            plateforme(W - 280, 750, 130, { oneWay: true }),
            plateforme(W - 440, 680, 130, { oneWay: true }),
            plateforme(W - 280, 610, 130, { oneWay: true }),
            plateforme(W - 440, 540, 130, { oneWay: true })
        ];

        const obstacles = [
            // Brasiers SUR les estrades (justifiés visuellement)
            brasier(300,  Y_SOL - 50, { largeur: 120, offsetMs: 0 }),
            brasier(700,  Y_SOL - 50, { largeur: 120, offsetMs: 833 }),
            brasier(1100, Y_SOL - 50, { largeur: 120, offsetMs: 1667 })
        ];

        const portes = {};
        if (portesActives.includes('S')) portes.S = porteS(W / 2, Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: W / 2, y: Y_SOL - 20 }
        };
    }
};
