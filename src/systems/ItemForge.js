// ItemForge — génération paramétrique d'instances d'items Phase 6.
//
// Utilisé par :
//   - LootSystem (drop coffre / boss)
//   - CraftingSystem (forge fragments / combinaison items / reroll)
//
// Une "instance" est un objet sérialisable dans le registry (cf. ScoreSystem).
// Le tirage est ENTIÈREMENT déterministe pour un RNG donné — important pour
// la reproductibilité des seeds de run, et le preview avant forge.

import { STATS, STATS_IDS } from '../data/stats.js';
import { tirerExotiques, EXOTIQUES } from '../data/affixes.js';
import { TEMPLATES, getTemplate, tirerTemplate } from '../data/templatesItems.js';
import { tirerSignature, signaturesParSlot } from '../data/signatures.js';
import { tierPourScore, tirerScoreDrop, genererUid, estInstance } from './ScoreSystem.js';
import { COULEURS_FAMILLE, ITEMS } from '../data/items.js';

/**
 * Crée une instance d'item Phase 6 selon les paramètres.
 *
 * @param {Object} opts
 *   - templateId : forcer un template (sinon tiré aléatoirement)
 *   - slot       : contraindre le slot
 *   - famille    : contraindre la famille
 *   - score      : forcer un score (sinon calculé via contexte)
 *   - contexte   : 'sol' / 'boss' / 'forge' (pour tirerScoreDrop)
 *   - scoreBase  : pour 'forge', score de base autour duquel varier
 *   - rng        : PRNG (Math.random par défaut)
 * @returns {Object} instance (cf. ScoreSystem doc)
 */
export function genererInstance(opts = {}) {
    const {
        templateId = null,
        slot = null,
        famille = null,
        score: scoreForce = null,
        contexte = 'sol',
        scoreBase = 50,
        rng = Math.random
    } = opts;

    // 1) Template
    let template;
    if (templateId && TEMPLATES[templateId]) {
        template = TEMPLATES[templateId];
    } else {
        template = tirerTemplate(rng, { slot, famille });
    }

    // 2) Score
    const score = Math.round(
        scoreForce !== null ? scoreForce : tirerScoreDrop(contexte, rng, scoreBase)
    );
    const tier = tierPourScore(score);

    // 3) Affixes primaires — tirés selon les biais du template, intensité selon score
    const affixesPrim = tirerAffixesPrimaires(template, tier.nbPrimaires, score, rng);

    // 4) Affixes exotiques
    const affixesExo = tier.nbExotiques > 0
        ? tirerExotiques(tier.nbExotiques, score, rng)
        : [];

    // 5) Sort — chance graduelle selon score
    let sortId = null;
    if (tier.peutSort && template.sorts.length > 0) {
        const chanceSort = score >= 90 ? 1 : (score - 70) / 20; // 0 à 70, 1 à 90+
        if (rng() < chanceSort) {
            sortId = template.sorts[Math.floor(rng() * template.sorts.length)];
        }
    }

    // 6) Signature (uniquement score >= 95)
    let signatureId = null;
    if (tier.peutSignature) {
        const sig = tirerSignature(template.slot, rng);
        if (sig) signatureId = sig.id;
    }

    return {
        _instance: true,
        uid: genererUid(),
        templateId: template.id,
        score,
        affixesPrim,
        affixesExo,
        sortId,
        signatureId,
        revele: { prim: [], exo: [], sort: false, signature: false },
        compteurs: { hits: 0, parries: 0, sauts: 0, sorts: 0, temps: 0 }
    };
}

/**
 * Tire N affixes primaires selon les biais du template.
 * L'intensité (delta) scale avec le score : plus le score est haut, plus on
 * tape vers le max de la plage.
 */
function tirerAffixesPrimaires(template, nb, score, rng) {
    const biais = template.biais || {};
    const statsBiaisees = Object.keys(biais).filter(s => STATS[s]);

    // Pool pondéré
    const pool = statsBiaisees.map(s => ({ stat: s, poids: biais[s] }));
    // Bonus : ajoute toutes les autres stats avec poids 1 (faible chance)
    for (const s of STATS_IDS) {
        if (!biais[s]) pool.push({ stat: s, poids: 0.5 });
    }

    const affixes = [];
    const statsUtilisees = new Set();
    const intensite = Math.min(1, score / 100); // 0 à 1

    for (let i = 0; i < nb && pool.length > 0; i++) {
        // Tirage pondéré
        const poolFiltre = pool.filter(p => !statsUtilisees.has(p.stat));
        if (poolFiltre.length === 0) break;
        const total = poolFiltre.reduce((s, p) => s + p.poids, 0);
        let r = rng() * total;
        let choisi = poolFiltre[0];
        for (const p of poolFiltre) {
            r -= p.poids;
            if (r <= 0) { choisi = p; break; }
        }
        statsUtilisees.add(choisi.stat);

        const def = STATS[choisi.stat];
        // Delta : interpolation entre min et max selon intensité, + 30 % de variance
        const variance = 0.7 + rng() * 0.6;
        const deltaBrut = (def.min + (def.max - def.min) * intensite) * variance;
        const delta = Math.max(def.min, Math.min(def.max, Math.round(deltaBrut * 10) / 10));

        affixes.push({ statId: choisi.stat, delta });
    }
    return affixes;
}

// ============================================================
// RÉSOLUTION : transformer une entrée d'inventaire en def affichable
// ============================================================

/**
 * Normalise une entrée d'inventaire (legacy string ou instance Phase 6) en
 * objet "def" utilisable par l'UI et les calculs de stats. Ne mute pas
 * l'instance ; calcule des champs dérivés (nom, famille, slot, etc.).
 *
 * Champs du def normalisé :
 *   { id, nom, slot, famille, tier, description, effets, categorie }
 * Phase 6 :
 *   + instance: l'instance brute
 *   + score, tierId, couleur
 *   + signatureId, signature (def)
 *   + sortId, sort (def)
 *
 * Retourne null si l'entrée est invalide.
 */
export function resolveItemDef(entry) {
    if (entry === null || entry === undefined) return null;

    // Phase 6 — instance
    if (estInstance(entry)) {
        const tpl = getTemplate(entry.templateId);
        if (!tpl) return null;
        const tier = tierPourScore(entry.score);
        // Construit la liste d'effets compatibles avec l'ancien format (pour
        // que `calculerStats` legacy continue de marcher) — mais aussi les
        // affixes typés primaires/exotiques pour la nouvelle UI.
        return {
            id: entry.uid,
            instance: entry,
            templateId: tpl.id,
            nom: tpl.nom,
            slot: tpl.slot,
            famille: tpl.famille,
            tier: tierToLegacyTier(entry.score),
            tierId: tier.id,
            tierNom: tier.nom,
            score: entry.score,
            description: descriptionInstance(entry, tpl),
            // Catégorie distincte du Vestige et de l'item legacy
            categorie: 'forge',
            affixesPrim: entry.affixesPrim,
            affixesExo: entry.affixesExo,
            sortId: entry.sortId,
            signatureId: entry.signatureId,
            // Compatibilité legacy : effets[] pour calculerStats existant
            // (on convertit les primaires révélés en deltas — visible:true).
            effets: entry.affixesPrim.map((a, i) => ({
                cible: legacyStatCible(a.statId),
                delta: legacyStatDelta(a.statId, a.delta),
                visible: entry.revele.prim.includes(i)
            }))
        };
    }

    // Legacy — string itemId
    if (typeof entry === 'string') {
        const it = ITEMS[entry];
        if (!it) return null;
        return {
            ...it,
            categorie: it.categorie || 'legacy',
            instance: null,
            score: null
        };
    }

    return null;
}

function descriptionInstance(instance, tpl) {
    const tier = tierPourScore(instance.score);
    return `${tier.nomLong} • ${tpl.nom} forgé.`;
}

/** Mapping informel ancien tier 1/2/3 ↔ score (juste pour cohabitation UI). */
function tierToLegacyTier(score) {
    if (score >= 85) return 3;
    if (score >= 50) return 2;
    return 1;
}

// Bridges entre nouvelles stats (Phase 6) et anciennes cibles (legacy).
// Permet à `calculerStats` actuel de prendre en compte les affixes Phase 6
// (pour les stats compatibles). Les stats spécifiques Phase 6 (garde*,
// parryFenetre, attaqueVitesse, sautHauteur) sont gérées en plus dans
// `calculerStatsForge` (cf. CraftingSystem helpers).
function legacyStatCible(statId) {
    switch (statId) {
        case 'attaqueDegats': return 'attaqueDegats';
        case 'parryFenetre':  return 'parryFenetre';
        case 'sautHauteur':   return 'jumpVelocity'; // pourcentage → delta
        case 'attaqueVitesse': return 'attaqueCooldown'; // pourcentage → delta négatif
        // Stats Phase 6 pures : pas de cible legacy, on renvoie un id "neutre"
        // qui n'aura pas d'effet sur la logique existante. Le SystemEffets
        // Phase 6 (cf. SystemeEffets.js) lira les statId directement.
        default: return '__phase6_' + statId;
    }
}

function legacyStatDelta(statId, delta) {
    // Conversion stat % → unité gameplay legacy
    if (statId === 'sautHauteur') return Math.round(delta * 5); // +5 px par %
    if (statId === 'attaqueVitesse') return -Math.round(delta * 4); // -4 ms par %
    return delta;
}
