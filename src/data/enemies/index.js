// Catalogue des ennemis — index par biome.
//
// MODÈLE :
//   - 4 archétypes basic actuels (veilleur, traqueur, chargeur, tireur)
//     déclinés en 4-5 variantes par biome.
//   - Phase 3b-3f ajoutera ~6 archétypes innovants par biome (mécaniques
//     nouvelles : Spawner, Anchor, Reflector, Splitter, Cloaker, etc.).
//
// Chaque fichier biome exporte un objet `ENEMIES_<BIOME>` qui est mergé ici
// dans le `ENEMIES` global. Les imports historiques (`from '../data/enemies.js'`)
// continuent de fonctionner via cet index.

import { ENEMIES_RUINES } from './ruines.js';
import { ENEMIES_HALLS } from './halls.js';
import { ENEMIES_CRISTAUX } from './cristaux.js';
import { ENEMIES_VOILE } from './voile.js';
import { ENEMIES_REFLUX } from './reflux.js';

export const ENEMIES = {
    ...ENEMIES_RUINES,
    ...ENEMIES_HALLS,
    ...ENEMIES_CRISTAUX,
    ...ENEMIES_VOILE,
    ...ENEMIES_REFLUX
};

/**
 * Tire un type d'ennemi pour un biome donné.
 * Le pool est filtré par les `etages` autorisés du biome.
 */
export function tirerEnnemiBiome(biome, rng) {
    if (!biome?.ennemisPool?.length) return null;
    const pool = biome.ennemisPool.map(id => ENEMIES[id]).filter(Boolean);
    if (pool.length === 0) return null;
    return pool[Math.floor(rng() * pool.length)];
}

/**
 * Compat — renvoie tous les ennemis d'un étage donné.
 */
export function ennemisPourEtage(etageNumero) {
    return Object.values(ENEMIES).filter(e =>
        e.etages[0] <= etageNumero && etageNumero <= e.etages[1]
    );
}
