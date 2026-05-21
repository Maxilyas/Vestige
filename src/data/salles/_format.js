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
export const ECART_VERT_SAFE = 70;   // saut vertical sûr
export const ECART_HORIZ_SAFE = 130; // saut horizontal sûr edge-to-edge

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

/**
 * Tunnel : un couloir étroit avec sol ET plafond serrés. Le joueur (60 px
 * de haut) y rentre debout si `hauteurInterieure ≥ 60`. Pour ÉBOULIS dans
 * un tunnel : choisis `hauteurInterieure ≤ 110` pour que l'éboulis (110+
 * de haut) bloque vraiment le passage (impossible de sauter par-dessus
 * vu le plafond).
 * @returns {Array} 2 plateformes (sol + plafond) à push dans la liste
 */
export function tunnel(xDeb, xFin, yTopSol, hauteurInterieure = 80) {
    const yTopPlafond = yTopSol - hauteurInterieure - 14;
    return [
        sol(xDeb, xFin, yTopSol),
        plafond(xDeb, xFin, yTopPlafond)
    ];
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

// ─── Helpers obstacles Vague 2 ───

/**
 * Racines tentaculaires du Reflux : zone cyclique pieu↔plateforme.
 * Cycle de 3s : ~1s comme plateforme one-way, ~2s comme pieu dégâts.
 */
export function racinesReflux(x, yTopSol, opts = {}) {
    const largeur = opts.largeur ?? 60;
    const hauteur = opts.hauteur ?? 40;
    return {
        type: 'racines_reflux',
        x,
        y: yTopSol - hauteur / 2,    // ancrées au sol, montent vers le haut
        largeur, hauteur,
        cycleMs: opts.cycleMs ?? 3000,
        offsetMs: opts.offsetMs ?? 0  // décalage du cycle (sync ou désync entre instances)
    };
}

/**
 * Zone d'anti-ancrage du Reflux. Le geste d'ancrage est désactivé dans
 * cette zone. Visuel : veines pourpres au sol et dans l'air.
 */
export function antiAncrage(x, yTop, largeur, hauteur) {
    return {
        type: 'anti_ancrage',
        x,
        y: yTop + hauteur / 2,
        largeur, hauteur
    };
}

// ─── Helper zones (ancrage Ruines) ───

/**
 * Zone ancrable Ruines : le joueur peut y poser une plateforme via touche A.
 * @param {number} x      - centre x de la zone (rect détection)
 * @param {number} yTop   - top de la zone
 * @param {number} w      - largeur zone détection (≈ largeur plateforme)
 * @param {number} h      - hauteur zone détection
 * @param {object} [opts] - { plateformeW, plateformeH } dims de la plateforme
 *                          matérialisée (défaut 90×14)
 */
export function ancre(x, yTop, w = 80, h = 30, opts = {}) {
    return {
        type: 'ancre_construction',
        x, yTop, w, h,
        params: {
            plateformeW: opts.plateformeW ?? 90,
            plateformeH: opts.plateformeH ?? 14
        }
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

// ─── Signature de portes (pour indexation dans le catalogue) ───
// Tri canonique : N, S, E, O (boussole). Une salle avec portes O+E a tag
// 'EO'. T-shape porte N+E+O = 'NEO'. Croix = 'NSEO'.
// Utilisé par EtageGen pour piocher une salle compatible avec les voisins
// que le graphe a alloué à une cellule.
const ORDRE_PORTES = ['N', 'S', 'E', 'O'];

/**
 * Calcule la signature à partir d'une liste de directions.
 * @param {string[]} portes - p.ex. ['O', 'E']
 * @returns {string} signature canonique, p.ex. 'EO'
 */
export function signaturePortes(portes) {
    return ORDRE_PORTES.filter(d => portes.includes(d)).join('');
}
