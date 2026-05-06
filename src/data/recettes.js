// Recettes — table des combinaisons de Fragments → items possibles.
//
// CRITIQUE : ces recettes ne sont JAMAIS affichées au joueur. Le mystère
// est le centre du jeu — le joueur découvre par expérimentation et notes
// hors-jeu. Aucun codex, aucune indication.
//
// Format clé : fragments triés alphabétiquement, séparés par '+'.
//   1 Fragment   : 'blanc' | 'bleu' | 'noir'
//   2 Fragments  : 'blanc+blanc' | 'blanc+bleu' | 'blanc+noir' | 'bleu+bleu' | 'bleu+noir' | 'noir+noir'
//
// Valeur : array d'itemIds — tirage aléatoire dans la liste si plusieurs.

const RECETTES = {
    // === 1 Fragment seul (résultat médiocre, juste pour démarrer) ===
    'blanc': ['lame_sources', 'souffle_glace', 'sceau_albe'],
    'bleu':  ['oeil_temoin', 'pas_vestige', 'ardeur_rouge'],
    'noir':  ['mantra_vide'],

    // === 2 Fragments même famille (pool élargi) ===
    'blanc+blanc': ['lame_sources', 'souffle_glace', 'sceau_albe', 'don_errance'],
    'bleu+bleu':   ['oeil_temoin', 'pas_vestige', 'ardeur_rouge', 'voile_pourpre'],
    'noir+noir':   ['mantra_vide', 'souvenir_chute'],

    // === 2 Fragments mix (recettes signature) ===
    'blanc+bleu':  ['don_errance', 'voile_pourpre'],
    'blanc+noir':  ['coeur_suspendu'],         // Tier 3 ★ garanti
    'bleu+noir':   ['souvenir_chute']          // Tier 3 ★ garanti
};

// Coûts en Sel selon le nombre de Fragments utilisés
const COUTS_SEL = { 1: 3, 2: 8, 3: 15 };

// Phrases cryptiques du Fondeur — change selon ce qu'on dépose sur la table.
// Préserve le mystère : ne révèle rien d'utile, juste de l'ambiance narrative.
const PHRASES_FONDEUR = {
    rien:        "Le Fondeur attend.",
    blanc_seul:  "Du Présent. Stable, mais peu nourrissant.",
    bleu_seul:   "Le passé. Il chante encore.",
    noir_seul:   "Reflux. Dangereux seul.",
    deux_meme:   "Ces deux-là chantent ensemble.",
    deux_mix:    "Curieux. L'un éteint l'autre.",
    deux_noir:   "Le Reflux gronde dans le brasero.",
    trois:       "Trois voix. Le Fondeur écoute.",
    inv_plein:   "Tu n'as plus de place. Vide-toi d'abord."
};

/**
 * Construit la clé de recette à partir d'un tableau de noms de famille.
 * @param {string[]} fragments  ex ['blanc', 'noir']
 */
export function cleRecette(fragments) {
    return [...fragments].sort().join('+');
}

/**
 * Tire un itemId selon les Fragments fournis. Renvoie null si pas de recette.
 */
export function tirerResultat(fragments, rng) {
    const cle = cleRecette(fragments);
    const pool = RECETTES[cle];
    if (!pool || pool.length === 0) return null;
    const idx = Math.floor(rng() * pool.length);
    return pool[idx];
}

export function coutEnSel(nbFragments) {
    return COUTS_SEL[nbFragments] ?? 0;
}

/**
 * Phrase contextuelle du Fondeur selon ce qui est sur la table.
 */
export function phraseFondeur(fragments) {
    if (!fragments || fragments.length === 0) return PHRASES_FONDEUR.rien;
    if (fragments.length === 1) {
        return PHRASES_FONDEUR[`${fragments[0]}_seul`] ?? PHRASES_FONDEUR.rien;
    }
    if (fragments.length === 2) {
        const [a, b] = [...fragments].sort();
        if (a === b) {
            if (a === 'noir') return PHRASES_FONDEUR.deux_noir;
            return PHRASES_FONDEUR.deux_meme;
        }
        return PHRASES_FONDEUR.deux_mix;
    }
    return PHRASES_FONDEUR.trois;
}

export const PHRASE_INV_PLEIN = PHRASES_FONDEUR.inv_plein;
