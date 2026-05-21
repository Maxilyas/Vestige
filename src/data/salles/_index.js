// Index des salles handcrafted XL par biome.
//
// Une salle = un fichier JS qui exporte une "topographie virtuelle" :
// même API que data/topographies.js mais avec une géométrie pixel-précise
// pensée pour intégrer la mécanique de biome.
//
// Deux modes d'utilisation :
//
//  1. PIN ÉDITORIAL — etages.js noeuds {useSalle:'ruines_grimpeur'}
//     → résolution directe via sallePar(id)
//
//  2. SPANNING TREE — EtageGen demande une salle compatible avec un set
//     de portes (ex. {O,E,N}). Catalogue retourne le pool de salles dont
//     portesPossibles ⊇ portes demandées (un superset est OK : la salle
//     ne dessine que les portes activeés à la génération).
//
// ═════════════════════════════════════════════════════════════════════
// PHASE 9 — MODE TEST COMPACT ONLY (TEMPORAIRE)
// ═════════════════════════════════════════════════════════════════════
// Quand `true`, `sallesCompatibles` filtre le pool de tirage spanning
// tree pour ne garder QUE les salles `dimsCanvas: true` (Phase 9.3+).
// Pour les configs de portes non couvertes par les salles compactes,
// le système se rabat sur le fallback (carrefour XL legacy).
// → À désactiver une fois Phase 9.3 complète (NS + coins + T + impasses
//   compacts créés). Les pins éditoriaux via sallePar() ne sont PAS
//   affectés par ce flag (ils retrouvent toujours leur salle).
// ═════════════════════════════════════════════════════════════════════
const MODE_COMPACT_ONLY = true;

import { ruines_grimpeur }            from './ruines/ruines_grimpeur.js';
import { ruines_passage_humble }      from './ruines/ruines_passage_humble.js';
import { ruines_carrefour }           from './ruines/ruines_carrefour.js';
import { ruines_couloir_traversant }  from './ruines/ruines_couloir_traversant.js';
import { ruines_puits_vertical }      from './ruines/ruines_puits_vertical.js';
import { ruines_coin_NE }             from './ruines/ruines_coin_NE.js';
import { ruines_coin_SO }             from './ruines/ruines_coin_SO.js';
import { ruines_t_NEO }               from './ruines/ruines_t_NEO.js';
import { ruines_t_SEO }               from './ruines/ruines_t_SEO.js';
import { ruines_impasse_O }           from './ruines/ruines_impasse_O.js';
import { ruines_impasse_E }           from './ruines/ruines_impasse_E.js';
import { ruines_arche_brisee }        from './ruines/ruines_arche_brisee.js';
// ─── Vague 4D : 8 nouvelles salles à architecture verticale + plafonds ───
import { ruines_cathedrale }          from './ruines/ruines_cathedrale.js';
import { ruines_tour_sentinelles }    from './ruines/ruines_tour_sentinelles.js';
import { ruines_atelier }             from './ruines/ruines_atelier.js';
import { ruines_3plaques }            from './ruines/ruines_3plaques.js';
import { ruines_crypte_profonde }     from './ruines/ruines_crypte_profonde.js';
import { ruines_pont_soupirs }        from './ruines/ruines_pont_soupirs.js';
import { ruines_tour_brouillage }     from './ruines/ruines_tour_brouillage.js';
import { ruines_caveau_scelle }       from './ruines/ruines_caveau_scelle.js';
// ─── Phase 9.2 : salle test compacte 960×540 (canvas fixe, caméra figée) ───
import { ruines_atrium_effondre }     from './ruines/ruines_atrium_effondre.js';
// ─── Phase 9.3b : Pool OE compact Ruines (4 salles) ───────────────────
import { ruines_couloir_brise }       from './ruines/ruines_couloir_brise.js';
import { ruines_escaliers_effrites }  from './ruines/ruines_escaliers_effrites.js';
import { ruines_arene_pieux }         from './ruines/ruines_arene_pieux.js';
import { ruines_arene_ressorts }      from './ruines/ruines_arene_ressorts.js';

// ─── Halls Cendrés (Phase 8 — 25 salles + 1 fallback) ────────────
import { halls_couloir_brasiers }     from './halls/halls_couloir_brasiers.js';
import { halls_grand_mur }            from './halls/halls_grand_mur.js';
import { halls_cascade_pierres }      from './halls/halls_cascade_pierres.js';
import { halls_brasserie }            from './halls/halls_brasserie.js';
import { halls_voute_basse }          from './halls/halls_voute_basse.js';
import { halls_pont_braise }          from './halls/halls_pont_braise.js';
import { halls_atelier_marteau }      from './halls/halls_atelier_marteau.js';
import { halls_couloir_explosif }     from './halls/halls_couloir_explosif.js';
import { halls_crypte_effondree }     from './halls/halls_crypte_effondree.js';
import { halls_cheminee_braise }      from './halls/halls_cheminee_braise.js';
import { halls_puits_cendres }        from './halls/halls_puits_cendres.js';
import { halls_coin_NE }              from './halls/halls_coin_NE.js';
import { halls_coin_SO }              from './halls/halls_coin_SO.js';
import { halls_coin_NO }              from './halls/halls_coin_NO.js';
import { halls_coin_SE }              from './halls/halls_coin_SE.js';
import { halls_t_NEO }                from './halls/halls_t_NEO.js';
import { halls_t_SEO }                from './halls/halls_t_SEO.js';
import { halls_t_NSO }                from './halls/halls_t_NSO.js';
import { halls_t_NSE }                from './halls/halls_t_NSE.js';
import { halls_impasse_O }            from './halls/halls_impasse_O.js';
import { halls_impasse_E }            from './halls/halls_impasse_E.js';
import { halls_impasse_N }            from './halls/halls_impasse_N.js';
import { halls_impasse_S }            from './halls/halls_impasse_S.js';
import { halls_foyer_eteint }         from './halls/halls_foyer_eteint.js';
import { halls_reseau_plaques }       from './halls/halls_reseau_plaques.js';
import { halls_carrefour_brasier }    from './halls/halls_carrefour_brasier.js';

// 19 salles handcrafted Ruines basses dans le pool de tirage normal.
// Le carrefour NSEO est EXCLU du tirage : il ne sort que via salleFallback()
// quand aucune autre salle ne match (configs NSE, NSO, NSEO rares). Sinon
// les graphes seraient dominés par le carrefour (il match toutes les configs).
const TOUTES_SALLES = [
    // Vague 1-3 (existantes)
    ruines_grimpeur,           // OES — signature verticalité + ancrage (unique)
    ruines_passage_humble,     // EN  — narratif crypte
    ruines_couloir_traversant, // OE  — couloir 2 étages + tunnel + plaque
    ruines_puits_vertical,     // NS  — transition verticale
    ruines_coin_NE,            // EN  — virage tour de garde
    ruines_coin_SO,            // OS  — virage cave d'effondrement + éboulis
    ruines_t_NEO,              // NEO — forum 2 étages + plafond troué
    ruines_t_SEO,              // SEO — carrefour des dépôts + roc + éboulis S
    ruines_impasse_O,          // O   — sanctuaire abandonné (deadend coffre)
    ruines_impasse_E,          // E   — atelier scellé (deadend coffre)
    ruines_arche_brisee,       // OE  — signature ancrage horizontal (unique)
    // Vague 4D (8 nouvelles)
    ruines_cathedrale,         // NSEO — 3 étages + plaque + coffre (unique)
    ruines_tour_sentinelles,   // NS   — 4 étages verticaux combat
    ruines_atelier,            // OE   — tunnel forcé + coffre étage 2
    ruines_3plaques,           // OE   — puzzle activation 3 plaques
    ruines_crypte_profonde,    // NS   — descente paliers + pieux méca
    ruines_pont_soupirs,       // OE   — pont effrites en cascade (unique)
    ruines_tour_brouillage,    // OES  — anti-ancrage central (unique)
    ruines_caveau_scelle,      // OE   — mur fissuré central + roc (unique)
    // ─── Phase 9.2 : salle test compacte (canvas 960×540, caméra figée) ───
    ruines_atrium_effondre,    // OE   — 5 niveaux verticaux dans 540 px (unique)
    // ─── Phase 9.3b : Pool OE compact Ruines (4 salles) ───────────────
    ruines_couloir_brise,      // OE   — combat propre style Hollow Knight
    ruines_escaliers_effrites, // OE   — timing sols effrités style Celeste
    ruines_arene_pieux,        // OE   — combat sur sol piégé style Castlevania
    ruines_arene_ressorts,     // OE   — mobilité aérienne dynamique

    // ─── Halls Cendrés (25 salles ; mécanique = destruction) ──────
    // OE bus principal (8)
    halls_couloir_brasiers,    // OE   — 3 brasiers cycliques décalés
    halls_grand_mur,           // OE   — mur géant HP=8 central (unique)
    halls_cascade_pierres,     // OE   — réaction en chaîne murs + rocs (unique)
    halls_brasserie,           // OE   — combat vertical pieux + ressorts (unique)
    halls_voute_basse,         // OE   — couloir bas + sols effrites
    halls_pont_braise,         // OE   — pont au-dessus fosse de brasiers
    halls_atelier_marteau,     // OE   — sous-salle coffre via mur fissuré
    halls_couloir_explosif,    // OE   — 2 murs explosifs au sol
    // NS verticaux (3)
    halls_crypte_effondree,    // NS   — zigzag + niches latérales (unique)
    halls_cheminee_braise,     // NS   — brasiers étagés en quinconce
    halls_puits_cendres,       // NS   — sols effrites + mur barre en haut
    // Coins (4)
    halls_coin_NE,             // NE   — atelier vertical + niche mur fissuré
    halls_coin_SO,             // SO   — foyer éteint + éboulis
    halls_coin_NO,             // NO   — cendrier suspendu + mur explosif
    halls_coin_SE,             // SE   — descente forge + plaque pression
    // T (4)
    halls_t_NEO,               // NEO  — voûte fendue 3 étages (unique)
    halls_t_SEO,               // SEO  — carrefour dépôts + éboulis
    halls_t_NSO,               // NSO  — passage triple ouest
    halls_t_NSE,               // NSE  — passage triple est
    // Deadends (4)
    halls_impasse_O,           // O    — sanctuaire éteint deadend
    halls_impasse_E,           // E    — chambre brasier permanent
    halls_impasse_N,           // N    — corniche oubliée vertical haut
    halls_impasse_S,           // S    — fosse brasiers vertical bas
    // Signature OES/NEO (2)
    halls_foyer_eteint,        // OES  — 3 niveaux + sous-salle mur explosif (unique)
    halls_reseau_plaques       // NEO  — 3 plaques pression puzzle (unique)
];

// Salles de secours par biome (jamais dans le pool de tirage normal —
// matchent toutes les configs et écraseraient la variété).
const PAR_ID_FALLBACK = {
    [ruines_carrefour.id]: ruines_carrefour,
    [halls_carrefour_brasier.id]: halls_carrefour_brasier
};

// Salle "fallback" universelle par biome. Utilisée quand le pool est trop
// pauvre pour matcher la combinaison de portes demandée. Doit supporter
// les 4 portes NSEO.
const FALLBACK_PAR_BIOME = {
    'ruines_basses': ruines_carrefour,
    'halls_cendres': halls_carrefour_brasier
};

export function salleFallback(biomeId) {
    return FALLBACK_PAR_BIOME[biomeId] ?? ruines_carrefour;
}

const PAR_ID = Object.fromEntries(TOUTES_SALLES.map(s => [s.id, s]));

/** Renvoie une salle par son id, ou null si inconnue. */
export function sallePar(id) {
    return PAR_ID[id] ?? PAR_ID_FALLBACK[id] ?? null;
}

/**
 * Pool de salles d'un biome compatibles avec un set de portes + un rôle.
 * Compat = `portesPossibles ⊇ portesRequises` (la salle supporte AU MOINS
 * les portes demandées ; les portes extra ne sont pas dessinées).
 * Si la salle déclare `rolesAutorises`, le rôle demandé doit y figurer.
 * Si `dejaUtilisees` contient l'id d'une salle `unique:true`, elle est exclue.
 *
 * @param {string} biomeId          - p.ex. 'ruines_basses'
 * @param {string[]} portesReq      - p.ex. ['O', 'E']
 * @param {string} [role]           - 'main' | 'alt' | 'deadend' | 'entree' | 'boss'
 * @param {Set<string>} [dejaUtilisees] - ids déjà placées dans l'étage
 * @returns {Array} salles compatibles (peut être vide)
 */
export function sallesCompatibles(biomeId, portesReq, role, dejaUtilisees) {
    return TOUTES_SALLES.filter(s => {
        if (s.biome !== biomeId) return false;
        if (!portesReq.every(d => s.portesPossibles.includes(d))) return false;
        // Phase 9 mode test : on ignore le filtre rolesAutorises pour
        // maximiser la présence des 5 salles compactes (sinon les deadends
        // tirent sur le fallback XL). Hors mode test, filtre normal.
        if (role && s.rolesAutorises && !s.rolesAutorises.includes(role) && !MODE_COMPACT_ONLY) return false;
        // Salles "unique" : max 1 par étage (Grimpeur, Arche brisée, futures
        // salles signature). Si déjà tirée → exclue du pool.
        if (s.unique && dejaUtilisees?.has(s.id)) return false;
        // Phase 9 — mode test : filtre pour ne garder que les salles
        // compactes 960×540. Configs non couvertes → fallback (carrefour XL).
        if (MODE_COMPACT_ONLY && !s.dimsCanvas) return false;
        return true;
    });
}

/**
 * Pioche une salle compatible aléatoirement (RNG fourni).
 * Retourne null si aucune salle ne match — l'appelant doit avoir un fallback.
 */
export function tirerSalleCompatible(biomeId, portesReq, rng, role, dejaUtilisees) {
    const pool = sallesCompatibles(biomeId, portesReq, role, dejaUtilisees);
    if (pool.length === 0) return null;
    return pool[Math.floor(rng() * pool.length)];
}
