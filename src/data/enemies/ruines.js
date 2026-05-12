// Ennemis du biome Ruines basses (étages 1-2).
//
// Roster (10 ennemis) :
//   BASIC (4) — Gardien de Pierre, Spectre de Cendre, Bélier Brisé, Œil-Témoin
//   INNOVANTS (6, Phase 3b) — Statue Éveillée, Racine Étouffante, Mousse
//   Glissante, Tombe Éclatée, Vautour de Débris, Champignon-Spore.

export const ENEMIES_RUINES = {
    gardien_pierre: {
        id: 'gardien_pierre',
        nom: 'Gardien de Pierre',
        archetype: 'veilleur',
        etages: [1, 2],
        familleFragment: 'blanc',
        largeur: 32, hauteur: 40,
        hp: 2, degatsContact: 10, vitesse: 70,
        gravite: true,
        porteePatrouille: 90,
        palette: { corps: 0x4a4a5a, accent: 0xff3030, fissure: 0x1a1a24 },
        accessoire: 'aucun',
        probaDrop: 0.3
    },
    spectre_cendre: {
        id: 'spectre_cendre',
        nom: 'Spectre de Cendre',
        archetype: 'traqueur',
        etages: [1, 2],
        familleFragment: 'bleu',
        largeur: 26, hauteur: 26,
        hp: 1, degatsContact: 8, vitesse: 80,
        gravite: false,
        rayonDetection: 240,
        palette: { corps: 0x9aa8b8, voile: 0xa0c0d8, yeux: 0x000000 },
        accessoire: 'aucun',
        probaDrop: 0.3
    },
    belier_brise: {
        id: 'belier_brise',
        nom: 'Bélier Brisé',
        archetype: 'chargeur',
        etages: [1, 2],
        familleFragment: 'blanc',
        largeur: 32, hauteur: 36,
        hp: 2, degatsContact: 12, vitesse: 220,
        vitesseDetection: 60,
        rayonDetection: 220,
        delaiTelegraph: 600,
        delaiCharge: 700,
        delaiRecuperation: 700,
        gravite: true,
        palette: { corps: 0x6a4a3a, accent: 0xffa040, casque: 0x8a6a4a },
        accessoire: 'cornes_courtes',
        probaDrop: 0.32
    },
    oeil_temoin: {
        id: 'oeil_temoin',
        nom: 'Œil-Témoin',
        archetype: 'tireur',
        etages: [1, 2],
        familleFragment: 'bleu',
        largeur: 28, hauteur: 28,
        hp: 1, degatsContact: 8, vitesse: 0,
        gravite: false,
        rayonDetection: 320,
        delaiTir: 1600,
        vitesseProjectile: 220,
        portéeProjectile: 380,
        degatsProjectile: 6,
        palette: { corps: 0x4a3a5a, iris: 0xa080d0, pupille: 0x000000, halo: 0xc0a0ff },
        accessoire: 'aucun',
        probaDrop: 0.3
    },

    // ═════════════════════════════════════════════════════════════════════
    // ARCHÉTYPES INNOVANTS — Phase 3b
    // ═════════════════════════════════════════════════════════════════════

    // DORMANT — looks like decor jusqu'à proximité, puis devient Chargeur
    statue_eveillee: {
        id: 'statue_eveillee',
        nom: 'Statue Éveillée',
        archetype: 'dormant',
        etages: [1, 2],
        familleFragment: 'blanc',
        largeur: 30, hauteur: 44,
        hp: 3, degatsContact: 12, vitesse: 220,
        vitesseDetection: 60,
        gravite: true,
        porteePatrouille: 100,
        rayonReveil: 180,
        rayonDetection: 220,
        delaiTelegraph: 600,
        delaiCharge: 700,
        delaiRecuperation: 700,
        palette: { corps: 0x6a6a5a, accent: 0xff3030, fissure: 0x1a1a14 },
        accessoire: 'aucun',
        probaDrop: 0.32
    },

    // ANCHOR — stationnaire, tire le joueur vers elle dans son rayon
    racine_etouffante: {
        id: 'racine_etouffante',
        nom: 'Racine Étouffante',
        archetype: 'anchor',
        etages: [1, 2],
        familleFragment: 'blanc',
        largeur: 36, hauteur: 44,
        hp: 3, degatsContact: 8, vitesse: 0,
        gravite: true,
        rayonAttraction: 200,
        forceAttraction: 110,
        palette: { corps: 0x4a3a24, accent: 0xff5050, fissure: 0x2a1a08 },
        accessoire: 'aucun',
        probaDrop: 0.3
    },

    // TRAIL-TILE — crawler lent qui dépose des tiles glissantes
    mousse_glissante: {
        id: 'mousse_glissante',
        nom: 'Mousse Glissante',
        archetype: 'trail-tile',
        etages: [1, 2],
        familleFragment: 'blanc',
        largeur: 30, hauteur: 20,
        hp: 2, degatsContact: 5, vitesse: 40,
        gravite: true,
        porteePatrouille: 100,
        frequenceTrail: 800,
        trailLargeur: 50,
        trailHauteur: 8,
        trailDuree: 4000,
        palette: { corps: 0x4a6a3a, accent: 0x80c060, fissure: 0x2a3a18 },
        accessoire: 'aucun',
        probaDrop: 0.28
    },

    // SPAWNER — pierre tombale qui ponde des mini-spectres
    tombe_eclatee: {
        id: 'tombe_eclatee',
        nom: 'Tombe Éclatée',
        archetype: 'spawner',
        etages: [1, 2],
        familleFragment: 'noir',
        largeur: 30, hauteur: 42,
        hp: 4, degatsContact: 0, vitesse: 0,
        gravite: true,
        rayonProximite: 280,
        delaiPonte: 4000,
        capEnfants: 2,
        spawnBaseId: 'spectre_cendre',
        palette: { corps: 0x5a4a4a, accent: 0xa040c0, fissure: 0x2a1a2a },
        accessoire: 'aucun',
        probaDrop: 0.35
    },

    // DIVER — vol horizontal au plafond, plonge en 45° après telegraph
    vautour_debris: {
        id: 'vautour_debris',
        nom: 'Vautour de Débris',
        archetype: 'diver',
        etages: [1, 2],
        familleFragment: 'bleu',
        largeur: 32, hauteur: 22,
        hp: 2, degatsContact: 10, vitesse: 180,
        vitesseDive: 360,
        gravite: false,
        porteePatrouille: 240,
        rayonDive: 280,
        delaiTelegraphDive: 500,
        delaiDive: 700,
        palette: { corps: 0x4a3a3a, accent: 0xc0a060, yeux: 0xff4040 },
        accessoire: 'aucun',
        probaDrop: 0.3
    },

    // CLOUD — stationnaire, émet périodiquement des nuages de spores
    champignon_spore: {
        id: 'champignon_spore',
        nom: 'Champignon-Spore',
        archetype: 'cloud',
        etages: [1, 2],
        familleFragment: 'bleu',
        largeur: 34, hauteur: 38,
        hp: 3, degatsContact: 0, vitesse: 0,
        gravite: true,
        rayonEmission: 320,
        frequenceSpore: 5000,
        rayonNuage: 90,
        dureeNuage: 3000,
        palette: { corps: 0xa080a0, accent: 0x8050a0, spore: 0x2a1a3a, fissure: 0x4a2a4a },
        accessoire: 'aucun',
        probaDrop: 0.3
    }
};
