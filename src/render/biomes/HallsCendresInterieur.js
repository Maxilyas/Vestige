// HallsCendresInterieur — structures architecturales en premier plan qui
// transforment l'étage 4 en véritable nef de cathédrale funéraire englobante.
//
// Activation par gradient narratif (cf. composer principal) :
//   - Étage 3 : touche d'introduction discrète (1 colonne FG occasionnelle)
//   - Étage 4 (salles normales) : pleine présence (2 colonnes + voute + coins)
//   - Étage 4 salle BOSS : maximum (4 colonnes + voute massive + fenêtres ogives)
//
// Règles de lisibilité gameplay :
//   - Zone praticable centrale toujours libre (60-70 % de la largeur du viewport)
//   - Colonnes posées sur les 10-15 % de bord uniquement
//   - Voute limitée à 30 % du haut (40 % en boss)
//   - Aucune structure ne masque le sol jouable au centre
//
// Toutes les structures sont en coordonnées écran (setScrollFactor(x, 0))
// avec parallax ≥ 1 (devant les plateformes mais sous les entités).

import { DEPTH } from '../PainterlyRenderer.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../../config.js';

// Couleur de référence "quasi noire" — les structures FG sont si proches qu'elles
// se lisent comme des silhouettes opaques, pas comme du décor lointain.
const COULEUR_PIERRE_FG = 0x0a0604;
const COULEUR_OMBRE_FG  = 0x000000;
const COULEUR_HIGHLIGHT = 0x2a1e16;

// ============================================================
// COLONNES MASSIVES LATÉRALES — bords gauche + droit, parallax 1.05-1.15
// ============================================================
//
// Une colonne occupe ~60-80 px de large sur les bords. Détails painterly :
// chapiteau bas (base), fût avec quelques fissures verticales, chapiteau haut.
// Optionnel : 1-2 braises ADD près de la base (cohérent avec la signature bi-ton
// du biome). En salle boss, fût plus large + ornement gothique au chapiteau.

function peindreColonneMassive(scene, x, hauteur, largeur, options = {}) {
    const g = scene.add.graphics();
    const { boss = false, palette } = options;

    const yBas = GAME_HEIGHT + 10;
    const yHaut = yBas - hauteur;

    // === Base (chapiteau renversé) ===
    const hBase = 22 + (boss ? 6 : 0);
    g.fillStyle(COULEUR_PIERRE_FG, 0.95);
    g.beginPath();
    g.moveTo(x - largeur / 2 - 8, yBas);
    g.lineTo(x - largeur / 2 - 4, yBas - hBase * 0.4);
    g.lineTo(x - largeur / 2, yBas - hBase);
    g.lineTo(x + largeur / 2, yBas - hBase);
    g.lineTo(x + largeur / 2 + 4, yBas - hBase * 0.4);
    g.lineTo(x + largeur / 2 + 8, yBas);
    g.closePath();
    g.fillPath();

    // === Fût ===
    const yTopFut = yHaut + 28;
    g.fillStyle(COULEUR_PIERRE_FG, 0.95);
    g.fillRect(x - largeur / 2, yTopFut, largeur, yBas - hBase - yTopFut);

    // Ombre sur la moitié droite du fût (modelé volumétrique : lumière vient de la gauche)
    g.fillStyle(COULEUR_OMBRE_FG, 0.45);
    g.fillRect(x + largeur * 0.1, yTopFut, largeur * 0.4, yBas - hBase - yTopFut);

    // Highlight discret sur le bord gauche (rim light très subtil)
    g.fillStyle(COULEUR_HIGHLIGHT, 0.6);
    g.fillRect(x - largeur / 2, yTopFut, 2, yBas - hBase - yTopFut);

    // Fissures verticales (3-5 segments courts)
    g.lineStyle(1, COULEUR_OMBRE_FG, 0.65);
    const nbFissures = 3 + Math.floor(Math.random() * 3);
    for (let f = 0; f < nbFissures; f++) {
        const fy1 = yTopFut + 20 + Math.random() * (yBas - hBase - yTopFut - 60);
        const fh = 12 + Math.random() * 28;
        const fx = x - largeur / 2 + 4 + Math.random() * (largeur - 8);
        g.beginPath();
        g.moveTo(fx, fy1);
        g.lineTo(fx + (Math.random() - 0.5) * 2, fy1 + fh);
        g.strokePath();
    }

    // Petits dépôts de suie aux angles bas
    g.fillStyle(COULEUR_OMBRE_FG, 0.55);
    g.fillEllipse(x - largeur / 2, yBas - hBase + 2, 12, 4);
    g.fillEllipse(x + largeur / 2, yBas - hBase + 2, 12, 4);

    // === Chapiteau haut ===
    g.fillStyle(COULEUR_PIERRE_FG, 0.95);
    g.beginPath();
    g.moveTo(x - largeur / 2, yTopFut);
    g.lineTo(x - largeur / 2 - 6, yTopFut - 8);
    g.lineTo(x - largeur / 2 - 10, yTopFut - 16);
    g.lineTo(x + largeur / 2 + 10, yTopFut - 16);
    g.lineTo(x + largeur / 2 + 6, yTopFut - 8);
    g.lineTo(x + largeur / 2, yTopFut);
    g.closePath();
    g.fillPath();

    // Astragale (rainure horizontale entre fût et chapiteau)
    g.lineStyle(1.2, COULEUR_OMBRE_FG, 0.8);
    g.beginPath();
    g.moveTo(x - largeur / 2 - 2, yTopFut + 2);
    g.lineTo(x + largeur / 2 + 2, yTopFut + 2);
    g.strokePath();

    // === Ornement gothique en salle boss ===
    if (boss) {
        // Petit motif en croix au centre du chapiteau
        g.fillStyle(COULEUR_OMBRE_FG, 0.85);
        g.fillRect(x - 1, yTopFut - 14, 2, 10);
        g.fillRect(x - 4, yTopFut - 10, 8, 2);
        // Bande décorative au milieu du fût
        const yMid = (yTopFut + yBas - hBase) / 2;
        g.lineStyle(1.5, COULEUR_OMBRE_FG, 0.7);
        g.beginPath();
        g.moveTo(x - largeur / 2 + 2, yMid);
        g.lineTo(x + largeur / 2 - 2, yMid);
        g.strokePath();
        // Petite croix sur la bande
        g.fillStyle(COULEUR_OMBRE_FG, 0.85);
        g.fillRect(x - 1, yMid - 4, 2, 8);
        g.fillRect(x - 3, yMid - 1, 6, 2);
    }

    // === Braise ADD près de la base (signature biome bi-ton) ===
    if (palette && Math.random() < 0.7) {
        const braise = scene.add.graphics();
        braise.setBlendMode(Phaser.BlendModes.ADD);
        const xBraise = x + (Math.random() < 0.5 ? -1 : 1) * (largeur / 2 + 6);
        const yBraise = yBas - 8 - Math.random() * 14;
        braise.fillStyle(palette.racine ?? 0xff6020, 0.55);
        braise.fillCircle(xBraise, yBraise, 5);
        braise.fillStyle(0xffd060, 0.85);
        braise.fillCircle(xBraise, yBraise, 2);
        // Pulse
        scene.tweens.add({
            targets: braise,
            alpha: { from: 0.55, to: 1.0 },
            duration: 900 + Math.random() * 500,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
        return [g, braise];
    }

    return [g];
}

function poserColonnesLaterales(scene, dims, options = {}) {
    const { boss = false, palette } = options;
    const objets = [];

    // Hauteur des colonnes : pleine hauteur du viewport visible (+ marge basse
    // pour qu'elles dépassent du bas et se prolongent visuellement).
    const hauteur = GAME_HEIGHT + 20;

    if (boss) {
        // Salle BOSS : 4 colonnes (2 par côté, l'une rentrée).
        // Bords ~ 40 px et rentrée ~ 110 px → laisse ~ 700 px central libre.
        const positions = [
            { x: 40,  largeur: 70 },
            { x: 130, largeur: 58 },
            { x: GAME_WIDTH - 130, largeur: 58 },
            { x: GAME_WIDTH - 40,  largeur: 70 }
        ];
        for (const p of positions) {
            const parties = peindreColonneMassive(scene, p.x, hauteur, p.largeur, { boss: true, palette });
            for (const partie of parties) {
                partie.setScrollFactor(1.08, 0);
                partie.setDepth(12);    // au-dessus des plateformes (0), sous les entités (20)
                objets.push(partie);
            }
        }
    } else {
        // Salle normale étage 4 : 2 colonnes (1G + 1D).
        const positions = [
            { x: 48, largeur: 64 },
            { x: GAME_WIDTH - 48, largeur: 64 }
        ];
        for (const p of positions) {
            const parties = peindreColonneMassive(scene, p.x, hauteur, p.largeur, { boss: false, palette });
            for (const partie of parties) {
                partie.setScrollFactor(1.08, 0);
                partie.setDepth(12);
                objets.push(partie);
            }
        }
    }

    return objets;
}

// Étage 3 — teasing : 1 colonne FG occasionnelle (proba 0.4 dans le composer),
// position aléatoire G ou D, plus fine que celles de l'étage 4.
function poserColonneFGTeasing(scene, dims, rng, palette) {
    const objets = [];
    const cote = rng() < 0.5 ? 'gauche' : 'droite';
    const x = cote === 'gauche' ? 36 + rng() * 12 : GAME_WIDTH - 36 - rng() * 12;
    const hauteur = GAME_HEIGHT + 20;
    const largeur = 48;  // plus fine que les colonnes pleines de l'étage 4

    const parties = peindreColonneMassive(scene, x, hauteur, largeur, { boss: false, palette });
    for (const partie of parties) {
        partie.setScrollFactor(1.08, 0);
        partie.setDepth(12);
        // Alpha global plus faible pour le teasing — la colonne est là mais
        // pas aussi imposante qu'en étage 4.
        partie.setAlpha((partie.alpha ?? 1) * 0.7);
        objets.push(partie);
    }

    return objets;
}

// ============================================================
// VOÛTE CENTRALE — plafond marqué qui descend dans l'écran
// ============================================================
//
// Au lieu des 3 fragments d'arches lointains du composer principal (parallax
// 0.10, occupent ~15 % du haut), on ajoute UNE grosse voûte plus présente
// en parallax 0.30 (équilibre entre "intégré au décor" et "structure tangible").
// Descend ~30 % du haut en mode normal, ~42 % en boss.

function poserVouteCentrale(scene, dims, options = {}) {
    const { boss = false } = options;
    const objets = [];

    const g = scene.add.graphics();
    const profondeur = boss ? GAME_HEIGHT * 0.42 : GAME_HEIGHT * 0.30;
    const yHaut = -10;
    const largeurVoute = GAME_WIDTH + 80;
    const xBase = -40;

    // Forme : arche concave très large vue d'en bas, avec ouverture en bas centrale
    g.fillStyle(COULEUR_PIERRE_FG, 0.92);
    g.beginPath();
    g.moveTo(xBase, yHaut);
    // Descend à gauche (verticalement quasi)
    g.lineTo(xBase + 30, yHaut + profondeur * 0.65);
    g.lineTo(xBase + 60, yHaut + profondeur * 0.85);
    g.lineTo(xBase + 95, yHaut + profondeur * 0.95);
    // Courbe concave centrale (l'ouverture vers le bas)
    const segs = 14;
    for (let s = 0; s <= segs; s++) {
        const t = s / segs;
        const sx = xBase + 95 + (largeurVoute - 190) * t;
        const sy = yHaut + profondeur - Math.sin(Math.PI * t) * profondeur * 0.45;
        g.lineTo(sx, sy);
    }
    // Remonte à droite (symétrique)
    g.lineTo(xBase + largeurVoute - 95, yHaut + profondeur * 0.95);
    g.lineTo(xBase + largeurVoute - 60, yHaut + profondeur * 0.85);
    g.lineTo(xBase + largeurVoute - 30, yHaut + profondeur * 0.65);
    g.lineTo(xBase + largeurVoute, yHaut);
    g.closePath();
    g.fillPath();

    // Cassures dentelées sur le bord inférieur (la voute est fragmentée)
    g.fillStyle(COULEUR_PIERRE_FG, 0.88);
    for (let d = 0; d < 7; d++) {
        const dx = xBase + 120 + d * (largeurVoute - 240) / 7;
        const dy = yHaut + profondeur * 0.7 + Math.random() * profondeur * 0.18;
        g.fillCircle(dx, dy, 4 + Math.random() * 4);
    }

    // Nervures voûtées (côtes) qui descendent du haut — 5 en mode normal, 7 en boss
    const nbNervures = boss ? 7 : 5;
    g.lineStyle(2, COULEUR_OMBRE_FG, 0.65);
    for (let n = 0; n < nbNervures; n++) {
        const t = (n + 0.5) / nbNervures;
        const nx = xBase + 60 + (largeurVoute - 120) * t;
        // Légère convergence vers le bas-centre
        const nxBas = nx + (0.5 - t) * profondeur * 0.4;
        g.beginPath();
        g.moveTo(nx, yHaut);
        g.lineTo(nxBas, yHaut + profondeur * 0.6);
        g.strokePath();
    }

    // Clés de voûte horizontales (3 bandes décoratives)
    g.lineStyle(1.5, COULEUR_OMBRE_FG, 0.55);
    for (let b = 1; b <= 3; b++) {
        const yBande = yHaut + profondeur * (b / 4);
        g.beginPath();
        g.moveTo(xBase + 100 + Math.sin(b * 1.7) * 10, yBande);
        g.lineTo(xBase + largeurVoute - 100 - Math.cos(b * 1.7) * 10, yBande);
        g.strokePath();
    }

    g.setScrollFactor(0.30, 0);
    g.setDepth(DEPTH.DECOR_ARRIERE);
    objets.push(g);

    // Drift latéral très lent (la voute "respire" architecturalement)
    scene.tweens.add({
        targets: g,
        x: '+=' + 25,
        duration: 90000,
        ease: 'Linear',
        repeat: -1,
        yoyo: true
    });

    return objets;
}

// ============================================================
// CADRES DE COIN — arches partielles aux coins supérieurs
// ============================================================
//
// Deux demi-arches qui ferment les coins haut-gauche et haut-droit, parallax 1.0.
// Renforcent la sensation que "le tableau est vu à travers une arche" — vignette
// architecturale gothique. Occupent ~100×100 px chacune au coin.

function peindreCadreCoin(scene, position) {
    const g = scene.add.graphics();
    const taille = 130;
    const xCoin = position === 'gauche' ? -8 : GAME_WIDTH + 8;
    const yCoin = -8;

    g.fillStyle(COULEUR_PIERRE_FG, 0.93);
    g.beginPath();

    if (position === 'gauche') {
        // Demi-arche concave en coin haut-gauche : monte à droite puis descend
        g.moveTo(xCoin, yCoin);
        g.lineTo(xCoin + taille * 1.1, yCoin);
        // Courbe concave (l'intérieur de l'arche)
        g.lineTo(xCoin + taille * 0.95, yCoin + taille * 0.18);
        g.lineTo(xCoin + taille * 0.72, yCoin + taille * 0.42);
        g.lineTo(xCoin + taille * 0.44, yCoin + taille * 0.62);
        g.lineTo(xCoin + taille * 0.20, yCoin + taille * 0.85);
        g.lineTo(xCoin, yCoin + taille * 1.1);
        g.closePath();
    } else {
        // Symétrique pour le coin haut-droit
        g.moveTo(xCoin, yCoin);
        g.lineTo(xCoin - taille * 1.1, yCoin);
        g.lineTo(xCoin - taille * 0.95, yCoin + taille * 0.18);
        g.lineTo(xCoin - taille * 0.72, yCoin + taille * 0.42);
        g.lineTo(xCoin - taille * 0.44, yCoin + taille * 0.62);
        g.lineTo(xCoin - taille * 0.20, yCoin + taille * 0.85);
        g.lineTo(xCoin, yCoin + taille * 1.1);
        g.closePath();
    }
    g.fillPath();

    // Cassure dentelée sur le bord intérieur (courbé) — donne le côté brisé
    g.fillStyle(COULEUR_PIERRE_FG, 0.85);
    for (let d = 0; d < 4; d++) {
        const t = (d + 1) / 5;
        const cx = position === 'gauche'
            ? xCoin + taille * (1 - t) * 0.9 + taille * 0.05
            : xCoin - taille * (1 - t) * 0.9 - taille * 0.05;
        const cy = yCoin + taille * t * 0.9 + 8;
        g.fillCircle(cx, cy, 3 + Math.random() * 3);
    }

    // Petits détails painterly : nervure radiale qui suit la courbe de l'arche
    g.lineStyle(1.2, COULEUR_OMBRE_FG, 0.55);
    g.beginPath();
    if (position === 'gauche') {
        g.moveTo(xCoin, yCoin);
        const segs = 8;
        for (let s = 1; s <= segs; s++) {
            const t = s / segs;
            const rx = xCoin + Math.cos((1 - t) * Math.PI * 0.5) * taille * 0.8;
            const ry = yCoin + Math.sin((1 - t) * Math.PI * 0.5) * taille * 0.8;
            g.lineTo(rx, ry);
        }
    } else {
        g.moveTo(xCoin, yCoin);
        const segs = 8;
        for (let s = 1; s <= segs; s++) {
            const t = s / segs;
            const rx = xCoin - Math.cos((1 - t) * Math.PI * 0.5) * taille * 0.8;
            const ry = yCoin + Math.sin((1 - t) * Math.PI * 0.5) * taille * 0.8;
            g.lineTo(rx, ry);
        }
    }
    g.strokePath();

    return g;
}

function poserCadresCoins(scene, dims) {
    const objets = [];
    const cadreG = peindreCadreCoin(scene, 'gauche');
    cadreG.setScrollFactor(1.02, 0);
    cadreG.setDepth(11);
    objets.push(cadreG);

    const cadreD = peindreCadreCoin(scene, 'droite');
    cadreD.setScrollFactor(1.02, 0);
    cadreD.setDepth(11);
    objets.push(cadreD);

    return objets;
}

// ============================================================
// FENÊTRES OGIVES SOMBRES — salle BOSS étage 4 uniquement
// ============================================================
//
// 3-4 fenêtres en ogive plaquées sur l'arrière-plan (entre les colonnes
// boss), à parallax 0.5 (au niveau des silhouettes funéraires). Très sombres
// avec une faible lueur rouge interne — évoquent les vitraux noircis dans
// lesquels brille encore un dernier feu de la nef en train de mourir.

function peindreFenetreOgive(scene, x, y, largeur, hauteur, palette) {
    const g = scene.add.graphics();

    // Cadre extérieur (pierre presque noire)
    g.fillStyle(COULEUR_PIERRE_FG, 0.92);
    g.beginPath();
    g.moveTo(x - largeur / 2 - 4, y + hauteur);
    g.lineTo(x - largeur / 2 - 4, y + largeur / 2);
    // Ogive (demi-arche pointue en haut)
    const segs = 10;
    for (let s = 0; s <= segs; s++) {
        const t = s / segs;
        const sx = x - largeur / 2 - 4 + (largeur + 8) * t;
        const sy = y + largeur / 2 - Math.sin(Math.PI * t) * (largeur / 2 + 6);
        g.lineTo(sx, sy);
    }
    g.lineTo(x + largeur / 2 + 4, y + hauteur);
    g.closePath();
    g.fillPath();

    // Vitrail intérieur sombre (rouge-noir profond)
    g.fillStyle(0x1a0808, 0.95);
    g.beginPath();
    g.moveTo(x - largeur / 2, y + hauteur - 2);
    g.lineTo(x - largeur / 2, y + largeur / 2);
    for (let s = 0; s <= segs; s++) {
        const t = s / segs;
        const sx = x - largeur / 2 + largeur * t;
        const sy = y + largeur / 2 - Math.sin(Math.PI * t) * (largeur / 2);
        g.lineTo(sx, sy);
    }
    g.lineTo(x + largeur / 2, y + hauteur - 2);
    g.closePath();
    g.fillPath();

    // Meneau central vertical (barre de pierre qui divise le vitrail)
    g.fillStyle(COULEUR_PIERRE_FG, 0.95);
    g.fillRect(x - 1.5, y + 4, 3, hauteur - 6);

    // Meneau horizontal au tiers (croisée)
    g.fillRect(x - largeur / 2 + 2, y + hauteur * 0.5, largeur - 4, 2);

    // Lueur intérieure ADD (rouge sourd) — la dernière braise du vitrail
    const lueur = scene.add.graphics();
    lueur.setBlendMode(Phaser.BlendModes.ADD);
    lueur.fillStyle(0x802010, 0.35);
    lueur.fillEllipse(x, y + hauteur * 0.7, largeur * 0.6, hauteur * 0.4);
    lueur.fillStyle(palette?.racine ?? 0xff6020, 0.25);
    lueur.fillEllipse(x, y + hauteur * 0.7, largeur * 0.3, hauteur * 0.2);

    // Pulse très lent (la lueur agonise)
    scene.tweens.add({
        targets: lueur,
        alpha: { from: 0.4, to: 1.0 },
        duration: 3000 + Math.random() * 1800,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });

    return [g, lueur];
}

function poserFenetresOgivesBoss(scene, dims, palette) {
    const objets = [];

    // 3 fenêtres réparties entre les colonnes boss. Positions calées pour
    // tomber entre les colonnes (40/130 et 830/920 sur GAME_WIDTH=960).
    // Les fenêtres restent loin du centre pour ne pas masquer le combat.
    const positions = [
        { x: 200, y: 90,  largeur: 56, hauteur: 130 },
        { x: GAME_WIDTH - 200, y: 90, largeur: 56, hauteur: 130 },
        { x: GAME_WIDTH / 2, y: 70, largeur: 72, hauteur: 150 }   // centrale en haut (au-dessus de la voute)
    ];

    for (const p of positions) {
        const parties = peindreFenetreOgive(scene, p.x, p.y, p.largeur, p.hauteur, palette);
        for (const partie of parties) {
            partie.setScrollFactor(0.55, 0);
            partie.setDepth(DEPTH.SILHOUETTES + 6);  // entre rayons et plateformes
            objets.push(partie);
        }
    }

    return objets;
}

// ============================================================
// API PUBLIQUE — appelée par composerParallaxHallsCendres
// ============================================================
//
// Sélectionne et pose les structures intérieures selon l'étage et le drapeau
// boss. Renvoie le tableau d'objets posés (pour cleanup éventuel via la liste
// globale du composer).
//
//   etage === 3 : teasing seulement, 1 colonne FG avec proba 0.4 (passée par rng)
//   etage === 4 : pleine présence (colonnes G+D + voute + cadres coins)
//   etage === 4 && boss : maximum (4 colonnes + voute massive + fenêtres ogives)
//
// Hors étages 3-4 (sécurité — ne devrait pas être appelé), renvoie tableau vide.

export function poserStructuresInterieurHallsCendres(scene, dims, rng, palette, options = {}) {
    const { etage = 3, boss = false } = options;
    const objets = [];

    if (etage === 3) {
        // Teasing : 1 colonne FG occasionnelle uniquement, jamais en salle de boss
        // (la salle boss étage 3 garde l'identité "Halls Cendrés ouvert" — le
        // passage à l'intérieur englobant ne commence vraiment qu'à l'étage 4).
        if (!boss && rng() < 0.4) {
            objets.push(...poserColonneFGTeasing(scene, dims, rng, palette));
        }
        return objets;
    }

    if (etage === 4) {
        // Voute centrale toujours présente (mode normal ou boss = échelle adaptée)
        objets.push(...poserVouteCentrale(scene, dims, { boss }));

        // Cadres aux coins (toujours sur étage 4)
        objets.push(...poserCadresCoins(scene, dims));

        // Colonnes latérales (2 ou 4 selon boss)
        objets.push(...poserColonnesLaterales(scene, dims, { boss, palette }));

        // Fenêtres ogives — salle boss étage 4 uniquement (climax architectural)
        if (boss) {
            objets.push(...poserFenetresOgivesBoss(scene, dims, palette));
        }

        return objets;
    }

    return objets;
}
