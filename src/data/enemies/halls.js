// Ennemis du biome Halls Cendrés (étages 3-4).
//
// Roster actuel (4 archétypes basic) :
//   - Sentinelle de Cendre (veilleur)
//   - Goule Volante (traqueur)
//   - Ombre Galopante (chargeur)
//   - Suintement (tireur)
//
// Phase 3c ajoutera 6 archétypes innovants : Chandelier Vivant, Brûleur Lent,
// Cendre-Tisseuse, Ardent Miroir, Soupir Glacial, Tisseur d'Embrasement.

export const ENEMIES_HALLS = {
    sentinelle_cendre: {
        id: 'sentinelle_cendre',
        nom: 'Sentinelle de Cendre',
        archetype: 'veilleur',
        etages: [3, 4],
        familleFragment: 'blanc',
        largeur: 34, hauteur: 44,
        hp: 3, degatsContact: 12, vitesse: 65,
        gravite: true,
        porteePatrouille: 100,
        palette: { corps: 0x6a5a4a, accent: 0xffa040, fissure: 0x2a1a14 },
        accessoire: 'cornes_courtes',
        probaDrop: 0.32
    },
    goule_volante: {
        id: 'goule_volante',
        nom: 'Goule Volante',
        archetype: 'traqueur',
        etages: [3, 4],
        familleFragment: 'bleu',
        largeur: 28, hauteur: 28,
        hp: 2, degatsContact: 9, vitesse: 95,
        gravite: false,
        rayonDetection: 260,
        palette: { corps: 0xbe9a6a, voile: 0xeac896, yeux: 0xff6020 },
        accessoire: 'crocs',
        probaDrop: 0.32
    },
    ombre_galopante: {
        id: 'ombre_galopante',
        nom: 'Ombre Galopante',
        archetype: 'chargeur',
        etages: [3, 4],
        familleFragment: 'blanc',
        largeur: 34, hauteur: 38,
        hp: 3, degatsContact: 13, vitesse: 240,
        vitesseDetection: 70,
        rayonDetection: 240,
        delaiTelegraph: 550,
        delaiCharge: 700,
        delaiRecuperation: 600,
        gravite: true,
        palette: { corps: 0x4a3a2a, accent: 0xffd070, casque: 0x6a5a3a },
        accessoire: 'cornes_arquees',
        probaDrop: 0.34
    },
    suintement: {
        id: 'suintement',
        nom: 'Suintement',
        archetype: 'tireur',
        etages: [3, 4],
        familleFragment: 'bleu',
        largeur: 30, hauteur: 32,
        hp: 2, degatsContact: 9, vitesse: 30,
        gravite: true,
        rayonDetection: 340,
        delaiTir: 1500,
        vitesseProjectile: 200,
        portéeProjectile: 380,
        degatsProjectile: 7,
        palette: { corps: 0x4a5a3a, iris: 0xc0d040, pupille: 0x1a1a08, halo: 0xc0e060 },
        accessoire: 'crocs',
        probaDrop: 0.32
    }
};
