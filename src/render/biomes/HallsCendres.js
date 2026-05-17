// HallsCendres — composeur parallax spécifique au biome (étages 3-4).
//
// Direction : seuil hybride intérieur/extérieur, atmosphère sèche étouffante.
// Le joueur sort des Ruines mousseuses et entre dans une grande nef funéraire
// éventrée. Plafond voûté cassé au-dessus, ciel cendreux visible entre les
// fissures. Les feux brûlent encore — mais s'éteignent au fil des étages.
// Bi-ton signature : braises actives orange vif ↔ foyers éteints cuivre terni.
//
// 14+ couches du fond vers l'avant :
//   BG    plafond voûté cassé      (sF 0.10, arches en silhouette, drift très lent)
//   BG    poussière qui descend    (sF 0.20, motes ambrées qui tombent)
//   BG    arches funéraires 2R     (sF 0.15, colonnes brûlées en plans superposés)
//   BG    voile horizon            (sF 0.0,  ambre laiteux chaud)
//   BG    silhouettes funéraires   (sF 0.30, catafalques + colonnes brisées opaques)
//   BG    fumée stagnante 3 bds    (sF 0.20, bandes horizontales ambrées denses)
//   BG    foyers résiduels         (sF 0.50, braseros pulsants — gradient étage 3→4)
//   BG    sol-dalles fendues       (sF 0.60, polyline craquelée + veines de feu)
//   BG    silhouettes priants      (sF 0.40, figures agenouillées immobiles)
//   BG    rayons rasants chauds    (sF 0.70, ADD ambre, respiration alpha)
//   MID   escarbilles lointaines   (sF 0.40, 25 unités passives qui dérivent en haut)
//   MID   fumée volumétrique sol   (sF 0.85, 14 blobs réactifs joueur+parry)
//   FG    bokeh braises            (sF 1.15-1.6, taches orangées hors-focus)
//   FG    chaînes pendantes        (sF 1.15, restes du plafond, sway lent)
//   FG    cendre/tisons            (sF 0.9-1.25, se soulèvent au passage, atterrissage)
//   FG    escarbilles réactives    (sF 1.0, 10 unités fuient le joueur EN MONTANT)
//   FG    cendre tombante          (sF 0.0, viewport entier, cycle météo + boss force)
//
// Mood salle de boss : foyers résiduels s'éteignent un par un, fumée +60 %,
// cendre forcée, priants désactivés, escarbilles désactivées. Le silence avant
// la dernière flamme.

import { DEPTH, paletteCouranteScene } from '../PainterlyRenderer.js';
import { GAME_HEIGHT, GAME_WIDTH } from '../../config.js';

// Helpers de teinte (mêmes formules que RuinesBasses)
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
// COUCHE 1 — ARCHES FUNÉRAIRES 2 RANGÉES (scrollFactor 0.15)
// ============================================================
//
// Équivalent thématique des montagnes des Ruines : la "ligne d'horizon" est
// formée par des arches gothiques effondrées en silhouettes superposées. Deux
// rangées (plus de matière que les montagnes ne demandait — l'horizon ici est
// une enfilade architecturale, pas un paysage naturel).

function peindreArcheFuneraire(scene, x, ySol, largeur, hauteur, couleurBase, alpha, rng) {
    const g = scene.add.graphics();
    const yTop = ySol - hauteur;
    const epaisseur = largeur * 0.12;

    // Corps de l'arche : 2 pieds + arc supérieur
    const couleurCorps = couleurBase;
    g.fillStyle(couleurCorps, alpha);

    // Pied gauche (peut être tronqué — cassure aléatoire)
    const hPiedG = hauteur * (0.55 + rng() * 0.35);
    g.fillRect(x - largeur / 2, ySol - hPiedG, epaisseur, hPiedG);
    // Cassure dentelée sur le pied gauche si tronqué
    if (hPiedG < hauteur * 0.85) {
        g.beginPath();
        g.moveTo(x - largeur / 2, ySol - hPiedG);
        g.lineTo(x - largeur / 2 + epaisseur * 0.3, ySol - hPiedG - 4 - rng() * 5);
        g.lineTo(x - largeur / 2 + epaisseur * 0.7, ySol - hPiedG + 2);
        g.lineTo(x - largeur / 2 + epaisseur, ySol - hPiedG - 3 - rng() * 4);
        g.lineTo(x - largeur / 2 + epaisseur, ySol - hPiedG);
        g.closePath();
        g.fillPath();
    }

    // Pied droit (intact plus souvent)
    const hPiedD = hauteur * (0.70 + rng() * 0.25);
    g.fillRect(x + largeur / 2 - epaisseur, ySol - hPiedD, epaisseur, hPiedD);
    if (hPiedD < hauteur * 0.92) {
        g.beginPath();
        g.moveTo(x + largeur / 2 - epaisseur, ySol - hPiedD);
        g.lineTo(x + largeur / 2 - epaisseur * 0.7, ySol - hPiedD - 3 - rng() * 4);
        g.lineTo(x + largeur / 2 - epaisseur * 0.3, ySol - hPiedD + 2);
        g.lineTo(x + largeur / 2, ySol - hPiedD - 4 - rng() * 5);
        g.lineTo(x + largeur / 2, ySol - hPiedD);
        g.closePath();
        g.fillPath();
    }

    // Arc supérieur — seulement si les deux pieds sont assez hauts
    if (hPiedG > hauteur * 0.75 && hPiedD > hauteur * 0.75) {
        // Arc en demi-cercle approximé par 8 segments
        g.lineStyle(epaisseur * 0.9, couleurCorps, alpha);
        g.beginPath();
        const xG2 = x - largeur / 2 + epaisseur / 2;
        const xD2 = x + largeur / 2 - epaisseur / 2;
        const yArcBase = ySol - hauteur * 0.85;
        const yArcSommet = ySol - hauteur + epaisseur * 0.5;
        const segs = 10;
        for (let s = 0; s <= segs; s++) {
            const t = s / segs;
            const sx = xG2 + (xD2 - xG2) * t;
            // Arc parabolique inversé
            const sy = yArcBase - (yArcBase - yArcSommet) * Math.sin(Math.PI * t);
            if (s === 0) g.moveTo(sx, sy);
            else g.lineTo(sx, sy);
        }
        g.strokePath();

        // Cassure : peut manquer la moitié droite de l'arc (alpha 0)
        if (rng() < 0.4) {
            const couleurFond = 0x000000;
            g.fillStyle(couleurFond, alpha); // masque
            // On masque une portion du quart supérieur-droit
            const xMask = x + largeur * (0.05 + rng() * 0.15);
            g.fillRect(xMask, yArcSommet - 8, largeur / 2, hauteur * 0.25);
        }
    }

    return g;
}

function poserArchesFuneraires(scene, dims, rng, palette) {
    const objets = [];
    const ySol = GAME_HEIGHT - 60;
    const largeurEtendue = dims.largeur * 1.6;
    const decalageX = -dims.largeur * 0.3;

    // Deux rangées superposées. La plus lointaine = plus pâle et basse, la
    // plus proche est plus opaque et imposante (donne profondeur architecturale).
    const rangees = [
        { nb: 5, hMin: 130, hMax: 200, lMin: 180, lMax: 280, alpha: 0.55, teinte: 0x2a221e, yOffset: 4 },
        { nb: 4, hMin: 180, hMax: 260, lMin: 220, lMax: 340, alpha: 0.85, teinte: 0x16100a, yOffset: 14 }
    ];

    for (const rangee of rangees) {
        const pas = largeurEtendue / rangee.nb;
        for (let i = 0; i < rangee.nb; i++) {
            const x = decalageX + pas * i + (rng() - 0.5) * pas * 0.3;
            const h = rangee.hMin + rng() * (rangee.hMax - rangee.hMin);
            const l = rangee.lMin + rng() * (rangee.lMax - rangee.lMin);
            const a = peindreArcheFuneraire(scene, x, ySol + rangee.yOffset, l, h, rangee.teinte, rangee.alpha, rng);
            a.setScrollFactor(0.15, 0);
            a.setDepth(DEPTH.SILHOUETTES - 2);
            objets.push(a);
        }
    }

    // Bande de fumée stagnante entre les arches et le ciel (atmospheric haze
    // chaude) — drift ultra-lent yoyo, plus marquée que la brume des Ruines.
    const fumee = scene.add.graphics();
    fumee.fillStyle(0x5a3a22, 0.22);
    for (let i = 0; i < 6; i++) {
        const xb = (largeurEtendue / 6) * i + decalageX + (rng() - 0.5) * 60;
        const yb = ySol - 170 - rng() * 40;
        const lb = 220 + rng() * 160;
        const hb = 26 + rng() * 16;
        fumee.fillEllipse(xb, yb, lb, hb);
    }
    fumee.setScrollFactor(0.15, 0);
    fumee.setDepth(DEPTH.SILHOUETTES - 1);
    scene.tweens.add({
        targets: fumee,
        x: '+=' + dims.largeur * 0.15,
        duration: 70000,
        ease: 'Linear',
        repeat: -1,
        yoyo: true
    });
    objets.push(fumee);

    return objets;
}

// ============================================================
// COUCHE 2 — SILHOUETTES FUNÉRAIRES (scrollFactor 0.3)
// ============================================================
//
// Quatre types tirés : catafalque (tombe basse), colonne brisée, sarcophage
// debout, brasero éteint. Toutes en silhouettes opaques pures — formes
// reconnaissables sans détails internes.

function couleurSilhouetteFuneraire() {
    return 0x18120c; // brun-noir profond, uniforme pour toutes les silhouettes
}

function peindreCatafalque(scene, x, ySol, hauteur, palette, rng) {
    const g = scene.add.graphics();
    const w = hauteur * 2.2 + rng() * 20;
    const couleur = couleurSilhouetteFuneraire();
    const yTop = ySol - hauteur;

    g.fillStyle(couleur, 1);
    // Base élargie (socle)
    g.beginPath();
    g.moveTo(x - w / 2 - 6, ySol);
    g.lineTo(x - w / 2, ySol - hauteur * 0.18);
    g.lineTo(x + w / 2, ySol - hauteur * 0.18);
    g.lineTo(x + w / 2 + 6, ySol);
    g.closePath();
    g.fillPath();

    // Sarcophage rectangulaire posé dessus
    g.fillRect(x - w / 2 + 4, yTop + hauteur * 0.3, w - 8, hauteur * 0.55);

    // Couvercle un peu plus large
    g.fillRect(x - w / 2 + 2, yTop + hauteur * 0.25, w - 4, hauteur * 0.08);

    // Silhouette d'une figure couchée sur le couvercle (très simplifiée)
    if (rng() < 0.6) {
        g.fillRect(x - w / 4, yTop + hauteur * 0.17, w / 2, hauteur * 0.08);
        // Tête
        g.fillCircle(x - w / 4 - 3, yTop + hauteur * 0.21, hauteur * 0.05);
    }

    return g;
}

function peindreColonneBriseeHC(scene, x, ySol, hauteur, palette, rng) {
    const g = scene.add.graphics();
    const w = 18 + rng() * 12;
    const yTop = ySol - hauteur;
    const couleur = couleurSilhouetteFuneraire();

    g.fillStyle(couleur, 1);
    // Base plus large (chapiteau inversé)
    g.beginPath();
    g.moveTo(x - w / 2 - 5, ySol);
    g.lineTo(x - w / 2, ySol - 8);
    g.lineTo(x + w / 2, ySol - 8);
    g.lineTo(x + w / 2 + 5, ySol);
    g.closePath();
    g.fillPath();

    // Fût
    g.fillRect(x - w / 2, yTop + 10, w, hauteur - 18);

    // Cassure en haut (silhouette dentelée)
    g.beginPath();
    g.moveTo(x - w / 2, yTop + 10);
    g.lineTo(x - w / 3, yTop + 4 + rng() * 6);
    g.lineTo(x, yTop + 12);
    g.lineTo(x + w / 4, yTop + 2 + rng() * 5);
    g.lineTo(x + w / 2, yTop + 10);
    g.closePath();
    g.fillPath();

    return g;
}

function peindreSarcophageDebout(scene, x, ySol, hauteur, palette, rng) {
    const g = scene.add.graphics();
    const w = 38 + rng() * 18;
    const yTop = ySol - hauteur;
    const couleur = couleurSilhouetteFuneraire();

    g.fillStyle(couleur, 1);
    // Forme verticale arrondie en haut (silhouette de stèle)
    g.fillRect(x - w / 2, yTop + w / 2, w, hauteur - w / 2);
    // Demi-cercle en haut (approximé par triangle large + rectangle)
    g.beginPath();
    g.moveTo(x - w / 2, yTop + w / 2);
    g.lineTo(x - w / 2, yTop + w / 3);
    g.lineTo(x - w / 4, yTop);
    g.lineTo(x + w / 4, yTop);
    g.lineTo(x + w / 2, yTop + w / 3);
    g.lineTo(x + w / 2, yTop + w / 2);
    g.closePath();
    g.fillPath();

    // Cassure occasionnelle en haut
    if (rng() < 0.35) {
        g.beginPath();
        g.moveTo(x - w / 4, yTop);
        g.lineTo(x - w / 8, yTop + 6 + rng() * 4);
        g.lineTo(x + w / 6, yTop + 2);
        g.lineTo(x + w / 4, yTop + 8 + rng() * 4);
        g.lineTo(x + w / 4, yTop);
        g.closePath();
        g.fillPath();
    }

    return g;
}

function peindreBraseroEteint(scene, x, ySol, hauteur, palette, rng) {
    const g = scene.add.graphics();
    const w = 32 + rng() * 14;
    const couleur = couleurSilhouetteFuneraire();

    g.fillStyle(couleur, 1);
    // Pied tripode (silhouette)
    const hPied = hauteur * 0.6;
    g.beginPath();
    g.moveTo(x - w / 2, ySol);
    g.lineTo(x - 4, ySol - hPied);
    g.lineTo(x + 4, ySol - hPied);
    g.lineTo(x + w / 2, ySol);
    g.closePath();
    g.fillPath();
    // Pied central
    g.fillRect(x - 3, ySol - hPied, 6, hPied);

    // Coupe (cup) en haut — silhouette ovale
    g.fillEllipse(x, ySol - hPied - 4, w * 0.95, hauteur * 0.18);
    // Rebord supérieur de la coupe
    g.fillRect(x - w * 0.45, ySol - hPied - 6, w * 0.9, 4);

    return g;
}

function poserSilhouettesFuneraires(scene, dims, rng, palette) {
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
            obj = peindreCatafalque(scene, x, ySol, h, palette, rng);
        } else if (choix < 0.58) {
            h = 110 + rng() * 80;
            obj = peindreColonneBriseeHC(scene, x, ySol, h, palette, rng);
        } else if (choix < 0.82) {
            h = 90 + rng() * 50;
            obj = peindreSarcophageDebout(scene, x, ySol, h, palette, rng);
        } else {
            h = 70 + rng() * 30;
            obj = peindreBraseroEteint(scene, x, ySol, h, palette, rng);
        }

        if (obj) {
            obj.setScrollFactor(0.3, 0);
            obj.setDepth(DEPTH.SILHOUETTES);
            obj.setAlpha(0.85 + rng() * 0.12);
            objets.push(obj);

            // Dépôt de cendre/suie au pied (rend la silhouette tangible —
            // posée dans un sol cendreux, pas flottante).
            const m = scene.add.graphics();
            m.fillStyle(palette.mousse, 0.55); // mousse slot = suie en halls
            const largeurDepot = 30 + rng() * 26;
            m.fillEllipse(x, ySol + 1, largeurDepot, 5);
            // 2-3 petites braises ponctuelles au pied (signature biome)
            if (rng() < 0.4) {
                m.fillStyle(palette.racine, 0.65); // racine slot = braise vive
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
// COUCHE 3 — FOYERS RÉSIDUELS (scrollFactor 0.5)
// ============================================================
//
// Équivalent thématique de la forêt morte : au lieu d'arbres pourpres,
// des braseros sur pied haut qui pulsent (foyers encore vifs) ou émettent une
// lueur cuivre terni (foyers mourants). Densité non-uniforme (composition cinéma).
//
// Gradient narratif étage 3 → 4 (cf. PlateformeStyle) :
//   - étage 3 : ratio actif/éteint ≈ 65/35 (les feux brûlent encore)
//   - étage 4 : ratio actif/éteint ≈ 25/75 (les derniers feux meurent)

function peindreFoyerResiduel(scene, x, ySol, hauteur, actif, palette, rng) {
    const g = scene.add.graphics();
    const couleurSoclEtMet = 0x1a1410;
    const epaisseur = 3;

    // Pied (long fût grêle) — silhouette opaque
    g.fillStyle(couleurSoclEtMet, 0.92);
    g.fillRect(x - epaisseur / 2, ySol - hauteur, epaisseur, hauteur);

    // Trépied à la base
    g.lineStyle(epaisseur * 0.7, couleurSoclEtMet, 0.92);
    g.beginPath();
    g.moveTo(x - 6, ySol);
    g.lineTo(x, ySol - 12);
    g.lineTo(x + 6, ySol);
    g.strokePath();

    // Coupe (vasque) en haut — silhouette ellipse
    const yCoupe = ySol - hauteur;
    g.fillStyle(couleurSoclEtMet, 0.92);
    g.fillEllipse(x, yCoupe, 22, 7);
    g.fillRect(x - 11, yCoupe - 3, 22, 4);

    g.setScrollFactor(0.5, 0);
    g.setDepth(DEPTH.SILHOUETTES + 2);

    // Contenu de la coupe : braises ou cendre éteinte
    if (actif) {
        // Braise active — ADD sur graphics séparé pour pulse
        const flamme = scene.add.graphics();
        flamme.setBlendMode(Phaser.BlendModes.ADD);
        // Halo extérieur (jaune chaud)
        flamme.fillStyle(0xff8030, 0.45);
        flamme.fillCircle(x, yCoupe - 4, 16);
        // Cœur vif
        flamme.fillStyle(0xffd060, 0.85);
        flamme.fillCircle(x, yCoupe - 4, 6);
        // Languette de flamme qui monte
        flamme.fillStyle(0xffa040, 0.55);
        flamme.fillEllipse(x, yCoupe - 10, 10, 14);
        flamme.setAlpha(0.85);
        flamme.setScrollFactor(0.5, 0);
        flamme.setDepth(DEPTH.SILHOUETTES + 3);

        // Pulse vif (~1.2s)
        scene.tweens.add({
            targets: flamme,
            alpha: { from: 0.65, to: 1.0 },
            scale: { from: 0.9, to: 1.1 },
            duration: 900 + rng() * 600,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });

        return [g, flamme];
    } else {
        // Foyer éteint — touche cuivre terni mat (PAS d'ADD)
        g.fillStyle(palette.accent, 0.7);
        g.fillEllipse(x, yCoupe - 2, 14, 4);
        g.fillStyle(0x4a2a18, 0.65);
        g.fillCircle(x, yCoupe - 2, 4);
        // Petit point noir au centre (charbon)
        g.fillStyle(0x000000, 0.7);
        g.fillCircle(x, yCoupe - 2, 1.5);

        return [g];
    }
}

function poserFoyersResiduels(scene, dims, rng, palette) {
    const objets = [];
    const ySol = GAME_HEIGHT - 20;
    const largeurEtendue = dims.largeur * 1.6;
    const decalageX = -dims.largeur * 0.3;

    const etage = scene.registry.get('etage_courant') ?? 3;
    const ratioActif = etage <= 3 ? 0.65 : 0.25;

    // 14 foyers répartis, densité non-uniforme (2 zones denses + 1 vallée).
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
        // scrollFactor / depth posés à l'intérieur de peindreFoyerResiduel
        const parties = peindreFoyerResiduel(scene, p.x, yPos, hauteur, actif, palette, rng);
        for (const partie of parties) objets.push(partie);
    }

    return objets;
}

// ============================================================
// COUCHE 0 — PLAFOND VOÛTÉ CASSÉ (scrollFactor 0.10)
// ============================================================
//
// Équivalent thématique des nuages des Ruines : arches du plafond effondré
// qui dépassent depuis le haut de l'écran, avec ciel cendreux visible entre.
// Donne l'identité "on est À L'INTÉRIEUR" du seuil hybride. Drift très lent
// (les fragments du plafond bougent imperceptiblement, vestige de la chute).

function poserPlafondVoute(scene, dims, rng, palette) {
    const objets = [];
    const largeurEtendue = dims.largeur * 1.6;
    const decalageX = -dims.largeur * 0.3;

    // 3 fragments d'arches qui dépassent du haut.
    const nbFragments = 3;
    const couleurFragment = 0x16100a; // très sombre, presque noir

    for (let i = 0; i < nbFragments; i++) {
        const g = scene.add.graphics();
        const xBase = decalageX + (i + 0.3) * (largeurEtendue / nbFragments) + (rng() - 0.5) * 60;
        const largeurArche = 240 + rng() * 200;
        const profondeurArche = 70 + rng() * 50; // combien l'arche descend depuis le haut
        const yHaut = -30;

        // Forme d'arche inversée (concave vue d'en bas). Polygone : 2 pieds qui
        // descendent + un creux concave au centre.
        g.fillStyle(couleurFragment, 0.92);
        g.beginPath();
        g.moveTo(xBase - largeurArche / 2, yHaut);
        // Descend à gauche
        g.lineTo(xBase - largeurArche / 2 + 8, yHaut + profondeurArche * 0.8);
        g.lineTo(xBase - largeurArche / 2 + 24, yHaut + profondeurArche * 0.92);
        // Courbe concave en bas (au centre)
        const segs = 8;
        for (let s = 0; s <= segs; s++) {
            const t = s / segs;
            const sx = xBase - largeurArche / 2 + 24 + (largeurArche - 48) * t;
            const sy = yHaut + profondeurArche - Math.sin(Math.PI * t) * profondeurArche * 0.5;
            g.lineTo(sx, sy);
        }
        // Remonte à droite
        g.lineTo(xBase + largeurArche / 2 - 8, yHaut + profondeurArche * 0.8);
        g.lineTo(xBase + largeurArche / 2, yHaut);
        g.closePath();
        g.fillPath();

        // Cassure dentelée sur le bord inférieur (l'arche est fragmentée)
        g.fillStyle(couleurFragment, 0.85);
        for (let d = 0; d < 5; d++) {
            const dx = xBase - largeurArche / 4 + d * largeurArche * 0.12;
            const dy = yHaut + profondeurArche * 0.7 + rng() * profondeurArche * 0.2;
            g.fillCircle(dx, dy, 3 + rng() * 3);
        }

        // Décor sous-arche : "nervures" simples qui descendent (côtes voûtées)
        const couleurNervure = teinterPlusSombre(couleurFragment, 0.4);
        g.lineStyle(1.5, couleurNervure, 0.6);
        for (let n = 0; n < 3; n++) {
            const nx = xBase - largeurArche / 3 + n * largeurArche / 3;
            g.beginPath();
            g.moveTo(nx, yHaut);
            g.lineTo(nx + (rng() - 0.5) * 8, yHaut + profondeurArche * 0.5);
            g.strokePath();
        }

        g.setScrollFactor(0.10, 0);
        g.setDepth(DEPTH.CIEL + 2);
        objets.push(g);

        // Drift très lent yoyo (l'arche bouge imperceptiblement)
        scene.tweens.add({
            targets: g,
            x: '+=' + (30 + rng() * 25),
            duration: 100000 + rng() * 40000,
            ease: 'Linear',
            repeat: -1,
            yoyo: true
        });
    }

    return objets;
}

// ============================================================
// POUSSIÈRE QUI DESCEND — équivalent oiseaux lointains
// ============================================================
//
// Motes ambrées qui dérivent doucement vers le bas, en parallax 0.20.
// Anime le ciel sans imposer de mouvement directionnel marqué.

function poserPoussiereAmbiante(scene, dims, rng) {
    if (!scene.textures.exists('_particule')) return [];
    const objets = [];

    const em = scene.add.particles(0, 0, '_particule', {
        x: { min: -50, max: GAME_WIDTH + 50 },
        y: { min: -20, max: 200 },
        lifespan: 14000,
        speedY: { min: 8, max: 20 },
        speedX: { min: -6, max: 6 },
        scale: { start: 0.45, end: 0.15 },
        tint: [0xffaa50, 0xc88040, 0xa86838],
        alpha: { start: 0.45, end: 0 },
        quantity: 1,
        frequency: 600
    });
    em.setScrollFactor(0.20, 0);
    em.setDepth(DEPTH.CIEL + 3);
    objets.push(em);

    return objets;
}

// ============================================================
// VOILE D'HORIZON AMBRE — atmospheric haze chaud
// ============================================================

function preparerTextureVoileHorizonHC(scene) {
    const id = '_voile_horizon_halls_cendres';
    if (scene.textures.exists(id)) return id;
    const w = 4, h = 540;
    const cv = scene.textures.createCanvas(id, w, h);
    const ctx = cv.getContext();
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    // Ambre laiteux — couleur de la chaleur en suspension
    gradient.addColorStop(0,    'rgba(180, 110, 60, 0.34)');
    gradient.addColorStop(0.5,  'rgba(170, 100, 50, 0.22)');
    gradient.addColorStop(0.75, 'rgba(160, 90,  40, 0.10)');
    gradient.addColorStop(1,    'rgba(160, 90,  40, 0.00)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    cv.refresh();
    return id;
}

function poserVoileHorizonHC(scene) {
    const id = preparerTextureVoileHorizonHC(scene);
    const cam = scene.cameras.main;
    const voile = scene.add.image(cam.width / 2, cam.height / 2, id);
    voile.setDisplaySize(cam.width, cam.height);
    voile.setScrollFactor(0, 0);
    voile.setDepth(DEPTH.SILHOUETTES - 1);
    voile.setBlendMode(Phaser.BlendModes.NORMAL);
    return [voile];
}

// ============================================================
// FUMÉE STAGNANTE BASSE — ferme le gap horizon/niveau
// ============================================================

function poserFumeeStagnante(scene, dims, rng, palette) {
    const objets = [];
    const largeurEtendue = dims.largeur * 1.6;
    const decalageX = -dims.largeur * 0.3;

    // Trois bandes empilées, plus dense en bas
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
            duration: 55000 + rng() * 20000,
            ease: 'Sine.InOut',
            repeat: -1,
            yoyo: true
        });
    }

    return objets;
}

// ============================================================
// SOL-DALLES FENDUES (scrollFactor 0.6) — premier plan d'horizon
// ============================================================
//
// Polyline de dalles brisées avec quelques veines de feu rougeoyantes en
// surface (équivalent rim light vert des Ruines, mais en signature biome
// : la chaleur reste enfouie).

function poserSolDallesFendues(scene, dims, rng, palette) {
    const objets = [];
    const largeurEtendue = dims.largeur * 1.6;
    const decalageX = -dims.largeur * 0.3;
    const yBase = GAME_HEIGHT;
    const yCrete = GAME_HEIGHT - 26;

    const g = scene.add.graphics();
    const couleurFoncee = 0x14100a;
    g.fillStyle(couleurFoncee, 0.94);

    // Profil polyline : moins de bosses que les Ruines, plus de plats — sol
    // pavé d'une nef, plus régulier qu'un sol naturel.
    const nbPoints = 48;
    const pas = largeurEtendue / nbPoints;
    const points = [];
    points.push({ x: decalageX, y: yBase });
    for (let i = 0; i <= nbPoints; i++) {
        const x = decalageX + pas * i;
        const phase = (i / nbPoints) * Math.PI * 4;
        const bosse = Math.sin(phase) * 3 + Math.sin(phase * 3.1) * 2;
        const y = yCrete + bosse + (rng() - 0.5) * 3;
        points.push({ x, y });
    }
    points.push({ x: decalageX + largeurEtendue, y: yBase });

    g.beginPath();
    g.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) g.lineTo(points[i].x, points[i].y);
    g.closePath();
    g.fillPath();

    // Fissures verticales sur la surface (toutes les ~3 dalles, courtes)
    g.lineStyle(1.2, 0x000000, 0.6);
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

    // VEINES DE FEU ADD — la chaleur enfouie qui transparaît. Sur graphics
    // séparé pour blend mode + pulse.
    const veines = scene.add.graphics();
    veines.setBlendMode(Phaser.BlendModes.ADD);
    const nbVeines = 12;
    for (let i = 0; i < nbVeines; i++) {
        const idx = 3 + Math.floor(rng() * (points.length - 6));
        const p = points[idx];
        // Veine = court segment ADD orange
        veines.lineStyle(2, palette.racine, 0.25);
        veines.beginPath();
        veines.moveTo(p.x - 8, p.y - 1);
        veines.lineTo(p.x + 8, p.y - 1);
        veines.strokePath();
        veines.lineStyle(1, 0xffd060, 0.45);
        veines.beginPath();
        veines.moveTo(p.x - 6, p.y - 1);
        veines.lineTo(p.x + 6, p.y - 1);
        veines.strokePath();
    }
    veines.setScrollFactor(0.6, 0);
    veines.setDepth(DEPTH.SILHOUETTES + 4);
    objets.push(veines);

    // Respiration lente (la chaleur palpite)
    scene.tweens.add({
        targets: veines,
        alpha: { from: 0.55, to: 1.0 },
        duration: 3500 + rng() * 1500,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });

    return objets;
}

// ============================================================
// RAYONS RASANTS POUSSIÉREUX — équivalent rayons d'aube
// ============================================================
//
// Faisceaux obliques diagonaux qui filtrent depuis le haut-gauche (lumière
// rasante qui traverse la cendre en suspension). Ambre chaud, ADD subtil.

function poserRayonsRasants(scene, dims, rng) {
    const objets = [];
    const nbRayons = 3;
    const largeurRayon = 100;
    const decalageDiag = 360;
    const couleurRayon = 0xffd080; // ambre laiteux chaud

    for (let i = 0; i < nbRayons; i++) {
        const xHaut = -50 + i * 340 + rng() * 80;
        const g = scene.add.graphics();
        const alphaBase = 0.10 + rng() * 0.06;
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

        scene.tweens.add({
            targets: g,
            alpha: { from: 0.7, to: 1.2 },
            duration: 5500 + rng() * 4000,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
    }

    return objets;
}

// ============================================================
// FOREGROUND VIVANT — cendre au sol, tisons, chaînes, bokeh, escarbilles
// ============================================================

// Cendre au sol foreground : silhouettes basses sombres au bord bas du canvas,
// se soulèvent au passage du joueur (équivalent herbes folles, mais matière
// minérale/poussiéreuse qui se soulève en lieu et place de l'élan végétal).
function poserCendreSolForeground(scene, dims, rng, palette) {
    const objets = [];
    const largeurEtendue = dims.largeur * 1.8;
    const decalageX = -dims.largeur * 0.4;
    const yBase = GAME_HEIGHT + 4;

    const nbTas = 24;
    for (let i = 0; i < nbTas; i++) {
        const g = scene.add.graphics();
        const x = decalageX + (i / nbTas) * largeurEtendue + (rng() - 0.5) * 30;
        const hMax = 8 + rng() * 14; // tas de cendre plus bas que les herbes
        const couleurBase = rng() < 0.85 ? 0x0c0805 : 0x4a2e1a; // 15% un peu plus chaud
        const alpha = 0.55 + rng() * 0.30;

        // Tas = ellipse basse + 2-3 grumeaux légèrement plus hauts
        g.fillStyle(couleurBase, alpha);
        g.fillEllipse(0, -hMax * 0.2, 18 + rng() * 8, hMax * 0.5);
        // Grumeaux
        const nbGrumeaux = 2 + Math.floor(rng() * 2);
        for (let k = 0; k < nbGrumeaux; k++) {
            const gx = (rng() - 0.5) * 14;
            const gy = -hMax * (0.4 + rng() * 0.4);
            const gr = 2 + rng() * 3;
            g.fillStyle(teinterPlusClair(couleurBase, 0.08), alpha);
            g.fillCircle(gx, gy, gr);
        }
        // Petite braise rare au sommet (1 sur ~6)
        if (rng() < 0.18) {
            const braise = scene.add.graphics();
            braise.setBlendMode(Phaser.BlendModes.ADD);
            braise.fillStyle(palette.racine, 0.8);
            braise.fillCircle(0, -hMax * 0.55, 1.2);
            braise.x = x;
            braise.y = yBase;
            braise.setScrollFactor(1.25, 0);
            braise.setDepth(6);
            scene.tweens.add({
                targets: braise,
                alpha: { from: 0.4, to: 1.0 },
                duration: 600 + rng() * 400,
                ease: 'Sine.InOut',
                yoyo: true,
                repeat: -1
            });
            objets.push(braise);
        }

        g.x = x;
        g.y = yBase;
        g.setScrollFactor(1.25, 0);
        g.setDepth(5);

        // Métadonnées pour interactions
        g._cendreHC = {
            phase: rng() * Math.PI * 2,
            yBase: yBase,
            liftJoueur: 0
        };
        objets.push(g);
    }

    return objets;
}

// Tisons rougeoyants au sol foreground : émetteur de particules petits
// fragments orangés qui tombent en diagonale avec rotation. Équivalent feuilles
// mortes, mais en sens unique vers le bas avec ADD orange.
function preparerTextureTison(scene) {
    const id = '_tison_halls_cendres';
    if (scene.textures.exists(id)) return id;
    const w = 10, h = 4;
    const cv = scene.textures.createCanvas(id, w, h);
    const ctx = cv.getContext();
    const gradient = ctx.createLinearGradient(0, 0, w, 0);
    gradient.addColorStop(0,   'rgba(255, 180, 80, 0)');
    gradient.addColorStop(0.5, 'rgba(255, 140, 50, 0.95)');
    gradient.addColorStop(1,   'rgba(200, 70,  20, 0.3)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    cv.refresh();
    return id;
}

function poserTisonsTombants(scene, dims, rng) {
    const objets = [];
    preparerTextureTison(scene);

    const em = scene.add.particles(0, 0, '_tison_halls_cendres', {
        x: { min: -100, max: 1060 },
        y: -20,
        lifespan: 7000,
        speedY: { min: 35, max: 65 },
        speedX: { min: -10, max: 6 },
        scale: { start: 0.9, end: 1.1 },
        rotate: { start: 0, end: 360 },
        alpha: { start: 0.9, end: 0.2 },
        blendMode: Phaser.BlendModes.ADD,
        tint: [0xffa040, 0xff7028, 0xc88040],
        quantity: 1,
        frequency: 2200
    });
    em.setScrollFactor(0.9, 0);
    em.setDepth(7);
    objets.push(em);

    return objets;
}

// Chaînes pendantes (remplace les vrilles de lierre des Ruines) : 1-2 par
// écran, restes du plafond effondré qui pendent verticalement avec sway lent.
function poserChainesPendantes(scene, dims, rng, palette) {
    const objets = [];
    const nbChaines = 1 + Math.floor(rng() * 2);

    for (let i = 0; i < nbChaines; i++) {
        const g = scene.add.graphics();
        const xBase = 80 + rng() * 800;
        const longueur = 90 + rng() * 80;

        // Maillons : succession de petits anneaux orientés alternativement
        const couleurChaine = 0x1a1208;
        const couleurReflet = 0x4a3a28;
        const nbMaillons = Math.floor(longueur / 8);
        for (let m = 0; m < nbMaillons; m++) {
            const y = m * 8;
            const orient = m % 2 === 0;
            const w = orient ? 6 : 3;
            const h = orient ? 4 : 8;
            g.lineStyle(1.4, couleurChaine, 0.85);
            g.strokeEllipse(0, y, w, h);
            // Petit reflet (face éclairée)
            g.lineStyle(0.6, couleurReflet, 0.55);
            g.strokeEllipse(-0.4, y - 0.4, w * 0.7, h * 0.6);
        }

        // Petit accroc en bout : poids ou crochet
        if (rng() < 0.5) {
            g.fillStyle(couleurChaine, 0.9);
            g.fillCircle(0, longueur + 4, 3);
        } else {
            g.lineStyle(1.5, couleurChaine, 0.85);
            g.beginPath();
            g.moveTo(0, longueur);
            g.lineTo(-3, longueur + 3);
            g.lineTo(-2, longueur + 8);
            g.strokePath();
        }

        g.x = xBase;
        g.y = -10;
        g.setScrollFactor(1.15, 0);
        g.setDepth(6);

        // Sway lent (la chaîne pend et oscille doucement)
        scene.tweens.add({
            targets: g,
            rotation: { from: -0.05, to: 0.05 },
            duration: 5000 + rng() * 2200,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
        objets.push(g);
    }

    return objets;
}

// Bokeh foreground braises : grosses formes très floutées orangées qui passent
// en parallax 1.4-1.6.
function poserBokehBraises(scene, dims, rng) {
    const objets = [];
    const nbBokeh = 3;
    const couleurs = [0xff7028, 0xa84818, 0xff9040];

    for (let i = 0; i < nbBokeh; i++) {
        const g = scene.add.graphics();
        const couleur = couleurs[i % couleurs.length];
        const r = 38 + rng() * 28;

        g.setBlendMode(Phaser.BlendModes.ADD);
        for (let l = 0; l < 4; l++) {
            const rad = r * (1 - l * 0.18);
            const alpha = 0.05 + l * 0.03;
            g.fillStyle(couleur, alpha);
            g.fillCircle(0, 0, rad);
        }

        g.x = 100 + rng() * 800;
        g.y = GAME_HEIGHT - 30 - rng() * 60;
        g.setScrollFactor(1.45 + rng() * 0.15, 0);
        g.setDepth(8);

        // Léger drift vertical + pulse alpha (la braise palpite)
        scene.tweens.add({
            targets: g,
            y: g.y + (rng() - 0.5) * 14,
            duration: 6000 + rng() * 4000,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
        scene.tweens.add({
            targets: g,
            alpha: { from: 0.55, to: 1.0 },
            duration: 1800 + rng() * 1200,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
        objets.push(g);
    }

    return objets;
}

// ============================================================
// SILHOUETTES PRIANTS — équivalent vestiges fugaces des Ruines
// ============================================================
//
// 1-2 par run. Figures agenouillées immobiles, très transparentes. Apparaissent
// par fade lent, restent immobiles pendant 8-12s, disparaissent. Évoque les
// derniers fidèles figés dans leur dernière prière.

function peindrePriantAgenouille(scene, couleur, alpha) {
    const g = scene.add.graphics();
    g.fillStyle(couleur, alpha);
    // Corps incliné en avant (tronc penché)
    g.fillEllipse(0, -10, 8, 14);
    // Cuisses agenouillées (rectangle horizontal sous le tronc)
    g.fillEllipse(0, -2, 12, 6);
    // Bras joints devant (petit triangle)
    g.fillEllipse(0, -6, 4, 8);
    // Tête baissée
    g.fillCircle(2, -16, 3.5);
    // Capuchon / linceul (couvre la tête vers le bas)
    g.fillStyle(couleur, alpha * 0.7);
    g.fillEllipse(1, -13, 8, 6);
    return g;
}

function poserSilhouettesPriants(scene, dims, rng, palette) {
    const objets = [];
    const nbPriants = 1 + Math.floor(rng() * 2);

    for (let v = 0; v < nbPriants; v++) {
        const couleur = rng() < 0.6 ? 0x6a5042 : 0x8a4838; // brun-gris ou brun-rouge
        const alphaCible = 0.22 + rng() * 0.10;
        const priant = peindrePriantAgenouille(scene, couleur, 1);
        priant.setAlpha(0);
        priant.setScrollFactor(0.4, 0);
        priant.setDepth(DEPTH.SILHOUETTES + 1);

        const yPos = GAME_HEIGHT - 25 - rng() * 8;
        priant.y = yPos;

        // Cycle d'apparition : invisible → fade in → reste immobile → fade out → pause
        const dureeCycle = 40000 + rng() * 30000;
        const delaiInitial = 5000 + v * 20000 + rng() * 10000;

        const lancerCycle = () => {
            // Position aléatoire dans la salle (le priant ne marche pas, il
            // est figé là où il est tombé en prière)
            const xPos = 80 + Math.random() * 800;
            priant.x = xPos;
            priant.alpha = 0;
            priant.y = GAME_HEIGHT - 25 - Math.random() * 8;

            // Fade in lent
            scene.tweens.add({
                targets: priant,
                alpha: alphaCible,
                duration: 2500,
                ease: 'Sine.Out'
            });
            // Reste 8-12 s immobile (pas de mouvement horizontal)
            const dureeImmobile = 8000 + Math.random() * 4000;
            // Léger tremblement spirituel : pulse alpha très subtil
            const pulse = scene.tweens.add({
                targets: priant,
                alpha: { from: alphaCible * 0.85, to: alphaCible },
                duration: 1200,
                ease: 'Sine.InOut',
                yoyo: true,
                repeat: -1,
                delay: 2500
            });
            // Fade out à la fin de la phase immobile
            scene.time.delayedCall(2500 + dureeImmobile, () => {
                pulse.stop();
                scene.tweens.add({
                    targets: priant,
                    alpha: 0,
                    duration: 2500,
                    ease: 'Sine.In'
                });
            });
            scene.time.delayedCall(dureeCycle, lancerCycle);
        };

        scene.time.delayedCall(delaiInitial, lancerCycle);
        objets.push(priant);
    }

    return objets;
}

// ============================================================
// CENDRE TOMBANTE (météo) — équivalent pluie fine
// ============================================================
//
// Flocons noirs lents qui tombent verticalement, viewport entier. Cycle météo
// (3-5 % du temps en mode normal) ou forcé en salle de boss.

function preparerTextureFloconCendre(scene) {
    const id = '_flocon_cendre_halls_cendres';
    if (scene.textures.exists(id)) return id;
    const w = 4, h = 4;
    const cv = scene.textures.createCanvas(id, w, h);
    const ctx = cv.getContext();
    const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gradient.addColorStop(0,   'rgba(120, 100, 80, 0.85)');
    gradient.addColorStop(0.6, 'rgba(80, 60, 50, 0.5)');
    gradient.addColorStop(1,   'rgba(40, 30, 20, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    cv.refresh();
    return id;
}

function poserCendreTombante(scene, dims, rng, options = {}) {
    const objets = [];
    preparerTextureFloconCendre(scene);
    const forcer = options.forcer === true;

    const em = scene.add.particles(0, 0, '_flocon_cendre_halls_cendres', {
        x: { min: -100, max: 1060 },
        y: -20,
        lifespan: 5500,
        speedY: { min: 80, max: 130 },   // beaucoup plus lent que la pluie
        speedX: { min: -20, max: -5 },   // léger drift latéral (vent doux)
        scale: { start: 1.0, end: 0.8 },
        alpha: { start: 0.55, end: 0.35 },
        rotate: { start: 0, end: 90 },
        quantity: 3,
        frequency: 90,
        emitting: forcer
    });
    em.setScrollFactor(0, 0);
    em.setDepth(8);
    objets.push(em);

    if (forcer) return objets;

    // Cycle météo
    const lancerCycleCendre = () => {
        const pauseAvant = 50000 + Math.random() * 80000;
        scene.time.delayedCall(pauseAvant, () => {
            em.start();
            const dureeCendre = 25000 + Math.random() * 25000;
            scene.time.delayedCall(dureeCendre, () => {
                em.stop();
                lancerCycleCendre();
            });
        });
    };
    if (Math.random() < 0.5) {
        scene.time.delayedCall(2000 + Math.random() * 4000, () => {
            em.start();
            const dureeInit = 25000 + Math.random() * 20000;
            scene.time.delayedCall(dureeInit, () => {
                em.stop();
                lancerCycleCendre();
            });
        });
    } else {
        lancerCycleCendre();
    }

    return objets;
}

// ============================================================
// INTERACTIONS VIVANTES — cendre soulevée + atterrissage + cycle "souffle chaud"
// ============================================================
//
// Tick `postupdate` qui :
//   - applique un léger sway sinusoïdal aux tas de cendre (le souffle chaud)
//   - applique un lift quand le joueur passe (cendre soulevée en bouffée)
//   - détecte l'atterrissage et émet une gerbe d'étincelles ADD + nuage de cendre
//
// Pas de cycle "vent" comme aux Ruines (l'air est lourd, pas de rafales) —
// remplacé par un cycle "souffle de fournaise" très lent qui module l'amplitude
// du sway de toutes les cendres.

function enregistrerInteractionsHallsCendres(scene, cendres, emetteurTisons) {
    let etaitAuSol = true;
    let souffleCible = 0;
    let souffleCourant = 0;

    // Cycle "souffle de fournaise" — toutes les 15-25s, vague de chaleur qui
    // fait frémir la cendre. Plus rare et plus subtil que le vent des Ruines.
    const declencherSouffle = () => {
        souffleCible = 0.15 + Math.random() * 0.10;
        const duree = 4000 + Math.random() * 3000;
        scene.time.delayedCall(duree, () => {
            souffleCible = 0;
            scene.time.delayedCall(15000 + Math.random() * 10000, declencherSouffle);
        });
    };
    scene.time.delayedCall(6000 + Math.random() * 6000, declencherSouffle);

    const updTick = () => {
        const player = scene.player;
        if (!player) return;

        souffleCourant += (souffleCible - souffleCourant) * 0.03;

        const px = player.x;
        const py = player.y;
        const time = scene.time.now;
        const cam = scene.cameras.main;
        const playerScreenX = px - cam.scrollX;

        for (const tas of cendres) {
            const meta = tas._cendreHC;
            if (!meta) continue;

            // Sway sinusoïdal de base (frémissement de cendre)
            const sway = Math.sin(time * 0.0007 + meta.phase) * (0.02 + souffleCourant * 0.6);

            // Lift quand le joueur passe à proximité (cendre soulevée en bouffée)
            const tasScreenX = tas.x - cam.scrollX * 1.25;
            const dx = tasScreenX - playerScreenX;
            const dist = Math.abs(dx);
            let lift = 0;
            if (dist < 70) {
                const force = (70 - dist) / 70;
                lift = -force * 6; // soulèvement de 0 à -6 px
            }
            // Lerp doux du lift
            meta.liftJoueur += (lift - meta.liftJoueur) * 0.15;

            tas.rotation = sway;
            tas.y = meta.yBase + meta.liftJoueur;
        }

        // Détection atterrissage
        const auSol = !!(player.body && (player.body.blocked.down || (player.body.onFloor && player.body.onFloor())));
        if (auSol && !etaitAuSol) {
            // Gerbe d'étincelles ADD (équivalent feuilles, mais montantes et lumineuses)
            if (emetteurTisons && emetteurTisons.emitParticleAt) {
                // On émet sur place mais avec vélocité ascendante temporaire
                for (let k = 0; k < 6 + Math.floor(Math.random() * 4); k++) {
                    emetteurTisons.emitParticleAt(px + (Math.random() - 0.5) * 16, py + 24, 1);
                }
            }
            // Nuage de cendre au pied — gris sale, gros et bas (plus visible que
            // la poussière des Ruines, c'est la cendre qui se soulève)
            const nuage = scene.add.graphics();
            nuage.fillStyle(0x6a5440, 0.55);
            nuage.fillEllipse(0, 0, 18, 5);
            nuage.x = px;
            nuage.y = py + 30;
            nuage.setDepth(7);
            scene.tweens.add({
                targets: nuage,
                scale: 2.5,
                alpha: 0,
                duration: 480,
                onComplete: () => nuage.destroy()
            });
            // Petite gerbe orange ADD ponctuelle (les braises qu'on a écrasées)
            const gerbe = scene.add.graphics();
            gerbe.setBlendMode(Phaser.BlendModes.ADD);
            gerbe.fillStyle(0xffa040, 0.7);
            gerbe.fillCircle(0, 0, 4);
            gerbe.x = px;
            gerbe.y = py + 26;
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
// FUMÉE VOLUMÉTRIQUE AU SOL — réactive au joueur + onde de parry
// ============================================================
//
// Même structure que la brume volumétrique des Ruines basses, mais palette
// ambrée-noire (palette.brume) et alpha de base plus élevé (l'air est plus
// chargé en suspension). Réagit à la proximité du joueur (bulle de clarté)
// et à l'onde de parry (dissipation 500 ms).

function poserFumeeVolumetriqueAuSol(scene, dims, rng, palette) {
    const objets = [];
    const blobs = [];
    const yBase = GAME_HEIGHT - 14;
    const nbBlobs = 14;
    const couleur = palette.brume;

    for (let i = 0; i < nbBlobs; i++) {
        const g = scene.add.graphics();
        const rayonX = 60 + rng() * 50;
        const rayonY = 14 + rng() * 8;
        // 3 couches alpha empilées + nuance plus noire au cœur (vs plus clair pour les Ruines)
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

        g._fumeeBlob = {
            alphaBase: 0.75 + rng() * 0.20,
            alphaCible: 0.75 + rng() * 0.20,
            alphaCourant: 0.75 + rng() * 0.20,
            dissipationParryFin: 0
        };
        g.setAlpha(g._fumeeBlob.alphaBase);

        scene.tweens.add({
            targets: g,
            x: g.x + 40 + rng() * 30,
            duration: 22000 + rng() * 14000,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
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

function enregistrerFumeeReactive(scene, blobs) {
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
            const meta = blob._fumeeBlob;
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
                blob._fumeeBlob.dissipationParryFin = now + dureeOnde;
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
// ESCARBILLES — 10 réactives + 25 lointaines (équivalent lucioles)
// ============================================================
//
// Les escarbilles tendent à MONTER (et non à dériver horizontalement comme les
// lucioles), traduisent l'air chaud qui s'élève. Réactives fuient le joueur
// avec une composante verticale dominante.

function preparerTextureEscarbille(scene) {
    const id = '_escarbille_halls_cendres';
    if (scene.textures.exists(id)) return id;
    const w = 10, h = 10;
    const cv = scene.textures.createCanvas(id, w, h);
    const ctx = cv.getContext();
    const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gradient.addColorStop(0,   'rgba(255, 220, 130, 1)');
    gradient.addColorStop(0.4, 'rgba(255, 140, 60, 0.7)');
    gradient.addColorStop(1,   'rgba(200, 70, 20, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    cv.refresh();
    return id;
}

function poserEscarbillesLointaines(scene, dims, rng) {
    const objets = [];
    preparerTextureEscarbille(scene);
    const nb = 25;
    const largeurEtendue = dims.largeur * 1.5;
    const decalageX = -dims.largeur * 0.25;

    for (let i = 0; i < nb; i++) {
        const esc = scene.add.image(0, 0, '_escarbille_halls_cendres');
        esc.setBlendMode(Phaser.BlendModes.ADD);
        const baseX = decalageX + (i / nb) * largeurEtendue + (rng() - 0.5) * 30;
        const baseY = 220 + rng() * 240;
        esc.x = baseX;
        esc.y = baseY;
        esc.setScale(0.4 + rng() * 0.3);
        esc.setAlpha(0.4 + rng() * 0.30);
        esc.setScrollFactor(0.4, 0);
        esc.setDepth(DEPTH.SILHOUETTES + 2);

        // Drift dominé vertical (monter) + petit drift horizontal
        const phase = rng() * Math.PI * 2;
        const amplX = 14 + rng() * 18;
        const amplY = 30 + rng() * 30;  // amplitude verticale plus grande (elles montent)
        const periode = 5500 + rng() * 3500;
        scene.tweens.add({
            targets: esc,
            x: { from: baseX - amplX, to: baseX + amplX },
            duration: periode,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1,
            delay: phase * 500
        });
        // Mouvement vertical : pas yoyo simple mais monte + reset bas
        scene.tweens.add({
            targets: esc,
            y: baseY - amplY,
            duration: periode * 0.9,
            ease: 'Sine.Out',
            yoyo: true,
            repeat: -1,
            delay: phase * 300
        });
        // Pulse alpha (l'escarbille "vit")
        scene.tweens.add({
            targets: esc,
            alpha: { from: esc.alpha * 0.4, to: esc.alpha },
            duration: 1200 + rng() * 800,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
        objets.push(esc);
    }

    return objets;
}

function poserEscarbillesReactives(scene, dims, rng) {
    const objets = [];
    const escarbilles = [];
    preparerTextureEscarbille(scene);
    const nb = 10;

    for (let i = 0; i < nb; i++) {
        const esc = scene.add.image(0, 0, '_escarbille_halls_cendres');
        esc.setBlendMode(Phaser.BlendModes.ADD);
        const ancrageX = 80 + rng() * Math.max(200, dims.largeur - 160);
        const ancrageY = GAME_HEIGHT - 140 - rng() * 200;
        esc.x = ancrageX;
        esc.y = ancrageY;
        esc.setScale(0.85 + rng() * 0.5);
        esc.setAlpha(0.65 + rng() * 0.25);
        esc.setScrollFactor(1.0, 0);
        esc.setDepth(15);

        esc._escarbille = {
            ancrageX,
            ancrageY,
            phase: rng() * Math.PI * 2,
            amplX: 14 + rng() * 16,
            amplY: 18 + rng() * 14,
            vitesse: 0.0007 + rng() * 0.0004,
            fuiteVX: 0,
            fuiteVY: 0
        };

        scene.tweens.add({
            targets: esc,
            alpha: { from: esc.alpha * 0.45, to: esc.alpha },
            duration: 800 + rng() * 500,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });

        escarbilles.push(esc);
        objets.push(esc);
    }

    return { objets, escarbilles };
}

function enregistrerInteractionsEscarbilles(scene, escarbilles) {
    const cam = scene.cameras.main;
    const rayonFuite = 70;
    const forceFuite = 0.45;

    const updTick = () => {
        const player = scene.player;
        if (!player || escarbilles.length === 0) return;
        const time = scene.time.now;
        const playerScreenX = player.x - cam.scrollX;
        const playerScreenY = player.y - cam.scrollY;

        for (const esc of escarbilles) {
            const meta = esc._escarbille;
            if (!meta) continue;

            // Drift sinusoïdal autour de l'ancrage avec tendance ascensionnelle
            // (sin offset négatif sur Y → tend à monter)
            const baseX = meta.ancrageX + Math.sin(time * meta.vitesse + meta.phase) * meta.amplX;
            const baseY = meta.ancrageY + Math.cos(time * meta.vitesse * 1.3 + meta.phase) * meta.amplY
                          - Math.abs(Math.sin(time * meta.vitesse * 0.5)) * 8; // biais montant

            // Fuite radiale du joueur — biais ascensionnel ajouté (elles montent plus que fuient horizontalement)
            const escScreenX = esc.x - cam.scrollX * 1.0;
            const escScreenY = esc.y;
            const dx = escScreenX - playerScreenX;
            const dy = escScreenY - playerScreenY;
            const dist = Math.hypot(dx, dy);
            if (dist < rayonFuite && dist > 0.1) {
                const facteur = (rayonFuite - dist) / rayonFuite;
                meta.fuiteVX += (dx / dist) * forceFuite * facteur * 0.6;
                // Force la composante verticale vers le haut quand le joueur est proche
                meta.fuiteVY += (dy / dist) * forceFuite * facteur * 0.6 - 0.25 * facteur;
            }
            meta.fuiteVX *= 0.92;
            meta.fuiteVY *= 0.92;

            esc.x = baseX + meta.fuiteVX * 30;
            esc.y = baseY + meta.fuiteVY * 30;
        }
    };
    scene.events.on('postupdate', updTick);
    scene.events.once('shutdown', () => scene.events.off('postupdate', updTick));
}

// ============================================================
// COMPOSER PUBLIC
// ============================================================

export function composerParallaxHallsCendres(scene, dims, monde, rng) {
    const palette = paletteCouranteScene(scene, monde);
    const objets = [];

    const estSalleBoss = !!scene.registry.get('salle_est_boss');
    const etage = scene.registry.get('etage_courant') ?? 3;

    // === BACKGROUND (du plus lointain au plus proche) ===

    // Couche 0 — plafond voûté cassé (fragments d'arches au-dessus de l'écran)
    // Mood boss : plafond plus dense / plus sombre
    const plafond = poserPlafondVoute(scene, dims, rng, palette);
    if (estSalleBoss) {
        for (const p of plafond) p.setAlpha(1.0);
    }
    objets.push(...plafond);

    // Couche 0.5 — poussière ambiante qui descend
    // Mood boss : on garde (la cendre tombe toujours, c'est cohérent)
    objets.push(...poserPoussiereAmbiante(scene, dims, rng));

    // Couche 1 (la plus lointaine) — arches funéraires 2 rangées + fumée stagnante haute
    objets.push(...poserArchesFuneraires(scene, dims, rng, palette));

    // Couche 2 — VOILE D'HORIZON ambre : en salle de boss il s'épaissit
    const voile = poserVoileHorizonHC(scene);
    if (estSalleBoss) for (const v of voile) v.setAlpha(1.5);
    objets.push(...voile);

    // Couche 3 — silhouettes funéraires (catafalques, colonnes brisées, sarcophages, braseros)
    objets.push(...poserSilhouettesFuneraires(scene, dims, rng, palette));

    // Couche 4 — FUMÉE STAGNANTE basse : plus dense en salle de boss
    const fumeeStagnante = poserFumeeStagnante(scene, dims, rng, palette);
    if (estSalleBoss) for (const b of fumeeStagnante) b.setAlpha(b.alpha * 1.4);
    objets.push(...fumeeStagnante);

    // Couche 5 — foyers résiduels (densité variable, gradient étage 3→4)
    // Mood boss : on garde mais on assombrit globalement (tous les foyers
    // perdent un peu d'intensité — les derniers feux vacillent face au boss)
    const foyers = poserFoyersResiduels(scene, dims, rng, palette);
    if (estSalleBoss) {
        // Tous les foyers vacillent face au boss (statiques dimmés ; flammes
        // ADD seront brièvement écrasées par leur tween mais le pulse reprend).
        for (const f of foyers) f.setAlpha((f.alpha ?? 1) * 0.7);
    }
    objets.push(...foyers);

    // Couche 6 — sol-dalles fendues + veines de feu ADD
    objets.push(...poserSolDallesFendues(scene, dims, rng, palette));

    // Couche 7 — SILHOUETTES PRIANTS (pas en salle de boss : la prière s'est tue)
    if (!estSalleBoss) {
        objets.push(...poserSilhouettesPriants(scene, dims, rng, palette));
    }

    // Couche 8 — RAYONS RASANTS CHAUDS (filtration ambrée subtile)
    objets.push(...poserRayonsRasants(scene, dims, rng));

    // === MILIEU — escarbilles lointaines + fumée volumétrique sol ===

    // 25 escarbilles lointaines arrière-plan
    // Désactivées en salle de boss (atmosphère grave, plus rien ne s'envole)
    if (!estSalleBoss) {
        objets.push(...poserEscarbillesLointaines(scene, dims, rng));
    }

    // Fumée volumétrique au sol — 14 blobs réactifs joueur + onde parry
    const { objets: fumeeVolumetriqueObjets, blobs: blobsFumee } =
        poserFumeeVolumetriqueAuSol(scene, dims, rng, palette);
    if (estSalleBoss) {
        for (const b of blobsFumee) {
            b._fumeeBlob.alphaBase = Math.min(1, b._fumeeBlob.alphaBase * 1.6);
            b._fumeeBlob.alphaCible = b._fumeeBlob.alphaBase;
            b._fumeeBlob.alphaCourant = b._fumeeBlob.alphaBase;
            b.setAlpha(b._fumeeBlob.alphaBase);
        }
    }
    objets.push(...fumeeVolumetriqueObjets);
    enregistrerFumeeReactive(scene, blobsFumee);

    // === FOREGROUND (au-dessus des plateformes, sous les entités) ===

    // Bokeh foreground braises (formes très floutées orangées)
    objets.push(...poserBokehBraises(scene, dims, rng));

    // Chaînes pendantes depuis le haut (1-2). Étage 4 = un peu plus de chaînes
    // (le plafond s'effondre davantage).
    objets.push(...poserChainesPendantes(scene, dims, rng, palette));
    if (etage >= 4 && !estSalleBoss) {
        objets.push(...poserChainesPendantes(scene, dims, rng, palette));
    }

    // Tisons rougeoyants tombants : désactivés en salle de boss
    let emetteurTisons = null;
    if (!estSalleBoss) {
        const tisonsObjets = poserTisonsTombants(scene, dims, rng);
        objets.push(...tisonsObjets);
        emetteurTisons = tisonsObjets[0];
    }

    // Cendre au sol foreground (se soulève au passage joueur + souffle chaud)
    const cendres = poserCendreSolForeground(scene, dims, rng, palette);
    objets.push(...cendres);

    // 10 escarbilles réactives au foreground (fuient le joueur en montant)
    // Désactivées en salle de boss
    if (!estSalleBoss) {
        const { objets: escObjets, escarbilles } = poserEscarbillesReactives(scene, dims, rng);
        objets.push(...escObjets);
        enregistrerInteractionsEscarbilles(scene, escarbilles);
    }

    // Cendre tombante (cycle météo) — forcée en salle de boss
    const cendreObjets = poserCendreTombante(scene, dims, rng, { forcer: estSalleBoss });
    objets.push(...cendreObjets);

    // Interactions vivantes : cendre réactive + atterrissage + cycle souffle chaud
    enregistrerInteractionsHallsCendres(scene, cendres, emetteurTisons);

    return objets;
}
