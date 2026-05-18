// CristauxGlaces — composeur parallax spécifique au biome (étages 5-6).
//
// Direction : "La Cité Divine sur la Glace" — Olympe cristalline. Le joueur
// sort des Halls Cendrés (cathédrale en flammes au sol) et entre dans une
// CITÉ MAJESTUEUSE bâtie sur des plateaux flottants de marbre gelé, reliés
// par des ponts cristallins. La cité est INTACTE, figée hors du temps —
// marbre lustré, temples grecs hellénistiques à l'horizon, habitants
// statufiés dans leur dernière pose. Au cœur, un ARBRE CRISTALLIN GÉANT
// (Yggdrasil glacé) dont les branches pulsent de mémoire violet (sève
// mnésique qui circule).
//
// Lumière : midi cristallin pur, blanc-cyan éblouissant. La cité capte le
// soleil divin haut, ombres tranchées. Bi-ton signature : cristaux mnésiques
// actifs violet-blanc (sacré) ↔ cristaux fossilisés argent-nacre.
//
// Préfiguration MINIMALE du Voile Inversé : le violet n'apparaît QUE sur les
// cristaux mnésiques (couleur sacrée des mémoires des Sources), aucune
// fissure violette dans le marbre divin. La corruption viendra en 7-8.
//
// 14+ couches du fond vers l'avant :
//   BG    branches géantes arbre   (sF 0.10, branches Yggdrasil depuis le haut + veines violet ADD)
//   BG    flocons en suspension    (sF 0.20, cendre figée qui dérive vers le bas)
//   BG    temples grecs lointains  (sF 0.15, 2 rangées hellénistiques bleu pâle, centre libre)
//   BG    arbre cristallin centre  (sF 0.15, tronc + premières branches + sève mnésique violet)
//   BG    voile horizon            (sF 0.0,  bleu glacé laiteux)
//   BG    silhouettes mnésiques    (sF 0.30, reliquaires, obélisques, statues, piliers)
//   BG    brume glacée 3 bandes    (sF 0.20, bandes horizontales bleu-violet)
//   BG    cristaux mnésiques pied  (sF 0.50, cristaux pulsants — gradient étage 5→6)
//   BG    sol-glace fendue         (sF 0.60, polyline craquelée + veines cristallines)
//   BG    silhouettes témoins      (sF 0.40, figures debout fossilisées, immobiles)
//   BG    rayons cristallins       (sF 0.70, ADD violet-blanc, respiration lente)
//   MID   flocons lointains        (sF 0.40, 25 unités passives qui dérivent vers le bas)
//   MID   brume cristalline sol    (sF 0.85, 14 blobs réactifs joueur+parry)
//   FG    bokeh cristaux           (sF 1.15-1.6, taches violet-bleu hors-focus)
//   FG    stalactites pendantes    (sF 1.15, pointes cristallines, sway très lent)
//   FG    givre/éclats sol         (sF 0.9-1.25, résonnent au passage joueur)
//   FG    esprits-flocons réactifs (sF 1.0, 10 unités fuient le joueur en latéral)
//   FG    tempête cristalline      (sF 0.0, viewport entier, cycle météo + boss force)
//
// Mood salle de boss : cristaux s'éteignent un par un, brume +60 %, tempête
// cristalline forcée, témoins désactivés (les Témoins ont déserté), flocons
// réactifs désactivés. Le silence absolu avant la dernière mémoire.

import { DEPTH, paletteCouranteScene } from '../PainterlyRenderer.js';
import { GAME_HEIGHT, GAME_WIDTH } from '../../config.js';

// Helpers de teinte (mêmes formules que les autres biomes)
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

// ============================================================
// COUCHE 1 — TEMPLES GRECS LOINTAINS (scrollFactor 0.15)
// ============================================================
//
// La "ligne d'horizon" de la cité divine est formée par des silhouettes de
// temples grecs hellénistiques (équivalent narratif des arches funéraires des
// Halls). Quatre types tirés aléatoirement : temple à péristyle, tholos
// rotonde, statue ailée colossale, stoa longue galerie. Silhouettes bleues
// pâles (vs noires des funéraires) — la cité est intacte, lumineuse,
// "perceptible" même à l'horizon.

function couleurSilhouetteTemple() {
    return 0x4a5a78; // bleu-gris pâle — la cité capte la lumière même à distance
}

function peindreTemplePeristyle(scene, x, ySol, hauteur, alpha, rng) {
    const g = scene.add.graphics();
    const w = hauteur * 1.6 + rng() * 30;
    const couleur = couleurSilhouetteTemple();
    const yTop = ySol - hauteur;

    g.fillStyle(couleur, alpha);
    // Stylobate (socle à 3 marches)
    g.fillRect(x - w / 2 - 4, ySol - 4, w + 8, 4);
    g.fillRect(x - w / 2 - 2, ySol - 8, w + 4, 4);
    g.fillRect(x - w / 2, ySol - 12, w, 4);

    // Colonnes (péristyle frontal — 6 colonnes)
    const nbColonnes = 6;
    const epColonne = w / 20;
    const espace = (w - nbColonnes * epColonne) / (nbColonnes - 1);
    const hauteurColonne = hauteur * 0.55;
    for (let c = 0; c < nbColonnes; c++) {
        const xC = x - w / 2 + c * (epColonne + espace);
        g.fillRect(xC, ySol - 12 - hauteurColonne, epColonne, hauteurColonne);
    }

    // Entablement (bande horizontale au-dessus des colonnes)
    g.fillRect(x - w / 2 - 2, ySol - 12 - hauteurColonne - 8, w + 4, 8);

    // Fronton triangulaire
    g.beginPath();
    g.moveTo(x - w / 2 - 4, ySol - 12 - hauteurColonne - 8);
    g.lineTo(x, yTop);
    g.lineTo(x + w / 2 + 4, ySol - 12 - hauteurColonne - 8);
    g.closePath();
    g.fillPath();

    return g;
}

function peindreTholos(scene, x, ySol, hauteur, alpha, rng) {
    const g = scene.add.graphics();
    const w = hauteur * 1.2 + rng() * 20;
    const couleur = couleurSilhouetteTemple();
    const yTop = ySol - hauteur;

    g.fillStyle(couleur, alpha);
    // Socle circulaire (ellipse plate)
    g.fillEllipse(x, ySol - 4, w + 16, 10);
    // Plateforme rectangle
    g.fillRect(x - w / 2, ySol - 12, w, 8);

    // Colonnes du tour (8 colonnes vues en silhouette — espacées en arc)
    const hauteurColonne = hauteur * 0.50;
    const nbColonnes = 8;
    for (let c = 0; c < nbColonnes; c++) {
        // Distribution courbée : les colonnes centrales sont plus rapprochées
        const t = (c - (nbColonnes - 1) / 2) / nbColonnes;
        const xC = x + t * w * Math.cos(Math.abs(t) * 1.2);
        const epColonne = 3 + rng() * 0.5;
        g.fillRect(xC - epColonne / 2, ySol - 12 - hauteurColonne, epColonne, hauteurColonne);
    }

    // Entablement circulaire (ellipse au-dessus des colonnes)
    g.fillEllipse(x, ySol - 12 - hauteurColonne - 4, w + 6, 8);

    // Coupole (demi-ellipse au sommet)
    g.fillEllipse(x, ySol - 12 - hauteurColonne - 8 - hauteur * 0.18, w * 0.85, hauteur * 0.36);

    return g;
}

function peindreStatueAilee(scene, x, ySol, hauteur, alpha, rng) {
    const g = scene.add.graphics();
    const w = 36 + rng() * 16;
    const yTop = ySol - hauteur;
    const couleur = couleurSilhouetteTemple();

    g.fillStyle(couleur, alpha);
    // Socle haut
    g.fillRect(x - w / 2, ySol - hauteur * 0.18, w, hauteur * 0.18);

    // Corps trapézoïdal (robe longue)
    g.beginPath();
    g.moveTo(x - w * 0.35, ySol - hauteur * 0.18);
    g.lineTo(x - w * 0.25, yTop + hauteur * 0.30);
    g.lineTo(x + w * 0.25, yTop + hauteur * 0.30);
    g.lineTo(x + w * 0.35, ySol - hauteur * 0.18);
    g.closePath();
    g.fillPath();

    // Tête
    g.fillCircle(x, yTop + hauteur * 0.22, w * 0.10);

    // Ailes déployées (deux triangles latéraux)
    g.beginPath();
    g.moveTo(x - w * 0.25, yTop + hauteur * 0.35);
    g.lineTo(x - w * 0.95, yTop + hauteur * 0.15);
    g.lineTo(x - w * 0.85, yTop + hauteur * 0.50);
    g.lineTo(x - w * 0.25, yTop + hauteur * 0.50);
    g.closePath();
    g.fillPath();

    g.beginPath();
    g.moveTo(x + w * 0.25, yTop + hauteur * 0.35);
    g.lineTo(x + w * 0.95, yTop + hauteur * 0.15);
    g.lineTo(x + w * 0.85, yTop + hauteur * 0.50);
    g.lineTo(x + w * 0.25, yTop + hauteur * 0.50);
    g.closePath();
    g.fillPath();

    return g;
}

function peindreStoa(scene, x, ySol, hauteur, alpha, rng) {
    const g = scene.add.graphics();
    const w = hauteur * 2.2 + rng() * 40;
    const couleur = couleurSilhouetteTemple();

    g.fillStyle(couleur, alpha);
    // Stylobate plat
    g.fillRect(x - w / 2, ySol - 6, w, 6);

    // Colonnes (longue galerie — 10-12 colonnes)
    const nbColonnes = 10 + Math.floor(rng() * 3);
    const epColonne = 3;
    const espace = (w - nbColonnes * epColonne) / (nbColonnes - 1);
    const hauteurColonne = hauteur * 0.65;
    for (let c = 0; c < nbColonnes; c++) {
        const xC = x - w / 2 + c * (epColonne + espace);
        g.fillRect(xC, ySol - 6 - hauteurColonne, epColonne, hauteurColonne);
    }

    // Entablement long
    g.fillRect(x - w / 2 - 2, ySol - 6 - hauteurColonne - 6, w + 4, 6);

    // Toit plat (légèrement débordant)
    g.fillRect(x - w / 2 - 4, ySol - 6 - hauteurColonne - 10, w + 8, 4);

    return g;
}

function poserTemplesGrecsLointains(scene, dims, rng, palette) {
    const objets = [];
    const ySol = GAME_HEIGHT - 60;
    const largeurEtendue = dims.largeur * 1.6;
    const decalageX = -dims.largeur * 0.3;

    // Refonte 5'.13 : moins d'éléments, beaucoup plus tangibles. Deux rangées
    // mais avec très peu de structures par rangée (3+3 vs 8+7 avant) et alpha
    // proche de 1 (0.92-0.95) pour vraies couleurs opaques au lieu de brouillard
    // gris. Le fond de cité doit montrer de VRAIS temples détaillés, pas une
    // skyline empilée illisible.
    const xCentre = dims.largeur / 2;
    const exclusionCentre = 320;

    const rangees = [
        // Rangée arrière : 3 grands temples très opaques (vs 8 silhouettes pâles)
        { nb: 3, hMin: 240, hMax: 320, alpha: 0.92, teinteShift: 0.05, yOffset: 4 },
        // Rangée avant : 3 temples encore plus grands, presque opaques complets
        { nb: 3, hMin: 320, hMax: 440, alpha: 0.95, teinteShift: 0.0,  yOffset: 14 }
    ];

    const types = [
        { fn: peindreTemplePeristyle, poids: 0.30 },
        { fn: peindreTholos,          poids: 0.25 },
        { fn: peindreStatueAilee,     poids: 0.20 },
        { fn: peindreStoa,            poids: 0.25 }
    ];

    for (const rangee of rangees) {
        const pas = largeurEtendue / rangee.nb;
        for (let i = 0; i < rangee.nb; i++) {
            let x = decalageX + pas * i + (rng() - 0.5) * pas * 0.3;
            // Évite le centre (réservé à l'arbre cristallin)
            if (Math.abs(x - xCentre) < exclusionCentre) {
                x = xCentre + (x < xCentre ? -exclusionCentre - 20 : exclusionCentre + 20);
            }
            const h = rangee.hMin + rng() * (rangee.hMax - rangee.hMin);
            // Tirage pondéré du type
            let choix = rng();
            let fnPeinte = types[types.length - 1].fn;
            let cumul = 0;
            for (const t of types) {
                cumul += t.poids;
                if (choix < cumul) { fnPeinte = t.fn; break; }
            }
            // L'alpha plus bas de la rangée arrière (0.45 vs 0.75) crée
            // suffisamment de perspective atmosphérique — pas besoin de tint
            // sur le Graphics.
            const a = fnPeinte(scene, x, ySol + rangee.yOffset, h, rangee.alpha, rng);
            a.setScrollFactor(0.15, 0);
            a.setDepth(DEPTH.SILHOUETTES - 2);
            objets.push(a);
        }
    }

    // Bande de brume cristalline haute entre les temples et le ciel
    // (atmospheric haze froid) — drift ultra-lent yoyo.
    const brume = scene.add.graphics();
    brume.fillStyle(0x4a6890, 0.22);
    for (let i = 0; i < 6; i++) {
        const xb = (largeurEtendue / 6) * i + decalageX + (rng() - 0.5) * 60;
        const yb = ySol - 170 - rng() * 40;
        const lb = 220 + rng() * 160;
        const hb = 26 + rng() * 16;
        brume.fillEllipse(xb, yb, lb, hb);
    }
    brume.setScrollFactor(0.15, 0);
    brume.setDepth(DEPTH.SILHOUETTES - 1);
    scene.tweens.add({
        targets: brume,
        x: '+=' + dims.largeur * 0.15,
        duration: 80000,
        ease: 'Linear',
        repeat: -1,
        yoyo: true
    });
    objets.push(brume);

    return objets;
}

// ============================================================
// COUCHE 1.5 — CITÉ MOYEN PLAN (scrollFactor 0.40)
// ============================================================
//
// Phase 5'.12 — pour que le joueur SENTE qu'il est dans une cité, pas juste
// devant une skyline lointaine. 3-4 structures monumentales par salle, plus
// proches (parallax 0.40, plus de mouvement avec la caméra), beaucoup plus
// détaillées que les silhouettes lointaines :
//   - Colonnes individuelles avec base + fût + chapiteau distincts
//   - Frontons avec triangle décoratif intérieur
//   - Multiples marches au socle
//   - Bleu-violet plus saturé (palette.brume + accent argent-nacre)
//
// Placement : structures réparties sur les côtés, jamais devant l'arbre
// central. Hauteur ~ 60 % de l'écran (vs ~ 30 % pour les temples lointains).

function couleurStructureMoyenPlan() {
    return 0x2a3a5a; // bleu profond — la cité s'assombrit en se rapprochant du joueur
}

// Phase 5'.16 — Helper cariatide : statue colonne humanoïde qui porte
// l'entablement. Signature temples grecs (Érechthéion).
function peindreCariatide(g, x, yBas, hauteur, couleur, couleurClair, couleurOmbre, alpha) {
    const w = hauteur * 0.16;
    const yHaut = yBas - hauteur;
    // Socle de la cariatide
    g.fillStyle(couleurOmbre, alpha);
    g.fillRect(x - w / 2 - 1, yBas - 4, w + 2, 4);
    // Robe longue trapézoïdale (silhouette féminine drapée)
    g.fillStyle(couleur, alpha);
    g.beginPath();
    g.moveTo(x - w / 2 - 1, yBas - 4);
    g.lineTo(x - w * 0.35, yBas - hauteur * 0.45);
    g.lineTo(x - w * 0.30, yHaut + hauteur * 0.25);
    g.lineTo(x + w * 0.30, yHaut + hauteur * 0.25);
    g.lineTo(x + w * 0.35, yBas - hauteur * 0.45);
    g.lineTo(x + w / 2 + 1, yBas - 4);
    g.closePath();
    g.fillPath();
    // Plis verticaux de la robe (3 lignes d'ombre)
    g.lineStyle(0.8, couleurOmbre, alpha * 0.85);
    for (let p = 0; p < 3; p++) {
        const xP = x - w * 0.30 + (p + 0.5) * (w * 0.60 / 3);
        g.beginPath();
        g.moveTo(xP, yBas - hauteur * 0.10);
        g.lineTo(xP, yBas - hauteur * 0.55);
        g.strokePath();
    }
    // Highlight vertical (face droite éclairée)
    g.fillStyle(couleurClair, alpha * 0.55);
    g.fillRect(x + w * 0.15, yBas - hauteur * 0.55, 1.5, hauteur * 0.40);
    // Torse (rectangle plus étroit)
    g.fillStyle(couleur, alpha);
    g.fillRect(x - w * 0.22, yHaut + hauteur * 0.12, w * 0.44, hauteur * 0.18);
    // Tête (ovale)
    g.fillStyle(couleur, alpha);
    g.fillEllipse(x, yHaut + hauteur * 0.08, w * 0.30, hauteur * 0.10);
    // Coiffure / diadème (bande au-dessus de la tête)
    g.fillStyle(couleurClair, alpha);
    g.fillRect(x - w * 0.22, yHaut + hauteur * 0.02, w * 0.44, 2);
    // Bras levés portant l'entablement (deux rectangles verticaux étirés)
    g.fillStyle(couleur, alpha);
    g.fillRect(x - w * 0.40, yHaut + hauteur * 0.10, 3, hauteur * 0.18);
    g.fillRect(x + w * 0.40 - 3, yHaut + hauteur * 0.10, 3, hauteur * 0.18);
    // Capital simple sur la tête (bloc carré, supporte l'architrave)
    g.fillStyle(couleurClair, alpha);
    g.fillRect(x - w / 2, yHaut, w, 4);
}

// Phase 5'.16 — Helper colonne corinthienne détaillée (ornements, marbre
// veiné, chapiteau à feuilles acanthe).
function peindreColonneDetaillee(g, xC, yColBas, hauteurColonne, epColonne, couleur, couleurClair, couleurOmbre, alpha, rng) {
    const yColHaut = yColBas - hauteurColonne;
    // Base double moulurée
    g.fillStyle(couleurOmbre, alpha);
    g.fillRect(xC - 2, yColBas - 4, epColonne + 4, 4);
    g.fillStyle(couleur, alpha);
    g.fillRect(xC - 1, yColBas - 7, epColonne + 2, 3);
    g.fillStyle(couleurClair, alpha);
    g.fillRect(xC, yColBas - 10, epColonne, 3);
    // Fût
    g.fillStyle(couleur, alpha);
    g.fillRect(xC, yColBas - hauteurColonne, epColonne, hauteurColonne - 10);
    // Cannelures multiples (5 stries)
    g.lineStyle(0.8, couleurOmbre, alpha * 0.85);
    for (let s = 1; s < 5; s++) {
        const xS = xC + (s / 5) * epColonne;
        g.beginPath();
        g.moveTo(xS, yColBas - hauteurColonne + 4);
        g.lineTo(xS, yColBas - 12);
        g.strokePath();
    }
    // Marbre veiné : 1-2 veines diagonales subtiles sur le fût
    g.lineStyle(0.6, couleurClair, alpha * 0.40);
    g.beginPath();
    g.moveTo(xC + epColonne * 0.2, yColBas - hauteurColonne * 0.75);
    g.lineTo(xC + epColonne * 0.85, yColBas - hauteurColonne * 0.55);
    g.lineTo(xC + epColonne * 0.4, yColBas - hauteurColonne * 0.30);
    g.strokePath();
    // Highlight vertical face droite
    g.fillStyle(couleurClair, alpha * 0.55);
    g.fillRect(xC + epColonne - 2, yColBas - hauteurColonne + 6, 2, hauteurColonne - 16);
    // Chapiteau corinthien à 3 niveaux + feuilles acanthe stylisées
    g.fillStyle(couleur, alpha);
    g.fillRect(xC - 2, yColHaut - 4, epColonne + 4, 4);
    g.fillStyle(couleurClair, alpha);
    g.fillRect(xC - 4, yColHaut - 9, epColonne + 8, 5);
    g.fillStyle(couleur, alpha);
    g.fillRect(xC - 3, yColHaut - 12, epColonne + 6, 3);
    // 2 volutes acanthe (petits cercles asymétriques aux coins)
    g.fillStyle(couleur, alpha);
    g.fillCircle(xC - 2, yColHaut - 7, 2);
    g.fillCircle(xC + epColonne + 2, yColHaut - 7, 2);
    // Feuille acanthe centrale (triangle inversé avec stries)
    g.fillStyle(couleurOmbre, alpha);
    g.beginPath();
    g.moveTo(xC + epColonne / 2, yColHaut - 4);
    g.lineTo(xC, yColHaut + 1);
    g.lineTo(xC + epColonne, yColHaut + 1);
    g.closePath();
    g.fillPath();
    g.lineStyle(0.5, couleurClair, alpha * 0.5);
    g.beginPath();
    g.moveTo(xC + epColonne / 2, yColHaut - 4);
    g.lineTo(xC + epColonne / 2, yColHaut + 1);
    g.strokePath();
}

function peindreTempleMonumental(scene, x, ySol, hauteur, alpha, rng) {
    const objets = [];
    const g = scene.add.graphics();
    const couleur = couleurStructureMoyenPlan();
    const couleurClair = teinterPlusClair(couleur, 0.18);
    const couleurOmbre = teinterPlusSombre(couleur, 0.20);
    const couleurProfond = teinterPlusSombre(couleur, 0.40);
    const w = hauteur * 1.4;
    const yTop = ySol - hauteur;

    // === ESCALIER MONUMENTAL (Phase 5'.16) : 7 marches profondes ===
    // Vrai escalier de temple grec, débordant largement de la façade.
    const nbMarches = 7;
    const hMarche = 4;
    const debordementMax = 24;
    for (let m = 0; m < nbMarches; m++) {
        const yM = ySol - m * hMarche;
        const debord = debordementMax * (1 - m / nbMarches);
        const wM = w + 12 + debord * 2;
        // Face de la marche (sombre — verticale)
        g.fillStyle(couleurProfond, alpha);
        g.fillRect(x - wM / 2, yM - hMarche, wM, hMarche);
        // Top de la marche (clair — éclairé par le haut)
        g.fillStyle(couleurClair, alpha);
        g.fillRect(x - wM / 2, yM - hMarche, wM, 1);
        // Ombre sous la marche (donne du volume)
        g.fillStyle(couleurOmbre, alpha * 0.75);
        g.fillRect(x - wM / 2 + 1, yM - 0.5, wM - 2, 0.8);
    }

    // === COLONNES + CARIATIDES (Phase 5'.16) ===
    // 8 supports : 2 cariatides au centre (positions 3 et 4) + 6 colonnes
    // détaillées. Signature temples Sources hybrides : culte + architecture.
    const nbSupports = 8;
    const hauteurColonne = hauteur * 0.58;
    const yColBas = ySol - nbMarches * hMarche - 4;
    const yColHaut = yColBas - hauteurColonne;
    const epColonne = 9 + rng() * 2;
    const espaceColonne = (w - nbSupports * epColonne) / (nbSupports - 1);

    for (let c = 0; c < nbSupports; c++) {
        const xC = x - w / 2 + c * (epColonne + espaceColonne);
        if (c === 3 || c === 4) {
            // Cariatide centrée
            peindreCariatide(g, xC + epColonne / 2, yColBas, hauteurColonne, couleur, couleurClair, couleurOmbre, alpha);
        } else {
            peindreColonneDetaillee(g, xC, yColBas, hauteurColonne, epColonne, couleur, couleurClair, couleurOmbre, alpha, rng);
        }
    }

    // === ENTABLEMENT TRÈS DÉTAILLÉ ===
    const yEnt = yColHaut - 8;
    // Architrave 3 lignes (signature classique)
    g.fillStyle(couleur, alpha);
    g.fillRect(x - w / 2 - 4, yEnt - 8, w + 8, 8);
    g.lineStyle(0.6, couleurClair, alpha * 0.7);
    g.beginPath();
    g.moveTo(x - w / 2 - 4, yEnt - 4);
    g.lineTo(x + w / 2 + 4, yEnt - 4);
    g.moveTo(x - w / 2 - 4, yEnt - 7);
    g.lineTo(x + w / 2 + 4, yEnt - 7);
    g.strokePath();

    // FRISE NARRATIVE (Phase 5'.16) — bande médiane avec mini-figurines en
    // bas-relief en succession continue (vs simples triglyphes avant)
    g.fillStyle(couleurClair, alpha);
    g.fillRect(x - w / 2 - 4, yEnt - 18, w + 8, 10);
    // Mini-procession : alternance figure dressée + ornement
    const yFrise = yEnt - 13;
    const nbElements = Math.floor((w + 8) / 14);
    for (let f = 0; f < nbElements; f++) {
        const xF = x - w / 2 - 4 + (f + 0.5) * ((w + 8) / nbElements);
        if (f % 3 === 0) {
            // Mini-figure debout (silhouette ovale + tête)
            g.fillStyle(couleurOmbre, alpha);
            g.fillEllipse(xF, yFrise, 3, 6);
            g.fillCircle(xF, yFrise - 4, 1.4);
        } else if (f % 3 === 1) {
            // Ornement losange (motif méandre)
            g.fillStyle(couleurOmbre, alpha);
            g.beginPath();
            g.moveTo(xF, yFrise - 3);
            g.lineTo(xF + 2.5, yFrise);
            g.lineTo(xF, yFrise + 3);
            g.lineTo(xF - 2.5, yFrise);
            g.closePath();
            g.fillPath();
        } else {
            // Triglyphe (3 traits verticaux serrés)
            g.fillStyle(couleurOmbre, alpha);
            g.fillRect(xF - 2, yFrise - 4, 1, 8);
            g.fillRect(xF, yFrise - 4, 1, 8);
            g.fillRect(xF + 2, yFrise - 4, 1, 8);
        }
    }
    // Reflet sur la frise (face droite éclairée)
    g.fillStyle(couleurClair, alpha * 0.4);
    g.fillRect(x - w / 2 - 4, yEnt - 18, w + 8, 1.5);

    // Corniche en débord avec moulures
    g.fillStyle(couleur, alpha);
    g.fillRect(x - w / 2 - 10, yEnt - 24, w + 20, 6);
    g.fillStyle(couleurClair, alpha);
    g.fillRect(x - w / 2 - 12, yEnt - 26, w + 24, 2);

    // === FRONTON TRIANGULAIRE ===
    const yFronton = yEnt - 26;
    g.fillStyle(couleur, alpha);
    g.beginPath();
    g.moveTo(x - w / 2 - 12, yFronton);
    g.lineTo(x, yTop + 4);
    g.lineTo(x + w / 2 + 12, yFronton);
    g.closePath();
    g.fillPath();

    // VITRAIL MNÉSIQUE central — grande ouverture cintrée au cœur du fronton
    // avec cristaux ADD violet visibles à travers (Phase 5'.16)
    const xVitrail = x;
    const yVitrail = yFronton - 12;
    const rVitrail = Math.min(14, (yFronton - yTop - 8) / 2);
    g.fillStyle(couleurProfond, alpha);
    g.fillCircle(xVitrail, yVitrail, rVitrail);
    // Croix interne (vitrail à 4 sections)
    g.lineStyle(1.2, couleur, alpha);
    g.beginPath();
    g.moveTo(xVitrail - rVitrail, yVitrail);
    g.lineTo(xVitrail + rVitrail, yVitrail);
    g.moveTo(xVitrail, yVitrail - rVitrail);
    g.lineTo(xVitrail, yVitrail + rVitrail);
    g.strokePath();
    g.lineStyle(0.6, couleurClair, alpha * 0.7);
    g.strokeCircle(xVitrail, yVitrail, rVitrail);

    // Bas-relief sculpté de chaque côté du vitrail (mini-figurines plus
    // grosses : divinité + adorateurs)
    g.fillStyle(couleurOmbre, alpha * 0.95);
    // Figurine assise gauche (divinité regardant le centre)
    g.fillEllipse(x - w * 0.20, yFronton - 7, 6, 9);
    g.fillCircle(x - w * 0.20, yFronton - 13, 2.2);
    // Figurine debout plus à gauche
    g.fillEllipse(x - w * 0.32, yFronton - 5, 4, 8);
    g.fillCircle(x - w * 0.32, yFronton - 11, 1.8);
    // Symétriques à droite
    g.fillEllipse(x + w * 0.20, yFronton - 7, 6, 9);
    g.fillCircle(x + w * 0.20, yFronton - 13, 2.2);
    g.fillEllipse(x + w * 0.32, yFronton - 5, 4, 8);
    g.fillCircle(x + w * 0.32, yFronton - 11, 1.8);
    // Reflets sur les figurines
    g.fillStyle(couleurClair, alpha * 0.55);
    g.fillEllipse(x - w * 0.19, yFronton - 8, 2, 6);
    g.fillEllipse(x + w * 0.21, yFronton - 8, 2, 6);

    // Acrotère central avec statuette + 2 acrotères d'angle
    g.fillStyle(couleur, alpha);
    g.fillCircle(x, yTop + 2, 5);
    g.fillRect(x - 1.5, yTop - 6, 3, 10);
    g.fillStyle(couleurClair, alpha * 0.7);
    g.fillCircle(x + 1.5, yTop + 1, 2);
    // Acrotères d'angle (plus petits)
    g.fillRect(x - w / 2 - 12, yFronton - 5, 4, 5);
    g.fillRect(x + w / 2 + 8, yFronton - 5, 4, 5);

    // === LUEUR ADD AU VITRAIL (cristaux mnésiques visibles) ===
    const vitrail = scene.add.graphics();
    vitrail.setBlendMode(Phaser.BlendModes.ADD);
    vitrail.fillStyle(0xb898e8, 0.55);
    vitrail.fillCircle(xVitrail, yVitrail, rVitrail * 0.7);
    vitrail.fillStyle(0xe0c8ff, 0.85);
    vitrail.fillCircle(xVitrail, yVitrail, rVitrail * 0.35);
    vitrail.fillStyle(0xffffff, 0.85);
    vitrail.fillCircle(xVitrail, yVitrail, rVitrail * 0.12);
    vitrail.setDepth(DEPTH.SILHOUETTES + 2);
    scene.tweens.add({
        targets: vitrail,
        alpha: { from: 0.55, to: 1.0 },
        duration: 3500 + rng() * 1500,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });
    objets.push(g);
    objets.push(vitrail);

    return objets;
}

function peindreStatueColossale(scene, x, ySol, hauteur, alpha, rng) {
    const g = scene.add.graphics();
    const couleur = couleurStructureMoyenPlan();
    const couleurClair = teinterPlusClair(couleur, 0.15);
    const couleurOmbre = teinterPlusSombre(couleur, 0.20);
    const w = hauteur * 0.35;
    const yTop = ySol - hauteur;

    // === SOCLE MASSIF (3 niveaux) ===
    const hSocle = hauteur * 0.18;
    g.fillStyle(couleur, alpha);
    g.fillRect(x - w * 0.95, ySol - hSocle * 0.4, w * 1.9, hSocle * 0.4);
    g.fillStyle(couleurClair, alpha);
    g.fillRect(x - w * 0.85, ySol - hSocle * 0.75, w * 1.7, hSocle * 0.35);
    g.fillStyle(couleur, alpha);
    g.fillRect(x - w * 0.75, ySol - hSocle, w * 1.5, hSocle * 0.25);

    // === CORPS (silhouette divine ample, robe longue) ===
    const yBaseCorps = ySol - hSocle;
    g.fillStyle(couleur, alpha);
    g.beginPath();
    g.moveTo(x - w * 0.65, yBaseCorps);
    g.lineTo(x - w * 0.45, yBaseCorps - hauteur * 0.30);
    g.lineTo(x - w * 0.35, yBaseCorps - hauteur * 0.55);
    g.lineTo(x - w * 0.30, yBaseCorps - hauteur * 0.70);
    g.lineTo(x + w * 0.30, yBaseCorps - hauteur * 0.70);
    g.lineTo(x + w * 0.35, yBaseCorps - hauteur * 0.55);
    g.lineTo(x + w * 0.45, yBaseCorps - hauteur * 0.30);
    g.lineTo(x + w * 0.65, yBaseCorps);
    g.closePath();
    g.fillPath();

    // Plis de la robe (lignes verticales d'ombre)
    g.lineStyle(1.5, couleurOmbre, alpha * 0.7);
    for (let p = 0; p < 5; p++) {
        const xP = x - w * 0.45 + p * w * 0.225;
        g.beginPath();
        g.moveTo(xP, yBaseCorps - hauteur * 0.05);
        g.lineTo(xP + (rng() - 0.5) * 3, yBaseCorps - hauteur * 0.55);
        g.strokePath();
    }

    // === BRAS PENDANTS (silhouettes de chaque côté) ===
    g.fillStyle(couleur, alpha);
    // Bras gauche tient un objet (lance / sceptre)
    g.beginPath();
    g.moveTo(x - w * 0.45, yBaseCorps - hauteur * 0.55);
    g.lineTo(x - w * 0.50, yBaseCorps - hauteur * 0.62);
    g.lineTo(x - w * 0.42, yBaseCorps - hauteur * 0.35);
    g.lineTo(x - w * 0.36, yBaseCorps - hauteur * 0.30);
    g.closePath();
    g.fillPath();
    // Sceptre dans la main gauche (longue ligne verticale)
    g.fillRect(x - w * 0.52, yBaseCorps - hauteur * 0.85, 3, hauteur * 0.50);
    g.fillStyle(couleurClair, alpha);
    g.fillCircle(x - w * 0.51, yBaseCorps - hauteur * 0.85, 5);

    // Bras droit pendant naturellement
    g.fillStyle(couleur, alpha);
    g.beginPath();
    g.moveTo(x + w * 0.45, yBaseCorps - hauteur * 0.55);
    g.lineTo(x + w * 0.50, yBaseCorps - hauteur * 0.40);
    g.lineTo(x + w * 0.42, yBaseCorps - hauteur * 0.30);
    g.lineTo(x + w * 0.36, yBaseCorps - hauteur * 0.55);
    g.closePath();
    g.fillPath();

    // === TÊTE ===
    const yTete = yBaseCorps - hauteur * 0.70;
    g.fillStyle(couleur, alpha);
    g.fillCircle(x, yTete - hauteur * 0.08, w * 0.20);
    // Casque / couronne (bande horizontale)
    g.fillStyle(couleurClair, alpha);
    g.fillRect(x - w * 0.22, yTete - hauteur * 0.12, w * 0.44, 4);
    // Trois pointes sur la couronne (signature divine)
    g.beginPath();
    g.moveTo(x - w * 0.18, yTete - hauteur * 0.12);
    g.lineTo(x - w * 0.14, yTete - hauteur * 0.17);
    g.lineTo(x - w * 0.10, yTete - hauteur * 0.12);
    g.moveTo(x - w * 0.04, yTete - hauteur * 0.12);
    g.lineTo(x, yTete - hauteur * 0.19);
    g.lineTo(x + w * 0.04, yTete - hauteur * 0.12);
    g.moveTo(x + w * 0.10, yTete - hauteur * 0.12);
    g.lineTo(x + w * 0.14, yTete - hauteur * 0.17);
    g.lineTo(x + w * 0.18, yTete - hauteur * 0.12);
    g.closePath();
    g.fillPath();

    // === GRANDES AILES DÉPLOYÉES (signature divine) ===
    // Aile gauche
    g.fillStyle(couleurOmbre, alpha * 0.85);
    g.beginPath();
    g.moveTo(x - w * 0.40, yBaseCorps - hauteur * 0.60);
    g.lineTo(x - w * 1.10, yBaseCorps - hauteur * 0.50);
    g.lineTo(x - w * 1.20, yBaseCorps - hauteur * 0.40);
    g.lineTo(x - w * 1.05, yBaseCorps - hauteur * 0.30);
    g.lineTo(x - w * 0.55, yBaseCorps - hauteur * 0.42);
    g.closePath();
    g.fillPath();
    // Plumes (lignes courbes intérieures)
    g.lineStyle(1, couleurOmbre, alpha);
    for (let p = 0; p < 4; p++) {
        g.beginPath();
        g.moveTo(x - w * 0.55 - p * w * 0.15, yBaseCorps - hauteur * 0.45);
        g.lineTo(x - w * 0.60 - p * w * 0.15, yBaseCorps - hauteur * 0.36);
        g.strokePath();
    }
    // Aile droite (miroir)
    g.fillStyle(couleurOmbre, alpha * 0.85);
    g.beginPath();
    g.moveTo(x + w * 0.40, yBaseCorps - hauteur * 0.60);
    g.lineTo(x + w * 1.10, yBaseCorps - hauteur * 0.50);
    g.lineTo(x + w * 1.20, yBaseCorps - hauteur * 0.40);
    g.lineTo(x + w * 1.05, yBaseCorps - hauteur * 0.30);
    g.lineTo(x + w * 0.55, yBaseCorps - hauteur * 0.42);
    g.closePath();
    g.fillPath();
    g.lineStyle(1, couleurOmbre, alpha);
    for (let p = 0; p < 4; p++) {
        g.beginPath();
        g.moveTo(x + w * 0.55 + p * w * 0.15, yBaseCorps - hauteur * 0.45);
        g.lineTo(x + w * 0.60 + p * w * 0.15, yBaseCorps - hauteur * 0.36);
        g.strokePath();
    }

    return g;
}

function peindrePortiqueMonumental(scene, x, ySol, hauteur, alpha, rng) {
    const g = scene.add.graphics();
    const couleur = couleurStructureMoyenPlan();
    const couleurClair = teinterPlusClair(couleur, 0.15);
    const couleurOmbre = teinterPlusSombre(couleur, 0.20);
    const w = hauteur * 1.8; // portique très large
    const yTop = ySol - hauteur;

    // === STYLOBATE 3 marches ===
    g.fillStyle(couleur, alpha);
    g.fillRect(x - w / 2 - 8, ySol - 5, w + 16, 5);
    g.fillStyle(couleurOmbre, alpha);
    g.fillRect(x - w / 2 - 6, ySol - 10, w + 12, 5);
    g.fillStyle(couleur, alpha);
    g.fillRect(x - w / 2 - 4, ySol - 15, w + 8, 5);

    // === 2 PAIRES de colonnes monumentales (4 colonnes total très grosses) ===
    const hauteurColonne = hauteur * 0.72;
    const yColBas = ySol - 15;
    const yColHaut = yColBas - hauteurColonne;
    const epColonne = 14 + rng() * 3;
    const xColonnes = [
        x - w * 0.42,
        x - w * 0.14,
        x + w * 0.14,
        x + w * 0.42
    ];

    for (const xC of xColonnes) {
        // Base double
        g.fillStyle(couleurOmbre, alpha);
        g.fillRect(xC - epColonne / 2 - 2, yColBas - 6, epColonne + 4, 6);
        g.fillStyle(couleur, alpha);
        g.fillRect(xC - epColonne / 2 - 1, yColBas - 10, epColonne + 2, 4);
        // Fût avec multiples cannelures
        g.fillStyle(couleur, alpha);
        g.fillRect(xC - epColonne / 2, yColBas - hauteurColonne + 8, epColonne, hauteurColonne - 18);
        g.lineStyle(1, couleurOmbre, alpha * 0.85);
        for (let s = 1; s < 5; s++) {
            const xS = xC - epColonne / 2 + (s / 5) * epColonne;
            g.beginPath();
            g.moveTo(xS, yColBas - hauteurColonne + 12);
            g.lineTo(xS, yColBas - 14);
            g.strokePath();
        }
        // Highlight vertical (face droite éclairée)
        g.fillStyle(couleurClair, alpha * 0.55);
        g.fillRect(xC + epColonne / 2 - 2, yColBas - hauteurColonne + 12, 2, hauteurColonne - 22);
        // Chapiteau ionique simplifié (volute)
        g.fillStyle(couleur, alpha);
        g.fillRect(xC - epColonne / 2 - 3, yColHaut - 4, epColonne + 6, 4);
        g.fillStyle(couleurClair, alpha);
        g.fillRect(xC - epColonne / 2 - 4, yColHaut - 8, epColonne + 8, 4);
        // Volutes (deux petits cercles)
        g.fillStyle(couleur, alpha);
        g.fillCircle(xC - epColonne / 2 - 2, yColHaut - 6, 3);
        g.fillCircle(xC + epColonne / 2 + 2, yColHaut - 6, 3);
    }

    // === ENTABLEMENT TRÈS LONG (signature portique) ===
    const yEnt = yColHaut - 12;
    // Architrave
    g.fillStyle(couleur, alpha);
    g.fillRect(x - w / 2 - 6, yEnt - 8, w + 12, 8);
    // Frise sculptée (bande plus claire avec motifs)
    g.fillStyle(couleurClair, alpha);
    g.fillRect(x - w / 2 - 6, yEnt - 17, w + 12, 9);
    // Motifs en relief (entrelacs simplifiés — losanges)
    g.fillStyle(couleurOmbre, alpha);
    const nbMotifs = Math.floor((w + 12) / 30);
    for (let m = 0; m < nbMotifs; m++) {
        const xM = x - w / 2 - 6 + (m + 0.5) * ((w + 12) / nbMotifs);
        const yM = yEnt - 12.5;
        // Losange
        g.beginPath();
        g.moveTo(xM, yM - 3);
        g.lineTo(xM + 4, yM);
        g.lineTo(xM, yM + 3);
        g.lineTo(xM - 4, yM);
        g.closePath();
        g.fillPath();
    }
    // Corniche large en débord
    g.fillStyle(couleur, alpha);
    g.fillRect(x - w / 2 - 12, yEnt - 24, w + 24, 7);
    g.fillStyle(couleurOmbre, alpha);
    g.fillRect(x - w / 2 - 10, yEnt - 26, w + 20, 2);

    // === TOIT BAS (pas de fronton — portique a un toit plat ou légèrement incliné) ===
    g.fillStyle(couleur, alpha);
    g.fillRect(x - w / 2 - 6, yEnt - 30, w + 12, 4);

    // Petit acrotère central (sceptre / urne)
    g.fillRect(x - 2, yEnt - 40, 4, 10);
    g.fillCircle(x, yEnt - 42, 5);

    return g;
}

function poserCiteMoyenPlan(scene, dims, rng, palette) {
    const objets = [];
    const ySol = GAME_HEIGHT - 40;
    const xCentre = dims.largeur / 2;
    const exclusionCentre = 360; // l'arbre prend le centre — large exclusion

    // Refonte 5'.13 :
    //   - Retiré peindreStatueColossale (sceptres verticaux moches devant les
    //     colonnes, manque de lisibilité)
    //   - 2 structures par salle MAX (vs 3) pour aérer le tableau
    //   - Opacité 0.96+ (vs 0.88-0.98) — vraies couleurs opaques
    //   - Ombre portée au sol pour ancrer chaque structure dans la cité
    const types = [
        { fn: peindreTempleMonumental,   poids: 0.55, hMin: 320, hMax: 420 },
        { fn: peindrePortiqueMonumental, poids: 0.45, hMin: 290, hMax: 380 }
    ];

    // 2 structures : une à gauche, une à droite — placement symétrique
    // mais avec jitter seedé pour variation
    const positions = [
        { x: 200 + rng() * 80 },
        { x: dims.largeur - 200 - rng() * 80 }
    ];

    for (const pos of positions) {
        if (Math.abs(pos.x - xCentre) < exclusionCentre) continue;
        // Tirage type pondéré
        let choix = rng();
        let typeChoisi = types[types.length - 1];
        let cumul = 0;
        for (const t of types) {
            cumul += t.poids;
            if (choix < cumul) { typeChoisi = t; break; }
        }
        const hauteur = typeChoisi.hMin + rng() * (typeChoisi.hMax - typeChoisi.hMin);
        const alpha = 0.96 + rng() * 0.03;

        // Ombre portée au sol (ancrage visuel — la structure projette une
        // ombre élargie devant elle, simule la lumière haute du midi divin)
        const ombre = scene.add.graphics();
        ombre.fillStyle(0x0a1224, 0.55);
        ombre.fillEllipse(pos.x, ySol + 4, hauteur * 1.3, 14);
        ombre.fillStyle(0x0a1224, 0.30);
        ombre.fillEllipse(pos.x, ySol + 4, hauteur * 1.7, 20);
        ombre.setScrollFactor(0.40, 0);
        ombre.setDepth(DEPTH.SILHOUETTES);
        objets.push(ombre);

        // peindreTempleMonumental retourne un tableau (graphics + vitrail
        // ADD), peindrePortiqueMonumental retourne un Graphics — on gère
        // les deux cas uniformément.
        const result = typeChoisi.fn(scene, pos.x, ySol, hauteur, alpha, rng);
        const partsArr = Array.isArray(result) ? result : [result];
        for (const part of partsArr) {
            part.setScrollFactor(0.40, 0);
            // Le vitrail (avec blend ADD) doit être au-dessus, sinon les
            // détails graphics + ombre portée + temple s'empilent normalement
            if (!part.depth || part.depth < DEPTH.SILHOUETTES + 1) {
                part.setDepth(DEPTH.SILHOUETTES + 1);
            }
            objets.push(part);
        }

        // Halo lumineux derrière chaque structure — RETIRÉ (5'.14)
        // Les halos ADD blancs derrière chaque temple créaient des "taches
        // lumineuses" qui se superposaient à l'arbre et à la skyline. Sans
        // halos, les structures se lisent comme de vrais bâtiments solides
        // posés sur le marbre.
    }

    return objets;
}

// ============================================================
// COUCHE 1' — ARBRE CRISTALLIN MAJESTUEUX (scrollFactor 0.15)
// ============================================================
//
// La vision phare du biome — Yggdrasil cristallin imposant au centre de la
// cité. Refonte massive Phase 5'.11 :
//   - Tronc plus large et plus haut, étendu jusqu'au haut de l'écran
//   - Écorce texturée : multi-facettes losanges + reliefs en bas-relief
//   - 8 grandes branches rayonnantes + sous-branches (vs 2 branches V)
//   - Grappes de cristaux mnésiques (orbes ADD violet) aux extrémités
//   - Racines complexes à la base (10 racines avec ramifications)
//   - Halo lumineux global cyan-violet (aura sacrée diffuse)
//   - Veines mnésiques internes qui pulsent en respiration géologique
//
// Couleurs cohérentes avec les branches sommets (couche 0).

const COULEUR_ARBRE = {
    // 8 tons du plus sombre au plus clair pour sculpter le volume (Phase 5'.15)
    noirBleute:    0x141c2c,   // noeuds noueux, creux profonds, contours fissures
    ombreProfonde: 0x3a4a68,   // ombres internes derrière noeuds
    ombre:         0x6a8aa8,   // ombre normale face cachée
    tronc:         0xa0b8d0,   // teinte de base intermédiaire (tons médians)
    troncClair:    0xc8d8f0,   // teinte claire (ancienne base)
    clair:         0xe8f4ff,   // face très éclairée
    reflet:        0xf8fcff,   // reflets vifs / facettes brillantes
    blanc:         0xffffff,   // highlights purs / scintillements

    seve:          0xb898e8,
    coeur:         0xe0c8ff,
    aura:          0x9080e0,
    feuille:       0xd8c0ff,
    noyau:         0x8060c8    // cœur des rosaces violet plus profond
};

// --- Helpers internes ---

function peindreFacetteEcorce(g, x, y, w, h, couleur, alpha) {
    // Petit losange cristallin sur l'écorce (4 sommets)
    g.fillStyle(couleur, alpha);
    g.beginPath();
    g.moveTo(x, y - h / 2);
    g.lineTo(x + w / 2, y);
    g.lineTo(x, y + h / 2);
    g.lineTo(x - w / 2, y);
    g.closePath();
    g.fillPath();
}

// Phase 5'.15 — Noeud noueux dans l'écorce (signature arbre ancien type
// Arbre Blanc de Gondor). Forme ovale sombre avec petit cœur plus clair
// (suggère un "œil" gravé par le temps dans le bois cristallin).
function peindreNoeudNoueux(g, x, y, taille, rng) {
    // Halo sombre externe (forme ovale légèrement asymétrique)
    g.fillStyle(COULEUR_ARBRE.noirBleute, 0.85);
    g.fillEllipse(x, y, taille * 1.3, taille);
    // Anneau intermédiaire ombre profonde
    g.fillStyle(COULEUR_ARBRE.ombreProfonde, 0.95);
    g.fillEllipse(x + (rng() - 0.5) * 1, y + (rng() - 0.5) * 1, taille * 0.95, taille * 0.7);
    // Cœur sombre
    g.fillStyle(COULEUR_ARBRE.noirBleute, 1.0);
    g.fillEllipse(x, y, taille * 0.55, taille * 0.4);
    // Petit reflet clair sur le bord supérieur du noeud (lumière tombe dessus)
    g.fillStyle(COULEUR_ARBRE.clair, 0.75);
    g.fillEllipse(x - taille * 0.15, y - taille * 0.25, taille * 0.45, taille * 0.15);
    // Petite ride autour (cercle concentrique d'ombre légère, suggère bois noueux)
    g.lineStyle(0.8, COULEUR_ARBRE.ombre, 0.55);
    g.strokeEllipse(x, y, taille * 1.6, taille * 1.2);
}

// Phase 5'.15 — Rosace cristalline ornementale gravée dans le tronc.
// Signature "arbre sacré" : grand cercle 18-25 px avec étoile à rayons
// cristallins. Inspiration : rosaces gothiques + sceaux runiques.
function peindreRosaceCristalline(scene, x, y, taille, rng) {
    const objets = [];
    const g = scene.add.graphics();

    // Cercle externe (couronne, fond sombre)
    g.fillStyle(COULEUR_ARBRE.ombreProfonde, 0.95);
    g.fillCircle(x, y, taille);
    // Anneau plus clair
    g.fillStyle(COULEUR_ARBRE.ombre, 0.85);
    g.fillCircle(x, y, taille * 0.85);
    // Fond intérieur sombre
    g.fillStyle(COULEUR_ARBRE.noirBleute, 1.0);
    g.fillCircle(x, y, taille * 0.7);

    // Étoile à 8 rayons cristallins (croix + diagonale)
    g.fillStyle(COULEUR_ARBRE.coeur, 0.92);
    for (let r = 0; r < 8; r++) {
        const angle = (r / 8) * Math.PI * 2;
        const xR = x + Math.cos(angle) * taille * 0.65;
        const yR = y + Math.sin(angle) * taille * 0.65;
        // Petit losange à chaque pointe
        g.beginPath();
        g.moveTo(x + Math.cos(angle) * taille * 0.35, y + Math.sin(angle) * taille * 0.35);
        g.lineTo(xR + Math.cos(angle + Math.PI / 2) * 1.5, yR + Math.sin(angle + Math.PI / 2) * 1.5);
        g.lineTo(x + Math.cos(angle) * taille * 0.78, y + Math.sin(angle) * taille * 0.78);
        g.lineTo(xR + Math.cos(angle - Math.PI / 2) * 1.5, yR + Math.sin(angle - Math.PI / 2) * 1.5);
        g.closePath();
        g.fillPath();
    }
    g.setScrollFactor(0.15, 0);
    g.setDepth(DEPTH.SILHOUETTES);
    objets.push(g);

    // Cœur ADD violet pulsant au centre
    const coeur = scene.add.graphics();
    coeur.setBlendMode(Phaser.BlendModes.ADD);
    coeur.fillStyle(COULEUR_ARBRE.seve, 0.65);
    coeur.fillCircle(x, y, taille * 0.45);
    coeur.fillStyle(COULEUR_ARBRE.coeur, 0.85);
    coeur.fillCircle(x, y, taille * 0.25);
    coeur.fillStyle(COULEUR_ARBRE.blanc, 0.95);
    coeur.fillCircle(x, y, taille * 0.10);
    coeur.setScrollFactor(0.15, 0);
    coeur.setDepth(DEPTH.SILHOUETTES + 1);
    objets.push(coeur);
    scene.tweens.add({
        targets: coeur,
        alpha: { from: 0.55, to: 1.0 },
        scale: { from: 0.92, to: 1.08 },
        duration: 2800 + rng() * 1400,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });

    return objets;
}

// Phase 5'.15 — Scintillement sporadique : petit éclat blanc ADD qui
// apparaît, brille, et disparaît cycliquement. Décalages aléatoires pour
// que l'arbre semble vivant et scintillant comme un cristal naturel.
function peindreScintillement(scene, x, y, taille, rng) {
    const g = scene.add.graphics();
    g.setBlendMode(Phaser.BlendModes.ADD);
    // Étoile 4 branches
    g.fillStyle(COULEUR_ARBRE.blanc, 1.0);
    g.fillCircle(x, y, taille * 0.4);
    g.lineStyle(taille * 0.25, COULEUR_ARBRE.blanc, 0.95);
    g.beginPath();
    g.moveTo(x - taille, y);
    g.lineTo(x + taille, y);
    g.moveTo(x, y - taille);
    g.lineTo(x, y + taille);
    g.strokePath();
    // Halo doux
    g.fillStyle(COULEUR_ARBRE.reflet, 0.40);
    g.fillCircle(x, y, taille * 1.2);

    g.setScrollFactor(0.15, 0);
    g.setDepth(DEPTH.SILHOUETTES + 1);
    g.setAlpha(0);

    // Cycle aléatoire : invisible → brillant → invisible → pause longue
    const delaiInitial = rng() * 4000;
    const lancerCycle = () => {
        scene.tweens.add({
            targets: g,
            alpha: { from: 0, to: 1 },
            duration: 300,
            ease: 'Sine.Out',
            yoyo: true,
            hold: 200,
            onComplete: () => {
                scene.time.delayedCall(2500 + Math.random() * 4000, lancerCycle);
            }
        });
    };
    scene.time.delayedCall(delaiInitial, lancerCycle);

    return [g];
}

function peindreGrappeCristaux(scene, x, y, tailleBase, rng) {
    // Phase 5'.15 — Grappe DENSE de 12-18 cristaux mnésiques pendants ADD
    // aux extrémités de branches (vs 5-8 avant). Variation de tailles, halo
    // global de la grappe, mini-branchettes qui portent les cristaux.
    const objets = [];

    // === MINI-BRANCHETTES (qui portent les cristaux comme des feuilles) ===
    const branchettes = scene.add.graphics();
    const nbBranchettes = 6 + Math.floor(rng() * 4);
    for (let b = 0; b < nbBranchettes; b++) {
        const angle = (b / nbBranchettes) * Math.PI - Math.PI / 2 + (rng() - 0.5) * 0.5;
        const longueur = tailleBase * (0.5 + rng() * 0.6);
        const x2 = x + Math.cos(angle) * longueur;
        const y2 = y + Math.sin(angle) * longueur * 0.85 + tailleBase * 0.15;
        // Trait fin teinté tronc
        branchettes.lineStyle(1.5, COULEUR_ARBRE.tronc, 0.85);
        branchettes.beginPath();
        branchettes.moveTo(x, y);
        branchettes.lineTo(x2, y2);
        branchettes.strokePath();
        // Reflet
        branchettes.lineStyle(0.6, COULEUR_ARBRE.clair, 0.65);
        branchettes.beginPath();
        branchettes.moveTo(x, y);
        branchettes.lineTo(x2, y2);
        branchettes.strokePath();
    }
    branchettes.setScrollFactor(0.15, 0);
    branchettes.setDepth(DEPTH.SILHOUETTES - 1);
    objets.push(branchettes);

    // === HALO GLOBAL DE LA GRAPPE (donne du volume à l'ensemble) ===
    const haloGrappe = scene.add.graphics();
    haloGrappe.setBlendMode(Phaser.BlendModes.ADD);
    haloGrappe.fillStyle(COULEUR_ARBRE.aura, 0.18);
    haloGrappe.fillEllipse(x, y + tailleBase * 0.25, tailleBase * 2.6, tailleBase * 2.0);
    haloGrappe.fillStyle(COULEUR_ARBRE.seve, 0.22);
    haloGrappe.fillEllipse(x, y + tailleBase * 0.25, tailleBase * 1.8, tailleBase * 1.4);
    haloGrappe.setScrollFactor(0.15, 0);
    haloGrappe.setDepth(DEPTH.SILHOUETTES - 1);
    objets.push(haloGrappe);

    // === CRISTAUX (12-18) ===
    const g = scene.add.graphics();
    g.setBlendMode(Phaser.BlendModes.ADD);
    const nbCristaux = 12 + Math.floor(rng() * 7);
    for (let i = 0; i < nbCristaux; i++) {
        // Distribution sphérique avec tendance vers le bas (gravité)
        const u = rng();
        const v = rng();
        const angle = u * Math.PI * 2;
        const r = v * tailleBase * 1.1;
        const cx = x + Math.cos(angle) * r;
        const cy = y + Math.sin(angle) * r * 0.75 + tailleBase * 0.30;
        const taille = 1.5 + rng() * 3;

        // Halo violet doux
        g.fillStyle(COULEUR_ARBRE.seve, 0.45);
        g.fillCircle(cx, cy, taille * 2.5);
        // Cœur cristallin (losange pendant)
        g.fillStyle(COULEUR_ARBRE.coeur, 0.88);
        g.beginPath();
        g.moveTo(cx, cy - taille * 1.1);
        g.lineTo(cx + taille * 0.6, cy);
        g.lineTo(cx, cy + taille * 1.4);
        g.lineTo(cx - taille * 0.6, cy);
        g.closePath();
        g.fillPath();
        // Éclat blanc central
        g.fillStyle(COULEUR_ARBRE.blanc, 0.92);
        g.fillCircle(cx - taille * 0.15, cy - taille * 0.3, taille * 0.35);
        // Petit point clair vif sur le bord (effet cristal réfléchissant)
        g.fillStyle(COULEUR_ARBRE.blanc, 0.75);
        g.fillCircle(cx - taille * 0.3, cy - taille * 0.4, taille * 0.18);
    }

    g.setScrollFactor(0.15, 0);
    g.setDepth(DEPTH.SILHOUETTES);
    objets.push(g);

    // Pulse géologique
    scene.tweens.add({
        targets: g,
        alpha: { from: 0.55, to: 1.0 },
        duration: 3000 + rng() * 2500,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });
    scene.tweens.add({
        targets: haloGrappe,
        alpha: { from: 0.40, to: 1.0 },
        duration: 4500 + rng() * 2000,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });

    return objets;
}

function peindreBrancheArbre(scene, xDepart, yDepart, xBout, yBout, epBase, epBout, rng, depth) {
    // Une branche : quadrilatère effilé avec face éclairée + face ombrée +
    // stries + veine mnésique ADD le long.
    const objets = [];
    const g = scene.add.graphics();

    const dx = xBout - xDepart;
    const dy = yBout - yDepart;
    const angle = Math.atan2(dy, dx);
    const perpX = -Math.sin(angle);
    const perpY = Math.cos(angle);

    // Corps principal
    const x1G = xDepart + perpX * epBase / 2;
    const y1G = yDepart + perpY * epBase / 2;
    const x1D = xDepart - perpX * epBase / 2;
    const y1D = yDepart - perpY * epBase / 2;
    const x2G = xBout + perpX * epBout / 2;
    const y2G = yBout + perpY * epBout / 2;
    const x2D = xBout - perpX * epBout / 2;
    const y2D = yBout - perpY * epBout / 2;

    g.fillStyle(COULEUR_ARBRE.tronc, 0.92);
    g.beginPath();
    g.moveTo(x1G, y1G);
    g.lineTo(x2G, y2G);
    g.lineTo(x2D, y2D);
    g.lineTo(x1D, y1D);
    g.closePath();
    g.fillPath();

    // Face éclairée (lumière du haut — donc le côté supérieur de la branche)
    // perpY < 0 = côté haut. On éclaire le côté avec perpY négatif.
    const cotePerpY = perpY > 0 ? -1 : 1;
    g.fillStyle(COULEUR_ARBRE.clair, 0.55);
    g.beginPath();
    g.moveTo(xDepart, yDepart);
    g.lineTo(xBout, yBout);
    if (cotePerpY < 0) {
        g.lineTo(x2G, y2G);
        g.lineTo(x1G, y1G);
    } else {
        g.lineTo(x2D, y2D);
        g.lineTo(x1D, y1D);
    }
    g.closePath();
    g.fillPath();

    // Stries cristallines longitudinales (2-3)
    g.lineStyle(1, COULEUR_ARBRE.ombre, 0.40);
    for (let s = 0; s < 3; s++) {
        const t1 = 0.15 + s * 0.25;
        const t2 = 0.35 + s * 0.25;
        g.beginPath();
        g.moveTo(xDepart + dx * t1 + (rng() - 0.5) * 3, yDepart + dy * t1);
        g.lineTo(xDepart + dx * t2 + (rng() - 0.5) * 3, yDepart + dy * t2);
        g.strokePath();
    }

    // Pointe cristalline au bout
    g.fillStyle(COULEUR_ARBRE.reflet, 0.80);
    const longueurPointe = 10;
    g.beginPath();
    g.moveTo(xBout, yBout);
    g.lineTo(xBout + perpX * (epBout / 2 + 1), yBout + perpY * (epBout / 2 + 1));
    g.lineTo(xBout + Math.cos(angle) * longueurPointe, yBout + Math.sin(angle) * longueurPointe);
    g.lineTo(xBout - perpX * (epBout / 2 + 1), yBout - perpY * (epBout / 2 + 1));
    g.closePath();
    g.fillPath();

    g.setScrollFactor(0.15, 0);
    g.setDepth(depth);
    objets.push(g);

    // Veine mnésique ADD le long de la branche
    const veine = scene.add.graphics();
    veine.setBlendMode(Phaser.BlendModes.ADD);
    veine.lineStyle(3, COULEUR_ARBRE.seve, 0.22);
    veine.beginPath();
    veine.moveTo(xDepart, yDepart);
    veine.lineTo(xBout, yBout);
    veine.strokePath();
    veine.lineStyle(1.2, COULEUR_ARBRE.coeur, 0.65);
    veine.beginPath();
    veine.moveTo(xDepart, yDepart);
    veine.lineTo(xBout, yBout);
    veine.strokePath();
    // Éclat brillant au bout (cristal final)
    veine.fillStyle(COULEUR_ARBRE.coeur, 0.85);
    veine.fillCircle(xBout, yBout, 4);
    veine.fillStyle(0xffffff, 0.85);
    veine.fillCircle(xBout, yBout, 1.5);

    veine.setScrollFactor(0.15, 0);
    veine.setDepth(depth + 1);
    objets.push(veine);

    // Pulse propre à chaque branche
    scene.tweens.add({
        targets: veine,
        alpha: { from: 0.45, to: 1.0 },
        duration: 3500 + rng() * 2500,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });

    return objets;
}

function peindreRacineArbre(scene, xDepart, ySol, longueur, direction, rng) {
    // Une racine : polyline en zigzag qui plonge dans le sol avec 1-2
    // ramifications latérales.
    const objets = [];
    const g = scene.add.graphics();

    const angle = direction * (0.3 + rng() * 0.5); // direction +1 ou -1 (gauche/droite)
    const dx = Math.sin(angle) * longueur;
    const dy = longueur * (0.7 + rng() * 0.4);

    // Corps principal (3 segments)
    g.fillStyle(COULEUR_ARBRE.tronc, 0.85);
    const epaisseur = 4 + rng() * 4;
    const segs = 3;
    const points = [];
    for (let i = 0; i <= segs; i++) {
        const t = i / segs;
        const baseX = xDepart + dx * t;
        const baseY = ySol + dy * t;
        const zigzagX = baseX + (rng() - 0.5) * 6;
        const epLocal = epaisseur * (1 - t * 0.7);
        points.push({ x: zigzagX, y: baseY, ep: epLocal });
    }
    // Construire un polygone effilé
    g.beginPath();
    for (let i = 0; i < points.length; i++) {
        const p = points[i];
        if (i === 0) g.moveTo(p.x - p.ep / 2, p.y);
        else g.lineTo(p.x - p.ep / 2, p.y);
    }
    for (let i = points.length - 1; i >= 0; i--) {
        const p = points[i];
        g.lineTo(p.x + p.ep / 2, p.y);
    }
    g.closePath();
    g.fillPath();

    // Ramification latérale (1-2) sortant du milieu
    if (rng() < 0.7) {
        const idxBase = 1;
        const pBase = points[idxBase];
        const dxR = direction * (20 + rng() * 15);
        const dyR = 10 + rng() * 12;
        g.fillStyle(COULEUR_ARBRE.ombre, 0.75);
        const epRam = pBase.ep * 0.6;
        g.beginPath();
        g.moveTo(pBase.x - epRam / 2, pBase.y);
        g.lineTo(pBase.x + dxR - epRam / 4, pBase.y + dyR);
        g.lineTo(pBase.x + dxR + epRam / 4, pBase.y + dyR);
        g.lineTo(pBase.x + epRam / 2, pBase.y);
        g.closePath();
        g.fillPath();
    }

    g.setScrollFactor(0.15, 0);
    g.setDepth(DEPTH.SILHOUETTES - 1);
    objets.push(g);

    return objets;
}

function poserArbreCristallinCentre(scene, dims, rng, palette) {
    const objets = [];
    const xCentre = dims.largeur / 2;
    const ySol = GAME_HEIGHT - 60;
    const etage = scene.registry.get('etage_courant') ?? 5;

    // Progression d'ascension : étage 5 = imposant, étage 6 = plus grand
    // (la canopée du sommet sera traitée en 5'.14 pour la salle boss).
    const facteurEtage = etage <= 5 ? 1.0 : 1.15;
    const hauteurTronc = 480 * facteurEtage; // dépasse vers le haut
    const largeurBase = 280 * facteurEtage;
    const largeurMid = 180 * facteurEtage;
    const largeurHaut = 95 * facteurEtage;
    const yMid = ySol - hauteurTronc * 0.45;
    const yHaut = ySol - hauteurTronc;

    // === HALO LUMINEUX GLOBAL — RÉDUIT À MINIMUM (5'.14) ===
    // L'ancien halo (4 couches concentriques + cœur) saturait le ciel
    // derrière l'arbre d'un brouillard cyan-violet qui floutait tout.
    // Conservation d'une simple lueur très subtile pour ne pas perdre
    // l'aura sacrée mais sans brouiller le ciel.
    const halo = scene.add.graphics();
    halo.setBlendMode(Phaser.BlendModes.ADD);
    halo.fillStyle(COULEUR_ARBRE.aura, 0.05);
    halo.fillEllipse(xCentre, ySol - hauteurTronc * 0.55, largeurBase * 0.85, hauteurTronc * 0.65);
    halo.setScrollFactor(0.15, 0);
    halo.setDepth(DEPTH.SILHOUETTES - 3);
    objets.push(halo);

    scene.tweens.add({
        targets: halo,
        alpha: { from: 0.55, to: 1.0 },
        duration: 5500 + rng() * 1500,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });

    // === TRONC PRINCIPAL ===
    const g = scene.add.graphics();
    g.fillStyle(COULEUR_ARBRE.tronc, 0.92);
    g.beginPath();
    g.moveTo(xCentre - largeurBase / 2, ySol);
    // Courbe gauche avec irrégularité
    g.lineTo(xCentre - largeurMid / 2 - 6, yMid);
    g.lineTo(xCentre - largeurHaut / 2 - 2, yHaut + 40);
    g.lineTo(xCentre - largeurHaut / 2, yHaut);
    g.lineTo(xCentre + largeurHaut / 2, yHaut);
    g.lineTo(xCentre + largeurHaut / 2 + 2, yHaut + 40);
    g.lineTo(xCentre + largeurMid / 2 + 6, yMid);
    g.lineTo(xCentre + largeurBase / 2, ySol);
    g.closePath();
    g.fillPath();

    // === FACE OMBRÉE (gauche) ===
    g.fillStyle(COULEUR_ARBRE.ombre, 0.45);
    g.beginPath();
    g.moveTo(xCentre - largeurBase / 2, ySol);
    g.lineTo(xCentre - largeurMid / 2 - 6, yMid);
    g.lineTo(xCentre - largeurHaut / 2 - 2, yHaut + 40);
    g.lineTo(xCentre - largeurHaut / 2, yHaut);
    g.lineTo(xCentre - largeurHaut / 5, yHaut);
    g.lineTo(xCentre - largeurMid / 4, yMid);
    g.lineTo(xCentre - largeurBase / 5, ySol);
    g.closePath();
    g.fillPath();

    // === FACE ÉCLAIRÉE (droite) ===
    g.fillStyle(COULEUR_ARBRE.clair, 0.55);
    g.beginPath();
    g.moveTo(xCentre + largeurBase / 5, ySol);
    g.lineTo(xCentre + largeurMid / 4, yMid);
    g.lineTo(xCentre + largeurHaut / 5, yHaut);
    g.lineTo(xCentre + largeurHaut / 2 - 2, yHaut);
    g.lineTo(xCentre + largeurHaut / 2 + 2, yHaut + 40);
    g.lineTo(xCentre + largeurMid / 2 + 4, yMid);
    g.lineTo(xCentre + largeurBase / 2 - 6, ySol);
    g.closePath();
    g.fillPath();

    // === ÉCORCE TEXTURÉE : facettes cristallines + multi-tons (Phase 5'.15) ===
    // 60 facettes losanges sur 5 tons de couleur (vs 36 sur 2 tons avant)
    // pour vraiment sculpter le volume comme un cristal naturel
    const nbFacettes = 60;
    const tonsClair = [COULEUR_ARBRE.clair, COULEUR_ARBRE.reflet, COULEUR_ARBRE.blanc];
    const tonsOmbre = [COULEUR_ARBRE.ombre, COULEUR_ARBRE.ombreProfonde, COULEUR_ARBRE.tronc];
    for (let i = 0; i < nbFacettes; i++) {
        const tH = rng();
        let largeurLocale;
        if (tH < 0.45) {
            const tt = tH / 0.45;
            largeurLocale = largeurBase * (1 - tt) + largeurMid * tt;
        } else {
            const tt = (tH - 0.45) / 0.55;
            largeurLocale = largeurMid * (1 - tt) + largeurHaut * tt;
        }
        const y = ySol - hauteurTronc * tH;
        const xOffset = (rng() - 0.5) * largeurLocale * 0.85;
        const x = xCentre + xOffset;
        const facetteW = 3 + rng() * 14;
        const facetteH = 5 + rng() * 20;
        // Tirage couleur : tons clairs si côté droit, ombre si côté gauche
        const pool = xOffset < 0 ? tonsOmbre : tonsClair;
        const couleur = pool[Math.floor(rng() * pool.length)];
        const alpha = 0.20 + rng() * 0.25;
        peindreFacetteEcorce(g, x, y, facetteW, facetteH, couleur, alpha);
    }

    // === RELIEFS BAS-RELIEF : 12 stries longitudinales (vs 8) avec multi-tons ===
    for (let s = 0; s < 12; s++) {
        const offset = -largeurBase / 2 + (s + 1) * largeurBase / 13;
        const tBas = offset;
        const tHaut = offset * (largeurHaut / largeurBase);
        // Ligne ombre profonde (creux)
        g.lineStyle(2, COULEUR_ARBRE.ombreProfonde, 0.45);
        g.beginPath();
        g.moveTo(xCentre + tBas, ySol);
        g.lineTo(xCentre + (tBas + tHaut) * 0.5, yMid);
        g.lineTo(xCentre + tHaut, yHaut);
        g.strokePath();
        // Ligne ombre moyenne
        g.lineStyle(1, COULEUR_ARBRE.ombre, 0.65);
        g.beginPath();
        g.moveTo(xCentre + tBas + 0.5, ySol);
        g.lineTo(xCentre + (tBas + tHaut) * 0.5 + 0.5, yMid);
        g.lineTo(xCentre + tHaut + 0.5, yHaut);
        g.strokePath();
        // Ligne highlight (relief)
        g.lineStyle(0.8, COULEUR_ARBRE.reflet, 0.70);
        g.beginPath();
        g.moveTo(xCentre + tBas + 2, ySol);
        g.lineTo(xCentre + (tBas + tHaut) * 0.5 + 2, yMid);
        g.lineTo(xCentre + tHaut + 2, yHaut);
        g.strokePath();
        // Ligne reflet pur (sommets de cannelures)
        g.lineStyle(0.4, COULEUR_ARBRE.blanc, 0.55);
        g.beginPath();
        g.moveTo(xCentre + tBas + 2.6, ySol);
        g.lineTo(xCentre + (tBas + tHaut) * 0.5 + 2.6, yMid);
        g.lineTo(xCentre + tHaut + 2.6, yHaut);
        g.strokePath();
    }

    // === NOEUDS NOUEUX (signature arbre ancien type Arbre Blanc de Gondor) ===
    // 7-9 noeuds répartis sur le tronc à différentes hauteurs et positions.
    const nbNoeuds = 7 + Math.floor(rng() * 3);
    for (let n = 0; n < nbNoeuds; n++) {
        const tH = 0.15 + rng() * 0.70;
        let largeurLocale;
        if (tH < 0.45) {
            const tt = tH / 0.45;
            largeurLocale = largeurBase * (1 - tt) + largeurMid * tt;
        } else {
            const tt = (tH - 0.45) / 0.55;
            largeurLocale = largeurMid * (1 - tt) + largeurHaut * tt;
        }
        const xOffset = (rng() - 0.5) * largeurLocale * 0.65;
        const xN = xCentre + xOffset;
        const yN = ySol - hauteurTronc * tH;
        const taille = 5 + rng() * 6;
        peindreNoeudNoueux(g, xN, yN, taille, rng);
    }

    g.setScrollFactor(0.15, 0);
    g.setDepth(DEPTH.SILHOUETTES - 1);
    objets.push(g);

    // === ROSACES CRISTALLINES SUR LE TRONC (signature arbre sacré) ===
    // 3 grandes rosaces ornementales gravées dans l'écorce — comme des
    // "yeux" sacrés à différentes hauteurs. Cercles 14-22 px avec étoile à
    // 8 rayons cristallins + cœur ADD violet pulsant.
    const yRosaces = [0.30, 0.50, 0.70];
    for (const yT of yRosaces) {
        const taille = 14 + rng() * 8;
        const xR = xCentre + (rng() - 0.5) * 15;
        const yR = ySol - hauteurTronc * yT;
        objets.push(...peindreRosaceCristalline(scene, xR, yR, taille, rng));
    }

    // === VEINES MNÉSIQUES INTERNES (ADD, pulse géologique) ===
    const veines = scene.add.graphics();
    veines.setBlendMode(Phaser.BlendModes.ADD);
    // 5 grandes veines principales qui montent en sinuosité (vs 3 avant)
    for (let v = 0; v < 5; v++) {
        const xDepart = xCentre + (v - 2) * 30;
        const sinuosite = 18 + rng() * 12;
        // Halo flou
        veines.lineStyle(5, COULEUR_ARBRE.seve, 0.20);
        veines.beginPath();
        veines.moveTo(xDepart, ySol);
        veines.lineTo(xDepart + (rng() - 0.5) * sinuosite, yMid);
        veines.lineTo(xDepart * 0.5 + xCentre * 0.5 + (rng() - 0.5) * sinuosite, yHaut);
        veines.strokePath();
        // Cœur vif
        veines.lineStyle(1.8, COULEUR_ARBRE.coeur, 0.70);
        veines.beginPath();
        veines.moveTo(xDepart, ySol);
        veines.lineTo(xDepart + (rng() - 0.5) * sinuosite, yMid);
        veines.lineTo(xDepart * 0.5 + xCentre * 0.5 + (rng() - 0.5) * sinuosite, yHaut);
        veines.strokePath();
    }
    veines.setScrollFactor(0.15, 0);
    veines.setDepth(DEPTH.SILHOUETTES);
    objets.push(veines);
    scene.tweens.add({
        targets: veines,
        alpha: { from: 0.55, to: 1.0 },
        duration: 3500 + rng() * 1500,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });

    // === BRANCHES MAJEURES (Phase 5'.15 : 14 rayonnantes sur 4 niveaux) ===
    // Densification vs 8 avant. Chaque branche principale porte
    // SYSTÉMATIQUEMENT 2 sous-branches (vs 50 % de chance) + grappe dense.
    const branchesDef = [
        // [yT (ratio), dx, dy, epBase, epBout]
        // Niveau 1 (bas) — 4 branches courtes trapues
        { yT: 0.30, dx: -150, dy: -10,  epBase: 40, epBout: 14 },
        { yT: 0.30, dx: 150,  dy: -10,  epBase: 40, epBout: 14 },
        { yT: 0.38, dx: -110, dy: -50,  epBase: 36, epBout: 13 },
        { yT: 0.38, dx: 110,  dy: -50,  epBase: 36, epBout: 13 },
        // Niveau 2 (mid) — 4 branches diagonales moyennes
        { yT: 0.50, dx: -220, dy: -80,  epBase: 32, epBout: 11 },
        { yT: 0.50, dx: 220,  dy: -80,  epBase: 32, epBout: 11 },
        { yT: 0.58, dx: -170, dy: -130, epBase: 28, epBout: 10 },
        { yT: 0.58, dx: 170,  dy: -130, epBase: 28, epBout: 10 },
        // Niveau 3 (haut canopée) — 4 branches longues vers les coins hauts
        { yT: 0.70, dx: -240, dy: -160, epBase: 26, epBout: 9 },
        { yT: 0.70, dx: 240,  dy: -160, epBase: 26, epBout: 9 },
        { yT: 0.76, dx: -130, dy: -190, epBase: 22, epBout: 8 },
        { yT: 0.76, dx: 130,  dy: -190, epBase: 22, epBout: 8 },
        // Niveau 4 (canopée verticale, plus fines)
        { yT: 0.82, dx: -60,  dy: -200, epBase: 20, epBout: 7 },
        { yT: 0.82, dx: 60,   dy: -200, epBase: 20, epBout: 7 }
    ];

    for (const br of branchesDef) {
        let largeurLocale;
        if (br.yT < 0.45) {
            const tt = br.yT / 0.45;
            largeurLocale = largeurBase * (1 - tt) + largeurMid * tt;
        } else {
            const tt = (br.yT - 0.45) / 0.55;
            largeurLocale = largeurMid * (1 - tt) + largeurHaut * tt;
        }
        const cote = Math.sign(br.dx);
        const xDepart = xCentre + cote * (largeurLocale / 2 - 2);
        const yDepart = ySol - hauteurTronc * br.yT;
        const xBout = xDepart + br.dx * facteurEtage;
        const yBout = yDepart + br.dy * facteurEtage;

        const branchObjs = peindreBrancheArbre(
            scene, xDepart, yDepart, xBout, yBout,
            br.epBase, br.epBout, rng, DEPTH.SILHOUETTES - 1
        );
        objets.push(...branchObjs);

        // 2 SOUS-BRANCHES systématiques (vs 50 % de chance + 1 sous-branche)
        for (let sb = 0; sb < 2; sb++) {
            const tSousB = 0.45 + sb * 0.25 + rng() * 0.10;
            const xSousDepart = xDepart + br.dx * tSousB * facteurEtage;
            const ySousDepart = yDepart + br.dy * tSousB * facteurEtage;
            // Direction de la sous-branche : alterner vers le haut + biais
            const dxSous = br.dx * 0.40 * (sb === 0 ? 1 : 0.7) + (rng() - 0.5) * 35;
            const dySous = br.dy * 0.30 - (15 + rng() * 30 + sb * 10);
            const xSousBout = xSousDepart + dxSous;
            const ySousBout = ySousDepart + dySous;
            const epSousBase = br.epBout * 0.85;
            const epSousBout = 3 + rng() * 2;
            const sousBranch = peindreBrancheArbre(
                scene, xSousDepart, ySousDepart, xSousBout, ySousBout,
                epSousBase, epSousBout, rng, DEPTH.SILHOUETTES - 1
            );
            objets.push(...sousBranch);

            // Grappe au bout de la sous-branche
            objets.push(...peindreGrappeCristaux(scene, xSousBout, ySousBout, 12, rng));
        }

        // Grappe au bout de la branche principale (plus grosse)
        objets.push(...peindreGrappeCristaux(scene, xBout, yBout, 20, rng));
    }

    // === RACINES MAJESTUEUSES (15 racines avec ramifications) ===
    const nbRacines = 15;
    for (let r = 0; r < nbRacines; r++) {
        const t = (r + 0.5) / nbRacines;
        const offsetX = -largeurBase / 2 - 40 + t * (largeurBase + 80);
        const xR = xCentre + offsetX;
        const direction = offsetX < 0 ? -1 : 1;
        const longueur = 28 + rng() * 36;
        objets.push(...peindreRacineArbre(scene, xR, ySol - 4, longueur, direction, rng));
    }

    // === SCINTILLEMENTS SPORADIQUES SUR L'ARBRE (Phase 5'.15) ===
    // 8-12 éclats blancs distribués qui apparaissent/disparaissent
    // cycliquement — donne vie au cristal, comme un diamant naturel qui
    // capte la lumière sous différents angles.
    const nbScintillements = 8 + Math.floor(rng() * 5);
    for (let s = 0; s < nbScintillements; s++) {
        const tH = 0.15 + rng() * 0.75;
        let largeurLocale;
        if (tH < 0.45) {
            const tt = tH / 0.45;
            largeurLocale = largeurBase * (1 - tt) + largeurMid * tt;
        } else {
            const tt = (tH - 0.45) / 0.55;
            largeurLocale = largeurMid * (1 - tt) + largeurHaut * tt;
        }
        const xS = xCentre + (rng() - 0.5) * largeurLocale * 0.9;
        const yS = ySol - hauteurTronc * tH;
        const tailleS = 2.5 + rng() * 2;
        objets.push(...peindreScintillement(scene, xS, yS, tailleS, rng));
    }

    // === CRISTAUX EXCROISSANCES SUR LE TRONC (mémoires affleurantes) ===
    // 4-6 cristaux ADD qui sortent du tronc à différentes hauteurs (signature
    // narrative "des mémoires affleurent à travers l'écorce")
    const cristauxTronc = scene.add.graphics();
    cristauxTronc.setBlendMode(Phaser.BlendModes.ADD);
    const nbCristauxTronc = 4 + Math.floor(rng() * 3);
    for (let c = 0; c < nbCristauxTronc; c++) {
        const tH = 0.15 + rng() * 0.70;
        let largeurLocale;
        if (tH < 0.45) {
            const tt = tH / 0.45;
            largeurLocale = largeurBase * (1 - tt) + largeurMid * tt;
        } else {
            const tt = (tH - 0.45) / 0.55;
            largeurLocale = largeurMid * (1 - tt) + largeurHaut * tt;
        }
        const cote = rng() < 0.5 ? -1 : 1;
        const xC = xCentre + cote * (largeurLocale / 2 - 2);
        const yC = ySol - hauteurTronc * tH;
        const taille = 5 + rng() * 4;

        // Halo
        cristauxTronc.fillStyle(COULEUR_ARBRE.seve, 0.45);
        cristauxTronc.fillCircle(xC, yC, taille * 2);
        // Losange cœur (pointe vers l'extérieur)
        cristauxTronc.fillStyle(COULEUR_ARBRE.coeur, 0.85);
        cristauxTronc.beginPath();
        cristauxTronc.moveTo(xC + cote * taille, yC);
        cristauxTronc.lineTo(xC, yC - taille * 0.6);
        cristauxTronc.lineTo(xC - cote * 1, yC);
        cristauxTronc.lineTo(xC, yC + taille * 0.6);
        cristauxTronc.closePath();
        cristauxTronc.fillPath();
        // Éclat blanc
        cristauxTronc.fillStyle(0xffffff, 0.75);
        cristauxTronc.fillCircle(xC + cote * taille * 0.4, yC, 0.8);
    }
    cristauxTronc.setScrollFactor(0.15, 0);
    cristauxTronc.setDepth(DEPTH.SILHOUETTES);
    objets.push(cristauxTronc);
    scene.tweens.add({
        targets: cristauxTronc,
        alpha: { from: 0.55, to: 1.0 },
        duration: 4500 + rng() * 2000,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });

    return objets;
}

// ============================================================
// COUCHE 2 — SILHOUETTES MNÉSIQUES (scrollFactor 0.3)
// ============================================================
//
// Quatre types : reliquaire suspendu, obélisque cristallin, statue figée,
// pilier de mémoire. Toutes en silhouettes opaques pures — formes
// reconnaissables sans détails internes. Évoquent les structures des Sources
// dédiées au stockage de la Résonance pure.

function couleurSilhouetteMnesique() {
    return 0x10162a; // bleu-noir profond, uniforme
}

function peindreReliquaire(scene, x, ySol, hauteur, palette, rng) {
    const g = scene.add.graphics();
    const w = hauteur * 2.0 + rng() * 20;
    const couleur = couleurSilhouetteMnesique();
    const yTop = ySol - hauteur;

    g.fillStyle(couleur, 1);
    // Base : socle massif évasé
    g.beginPath();
    g.moveTo(x - w / 2 - 6, ySol);
    g.lineTo(x - w / 2, ySol - hauteur * 0.18);
    g.lineTo(x + w / 2, ySol - hauteur * 0.18);
    g.lineTo(x + w / 2 + 6, ySol);
    g.closePath();
    g.fillPath();

    // Coffre rectangulaire
    g.fillRect(x - w / 2 + 4, yTop + hauteur * 0.3, w - 8, hauteur * 0.55);

    // Couvercle hexagonal (silhouette de relique)
    g.fillRect(x - w / 2 + 2, yTop + hauteur * 0.25, w - 4, hauteur * 0.08);
    g.beginPath();
    g.moveTo(x - w / 2 + 2, yTop + hauteur * 0.25);
    g.lineTo(x - w / 4, yTop + hauteur * 0.16);
    g.lineTo(x + w / 4, yTop + hauteur * 0.16);
    g.lineTo(x + w / 2 - 2, yTop + hauteur * 0.25);
    g.closePath();
    g.fillPath();

    // Petite couronne cristalline en haut (rare)
    if (rng() < 0.5) {
        g.beginPath();
        g.moveTo(x - 3, yTop + hauteur * 0.16);
        g.lineTo(x, yTop + hauteur * 0.08);
        g.lineTo(x + 3, yTop + hauteur * 0.16);
        g.closePath();
        g.fillPath();
    }

    return g;
}

function peindreObelisqueCristallin(scene, x, ySol, hauteur, palette, rng) {
    const g = scene.add.graphics();
    const w = 22 + rng() * 14;
    const yTop = ySol - hauteur;
    const couleur = couleurSilhouetteMnesique();

    g.fillStyle(couleur, 1);
    // Base évasée
    g.beginPath();
    g.moveTo(x - w / 2 - 5, ySol);
    g.lineTo(x - w / 2, ySol - 10);
    g.lineTo(x + w / 2, ySol - 10);
    g.lineTo(x + w / 2 + 5, ySol);
    g.closePath();
    g.fillPath();

    // Fût trapézoïdal (s'amincit vers le haut)
    g.beginPath();
    g.moveTo(x - w / 2, ySol - 10);
    g.lineTo(x - w * 0.32, yTop + hauteur * 0.12);
    g.lineTo(x + w * 0.32, yTop + hauteur * 0.12);
    g.lineTo(x + w / 2, ySol - 10);
    g.closePath();
    g.fillPath();

    // Sommet pyramidal (pointe cristalline)
    g.beginPath();
    g.moveTo(x - w * 0.32, yTop + hauteur * 0.12);
    g.lineTo(x, yTop);
    g.lineTo(x + w * 0.32, yTop + hauteur * 0.12);
    g.closePath();
    g.fillPath();

    return g;
}

function peindreStatueFigee(scene, x, ySol, hauteur, palette, rng) {
    const g = scene.add.graphics();
    const w = 32 + rng() * 14;
    const yTop = ySol - hauteur;
    const couleur = couleurSilhouetteMnesique();

    g.fillStyle(couleur, 1);
    // Socle
    g.fillRect(x - w / 2, ySol - 8, w, 8);
    // Corps trapézoïdal (silhouette de robe longue)
    g.beginPath();
    g.moveTo(x - w / 2 + 2, ySol - 8);
    g.lineTo(x - w / 3, yTop + hauteur * 0.25);
    g.lineTo(x + w / 3, yTop + hauteur * 0.25);
    g.lineTo(x + w / 2 - 2, ySol - 8);
    g.closePath();
    g.fillPath();
    // Tête simple (ovale)
    g.fillEllipse(x, yTop + hauteur * 0.15, w * 0.32, hauteur * 0.18);

    // Bras croisés ou pendants (silhouette ovale courte)
    g.fillEllipse(x, yTop + hauteur * 0.4, w * 0.55, hauteur * 0.12);

    // Cassure occasionnelle (la statue a perdu un bout)
    if (rng() < 0.35) {
        g.fillStyle(0x000000, 0); // simule un masque par soustraction visuelle
        // Comme on n'a pas de soustraction, on dessine une encoche sombre
        g.fillStyle(teinterPlusSombre(couleur, 0.5), 1);
        g.beginPath();
        g.moveTo(x + w * 0.18, yTop + hauteur * 0.05);
        g.lineTo(x + w * 0.32, yTop + hauteur * 0.18);
        g.lineTo(x + w * 0.4, yTop + hauteur * 0.06);
        g.closePath();
        g.fillPath();
    }

    return g;
}

function peindrePilierMemoire(scene, x, ySol, hauteur, palette, rng) {
    const g = scene.add.graphics();
    const w = 30 + rng() * 16;
    const couleur = couleurSilhouetteMnesique();

    g.fillStyle(couleur, 1);
    // Base tripode (silhouette)
    const hBase = hauteur * 0.18;
    g.beginPath();
    g.moveTo(x - w / 2, ySol);
    g.lineTo(x - 4, ySol - hBase);
    g.lineTo(x + 4, ySol - hBase);
    g.lineTo(x + w / 2, ySol);
    g.closePath();
    g.fillPath();
    // Fût central
    g.fillRect(x - 4, ySol - hauteur * 0.7, 8, hauteur * 0.55);

    // Vasque ouverte au sommet
    const yV = ySol - hauteur * 0.72;
    g.fillEllipse(x, yV, w * 0.85, hauteur * 0.10);
    g.fillRect(x - w * 0.4, yV - 4, w * 0.8, 5);

    // Cristal flottant au-dessus de la vasque (suggéré par losange opaque)
    g.beginPath();
    g.moveTo(x, yV - 10);
    g.lineTo(x - 4, yV - 16);
    g.lineTo(x, yV - 24);
    g.lineTo(x + 4, yV - 16);
    g.closePath();
    g.fillPath();

    return g;
}

function poserSilhouettesMnesiques(scene, dims, rng, palette) {
    const objets = [];
    const ySol = GAME_HEIGHT - 40;
    const largeurEtendue = dims.largeur * 1.6;
    const decalageX = -dims.largeur * 0.3;

    const nb = 8;
    const pas = largeurEtendue / nb;

    for (let i = 0; i < nb; i++) {
        const x = decalageX + pas * i + (rng() - 0.5) * pas * 0.3;
        const choix = rng();
        let obj, h;

        if (choix < 0.30) {
            h = 60 + rng() * 30;
            obj = peindreReliquaire(scene, x, ySol, h, palette, rng);
        } else if (choix < 0.58) {
            h = 110 + rng() * 80;
            obj = peindreObelisqueCristallin(scene, x, ySol, h, palette, rng);
        } else if (choix < 0.82) {
            h = 90 + rng() * 50;
            obj = peindreStatueFigee(scene, x, ySol, h, palette, rng);
        } else {
            h = 70 + rng() * 30;
            obj = peindrePilierMemoire(scene, x, ySol, h, palette, rng);
        }

        if (obj) {
            obj.setScrollFactor(0.3, 0);
            obj.setDepth(DEPTH.SILHOUETTES);
            obj.setAlpha(0.85 + rng() * 0.12);
            objets.push(obj);

            // Dépôt de givre cristallin au pied (rend la silhouette tangible —
            // posée dans un sol gelé, pas flottante).
            const m = scene.add.graphics();
            m.fillStyle(palette.mousse, 0.55); // mousse slot = givre en cristaux
            const largeurDepot = 30 + rng() * 26;
            m.fillEllipse(x, ySol + 1, largeurDepot, 5);
            // 2-3 petits éclats cristallins au pied (signature biome)
            if (rng() < 0.4) {
                m.fillStyle(palette.racine, 0.65); // racine slot = cristal mnésique violet
                for (let b = 0; b < 1 + Math.floor(rng() * 2); b++) {
                    const bx = x - largeurDepot * 0.3 + rng() * largeurDepot * 0.6;
                    m.fillCircle(bx, ySol - 1, 1.2);
                }
            }
            m.setScrollFactor(0.3, 0);
            m.setDepth(DEPTH.SILHOUETTES + 1);
            objets.push(m);
        }
    }

    return objets;
}

// ============================================================
// COUCHE 3 — CRISTAUX MNÉSIQUES SUR PIED (scrollFactor 0.5)
// ============================================================
//
// Équivalent thématique des foyers résiduels des Halls. Au lieu de braseros,
// des cristaux mnésiques sur pied haut qui pulsent (mémoires vives violet ADD)
// ou émettent une lueur argent-nacre mate (mémoires fossilisées). Densité
// non-uniforme.
//
// Gradient narratif étage 5 → 6 :
//   - étage 5 : ratio actif/fossile ≈ 65/35 (mémoires vivantes)
//   - étage 6 : ratio actif/fossile ≈ 25/75 (au seuil du Voile, mémoires fossilisées)

function peindreCristalSurPied(scene, x, ySol, hauteur, actif, palette, rng) {
    const g = scene.add.graphics();
    const couleurSocle = 0x10182a;
    const epaisseur = 3;

    // Pied (long fût grêle) — silhouette opaque
    g.fillStyle(couleurSocle, 0.92);
    g.fillRect(x - epaisseur / 2, ySol - hauteur, epaisseur, hauteur);

    // Trépied à la base
    g.lineStyle(epaisseur * 0.7, couleurSocle, 0.92);
    g.beginPath();
    g.moveTo(x - 6, ySol);
    g.lineTo(x, ySol - 12);
    g.lineTo(x + 6, ySol);
    g.strokePath();

    // Vasque ouverte en haut — silhouette ellipse
    const yV = ySol - hauteur;
    g.fillStyle(couleurSocle, 0.92);
    g.fillEllipse(x, yV, 22, 7);
    g.fillRect(x - 11, yV - 3, 22, 4);

    g.setScrollFactor(0.5, 0);
    g.setDepth(DEPTH.SILHOUETTES + 2);

    // Contenu de la vasque : cristal actif ou cristal fossilisé
    if (actif) {
        // Mémoire vivante — losange violet ADD sur graphics séparé pour pulse
        const cristal = scene.add.graphics();
        cristal.setBlendMode(Phaser.BlendModes.ADD);
        // Halo extérieur (violet diffus)
        cristal.fillStyle(0xb898e8, 0.40);
        cristal.fillCircle(x, yV - 6, 18);
        // Losange cristallin (deux triangles)
        cristal.fillStyle(0xe0c8ff, 0.85);
        cristal.fillTriangle(x, yV - 14, x - 4, yV - 5, x + 4, yV - 5);
        cristal.fillTriangle(x, yV + 2, x - 4, yV - 5, x + 4, yV - 5);
        // Éclat blanc central
        cristal.fillStyle(0xffffff, 0.80);
        cristal.fillCircle(x, yV - 6, 1.5);
        cristal.setAlpha(0.85);
        cristal.setScrollFactor(0.5, 0);
        cristal.setDepth(DEPTH.SILHOUETTES + 3);

        // Pulse géologique (~3-4 s, vs ~1.2 s pour les Halls)
        scene.tweens.add({
            targets: cristal,
            alpha: { from: 0.55, to: 1.0 },
            scale: { from: 0.95, to: 1.05 },
            duration: 2800 + rng() * 1400,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });

        return [g, cristal];
    } else {
        // Mémoire fossilisée — touche argent-nacre mate (PAS d'ADD)
        g.fillStyle(palette.accent, 0.70);
        g.fillEllipse(x, yV - 2, 14, 4);
        // Losange fossilisé (terne, fissuré)
        g.fillStyle(0x4a4a5a, 0.75);
        g.fillTriangle(x, yV - 8, x - 3, yV - 1, x + 3, yV - 1);
        g.fillTriangle(x, yV + 2, x - 3, yV - 1, x + 3, yV - 1);
        // Fissure traversante
        g.lineStyle(0.6, 0x000000, 0.65);
        g.beginPath();
        g.moveTo(x - 2, yV - 6);
        g.lineTo(x + 1, yV - 1);
        g.strokePath();

        return [g];
    }
}

function poserCristauxMnesiquesSurPied(scene, dims, rng, palette) {
    const objets = [];
    const ySol = GAME_HEIGHT - 20;
    const largeurEtendue = dims.largeur * 1.6;
    const decalageX = -dims.largeur * 0.3;

    const etage = scene.registry.get('etage_courant') ?? 5;
    const ratioActif = etage <= 5 ? 0.65 : 0.25;

    // 14 cristaux répartis, densité non-uniforme (2 zones denses + 1 vallée).
    const candidats = 28;
    const conserve = 14;
    const positions = [];

    for (let i = 0; i < candidats; i++) {
        const x = decalageX + (i / candidats) * largeurEtendue + (rng() - 0.5) * 12;
        const norm = (x - decalageX) / largeurEtendue;
        const densite =
            Math.exp(-Math.pow((norm - 0.25) * 4, 2)) * 0.85 +
            Math.exp(-Math.pow((norm - 0.78) * 5, 2)) * 1.0 +
            0.18;
        positions.push({ x, densite });
    }
    positions.sort((a, b) => (b.densite + (rng() - 0.5) * 0.3) - (a.densite + (rng() - 0.5) * 0.3));

    for (let k = 0; k < Math.min(conserve, positions.length); k++) {
        const p = positions[k];
        const hauteur = 60 + rng() * 50;
        const yPos = ySol + (rng() - 0.5) * 6;
        const actif = rng() < ratioActif;
        const parties = peindreCristalSurPied(scene, p.x, yPos, hauteur, actif, palette, rng);
        for (const partie of parties) objets.push(partie);
    }

    return objets;
}

// ============================================================
// COUCHE 0 — BRANCHES GÉANTES DE L'ARBRE CRISTALLIN (scrollFactor 0.10)
// ============================================================
//
// Les branches supérieures de l'arbre Yggdrasil cristallin qui dépassent
// depuis le haut de l'écran — signifie "l'arbre est PLUS GRAND que la salle,
// il monte vers le ciel divin". Posées en parallax 0.10 pour qu'elles bougent
// moins que les temples (perspective : ce qui est au-dessus est plus loin).
//
// 3 branches majeures + pulses violet ADD circulant (sève mnésique). Drift
// imperceptible (la glace est figée).

function poserBranchesArbreSommets(scene, dims, rng, palette) {
    const objets = [];
    const xCentre = dims.largeur / 2;
    const yHaut = -30;

    // Couleurs cohérentes avec le tronc central
    const couleurBranche = 0xc8d8f0;
    const couleurOmbre = 0x6a8aa8;
    const couleurClair = 0xe8f4ff;
    const couleurSeve = 0xb898e8;
    const couleurCoeur = 0xe0c8ff;

    // Definitions des 3 branches majeures (positions, courbures)
    const branches = [
        { xDepart: xCentre - 100, xBout: xCentre - 280, yBout: yHaut + 130, epaisseurBase: 28, epaisseurBout: 8 },
        { xDepart: xCentre + 30,  xBout: xCentre + 80,  yBout: yHaut + 180, epaisseurBase: 32, epaisseurBout: 10 },
        { xDepart: xCentre + 140, xBout: xCentre + 320, yBout: yHaut + 110, epaisseurBase: 24, epaisseurBout: 7 }
    ];

    for (const br of branches) {
        const g = scene.add.graphics();

        // Forme : tronçon allongé entre xDepart (en haut, sortie de l'écran)
        // et xBout (en bas, dans le canvas). Quadrilatère effilé.
        const dx = br.xBout - br.xDepart;
        const dy = br.yBout - yHaut;
        const longueur = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);
        const perpX = -Math.sin(angle);
        const perpY = Math.cos(angle);

        const x1G = br.xDepart + perpX * br.epaisseurBase / 2;
        const y1G = yHaut + perpY * br.epaisseurBase / 2;
        const x1D = br.xDepart - perpX * br.epaisseurBase / 2;
        const y1D = yHaut - perpY * br.epaisseurBase / 2;
        const x2G = br.xBout + perpX * br.epaisseurBout / 2;
        const y2G = br.yBout + perpY * br.epaisseurBout / 2;
        const x2D = br.xBout - perpX * br.epaisseurBout / 2;
        const y2D = br.yBout - perpY * br.epaisseurBout / 2;

        g.fillStyle(couleurBranche, 0.90);
        g.beginPath();
        g.moveTo(x1G, y1G);
        g.lineTo(x2G, y2G);
        g.lineTo(x2D, y2D);
        g.lineTo(x1D, y1D);
        g.closePath();
        g.fillPath();

        // Face éclairée (côté droit de la branche)
        g.fillStyle(couleurClair, 0.50);
        g.beginPath();
        g.moveTo(br.xDepart, yHaut);
        g.lineTo(x2G, y2G);
        g.lineTo(br.xBout, br.yBout);
        g.lineTo(x1G, y1G);
        g.closePath();
        g.fillPath();

        // Petite pointe cristalline au bout (la branche se termine en cristal)
        g.fillStyle(couleurBranche, 0.92);
        g.beginPath();
        g.moveTo(br.xBout, br.yBout);
        g.lineTo(br.xBout - perpX * 6, br.yBout - perpY * 6);
        g.lineTo(br.xBout + Math.cos(angle) * 14, br.yBout + Math.sin(angle) * 14);
        g.lineTo(br.xBout + perpX * 6, br.yBout + perpY * 6);
        g.closePath();
        g.fillPath();

        // Stries cristallines longitudinales
        g.lineStyle(1, couleurOmbre, 0.35);
        for (let s = 0; s < 3; s++) {
            const t1 = 0.2 + s * 0.25;
            const t2 = 0.4 + s * 0.25;
            g.beginPath();
            g.moveTo(br.xDepart + dx * t1 + (rng() - 0.5) * 3, yHaut + dy * t1);
            g.lineTo(br.xDepart + dx * t2 + (rng() - 0.5) * 3, yHaut + dy * t2);
            g.strokePath();
        }

        g.setScrollFactor(0.10, 0);
        g.setDepth(DEPTH.CIEL + 2);
        objets.push(g);

        // === Veine mnésique ADD sur cette branche ===
        const veine = scene.add.graphics();
        veine.setBlendMode(Phaser.BlendModes.ADD);
        // Halo flou
        veine.lineStyle(4, couleurSeve, 0.22);
        veine.beginPath();
        veine.moveTo(br.xDepart, yHaut);
        veine.lineTo(br.xBout, br.yBout);
        veine.strokePath();
        // Cœur
        veine.lineStyle(1.5, couleurCoeur, 0.65);
        veine.beginPath();
        veine.moveTo(br.xDepart, yHaut);
        veine.lineTo(br.xBout, br.yBout);
        veine.strokePath();
        // Éclat au bout de la branche (cristal final)
        veine.fillStyle(couleurCoeur, 0.85);
        veine.fillCircle(br.xBout, br.yBout, 3);
        veine.fillStyle(0xffffff, 0.70);
        veine.fillCircle(br.xBout, br.yBout, 1.2);

        veine.setScrollFactor(0.10, 0);
        veine.setDepth(DEPTH.CIEL + 3);
        objets.push(veine);

        // Pulse géologique très lent — chaque branche a un tempo propre
        // (donne une impression que la sève coule indépendamment dans chaque)
        scene.tweens.add({
            targets: veine,
            alpha: { from: 0.45, to: 1.0 },
            duration: 4000 + rng() * 2500,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });

        // Drift imperceptible (la branche est rigide, à peine vivante)
        scene.tweens.add({
            targets: g,
            x: '+=' + (8 + rng() * 6),
            duration: 130000 + rng() * 50000,
            ease: 'Linear',
            repeat: -1,
            yoyo: true
        });
        scene.tweens.add({
            targets: veine,
            x: '+=' + (8 + rng() * 6),
            duration: 130000 + rng() * 50000,
            ease: 'Linear',
            repeat: -1,
            yoyo: true
        });
    }

    return objets;
}

// ============================================================
// FLOCONS EN SUSPENSION — équivalent poussière ambiante des Halls
// ============================================================
//
// Flocons cristallins bleu-blanc qui dérivent doucement vers le bas, en
// parallax 0.20. Continuité directe avec les escarbilles des Halls : les
// braises figées par le froid sont devenues des flocons. Drift descendant
// très lent (la suspension est lourde, la chute est patiente).

function poserFloconsEnSuspension(scene, dims, rng) {
    if (!scene.textures.exists('_particule')) return [];
    const objets = [];

    const em = scene.add.particles(0, 0, '_particule', {
        x: { min: -50, max: GAME_WIDTH + 50 },
        y: { min: -20, max: 200 },
        lifespan: 16000,
        speedY: { min: 6, max: 16 }, // plus lent que les Halls (le froid ralentit la chute)
        speedX: { min: -4, max: 4 },
        scale: { start: 0.45, end: 0.15 },
        tint: [0xd8e8ff, 0xb8c8e8, 0xa8b8d8],
        alpha: { start: 0.45, end: 0 },
        quantity: 1,
        frequency: 700
    });
    em.setScrollFactor(0.20, 0);
    em.setDepth(DEPTH.CIEL + 3);
    objets.push(em);

    return objets;
}

// ============================================================
// VOILE D'HORIZON BLEU-VIOLET — atmospheric haze froid
// ============================================================

function preparerTextureVoileHorizonCG(scene) {
    const id = '_voile_horizon_cristaux_glaces';
    if (scene.textures.exists(id)) return id;
    const w = 4, h = 540;
    const cv = scene.textures.createCanvas(id, w, h);
    const ctx = cv.getContext();
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    // Bleu cristallin laiteux — la couleur du froid en suspension
    gradient.addColorStop(0,    'rgba(110, 140, 200, 0.32)');
    gradient.addColorStop(0.5,  'rgba(90,  130, 190, 0.22)');
    gradient.addColorStop(0.75, 'rgba(80,  120, 180, 0.10)');
    gradient.addColorStop(1,    'rgba(60,  100, 160, 0.00)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    cv.refresh();
    return id;
}

function poserVoileHorizonCG(scene) {
    const id = preparerTextureVoileHorizonCG(scene);
    const cam = scene.cameras.main;
    const voile = scene.add.image(cam.width / 2, cam.height / 2, id);
    voile.setDisplaySize(cam.width, cam.height);
    voile.setScrollFactor(0, 0);
    voile.setDepth(DEPTH.SILHOUETTES - 1);
    voile.setBlendMode(Phaser.BlendModes.NORMAL);
    return [voile];
}

// ============================================================
// BRUME GLACÉE BASSE — ferme le gap horizon/niveau
// ============================================================

function poserBrumeGlacee(scene, dims, rng, palette) {
    const objets = [];
    const largeurEtendue = dims.largeur * 1.6;
    const decalageX = -dims.largeur * 0.3;

    // Trois bandes empilées, plus dense en bas (vapeur cristalline)
    const bandes = [
        { yEcran: 460, alpha: 0.24, nb: 7, lMin: 240, lMax: 380, hMin: 26, hMax: 38 },
        { yEcran: 490, alpha: 0.34, nb: 8, lMin: 280, lMax: 440, hMin: 30, hMax: 46 },
        { yEcran: 518, alpha: 0.44, nb: 9, lMin: 320, lMax: 500, hMin: 34, hMax: 54 }
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
        g.setScrollFactor(0.2, 0);
        g.setDepth(DEPTH.SILHOUETTES + 1);
        objets.push(g);

        scene.tweens.add({
            targets: g,
            x: '+=' + (60 + rng() * 40),
            duration: 65000 + rng() * 25000,
            ease: 'Sine.InOut',
            repeat: -1,
            yoyo: true
        });
    }

    return objets;
}

// ============================================================
// SOL-GLACE FENDUE (scrollFactor 0.6) — premier plan d'horizon
// ============================================================
//
// Polyline de dalles de glace brisées avec veines cristallines violet ADD en
// surface (signature biome : les mémoires affleurent même dans le sol).

function poserSolGlaceFendue(scene, dims, rng, palette) {
    const objets = [];
    const largeurEtendue = dims.largeur * 1.6;
    const decalageX = -dims.largeur * 0.3;
    const yBase = GAME_HEIGHT;
    const yCrete = GAME_HEIGHT - 26;

    const g = scene.add.graphics();
    const couleurFoncee = 0x0a1224;
    g.fillStyle(couleurFoncee, 0.94);

    // Profil polyline : presque plat (la glace s'étend en plateau gelé)
    const nbPoints = 48;
    const pas = largeurEtendue / nbPoints;
    const points = [];
    points.push({ x: decalageX, y: yBase });
    for (let i = 0; i <= nbPoints; i++) {
        const x = decalageX + pas * i;
        const phase = (i / nbPoints) * Math.PI * 4;
        const bosse = Math.sin(phase) * 2 + Math.sin(phase * 3.1) * 1.5;
        const y = yCrete + bosse + (rng() - 0.5) * 2.5;
        points.push({ x, y });
    }
    points.push({ x: decalageX + largeurEtendue, y: yBase });

    g.beginPath();
    g.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) g.lineTo(points[i].x, points[i].y);
    g.closePath();
    g.fillPath();

    // Fissures verticales sur la surface (la glace se fendille)
    g.lineStyle(1.2, 0x000000, 0.55);
    for (let i = 2; i < points.length - 2; i += 3) {
        const p = points[i];
        g.beginPath();
        g.moveTo(p.x, p.y);
        g.lineTo(p.x + (rng() - 0.5) * 4, p.y + 6 + rng() * 6);
        g.strokePath();
    }

    g.setScrollFactor(0.6, 0);
    g.setDepth(DEPTH.SILHOUETTES + 3);
    objets.push(g);

    // VEINES CRISTALLINES ADD violet pâle — les mémoires affleurent à la
    // surface de la glace. Sur graphics séparé pour blend mode + pulse lent.
    const veines = scene.add.graphics();
    veines.setBlendMode(Phaser.BlendModes.ADD);
    const nbVeines = 12;
    for (let i = 0; i < nbVeines; i++) {
        const idx = 3 + Math.floor(rng() * (points.length - 6));
        const p = points[idx];
        // Veine = court segment ADD violet
        veines.lineStyle(2, palette.racine, 0.22);
        veines.beginPath();
        veines.moveTo(p.x - 8, p.y - 1);
        veines.lineTo(p.x + 8, p.y - 1);
        veines.strokePath();
        veines.lineStyle(1, 0xe0c8ff, 0.40);
        veines.beginPath();
        veines.moveTo(p.x - 6, p.y - 1);
        veines.lineTo(p.x + 6, p.y - 1);
        veines.strokePath();
    }
    veines.setScrollFactor(0.6, 0);
    veines.setDepth(DEPTH.SILHOUETTES + 4);
    objets.push(veines);

    // Respiration géologique (la mémoire palpite très lentement)
    scene.tweens.add({
        targets: veines,
        alpha: { from: 0.55, to: 1.0 },
        duration: 4500 + rng() * 2000,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });

    return objets;
}

// ============================================================
// RAYONS CRISTALLINS — équivalent rayons rasants des Halls
// ============================================================
//
// Faisceaux obliques qui filtrent depuis le haut-gauche (lumière qui traverse
// les flocons en suspension). Violet-blanc froid, ADD très subtil. Respiration
// délibérément plus lente que les Halls.

function poserRayonsCristallins(scene, dims, rng) {
    const objets = [];
    const nbRayons = 3;
    const largeurRayon = 100;
    const decalageDiag = 360;
    const couleurRayon = 0xd8d0ff; // violet pâle froid

    for (let i = 0; i < nbRayons; i++) {
        const xHaut = -50 + i * 340 + rng() * 80;
        const g = scene.add.graphics();
        const alphaBase = 0.09 + rng() * 0.05;
        g.setBlendMode(Phaser.BlendModes.ADD);
        g.fillStyle(couleurRayon, alphaBase);

        g.beginPath();
        g.moveTo(xHaut, -10);
        g.lineTo(xHaut + largeurRayon, -10);
        g.lineTo(xHaut + largeurRayon + decalageDiag, 540);
        g.lineTo(xHaut + decalageDiag, 540);
        g.closePath();
        g.fillPath();

        g.setScrollFactor(0.7, 0);
        g.setDepth(DEPTH.SILHOUETTES + 5);
        objets.push(g);

        // Respiration plus lente que les Halls (7-12 s vs 5-9 s)
        scene.tweens.add({
            targets: g,
            alpha: { from: 0.7, to: 1.2 },
            duration: 7500 + rng() * 4500,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
    }

    return objets;
}

// ============================================================
// FOREGROUND VIVANT — givre sol, stalactites, bokeh, esprits-flocons
// ============================================================

// Givre au sol foreground : croûtes basses bleu-blanc au bord bas du canvas,
// RÉSONNENT (pulse violet ADD) au passage du joueur — la mémoire reconnaît le
// Vestige et brille brièvement à son passage (vs cendre soulevée des Halls).
function poserGivreSolForeground(scene, dims, rng, palette) {
    const objets = [];
    const largeurEtendue = dims.largeur * 1.8;
    const decalageX = -dims.largeur * 0.4;
    const yBase = GAME_HEIGHT + 4;

    const nbTas = 24;
    for (let i = 0; i < nbTas; i++) {
        const g = scene.add.graphics();
        const x = decalageX + (i / nbTas) * largeurEtendue + (rng() - 0.5) * 30;
        const hMax = 6 + rng() * 12; // croûtes plus basses que les tas de cendre
        const couleurBase = rng() < 0.85 ? 0x0e1828 : 0x2a3a52; // 15 % un peu plus clair
        const alpha = 0.55 + rng() * 0.30;

        // Croûte = ellipse plate + 2-3 grumeaux cristallins
        g.fillStyle(couleurBase, alpha);
        g.fillEllipse(0, -hMax * 0.2, 18 + rng() * 8, hMax * 0.5);
        // Grumeaux
        const nbGrumeaux = 2 + Math.floor(rng() * 2);
        for (let k = 0; k < nbGrumeaux; k++) {
            const gx = (rng() - 0.5) * 14;
            const gy = -hMax * (0.4 + rng() * 0.4);
            const gr = 2 + rng() * 3;
            g.fillStyle(teinterPlusClair(couleurBase, 0.10), alpha);
            g.fillCircle(gx, gy, gr);
        }
        // Petit cristal mnésique rare au sommet (1 sur ~6) — pulse latent
        let cristalLatent = null;
        if (rng() < 0.18) {
            cristalLatent = scene.add.graphics();
            cristalLatent.setBlendMode(Phaser.BlendModes.ADD);
            cristalLatent.fillStyle(palette.racine, 0.6);
            cristalLatent.fillCircle(0, -hMax * 0.55, 1.5);
            cristalLatent.x = x;
            cristalLatent.y = yBase;
            cristalLatent.setScrollFactor(1.25, 0);
            cristalLatent.setDepth(6);
            cristalLatent.setAlpha(0.25); // état latent — réveillé par le joueur
            objets.push(cristalLatent);
        }

        g.x = x;
        g.y = yBase;
        g.setScrollFactor(1.25, 0);
        g.setDepth(5);

        // Métadonnées pour interactions
        g._givreCG = {
            phase: rng() * Math.PI * 2,
            yBase: yBase,
            resonance: 0,
            cristalLatent
        };
        objets.push(g);
    }

    return objets;
}

// Éclats cristallins tombants : émetteur de particules petits éclats qui
// tombent en diagonale très lente avec rotation. Équivalent tisons des Halls,
// mais ADD violet-blanc et chute beaucoup plus lente (le froid ralentit tout).
function preparerTextureEclatCristal(scene) {
    const id = '_eclat_cristal_cristaux_glaces';
    if (scene.textures.exists(id)) return id;
    const w = 8, h = 4;
    const cv = scene.textures.createCanvas(id, w, h);
    const ctx = cv.getContext();
    const gradient = ctx.createLinearGradient(0, 0, w, 0);
    gradient.addColorStop(0,   'rgba(230, 210, 255, 0)');
    gradient.addColorStop(0.5, 'rgba(220, 200, 255, 0.95)');
    gradient.addColorStop(1,   'rgba(180, 160, 230, 0.3)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    cv.refresh();
    return id;
}

function poserEclatsCristallinTombants(scene, dims, rng) {
    const objets = [];
    preparerTextureEclatCristal(scene);

    const em = scene.add.particles(0, 0, '_eclat_cristal_cristaux_glaces', {
        x: { min: -100, max: 1060 },
        y: -20,
        lifespan: 10000,
        speedY: { min: 22, max: 45 }, // beaucoup plus lent que les tisons (gravité figée)
        speedX: { min: -6, max: 4 },
        scale: { start: 0.9, end: 1.1 },
        rotate: { start: 0, end: 360 },
        alpha: { start: 0.85, end: 0.15 },
        blendMode: Phaser.BlendModes.ADD,
        tint: [0xe0c8ff, 0xb898e8, 0xc8c0e8],
        quantity: 1,
        frequency: 2800
    });
    em.setScrollFactor(0.9, 0);
    em.setDepth(7);
    objets.push(em);

    return objets;
}

// Stalactites pendantes (remplace les chaînes des Halls) : 1-2 par écran,
// pointes cristallines qui pendent verticalement avec sway très lent.
function poserStalactitesPendantes(scene, dims, rng, palette) {
    const objets = [];
    const nbStalactites = 1 + Math.floor(rng() * 2);

    for (let i = 0; i < nbStalactites; i++) {
        const g = scene.add.graphics();
        const xBase = 80 + rng() * 800;
        const longueur = 90 + rng() * 90;

        // Forme : triangle long pointu vers le bas + petites facettes
        const couleurStalactite = 0x10182a;
        const couleurFacette = 0x3a4a6a;
        const largeurHaut = 14;

        // Corps principal
        g.fillStyle(couleurStalactite, 0.92);
        g.beginPath();
        g.moveTo(-largeurHaut / 2, 0);
        g.lineTo(largeurHaut / 2, 0);
        g.lineTo(0, longueur);
        g.closePath();
        g.fillPath();

        // Facette éclairée (droite)
        g.fillStyle(couleurFacette, 0.65);
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(largeurHaut / 2, 0);
        g.lineTo(0, longueur);
        g.closePath();
        g.fillPath();

        // Petits cristaux secondaires sur le corps (1-3 selon hasard)
        const nbCristaux = 1 + Math.floor(rng() * 3);
        for (let k = 0; k < nbCristaux; k++) {
            const yC = longueur * (0.2 + rng() * 0.6);
            const cote = rng() < 0.5 ? -1 : 1;
            const xC = cote * (largeurHaut / 2 - 2) * (1 - yC / longueur);
            g.fillStyle(couleurStalactite, 0.85);
            g.beginPath();
            g.moveTo(xC, yC);
            g.lineTo(xC + cote * 4, yC + 2);
            g.lineTo(xC, yC + 8 + rng() * 6);
            g.closePath();
            g.fillPath();
        }

        // Petit cristal mnésique lumineux à la pointe (rare)
        if (rng() < 0.45) {
            const lueur = scene.add.graphics();
            lueur.setBlendMode(Phaser.BlendModes.ADD);
            lueur.fillStyle(palette.racine, 0.5);
            lueur.fillCircle(0, longueur, 3);
            lueur.fillStyle(0xe0c8ff, 0.7);
            lueur.fillCircle(0, longueur, 1);
            lueur.x = xBase;
            lueur.y = -10;
            lueur.setScrollFactor(1.15, 0);
            lueur.setDepth(7);
            scene.tweens.add({
                targets: lueur,
                alpha: { from: 0.4, to: 1.0 },
                duration: 3500 + rng() * 1500,
                ease: 'Sine.InOut',
                yoyo: true,
                repeat: -1
            });
            objets.push(lueur);
        }

        g.x = xBase;
        g.y = -10;
        g.setScrollFactor(1.15, 0);
        g.setDepth(6);

        // Sway très lent (la stalactite est lourde et figée — bouge à peine)
        scene.tweens.add({
            targets: g,
            rotation: { from: -0.025, to: 0.025 },
            duration: 7500 + rng() * 3500,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
        objets.push(g);
    }

    return objets;
}

// Bokeh foreground cristaux : grosses formes très floutées violet-bleu qui
// passent en parallax 1.4-1.6 (vs braises orange des Halls).
function poserBokehCristaux(scene, dims, rng) {
    const objets = [];
    const nbBokeh = 3;
    const couleurs = [0xb898e8, 0x80a0d0, 0xd0c0f0];

    for (let i = 0; i < nbBokeh; i++) {
        const g = scene.add.graphics();
        const couleur = couleurs[i % couleurs.length];
        const r = 38 + rng() * 28;

        g.setBlendMode(Phaser.BlendModes.ADD);
        for (let l = 0; l < 4; l++) {
            const rad = r * (1 - l * 0.18);
            const alpha = 0.04 + l * 0.025;
            g.fillStyle(couleur, alpha);
            g.fillCircle(0, 0, rad);
        }

        g.x = 100 + rng() * 800;
        g.y = GAME_HEIGHT - 30 - rng() * 60;
        g.setScrollFactor(1.45 + rng() * 0.15, 0);
        g.setDepth(8);

        // Drift vertical lent + pulse alpha (le cristal palpite à l'échelle géologique)
        scene.tweens.add({
            targets: g,
            y: g.y + (rng() - 0.5) * 14,
            duration: 8000 + rng() * 5000,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
        scene.tweens.add({
            targets: g,
            alpha: { from: 0.5, to: 1.0 },
            duration: 3200 + rng() * 1800,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
        objets.push(g);
    }

    return objets;
}

// ============================================================
// SILHOUETTES TÉMOINS — équivalent priants des Halls / vestiges des Ruines
// ============================================================
//
// 1-2 par run. Figures DEBOUT immobiles (vs agenouillées des Halls), très
// transparentes. Apparaissent par fade lent, restent immobiles 8-12 s,
// disparaissent. Évoquent les Témoins fossilisés par le Reflux — ceux qui
// regardaient au moment où la Trame s'est figée.

function peindreTemoinDebout(scene, couleur, alpha) {
    const g = scene.add.graphics();
    g.fillStyle(couleur, alpha);
    // Corps allongé vertical (robe longue)
    g.fillEllipse(0, -16, 10, 28);
    // Tête levée (regarde vers le haut — Témoin du ciel cristallin)
    g.fillCircle(0, -34, 4);
    // Capuchon / linceul
    g.fillStyle(couleur, alpha * 0.7);
    g.fillEllipse(0, -32, 9, 7);
    // Bras pendants (très subtils)
    g.fillStyle(couleur, alpha * 0.85);
    g.fillEllipse(-4, -14, 3, 12);
    g.fillEllipse(4, -14, 3, 12);
    return g;
}

function poserSilhouettesTemoins(scene, dims, rng, palette) {
    const objets = [];
    const nbTemoins = 1 + Math.floor(rng() * 2);

    for (let v = 0; v < nbTemoins; v++) {
        const couleur = rng() < 0.6 ? 0x4a5a78 : 0x5a4a78; // bleu-gris ou bleu-violet
        const alphaCible = 0.22 + rng() * 0.10;
        const temoin = peindreTemoinDebout(scene, couleur, 1);
        temoin.setAlpha(0);
        temoin.setScrollFactor(0.4, 0);
        temoin.setDepth(DEPTH.SILHOUETTES + 1);

        const yPos = GAME_HEIGHT - 25 - rng() * 8;
        temoin.y = yPos;

        const dureeCycle = 45000 + rng() * 30000;
        const delaiInitial = 5000 + v * 20000 + rng() * 10000;

        const lancerCycle = () => {
            const xPos = 80 + Math.random() * 800;
            temoin.x = xPos;
            temoin.alpha = 0;
            temoin.y = GAME_HEIGHT - 25 - Math.random() * 8;

            // Fade in lent
            scene.tweens.add({
                targets: temoin,
                alpha: alphaCible,
                duration: 3000,
                ease: 'Sine.Out'
            });
            // Reste 8-12 s immobile, pulse alpha très subtil
            const dureeImmobile = 8000 + Math.random() * 4000;
            const pulse = scene.tweens.add({
                targets: temoin,
                alpha: { from: alphaCible * 0.80, to: alphaCible },
                duration: 1800,
                ease: 'Sine.InOut',
                yoyo: true,
                repeat: -1,
                delay: 3000
            });
            scene.time.delayedCall(3000 + dureeImmobile, () => {
                pulse.stop();
                scene.tweens.add({
                    targets: temoin,
                    alpha: 0,
                    duration: 3000,
                    ease: 'Sine.In'
                });
            });
            scene.time.delayedCall(dureeCycle, lancerCycle);
        };

        scene.time.delayedCall(delaiInitial, lancerCycle);
        objets.push(temoin);
    }

    return objets;
}

// ============================================================
// TEMPÊTE CRISTALLINE (météo) — équivalent cendre tombante des Halls
// ============================================================
//
// Flocons cristallins bleu-blanc qui tombent verticalement, viewport entier.
// Cycle météo (3-5 % du temps en mode normal) ou forcé en salle de boss.

function preparerTextureFloconCristal(scene) {
    const id = '_flocon_cristal_cristaux_glaces';
    if (scene.textures.exists(id)) return id;
    const w = 4, h = 4;
    const cv = scene.textures.createCanvas(id, w, h);
    const ctx = cv.getContext();
    const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gradient.addColorStop(0,   'rgba(220, 230, 255, 0.85)');
    gradient.addColorStop(0.6, 'rgba(160, 180, 230, 0.5)');
    gradient.addColorStop(1,   'rgba(80,  120, 180, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    cv.refresh();
    return id;
}

function poserTempeteCristalline(scene, dims, rng, options = {}) {
    const objets = [];
    preparerTextureFloconCristal(scene);
    const forcer = options.forcer === true;

    // Mode boss = pluie cristalline dense (rideau visible en permanence) ;
    // mode météo = chute fine et silencieuse.
    const em = scene.add.particles(0, 0, '_flocon_cristal_cristaux_glaces', {
        x: { min: -100, max: 1060 },
        y: -20,
        lifespan: forcer ? 8000 : 6500,
        speedY: { min: forcer ? 90 : 65, max: forcer ? 150 : 110 },
        speedX: { min: -15, max: -3 },
        scale: { start: forcer ? 1.3 : 1.0, end: forcer ? 1.0 : 0.8 },
        alpha: { start: forcer ? 0.75 : 0.55, end: forcer ? 0.50 : 0.32 },
        rotate: { start: 0, end: 90 },
        quantity: forcer ? 9 : 3,
        frequency: forcer ? 40 : 100,
        emitting: forcer
    });
    em.setScrollFactor(0, 0);
    em.setDepth(8);
    objets.push(em);

    // En mode boss, deuxième émetteur "gros flocons" arrière-plan pour
    // profondeur dans la chute.
    if (forcer) {
        const emArriere = scene.add.particles(0, 0, '_flocon_cristal_cristaux_glaces', {
            x: { min: -100, max: 1060 },
            y: -20,
            lifespan: 9500,
            speedY: { min: 50, max: 90 },
            speedX: { min: -10, max: 0 },
            scale: { start: 2.0, end: 1.7 },
            alpha: { start: 0.32, end: 0.18 },
            rotate: { start: 0, end: 60 },
            quantity: 4,
            frequency: 100
        });
        emArriere.setScrollFactor(0, 0);
        emArriere.setDepth(6);
        objets.push(emArriere);
    }

    if (forcer) return objets;

    // Cycle météo
    const lancerCycleCristal = () => {
        const pauseAvant = 55000 + Math.random() * 80000;
        scene.time.delayedCall(pauseAvant, () => {
            em.start();
            const dureeCristal = 25000 + Math.random() * 25000;
            scene.time.delayedCall(dureeCristal, () => {
                em.stop();
                lancerCycleCristal();
            });
        });
    };
    if (Math.random() < 0.5) {
        scene.time.delayedCall(2000 + Math.random() * 4000, () => {
            em.start();
            const dureeInit = 25000 + Math.random() * 20000;
            scene.time.delayedCall(dureeInit, () => {
                em.stop();
                lancerCycleCristal();
            });
        });
    } else {
        lancerCycleCristal();
    }

    return objets;
}

// ============================================================
// INTERACTIONS VIVANTES — givre résonant + atterrissage + cycle "pulsation mnésique"
// ============================================================
//
// Tick `postupdate` qui :
//   - applique un léger frémissement aux croûtes de givre (respiration cristalline)
//   - applique une résonance violet ADD quand le joueur passe (la mémoire reconnaît
//     le Vestige et brille brièvement à son passage)
//   - détecte l'atterrissage et émet une gerbe d'éclats ADD violet-blanc + nuage
//     de givre
//
// Cycle "pulsation mnésique" toutes les 18-30 s (vs souffle de fournaise 15-25 s
// des Halls) : vague où tous les cristaux latents s'illuminent brièvement
// comme si une mémoire commune se réveillait.

function enregistrerInteractionsCristauxGlaces(scene, givres, emetteurEclats) {
    let etaitAuSol = true;
    let pulsationCible = 0;
    let pulsationCourante = 0;

    // Cycle "pulsation mnésique" — toutes les 18-30 s, vague qui réveille tous
    // les cristaux latents pendant 5-7 s.
    const declencherPulsation = () => {
        pulsationCible = 0.85;
        const duree = 5000 + Math.random() * 2000;
        scene.time.delayedCall(duree, () => {
            pulsationCible = 0;
            scene.time.delayedCall(18000 + Math.random() * 12000, declencherPulsation);
        });
    };
    scene.time.delayedCall(8000 + Math.random() * 6000, declencherPulsation);

    const updTick = () => {
        const player = scene.player;
        if (!player) return;

        pulsationCourante += (pulsationCible - pulsationCourante) * 0.025;

        const px = player.x;
        const time = scene.time.now;
        const cam = scene.cameras.main;
        const playerScreenX = px - cam.scrollX;

        for (const croute of givres) {
            const meta = croute._givreCG;
            if (!meta) continue;

            // Frémissement sinusoïdal de base (respiration cristalline très subtile)
            const fremis = Math.sin(time * 0.0005 + meta.phase) * 0.015;

            // Résonance violet quand le joueur passe à proximité (la mémoire brille)
            const crouteScreenX = croute.x - cam.scrollX * 1.25;
            const dx = crouteScreenX - playerScreenX;
            const dist = Math.abs(dx);
            let resonanceCible = 0;
            if (dist < 80) {
                resonanceCible = (80 - dist) / 80;
            }
            meta.resonance += (resonanceCible - meta.resonance) * 0.12;

            croute.rotation = fremis;

            // Le cristal latent (s'il existe) brille selon la résonance courante
            // + la pulsation mnésique globale
            if (meta.cristalLatent) {
                const alpha = 0.25 + meta.resonance * 0.75 + pulsationCourante * 0.40 * (1 - meta.resonance);
                meta.cristalLatent.setAlpha(Math.min(1, alpha));
            }
        }

        // Détection atterrissage
        const auSol = !!(player.body && (player.body.blocked.down || (player.body.onFloor && player.body.onFloor())));
        if (auSol && !etaitAuSol) {
            // Gerbe d'éclats cristallins ADD (équivalent gerbe étincelles Halls)
            if (emetteurEclats && emetteurEclats.emitParticleAt) {
                for (let k = 0; k < 6 + Math.floor(Math.random() * 4); k++) {
                    emetteurEclats.emitParticleAt(px + (Math.random() - 0.5) * 16, player.y + 24, 1);
                }
            }
            // Nuage de givre au pied — blanc-bleu, bas et large
            const nuage = scene.add.graphics();
            nuage.fillStyle(0xb8c8e8, 0.55);
            nuage.fillEllipse(0, 0, 18, 5);
            nuage.x = px;
            nuage.y = player.y + 30;
            nuage.setDepth(7);
            scene.tweens.add({
                targets: nuage,
                scale: 2.5,
                alpha: 0,
                duration: 480,
                onComplete: () => nuage.destroy()
            });
            // Petite gerbe violet-blanc ADD ponctuelle (les souvenirs se réveillent au choc)
            const gerbe = scene.add.graphics();
            gerbe.setBlendMode(Phaser.BlendModes.ADD);
            gerbe.fillStyle(0xe0c8ff, 0.7);
            gerbe.fillCircle(0, 0, 4);
            gerbe.x = px;
            gerbe.y = player.y + 26;
            gerbe.setDepth(8);
            scene.tweens.add({
                targets: gerbe,
                scale: 3,
                alpha: 0,
                duration: 380,
                onComplete: () => gerbe.destroy()
            });
        }
        etaitAuSol = auSol;
    };

    scene.events.on('postupdate', updTick);
    scene.events.once('shutdown', () => scene.events.off('postupdate', updTick));
}

// ============================================================
// BRUME CRISTALLINE VOLUMÉTRIQUE AU SOL — réactive au joueur + onde de parry
// ============================================================
//
// Même structure que les Halls (brume volumétrique), palette bleu-violet froid.

function poserBrumeVolumetriqueAuSol(scene, dims, rng, palette) {
    const objets = [];
    const blobs = [];
    const yBase = GAME_HEIGHT - 14;
    const nbBlobs = 14;
    const couleur = palette.brume;

    for (let i = 0; i < nbBlobs; i++) {
        const g = scene.add.graphics();
        const rayonX = 60 + rng() * 50;
        const rayonY = 14 + rng() * 8;
        g.fillStyle(couleur, 0.22);
        g.fillEllipse(0, 0, rayonX * 1.4, rayonY * 1.4);
        g.fillStyle(couleur, 0.34);
        g.fillEllipse(0, 0, rayonX, rayonY);
        g.fillStyle(teinterPlusSombre(couleur, 0.15), 0.45);
        g.fillEllipse(0, 0, rayonX * 0.6, rayonY * 0.7);

        g.x = (i / nbBlobs) * (GAME_WIDTH + 200) - 100 + (rng() - 0.5) * 50;
        g.y = yBase + (rng() - 0.5) * 12;
        g.setScrollFactor(0.85, 0);
        g.setDepth(9);

        g._brumeBlob = {
            alphaBase: 0.75 + rng() * 0.20,
            alphaCible: 0.75 + rng() * 0.20,
            alphaCourant: 0.75 + rng() * 0.20,
            dissipationParryFin: 0
        };
        g.setAlpha(g._brumeBlob.alphaBase);

        scene.tweens.add({
            targets: g,
            x: g.x + 40 + rng() * 30,
            duration: 25000 + rng() * 15000,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
        scene.tweens.add({
            targets: g,
            y: g.y + (rng() - 0.5) * 8,
            duration: 10000 + rng() * 5000,
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
    const rayonClairete = 110;
    const reductionMax = 0.85;
    const rayonOndeParry = 200;
    const dureeOnde = 500;

    const updTick = () => {
        const player = scene.player;
        if (!player || blobs.length === 0) return;

        const playerScreenX = player.x - cam.scrollX;
        const playerScreenY = player.y - cam.scrollY;
        const now = scene.time.now;

        for (const blob of blobs) {
            const meta = blob._brumeBlob;
            if (!meta) continue;

            const blobScreenX = blob.x - cam.scrollX * 0.85;
            const blobScreenY = blob.y;

            const dx = blobScreenX - playerScreenX;
            const dy = blobScreenY - playerScreenY;
            const dist = Math.hypot(dx, dy * 0.7);

            let cible = meta.alphaBase;
            if (dist < rayonClairete) {
                const facteur = 1 - dist / rayonClairete;
                cible = meta.alphaBase * (1 - reductionMax * facteur);
            }

            if (now < meta.dissipationParryFin) {
                const reste = (meta.dissipationParryFin - now) / dureeOnde;
                cible *= (1 - reste * 0.95);
            }

            meta.alphaCourant += (cible - meta.alphaCourant) * 0.12;
            blob.setAlpha(meta.alphaCourant);
        }
    };

    scene.events.on('postupdate', updTick);

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
// FLOCONS / ESPRITS — 10 réactifs + 25 lointains (équivalent escarbilles)
// ============================================================
//
// Les esprits-flocons dérivent en LATÉRAL (vs ascendant pour les escarbilles
// chaudes des Halls), traduisant l'équilibre figé du froid. Réactifs fuient
// le joueur sans biais directionnel marqué.

function preparerTextureEspritFlocon(scene) {
    const id = '_esprit_flocon_cristaux_glaces';
    if (scene.textures.exists(id)) return id;
    const w = 10, h = 10;
    const cv = scene.textures.createCanvas(id, w, h);
    const ctx = cv.getContext();
    const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gradient.addColorStop(0,   'rgba(240, 230, 255, 1)');
    gradient.addColorStop(0.4, 'rgba(200, 180, 240, 0.7)');
    gradient.addColorStop(1,   'rgba(140, 130, 200, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    cv.refresh();
    return id;
}

function poserFloconsLointains(scene, dims, rng) {
    const objets = [];
    preparerTextureEspritFlocon(scene);
    const nb = 25;
    const largeurEtendue = dims.largeur * 1.5;
    const decalageX = -dims.largeur * 0.25;

    for (let i = 0; i < nb; i++) {
        const flo = scene.add.image(0, 0, '_esprit_flocon_cristaux_glaces');
        flo.setBlendMode(Phaser.BlendModes.ADD);
        const baseX = decalageX + (i / nb) * largeurEtendue + (rng() - 0.5) * 30;
        const baseY = 220 + rng() * 240;
        flo.x = baseX;
        flo.y = baseY;
        flo.setScale(0.4 + rng() * 0.3);
        flo.setAlpha(0.35 + rng() * 0.30);
        flo.setScrollFactor(0.4, 0);
        flo.setDepth(DEPTH.SILHOUETTES + 2);

        // Drift équilibré horizontal + descente très lente (vs ascendant des Halls)
        const phase = rng() * Math.PI * 2;
        const amplX = 18 + rng() * 22;
        const amplY = 22 + rng() * 18;
        const periode = 7500 + rng() * 4500; // plus lent que les Halls
        scene.tweens.add({
            targets: flo,
            x: { from: baseX - amplX, to: baseX + amplX },
            duration: periode,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1,
            delay: phase * 500
        });
        scene.tweens.add({
            targets: flo,
            y: baseY + amplY, // descendant léger (vs montant pour les escarbilles)
            duration: periode * 0.95,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1,
            delay: phase * 300
        });
        // Pulse alpha très lent (l'esprit "respire")
        scene.tweens.add({
            targets: flo,
            alpha: { from: flo.alpha * 0.4, to: flo.alpha },
            duration: 2000 + rng() * 1200,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
        objets.push(flo);
    }

    return objets;
}

function poserEspritsFloconsReactifs(scene, dims, rng) {
    const objets = [];
    const esprits = [];
    preparerTextureEspritFlocon(scene);
    const nb = 10;

    for (let i = 0; i < nb; i++) {
        const flo = scene.add.image(0, 0, '_esprit_flocon_cristaux_glaces');
        flo.setBlendMode(Phaser.BlendModes.ADD);
        const ancrageX = 80 + rng() * Math.max(200, dims.largeur - 160);
        const ancrageY = GAME_HEIGHT - 140 - rng() * 200;
        flo.x = ancrageX;
        flo.y = ancrageY;
        flo.setScale(0.85 + rng() * 0.5);
        flo.setAlpha(0.55 + rng() * 0.25);
        flo.setScrollFactor(1.0, 0);
        flo.setDepth(15);

        flo._espritFlocon = {
            ancrageX,
            ancrageY,
            phase: rng() * Math.PI * 2,
            amplX: 18 + rng() * 20,
            amplY: 14 + rng() * 12,
            vitesse: 0.0005 + rng() * 0.0003, // plus lent que les Halls
            fuiteVX: 0,
            fuiteVY: 0
        };

        scene.tweens.add({
            targets: flo,
            alpha: { from: flo.alpha * 0.45, to: flo.alpha },
            duration: 1400 + rng() * 800,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });

        esprits.push(flo);
        objets.push(flo);
    }

    return { objets, esprits };
}

function enregistrerInteractionsEsprits(scene, esprits) {
    const cam = scene.cameras.main;
    const rayonFuite = 70;
    const forceFuite = 0.45;

    const updTick = () => {
        const player = scene.player;
        if (!player || esprits.length === 0) return;
        const time = scene.time.now;
        const playerScreenX = player.x - cam.scrollX;
        const playerScreenY = player.y - cam.scrollY;

        for (const flo of esprits) {
            const meta = flo._espritFlocon;
            if (!meta) continue;

            // Drift sinusoïdal équilibré (vs biais montant pour les escarbilles)
            const baseX = meta.ancrageX + Math.sin(time * meta.vitesse + meta.phase) * meta.amplX;
            const baseY = meta.ancrageY + Math.cos(time * meta.vitesse * 1.3 + meta.phase) * meta.amplY;

            // Fuite radiale du joueur — pas de biais directionnel (équilibre figé)
            const floScreenX = flo.x - cam.scrollX * 1.0;
            const floScreenY = flo.y;
            const dx = floScreenX - playerScreenX;
            const dy = floScreenY - playerScreenY;
            const dist = Math.hypot(dx, dy);
            if (dist < rayonFuite && dist > 0.1) {
                const facteur = (rayonFuite - dist) / rayonFuite;
                meta.fuiteVX += (dx / dist) * forceFuite * facteur * 0.6;
                meta.fuiteVY += (dy / dist) * forceFuite * facteur * 0.6;
            }
            meta.fuiteVX *= 0.92;
            meta.fuiteVY *= 0.92;

            flo.x = baseX + meta.fuiteVX * 30;
            flo.y = baseY + meta.fuiteVY * 30;
        }
    };
    scene.events.on('postupdate', updTick);
    scene.events.once('shutdown', () => scene.events.off('postupdate', updTick));
}

// ============================================================
// PHASE 5'.17 — CITÉ MINIMALISTE + TOUR CRISTALLINE CENTRALE
// ============================================================
//
// Refonte radicale : abandon de l'arbre cristallin (trop gourmand, ~100
// Graphics + 80 tweens) et des temples détaillés (cariatides, vitraux,
// frises sculptées). Direction inspirée du pattern Ruines basses qui
// marche bien : silhouettes simples + cohérence chromatique + touches
// lumineuses parsemées.
//
// 4 couches de profondeur clairement distinctes (effet d'optique tangible) :
//   - Couche 1 (sF 0.05) : skyline très lointaine, formes mini bleu sombre
//   - Couche 2 (sF 0.15) : cité lointaine variée (maisons + temples + tholos
//                         + statues + cyprès cristallins), bleu nuit
//   - Couche 3 (sF 0.15) : tour cristalline centrale (focal du biome)
//   - Couche 4 (sF 0.30) : 3 structures moyen plan (temples péristyles
//                         et bâtiments monumentaux), bleu plus clair
//
// Performance : chaque couche = 1 ou 2 Graphics seulement (vs 8-15 avant).
// Tweens : 3-4 au total (vs 50+ avant).

// ============================================================
// COUCHE 1 — SKYLINE TRÈS LOINTAINE (scrollFactor 0.05)
// ============================================================

function poserSkylineTresLointaine(scene, dims, rng, palette) {
    const objets = [];
    const g = scene.add.graphics();
    const largeurEtendue = dims.largeur * 1.6;
    const decalageX = -dims.largeur * 0.3;
    // Phase 5'.18 — surélevée à GAME_HEIGHT - 150 (vs -50) pour qu'elle soit
    // visible au-dessus du sol, comme une vraie skyline urbaine à l'horizon.
    const ySol = GAME_HEIGHT - 150;
    const couleur = 0x0e1424;
    const couleurClair = 0x1a2438;
    const couleurMontagne = 0x080c1a; // encore plus sombre, suggère relief lointain

    // Profil de collines lointaines en arrière (suggère un relief sous la cité)
    g.fillStyle(couleurMontagne, 1);
    g.beginPath();
    g.moveTo(decalageX, ySol);
    const nbBosses = 8;
    for (let i = 0; i <= nbBosses; i++) {
        const x = decalageX + (i / nbBosses) * largeurEtendue;
        const yB = ySol - 8 - Math.sin(i * 0.8) * 12 - rng() * 8;
        g.lineTo(x, yB);
    }
    g.lineTo(decalageX + largeurEtendue, ySol);
    g.closePath();
    g.fillPath();

    // Skyline : 24 éléments en slots ESPACÉS (largeurEtendue / 24 ≈ 65 px)
    // Hauteurs et types variés
    g.fillStyle(couleur, 1);
    const nbSlots = 24;
    const pas = largeurEtendue / nbSlots;
    for (let i = 0; i < nbSlots; i++) {
        if (rng() < 0.15) continue; // gap aléatoire pour respirer
        const x = decalageX + (i + 0.5) * pas + (rng() - 0.5) * 12;
        const choix = rng();
        if (choix < 0.30) {
            // Maison cubique
            const w = 14 + rng() * 18;
            const h = 16 + rng() * 22;
            g.fillStyle(couleur, 1);
            g.fillRect(x - w / 2, ySol - h, w, h);
            g.beginPath();
            g.moveTo(x - w / 2 - 1, ySol - h);
            g.lineTo(x, ySol - h - 4);
            g.lineTo(x + w / 2 + 1, ySol - h);
            g.closePath();
            g.fillPath();
        } else if (choix < 0.55) {
            // Dôme rond (petit temple lointain)
            const w = 16 + rng() * 14;
            const h = 18 + rng() * 14;
            g.fillRect(x - w / 2, ySol - h * 0.55, w, h * 0.55);
            g.fillEllipse(x, ySol - h * 0.55, w * 0.95, h * 0.5);
        } else if (choix < 0.80) {
            // Tour haute (signature variation skyline)
            const wT = 5 + rng() * 4;
            const hT = 35 + rng() * 30; // BEAUCOUP plus haute (vs 8-30 avant)
            g.fillRect(x - wT / 2, ySol - hT, wT, hT);
            // Petit toit conique
            g.beginPath();
            g.moveTo(x - wT / 2 - 1, ySol - hT);
            g.lineTo(x, ySol - hT - 6);
            g.lineTo(x + wT / 2 + 1, ySol - hT);
            g.closePath();
            g.fillPath();
            // Petite croix/girouette
            g.fillRect(x - 0.5, ySol - hT - 9, 1, 3);
        } else {
            // Grand temple avec fronton (rare, plus large)
            const w = 28 + rng() * 16;
            const h = 22 + rng() * 14;
            g.fillRect(x - w / 2, ySol - h, w, h);
            // Fronton bas
            g.beginPath();
            g.moveTo(x - w / 2 - 3, ySol - h);
            g.lineTo(x, ySol - h - 6);
            g.lineTo(x + w / 2 + 3, ySol - h);
            g.closePath();
            g.fillPath();
        }
    }

    // 2 lignes d'horizon discrètes — perspective atmosphérique très propre
    g.fillStyle(couleurClair, 0.7);
    g.fillRect(decalageX, ySol - 0.5, largeurEtendue, 1);
    g.fillStyle(couleurClair, 0.35);
    g.fillRect(decalageX, ySol - 12, largeurEtendue, 0.6);

    g.setScrollFactor(0.04, 0);
    g.setDepth(DEPTH.SILHOUETTES - 4);
    objets.push(g);

    return objets;
}

// ============================================================
// COUCHE 2 — CITÉ LOINTAINE VARIÉE (scrollFactor 0.15)
// ============================================================
//
// Une seule couche Graphics qui dessine 10-12 structures variées formant
// une vraie petite cité (pas que des temples) : maisons cubiques, temples
// à fronton, tholos rotondes, statues sur piédestal, cyprès cristallins.
// Tout en silhouettes bleu nuit opaques, sans alpha.

function poserCiteLointaineSimple(scene, dims, rng, palette) {
    const objets = [];
    const g = scene.add.graphics();
    const fenetres = scene.add.graphics();
    fenetres.setBlendMode(Phaser.BlendModes.ADD);
    const largeurEtendue = dims.largeur * 1.6;
    const decalageX = -dims.largeur * 0.3;
    // Phase 5'.18 — surélevée à GAME_HEIGHT - 120 (vs -50)
    const ySol = GAME_HEIGHT - 120;
    const xCentre = dims.largeur / 2;
    const exclusionCentre = 200;
    const couleur = 0x1a2a44;
    const couleurClair = 0x2a3e5e;
    const couleurOmbre = 0x0a1224;
    const couleurFenetre = 0xffcc66; // jaune-orange chaud (lumière intérieure)

    g.fillStyle(couleur, 1);

    // Phase 5'.18 — slots fixes avec espacement garanti (vs aléa)
    // 12 slots de ~95 px chacun, distance min 60 px entre 2 bâtiments
    const nb = 12;
    const pas = largeurEtendue / nb;
    const positions = [];
    for (let i = 0; i < nb; i++) {
        const xRaw = decalageX + (i + 0.5) * pas + (rng() - 0.5) * 18;
        if (Math.abs(xRaw - xCentre) < exclusionCentre) continue;
        positions.push(xRaw);
    }

    for (let idx = 0; idx < positions.length; idx++) {
        const x = positions[idx];
        // Phase 5'.18 — variation forte de hauteurs : tous les 5e bâtiments
        // est une GRANDE TOUR (130-180 px) pour briser la monotonie
        const estGrandeTour = (idx % 5 === 4);
        const choix = estGrandeTour ? 0.95 : rng() * 0.90;
        if (choix < 0.30) {
            // Maison cubique avec toit triangulaire — plus haute qu'avant
            const w = 36 + rng() * 28;
            const h = 55 + rng() * 35; // 55-90 (vs 35-63 avant)
            // Corps
            g.fillStyle(couleur, 1);
            g.fillRect(x - w / 2, ySol - h, w, h);
            // Toit triangulaire
            g.fillStyle(couleurOmbre, 1);
            g.beginPath();
            g.moveTo(x - w / 2 - 4, ySol - h);
            g.lineTo(x, ySol - h - h * 0.40);
            g.lineTo(x + w / 2 + 4, ySol - h);
            g.closePath();
            g.fillPath();
            // Highlight face droite
            g.fillStyle(couleurClair, 0.5);
            g.fillRect(x + w / 2 - 3, ySol - h + 4, 3, h - 4);
            // Porte sombre
            g.fillStyle(couleurOmbre, 1);
            g.fillRect(x - 4, ySol - 14, 8, 14);
            // FENÊTRES LUMINEUSES (Phase 5'.18) — 2-3 carrés chauds ADD
            const nbFen = 1 + Math.floor(rng() * 3);
            for (let f = 0; f < nbFen; f++) {
                if (rng() < 0.70) {
                    const xF = x - w * 0.30 + (f / nbFen) * w * 0.60;
                    const yF = ySol - h + h * 0.25 + (f % 2) * h * 0.30;
                    fenetres.fillStyle(couleurFenetre, 0.85);
                    fenetres.fillRect(xF - 1.5, yF - 1.5, 3, 3);
                    fenetres.fillStyle(0xffffff, 0.65);
                    fenetres.fillRect(xF - 0.5, yF - 0.5, 1, 1);
                }
            }
        } else if (choix < 0.50) {
            // Temple à fronton — hauteurs majorées (75-115 vs 50-80)
            const w = 60 + rng() * 35;
            const h = 75 + rng() * 40;
            const hCol = h * 0.65;
            // Stylobate
            g.fillStyle(couleurOmbre, 1);
            g.fillRect(x - w / 2 - 2, ySol - 4, w + 4, 4);
            g.fillRect(x - w / 2, ySol - 7, w, 3);
            // Colonnes (5-6 silhouettes verticales)
            g.fillStyle(couleur, 1);
            const nbCol = 5 + Math.floor(rng() * 2);
            const epCol = 3.5;
            const espCol = (w - nbCol * epCol) / (nbCol - 1);
            for (let c = 0; c < nbCol; c++) {
                const xC = x - w / 2 + c * (epCol + espCol);
                g.fillRect(xC, ySol - 7 - hCol, epCol, hCol);
            }
            // Highlight sur dernière colonne
            g.fillStyle(couleurClair, 0.5);
            g.fillRect(x + w / 2 - epCol + 0.5, ySol - 7 - hCol + 3, 1, hCol - 6);
            // Entablement
            g.fillStyle(couleur, 1);
            g.fillRect(x - w / 2 - 2, ySol - 7 - hCol - 6, w + 4, 6);
            // Fronton
            g.beginPath();
            g.moveTo(x - w / 2 - 4, ySol - 7 - hCol - 6);
            g.lineTo(x, ySol - h - 2);
            g.lineTo(x + w / 2 + 4, ySol - 7 - hCol - 6);
            g.closePath();
            g.fillPath();
            // Acrotère central
            g.fillStyle(couleurClair, 1);
            g.fillCircle(x, ySol - h - 1, 2.5);
            // FENÊTRE LUMINEUSE entre les colonnes (sanctuaire éclairé)
            fenetres.fillStyle(couleurFenetre, 0.55);
            fenetres.fillRect(x - w * 0.20, ySol - 7 - hCol * 0.5, w * 0.40, hCol * 0.30);
        } else if (choix < 0.70) {
            // Tholos (rotonde) — plus haute (55-85 vs 30-50)
            const w = 38 + rng() * 24;
            const h = 55 + rng() * 30;
            g.fillStyle(couleurOmbre, 1);
            g.fillEllipse(x, ySol - 3, w + 8, 6);
            g.fillStyle(couleur, 1);
            g.fillRect(x - w / 2, ySol - 4 - h * 0.60, w, h * 0.60);
            // Coupole
            g.fillEllipse(x, ySol - 4 - h * 0.60, w * 0.95, h * 0.55);
            // Highlight droite
            g.fillStyle(couleurClair, 0.45);
            g.fillRect(x + w / 2 - 4, ySol - 4 - h * 0.55, 4, h * 0.55);
            // Lanterne au sommet ADD
            fenetres.fillStyle(couleurFenetre, 0.75);
            fenetres.fillCircle(x, ySol - 4 - h * 0.60 - h * 0.25, 2);
        } else if (choix < 0.85) {
            // Statue sur piédestal — plus grande (70-105 vs 50-75)
            const w = 16 + rng() * 10;
            const h = 70 + rng() * 35;
            // Piédestal
            g.fillStyle(couleurOmbre, 1);
            g.fillRect(x - w / 2 - 3, ySol - 6, w + 6, 6);
            g.fillRect(x - w / 2, ySol - h * 0.32, w, h * 0.32 - 6);
            // Statue (silhouette ovale + tête)
            g.fillStyle(couleur, 1);
            g.fillEllipse(x, ySol - h * 0.62, w * 0.60, h * 0.58);
            g.fillCircle(x, ySol - h * 0.93, w * 0.22);
            // Highlight droite
            g.fillStyle(couleurClair, 0.5);
            g.fillEllipse(x + w * 0.12, ySol - h * 0.58, w * 0.18, h * 0.42);
        } else if (choix < 0.92) {
            // Cyprès cristallin
            const w = 10 + rng() * 5;
            const h = 80 + rng() * 40;
            g.fillStyle(couleurOmbre, 1);
            g.fillRect(x - 1.5, ySol - 8, 3, 8);
            g.fillStyle(couleur, 1);
            g.beginPath();
            g.moveTo(x, ySol - h);
            g.lineTo(x - w / 2, ySol - h * 0.65);
            g.lineTo(x - w * 0.30, ySol - 8);
            g.lineTo(x + w * 0.30, ySol - 8);
            g.lineTo(x + w / 2, ySol - h * 0.65);
            g.closePath();
            g.fillPath();
            g.fillStyle(couleurClair, 0.45);
            g.beginPath();
            g.moveTo(x, ySol - h);
            g.lineTo(x + w / 2, ySol - h * 0.65);
            g.lineTo(x + w * 0.30, ySol - 8);
            g.lineTo(x, ySol - 8);
            g.closePath();
            g.fillPath();
        } else {
            // GRANDE TOUR / BEFFROI (Phase 5'.18 — signature variation hauteur)
            const wT = 14 + rng() * 8;
            const hT = 140 + rng() * 50; // 140-190 px, brise la skyline plate
            // Corps
            g.fillStyle(couleur, 1);
            g.fillRect(x - wT / 2, ySol - hT, wT, hT);
            // Highlight face droite
            g.fillStyle(couleurClair, 0.55);
            g.fillRect(x + wT / 2 - 3, ySol - hT + 4, 3, hT - 8);
            // Bandes horizontales (étages)
            g.fillStyle(couleurOmbre, 1);
            for (let s = 1; s < 5; s++) {
                g.fillRect(x - wT / 2 - 1, ySol - hT * (s / 5), wT + 2, 2);
            }
            // Toit conique
            g.fillStyle(couleurOmbre, 1);
            g.beginPath();
            g.moveTo(x - wT / 2 - 4, ySol - hT);
            g.lineTo(x, ySol - hT - 12);
            g.lineTo(x + wT / 2 + 4, ySol - hT);
            g.closePath();
            g.fillPath();
            // Pic au sommet (croix / antenne)
            g.fillRect(x - 0.5, ySol - hT - 18, 1, 6);
            g.fillRect(x - 2, ySol - hT - 15, 4, 1);
            // FENÊTRES sur la tour (3-4 étages éclairés)
            for (let e = 1; e <= 4; e++) {
                if (rng() < 0.65) {
                    const yF = ySol - hT * (e / 5) + hT / 10;
                    fenetres.fillStyle(couleurFenetre, 0.85);
                    fenetres.fillRect(x - 1.5, yF - 1, 3, 2.5);
                    fenetres.fillStyle(0xffffff, 0.55);
                    fenetres.fillCircle(x, yF + 0.2, 0.6);
                }
            }
        }
    }

    g.setScrollFactor(0.18, 0); // Phase 5'.18 : étalé de 0.15 vs tour à 0.10
    g.setDepth(DEPTH.SILHOUETTES - 2);
    fenetres.setScrollFactor(0.18, 0);
    fenetres.setDepth(DEPTH.SILHOUETTES - 1);
    objets.push(g);
    objets.push(fenetres);

    // Pulse géologique TRÈS lent pour toutes les fenêtres (1 seul tween partagé)
    scene.tweens.add({
        targets: fenetres,
        alpha: { from: 0.70, to: 1.0 },
        duration: 6000 + rng() * 3000,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });

    return objets;
}

// ============================================================
// COUCHE 3 — TOUR CRISTALLINE CENTRALE (focal, scrollFactor 0.15)
// ============================================================
//
// Remplace l'arbre cristallin. Silhouette verticale simple en obélisque
// effilé avec quelques détails minimaux (3 anneaux d'ornement + pulse
// violet ADD au sommet). Tout dans 2 Graphics (silhouette + lueur ADD).

function poserTourCristallineCentrale(scene, dims, rng, palette) {
    const objets = [];
    const xCentre = dims.largeur / 2;
    const ySol = GAME_HEIGHT - 50;
    const etage = scene.registry.get('etage_courant') ?? 5;
    const facteurEtage = etage <= 5 ? 1.0 : 1.12;

    const hauteur = 360 * facteurEtage;
    const wBase = 70 * facteurEtage;
    const wHaut = 22 * facteurEtage;

    const couleur = 0x1f2e4a;       // bleu profond
    const couleurClair = 0x6890b8;  // highlight face droite
    const couleurOmbre = 0x0a1224;  // ombre profonde
    const couleurReflet = 0xb8d0e8; // reflet vif sur arêtes

    // === SILHOUETTE PRINCIPALE (1 Graphics) ===
    const g = scene.add.graphics();
    g.fillStyle(couleur, 1);

    // Polygone effilé (base trapézoïdale + corps allongé + pointe pyramidale)
    g.beginPath();
    g.moveTo(xCentre - wBase / 2, ySol);
    g.lineTo(xCentre - wBase / 2 + 4, ySol - hauteur * 0.05);
    g.lineTo(xCentre - wHaut / 2 - 4, ySol - hauteur * 0.90);
    g.lineTo(xCentre, ySol - hauteur); // pointe sommet
    g.lineTo(xCentre + wHaut / 2 + 4, ySol - hauteur * 0.90);
    g.lineTo(xCentre + wBase / 2 - 4, ySol - hauteur * 0.05);
    g.lineTo(xCentre + wBase / 2, ySol);
    g.closePath();
    g.fillPath();

    // Face éclairée (droite, plus claire)
    g.fillStyle(couleurClair, 0.55);
    g.beginPath();
    g.moveTo(xCentre, ySol - hauteur);
    g.lineTo(xCentre + wHaut / 2 + 4, ySol - hauteur * 0.90);
    g.lineTo(xCentre + wBase / 2 - 4, ySol - hauteur * 0.05);
    g.lineTo(xCentre + wBase / 2, ySol);
    g.lineTo(xCentre + 1, ySol);
    g.closePath();
    g.fillPath();

    // Face ombrée (gauche)
    g.fillStyle(couleurOmbre, 0.45);
    g.beginPath();
    g.moveTo(xCentre, ySol - hauteur);
    g.lineTo(xCentre - wHaut / 2 - 4, ySol - hauteur * 0.90);
    g.lineTo(xCentre - wBase / 2 + 4, ySol - hauteur * 0.05);
    g.lineTo(xCentre - wBase / 2, ySol);
    g.lineTo(xCentre - 1, ySol);
    g.closePath();
    g.fillPath();

    // 3 anneaux d'ornement horizontaux (sections de la tour)
    const yAnneaux = [0.25, 0.50, 0.75];
    for (const t of yAnneaux) {
        const yA = ySol - hauteur * t;
        // Largeur locale interpolée
        const wLocal = wBase * (1 - t) + wHaut * t;
        // Bande sombre + bande claire au-dessus (relief)
        g.fillStyle(couleurOmbre, 1);
        g.fillRect(xCentre - wLocal / 2 - 3, yA - 3, wLocal + 6, 4);
        g.fillStyle(couleurClair, 0.85);
        g.fillRect(xCentre - wLocal / 2 - 4, yA - 6, wLocal + 8, 2);
        // Petite gemme au centre de l'anneau
        g.fillStyle(couleurReflet, 0.9);
        g.fillCircle(xCentre, yA - 1.5, 2);
    }

    // Arête verticale centrale (highlight reflet sur le bord vif)
    g.lineStyle(1, couleurReflet, 0.6);
    g.beginPath();
    g.moveTo(xCentre, ySol - hauteur);
    g.lineTo(xCentre + 2, ySol - hauteur * 0.5);
    g.lineTo(xCentre + 1, ySol);
    g.strokePath();

    // Pointe sommet (petit losange cristallin)
    g.fillStyle(couleurReflet, 1);
    g.beginPath();
    g.moveTo(xCentre, ySol - hauteur - 8);
    g.lineTo(xCentre + 3, ySol - hauteur);
    g.lineTo(xCentre, ySol - hauteur + 4);
    g.lineTo(xCentre - 3, ySol - hauteur);
    g.closePath();
    g.fillPath();

    g.setScrollFactor(0.10, 0); // Phase 5'.18 — étagé (cité lointaine 0.18)
    g.setDepth(DEPTH.SILHOUETTES - 1);
    objets.push(g);

    // === LUEUR ADD VIOLETTE AU SOMMET (1 Graphics + 1 tween) ===
    const lueur = scene.add.graphics();
    lueur.setBlendMode(Phaser.BlendModes.ADD);
    // Halo doux autour du sommet
    lueur.fillStyle(0xb898e8, 0.45);
    lueur.fillCircle(xCentre, ySol - hauteur, 22);
    lueur.fillStyle(0xe0c8ff, 0.75);
    lueur.fillCircle(xCentre, ySol - hauteur, 10);
    lueur.fillStyle(0xffffff, 0.85);
    lueur.fillCircle(xCentre, ySol - hauteur, 3);
    // Petits cristaux ADD aux 3 anneaux (un point lumineux à chaque gemme)
    for (const t of yAnneaux) {
        const yA = ySol - hauteur * t - 1.5;
        lueur.fillStyle(0xb898e8, 0.45);
        lueur.fillCircle(xCentre, yA, 4);
        lueur.fillStyle(0xffffff, 0.85);
        lueur.fillCircle(xCentre, yA, 1.2);
    }
    lueur.setScrollFactor(0.10, 0); // Phase 5'.18 — étagé
    lueur.setDepth(DEPTH.SILHOUETTES);
    objets.push(lueur);

    // 1 seul tween partagé (pulse géologique de toute la tour)
    scene.tweens.add({
        targets: lueur,
        alpha: { from: 0.55, to: 1.0 },
        duration: 3500 + rng() * 1500,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });

    return objets;
}

// ============================================================
// COUCHE 4 — CITÉ MOYEN PLAN SIMPLIFIÉE (scrollFactor 0.30)
// ============================================================
//
// 3 structures plus grosses (mais toujours en silhouette simple) au plus
// près du joueur. Bleu plus clair pour signaler proximité.

function poserCiteMoyenPlanSimple(scene, dims, rng, palette) {
    const objets = [];
    const g = scene.add.graphics();
    const fenetres = scene.add.graphics();
    fenetres.setBlendMode(Phaser.BlendModes.ADD);
    // Phase 5'.18 — surélevée à GAME_HEIGHT - 80 (vs -40)
    const ySol = GAME_HEIGHT - 80;
    const xCentre = dims.largeur / 2;
    const exclusionCentre = 320;
    const couleur = 0x2a3e5e;
    const couleurClair = 0x4a6890;
    const couleurOmbre = 0x141c2c;
    const couleurFenetre = 0xffcc66;

    // Phase 5'.18 — Slots fixes garantis avec distance min 200 px entre structures
    // 2 structures latérales seulement (vs 3 avec risque de chevauchement)
    const positions = [
        180 + rng() * 50,                            // gauche
        dims.largeur - 180 - rng() * 50              // droite
    ];

    for (const x of positions) {
        if (Math.abs(x - xCentre) < exclusionCentre) continue;
        const choix = rng();
        const h = 170 + rng() * 90;
        const w = h * (0.9 + rng() * 0.5);

        if (choix < 0.55) {
            // Grand temple péristyle (signature cité)
            // Stylobate 3 marches
            g.fillStyle(couleurOmbre, 1);
            for (let m = 0; m < 3; m++) {
                const ext = m * 3;
                g.fillRect(x - w / 2 - ext, ySol - 5 - m * 5, w + ext * 2, 5);
            }
            // Colonnes (6 colonnes verticales)
            const nbCol = 6;
            const epCol = 5 + rng() * 1.5;
            const hCol = h * 0.62;
            const espCol = (w - nbCol * epCol) / (nbCol - 1);
            const yColBas = ySol - 18;
            g.fillStyle(couleur, 1);
            for (let c = 0; c < nbCol; c++) {
                const xC = x - w / 2 + c * (epCol + espCol);
                g.fillRect(xC, yColBas - hCol, epCol, hCol);
            }
            // Highlight (face droite éclairée)
            g.fillStyle(couleurClair, 0.5);
            g.fillRect(x + w / 2 - epCol + 0.5, yColBas - hCol + 4, 1.5, hCol - 8);
            // Entablement
            g.fillStyle(couleur, 1);
            g.fillRect(x - w / 2 - 4, yColBas - hCol - 8, w + 8, 8);
            // Bande claire (frise simple — 1 ligne d'ombres verticales rares)
            g.fillStyle(couleurClair, 1);
            g.fillRect(x - w / 2 - 4, yColBas - hCol - 14, w + 8, 6);
            const nbT = Math.floor(w / 22);
            g.fillStyle(couleurOmbre, 1);
            for (let t = 0; t < nbT; t++) {
                const xT = x - w / 2 + (t + 0.5) * (w / nbT);
                g.fillRect(xT - 1, yColBas - hCol - 14, 2, 6);
            }
            // Corniche
            g.fillStyle(couleur, 1);
            g.fillRect(x - w / 2 - 8, yColBas - hCol - 18, w + 16, 4);
            // Fronton triangulaire
            const yF = yColBas - hCol - 18;
            g.beginPath();
            g.moveTo(x - w / 2 - 8, yF);
            g.lineTo(x, yF - h * 0.20);
            g.lineTo(x + w / 2 + 8, yF);
            g.closePath();
            g.fillPath();
            // Acrotère central
            g.fillStyle(couleurClair, 1);
            g.fillCircle(x, yF - h * 0.20 - 2, 3);
            // Triangle décoratif intérieur
            g.fillStyle(couleurOmbre, 1);
            g.beginPath();
            g.moveTo(x - w * 0.18, yF - 4);
            g.lineTo(x, yF - h * 0.15);
            g.lineTo(x + w * 0.18, yF - 4);
            g.closePath();
            g.fillPath();
            // FENÊTRES LUMINEUSES entre les colonnes (sanctuaire éclairé)
            const nbFen = 3;
            for (let f = 0; f < nbFen; f++) {
                const xF = x - w * 0.30 + (f / (nbFen - 1)) * w * 0.60;
                const yFen = yColBas - hCol * 0.50;
                fenetres.fillStyle(couleurFenetre, 0.85);
                fenetres.fillRect(xF - 2, yFen - 4, 4, 8);
                fenetres.fillStyle(0xffffff, 0.55);
                fenetres.fillCircle(xF, yFen, 1);
            }
        } else {
            // Bâtiment monumental avec entrée arc
            // Socle plat
            g.fillStyle(couleurOmbre, 1);
            g.fillRect(x - w / 2 - 4, ySol - 8, w + 8, 8);
            // Corps principal
            g.fillStyle(couleur, 1);
            g.fillRect(x - w / 2, ySol - h, w, h - 8);
            // Highlight face droite
            g.fillStyle(couleurClair, 0.5);
            g.fillRect(x + w / 2 - 4, ySol - h + 8, 4, h - 16);
            // Toit plat avec moulure
            g.fillStyle(couleur, 1);
            g.fillRect(x - w / 2 - 4, ySol - h - 5, w + 8, 5);
            g.fillStyle(couleurClair, 1);
            g.fillRect(x - w / 2 - 6, ySol - h - 8, w + 12, 3);
            // Entrée en arc cintré (porte centrale sombre)
            const wPorte = w * 0.25;
            const hPorte = h * 0.45;
            g.fillStyle(couleurOmbre, 1);
            g.fillRect(x - wPorte / 2, ySol - 8 - hPorte, wPorte, hPorte);
            // Arc supérieur (demi-ellipse)
            g.fillEllipse(x, ySol - 8 - hPorte, wPorte, wPorte * 0.5);
            // 2 fenêtres rectangulaires de chaque côté
            const wFen = w * 0.10;
            const hFen = h * 0.20;
            for (let side = -1; side <= 1; side += 2) {
                g.fillStyle(couleurOmbre, 1);
                g.fillRect(x + side * w * 0.30 - wFen / 2, ySol - h + h * 0.30, wFen, hFen);
                g.fillRect(x + side * w * 0.30 - wFen / 2, ySol - h + h * 0.60, wFen, hFen);
                // FENÊTRES LUMINEUSES ADD à l'intérieur (Phase 5'.18)
                fenetres.fillStyle(couleurFenetre, 0.85);
                fenetres.fillRect(x + side * w * 0.30 - wFen / 2 + 1, ySol - h + h * 0.30 + 1, wFen - 2, hFen - 2);
                fenetres.fillRect(x + side * w * 0.30 - wFen / 2 + 1, ySol - h + h * 0.60 + 1, wFen - 2, hFen - 2);
                fenetres.fillStyle(0xffffff, 0.45);
                fenetres.fillCircle(x + side * w * 0.30, ySol - h + h * 0.40, 1);
                fenetres.fillCircle(x + side * w * 0.30, ySol - h + h * 0.70, 1);
            }
            // Porte aussi éclairée
            fenetres.fillStyle(couleurFenetre, 0.55);
            fenetres.fillRect(x - wPorte / 2 + 1, ySol - 8 - hPorte + 2, wPorte - 2, hPorte * 0.5);
        }
    }

    g.setScrollFactor(0.32, 0);
    g.setDepth(DEPTH.SILHOUETTES + 1);
    fenetres.setScrollFactor(0.32, 0);
    fenetres.setDepth(DEPTH.SILHOUETTES + 2);
    objets.push(g);
    objets.push(fenetres);

    // 1 seul tween partagé pour pulse de toutes les fenêtres
    scene.tweens.add({
        targets: fenetres,
        alpha: { from: 0.75, to: 1.0 },
        duration: 5500 + rng() * 2500,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });

    return objets;
}

// ============================================================
// COUCHE 5 — CRISTAUX FLOTTANTS ADD (touches lumineuses)
// ============================================================
//
// 10-12 points violet pâle ADD distribués dans le ciel, partagent 1 seul
// tween pour leur pulsation. Équivalent narratif des lucioles vertes des
// Ruines basses, version glacée mnésique.

function poserCristauxFlottants(scene, dims, rng, palette) {
    const objets = [];
    const g = scene.add.graphics();
    g.setBlendMode(Phaser.BlendModes.ADD);

    const nb = 10 + Math.floor(rng() * 3);
    for (let i = 0; i < nb; i++) {
        const x = (i / nb) * dims.largeur * 1.2 - dims.largeur * 0.1 + (rng() - 0.5) * 60;
        const y = 60 + rng() * 280;
        const taille = 1.5 + rng() * 2;
        // Halo violet
        g.fillStyle(0xb898e8, 0.40);
        g.fillCircle(x, y, taille * 2.5);
        // Cœur
        g.fillStyle(0xe0c8ff, 0.85);
        g.fillCircle(x, y, taille);
        // Reflet blanc
        g.fillStyle(0xffffff, 0.85);
        g.fillCircle(x, y, taille * 0.4);
    }
    g.setScrollFactor(0.20, 0);
    g.setDepth(DEPTH.SILHOUETTES);
    objets.push(g);

    // 1 seul tween partagé pour pulse de tous les cristaux (perf)
    scene.tweens.add({
        targets: g,
        alpha: { from: 0.55, to: 1.0 },
        duration: 4000 + rng() * 2000,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });

    return objets;
}

// ============================================================
// COMPOSER PUBLIC
// ============================================================

export function composerParallaxCristauxGlaces(scene, dims, monde, rng) {
    const palette = paletteCouranteScene(scene, monde);
    const objets = [];

    const estSalleBoss = !!scene.registry.get('salle_est_boss');
    const etage = scene.registry.get('etage_courant') ?? 5;

    // === BACKGROUND (5'.17 — refonte minimaliste, cité variée + tour centrale) ===
    // Les anciennes fonctions (arbre cristallin, temples détaillés) sont
    // commentées : trop gourmandes en perf (~100 Graphics + 80 tweens pour
    // l'arbre seul). Nouvelle approche : silhouettes simples + 1 Graphics
    // par couche regroupant toutes les structures.
    //
    // const branches = poserBranchesArbreSommets(scene, dims, rng, palette);
    // if (estSalleBoss) for (const b of branches) b.setAlpha(Math.min(1, (b.alpha ?? 1) * 1.15));
    // objets.push(...branches);
    // objets.push(...poserTemplesGrecsLointains(scene, dims, rng, palette));
    // objets.push(...poserArbreCristallinCentre(scene, dims, rng, palette));
    // objets.push(...poserCiteMoyenPlan(scene, dims, rng, palette));

    // Flocons ambiants qui descendent (cendre figée du Halls cendrés ci-dessous)
    objets.push(...poserFloconsEnSuspension(scene, dims, rng));

    // Couche 1 — skyline très lointaine (scrollFactor 0.05, plat à l'horizon)
    objets.push(...poserSkylineTresLointaine(scene, dims, rng, palette));

    // Couche 2 — cité lointaine variée (maisons + temples + tholos + cyprès)
    objets.push(...poserCiteLointaineSimple(scene, dims, rng, palette));

    // Couche 3 — tour cristalline centrale (focal du biome, scrollFactor 0.15)
    objets.push(...poserTourCristallineCentrale(scene, dims, rng, palette));

    // Couche 4 — cité moyen plan : 3 structures plus proches (scrollFactor 0.30)
    objets.push(...poserCiteMoyenPlanSimple(scene, dims, rng, palette));

    // Couche 5 — cristaux flottants ADD (touches lumineuses violet pâle)
    objets.push(...poserCristauxFlottants(scene, dims, rng, palette));

    // === COUCHES ALPHA D'AMBIANCE — DÉSACTIVÉES (5'.14) ===
    // Le voile d'horizon (haze blanc-cyan plein écran), la brume glacée basse
    // (3 bandes alpha empilées) et les silhouettes mnésiques au sol créaient
    // ensemble un BROUILLARD GRIS qui rendait le rendu illisible. Toutes
    // retirées pour un rendu plus net et tangible (objectif "film like").
    //
    // const voile = poserVoileHorizonCG(scene);
    // if (estSalleBoss) for (const v of voile) v.setAlpha(1.5);
    // objets.push(...voile);
    //
    // objets.push(...poserSilhouettesMnesiques(scene, dims, rng, palette));
    //
    // const brumeBasse = poserBrumeGlacee(scene, dims, rng, palette);
    // if (estSalleBoss) for (const b of brumeBasse) b.setAlpha(b.alpha * 1.4);
    // objets.push(...brumeBasse);

    // Cristaux mnésiques sur pied — DÉSACTIVÉ (5'.17, perf)
    // 14 cristaux animés sur pied : trop gourmand (14 Graphics + 14 tweens)
    // pour la valeur ajoutée. Les cristaux flottants en ciel + le givre sol
    // foreground (réactif) portent suffisamment la signature mnésique.
    // const cristaux = poserCristauxMnesiquesSurPied(scene, dims, rng, palette);
    // if (estSalleBoss) for (const c of cristaux) c.setAlpha((c.alpha ?? 1) * 0.7);
    // objets.push(...cristaux);

    // Couche 6 — sol-glace fendue + veines cristallines ADD
    objets.push(...poserSolGlaceFendue(scene, dims, rng, palette));

    // Couche 7 — silhouettes témoins — DÉSACTIVÉE (5'.14)
    // Les figures debout alpha 0.22 qui apparaissaient/disparaissaient au sol
    // ajoutaient des silhouettes fantomatiques qui rivalisaient avec les
    // temples et l'arbre. Retirées pour un fond plus tangible.
    // if (!estSalleBoss) {
    //     objets.push(...poserSilhouettesTemoins(scene, dims, rng, palette));
    // }

    // Couche 8 — rayons cristallins (filtration violet-blanc subtile, opacité
    // réduite en 5'.14 pour ne plus saturer l'écran de faisceaux ADD)
    objets.push(...poserRayonsCristallins(scene, dims, rng));

    // === MILIEU — flocons lointains + brume volumétrique sol ===

    // 25 flocons lointains arrière-plan (désactivés en salle de boss)
    if (!estSalleBoss) {
        objets.push(...poserFloconsLointains(scene, dims, rng));
    }

    // Brume volumétrique au sol — 14 blobs réactifs joueur + onde parry
    const { objets: brumeVolumetriqueObjets, blobs: blobsBrume } =
        poserBrumeVolumetriqueAuSol(scene, dims, rng, palette);
    if (estSalleBoss) {
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

    // Bokeh foreground cristaux — DÉSACTIVÉ (5'.14)
    // Les grosses formes ADD violet-bleu floues passaient devant les
    // structures et brouillaient leur lecture. Retirées pour un foreground
    // propre.
    // objets.push(...poserBokehCristaux(scene, dims, rng));

    // Stalactites pendantes — DÉSACTIVÉ (5'.17, redondant avec tour centrale)
    // objets.push(...poserStalactitesPendantes(scene, dims, rng, palette));
    // if (etage >= 6 && !estSalleBoss) objets.push(...poserStalactitesPendantes(scene, dims, rng, palette));

    // Éclats cristallins tombants — DÉSACTIVÉ (5'.17, redondant avec tempête)
    // Les flocons de la tempête cristalline suffisent à l'effet météo.
    let emetteurEclats = null;
    // if (!estSalleBoss) {
    //     const eclatsObjets = poserEclatsCristallinTombants(scene, dims, rng);
    //     objets.push(...eclatsObjets);
    //     emetteurEclats = eclatsObjets[0];
    // }

    // Givre au sol foreground (résonne au passage joueur + pulsation mnésique)
    const givres = poserGivreSolForeground(scene, dims, rng, palette);
    objets.push(...givres);

    // 10 esprits-flocons réactifs au foreground (fuient le joueur en latéral)
    // Désactivés en salle de boss
    if (!estSalleBoss) {
        const { objets: espObjets, esprits } = poserEspritsFloconsReactifs(scene, dims, rng);
        objets.push(...espObjets);
        enregistrerInteractionsEsprits(scene, esprits);
    }

    // Tempête cristalline (cycle météo) — forcée en salle de boss
    const tempeteObjets = poserTempeteCristalline(scene, dims, rng, { forcer: estSalleBoss });
    objets.push(...tempeteObjets);

    // Interactions vivantes : givre réactif + atterrissage + cycle pulsation mnésique
    enregistrerInteractionsCristauxGlaces(scene, givres, emetteurEclats);

    return objets;
}
