// Ennemis du biome Halls Cendrés (étages 3-4).
//
// Roster (10 ennemis) :
//   BASIC (4) — Sentinelle de Cendre, Goule Volante, Ombre Galopante, Suintement
//   INNOVANTS (6, Phase 3c) — Chandelier Vivant, Brûleur Lent, Cendre-Tisseuse,
//   Ardent Miroir, Soupir Glacial, Tisseur d'Embrasement.

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
    },

    // ═════════════════════════════════════════════════════════════════════
    // ARCHÉTYPES INNOVANTS — Phase 3c
    // ═════════════════════════════════════════════════════════════════════

    // LIGHTING-MOD — cierge passif, sa mort assombrit les autres ennemis 5s
    chandelier_vivant: {
        id: 'chandelier_vivant',
        nom: 'Chandelier Vivant',
        archetype: 'lighting-mod',
        etages: [3, 4],
        familleFragment: 'blanc',
        largeur: 22, hauteur: 44,
        hp: 3, degatsContact: 6, vitesse: 0,
        gravite: true,
        palette: { corps: 0x4a3a2a, accent: 0xffc060, flamme: 0xffd070 },
        accessoire: 'aucun',
        probaDrop: 0.32
    },

    // DETONATOR — marche, telegraph 2.2s, explose AOE (parry annule)
    bruleur_lent: {
        id: 'bruleur_lent',
        nom: 'Brûleur Lent',
        archetype: 'detonator',
        etages: [3, 4],
        familleFragment: 'blanc',
        largeur: 36, hauteur: 34,
        hp: 4, degatsContact: 8, vitesse: 55,
        gravite: true,
        rayonDetonation: 95,
        delaiTelegraph: 2200,
        rayonExplosion: 110,
        degatsExplosion: 14,
        palette: { corps: 0x6a3a2a, accent: 0xff5020, fissure: 0x2a0a04 },
        accessoire: 'aucun',
        probaDrop: 0.36
    },

    // WEB-SPINNER — tire projectile qui immobilise le joueur 1s
    cendre_tisseuse: {
        id: 'cendre_tisseuse',
        nom: 'Cendre-Tisseuse',
        archetype: 'web-spinner',
        etages: [3, 4],
        familleFragment: 'noir',
        largeur: 32, hauteur: 26,
        hp: 2, degatsContact: 9, vitesse: 0,
        gravite: false,
        rayonDetection: 360,
        delaiTir: 2400,
        vitesseProjectile: 180,
        portéeProjectile: 400,
        degatsProjectile: 4,
        palette: { corps: 0x6a5a4a, iris: 0xc8b890, pupille: 0x1a1408, halo: 0xe8d8b0 },
        accessoire: 'aucun',
        probaDrop: 0.34
    },

    // REFLECTOR — renvoie les projectiles sur leur tireur (rayon 56)
    ardent_miroir: {
        id: 'ardent_miroir',
        nom: 'Ardent Miroir',
        archetype: 'reflector',
        etages: [3, 4],
        familleFragment: 'bleu',
        largeur: 30, hauteur: 44,
        hp: 4, degatsContact: 10, vitesse: 0,
        gravite: true,
        rayonReflexion: 56,
        palette: { corps: 0x4a4040, accent: 0xffd070, miroir: 0xa0c0d0 },
        accessoire: 'aucun',
        probaDrop: 0.34
    },

    // FROST-TRAILER — crawler froid qui gèle les tiles sous lui
    soupir_glacial: {
        id: 'soupir_glacial',
        nom: 'Soupir Glacial',
        archetype: 'frost-trailer',
        etages: [3, 4],
        familleFragment: 'bleu',
        largeur: 28, hauteur: 28,
        hp: 2, degatsContact: 6, vitesse: 45,
        gravite: true,
        porteePatrouille: 120,
        frequenceTrail: 900,
        trailLargeur: 56,
        trailHauteur: 8,
        trailDuree: 4500,
        palette: { corps: 0xb0d8e8, accent: 0x80b0d0, voile: 0xc0e0f0, yeux: 0xa0e0ff },
        accessoire: 'aucun',
        probaDrop: 0.3
    },

    // WALL-BUILDER — érige périodiquement un mur de feu (DPS gate)
    tisseur_embrasement: {
        id: 'tisseur_embrasement',
        nom: 'Tisseur d\'Embrasement',
        archetype: 'wall-builder',
        etages: [3, 4],
        familleFragment: 'noir',
        largeur: 32, hauteur: 44,
        hp: 4, degatsContact: 8, vitesse: 0,
        gravite: true,
        rayonDetection: 380,
        delaiMur: 4200,
        murLargeur: 24,
        murHauteur: 120,
        dureeMur: 3500,
        palette: { corps: 0x6a2a1a, accent: 0xff5020, flamme: 0xffa040 },
        accessoire: 'aucun',
        probaDrop: 0.34
    }
};
