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
// PHASE 3a — État INITIAL
// ────────────────────────
// Les probas sont DÉSACTIVÉES (commun = 1.0). L'API est en place mais aucun
// ennemi ne sera tagué non-commun tant que les probas ne sont pas activées.
// Phase 3g (Rareté & polish) règlera les probas + FX visuels.
//
// USAGE PRÉVU (Phase 3g+)
// ───────────────────────
// Au spawn d'un ennemi dans EnemySystem :
//   1. `const tier = tirerRarete(rng);`
//   2. `const defModifie = defAvecRarete(def, tier);`
//   3. instancier Enemy avec defModifie
//   4. appliquer FX visuel via AURA_PAR_TIER[tier]
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

// ─── Probas par défaut (DÉSACTIVÉES en Phase 3a) ───
// Phase 3g : envisagé { commun 0.80, elite 0.15, rare 0.04, legendaire 0.01 }
export const PROBAS_DEFAUT = {
    [TIERS.COMMUN]:     1.0,
    [TIERS.ELITE]:      0.0,
    [TIERS.RARE]:       0.0,
    [TIERS.LEGENDAIRE]: 0.0
};

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

/**
 * Clone une `def` ennemi avec stats modifiées selon le tier. Ne modifie pas
 * la def d'origine (qui est partagée entre tous les ennemis du même type).
 */
export function defAvecRarete(def, tier) {
    const m = modificateursStats(tier);
    return {
        ...def,
        hp: Math.max(1, Math.round(def.hp * m.hpMult)),
        vitesse: Math.round((def.vitesse ?? 0) * m.vitesseMult),
        rarete: tier,
        capaciteBonus: m.capaciteBonus,
        comportementBoosted: m.comportementBoosted
    };
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
