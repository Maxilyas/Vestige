// Ennemis du biome Voile Inversé (étages 7-8).
//
// Roster (10 ennemis) :
//   BASIC (4) — Colosse, Larme Tisseuse, Rage du Voile, Voix Lointaine
//   INNOVANTS (6, Phase 3e) — Anti-Bond, Anti-Parry, Mirage, Inverseur de
//   Gravité, Trou de Mémoire, Reflux-Éclat.

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
    },

    // ═════════════════════════════════════════════════════════════════════
    // ARCHÉTYPES INNOVANTS — Phase 3e
    // ═════════════════════════════════════════════════════════════════════

    anti_bond: {
        id: 'anti_bond', nom: 'Anti-Bond',
        archetype: 'reactive-shooter',
        etages: [7, 8], familleFragment: 'noir',
        largeur: 30, hauteur: 30,
        hp: 3, degatsContact: 8, vitesse: 0, gravite: false,
        rayonDetection: 400,
        delaiTir: 800,
        vitesseProjectile: 260, portéeProjectile: 420, degatsProjectile: 9,
        palette: { corps: 0x4a2a5a, iris: 0xc080ff, halo: 0xc080ff },
        accessoire: 'aucun', probaDrop: 0.36
    },
    anti_parry: {
        id: 'anti_parry', nom: 'Anti-Parry',
        archetype: 'unstoppable-charger',
        etages: [7, 8], familleFragment: 'noir',
        largeur: 36, hauteur: 42,
        hp: 5, degatsContact: 15, vitesse: 280,
        vitesseDetection: 80, rayonDetection: 280,
        delaiTelegraph: 420, delaiCharge: 800, delaiRecuperation: 500,
        gravite: false,
        parryImmune: true,
        palette: { corps: 0x5a1a4a, accent: 0xff80ff },
        porteePatrouille: 110,
        accessoire: 'aucun', probaDrop: 0.4
    },
    mirage: {
        id: 'mirage', nom: 'Mirage',
        archetype: 'phaser',
        etages: [7, 8], familleFragment: 'bleu',
        largeur: 26, hauteur: 30,
        hp: 2, degatsContact: 10, vitesse: 100,
        gravite: false,
        rayonDetection: 320,
        distanceReveal: 100, distanceFade: 240,
        palette: { corps: 0x6a4a8a, accent: 0xc080ff },
        accessoire: 'aucun', probaDrop: 0.36
    },
    inverseur_gravite: {
        id: 'inverseur_gravite', nom: 'Inverseur de Gravité',
        archetype: 'gravity-flipper',
        etages: [7, 8], familleFragment: 'noir',
        largeur: 32, hauteur: 32,
        hp: 4, degatsContact: 8, vitesse: 0, gravite: false,
        rayonAura: 200, dureeInversion: 2000,
        palette: { corps: 0x5a3a8a, accent: 0xc080ff },
        accessoire: 'aucun', probaDrop: 0.38
    },
    trou_memoire: {
        id: 'trou_memoire', nom: 'Trou de Mémoire',
        archetype: 'teleporter',
        etages: [7, 8], familleFragment: 'noir',
        largeur: 32, hauteur: 32,
        hp: 3, degatsContact: 6, vitesse: 0, gravite: false,
        rayonTeleport: 140, cooldownTeleport: 4500,
        palette: { corps: 0x1a0a2a, accent: 0xc080ff },
        accessoire: 'aucun', probaDrop: 0.4
    },
    reflux_eclat: {
        id: 'reflux_eclat', nom: 'Reflux-Éclat',
        archetype: 'vulnerability-shooter',
        etages: [7, 8], familleFragment: 'noir',
        largeur: 28, hauteur: 36,
        hp: 3, degatsContact: 8, vitesse: 0, gravite: false,
        rayonDetection: 380,
        delaiTir: 1800,
        vitesseProjectile: 200, portéeProjectile: 400, degatsProjectile: 6,
        palette: { corps: 0x8a3a6a, iris: 0xff80ff, halo: 0xff80ff, accent: 0xff80ff },
        accessoire: 'aucun', probaDrop: 0.38
    }
};
