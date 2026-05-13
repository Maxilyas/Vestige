// LootSystem — tirage de loot et calcul des stats effectives selon l'équipement.
//
// Ce système est PUR (pas d'état interne). Il prend l'équipement courant et
// retourne des stats effectives. Les bornes de baisse passive et autres tunings
// sont gérés ailleurs (MondeSystem, GameScene) qui interrogent ces stats.
//
// Phase 6 : cohabitation legacy items (strings) + instances forgées (objets).
// Les calculs additionnent les deux séries de bonus.

import { CONSOMMABLES } from '../data/items.js';
import { VESTIGES } from '../data/vestiges.js';
import { genererInstance } from './ItemForge.js';
import { estInstance } from './ScoreSystem.js';

// Probabilités des familles selon le monde où le coffre est trouvé
export const PROBA_FAMILLE = {
    normal: { blanc: 0.7, bleu: 0.2, noir: 0.1 },
    miroir: { blanc: 0.2, bleu: 0.6, noir: 0.2 }
};

/**
 * Tire un item Phase 6 — TOUJOURS une instance forgée.
 * Le système legacy a été retiré (les data/items.js servent encore aux Vestiges,
 * mais ne sont plus jamais dropés ni intégrés dans les inventaires).
 *
 * Le score est skewed selon le contexte :
 *   'sol'   — coffre / drop ennemi : mean ~35, queue jusqu'à 95
 *   'boss'  — drop boss : mean ~75, jackpot 95+ à 10 %
 *   'forge' — forge fragments / combinaison : variance autour de scoreBase
 *
 * @param {string} monde 'normal' ou 'miroir'
 * @param {() => number} rng PRNG seedé
 * @param {Object} opts { etage, forceInstance, contexte, scoreBase, slot }
 * @returns {Object|null} instance Phase 6
 */
export function tirerItem(monde, rng, opts = {}) {
    const { etage = 1, contexte = 'sol', scoreBase = 50, slot = null } = opts;
    const probas = PROBA_FAMILLE[monde] ?? PROBA_FAMILLE.normal;
    const r = rng();
    let famille;
    if (r < probas.blanc) famille = 'blanc';
    else if (r < probas.blanc + probas.bleu) famille = 'bleu';
    else famille = 'noir';

    // Bonus de score selon étage — pour les drops 'sol' on part bas (étage 1
    // ≈ Brisé/Commun) et on monte à +30 d'étage 10 (≈ Spectral). Pour les autres
    // contextes (boss / forge) la base est déjà calibrée par l'appelant.
    let baseAjustee = scoreBase;
    if (contexte === 'sol') {
        const baseEtage1 = 25;
        const incrementParEtage = 3;
        baseAjustee = baseEtage1 + (Math.max(1, etage) - 1) * incrementParEtage;
    } else {
        // Boss / forge : on garde scoreBase + un petit boost étage
        baseAjustee = scoreBase + Math.max(0, (etage - 1) * 2);
    }

    return genererInstance({ famille, slot, contexte, scoreBase: baseAjustee, rng });
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
 * + des Vestiges équipés (Phase 5b) + des affixes Phase 6.
 *
 * @param {Object} statsBase   { speed, jumpVelocity, passiveMiroir, ... }
 * @param {Object} equipement  { tete, corps, accessoire } (itemIds OU instances)
 * @param {Object} [vestiges]  { geste, maitrise1, maitrise2 } (vestigeIds ou null)
 * @returns {Object} stats effectives (mêmes clés que statsBase + nouvelles)
 */
export function calculerStats(statsBase, equipement, vestiges = null) {
    const stats = { ...statsBase };

    // Phase 6 — uniquement les instances forgées. Les stats Phase 6 spécifiques
    // (armure, gardeMax, etc.) sont calculées séparément par SystemeEffets.
    // Ici on ne s'occupe que des stats legacy (speed, attaqueDegats, etc.)
    // pour rester compatible avec le reste du gameplay GameScene.

    // Vestiges — empilent leurs effets additivement (inchangé)
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
