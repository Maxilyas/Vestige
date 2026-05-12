// Sorts Phase 6 — bibliothèque d'actions invoquées via les touches 1/2/3.
// Chaque item équipé peut porter un sort, octroyé selon le score (>=70 = chance,
// >=90 = garanti). L'effet runtime est exécuté par SortSystem.
//
// Format :
//   id, label affichable, description courte (cachée jusqu'à révélation),
//   code : identifiant logique consommé par SortSystem,
//   cooldownMs : cooldown propre au sort,
//   coutResonance : coût en Résonance (0 par défaut, >0 pour signatures puissantes),
//   params : payload technique (portée, dégâts, durée, etc.)

export const SORTS = {
    // ============================================================
    // CORPS — Lame longue
    // ============================================================
    eclat_aurore: {
        id: 'eclat_aurore',
        label: 'Éclat d\'Aurore',
        description: 'Tir conique de lumière (5 dmg, 220 px).',
        code: 'tir_conique',
        cooldownMs: 7000,
        coutResonance: 0,
        params: { degats: 5, portee: 220, couleur: 0xffd070 }
    },
    lame_ascendante: {
        id: 'lame_ascendante',
        label: 'Lame ascendante',
        description: 'Bond vers le haut + onde tranchante.',
        code: 'bond_aoe',
        cooldownMs: 9000,
        coutResonance: 0,
        params: { vy: -540, portee: 110, degats: 6 }
    },
    taillade_tournoyante: {
        id: 'taillade_tournoyante',
        label: 'Taillade tournoyante',
        description: 'Tu pivotes : 3 hits à 360°.',
        code: 'spin',
        cooldownMs: 11000,
        coutResonance: 5,
        params: { rayon: 130, degats: 4, hits: 3 }
    },

    // ============================================================
    // CORPS — Masse brisée
    // ============================================================
    onde_de_choc: {
        id: 'onde_de_choc',
        label: 'Onde de choc',
        description: 'Saute haut : à l\'atterrissage, AOE.',
        code: 'aoe_au_sol',
        cooldownMs: 8000,
        coutResonance: 0,
        params: { rayon: 150, degats: 5 }
    },
    fracas_pesant: {
        id: 'fracas_pesant',
        label: 'Fracas pesant',
        description: 'Plante la masse devant toi (8 dmg, 120 px, knockback).',
        code: 'frappe_lourde',
        cooldownMs: 10000,
        coutResonance: 0,
        params: { portee: 120, degats: 8, knockback: 250 }
    },
    epine_de_reflux: {
        id: 'epine_de_reflux',
        label: 'Épine du Reflux',
        description: 'Une pointe noire jaillit du sol devant.',
        code: 'pointe_devant',
        cooldownMs: 9000,
        coutResonance: 5,
        params: { portee: 180, degats: 7, hauteur: 60 }
    },

    // ============================================================
    // CORPS — Plastron / Cuirasse
    // ============================================================
    mur_de_cendre: {
        id: 'mur_de_cendre',
        label: 'Mur de cendre',
        description: 'Pose un mur d\'air solidifié 4s.',
        code: 'mur_temporaire',
        cooldownMs: 14000,
        coutResonance: 0,
        params: { largeur: 70, hauteur: 120, duree: 4000 }
    },
    egide_blanche: {
        id: 'egide_blanche',
        label: 'Égide blanche',
        description: '+30 Garde temporaire (8s).',
        code: 'buff_garde',
        cooldownMs: 18000,
        coutResonance: 0,
        params: { bonusGarde: 30, duree: 8000 }
    },
    miroir_temporaire: {
        id: 'miroir_temporaire',
        label: 'Miroir temporaire',
        description: '2s d\'invulnérabilité, renvoie les projectiles.',
        code: 'miroir_invu',
        cooldownMs: 20000,
        coutResonance: 8,
        params: { duree: 2000 }
    },
    esquive_dechiree: {
        id: 'esquive_dechiree',
        label: 'Esquive déchirée',
        description: 'Dash latéral + intangible.',
        code: 'dash_invu',
        cooldownMs: 6000,
        coutResonance: 0,
        params: { distance: 220, duree: 250 }
    },

    // ============================================================
    // TÊTE
    // ============================================================
    nimbe_d_argent: {
        id: 'nimbe_d_argent',
        label: 'Nimbe d\'argent',
        description: 'Tu es lumineux 5s : -50 % dégâts subis.',
        code: 'buff_armure',
        cooldownMs: 22000,
        coutResonance: 0,
        params: { reductionPct: 50, duree: 5000 }
    },
    pulsation_calme: {
        id: 'pulsation_calme',
        label: 'Pulsation calme',
        description: 'Restaure 20 Résonance.',
        code: 'heal_resonance',
        cooldownMs: 30000,
        coutResonance: 0,
        params: { gain: 20 }
    },
    flamme_jumelee: {
        id: 'flamme_jumelee',
        label: 'Flamme jumelée',
        description: 'Deux orbes téléguidés (4 dmg chacun).',
        code: 'projectile_homing',
        cooldownMs: 8000,
        coutResonance: 0,
        params: { nb: 2, degats: 4, portee: 300, couleur: 0xff8040 }
    },
    ruee_ardente: {
        id: 'ruee_ardente',
        label: 'Ruée ardente',
        description: 'Charge horizontale (260 px) qui brûle.',
        code: 'charge_horizontale',
        cooldownMs: 10000,
        coutResonance: 0,
        params: { distance: 260, degats: 5 }
    },
    vague_suspendue: {
        id: 'vague_suspendue',
        label: 'Vague suspendue',
        description: 'Mur d\'eau ascendant — pousse les ennemis vers le haut.',
        code: 'aoe_souleve',
        cooldownMs: 11000,
        coutResonance: 0,
        params: { portee: 200, degats: 3, vy: -360 }
    },
    bond_du_reflet: {
        id: 'bond_du_reflet',
        label: 'Bond du reflet',
        description: 'Double saut bonus + invu courte à l\'apex.',
        code: 'super_saut',
        cooldownMs: 12000,
        coutResonance: 0,
        params: { vy: -620, invuMs: 400 }
    },
    rappel_de_l_ancien: {
        id: 'rappel_de_l_ancien',
        label: 'Rappel de l\'Ancien',
        description: 'Téléporte à ton point d\'entrée de salle, soigne 10.',
        code: 'tp_entree',
        cooldownMs: 25000,
        coutResonance: 0,
        params: { soin: 10 }
    },
    couronne_de_lames: {
        id: 'couronne_de_lames',
        label: 'Couronne de lames',
        description: '4 lames orbitent autour de toi 6s.',
        code: 'orbe_arme',
        cooldownMs: 18000,
        coutResonance: 5,
        params: { nb: 4, degats: 3, duree: 6000, rayon: 80 }
    },

    // ============================================================
    // ACCESSOIRE
    // ============================================================
    sceau_de_garde: {
        id: 'sceau_de_garde',
        label: 'Sceau de garde',
        description: 'Regen Garde ×3 pendant 6s.',
        code: 'buff_regen_garde',
        cooldownMs: 16000,
        coutResonance: 0,
        params: { multi: 3, duree: 6000 }
    },
    soin_lent: {
        id: 'soin_lent',
        label: 'Soin lent',
        description: 'Régen Résonance 2/s pendant 6s.',
        code: 'heal_lent',
        cooldownMs: 20000,
        coutResonance: 0,
        params: { gainParSec: 2, duree: 6000 }
    },
    braise_traversante: {
        id: 'braise_traversante',
        label: 'Braise traversante',
        description: 'Tir qui traverse, brûle au passage.',
        code: 'projectile_perce',
        cooldownMs: 8000,
        coutResonance: 0,
        params: { degats: 5, portee: 380, couleur: 0xff6040 }
    },
    jaillissement: {
        id: 'jaillissement',
        label: 'Jaillissement',
        description: '3 jets de braise en éventail.',
        code: 'projectile_eventail',
        cooldownMs: 9000,
        coutResonance: 0,
        params: { nb: 3, degats: 3, portee: 280, couleur: 0xff8040 }
    },
    silence_du_monde: {
        id: 'silence_du_monde',
        label: 'Silence du monde',
        description: 'Tous les ennemis à 250 px figés 2s.',
        code: 'gel_zone',
        cooldownMs: 22000,
        coutResonance: 10,
        params: { rayon: 250, duree: 2000 }
    },
    pas_furtif: {
        id: 'pas_furtif',
        label: 'Pas furtif',
        description: 'Invisible aux ennemis 3s.',
        code: 'invisibilite',
        cooldownMs: 18000,
        coutResonance: 0,
        params: { duree: 3000 }
    },
    rayon_d_obsidienne: {
        id: 'rayon_d_obsidienne',
        label: 'Rayon d\'obsidienne',
        description: 'Faisceau noir continu 1s (10 dmg total).',
        code: 'rayon',
        cooldownMs: 14000,
        coutResonance: 5,
        params: { duree: 1000, degats: 10, portee: 280 }
    },
    fracture_du_silence: {
        id: 'fracture_du_silence',
        label: 'Fracture du silence',
        description: 'Téléporte à ton dernier ennemi frappé.',
        code: 'tp_dernier_hit',
        cooldownMs: 15000,
        coutResonance: 0,
        params: {}
    },
    aube_partagee: {
        id: 'aube_partagee',
        label: 'Aube partagée',
        description: 'Aura : +30% vitesse d\'attaque 5s.',
        code: 'buff_aspd',
        cooldownMs: 18000,
        coutResonance: 0,
        params: { bonusPct: 30, duree: 5000 }
    },
    eclat_protecteur: {
        id: 'eclat_protecteur',
        label: 'Éclat protecteur',
        description: 'Restaure 25 Garde immédiatement.',
        code: 'heal_garde',
        cooldownMs: 14000,
        coutResonance: 0,
        params: { gain: 25 }
    }
};

export const SORTS_IDS = Object.keys(SORTS);

export function getSort(id) {
    return SORTS[id] ?? null;
}
