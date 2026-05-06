// Phrases de la Glaneuse — vieille femme posée sur son tapis, peu de mots,
// du sel et de la lassitude. Elle a tout vu passer. Aucune phrase ne révèle
// d'information mécanique : juste de l'ambiance.

const ACCUEIL = [
    "Pose, prends, échange. Sans bruit.",
    "Mon tapis, ta richesse. Choisis.",
    "On vient à moi quand on a perdu le goût des choses.",
    "Tout ça a déjà servi. Tout ça servira encore."
];

const VENTE_REUSSIE = [
    "Bonne pioche. Ne reviens pas le regretter.",
    "Il est à toi maintenant. Comme il l'a été.",
    "Emporte. Le tapis ne pleure jamais."
];

const VENTE_PAUVRE = [
    "Pas assez de sel pour ça.",
    "Reviens avec plus.",
    "Le tapis ne fait pas crédit."
];

const RACHAT_REUSSI = [
    "Encore un. Tu finiras nu.",
    "Bon prix, mauvais souvenir.",
    "Le tapis grandit, ton sac s'allège."
];

const FRAGMENTATION = [
    "Tu rends sa poussière à l'objet.",
    "Le marteau a son chant. Moi, j'ai mes mains.",
    "Ce qu'il était, il ne l'est plus."
];

const FRAGMENTATION_BONUS = [
    "Il y avait du Reflux dedans. Tiens.",
    "Quelque chose de noir s'en échappe. Pour toi."
];

const INV_PLEIN = [
    "Ton sac est plein. Vide-le d'abord."
];

const RIEN_A_VENDRE = [
    "Tu n'as rien sur toi. Reviens plus chargé."
];

const VITRINE_VIDE = [
    "J'ai écoulé tout ce que j'avais. Reviens demain — ou ailleurs."
];

function tirerDans(liste, rng) {
    const r = rng ?? Math.random;
    return liste[Math.floor(r() * liste.length)];
}

export function phraseAccueil(rng)        { return tirerDans(ACCUEIL, rng); }
export function phraseVenteReussie(rng)   { return tirerDans(VENTE_REUSSIE, rng); }
export function phraseVentePauvre(rng)    { return tirerDans(VENTE_PAUVRE, rng); }
export function phraseRachatReussi(rng)   { return tirerDans(RACHAT_REUSSI, rng); }
export function phraseFragmentation(rng)  { return tirerDans(FRAGMENTATION, rng); }
export function phraseFragmentationBonus(rng) { return tirerDans(FRAGMENTATION_BONUS, rng); }
export function phraseInvPlein()          { return INV_PLEIN[0]; }
export function phraseRienAVendre()       { return RIEN_A_VENDRE[0]; }
export function phraseVitrineVide()       { return VITRINE_VIDE[0]; }
