// LootSystem — tirage de loot et calcul des stats effectives selon l'équipement.
//
// Ce système est PUR (pas d'état interne). Il prend l'équipement courant et
// retourne des stats effectives. Les bornes de baisse passive et autres tunings
// sont gérés ailleurs (MondeSystem, GameScene) qui interrogent ces stats.

import { ITEMS, CONSOMMABLES, itemsParFamille } from '../data/items.js';
import { VESTIGES } from '../data/vestiges.js';

// Probabilités des familles selon le monde où le coffre est trouvé
export const PROBA_FAMILLE = {
    normal: { blanc: 0.7, bleu: 0.2, noir: 0.1 },
    miroir: { blanc: 0.2, bleu: 0.6, noir: 0.2 }
};

/**
 * Tire un item aléatoire selon le monde où le coffre est ouvert.
 * @param {string} monde 'normal' ou 'miroir'
 * @param {() => number} rng PRNG seedé (renvoie un float [0, 1[)
 */
export function tirerItem(monde, rng) {
    const probas = PROBA_FAMILLE[monde] ?? PROBA_FAMILLE.normal;
    const r = rng();
    let famille;
    if (r < probas.blanc) famille = 'blanc';
    else if (r < probas.blanc + probas.bleu) famille = 'bleu';
    else famille = 'noir';

    const items = itemsParFamille(famille);
    if (items.length === 0) return null;
    return items[Math.floor(rng() * items.length)];
}

/**
 * Tire un consommable aléatoire (drops orphelins au sol).
 */
export function tirerConsommable(rng) {
    const all = Object.values(CONSOMMABLES);
    return all[Math.floor(rng() * all.length)];
}

/**
 * Calcule les stats effectives à partir des stats de base et de l'équipement
 * + des Vestiges équipés (Phase 5b).
 * @param {Object} statsBase   { speed, jumpVelocity, passiveMiroir, passivePresent, bonusRetour, ... }
 * @param {Object} equipement  { tete, corps, accessoire } (itemIds ou null)
 * @param {Object} [vestiges]  { geste, maitrise1, maitrise2 } (vestigeIds ou null)
 * @returns {Object} stats effectives (mêmes clés que statsBase + nouvelles)
 */
export function calculerStats(statsBase, equipement, vestiges = null) {
    const stats = { ...statsBase };

    // Items équipement classique
    for (const slot of ['tete', 'corps', 'accessoire']) {
        const id = equipement[slot];
        if (!id) continue;
        const item = ITEMS[id];
        if (!item) continue;
        for (const eff of item.effets) {
            stats[eff.cible] = (stats[eff.cible] ?? 0) + eff.delta;
        }
    }

    // Vestiges (Phase 5b) — empilent leurs effets additivement
    if (vestiges) {
        for (const slot of ['geste', 'maitrise1', 'maitrise2']) {
            const id = vestiges[slot];
            if (!id) continue;
            const vest = VESTIGES[id];
            if (!vest || !Array.isArray(vest.effets)) continue;
            for (const eff of vest.effets) {
                stats[eff.cible] = (stats[eff.cible] ?? 0) + eff.delta;
            }
        }
    }

    return stats;
}
