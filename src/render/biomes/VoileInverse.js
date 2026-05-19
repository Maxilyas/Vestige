// VoileInverse — composeur parallax spécifique au biome (étages 7-8).
//
// Direction : "La Cité Déchirée". C'est LA MÊME Olympe cristalline que les
// Cristaux Glacés (5-6) — mêmes silhouettes de temples, tholos, maisons,
// même tour cristalline centrale — mais le Reflux a percé le Voile. La cité
// se fragmente : des morceaux de skyline FLOTTENT à des angles impossibles,
// la tour centrale est FENDUE verticalement, des lacérations noir-rougeoyant
// traversent le ciel et laissent voir l'au-delà du Voile.
//
// Continuité explicite (validée user) :
//   - skyline reprend les mêmes types de structures (maison/temple/tholos/tour)
//   - tour centrale toujours là, à la même position
//   - les fenêtres lumineuses orange chaud persistent, mais désaturées
//
// Corruption signature :
//   - palette aubergine/magenta dominante (vs bleu glacé)
//   - fragments flottants détachés du sol (2-3 par couche skyline)
//   - tour fendue verticalement, lueur magenta saturée (vs violet pâle)
//   - les bâtiments lointains s'inclinent légèrement
//
// Couches actuelles :
//   BG    skyline corrompue + terre lointaine (sF 0.04)
//   BG    cité lointaine fragmentée           (sF 0.18)
//   BG    tour cristalline fendue             (sF 0.10, focal)
//   BG    déchirures verticales du Voile      (sF 0.08, dynamiques)
//
// Couche à venir :
//   5'.23 atmosphère (particules vers le haut, brume saturée)
//
// Phase 5'.21 (plateformes flicker fantômes) tentée puis retirée
// (rejetée user : trop bruyant en moyen plan).

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

// Phase 5'.20.3 — Peint la base "arrachée" d'un fragment flottant : un liseré
// magenta dentelé (polyline en dents irrégulières) + 3-4 débris magenta
// qui chutent autour. Marqueur visuel fort pour signaler "ce bâtiment est
// un morceau cassé" (vs "ce bâtiment flotte par erreur").
// Le fragment doit être peint à (0,0), `demiLargeur` = demi-largeur en px.
function peindreBaseArrachee(graphics, demiLargeur, rng) {
    // Liseré dentelé : polyline en dents de scie sur ±2 px de hauteur
    graphics.fillStyle(0xff5078, 0.85);
    const nbDents = Math.max(6, Math.floor(demiLargeur * 0.4));
    const pas = (demiLargeur * 2) / nbDents;
    for (let d = 0; d < nbDents; d++) {
        const xD = -demiLargeur + d * pas + (rng() - 0.5) * pas * 0.3;
        const wD = pas * (0.5 + rng() * 0.5);
        const hD = 1 + rng() * 3;          // 1-4 px de hauteur (irrégulier)
        graphics.fillRect(xD, -hD * 0.4, wD, hD);
    }
    // Cœur blanc-rose central plus net (le "saignement" le plus vif)
    graphics.fillStyle(0xffb0d8, 0.75);
    graphics.fillRect(-demiLargeur * 0.5, -1, demiLargeur, 1.2);

    // 4 débris magenta qui chutent autour de la base
    graphics.fillStyle(0xff5078, 0.85);
    for (let i = 0; i < 4; i++) {
        const xD = -demiLargeur * 0.8 + rng() * demiLargeur * 1.6;
        const yD = 4 + rng() * 14;         // entre 4 et 18 px sous la base
        const tD = 1 + rng() * 1.5;        // taille
        graphics.fillRect(xD, yD, tD, tD);
    }
}

// ============================================================
// COUCHE 1 — SKYLINE CORROMPUE (scrollFactor 0.04)
// ============================================================
//
// Reprend la skyline des Cristaux Glacés (mêmes 4 types : maison cubique,
// dôme rond, tour haute, grand temple à fronton) mais avec :
//   - palette aubergine sombre au lieu de bleu profond
//   - 2-3 fragments flottants détachés (mêmes formes mais translation Y
//     négative + légère inclinaison) — la cité se fragmente
//   - les collines de fond deviennent un sol noir abyssal (l'au-delà)

function poserSkylineCorrompue(scene, dims, rng, palette) {
    const objets = [];
    const g = scene.add.graphics();
    const largeurEtendue = dims.largeur * 1.6;
    const decalageX = -dims.largeur * 0.3;
    const ySol = GAME_HEIGHT - 150;
    // Phase 5'.20.1 — couleurs éclaircies pour décoller du gradient violet
    // (le fond mid est ~#582a5e, donc l'aubergine très sombre se fondait
    // dedans). On monte en clarté tout en restant désaturé.
    const couleur = 0x35184a;          // aubergine moyen (lisible sur le ciel)
    const couleurClair = 0x5a2870;     // aubergine claire pour reflets
    const couleurMontagne = 0x180820;  // abysse noir-pourpre (un cran plus clair)

    // Phase 5'.20.2 — TERRE LOINTAINE pour ancrer la skyline au sol.
    // Sans ça, les silhouettes flottaient dans le ciel violet vif (on
    // voyait "ciel" et "rien sous les bâtiments"). Bande opaque aubergine
    // qui descend du niveau de la skyline jusqu'au bas de l'écran +
    // dégradé subtil + 4 fissures verticales magenta (l'au-delà visible
    // à travers le Voile, cohérent avec le concept biome).
    const gTerre = scene.add.graphics();
    const hauteurTerre = GAME_HEIGHT - ySol;
    // Base aubergine sombre (un cran plus clair que l'abysse pour étager
    // la profondeur : ciel → abysse → terre → ciel d'avant-plan)
    gTerre.fillStyle(0x1e0a28, 1);
    gTerre.fillRect(decalageX, ySol, largeurEtendue, hauteurTerre);
    // Petit halo plus clair juste sous la ligne d'horizon (suggère
    // perspective atmosphérique : la terre touche le ciel)
    gTerre.fillStyle(couleur, 0.30);
    gTerre.fillRect(decalageX, ySol, largeurEtendue, 12);
    gTerre.fillStyle(couleur, 0.15);
    gTerre.fillRect(decalageX, ySol + 12, largeurEtendue, 18);
    // 4 fissures verticales magenta réparties (l'au-delà saigne à travers)
    for (let f = 0; f < 4; f++) {
        const xF = decalageX + ((f + 0.5) / 4) * largeurEtendue + (rng() - 0.5) * 80;
        const epF = 0.8 + rng() * 0.8;
        gTerre.fillStyle(0xff5078, 0.45);
        gTerre.fillRect(xF, ySol + 8, epF, hauteurTerre - 8);
        // Cœur blanc-rose plus net au centre de chaque fissure
        gTerre.fillStyle(0xffb0d8, 0.65);
        gTerre.fillRect(xF + epF * 0.3, ySol + 8, epF * 0.4, hauteurTerre - 8);
    }
    gTerre.setScrollFactor(0.04, 0);
    gTerre.setDepth(DEPTH.SILHOUETTES - 5);
    objets.push(gTerre);

    // Profil de l'abysse au lieu de collines (le sol s'est dissous)
    g.fillStyle(couleurMontagne, 1);
    g.beginPath();
    g.moveTo(decalageX, ySol);
    const nbBosses = 8;
    for (let i = 0; i <= nbBosses; i++) {
        const x = decalageX + (i / nbBosses) * largeurEtendue;
        // Vagues plus chaotiques (vs sinusoïde régulière des Cristaux)
        const yB = ySol - 6 - Math.sin(i * 1.3) * 14 - rng() * 14;
        g.lineTo(x, yB);
    }
    g.lineTo(decalageX + largeurEtendue, ySol);
    g.closePath();
    g.fillPath();

    // Skyline corrompue — 24 slots
    const nbSlots = 24;
    const pas = largeurEtendue / nbSlots;
    const positionsSilhouettes = []; // pour les fragments flottants
    for (let i = 0; i < nbSlots; i++) {
        if (rng() < 0.18) continue;
        const x = decalageX + (i + 0.5) * pas + (rng() - 0.5) * 12;
        const choix = rng();
        const yBase = ySol;

        g.fillStyle(couleur, 1);
        if (choix < 0.30) {
            // Maison cubique
            const w = 14 + rng() * 18;
            const h = 16 + rng() * 22;
            g.fillRect(x - w / 2, yBase - h, w, h);
            g.beginPath();
            g.moveTo(x - w / 2 - 1, yBase - h);
            g.lineTo(x, yBase - h - 4);
            g.lineTo(x + w / 2 + 1, yBase - h);
            g.closePath();
            g.fillPath();
            positionsSilhouettes.push({ x, w, h, type: 'maison' });
        } else if (choix < 0.55) {
            // Dôme rond
            const w = 16 + rng() * 14;
            const h = 18 + rng() * 14;
            g.fillRect(x - w / 2, yBase - h * 0.55, w, h * 0.55);
            g.fillEllipse(x, yBase - h * 0.55, w * 0.95, h * 0.5);
            positionsSilhouettes.push({ x, w, h, type: 'dome' });
        } else if (choix < 0.80) {
            // Tour haute
            const wT = 5 + rng() * 4;
            const hT = 35 + rng() * 30;
            g.fillRect(x - wT / 2, yBase - hT, wT, hT);
            g.beginPath();
            g.moveTo(x - wT / 2 - 1, yBase - hT);
            g.lineTo(x, yBase - hT - 6);
            g.lineTo(x + wT / 2 + 1, yBase - hT);
            g.closePath();
            g.fillPath();
            g.fillRect(x - 0.5, yBase - hT - 9, 1, 3);
            positionsSilhouettes.push({ x, w: wT, h: hT, type: 'tour' });
        } else {
            // Grand temple à fronton
            const w = 28 + rng() * 16;
            const h = 22 + rng() * 14;
            g.fillRect(x - w / 2, yBase - h, w, h);
            g.beginPath();
            g.moveTo(x - w / 2 - 3, yBase - h);
            g.lineTo(x, yBase - h - 6);
            g.lineTo(x + w / 2 + 3, yBase - h);
            g.closePath();
            g.fillPath();
            positionsSilhouettes.push({ x, w, h, type: 'temple' });
        }
    }

    // === FRAGMENTS FLOTTANTS (corruption signature) ===
    // 2-3 structures détachées du sol, translatées en l'air avec inclinaison.
    // On les peint sur un Graphics séparé (g2) pour pouvoir les rotater autour
    // de leur centre individuellement via Phaser (impossible sur le Graphics
    // unique de la skyline qui contient tout le sol et toutes les silhouettes).
    const nbFragments = 2 + Math.floor(rng() * 2);
    for (let f = 0; f < nbFragments; f++) {
        const src = positionsSilhouettes[Math.floor(rng() * positionsSilhouettes.length)];
        if (!src) break;
        // Phase 5'.20.1/.3 — hauteurs et inclinaisons fortes pour vendre
        // les "angles impossibles". Min ±18° pour qu'on lise franchement
        // "morceau arraché" et pas "maison qui flotte un peu".
        const dyHaut = 70 + rng() * 130;                                    // 70-200 px
        const signe = rng() < 0.5 ? -1 : 1;
        const inclinaison = signe * (0.32 + rng() * 0.24);                  // ±18° à ±32°
        const fragG = scene.add.graphics();
        fragG.fillStyle(couleur, 0.95);

        // On peint à (0,0) puis on positionne avec setPosition/setRotation
        if (src.type === 'maison') {
            fragG.fillRect(-src.w / 2, -src.h, src.w, src.h);
            fragG.beginPath();
            fragG.moveTo(-src.w / 2 - 1, -src.h);
            fragG.lineTo(0, -src.h - 4);
            fragG.lineTo(src.w / 2 + 1, -src.h);
            fragG.closePath();
            fragG.fillPath();
        } else if (src.type === 'dome') {
            fragG.fillRect(-src.w / 2, -src.h * 0.55, src.w, src.h * 0.55);
            fragG.fillEllipse(0, -src.h * 0.55, src.w * 0.95, src.h * 0.5);
        } else if (src.type === 'tour') {
            fragG.fillRect(-src.w / 2, -src.h, src.w, src.h);
            fragG.beginPath();
            fragG.moveTo(-src.w / 2 - 1, -src.h);
            fragG.lineTo(0, -src.h - 6);
            fragG.lineTo(src.w / 2 + 1, -src.h);
            fragG.closePath();
            fragG.fillPath();
        } else {
            fragG.fillRect(-src.w / 2, -src.h, src.w, src.h);
            fragG.beginPath();
            fragG.moveTo(-src.w / 2 - 3, -src.h);
            fragG.lineTo(0, -src.h - 6);
            fragG.lineTo(src.w / 2 + 3, -src.h);
            fragG.closePath();
            fragG.fillPath();
        }

        // Phase 5'.20.3 — Base arrachée (liseré dentelé + débris)
        peindreBaseArrachee(fragG, src.w / 2 + 3, rng);

        fragG.setPosition(src.x, ySol - dyHaut);
        fragG.setRotation(inclinaison);
        fragG.setScrollFactor(0.04, 0);
        fragG.setDepth(DEPTH.SILHOUETTES - 3);
        objets.push(fragG);

        // Léger flottement lent (le fragment dérive)
        scene.tweens.add({
            targets: fragG,
            y: { from: ySol - dyHaut, to: ySol - dyHaut - 4 - rng() * 4 },
            rotation: { from: inclinaison, to: inclinaison + (rng() - 0.5) * 0.05 },
            duration: 8000 + rng() * 4000,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
    }

    // 2 lignes d'horizon discrètes (couleur corrompue)
    g.fillStyle(couleurClair, 0.55);
    g.fillRect(decalageX, ySol - 0.5, largeurEtendue, 1);
    g.fillStyle(couleurClair, 0.25);
    g.fillRect(decalageX, ySol - 12, largeurEtendue, 0.6);

    g.setScrollFactor(0.04, 0);
    g.setDepth(DEPTH.SILHOUETTES - 4);
    objets.push(g);

    return objets;
}

// ============================================================
// COUCHE 2 — CITÉ LOINTAINE FRAGMENTÉE (scrollFactor 0.18)
// ============================================================
//
// Reprend `poserCiteLointaineSimple` des Cristaux mais :
//   - palette aubergine-magenta (vs bleu nuit)
//   - fenêtres lumineuses désaturées rose pâle (vs orange chaud)
//   - 2 structures sont peintes "fragmentées" : translatées en l'air avec
//     inclinaison, sur un Graphics séparé
//   - quelques structures normales ont une légère inclinaison ±3°
//     (le sol bouge sous la cité)

function poserCiteLointaineFragmentee(scene, dims, rng, palette) {
    const objets = [];
    const g = scene.add.graphics();
    const fenetres = scene.add.graphics();
    fenetres.setBlendMode(Phaser.BlendModes.ADD);
    const largeurEtendue = dims.largeur * 1.6;
    const decalageX = -dims.largeur * 0.3;
    const ySol = GAME_HEIGHT - 120;
    const xCentre = dims.largeur / 2;
    const exclusionCentre = 200;
    const couleur = 0x2a1842;          // aubergine moyen
    const couleurClair = 0x4a2a6a;     // aubergine claire
    const couleurOmbre = 0x140822;     // aubergine très sombre
    const couleurFenetre = 0xff90c0;   // rose pâle (vs jaune-orange chaud)

    const nb = 12;
    const pas = largeurEtendue / nb;
    const positions = [];
    for (let i = 0; i < nb; i++) {
        const xRaw = decalageX + (i + 0.5) * pas + (rng() - 0.5) * 18;
        if (Math.abs(xRaw - xCentre) < exclusionCentre) continue;
        positions.push(xRaw);
    }

    // 2 indices au hasard seront peints sur Graphics fragmentés (en l'air)
    const indicesFragments = new Set();
    while (indicesFragments.size < Math.min(2, Math.max(0, positions.length - 4))) {
        indicesFragments.add(Math.floor(rng() * positions.length));
    }

    for (let idx = 0; idx < positions.length; idx++) {
        const x = positions[idx];
        const estFragment = indicesFragments.has(idx);
        const estGrandeTour = (idx % 5 === 4) && !estFragment;
        const choix = estGrandeTour ? 0.95 : rng() * 0.90;

        // Cible : g normal ou fragment dédié
        let cible = g;
        let cibleFen = fenetres;
        let dyFragment = 0;
        let inclinaisonFragment = 0;
        let xLocal = x;
        if (estFragment) {
            cible = scene.add.graphics();
            cibleFen = scene.add.graphics();
            cibleFen.setBlendMode(Phaser.BlendModes.ADD);
            // Phase 5'.20.1/.3 — fragments fortement détachés
            dyFragment = 100 + rng() * 130;                                 // 100-230 px
            const signeF = rng() < 0.5 ? -1 : 1;
            inclinaisonFragment = signeF * (0.32 + rng() * 0.26);           // ±18° à ±33°
            xLocal = 0;
        }
        // Phase 5'.20.1 — inclinaison ±10° pour les structures non-fragments
        // (avant ±3°, invisible). Seuil 0.04 rad pour garder un mix de
        // structures droites et penchées (sinon tout penche, ça surcharge).
        const inclinNonFragment = !estFragment ? (rng() - 0.5) * 0.36 : 0;  // ±10°

        const dessiner = (cibleG, cibleF, xRef, yRef) => {
            cibleG.fillStyle(couleur, 1);
            if (choix < 0.30) {
                // Maison cubique
                const w = 36 + rng() * 28;
                const h = 55 + rng() * 35;
                cibleG.fillStyle(couleur, 1);
                cibleG.fillRect(xRef - w / 2, yRef - h, w, h);
                cibleG.fillStyle(couleurOmbre, 1);
                cibleG.beginPath();
                cibleG.moveTo(xRef - w / 2 - 4, yRef - h);
                cibleG.lineTo(xRef, yRef - h - h * 0.40);
                cibleG.lineTo(xRef + w / 2 + 4, yRef - h);
                cibleG.closePath();
                cibleG.fillPath();
                cibleG.fillStyle(couleurClair, 0.5);
                cibleG.fillRect(xRef + w / 2 - 3, yRef - h + 4, 3, h - 4);
                cibleG.fillStyle(couleurOmbre, 1);
                cibleG.fillRect(xRef - 4, yRef - 14, 8, 14);
                const nbFen = 1 + Math.floor(rng() * 3);
                for (let f = 0; f < nbFen; f++) {
                    if (rng() < 0.70) {
                        const xF = xRef - w * 0.30 + (f / nbFen) * w * 0.60;
                        const yF = yRef - h + h * 0.25 + (f % 2) * h * 0.30;
                        cibleF.fillStyle(couleurFenetre, 0.80);
                        cibleF.fillRect(xF - 1.5, yF - 1.5, 3, 3);
                        cibleF.fillStyle(0xffffff, 0.55);
                        cibleF.fillRect(xF - 0.5, yF - 0.5, 1, 1);
                    }
                }
            } else if (choix < 0.50) {
                // Temple à fronton
                const w = 60 + rng() * 35;
                const h = 75 + rng() * 40;
                const hCol = h * 0.65;
                cibleG.fillStyle(couleurOmbre, 1);
                cibleG.fillRect(xRef - w / 2 - 2, yRef - 4, w + 4, 4);
                cibleG.fillRect(xRef - w / 2, yRef - 7, w, 3);
                cibleG.fillStyle(couleur, 1);
                const nbCol = 5 + Math.floor(rng() * 2);
                const epCol = 3.5;
                const espCol = (w - nbCol * epCol) / (nbCol - 1);
                for (let c = 0; c < nbCol; c++) {
                    const xC = xRef - w / 2 + c * (epCol + espCol);
                    cibleG.fillRect(xC, yRef - 7 - hCol, epCol, hCol);
                }
                cibleG.fillStyle(couleurClair, 0.5);
                cibleG.fillRect(xRef + w / 2 - epCol + 0.5, yRef - 7 - hCol + 3, 1, hCol - 6);
                cibleG.fillStyle(couleur, 1);
                cibleG.fillRect(xRef - w / 2 - 2, yRef - 7 - hCol - 6, w + 4, 6);
                cibleG.beginPath();
                cibleG.moveTo(xRef - w / 2 - 4, yRef - 7 - hCol - 6);
                cibleG.lineTo(xRef, yRef - h - 2);
                cibleG.lineTo(xRef + w / 2 + 4, yRef - 7 - hCol - 6);
                cibleG.closePath();
                cibleG.fillPath();
                cibleG.fillStyle(couleurClair, 1);
                cibleG.fillCircle(xRef, yRef - h - 1, 2.5);
                cibleF.fillStyle(couleurFenetre, 0.50);
                cibleF.fillRect(xRef - w * 0.20, yRef - 7 - hCol * 0.5, w * 0.40, hCol * 0.30);
            } else if (choix < 0.70) {
                // Tholos (rotonde)
                const w = 38 + rng() * 24;
                const h = 55 + rng() * 30;
                cibleG.fillStyle(couleurOmbre, 1);
                cibleG.fillEllipse(xRef, yRef - 3, w + 8, 6);
                cibleG.fillStyle(couleur, 1);
                cibleG.fillRect(xRef - w / 2, yRef - 4 - h * 0.60, w, h * 0.60);
                cibleG.fillEllipse(xRef, yRef - 4 - h * 0.60, w * 0.95, h * 0.55);
                cibleG.fillStyle(couleurClair, 0.45);
                cibleG.fillRect(xRef + w / 2 - 4, yRef - 4 - h * 0.55, 4, h * 0.55);
                cibleF.fillStyle(couleurFenetre, 0.70);
                cibleF.fillCircle(xRef, yRef - 4 - h * 0.60 - h * 0.25, 2);
            } else if (choix < 0.85) {
                // Statue sur piédestal
                const w = 16 + rng() * 10;
                const h = 70 + rng() * 35;
                cibleG.fillStyle(couleurOmbre, 1);
                cibleG.fillRect(xRef - w / 2 - 3, yRef - 6, w + 6, 6);
                cibleG.fillRect(xRef - w / 2, yRef - h * 0.32, w, h * 0.32 - 6);
                cibleG.fillStyle(couleur, 1);
                cibleG.fillEllipse(xRef, yRef - h * 0.62, w * 0.60, h * 0.58);
                cibleG.fillCircle(xRef, yRef - h * 0.93, w * 0.22);
                cibleG.fillStyle(couleurClair, 0.5);
                cibleG.fillEllipse(xRef + w * 0.12, yRef - h * 0.58, w * 0.18, h * 0.42);
            } else if (choix < 0.92) {
                // Cyprès cristallin
                const w = 10 + rng() * 5;
                const h = 80 + rng() * 40;
                cibleG.fillStyle(couleurOmbre, 1);
                cibleG.fillRect(xRef - 1.5, yRef - 8, 3, 8);
                cibleG.fillStyle(couleur, 1);
                cibleG.beginPath();
                cibleG.moveTo(xRef, yRef - h);
                cibleG.lineTo(xRef - w / 2, yRef - h * 0.65);
                cibleG.lineTo(xRef - w * 0.30, yRef - 8);
                cibleG.lineTo(xRef + w * 0.30, yRef - 8);
                cibleG.lineTo(xRef + w / 2, yRef - h * 0.65);
                cibleG.closePath();
                cibleG.fillPath();
                cibleG.fillStyle(couleurClair, 0.45);
                cibleG.beginPath();
                cibleG.moveTo(xRef, yRef - h);
                cibleG.lineTo(xRef + w / 2, yRef - h * 0.65);
                cibleG.lineTo(xRef + w * 0.30, yRef - 8);
                cibleG.lineTo(xRef, yRef - 8);
                cibleG.closePath();
                cibleG.fillPath();
            } else {
                // Grande tour / beffroi
                const wT = 14 + rng() * 8;
                const hT = 140 + rng() * 50;
                cibleG.fillStyle(couleur, 1);
                cibleG.fillRect(xRef - wT / 2, yRef - hT, wT, hT);
                cibleG.fillStyle(couleurClair, 0.55);
                cibleG.fillRect(xRef + wT / 2 - 3, yRef - hT + 4, 3, hT - 8);
                cibleG.fillStyle(couleurOmbre, 1);
                for (let s = 1; s < 5; s++) {
                    cibleG.fillRect(xRef - wT / 2 - 1, yRef - hT * (s / 5), wT + 2, 2);
                }
                cibleG.fillStyle(couleurOmbre, 1);
                cibleG.beginPath();
                cibleG.moveTo(xRef - wT / 2 - 4, yRef - hT);
                cibleG.lineTo(xRef, yRef - hT - 12);
                cibleG.lineTo(xRef + wT / 2 + 4, yRef - hT);
                cibleG.closePath();
                cibleG.fillPath();
                cibleG.fillRect(xRef - 0.5, yRef - hT - 18, 1, 6);
                cibleG.fillRect(xRef - 2, yRef - hT - 15, 4, 1);
                for (let e = 1; e <= 4; e++) {
                    if (rng() < 0.60) {
                        const yF = yRef - hT * (e / 5) + hT / 10;
                        cibleF.fillStyle(couleurFenetre, 0.80);
                        cibleF.fillRect(xRef - 1.5, yF - 1, 3, 2.5);
                        cibleF.fillStyle(0xffffff, 0.50);
                        cibleF.fillCircle(xRef, yF + 0.2, 0.6);
                    }
                }
            }
        };

        if (estFragment) {
            dessiner(cible, cibleFen, 0, 0);
            // Phase 5'.20.3 — Base arrachée (dent + débris) à la place du
            // liseré droit. La largeur est volontairement large (45) pour
            // couvrir les types de structures les plus larges (temple/tour
            // de cité) en dénominateur commun.
            peindreBaseArrachee(cible, 45, rng);
            cible.setPosition(x, ySol - dyFragment);
            cible.setRotation(inclinaisonFragment);
            cibleFen.setPosition(x, ySol - dyFragment);
            cibleFen.setRotation(inclinaisonFragment);
            cible.setScrollFactor(0.18, 0);
            cible.setDepth(DEPTH.SILHOUETTES - 2);
            cibleFen.setScrollFactor(0.18, 0);
            cibleFen.setDepth(DEPTH.SILHOUETTES - 1);
            objets.push(cible);
            objets.push(cibleFen);

            // Flottement lent
            scene.tweens.add({
                targets: cible,
                y: { from: ySol - dyFragment, to: ySol - dyFragment - 5 - rng() * 5 },
                rotation: { from: inclinaisonFragment, to: inclinaisonFragment + (rng() - 0.5) * 0.06 },
                duration: 9000 + rng() * 5000,
                ease: 'Sine.InOut',
                yoyo: true,
                repeat: -1
            });
            scene.tweens.add({
                targets: cibleFen,
                y: { from: ySol - dyFragment, to: ySol - dyFragment - 5 - rng() * 5 },
                rotation: { from: inclinaisonFragment, to: inclinaisonFragment + (rng() - 0.5) * 0.06 },
                duration: 9000 + rng() * 5000,
                ease: 'Sine.InOut',
                yoyo: true,
                repeat: -1
            });
        } else if (Math.abs(inclinNonFragment) > 0.04) {
            // Structure légèrement inclinée → Graphics dédié pour rotation
            const cibleR = scene.add.graphics();
            const cibleFenR = scene.add.graphics();
            cibleFenR.setBlendMode(Phaser.BlendModes.ADD);
            dessiner(cibleR, cibleFenR, 0, 0);
            cibleR.setPosition(x, ySol);
            cibleR.setRotation(inclinNonFragment);
            cibleFenR.setPosition(x, ySol);
            cibleFenR.setRotation(inclinNonFragment);
            cibleR.setScrollFactor(0.18, 0);
            cibleR.setDepth(DEPTH.SILHOUETTES - 2);
            cibleFenR.setScrollFactor(0.18, 0);
            cibleFenR.setDepth(DEPTH.SILHOUETTES - 1);
            objets.push(cibleR);
            objets.push(cibleFenR);
        } else {
            // Structure droite, dessinée sur le Graphics global g
            dessiner(g, fenetres, x, ySol);
        }
    }

    g.setScrollFactor(0.18, 0);
    g.setDepth(DEPTH.SILHOUETTES - 2);
    fenetres.setScrollFactor(0.18, 0);
    fenetres.setDepth(DEPTH.SILHOUETTES - 1);
    objets.push(g);
    objets.push(fenetres);

    // Pulse géologique très lent pour les fenêtres (1 tween partagé)
    scene.tweens.add({
        targets: fenetres,
        alpha: { from: 0.60, to: 0.95 },
        duration: 5500 + rng() * 3000,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });

    return objets;
}

// ============================================================
// COUCHE 3 — TOUR CRISTALLINE FENDUE (focal, scrollFactor 0.10)
// ============================================================
//
// La même tour que Cristaux Glacés, MAIS fendue verticalement au centre :
// deux demi-polygones légèrement écartés, avec une fissure rougeoyante
// magenta visible entre les deux moitiés. Lueur sommet magenta saturé
// (vs violet pâle) qui pulse plus vite et plus fort.

function poserTourFendue(scene, dims, rng, palette) {
    const objets = [];
    const xCentre = dims.largeur / 2;
    const ySol = GAME_HEIGHT - 50;
    const etage = scene.registry.get('etage_courant') ?? 7;
    const facteurEtage = etage <= 7 ? 1.0 : 1.12;

    const hauteur = 360 * facteurEtage;
    const wBase = 70 * facteurEtage;
    const wHaut = 22 * facteurEtage;
    const ecartFente = 6;             // écartement horizontal des deux moitiés
    const couleur = 0x2a1842;         // aubergine moyen
    const couleurClair = 0x9876b0;    // highlight nacre malade
    const couleurOmbre = 0x0a0418;    // ombre profonde
    const couleurReflet = 0xd8b8ff;   // reflet violet pâle sur arêtes

    // === MOITIÉ GAUCHE ===
    const gG = scene.add.graphics();
    gG.fillStyle(couleur, 1);
    gG.beginPath();
    gG.moveTo(xCentre - wBase / 2, ySol);
    gG.lineTo(xCentre - wBase / 2 + 4, ySol - hauteur * 0.05);
    gG.lineTo(xCentre - wHaut / 2 - 4, ySol - hauteur * 0.90);
    gG.lineTo(xCentre - ecartFente / 2, ySol - hauteur);
    gG.lineTo(xCentre - ecartFente / 2, ySol);
    gG.closePath();
    gG.fillPath();
    // Face ombrée
    gG.fillStyle(couleurOmbre, 0.55);
    gG.beginPath();
    gG.moveTo(xCentre - ecartFente / 2, ySol - hauteur);
    gG.lineTo(xCentre - wHaut / 2 - 4, ySol - hauteur * 0.90);
    gG.lineTo(xCentre - wBase / 2 + 4, ySol - hauteur * 0.05);
    gG.lineTo(xCentre - wBase / 2, ySol);
    gG.lineTo(xCentre - ecartFente / 2 - 1, ySol);
    gG.closePath();
    gG.fillPath();
    gG.setScrollFactor(0.10, 0);
    gG.setDepth(DEPTH.SILHOUETTES - 1);
    objets.push(gG);

    // === MOITIÉ DROITE ===
    const gD = scene.add.graphics();
    gD.fillStyle(couleur, 1);
    gD.beginPath();
    gD.moveTo(xCentre + ecartFente / 2, ySol);
    gD.lineTo(xCentre + ecartFente / 2, ySol - hauteur);
    gD.lineTo(xCentre + wHaut / 2 + 4, ySol - hauteur * 0.90);
    gD.lineTo(xCentre + wBase / 2 - 4, ySol - hauteur * 0.05);
    gD.lineTo(xCentre + wBase / 2, ySol);
    gD.closePath();
    gD.fillPath();
    // Face éclairée (nacre malade)
    gD.fillStyle(couleurClair, 0.55);
    gD.beginPath();
    gD.moveTo(xCentre + ecartFente / 2, ySol - hauteur);
    gD.lineTo(xCentre + wHaut / 2 + 4, ySol - hauteur * 0.90);
    gD.lineTo(xCentre + wBase / 2 - 4, ySol - hauteur * 0.05);
    gD.lineTo(xCentre + wBase / 2, ySol);
    gD.lineTo(xCentre + ecartFente / 2 + 1, ySol);
    gD.closePath();
    gD.fillPath();
    gD.setScrollFactor(0.10, 0);
    gD.setDepth(DEPTH.SILHOUETTES - 1);
    objets.push(gD);

    // === ANNEAUX D'ORNEMENT (fissurés au milieu) ===
    const gAnneaux = scene.add.graphics();
    const yAnneaux = [0.25, 0.50, 0.75];
    for (const t of yAnneaux) {
        const yA = ySol - hauteur * t;
        const wLocal = wBase * (1 - t) + wHaut * t;
        // Anneaux peints en deux moitiés (interrompus par la fissure)
        gAnneaux.fillStyle(couleurOmbre, 1);
        gAnneaux.fillRect(xCentre - wLocal / 2 - 3, yA - 3, wLocal / 2 - ecartFente / 2 + 3, 4);
        gAnneaux.fillRect(xCentre + ecartFente / 2, yA - 3, wLocal / 2 - ecartFente / 2 + 3, 4);
        gAnneaux.fillStyle(couleurClair, 0.75);
        gAnneaux.fillRect(xCentre - wLocal / 2 - 4, yA - 6, wLocal / 2 - ecartFente / 2 + 4, 2);
        gAnneaux.fillRect(xCentre + ecartFente / 2, yA - 6, wLocal / 2 - ecartFente / 2 + 4, 2);
        // Gemmes brisées : 2 demi-points de part et d'autre
        gAnneaux.fillStyle(couleurReflet, 0.85);
        gAnneaux.fillCircle(xCentre - ecartFente / 2 - 1, yA - 1.5, 1.6);
        gAnneaux.fillCircle(xCentre + ecartFente / 2 + 1, yA - 1.5, 1.6);
    }
    gAnneaux.setScrollFactor(0.10, 0);
    gAnneaux.setDepth(DEPTH.SILHOUETTES - 1);
    objets.push(gAnneaux);

    // === FISSURE CENTRALE (lueur magenta-rose ADD) ===
    const gFissure = scene.add.graphics();
    gFissure.setBlendMode(Phaser.BlendModes.ADD);
    // Bande verticale magenta de fond
    gFissure.fillStyle(0xff5078, 0.55);
    gFissure.fillRect(xCentre - ecartFente / 2, ySol - hauteur, ecartFente, hauteur);
    // Cœur blanc-rose plus saturé au centre
    gFissure.fillStyle(0xffb0d8, 0.85);
    gFissure.fillRect(xCentre - 1, ySol - hauteur, 2, hauteur);
    // Petits éclats lumineux le long de la fissure
    for (let i = 0; i < 8; i++) {
        const t = (i + 0.5) / 8;
        const yE = ySol - hauteur * t;
        gFissure.fillStyle(0xffffff, 0.75);
        gFissure.fillCircle(xCentre, yE, 1.2);
    }
    gFissure.setScrollFactor(0.10, 0);
    gFissure.setDepth(DEPTH.SILHOUETTES);
    objets.push(gFissure);

    // Pulse rapide de la fissure (la corruption respire fort)
    scene.tweens.add({
        targets: gFissure,
        alpha: { from: 0.65, to: 1.0 },
        duration: 1800 + rng() * 800,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });

    // === LUEUR ADD MAGENTA AU SOMMET ===
    const lueur = scene.add.graphics();
    lueur.setBlendMode(Phaser.BlendModes.ADD);
    // Halo magenta plus large et plus saturé que le violet des Cristaux
    lueur.fillStyle(0xff70b0, 0.50);
    lueur.fillCircle(xCentre, ySol - hauteur, 28);
    lueur.fillStyle(0xffa0d0, 0.80);
    lueur.fillCircle(xCentre, ySol - hauteur, 14);
    lueur.fillStyle(0xffffff, 0.95);
    lueur.fillCircle(xCentre, ySol - hauteur, 4);
    // Petits éclats aux 3 niveaux d'anneaux (magenta, pas violet)
    for (const t of yAnneaux) {
        const yA = ySol - hauteur * t - 1.5;
        lueur.fillStyle(0xff70b0, 0.50);
        lueur.fillCircle(xCentre, yA, 5);
        lueur.fillStyle(0xffffff, 0.85);
        lueur.fillCircle(xCentre, yA, 1.4);
    }
    lueur.setScrollFactor(0.10, 0);
    lueur.setDepth(DEPTH.SILHOUETTES);
    objets.push(lueur);

    // Pulse rapide (plus rapide que les Cristaux : 2s vs 3.5s)
    scene.tweens.add({
        targets: lueur,
        alpha: { from: 0.60, to: 1.0 },
        duration: 2000 + rng() * 1000,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });

    return objets;
}

// ============================================================
// COUCHE 4 — DÉCHIRURES VERTICALES DU VOILE (scrollFactor 0.08)
// ============================================================
//
// LE concept signature du biome. 5 lacérations verticales dans le ciel
// qui laissent voir l'au-delà (noir cramoisi profond) avec un halo
// magenta ADD sur les bords + cœur blanc-rose saturé. Chaque déchirure
// est légèrement inclinée et "respire" via un scaleX qui s'élargit et
// se ferme très lentement (10-16s aller-retour).
//
// Forme : polyline irrégulière en 8 nœuds avec largeur ±20% par nœud +
// jitter X subtil — vend un vrai bord déchiré (pas une bande propre).
//
// Couvre seulement le ciel supérieur (y=30 à y=GAME_HEIGHT - 160) :
//   - évite le HUD du haut
//   - s'arrête au-dessus de la skyline / cité (sinon couvert)
//   - exclusion centrale de 100 px pour ne pas masquer la tour fendue
//     (qui est déjà la déchirure principale, conceptuellement)

function poserDechiruresVoile(scene, dims, rng) {
    const objets = [];
    const largeurEtendue = dims.largeur * 1.6;
    const decalageX = -dims.largeur * 0.3;
    const yHaut = 30;
    const yBas = GAME_HEIGHT - 160;
    const hauteurTot = yBas - yHaut;
    const xCentre = dims.largeur / 2;
    const exclusionCentre = 100;
    const nb = 5;

    for (let i = 0; i < nb; i++) {
        // Position X uniforme + jitter, repoussée hors du centre
        let xBase = decalageX + ((i + 0.5) / nb) * largeurEtendue
                    + (rng() - 0.5) * 80;
        if (Math.abs(xBase - xCentre) < exclusionCentre) {
            xBase += (xBase < xCentre ? -1 : 1) * exclusionCentre;
        }
        // Inclinaison subtile ±8° (la plupart presque verticales)
        const inclinaison = (rng() - 0.5) * 0.28;
        const largeurBase = 3 + rng() * 4;     // 3-7 px de base

        // Pré-calcul des nœuds de polyline (8 nœuds, largeur ±20%, jitter X ±1.5px)
        const nbNoeuds = 8;
        const pas = hauteurTot / (nbNoeuds - 1);
        const noeuds = [];
        for (let n = 0; n < nbNoeuds; n++) {
            const yN = yHaut + n * pas;
            const wN = largeurBase * (0.7 + rng() * 0.6);
            const jitter = (rng() - 0.5) * 3;
            noeuds.push({ y: yN, demiW: wN / 2, jitter });
        }

        // === FOND noir cramoisi (l'au-delà visible à travers la déchirure) ===
        const gFond = scene.add.graphics();
        gFond.fillStyle(0x140204, 1);
        gFond.beginPath();
        gFond.moveTo(-noeuds[0].demiW + noeuds[0].jitter, noeuds[0].y);
        for (let n = 1; n < nbNoeuds; n++) {
            gFond.lineTo(-noeuds[n].demiW + noeuds[n].jitter, noeuds[n].y);
        }
        for (let n = nbNoeuds - 1; n >= 0; n--) {
            gFond.lineTo(noeuds[n].demiW + noeuds[n].jitter, noeuds[n].y);
        }
        gFond.closePath();
        gFond.fillPath();
        gFond.setPosition(xBase, 0);
        gFond.setRotation(inclinaison);
        gFond.setScrollFactor(0.08, 0);
        gFond.setDepth(DEPTH.SILHOUETTES - 6);
        objets.push(gFond);

        // === HALO magenta ADD (bord rougeoyant) ===
        const gHalo = scene.add.graphics();
        gHalo.setBlendMode(Phaser.BlendModes.ADD);
        // Bande légèrement plus large que le fond, en magenta
        gHalo.fillStyle(0xff3060, 0.50);
        gHalo.beginPath();
        gHalo.moveTo(-noeuds[0].demiW - 2 + noeuds[0].jitter, noeuds[0].y);
        for (let n = 1; n < nbNoeuds; n++) {
            gHalo.lineTo(-noeuds[n].demiW - 2 + noeuds[n].jitter, noeuds[n].y);
        }
        for (let n = nbNoeuds - 1; n >= 0; n--) {
            gHalo.lineTo(noeuds[n].demiW + 2 + noeuds[n].jitter, noeuds[n].y);
        }
        gHalo.closePath();
        gHalo.fillPath();
        // Cœur blanc-rose central plus saturé (la lumière de l'au-delà)
        gHalo.fillStyle(0xffc0d8, 0.70);
        for (let n = 0; n < nbNoeuds - 1; n++) {
            // Trait vertical fin segment par segment (suit le jitter)
            const yA = noeuds[n].y;
            const yB = noeuds[n + 1].y;
            const xA = noeuds[n].jitter;
            const xB = noeuds[n + 1].jitter;
            gHalo.beginPath();
            gHalo.moveTo(xA - 0.6, yA);
            gHalo.lineTo(xB - 0.6, yB);
            gHalo.lineTo(xB + 0.6, yB);
            gHalo.lineTo(xA + 0.6, yA);
            gHalo.closePath();
            gHalo.fillPath();
        }
        gHalo.setPosition(xBase, 0);
        gHalo.setRotation(inclinaison);
        gHalo.setScrollFactor(0.08, 0);
        gHalo.setDepth(DEPTH.SILHOUETTES - 5);
        objets.push(gHalo);

        // === DYNAMIQUE — la déchirure s'ouvre et se ferme lentement ===
        // scaleX oscille entre 0.5 (presque fermée) et 1.7 (béante).
        // Phaser scale les Graphics autour du setPosition, donc ça
        // s'ouvre symétriquement autour de xBase.
        const dureePulse = 10000 + rng() * 6000;
        scene.tweens.add({
            targets: [gFond, gHalo],
            scaleX: { from: 0.5, to: 1.7 },
            duration: dureePulse,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
        // Pulse alpha rapide du halo (la lumière de l'au-delà vacille)
        scene.tweens.add({
            targets: gHalo,
            alpha: { from: 0.55, to: 1.0 },
            duration: 2200 + rng() * 1400,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
    }

    return objets;
}

// ============================================================
// COMPOSER PUBLIC
// ============================================================

export function composerParallaxVoileInverse(scene, dims, monde, rng) {
    const palette = paletteCouranteScene(scene, monde);
    const objets = [];

    // === BACKGROUND ===
    // Couche 1 — skyline corrompue + fragments flottants
    objets.push(...poserSkylineCorrompue(scene, dims, rng, palette));

    // Couche 2 — cité lointaine fragmentée
    objets.push(...poserCiteLointaineFragmentee(scene, dims, rng, palette));

    // Couche 3 — tour cristalline fendue (focal)
    objets.push(...poserTourFendue(scene, dims, rng, palette));

    // Couche 4 — déchirures verticales du Voile (5 lacérations dynamiques)
    objets.push(...poserDechiruresVoile(scene, dims, rng));

    // L'atmosphère inversée arrivera en 5'.23.

    return objets;
}
