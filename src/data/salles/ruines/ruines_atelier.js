// Salle : Ruines basses — L'Atelier des Artisans
//
// 2 étages OE. Sol = tunnel forcé par 3 éboulis (plafond bas). Étage 2 =
// galerie d'atelier avec coffre. Galerie haute en option.

import {
    HAUTEUR_SOL, sol, plafond, plateforme,
    porteO, porteE,
    eboulis
} from '../_format.js';

const W = 2800;
const H = 1100;
const Y_SOL = H - HAUTEUR_SOL;        // 1060
const Y_PLAFOND_1 = 920;              // tunnel sol (hauteur intérieure = 140)

export const ruines_atelier = {
    id: 'ruines_atelier',
    biome: 'ruines_basses',
    nom: 'Atelier des Artisans',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'crypte'],
    rolesAutorises: ['main', 'alt'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];

        // ─── ÉTAGE 1 (sol) — tunnel forcé ──────────────────────────────
        plateformes.push(sol(0, W, Y_SOL));
        // Plafond bas avec 2 grands gaps (entrée + sortie + petit escalier centre)
        plateformes.push(plafond(160, 1000, Y_PLAFOND_1));
        plateformes.push(plafond(1300, W - 160, Y_PLAFOND_1));

        // ─── Escalier sol → étage 2 (gap central 1000..1300) ──────────
        plateformes.push(plateforme(1050, 990, 100, { oneWay: true }));   // saut 70 depuis sol
        plateformes.push(plateforme(1150, 920, 100, { oneWay: true }));   // dans gap → étage 2
        plateformes.push(plateforme(1250, 850, 100, { oneWay: true }));

        // ─── ÉTAGE 2 : galerie atelier large + tables ──────────────────
        plateformes.push(plateforme(W / 2, 780, 1800, { oneWay: false }));  // plancher central large
        // Tables d'établi (atteignables depuis plancher)
        plateformes.push(plateforme(900,  710, 130, { oneWay: true }));
        plateformes.push(plateforme(1300, 710, 130, { oneWay: true }));
        plateformes.push(plateforme(1700, 710, 130, { oneWay: true }));
        // Mezzanine vers étage 3 (côté droit, saut 70 depuis plancher 780)
        plateformes.push(plateforme(2000, 710, 130, { oneWay: true }));
        plateformes.push(plateforme(2200, 640, 130, { oneWay: true }));
        plateformes.push(plateforme(2400, 570, 130, { oneWay: true }));
        plateformes.push(plateforme(2300, 500, 130, { oneWay: true }));

        // ─── ÉTAGE 3 : galerie haute (saut 70 depuis dernier palier 2300/500) ──
        plateformes.push(plateforme(W / 2, 430, 1800, { oneWay: false }));

        // ─── Obstacles ─────────────────────────────────────────────────
        const obstacles = [
            // 3 éboulis dans le tunnel sol (plafond bas → bloque saut)
            eboulis(550,  Y_SOL - 110, { largeur: 100, hp: 3 }),
            eboulis(1500, Y_SOL - 110, { largeur: 100, hp: 3, dropSel: true }),
            eboulis(2400, Y_SOL - 110, { largeur: 100, hp: 3 })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        const coffreForce = { x: 1700, y: 710 - 12 };

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
