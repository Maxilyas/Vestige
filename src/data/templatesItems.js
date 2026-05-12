// Templates d'items Phase 6 — l'archétype "abstrait" d'un objet forgé.
//
// Un template définit :
//   - le SLOT cible (tete / corps / accessoire)
//   - la FAMILLE héritée (modifie probas affixes & couleur)
//   - les BIAIS de stats : poids relatif de chaque stat dans le tirage d'affixes
//   - les SORTS éligibles (pool d'IDs sortsId — un seul est tiré pour l'instance)
//   - le NOM générique affiché (ex : "Lame longue")
//
// Le score 0-100 (cf. ScoreSystem) détermine ensuite combien d'affixes sont
// effectivement tirés + s'il y a un sort + s'il y a une signature.

export const TEMPLATES = {
    // ============================================================
    // CORPS (armes)
    // ============================================================
    lame_longue: {
        id: 'lame_longue',
        nom: 'Lame longue',
        slot: 'corps',
        famille: 'blanc',
        biais: { attaqueDegats: 4, attaqueVitesse: 2, armure: 1 },
        sorts: ['eclat_aurore', 'lame_ascendante', 'taillade_tournoyante']
    },
    masse_brisee: {
        id: 'masse_brisee',
        nom: 'Masse brisée',
        slot: 'corps',
        famille: 'noir',
        biais: { attaqueDegats: 5, gardeMax: 2, armure: 1 },
        sorts: ['onde_de_choc', 'fracas_pesant', 'epine_de_reflux']
    },
    plastron_grave: {
        id: 'plastron_grave',
        nom: 'Plastron gravé',
        slot: 'corps',
        famille: 'blanc',
        biais: { armure: 5, gardeMax: 3, gardeRegen: 2 },
        sorts: ['mur_de_cendre', 'egide_blanche']
    },
    cuirasse_mirage: {
        id: 'cuirasse_mirage',
        nom: 'Cuirasse-mirage',
        slot: 'corps',
        famille: 'bleu',
        biais: { armure: 3, parryFenetre: 4, gardeMax: 3 },
        sorts: ['miroir_temporaire', 'esquive_dechiree']
    },

    // ============================================================
    // TÊTE (casques / diadèmes)
    // ============================================================
    diademe_pale: {
        id: 'diademe_pale',
        nom: 'Diadème pâle',
        slot: 'tete',
        famille: 'blanc',
        biais: { parryFenetre: 4, gardeRegen: 3, sautHauteur: 1 },
        sorts: ['nimbe_d_argent', 'pulsation_calme']
    },
    casque_brulant: {
        id: 'casque_brulant',
        nom: 'Casque brûlant',
        slot: 'tete',
        famille: 'noir',
        biais: { attaqueDegats: 3, attaqueVitesse: 4, armure: 2 },
        sorts: ['flamme_jumelee', 'ruee_ardente']
    },
    voile_bleu: {
        id: 'voile_bleu',
        nom: 'Voile de l\'eau dormante',
        slot: 'tete',
        famille: 'bleu',
        biais: { sautHauteur: 5, parryFenetre: 2, gardeMax: 2 },
        sorts: ['vague_suspendue', 'bond_du_reflet']
    },
    couronne_fracture: {
        id: 'couronne_fracture',
        nom: 'Couronne fracturée',
        slot: 'tete',
        famille: 'bleu',
        biais: { attaqueDegats: 3, parryFenetre: 3, gardeMax: 3 },
        sorts: ['rappel_de_l_ancien', 'couronne_de_lames']
    },

    // ============================================================
    // ACCESSOIRE (talismans / sceaux)
    // ============================================================
    talisman_eau: {
        id: 'talisman_eau',
        nom: 'Talisman d\'eau dormante',
        slot: 'accessoire',
        famille: 'blanc',
        biais: { gardeRegen: 4, gardeMax: 3, armure: 1 },
        sorts: ['sceau_de_garde', 'soin_lent']
    },
    sceau_de_braise: {
        id: 'sceau_de_braise',
        nom: 'Sceau de braise',
        slot: 'accessoire',
        famille: 'noir',
        biais: { attaqueDegats: 3, attaqueVitesse: 3, sautHauteur: 1 },
        sorts: ['braise_traversante', 'jaillissement']
    },
    anneau_silence: {
        id: 'anneau_silence',
        nom: 'Anneau de silence',
        slot: 'accessoire',
        famille: 'bleu',
        biais: { parryFenetre: 4, attaqueVitesse: 2, sautHauteur: 2 },
        sorts: ['silence_du_monde', 'pas_furtif']
    },
    focus_obsidienne: {
        id: 'focus_obsidienne',
        nom: 'Focus d\'obsidienne',
        slot: 'accessoire',
        famille: 'noir',
        biais: { attaqueDegats: 4, gardeMax: 2, parryFenetre: 2 },
        sorts: ['rayon_d_obsidienne', 'fracture_du_silence']
    },
    medaille_aube: {
        id: 'medaille_aube',
        nom: 'Médaille de l\'aube',
        slot: 'accessoire',
        famille: 'blanc',
        biais: { gardeRegen: 3, parryFenetre: 3, gardeMax: 2 },
        sorts: ['aube_partagee', 'eclat_protecteur']
    }
};

export const TEMPLATES_IDS = Object.keys(TEMPLATES);

export function getTemplate(id) {
    return TEMPLATES[id] ?? null;
}

/** Liste des templates compatibles avec un slot donné. */
export function templatesParSlot(slot) {
    return Object.values(TEMPLATES).filter(t => t.slot === slot);
}

/** Tire un template aléatoire (optionnellement contraint par slot/famille). */
export function tirerTemplate(rng, { slot = null, famille = null } = {}) {
    let pool = Object.values(TEMPLATES);
    if (slot) pool = pool.filter(t => t.slot === slot);
    if (famille) pool = pool.filter(t => t.famille === famille);
    if (pool.length === 0) pool = Object.values(TEMPLATES);
    return pool[Math.floor(rng() * pool.length)];
}
