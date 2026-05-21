// Salle : Halls Cendrés — Corniche oubliée (impasse N)
//
// ARCHITECTURE : deadend vertical haut. On entre par le haut (porte N),
// descend par paliers. Murs latéraux pleins. Sol final = coffre. Mur SECRET
// dans le mur lateral droit (deuxième coffre bonus).

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN,
    mur, murLateralGauche, murLateralDroit,
    murSecret, eboulis
} from '../_format.js';

const W = 1400;
const H = 1100;
const Y_SOL = H - HAUTEUR_SOL;        // 1060
const Y_PALIER_HAUT = 330;
const Y_PLAFOND = 60;

export const halls_impasse_N = {
    id: 'halls_impasse_N',
    biome: 'halls_cendres',
    nom: 'Corniche oubliée',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['N'],
    archetypesCompatibles: ['crypte', 'sanctuaire'],
    rolesAutorises: ['deadend', 'alt'],

    generer({ portesActives = ['N'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),

            // ─── PLAFOND avec cheminée porte N
            plafondCathedrale(0,           W / 2 - 200, Y_PLAFOND + 60),
            plafondCathedrale(W / 2 + 200, W,           Y_PLAFOND + 60),

            // ─── MURS LATÉRAUX PLEINS
            murLateralGauche(Y_PLAFOND + 60, Y_SOL),
            murLateralDroit(W, Y_PLAFOND + 60, Y_SOL),

            // ─── MEZZANINE porte N
            plateforme(W / 2, Y_PALIER_HAUT,      240, { oneWay: true }),
            plateforme(W / 2, Y_PALIER_HAUT + 70, 240, { oneWay: true }),

            // ─── DESCENTE par paliers Δ85
            plateforme(W / 2 - 110, 480, 130, { oneWay: true }),
            plateforme(W / 2 + 110, 565, 130, { oneWay: true }),
            plateforme(W / 2 - 110, 650, 130, { oneWay: true }),
            plateforme(W / 2 + 110, 735, 130, { oneWay: true }),
            plateforme(W / 2 - 110, 820, 130, { oneWay: true }),
            plateforme(W / 2 + 110, 905, 130, { oneWay: true }),
            plateforme(W / 2 - 110, 990, 130, { oneWay: true })
        ];

        const obstacles = [
            // Éboulis au sol (ambiance)
            eboulis(280,    Y_SOL - 110, { largeur: 80, hauteur: 110, hp: 2 }),
            eboulis(W - 280, Y_SOL - 110, { largeur: 80, hauteur: 110, hp: 2 }),

            // Mur SECRET dans mur lateral droit (bonus secondaire)
            murSecret(W - 45, 800, 60, 120, { hp: 4, orientation: 'mur', dropSel: true })
        ];

        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(W / 2, Y_PALIER_HAUT - 90);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: W / 2, y: Y_PALIER_HAUT - 20 }
        };
    }
};
