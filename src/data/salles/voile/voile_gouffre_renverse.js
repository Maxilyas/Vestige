// Salle : Voile Inversé — Le Gouffre Renversé (OE compact, SIGNATURE)
// (Phase 9.x — Voile Vague 1, colonne d'inversion durcie)
//
// MÉCANIQUE SIGNATURE : colonne de gravité inversée (zone `gravite_inverse`).
// Ici elle n'est plus une simple curiosité (cf. voile_chambre_inversee) mais
// s'insère dans un combat-plateforme à risque réel.
//
// CADRE DESIGN — 5 critères (≈4,5/5) :
//   ✓ Risque    : gouffre LÉTAL central (380..580) sous la navette
//   ✓ Pression  : navette mobile à timer + Larme Tisseuse qui presse la
//                 traversée + Voix Lointaine qui tire depuis la rive est
//   ✓ Choix     : foncer sur la navette (direct, exposé) OU monter par la
//                 colonne d'inversion ouest pour le coffre (détour + combat)
//   ✓ Combat    : 3 flotteurs positionnés qui interagissent avec la traversée
//                 et avec la corniche-récompense
//   ✓ Lecture   : gouffre béant + colonne magenta + navette lisibles d'un coup
//
// La corniche-plafond (SOLIDE, taguée 'gravite_inverse') est le « sol inversé » :
// le joueur s'y pose par en dessous une fois aspiré par la colonne. Le
// validateur BFS (gravité normale) l'ignore — elle n'est atteignable que par
// l'inversion. La traversée O↔E reste validable par la navette.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    plateformeMobile, graviteInverse
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;          // 500

export const voile_gouffre_renverse = {
    id: 'voile_gouffre_renverse',
    biome: 'voile_inverse',
    nom: 'Le Gouffre Renversé',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['pont', 'hall', 'arene'],
    rolesAutorises: ['main', 'alt', 'entree'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));

        // Sol coupé : gouffre mortel central (380..580).
        plateformes.push(sol(0, 380, Y_SOL));
        plateformes.push(sol(580, W, Y_SOL));

        // Corniche d'inversion ouest (SOLIDE) = le « sol inversé ». Taguée
        // 'gravite_inverse' → BFS l'ignore (atteignable seulement par la colonne).
        plateformes.push(plateforme(190, 150, 200, { tags: ['gravite_inverse'] }));

        // Navette dérivante au-dessus du gouffre (seule traversée O↔E « au sol »).
        const obstacles = [
            plateformeMobile(480, 440, 110, { axe: 'horizontale', amplitude: 120, periode: 3000 })
        ];

        // COLONNE d'inversion ouest : net gravité vers le HAUT dedans. On y entre
        // en sautant droit depuis la rive ouest (apogée ~ y434 < bas de zone 440).
        // En sortant latéralement (x<90 ou x>290), on retombe sur la rive ouest.
        const zones = [graviteInverse(90, 140, 200, 300)];

        // Coffre suspendu sous la corniche, au niveau du joueur tête en bas
        // (corniche.bottom 166 + PLAYER_H/2 30 = 196).
        const coffreForce = { x: 190, y: 196 };

        // Flotteurs (gravite:false → insensibles à l'inversion, chassent en 2D).
        const ennemisForce = [
            { x: 480, y: 360, enemyId: 'larme_tisseuse' },                  // presse la navette
            { x: 190, y: 280, enemyId: 'larme_tisseuse', tier: 'elite' },   // conteste la corniche-coffre
            { x: 820, y: 460, enemyId: 'voix_lointaine' }                   // tir à distance, rive est
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes, obstacles, zones, portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 },
            coffreForce, ennemisForce
        };
    }
};
