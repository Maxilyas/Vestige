// Salle : Halls Cendrés — Crypte effondrée (signature)
//
// ARCHITECTURE : descente verticale dans une crypte funéraire. Murs latéraux
// pleins (sauf portes N/S). Zigzag de paliers + 2 niches latérales cachées
// derrière mur_secret (visuellement = paroi rocheuse). Brasier unique sur
// le sol final (foyer ancestral).

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteS,
    mur, murLateralGauche, murLateralDroit,
    murSecret, solEffrite, brasier
} from '../_format.js';

const W = 1700;
const H = 1500;
const Y_SOL = H - HAUTEUR_SOL;        // 1460
const Y_PALIER_HAUT = 250;
const Y_PLAFOND = 60;

export const halls_crypte_effondree = {
    id: 'halls_crypte_effondree',
    biome: 'halls_cendres',
    nom: 'Crypte effondrée',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['N', 'S'],
    archetypesCompatibles: ['puits', 'crypte'],
    rolesAutorises: ['main', 'alt', 'entree'],
    unique: true,

    generer({ portesActives = ['N', 'S'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),

            // ─── PLAFOND avec ouverture porte N
            plafondCathedrale(0, W / 2 - 200, Y_PLAFOND + 60),
            plafondCathedrale(W / 2 + 200, W, Y_PLAFOND + 60),
            // Toit après ouverture N : refermé en hauteur
            plafondCathedrale(W / 2 - 200, W / 2 + 200, Y_PLAFOND + 30),

            // ─── MURS LATÉRAUX PLEINS (crypte fermée — pas de portes O/E)
            murLateralGauche(Y_PLAFOND + 60, Y_SOL),
            murLateralDroit(W, Y_PLAFOND + 60, Y_SOL),

            // ─── MEZZANINE PORTE N
            plateforme(W / 2, Y_PALIER_HAUT,      260, { oneWay: true }),
            plateforme(W / 2, Y_PALIER_HAUT + 70, 260, { oneWay: true }),

            // ─── ZIGZAG DE PALIERS (Δ90 vert, gap horiz 80)
            plateforme(W / 2 - 110,  380,  140, { oneWay: true }),
            plateforme(W / 2 + 110,  470,  140, { oneWay: true }),
            plateforme(W / 2 - 110,  560,  140, { oneWay: true }),
            plateforme(W / 2 + 110,  650,  140, { oneWay: true }),
            plateforme(W / 2 - 110,  740,  140, { oneWay: true }),
            plateforme(W / 2 + 110,  830,  140, { oneWay: true }),
            plateforme(W / 2 - 110,  920,  140, { oneWay: true }),
            plateforme(W / 2 + 110, 1010,  140, { oneWay: true }),
            plateforme(W / 2 - 110, 1100,  140, { oneWay: true }),
            plateforme(W / 2 + 110, 1190,  140, { oneWay: true }),
            plateforme(W / 2 - 110, 1280,  140, { oneWay: true }),
            plateforme(W / 2 + 110, 1370,  140, { oneWay: true }),

            // ─── NICHES LATÉRALES (cachées derrière mur_secret, gap edge ≤ 50)
            plateforme(W / 2 - 280,  560, 160, { oneWay: false }),
            plateforme(W / 2 + 280,  920, 160, { oneWay: false })
        ];

        const obstacles = [
            // Murs SECRETS visuellement identiques aux paliers (l'œil ne voit
            // rien — la découverte vient en tapant les paliers du zigzag)
            murSecret(W / 2 - 195, 525, 50, 90, { hp: 4, orientation: 'mur', dropSel: true }),
            murSecret(W / 2 + 195, 885, 50, 90, { hp: 4, orientation: 'mur', dropSel: true }),

            // Sols qui s'effritent : 2 paliers du zigzag (pression descente)
            solEffrite(W / 2 - 110, 740 - 7, 120),
            solEffrite(W / 2 + 110, 1010 - 7, 120),

            // Brasier UNIQUE sur le sol final (foyer ancestral)
            brasier(W / 2, Y_SOL, { largeur: 140, cycleMs: 3500, offsetMs: 0 })
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
