// Salle : Cœur du Reflux — L'Antichambre du Cœur (vue de dessus, OE)
// (Phase 9.x — pré-boss étage 10 ; remplace l'ancienne arène fragmentée 2D)
//
// INTENTION : respiration avant le boss final. Silence visuel, cercle de sigles
// au sol (décoratifs), monolithe de lore au centre. Pas d'ennemi, peu de
// danger : on souffle, on lit, puis on franchit la porte E vers le Cœur.

import {
    HAUTEUR_PORTE,
    mur, porteO, porteE, vestigeLore
} from '../_format.js';

const W = 960;
const H = 540;

export const coeur_antichambre = {
    id: 'coeur_antichambre',
    biome: 'coeur_reflux',
    nom: 'L\'Antichambre du Cœur',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    vue: 'topDown',
    gouffreMort: false,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'crypte', 'arene', 'sanctuaire'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        // Deux pilastres encadrant le passage central (lecture « seuil sacré »).
        const plateformes = [
            mur(W * 0.34, H * 0.18, H * 0.30, { epaisseur: 28 }),
            mur(W * 0.66, H * 0.52, H * 0.30, { epaisseur: 28 })
        ];

        // Monolithe de lore au centre — dernier souffle avant le Cœur.
        const zones = [
            vestigeLore(W / 2, H / 2 + 30, { loreId: 'coeur_antichambre' })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(H / 2 + HAUTEUR_PORTE / 2);
        if (portesActives.includes('E')) portes.E = porteE(W, H / 2 + HAUTEUR_PORTE / 2);

        return {
            plateformes,
            obstacles: [],
            zones,
            portes,
            ennemisForce: [],
            spawnDefault: { x: 80, y: H / 2 }
        };
    }
};
