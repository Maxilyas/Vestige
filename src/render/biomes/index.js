// Dispatcher de composition parallax par biome.
//
// Chaque biome enrichi fournit son propre composer qui pose ses couches
// parallax signature (en plus / au lieu des silhouettes lointaines génériques).
// Pour les biomes pas encore enrichis, on tombe sur le fallback générique.
//
// Côté Miroir, le biome est ignoré : la Cité a son décor propre.

import { poserSilhouettesLointaines } from '../Parallaxe.js';
import { composerParallaxRuinesBasses } from './RuinesBasses.js';
import { composerParallaxHallsCendres } from './HallsCendres.js';

const COMPOSERS = {
    ruines_basses: composerParallaxRuinesBasses,
    halls_cendres: composerParallaxHallsCendres
    // cristaux_glaces, voile_inverse, coeur_reflux — à venir
};

/**
 * Compose les couches parallax adaptées au biome courant.
 * Renvoie le tableau des objets posés (pour cleanup éventuel).
 */
export function composerParallaxBiome(scene, dims, monde, rng, biomeId) {
    // Miroir : la Cité a son décor dédié, on garde les silhouettes génériques
    // (qui se justifient comme silhouettes urbaines lointaines).
    if (monde === 'miroir') {
        return poserSilhouettesLointaines(scene, dims, monde, rng);
    }

    const composer = COMPOSERS[biomeId];
    if (composer) return composer(scene, dims, monde, rng);

    // Biome pas encore enrichi → fallback générique
    return poserSilhouettesLointaines(scene, dims, monde, rng);
}
