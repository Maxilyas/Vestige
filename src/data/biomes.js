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
        ennemisPool: ['sentinelle_cendre', 'goule_volante', 'ombre_galopante', 'suintement'],
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
        ennemisPool: ['idole_fissuree', 'ombre_murmure', 'coureur_cendre', 'cracheur_pale'],
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
        ennemisPool: ['colosse_voile', 'larme_tisseuse', 'rage_du_voile', 'voix_lointaine'],
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
        ennemisPool: ['veilleur_reflux', 'cri_du_reflux', 'tonnerre_reflux', 'oeil_du_reflux'],
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
