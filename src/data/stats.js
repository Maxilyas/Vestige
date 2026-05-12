// Stats primaires Phase 6 — la "fiche" lisible d'un item forgé.
//
// 7 stats max pour rester lisible. Chacune a :
//   - une plage [min, max] de delta possible par affixe
//   - un plafond effectif (au-dessus duquel les diminishing returns piquent)
//   - une courbe de retour décroissant (calculerEffectif)
//   - un libellé d'affichage
//
// L'idée : un cumul d'items donne une SOMME brute, qu'on passe ensuite par
// `calculerEffectif(stat, brut)` pour obtenir la valeur réellement appliquée.
// Au-delà du palier "lineaire", chaque point coûte plus cher → décisions
// stratégiques de loadout, pas de stack mono-stat.

export const STATS = {
    armure: {
        id: 'armure',
        label: 'Armure',
        unite: '%',
        min: 1,
        max: 8,           // un affixe peut donner +1 à +8 d'armure
        seuilLineaire: 30,// jusqu'à 30 %, additif simple
        max_dur: 70,      // plafond absolu (asymptote)
        description: 'Réduit les dégâts subis.'
    },
    gardeMax: {
        id: 'gardeMax',
        label: 'Garde Max',
        unite: 'PV',
        min: 4,
        max: 16,
        seuilLineaire: 30,
        max_dur: 80,
        description: 'PV de bouclier régénérables après quelques secondes hors combat.'
    },
    gardeRegen: {
        id: 'gardeRegen',
        label: 'Vitesse de Garde',
        unite: '/s',
        min: 1,
        max: 4,
        seuilLineaire: 6,
        max_dur: 14,
        description: 'Vitesse de régénération de la Garde après le délai.'
    },
    attaqueDegats: {
        id: 'attaqueDegats',
        label: 'Dégâts',
        unite: '',
        min: 1,
        max: 4,
        seuilLineaire: 6,
        max_dur: 18,
        description: 'Dégâts infligés par ton attaque (X).'
    },
    attaqueVitesse: {
        id: 'attaqueVitesse',
        label: 'Vitesse d\'attaque',
        unite: '%',
        min: 4,
        max: 14,
        seuilLineaire: 40,
        max_dur: 80,
        description: 'Réduit le cooldown entre attaques.'
    },
    parryFenetre: {
        id: 'parryFenetre',
        label: 'Fenêtre de Parry',
        unite: 'ms',
        min: 15,
        max: 60,
        seuilLineaire: 180,
        max_dur: 400,
        description: 'Élargit la fenêtre de parry (C).'
    },
    sautHauteur: {
        id: 'sautHauteur',
        label: 'Hauteur de saut',
        unite: '%',
        min: 3,
        max: 12,
        seuilLineaire: 35,
        max_dur: 70,
        description: 'Augmente la vélocité de saut.'
    }
};

export const STATS_IDS = Object.keys(STATS);

/**
 * Applique les diminishing returns à une stat. Sous le seuil, retour linéaire.
 * Au-dessus, asymptote vers max_dur — chaque point réel coûte plus de points
 * théoriques.
 *
 * @param {string} statId  ex 'armure'
 * @param {number} brut    somme additive des affixes (théorique)
 * @returns {number} valeur effective appliquée au gameplay
 */
export function calculerEffectif(statId, brut) {
    const def = STATS[statId];
    if (!def) return brut;
    if (brut <= def.seuilLineaire) return brut;
    // Au-delà du seuil : approche asymptotique de max_dur
    const surplus = brut - def.seuilLineaire;
    const reste = def.max_dur - def.seuilLineaire;
    // Fonction exp inverse — 50 % à 1.0 surplus, 86 % à 2.0, etc.
    const ratio = 1 - Math.exp(-surplus / reste);
    return def.seuilLineaire + ratio * reste;
}

/** Formatte une valeur effective pour l'UI ("+12 %", "+3 PV"). */
export function formaterStat(statId, valeur) {
    const def = STATS[statId];
    const signe = valeur >= 0 ? '+' : '';
    const v = Math.round(valeur * 10) / 10;
    const vStr = (v % 1 === 0) ? v.toFixed(0) : v.toFixed(1);
    return `${signe}${vStr}${def?.unite ? ' ' + def.unite : ''}`;
}
