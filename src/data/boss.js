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
    1: {
        etage: 1,
        nom: 'Roi de Pierre',
        pattern: 'colosse',
        skinBase: 'gardien_pierre',
        couronne: 'cornes_courtes',
        palette: { corps: 0x5a5a6a, accent: 0xff4040, halo: 0xff8080 },
        hpBase: 18, degats: 14, vitesse: 75, taille: 1.6,
        delaiSmash: 3200,
        drop: null  // Tier 3 random
    },
    2: {
        etage: 2,
        nom: 'Effigie Brisée',
        pattern: 'tisseur',
        skinBase: 'oeil_temoin',
        couronne: 'voile_double',
        palette: { corps: 0x5a4a6a, accent: 0xc080ff, halo: 0xe0a0ff },
        hpBase: 22, degats: 12, vitesse: 0, taille: 1.7,
        delaiTir: 1400,
        nbProjectiles: 3,
        drop: null
    },
    3: {
        etage: 3,
        nom: 'Marteau-Glas',
        pattern: 'colosse',
        skinBase: 'sentinelle_cendre',
        couronne: 'cornes_longues',
        palette: { corps: 0x6a4a3a, accent: 0xffa040, halo: 0xffd070 },
        hpBase: 28, degats: 16, vitesse: 80, taille: 1.7,
        delaiSmash: 2900,
        drop: null
    },
    4: {
        etage: 4,
        nom: 'Tisseur de Cendre',
        pattern: 'tisseur',
        skinBase: 'suintement',
        couronne: 'crocs',
        palette: { corps: 0x5a4a2a, accent: 0xffd070, halo: 0xffe0a0 },
        hpBase: 34, degats: 14, vitesse: 0, taille: 1.7,
        delaiTir: 1300,
        nbProjectiles: 3,
        homing: true,
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
        nom: 'Échos Multipliés',
        pattern: 'hydre',
        skinBase: 'veilleur_reflux',
        couronne: 'couronne_epines',
        palette: { corps: 0x3a1a1a, accent: 0xff2030, halo: 0xff6060 },
        hpBase: 90, degats: 22, vitesse: 90, taille: 1.9,
        seuilPhase2: 0.6, seuilPhase3: 0.3,
        delaiSmash: 2300, delaiTir: 900, nbProjectiles: 5,
        homing: true,
        drop: null
    },
    10: {
        etage: 10,
        nom: 'Le Souverain du Reflux',
        pattern: 'hydre',
        skinBase: 'oeil_du_reflux',
        couronne: 'couronne_yeux',
        palette: { corps: 0x4a0a0a, accent: 0xff2030, halo: 0xff8080 },
        hpBase: 120, degats: 25, vitesse: 95, taille: 2.0,
        seuilPhase2: 0.66, seuilPhase3: 0.33,
        delaiSmash: 2000, delaiTir: 800, nbProjectiles: 6,
        homing: true,
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
        // Gravite : Colosse (marcheur) oui, Tisseur/Hydre non (ils lévitent)
        gravite: fiche.pattern === 'colosse',
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
