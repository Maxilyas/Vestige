// Salle : Ruines basses — Impasse E (atelier scellé)
//
// Cul-de-sac avec UNIQUEMENT une porte E. Symétrique de l'impasse O mais
// thématisée "atelier d'artisan" : tables d'établi cassées, ferrailles
// éparses au sol comme plateformes basses. Coffre forcé dans une alcôve
// en hauteur — il faut grimper.
//
// PORTES : E seulement (deadend du graphe).

import {
    HAUTEUR_SOL, sol, plateforme,
    porteE
} from '../_format.js';

const W = 1600;
const H = 900;
const Y_SOL = H - HAUTEUR_SOL;        // 860

export const ruines_impasse_E = {
    id: 'ruines_impasse_E',
    biome: 'ruines_basses',
    nom: 'Atelier scellé (impasse E)',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['E'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['E'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),
            // Ferrailles / tables cassées (plateformes basses atteignables)
            plateforme(280, 800, 110, { oneWay: true }),  // saut 60 depuis sol
            plateforme(500, 770, 90,  { oneWay: true }),
            plateforme(720, 800, 110, { oneWay: true }),
            // Escalier vers l'alcôve coffre (sauts 70 max, gap horiz ≤130)
            plateforme(280, 740, 90, { oneWay: true }),
            plateforme(400, 670, 90, { oneWay: true }),
            plateforme(280, 600, 90, { oneWay: true }),
            plateforme(400, 530, 90, { oneWay: true }),
            plateforme(280, 460, 90, { oneWay: true }),
            // Alcôve en hauteur (coffre), atteignable depuis dernier palier
            plateforme(380, 400, 200, { oneWay: false })
        ];
        const portes = {};
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        return {
            plateformes,
            obstacles: [],
            zones: [],
            portes,
            spawnDefault: { x: W - 80, y: Y_SOL - 20 },
            coffreForce: { x: 380, y: 400 - 12 }
        };
    }
};
