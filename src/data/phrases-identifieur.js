// Phrases poétiques de l'Identifieur — il ne dit JAMAIS la valeur exacte
// d'un effet. Il dit ce que ça FAIT SENTIR. Le joueur doit deviner.
//
// Cohérent avec la philosophie GDD : "le loot est un langage que tu apprends
// seul". L'Identifieur révèle qu'un effet existe, mais pas combien il vaut.

export const PHRASES_EFFETS = {
    speed: [
        "Cet objet allège tes pas.",
        "Tu cours plus vite, mais vers quoi ?"
    ],
    jumpVelocity: [
        "Tu touches plus haut le ciel.",
        "Il alourdit l'air sous tes bonds."
    ],
    passiveMiroir: [
        "Il te garde quand le passé t'épuise.",
        "Le passé pèse moins."
    ],
    passivePresent: [
        "Il chuchote au passé.",
        "Tu portes une autre âme.",
        "Quelque chose en toi s'éteint, lentement."
    ],
    bonusRetour: [
        "Le vortex te chante.",
        "Le retour te récompense."
    ],
    attaqueDegats: [
        "Il hâte ton bras.",
        "Ton coup pèse plus."
    ],
    attaquePortee: [
        "Ta main touche au-delà.",
        "Ton geste s'allonge."
    ],
    attaqueCooldown: [
        "Ton souffle revient plus vite.",
        "Le temps entre deux coups s'étire moins."
    ],
    parryFenetre: [
        "Le moment se prête à toi.",
        "Tu as plus de temps pour répondre."
    ],
    parryCooldown: [
        "Ta défense se réveille plus vite.",
        "Le bouclier t'écoute."
    ],
    parryBonusResonance: [
        "Tu reçois plus en parant.",
        "La parade te nourrit davantage."
    ]
};

/**
 * Retourne une phrase poétique pour la cible donnée. Plusieurs phrases sont
 * possibles par cible, le rng en choisit une.
 */
export function phraseEffet(cible, rng = Math.random) {
    const pool = PHRASES_EFFETS[cible];
    if (!pool || pool.length === 0) return "Quelque chose change en toi.";
    return pool[Math.floor(rng() * pool.length)];
}
