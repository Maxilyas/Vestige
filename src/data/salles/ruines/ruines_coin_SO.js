// Salle : Ruines basses — Coin SO (cave d'effondrement)
//
// Coin L inversé : entrée par l'OUEST (côté gauche, sol), sortie par le
// SUD (en bas vers les caves). Le joueur descend par une fosse / éboulis.
// Narratif : un mur s'est effondré, créant un passage vers les niveaux
// inférieurs des ruines.
//
// PORTES : O (sol gauche) et S (sol, côté gauche).

import {
    HAUTEUR_SOL, sol, plateforme, eboulis,
    porteO, porteS
} from '../_format.js';

const W = 1600;
const H = 900;
const Y_SOL = H - HAUTEUR_SOL;        // 860

export const ruines_coin_SO = {
    id: 'ruines_coin_SO',
    biome: 'ruines_basses',
    nom: 'Coin SO (cave d\'effondrement)',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['O', 'S'],
    archetypesCompatibles: ['crypte', 'hall'],

    generer({ portesActives = ['O', 'S'] } = {}) {
        // Plateformes accessibles depuis le sol (saut max 96 vert, 130 horiz
        // edge-to-edge). Y_SOL=860. Pour rester atteignables :
        //   - 1er niveau yTop=790 (saut 70 depuis sol ✓)
        //   - 2e niveau yTop=720 (saut 70 depuis 1er ✓)
        //   - 3e niveau yTop=650 (saut 70 depuis 2e ✓)
        // Largeur 110, centres séparés de ≤210 (edge-to-edge ≤100, safe).
        const plateformes = [
            sol(0, W, Y_SOL),
            // 1er niveau — chemin "voûtes basses" accessible direct depuis sol
            plateforme(200,  790, 110, { oneWay: true }),
            plateforme(400,  790, 110, { oneWay: true }),
            plateforme(600,  790, 110, { oneWay: true }),
            plateforme(820,  790, 110, { oneWay: true }),
            plateforme(1020, 790, 110, { oneWay: true }),
            plateforme(1220, 790, 110, { oneWay: true }),
            plateforme(1420, 790, 110, { oneWay: true }),
            // 2e niveau — mezzanine intermédiaire
            plateforme(310,  720, 110, { oneWay: true }),
            plateforme(520,  720, 110, { oneWay: true }),
            plateforme(720,  720, 110, { oneWay: true }),
            plateforme(920,  720, 110, { oneWay: true }),
            plateforme(1120, 720, 110, { oneWay: true }),
            plateforme(1320, 720, 110, { oneWay: true }),
            // 3e niveau — combat haut (sentinelles)
            plateforme(420,  650, 130, { oneWay: true }),
            plateforme(700,  650, 130, { oneWay: true }),
            plateforme(980,  650, 130, { oneWay: true }),
            plateforme(1280, 650, 130, { oneWay: true })
        ];
        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('S')) portes.S = porteS(380, Y_SOL);

        // Cave d'effondrement : 2 tas de gravats bloquent partiellement le sol.
        // Le joueur doit les briser pour passer librement (ou contourner par
        // les voûtes du dessus).
        const obstacles = [
            // Éboulis hauts (110 px) pour empêcher le saut par-dessus.
            // yTop = Y_SOL - 110 → l'éboulis repose pile sur le sol.
            eboulis(620, Y_SOL - 110, { largeur: 100, hp: 3, dropSel: true }),
            eboulis(1000, Y_SOL - 110, { largeur: 90, hp: 3 })
        ];

        return {
            plateformes,
            obstacles,
            zones: [],
            portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
