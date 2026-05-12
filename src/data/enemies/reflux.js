// Ennemis du biome Cœur du Reflux (étages 9-10).
//
// Roster (10 ennemis) :
//   BASIC (4) — Veilleur du Reflux, Cri du Reflux, Tonnerre du Reflux, Œil du Reflux
//   INNOVANTS (6, Phase 3f) — Cœur Fragmenté, Brisure-Tisseuse, Regard du Reflux,
//   Esprit Divisé, Annihilateur, Cohérence-Éroder.

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
    },

    // ═════════════════════════════════════════════════════════════════════
    // ARCHÉTYPES INNOVANTS — Phase 3f
    // ═════════════════════════════════════════════════════════════════════

    coeur_fragmente: {
        id: 'coeur_fragmente', nom: 'Cœur Fragmenté',
        archetype: 'death-shards',
        etages: [9, 10], familleFragment: 'noir',
        largeur: 30, hauteur: 30,
        hp: 5, degatsContact: 12, vitesse: 100,
        gravite: false,
        rayonDetection: 300,
        rayonExplosion: 70, degatsEclat: 10, dureeEclat: 2000,
        palette: { corps: 0x4a0a1a, accent: 0xff3040 },
        accessoire: 'aucun', probaDrop: 0.42
    },
    brisure_tisseuse: {
        id: 'brisure_tisseuse', nom: 'Brisure-Tisseuse',
        archetype: 'ground-fissure',
        etages: [9, 10], familleFragment: 'noir',
        largeur: 32, hauteur: 26,
        hp: 4, degatsContact: 10, vitesse: 0, gravite: true,
        rayonAction: 400, frequenceFissure: 3000,
        fissureLargeur: 70, fissureHauteur: 12, dureeAvantExplosion: 1500,
        palette: { corps: 0x3a0a14, accent: 0xa02040 },
        accessoire: 'aucun', probaDrop: 0.4
    },
    regard_reflux: {
        id: 'regard_reflux', nom: 'Regard du Reflux',
        archetype: 'gaze',
        etages: [9, 10], familleFragment: 'noir',
        largeur: 36, hauteur: 36,
        hp: 5, degatsContact: 8, vitesse: 0, gravite: false,
        rayonRegard: 360, intervalleDrain: 1000, degatsDrain: 2,
        palette: { corps: 0x3a0a14, accent: 0xff4040 },
        accessoire: 'aucun', probaDrop: 0.42
    },
    esprit_divise: {
        id: 'esprit_divise', nom: 'Esprit Divisé',
        archetype: 'sister-link',
        etages: [9, 10], familleFragment: 'noir',
        largeur: 28, hauteur: 32,
        hp: 3, degatsContact: 10, vitesse: 95,
        gravite: false,
        rayonDetection: 300,
        palette: { corps: 0x4a1a3a, accent: 0xff4040 },
        accessoire: 'aucun', probaDrop: 0.4
    },
    annihilateur: {
        id: 'annihilateur', nom: 'Annihilateur',
        archetype: 'parry-lock',
        etages: [9, 10], familleFragment: 'noir',
        largeur: 28, hauteur: 44,
        hp: 5, degatsContact: 10, vitesse: 0, gravite: true,
        rayonAura: 220,
        palette: { corps: 0x1a0a14, accent: 0xff4040 },
        accessoire: 'aucun', probaDrop: 0.42
    },
    coherence_eroder: {
        id: 'coherence_eroder', nom: 'Cohérence-Éroder',
        archetype: 'drain-aura',
        etages: [9, 10], familleFragment: 'noir',
        largeur: 30, hauteur: 36,
        hp: 4, degatsContact: 8, vitesse: 0, gravite: true,
        rayonAura: 180, intervalleDrain: 1000, degatsDrain: 1,
        palette: { corps: 0x2a0a1a, accent: 0xa02040 },
        accessoire: 'aucun', probaDrop: 0.42
    }
};
