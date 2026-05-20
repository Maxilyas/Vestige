// Salle : Ruines basses — Impasse O (sanctuaire abandonné)
//
// Cul-de-sac avec UNIQUEMENT une porte O (à gauche). Le joueur arrive par
// l'est (depuis le couloir), explore la salle, trouve un coffre forcé en
// récompense pour avoir pris la branche, puis rebrousse chemin.
// Narratif : ancien sanctuaire scellé, autel central, vitraux fragmentés.
//
// PORTES : O seulement (deadend du graphe).

import {
    HAUTEUR_SOL, sol, plateforme, murFissure,
    porteO
} from '../_format.js';

const W = 1600;
const H = 900;
const Y_SOL = H - HAUTEUR_SOL;        // 860

export const ruines_impasse_O = {
    id: 'ruines_impasse_O',
    biome: 'ruines_basses',
    nom: 'Sanctuaire abandonné (impasse O)',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['O'],
    archetypesCompatibles: ['sanctuaire', 'crypte'],

    generer({ portesActives = ['O'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),
            // Marches montant vers l'autel central (saut 70 max)
            plateforme(450,  790, 110, { oneWay: true }),
            plateforme(W - 450, 790, 110, { oneWay: true }),
            plateforme(550,  720, 110, { oneWay: true }),
            plateforme(W - 550, 720, 110, { oneWay: true }),
            // Autel central surélevé (atteignable depuis les marches)
            plateforme(W / 2, 660, 320, { oneWay: false }),
            // 2 corniches hautes décoratives (depuis autel : saut 60 vert, edges autel 640..960 → corniches doivent être plus proches)
            plateforme(640,    600, 140, { oneWay: true }),
            plateforme(W - 640, 600, 140, { oneWay: true })
        ];
        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);

        // Mur fissuré devant l'autel : il faut casser pour atteindre le coffre.
        // Force le joueur à utiliser son attaque (X) sur du décor — apprentissage
        // que le terrain peut être altéré.
        const obstacles = [
            murFissure(W / 2 - 180, 650, { largeur: 30, hauteur: 110, hp: 3 })
        ];

        return {
            plateformes,
            obstacles,
            zones: [],
            portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 },
            // Coffre garanti sur l'autel central — récompense d'exploration
            coffreForce: { x: W / 2, y: 660 - 12 }
        };
    }
};
