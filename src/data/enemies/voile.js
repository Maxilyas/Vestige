// Ennemis du biome Voile Inversé (étages 7-8).
//
// Roster actuel (4 archétypes basic) :
//   - Colosse du Voile (veilleur)
//   - Larme Tisseuse (traqueur)
//   - Rage du Voile (chargeur)
//   - Voix Lointaine (tireur)
//
// Phase 3e ajoutera 6 archétypes innovants : Anti-Bond, Anti-Parry, Mirage,
// Inverseur de Gravité, Trou de Mémoire, Reflux-Éclat.

export const ENEMIES_VOILE = {
    colosse_voile: {
        id: 'colosse_voile',
        nom: 'Colosse du Voile',
        archetype: 'veilleur',
        etages: [7, 8],
        familleFragment: 'noir',
        largeur: 40, hauteur: 52,
        hp: 5, degatsContact: 16, vitesse: 55,
        gravite: true,
        porteePatrouille: 110,
        palette: { corps: 0x5a3a6a, accent: 0xc080ff, fissure: 0x2a0a30 },
        accessoire: 'cornes_longues',
        probaDrop: 0.36
    },
    larme_tisseuse: {
        id: 'larme_tisseuse',
        nom: 'Larme Tisseuse',
        archetype: 'traqueur',
        etages: [7, 8],
        familleFragment: 'noir',
        largeur: 30, hauteur: 32,
        hp: 3, degatsContact: 13, vitesse: 110,
        gravite: false,
        rayonDetection: 300,
        palette: { corps: 0x6a3a8a, voile: 0xb088c8, yeux: 0xff80ff },
        accessoire: 'voile_double',
        probaDrop: 0.36
    },
    rage_du_voile: {
        id: 'rage_du_voile',
        nom: 'Rage du Voile',
        archetype: 'chargeur',
        etages: [7, 8],
        familleFragment: 'noir',
        largeur: 38, hauteur: 42,
        hp: 5, degatsContact: 16, vitesse: 280,
        vitesseDetection: 90,
        rayonDetection: 280,
        delaiTelegraph: 450,
        delaiCharge: 800,
        delaiRecuperation: 500,
        gravite: false,
        palette: { corps: 0x6a3a8a, accent: 0xc080ff, casque: 0x8a5aaa },
        accessoire: 'cornes_longues',
        probaDrop: 0.38
    },
    voix_lointaine: {
        id: 'voix_lointaine',
        nom: 'Voix Lointaine',
        archetype: 'tireur',
        etages: [7, 8],
        familleFragment: 'noir',
        largeur: 32, hauteur: 34,
        hp: 3, degatsContact: 11, vitesse: 50,
        gravite: false,
        rayonDetection: 380,
        delaiTir: 1100,
        vitesseProjectile: 220,
        portéeProjectile: 420,
        degatsProjectile: 10,
        palette: { corps: 0x4a2a5a, iris: 0xff80ff, pupille: 0x2a0a3a, halo: 0xff80ff },
        accessoire: 'voile_double',
        probaDrop: 0.36
    }
};
