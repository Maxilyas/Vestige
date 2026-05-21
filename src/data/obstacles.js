// Catalogue des types d'obstacles posés dans les salles.
//
// Un obstacle = élément qui altère le gameplay :
//   ─── Hérités (depuis le début du projet) ──────────────────────────
//   - pieu             : statique, dégâts au contact (3 Résonance)
//   - ressort          : statique, boost vertical au contact si joueur descend
//   - plateforme_mobile: se déplace en aller-retour (joueur peut atterrir)
//
//   ─── Vague 1 Ruines (étape 4C) ────────────────────────────────────
//   - eboulis          : statique, bloquant, casse en 3 hits → drop possible
//   - mur_fissure      : statique, bloquant, casse en 3 hits → cache passage/coffre
//   - sol_effrite      : plateforme one-way, s'effondre 1.2s après contact joueur
//   - roc_tombe        : tombe périodiquement depuis un point fixe du plafond,
//                        ombre avertissement 0.5s, devient éboulis au sol
//   - plaque_pression  : détecte overlap joueur → déclenche effet (spawn pieux temporaires)
//
//   ─── Vague 2 Ruines ─────────────────────────────────────────────
//   - racines_reflux   : zone qui cycle plateforme(1s) ↔ pieu(2s) — premier
//                        présage du Reflux dans Ruines basses
//   - anti_ancrage     : zone qui désactive le geste d'ancrage dans son rayon
//                        (gérée par AncrageSystem, présente comme zone non-physique)
//
//   ─── Vague 3 Halls Cendrés ──────────────────────────────────────
//   - brasier_mobile   : zone de feu au sol pulsant on/off (cycle 2.5s),
//                        dégâts seulement en phase ON. Lecture cendres actives.
//   - mur_explosif     : mur fissuré qui ÉCLATE en projectiles braises à la
//                        cassure. Détruire = dangereux mais souvent récompensé
//                        (sous-salle cachée).
//   - mur_secret       : mur VISUELLEMENT IDENTIQUE à une plateforme/sol normale
//                        du biome (aucun indice). Cassable en 4 hits. Première
//                        fissure révélée après ~2 hits. Pure découverte
//                        Metroidvania — récompense l'exploration aveugle.
//
// La data ici décrit les paramètres et le balance ; les visuels sont dans
// `render/entities/*`. L'instanciation physique est dans `entities/Obstacle.js`.

export const TYPES_OBSTACLES = {
    // ─── Hérités ────────────────────────────────────────────────────
    pieu: {
        id: 'pieu',
        // Direction = 'sol' (pointes vers le haut) ou 'plafond' (pointes vers le bas)
        largeur: 24, hauteur: 18,
        degats: 3,
        invincibiliteApresHit: 600
    },
    ressort: {
        id: 'ressort',
        largeur: 28, hauteur: 14,
        boostVy: -600,
        cooldown: 250
    },
    plateforme_mobile: {
        id: 'plateforme_mobile',
        largeur: 90, hauteur: 14,
        amplitudeDefault: 140,
        periodeDefault: 2400
    },

    // ─── Vague 1 ─────────────────────────────────────────────────────
    eboulis: {
        id: 'eboulis',
        // Tas de gravats bloquant. data fournit largeur/hauteur (variable).
        // hp : nombre de coups d'attaque pour briser (par défaut 3).
        largeurDefault: 80, hauteurDefault: 60,
        hpDefault: 3,
        // Drop facultatif au break (data.dropSel: bool, dropFragmentFamille: 'blanc'|'bleu'|'noir')
        invincibiliteApresHit: 200
    },
    mur_fissure: {
        id: 'mur_fissure',
        // Mur vertical bloquant, cache passage/coffre. Plus dur qu'un éboulis.
        largeurDefault: 30, hauteurDefault: 140,
        hpDefault: 4,
        invincibiliteApresHit: 250
    },
    sol_effrite: {
        id: 'sol_effrite',
        // Plateforme normale jusqu'au contact, puis disparition après délai.
        // data : { largeur, hauteur=14 par défaut }
        largeurDefault: 90, hauteurDefault: 14,
        delaiEffondrementMs: 1200,    // temps entre contact et disparition
        fadeDureeMs: 200              // durée du fade out
    },
    roc_tombe: {
        id: 'roc_tombe',
        // Roc qui tombe périodiquement depuis le plafond.
        // data : { x (col), yTopOrigine (départ haut), yTopCible (zone d'impact) }
        largeur: 36, hauteur: 36,
        degatsImpact: 4,
        invincibiliteApresHit: 600,
        // Cycle : ombre apparait → 500ms → chute (vitesse) → impact → 2s repos → re-apparait
        delaiAvertissementMs: 500,
        delaiReposMs: 2000,
        vitesseChute: 700
    },
    plaque_pression: {
        id: 'plaque_pression',
        // Plaque au sol qui déclenche un effet à l'overlap joueur.
        // data : { x, y (centre), effet: 'pieux' | ... , params: {...} }
        largeurDefault: 60, hauteurDefault: 8,
        cooldownReactivationMs: 1500    // évite spam si on reste dessus
    },

    // ─── Vague 2 ────────────────────────────────────────────────────
    racines_reflux: {
        id: 'racines_reflux',
        // Zone qui cycle : 1s "plateforme" (joueur peut sauter dessus),
        //                  2s "pieu" (dégâts au contact).
        // Visuellement : racines pourpres émergeant du sol.
        largeurDefault: 60, hauteurDefault: 40,
        cycleMs: 3000,
        plateformeRatio: 0.33,         // 33% du cycle = 1s en plateforme
        degatsPieu: 3,
        invincibiliteApresHit: 500
    },
    anti_ancrage: {
        id: 'anti_ancrage',
        // Zone non-physique. Détectée par AncrageSystem qui refuse de poser
        // une ancre si player est dans la zone.
        // data : { x, y (centre), largeur, hauteur }
        largeurDefault: 200, hauteurDefault: 200
    },

    // ─── Vague 3 — Halls Cendrés ───────────────────────────────────
    brasier_mobile: {
        id: 'brasier_mobile',
        // Zone de feu au sol qui pulse on/off cycliquement.
        // Phase ON = dégâts au contact, phase OFF = socle terni inerte.
        // Lecture biome Halls (cendres actives, feux résiduels).
        // data : { x, y (centre), largeur, hauteur, cycleMs?, offsetMs? }
        largeurDefault: 90, hauteurDefault: 36,
        cycleMs: 2500,
        feuRatio: 0.55,                // 55% du cycle = ON (fenêtre passage 45%)
        degatsFeu: 3,
        invincibiliteApresHit: 500
    },
    mur_explosif: {
        id: 'mur_explosif',
        // Mur fissuré chargé de braises. À la rupture, éclate en 6 projectiles
        // radiaux qui font des dégâts. Sa destruction est dangereuse — récompense
        // accrue (sous-salle, raccourci). Visuel pré-rupture = runes rouges.
        // data : { x, y (centre), largeur, hauteur, hp? }
        largeurDefault: 32, hauteurDefault: 140,
        hpDefault: 4,
        invincibiliteApresHit: 250,
        // Explosion à la rupture
        nbProjectiles: 6,
        vitesseProjectile: 320,
        degatsProjectile: 4,
        rayonExplosion: 220
    },

    mur_secret: {
        id: 'mur_secret',
        // Mur cassable VISUELLEMENT IDENTIQUE à une plateforme/sol normale du
        // biome (même couleur, même ornement painterly). Aucune fissure visible.
        // Seul indice = particules de poussière à l'impact (signal sonore-visuel
        // équivalent : "ça sonne creux"). Premier hit révèle une micro-fissure
        // qui s'élargit avec les coups suivants. Métroidvania classique.
        // data : { x, y (centre), largeur, hauteur, hp? }
        largeurDefault: 60, hauteurDefault: 40,
        hpDefault: 4,
        invincibiliteApresHit: 200
    }
};
