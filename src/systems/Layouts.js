// Bibliothèque de layouts de salle — 3 variantes par archétype × 6 archétypes
// = 18 layouts hand-crafted. Chaque layout retourne `{ plateformes, obstacles }`.
// La sélection est seedée (cf. WorldGen → choisirLayout).
//
// Vocabulaire :
//   - plateforme(x, yTop, w, h, oneWay)  → plateforme statique
//   - solHorizontal(yTop, x1, x2, h)     → tronçon de sol continu
//   - pieu(x, y, orientation)            → pointes (sol = pointes vers ↑)
//   - ressort(x, y)                      → trampoline
//   - mobileH/mobileV(x, y, ...)         → plateforme mobile horiz./vert.
//
// Toutes les hauteurs verticales entre plateformes restent ≤ 70 px (saut max
// confortable du joueur). C'est la doctrine "voie principale plate +
// verticalité bonus" de l'étape 8a'.

const HAUTEUR_SOL = 40;
const ECART_VERT_SAFE = 70;

// ─── Helpers ───
function plateforme(x, yTop, largeur, hauteur = 16, oneWay = false) {
    return { x, y: yTop + hauteur / 2, largeur, hauteur, oneWay };
}
function solHorizontal(yTop, xDebut, xFin, hauteur = HAUTEUR_SOL) {
    return {
        x: (xDebut + xFin) / 2,
        y: yTop + hauteur / 2,
        largeur: xFin - xDebut,
        hauteur,
        oneWay: false
    };
}
const pieu     = (x, y, orientation = 'sol') => ({ type: 'pieu', x, y, orientation });
const ressort  = (x, y) => ({ type: 'ressort', x, y });
const mobileH  = (x, y, params = {}) => ({ type: 'plateforme_mobile', x, y, axe: 'horizontale', ...params });
const mobileV  = (x, y, params = {}) => ({ type: 'plateforme_mobile', x, y, axe: 'verticale', ...params });

function vide() { return { plateformes: [], obstacles: [] }; }

// ============================================================
// 🕯 SANCTUAIRE — Refuge
// ============================================================
function sanctuaire_classique(rng, dims, options = {}) {
    const yTopSol = dims.hauteur - HAUTEUR_SOL;
    const yTopBalcon = yTopSol - ECART_VERT_SAFE;
    const yTopAutel = yTopBalcon - ECART_VERT_SAFE;
    const cx = dims.largeur / 2;
    const r = vide();
    r.plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));
    r.plateformes.push(plateforme(cx - 320, yTopBalcon, 240));
    r.plateformes.push(plateforme(cx + 320, yTopBalcon, 240));
    r.plateformes.push(plateforme(cx, yTopAutel, 140, 18));
    if (options.portesActives?.includes('N')) {
        r.plateformes.push(plateforme(cx, yTopAutel - ECART_VERT_SAFE, 160));
    }
    return r;
}
function sanctuaire_pelerinage(rng, dims, options = {}) {
    // Escaliers latéraux symétriques montant vers l'autel central
    const yTopSol = dims.hauteur - HAUTEUR_SOL;
    const cx = dims.largeur / 2;
    const r = vide();
    r.plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));
    // 3 marches gauche
    r.plateformes.push(plateforme(180,  yTopSol - 50,  140));
    r.plateformes.push(plateforme(320,  yTopSol - 110, 140));
    r.plateformes.push(plateforme(450,  yTopSol - 170, 140));
    // 3 marches droite (miroir)
    r.plateformes.push(plateforme(dims.largeur - 180, yTopSol - 50,  140));
    r.plateformes.push(plateforme(dims.largeur - 320, yTopSol - 110, 140));
    r.plateformes.push(plateforme(dims.largeur - 450, yTopSol - 170, 140));
    // Autel central élevé
    r.plateformes.push(plateforme(cx, yTopSol - 230, 200, 18));
    if (options.portesActives?.includes('N')) {
        r.plateformes.push(plateforme(cx, yTopSol - 290, 160));
    }
    return r;
}
function sanctuaire_piege(rng, dims, options = {}) {
    // Sol piégé : 4 pieux dispersés + 2 ressorts pour passer par dessus
    const yTopSol = dims.hauteur - HAUTEUR_SOL;
    const cx = dims.largeur / 2;
    const r = vide();
    r.plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));
    r.plateformes.push(plateforme(cx - 280, yTopSol - 80, 200));
    r.plateformes.push(plateforme(cx + 280, yTopSol - 80, 200));
    r.plateformes.push(plateforme(cx,       yTopSol - 160, 180, 18));
    // Pieux au sol entre les zones d'atterrissage
    r.obstacles.push(pieu(cx - 480, yTopSol - 9));
    r.obstacles.push(pieu(cx - 110, yTopSol - 9));
    r.obstacles.push(pieu(cx + 110, yTopSol - 9));
    r.obstacles.push(pieu(cx + 480, yTopSol - 9));
    // Ressorts pour traverser
    r.obstacles.push(ressort(cx - 200, yTopSol - 7));
    r.obstacles.push(ressort(cx + 200, yTopSol - 7));
    if (options.portesActives?.includes('N')) {
        r.plateformes.push(plateforme(cx, yTopSol - 230, 160));
    }
    return r;
}

// ============================================================
// 📜 HALL DES ÉCHOS — Salle large
// ============================================================
function hall_classique(rng, dims, options = {}) {
    const yTopSol = dims.hauteur - HAUTEUR_SOL;
    const yTopMezz = yTopSol - ECART_VERT_SAFE;
    const yTopCintres = yTopMezz - ECART_VERT_SAFE;
    const cx = dims.largeur / 2;
    const r = vide();
    r.plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));
    r.plateformes.push(plateforme(cx, yTopMezz, dims.largeur * 0.4, 18));
    r.plateformes.push(plateforme(cx - dims.largeur * 0.32, yTopCintres, dims.largeur * 0.25));
    r.plateformes.push(plateforme(cx + dims.largeur * 0.32, yTopCintres, dims.largeur * 0.25));
    if (options.portesActives?.includes('N')) {
        r.plateformes.push(plateforme(cx, yTopCintres - ECART_VERT_SAFE, 140));
    }
    return r;
}
function hall_galerie_etagee(rng, dims, options = {}) {
    // 3 niveaux étagés en escalier (gauche → droite + droite → gauche en haut)
    const yTopSol = dims.hauteur - HAUTEUR_SOL;
    const r = vide();
    r.plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));
    // Niveau 1 (gauche → droite)
    for (let i = 0; i < 4; i++) {
        const x = dims.largeur * (0.18 + i * 0.20);
        r.plateformes.push(plateforme(x, yTopSol - 70, 200));
    }
    // Niveau 2 (droite → gauche)
    for (let i = 0; i < 3; i++) {
        const x = dims.largeur * (0.72 - i * 0.22);
        r.plateformes.push(plateforme(x, yTopSol - 140, 200));
    }
    // Niveau 3 (centre)
    r.plateformes.push(plateforme(dims.largeur * 0.5, yTopSol - 210, 240, 18));
    if (options.portesActives?.includes('N')) {
        r.plateformes.push(plateforme(dims.largeur * 0.5, yTopSol - 280, 160));
    }
    return r;
}
function hall_double_chemin(rng, dims, options = {}) {
    // Chemin haut continu (mezzanine longue) + sol bas avec pieux disséminés
    const yTopSol = dims.hauteur - HAUTEUR_SOL;
    const yTopMezz = yTopSol - ECART_VERT_SAFE;
    const cx = dims.largeur / 2;
    const r = vide();
    r.plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));
    // Mezzanine continue qui couvre tout sauf les bords (entrée par les côtés)
    r.plateformes.push(plateforme(cx, yTopMezz, dims.largeur * 0.7, 18));
    // Pieux au sol pour rendre le chemin bas dangereux
    r.obstacles.push(pieu(cx - 380, yTopSol - 9));
    r.obstacles.push(pieu(cx,       yTopSol - 9));
    r.obstacles.push(pieu(cx + 380, yTopSol - 9));
    // Ressorts aux extrémités pour monter à la mezzanine
    r.obstacles.push(ressort(180,                 yTopSol - 7));
    r.obstacles.push(ressort(dims.largeur - 180,  yTopSol - 7));
    if (options.portesActives?.includes('N')) {
        r.plateformes.push(plateforme(cx, yTopMezz - ECART_VERT_SAFE, 140));
    }
    return r;
}

// ============================================================
// 🪨 CRYPTE DES MURMURES
// ============================================================
function crypte_classique(rng, dims, options = {}) {
    const yTopSol = dims.hauteur - HAUTEUR_SOL;
    const yTopN2 = yTopSol - ECART_VERT_SAFE;
    const yTopN3 = yTopN2 - ECART_VERT_SAFE;
    const r = vide();
    r.plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));
    r.plateformes.push(plateforme(dims.largeur * 0.20, yTopN2, 200, 14, true));
    r.plateformes.push(plateforme(dims.largeur * 0.50, yTopN2, 220, 14, true));
    r.plateformes.push(plateforme(dims.largeur * 0.80, yTopN2, 200, 14, true));
    r.plateformes.push(plateforme(dims.largeur * 0.32, yTopN3, 180, 14, true));
    r.plateformes.push(plateforme(dims.largeur * 0.68, yTopN3, 180, 14, true));
    if (options.portesActives?.includes('N')) {
        r.plateformes.push(plateforme(dims.largeur * 0.5, yTopN3 - ECART_VERT_SAFE, 140));
    }
    return r;
}
function crypte_catacombes(rng, dims, options = {}) {
    // 2 niveaux de corniches, pieux au plafond entre les niveaux pour
    // décourager le saut direct
    const yTopSol = dims.hauteur - HAUTEUR_SOL;
    const r = vide();
    r.plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));
    // Niveau 2 : corniches symétriques
    r.plateformes.push(plateforme(dims.largeur * 0.18, yTopSol - 70, 220, 14, true));
    r.plateformes.push(plateforme(dims.largeur * 0.82, yTopSol - 70, 220, 14, true));
    // Niveau 3 : corniches centrales
    r.plateformes.push(plateforme(dims.largeur * 0.40, yTopSol - 140, 180, 14, true));
    r.plateformes.push(plateforme(dims.largeur * 0.60, yTopSol - 140, 180, 14, true));
    // Pieux au plafond au-dessus des corniches niveau 2 (forcent à esquiver)
    r.obstacles.push(pieu(dims.largeur * 0.30, yTopSol - 130, 'plafond'));
    r.obstacles.push(pieu(dims.largeur * 0.70, yTopSol - 130, 'plafond'));
    if (options.portesActives?.includes('N')) {
        r.plateformes.push(plateforme(dims.largeur * 0.5, yTopSol - 210, 140));
    }
    return r;
}
function crypte_niche(rng, dims, options = {}) {
    // Sol avec une dépression centrale (drop-in) + ressort pour remonter
    const yTopSol = dims.hauteur - HAUTEUR_SOL;
    const cx = dims.largeur / 2;
    const r = vide();
    // Sol gauche & droit (manque au milieu)
    r.plateformes.push(solHorizontal(yTopSol, 0, cx - 180));
    r.plateformes.push(solHorizontal(yTopSol, cx + 180, dims.largeur));
    // Plancher de la niche (50 px plus bas)
    r.plateformes.push(solHorizontal(yTopSol + 50, cx - 180, cx + 180));
    // Plateformes latérales pour le saut
    r.plateformes.push(plateforme(cx - 320, yTopSol - 70, 180, 14, true));
    r.plateformes.push(plateforme(cx + 320, yTopSol - 70, 180, 14, true));
    // Ressort au fond de la niche pour ressortir vers le haut
    r.obstacles.push(ressort(cx, yTopSol + 43));
    if (options.portesActives?.includes('N')) {
        r.plateformes.push(plateforme(cx, yTopSol - 140, 140));
    }
    return r;
}

// ============================================================
// 🌉 PONT SUSPENDU
// ============================================================
function pont_classique(rng, dims) {
    const yTopSol = dims.hauteur - HAUTEUR_SOL;
    const xFinGauche = dims.largeur * 0.27;
    const xDebutDroit = dims.largeur - xFinGauche;
    const r = vide();
    r.plateformes.push(solHorizontal(yTopSol, 0, xFinGauche));
    r.plateformes.push(solHorizontal(yTopSol, xDebutDroit, dims.largeur));
    r.plateformes.push(solHorizontal(yTopSol + 60, xFinGauche, xDebutDroit));
    const yTopsArc = [yTopSol - 10, yTopSol - 80, yTopSol - 140, yTopSol - 80, yTopSol - 10];
    const xPlatfs = [];
    const nbPont = 5;
    for (let i = 0; i < nbPont; i++) {
        xPlatfs.push(xFinGauche + 60 + i * ((xDebutDroit - xFinGauche - 120) / (nbPont - 1)));
    }
    for (let i = 0; i < nbPont; i++) {
        r.plateformes.push(plateforme(xPlatfs[i], yTopsArc[i], 110, 14));
    }
    r.plateformes.push(plateforme(dims.largeur * 0.4, yTopSol - 220, 100, 14));
    r.plateformes.push(plateforme(dims.largeur * 0.6, yTopSol - 220, 100, 14));
    return r;
}
function pont_brise(rng, dims) {
    // Le pont a 2 plateformes manquantes au milieu — il faut utiliser des
    // ressorts au sol du gouffre pour traverser.
    const yTopSol = dims.hauteur - HAUTEUR_SOL;
    const xFinGauche = dims.largeur * 0.27;
    const xDebutDroit = dims.largeur - xFinGauche;
    const cx = dims.largeur / 2;
    const r = vide();
    r.plateformes.push(solHorizontal(yTopSol, 0, xFinGauche));
    r.plateformes.push(solHorizontal(yTopSol, xDebutDroit, dims.largeur));
    // Sol du gouffre — bas, accessible par chute
    r.plateformes.push(solHorizontal(yTopSol + 120, xFinGauche, xDebutDroit));
    // Plateforme à gauche/droite seulement (pas de centre)
    r.plateformes.push(plateforme(xFinGauche + 120, yTopSol - 80, 110));
    r.plateformes.push(plateforme(xDebutDroit - 120, yTopSol - 80, 110));
    // Ressorts dans le gouffre pour remonter
    r.obstacles.push(ressort(cx - 120, yTopSol + 113));
    r.obstacles.push(ressort(cx + 120, yTopSol + 113));
    // Pieux dispersés au fond pour pénaliser une mauvaise réception
    r.obstacles.push(pieu(cx, yTopSol + 111));
    return r;
}
function pont_double(rng, dims) {
    // Deux chemins : un haut continu, un bas continu, reliés aux extrémités
    const yTopSol = dims.hauteur - HAUTEUR_SOL;
    const xFinGauche = dims.largeur * 0.27;
    const xDebutDroit = dims.largeur - xFinGauche;
    const r = vide();
    r.plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));
    // Mezzanine longue (chemin haut)
    r.plateformes.push(plateforme(dims.largeur * 0.5, yTopSol - 130, dims.largeur * 0.55, 18));
    // Quelques piliers décor sur le sol
    r.plateformes.push(plateforme(xFinGauche + 60,  yTopSol - 60, 90));
    r.plateformes.push(plateforme(xDebutDroit - 60, yTopSol - 60, 90));
    // Plateforme mobile horizontale entre les deux côtés (transit aérien)
    r.obstacles.push(mobileH(dims.largeur * 0.5, yTopSol - 220, {
        amplitude: dims.largeur * 0.3, periode: 4500, largeur: 110
    }));
    return r;
}

// ============================================================
// 🌀 PUITS INVERSÉ — Vertical
// ============================================================
function puits_classique(rng, dims) {
    const yTopSol = dims.hauteur - HAUTEUR_SOL;
    const r = vide();
    r.plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));
    r.plateformes.push(plateforme(dims.largeur * 0.30, 970, 240, 14));
    const largeurPalierSortie = dims.largeur * 0.55;
    r.plateformes.push(plateforme(
        dims.largeur - largeurPalierSortie / 2, 900, largeurPalierSortie, 18
    ));
    let yTop = 830;
    let cote = 0;
    while (yTop > 100) {
        const x = cote === 0 ? dims.largeur * 0.30 : dims.largeur * 0.70;
        r.plateformes.push(plateforme(x, yTop, 240, 14));
        yTop -= ECART_VERT_SAFE;
        cote = 1 - cote;
    }
    r.plateformes.push(plateforme(dims.largeur / 2, 80, 320, 18, true));
    return r;
}
function puits_pieux(rng, dims) {
    // Variante : pieux au sol bas + ressort au centre pour atteindre la 1ère plateforme
    const yTopSol = dims.hauteur - HAUTEUR_SOL;
    const r = vide();
    r.plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));
    // Ressort central (lance haut)
    r.obstacles.push(ressort(dims.largeur / 2, yTopSol - 7));
    // Pieux de chaque côté du ressort (interdit de poser pied)
    r.obstacles.push(pieu(dims.largeur * 0.25, yTopSol - 9));
    r.obstacles.push(pieu(dims.largeur * 0.75, yTopSol - 9));
    // Palier-sortie inchangé
    const largeurPalierSortie = dims.largeur * 0.55;
    r.plateformes.push(plateforme(
        dims.largeur - largeurPalierSortie / 2, 900, largeurPalierSortie, 18
    ));
    // Zigzag plus serré + pieux de plafond aux étages bas
    let yTop = 830, cote = 0;
    while (yTop > 100) {
        const x = cote === 0 ? dims.largeur * 0.30 : dims.largeur * 0.70;
        r.plateformes.push(plateforme(x, yTop, 220, 14));
        if (yTop > 600 && yTop < 800) {
            r.obstacles.push(pieu(dims.largeur / 2, yTop - 30, 'plafond'));
        }
        yTop -= ECART_VERT_SAFE;
        cote = 1 - cote;
    }
    r.plateformes.push(plateforme(dims.largeur / 2, 80, 320, 18, true));
    return r;
}
function puits_cascade(rng, dims) {
    // Plateformes resserrées d'un seul côté (cascade gauche) + plateforme
    // mobile verticale au centre pour proposer un chemin alternatif
    const yTopSol = dims.hauteur - HAUTEUR_SOL;
    const r = vide();
    r.plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));
    // Cascade serrée à gauche
    let yTop = yTopSol - 70;
    while (yTop > 100) {
        r.plateformes.push(plateforme(dims.largeur * 0.18, yTop, 200, 14));
        yTop -= 60;
    }
    // Plateforme mobile verticale au centre
    r.obstacles.push(mobileV(dims.largeur * 0.5, dims.hauteur / 2, {
        amplitude: dims.hauteur * 0.35, periode: 5500, largeur: 100
    }));
    // Palier-sortie
    const largeurPalierSortie = dims.largeur * 0.45;
    r.plateformes.push(plateforme(
        dims.largeur - largeurPalierSortie / 2, 900, largeurPalierSortie, 18
    ));
    // Sommet
    r.plateformes.push(plateforme(dims.largeur / 2, 80, 320, 18, true));
    return r;
}

// ============================================================
// ⚔ ARÈNE DU REFLUX
// ============================================================
function arene_classique(rng, dims) {
    const yTopSol = dims.hauteur - HAUTEUR_SOL;
    const yTopGradin1 = yTopSol - ECART_VERT_SAFE;
    const yTopGradin2 = yTopGradin1 - ECART_VERT_SAFE;
    const yTopHaut = yTopGradin2 - ECART_VERT_SAFE;
    const cx = dims.largeur / 2;
    const r = vide();
    r.plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));
    r.plateformes.push(plateforme(cx - 380, yTopGradin1, 240));
    r.plateformes.push(plateforme(cx + 380, yTopGradin1, 240));
    r.plateformes.push(plateforme(cx - 240, yTopGradin2, 200));
    r.plateformes.push(plateforme(cx + 240, yTopGradin2, 200));
    r.plateformes.push(plateforme(cx, yTopHaut, 200));
    return r;
}
function arene_piegee(rng, dims) {
    // Sol entier + 4 pieux disposés en quinconce + estrade centrale élevée
    const yTopSol = dims.hauteur - HAUTEUR_SOL;
    const cx = dims.largeur / 2;
    const r = vide();
    r.plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));
    // Pieux disposés en cercle autour du centre
    r.obstacles.push(pieu(cx - 380, yTopSol - 9));
    r.obstacles.push(pieu(cx - 180, yTopSol - 9));
    r.obstacles.push(pieu(cx + 180, yTopSol - 9));
    r.obstacles.push(pieu(cx + 380, yTopSol - 9));
    // Estrade centrale (refuge surélevé)
    r.plateformes.push(plateforme(cx, yTopSol - 80, 220, 18));
    // 2 plateformes hautes
    r.plateformes.push(plateforme(cx - 360, yTopSol - 200, 180));
    r.plateformes.push(plateforme(cx + 360, yTopSol - 200, 180));
    return r;
}
function arene_estrade(rng, dims) {
    // Piédestal central élevé entouré de corniches accessibles via ressorts
    const yTopSol = dims.hauteur - HAUTEUR_SOL;
    const cx = dims.largeur / 2;
    const r = vide();
    r.plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));
    // Piédestal central monumental
    r.plateformes.push(plateforme(cx, yTopSol - 60, 100, 18));
    r.plateformes.push(plateforme(cx, yTopSol - 130, 80, 18));
    r.plateformes.push(plateforme(cx, yTopSol - 200, 60, 18));
    // Corniches latérales
    r.plateformes.push(plateforme(cx - 380, yTopSol - 80, 200));
    r.plateformes.push(plateforme(cx + 380, yTopSol - 80, 200));
    r.plateformes.push(plateforme(cx - 380, yTopSol - 200, 200));
    r.plateformes.push(plateforme(cx + 380, yTopSol - 200, 200));
    // Ressorts pour atteindre les corniches hautes
    r.obstacles.push(ressort(cx - 480, yTopSol - 7));
    r.obstacles.push(ressort(cx + 480, yTopSol - 7));
    return r;
}

// ============================================================
// CATALOGUE & SÉLECTION
// ============================================================
export const LAYOUTS_PAR_ARCHETYPE = {
    sanctuaire: [sanctuaire_classique, sanctuaire_pelerinage, sanctuaire_piege],
    hall:       [hall_classique, hall_galerie_etagee, hall_double_chemin],
    crypte:     [crypte_classique, crypte_catacombes, crypte_niche],
    pont:       [pont_classique, pont_brise, pont_double],
    puits:      [puits_classique, puits_pieux, puits_cascade],
    arene:      [arene_classique, arene_piegee, arene_estrade]
};

/**
 * Pioche un layout pour un archétype donné. Le rng est seedé par salle.
 */
export function choisirLayout(archetypeId, rng) {
    const liste = LAYOUTS_PAR_ARCHETYPE[archetypeId];
    if (!liste || liste.length === 0) return null;
    return liste[Math.floor(rng() * liste.length)];
}
