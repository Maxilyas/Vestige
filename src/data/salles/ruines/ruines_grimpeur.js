// Salle : Ruines basses — Le Grimpeur
//
// PUZZLE CENTRAL : verticalité pure, enseignement de la mécanique d'ancrage.
//
//   1. Joueur arrive par porte O au sol (y=1260)
//   2. Escalier naturel à gauche : 5 paliers de pierre qui montent jusqu'au
//      palier de départ (yTop=910). Pas d'ancre nécessaire ici.
//   3. Au-dessus du palier départ : MUR INFRANCHISSABLE au saut seul.
//      3 zones d'ancrage pulsantes empilées verticalement (90 px d'écart).
//      Le joueur doit poser les 3 ancres (1 Fragment Blanc chacune) pour
//      grimper jusqu'à yTop=550 où se trouve la sortie E à droite.
//   4. Sur le palier d'arrivée, traverse vers porteE (à droite, x≈2360).
//
// MÉCANIQUE FIFO (3 ancres max) :
//   Si le joueur pose mal, son ancre 4 efface l'ancre 1 → il chute du
//   sommet. Punition douce qui force à recommencer la grimpe, pas
//   game over.
//
// GESTE DE DESIGN : "la verticalité ne se conquiert qu'en construisant".

import {
    HAUTEUR_SOL, sol, plateforme, ancre,
    porteO, porteE, porteS
} from '../_format.js';

const W = 2400;
const H = 1300;
const Y_SOL = H - HAUTEUR_SOL;        // 1260
const Y_PALIER_ARRIVEE = 550;         // yTop palier final (où la porte E est ancrée)
const Y_PALIER_DEPART = 910;          // yTop palier "base de grimpe"

export const ruines_grimpeur = {
    id: 'ruines_grimpeur',
    biome: 'ruines_basses',
    nom: 'Le Grimpeur',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['O', 'E', 'S'],
    archetypesCompatibles: ['hall', 'pont', 'crypte', 'sanctuaire'],
    // Salle SIGNATURE : exclue des deadends (le puzzle de grimpe n'a pas
    // de sens si on doit faire demi-tour ensuite).
    rolesAutorises: ['main', 'alt', 'entree'],
    unique: true,    // max 1 fois par étage

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];

        // ─── Sol bas (entrée) ────────────────────────────────────────
        plateformes.push(sol(0, W, Y_SOL));

        // ─── Escalier naturel côté gauche : sol → palier départ ──────
        // 5 sauts de 70 px vert (sûr). Chaque palier décalé de 80-100 horiz
        // pour rester atteignable (≤130 edge-to-edge).
        plateformes.push(plateforme(220, 1190, 80, { oneWay: true }));
        plateformes.push(plateforme(340, 1120, 80, { oneWay: true }));
        plateformes.push(plateforme(460, 1050, 80, { oneWay: true }));
        plateformes.push(plateforme(580, 980,  80, { oneWay: true }));

        // ─── Palier de départ (base de la grimpe) ────────────────────
        // Plus large : permet de viser tranquillement les ancres au-dessus.
        plateformes.push(plateforme(720, Y_PALIER_DEPART, 200, { oneWay: true }));

        // ─── Palier d'arrivée (toit, supporte la porte E) ────────────
        // Couvre toute la moitié droite. ONE-WAY pour permettre au joueur
        // d'arriver dessus en sautant depuis la 3ᵉ ancre (sinon head-bonk).
        plateformes.push(plateforme((620 + W) / 2, Y_PALIER_ARRIVEE, W - 620, { h: 18, oneWay: true }));
        // Note : le palier d'arrivée est techniquement "inaccessible" sans
        // l'ancrage (puzzle de la salle) — c'est le cœur du gameplay.
        // Le validateur ne sait pas que le joueur peut poser des plateformes,
        // donc il flag ce palier comme inaccessible. C'est ATTENDU.

        // ─── Zones ANCRABLES empilées au-dessus du palier départ ─────
        // Espacement vertical 90 px (juste sous saut max 96). À chaque palier
        // posé, le joueur peut atteindre la zone d'ancre suivante.
        //
        //   palier départ y=910 → ancre1 y=820 (gap 90)
        //   ancre1 y=820       → ancre2 y=730 (gap 90)
        //   ancre2 y=730       → ancre3 y=640 (gap 90)
        //   ancre3 y=640       → palier arrivée y=550 (gap 90)
        //
        // Toutes alignées sur la même verticale (x=720) → grimpe pure.
        const zones = [
            ancre(720, 820, 100, 30, { plateformeW: 100, plateformeH: 14 }),
            ancre(720, 730, 100, 30, { plateformeW: 100, plateformeH: 14 }),
            ancre(720, 640, 100, 30, { plateformeW: 100, plateformeH: 14 })
        ];

        // ─── Obstacles : aucun (puzzle de pure traversée verticale) ──
        const obstacles = [];

        // ─── Portes ──────────────────────────────────────────────────
        const portes = {};
        if (portesActives.includes('O')) {
            portes.O = porteO(Y_SOL);          // ancrée au sol bas
        }
        if (portesActives.includes('E')) {
            portes.E = porteE(W, Y_PALIER_ARRIVEE);  // ancrée au palier arrivée
        }
        if (portesActives.includes('S')) {
            // Trappe vers les anciens passages humbles (B-bas). Placée sur le
            // sol bas, côté droit du palier départ : invite le joueur sans
            // Fragments à descendre prendre la voie humble plutôt que de
            // rester bloqué au pied de la grimpe.
            portes.S = porteS(1800, Y_SOL);
        }

        // ─── Spawn par défaut (si pas de porteArrivee) ───────────────
        const spawnDefault = { x: 80, y: Y_SOL - 20 };

        return { plateformes, obstacles, portes, zones, spawnDefault };
    }
};
