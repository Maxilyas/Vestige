// Salle : Voile Inversé — La Nef Renversée (NSEO compact, RÉCURRENCE)
// (Phase 9.x — Voile Vague 1, salle d'identité multi-config)
//
// BUT : porter l'identité « inversion » du biome dans TOUTES les configs de
// portes. `portesPossibles: NSEO` → matche n'importe quelle combinaison
// demandée par le spanning tree (un superset valide tout) ⇒ cette salle peut
// sortir partout (OE, NS, coins, T, deadends), assurant la RÉCURRENCE de la
// mécanique d'inversion dans l'étage.
//
// DESIGN : structure climbable classique (nef ascendante vers la porte N) qui
// connecte toutes les portes en gravité NORMALE (validateur-safe, jamais de
// soft-lock quelle que soit la config). L'inversion est une FEATURE non
// load-bearing : une colonne `gravite_inverse` à l'extrême ouest hisse vers une
// corniche-coffre. La traversée des portes ne dépend JAMAIS de l'inversion.
//
// CADRE DESIGN — salle de transit/identité (pas une signature « puzzle ») :
//   ✓ Combat    : 2 Larmes Tisseuses harcèlent
//   ✓ Lecture   : nef ascendante + colonne magenta ouest distinctes
//   ✓ Récompense: coffre au sommet de la colonne (inversion optionnelle)

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteS, porteO, porteE,
    graviteInverse
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;          // 500

export const voile_nef_renversee = {
    id: 'voile_nef_renversee',
    biome: 'voile_inverse',
    nom: 'La Nef Renversée',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['hall', 'arene', 'pont'],
    rolesAutorises: ['main', 'alt', 'entree'],
    tirageWeight: 2,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        // Voûte fendue au centre pour laisser passer la porte N.
        plateformes.push(plafondCathedrale(60, 410, 18));
        plateformes.push(plafondCathedrale(550, W - 60, 18));

        // Sol plein continu : O↔E trivial, base de la nef.
        plateformes.push(sol(0, W, Y_SOL));

        // Nef ascendante (oneWay) vers la porte N centrale. Symétrique G/D pour
        // que toute config de portes reste connectée en gravité normale.
        plateformes.push(plateforme(220, 416, 120, { oneWay: true }));  // bas G
        plateformes.push(plateforme(740, 416, 120, { oneWay: true }));  // bas D
        plateformes.push(plateforme(380, 344, 120, { oneWay: true }));  // mid G
        plateformes.push(plateforme(580, 344, 120, { oneWay: true }));  // mid D
        plateformes.push(plateforme(480, 268, 170, { oneWay: true }));  // hub central
        plateformes.push(plateforme(480, 184, 140, { oneWay: true }));
        plateformes.push(plateforme(480, 104, 130, { oneWay: true }));  // sous porte N
        // Palier de la porte S (descente centrale, atteignable depuis le sol).
        plateformes.push(plateforme(480, 444, 130, { oneWay: true }));

        // Corniche-coffre d'inversion (extrême ouest, canal vertical dégagé,
        // hors de la nef). Taguée 'gravite_inverse' → BFS l'ignore.
        plateformes.push(plateforme(85, 70, 130, { tags: ['gravite_inverse'] }));

        // Colonne d'inversion ouest : on y entre en sautant depuis le sol ; en
        // sortant latéralement (x<30 ou x>140) on retombe sur le sol ouest.
        const zones = [graviteInverse(30, 100, 110, 340)];

        // Coffre sous la corniche ouest (joueur tête en bas : bottom 86 + 30).
        const coffreForce = { x: 85, y: 116 };

        // Harceleurs flottants (insensibles à l'inversion, chassent en 2D).
        const ennemisForce = [
            { x: 300, y: 300, enemyId: 'larme_tisseuse' },
            { x: 660, y: 300, enemyId: 'larme_tisseuse' }
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('N')) portes.N = porteN(480, 28);
        if (portesActives.includes('S')) portes.S = porteS(480, 444);

        return {
            plateformes, obstacles: [], zones, portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 },
            coffreForce, ennemisForce
        };
    }
};
