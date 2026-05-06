// Catalogue des ennemis du Présent — 20 variantes paramétriques.
//
// MODÈLE 4 ARCHÉTYPES × 5 VARIANTES :
//   - veilleur : stationnaire, attaque au contact (gravité, patrouille courte)
//   - traqueur : vol + poursuite du joueur dans rayon
//   - chargeur : pause + telegraph + charge directionnelle rapide
//   - tireur   : projectile à distance, kite ou stationnaire
//
// Chaque variante = stats + palette + accessoire visuel + plage d'étages.
// Les variantes d'un même archétype partagent leur IA et leur silhouette ;
// elles se distinguent par couleur, taille, accessoire et stats.

// Étages d'apparition par biome (cf. data/biomes.js)
//   1-2  : Ruines basses    (verts terreux)
//   3-4  : Halls Cendrés    (gris ambrés)
//   5-6  : Cristaux Glacés  (bleus glaciaux)
//   7-8  : Voile Inversé    (violets spectraux)
//   9-10 : Cœur du Reflux   (noir/rouge cramoisi)

export const ENEMIES = {
    // ═══════════════════════════════════════════════════════════
    // VEILLEUR — silhouette quadrupède pierreuse, œil rougeoyant
    // ═══════════════════════════════════════════════════════════
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

    // ═══════════════════════════════════════════════════════════
    // TRAQUEUR — silhouette flottante voilée, yeux creux
    // ═══════════════════════════════════════════════════════════
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

    // ═══════════════════════════════════════════════════════════
    // CHARGEUR — silhouette bipède trapue, casque/cornes
    // ═══════════════════════════════════════════════════════════
    belier_brise: {
        id: 'belier_brise',
        nom: 'Bélier Brisé',
        archetype: 'chargeur',
        etages: [1, 2],
        familleFragment: 'blanc',
        largeur: 32, hauteur: 36,
        hp: 2, degatsContact: 12, vitesse: 220,
        vitesseDetection: 60,  // vitesse de "rôde" avant détection
        rayonDetection: 220,
        delaiTelegraph: 600,   // ms d'arrêt + lueur avant la charge
        delaiCharge: 700,      // durée max d'une charge
        delaiRecuperation: 700,
        gravite: true,
        palette: { corps: 0x6a4a3a, accent: 0xffa040, casque: 0x8a6a4a },
        accessoire: 'cornes_courtes',
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
        gravite: false,  // vol — charge à travers les plateformes
        palette: { corps: 0x6a3a8a, accent: 0xc080ff, casque: 0x8a5aaa },
        accessoire: 'cornes_longues',
        probaDrop: 0.38
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

    // ═══════════════════════════════════════════════════════════
    // TIREUR — silhouette globulaire, gros œil/orbe central
    // ═══════════════════════════════════════════════════════════
    oeil_temoin: {
        id: 'oeil_temoin',
        nom: 'Œil-Témoin',
        archetype: 'tireur',
        etages: [1, 2],
        familleFragment: 'bleu',
        largeur: 28, hauteur: 28,
        hp: 1, degatsContact: 8, vitesse: 0,  // stationnaire en vol
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
    suintement: {
        id: 'suintement',
        nom: 'Suintement',
        archetype: 'tireur',
        etages: [3, 4],
        familleFragment: 'bleu',
        largeur: 30, hauteur: 32,
        hp: 2, degatsContact: 9, vitesse: 30,  // léger kite
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

/**
 * Tire un type d'ennemi pour un biome donné.
 * Le pool est filtré par les `etages` autorisés du biome.
 *
 * @param {object} biome  cf. data/biomes.js
 * @param {function} rng  PRNG seedé
 */
export function tirerEnnemiBiome(biome, rng) {
    if (!biome?.ennemisPool?.length) return null;
    const pool = biome.ennemisPool.map(id => ENEMIES[id]).filter(Boolean);
    if (pool.length === 0) return null;
    return pool[Math.floor(rng() * pool.length)];
}

/**
 * Compat (transition) — renvoie tous les ennemis d'un étage.
 * Utilisé là où le biome n'est pas encore connu.
 */
export function ennemisPourEtage(etageNumero) {
    return Object.values(ENEMIES).filter(e =>
        e.etages[0] <= etageNumero && etageNumero <= e.etages[1]
    );
}
