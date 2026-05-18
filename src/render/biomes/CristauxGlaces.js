// CristauxGlaces — composeur parallax spécifique au biome (étages 5-6).
//
// Direction : "Sanctuaire Suspendu". Le joueur sort des Halls Cendrés (cathédrale
// en flammes au sol) et monte dans un pic acéré au-dessus du monde. Les Sources
// stockaient ici leurs mémoires importantes dans des cristaux mnésiques. Le
// froid n'est pas saisonnier — c'est un ARRÊT DU TEMPS. Silence dense, lumière
// cristalline qui filtre des pics lointains, abîme noir-bleuté visible sous le
// pic suspendu. Bi-ton signature : cristaux mnésiques actifs violet-blanc ↔
// cristaux fossilisés argent-nacre mat.
//
// Préfiguration discrète du Voile Inversé via les accents POURPRE pâle sur les
// cristaux mnésiques (équivalent narratif des racines pourpres des Ruines
// basses qui annonçaient le Reflux à l'autre extrémité du chemin).
//
// 14+ couches du fond vers l'avant :
//   BG    pics cristallins sommet  (sF 0.10, silhouettes acérées au-dessus, drift très lent)
//   BG    flocons en suspension    (sF 0.20, cendre figée qui dérive vers le bas)
//   BG    aiguilles cristallines   (sF 0.15, 2 rangées de pics superposés en silhouette)
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
// COUCHE 1 — AIGUILLES CRISTALLINES 2 RANGÉES (scrollFactor 0.15)
// ============================================================
//
// Équivalent thématique des arches funéraires des Halls / montagnes des Ruines :
// la "ligne d'horizon" est formée par des pics cristallins en silhouettes
// superposées. Deux rangées, pyramides acérées + bases minéralisées (la pierre
// du pic affleure entre les aiguilles).

function peindreAiguilleCristalline(scene, x, ySol, largeur, hauteur, couleurBase, alpha, rng) {
    const g = scene.add.graphics();
    const yTop = ySol - hauteur;

    g.fillStyle(couleurBase, alpha);

    // Forme principale : pic acéré (triangle dissymétrique) + base évasée
    g.beginPath();
    g.moveTo(x - largeur / 2, ySol);
    // Base élargie irrégulière à gauche
    g.lineTo(x - largeur / 2 + 6, ySol - hauteur * 0.18);
    g.lineTo(x - largeur * 0.18, ySol - hauteur * 0.45);
    // Sommet acéré (légèrement décalé pour asymétrie naturelle)
    const xSommet = x + (rng() - 0.5) * largeur * 0.15;
    g.lineTo(xSommet, yTop);
    // Descend à droite
    g.lineTo(x + largeur * 0.22, ySol - hauteur * 0.42);
    g.lineTo(x + largeur / 2 - 6, ySol - hauteur * 0.16);
    g.lineTo(x + largeur / 2, ySol);
    g.closePath();
    g.fillPath();

    // Facette éclairée (face droite plus claire — lumière qui rentre d'en haut)
    const couleurFacette = teinterPlusClair(couleurBase, 0.08);
    g.fillStyle(couleurFacette, alpha * 0.75);
    g.beginPath();
    g.moveTo(xSommet, yTop);
    g.lineTo(x + largeur * 0.22, ySol - hauteur * 0.42);
    g.lineTo(x + largeur / 2 - 6, ySol - hauteur * 0.16);
    g.lineTo(x + largeur / 2, ySol);
    g.lineTo(xSommet + 1, ySol);
    g.closePath();
    g.fillPath();

    // Fracture verticale subtile (la glace se fissure)
    if (rng() < 0.6) {
        g.lineStyle(1, teinterPlusSombre(couleurBase, 0.25), alpha * 0.6);
        const xF = x + (rng() - 0.5) * largeur * 0.2;
        g.beginPath();
        g.moveTo(xF, yTop + hauteur * 0.15);
        g.lineTo(xF + (rng() - 0.5) * 3, yTop + hauteur * 0.55);
        g.lineTo(xF + (rng() - 0.5) * 4, yTop + hauteur * 0.85);
        g.strokePath();
    }

    // Petit cristal mnésique au sommet (très rare — 1 aiguille sur 4 environ)
    if (rng() < 0.25) {
        const cristal = scene.add.graphics();
        cristal.setBlendMode(Phaser.BlendModes.ADD);
        cristal.fillStyle(0xb898e8, 0.45);
        cristal.fillCircle(xSommet, yTop + 2, 4);
        cristal.fillStyle(0xe0c8ff, 0.7);
        cristal.fillCircle(xSommet, yTop + 2, 1.5);
        cristal.setScrollFactor(0.15, 0);
        cristal.setDepth(DEPTH.SILHOUETTES - 2);
        scene.tweens.add({
            targets: cristal,
            alpha: { from: 0.5, to: 1.0 },
            duration: 4000 + rng() * 2000,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
    }

    return g;
}

function poserAiguillesCristallines(scene, dims, rng, palette) {
    const objets = [];
    const ySol = GAME_HEIGHT - 60;
    const largeurEtendue = dims.largeur * 1.6;
    const decalageX = -dims.largeur * 0.3;

    // Deux rangées superposées. Plus lointaine = plus pâle et basse, plus
    // proche = plus opaque et acérée.
    const rangees = [
        { nb: 6, hMin: 130, hMax: 200, lMin: 130, lMax: 220, alpha: 0.55, teinte: 0x202c40, yOffset: 4 },
        { nb: 5, hMin: 180, hMax: 280, lMin: 160, lMax: 260, alpha: 0.85, teinte: 0x0e1422, yOffset: 14 }
    ];

    for (const rangee of rangees) {
        const pas = largeurEtendue / rangee.nb;
        for (let i = 0; i < rangee.nb; i++) {
            const x = decalageX + pas * i + (rng() - 0.5) * pas * 0.3;
            const h = rangee.hMin + rng() * (rangee.hMax - rangee.hMin);
            const l = rangee.lMin + rng() * (rangee.lMax - rangee.lMin);
            const a = peindreAiguilleCristalline(scene, x, ySol + rangee.yOffset, l, h, rangee.teinte, rangee.alpha, rng);
            a.setScrollFactor(0.15, 0);
            a.setDepth(DEPTH.SILHOUETTES - 2);
            objets.push(a);
        }
    }

    // Bande de brume cristalline haute entre les aiguilles et le ciel
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
// COUCHE 0 — PICS CRISTALLINS SOMMETS (scrollFactor 0.10)
// ============================================================
//
// Équivalent thématique du plafond voûté cassé des Halls / nuages des Ruines :
// fragments cristallins qui dépassent depuis le haut de l'écran, comme si on
// voyait les sommets de pics encore plus hauts. Donne l'identité "on est au
// sommet du monde". Drift très lent (imperceptible — la glace ne bouge pas).

function poserPicsSommets(scene, dims, rng, palette) {
    const objets = [];
    const largeurEtendue = dims.largeur * 1.6;
    const decalageX = -dims.largeur * 0.3;

    // 3 fragments de pics qui dépassent du haut.
    const nbFragments = 3;
    const couleurFragment = 0x0a1020; // très sombre, presque noir-bleu

    for (let i = 0; i < nbFragments; i++) {
        const g = scene.add.graphics();
        const xBase = decalageX + (i + 0.3) * (largeurEtendue / nbFragments) + (rng() - 0.5) * 60;
        const largeurPic = 200 + rng() * 220;
        const profondeurPic = 70 + rng() * 50; // combien le pic descend depuis le haut
        const yHaut = -30;

        // Forme : pic acéré asymétrique vu d'en bas — polygone avec sommet
        // central + bases dentelées.
        g.fillStyle(couleurFragment, 0.92);
        g.beginPath();
        g.moveTo(xBase - largeurPic / 2, yHaut);
        // Descend à gauche en zigzag (pic cristallin acéré)
        g.lineTo(xBase - largeurPic / 2 + 14, yHaut + profondeurPic * 0.4);
        g.lineTo(xBase - largeurPic / 3, yHaut + profondeurPic * 0.55);
        g.lineTo(xBase - largeurPic / 4, yHaut + profondeurPic * 0.75);
        // Pointe centrale
        g.lineTo(xBase, yHaut + profondeurPic);
        g.lineTo(xBase + largeurPic / 4, yHaut + profondeurPic * 0.7);
        g.lineTo(xBase + largeurPic / 3, yHaut + profondeurPic * 0.5);
        g.lineTo(xBase + largeurPic / 2 - 14, yHaut + profondeurPic * 0.35);
        g.lineTo(xBase + largeurPic / 2, yHaut);
        g.closePath();
        g.fillPath();

        // Facettes claires (lumière qui glisse sur la glace)
        g.fillStyle(teinterPlusClair(couleurFragment, 0.06), 0.7);
        g.beginPath();
        g.moveTo(xBase, yHaut + profondeurPic);
        g.lineTo(xBase + largeurPic / 4, yHaut + profondeurPic * 0.7);
        g.lineTo(xBase + largeurPic / 3, yHaut + profondeurPic * 0.5);
        g.lineTo(xBase + largeurPic / 2 - 14, yHaut + profondeurPic * 0.35);
        g.lineTo(xBase + largeurPic / 2, yHaut);
        g.lineTo(xBase + 2, yHaut);
        g.closePath();
        g.fillPath();

        // Fractures internes (lignes cristallines)
        const couleurFracture = teinterPlusSombre(couleurFragment, 0.3);
        g.lineStyle(1, couleurFracture, 0.6);
        for (let n = 0; n < 3; n++) {
            const nx = xBase - largeurPic / 3 + n * largeurPic / 3;
            g.beginPath();
            g.moveTo(nx, yHaut);
            g.lineTo(nx + (rng() - 0.5) * 6, yHaut + profondeurPic * 0.45);
            g.strokePath();
        }

        g.setScrollFactor(0.10, 0);
        g.setDepth(DEPTH.CIEL + 2);
        objets.push(g);

        // Drift très lent yoyo (à peine perceptible — la glace est immobile)
        scene.tweens.add({
            targets: g,
            x: '+=' + (20 + rng() * 18),
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
// COMPOSER PUBLIC
// ============================================================

export function composerParallaxCristauxGlaces(scene, dims, monde, rng) {
    const palette = paletteCouranteScene(scene, monde);
    const objets = [];

    const estSalleBoss = !!scene.registry.get('salle_est_boss');
    const etage = scene.registry.get('etage_courant') ?? 5;

    // === BACKGROUND (du plus lointain au plus proche) ===

    // Couche 0 — pics cristallins sommets (fragments au-dessus de l'écran)
    const pics = poserPicsSommets(scene, dims, rng, palette);
    if (estSalleBoss) {
        for (const p of pics) p.setAlpha(1.0);
    }
    objets.push(...pics);

    // Couche 0.5 — flocons ambiants en suspension qui descendent
    objets.push(...poserFloconsEnSuspension(scene, dims, rng));

    // Couche 1 — aiguilles cristallines 2 rangées + brume haute
    objets.push(...poserAiguillesCristallines(scene, dims, rng, palette));

    // Couche 2 — voile d'horizon : en salle de boss il s'épaissit
    const voile = poserVoileHorizonCG(scene);
    if (estSalleBoss) for (const v of voile) v.setAlpha(1.5);
    objets.push(...voile);

    // Couche 3 — silhouettes mnésiques (reliquaires, obélisques, statues, piliers)
    objets.push(...poserSilhouettesMnesiques(scene, dims, rng, palette));

    // Couche 4 — brume glacée basse : plus dense en salle de boss
    const brumeBasse = poserBrumeGlacee(scene, dims, rng, palette);
    if (estSalleBoss) for (const b of brumeBasse) b.setAlpha(b.alpha * 1.4);
    objets.push(...brumeBasse);

    // Couche 5 — cristaux mnésiques sur pied (densité variable, gradient étage 5→6)
    // Mood boss : tous les cristaux vacillent (les dernières mémoires s'éteignent
    // face au gardien du sanctuaire).
    const cristaux = poserCristauxMnesiquesSurPied(scene, dims, rng, palette);
    if (estSalleBoss) {
        for (const c of cristaux) c.setAlpha((c.alpha ?? 1) * 0.7);
    }
    objets.push(...cristaux);

    // Couche 6 — sol-glace fendue + veines cristallines ADD
    objets.push(...poserSolGlaceFendue(scene, dims, rng, palette));

    // Couche 7 — silhouettes témoins (pas en salle de boss : les Témoins ont déserté)
    if (!estSalleBoss) {
        objets.push(...poserSilhouettesTemoins(scene, dims, rng, palette));
    }

    // Couche 8 — rayons cristallins (filtration violet-blanc subtile)
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

    // Bokeh foreground cristaux (formes très floutées violet-bleu)
    objets.push(...poserBokehCristaux(scene, dims, rng));

    // Stalactites pendantes depuis le haut (1-2). Étage 6 = un peu plus de
    // stalactites (le pic se fragilise au seuil du Voile).
    objets.push(...poserStalactitesPendantes(scene, dims, rng, palette));
    if (etage >= 6 && !estSalleBoss) {
        objets.push(...poserStalactitesPendantes(scene, dims, rng, palette));
    }

    // Éclats cristallins tombants : désactivés en salle de boss
    let emetteurEclats = null;
    if (!estSalleBoss) {
        const eclatsObjets = poserEclatsCristallinTombants(scene, dims, rng);
        objets.push(...eclatsObjets);
        emetteurEclats = eclatsObjets[0];
    }

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
