// Salle : Voile Inversé — Le Gouffre Pendulaire (OE compact, SIGNATURE)
// (Phase 9.x — Voile Vague 1, pendule cyclique : variante GOUFFRE)
//
// MÉCANIQUE : pendule cyclique global (`penduleInversion`) AU-DESSUS d'un
// gouffre LÉTAL. Pendant la phase INVERSÉE, la corniche-plafond pleine largeur
// devient un pont sûr par-dessus le vide ; pendant la phase NORMALE, il faut
// être sur une île de sol ou sur la navette — sinon on chute dans le gouffre.
//
// La tension du pendule de base (repositionnement) devient ici MORTELLE : se
// faire surprendre au-dessus du vide par un flip vers le bas = mort.
//
// CADRE DESIGN — 5 critères (5/5) :
//   ✓ Risque    : gouffre LÉTAL central (320..640)
//   ✓ Pression  : flip toutes les ~3 s + navette à timer + tir Voix Lointaine
//   ✓ Choix     : navette basse (rapide, exposée) OU pont-plafond en phase
//                 inversée (sûr mais dépend du cycle)
//   ✓ Combat    : Voix Lointaine tire à travers le gouffre
//   ✓ Lecture   : gouffre béant + corniche pleine largeur + télégraphe magenta
//
// Validateur : la traversée O↔E est assurée en gravité normale par la navette
// (3 pseudo-plateformes) ; la corniche-plafond taguée 'gravite_inverse' est
// ignorée par le BFS.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    plateformeMobile, pieuSol
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;          // 500
const Y_CORNICHE = 110;

export const voile_gouffre_pendulaire = {
    id: 'voile_gouffre_pendulaire',
    biome: 'voile_inverse',
    nom: 'Le Gouffre Pendulaire',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['pont', 'hall', 'arene'],
    rolesAutorises: ['main', 'alt'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 16));

        // Sol coupé : gouffre mortel central (320..640).
        plateformes.push(sol(0, 320, Y_SOL));
        plateformes.push(sol(640, W, Y_SOL));

        // Corniche-plafond pleine largeur = pont sûr pendant la phase inversée.
        // Taguée 'gravite_inverse' → BFS l'ignore.
        plateformes.push(plateforme(W / 2, Y_CORNICHE, W, { tags: ['gravite_inverse'] }));

        // Navette : seule traversée O↔E « au sol » (validateur). Un pieu sur
        // chaque île pousse à ne pas traîner près du gouffre.
        const obstacles = [
            plateformeMobile(480, 430, 100, { axe: 'horizontale', amplitude: 130, periode: 3000 }),
            pieuSol(260, Y_SOL),
            pieuSol(700, Y_SOL)
        ];

        // Pendule un peu rapide → tension au-dessus du vide.
        const penduleInversion = { periode: 3000, telegraphMs: 800, depart: 'bas' };

        // Coffre au centre de la corniche (au-dessus du gouffre) : récompense
        // risquée, à saisir puis quitter avant le flip vers le bas.
        const coffreForce = { x: 480, y: 156 };

        // Tireur à distance (gravite:false → insensible au flip), rive est.
        const ennemisForce = [
            { x: 860, y: 460, enemyId: 'voix_lointaine' }
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
