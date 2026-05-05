// Catalogue des ennemis du Présent.
//
// Champs :
//   id            — identifiant unique
//   nom           — affiché
//   monde         — 'normal' uniquement pour MVP étape 7. Réservé pour étape future.
//   couleur       — couleur du rectangle (visuel proto)
//   largeur, hauteur — dimensions
//   hp            — points de vie
//   degatsContact — Résonance perdue par le joueur au contact
//   vitesse       — px/seconde
//   gravite       — true si soumis à la gravité (au sol), false si vol
//   comportement  — 'patrouille' | 'vol_suivi'
//   porteePatrouille — distance du point d'init pour faire demi-tour (patrouille)
//   rayonDetection   — distance d'activation du suivi (vol_suivi)
//   probaDrop     — chance qu'il drop un item à la mort
//   tuableSaut    — true si saut sur la tête lui inflige 1 dégât (legacy, pas utilisé MVP — combat à la lame)
//
// Les types prévus pour le Miroir (Garde des Sources, Mage Errant) sont
// gardés pour une étape future où la "perception croissante" sera implémentée.
// Pour l'instant, en MVP étape 7, seuls les types Normal sont instanciés.

export const ENEMIES = {
    gardien_pierre: {
        id: 'gardien_pierre',
        nom: 'Gardien de Pierre',
        monde: 'normal',
        couleur: 0x4a4a5a,
        largeur: 32,
        hauteur: 40,
        hp: 2,
        degatsContact: 10,
        vitesse: 70,
        gravite: true,
        comportement: 'patrouille',
        porteePatrouille: 90,
        probaDrop: 0.3,
        tuableSaut: false
    },
    spectre_cendre: {
        id: 'spectre_cendre',
        nom: 'Spectre de Cendre',
        monde: 'normal',
        couleur: 0x9aa8b8,
        largeur: 26,
        hauteur: 26,
        hp: 1,
        degatsContact: 8,
        vitesse: 80,
        gravite: false,
        comportement: 'vol_suivi',
        rayonDetection: 240,
        probaDrop: 0.3,
        tuableSaut: true
    }
};

// Tirage d'un type d'ennemi pour un monde donné. Pour l'instant, équiprobable.
export function tirerTypeEnnemi(monde, rng) {
    const types = Object.values(ENEMIES).filter(e => e.monde === monde);
    if (types.length === 0) return null;
    return types[Math.floor(rng() * types.length)];
}
