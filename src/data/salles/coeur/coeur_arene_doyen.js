// Salle : Cœur du Reflux — Le Seuil du Doyen (arène de boss, VUE DE DESSUS, OE)
// (Phase 9.14 — mid-boss étage 9 : Le Doyen)
//
// Arène ouverte : aucun mur interne (le danmaku radial du Doyen a besoin
// d'espace). Le boss trône au CENTRE (placé par GameScene en top-down). Le
// joueur entre par l'Ouest ; la porte Est (verrouillée tant que le boss vit)
// mène à l'étage 10.

import { HAUTEUR_PORTE, porteO, porteE } from '../_format.js';

const W = 960;
const H = 540;

export const coeur_arene_doyen = {
    id: 'coeur_arene_doyen',
    biome: 'coeur_reflux',
    nom: 'Le Seuil du Doyen',
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
