// Salle : Ruines basses — La Cathédrale fragmentée
//
// 3 étages séparés par plafonds. Démontre l'usage simultané de plafonds,
// tunnels (forcé par éboulis) et plaque d'activation.

import {
    HAUTEUR_SOL, sol, plafond, plateforme,
    porteO, porteE, porteN, porteS,
    eboulis, plaque
} from '../_format.js';

const W = 2400;
const H = 1200;
const Y_SOL = H - HAUTEUR_SOL;                  // 1160
const Y_PLAFOND_ETAGE1 = 850;                   // top plafond entre étage 1 et 2
const Y_PLAFOND_ETAGE2 = 530;                   // top plafond entre étage 2 et 3
const Y_PORTE_N = 200;

export const ruines_cathedrale = {
    id: 'ruines_cathedrale',
    biome: 'ruines_basses',
    nom: 'Cathédrale fragmentée',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['sanctuaire', 'hall', 'crypte'],
    rolesAutorises: ['main', 'alt', 'entree'],
    unique: true,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];

        // ─── ÉTAGE 1 (sol) — tunnel forcé avec éboulis ─────────────────
        plateformes.push(sol(0, W, Y_SOL));
        // Plafond étage 1/2 ouvert au CENTRE (gap 950..1100 pour monter)
        plateformes.push(plafond(0,    950, Y_PLAFOND_ETAGE1));
        plateformes.push(plafond(1100, W,  Y_PLAFOND_ETAGE1));

        // ─── Escalier sol → étage 2 (via gap central plafond_1) ───────
        // Sol Y_SOL=1160. Sauts ≤70 safe. Échelons : 1090, 1020, 950, 880.
        plateformes.push(plateforme(720,  1090, 100, { oneWay: true }));
        plateformes.push(plateforme(870,  1020, 100, { oneWay: true }));
        plateformes.push(plateforme(1000,  950, 100, { oneWay: true }));
        plateformes.push(plateforme(1020,  880, 100, { oneWay: true }));
        // → Atteint Y_PLAFOND_ETAGE1 (850) via le gap (1020 est dans 950..1100)

        // ─── ÉTAGE 2 : paliers de combat entre plafonds ────────────────
        // Sur le plafond gauche (yTop=850), zone de combat.
        // Escalier vers étage 3 (gap central plafond_2 à 1700..1900).
        plateformes.push(plateforme(1200, 780, 110, { oneWay: true }));
        plateformes.push(plateforme(1380, 710, 110, { oneWay: true }));
        plateformes.push(plateforme(1560, 640, 110, { oneWay: true }));
        // Palier avec la plaque (large)
        plateformes.push(plateforme(1750, 600, 220, { oneWay: false }));

        // ─── PLAFOND étage 2/3 (avec gap central pour passage étage 3)
        plateformes.push(plafond(0,    1650, Y_PLAFOND_ETAGE2));
        plateformes.push(plafond(1900, W,    Y_PLAFOND_ETAGE2));
        // Le gap 1650..1900 reste libre → on monte par là

        // ─── ÉTAGE 3 (haut) : galerie + porte N + coffre ───────────────
        plateformes.push(plateforme(1700, 460, 120, { oneWay: true }));
        plateformes.push(plateforme(1500, 390, 120, { oneWay: true }));
        plateformes.push(plateforme(1280, 320, 120, { oneWay: true }));
        plateformes.push(plateforme(1100, 270, 120, { oneWay: true }));
        // Mezzanine porte N (large)
        plateformes.push(plateforme(W / 2, Y_PORTE_N, 320, { oneWay: false }));
        // Palier coffre (côté droit, atteignable depuis mezzanine yTop=200, w=320)
        // Mezzanine edges = W/2-160..W/2+160 = 1040..1360. Coffre x=2000 → trop loin.
        // Repositionner pour atteignable saut horiz depuis mezzanine.
        plateformes.push(plateforme(1500, 230, 200, { oneWay: false }));

        // ─── Obstacles ─────────────────────────────────────────────────
        const obstacles = [
            // Éboulis dans le tunnel sol — empêche traversée sol direct
            eboulis(350,  Y_SOL - 110, { largeur: 100, hp: 3 }),
            eboulis(2000, Y_SOL - 110, { largeur: 100, hp: 3, dropSel: true }),
            // Plaque étage 2 : pieux temporaires sur le sol
            plaque(1750, 600, 'pieux', {
                dureeMs: 3000,
                positions: [
                    { x: 600,  y: Y_SOL - 9 },
                    { x: 900,  y: Y_SOL - 9 },
                    { x: 1200, y: Y_SOL - 9 }
                ]
            })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('S')) portes.S = porteS(Math.round(W * 0.5), Y_SOL);
        if (portesActives.includes('N')) portes.N = porteN(W / 2, Y_PORTE_N - 90);

        const coffreForce = { x: 1500, y: 230 - 12 };

        return {
            plateformes,
            obstacles,
            zones: [],
            portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 },
            coffreForce
        };
    }
};
