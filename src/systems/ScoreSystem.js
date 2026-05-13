// ScoreSystem — gère le score 0-100 d'un item Phase 6 et son mapping visuel.
//
// Un score n'est pas un tier discret : c'est une note continue qui détermine :
//   - la couleur d'affichage (gradient gris → blanc → bleu → violet → doré → cramoisi → iridescent)
//   - le tier nommé associé (visuel)
//   - le nombre d'affixes primaires + exotiques
//   - la présence d'un sort + d'une signature
//
// Une instance d'item Phase 6 :
//   {
//     _instance: true,
//     uid: string,                // identifiant unique (random)
//     templateId: 'lame_longue',
//     score: 73,                  // 0-100
//     affixesPrim: [{statId, delta}],   // primaires (visibles via auto-révélation)
//     affixesExo: [exotiqueId],          // exotiques (cachés au début)
//     sortId: 'eclat_aurore' | null,     // tiré seulement si score >= 70
//     signatureId: 'aube_septieme' | null, // tiré seulement si score >= 95
//     revele: {
//       prim: [],         // indices des affixesPrim révélés
//       exo: [],          // indices des affixesExo révélés
//       sort: false,      // sort révélé ?
//       signature: false  // signature révélée ?
//     },
//     compteurs: { hits: 0, parries: 0, sauts: 0, sorts: 0 } // pour auto-révélation
//   }

// ============================================================
// TIERS — mapping score → palette
// ============================================================
// Chaque tier : nom court + nom long + couleur RGB + nb d'affixes max.
// Le tier "perfect" (100) n'est atteignable que par roll exceptionnel.

// Palette retravaillée (feedback user) :
// Gris → Blanc → Vert → Bleu → Violet → Orange → Rouge
// Le rouge est désormais bien plus éclatant que l'iridescent — il signale
// le "Perfect" sans ambiguïté visuelle.
export const TIERS_SCORE = [
    {
        id: 'brise',
        nom: 'Brisé',
        nomLong: 'Brisé',
        scoreMin: 0, scoreMax: 30,
        couleur: 0x6a6a7a,         // gris froid
        couleurClaire: 0x8a8a9a,
        nbPrimaires: 1, nbExotiques: 0,
        peutSort: false, peutSignature: false
    },
    {
        id: 'commun',
        nom: 'Commun',
        nomLong: 'Commun',
        scoreMin: 30, scoreMax: 50,
        couleur: 0xd8d4c8,         // blanc cassé
        couleurClaire: 0xf0ece0,
        nbPrimaires: 2, nbExotiques: 0,
        peutSort: false, peutSignature: false
    },
    {
        id: 'etoile',
        nom: 'Étoilé',
        nomLong: 'Étoilé',
        scoreMin: 50, scoreMax: 70,
        couleur: 0x40b070,         // vert
        couleurClaire: 0x60d090,
        nbPrimaires: 2, nbExotiques: 1,
        peutSort: false, peutSignature: false
    },
    {
        id: 'spectral',
        nom: 'Spectral',
        nomLong: 'Spectral',
        scoreMin: 70, scoreMax: 85,
        couleur: 0x4080d0,         // bleu
        couleurClaire: 0x60a0f0,
        nbPrimaires: 3, nbExotiques: 1,
        peutSort: true, peutSignature: false
    },
    {
        id: 'royal',
        nom: 'Royal',
        nomLong: 'Royal',
        scoreMin: 85, scoreMax: 95,
        couleur: 0xa050d0,         // violet
        couleurClaire: 0xc080f0,
        nbPrimaires: 3, nbExotiques: 2,
        peutSort: true, peutSignature: false
    },
    {
        id: 'reliquaire',
        nom: 'Reliquaire',
        nomLong: 'Reliquaire',
        scoreMin: 95, scoreMax: 100,
        couleur: 0xff8030,         // orange
        couleurClaire: 0xffa050,
        nbPrimaires: 4, nbExotiques: 2,
        peutSort: true, peutSignature: true
    },
    {
        id: 'perfect',
        nom: 'Perfect',
        nomLong: 'Perfect',
        scoreMin: 100, scoreMax: 101,
        couleur: 0xff3030,         // rouge éclatant
        couleurClaire: 0xff8080,
        nbPrimaires: 4, nbExotiques: 3,
        peutSort: true, peutSignature: true
    }
];

/**
 * Tier correspondant à un score donné.
 */
export function tierPourScore(score) {
    if (score >= 100) return TIERS_SCORE[TIERS_SCORE.length - 1];
    for (let i = TIERS_SCORE.length - 2; i >= 0; i--) {
        if (score >= TIERS_SCORE[i].scoreMin) return TIERS_SCORE[i];
    }
    return TIERS_SCORE[0];
}

/**
 * Couleur d'affichage interpolée pour un score. Permet un dégradé fin entre
 * tiers (un score 86 est légèrement plus chaud qu'un 85 — sentiment de "loot").
 * Pour le Perfect (100), on renvoie un cycle iridescent géré côté UI.
 */
export function couleurPourScore(score) {
    const tier = tierPourScore(score);
    if (tier.id === 'perfect') {
        // L'UI gérera la rotation iridescente — ici on renvoie blanc cassé.
        return tier.couleur;
    }
    // Interpolation entre couleur (début tier) et couleurClaire (fin tier).
    const ratio = (score - tier.scoreMin) / (tier.scoreMax - tier.scoreMin);
    return interpoleHex(tier.couleur, tier.couleurClaire, ratio);
}

function interpoleHex(c1, c2, t) {
    t = Math.max(0, Math.min(1, t));
    const r1 = (c1 >> 16) & 0xff, g1 = (c1 >> 8) & 0xff, b1 = c1 & 0xff;
    const r2 = (c2 >> 16) & 0xff, g2 = (c2 >> 8) & 0xff, b2 = c2 & 0xff;
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    return (r << 16) | (g << 8) | b;
}

/**
 * Pour le rendu iridescent du Perfect (100) : cycle teinte selon le temps.
 */
export function couleurIridescente(tempsMs) {
    const t = (tempsMs / 2000) % 1;
    const h = t * 360;
    return hsvVersHex(h, 0.45, 1);
}

function hsvVersHex(h, s, v) {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r, g, b;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    return ((Math.round((r + m) * 255)) << 16) | ((Math.round((g + m) * 255)) << 8) | (Math.round((b + m) * 255));
}

// ============================================================
// HELPERS pour instances
// ============================================================

/** Vrai si l'entrée d'inventaire est une instance Phase 6 (pas un id legacy). */
export function estInstance(entry) {
    return entry !== null && typeof entry === 'object' && entry._instance === true;
}

/**
 * Renvoie un identifiant stable pour une entrée (instance.uid ou string).
 * Utilisé pour les Set/Map qui doivent référencer des items.
 */
export function entryId(entry) {
    if (typeof entry === 'string') return entry;
    if (estInstance(entry)) return entry.uid;
    return null;
}

/**
 * Pour un score donné, distribution de probabilité skewed selon contexte :
 *   - 'sol'   : drop au sol/coffre, mean ~35 (early game)
 *   - 'boss'  : drop boss, mean ~75
 *   - 'forge' : variance contrôlée autour d'une base donnée
 */
export function tirerScoreDrop(contexte, rng, base = 50) {
    if (contexte === 'sol') {
        // Distribution centrée sur `base` (qui inclut le boost étage). Plus on
        // monte, plus les drops sont qualitatifs. Pour rester rare au top, on
        // applique une distribution exponentielle décroissante autour de base.
        const r = rng();
        if (r < 0.01) return Math.min(100, base + 35 + rng() * 15);  //  1 % jackpot
        if (r < 0.05) return Math.min(100, base + 20 + rng() * 15);  //  4 % très bon
        if (r < 0.20) return Math.min(100, base + 5 + rng() * 15);   // 15 % au-dessus
        if (r < 0.55) return Math.max(0, Math.min(100, base - 5 + rng() * 15));   // 35 % autour
        // 45 % en-dessous
        return Math.max(0, base - 20 + rng() * 18);
    }
    if (contexte === 'boss') {
        const r = rng();
        if (r < 0.08) return 95 + rng() * 5;   //  8 % jackpot
        if (r < 0.40) return 85 + rng() * 10;  // 32 % royal
        if (r < 0.85) return 70 + rng() * 15;  // 45 % spectral
        return 50 + rng() * 20;                // 15 % étoilé
    }
    if (contexte === 'forge') {
        // Variance autour de `base` : ±15 normal, +25 jackpot (1%), -15 fail
        const r = rng();
        if (r < 0.01) return Math.min(100, base + 25);
        const delta = (rng() - 0.3) * 24; // skew +2.4 modéré
        return Math.max(0, Math.min(100, base + delta));
    }
    return base;
}

/**
 * Génère un uid stable pour une instance (utilisé pour la persistance).
 * Random pour cohabiter avec le seed du run (pas critique d'être reproductible).
 */
export function genererUid() {
    return 'i_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now().toString(36).slice(-4);
}
