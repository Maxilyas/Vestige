// Salle : Voile Inversé — Le Pendule (OE compact, SIGNATURE)
// (Phase 9.x — Voile Vague 1, 3e saveur : inversion CYCLIQUE globale)
//
// MÉCANIQUE SIGNATURE : la gravité du joueur de TOUTE la salle bascule
// haut↔bas sur un timer (`penduleInversion`), avec un télégraphe ~0,9 s avant
// chaque flip (bande de bord magenta + flash + son). Le joueur « tombe » du sol
// vers la corniche-plafond puis revient, en rythme.
//
// DESIGN « repositionnement » : pieux au SOL et pieux au PLAFOND placés à des x
// DÉCALÉS → la zone safe du sol n'est pas celle du plafond. Avant chaque flip,
// le joueur doit se déplacer latéralement pour atterrir sur une zone safe de la
// surface d'arrivée. Le coffre n'est atteignable QUE pendant une phase inversée
// (corniche-plafond), à un x safe à l'est.
//
// CADRE DESIGN — 5 critères (≈4/5) :
//   ✓ Risque    : pieux sol + pieux plafond (dégâts au contact)
//   ✓ Pression  : flip toutes les ~3,5 s force le repositionnement (timing)
//   ✓ Combat    : Larme Tisseuse qui harcèle (chasse en 2D, insensible au flip)
//   ✓ Lecture   : télégraphe de bord + pieux sol/plafond distincts + magenta
//   ~ Choix     : surface à privilégier / instant pour avancer
//
// La corniche-plafond (SOLIDE, pleine largeur, taguée 'gravite_inverse') est le
// « sol inversé » : le joueur s'y pose quand la gravité monte. Le validateur BFS
// (gravité normale) l'ignore ; la traversée O↔E reste triviale par le sol plein.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    pieuSol, pieuPlafond
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;          // 500
const Y_CORNICHE = 110;                 // top de la corniche-plafond
const Y_CORNICHE_BAS = Y_CORNICHE + 16; // bottom (h défaut 16) = 126

export const voile_pendule_oscillant = {
    id: 'voile_pendule_oscillant',
    biome: 'voile_inverse',
    nom: 'Le Pendule',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'arene', 'pont'],
    rolesAutorises: ['main', 'alt'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 16));

        // Sol plein continu : traversée O↔E toujours possible (validateur-safe).
        plateformes.push(sol(0, W, Y_SOL));

        // Corniche-plafond pleine largeur = le « sol inversé ». Taguée
        // 'gravite_inverse' → BFS l'ignore (atteignable seulement gravité montée).
        plateformes.push(plateforme(W / 2, Y_CORNICHE, W, { tags: ['gravite_inverse'] }));

        // Pieux SOL (grappe centre-gauche + un à l'est) vs pieux PLAFOND (grappe
        // centre-droite + un à l'ouest) : zones safe décalées entre les 2 surfaces.
        const obstacles = [
            pieuSol(300, Y_SOL), pieuSol(380, Y_SOL), pieuSol(700, Y_SOL),
            pieuPlafond(180, Y_CORNICHE_BAS),
            pieuPlafond(500, Y_CORNICHE_BAS), pieuPlafond(580, Y_CORNICHE_BAS)
        ];

        // Pendule : gravité de la salle bascule haut↔bas. Départ gravité normale.
        const penduleInversion = { periode: 3500, telegraphMs: 900, depart: 'bas' };

        // Coffre sur la corniche-plafond, à un x safe à l'est (loin des pieux
        // plafond), au niveau du joueur tête en bas (corniche.bottom 126 + 30).
        const coffreForce = { x: 840, y: 156 };

        // Flotteur harceleur (gravite:false → insensible au flip, chasse en 2D).
        const ennemisForce = [
            { x: 480, y: 290, enemyId: 'larme_tisseuse' }
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 },
            coffreForce, ennemisForce, penduleInversion
        };
    }
};
