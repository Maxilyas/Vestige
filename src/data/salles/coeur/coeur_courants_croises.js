// Salle : Cœur du Reflux — Les Courants Croisés (vue de dessus, OE)
// (Phase 9.11 — démo des obstacles top-down : courant_reflux + zone_oubli)
//
// INTENTION : enseigner les courants. Une bande de courant médiane pousse vers
// l'Est (on peut se laisser porter de O→E) ; un courant vertical et une zone
// d'oubli en marge offrent de quoi expérimenter sans punir le transit. Non
// létal — la lecture (sens du flux, nappe grise) prime sur le danger.

import {
    HAUTEUR_PORTE,
    mur, porteO, porteE,
    courantReflux, zoneOubli
} from '../_format.js';

const W = 960;
const H = 540;

export const coeur_courants_croises = {
    id: 'coeur_courants_croises',
    biome: 'coeur_reflux',
    nom: 'Les Courants Croisés',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    vue: 'topDown',
    gouffreMort: false,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'crypte', 'pont', 'arene'],
    unique: true,
    rolesAutorises: ['main', 'alt', 'entree'],
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        // Un bloc de pierre bas pour tester la collision sans bloquer le transit.
        const plateformes = [
            mur(W * 0.50, H * 0.62, H * 0.30, { epaisseur: 30 })
        ];

        const obstacles = [
            // Courant médian : pousse vers l'EST (on se laisse porter O→E).
            courantReflux(250, 215, 380, 110, { dir: { x: 1, y: 0 }, force: 150 }),
            // Courant vertical côté droit : pousse vers le BAS (croisement).
            courantReflux(640, 110, 130, 320, { dir: { x: 0, y: 1 }, force: 130 }),
            // Zone d'oubli en marge (haut-droite) : tech-démo « tu n'es plus rien ».
            zoneOubli(830, 70, 110, 120)
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(H / 2 + HAUTEUR_PORTE / 2);
        if (portesActives.includes('E')) portes.E = porteE(W, H / 2 + HAUTEUR_PORTE / 2);

        return {
            plateformes,
            obstacles,
            zones: [],
            portes,
            ennemisForce: [],
            spawnDefault: { x: 70, y: H / 2 }
        };
    }
};
