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
    ruines_caveau_scelle       // OE   — mur fissuré central + roc (unique)
];

// Salles de secours par biome (jamais dans le pool de tirage normal —
// matchent toutes les configs et écraseraient la variété).
const PAR_ID_FALLBACK = {
    [ruines_carrefour.id]: ruines_carrefour
};

// Salle "fallback" universelle par biome. Utilisée quand le pool est trop
// pauvre pour matcher la combinaison de portes demandée. Doit supporter
// les 4 portes NSEO.
const FALLBACK_PAR_BIOME = {
    'ruines_basses': ruines_carrefour
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
        if (role && s.rolesAutorises && !s.rolesAutorises.includes(role)) return false;
        // Salles "unique" : max 1 par étage (Grimpeur, Arche brisée, futures
        // salles signature). Si déjà tirée → exclue du pool.
        if (s.unique && dejaUtilisees?.has(s.id)) return false;
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
