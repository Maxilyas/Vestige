// Salle : Voile Inversé — L'Autel Renversé (OE compact, SIGNATURE)
// (Phase 9.x — Voile Vague 1, colonne d'inversion durcie)
//
// MÉCANIQUE SIGNATURE : colonne de gravité inversée centrale qui hisse le
// joueur vers un AUTEL suspendu (coffre) sous la voûte. Variante « verticale »
// du Gouffre Renversé : ici le danger est au SOL (champ de pieux) et la colonne
// est un refuge-récompense qu'il faut mériter en lâchant le sol.
//
// CADRE DESIGN — 5 critères (≈3,5/5) :
//   ✓ Risque    : champ de pieux qui force le mouvement constant au sol
//   ✓ Pression  : Rage du Voile (chargeur) balaie le sol + pieux contraignent
//                 la trajectoire
//   ✓ Combat    : 2 flotteurs positionnés (sol + autel)
//   ✓ Lecture   : pieux + colonne magenta centrale lisibles d'un coup
//   ~ Choix     : prendre l'autel-coffre (lâcher le sol, exposition) ou filer
//
// L'autel (SOLIDE, tagué 'gravite_inverse') est le « sol inversé ». Le
// validateur BFS l'ignore. La traversée O↔E reste triviale (sol plein continu)
// — la colonne est une récompense optionnelle, pas un passage obligé.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    pieuSol, graviteInverse
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;          // 500

export const voile_autel_renverse = {
    id: 'voile_autel_renverse',
    biome: 'voile_inverse',
    nom: 'L\'Autel Renversé',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'arene', 'sanctuaire'],
    rolesAutorises: ['main', 'alt', 'entree'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));

        // Sol plein continu : traversée O↔E toujours possible (chemin sûr).
        plateformes.push(sol(0, W, Y_SOL));

        // Autel suspendu (SOLIDE) = le « sol inversé ». Tagué 'gravite_inverse'
        // → atteignable seulement par la colonne (BFS l'ignore).
        plateformes.push(plateforme(480, 150, 220, { tags: ['gravite_inverse'] }));

        // Champ de pieux : 2 grappes qui forcent le mouvement. Entrées de portes
        // et axe de la colonne (370..590) laissés libres (zones safe).
        const obstacles = [
            pieuSol(220, Y_SOL), pieuSol(280, Y_SOL),
            pieuSol(680, Y_SOL), pieuSol(740, Y_SOL)
        ];

        // COLONNE d'inversion centrale : net gravité vers le HAUT dedans. On y
        // entre en sautant droit (apogée ~ y434 < bas de zone 440). En sortant
        // latéralement (x<370 ou x>590), on retombe sur le sol entre les grappes.
        const zones = [graviteInverse(370, 140, 220, 300)];

        // Coffre sous l'autel, au niveau du joueur tête en bas (autel.bottom 166
        // + PLAYER_H/2 30 = 196).
        const coffreForce = { x: 480, y: 196 };

        // Flotteurs (gravite:false → insensibles à l'inversion, chassent en 2D).
        const ennemisForce = [
            { x: 700, y: 450, enemyId: 'rage_du_voile' },                 // chargeur balaie le sol
            { x: 480, y: 290, enemyId: 'larme_tisseuse', tier: 'elite' }  // conteste l'autel-coffre
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
