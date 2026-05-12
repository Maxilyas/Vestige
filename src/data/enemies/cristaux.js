// Ennemis du biome Cristaux Glacés (étages 5-6).
//
// Roster (10 ennemis) :
//   BASIC (4) — Idole Fissurée, Ombre des Murmures, Coureur de Cendre, Cracheur Pâle
//   INNOVANTS (6, Phase 3d) — Cristal-Prisme, Givre-Tisseur, Éclat-Multiplicateur,
//   Reflet-Double, Anneau de Glace, Polariseur.

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
    },

    // ═════════════════════════════════════════════════════════════════════
    // ARCHÉTYPES INNOVANTS — Phase 3d
    // ═════════════════════════════════════════════════════════════════════

    cristal_prisme: {
        id: 'cristal_prisme', nom: 'Cristal-Prisme',
        archetype: 'vision-distorter',
        etages: [5, 6], familleFragment: 'bleu',
        largeur: 28, hauteur: 36,
        hp: 3, degatsContact: 6, vitesse: 0, gravite: true,
        rayonAura: 240,
        palette: { corps: 0x6a4a9a, accent: 0xc080ff },
        accessoire: 'aucun', probaDrop: 0.32
    },
    givre_tisseur: {
        id: 'givre_tisseur', nom: 'Givre-Tisseur',
        archetype: 'floor-froster',
        etages: [5, 6], familleFragment: 'blanc',
        largeur: 26, hauteur: 22,
        hp: 2, degatsContact: 6, vitesse: 0, gravite: true,
        rayonAction: 360,
        frequenceGel: 2000,
        gelLargeur: 64, gelHauteur: 10, gelDuree: 3000,
        palette: { corps: 0x6a8aaa, accent: 0xa0e0ff },
        accessoire: 'aucun', probaDrop: 0.3
    },
    eclat_multiplicateur: {
        id: 'eclat_multiplicateur', nom: 'Éclat-Multiplicateur',
        archetype: 'mirror-clone',
        etages: [5, 6], familleFragment: 'bleu',
        largeur: 30, hauteur: 30,
        hp: 3, degatsContact: 9, vitesse: 110,
        gravite: false,
        rayonDetection: 300,
        palette: { corps: 0x5a8aba, accent: 0xc0e0ff },
        accessoire: 'aucun', probaDrop: 0.36
    },
    reflet_double: {
        id: 'reflet_double', nom: 'Reflet-Double',
        archetype: 'mirror-being',
        etages: [5, 6], familleFragment: 'noir',
        largeur: 24, hauteur: 36,
        hp: 4, degatsContact: 8, vitesse: 70,
        gravite: false,
        rayonDetection: 320,
        delaiMimic: 500, porteeMimic: 56, degatsMimic: 8,
        palette: { corps: 0x4a5a8a, accent: 0xa0e0ff },
        accessoire: 'aucun', probaDrop: 0.38
    },
    anneau_glace: {
        id: 'anneau_glace', nom: 'Anneau de Glace',
        archetype: 'orbital',
        etages: [5, 6], familleFragment: 'blanc',
        largeur: 32, hauteur: 32,
        hp: 4, degatsContact: 8, vitesse: 0,
        gravite: false,
        rayonOrbital: 38, vitesseOrbitale: 0.06, degatsOrbital: 8,
        palette: { corps: 0x4a6aaa, accent: 0xa0d0ff },
        accessoire: 'aucun', probaDrop: 0.36
    },
    polariseur: {
        id: 'polariseur', nom: 'Polariseur',
        archetype: 'control-inverter',
        etages: [5, 6], familleFragment: 'noir',
        largeur: 30, hauteur: 30,
        hp: 3, degatsContact: 6, vitesse: 0, gravite: true,
        rayonAura: 200, dureeInversion: 1000,
        palette: { corps: 0x5a3a8a, accent: 0xc080ff },
        accessoire: 'aucun', probaDrop: 0.34
    }
};
