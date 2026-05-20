// Salle : Ruines basses — L'Arche brisée
//
// 2ᵉ salle SIGNATURE Ruines (avec Le Grimpeur) : intègre l'ancrage comme
// puzzle de traversée. Grand gouffre central avec fond de pieux. Options :
//
//  1. Construire un pont au-dessus du gouffre (2 ancres bien placées)
//  2. Détour par la mezzanine haute (escalier naturel, sans coût Résonance)
//  3. Drop précis dans le gouffre entre les pieux mécaniques (risqué)
//
// Le fond du gouffre est PHYSIQUEMENT PRÉSENT et DANS les world bounds.
// Le joueur qui tombe rencontre les pieux mécaniques (placés ENTRE les
// ancres, pas dessous) → dégâts puis remontée pénible.
//
// PORTES : O et E (sol).

import {
    HAUTEUR_SOL, sol, plateforme, ancre,
    porteO, porteE,
    solEffrite, racinesReflux
} from '../_format.js';

const W = 2800;
const H = 1200;                              // ↑ pour gouffre profond DANS world bounds
const Y_SOL = H - HAUTEUR_SOL;               // 1160
const Y_FOND_GOUFFRE = 1180;                 // fond du gouffre, sol mince
const Y_MEZZANINE = 480;
const GOUFFRE_X_GAUCHE = 1100;
const GOUFFRE_X_DROITE = 1700;

export const ruines_arche_brisee = {
    id: 'ruines_arche_brisee',
    biome: 'ruines_basses',
    nom: 'L\'Arche brisée',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['pont', 'hall'],
    // Salle SIGNATURE — exclue des deadends du spanning tree.
    rolesAutorises: ['main', 'alt', 'entree'],
    unique: true,    // max 1 fois par étage

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];

        // ─── Sol : île gauche + île droite + fond du gouffre ───────────
        plateformes.push(sol(0,                 GOUFFRE_X_GAUCHE, Y_SOL));
        plateformes.push(sol(GOUFFRE_X_DROITE,  W,                Y_SOL));
        // Fond du gouffre (mince, visible). Stoppe physiquement la chute.
        plateformes.push(sol(GOUFFRE_X_GAUCHE, GOUFFRE_X_DROITE, Y_FOND_GOUFFRE, { h: 16 }));

        // ─── Escalier naturel côté gauche vers mezzanine ──────────────
        // Saut 70 vert / horiz ≤130 edge-to-edge.
        plateformes.push(plateforme(180,  1090, 90, { oneWay: true }));
        plateformes.push(plateforme(320,  1020, 90, { oneWay: true }));
        plateformes.push(plateforme(480,  950,  90, { oneWay: true }));
        plateformes.push(plateforme(640,  880,  90, { oneWay: true }));
        plateformes.push(plateforme(800,  810,  90, { oneWay: true }));
        plateformes.push(plateforme(960,  740,  90, { oneWay: true }));
        plateformes.push(plateforme(1100, 670,  90, { oneWay: true }));   // ← palier intermédiaire
        plateformes.push(plateforme(1240, 600,  100, { oneWay: true }));  // ← rapproche de la mezzanine
        plateformes.push(plateforme(1330, 530,  100, { oneWay: true }));  // ← juste sous mezzanine

        // ─── Mezzanine haute (chemin alternatif sûr) ───────────────────
        plateformes.push(plateforme(W / 2, Y_MEZZANINE, 600, { oneWay: true }));

        // ─── Escalier symétrique côté droit ────────────────────────────
        plateformes.push(plateforme(W - 1330, 530,  100, { oneWay: true }));
        plateformes.push(plateforme(W - 1240, 600,  100, { oneWay: true }));
        plateformes.push(plateforme(W - 1100, 670,  90,  { oneWay: true }));
        plateformes.push(plateforme(W - 960,  740,  90,  { oneWay: true }));
        plateformes.push(plateforme(W - 800,  810,  90,  { oneWay: true }));
        plateformes.push(plateforme(W - 640,  880,  90,  { oneWay: true }));
        plateformes.push(plateforme(W - 480,  950,  90,  { oneWay: true }));
        plateformes.push(plateforme(W - 320,  1020, 90,  { oneWay: true }));
        plateformes.push(plateforme(W - 180,  1090, 90,  { oneWay: true }));

        // ─── Obstacles ─────────────────────────────────────────────────
        const obstacles = [];

        // Pieux fixes au fond du gouffre : ils sont AUX BORDS du gouffre,
        // pour que la zone CENTRALE serve aux pieux mécaniques pulsants.
        for (const x of [GOUFFRE_X_GAUCHE + 60, GOUFFRE_X_GAUCHE + 130,
                         GOUFFRE_X_DROITE - 130, GOUFFRE_X_DROITE - 60]) {
            obstacles.push({ type: 'pieu', x, y: Y_FOND_GOUFFRE - 9, orientation: 'sol' });
        }

        // Sols qui s'effritent sur les paliers hauts (force la course-poursuite
        // ou ancrage de secours pour ceux qui choisissent la voie mezzanine).
        obstacles.push(solEffrite(800,     810, 100));
        obstacles.push(solEffrite(W - 800, 810, 100));

        // Pieux mécaniques (ex "racines reflux") AU FOND DU GOUFFRE, placés
        // ENTRE les futures positions d'ancre. Cycle pieux↔plateforme désync :
        // le joueur qui drope doit timer son saut entre les pieux activés.
        // Ancres à x=1280 et x=1520 → pieux à x=1330 et x=1470 (entre).
        obstacles.push(racinesReflux(1330, Y_FOND_GOUFFRE, { largeur: 60, hauteur: 50, offsetMs: 0 }));
        obstacles.push(racinesReflux(1470, Y_FOND_GOUFFRE, { largeur: 60, hauteur: 50, offsetMs: 1500 }));

        // ─── Zones ancrables : 2 ancres au-dessus du gouffre ───────────
        // Positionnées pour qu'on les atteigne depuis le bord d'une île.
        // Distance ancrage 140 px → on peut poser depuis le bord de l'île.
        // yTop=Y_SOL - 80 = atteignable au saut depuis l'île.
        const zones = [
            ancre(1280, Y_SOL - 80, 100, 30, { plateformeW: 130, plateformeH: 14 }),
            ancre(1520, Y_SOL - 80, 100, 30, { plateformeW: 130, plateformeH: 14 })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes,
            obstacles,
            zones,
            portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
