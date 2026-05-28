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
// PHASE 9 — Salles Ruines + Halls + Cristaux compactes (960×540).
// XL legacy supprimé Ruines 9.3d / Halls 9.6 ; Cristaux migré 9.x (pool
// fondation, mécaniques signature à venir). Biomes Voile + Cœur (étages
// 7-10) restent XL legacy jusqu'à leur propre migration.
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
// ─── Phase 9.4 Vague 1 : pool diversité 8 NSEO + 3 ciblées (Mario/Rayman) ─
import { ruines_grand_saut }          from './ruines/ruines_grand_saut.js';
import { ruines_tour_chute }          from './ruines/ruines_tour_chute.js';
import { ruines_champignons }         from './ruines/ruines_champignons.js';
import { ruines_lames_pendulantes }   from './ruines/ruines_lames_pendulantes.js';
import { ruines_ascension_ressort }   from './ruines/ruines_ascension_ressort.js';
import { ruines_corniches_zigzag }    from './ruines/ruines_corniches_zigzag.js';
import { ruines_pont_effrite }        from './ruines/ruines_pont_effrite.js';
import { ruines_voutes_brisees }      from './ruines/ruines_voutes_brisees.js';
import { ruines_tour_garde_alt }      from './ruines/ruines_tour_garde_alt.js';
import { ruines_belvedere_pendule }   from './ruines/ruines_belvedere_pendule.js';
import { ruines_puits_double }        from './ruines/ruines_puits_double.js';

// ─── Halls Cendrés (Phase 9.6 — migration compact 960×540) ───────
// 25 salles legacy refondues compact + 11 nouvelles diversité pool.
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
// ─── Phase 9.6 : 11 nouvelles salles diversité Halls ────────────
import { halls_arene_braseros }       from './halls/halls_arene_braseros.js';
import { halls_marteau_destructeur }  from './halls/halls_marteau_destructeur.js';
import { halls_fournaise_centrale }   from './halls/halls_fournaise_centrale.js';
import { halls_tunnel_cendres }       from './halls/halls_tunnel_cendres.js';
import { halls_dais_du_marteau }      from './halls/halls_dais_du_marteau.js';
import { halls_chaine_braseros }      from './halls/halls_chaine_braseros.js';
import { halls_fosse_explosive }      from './halls/halls_fosse_explosive.js';
import { halls_cendres_eternelles }   from './halls/halls_cendres_eternelles.js';
import { halls_ascension_NE }         from './halls/halls_ascension_NE.js';
import { halls_descente_SO }          from './halls/halls_descente_SO.js';
import { halls_double_puits_NS }      from './halls/halls_double_puits_NS.js';
// ─── Phase 9.7 : 5 signatures nouvelles mécaniques (geyser/acide/charbon) ─
import { halls_geyser_central }       from './halls/halls_geyser_central.js';
import { halls_rideau_acide_couloir } from './halls/halls_rideau_acide_couloir.js';
import { halls_blocs_pousseurs }      from './halls/halls_blocs_pousseurs.js';
import { halls_combo_total }          from './halls/halls_combo_total.js';
import { halls_lave_jets }            from './halls/halls_lave_jets.js';
// ─── Phase 9.8 : 5 signatures medium-cost (marteau/piston/scie) ─
import { halls_marteaux_pilons }      from './halls/halls_marteaux_pilons.js';
import { halls_pistons_thermiques }   from './halls/halls_pistons_thermiques.js';
import { halls_scies_couloir }        from './halls/halls_scies_couloir.js';
import { halls_forge_meca }           from './halls/halls_forge_meca.js';
import { halls_arene_chaos }          from './halls/halls_arene_chaos.js';

// ─── Cristaux Glacés (Phase 9.x — migration compact 960×540) ─────
// Pool fondation : 20 salles structurelles (toutes configs de portes) +
// 1 carrefour fallback. Identité marbre/glace, mécaniques existantes
// reskinées. Mécaniques signature (Olympe) à venir en vagues suivantes.
import { cristaux_carrefour }         from './cristaux/cristaux_carrefour.js';
import { cristaux_galerie_marbre }    from './cristaux/cristaux_galerie_marbre.js';
import { cristaux_dallage_givre }     from './cristaux/cristaux_dallage_givre.js';
import { cristaux_pont_cristallin }   from './cristaux/cristaux_pont_cristallin.js';
import { cristaux_cour_tremplins }    from './cristaux/cristaux_cour_tremplins.js';
import { cristaux_puits_temple }      from './cristaux/cristaux_puits_temple.js';
import { cristaux_escalier_olympe }   from './cristaux/cristaux_escalier_olympe.js';
import { cristaux_coin_NE }           from './cristaux/cristaux_coin_NE.js';
import { cristaux_coin_NO }           from './cristaux/cristaux_coin_NO.js';
import { cristaux_coin_SE }           from './cristaux/cristaux_coin_SE.js';
import { cristaux_coin_SO }           from './cristaux/cristaux_coin_SO.js';
import { cristaux_t_NEO }             from './cristaux/cristaux_t_NEO.js';
import { cristaux_t_SEO }             from './cristaux/cristaux_t_SEO.js';
import { cristaux_t_NSO }             from './cristaux/cristaux_t_NSO.js';
import { cristaux_t_NSE }             from './cristaux/cristaux_t_NSE.js';
import { cristaux_impasse_N }         from './cristaux/cristaux_impasse_N.js';
import { cristaux_impasse_S }         from './cristaux/cristaux_impasse_S.js';
import { cristaux_impasse_E }         from './cristaux/cristaux_impasse_E.js';
import { cristaux_impasse_O }         from './cristaux/cristaux_impasse_O.js';
import { cristaux_plateaux_flottants } from './cristaux/cristaux_plateaux_flottants.js';
import { cristaux_ascension_sacree }  from './cristaux/cristaux_ascension_sacree.js';
// ─── Cristaux Glacés — Tranche 2 Vague 1 : signatures « Silence & Glace » ─
import { cristaux_chapelle_silence }  from './cristaux/cristaux_chapelle_silence.js';
import { cristaux_patinoire }         from './cristaux/cristaux_patinoire.js';
import { cristaux_choeur_mnesique }   from './cristaux/cristaux_choeur_mnesique.js';
import { cristaux_faille_du_present } from './cristaux/cristaux_faille_du_present.js';
// ─── Cristaux Glacés — Tranche 2 Vague 2 : signatures « Le Miroir » ─
import { cristaux_galerie_miroirs }   from './cristaux/cristaux_galerie_miroirs.js';
import { cristaux_pas_incertains }    from './cristaux/cristaux_pas_incertains.js';
import { cristaux_barrieres_phebus }  from './cristaux/cristaux_barrieres_phebus.js';
import { cristaux_salle_des_reflets } from './cristaux/cristaux_salle_des_reflets.js';

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
    // ─── Phase 9.4 Vague 1 : pool diversité (8 NSEO + 3 ciblées) ──
    // Garantit ≥ 8 candidats par config de portes. Style Mario/Rayman hard.
    ruines_grand_saut,          // NSEO — fosse + 3 plateformes flottantes
    ruines_tour_chute,          // NSEO — ascension sols effrités
    ruines_champignons,         // NSEO — ressorts catapultes + pieux plafond
    ruines_lames_pendulantes,   // NSEO — mobile sous pieux plafond (unique)
    ruines_ascension_ressort,   // NSEO — paliers étroits + 3 ressorts
    ruines_corniches_zigzag,    // NSEO — corniches 70 px en zigzag + pieux
    ruines_pont_effrite,        // NSEO — pont effrité au-dessus fosse (unique)
    ruines_voutes_brisees,      // NSEO — 3 étages empilés + ressorts
    ruines_tour_garde_alt,      // NE   — ascension droite punitive (alt)
    ruines_belvedere_pendule,   // NO   — mobile longue + fosse (unique)
    ruines_puits_double,        // NS   — 2 colonnes + ressorts (alt)

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
    halls_reseau_plaques,      // NEO  — 3 plaques pression puzzle (unique)
    // ─── Phase 9.6 : 11 salles diversité Halls (8 NSEO + 3 ciblées) ──
    halls_arene_braseros,      // NSEO — arène 4 brasiers quinconce
    halls_marteau_destructeur, // NSEO — séquence éboulis + mur explosif
    halls_fournaise_centrale,  // NSEO — foyer permanent énorme (unique)
    halls_tunnel_cendres,      // NSEO — 3 étages sols effrités
    halls_dais_du_marteau,     // NSEO — voûte basse pieux plafond (unique)
    halls_chaine_braseros,     // NSEO — 5 brasiers vague séquencée
    halls_fosse_explosive,     // NSEO — fosse mortelle + murs explosifs
    halls_cendres_eternelles,  // NSEO — multi-niveaux rocs tombants
    halls_ascension_NE,        // NE   — alt ascension foyers escalier
    halls_descente_SO,         // SO   — alt descente sols effrités
    halls_double_puits_NS,     // NS   — alt puits + murs explosifs
    // ─── Phase 9.7 : signatures nouvelles mécaniques ─────────────────
    halls_geyser_central,      // OE   — geyser permanent (unique)
    halls_rideau_acide_couloir,// OE   — 3 rideaux acide à sprinter (unique)
    halls_blocs_pousseurs,     // OE   — puzzle blocs charbon + brasiers (unique)
    halls_combo_total,         // NSEO — combo total geyser+acide+charbon (unique)
    halls_lave_jets,           // NS   — ascension verticale geysers (unique)
    // ─── Phase 9.8 : signatures medium-cost (marteau/piston/scie) ────
    halls_marteaux_pilons,     // OE   — 3 marteaux décalés (unique)
    halls_pistons_thermiques,  // OE   — 4 pistons latéraux + brasier (unique)
    halls_scies_couloir,       // OE   — 3 scies H+V (unique)
    halls_forge_meca,          // NSEO — combo marteau+piston+scie (unique)
    halls_arene_chaos,         // NSEO — combo v1+v2 méga (unique)

    // ─── Cristaux Glacés (Phase 9.x — 20 salles fondation) ────────
    // OE bus principal (4)
    cristaux_galerie_marbre,   // OE   — combat propre, estrade centrale
    cristaux_dallage_givre,    // OE   — gouffre + dalles effritées vs passerelle
    cristaux_pont_cristallin,  // OE   — navette mobile au-dessus du vide
    cristaux_cour_tremplins,   // OE   — mobilité aérienne ressorts
    // NS verticaux (2)
    cristaux_puits_temple,     // NS   — zigzag vertical + coffre
    cristaux_escalier_olympe,  // NS   — escalier monumental diagonal
    // Coins (4)
    cristaux_coin_NE,          // NE   — tour d'ascension droite
    cristaux_coin_NO,          // NO   — belvédère ascension gauche
    cristaux_coin_SE,          // SE   — descente + coffre votif
    cristaux_coin_SO,          // SO   — crypte votive
    // T (4)
    cristaux_t_NEO,            // NEO  — forum pyramide centrale
    cristaux_t_SEO,            // SEO  — carrefour offrandes + coffre
    cristaux_t_NSO,            // NSO  — passage vertical ouest
    cristaux_t_NSE,            // NSE  — passage vertical est
    // Deadends (4)
    cristaux_impasse_N,        // N    — corniche descente
    cristaux_impasse_S,        // S    — cella ascension coffre
    cristaux_impasse_E,        // E    — niche votive
    cristaux_impasse_O,        // O    — sanctuaire muré
    // Diversité NSEO (2)
    cristaux_plateaux_flottants, // NSEO — plateaux flottants gouffre
    cristaux_ascension_sacree,   // NSEO — grande ascension + ressorts
    // ─── Tranche 2 Vague 1 : signatures « Silence & Glace » (4) ───
    cristaux_chapelle_silence,   // OE   — stalactites de résonance (unique)
    cristaux_patinoire,          // OE   — verglas + stalagmites (unique)
    cristaux_choeur_mnesique,    // NSEO — chant révèle l'ascension (unique)
    cristaux_faille_du_present,  // OE   — failles de vide + blizzard (unique)
    // ─── Tranche 2 Vague 2 : signatures « Le Miroir » (4) ───
    cristaux_galerie_miroirs,    // OE   — faux sols miroirs (unique)
    cristaux_pas_incertains,     // OE   — plateformes-miroirs oscillantes (unique)
    cristaux_barrieres_phebus,   // OE   — barrières laser cycliques (unique)
    cristaux_salle_des_reflets   // NSEO — combo Miroir + ascension (unique)
];

// Salles "fallback universel" par biome — supportent NSEO et matchent toutes
// les configs. Tenues hors du pool normal pour préserver la variété, mais
// résolvables via sallePar() (si jamais référencées par useSalle) et via
// salleFallback() (quand le pool ne match aucune config demandée).
const PAR_ID_FALLBACK = {
    [ruines_carrefour_compact.id]: ruines_carrefour_compact,
    [halls_carrefour_brasier.id]: halls_carrefour_brasier,
    [cristaux_carrefour.id]: cristaux_carrefour
};

const FALLBACK_PAR_BIOME = {
    'ruines_basses': ruines_carrefour_compact,
    'halls_cendres': halls_carrefour_brasier,
    'cristaux_glaces': cristaux_carrefour
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
        // Pour Ruines, Halls et Cristaux (tous compacts, pool dense), on
        // ignore le filtre rolesAutorises pour maximiser la variété même
        // sur deadends. Pour biomes encore XL legacy (Voile, Cœur), filtre
        // normal pour préserver les salles signature des rôles main.
        const ignoreRole = biomeId === 'ruines_basses' || biomeId === 'halls_cendres'
                        || biomeId === 'cristaux_glaces';
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
