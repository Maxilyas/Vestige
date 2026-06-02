// Catalogue des 10 boss du Présent — un par étage, difficulté croissante.
//
// MODÈLE 3 PATTERNS × 10 SKINS :
//   - colosse : grand Veilleur, smash AOE périodique + gravats
//   - tisseur : grand Tireur stationnaire, salves de projectiles téléguidés
//   - hydre   : composite, change de pattern à 50 % HP (et à 25 % HP en Hydre 3 phases)
//
// Chaque boss = pattern + skin (palette / nom / couronne) + scaling (multiplicateurs
// HP / dégâts / vitesse / taille) + drop garanti (item ID ou null pour Tier 3 random).

export const BOSS = {
    // ─── REFONTE BIOMES 1-2 (Ruines / Halls) — 4 boss uniques, verbes opposés.
    //     Patterns side-scroll dédiés dans systems/BossRuinesHalls.js
    //     (cf. BOSS_CONCEPTS.md #6 Cariatide, #15 Colosse, #5 Lanternes, #12 Effigie).
    1: {
        etage: 1,
        nom: 'La Cariatide',
        pattern: 'cariatide',          // DÉTRUIRE l'environnement (#6)
        skinBase: 'gardien_pierre',
        couronne: 'cornes_courtes',
        palette: { corps: 0x6a6457, accent: 0xd8c89a, halo: 0xefe4c6 },
        hpBase: 16, degats: 12, vitesse: 78, taille: 1.9, gravite: false,
        seuilPhase2: 0.66, seuilPhase3: 0.33,
        drop: null  // Tier 3 random
    },
    2: {
        etage: 2,
        nom: 'Le Colosse de Sel',
        pattern: 'colosse_sel',        // GRIMPER le boss (#15)
        skinBase: 'gardien_pierre',
        couronne: 'cristaux_dos',
        palette: { corps: 0xcfc6b2, accent: 0x9fe0ec, halo: 0xe6f6ff },
        hpBase: 18, degats: 13, vitesse: 0, taille: 1.4, gravite: false,
        seuilPhase2: 0.66, seuilPhase3: 0.33,
        drop: null
    },
    3: {
        etage: 3,
        nom: 'Le Porteur de Lanternes',
        pattern: 'porteur_lanternes',  // ÉCLAIRER + objets à livrer (#5)
        skinBase: 'sentinelle_cendre',
        couronne: 'voile_double',
        palette: { corps: 0x2a2230, accent: 0xffb040, halo: 0xffd987 },
        hpBase: 20, degats: 13, vitesse: 65, taille: 1.6, gravite: false,
        seuilPhase2: 0.66, seuilPhase3: 0.33,
        drop: null
    },
    4: {
        etage: 4,
        nom: 'L\'Effigie Ardente',
        pattern: 'effigie_ardente',    // KITER vers l'eau (#12)
        skinBase: 'sentinelle_cendre',
        couronne: 'cornes_longues',
        palette: { corps: 0x3a1a12, accent: 0xff5020, halo: 0xff9050 },
        hpBase: 24, degats: 14, vitesse: 96, taille: 1.6, gravite: true,
        seuilPhase2: 0.66, seuilPhase3: 0.33,
        drop: null
    },
    5: {
        etage: 5,
        nom: 'Voix de l\'Abîme',
        pattern: 'hydre',
        skinBase: 'idole_fissuree',
        couronne: 'cristaux_dos',
        palette: { corps: 0x4a5a8a, accent: 0x60d0ff, halo: 0xa0e0ff },
        hpBase: 42, degats: 16, vitesse: 80, taille: 1.7,
        seuilPhase2: 0.5,
        delaiSmash: 2700, delaiTir: 1300, nbProjectiles: 3,
        drop: null
    },
    6: {
        etage: 6,
        nom: 'Œil Sans Fin',
        pattern: 'tisseur',
        skinBase: 'cracheur_pale',
        couronne: 'aura_glace',
        palette: { corps: 0x4a6a8a, accent: 0xa0d0ff, halo: 0xc0e0ff },
        hpBase: 50, degats: 18, vitesse: 0, taille: 1.8,
        delaiTir: 1100,
        nbProjectiles: 4,
        homing: true,
        drop: null
    },
    7: {
        etage: 7,
        nom: 'Hydre Naissante',
        pattern: 'hydre',
        skinBase: 'colosse_voile',
        couronne: 'cornes_longues',
        palette: { corps: 0x5a3a6a, accent: 0xc080ff, halo: 0xe0a0ff },
        hpBase: 60, degats: 18, vitesse: 85, taille: 1.8,
        seuilPhase2: 0.5,
        delaiSmash: 2500, delaiTir: 1100, nbProjectiles: 4,
        homing: true,
        drop: null
    },
    8: {
        etage: 8,
        nom: 'Tisseuse du Voile',
        pattern: 'tisseur',
        skinBase: 'larme_tisseuse',
        couronne: 'voile_double',
        palette: { corps: 0x6a3a8a, accent: 0xff80ff, halo: 0xffa0ff },
        hpBase: 72, degats: 20, vitesse: 40, taille: 1.8,
        delaiTir: 950,
        nbProjectiles: 5,
        homing: true,
        drop: null
    },
    9: {
        etage: 9,
        nom: 'Le Doyen du Seuil',
        pattern: 'doyen',            // Phase 9.14 — danmaku radial top-down, 3 phases
        skinBase: 'veilleur_reflux',
        couronne: 'couronne_epines',
        palette: { corps: 0x3a1a1a, accent: 0xff2030, halo: 0xff6060 },
        hpBase: 130, degats: 22, vitesse: 0, taille: 1.9,  // stationnaire ; plus de PV (à refaire)
        seuilPhase2: 0.66, seuilPhase3: 0.33,
        delaiTir: 1100, nbProjectiles: 5,
        drop: null
    },
    10: {
        etage: 10,
        nom: 'Le Cœur du Reflux',
        pattern: 'coeur',            // Phase 9.15 — boss final top-down, 3 phases → FinScene
        skinBase: 'oeil_du_reflux',
        couronne: 'couronne_yeux',
        palette: { corps: 0x4a0a0a, accent: 0xff2030, halo: 0xff8080 },
        hpBase: 150, degats: 25, vitesse: 0, taille: 2.0,
        seuilPhase2: 0.66, seuilPhase3: 0.33,
        delaiTir: 800, nbProjectiles: 6,
        drop: null
    }
};

/**
 * Construit la définition complète d'un boss à partir de sa fiche skin
 * et de la fiche de base de l'ennemi qu'il "skin". Renvoie un objet
 * compatible avec Enemy/Boss : id, nom, archetype, palette, accessoire,
 * stats, etc.
 */
export function definitionBoss(etageNumero, ENEMIES) {
    const fiche = BOSS[etageNumero];
    if (!fiche) return null;
    const base = ENEMIES[fiche.skinBase] ?? Object.values(ENEMIES)[0];
    const taille = fiche.taille ?? 1.6;

    return {
        id: `boss_e${etageNumero}`,
        nom: fiche.nom,
        archetype: base.archetype,   // détermine la silhouette de fond
        pattern: fiche.pattern,       // colosse / tisseur / hydre
        etage: etageNumero,
        familleFragment: base.familleFragment,
        largeur: Math.round(base.largeur * taille),
        hauteur: Math.round(base.hauteur * taille),
        hp: fiche.hpBase,
        degatsContact: fiche.degats,
        vitesse: fiche.vitesse,
        // Gravite : explicite via fiche.gravite si fournie ; sinon Colosse
        // (marcheur) oui, Tisseur/Hydre non (ils lévitent).
        gravite: fiche.gravite ?? (fiche.pattern === 'colosse'),
        rayonDetection: 600,
        // Spécifique pattern
        delaiSmash: fiche.delaiSmash,
        delaiTir: fiche.delaiTir,
        nbProjectiles: fiche.nbProjectiles,
        homing: fiche.homing ?? false,
        seuilPhase2: fiche.seuilPhase2,
        seuilPhase3: fiche.seuilPhase3,
        vitesseProjectile: 200,
        portéeProjectile: 600,
        degatsProjectile: Math.round(fiche.degats * 0.6),
        // Visuel
        palette: { ...base.palette, ...fiche.palette },
        accessoire: fiche.couronne ?? base.accessoire ?? 'aucun',
        couronneBoss: true,
        probaDrop: 1,
        drop: fiche.drop,
        estBoss: true
    };
}
