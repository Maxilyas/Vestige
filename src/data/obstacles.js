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

    // ─── Vague 4 — Halls Cendrés Phase 9.7 (extension toolkit) ─────
    geyser_vapeur: {
        id: 'geyser_vapeur',
        // Geyser vertical qui pulse on/off. Phase ON = dégâts au contact +
        // catapulte le joueur verticalement (boostVy fort, ~-720). Phase
        // OFF = silhouette inerte au sol. Mécanique de mobilité-danger
        // (utiliser pour atteindre des paliers hauts, mais subir si timing rate).
        // data : { x, y (centre), largeur, hauteur, cycleMs?, offsetMs?, boostVy? }
        largeurDefault: 48, hauteurDefault: 180,
        cycleMs: 2800,
        vapeurRatio: 0.45,             // 45% du cycle = ON (fenêtre OFF 55%)
        degatsVapeur: 3,
        boostVy: -720,                  // plus fort que ressort (qui est -600)
        invincibiliteApresHit: 500,
        cooldownBoostMs: 250
    },
    rideau_acide: {
        id: 'rideau_acide',
        // Zone fine verticale (du plafond au sol), gouttes vertes en chute
        // continue. PAS de phase off — toujours actif. Dégâts au contact
        // avec invincibilité bref (le joueur peut traverser au sprint).
        // data : { x, y (centre), largeur, hauteur }
        largeurDefault: 30, hauteurDefault: 200,
        degatsAcide: 2,
        invincibiliteApresHit: 600     // plus long = encourage traversée rapide
    },
    bloc_charbon: {
        id: 'bloc_charbon',
        // Bloc dynamique pushable par le joueur (marche contre = pousse).
        // Friction au sol pour ralentir. Si en overlap avec brasier ON →
        // s'enflamme → explose après 1.5s (réutilise pipeline mur_explosif).
        // data : { x, y (centre), largeur, hauteur, hp? }
        largeurDefault: 50, hauteurDefault: 50,
        hpDefault: 3,
        invincibiliteApresHit: 250,
        friction: 220,                  // décélération px/s² horizontale
        vitessePushMax: 90,             // vitesse max quand poussé
        delaiEnflammeMs: 1500,           // temps entre contact brasier ON et explosion
        nbProjectilesExplosion: 5,
        vitesseProjectileExplosion: 280,
        degatsProjectile: 4,
        rayonExplosion: 180
    },

    // ─── Vague 5 — Halls Cendrés Phase 9.8 (toolkit medium-cost) ──
    marteau_pilon: {
        id: 'marteau_pilon',
        // Cycle vertical : repos haut (1000ms) → chute (300ms) → repos bas
        // (800ms) → remontée (600ms). Dégâts massifs pendant chute + impact,
        // + knockback horizontal (joueur projeté du côté opposé à son x).
        // data : { x, y (centre), largeur, hauteur, yTopRepos, yTopImpact, cycleMs?, offsetMs? }
        largeurDefault: 60, hauteurDefault: 80,
        cycleMs: 2700,
        ratioReposHaut: 0.37,     // 1000/2700
        ratioChute: 0.11,          // 300/2700
        ratioReposBas: 0.30,       // 800/2700
        ratioRemonte: 0.22,        // 600/2700
        degatsImpact: 6,
        knockbackHorizontal: 280,
        invincibiliteApresHit: 700
    },
    piston_thermique: {
        id: 'piston_thermique',
        // Sort horizontalement du mur. Cycle : rentré (1500ms) → sortie
        // (400ms) → étendu (500ms) → rétraction (600ms). Solide bloquant en
        // permanence. Knockback horizontal au début de la sortie.
        // data : { x, y (centre rentré), largeur (rentrée), longueurExtension, hauteur, orientation: 'gauche'|'droite', cycleMs?, offsetMs? }
        largeurRentreDefault: 24,
        longueurExtensionDefault: 110,
        hauteurDefault: 50,
        cycleMs: 3000,
        ratioRentre: 0.50,         // 1500/3000
        ratioSortie: 0.13,          // 400/3000
        ratioEtendu: 0.17,          // 500/3000
        ratioRetraction: 0.20,      // 600/3000
        degatsContact: 4,
        knockbackHorizontal: 380,
        invincibiliteApresHit: 600
    },
    scie_circulaire: {
        id: 'scie_circulaire',
        // Disque cranté glissant sur rail H ou V (sinusoïdal). Rotation
        // perpétuelle = dégâts au contact continu (avec invincibilité brève).
        // data : { x, y (centre), rayon, axe: 'horizontale'|'verticale', amplitude, periode, vitesseRot? }
        rayonDefault: 22,
        amplitudeDefault: 160,
        periodeDefault: 2400,
        vitesseRotDefault: 18,     // tr/s
        degatsContact: 4,
        invincibiliteApresHit: 450
    },

    // ─── Vague 6 — Cristaux Glacés (toolkit « Silence & Glace ») ──
    stalactite_resonance: {
        id: 'stalactite_resonance',
        // Pic de cristal gris « résonance morte » suspendu au plafond. Ne tombe
        // PAS sous le poids du joueur — tombe quand le joueur fait DU BRUIT
        // (attaque X à proximité). Fissure d'avertissement brève puis chute.
        // data : { x, yTop (suspendu), yTopImpact (zone de chute) }
        largeur: 30, hauteur: 56,
        degatsImpact: 4,
        vitesseChute: 760,
        rayonBruit: 190,              // rayon de déclenchement autour de l'attaque
        delaiFissureMs: 420,         // avertissement (fissure + son) avant chute
        invincibiliteApresHit: 600
    },
    verglas: {
        id: 'verglas',
        // Zone-overlap posée sur un sol/palier : tant que le joueur la touche,
        // le mouvement devient glissant (réutilise player._tileEffectGlissant,
        // déjà géré par GameScene). Aucun dégât — c'est un défi de mouvement.
        // data : { x, y (centre), largeur, hauteur }
        largeurDefault: 160, hauteurDefault: 50,
        dureeEffetMs: 220            // glissant rafraîchi tant qu'on overlap
    },
    faille_vide: {
        id: 'faille_vide',
        // Fissure de « Présent pur » (vide d'existence) dans le sol. Tomber
        // dedans draine une grosse part de Résonance (pas la mort) + repousse
        // le joueur vers le haut. Cooldown pour éviter le multi-drain.
        // data : { x, y (centre), largeur, hauteur }
        largeurDefault: 90, hauteurDefault: 40,
        drainResonance: 28,
        knockbackVy: -520,
        cooldownMs: 1200
    },
    cristal_resonant: {
        id: 'cristal_resonant',
        // Cristal violet « mnésique » : le frapper (attaque) émet une note qui
        // RÉVÈLE/solidifie temporairement les plateforme_resonance liées (même
        // `lien`). Contrepoint de la stalactite : ici le bruit OUVRE la voie.
        // data : { x, y (centre), lien }
        largeur: 34, hauteur: 52,
        dureeRevelMs: 4500,          // durée pendant laquelle les plateformes liées sont solides
        invincibiliteApresHit: 250
    },
    plateforme_resonance: {
        id: 'plateforme_resonance',
        // Plateforme translucide intangible par défaut. Devient solide (one-way)
        // quand un cristal_resonant lié est frappé, pour dureeRevelMs. Translucide
        // au repos (silhouette visible mais on tombe au travers).
        // data : { x, y (centre), largeur, hauteur, lien }
        largeurDefault: 120, hauteurDefault: 16
    },
    souffle_blizzard: {
        id: 'souffle_blizzard',
        // Courant d'air froid : pousse doucement le joueur latéralement tant
        // qu'il est dans la zone (modifie surtout la trajectoire en plein saut).
        // Aucun dégât. Vend la sérénité « figée mais vivante » du biome.
        // data : { x, y (centre), largeur, hauteur, force (signée, +droite/-gauche) }
        largeurDefault: 200, hauteurDefault: 300,
        forceDefault: 80             // px/s ajoutés à la vélocité X par frame d'overlap
    },

    // ─── Vague 7 — Cristaux Glacés (toolkit « Le Miroir ») ───────
    plateforme_miroir: {
        id: 'plateforme_miroir',
        // Plateforme qui clignote solide↔intangible sur un cycle (oscille
        // entre « Présent » et « Miroir »). Solide pendant ratioSolide du
        // cycle, avec un clignotement d'avertissement avant de disparaître.
        // data : { x, y (centre), largeur, hauteur, cycleMs?, offsetMs? }
        largeurDefault: 120, hauteurDefault: 16,
        cycleMs: 3000,
        ratioSolide: 0.6,            // 60% du cycle = solide (40% absente)
        avertissementMs: 550         // clignotement avant disparition
    },
    faux_sol_miroir: {
        id: 'faux_sol_miroir',
        // Ressemble à une plateforme/sol Cristaux normale mais INTANGIBLE :
        // le joueur tombe au travers. Indice apprenable = ondulation « eau »
        // (le vrai marbre est mat). Aucune physique.
        // data : { x, y (centre), largeur, hauteur }
        largeurDefault: 120, hauteurDefault: 16
    },
    laser_prisme: {
        id: 'laser_prisme',
        // Barrière laser entre deux lentilles cristal. Cycle : repos → charge
        // (télégraphe) → tir. Contact pendant le tir = GEL (immobilise) + léger
        // dégât. Lumière, pas feu (serein).
        // data : { x, y (centre), largeur, hauteur, axe, cycleMs?, offsetMs? }
        cycleMs: 2600,
        tirRatio: 0.38,              // 38% du cycle = faisceau actif
        chargeMs: 500,              // télégraphe avant le tir
        degats: 2,
        gelMs: 1000,                // durée d'immobilisation
        invincibiliteApresHit: 700
    },

    // ─── Vague 8 — Voile Inversé (mécaniques de gravité) ─────────────
    bloc_gravite: {
        id: 'bloc_gravite',
        // « Blocus Croisé » : bloc solide ridable dont la chute suit la gravité
        // de la salle (pendule) XOR sa polarité `inverse`. Voyage entre repos
        // bas (sol) et repos haut (plafond) à `vitesse` px/s au flip. Deux blocs
        // de polarité opposée se croisent à mi-hauteur = marchepied éphémère.
        // data : { x, y, largeur, hauteur, yTopBas, yTopHaut, inverse, vitesse }
        tailleDefault: 54,
        vitesseDefault: 320
    },
    contrepoids: {
        id: 'contrepoids',
        // Pierre dynamique poussable (pattern bloc_charbon sans le feu), thème
        // Voile. Posée sur un plateau de balance, ajoute son `poids` à ce côté.
        // data : { x, y, largeur, hauteur, poids }
        tailleDefault: 44,
        friction: 280,                  // décélération px/s² horizontale
        vitessePushMax: 80
    },
    balance: {
        id: 'balance',
        // « Balance Gravitationnelle » : 2 plateaux ridables couplés par poulie.
        // θ piloté par (chargeG − chargeD) × signe de la gravité du joueur.
        // Charge = joueur (poidsJoueur) + contrepoids posés. Le flip d'inversion
        // change le signe → inverse le penchant.
        // data : { x, y, xG, xD, yRepos, largeur, amplitude, vitesse }
        hauteurPlateau: 16,
        amplitudeDefault: 100,
        vitesseDefault: 2.4,            // convergence de θ (unités/s)
        poidsJoueur: 1.0
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
    },

    // ─── Cœur du Reflux (Phase 9.11 — obstacles VUE DE DESSUS) ──────────
    zone_oubli: {
        id: 'zone_oubli',
        // Nappe grise où le Vestige « n'est plus rien » : tant qu'il est dedans,
        // attaque / geste / sorts / dash sont éteints. Aucun dégât — la menace
        // vient de ce qu'on traverse sans pouvoir réagir (cf. lasers lents).
        // data : { x, y (centre), largeur, hauteur }
        dureeEffetMs: 120          // fenêtre rafraîchie à chaque frame d'overlap
    },
    courant_reflux: {
        id: 'courant_reflux',
        // Rivière violette qui POUSSE le joueur dans une direction (non létale).
        // On peut s'en servir (transit rapide) ou lutter contre (lent). Direction
        // lisible par les traits de flux qui défilent.
        // data : { x, y (centre), largeur, hauteur, dirX, dirY, force }
        forceDefault: 140,
        dureeEffetMs: 120
    },
    laser_surveillance: {
        id: 'laser_surveillance',
        // Faisceau qui balaie (pivot rotatif, ou oscillant si `arc`). Hit MANUEL
        // (un AABB arcade ne tourne pas) : la géométrie joueur/faisceau est testée
        // dans update(). Lecture facile (lent), esquive par dash.
        // data : { x, y (pivot), longueur, angleDeb, vitesse (rad/s), arc?, epaisseur, degats? }
        longueurDefault: 360,
        vitesseDefault: 0.9,            // rad/s
        epaisseurDefault: 12,
        degatsDefault: 5,
        invincibiliteApresHit: 700
    },
    onde_radiale: {
        id: 'onde_radiale',
        // Onde de choc concentrique depuis un centre, périodique. Hit MANUEL
        // (anneau à un rayon donné). Se coller au mur quand l'onde passe, courir
        // au centre pendant la pause. Cœur pulsant = télégraphe.
        // data : { x, y (centre), periodeMs, vitesse (px/s), epaisseur, rayonMax, degats? }
        periodeMsDefault: 2600,
        vitesseDefault: 240,            // px/s d'expansion
        epaisseurDefault: 26,
        rayonMaxDefault: 360,
        degatsDefault: 6,
        invincibiliteApresHit: 700
    },
    pieu_mnemonique: {
        id: 'pieu_mnemonique',
        // Pieux qui surgissent du sol cycliquement (down → warning → up). Dégât
        // seulement en phase 'up' (body.enable togglé). Avertissement clignotant
        // avant le surgissement.
        // data : { x, y (centre), largeur, hauteur, cycleMs, offsetMs, dureeUpMs, degats? }
        largeurDefault: 70, hauteurDefault: 70,
        cycleMsDefault: 2400,
        dureeUpMsDefault: 900,
        avertMsDefault: 600,
        degatsDefault: 6,
        invincibiliteApresHit: 700
    },
    regard_fige: {
        id: 'regard_fige',
        // Statue avec cône de vision : tire un projectile lent (parry-able) vers
        // le joueur quand il entre dans le cône (cooldown). Trivial à éviter hors
        // du cône, dramatique en zone d'oubli.
        // data : { x, y (statue), angle, demiCone, portee, cooldownMs, vitesseProj, degatsProj }
        demiConeDefault: 0.5,           // rad (demi-angle du cône)
        porteeDefault: 420,
        cooldownMsDefault: 1600,
        vitesseProjDefault: 150,
        degatsProjDefault: 6
    }
};
