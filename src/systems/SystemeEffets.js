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
 * Utilisé par les systèmes qui veulent consulter "ai-je le proc X ?".
 *
 * @returns {Object} flags { flagName: { def, params, source: slot } }
 */
export function flagsExotiquesActifs(equipement) {
    const flags = {};
    for (const slot of ['tete', 'corps', 'accessoire']) {
        const entry = equipement[slot];
        if (!estInstance(entry)) continue;
        for (const exoId of entry.affixesExo) {
            const def = EXOTIQUES[exoId];
            if (!def) continue;
            flags[def.flag] = { def, params: def, source: slot, instance: entry };
        }
        if (entry.signatureId) {
            const sigDef = SIGNATURES[entry.signatureId];
            if (sigDef) {
                flags[sigDef.flag] = { def: sigDef, params: sigDef.params, source: slot, instance: entry, signature: true };
            }
        }
    }
    return flags;
}

/**
 * Bonus Résonance MAX provenant de l'équipement (signature/exotique).
 * S'ajoute à la base ResonanceSystem (100) et au bonus Vestige.
 */
export function bonusResonanceMax(equipement) {
    let bonus = 0;
    const flags = flagsExotiquesActifs(equipement);
    if (flags.mod_resonance_max) {
        bonus += flags.mod_resonance_max.params.bonus ?? 15;
    }
    return bonus;
}
