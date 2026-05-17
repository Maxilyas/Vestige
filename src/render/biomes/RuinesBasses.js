// RuinesBasses — composeur parallax spécifique au biome (étages 1-2).
//
// Direction : aube voilée mélancolique paisible. Le joueur entre dans un monde
// qui a continué à vivre sans la mémoire — la forêt a repris, les ruines
// s'écroulent doucement, les pourpres signent un présage discret du Reflux.
//
// 14+ couches composent le tableau, du fond vers l'avant :
//   BG    nuages bas               (sF 0.10, drift yoyo)
//   BG    oiseaux lointains        (sF 0.20, vols cycliques)
//   BG    montagnes brumeuses 3R   (sF 0.15, neige + ombre + lumière)
//   BG    voile d'horizon          (sF 0.0, dégradé vert pâle laiteux)
//   BG    silhouettes ruines       (sF 0.30, formes opaques pures)
//   BG    brume basse 3 bandes     (sF 0.20, ferme le gap niveau/horizon)
//   BG    forêt morte densité var  (sF 0.50, racines pourpres gradient étage)
//   BG    sol-collines lointain    (sF 0.60, polyline + herbe rim light)
//   BG    vestiges fugaces         (sF 0.40, silhouettes humanoïdes du passé)
//   BG    rayons d'aube            (sF 0.70, ADD subtil, respiration alpha)
//   MID   lucioles lointaines      (sF 0.40, 25 unités passives, drift sin)
//   MID   brume volumétrique sol   (sF 0.85, 14 blobs réactifs joueur+parry)
//   FG    bokeh / vrilles          (sF 1.15-1.6 — bouchent le foreground)
//   FG    feuilles mortes / herbes (sF 0.9-1.25 — animées, atterrissage joueur)
//   FG    lucioles réactives       (sF 1.0, 10 unités qui fuient le joueur)
//   FG    pluie fine               (sF 0.0, viewport entier, cycle météo)
//
// Mood salle de boss (`registry.salle_est_boss`) : voile assombri, brume au sol
// densifiée, pluie forcée, oiseaux/lucioles/vestiges/feuilles désactivés.
// La nature retient son souffle pendant le combat dramatique.
//
// IMPORTANT — coordonnées : les salles font 720-1080 px de haut alors que la
// caméra n'en voit que GAME_HEIGHT (540). On positionne donc les couches en
// **coordonnées écran** (worldY ≈ position visible) et on découple le scroll
// vertical avec `setScrollFactor(x, 0)`. Sinon les éléments à `dims.hauteur - N`
// se retrouvent hors viewport quel que soit le scroll caméra.
//
// Largeur étendue à 1.6-1.8× pour que le parallax ne révèle pas les bords lors
// du scroll horizontal.

import { DEPTH, paletteCouranteScene, tracerCourbeQuadratique } from '../PainterlyRenderer.js';
import { GAME_HEIGHT, GAME_WIDTH } from '../../config.js';

// ============================================================
// COUCHE 1 — MONTAGNES BRUMEUSES (scrollFactor 0.15)
// ============================================================
//
// Silhouettes triangulaires douces qui se chevauchent en plans superposés.
// Trois rangées de profondeur (plus pâle au fond, plus sombre devant) pour
// donner une vraie sensation de distance atmosphérique.

// Profil de montagne détaillé : polyline ~14 points (vs 5 avant) avec aspérités,
// neige sur le sommet, face lumière côté gauche, face ombre côté droit.
// Renvoie le Graphics conteneur (tous les polygones empilés dedans).
function peindreMontagne(scene, x, ySol, largeur, hauteur, couleurBase, alpha, rng) {
    const g = scene.add.graphics();

    // Génère un profil dentelé montant puis descendant.
    // Sommet pas forcément au centre — varie [0.35, 0.65] pour casser la symétrie.
    const tSommet = 0.35 + rng() * 0.30;
    const profil = [];
    const baseG = { x: x - largeur * 0.5, y: ySol };
    const baseD = { x: x + largeur * 0.5, y: ySol };
    profil.push(baseG);

    // Montée — 6 ressauts depuis baseG vers le sommet
    const sommet = { x: x - largeur * 0.5 + largeur * tSommet, y: ySol - hauteur };
    const nMontee = 6;
    for (let i = 1; i <= nMontee; i++) {
        const t = i / (nMontee + 1);
        const px = baseG.x + (sommet.x - baseG.x) * t;
        const py = baseG.y + (sommet.y - baseG.y) * t;
        // Aspérités : décale chaque point perpendiculairement à la pente
        const aspX = (rng() - 0.5) * largeur * 0.04;
        const aspY = -Math.abs((rng() - 0.5) * hauteur * 0.07);
        profil.push({ x: px + aspX, y: py + aspY });
    }
    profil.push(sommet);

    // Descente — 7 ressauts depuis sommet vers baseD (un de plus pour l'asymétrie)
    const nDescente = 7;
    for (let i = 1; i <= nDescente; i++) {
        const t = i / (nDescente + 1);
        const px = sommet.x + (baseD.x - sommet.x) * t;
        const py = sommet.y + (baseD.y - sommet.y) * t;
        const aspX = (rng() - 0.5) * largeur * 0.04;
        const aspY = -Math.abs((rng() - 0.5) * hauteur * 0.06);
        profil.push({ x: px + aspX, y: py + aspY });
    }
    profil.push(baseD);

    // === Couche 1 : corps de la montagne (couleur de base) ===
    g.fillStyle(couleurBase, alpha);
    g.beginPath();
    g.moveTo(profil[0].x, profil[0].y);
    for (let i = 1; i < profil.length; i++) g.lineTo(profil[i].x, profil[i].y);
    g.closePath();
    g.fillPath();

    // === Couche 2 : face lumière (côté ouest exposé à l'aube) ===
    // Clip approximatif : moitié gauche du profil + descente verticale depuis le sommet
    const couleurLumiere = teinterPlusClair(couleurBase, 0.20);
    g.fillStyle(couleurLumiere, alpha * 0.55);
    g.beginPath();
    g.moveTo(profil[0].x, profil[0].y);
    let idxSommet = profil.indexOf(sommet);
    for (let i = 1; i <= idxSommet; i++) g.lineTo(profil[i].x, profil[i].y);
    // Descend verticalement du sommet vers la base
    g.lineTo(sommet.x, ySol);
    g.closePath();
    g.fillPath();

    // === Couche 3 : face ombre (côté est) ===
    const couleurOmbre = teinterPlusSombre(couleurBase, 0.30);
    g.fillStyle(couleurOmbre, alpha * 0.50);
    g.beginPath();
    g.moveTo(sommet.x, sommet.y);
    for (let i = idxSommet + 1; i < profil.length; i++) g.lineTo(profil[i].x, profil[i].y);
    g.lineTo(sommet.x, ySol);
    g.closePath();
    g.fillPath();

    // === Couche 4 : neige / brume au sommet (top ~22% de la montagne) ===
    // Polygone qui suit la crête supérieure, étendu d'un peu de chaque côté
    if (hauteur > 100) {
        const yNeige = sommet.y + hauteur * 0.22;
        const couleurNeige = 0xc8d4b8; // vert pâle laiteux (pas du blanc franc — aube voilée)
        g.fillStyle(couleurNeige, alpha * 0.45);
        g.beginPath();
        // Trouve les points du profil au-dessus de yNeige
        const ptsNeige = [];
        for (const p of profil) {
            if (p.y < yNeige) ptsNeige.push(p);
        }
        if (ptsNeige.length >= 3) {
            // Étend la base de la neige sur la crête (au lieu de fermer net)
            g.moveTo(ptsNeige[0].x - 2, yNeige);
            for (const p of ptsNeige) g.lineTo(p.x, p.y);
            g.lineTo(ptsNeige[ptsNeige.length - 1].x + 2, yNeige);
            g.closePath();
            g.fillPath();
        }
    }

    // === Couche 5 : ligne de crête (subtile arête sombre qui marque le profil) ===
    g.lineStyle(1, teinterPlusSombre(couleurBase, 0.40), alpha * 0.7);
    g.beginPath();
    g.moveTo(profil[0].x, profil[0].y);
    for (let i = 1; i < profil.length; i++) g.lineTo(profil[i].x, profil[i].y);
    g.strokePath();

    return g;
}

// Helpers de teinte — opère sur des couleurs hex 0xRRGGBB
function teinterPlusClair(c, amount) {
    const r = Math.min(255, ((c >> 16) & 0xff) + Math.round(255 * amount));
    const g = Math.min(255, ((c >> 8) & 0xff) + Math.round(255 * amount));
    const b = Math.min(255, (c & 0xff) + Math.round(255 * amount));
    return (r << 16) | (g << 8) | b;
}
function teinterPlusSombre(c, amount) {
    const r = Math.max(0, ((c >> 16) & 0xff) - Math.round(255 * amount));
    const g = Math.max(0, ((c >> 8) & 0xff) - Math.round(255 * amount));
    const b = Math.max(0, (c & 0xff) - Math.round(255 * amount));
    return (r << 16) | (g << 8) | b;
}

function poserMontagnesBrumeuses(scene, dims, rng, palette) {
    const objets = [];
    // Coordonnées écran (Y découplé du scroll caméra via scrollFactor(x, 0)).
    // ySol des pieds de montagnes positionné dans le bas du canvas visible.
    const ySol = GAME_HEIGHT - 60;
    const largeurEtendue = dims.largeur * 1.6;
    const decalageX = -dims.largeur * 0.3;

    // Trois rangées : la plus lointaine = la plus pâle/petite, la plus proche
    // est nettement plus opaque (concret, tangible — vraies montagnes peintes).
    const rangees = [
        { nb: 6, hMin: 90,  hMax: 140, lMin: 280, lMax: 420, alpha: 0.55, teinte: 0x5a6858, yOffset: 0 },
        { nb: 5, hMin: 130, hMax: 190, lMin: 320, lMax: 480, alpha: 0.72, teinte: 0x3a4838, yOffset: 6 },
        { nb: 4, hMin: 170, hMax: 250, lMin: 360, lMax: 560, alpha: 0.88, teinte: 0x2a3828, yOffset: 12 }
    ];

    for (const rangee of rangees) {
        const pas = largeurEtendue / rangee.nb;
        for (let i = 0; i < rangee.nb; i++) {
            const x = decalageX + pas * i + (rng() - 0.5) * pas * 0.4;
            const h = rangee.hMin + rng() * (rangee.hMax - rangee.hMin);
            const l = rangee.lMin + rng() * (rangee.lMax - rangee.lMin);
            const m = peindreMontagne(scene, x, ySol + rangee.yOffset, l, h, rangee.teinte, rangee.alpha, rng);
            m.setScrollFactor(0.15, 0); // Y fixé écran, X parallax x0.15
            m.setDepth(DEPTH.SILHOUETTES - 2);
            objets.push(m);
        }
    }

    // Bande de brume horizontale entre les montagnes et le ciel (effet
    // "atmosphère lointaine"). Drift très lent vers la droite pour donner
    // l'impression que l'air bouge.
    const brume = scene.add.graphics();
    brume.fillStyle(0x6a7a68, 0.18);
    for (let i = 0; i < 6; i++) {
        const xb = (largeurEtendue / 6) * i + decalageX + (rng() - 0.5) * 60;
        const yb = ySol - 150 - rng() * 40;
        const lb = 200 + rng() * 140;
        const hb = 22 + rng() * 14;
        brume.fillEllipse(xb, yb, lb, hb);
    }
    brume.setScrollFactor(0.15, 0); // idem montagnes
    brume.setDepth(DEPTH.SILHOUETTES - 1);
    scene.tweens.add({
        targets: brume,
        x: '+=' + dims.largeur * 0.15,
        duration: 60000,
        ease: 'Linear',
        repeat: -1,
        yoyo: true
    });
    objets.push(brume);

    return objets;
}

// ============================================================
// COUCHE 2 — SILHOUETTES RUINES SPÉCIFIQUES (scrollFactor 0.3)
// ============================================================
//
// Quatre types de ruines tirées au hasard : arche brisée, colonne tronquée,
// pan de mur créneau cassé, tour effondrée. Touches d'accent pourpre sur
// certains éléments (les racines qui ont fait leur chemin).

// Les 4 fonctions ci-dessous peignent les ruines en **silhouettes pures** :
// formes opaques sombres sans détail interne (pas de fenêtres, pas de briques,
// pas de fissures internes). Lecture immédiate "décor lointain", pas "objet
// physique sur lequel on peut s'appuyer". La couleur unique des silhouettes
// (`couleurSilhouette`) est volontairement très sombre — c'est l'atmospheric
// perspective qui les fera "reculer" via le voile d'horizon.

function couleurSilhouetteRuine() {
    return 0x1a221a; // vert-noir profond, uniforme pour toutes les ruines
}

function peindreArcheBrisee(scene, x, ySol, hauteur, palette, rng) {
    const g = scene.add.graphics();
    const w = hauteur * 0.85;
    const epaisseur = w * 0.18;
    const yTop = ySol - hauteur;
    const xG = x - w / 2;
    const xD = x + w / 2;
    const couleur = couleurSilhouetteRuine();

    g.fillStyle(couleur, 1);

    // Pied gauche (intact)
    g.fillRect(xG, yTop + hauteur * 0.3, epaisseur, hauteur * 0.7);

    // Pied droit (cassé en haut)
    const hauteurDroite = hauteur * (0.55 + rng() * 0.2);
    g.fillRect(xD - epaisseur, ySol - hauteurDroite, epaisseur, hauteurDroite);

    // Arc supérieur — uniquement la moitié gauche subsiste
    g.lineStyle(epaisseur, couleur, 1);
    g.beginPath();
    g.moveTo(xG + epaisseur, yTop + hauteur * 0.3);
    g.lineTo(xG + epaisseur, yTop + hauteur * 0.18);
    g.lineTo(x - w * 0.1, yTop + hauteur * 0.05);
    g.strokePath();

    return g;
}

function peindreColonneTronquee(scene, x, ySol, hauteur, palette, rng) {
    const g = scene.add.graphics();
    const w = 16 + rng() * 10;
    const yTop = ySol - hauteur;
    const couleur = couleurSilhouetteRuine();

    g.fillStyle(couleur, 1);
    g.fillRect(x - w / 2, yTop, w, hauteur);

    // Cassure en haut (silhouette dentelée simple — pas de creux dessinés en
    // alpha 0, qui rendaient la colonne "trouée")
    g.beginPath();
    g.moveTo(x - w / 2, yTop);
    g.lineTo(x - w / 4, yTop - 3 - rng() * 4);
    g.lineTo(x + 2, yTop + 2);
    g.lineTo(x + w / 3, yTop - 2 - rng() * 5);
    g.lineTo(x + w / 2, yTop);
    g.closePath();
    g.fillPath();

    return g;
}

function peindrePanDeMur(scene, x, ySol, hauteur, palette, rng) {
    const g = scene.add.graphics();
    const w = 60 + rng() * 50;
    const yTop = ySol - hauteur;
    const couleur = couleurSilhouetteRuine();

    g.fillStyle(couleur, 1);
    g.fillRect(x - w / 2, yTop, w, hauteur);

    // Top crénelé simple — silhouette uniquement (3 dents, pas de variation
    // 50/50 qui créait des trous visibles).
    const dents = 3 + Math.floor(rng() * 2);
    const pasD = w / dents;
    for (let d = 0; d < dents; d++) {
        const xd = x - w / 2 + pasD * d + pasD * 0.2;
        const wd = pasD * 0.55;
        const hd = 6 + rng() * 10;
        g.fillRect(xd, yTop - hd, wd, hd);
    }

    // ⚠️ Pas de "trou de fenêtre" — c'était le détail qui rendait le pan de mur
    // lisible comme objet physique. Une silhouette est définie par son contour.

    return g;
}

function peindreTourEffondree(scene, x, ySol, hauteur, palette, rng) {
    const g = scene.add.graphics();
    const w = 30 + rng() * 14;
    const yTop = ySol - hauteur;
    const couleur = couleurSilhouetteRuine();

    g.fillStyle(couleur, 1);

    // Base trapézoïdale
    g.beginPath();
    g.moveTo(x - w * 0.7, ySol);
    g.lineTo(x - w / 2, yTop + hauteur * 0.4);
    g.lineTo(x + w / 2, yTop + hauteur * 0.4);
    g.lineTo(x + w * 0.7, ySol);
    g.closePath();
    g.fillPath();

    // Fût central
    g.fillRect(x - w / 2, yTop + hauteur * 0.15, w, hauteur * 0.4);

    // Sommet effondré
    g.beginPath();
    g.moveTo(x - w / 2, yTop + hauteur * 0.15);
    g.lineTo(x + w / 2, yTop + hauteur * 0.15);
    g.lineTo(x + w / 2 - rng() * 5, yTop);
    g.lineTo(x - 2, yTop + hauteur * 0.05);
    g.lineTo(x - w / 2 + rng() * 8, yTop + hauteur * 0.1);
    g.closePath();
    g.fillPath();

    return g;
}

function poserSilhouettesRuines(scene, dims, rng, palette) {
    const objets = [];
    // Coordonnées écran : le pied des ruines repose juste sous la ligne d'horizon
    // formée par les montagnes (qui sont à GAME_HEIGHT - 60).
    const ySol = GAME_HEIGHT - 40;
    const largeurEtendue = dims.largeur * 1.6;
    const decalageX = -dims.largeur * 0.3;

    const nb = 8;
    const pas = largeurEtendue / nb;

    for (let i = 0; i < nb; i++) {
        const x = decalageX + pas * i + (rng() - 0.5) * pas * 0.3;
        const choix = rng();
        const h = 110 + rng() * 100;
        let obj;
        if (choix < 0.28)      obj = peindreArcheBrisee(scene, x, ySol, h, palette, rng);
        else if (choix < 0.55) obj = peindreColonneTronquee(scene, x, ySol, h, palette, rng);
        else if (choix < 0.82) obj = peindrePanDeMur(scene, x, ySol, h * 0.7, palette, rng);
        else                   obj = peindreTourEffondree(scene, x, ySol, h * 1.1, palette, rng);

        if (obj) {
            obj.setScrollFactor(0.3, 0); // Y fixé écran, X parallax x0.3
            obj.setDepth(DEPTH.SILHOUETTES);
            obj.setAlpha(0.78 + rng() * 0.15);
            objets.push(obj);

            // Mousse / herbes au pied (rend la ruine tangible — elle est posée
            // dans un sol, pas flottante). Petite zone verte irrégulière.
            const m = scene.add.graphics();
            m.fillStyle(palette.mousse, 0.55);
            const largeurMousse = 28 + rng() * 22;
            m.fillEllipse(x, ySol + 1, largeurMousse, 6);
            // 2-3 touffes verticales par-dessus
            m.lineStyle(1, palette.mousse, 0.7);
            for (let t = 0; t < 3; t++) {
                const tx = x - largeurMousse * 0.4 + rng() * largeurMousse * 0.8;
                m.beginPath();
                m.moveTo(tx, ySol);
                m.lineTo(tx + (rng() - 0.5) * 2, ySol - 2 - rng() * 3);
                m.strokePath();
            }
            m.setScrollFactor(0.3, 0);
            m.setDepth(DEPTH.SILHOUETTES + 1);
            objets.push(m);
        }
    }

    return objets;
}

// ============================================================
// COUCHE 3 — FORÊT MORTE (scrollFactor 0.5)
// ============================================================
//
// Arbres tordus avec tronc bezier + 3-5 branches. Densité variable (groupes
// denses au tiers gauche, clairsemé au centre, dense à droite — composition
// cinéma : pas un peigne régulier).

function peindreArbreMort(scene, x, ySol, hauteur, couleur, alpha, rng) {
    const g = scene.add.graphics();
    const couleurOmbre = teinterPlusSombre(couleur, 0.25);
    const epaisseurTronc = 3 + rng() * 2.5;

    // Tronc : courbe bezier verticale légèrement tordue
    const cpX = x + (rng() - 0.5) * hauteur * 0.25;
    const cpY = ySol - hauteur * 0.5;
    const sommetX = x + (rng() - 0.5) * hauteur * 0.15;
    const sommetY = ySol - hauteur;

    // Passe 1 — silhouette tronc (plus épais, couleur ombre)
    g.lineStyle(epaisseurTronc + 1, couleurOmbre, alpha);
    tracerCourbeQuadratique(g, x, ySol, cpX, cpY, sommetX, sommetY, 16);

    // Passe 2 — tronc principal par-dessus (donne l'effet bord ombre + cœur clair)
    g.lineStyle(epaisseurTronc, couleur, alpha);
    tracerCourbeQuadratique(g, x, ySol, cpX, cpY, sommetX, sommetY, 16);

    // Racine au pied : 2-3 petits pieds qui s'étalent au sol (ancre l'arbre, le rend tangible)
    const nbPieds = 2 + Math.floor(rng() * 2);
    for (let p = 0; p < nbPieds; p++) {
        const cote = p % 2 === 0 ? -1 : 1;
        const longueur = epaisseurTronc * (2.5 + rng() * 1.5);
        g.lineStyle(epaisseurTronc * 0.7, couleurOmbre, alpha * 0.9);
        g.beginPath();
        g.moveTo(x, ySol);
        g.lineTo(x + cote * longueur * (0.5 + rng() * 0.5), ySol + 1);
        g.strokePath();
    }

    // Branches : 4-6, partant de la moitié haute du tronc, divergentes
    const nbBranches = 4 + Math.floor(rng() * 3);
    for (let b = 0; b < nbBranches; b++) {
        const t = 0.35 + rng() * 0.55;
        const baseX = x + (cpX - x) * t * 2 * (1 - t) + (sommetX - x) * t * t;
        const baseY = ySol + (cpY - ySol) * t * 2 * (1 - t) + (sommetY - ySol) * t * t;
        const cote = rng() < 0.5 ? -1 : 1;
        const longueur = hauteur * (0.22 + rng() * 0.25);
        const angle = (rng() * 0.6 + 0.3) * cote;
        const branchCpX = baseX + Math.sin(angle) * longueur * 0.4;
        const branchCpY = baseY - Math.cos(angle) * longueur * 0.4 + rng() * 6;
        const branchEndX = baseX + Math.sin(angle) * longueur;
        const branchEndY = baseY - Math.cos(angle) * longueur + rng() * 8;
        const epBranche = 1.5 + rng() * 1.5;
        // Double passe branche pour épaisseur perceptible
        g.lineStyle(epBranche + 0.6, couleurOmbre, alpha * 0.9);
        tracerCourbeQuadratique(g, baseX, baseY, branchCpX, branchCpY, branchEndX, branchEndY, 10);
        g.lineStyle(epBranche, couleur, alpha);
        tracerCourbeQuadratique(g, baseX, baseY, branchCpX, branchCpY, branchEndX, branchEndY, 10);

        // 1-2 rameaux secondaires sur les branches longues
        const nbRameaux = longueur > hauteur * 0.3 ? 1 + Math.floor(rng() * 2) : 0;
        for (let r = 0; r < nbRameaux; r++) {
            const t2 = 0.55 + rng() * 0.35;
            const sub = {
                x: baseX + (branchEndX - baseX) * t2,
                y: baseY + (branchEndY - baseY) * t2
            };
            const subL = longueur * (0.3 + rng() * 0.3);
            const subAngle = angle + (rng() - 0.5) * 0.8;
            g.lineStyle(1.1, couleur, alpha * 0.85);
            g.beginPath();
            g.moveTo(sub.x, sub.y);
            g.lineTo(sub.x + Math.sin(subAngle) * subL, sub.y - Math.cos(subAngle) * subL);
            g.strokePath();
        }
    }

    return g;
}

function poserForetMorte(scene, dims, rng, palette) {
    const objets = [];
    // Coordonnées écran : la forêt morte est la couche la plus proche du parallax
    // lointain, ses pieds touchent quasi le bas du canvas visible.
    const ySol = GAME_HEIGHT - 20;
    const largeurEtendue = dims.largeur * 1.6;
    const decalageX = -dims.largeur * 0.3;

    // Gradient narratif des racines pourpres : étage 1 = présage rare et discret
    // (1 arbre sur 5, statique), étage 2 = montée en intensité (1 sur 2.5,
    // pulsation lente). Préfigure la corruption qui se renforce vers Halls Cendrés.
    const etage = scene.registry.get('etage_courant') ?? 1;
    const probaRacinePourpre = etage >= 2 ? 0.40 : 0.20;
    const racinesPulsent = etage >= 2;

    // Densité non-uniforme via fonction de bruit simple : zones denses /
    // clairsemées pour composition cinéma. On échantillonne 60 positions
    // candidates et on garde ~22 selon la densité locale.
    const candidats = 60;
    const conserve = 22;
    const positions = [];

    for (let i = 0; i < candidats; i++) {
        const x = decalageX + (i / candidats) * largeurEtendue + (rng() - 0.5) * 12;
        // Densité : 2 pics + une vallée (composition manuelle)
        const norm = (x - decalageX) / largeurEtendue;
        const densite =
            Math.exp(-Math.pow((norm - 0.2) * 4, 2)) * 0.9 +
            Math.exp(-Math.pow((norm - 0.75) * 5, 2)) * 1.0 +
            0.15;
        positions.push({ x, densite });
    }
    positions.sort((a, b) => (b.densite + (rng() - 0.5) * 0.3) - (a.densite + (rng() - 0.5) * 0.3));

    const couleurs = [
        { c: 0x141c12, a: 0.88 },  // arbres premier plan : tronc noir-vert, très définis
        { c: 0x1c2818, a: 0.78 },  // plan intermédiaire
        { c: 0x263a28, a: 0.68 }   // plan le plus lointain de la forêt
    ];

    for (let k = 0; k < Math.min(conserve, positions.length); k++) {
        const p = positions[k];
        const tirage = couleurs[Math.floor(rng() * couleurs.length)];
        const hauteur = 70 + rng() * 110;
        const yPos = ySol + (rng() - 0.5) * 6;
        const arbre = peindreArbreMort(scene, p.x, yPos, hauteur, tirage.c, tirage.a, rng);
        arbre.setScrollFactor(0.5, 0); // Y fixé écran, X parallax x0.5
        arbre.setDepth(DEPTH.SILHOUETTES + 2);
        objets.push(arbre);

        // Racine pourpre qui rampe au pied (signature biome) — densité et
        // animation modulées selon l'étage (cf. gradient narratif ci-dessus).
        if (rng() < probaRacinePourpre) {
            const r = scene.add.graphics();
            r.lineStyle(1.5 + (racinesPulsent ? 0.4 : 0), palette.racine, racinesPulsent ? 0.6 : 0.45);
            r.beginPath();
            let rx = p.x;
            let ry = yPos;
            r.moveTo(rx, ry);
            for (let s = 0; s < (racinesPulsent ? 5 : 4); s++) {
                rx += (rng() - 0.5) * 20;
                ry -= 4 + rng() * 6;
                r.lineTo(rx, ry);
            }
            r.strokePath();
            r.setScrollFactor(0.5, 0);
            r.setDepth(DEPTH.SILHOUETTES + 2);
            // Étage 2 : pulsation lente — la corruption respire
            if (racinesPulsent) {
                scene.tweens.add({
                    targets: r,
                    alpha: { from: 0.55, to: 1.0 },
                    duration: 2400 + rng() * 1600,
                    ease: 'Sine.InOut',
                    yoyo: true,
                    repeat: -1
                });
            }
            objets.push(r);
        }
    }

    return objets;
}

// ============================================================
// COUCHE 0 — NUAGES BAS (scrollFactor 0.1)
// ============================================================
//
// Bandes horizontales de nuages dans la moitié haute du canvas, drift très
// lent vers la droite. Comble le ciel vide qui semblait pauvre et donne une
// vraie présence aérienne au biome (humidité, brouillard d'altitude).

function poserNuagesBas(scene, dims, rng) {
    const objets = [];
    const largeurEtendue = dims.largeur * 1.6;
    const decalageX = -dims.largeur * 0.3;

    const nbBandes = 4;
    const couleursNuage = [0x4a5848, 0x5a6852, 0x6a7860];

    for (let i = 0; i < nbBandes; i++) {
        const g = scene.add.graphics();
        const couleur = couleursNuage[i % couleursNuage.length];
        const alphaBase = 0.18 + rng() * 0.10;
        const yBande = 60 + i * 55 + rng() * 25;
        const xBase = decalageX + (i / nbBandes) * largeurEtendue;

        // Chaque bande = 4-6 nuages elliptiques empilés irrégulièrement
        const nbNuages = 4 + Math.floor(rng() * 3);
        for (let n = 0; n < nbNuages; n++) {
            const xn = xBase + (largeurEtendue / nbBandes) * (n / nbNuages) + (rng() - 0.5) * 60;
            const yn = yBande + (rng() - 0.5) * 16;
            const ln = 180 + rng() * 220;
            const hn = 18 + rng() * 16;
            g.fillStyle(couleur, alphaBase);
            g.fillEllipse(xn, yn, ln, hn);
            // Halo intérieur plus clair (sous-couche pour effet "volume")
            g.fillStyle(teinterPlusClair(couleur, 0.10), alphaBase * 0.7);
            g.fillEllipse(xn + 6, yn - 3, ln * 0.65, hn * 0.7);
        }

        g.setScrollFactor(0.10, 0);
        g.setDepth(DEPTH.CIEL + 2); // juste au-dessus du ciel, derrière tout le reste
        objets.push(g);

        // Drift très lent
        scene.tweens.add({
            targets: g,
            x: '+=' + (40 + rng() * 30),
            duration: 80000 + rng() * 30000,
            ease: 'Linear',
            repeat: -1,
            yoyo: true
        });
    }

    return objets;
}

// ============================================================
// VOILE D'HORIZON — atmospheric perspective franche
// ============================================================
//
// Dégradé vertical qui voile les couches lointaines (nuages + montagnes) d'un
// vert pâle laiteux : opaque en haut (vers le ciel et les sommets) et
// transparent en bas (où vivent les éléments tangibles). Effet "peinture
// chinoise" — les plans lointains se fondent dans la lumière de l'horizon
// tandis que la zone du combat reste claire et contrastée.

function preparerTextureVoileHorizon(scene) {
    const id = '_voile_horizon_ruines_basses';
    if (scene.textures.exists(id)) return id;
    const w = 4, h = 540;
    const cv = scene.textures.createCanvas(id, w, h);
    const ctx = cv.getContext();
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    // Vert pâle laiteux — couleur de l'humidité d'aube
    gradient.addColorStop(0,    'rgba(180, 196, 158, 0.32)');
    gradient.addColorStop(0.5,  'rgba(180, 196, 158, 0.20)');
    gradient.addColorStop(0.75, 'rgba(180, 196, 158, 0.08)');
    gradient.addColorStop(1,    'rgba(180, 196, 158, 0.00)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    cv.refresh();
    return id;
}

function poserVoileHorizon(scene) {
    const id = preparerTextureVoileHorizon(scene);
    const cam = scene.cameras.main;
    const voile = scene.add.image(cam.width / 2, cam.height / 2, id);
    voile.setDisplaySize(cam.width, cam.height);
    voile.setScrollFactor(0, 0);
    voile.setDepth(DEPTH.SILHOUETTES - 1); // entre montagnes (-52) et ruines (-50)
    voile.setBlendMode(Phaser.BlendModes.NORMAL);
    return [voile];
}

// ============================================================
// BRUME BASSE — ferme le gap entre montagnes et niveau jouable
// ============================================================
//
// Bande horizontale dense d'ellipses qui s'étend au pied des montagnes
// jusqu'à la base du canvas. Drift lent yoyo. Couleur palette.brume.
// Positionnée en coords écran pour rester visible quoi que fasse la caméra.

function poserBrumeBasse(scene, dims, rng, palette) {
    const objets = [];
    const largeurEtendue = dims.largeur * 1.6;
    const decalageX = -dims.largeur * 0.3;

    // Trois bandes empilées, plus dense en bas
    const bandes = [
        { yEcran: 470, alpha: 0.22, nb: 7, lMin: 220, lMax: 360, hMin: 24, hMax: 36 },
        { yEcran: 495, alpha: 0.32, nb: 8, lMin: 260, lMax: 420, hMin: 28, hMax: 44 },
        { yEcran: 520, alpha: 0.42, nb: 9, lMin: 300, lMax: 480, hMin: 32, hMax: 52 }
    ];

    for (const bande of bandes) {
        const g = scene.add.graphics();
        g.fillStyle(palette.brume, bande.alpha);
        for (let i = 0; i < bande.nb; i++) {
            const xn = decalageX + (i / bande.nb) * largeurEtendue + (rng() - 0.5) * 80;
            const yn = bande.yEcran + (rng() - 0.5) * 10;
            const ln = bande.lMin + rng() * (bande.lMax - bande.lMin);
            const hn = bande.hMin + rng() * (bande.hMax - bande.hMin);
            g.fillEllipse(xn, yn, ln, hn);
        }
        g.setScrollFactor(0.2, 0); // parallax très faible — la brume "appartient" à l'horizon
        g.setDepth(DEPTH.SILHOUETTES + 1); // devant les ruines, derrière la forêt
        objets.push(g);

        // Drift lent yoyo
        scene.tweens.add({
            targets: g,
            x: '+=' + (50 + rng() * 40),
            duration: 50000 + rng() * 20000,
            ease: 'Sine.InOut',
            repeat: -1,
            yoyo: true
        });
    }

    return objets;
}

// ============================================================
// SOL-COLLINES LOINTAIN (scrollFactor 0.6) — premier plan d'horizon
// ============================================================
//
// Bande de petites collines basses entre la forêt morte et les plateformes
// du jeu, en coords écran. Sert de transition visuelle "vraie terre lointaine"
// qui ancre toute la composition. Polyline avec bosses + petites touffes
// d'herbe (verticales courtes) sur la crête + accents pourpres rares.

function poserSolColllines(scene, dims, rng, palette) {
    const objets = [];
    const largeurEtendue = dims.largeur * 1.6;
    const decalageX = -dims.largeur * 0.3;
    const yBase = GAME_HEIGHT;    // bas du canvas
    const yCrete = GAME_HEIGHT - 28; // crête moyenne des collines (var ±10)

    const g = scene.add.graphics();
    const couleurFoncee = 0x1e2a1c;
    g.fillStyle(couleurFoncee, 0.92);

    // Profil polyline : bosses sinusoïdales avec aspérités
    const nbPoints = 48;
    const pas = largeurEtendue / nbPoints;
    const points = [];
    points.push({ x: decalageX, y: yBase });
    for (let i = 0; i <= nbPoints; i++) {
        const x = decalageX + pas * i;
        const phase = (i / nbPoints) * Math.PI * 4;
        const bosse = Math.sin(phase) * 5 + Math.sin(phase * 2.3) * 3;
        const y = yCrete + bosse + (rng() - 0.5) * 4;
        points.push({ x, y });
    }
    points.push({ x: decalageX + largeurEtendue, y: yBase });

    g.beginPath();
    g.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) g.lineTo(points[i].x, points[i].y);
    g.closePath();
    g.fillPath();

    // Ligne de crête plus claire (rim light vert mousse au sommet des collines)
    g.lineStyle(1.5, palette.mousse, 0.7);
    g.beginPath();
    g.moveTo(points[1].x, points[1].y);
    for (let i = 2; i < points.length - 1; i++) g.lineTo(points[i].x, points[i].y);
    g.strokePath();

    g.setScrollFactor(0.6, 0);
    g.setDepth(DEPTH.SILHOUETTES + 3); // devant la forêt morte, derrière les plateformes
    objets.push(g);

    // Touffes d'herbe sur la crête (verticales courtes) — densité variable
    const herbes = scene.add.graphics();
    const nbHerbes = 80;
    for (let i = 0; i < nbHerbes; i++) {
        const t = rng();
        const idx = 1 + Math.floor(t * (points.length - 2));
        const p = points[idx];
        const offX = (rng() - 0.5) * pas;
        const lH = 3 + rng() * 5;
        const couleur = rng() < 0.85 ? palette.mousse : palette.racine;
        const alphaH = rng() < 0.85 ? 0.65 : 0.45;
        herbes.lineStyle(0.8, couleur, alphaH);
        herbes.beginPath();
        herbes.moveTo(p.x + offX, p.y);
        herbes.lineTo(p.x + offX + (rng() - 0.5) * 1.5, p.y - lH);
        herbes.strokePath();
    }
    herbes.setScrollFactor(0.6, 0);
    herbes.setDepth(DEPTH.SILHOUETTES + 4);
    objets.push(herbes);

    return objets;
}

// ============================================================
// ANIMATIONS AMBIANTES — oiseaux lointains + rayons d'aube
// ============================================================

// Vol d'oiseaux : 3-4 silhouettes en V qui traversent le ciel cycliquement.
// Très loin (scrollFactor 0.2), petite taille, drift horizontal lent. Anime
// les ailes par un yoyo très subtil sur la rotation.
function poserOiseauxLointains(scene, dims, rng) {
    const objets = [];
    const nbVols = 2; // 2 vols indépendants, apparitions décalées

    for (let v = 0; v < nbVols; v++) {
        // Container = un vol (groupe d'oiseaux). On l'anime en bloc.
        const vol = scene.add.container(0, 0);
        const nbOiseaux = 3 + Math.floor(rng() * 2);
        const tailleBase = 6 + rng() * 3;

        for (let i = 0; i < nbOiseaux; i++) {
            const g = scene.add.graphics();
            // Forme en V simple — 2 segments depuis le centre
            const t = tailleBase * (0.85 + rng() * 0.3);
            const couleur = 0x1c2418;
            g.lineStyle(1.4, couleur, 0.75);
            g.beginPath();
            g.moveTo(-t, 2);
            g.lineTo(0, 0);
            g.lineTo(t, 2);
            g.strokePath();
            // Décalage dans le vol (formation en V décalé)
            g.x = i * 14 - (rng() * 4);
            g.y = Math.abs(i - nbOiseaux / 2) * 5 + (rng() - 0.5) * 4;
            vol.add(g);

            // Battement d'ailes très subtil (yoyo sur scaleY pour fermer/ouvrir le V)
            scene.tweens.add({
                targets: g,
                scaleY: { from: 0.6, to: 1.1 },
                duration: 480 + rng() * 220,
                ease: 'Sine.InOut',
                yoyo: true,
                repeat: -1
            });
        }

        // Position initiale hors écran
        const dirGauche = rng() < 0.5;
        const xDepart = dirGauche ? 1100 : -150;
        const xFin = dirGauche ? -150 : 1100;
        const yVol = 80 + rng() * 100; // entre les nuages et le voile
        vol.x = xDepart;
        vol.y = yVol;
        vol.setScrollFactor(0.2, 0);
        vol.setDepth(DEPTH.SILHOUETTES - 3); // derrière le voile, devant les nuages
        objets.push(vol);

        // Traversée + délai avant relance
        const dureeTraversee = 28000 + rng() * 18000;
        const delaiAvant = 6000 + v * 14000 + rng() * 10000;
        scene.tweens.add({
            targets: vol,
            x: xFin,
            duration: dureeTraversee,
            ease: 'Linear',
            delay: delaiAvant,
            repeat: -1,
            repeatDelay: 18000 + rng() * 22000,
            onRepeat: () => {
                vol.x = dirGauche ? 1100 : -150;
                vol.y = 80 + Math.random() * 100;
            }
        });
    }

    return objets;
}

// Rayons d'aube : faisceaux obliques diagonaux qui filtrent depuis le haut-gauche,
// vert-blanc laiteux en mode ADD, alpha très faible (0.08-0.12). Drift très lent
// et respiration alpha pour faire "respirer" la lumière.
function poserRayonsAube(scene, dims, rng) {
    const objets = [];
    const nbRayons = 3;
    const largeurRayon = 90;
    const decalageDiag = 320; // angle des rayons (vers le bas-droite)
    const couleurRayon = 0xc8d8c8; // blanc-vert très pâle (l'aube qui filtre)

    for (let i = 0; i < nbRayons; i++) {
        const xHaut = -50 + i * 320 + rng() * 80;
        const g = scene.add.graphics();
        const alphaBase = 0.08 + rng() * 0.05;
        g.setBlendMode(Phaser.BlendModes.ADD);
        g.fillStyle(couleurRayon, alphaBase);

        // Parallélogramme depuis le haut vers le bas-droite
        g.beginPath();
        g.moveTo(xHaut, -10);
        g.lineTo(xHaut + largeurRayon, -10);
        g.lineTo(xHaut + largeurRayon + decalageDiag, 540);
        g.lineTo(xHaut + decalageDiag, 540);
        g.closePath();
        g.fillPath();

        g.setScrollFactor(0.7, 0);
        g.setDepth(DEPTH.SILHOUETTES + 5); // entre sol-collines et plateformes
        objets.push(g);

        // Respiration alpha — l'aube qui filtre faiblit et revient
        scene.tweens.add({
            targets: g,
            alpha: { from: 0.7, to: 1.15 },
            duration: 5000 + rng() * 4000,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
    }

    return objets;
}

// ============================================================
// FOREGROUND VIVANT — herbes folles, feuilles mortes, vrilles, bokeh
// ============================================================
//
// Couches au-dessus des plateformes (DEPTH 5-8) mais sous les entités/joueur
// (DEPTH.ENTITES = 20), pour faire que le joueur soit "dans" le monde sans
// que rien ne masque le combat.

// Herbes folles : silhouettes verticales sombres au bord bas du canvas qui
// passent devant le joueur quand il se déplace (parallax > 1). Animation
// sway très légère pour éviter le statique.
function poserHerbesForeground(scene, dims, rng, palette) {
    const objets = [];
    const largeurEtendue = dims.largeur * 1.8;
    const decalageX = -dims.largeur * 0.4;
    const yBase = GAME_HEIGHT + 4;

    // Densité variable — 24 touffes, taille et opacité variant
    const nbTouffes = 24;
    for (let i = 0; i < nbTouffes; i++) {
        const g = scene.add.graphics();
        const x = decalageX + (i / nbTouffes) * largeurEtendue + (rng() - 0.5) * 30;
        const hMax = 16 + rng() * 22;
        const couleur = rng() < 0.85 ? 0x1a2418 : 0x4a1838; // 15% pourpre rare
        const alpha = 0.55 + rng() * 0.30;

        // Touffe = 4-7 brins serrés
        const nbBrins = 4 + Math.floor(rng() * 4);
        g.lineStyle(1.3 + rng() * 1.2, couleur, alpha);
        for (let b = 0; b < nbBrins; b++) {
            const xb = (rng() - 0.5) * 6;
            const h = hMax * (0.5 + rng() * 0.5);
            g.beginPath();
            g.moveTo(xb, 0);
            // Brin courbé (control point latéral)
            const cpx = xb + (rng() - 0.5) * 4;
            const cpy = -h * 0.5;
            const ex = xb + (rng() - 0.5) * 6;
            const ey = -h;
            tracerCourbeQuadratique(g, xb, 0, cpx, cpy, ex, ey, 6);
        }
        g.x = x;
        g.y = yBase;
        g.setScrollFactor(1.25, 0); // parallax x1.25 — passe devant les plateformes
        g.setDepth(5); // au-dessus des plateformes ornement, sous les entités

        // Métadonnées pour les interactions (sway + réaction joueur + vent)
        // - phase : décale le sway sinusoïdal pour que les herbes n'oscillent
        //   pas toutes en sync
        // - bendVent : offset de rotation appliqué lors d'une rafale de vent
        // - bendJoueur : offset de rotation appliqué quand le joueur passe près
        g._herbeRuinesBasses = {
            phase: rng() * Math.PI * 2,
            bendVent: 0,
            bendJoueur: 0
        };
        objets.push(g);
    }

    return objets;
}

// Feuilles mortes : émetteur de particules brun-orangé qui tombent en diagonale
// avec rotation. Couleurs variées pour l'effet automnal mélancolique.
function preparerTextureFeuille(scene) {
    const id = '_feuille_morte_ruines_basses';
    if (scene.textures.exists(id)) return id;
    // Forme de feuille simple : ellipse pointue
    const w = 14, h = 7;
    const cv = scene.textures.createCanvas(id, w, h);
    const ctx = cv.getContext();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w / 2 - 0.5, h / 2 - 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Nervure centrale plus sombre
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(1, h / 2);
    ctx.lineTo(w - 1, h / 2);
    ctx.stroke();
    cv.refresh();
    return id;
}

function poserFeuillesMortes(scene, dims, rng) {
    const objets = [];
    preparerTextureFeuille(scene);

    // Couleurs brun-orangé en automne — contraste avec le vert dominant
    const couleurs = [0x8a5028, 0xa06030, 0xc07040, 0x6a4020, 0xb05028];

    // Émetteur principal : feuilles qui tombent depuis le haut, larges trajectoires.
    // `rotate.start/end` fait tourner chaque feuille en continu pendant son vol.
    const em = scene.add.particles(0, 0, '_feuille_morte_ruines_basses', {
        x: { min: -100, max: 1060 },
        y: -20,
        lifespan: 9000,
        speedY: { min: 25, max: 55 },
        speedX: { min: -18, max: 8 }, // dérive vers la gauche (vent doux)
        scale: { start: 0.6, end: 0.8 },
        rotate: { start: 0, end: 540 }, // une rotation et demie sur la durée du vol
        tint: () => couleurs[Math.floor(Math.random() * couleurs.length)],
        alpha: { start: 0.85, end: 0.55 },
        quantity: 1,
        frequency: 1800 // une feuille toutes les ~1.8s, c'est rare donc précieux
    });
    em.setScrollFactor(0.9, 0); // léger parallax
    em.setDepth(7);
    objets.push(em);

    return objets;
}

// Vrilles de lierre pourpre qui pendent du haut de l'écran (au-delà du canvas).
// 1-2 par écran, position seedée, sway lent.
function poserVrillesLierre(scene, dims, rng, palette) {
    const objets = [];
    const nbVrilles = 1 + Math.floor(rng() * 2); // 1-2

    for (let i = 0; i < nbVrilles; i++) {
        const g = scene.add.graphics();
        const xBase = 80 + rng() * 800;
        const longueur = 90 + rng() * 80;

        // Vrille principale (segments courbés)
        g.lineStyle(1.5, palette.racine, 0.75);
        const segments = 6;
        let px = 0, py = 0;
        g.beginPath();
        g.moveTo(0, 0);
        for (let s = 1; s <= segments; s++) {
            const t = s / segments;
            const newX = (rng() - 0.5) * 16;
            const newY = longueur * t;
            // Control point pour courbe
            const cpx = (px + newX) * 0.5 + (rng() - 0.5) * 6;
            const cpy = (py + newY) * 0.5;
            tracerCourbeQuadratique(g, px, py, cpx, cpy, newX, newY, 8);
            px = newX;
            py = newY;
        }

        // 2-3 petites feuilles pourpres le long de la vrille
        const nbFeuilles = 2 + Math.floor(rng() * 2);
        for (let f = 0; f < nbFeuilles; f++) {
            const t = 0.3 + (f / nbFeuilles) * 0.6 + rng() * 0.1;
            const yF = longueur * t;
            const xF = (rng() - 0.5) * 12;
            const cote = rng() < 0.5 ? -1 : 1;
            g.fillStyle(palette.racine, 0.7);
            g.fillEllipse(xF + cote * 4, yF, 7, 3);
        }

        g.x = xBase;
        g.y = -10;
        g.setScrollFactor(1.15, 0);
        g.setDepth(6);

        // Sway lent (la vrille pend et oscille doucement)
        scene.tweens.add({
            targets: g,
            rotation: { from: -0.06, to: 0.06 },
            duration: 4500 + rng() * 2000,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
        objets.push(g);
    }

    return objets;
}

// Bokeh foreground : 2-3 grosses formes très floutées (cercles à gradient) qui
// passent en parallax 1.4-1.6, donnent une vraie sensation de "dans" le tableau.
function poserBokehForeground(scene, dims, rng) {
    const objets = [];
    const nbBokeh = 3;
    const couleurs = [0x1a2418, 0x223028, 0x4a1838];

    for (let i = 0; i < nbBokeh; i++) {
        const g = scene.add.graphics();
        const couleur = couleurs[i % couleurs.length];
        const r = 38 + rng() * 28;

        // Cercle en plusieurs couches alpha pour effet flouté
        for (let l = 0; l < 4; l++) {
            const rad = r * (1 - l * 0.18);
            const alpha = 0.08 + l * 0.04;
            g.fillStyle(couleur, alpha);
            g.fillCircle(0, 0, rad);
        }

        g.x = 100 + rng() * 800;
        g.y = GAME_HEIGHT - 30 - rng() * 60;
        g.setScrollFactor(1.45 + rng() * 0.15, 0);
        g.setDepth(8);

        // Léger drift vertical pour ne pas être complètement statique
        scene.tweens.add({
            targets: g,
            y: g.y + (rng() - 0.5) * 14,
            duration: 6000 + rng() * 4000,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
        objets.push(g);
    }

    return objets;
}

// ============================================================
// VESTIGES FUGACES — silhouettes humanoïdes du passé
// ============================================================
//
// 1-2 par run, apparitions cycliques. Silhouettes humanoïdes très transparentes
// qui marchent quelques pas puis disparaissent. Évoque la présence persistante
// du passé dans les ruines (cohérent avec le lore "monde post-Reflux").

function peindreSilhouetteHumanoide(scene, couleur, alpha) {
    const g = scene.add.graphics();
    // Corps oblong (rectangle aux coins arrondis approchés par 2 demi-cercles)
    g.fillStyle(couleur, alpha);
    g.fillRect(-3, -22, 6, 18);
    g.fillCircle(0, -4, 3); // pieds joints
    // Tête
    g.fillCircle(0, -26, 4);
    // Épaules + suggestion de bras
    g.fillEllipse(-4, -18, 4, 8);
    g.fillEllipse(4, -18, 4, 8);
    return g;
}

function poserVestigesFugaces(scene, dims, rng, palette) {
    const objets = [];
    const nbVestiges = 1 + Math.floor(rng() * 2); // 1-2

    for (let v = 0; v < nbVestiges; v++) {
        const couleur = rng() < 0.6 ? 0x6a7a68 : 0x8a6878; // gris-vert ou gris-pourpre
        const alphaCible = 0.20 + rng() * 0.10;
        const silhouette = peindreSilhouetteHumanoide(scene, couleur, 1);
        silhouette.setAlpha(0); // démarre invisible
        silhouette.setScrollFactor(0.4, 0); // à mi-distance, entre ruines et forêt
        silhouette.setDepth(DEPTH.SILHOUETTES + 1); // devant les ruines, derrière la brume basse

        // Position initiale écran (cohérente avec le sol-collines)
        const yPos = GAME_HEIGHT - 30 - rng() * 8;
        silhouette.y = yPos;

        // Cycle d'apparition : invisible → apparaît → marche → disparaît → attend
        const dureeCycle = 35000 + rng() * 28000;
        const delaiInitial = 4000 + v * 18000 + rng() * 8000;

        const lancerCycle = () => {
            const directionGauche = Math.random() < 0.5;
            const xDepart = directionGauche ? 950 + Math.random() * 80 : -50 - Math.random() * 80;
            const xFin = directionGauche ? xDepart - 120 - Math.random() * 100 : xDepart + 120 + Math.random() * 100;
            silhouette.x = xDepart;
            silhouette.alpha = 0;
            silhouette.y = GAME_HEIGHT - 30 - Math.random() * 8;

            // Fade in
            scene.tweens.add({
                targets: silhouette,
                alpha: alphaCible,
                duration: 2000,
                ease: 'Sine.Out'
            });
            // Marche horizontale (très lente) + léger bobbing vertical pour la démarche
            scene.tweens.add({
                targets: silhouette,
                x: xFin,
                duration: 9000 + Math.random() * 3000,
                ease: 'Linear'
            });
            const bobBase = silhouette.y;
            const bobTw = scene.tweens.add({
                targets: silhouette,
                y: { from: bobBase, to: bobBase - 2 },
                duration: 540,
                ease: 'Sine.InOut',
                yoyo: true,
                repeat: -1
            });
            // Fade out à la fin
            scene.time.delayedCall(9500, () => {
                scene.tweens.add({
                    targets: silhouette,
                    alpha: 0,
                    duration: 2000,
                    ease: 'Sine.In',
                    onComplete: () => { bobTw.stop(); }
                });
            });
            // Relance après le cycle complet
            scene.time.delayedCall(dureeCycle, lancerCycle);
        };

        scene.time.delayedCall(delaiInitial, lancerCycle);
        objets.push(silhouette);
    }

    return objets;
}

// ============================================================
// PLUIE FINE OCCASIONNELLE
// ============================================================
//
// 3-5 % du temps de session. Tringles diagonales fines en mode normal avec
// alpha 0.15-0.20. Démarre/s'arrête de façon aléatoire, dure 30-60s par épisode.
// Le cycle est indépendant — il continue à travers les salles via la scène.

function preparerTextureGoutte(scene) {
    const id = '_goutte_pluie_ruines_basses';
    if (scene.textures.exists(id)) return id;
    const cv = scene.textures.createCanvas(id, 2, 12);
    const ctx = cv.getContext();
    const gradient = ctx.createLinearGradient(0, 0, 0, 12);
    gradient.addColorStop(0, 'rgba(200, 220, 215, 0)');
    gradient.addColorStop(0.5, 'rgba(200, 220, 215, 0.7)');
    gradient.addColorStop(1, 'rgba(200, 220, 215, 0.95)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2, 12);
    cv.refresh();
    return id;
}

function poserPluieFine(scene, dims, rng, options = {}) {
    const objets = [];
    preparerTextureGoutte(scene);
    const forcer = options.forcer === true;

    // Émetteur fixé à la caméra (scrollFactor 0,0) pour que la pluie couvre
    // tout le viewport quelle que soit la taille de la salle. Avec un parallax
    // non nul, les émissions ne couvraient qu'une bande de l'écran (les salles
    // font 1600-1700 px de large alors que le viewport n'en voit que 960).
    const em = scene.add.particles(0, 0, '_goutte_pluie_ruines_basses', {
        x: { min: -150, max: 1110 },
        y: -20,
        lifespan: 1200,
        speedY: { min: 700, max: 900 },
        speedX: { min: -180, max: -120 },
        scale: { start: 1, end: 1 },
        alpha: { start: 0.75, end: 0.5 },
        rotate: -14,
        quantity: 12,
        frequency: 35,
        emitting: forcer // forcer = on démarre allumé et on ne s'éteint jamais
    });
    em.setScrollFactor(0, 0);
    em.setDepth(8);
    objets.push(em);

    // Si forcé (salle de boss), on saute le cycle météo aléatoire.
    if (forcer) return objets;

    // Cycle météo : délais raccourcis pour que l'effet soit visible malgré les
    // restarts de scène (transitions de salle).
    const lancerCyclePluie = () => {
        const pauseAvant = 45000 + Math.random() * 75000;
        scene.time.delayedCall(pauseAvant, () => {
            em.start();
            const dureePluie = 22000 + Math.random() * 22000;
            scene.time.delayedCall(dureePluie, () => {
                em.stop();
                lancerCyclePluie();
            });
        });
    };
    if (Math.random() < 0.55) {
        scene.time.delayedCall(2000 + Math.random() * 4000, () => {
            em.start();
            const dureeInit = 22000 + Math.random() * 22000;
            scene.time.delayedCall(dureeInit, () => {
                em.stop();
                lancerCyclePluie();
            });
        });
    } else {
        lancerCyclePluie();
    }

    return objets;
}

// ============================================================
// INTERACTIONS VIVANTES — herbes réactives + atterrissage + cycle vent
// ============================================================
//
// Tick `postupdate` qui :
//   - applique un sway sinusoïdal de base à chaque herbe
//   - ajoute un offset bend quand le joueur passe à proximité (force radiale)
//   - applique le bendVent quand une rafale est active
//   - détecte l'atterrissage (transition non-onfloor → onfloor) et émet une
//     gerbe de feuilles + un nuage de poussière au point d'impact
//
// Le cycle vent est aussi déclenché ici : toutes les 20-40s, rafale coordonnée
// qui plie les herbes et accélère brièvement les feuilles tombées.

function enregistrerInteractionsRuinesBasses(scene, herbes, emetteurFeuilles) {
    let etaitAuSol = true;
    let bendVentCible = 0;
    let bendVentCourant = 0;

    // Cycle vent : rafales fréquentes et bien marquées. Délais courts pour que
    // l'effet soit visible même si la scène est redémarrée à chaque transition
    // de salle (sinon les delayedCall longs n'aboutissent jamais).
    const declencherRafale = () => {
        const direction = Math.random() < 0.5 ? -1 : 1;
        bendVentCible = direction * (0.22 + Math.random() * 0.15); // 13-21° de pliage
        const dureeRafale = 3500 + Math.random() * 3000;
        scene.time.delayedCall(dureeRafale, () => {
            bendVentCible = 0;
            // Prochaine rafale 10-20s plus tard
            scene.time.delayedCall(10000 + Math.random() * 10000, declencherRafale);
        });
    };
    // Première rafale 4-10s après l'entrée en salle
    scene.time.delayedCall(4000 + Math.random() * 6000, declencherRafale);

    const updTick = () => {
        const player = scene.player;
        if (!player) return;

        // Lerp doux du bendVent vers la cible (pas de discontinuité)
        bendVentCourant += (bendVentCible - bendVentCourant) * 0.04;

        const px = player.x;
        const py = player.y;
        const time = scene.time.now;

        for (const herbe of herbes) {
            const meta = herbe._herbeRuinesBasses;
            if (!meta) continue;

            // Sway sinusoïdal de base (chaque touffe a sa propre phase)
            const sway = Math.sin(time * 0.0009 + meta.phase) * 0.035;

            // Réaction au joueur : force radiale sur les touffes proches
            // ⚠️ herbe est en scrollFactor 1.25 — donc sa position monde n'est
            // pas comparable directement au player.x (qui est en monde).
            // On approxime en regardant la position écran (player.x - cam.scrollX)
            // vs herbe.x - cam.scrollX * 1.25. Pour ne pas complexifier, on
            // compare en delta-écran avec la caméra principale.
            const cam = scene.cameras.main;
            const herbeScreenX = herbe.x - cam.scrollX * 1.25;
            const playerScreenX = px - cam.scrollX;
            const dx = herbeScreenX - playerScreenX;
            const dy = (herbe.y - cam.scrollY * 0) - (py - cam.scrollY); // herbe Y est en écran
            const dist = Math.hypot(dx, dy * 0.5); // poids vertical réduit
            let bendJoueur = 0;
            if (dist < 90) {
                const force = (90 - dist) / 90;
                bendJoueur = Math.sign(dx) * 0.45 * force;
            }

            herbe.rotation = sway + bendVentCourant + bendJoueur;
        }

        // Détection atterrissage
        const auSol = !!(player.body && (player.body.blocked.down || (player.body.onFloor && player.body.onFloor())));
        if (auSol && !etaitAuSol) {
            // Atterrissage : ne déclencher que si la chute est significative
            // (sinon ça crame à chaque pas sur le sol — Phaser oscille un peu)
            const chuteSignif = player.body.velocity.y === 0 ? false : true;
            // On déclenche si on vient de descendre — on s'appuie sur "etaitAuSol"
            // qui ne devient false que sur un vrai saut/chute.
            if (chuteSignif || true) {
                // Émet 5-7 feuilles à la position d'impact
                if (emetteurFeuilles && emetteurFeuilles.emitParticleAt) {
                    emetteurFeuilles.emitParticleAt(px, py + 24, 5 + Math.floor(Math.random() * 3));
                }
                // Petit nuage de poussière au pied
                const dust = scene.add.graphics();
                dust.fillStyle(0xaa9a78, 0.5);
                dust.fillEllipse(0, 0, 14, 4);
                dust.x = px;
                dust.y = py + 30;
                dust.setDepth(7);
                scene.tweens.add({
                    targets: dust,
                    scale: 2.2,
                    alpha: 0,
                    duration: 420,
                    onComplete: () => dust.destroy()
                });
            }
        }
        etaitAuSol = auSol;
    };

    scene.events.on('postupdate', updTick);
    scene.events.once('shutdown', () => scene.events.off('postupdate', updTick));
}

// ============================================================
// BRUME VOLUMÉTRIQUE AU SOL — réactive au joueur + onde de parry
// ============================================================
//
// 14 blobs de brume posés au sol (bas de l'écran), drift horizontal lent.
// Chaque blob ajuste son alpha selon la distance écran au joueur :
//   - proche (< 110 px) : alpha réduit (rayon de clarté autour du Vestige)
//   - loin            : alpha de base
// Onde de parry : à chaque parry réussi, les blobs dans un rayon de 200 px
// se dissipent brièvement (alpha → 0, recovery 500 ms).

function poserBrumeVolumetriqueAuSol(scene, dims, rng, palette) {
    const objets = [];
    const blobs = [];
    const yBase = GAME_HEIGHT - 14; // tout en bas du canvas
    const nbBlobs = 14;
    const couleur = palette.brume;

    for (let i = 0; i < nbBlobs; i++) {
        const g = scene.add.graphics();
        const rayonX = 60 + rng() * 50;
        const rayonY = 14 + rng() * 8;
        // 3 couches alpha empilées pour effet "blob flouté"
        g.fillStyle(couleur, 0.20);
        g.fillEllipse(0, 0, rayonX * 1.4, rayonY * 1.4);
        g.fillStyle(couleur, 0.32);
        g.fillEllipse(0, 0, rayonX, rayonY);
        g.fillStyle(teinterPlusClair(couleur, 0.08), 0.40);
        g.fillEllipse(0, 0, rayonX * 0.6, rayonY * 0.7);

        // Position initiale espacée + variation aléatoire
        g.x = (i / nbBlobs) * (GAME_WIDTH + 200) - 100 + (rng() - 0.5) * 50;
        g.y = yBase + (rng() - 0.5) * 12;
        g.setScrollFactor(0.85, 0); // fixé en Y, parallax X léger
        g.setDepth(9); // au-dessus des plateformes, sous les entités

        // Métadonnées pour le tick d'interaction
        g._brumeBlob = {
            alphaBase: 0.65 + rng() * 0.20,
            alphaCible: 0.65 + rng() * 0.20,
            alphaCourant: 0.65 + rng() * 0.20,
            dissipationParryFin: 0
        };
        g.setAlpha(g._brumeBlob.alphaBase);

        // Drift horizontal lent yoyo (le sol respire)
        scene.tweens.add({
            targets: g,
            x: g.x + 40 + rng() * 30,
            duration: 22000 + rng() * 14000,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
        // Drift vertical encore plus subtil
        scene.tweens.add({
            targets: g,
            y: g.y + (rng() - 0.5) * 8,
            duration: 9000 + rng() * 5000,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });

        blobs.push(g);
        objets.push(g);
    }

    return { objets, blobs };
}

function enregistrerBrumeReactive(scene, blobs) {
    const cam = scene.cameras.main;
    const rayonClairete = 110;       // bulle de clarté autour du joueur
    const reductionMax = 0.85;       // jusqu'à 85% d'alpha en moins au plus proche
    const rayonOndeParry = 200;
    const dureeOnde = 500;           // ms — recovery après dissipation

    const updTick = () => {
        const player = scene.player;
        if (!player || blobs.length === 0) return;

        const playerScreenX = player.x - cam.scrollX;
        const playerScreenY = player.y - cam.scrollY;
        const now = scene.time.now;

        for (const blob of blobs) {
            const meta = blob._brumeBlob;
            if (!meta) continue;

            // Position écran du blob (scrollFactor 0.85 sur X, 0 sur Y)
            const blobScreenX = blob.x - cam.scrollX * 0.85;
            const blobScreenY = blob.y;

            const dx = blobScreenX - playerScreenX;
            const dy = blobScreenY - playerScreenY;
            const dist = Math.hypot(dx, dy * 0.7); // poids vertical réduit (la bulle est aplatie)

            // 1. Bulle de clarté permanente
            let cible = meta.alphaBase;
            if (dist < rayonClairete) {
                const facteur = 1 - dist / rayonClairete;
                cible = meta.alphaBase * (1 - reductionMax * facteur);
            }

            // 2. Dissipation par onde de parry (en cours ?)
            if (now < meta.dissipationParryFin) {
                const reste = (meta.dissipationParryFin - now) / dureeOnde; // 1..0
                cible *= (1 - reste * 0.95); // dissipation quasi totale au pic
            }

            // Lerp doux pour éviter les saccades
            meta.alphaCourant += (cible - meta.alphaCourant) * 0.12;
            blob.setAlpha(meta.alphaCourant);
        }
    };

    scene.events.on('postupdate', updTick);

    // Listener parry:success — émet GameScene à chaque parry réussi.
    // Tous les blobs dans le rayon démarrent leur cycle de dissipation.
    const onParry = ({ x, y }) => {
        const playerScreenX = x - cam.scrollX;
        const playerScreenY = y - cam.scrollY;
        const now = scene.time.now;
        for (const blob of blobs) {
            const blobScreenX = blob.x - cam.scrollX * 0.85;
            const blobScreenY = blob.y;
            const dx = blobScreenX - playerScreenX;
            const dy = blobScreenY - playerScreenY;
            const dist = Math.hypot(dx, dy * 0.7);
            if (dist < rayonOndeParry) {
                blob._brumeBlob.dissipationParryFin = now + dureeOnde;
            }
        }
    };
    scene.events.on('parry:success', onParry);

    scene.events.once('shutdown', () => {
        scene.events.off('postupdate', updTick);
        scene.events.off('parry:success', onParry);
    });
}

// ============================================================
// LUCIOLES — 10 réactives au foreground + 25 lointaines arrière-plan
// ============================================================
//
// Les lucioles réactives ont chacune un comportement IA simple : ancrage à
// un point flottant + drift sinusoïdal autour + fuite si joueur trop proche.
// Glow pulsant (alpha yoyo), mode ADD pour le halo.
// Les lucioles lointaines sont passives : drift sinusoïdal seul.

function preparerTextureLuciole(scene) {
    const id = '_luciole_ruines_basses';
    if (scene.textures.exists(id)) return id;
    const w = 10, h = 10;
    const cv = scene.textures.createCanvas(id, w, h);
    const ctx = cv.getContext();
    const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gradient.addColorStop(0,   'rgba(220, 255, 180, 1)');
    gradient.addColorStop(0.4, 'rgba(180, 220, 130, 0.7)');
    gradient.addColorStop(1,   'rgba(120, 180, 90, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    cv.refresh();
    return id;
}

function poserLuciolesLointaines(scene, dims, rng) {
    const objets = [];
    preparerTextureLuciole(scene);
    const nb = 25;
    const largeurEtendue = dims.largeur * 1.5;
    const decalageX = -dims.largeur * 0.25;

    for (let i = 0; i < nb; i++) {
        const luciole = scene.add.image(0, 0, '_luciole_ruines_basses');
        luciole.setBlendMode(Phaser.BlendModes.ADD);
        const baseX = decalageX + (i / nb) * largeurEtendue + (rng() - 0.5) * 30;
        const baseY = 200 + rng() * 260;
        luciole.x = baseX;
        luciole.y = baseY;
        luciole.setScale(0.5 + rng() * 0.3);
        luciole.setAlpha(0.35 + rng() * 0.30);
        luciole.setScrollFactor(0.4, 0);
        luciole.setDepth(DEPTH.SILHOUETTES + 2);

        // Drift sinusoïdal — chaque luciole a sa phase et son amplitude
        const phase = rng() * Math.PI * 2;
        const amplX = 12 + rng() * 18;
        const amplY = 8 + rng() * 14;
        const periode = 4500 + rng() * 3500;
        scene.tweens.add({
            targets: luciole,
            x: { from: baseX - amplX, to: baseX + amplX },
            duration: periode,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1,
            delay: phase * 500
        });
        scene.tweens.add({
            targets: luciole,
            y: { from: baseY - amplY, to: baseY + amplY },
            duration: periode * 0.7,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1,
            delay: phase * 300
        });
        // Pulse alpha (la luciole "respire")
        scene.tweens.add({
            targets: luciole,
            alpha: { from: luciole.alpha * 0.55, to: luciole.alpha },
            duration: 1400 + rng() * 800,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
        objets.push(luciole);
    }

    return objets;
}

function poserLuciolesReactives(scene, dims, rng) {
    const objets = [];
    const lucioles = [];
    preparerTextureLuciole(scene);
    const nb = 10;

    for (let i = 0; i < nb; i++) {
        const luciole = scene.add.image(0, 0, '_luciole_ruines_basses');
        luciole.setBlendMode(Phaser.BlendModes.ADD);
        // Ancrage en coords monde (réparti sur toute la largeur de la salle)
        // au-dessus du sol où la luciole "habite". scrollFactor 1.0 → monde.
        const ancrageX = 80 + rng() * Math.max(200, dims.largeur - 160);
        const ancrageY = GAME_HEIGHT - 140 - rng() * 200;
        luciole.x = ancrageX;
        luciole.y = ancrageY;
        luciole.setScale(0.9 + rng() * 0.5);
        luciole.setAlpha(0.65 + rng() * 0.25);
        luciole.setScrollFactor(1.0, 0); // au niveau du joueur
        luciole.setDepth(15); // entre plateformes (0) et entités (20)

        luciole._luciole = {
            ancrageX,
            ancrageY,
            phase: rng() * Math.PI * 2,
            amplX: 14 + rng() * 18,
            amplY: 10 + rng() * 16,
            vitesse: 0.0006 + rng() * 0.0004,
            // Vélocité de fuite accumulée (lerp vers 0 quand pas de joueur proche)
            fuiteVX: 0,
            fuiteVY: 0
        };
        // Pulse alpha (la luciole "respire")
        scene.tweens.add({
            targets: luciole,
            alpha: { from: luciole.alpha * 0.5, to: luciole.alpha },
            duration: 900 + rng() * 600,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });

        lucioles.push(luciole);
        objets.push(luciole);
    }

    return { objets, lucioles };
}

function enregistrerInteractionsLucioles(scene, lucioles) {
    const cam = scene.cameras.main;
    const rayonFuite = 70; // distance écran sous laquelle elles s'écartent
    const forceFuite = 0.45;

    const updTick = () => {
        const player = scene.player;
        if (!player || lucioles.length === 0) return;
        const time = scene.time.now;
        const playerScreenX = player.x - cam.scrollX;
        const playerScreenY = player.y - cam.scrollY;

        for (const luciole of lucioles) {
            const meta = luciole._luciole;
            if (!meta) continue;

            // Drift sinusoïdal autour de l'ancrage
            const baseX = meta.ancrageX + Math.sin(time * meta.vitesse + meta.phase) * meta.amplX;
            const baseY = meta.ancrageY + Math.cos(time * meta.vitesse * 1.3 + meta.phase) * meta.amplY;

            // Fuite radiale du joueur
            const lucioleScreenX = luciole.x - cam.scrollX * 1.0;
            const lucioleScreenY = luciole.y;
            const dx = lucioleScreenX - playerScreenX;
            const dy = lucioleScreenY - playerScreenY;
            const dist = Math.hypot(dx, dy);
            if (dist < rayonFuite && dist > 0.1) {
                const facteur = (rayonFuite - dist) / rayonFuite;
                meta.fuiteVX += (dx / dist) * forceFuite * facteur;
                meta.fuiteVY += (dy / dist) * forceFuite * facteur;
            }
            // Damping de la vélocité de fuite (retour progressif au point d'ancrage)
            meta.fuiteVX *= 0.92;
            meta.fuiteVY *= 0.92;

            luciole.x = baseX + meta.fuiteVX * 30;
            luciole.y = baseY + meta.fuiteVY * 30;
        }
    };
    scene.events.on('postupdate', updTick);
    scene.events.once('shutdown', () => scene.events.off('postupdate', updTick));
}

// ============================================================
// COMPOSER PUBLIC — appelle les 7 couches du fond vers l'avant
// ============================================================

export function composerParallaxRuinesBasses(scene, dims, monde, rng) {
    const palette = paletteCouranteScene(scene, monde);
    const objets = [];

    // Lecture du mood salle de boss : si on est dans la salle BOSS du biome,
    // l'ambiance s'assombrit (voile plus opaque, brume plus dense, feuilles
    // off, pluie forcée). Activé via le drapeau posé par GameScene.
    const estSalleBoss = !!scene.registry.get('salle_est_boss');

    // Étage courant (pour le gradient narratif des racines pourpres : étage 1
    // = présage rare, étage 2 = montée en intensité).
    const etage = scene.registry.get('etage_courant') ?? 1;

    // === BACKGROUND (du plus lointain au plus proche) ===

    // Couche 0 — nuages bas au ciel (drift lent, comble le haut du canvas)
    const nuages = poserNuagesBas(scene, dims, rng);
    // Mood boss : nuages plus sombres + plus denses
    if (estSalleBoss) {
        for (const n of nuages) n.setAlpha(0.95);
    }
    objets.push(...nuages);

    // Couche 0.5 — vol d'oiseaux lointains
    // Mood boss : pas d'oiseaux (la nature retient son souffle)
    if (!estSalleBoss) {
        objets.push(...poserOiseauxLointains(scene, dims, rng));
    }

    // Couche 1 (la plus lointaine) — montagnes brumeuses 3 rangées + brume
    objets.push(...poserMontagnesBrumeuses(scene, dims, rng, palette));

    // Couche 2 — VOILE D'HORIZON : en salle de boss il s'épaissit pour
    // assombrir tout le décor lointain (effet "le ciel se plombe").
    const voile = poserVoileHorizon(scene);
    if (estSalleBoss) for (const v of voile) v.setAlpha(1.5);
    objets.push(...voile);

    // Couche 3 — silhouettes ruines (formes opaques sombres pures)
    objets.push(...poserSilhouettesRuines(scene, dims, rng, palette));

    // Couche 4 — BRUME BASSE : plus dense en salle de boss
    const brumeBasse = poserBrumeBasse(scene, dims, rng, palette);
    if (estSalleBoss) for (const b of brumeBasse) b.setAlpha(b.alpha * 1.4);
    objets.push(...brumeBasse);

    // Couche 5 — forêt morte densité variable
    objets.push(...poserForetMorte(scene, dims, rng, palette));

    // Couche 6 — SOL-COLLINES LOINTAIN : transition entre décor et plateformes
    objets.push(...poserSolColllines(scene, dims, rng, palette));

    // Couche 7 — VESTIGES FUGACES (pas en salle de boss : la présence du passé
    // se tait quand le présent appelle au combat)
    if (!estSalleBoss) {
        objets.push(...poserVestigesFugaces(scene, dims, rng, palette));
    }

    // Couche 8 — RAYONS D'AUBE : filtration de lumière diagonale subtile,
    // mode ADD, fait respirer la lumière (alpha yoyo lent).
    objets.push(...poserRayonsAube(scene, dims, rng));

    // === MILIEU — Lucioles lointaines arrière-plan (passives) + brume au sol ===

    // 25 lucioles lointaines (scrollFactor 0.4, non réactives, drift sinusoïdal)
    // Désactivées en salle de boss (calme menaçant, pas de petites lumières).
    if (!estSalleBoss) {
        objets.push(...poserLuciolesLointaines(scene, dims, rng));
    }

    // Brume volumétrique au sol — 14 blobs réactifs au joueur + onde parry
    const { objets: brumeVolumetriqueObjets, blobs: blobsBrume } =
        poserBrumeVolumetriqueAuSol(scene, dims, rng, palette);
    if (estSalleBoss) {
        // En salle de boss, la brume au sol est nettement plus dense
        for (const b of blobsBrume) {
            b._brumeBlob.alphaBase = Math.min(1, b._brumeBlob.alphaBase * 1.6);
            b._brumeBlob.alphaCible = b._brumeBlob.alphaBase;
            b._brumeBlob.alphaCourant = b._brumeBlob.alphaBase;
            b.setAlpha(b._brumeBlob.alphaBase);
        }
    }
    objets.push(...brumeVolumetriqueObjets);
    enregistrerBrumeReactive(scene, blobsBrume);

    // === FOREGROUND (au-dessus des plateformes, sous les entités) ===
    // Le joueur passe DERRIÈRE ces couches → sensation "dans le tableau".

    // Bokeh foreground (formes très floutées en parallax x1.45)
    objets.push(...poserBokehForeground(scene, dims, rng));

    // Vrilles de lierre pourpre depuis le haut de l'écran (1-2)
    // Étage 2 : plus de vrilles (présage du Reflux qui monte)
    objets.push(...poserVrillesLierre(scene, dims, rng, palette));
    if (etage >= 2 && !estSalleBoss) {
        objets.push(...poserVrillesLierre(scene, dims, rng, palette));
    }

    // Feuilles mortes brun-orangé : désactivées en salle de boss
    let emetteurFeuilles = null;
    if (!estSalleBoss) {
        const feuillesObjets = poserFeuillesMortes(scene, dims, rng);
        objets.push(...feuillesObjets);
        emetteurFeuilles = feuillesObjets[0];
    }

    // Herbes folles au bord bas (réactives joueur + vent)
    const herbes = poserHerbesForeground(scene, dims, rng, palette);
    objets.push(...herbes);

    // 10 lucioles réactives au foreground (fuient le joueur)
    // Désactivées en salle de boss (atmosphère grave).
    if (!estSalleBoss) {
        const { objets: lucObjets, lucioles } = poserLuciolesReactives(scene, dims, rng);
        objets.push(...lucObjets);
        enregistrerInteractionsLucioles(scene, lucioles);
    }

    // Pluie fine occasionnelle (cycle météo) — sauf en salle de boss où on
    // la FORCE en continu pour aligner la météo sur l'enjeu dramatique.
    const pluieObjets = poserPluieFine(scene, dims, rng, { forcer: estSalleBoss });
    objets.push(...pluieObjets);

    // Interactions vivantes : herbes réactives + atterrissage + cycle vent
    enregistrerInteractionsRuinesBasses(scene, herbes, emetteurFeuilles);

    return objets;
}
