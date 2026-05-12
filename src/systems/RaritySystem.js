// Système de rareté orthogonal au bestiaire.
//
// MODÈLE
// ──────
// Chaque archétype d'ennemi peut spawn en 4 tiers de rareté :
//   - Commun     : base stats, comportement standard
//   - Élite      : +HP, +vitesse, halo doré pulsant, drop boosté
//   - Rare       : tier Élite + 1 capacité aléatoire (bouclier, mini-clone…),
//                  drop T2 garanti
//   - Légendaire : tier Rare + comportement boosted, aura cramoisie massive,
//                  screen-shake au spawn, drop T3 garanti + signature-drop hook
//
// PHASE 3g — ACTIVÉ
// ─────────────────
// Probas progressives par paire d'étages (cf. PROBAS_PAR_ETAGE). Tier tiré à
// la génération de salle (seedé, stable entre visites). Boost cooldowns
// global -25 % sur les Légendaires (hook `comportementBoosted`).
//
// USAGE
// ─────
// Au spawn d'un ennemi dans GameScene._instancierEnnemi :
//   1. `const tier = e.tier ?? TIERS.COMMUN;` (déjà tiré par WorldGen)
//   2. `const defModifie = defAvecRarete(def, tier);`
//   3. instancier Enemy avec defModifie
//   4. appliquer FX visuel via attacherAura()
//
// À la mort :
//   1. `const signature = dropSignature(enemy, scene);`
//   2. si signature null, drop standard + bonus via `modificateursDrop(tier)`

// ─── Énumération ───
export const TIERS = {
    COMMUN:     'commun',
    ELITE:      'elite',
    RARE:       'rare',
    LEGENDAIRE: 'legendaire'
};

// ─── Probas par défaut (fallback) ───
export const PROBAS_DEFAUT = {
    [TIERS.COMMUN]:     1.0,
    [TIERS.ELITE]:      0.0,
    [TIERS.RARE]:       0.0,
    [TIERS.LEGENDAIRE]: 0.0
};

// ─── Probas par paire d'étages ───
// Progression lisible : Élite dès étage 1, Rare émerge à 3-4, Légendaire
// devient possible à 5-6 et reste un événement même à 9-10.
export const PROBAS_PAR_ETAGE = {
    1:  { [TIERS.COMMUN]: 0.90, [TIERS.ELITE]: 0.10, [TIERS.RARE]: 0.00, [TIERS.LEGENDAIRE]: 0.00 },
    2:  { [TIERS.COMMUN]: 0.90, [TIERS.ELITE]: 0.10, [TIERS.RARE]: 0.00, [TIERS.LEGENDAIRE]: 0.00 },
    3:  { [TIERS.COMMUN]: 0.80, [TIERS.ELITE]: 0.17, [TIERS.RARE]: 0.03, [TIERS.LEGENDAIRE]: 0.00 },
    4:  { [TIERS.COMMUN]: 0.80, [TIERS.ELITE]: 0.17, [TIERS.RARE]: 0.03, [TIERS.LEGENDAIRE]: 0.00 },
    5:  { [TIERS.COMMUN]: 0.72, [TIERS.ELITE]: 0.22, [TIERS.RARE]: 0.05, [TIERS.LEGENDAIRE]: 0.01 },
    6:  { [TIERS.COMMUN]: 0.72, [TIERS.ELITE]: 0.22, [TIERS.RARE]: 0.05, [TIERS.LEGENDAIRE]: 0.01 },
    7:  { [TIERS.COMMUN]: 0.65, [TIERS.ELITE]: 0.25, [TIERS.RARE]: 0.08, [TIERS.LEGENDAIRE]: 0.02 },
    8:  { [TIERS.COMMUN]: 0.65, [TIERS.ELITE]: 0.25, [TIERS.RARE]: 0.08, [TIERS.LEGENDAIRE]: 0.02 },
    9:  { [TIERS.COMMUN]: 0.55, [TIERS.ELITE]: 0.30, [TIERS.RARE]: 0.12, [TIERS.LEGENDAIRE]: 0.03 },
    10: { [TIERS.COMMUN]: 0.55, [TIERS.ELITE]: 0.30, [TIERS.RARE]: 0.12, [TIERS.LEGENDAIRE]: 0.03 }
};

/** Retourne les probas pour un étage (clamp 1..10). */
export function probasPourEtage(etageNumero) {
    const n = Math.max(1, Math.min(10, etageNumero | 0));
    return PROBAS_PAR_ETAGE[n] ?? PROBAS_DEFAUT;
}

/**
 * Tire un tier selon les probas fournies. Cumulatif.
 * @param {function} rng  PRNG seedé
 * @param {object} probas mapping tier→proba (somme ~1.0)
 * @returns {string} tier
 */
export function tirerRarete(rng, probas = PROBAS_DEFAUT) {
    const r = rng();
    let cum = 0;
    for (const tier of Object.values(TIERS)) {
        cum += (probas[tier] ?? 0);
        if (r < cum) return tier;
    }
    return TIERS.COMMUN;
}

// ─── Modificateurs de stats par tier ───
const MODIFS_STATS = {
    [TIERS.COMMUN]: {
        hpMult: 1.0, vitesseMult: 1.0,
        capaciteBonus: false, comportementBoosted: false
    },
    [TIERS.ELITE]: {
        hpMult: 1.5, vitesseMult: 1.3,
        capaciteBonus: false, comportementBoosted: false
    },
    [TIERS.RARE]: {
        hpMult: 1.8, vitesseMult: 1.4,
        capaciteBonus: true, comportementBoosted: false
    },
    [TIERS.LEGENDAIRE]: {
        hpMult: 2.5, vitesseMult: 1.5,
        capaciteBonus: true, comportementBoosted: true
    }
};

/** Retourne l'objet modificateurs pour un tier. */
export function modificateursStats(tier) {
    return MODIFS_STATS[tier] ?? MODIFS_STATS[TIERS.COMMUN];
}

// Clés "cooldown / délai" auxquelles s'applique le boost `comportementBoosted`
// (Légendaire). -25 % systématique pour des Légendaires plus agressifs.
const COOLDOWN_KEYS = [
    'delaiTir', 'delaiTelegraph', 'delaiCharge', 'delaiRecuperation',
    'delaiSpawn', 'delaiPattern', 'cadence', 'cooldown'
];

/**
 * Clone une `def` ennemi avec stats modifiées selon le tier. Ne modifie pas
 * la def d'origine (qui est partagée entre tous les ennemis du même type).
 */
export function defAvecRarete(def, tier) {
    const m = modificateursStats(tier);
    const clone = {
        ...def,
        hp: Math.max(1, Math.round(def.hp * m.hpMult)),
        vitesse: Math.round((def.vitesse ?? 0) * m.vitesseMult),
        rarete: tier,
        capaciteBonus: m.capaciteBonus,
        comportementBoosted: m.comportementBoosted
    };
    // Légendaire : -25 % sur tous les cooldowns connus. Préserve la valeur si
    // absente, plancher à 100 ms pour éviter les boucles serrées.
    if (m.comportementBoosted) {
        for (const k of COOLDOWN_KEYS) {
            if (typeof def[k] === 'number') {
                clone[k] = Math.max(100, Math.round(def[k] * 0.75));
            }
        }
    }
    return clone;
}

// ─── Modificateurs de drop par tier (consommé par LootSystem) ───
const MODIFS_DROP = {
    [TIERS.COMMUN]: {
        selBonus: 0,
        fragmentGaranti: false,
        tierItemMin: null,         // null = pas de drop item garanti
        nbFragmentsBonus: 0
    },
    [TIERS.ELITE]: {
        selBonus: 5,
        fragmentGaranti: true,
        tierItemMin: null,
        nbFragmentsBonus: 1
    },
    [TIERS.RARE]: {
        selBonus: 15,
        fragmentGaranti: true,
        tierItemMin: 2,
        nbFragmentsBonus: 2
    },
    [TIERS.LEGENDAIRE]: {
        selBonus: 50,
        fragmentGaranti: true,
        tierItemMin: 3,
        nbFragmentsBonus: 3
    }
};

/** Retourne les modificateurs de drop pour un tier. */
export function modificateursDrop(tier) {
    return MODIFS_DROP[tier] ?? MODIFS_DROP[TIERS.COMMUN];
}

// ─── FX visuels par tier ───
// Couleur d'aura + intensité. Le rendu effectif (halo pulsant, particules,
// screen-shake) sera implémenté en Phase 3g via un module render dédié.
export const AURA_PAR_TIER = {
    [TIERS.COMMUN]:     null,
    [TIERS.ELITE]:      { couleur: 0xffd060, intensite: 0.6 },
    [TIERS.RARE]:       { couleur: 0xc0c0c0, intensite: 0.8 },
    [TIERS.LEGENDAIRE]: { couleur: 0xff3040, intensite: 1.0, screenShake: true }
};

// ════════════════════════════════════════════════════════════════════════
// HOOK SIGNATURE-DROP — modulaire pour future intégration recettes
// ════════════════════════════════════════════════════════════════════════
//
// Par défaut, un Légendaire drop T3 + 50 Sel + 3 fragments (via
// `modificateursDrop`). Le registry `SIGNATURE_DROP_PAR_ID` permet d'override
// par `enemy.def.id` pour offrir un drop signature unique (ex: fragment
// spécifique débloquant une recette cachée chez le Fondeur).
//
// Modulable plus tard (Phase 4+ ou suivant refonte recettes) :
//   import { enregistrerSignatureDrop } from '.../RaritySystem.js';
//   enregistrerSignatureDrop('cri_du_reflux', (enemy, scene) => ({
//       item: 'fragment_unique_reflux',
//       sel: 100,
//       fragments: 5
//   }));

export const SIGNATURE_DROP_PAR_ID = {};

/**
 * Enregistre un signature-drop pour un enemy.id. Surclasse le drop standard
 * du tier Légendaire pour cet ennemi.
 * @param {string} enemyId
 * @param {(enemy, scene) => ?{ item, sel, fragments }} fn
 */
export function enregistrerSignatureDrop(enemyId, fn) {
    SIGNATURE_DROP_PAR_ID[enemyId] = fn;
}

/**
 * Retourne le drop signature pour un ennemi mort en tier Légendaire, ou null
 * si aucun override enregistré (auquel cas le drop standard du tier
 * s'applique via `modificateursDrop`).
 */
export function dropSignature(enemy, scene) {
    const fn = SIGNATURE_DROP_PAR_ID[enemy.def?.id];
    if (typeof fn !== 'function') return null;
    return fn(enemy, scene);
}
