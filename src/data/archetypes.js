// Archétypes de salle — THÈMES seulement (refonte Phase 2a).
//
// Avant Phase 2a, l'archétype portait à la fois le thème (Sanctuaire, Hall…)
// ET la structure physique (dims, plateformes, portes). Découplage maintenant :
//   - L'archétype = thème (id, nom, sert au décor et au pool d'ennemis)
//   - La topographie (cf. data/topographies.js) = structure physique
//
// L'archétype n'a donc plus de `dimensions`, `genererPlateformes`, ou
// `portesPossibles` — tout cela vit dans la topographie compatible choisie
// par EtageGen.

import { PLAYER } from '../config.js';
import {
    HAUTEUR_SOL, LARGEUR_PORTE, HAUTEUR_PORTE,
    LARGEUR_VORTEX, HAUTEUR_VORTEX
} from './topographies.js';

// ============================================================
// CATALOGUE
// ============================================================
export const ARCHETYPES = {
    sanctuaire: {
        id: 'sanctuaire',
        nom: 'Sanctuaire',
        niveauxAssocies: [0]
    },
    hall: {
        id: 'hall',
        nom: 'Hall des Échos',
        niveauxAssocies: [1, 2]
    },
    crypte: {
        id: 'crypte',
        nom: 'Crypte des Murmures',
        niveauxAssocies: [2]
    },
    pont: {
        id: 'pont',
        nom: 'Pont Suspendu',
        niveauxAssocies: [2, 3]
    },
    puits: {
        id: 'puits',
        nom: 'Puits Inversé',
        niveauxAssocies: [3]
    },
    arene: {
        id: 'arene',
        nom: 'Arène du Reflux',
        niveauxAssocies: [3]
    }
};

/**
 * Position de spawn du joueur depuis une porte donnée. Lit `porte.interieur`
 * pour décider de quel côté placer le joueur — et toujours POSÉ sur le
 * palier qui supporte la porte (le bas du joueur s'aligne avec le bas
 * de la porte = top du palier support).
 *
 * Pourquoi posé : si on spawne le joueur "centré sur la porte" ou "au-dessus
 * en l'air", son corps (60 px) chevauche les plateformes adjacentes et la
 * physique le pose dessus à la première frame (bug "spawn sur plateforme
 * au-dessus de la porte d'arrivée" observé sur les salles compactes Ruines).
 *
 *   - 'gauche'  : à gauche de la porte (porte E)
 *   - 'droite'  : à droite de la porte (porte O)
 *   - 'bas'     : à droite de la porte (porte N — joueur arrive du nord)
 *   - 'haut'    : à droite de la porte (porte S — joueur arrive du sud)
 *
 * Pour les portes verticales, le décalage horizontal sort le joueur de la
 * zone X de la porte — il peut se déplacer librement sans re-trigger.
 */
export function spawnDepuisPorte(porte) {
    if (!porte) return null;
    const halfH = porte.hauteur / 2;
    const halfW = porte.largeur / 2;
    const halfPlayerH = PLAYER.HEIGHT / 2;
    const bufferLat = 24;
    const decalageX = halfW + 24;

    // Bas du joueur posé sur le top du palier support de la porte.
    const yPose = porte.y + halfH - halfPlayerH;

    if (porte.interieur === 'gauche') return { x: porte.x - halfW - bufferLat, y: yPose };
    if (porte.interieur === 'droite') return { x: porte.x + halfW + bufferLat, y: yPose };
    if (porte.interieur === 'bas')    return { x: porte.x + decalageX,         y: yPose };
    if (porte.interieur === 'haut')   return { x: porte.x + decalageX,         y: yPose };
    return { x: porte.x, y: porte.y };
}

/** Direction opposée à une direction donnée. */
export function directionOpposee(direction) {
    return { N: 'S', S: 'N', E: 'O', O: 'E' }[direction] ?? null;
}

// Constantes ré-exportées pour les modules qui les consommaient via archetypes.js
export const VORTEX_DIMS = { largeur: LARGEUR_VORTEX, hauteur: HAUTEUR_VORTEX };
export const HAUTEUR_SOL_EXPORT = HAUTEUR_SOL;
export { LARGEUR_PORTE, HAUTEUR_PORTE };
