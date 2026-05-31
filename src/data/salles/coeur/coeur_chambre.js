// Salle : Cœur du Reflux — La Chambre du Cœur (arène finale, VUE DE DESSUS, OE)
// (Phase 9.15 — boss final étage 10 : Le Cœur. Mort → cinématique de fin.)
//
// Arène circulaire ouverte. Le Cœur pulse au CENTRE (placé par GameScene). À sa
// mort, `boss.def.etage === 10` déclenche `lancerCinematiqueFin` (déjà câblé
// dans GameScene) → FinScene. Pas de mur interne (danmaku dense en phase 3).

import { HAUTEUR_PORTE, porteO, porteE } from '../_format.js';

const W = 960;
const H = 540;

export const coeur_chambre = {
    id: 'coeur_chambre',
    biome: 'coeur_reflux',
    nom: 'La Chambre du Cœur',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    vue: 'topDown',
    gouffreMort: false,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['arene'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(H / 2 + HAUTEUR_PORTE / 2);
        if (portesActives.includes('E')) portes.E = porteE(W, H / 2 + HAUTEUR_PORTE / 2);
        return {
            plateformes: [],
            obstacles: [],
            zones: [],
            portes,
            spawnDefault: { x: 80, y: H / 2 }
        };
    }
};
