// Ennemis du biome Cristaux Glacés (étages 5-6).
//
// Roster actuel (4 archétypes basic) :
//   - Idole Fissurée (veilleur)
//   - Ombre des Murmures (traqueur)
//   - Coureur de Cendre (chargeur)
//   - Cracheur Pâle (tireur)
//
// Phase 3d ajoutera 6 archétypes innovants : Cristal-Prisme, Givre-Tisseur,
// Éclat-Multiplicateur, Reflet-Double, Anneau de Glace, Polariseur.

export const ENEMIES_CRISTAUX = {
    idole_fissuree: {
        id: 'idole_fissuree',
        nom: 'Idole Fissurée',
        archetype: 'veilleur',
        etages: [5, 6],
        familleFragment: 'blanc',
        largeur: 36, hauteur: 48,
        hp: 4, degatsContact: 14, vitesse: 60,
        gravite: true,
        porteePatrouille: 110,
        palette: { corps: 0x4a5a8a, accent: 0x60d0ff, fissure: 0x1a1a30 },
        accessoire: 'cristaux_dos',
        probaDrop: 0.34
    },
    ombre_murmure: {
        id: 'ombre_murmure',
        nom: 'Ombre des Murmures',
        archetype: 'traqueur',
        etages: [5, 6],
        familleFragment: 'bleu',
        largeur: 30, hauteur: 30,
        hp: 2, degatsContact: 11, vitesse: 100,
        gravite: false,
        rayonDetection: 280,
        palette: { corps: 0x4a6a9a, voile: 0x8ab0d8, yeux: 0xa0e0ff },
        accessoire: 'aura_glace',
        probaDrop: 0.34
    },
    coureur_cendre: {
        id: 'coureur_cendre',
        nom: 'Coureur de Cendre',
        archetype: 'chargeur',
        etages: [5, 6],
        familleFragment: 'bleu',
        largeur: 36, hauteur: 40,
        hp: 4, degatsContact: 14, vitesse: 260,
        vitesseDetection: 80,
        rayonDetection: 260,
        delaiTelegraph: 500,
        delaiCharge: 750,
        delaiRecuperation: 550,
        gravite: true,
        palette: { corps: 0x3a5a8a, accent: 0x80c0ff, casque: 0x5a7aaa },
        accessoire: 'cristaux_dos',
        probaDrop: 0.36
    },
    cracheur_pale: {
        id: 'cracheur_pale',
        nom: 'Cracheur Pâle',
        archetype: 'tireur',
        etages: [5, 6],
        familleFragment: 'bleu',
        largeur: 32, hauteur: 32,
        hp: 2, degatsContact: 10, vitesse: 0,
        gravite: false,
        rayonDetection: 360,
        delaiTir: 1300,
        vitesseProjectile: 240,
        portéeProjectile: 400,
        degatsProjectile: 8,
        palette: { corps: 0x5a7a9a, iris: 0xa0d0ff, pupille: 0x101820, halo: 0xc0e0ff },
        accessoire: 'aura_glace',
        probaDrop: 0.34
    }
};
