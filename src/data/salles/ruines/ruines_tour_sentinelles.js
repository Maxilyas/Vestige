// Salle : Ruines basses — La Tour des Sentinelles
//
// Salle verticale NS, 4 étages physiquement séparés par plafonds. Chaque
// étage = combat avec une sentinelle fixe. Le joueur monte étage par étage
// soit en cassant des éboulis (tunnel central de chaque plafond), soit en
// trouvant un trou d'aération sur le côté.
//
// PUZZLE : choix tactique à chaque étage — sauver Résonance en cassant les
// éboulis (coûte du temps + risque ennemi) OU monter rapide par les côtés
// (plus exigeant en saut).

import {
    HAUTEUR_SOL, sol, plafond, plateforme,
    porteN, porteS,
    eboulis
} from '../_format.js';

const W = 1400;
const H = 1300;
const Y_SOL = H - HAUTEUR_SOL;        // 1260
const Y_PLAFOND_1 = 1000;             // plafond étage 1/2
const Y_PLAFOND_2 = 720;              // plafond étage 2/3
const Y_PLAFOND_3 = 440;              // plafond étage 3/4
const Y_PORTE_N = 100;                // mezzanine porte N étage 4

export const ruines_tour_sentinelles = {
    id: 'ruines_tour_sentinelles',
    biome: 'ruines_basses',
    nom: 'Tour des Sentinelles',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['N', 'S'],
    archetypesCompatibles: ['hall', 'crypte'],
    rolesAutorises: ['main', 'alt'],

    generer({ portesActives = ['N', 'S'] } = {}) {
        const plateformes = [];

        // ─── ÉTAGE 1 (sol → Y_PLAFOND_1) ──────────────────────────────
        plateformes.push(sol(0, W, Y_SOL));
        // Plafond avec gap droite (cassable par éboulis sinon)
        plateformes.push(plafond(0,         W - 220, Y_PLAFOND_1));
        // Petit palier d'accès au gap droite
        plateformes.push(plateforme(W - 280, 1180, 100, { oneWay: true }));
        plateformes.push(plateforme(W - 160, 1090, 90,  { oneWay: true }));

        // ─── ÉTAGE 2 (Y_PLAFOND_1 → Y_PLAFOND_2) ─────────────────────
        // Sol étage 2 = plafond_1. Paliers de montée vers gap gauche du plafond_2.
        plateformes.push(plateforme(300, 940, 110, { oneWay: true }));
        plateformes.push(plateforme(120, 870, 110, { oneWay: true }));
        plateformes.push(plateforme(300, 800, 110, { oneWay: true }));
        // Plafond avec gap gauche
        plateformes.push(plafond(220, W, Y_PLAFOND_2));
        plateformes.push(plateforme(120, Y_PLAFOND_2, 100, { oneWay: false }));  // palier d'entrée gap

        // ─── ÉTAGE 3 (Y_PLAFOND_2 → Y_PLAFOND_3) ──────────────────────
        plateformes.push(plateforme(W - 200, 660, 110, { oneWay: true }));
        plateformes.push(plateforme(W - 80,  590, 100, { oneWay: true }));
        plateformes.push(plateforme(W - 280, 520, 110, { oneWay: true }));
        // Plafond avec gap droite
        plateformes.push(plafond(0,  W - 200, Y_PLAFOND_3));
        plateformes.push(plateforme(W - 90, Y_PLAFOND_3, 100, { oneWay: false }));

        // ─── ÉTAGE 4 (top) — mezzanine porte N ─────────────────────────
        plateformes.push(plateforme(300, 380, 110, { oneWay: true }));
        plateformes.push(plateforme(500, 310, 110, { oneWay: true }));
        plateformes.push(plateforme(700, 240, 110, { oneWay: true }));
        plateformes.push(plateforme(800, 170, 110, { oneWay: true }));  // raccord vers mezzanine
        plateformes.push(plateforme(W / 2, Y_PORTE_N, 280, { oneWay: false }));

        // ─── Obstacles : éboulis CHAQUE plafond (tunnel) + sentinelles via spawn ─
        const obstacles = [
            // Étage 1 → 2 : éboulis dans le gap droite (alternative au saut latéral)
            eboulis(W - 130, Y_PLAFOND_1 - 110, { largeur: 80, hp: 3 }),
            // Étage 2 → 3 : éboulis dans le gap gauche
            eboulis(120,     Y_PLAFOND_2 - 110, { largeur: 80, hp: 3, dropSel: true }),
            // Étage 3 → 4 : éboulis dans le gap droite
            eboulis(W - 100, Y_PLAFOND_3 - 110, { largeur: 80, hp: 3 })
        ];

        const portes = {};
        if (portesActives.includes('S')) portes.S = porteS(W / 2, Y_SOL);
        if (portesActives.includes('N')) portes.N = porteN(W / 2, Y_PORTE_N - 90);

        return {
            plateformes,
            obstacles,
            zones: [],
            portes,
            spawnDefault: { x: W / 2, y: Y_PORTE_N - 20 }
        };
    }
};
