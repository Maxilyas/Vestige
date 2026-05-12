// Catalogue des items et consommables de Vestige.
// Import des Vestiges pour le résolveur universel (cf. getItemOuVestige).
import { VESTIGES } from './vestiges.js';

//
// CHAQUE OBJET A 3 NIVEAUX DE RÉVÉLATION (tier) — voir LORE / Doctrine :
//   tier 1 = Visible : nom + stats + effets affichés normalement
//   tier 2 = Partiel : nom + stats de base affichés, EFFETS CACHÉS marqués (?)
//   tier 3 = Caché   : nom seul + ★ marqueur, aucune stat, le joueur découvre en équipant
//
// FORMAT D'UN EFFET : { cible, delta }
//   cibles supportées :
//     'speed'                — vitesse horizontale (+/- px/s)
//     'jumpVelocity'         — hauteur de saut (+/- px/s)
//     'passiveMiroir'        — modifie la baisse passive en Miroir (+/- pts/tick)
//     'passivePresent'       — AJOUTE une baisse passive en Présent (signature Bleu)
//     'bonusRetour'          — modifie le bonus à la sortie du vortex
//     'attaqueDegats'        — dégâts d'attaque (+/-)
//     'attaquePortee'        — portée de la hitbox d'attaque (+/-)
//     'attaqueCooldown'      — cooldown entre attaques en ms (delta négatif = plus rapide)
//     'parryFenetre'         — fenêtre du parry en ms
//     'parryCooldown'        — cooldown du parry en ms
//     'parryBonusResonance'  — Résonance regagnée à un parry réussi
//
// Les effets "game-changers" (wall-grip, drop-down, slow-mo, fil d'Ariane, etc.)
// sont prévus pour l'étape 6.5 — leur cible n'est pas dans cette liste.

export const ITEMS = {
    // ============================================================
    // ⬜ FAMILLE BLANC — objets du Présent
    // Stables, modérés, parfois utilitaires
    // ============================================================
    lame_sources: {
        id: 'lame_sources',
        nom: 'Lame des Sources',
        famille: 'blanc',
        slot: 'corps',
        tier: 1,
        description: 'Une arme du Présent. Légère, fiable.',
        effets: [
            { cible: 'speed', delta: 30 },
            { cible: 'attaqueDegats', delta: 1 }
        ]
    },
    souffle_glace: {
        id: 'souffle_glace',
        nom: 'Souffle Glacé',
        famille: 'blanc',
        slot: 'tete',
        tier: 1,
        description: "Un souffle qui allège tes bonds.",
        effets: [{ cible: 'jumpVelocity', delta: 80 }]
    },
    sceau_albe: {
        id: 'sceau_albe',
        nom: "Sceau d'Albe",
        famille: 'blanc',
        slot: 'accessoire',
        tier: 2,
        description: "Un sceau pâle. Tu sens qu'il te garde, sans savoir comment.",
        // Tier 2 : la vitesse est visible, la baisse passive Miroir réduite est CACHÉE
        effets: [
            { cible: 'speed', delta: 15, visible: true },
            { cible: 'passiveMiroir', delta: -1, visible: false }
        ]
    },
    coeur_suspendu: {
        id: 'coeur_suspendu',
        nom: 'Cœur Suspendu',
        famille: 'blanc',
        slot: 'accessoire',
        tier: 3,
        description: "Tu ne sais rien de cet objet. ★",
        // Effet game-changer hors scope étape 6 (filet de sécurité — étape 6.5)
        effets: [{ cible: 'speed', delta: 10, visible: false }]
    },
    don_errance: {
        id: 'don_errance',
        nom: "Don de l'Errance",
        famille: 'blanc',
        slot: 'tete',
        tier: 2,
        description: "Te chuchote de rester. De pousser plus loin.",
        // Effet visible : meilleur saut. Caché : modulera la passive Miroir (étape 6.5).
        effets: [{ cible: 'jumpVelocity', delta: 40, visible: true }]
    },

    // ============================================================
    // 🟦 FAMILLE BLEU — objets du Miroir (passé vivant)
    // Puissants, mais font baisser la Résonance même en Présent
    // ============================================================
    ardeur_rouge: {
        id: 'ardeur_rouge',
        nom: 'Ardeur Rouge',
        famille: 'bleu',
        slot: 'corps',
        tier: 2,
        description: "Une chaleur qui n'est pas la tienne. Elle te porte, elle te use.",
        effets: [
            { cible: 'speed', delta: 60, visible: true },
            { cible: 'attaqueDegats', delta: 2, visible: true },
            { cible: 'attaqueCooldown', delta: -100, visible: false },
            { cible: 'passivePresent', delta: 1, visible: false }
        ]
    },
    voile_pourpre: {
        id: 'voile_pourpre',
        nom: 'Voile Pourpre',
        famille: 'bleu',
        slot: 'tete',
        tier: 2,
        description: "Tu sens un vertige doux quand tu le portes.",
        effets: [
            { cible: 'jumpVelocity', delta: 120, visible: true },
            { cible: 'passivePresent', delta: 1, visible: false }
        ]
    },
    souvenir_chute: {
        id: 'souvenir_chute',
        nom: 'Souvenir de la Chute',
        famille: 'bleu',
        slot: 'accessoire',
        tier: 3,
        description: "Tu ne sais rien de cet objet. ★",
        // Effet réel mais invisible — gain en Miroir, malus en Présent (étape 6.5)
        effets: [
            { cible: 'speed', delta: 20, visible: false },
            { cible: 'passivePresent', delta: 1, visible: false }
        ]
    },
    oeil_temoin: {
        id: 'oeil_temoin',
        nom: 'Œil-Témoin',
        famille: 'bleu',
        slot: 'accessoire',
        tier: 1,
        description: "Révèle le nom de ce que tu ne sais pas voir.",
        // Tier 1 explicite : affichage normal. Effet "lecture des Tier III" implémenté étape 6.5.
        effets: [{ cible: 'passivePresent', delta: 1, visible: true }]
    },
    pas_vestige: {
        id: 'pas_vestige',
        nom: 'Pas du Vestige',
        famille: 'bleu',
        slot: 'corps',
        tier: 3,
        description: "Tu ne sais rien de cet objet. ★",
        effets: [{ cible: 'speed', delta: 50, visible: false }]
    },

    // ============================================================
    // ⬛ FAMILLE NOIR — objets du Reflux
    // Très puissants, oscillants, imprévisibles
    // (la malédiction temporelle viendra post-MVP)
    // ============================================================
    voeu_noir: {
        id: 'voeu_noir',
        nom: 'Vœu Noir',
        famille: 'noir',
        slot: 'corps',
        tier: 3,
        description: "Tu ne sais rien de cet objet. ★",
        effets: [
            { cible: 'speed', delta: 100, visible: false },
            { cible: 'jumpVelocity', delta: 60, visible: false }
        ]
    },
    pierre_insue: {
        id: 'pierre_insue',
        nom: 'Pierre Insue',
        famille: 'noir',
        slot: 'tete',
        tier: 3,
        description: "Tu ne sais rien de cet objet. ★",
        effets: [
            { cible: 'jumpVelocity', delta: 150, visible: false },
            { cible: 'passivePresent', delta: 2, visible: false }
        ]
    },
    mantra_vide: {
        id: 'mantra_vide',
        nom: 'Mantra du Vide',
        famille: 'noir',
        slot: 'accessoire',
        tier: 2,
        description: "Tu te sens léger. Tu sais que ce n'est pas gratuit.",
        effets: [
            { cible: 'speed', delta: 80, visible: true },
            { cible: 'passiveMiroir', delta: 1, visible: false },
            { cible: 'bonusRetour', delta: 20, visible: false }
        ]
    },
    marteau_reflux: {
        id: 'marteau_reflux',
        nom: 'Marteau du Reflux',
        famille: 'noir',
        slot: 'corps',
        tier: 3,
        description: "Tu ne sais rien de cet objet. ★",
        // Game-changer (casse plateformes inter-monde) hors scope étape 6,
        // mais déjà puissant en combat
        effets: [
            { cible: 'speed', delta: 40, visible: false },
            { cible: 'attaqueDegats', delta: 3, visible: false },
            { cible: 'attaquePortee', delta: 20, visible: false }
        ]
    }
};

// ============================================================
// CONSOMMABLES — drops orphelins au sol
// Ne prennent pas de slot équipé, mais occupent une case d'inventaire.
// Utilisés via un menu d'inventaire (étape 6.5+) ou ramassage immédiat
// pour certains. Pour l'étape 6, ils s'activent à la collecte directement.
// ============================================================
export const CONSOMMABLES = {
    larme_vestige: {
        id: 'larme_vestige',
        nom: 'Larme de Vestige',
        description: 'Restaure 30 Résonance.',
        couleur: 0xa8c8e8,
        effet: { type: 'resonance_gain', valeur: 30 }
    },
    cendre_efface: {
        id: 'cendre_efface',
        nom: "Cendre de l'Effacé",
        description: 'Coupe la baisse passive du Miroir pendant 15 secondes.',
        couleur: 0x6a6a7a,
        effet: { type: 'pause_miroir', duree: 15000 }
    },
    sel_resonance: {
        id: 'sel_resonance',
        nom: 'Sel de Résonance',
        description: "Une pincée. Ton corps semble s'y accrocher.",
        couleur: 0xe8e4d8,
        effet: { type: 'resonance_gain', valeur: 10 }
    },
    oeil_verre: {
        id: 'oeil_verre',
        nom: 'Œil de Verre',
        description: 'Inerte. Tu sens qu\'il regarde quelque chose que tu ne vois pas.',
        couleur: 0xc8d8e8,
        // Effet "révèle le prochain coffre" — étape 6.5 (pour l'instant : Résonance +5)
        effet: { type: 'resonance_gain', valeur: 5 }
    },
    pierre_ancrage: {
        id: 'pierre_ancrage',
        nom: "Pierre d'Ancrage",
        description: "Te tient. Une seule fois.",
        couleur: 0x8a7a6a,
        // Effet "empêche un basculement" — étape 6.5 (pour l'instant : Résonance +20)
        effet: { type: 'resonance_gain', valeur: 20 }
    },
    encre_temoin: {
        id: 'encre_temoin',
        nom: 'Encre du Témoin',
        description: 'Liquide noir. L\'Identifieur en use pour révéler les effets cachés.',
        couleur: 0x2a2a3a,
        // Stocké comme ressource ; l'Identifieur peut le consommer pour révéler
        // un effet sans coût en Sel.
        effet: { type: 'encre_temoin_gain', valeur: 1 }
    }
};

// ============================================================
// HELPERS — sélection par famille / slot
// ============================================================
export function itemsParFamille(famille) {
    return Object.values(ITEMS).filter(i => i.famille === famille);
}

export function getItem(id) {
    return ITEMS[id] ?? null;
}

export function getConsommable(id) {
    return CONSOMMABLES[id] ?? null;
}

// Couleurs canoniques par famille (réutilisées par UI / coffres)
export const COULEURS_FAMILLE = {
    blanc: 0xe8e4d8,
    bleu:  0x5a8ac8,
    noir:  0x2a2a3a,
    // Phase 5b — Vestiges = drops boss exclusifs (cramoisi) / Artefact = trophée (doré)
    vestige:  0xc04040,
    artefact: 0xffd070
};

/**
 * Résolveur universel : renvoie un item du catalogue (ITEMS) OU un Vestige
 * (VESTIGES) selon l'id. Utilisé partout où on a juste un id en main.
 */
export function getItemOuVestige(id) {
    return ITEMS[id] ?? VESTIGES[id] ?? null;
}

export function estVestigeId(id) {
    return VESTIGES[id] !== undefined;
}
