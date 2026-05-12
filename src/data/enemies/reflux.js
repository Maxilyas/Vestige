// Ennemis du biome Cœur du Reflux (étages 9-10).
//
// Roster actuel (4 archétypes basic) :
//   - Veilleur du Reflux (veilleur)
//   - Cri du Reflux (traqueur)
//   - Tonnerre du Reflux (chargeur)
//   - Œil du Reflux (tireur)
//
// Phase 3f ajoutera 6 archétypes innovants : Cœur Fragmenté, Brisure-Tisseuse,
// Œil du Reflux (gaze), Esprit Divisé, Annihilateur, Reflux-Éclat Majeur,
// Cohérence-Éroder.

export const ENEMIES_REFLUX = {
    veilleur_reflux: {
        id: 'veilleur_reflux',
        nom: 'Veilleur du Reflux',
        archetype: 'veilleur',
        etages: [9, 10],
        familleFragment: 'noir',
        largeur: 44, hauteur: 56,
        hp: 7, degatsContact: 18, vitesse: 50,
        gravite: true,
        porteePatrouille: 120,
        palette: { corps: 0x3a1a1a, accent: 0xff2030, fissure: 0x100404 },
        accessoire: 'couronne_epines',
        probaDrop: 0.4
    },
    cri_du_reflux: {
        id: 'cri_du_reflux',
        nom: 'Cri du Reflux',
        archetype: 'traqueur',
        etages: [9, 10],
        familleFragment: 'noir',
        largeur: 32, hauteur: 34,
        hp: 4, degatsContact: 15, vitesse: 120,
        gravite: false,
        rayonDetection: 320,
        palette: { corps: 0x4a0a1a, voile: 0xa0202a, yeux: 0xff4040 },
        accessoire: 'couronne_yeux',
        probaDrop: 0.4
    },
    tonnerre_reflux: {
        id: 'tonnerre_reflux',
        nom: 'Tonnerre du Reflux',
        archetype: 'chargeur',
        etages: [9, 10],
        familleFragment: 'noir',
        largeur: 42, hauteur: 46,
        hp: 6, degatsContact: 18, vitesse: 320,
        vitesseDetection: 100,
        rayonDetection: 300,
        delaiTelegraph: 400,
        delaiCharge: 850,
        delaiRecuperation: 450,
        gravite: false,
        palette: { corps: 0x3a0a1a, accent: 0xff3040, casque: 0x6a1a2a },
        accessoire: 'couronne_epines',
        probaDrop: 0.42
    },
    oeil_du_reflux: {
        id: 'oeil_du_reflux',
        nom: 'Œil du Reflux',
        archetype: 'tireur',
        etages: [9, 10],
        familleFragment: 'noir',
        largeur: 36, hauteur: 36,
        hp: 4, degatsContact: 13, vitesse: 60,
        gravite: false,
        rayonDetection: 400,
        delaiTir: 950,
        vitesseProjectile: 260,
        portéeProjectile: 440,
        degatsProjectile: 12,
        palette: { corps: 0x3a0a0a, iris: 0xff4040, pupille: 0x100000, halo: 0xff8080 },
        accessoire: 'couronne_yeux',
        probaDrop: 0.4
    }
};
