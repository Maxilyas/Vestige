// ════════════════════════════════════════════════════════════════════
// FORMAT DES SALLES HANDCRAFTED — Spec + helpers de construction
// ════════════════════════════════════════════════════════════════════
//
// Une SALLE est un fichier JS qui définit pixel par pixel toute sa
// géométrie : plateformes, obstacles, portes, zones interactives (ancres
// construction Ruines, etc.), spawn par défaut. Pas d'assemblage
// algorithmique — on contrôle tout.
//
// Pourquoi handcrafted :
//   • Vraie verticalité multi-couches (4-5 niveaux y empilés)
//   • Mécaniques de biome intégrées comme PUZZLE central (l'ancre Ruines
//     n'est pas un détail au passage — elle est la clé de traversée)
//   • Lecture pixel-précise par le designer
//
// ─── Convention d'écriture ──────────────────────────────────────────
//   • Coordonnées ABSOLUES dans la salle (pas de chunks, pas de translation)
//   • Plateformes : helpers retournent directement le format engine
//     (y centre, largeur, hauteur, oneWay). Tu écris en yTop, le helper
//     convertit.
//   • Constantes physiques partagées : ECART_VERT_SAFE=70, jump max ≈96,
//     saut horiz max ≈130 edge-to-edge.
//   • Dimensions cibles Ruines : ~2000-3500 wide × 1100-1400 high
//     (4-5 couches verticales empilées).
//
// ─── Format d'une salle ─────────────────────────────────────────────
//
//   export const ruines_xxx = {
//     id: 'ruines_xxx',
//     biome: 'ruines_basses',
//     nom: 'Le Grimpeur',
//     dims: { largeur: 3000, hauteur: 1300 },
//     portesPossibles: ['O','E'],
//     archetypesCompatibles: ['hall','pont','crypte'],
//
//     generer({ rng, portesActives }) {
//       const plateformes = [
//         sol(0, 3000, 1160),                                  // sol bas
//         plateforme(800, 740, 240, { oneWay: true }),         // couche 2
//         ...
//       ];
//       const obstacles = [ pieuSol(500, 1160), ... ];
//       const zones = [ ancre(600, 800), ... ];                // ancres Ruines
//       const portes = {};
//       if (portesActives.includes('O')) portes.O = porteO(1160);
//       if (portesActives.includes('E')) portes.E = porteE(this.dims.largeur, 320);
//       const spawnDefault = { x: 80, y: 1140 };
//       return { plateformes, obstacles, portes, zones, spawnDefault };
//     }
//   };
//
// ─── Tags sur plateformes (gameplay biome, à venir par biome) ───────
//   'destructible:hp=2'  → Halls
//   'gouffre_lethal'     → Cristaux (zone)
//   'corruptible:...'    → Voile
//
// ════════════════════════════════════════════════════════════════════

// ─── Constantes physiques partagées ───
export const HAUTEUR_SOL = 40;
export const ECART_VERT_SAFE = 70;   // saut vertical sûr (jump max ≈ 96)
// Réf saut horizontal sûr edge-to-edge : 130 px.

// Dimensions porte (mêmes valeurs que topographies.js)
export const LARGEUR_PORTE = 60;
export const HAUTEUR_PORTE = 90;
export const MARGE_BORD_PORTE = 8;

// ─── Helpers de construction (primitives en yTop, retournent format engine) ───

/** Plateforme posée (palier, corniche). x = centre, yTop = top, w = largeur. */
export function plateforme(x, yTop, w, opts = {}) {
    const h = opts.h ?? 16;
    return {
        x,
        y: yTop + h / 2,
        largeur: w,
        hauteur: h,
        oneWay: opts.oneWay ?? false,
        tags: opts.tags ?? []
    };
}

/** Sol horizontal (épaisseur HAUTEUR_SOL par défaut). */
export function sol(xDeb, xFin, yTop, opts = {}) {
    const h = opts.h ?? HAUTEUR_SOL;
    return {
        x: (xDeb + xFin) / 2,
        y: yTop + h / 2,
        largeur: xFin - xDeb,
        hauteur: h,
        oneWay: false,
        tags: opts.tags ?? []
    };
}

/**
 * Plafond bloquant — sépare deux étages d'une même salle. Sa fonction
 * peut être :
 *   • DUAL : sert AUSSI de plateforme walkable pour l'étage du dessus
 *     (cas Ruines cathédrale, atelier — joueur marche sur le plafond).
 *   • CATHÉDRALE : ferme la voûte sans être walkable (cas Halls — plafond
 *     organique en haut de salle). Pour ce cas, utiliser `plafondCathedrale`.
 *
 * Par défaut walkable (compat Ruines). Pour rendre non-walkable (validateur
 * BFS), utiliser `plafondCathedrale` ou ajouter manuellement tag 'structurel'.
 *
 * @param {number} xDeb  - x gauche
 * @param {number} xFin  - x droit
 * @param {number} yTop  - top du plafond
 * @param {object} [opts] - { h? = 14, tags? }
 */
export function plafond(xDeb, xFin, yTop, opts = {}) {
    const h = opts.h ?? 14;
    return {
        x: (xDeb + xFin) / 2,
        y: yTop + h / 2,
        largeur: xFin - xDeb,
        hauteur: h,
        oneWay: false,
        tags: opts.tags ?? []
    };
}

/**
 * Plafond CATHÉDRALE / VOÛTE : équivalent à `plafond` mais auto-tagué
 * 'structurel'. Signale que le joueur n'est pas censé marcher sur le top
 * (plafond ornemental qui ferme la salle, pas un palier). Le validateur
 * BFS ignore ces éléments.
 *
 * Use cases : voûtes Halls, plafonds organiques avec stalactites, fermetures
 * supérieures des cavernes.
 */
export function plafondCathedrale(xDeb, xFin, yTop, opts = {}) {
    const h = opts.h ?? 14;
    const tagsBase = opts.tags ?? [];
    return {
        x: (xDeb + xFin) / 2,
        y: yTop + h / 2,
        largeur: xFin - xDeb,
        hauteur: h,
        oneWay: false,
        tags: tagsBase.includes('structurel') ? tagsBase : [...tagsBase, 'structurel']
    };
}

/**
 * Mur VERTICAL plein. Pour fermer les bords d'une salle, créer des piliers,
 * cloisons internes, etc. Bloque tous les axes (pas oneWay).
 *
 * Tagué 'structurel' automatiquement : le validateur ne s'attend pas à ce
 * que le joueur marche sur le top fin d'un mur (épaisseur 30).
 *
 * @param {number} x        - centre x
 * @param {number} yHaut    - top du mur
 * @param {number} yBas     - bottom du mur
 * @param {object} [opts]   - { epaisseur? = 30, tags? }
 */
export function mur(x, yHaut, yBas, opts = {}) {
    const epaisseur = opts.epaisseur ?? 30;
    const tagsBase = opts.tags ?? [];
    return {
        x,
        y: (yHaut + yBas) / 2,
        largeur: epaisseur,
        hauteur: yBas - yHaut,
        oneWay: false,
        tags: tagsBase.includes('structurel') ? tagsBase : [...tagsBase, 'structurel']
    };
}

/**
 * Mur lateral GAUCHE : ferme le bord ouest d'une salle du plafond au sol.
 * À utiliser quand la porte O n'est pas active (donc bord plein).
 * Inclut un peu de décor : pas plat 100%, légère varation x pour donner
 * une lecture "paroi rocheuse" plutôt qu'écran lisse.
 */
export function murLateralGauche(yHaut, yBas, opts = {}) {
    const x = opts.x ?? 15;
    return mur(x, yHaut, yBas, { epaisseur: 30, ...opts });
}

/**
 * Mur lateral DROIT : ferme le bord est. Symétrique de murLateralGauche.
 */
export function murLateralDroit(largeurSalle, yHaut, yBas, opts = {}) {
    const x = opts.x ?? largeurSalle - 15;
    return mur(x, yHaut, yBas, { epaisseur: 30, ...opts });
}

// ─── Helpers de portes ───
// Convention : la porte "repose" sur le palier d'arrivée. yTopPalier =
// altitude du sol/palier où l'on arrive par cette porte.

export function porteO(yTopPalier, opts = {}) {
    return {
        direction: 'O',
        x: LARGEUR_PORTE / 2 + (opts.margeBord ?? MARGE_BORD_PORTE),
        y: yTopPalier - HAUTEUR_PORTE / 2,
        largeur: LARGEUR_PORTE, hauteur: HAUTEUR_PORTE,
        interieur: 'droite'
    };
}

export function porteE(dimsLargeur, yTopPalier, opts = {}) {
    return {
        direction: 'E',
        x: dimsLargeur - LARGEUR_PORTE / 2 - (opts.margeBord ?? MARGE_BORD_PORTE),
        y: yTopPalier - HAUTEUR_PORTE / 2,
        largeur: LARGEUR_PORTE, hauteur: HAUTEUR_PORTE,
        interieur: 'gauche'
    };
}

export function porteN(x, yTopPorte) {
    return {
        direction: 'N',
        x,
        y: yTopPorte + HAUTEUR_PORTE / 2,
        largeur: LARGEUR_PORTE, hauteur: HAUTEUR_PORTE,
        interieur: 'bas'
    };
}

export function porteS(x, yTopPalier) {
    return {
        direction: 'S',
        x,
        y: yTopPalier - HAUTEUR_PORTE / 2,
        largeur: LARGEUR_PORTE, hauteur: HAUTEUR_PORTE,
        interieur: 'haut'
    };
}

// ─── Helpers obstacles (y centre direct, convention engine) ───

export function pieuSol(x, yTopSol) {
    // pieu hauteur 18 (cf. data/obstacles.js), centre = yTopSol - 9
    return { type: 'pieu', x, y: yTopSol - 9, orientation: 'sol' };
}

export function pieuPlafond(x, yBottomPlafond) {
    return { type: 'pieu', x, y: yBottomPlafond + 9, orientation: 'plafond' };
}

export function ressort(x, yTopSol) {
    return { type: 'ressort', x, y: yTopSol - 7 };
}

/**
 * Zone MONOLITHE VESTIGE — point d'intérêt narratif interactif.
 *
 * Le joueur s'approche + touche E → popup texte de lore + drop Fragment Noir
 * à la 1ère lecture seulement (persistance localStorage). Re-lecture autorisée
 * sans drop. Visuellement c'est un grand bloc de pierre debout avec runes
 * Reflux pulsantes, attire l'œil de loin.
 *
 * Convention : poser sur un palier safe (refuge), pas dans la zone de combat
 * principale. Le joueur doit grimper/atteindre le palier pour lire — c'est
 * une récompense d'exploration, pas une obstruction.
 *
 * @param {number} x        centre x du monolithe
 * @param {number} yTopPalier  top du palier sur lequel le monolithe repose
 * @param {object} opts     { loreId, largeur?=30, hauteur?=60 }
 */
export function vestigeLore(x, yTopPalier, opts = {}) {
    const largeur = opts.largeur ?? 30;
    const hauteur = opts.hauteur ?? 60;
    return {
        type: 'vestige_lore',
        x,
        y: yTopPalier - hauteur / 2,  // monolithe POSÉ sur le palier (sa base = yTopPalier)
        largeur,
        hauteur,
        loreId: opts.loreId
    };
}

/**
 * Zone d'ANTI-ANCRAGE — désactive le geste d'ancrage du joueur dans le rectangle.
 * Zone non-physique, lue par AncrageSystem qui refuse de poser une ancre si le
 * joueur (ou la position cible) est dedans. Utile pour empêcher de tricher sur
 * un puzzle de timing : si tu mets une zone au-dessus d'une fosse de pieux,
 * impossible de skip via une ancre — il faut utiliser les mobiles/timing.
 *
 * @param {number} x         centre x de la zone
 * @param {number} yTop      top y de la zone
 * @param {number} largeur
 * @param {number} hauteur
 */
export function antiAncrage(x, yTop, largeur, hauteur) {
    return {
        type: 'anti_ancrage',
        x,
        y: yTop + hauteur / 2,
        largeur,
        hauteur
    };
}

/**
 * Zone de GRAVITÉ INVERSÉE — signature Voile Inversé. Dans le rectangle, la
 * gravité du JOUEUR tire vers le HAUT (les ennemis ne sont PAS affectés) : il
 * « tombe » au plafond, marche tête en bas sous une corniche, et retombe vers
 * le sol en sortant latéralement de la zone. Lue chaque frame par GameScene.
 *
 * Convention de placement (cf. proto voile_chambre_inversee) :
 *   • La corniche-plafond walkable doit être SOLIDE + taguée 'gravite_inverse'
 *     (le validateur BFS gravité-normale l'ignore : atteignable seulement par
 *     l'inversion).
 *   • Le bas de la zone doit rester AU-DESSUS du joueur debout au sol (centre
 *     ~ ySol−30) pour ne pas l'aspirer en marchant ; mais sous l'apogée d'un
 *     saut depuis le sol (centre ~ ySol−66) pour qu'un saut l'attrape.
 *   • Le coffre-récompense se place au niveau du joueur tête en bas
 *     (≈ corniche.bottom + PLAYER_H/2).
 *
 * @param {number} x        centre x de la colonne
 * @param {number} yTop     top y de la zone
 * @param {number} largeur
 * @param {number} hauteur
 */
export function graviteInverse(x, yTop, largeur, hauteur) {
    return {
        type: 'gravite_inverse',
        x,
        y: yTop + hauteur / 2,
        largeur,
        hauteur
    };
}

/**
 * Plateforme MOBILE oscillante (one-way virtuelle : le joueur la traverse
 * par le dessous/côtés, n'atterrit que par le dessus). Le mouvement est
 * sinusoïdal autour du centre (x, y), amplitude = portée max d'un côté.
 * Le joueur posé dessus est transporté par la collision physique.
 *
 * @param {number} x          centre x (= position de repos)
 * @param {number} yTop       top de la plateforme à sa position centrale
 * @param {number} w          largeur visuelle
 * @param {object} [opts]     { axe, amplitude, periode, hauteur }
 *                            axe : 'horizontale' (défaut) | 'verticale'
 *                            amplitude : portée max d'un côté (défaut 140 px)
 *                            periode : durée d'un cycle complet en ms (défaut 2400)
 *                            hauteur : épaisseur visuelle (défaut 14)
 */
export function plateformeMobile(x, yTop, w, opts = {}) {
    const hauteur = opts.hauteur ?? 14;
    return {
        type: 'plateforme_mobile',
        x,
        y: yTop + hauteur / 2,
        largeur: w,
        hauteur,
        axe: opts.axe ?? 'horizontale',
        amplitude: opts.amplitude ?? 140,
        periode: opts.periode ?? 2400
    };
}

// ─── Helpers obstacles Vague 1 (étape 4C) ───
// Tous en coords ABSOLUES dans la salle, y = centre (convention engine).

/** Éboulis cassable bloquant un passage.
 *  Hauteur min 110 — sinon le joueur peut sauter par-dessus (saut max 96).
 *  Pour vraiment bloquer le passage, place l'éboulis dans un TUNNEL
 *  (plateforme plafond juste au-dessus pour empêcher le contournement).
 */
export function eboulis(x, yTop, opts = {}) {
    const largeur = opts.largeur ?? 80;
    const hauteur = Math.max(110, opts.hauteur ?? 110);
    return {
        type: 'eboulis',
        x,
        y: yTop + hauteur / 2,
        largeur, hauteur,
        hp: opts.hp ?? 3,
        dropSel: opts.dropSel ?? false,
        dropFragmentFamille: opts.dropFragmentFamille ?? null
    };
}

/** Mur fissuré vertical, cache souvent un passage/coffre derrière. */
export function murFissure(x, yTop, opts = {}) {
    const largeur = opts.largeur ?? 30;
    const hauteur = opts.hauteur ?? 140;
    return {
        type: 'mur_fissure',
        x,
        y: yTop + hauteur / 2,
        largeur, hauteur,
        hp: opts.hp ?? 4,
        dropSel: opts.dropSel ?? false,
        dropFragmentFamille: opts.dropFragmentFamille ?? null
    };
}

/**
 * Sol qui s'effrite : plateforme normale jusqu'au contact joueur, puis
 * disparaît après 1.2s. Synergie ancrage : poser une ancre en amont pour
 * créer un palier de secours, ou ancrer au-dessus en courant pour le
 * "remplacer".
 */
export function solEffrite(x, yTop, largeur, opts = {}) {
    const hauteur = opts.hauteur ?? 14;
    return {
        type: 'sol_effrite',
        x,
        y: yTop + hauteur / 2,
        largeur, hauteur
    };
}

/**
 * Roc qui tombe périodiquement depuis le plafond.
 * @param x centre x de l'axe de chute
 * @param yTopOrigine top du roc à son point de départ (plafond)
 * @param yTopImpact top du sol/palier où le roc s'écrasera
 */
export function rocQuiTombe(x, yTopOrigine, yTopImpact) {
    return {
        type: 'roc_tombe',
        x,
        yOrigine: yTopOrigine + 18,    // centre roc au départ (hauteur 36 → centre = top + 18)
        yImpact:  yTopImpact + 18      // centre roc à l'impact
    };
}

/**
 * Plaque de pression au sol. Déclenche un effet quand le joueur la touche.
 * @param x centre
 * @param yTopSol top du sol sur lequel la plaque est posée
 * @param effet  type d'effet : 'pieux'
 * @param params params de l'effet (ex: { positions: [{x,y}, ...] } pour pieux)
 */
export function plaque(x, yTopSol, effet, params = {}) {
    const hauteur = 8;
    return {
        type: 'plaque_pression',
        x,
        y: yTopSol - hauteur / 2,
        largeur: 60, hauteur,
        effet,
        params
    };
}

// ─── Helpers obstacles Vague 3 (Halls Cendrés) ───

/**
 * Brasier mobile : zone de feu au sol qui pulse on/off cycliquement.
 * Phase ON (55% du cycle) = dégâts. Phase OFF (45%) = passage sûr.
 * Le joueur ne marche PAS dessus — c'est une zone de dégâts traversable
 * (pas de plateforme). Pour bloquer un passage, le placer DANS le couloir.
 * Pour synchroniser/désynchroniser plusieurs brasiers : varier offsetMs.
 * @param {number} x         centre x
 * @param {number} yTopSol   top du sol sur lequel le brasier est posé
 * @param {object} [opts]    { largeur, hauteur, cycleMs, offsetMs }
 */
export function brasier(x, yTopSol, opts = {}) {
    const largeur = opts.largeur ?? 90;
    const hauteur = opts.hauteur ?? 36;
    return {
        type: 'brasier_mobile',
        x,
        y: yTopSol - hauteur / 2,  // ancré au sol (top du brasier au-dessus du sol)
        largeur, hauteur,
        cycleMs: opts.cycleMs ?? 2500,
        offsetMs: opts.offsetMs ?? 0
    };
}

/**
 * Mur SECRET : visuellement IDENTIQUE à une plateforme/sol normale du biome
 * (même palette, même ornement painterly). Aucune fissure visible. Le joueur
 * découvre qu'il est cassable EN L'ATTAQUANT — dust particles + sound creux
 * au premier hit, fissure visible après quelques coups.
 *
 * Utilisations type Metroidvania :
 *   • Pan de mur lateral cachant une niche/coffre
 *   • Sol qui mène à une cave secrète (attaquer le sol)
 *   • Plafond cassable révélant une cheminée verticale
 *
 * HP par défaut 4. Pour bloquer vraiment un passage horizontal, prévoir
 * largeur ≥ 60. Pour une dalle de sol, prévoir largeur 80-200.
 * @param {number} x      - centre x
 * @param {number} yTop   - top du mur
 * @param {number} w      - largeur
 * @param {number} h      - hauteur (40-200 selon usage)
 * @param {object} [opts] - { hp?, dropSel?, dropFragmentFamille?, orientation? }
 *                          orientation : 'mur' (vertical) | 'sol' (horizontal,
 *                          dessiné comme un sol). Influence le visuel.
 */
export function murSecret(x, yTop, w, h, opts = {}) {
    return {
        type: 'mur_secret',
        x,
        y: yTop + h / 2,
        largeur: w, hauteur: h,
        hp: opts.hp ?? 4,
        orientation: opts.orientation ?? 'mur',
        dropSel: opts.dropSel ?? false,
        dropFragmentFamille: opts.dropFragmentFamille ?? null
    };
}

// ─── Helpers obstacles Vague 4 (Halls Cendrés Phase 9.7) ───

/**
 * Geyser de vapeur : jet vertical cyclique (on/off comme brasier). Phase
 * ON = dégâts ET catapulte verticale (boostVy ~-720, plus fort que ressort).
 * Mécanique double : utiliser pour atteindre paliers hauts, mais subir si
 * timing rate.
 * @param {number} x         centre x
 * @param {number} yTopSol   top du sol sur lequel le geyser est ancré
 * @param {object} [opts]    { hauteur?, cycleMs?, offsetMs?, boostVy? }
 */
export function geyserVapeur(x, yTopSol, opts = {}) {
    const largeur = opts.largeur ?? 48;
    const hauteur = opts.hauteur ?? 180;
    return {
        type: 'geyser_vapeur',
        x,
        y: yTopSol - hauteur / 2,    // base = yTopSol, top = yTopSol - hauteur
        largeur, hauteur,
        cycleMs: opts.cycleMs ?? 2800,
        offsetMs: opts.offsetMs ?? 0,
        boostVy: opts.boostVy ?? -720
    };
}

/**
 * Rideau d'acide : zone fine verticale (du plafond au sol), gouttes vertes
 * en chute continue, toujours actif. Dégâts au contact mais invincibilité
 * brève — encourage la traversée rapide (sprint à travers).
 * @param {number} x            centre x
 * @param {number} yTopPlafond  top du rideau (au plafond ou suspendu)
 * @param {number} hauteur      hauteur totale du rideau
 * @param {object} [opts]       { largeur? = 30 }
 */
export function rideauAcide(x, yTopPlafond, hauteur, opts = {}) {
    const largeur = opts.largeur ?? 30;
    return {
        type: 'rideau_acide',
        x,
        y: yTopPlafond + hauteur / 2,
        largeur, hauteur
    };
}

/**
 * Bloc de charbon : plateforme dynamique pushable par le joueur (marche
 * contre = pousse). Friction au sol pour ralentir. Combo signature : si
 * en overlap avec brasier ON → s'enflamme → explose en projectiles braises.
 * Le joueur peut donc utiliser un bloc pour étouffer un brasier, ou le
 * pousser dans un brasier pour ouvrir un passage explosif.
 * @param {number} x         centre x (position initiale du bloc)
 * @param {number} yTopSol   top du sol sur lequel le bloc repose
 * @param {object} [opts]    { taille? = 50, hp? }
 */
export function blocCharbon(x, yTopSol, opts = {}) {
    const taille = opts.taille ?? 50;
    return {
        type: 'bloc_charbon',
        x,
        y: yTopSol - taille / 2,    // base = yTopSol
        largeur: taille,
        hauteur: taille,
        hp: opts.hp ?? 3
    };
}

// ─── Helpers obstacles Vague 5 (Halls Cendrés Phase 9.8 medium-cost) ───

/**
 * Marteau-pilon : bloc qui descend du plafond, écrase et remonte cycliquement.
 * Position fixe en x. Dégâts massifs pendant chute + knockback horizontal.
 * @param {number} x            centre x du marteau
 * @param {number} yTopRepos    top du marteau en position repos haute (proche plafond)
 * @param {number} yTopImpact   top du marteau en position impact bas
 * @param {object} [opts]       { largeur?=60, hauteur?=80, cycleMs?, offsetMs? }
 */
export function marteauPilon(x, yTopRepos, yTopImpact, opts = {}) {
    const largeur = opts.largeur ?? 60;
    const hauteur = opts.hauteur ?? 80;
    // y centre initial = position repos haute
    return {
        type: 'marteau_pilon',
        x,
        y: yTopRepos + hauteur / 2,
        largeur, hauteur,
        yTopRepos,
        yTopImpact,
        cycleMs: opts.cycleMs ?? 2700,
        offsetMs: opts.offsetMs ?? 0
    };
}

/**
 * Piston à injection thermique : sort horizontalement du mur, repousse.
 * Solide bloquant en extension + knockback fort à l'impact initial.
 * @param {number} xRentre      centre x du piston rentré (au mur)
 * @param {number} yTop         top du piston (face haute)
 * @param {string} orientation  'gauche' (sort vers la gauche) | 'droite'
 * @param {object} [opts]       { hauteur?=50, longueurExtension?=110, cycleMs?, offsetMs? }
 */
export function pistonThermique(xRentre, yTop, orientation, opts = {}) {
    const hauteur = opts.hauteur ?? 50;
    const largeurRentre = opts.largeurRentre ?? 24;
    const longueurExtension = opts.longueurExtension ?? 110;
    return {
        type: 'piston_thermique',
        x: xRentre,           // position de référence (centre rentré)
        y: yTop + hauteur / 2,
        largeur: largeurRentre,
        hauteur,
        orientation,
        longueurExtension,
        cycleMs: opts.cycleMs ?? 3000,
        offsetMs: opts.offsetMs ?? 0
    };
}

/**
 * Scie circulaire : disque cranté glissant sur rail H ou V (sinusoïdal).
 * Rotation continue = dégâts au contact permanents.
 * @param {number} x          centre x (position de repos)
 * @param {number} y          centre y (position de repos)
 * @param {string} axe        'horizontale' | 'verticale'
 * @param {object} [opts]     { rayon?=22, amplitude?=160, periode?=2400 }
 */
export function scieCirculaire(x, y, axe, opts = {}) {
    const rayon = opts.rayon ?? 22;
    return {
        type: 'scie_circulaire',
        x, y,
        rayon,
        // largeur/hauteur servent pour le sprite hitbox (carré inscrit dans le cercle)
        largeur: rayon * 2,
        hauteur: rayon * 2,
        axe,
        amplitude: opts.amplitude ?? 160,
        periode: opts.periode ?? 2400
    };
}

/**
 * Mur explosif : mur fissuré chargé de braises. À la rupture, ÉCLATE en
 * projectiles braises radiaux (6 par défaut). Détruire = dangereux, mais
 * cache souvent une sous-salle/raccourci. HP par défaut 4.
 * Pré-rupture : runes rouges visibles + cœur incandescent qui s'élargit.
 */
export function murExplosif(x, yTop, opts = {}) {
    const largeur = opts.largeur ?? 32;
    const hauteur = opts.hauteur ?? 140;
    return {
        type: 'mur_explosif',
        x,
        y: yTop + hauteur / 2,
        largeur, hauteur,
        hp: opts.hp ?? 4,
        dropSel: opts.dropSel ?? false,
        dropFragmentFamille: opts.dropFragmentFamille ?? null
    };
}

// ─── Helpers obstacles Vague 6 (Cristaux Glacés — « Silence & Glace ») ───

/**
 * Stalactite de Résonance : pic de cristal gris suspendu qui tombe quand le
 * joueur fait DU BRUIT (attaque à proximité), pas sous son poids. Réutilise
 * la chute du roc. Placer AU-DESSUS d'une zone de passage/combat.
 * @param {number} x            centre x (axe de chute)
 * @param {number} yTopHang     top du pic à sa position suspendue (plafond)
 * @param {number} yTopImpact   top du sol/palier où le pic s'écrase
 * @param {object} [opts]       { rayonBruit?, degatsImpact? }
 */
export function stalactiteResonance(x, yTopHang, yTopImpact, opts = {}) {
    const hauteur = 56;
    return {
        type: 'stalactite_resonance',
        x,
        y: yTopHang + hauteur / 2,     // centre à la position suspendue
        yOrigine: yTopHang + hauteur / 2,
        yImpact: yTopImpact - hauteur / 2,
        rayonBruit: opts.rayonBruit ?? 190
    };
}

/**
 * Verglas : zone glissante posée SUR un sol/palier. Tant que le joueur la
 * touche, son mouvement devient glissant (inertie). Aucun dégât.
 * @param {number} x         centre x
 * @param {number} yTopSol   top du sol/palier recouvert de verglas
 * @param {number} largeur   largeur de la plaque de verglas
 * @param {object} [opts]    { hauteur? = 50 }
 */
export function verglas(x, yTopSol, largeur, opts = {}) {
    const hauteur = opts.hauteur ?? 50;
    return {
        type: 'verglas',
        x,
        y: yTopSol - hauteur / 2,      // zone juste au-dessus du sol
        largeur, hauteur
    };
}

/**
 * Faille de Vide : fissure de « Présent pur » dans le sol. Tomber dedans
 * draine une part de Résonance + repousse vers le haut (pas la mort).
 * Placer dans une coupure du sol (entre deux segments) pour la lecture.
 * @param {number} x         centre x
 * @param {number} yTopSol   top du sol au niveau de la faille
 * @param {number} largeur
 * @param {object} [opts]    { hauteur? = 40 }
 */
export function failleVide(x, yTopSol, largeur, opts = {}) {
    const hauteur = opts.hauteur ?? 40;
    return {
        type: 'faille_vide',
        x,
        y: yTopSol - hauteur / 2,
        largeur, hauteur
    };
}

/**
 * Cristal Résonant : cristal violet mnésique posé sur un palier. Le frapper
 * révèle/solidifie les plateforme_resonance partageant le même `lien`.
 * @param {number} x            centre x
 * @param {number} yTopPalier   top du palier sur lequel il repose
 * @param {object} opts         { lien (id de groupe, requis), hauteur? = 52 }
 */
export function cristalResonant(x, yTopPalier, opts = {}) {
    const hauteur = opts.hauteur ?? 52;
    return {
        type: 'cristal_resonant',
        x,
        y: yTopPalier - hauteur / 2,   // posé sur le palier
        lien: opts.lien
    };
}

/**
 * Plateforme de Résonance : plateforme translucide intangible, devient solide
 * (one-way) quand un cristal_resonant de même `lien` est frappé.
 * @param {number} x         centre x
 * @param {number} yTop      top de la plateforme
 * @param {number} largeur
 * @param {object} opts      { lien (requis), hauteur? = 16 }
 */
export function plateformeResonance(x, yTop, largeur, opts = {}) {
    const hauteur = opts.hauteur ?? 16;
    return {
        type: 'plateforme_resonance',
        x,
        y: yTop + hauteur / 2,
        largeur, hauteur,
        lien: opts.lien
    };
}

/**
 * Souffle de Blizzard : zone de courant d'air qui pousse latéralement le
 * joueur (surtout en plein saut). Aucun dégât. `force` signée : positif =
 * pousse vers la droite, négatif vers la gauche.
 * @param {number} x         centre x
 * @param {number} yTop      top de la zone
 * @param {number} largeur
 * @param {number} hauteur
 * @param {object} [opts]    { force? = 80 (signée) }
 */
export function souffleBlizzard(x, yTop, largeur, hauteur, opts = {}) {
    return {
        type: 'souffle_blizzard',
        x,
        y: yTop + hauteur / 2,
        largeur, hauteur,
        force: opts.force ?? 80
    };
}

// ─── Helpers obstacles Vague 7 (Cristaux Glacés — « Le Miroir ») ───

/**
 * Plateforme-Miroir : clignote solide↔intangible sur un cycle (oscille entre
 * « Présent » et « Miroir »). Avertissement visuel avant de disparaître.
 * Décaler `offsetMs` entre plusieurs pour créer un chemin qui se déplace.
 * @param {number} x        centre x
 * @param {number} yTop     top de la plateforme
 * @param {number} largeur
 * @param {object} [opts]   { hauteur? = 16, cycleMs?, offsetMs? }
 */
export function plateformeMiroir(x, yTop, largeur, opts = {}) {
    const hauteur = opts.hauteur ?? 16;
    return {
        type: 'plateforme_miroir',
        x,
        y: yTop + hauteur / 2,
        largeur, hauteur,
        cycleMs: opts.cycleMs ?? 3000,
        offsetMs: opts.offsetMs ?? 0
    };
}

/**
 * Faux sol miroir : ressemble à une plateforme Cristaux mais INTANGIBLE (on
 * tombe au travers). Indice = ondulation « eau ». Placer parmi de vraies
 * plateformes au-dessus d'un gouffre = piège de lecture.
 * @param {number} x        centre x
 * @param {number} yTop     top de la (fausse) plateforme
 * @param {number} largeur
 * @param {object} [opts]   { hauteur? = 16 }
 */
export function fauxSolMiroir(x, yTop, largeur, opts = {}) {
    const hauteur = opts.hauteur ?? 16;
    return {
        type: 'faux_sol_miroir',
        x,
        y: yTop + hauteur / 2,
        largeur, hauteur
    };
}

/**
 * Barrière laser de Phébus : faisceau cyclique on/off entre deux lentilles.
 * Contact pendant le tir = gel (immobilise) + léger dégât. Décaler `offsetMs`
 * entre plusieurs pour créer un rythme à franchir.
 * @param {number} xCentre  centre x du faisceau
 * @param {number} yCentre  centre y du faisceau
 * @param {number} longueur longueur du faisceau (selon l'axe)
 * @param {object} [opts]   { axe? = 'horizontale'|'verticale', epaisseur? = 10, cycleMs?, offsetMs? }
 */
export function laserPrisme(xCentre, yCentre, longueur, opts = {}) {
    const axe = opts.axe ?? 'horizontale';
    const epaisseur = opts.epaisseur ?? 10;
    return {
        type: 'laser_prisme',
        x: xCentre,
        y: yCentre,
        largeur: axe === 'horizontale' ? longueur : epaisseur,
        hauteur: axe === 'horizontale' ? epaisseur : longueur,
        axe,
        cycleMs: opts.cycleMs ?? 2600,
        offsetMs: opts.offsetMs ?? 0
    };
}

// ─── Helpers obstacles Vague 8 (Voile Inversé — mécaniques de gravité) ───

/**
 * Bloc à gravité (« Blocus Croisé ») : bloc solide ridable dont la chute suit
 * la gravité de la SALLE (pendule). Polarité `inverse` :
 *   • inverse=false → repose au SOL en phase normale, monte au PLAFOND au flip.
 *   • inverse=true  → repose au PLAFOND en phase normale, tombe au SOL au flip.
 * Deux blocs de polarité opposée placés côte à côte se CROISENT à mi-hauteur
 * au flip → marchepied éphémère pour franchir une fente de mur.
 *
 * Pensé pour une salle à `penduleInversion` (sinon le bloc reste figé).
 *
 * @param {number} x          centre x (les deux blocs d'une paire = x adjacents)
 * @param {number} yTopBas    top du bloc à sa position de repos BASSE (sol)
 * @param {number} yTopHaut   top du bloc à sa position de repos HAUTE (plafond)
 * @param {object} [opts]     { taille? = 54, inverse? = false, vitesse? = 320 }
 */
export function blocGravite(x, yTopBas, yTopHaut, opts = {}) {
    const taille = opts.taille ?? 54;
    const inverse = opts.inverse ?? false;
    return {
        type: 'bloc_gravite',
        x,
        // position initiale = repos de la phase normale selon la polarité
        y: (inverse ? yTopHaut : yTopBas) + taille / 2,
        largeur: taille,
        hauteur: taille,
        yTopBas,
        yTopHaut,
        inverse,
        vitesse: opts.vitesse ?? 320
    };
}

/**
 * Contrepoids (« Balance Gravitationnelle ») : pierre dynamique POUSSABLE par le
 * joueur, thème Voile. Posée sur un plateau de balance, elle ajoute son `poids`
 * à la charge de ce côté (le joueur la déplace pour faire pencher la balance).
 * Tombe toujours vers le BAS (n'est PAS affectée par l'inversion — seul le poids
 * du joueur est gravité-réactif, cf. balanceGravite).
 *
 * @param {number} x         centre x initial
 * @param {number} yTopSol   top du sol/plateau sur lequel elle repose
 * @param {object} [opts]    { taille? = 44, poids? = 1.6 }
 */
export function contrepoids(x, yTopSol, opts = {}) {
    const taille = opts.taille ?? 44;
    return {
        type: 'contrepoids',
        x,
        y: yTopSol - taille / 2,
        largeur: taille,
        hauteur: taille,
        poids: opts.poids ?? 1.6
    };
}

/**
 * Balance Gravitationnelle : deux plateaux ridables reliés par une poulie
 * (`yG = yRepos + θ·A`, `yD = yRepos − θ·A`). Le couple = (chargeG − chargeD)
 * × signe de la gravité du joueur → le POIDS du joueur penche la balance, et un
 * flip d'inversion (pendule / zone) INVERSE le sens. Charge = joueur (1) +
 * contrepoids posés sur le plateau.
 *
 * Convention validateur-safe : faire connecter les portes par le SOL (la balance
 * mène à une récompense en hauteur, pas une traversée load-bearing).
 *
 * @param {number} xG        centre x du plateau gauche
 * @param {number} xD        centre x du plateau droit
 * @param {number} yRepos    y centre des deux plateaux à l'équilibre (θ=0)
 * @param {object} [opts]    { largeur? = 120, amplitude? = 100, vitesse? = 2.4 }
 *                           amplitude : déplacement vertical max d'un plateau
 *                           vitesse   : vitesse de convergence de θ (unités/s)
 */
export function balanceGravite(xG, xD, yRepos, opts = {}) {
    return {
        type: 'balance',
        x: (xG + xD) / 2,
        y: yRepos,
        xG, xD, yRepos,
        largeur: opts.largeur ?? 120,
        amplitude: opts.amplitude ?? 100,
        vitesse: opts.vitesse ?? 2.4
    };
}

// ─── Helpers obstacles Cœur du Reflux (Phase 9.11 — VUE DE DESSUS) ───

/**
 * Zone d'OUBLI — nappe grise où le Vestige perd ses moyens : attaque, geste,
 * sorts et dash sont éteints tant qu'il est dedans. Aucun dégât. On la traverse
 * passivement, en évitant tout (lasers lents, regards). Coords en yTop.
 *
 * @param {number} x        centre x
 * @param {number} yTop     top y de la zone
 * @param {number} largeur
 * @param {number} hauteur
 */
export function zoneOubli(x, yTop, largeur, hauteur) {
    return {
        type: 'zone_oubli',
        x,
        y: yTop + hauteur / 2,
        largeur, hauteur
    };
}

/**
 * Courant de REFLUX — rivière violette qui pousse le joueur dans une direction
 * (non létale). Synergie : transit rapide si on suit le flux, lent si on lutte.
 *
 * @param {number} x        centre x
 * @param {number} yTop     top y de la zone
 * @param {number} largeur
 * @param {number} hauteur
 * @param {object} [opts]   { dir? = {x,y} (vecteur unité, déf droite), force? = 140 }
 */
export function courantReflux(x, yTop, largeur, hauteur, opts = {}) {
    const dir = opts.dir ?? { x: 1, y: 0 };
    // normalise le vecteur direction (sécurité)
    const mag = Math.hypot(dir.x, dir.y) || 1;
    return {
        type: 'courant_reflux',
        x,
        y: yTop + hauteur / 2,
        largeur, hauteur,
        dirX: dir.x / mag,
        dirY: dir.y / mag,
        force: opts.force ?? 140
    };
}

/**
 * Laser de SURVEILLANCE — faisceau qui balaie depuis un pivot. Hit manuel.
 * Coords en centre (x, y = pivot). Par défaut : rotation continue. Fournir
 * `arc` (rad) pour une oscillation au lieu d'un tour complet.
 *
 * @param {number} x        x du pivot
 * @param {number} y        y du pivot
 * @param {object} [opts]   { longueur?, angleDeb? (rad), vitesse? (rad/s), arc? (rad), epaisseur?, degats? }
 */
export function laserSurveillance(x, y, opts = {}) {
    return {
        type: 'laser_surveillance',
        x, y,
        longueur: opts.longueur ?? 360,
        angleDeb: opts.angleDeb ?? 0,
        vitesse: opts.vitesse ?? 0.9,
        arc: opts.arc ?? 0,
        epaisseur: opts.epaisseur ?? 12,
        degats: opts.degats
    };
}

/**
 * Onde RADIALE — ondes de choc concentriques depuis un centre. Hit manuel.
 *
 * @param {number} x        centre x
 * @param {number} y        centre y
 * @param {object} [opts]   { periodeMs?, vitesse? (px/s), epaisseur?, rayonMax?, degats? }
 */
export function ondeRadiale(x, y, opts = {}) {
    return {
        type: 'onde_radiale',
        x, y,
        periodeMs: opts.periodeMs ?? 2600,
        vitesse: opts.vitesse ?? 240,
        epaisseur: opts.epaisseur ?? 26,
        rayonMax: opts.rayonMax ?? 360,
        degats: opts.degats
    };
}

/**
 * Pieu MNÉMONIQUE — pieux qui surgissent du sol cycliquement (warning → up →
 * down). Dégât en phase 'up'. Coords en centre (x, y). Décaler `offsetMs` entre
 * plusieurs pour créer une vague séquencée.
 *
 * @param {number} x        centre x
 * @param {number} y        centre y
 * @param {object} [opts]   { largeur?, hauteur?, cycleMs?, offsetMs?, dureeUpMs?, degats? }
 */
export function pieuMnemonique(x, y, opts = {}) {
    return {
        type: 'pieu_mnemonique',
        x, y,
        largeur: opts.largeur ?? 70,
        hauteur: opts.hauteur ?? 70,
        cycleMs: opts.cycleMs ?? 2400,
        offsetMs: opts.offsetMs ?? 0,
        dureeUpMs: opts.dureeUpMs ?? 900,
        degats: opts.degats
    };
}

/**
 * Regard FIGÉ — statue qui tire un projectile lent (parry-able) vers le joueur
 * quand il entre dans son cône de vision. Coords = position de la statue.
 *
 * @param {number} x        statue x
 * @param {number} y        statue y
 * @param {object} [opts]   { angle? (rad, direction du regard), demiCone? (rad),
 *                            portee?, cooldownMs?, vitesseProj?, degatsProj? }
 */
export function regardFige(x, y, opts = {}) {
    return {
        type: 'regard_fige',
        x, y,
        angle: opts.angle ?? 0,
        demiCone: opts.demiCone ?? 0.5,
        portee: opts.portee ?? 420,
        cooldownMs: opts.cooldownMs ?? 1600,
        vitesseProj: opts.vitesseProj,
        degatsProj: opts.degatsProj
    };
}

