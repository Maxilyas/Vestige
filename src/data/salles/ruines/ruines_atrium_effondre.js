// Salle : Ruines basses — L'Atrium Effondré
// (Phase 9.2 — Première salle compacte 960×540 fixe)
//
// PROOF-OF-CONCEPT du pivot Phase 9 :
//   - dims = canvas Phaser (960×540), pas de scroll caméra
//   - Densité géométrique forcée par la contrainte spatiale
//   - 5 niveaux verticaux empilés dans la hauteur de l'écran
//   - Coffre forcé sur la passerelle centrale (récompense montée)
//
// NARRATIF — "L'atrium des nobles" :
//   Une salle de cérémonie effondrée. La voûte a tenu, mais le plancher
//   du premier étage s'est affaissé en mezzanines instables. Les nobles
//   prient encore, en silence, sous la poussière.
//
// GESTE DE DESIGN :
//   • Sol entier traversable (porte O → porte E)
//   • Zigzag vertical optionnel pour atteindre la passerelle haute (coffre)
//   • La verticalité tient TOUT entière dans 540 px → impossible d'être perdu
//
// Convention Phase 9 : flag `dimsCanvas: true` → WorldGen force 960×540
// et GameScene fige la caméra sur (0, 0, 960, 540).

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;          // 500 (top du sol)
const Y_VOUTE = 24;                      // top de la voûte cathédrale

export const ruines_atrium_effondre = {
    id: 'ruines_atrium_effondre',
    biome: 'ruines_basses',
    nom: 'L\'Atrium Effondré',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,                   // Phase 9 — caméra figée, salle = écran
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'crypte', 'sanctuaire'],
    rolesAutorises: ['main', 'alt'],
    unique: true,                       // 1 seule fois par étage tant que test

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];

        // ─── Voûte cathédrale (décorative, non-walkable) ──────────────
        plateformes.push(plafondCathedrale(40, W - 40, Y_VOUTE));

        // ─── Sol entier (porte O → porte E direct) ────────────────────
        plateformes.push(sol(0, W, Y_SOL));

        // ─── Zigzag vertical pour rejoindre la passerelle haute ───────
        // Tous les écarts respectent ECART_VERT_SAFE = 70 px (saut sûr).

        // Niveau 1 — paliers latéraux (sol + 70)
        plateformes.push(plateforme(170, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(790, 430, 110, { oneWay: true }));

        // Niveau 2 — paliers intermédiaires (niveau 1 + 70)
        plateformes.push(plateforme(290, 360, 100, { oneWay: true }));
        plateformes.push(plateforme(670, 360, 100, { oneWay: true }));

        // Niveau 3 — passerelle centrale haute (niveau 2 + 70)
        // Largeur 320 → couvre le centre, accessible depuis les deux côtés
        plateformes.push(plateforme(480, 290, 320, { oneWay: true }));

        // Niveau 4 — palier sommet sous la voûte (passerelle + 70)
        plateformes.push(plateforme(480, 220, 110, { oneWay: true }));

        // Niveau 5 — corniches sommet (palier sommet + 70, edge-to-edge < 130)
        // Rapprochées du centre pour rester atteignables depuis palier 480/220.
        plateformes.push(plateforme(330, 150, 110, { oneWay: true }));
        plateformes.push(plateforme(630, 150, 110, { oneWay: true }));

        // ─── Pas d'obstacles pour le test (lecture max) ──────────────
        const obstacles = [];

        // ─── Portes ──────────────────────────────────────────────────
        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        // ─── Coffre forcé : sur la passerelle centrale (récompense montée) ──
        const coffreForce = { x: 480, y: 290 - 12 };

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
