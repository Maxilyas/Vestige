// Biomes — 5 zones de 2 étages chacune, avec progression artistique.
//
// Chaque biome définit :
//   - une palette dominante (utilisée pour teinter ennemis + ambiance)
//   - un pool d'ennemis qui apparaît dans ses étages
//   - une plage de densité (nombre d'ennemis par salle non-entrée)
//   - les archétypes architecturaux autorisés
//
// La progression visuelle suit la doctrine "destruction → reflux pur" :
//   1-2  Ruines basses    : verts terreux, racines, mousses (départ humble)
//   3-4  Halls Cendrés    : ambres, gris cendreux (les feux brûlent encore)
//   5-6  Cristaux Glacés  : bleus glaciaux (la mémoire se cristallise)
//   7-8  Voile Inversé    : violets spectraux (le tissu du monde se déchire)
//   9-10 Cœur du Reflux   : noir / rouge cramoisi (l'origine du Reflux)

export const BIOMES = {
    ruines_basses: {
        id: 'ruines_basses',
        nom: 'Ruines basses',
        etages: [1, 2],
        archetypesAutorises: ['sanctuaire', 'hall', 'crypte', 'pont'],
        niveauxDanger: [0, 1],
        palette: {
            tinte: 0x6a8a5a,        // teinte glob (subtle tint sur les éléments thématiques)
            ambiance: 0x3a4a3a,
            accent: 0xc8a85a
        },
        // Phase 5' — palette enrichie peinte par-dessus PALETTE_PRESENT au runtime.
        // Direction artistique : aube voilée matin, mélancolique paisible. La ruine
        // est ancienne, la mousse a repris ses droits, les racines pourpres percent
        // la pierre — premier présage discret du Reflux à venir.
        paletteBiome: {
            // Ciel : aube voilée, brun-vert pâle qui tire vers le sol obscur
            fond: '#1a1f18',
            fondGradientHaut: '#3a4838',
            fondGradientMid:  '#202820',
            fondGradientBas:  '#0e120c',

            // Plateformes : pierre humide vert-gris, contour herbe vivace,
            // ornements pourpres (racines qui transpercent la roche)
            plateforme:          0x3a463a,
            plateformeContour:   0x5a6a52,
            plateformeOrnement:  0x6a3060,

            // Structures pierre — trois tons pour le volume painterly
            pierre:        0x5a6850,
            pierreSombre:  0x2a352a,
            pierreClaire:  0x7a8a6a,

            // Signature biome : mousse vivace + racines pourpres saturées
            mousse:  0x4a6240,
            racine:  0x6a2070,
            accent:  0x88643a, // or terni (les ruines ont gardé un peu d'éclat)

            // Atmosphère : brume verte-grise, poussière vert pâle (les lucioles
            // de l'Étape 4 viendront se superposer en mode ADD)
            brume:     0x3a5448,
            particule: 0xb8c89a
        },
        // Pool pondéré : 4 basics × 3 copies + 6 innovants × 2 copies = 24 entries
        // → ~50% basics, ~50% innovants. Courbe d'apprentissage douce (le
        // joueur voit majoritairement les basics au début, puis croise les
        // innovants régulièrement). Refactor en `{id, poids}` plus tard si besoin.
        ennemisPool: [
            'gardien_pierre', 'gardien_pierre', 'gardien_pierre',
            'spectre_cendre', 'spectre_cendre', 'spectre_cendre',
            'belier_brise',   'belier_brise',   'belier_brise',
            'oeil_temoin',    'oeil_temoin',    'oeil_temoin',
            'statue_eveillee',    'statue_eveillee',
            'racine_etouffante',  'racine_etouffante',
            'mousse_glissante',   'mousse_glissante',
            'tombe_eclatee',      'tombe_eclatee',
            'vautour_debris',     'vautour_debris',
            'champignon_spore',   'champignon_spore'
        ],
        densite: { min: 2, max: 4 }
    },
    halls_cendres: {
        id: 'halls_cendres',
        nom: 'Halls Cendrés',
        etages: [3, 4],
        archetypesAutorises: ['sanctuaire', 'hall', 'crypte', 'pont', 'puits'],
        niveauxDanger: [1, 2],
        palette: {
            tinte: 0xc89060,
            ambiance: 0x6a4a3a,
            accent: 0xffa040
        },
        // Phase 5'.3 — palette enrichie peinte par-dessus PALETTE_PRESENT au runtime.
        // Direction artistique : seuil hybride intérieur/extérieur — le joueur sort
        // des Ruines mousseuses et entre dans une grande nef funéraire éventrée.
        // Plafond voûté cassé au-dessus, ciel cendreux visible entre les fissures.
        // Atmosphère SÈCHE, ÉTOUFFANTE, AMBRÉE — opposée à l'humide vert mélancolique
        // des Ruines. "Les feux brûlent encore" : foyers résiduels qui s'éteignent
        // au fil des étages (étage 3 vifs, étage 4 mourants — narratif "derniers feux").
        // Signature bi-ton : braises actives orange vif ↔ foyers éteints cuivre terni.
        paletteBiome: {
            // Ciel hybride seuil : haut = plafond fendu (gris-violet sombre, nuit
            // qui filtre par les brisures) → mid = lumière rasante ambrée poussiéreuse
            // qui traverse la cendre en suspension → bas = suie noire au sol.
            fond: '#0c0806',
            fondGradientHaut: '#2a1e22',
            fondGradientMid:  '#5a3a22',
            fondGradientBas:  '#1a0e08',

            // Plateformes : pierre carbonisée gris-anthracite. Top légèrement plus
            // clair (poussière de cendre qui s'est déposée). Ornement = braise vive
            // (lecture "ici on marche" mais aussi "ça brûle encore").
            plateforme:          0x2e2620,
            plateformeContour:   0x5a4030,
            plateformeOrnement:  0xff7028,

            // Pierre 3 tons cendrés — pour le volume painterly des structures
            pierre:        0x3e3128,
            pierreSombre:  0x1a1208,
            pierreClaire:  0x6e5440,

            // Signature biome — réinterprète les slots mousse/racine des Ruines :
            //   `mousse` → suie (dépôts noirs profonds au lieu de mousse verdoyante)
            //   `racine` → braise active (orange chaud vif au lieu de pourpre)
            //   `accent` → cuivre terni (or éteint, feu mourant — pour le bi-ton)
            mousse:  0x18120e,
            racine:  0xff6020,
            accent:  0xa86838,

            // Atmosphère : fumée stagnante ambrée (vs brume verte) + escarbilles
            // orangées en suspension (vs poussière vert pâle des lucioles)
            brume:     0x4a2e1a,
            particule: 0xffaa50
        },
        // Pool pondéré (cf. ruines_basses) : 4 basics × 3 + 6 innovants × 2 = 24
        ennemisPool: [
            'sentinelle_cendre', 'sentinelle_cendre', 'sentinelle_cendre',
            'goule_volante',     'goule_volante',     'goule_volante',
            'ombre_galopante',   'ombre_galopante',   'ombre_galopante',
            'suintement',        'suintement',        'suintement',
            'chandelier_vivant',     'chandelier_vivant',
            'bruleur_lent',          'bruleur_lent',
            'cendre_tisseuse',       'cendre_tisseuse',
            'ardent_miroir',         'ardent_miroir',
            'soupir_glacial',        'soupir_glacial',
            'tisseur_embrasement',   'tisseur_embrasement'
        ],
        densite: { min: 3, max: 5 }
    },
    cristaux_glaces: {
        id: 'cristaux_glaces',
        nom: 'Cristaux Glacés',
        etages: [5, 6],
        archetypesAutorises: ['hall', 'crypte', 'pont', 'puits', 'arene'],
        niveauxDanger: [2],
        palette: {
            tinte: 0x80b0e0,
            ambiance: 0x3a5a8a,
            accent: 0xa0d0ff
        },
        // Phase 5'.8 — palette enrichie peinte par-dessus PALETTE_PRESENT au runtime.
        // Direction artistique : "Sanctuaire Suspendu" — pic acéré au-dessus de la
        // cathédrale en flammes des Halls. Les Sources stockaient leurs mémoires
        // ici, dans des cristaux mnésiques. Le froid n'est pas saisonnier : c'est
        // un ARRÊT DU TEMPS. La pierre s'est minéralisée, les cristaux pulsent à
        // un rythme géologique, le silence est dense.
        // Continuité Halls→Cristaux : les escarbilles des Halls retombent ici
        // figées en flocons cristallins (cendre gelée, pas neige naturelle).
        // Préfigure le Voile Inversé via des accents POURPRE-VIOLET sur les
        // cristaux mnésiques (équivalent narratif des racines pourpres des Ruines
        // qui annonçaient le Reflux).
        paletteBiome: {
            // Ciel : pic suspendu au-dessus du monde. Haut = nuit cosmique pâle,
            // mid = lumière cristalline filtrée par les pics lointains, bas =
            // abîme noir-bleuté (le pic flotte, pas de sol en-dessous visible).
            fond: '#040814',
            fondGradientHaut: '#0e1830',
            fondGradientMid:  '#3a5e88',
            fondGradientBas:  '#020610',

            // Plateformes : pierre minéralisée gelée bleu profond. Top highlight
            // = givre bleu pâle (lecture "ici on marche, mais c'est froid").
            // Ornement = cristal mnésique violet pâle (lumière intérieure).
            plateforme:          0x2a4262,
            plateformeContour:   0x6a92c8,
            plateformeOrnement:  0xb898e8,

            // Pierre 3 tons gelés — volume painterly des structures
            pierre:        0x365072,
            pierreSombre:  0x121828,
            pierreClaire:  0x6890b8,

            // Signature biome — réinterprète les slots mousse/racine/accent :
            //   `mousse` → givre (croûtes fines blanc-bleu, vs suie noire Halls)
            //   `racine` → cristal mnésique (violet pâle, vs braise orange Halls)
            //              — préfiguration discrète du Voile Inversé
            //   `accent` → argent-nacre (lumière froide réfléchissante,
            //              vs cuivre terni Halls)
            mousse:  0xa8c8e8,
            racine:  0xb898e8,
            accent:  0xc8d8e8,

            // Atmosphère : brume glacée diffuse (vs fumée ambrée Halls) +
            // flocons de cendre figée en suspension lente (vs escarbilles
            // orangées Halls — même particule narrative, état figé)
            brume:     0x4a6890,
            particule: 0xd8e8ff
        },
        ennemisPool: [
            'idole_fissuree',  'idole_fissuree',  'idole_fissuree',
            'ombre_murmure',   'ombre_murmure',   'ombre_murmure',
            'coureur_cendre',  'coureur_cendre',  'coureur_cendre',
            'cracheur_pale',   'cracheur_pale',   'cracheur_pale',
            'cristal_prisme',         'cristal_prisme',
            'givre_tisseur',          'givre_tisseur',
            'eclat_multiplicateur',   'eclat_multiplicateur',
            'reflet_double',          'reflet_double',
            'anneau_glace',           'anneau_glace',
            'polariseur',             'polariseur'
        ],
        densite: { min: 4, max: 6 }
    },
    voile_inverse: {
        id: 'voile_inverse',
        nom: 'Voile Inversé',
        etages: [7, 8],
        archetypesAutorises: ['hall', 'crypte', 'pont', 'puits', 'arene'],
        niveauxDanger: [2, 3],
        palette: {
            tinte: 0xa080d0,
            ambiance: 0x4a2a6a,
            accent: 0xc080ff
        },
        ennemisPool: [
            'colosse_voile',  'colosse_voile',  'colosse_voile',
            'larme_tisseuse', 'larme_tisseuse', 'larme_tisseuse',
            'rage_du_voile',  'rage_du_voile',  'rage_du_voile',
            'voix_lointaine', 'voix_lointaine', 'voix_lointaine',
            'anti_bond',          'anti_bond',
            'anti_parry',         'anti_parry',
            'mirage',             'mirage',
            'inverseur_gravite',  'inverseur_gravite',
            'trou_memoire',       'trou_memoire',
            'reflux_eclat',       'reflux_eclat'
        ],
        densite: { min: 5, max: 8 }
    },
    coeur_reflux: {
        id: 'coeur_reflux',
        nom: 'Cœur du Reflux',
        etages: [9, 10],
        archetypesAutorises: ['hall', 'crypte', 'puits', 'arene'],
        niveauxDanger: [3],
        palette: {
            tinte: 0xc02030,
            ambiance: 0x3a0a1a,
            accent: 0xff4040
        },
        ennemisPool: [
            'veilleur_reflux',  'veilleur_reflux',  'veilleur_reflux',
            'cri_du_reflux',    'cri_du_reflux',    'cri_du_reflux',
            'tonnerre_reflux',  'tonnerre_reflux',  'tonnerre_reflux',
            'oeil_du_reflux',   'oeil_du_reflux',   'oeil_du_reflux',
            'coeur_fragmente',    'coeur_fragmente',
            'brisure_tisseuse',   'brisure_tisseuse',
            'regard_reflux',      'regard_reflux',
            'esprit_divise',      'esprit_divise',
            'annihilateur',       'annihilateur',
            'coherence_eroder',   'coherence_eroder'
        ],
        densite: { min: 7, max: 12 }
    }
};

/**
 * Renvoie le biome pour un étage donné (1..10).
 */
export function biomePourEtage(numero) {
    if (numero <= 2) return BIOMES.ruines_basses;
    if (numero <= 4) return BIOMES.halls_cendres;
    if (numero <= 6) return BIOMES.cristaux_glaces;
    if (numero <= 8) return BIOMES.voile_inverse;
    return BIOMES.coeur_reflux;
}

/**
 * Renvoie la `paletteBiome` (overrides peints sur PALETTE_PRESENT) pour un
 * biomeId, ou `null` si le biome n'a pas (encore) sa palette enrichie.
 * Utilisé par GameScene pour alimenter le registry, puis lu par les helpers
 * de rendu via `paletteCouranteScene`.
 */
export function paletteBiomePourId(biomeId) {
    return BIOMES[biomeId]?.paletteBiome || null;
}
