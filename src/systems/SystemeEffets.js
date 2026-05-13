// SystemeEffets — calcule les stats effectives Phase 6 depuis l'équipement.
//
// Étend `LootSystem.calculerStats` (legacy) avec les stats Phase 6 (gardeMax,
// gardeRegen, attaqueVitesse, parryFenetre, sautHauteur, armure). Applique les
// diminishing returns via `calculerEffectif`.
//
// Retourne un OBJET de stats effectives Phase 6 séparé, pour que `GardeSystem`
// et le combat puissent y lire directement leurs valeurs.

import { STATS, STATS_IDS, calculerEffectif } from '../data/stats.js';
import { estInstance } from './ScoreSystem.js';
import { EXOTIQUES } from '../data/affixes.js';
import { SIGNATURES } from '../data/signatures.js';

/**
 * Somme les affixes primaires Phase 6 portés par l'équipement.
 * @param {Object} equipement { tete, corps, accessoire } — strings legacy OU instances
 * @returns {Object} stats brutes (sommes) puis effectives (après diminishing)
 */
export function calculerStatsForge(equipement) {
    const bruts = {};
    for (const s of STATS_IDS) bruts[s] = 0;

    for (const slot of ['tete', 'corps', 'accessoire']) {
        const entry = equipement[slot];
        if (!estInstance(entry)) continue;
        for (const aff of entry.affixesPrim) {
            if (bruts[aff.statId] === undefined) bruts[aff.statId] = 0;
            bruts[aff.statId] += aff.delta;
        }
    }

    // Applique diminishing returns
    const effectifs = {};
    for (const s of STATS_IDS) {
        effectifs[s] = calculerEffectif(s, bruts[s]);
    }
    return { bruts, effectifs };
}

/**
 * Recense les flags exotiques + signatures actifs depuis l'équipement.
 * Phase 6 — Le STACKING est désormais pris en compte : deux items portant
 * le même flag (ex: deux "Cœur dilaté") s'additionnent.
 *
 * @returns {Object} flags { flagName: { def, params, count, sources, instance } }
 *   - count    : nombre total d'occurrences (pour additionner les bonus passifs)
 *   - sources  : liste des slots qui portent le flag (ex: ['tete', 'accessoire'])
 *   - instance : dernière instance vue (rétro-compat)
 */
export function flagsExotiquesActifs(equipement) {
    const flags = {};
    const ajouter = (flag, def, params, slot, entry, isSig = false) => {
        if (!flags[flag]) {
            flags[flag] = { def, params, count: 0, sources: [], instance: entry, signature: isSig };
        }
        flags[flag].count += 1;
        flags[flag].sources.push(slot);
        flags[flag].instance = entry; // garde la dernière vue
    };
    for (const slot of ['tete', 'corps', 'accessoire']) {
        const entry = equipement[slot];
        if (!estInstance(entry)) continue;
        for (const exoId of entry.affixesExo) {
            const def = EXOTIQUES[exoId];
            if (!def) continue;
            ajouter(def.flag, def, def, slot, entry, false);
        }
        if (entry.signatureId) {
            const sigDef = SIGNATURES[entry.signatureId];
            if (sigDef) {
                ajouter(sigDef.flag, sigDef, sigDef.params, slot, entry, true);
            }
        }
    }
    return flags;
}

/**
 * Bonus Résonance MAX provenant de l'équipement (signature/exotique). Stacke
 * pour autant d'items "Cœur dilaté" équipés.
 */
export function bonusResonanceMax(equipement) {
    let bonus = 0;
    const flags = flagsExotiquesActifs(equipement);
    if (flags.mod_resonance_max) {
        const parItem = flags.mod_resonance_max.params.bonus ?? 15;
        bonus += parItem * flags.mod_resonance_max.count;
    }
    return bonus;
}
