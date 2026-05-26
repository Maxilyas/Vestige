// Index des salles handcrafted par biome.
//
// Une salle = un fichier JS qui exporte une "topographie virtuelle" :
// même API que data/topographies.js mais avec une géométrie pixel-précise
// pensée pour intégrer la mécanique de biome.
//
// Deux modes d'utilisation :
//
//  1. PIN ÉDITORIAL — etages.js noeuds {useSalle:'xxx'}
//     → résolution directe via sallePar(id)
//
//  2. SPANNING TREE — EtageGen demande une salle compatible avec un set
//     de portes (ex. {O,E,N}). Catalogue retourne le pool de salles dont
//     portesPossibles ⊇ portes demandées (un superset est OK : la salle
//     ne dessine que les portes activées à la génération).
//
// ═════════════════════════════════════════════════════════════════════
// PHASE 9 — Toutes les salles Ruines sont compactes (960×540, caméra figée).
// Les anciennes salles XL ont été supprimées en Phase 9.3d (cleanup post-refonte).
// Les biomes 2-5 (Halls, Cristaux, Voile, Cœur) restent en XL legacy
// jusqu'à leur propre migration compact (9.4+).
// ═════════════════════════════════════════════════════════════════════

// ─── Phase 9.2 : 1ère salle test compacte 960×540 ─────────────────────
import { ruines_atrium_effondre }     from './ruines/ruines_atrium_effondre.js';
// ─── Phase 9.3b : Pool OE compact Ruines (4 salles) ───────────────────
import { ruines_couloir_brise }       from './ruines/ruines_couloir_brise.js';
import { ruines_escaliers_effrites }  from './ruines/ruines_escaliers_effrites.js';
import { ruines_arene_pieux }         from './ruines/ruines_arene_pieux.js';
import { ruines_arene_ressorts }      from './ruines/ruines_arene_ressorts.js';
// ─── Phase 9.3c : Pool compact Ruines complet (15 salles) ─────────────
import { ruines_carrefour_compact }   from './ruines/ruines_carrefour_compact.js';
import { ruines_puits_compact }       from './ruines/ruines_puits_compact.js';
import { ruines_cheminee_compact }    from './ruines/ruines_cheminee_compact.js';
import { ruines_coin_NE_compact }     from './ruines/ruines_coin_NE_compact.js';
import { ruines_coin_NO_compact }     from './ruines/ruines_coin_NO_compact.js';
import { ruines_coin_SE_compact }     from './ruines/ruines_coin_SE_compact.js';
import { ruines_coin_SO_compact }     from './ruines/ruines_coin_SO_compact.js';
import { ruines_t_NEO_compact }       from './ruines/ruines_t_NEO_compact.js';
import { ruines_t_SEO_compact }       from './ruines/ruines_t_SEO_compact.js';
import { ruines_t_NSO_compact }       from './ruines/ruines_t_NSO_compact.js';
import { ruines_t_NSE_compact }       from './ruines/ruines_t_NSE_compact.js';
import { ruines_impasse_O_compact }   from './ruines/ruines_impasse_O_compact.js';
import { ruines_impasse_E_compact }   from './ruines/ruines_impasse_E_compact.js';
import { ruines_impasse_N_compact }   from './ruines/ruines_impasse_N_compact.js';
import { ruines_impasse_S_compact }   from './ruines/ruines_impasse_S_compact.js';
// ─── Phase 9.4 Vague 1 : salle signature mécanique mobile ─────────────
import { ruines_sanctuaire_suspendu } from './ruines/ruines_sanctuaire_suspendu.js';

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

// Pool de tirage normal. Les salles fallback (carrefour universel par biome)
// sont EXCLUES : elles ne sortent que via salleFallback() quand le pool
// est trop pauvre pour matcher la combinaison de portes demandée. Sans
// cette exclusion, le carrefour matcherait toutes les configs et
// dominerait le pool — sape la variété.
const TOUTES_SALLES = [
    // ─── Ruines basses (Phase 9 compact) ──────────────────────────────
    ruines_atrium_effondre,    // OE   — 5 niveaux verticaux dans 540 px (unique)
    ruines_couloir_brise,      // OE   — combat propre style Hollow Knight
    ruines_escaliers_effrites, // OE   — timing sols effrités style Celeste
    ruines_arene_pieux,        // OE   — combat sur sol piégé style Castlevania
    ruines_arene_ressorts,     // OE   — mobilité aérienne dynamique
    ruines_puits_compact,      // NS   — puits zigzag vertical
    ruines_cheminee_compact,   // NS   — cheminée étroite + sols effrités centre
    ruines_coin_NE_compact,    // NE   — tour de garde ascension droite
    ruines_coin_NO_compact,    // NO   — belvédère ascension gauche
    ruines_coin_SE_compact,    // SE   — descente oubliée vers le bas-droite
    ruines_coin_SO_compact,    // SO   — caveau affaissé vers le bas-gauche
    ruines_t_NEO_compact,      // NEO  — forum 3 voies ascension centrale
    ruines_t_SEO_compact,      // SEO  — embranchement des dépôts
    ruines_t_NSO_compact,      // NSO  — passage triple ouest
    ruines_t_NSE_compact,      // NSE  — passage triple est
    ruines_impasse_O_compact,  // O    — sanctuaire scellé deadend
    ruines_impasse_E_compact,  // E    — atelier scellé deadend
    ruines_impasse_N_compact,  // N    — corniche oubliée (haut → bas)
    ruines_impasse_S_compact,  // S    — caveau profond (descente coffre)
    // ─── Phase 9.4 Vague 1 : signature mobile ─────────────────────
    ruines_sanctuaire_suspendu, // OE   — timing plateformes mobiles, coffre haut (unique)

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

// Salles "fallback universel" par biome — supportent NSEO et matchent toutes
// les configs. Tenues hors du pool normal pour préserver la variété, mais
// résolvables via sallePar() (si jamais référencées par useSalle) et via
// salleFallback() (quand le pool ne match aucune config demandée).
const PAR_ID_FALLBACK = {
    [ruines_carrefour_compact.id]: ruines_carrefour_compact,
    [halls_carrefour_brasier.id]: halls_carrefour_brasier
};

const FALLBACK_PAR_BIOME = {
    'ruines_basses': ruines_carrefour_compact,
    'halls_cendres': halls_carrefour_brasier
};

export function salleFallback(biomeId) {
    return FALLBACK_PAR_BIOME[biomeId] ?? ruines_carrefour_compact;
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
        // Pour Ruines (tout compact, pool dense), on ignore le filtre
        // rolesAutorises pour maximiser la variété même sur deadends.
        // Pour Halls (toujours XL), filtre normal pour préserver les
        // salles signature des rôles main uniquement.
        const ignoreRole = biomeId === 'ruines_basses';
        if (role && s.rolesAutorises && !s.rolesAutorises.includes(role) && !ignoreRole) return false;
        // Salles "unique" : max 1 par étage (signature). Si déjà tirée → exclue.
        if (s.unique && dejaUtilisees?.has(s.id)) return false;
        return true;
    });
}

/**
 * Pioche une salle compatible aléatoirement (RNG fourni), avec tirage PONDÉRÉ.
 * Chaque salle peut déclarer `tirageWeight` (défaut 1). Les salles signature
 * (`unique: true` + `tirageWeight: 3` typique) sont plus probables — sinon
 * elles sont noyées dans le pool et l'identité du biome se dilue.
 *
 * Retourne null si aucune salle ne match — l'appelant doit avoir un fallback.
 */
export function tirerSalleCompatible(biomeId, portesReq, rng, role, dejaUtilisees) {
    const pool = sallesCompatibles(biomeId, portesReq, role, dejaUtilisees);
    if (pool.length === 0) return null;
    const poids = pool.map(s => s.tirageWeight ?? 1);
    const total = poids.reduce((a, b) => a + b, 0);
    let r = rng() * total;
    for (let i = 0; i < pool.length; i++) {
        r -= poids[i];
        if (r <= 0) return pool[i];
    }
    return pool[pool.length - 1];
}
