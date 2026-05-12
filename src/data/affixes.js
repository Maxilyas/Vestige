// Affixes Phase 6 — primaires et exotiques.
//
// **Primaires** : modifient une stat (cf. data/stats.js). Génération paramétrique
// depuis les biais du template + le score. Pas de liste éditoriale — tout est
// calculé runtime dans CraftingSystem.
//
// **Exotiques** : effets éditoriaux atypiques (procs, mods, interactions).
// Une dizaine, attachés selon score & probabilité. Sont **cachés** par défaut
// (révélation par usage ou Identifieur).

// ============================================================
// EXOTIQUES — pool de mods atypiques
// ============================================================
// Chaque exotique a :
//   - id, label affichable
//   - description courte (révélée)
//   - flag (string libre, lu par les systèmes qui s'y intéressent)
//   - poids : probabilité relative de tirage
//   - tierMin : score minimum pour être éligible
// Le code des effets est implémenté dans les systèmes qui consultent le flag
// (ex : GameScene lit `proc_gel_parry`, EnemySystem lit `proc_burn_hit`, etc.)

export const EXOTIQUES = {
    proc_gel_parry: {
        id: 'proc_gel_parry',
        label: 'Souffle de givre',
        description: '15% chance au parry de figer l\'ennemi 1.2s.',
        flag: 'proc_gel_parry',
        chance: 0.15,
        duree: 1200,
        poids: 5,
        tierMin: 50
    },
    proc_brulure_hit: {
        id: 'proc_brulure_hit',
        label: 'Mèche ardente',
        description: '20% chance au coup de poser une brûlure (1 dmg / 0.5s, 3s).',
        flag: 'proc_brulure_hit',
        chance: 0.20,
        dps: 1,
        intervalle: 500,
        duree: 3000,
        poids: 5,
        tierMin: 50
    },
    proc_soin_kill: {
        id: 'proc_soin_kill',
        label: 'Avidité du Vestige',
        description: 'Récupère 2 Résonance à chaque ennemi tué.',
        flag: 'proc_soin_kill',
        gain: 2,
        poids: 4,
        tierMin: 50
    },
    proc_garde_kill: {
        id: 'proc_garde_kill',
        label: 'Égide vorace',
        description: 'Récupère 4 Garde à chaque ennemi tué.',
        flag: 'proc_garde_kill',
        gain: 4,
        poids: 4,
        tierMin: 50
    },
    proc_double_attaque: {
        id: 'proc_double_attaque',
        label: 'Souvenir doublé',
        description: '12% chance que ton attaque frappe deux fois.',
        flag: 'proc_double_attaque',
        chance: 0.12,
        poids: 3,
        tierMin: 70
    },
    proc_aoe_kill: {
        id: 'proc_aoe_kill',
        label: 'Réverbération',
        description: 'À chaque kill, une onde de 80 px inflige 2 dmg autour.',
        flag: 'proc_aoe_kill',
        portee: 80,
        degats: 2,
        poids: 3,
        tierMin: 70
    },
    proc_saut_resonance: {
        id: 'proc_saut_resonance',
        label: 'Pas du Vestige',
        description: 'Chaque saut restaure 1 Résonance.',
        flag: 'proc_saut_resonance',
        gain: 1,
        poids: 4,
        tierMin: 50
    },
    proc_parry_aoe: {
        id: 'proc_parry_aoe',
        label: 'Rebond d\'écho',
        description: 'Un parry réussi inflige 4 dmg à 100 px autour.',
        flag: 'proc_parry_aoe',
        portee: 100,
        degats: 4,
        poids: 3,
        tierMin: 70
    },
    mod_resonance_max: {
        id: 'mod_resonance_max',
        label: 'Cœur dilaté',
        description: 'Résonance maximum +15.',
        flag: 'mod_resonance_max',
        bonus: 15,
        poids: 4,
        tierMin: 70
    },
    mod_dash_court: {
        id: 'mod_dash_court',
        label: 'Pas dérobé',
        description: 'Sauter dans une direction te propulse de 80 px sup.',
        flag: 'mod_dash_court',
        distance: 80,
        poids: 2,
        tierMin: 85
    },
    proc_eclat_mort: {
        id: 'proc_eclat_mort',
        label: 'Éclat posthume',
        description: 'Au coup fatal qui te touche, 2 éclats partent à ±45°.',
        flag: 'proc_eclat_mort',
        nb: 2,
        degats: 6,
        poids: 2,
        tierMin: 85
    },
    proc_vol_resonance: {
        id: 'proc_vol_resonance',
        label: 'Soif d\'écho',
        description: 'Chaque coup porté restaure 0.5 Résonance.',
        flag: 'proc_vol_resonance',
        gain: 0.5,
        poids: 4,
        tierMin: 50
    }
};

export const EXOTIQUES_IDS = Object.keys(EXOTIQUES);

export function getExotique(id) {
    return EXOTIQUES[id] ?? null;
}

/**
 * Tire des affixes exotiques pour une instance.
 * @param {number} nb       nombre d'exotiques à tirer
 * @param {number} score    score 0-100 de l'item (gating tierMin)
 * @param {() => number} rng
 * @returns {string[]} IDs des exotiques tirés (sans doublon)
 */
export function tirerExotiques(nb, score, rng) {
    const eligibles = Object.values(EXOTIQUES).filter(e => score >= e.tierMin);
    if (eligibles.length === 0 || nb <= 0) return [];

    const tirages = [];
    const poolRestant = [...eligibles];
    for (let i = 0; i < nb && poolRestant.length > 0; i++) {
        const total = poolRestant.reduce((s, e) => s + e.poids, 0);
        let r = rng() * total;
        let idx = 0;
        for (; idx < poolRestant.length; idx++) {
            r -= poolRestant[idx].poids;
            if (r <= 0) break;
        }
        const choisi = poolRestant.splice(Math.min(idx, poolRestant.length - 1), 1)[0];
        tirages.push(choisi.id);
    }
    return tirages;
}
