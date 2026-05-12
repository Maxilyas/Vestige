// Vestiges — Phase 5b. Items signature de boss.
//
// CATÉGORIE DISTINCTE des items équipement (tête/corps/accessoire). Les
// Vestiges occupent leurs 3 slots dédiés dans le HUD :
//   - 1 slot Geste     → capacité active, déclenchée par touche V
//   - 2 slots Maîtrise → capacités passives, empilent leurs effets
//
// Chaque Vestige est UNIQUE et drop uniquement à la mort du boss correspondant
// (jamais dans les coffres, jamais à la vitrine Marchand). Si tu meurs et
// re-tue le boss, le Vestige redrop UNIQUEMENT s'il n'est pas déjà en
// inventaire ni équipé.
//
// PRÉPARATION PHASE 6 (refonte loot) : les champs `combinable`, `geste.code`
// et `flags` sont pensés extensibles pour le futur système de combinaisons
// (touches 1/2/3 par slot équipement, amélioration via stats consommées, etc.).

// ============================================================
// CATALOGUE
// ============================================================
export const VESTIGES = {
    // ─── Étage 1 — Roi de Pierre ───────────────────────────────
    coeur_pierreux: {
        id: 'coeur_pierreux',
        nom: 'Cœur Pierreux',
        famille: 'vestige',
        slot: 'vestige',
        tier: 1,
        categorie: 'vestige',
        sousType: 'maitrise',
        boss: 1,
        description: "Une pierre arrachée au cœur du Roi. Elle pèse, mais elle te retient au monde.",
        effets: [{ cible: 'resonanceMax', delta: 20, visible: true }],
        flags: null,
        geste: null,
        combinable: true
    },

    // ─── Étage 2 — Effigie Brisée ──────────────────────────────
    oeil_saigne: {
        id: 'oeil_saigne',
        nom: 'Œil Saigné',
        famille: 'vestige',
        slot: 'vestige',
        tier: 1,
        categorie: 'vestige',
        sousType: 'maitrise',
        boss: 2,
        description: "L'œil de l'Effigie a pleuré une dernière fois sur toi. Tu vois ce que tu ne pouvais pas voir.",
        effets: [
            { cible: 'parryFenetre', delta: 100, visible: true },
            { cible: 'bonusRetour', delta: 50, visible: true }
        ],
        flags: { revelationTotale: true },
        geste: null,
        combinable: true
    },

    // ─── Étage 3 — Marteau-Glas ────────────────────────────────
    onde_du_glas: {
        id: 'onde_du_glas',
        nom: 'Onde du Glas',
        famille: 'vestige',
        slot: 'vestige',
        tier: 1,
        categorie: 'vestige',
        sousType: 'geste',
        boss: 3,
        description: "Le souffle du Marteau-Glas, condensé. Sa frappe résonne dans toute la salle.",
        effets: [],
        flags: null,
        geste: {
            code: 'onde_du_glas',
            cooldownMs: 1800,
            params: { degats: 6, portee: 180, hauteur: 60 }
        },
        combinable: true
    },

    // ─── Étage 4 — Tisseur de Cendre ───────────────────────────
    filet_de_cendre: {
        id: 'filet_de_cendre',
        nom: 'Filet de Cendre',
        famille: 'vestige',
        slot: 'vestige',
        tier: 1,
        categorie: 'vestige',
        sousType: 'geste',
        boss: 4,
        description: "Le Tisseur t'a laissé la trame de son geste. Un trait noir part de toi, droit, rapide.",
        effets: [],
        flags: null,
        geste: {
            code: 'filet_de_cendre',
            cooldownMs: 600,
            params: { degats: 4, vitesse: 520, portee: 600 }
        },
        combinable: true
    },

    // ─── Étage 5 — Voix de l'Abîme ─────────────────────────────
    voix_profonde: {
        id: 'voix_profonde',
        nom: 'Voix Profonde',
        famille: 'vestige',
        slot: 'vestige',
        tier: 1,
        categorie: 'vestige',
        sousType: 'maitrise',
        boss: 5,
        description: "L'Abîme te porte. Là où tu retombais, tu peux désormais t'élever encore.",
        effets: [],
        flags: { doubleSaut: true },
        geste: null,
        combinable: true
    },

    // ─── Étage 6 — Œil Sans Fin ────────────────────────────────
    oeil_temoin_boss: {
        id: 'oeil_temoin_boss',
        nom: "Œil-Témoin du Sans-Fin",
        famille: 'vestige',
        slot: 'vestige',
        tier: 1,
        categorie: 'vestige',
        sousType: 'geste',
        boss: 6,
        description: "Un œil qui ne se ferme jamais. Tu lâches un regard ; il poursuit ce qui bouge.",
        effets: [],
        flags: null,
        geste: {
            code: 'oeil_temoin_boss',
            cooldownMs: 1500,
            params: { degats: 5, vitesse: 320, portee: 700, homing: true }
        },
        combinable: true
    },

    // ─── Étage 7 — Hydre Naissante ─────────────────────────────
    seve_hydre: {
        id: 'seve_hydre',
        nom: 'Sève d\'Hydre',
        famille: 'vestige',
        slot: 'vestige',
        tier: 1,
        categorie: 'vestige',
        sousType: 'geste',
        boss: 7,
        description: "Une sève qui pulse encore. Elle te projette ; tu traverses ce qui devait t'atteindre.",
        effets: [],
        flags: null,
        geste: {
            code: 'seve_hydre',
            cooldownMs: 2500,
            params: { distance: 380, dureeMs: 240, invuMs: 500 }
        },
        combinable: true
    },

    // ─── Étage 8 — Tisseuse du Voile ───────────────────────────
    voile_tisseuse: {
        id: 'voile_tisseuse',
        nom: 'Voile de la Tisseuse',
        famille: 'vestige',
        slot: 'vestige',
        tier: 1,
        categorie: 'vestige',
        sousType: 'maitrise',
        boss: 8,
        description: "Le Voile fend le temps autour de toi. Quand tu pares, le monde hésite.",
        effets: [],
        flags: { slowMoParry: true },
        geste: null,
        combinable: true
    },

    // ─── Étage 9 — Échos Multipliés ────────────────────────────
    echos_du_neant: {
        id: 'echos_du_neant',
        nom: 'Échos du Néant',
        famille: 'vestige',
        slot: 'vestige',
        tier: 1,
        categorie: 'vestige',
        sousType: 'maitrise',
        boss: 9,
        description: "Les Échos retiennent ta chute. Une fois — et une seule — tu reviens.",
        effets: [],
        flags: { renaissance: true },
        geste: null,
        combinable: true
    },

    // ─── Étage 10 — Le Souverain du Reflux ─────────────────────
    artefact: {
        id: 'artefact',
        nom: "L'Artefact",
        famille: 'artefact',
        slot: 'vestige',
        tier: 1,
        categorie: 'vestige',
        sousType: 'trophee',
        boss: 10,
        description: "Le souvenir reformé. Tu n'as plus besoin de rien.",
        effets: [
            { cible: 'speed', delta: 80, visible: true },
            { cible: 'jumpVelocity', delta: 120, visible: true },
            { cible: 'attaqueDegats', delta: 8, visible: true },
            { cible: 'parryFenetre', delta: 300, visible: true }
        ],
        flags: { doubleSaut: true, slowMoParry: true },
        geste: null,
        declencheFin: true,
        combinable: false
    }
};

// ============================================================
// HELPERS
// ============================================================
export const VESTIGES_PAR_ETAGE = Object.fromEntries(
    Object.values(VESTIGES).map(v => [v.boss, v])
);

export function getVestige(id) {
    return VESTIGES[id] ?? null;
}

export function estVestige(id) {
    return VESTIGES[id] !== undefined;
}

/** Renvoie le Vestige correspondant à un étage donné (ou null). */
export function vestigePourEtage(etageNumero) {
    return VESTIGES_PAR_ETAGE[etageNumero] ?? null;
}

// Couleurs canoniques pour rendu des Vestiges (à ajouter aux COULEURS_FAMILLE)
export const COULEUR_VESTIGE = 0xc04040;       // cramoisi profond
export const COULEUR_ARTEFACT = 0xffd070;      // doré
