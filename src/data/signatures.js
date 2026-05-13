// Signatures Phase 6 — effets éditoriaux uniques pour les items score ≥ 95.
// Chaque signature porte un NOM PROPRE et un effet "game-changer" subtil mais
// distinctif. Affichées en italique doré sous le template (ex : "Lame longue
// — Aube de la Septième Cendre").
//
// L'effet réel est consommé par les systèmes via le flag. Une signature peut
// modifier un proc existant, en débloquer un nouveau, ou modifier les règles
// du sort de l'item.

export const SIGNATURES = {
    aube_septieme: {
        id: 'aube_septieme',
        nom: 'Aube de la Septième Cendre',
        slot: 'corps',
        description: 'Tes 3 premières attaques dans une salle infligent +50 % de dégâts.',
        flag: 'sig_aube_septieme',
        params: { hitsBoostes: 3, bonusPct: 0.5 }
    },
    coeur_de_marbre: {
        id: 'coeur_de_marbre',
        nom: 'Cœur de Marbre',
        slot: 'corps',
        description: 'Ta Garde n\'est jamais brisée d\'un seul coup : plafond de dégâts à 50 % de la Garde max.',
        flag: 'sig_coeur_marbre',
        params: { plafondPct: 0.5 }
    },
    serment_du_vide: {
        id: 'serment_du_vide',
        nom: 'Serment du Vide',
        slot: 'corps',
        description: 'À zéro Garde, +35 % de dégâts infligés.',
        flag: 'sig_serment_vide',
        params: { bonusPct: 0.35 }
    },
    derniere_neige: {
        id: 'derniere_neige',
        nom: 'Dernière Neige',
        slot: 'tete',
        description: 'À 30 % de Résonance ou moins, les ennemis sont ralentis de moitié autour de toi.',
        flag: 'sig_derniere_neige',
        params: { seuilPct: 0.3, ralentissementPct: 0.5, rayon: 200 }
    },
    pas_du_souverain: {
        id: 'pas_du_souverain',
        nom: 'Pas du Souverain',
        slot: 'tete',
        description: 'Toucher le sol après un saut court (>0.5s en l\'air) crée un éclat (3 dmg, 80 px).',
        flag: 'sig_pas_souverain',
        params: { delaiAirMs: 500, degats: 3, portee: 80 }
    },
    diademe_jumel: {
        id: 'diademe_jumel',
        nom: 'Diadème Jumelé',
        slot: 'tete',
        description: 'Ton sort de tête a son cooldown réduit de 30 %.',
        flag: 'sig_diademe_jumel',
        params: { reductionPct: 0.3 }
    },
    sceau_du_marcheur: {
        id: 'sceau_du_marcheur',
        nom: 'Sceau du Marcheur',
        slot: 'accessoire',
        description: 'Le premier ennemi tué dans chaque salle drop +50 % de Sel.',
        flag: 'sig_marcheur',
        params: { bonusPct: 0.5 }
    },
    main_de_l_eclair: {
        id: 'main_de_l_eclair',
        nom: 'Main de l\'Éclair',
        slot: 'accessoire',
        description: 'Tes parries enchaînés (< 1.5s) cumulent +10 % dégâts (max 5).',
        flag: 'sig_main_eclair',
        params: { fenetreMs: 1500, bonusParStack: 0.1, maxStack: 5 }
    },
    couronne_pluriel: {
        id: 'couronne_pluriel',
        nom: 'Couronne Plurielle',
        slot: 'accessoire',
        description: 'Tu peux porter un sort de Geste supplémentaire (touche 4).',
        flag: 'sig_couronne_pluriel',
        params: {}
    },
    echo_perpetuel: {
        id: 'echo_perpetuel',
        nom: 'Écho Perpétuel',
        slot: 'accessoire',
        description: 'Ton dernier sort utilisé se relance gratuitement après 8s.',
        flag: 'sig_echo_perpetuel',
        params: { delaiMs: 8000 }
    },
    lame_qui_se_souvient: {
        id: 'lame_qui_se_souvient',
        nom: 'Lame qui se Souvient',
        slot: 'corps',
        description: 'Chaque ennemi tué te rend invisible 0.5s.',
        flag: 'sig_lame_souvient',
        params: { dureeMs: 500 }
    },
    voile_du_temps: {
        id: 'voile_du_temps',
        nom: 'Voile du Temps',
        slot: 'tete',
        description: 'Premier coup létal de chaque salle te laisse à 1 PV au lieu de tuer.',
        flag: 'sig_voile_temps',
        params: {}
    },
    larme_irreversible: {
        id: 'larme_irreversible',
        nom: 'Larme Irréversible',
        slot: 'accessoire',
        description: 'À chaque entrée de salle, restaure 100 % Garde.',
        flag: 'sig_larme_irreversible',
        params: {}
    },
    serment_du_dernier_souffle: {
        id: 'serment_du_dernier_souffle',
        nom: 'Serment du Dernier Souffle',
        slot: 'corps',
        description: 'Sous 20 PV de Résonance, +100 % vitesse d\'attaque.',
        flag: 'sig_dernier_souffle',
        params: { seuilPv: 20, bonusPct: 1.0 }
    },
    fer_qui_n_oublie: {
        id: 'fer_qui_n_oublie',
        nom: 'Fer qui n\'Oublie',
        slot: 'corps',
        description: 'Tes coups marquent l\'ennemi : +30 % dégâts sur la cible marquée.',
        flag: 'sig_fer_marque',
        params: { bonusPct: 0.3, dureeMs: 4000 }
    },
    couronne_des_quatre_vents: {
        id: 'couronne_des_quatre_vents',
        nom: 'Couronne des Quatre Vents',
        slot: 'tete',
        description: 'Toutes les 8s, un éclat de vent te suit et frappe l\'ennemi le plus proche.',
        flag: 'sig_quatre_vents',
        params: { intervalle: 8000, degats: 5 }
    },
    main_qui_n_oublie: {
        id: 'main_qui_n_oublie',
        nom: 'Main qui n\'Oublie',
        slot: 'accessoire',
        description: 'Chaque sort utilisé augmente tes dégâts de +5 % (max 30 %, reset à la mort).',
        flag: 'sig_main_oublie',
        params: { bonusParStack: 0.05, maxStack: 6 }
    },
    eclat_renverse: {
        id: 'eclat_renverse',
        nom: 'Éclat Renversé',
        slot: 'corps',
        description: 'Tes dégâts critiques renvoient 30 % de leur valeur en Résonance.',
        flag: 'sig_eclat_renverse',
        params: { retourPct: 0.3 }
    },
    pierre_d_avant: {
        id: 'pierre_d_avant',
        nom: 'Pierre d\'Avant',
        slot: 'accessoire',
        description: 'Chaque parry réussi rajoute 0.5 s au cooldown du parry de l\'ennemi.',
        flag: 'sig_pierre_avant',
        params: { ajoutMs: 500 }
    },
    voile_des_ages: {
        id: 'voile_des_ages',
        nom: 'Voile des Âges',
        slot: 'tete',
        description: 'À 100 % Garde, prendre des dégâts ne consomme que la Garde (immune Résonance).',
        flag: 'sig_voile_ages',
        params: {}
    }
};

export const SIGNATURES_IDS = Object.keys(SIGNATURES);

export function getSignature(id) {
    return SIGNATURES[id] ?? null;
}

/** Liste des signatures compatibles avec un slot. */
export function signaturesParSlot(slot) {
    return Object.values(SIGNATURES).filter(s => s.slot === slot);
}

/** Tire une signature aléatoire compatible avec le slot. */
export function tirerSignature(slot, rng) {
    const pool = signaturesParSlot(slot);
    if (pool.length === 0) return null;
    return pool[Math.floor(rng() * pool.length)];
}
