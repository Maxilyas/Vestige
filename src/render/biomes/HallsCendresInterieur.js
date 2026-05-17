// HallsCendresInterieur — structures architecturales ancrées caméra qui
// donnent l'effet "le joueur est constamment à l'intérieur d'une cathédrale
// funéraire à moitié effondrée" pendant la salle BOSS de l'étage 4.
//
// Phase 5'.6 — refonte complète : Phase 5'.5 utilisait parallax > 1 qui faisait
// dériver les structures à travers l'écran avec le scroll caméra (les colonnes
// arrivaient au centre au pire moment) et peignait en silhouette plate quasi-
// noire qui ne se lisait pas comme de la pierre. Refonte :
//
//   - Toutes les structures sont en setScrollFactor(0, 0) → ancrées à l'écran,
//     suivent la caméra comme un HUD. Le joueur est toujours "dedans".
//   - Couleurs cohérentes avec la palette plateforme du biome (pierre brûlée
//     0x2e2620 base, 0x5a4030 contour, 0x1a1208 ombre, 0x6e5440 highlight).
//   - Modelé painterly : top highlight, ombre portée, micro-variations, fissures
//     fines, dépôts de suie aux angles — le même langage visuel que les plateformes.
//
// Activé UNIQUEMENT en salle BOSS étage 4 (climax architectural unique du biome).
// Composition :
//   - Plafond cassé en haut (~135 px = 25 % du viewport), avec 2-3 fissures
//     dentelées qui laissent passer le ciel et la cendre tombante.
//   - 2 murs latéraux épais (~100 px = ~10 % de chaque bord), texturés painterly,
//     intégrés au plafond par leur bord supérieur cassé.
//   - Nervures pendantes aux bords des fissures (la voûte s'effrite).
//   - 1 fenêtre ogive intégrée dans chaque mur (lueur ADD pulsante).

import { DEPTH } from '../PainterlyRenderer.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../../config.js';

// Depth des structures intérieures : entre plateformes (0) et entités (20).
// Le joueur et les ennemis passent DEVANT les murs (lisibilité gameplay), mais
// les murs masquent toujours les plateformes (cohérent avec "on est dedans").
const DEPTH_INTERIEUR = 12;

// Hauteur du plafond cassé (≈ 25 % du viewport) et épaisseur des murs (~10 %).
const HAUTEUR_PLAFOND = 138;
const EPAISSEUR_MUR = 100;

// ============================================================
// PLAFOND CASSÉ — 2-3 fissures dentelées laissent passer ciel + cendre
// ============================================================

/**
 * Tire 2 ou 3 fissures positionnées et tailles variées dans la largeur du viewport.
 * Une grande, une moyenne, optionnellement une petite. Décalées (jamais pile au
 * centre, jamais collées aux bords).
 */
function genererFissures(rng) {
    const fissures = [];

    // Fissure 1 — grande (largeur 120-180), positionnée dans la moitié gauche ou droite
    const cote1 = rng() < 0.5 ? 'gauche' : 'droite';
    const w1 = 120 + rng() * 60;
    const x1 = cote1 === 'gauche'
        ? 110 + rng() * 90  // entre 110 et 200
        : GAME_WIDTH - 110 - w1 - rng() * 90;
    fissures.push({ x: x1, largeur: w1 });

    // Fissure 2 — moyenne (largeur 60-100), de l'autre côté
    const w2 = 60 + rng() * 40;
    const x2 = cote1 === 'gauche'
        ? GAME_WIDTH - 130 - w2 - rng() * 80
        : 130 + rng() * 80;
    fissures.push({ x: x2, largeur: w2 });

    // Fissure 3 — petite optionnelle (50 % de chance), placée dans le tiers central
    if (rng() < 0.5) {
        const w3 = 30 + rng() * 30;
        const x3 = GAME_WIDTH * 0.4 + rng() * (GAME_WIDTH * 0.2 - w3);
        fissures.push({ x: x3, largeur: w3 });
    }

    // Trier par x croissant pour pouvoir construire les panneaux entre
    fissures.sort((a, b) => a.x - b.x);

    // Éviter le chevauchement entre fissures (rare mais possible)
    for (let i = 1; i < fissures.length; i++) {
        if (fissures[i].x < fissures[i - 1].x + fissures[i - 1].largeur + 60) {
            fissures[i].x = fissures[i - 1].x + fissures[i - 1].largeur + 60;
        }
    }

    return fissures;
}

/**
 * Peint un panneau de plafond entre xDebut et xFin avec modelé painterly.
 * Le bord inférieur est dentelé (cassure irrégulière), le haut est plat.
 * Couleurs cohérentes avec PlateformeStyle.js Halls Cendrés.
 */
function peindrePanneauPlafond(g, palette, xDebut, xFin, rng) {
    const largeur = xFin - xDebut;
    const yHaut = 0;
    const yBas = HAUTEUR_PLAFOND;

    // (1) Profil du bord inférieur — polyline dentelée. ~1 point tous les 20-25 px.
    const nbPoints = Math.max(4, Math.floor(largeur / 22));
    const bord = [];
    bord.push({ x: xDebut, y: yBas - 4 - rng() * 6 });
    for (let i = 1; i < nbPoints; i++) {
        const t = i / nbPoints;
        const x = xDebut + largeur * t;
        // Variation irrégulière de 0 à -14 px (dents vers le haut, partie cassée)
        const dy = -rng() * 14;
        // Petit pic occasionnel descendant (saillie de pierre qui pend)
        const pic = rng() < 0.18 ? 4 + rng() * 5 : 0;
        bord.push({ x, y: yBas - 4 + dy + pic });
    }
    bord.push({ x: xFin, y: yBas - 4 - rng() * 6 });

    // (2) Corps du plafond — polygone : bord supérieur droit + bord inférieur dentelé
    g.fillStyle(palette.plateforme ?? 0x2e2620, 1);
    g.beginPath();
    g.moveTo(xDebut, yHaut - 4);
    g.lineTo(xFin, yHaut - 4);
    for (let i = bord.length - 1; i >= 0; i--) {
        g.lineTo(bord[i].x, bord[i].y);
    }
    g.closePath();
    g.fillPath();

    // (3) Ombre interne en bas — bandeau plus sombre près du bord cassé (la
    //     lumière vient du ciel par les fissures et tombe sur le HAUT du plafond,
    //     donc le BAS qu'on voit depuis dessous est moins éclairé).
    g.fillStyle(palette.pierreSombre ?? 0x1a1208, 0.55);
    g.beginPath();
    g.moveTo(xDebut, yBas - 40);
    g.lineTo(xFin, yBas - 40);
    for (let i = bord.length - 1; i >= 0; i--) {
        g.lineTo(bord[i].x, bord[i].y);
    }
    g.closePath();
    g.fillPath();

    // (4) Highlight en haut — fine bande plus claire (lumière qui filtre du ciel)
    g.fillStyle(palette.pierreClaire ?? 0x6e5440, 0.35);
    g.fillRect(xDebut, yHaut - 4, largeur, 6);

    // (5) Micro-variations de teinte sur la surface (effet peint à main)
    const nbZones = Math.max(2, Math.floor(largeur / 80));
    for (let i = 0; i < nbZones; i++) {
        const t = (i + 0.5) / nbZones;
        const xZ = xDebut + t * largeur + (rng() - 0.5) * 15;
        const wZ = largeur / nbZones * (0.5 + rng() * 0.4);
        const variation = rng() < 0.5
            ? (palette.pierreClaire ?? 0x6e5440)
            : (palette.pierreSombre ?? 0x1a1208);
        g.fillStyle(variation, 0.15 + rng() * 0.10);
        g.fillRect(xZ - wZ / 2, yHaut + 8 + rng() * 20, wZ, 40 + rng() * 50);
    }

    // (6) Fissures verticales fines (3-5) dans la pierre
    g.lineStyle(1, palette.pierreSombre ?? 0x1a1208, 0.55);
    const nbFissuresInternes = 2 + Math.floor(rng() * 3);
    for (let f = 0; f < nbFissuresInternes; f++) {
        const xF = xDebut + 10 + rng() * (largeur - 20);
        const yF1 = yHaut + 10 + rng() * 20;
        const yF2 = yF1 + 40 + rng() * 50;
        g.beginPath();
        g.moveTo(xF, yF1);
        g.lineTo(xF + (rng() - 0.5) * 4, yF2);
        g.strokePath();
    }

    // (7) Dépôts de suie sous le bord cassé (la cassure noircie par le passage
    //     des flammes — signature biome)
    g.fillStyle(palette.mousse ?? 0x18120e, 0.65);
    for (let i = 0; i < bord.length - 1; i += 2) {
        const p = bord[i];
        if (rng() < 0.45) {
            g.fillEllipse(p.x, p.y - 2, 8 + rng() * 6, 3);
        }
    }

    return bord;
}

/**
 * Petite nervure pendante (segment vertical) qui dépasse vers le bas depuis le
 * bord d'une fissure. Évoque les côtes voûtées qui pendent dans le vide.
 */
function peindreNervurePendante(g, palette, x, yDepart, rng) {
    const longueur = 14 + rng() * 22;
    const xFin = x + (rng() - 0.5) * 4;
    const yFin = yDepart + longueur;

    // Forme : trapèze vertical fin, pointu en bas
    g.fillStyle(palette.plateforme ?? 0x2e2620, 1);
    g.beginPath();
    g.moveTo(x - 3, yDepart - 2);
    g.lineTo(x + 3, yDepart - 2);
    g.lineTo(xFin + 1, yFin);
    g.lineTo(xFin - 1, yFin);
    g.closePath();
    g.fillPath();

    // Ombre côté gauche
    g.fillStyle(palette.pierreSombre ?? 0x1a1208, 0.5);
    g.beginPath();
    g.moveTo(x - 3, yDepart - 2);
    g.lineTo(x, yDepart - 2);
    g.lineTo(xFin, yFin);
    g.lineTo(xFin - 1, yFin);
    g.closePath();
    g.fillPath();

    // Petit point de suie au sommet
    g.fillStyle(palette.mousse ?? 0x18120e, 0.7);
    g.fillCircle(x, yDepart - 1, 2);
}

function peindrePlafondCasse(scene, palette, rng) {
    const objets = [];
    const g = scene.add.graphics();

    const fissures = genererFissures(rng);

    // Construire les panneaux entre les fissures (et aux bords gauche/droit)
    const panneaux = [];
    let lastX = -20;
    for (const f of fissures) {
        if (f.x > lastX) {
            panneaux.push({ xDebut: lastX, xFin: f.x });
        }
        lastX = f.x + f.largeur;
    }
    if (lastX < GAME_WIDTH + 20) {
        panneaux.push({ xDebut: lastX, xFin: GAME_WIDTH + 20 });
    }

    // Peindre chaque panneau
    for (const p of panneaux) {
        peindrePanneauPlafond(g, palette, p.xDebut, p.xFin, rng);
    }

    // Nervures pendantes aux bords des fissures (1-2 par fissure)
    for (const f of fissures) {
        const nbNervures = 1 + Math.floor(rng() * 2);
        for (let n = 0; n < nbNervures; n++) {
            const cote = n === 0 ? 'gauche' : 'droite';
            const x = cote === 'gauche'
                ? f.x + 4 + rng() * 8
                : f.x + f.largeur - 4 - rng() * 8;
            peindreNervurePendante(g, palette, x, HAUTEUR_PLAFOND - 8, rng);
        }
    }

    // Ombre portée sous le plafond (transition vers la zone gameplay)
    g.fillStyle(0x000000, 0.45);
    g.fillRect(0, HAUTEUR_PLAFOND, GAME_WIDTH, 4);
    g.fillStyle(0x000000, 0.22);
    g.fillRect(0, HAUTEUR_PLAFOND + 4, GAME_WIDTH, 8);

    g.setScrollFactor(0, 0);
    g.setDepth(DEPTH_INTERIEUR);
    objets.push(g);

    return objets;
}

// ============================================================
// MURS LATÉRAUX — pans de pierre épais avec modelé painterly
// ============================================================

/**
 * Peint un mur latéral épais sur le bord gauche ou droit du viewport. Top
 * cassé (s'intègre au plafond), texture pierre cohérente avec les plateformes,
 * fissures, dépôts de suie, 1-2 braises ADD au pied, fenêtre ogive intégrée.
 */
function peindreMurLateral(scene, palette, cote, rng) {
    const objets = [];
    const g = scene.add.graphics();

    const estGauche = cote === 'gauche';
    const xBord = estGauche ? 0 : GAME_WIDTH;
    const xInterieur = estGauche ? EPAISSEUR_MUR : GAME_WIDTH - EPAISSEUR_MUR;
    const yHaut = HAUTEUR_PLAFOND - 30;   // chevauche le plafond pour fusion
    const yBas = GAME_HEIGHT + 10;
    const signe = estGauche ? 1 : -1;     // pour décaler vers l'intérieur

    // (1) Profil supérieur dentelé — cassure irrégulière qui s'intègre au plafond
    const nbDents = 6;
    const bordHaut = [];
    bordHaut.push({ x: xBord, y: yHaut });
    for (let i = 1; i < nbDents; i++) {
        const t = i / nbDents;
        const x = xBord + signe * EPAISSEUR_MUR * t;
        const dy = -rng() * 12;
        bordHaut.push({ x, y: yHaut + 14 + dy });
    }
    bordHaut.push({ x: xInterieur, y: yHaut + 8 - rng() * 10 });

    // (2) Corps principal — polygone : bord vertical + bord supérieur cassé
    g.fillStyle(palette.plateforme ?? 0x2e2620, 1);
    g.beginPath();
    g.moveTo(xBord, yBas);
    g.lineTo(xBord, bordHaut[0].y);
    for (let i = 1; i < bordHaut.length; i++) {
        g.lineTo(bordHaut[i].x, bordHaut[i].y);
    }
    g.lineTo(xInterieur, yBas);
    g.closePath();
    g.fillPath();

    // (3) Highlight en haut (lumière du ciel par les fissures du plafond)
    g.fillStyle(palette.pierreClaire ?? 0x6e5440, 0.30);
    g.beginPath();
    g.moveTo(xBord, bordHaut[0].y);
    for (let i = 1; i < bordHaut.length; i++) {
        g.lineTo(bordHaut[i].x, bordHaut[i].y);
    }
    g.lineTo(xInterieur, bordHaut[bordHaut.length - 1].y + 24);
    g.lineTo(xBord, bordHaut[0].y + 24);
    g.closePath();
    g.fillPath();

    // (4) Ombre côté intérieur (face au gameplay) — la lumière vient des
    //     fissures du plafond et de l'extérieur, donc l'intérieur est plus sombre
    g.fillStyle(palette.pierreSombre ?? 0x1a1208, 0.45);
    const wOmbre = EPAISSEUR_MUR * 0.45;
    g.fillRect(estGauche ? xInterieur - wOmbre : xInterieur, yHaut + 28, wOmbre, yBas - yHaut - 28);

    // (5) Rim light côté bord viewport — fine bande lumineuse 2 px (le bord extérieur
    //     capte la lumière rasante)
    g.fillStyle(palette.pierreClaire ?? 0x6e5440, 0.55);
    g.fillRect(estGauche ? xBord : xBord - 2, yHaut + 18, 2, yBas - yHaut - 18);

    // (6) Micro-variations de teinte (5-7 zones verticales) — texture painterly
    const nbZones = 6;
    for (let i = 0; i < nbZones; i++) {
        const t = (i + 0.5) / nbZones;
        const yZ = yHaut + 28 + t * (yBas - yHaut - 30);
        const hZ = (yBas - yHaut - 30) / nbZones * (0.5 + rng() * 0.5);
        const xZ = xBord + signe * (8 + rng() * (EPAISSEUR_MUR - 16));
        const wZ = 18 + rng() * 28;
        const variation = rng() < 0.5
            ? (palette.pierreClaire ?? 0x6e5440)
            : (palette.pierreSombre ?? 0x1a1208);
        g.fillStyle(variation, 0.15 + rng() * 0.08);
        g.fillRect(xZ - wZ / 2, yZ - hZ / 2, wZ, hZ);
    }

    // (7) Fissures verticales (3-5) — pierre fissurée
    g.lineStyle(1.2, palette.pierreSombre ?? 0x1a1208, 0.65);
    const nbFissures = 3 + Math.floor(rng() * 3);
    for (let f = 0; f < nbFissures; f++) {
        const xF = xBord + signe * (12 + rng() * (EPAISSEUR_MUR - 24));
        const yF1 = yHaut + 40 + rng() * 80;
        const yF2 = yF1 + 50 + rng() * 80;
        g.beginPath();
        g.moveTo(xF, yF1);
        g.lineTo(xF + (rng() - 0.5) * 3, yF2);
        g.strokePath();
    }

    // (8) Dépôts de suie au pied (le sol est plus noirci)
    g.fillStyle(palette.mousse ?? 0x18120e, 0.7);
    g.fillEllipse(xBord + signe * (EPAISSEUR_MUR * 0.5), yBas - 6, EPAISSEUR_MUR * 0.9, 10);
    // Quelques tas plus marqués
    for (let s = 0; s < 3; s++) {
        const xS = xBord + signe * (10 + rng() * (EPAISSEUR_MUR - 20));
        g.fillCircle(xS, yBas - 4 - rng() * 4, 3 + rng() * 3);
    }

    g.setScrollFactor(0, 0);
    g.setDepth(DEPTH_INTERIEUR);
    objets.push(g);

    // (9) Braises ADD au pied (1-2 par mur, signature bi-ton biome)
    const nbBraises = 1 + Math.floor(rng() * 2);
    for (let b = 0; b < nbBraises; b++) {
        const braise = scene.add.graphics();
        braise.setBlendMode(Phaser.BlendModes.ADD);
        const xBraise = xBord + signe * (20 + rng() * (EPAISSEUR_MUR - 40));
        const yBraise = yBas - 4 - rng() * 10;
        braise.fillStyle(palette.racine ?? 0xff6020, 0.5);
        braise.fillCircle(xBraise, yBraise, 6);
        braise.fillStyle(0xffd060, 0.85);
        braise.fillCircle(xBraise, yBraise, 2.2);
        braise.setScrollFactor(0, 0);
        braise.setDepth(DEPTH_INTERIEUR + 1);
        scene.tweens.add({
            targets: braise,
            alpha: { from: 0.55, to: 1.0 },
            duration: 900 + rng() * 500,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
        objets.push(braise);
    }

    // (10) Fenêtre ogive intégrée — climax architectural
    objets.push(...peindreFenetreOgiveIntegree(scene, palette, cote, rng));

    return objets;
}

/**
 * Fenêtre en ogive intégrée dans le mur latéral (au lieu de flotter dans l'air
 * comme dans la Phase 5'.5). Lueur ADD rouge intérieure pulsante très lente.
 */
function peindreFenetreOgiveIntegree(scene, palette, cote, rng) {
    const objets = [];
    const estGauche = cote === 'gauche';
    const signe = estGauche ? 1 : -1;
    const xBord = estGauche ? 0 : GAME_WIDTH;

    // Centrée horizontalement dans le mur, verticalement à 35-45 % du viewport
    const xCentre = xBord + signe * (EPAISSEUR_MUR * 0.5);
    const yHaut = HAUTEUR_PLAFOND + 20 + rng() * 30;
    const largeur = EPAISSEUR_MUR * 0.55;
    const hauteur = 120;

    const g = scene.add.graphics();

    // Cadre pierre (un peu plus sombre que le mur — c'est creusé)
    g.fillStyle(palette.pierreSombre ?? 0x1a1208, 0.95);
    g.beginPath();
    // Forme : rectangle + demi-cercle en haut (ogive)
    g.moveTo(xCentre - largeur / 2, yHaut + hauteur);
    g.lineTo(xCentre - largeur / 2, yHaut + largeur / 2);
    const segs = 10;
    for (let s = 0; s <= segs; s++) {
        const t = s / segs;
        const sx = xCentre - largeur / 2 + largeur * t;
        const sy = yHaut + largeur / 2 - Math.sin(Math.PI * t) * (largeur / 2);
        g.lineTo(sx, sy);
    }
    g.lineTo(xCentre + largeur / 2, yHaut + hauteur);
    g.closePath();
    g.fillPath();

    // Vitrail intérieur sombre (rouge-noir, plus petit que le cadre)
    const inset = 6;
    g.fillStyle(0x1a0808, 1);
    g.beginPath();
    g.moveTo(xCentre - largeur / 2 + inset, yHaut + hauteur - 4);
    g.lineTo(xCentre - largeur / 2 + inset, yHaut + largeur / 2);
    for (let s = 0; s <= segs; s++) {
        const t = s / segs;
        const sx = xCentre - largeur / 2 + inset + (largeur - inset * 2) * t;
        const sy = yHaut + largeur / 2 - Math.sin(Math.PI * t) * (largeur / 2 - inset);
        g.lineTo(sx, sy);
    }
    g.lineTo(xCentre + largeur / 2 - inset, yHaut + hauteur - 4);
    g.closePath();
    g.fillPath();

    // Meneau central vertical + traverse horizontale (croisée)
    g.fillStyle(palette.pierreSombre ?? 0x1a1208, 0.95);
    g.fillRect(xCentre - 1.5, yHaut + inset + 2, 3, hauteur - inset - 6);
    g.fillRect(xCentre - largeur / 2 + inset + 2, yHaut + hauteur * 0.55, largeur - (inset + 2) * 2, 2);

    g.setScrollFactor(0, 0);
    g.setDepth(DEPTH_INTERIEUR + 1);
    objets.push(g);

    // Lueur ADD intérieure (la dernière braise du vitrail)
    const lueur = scene.add.graphics();
    lueur.setBlendMode(Phaser.BlendModes.ADD);
    lueur.fillStyle(0x802010, 0.40);
    lueur.fillEllipse(xCentre, yHaut + hauteur * 0.65, largeur * 0.65, hauteur * 0.5);
    lueur.fillStyle(palette.racine ?? 0xff6020, 0.30);
    lueur.fillEllipse(xCentre, yHaut + hauteur * 0.65, largeur * 0.35, hauteur * 0.25);
    lueur.setScrollFactor(0, 0);
    lueur.setDepth(DEPTH_INTERIEUR + 2);

    // Pulse très lent (la lueur agonise)
    scene.tweens.add({
        targets: lueur,
        alpha: { from: 0.45, to: 1.0 },
        duration: 3200 + rng() * 1600,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });
    objets.push(lueur);

    return objets;
}

// ============================================================
// API PUBLIQUE
// ============================================================
//
// Active uniquement quand etage === 4 && boss === true.
// Hors de ce contexte, renvoie un tableau vide (les autres salles gardent le
// composer Halls Cendrés ouvert sans structures intérieures).

export function poserStructuresInterieurHallsCendres(scene, dims, rng, palette, options = {}) {
    const { etage = 3, boss = false } = options;
    if (etage !== 4 || !boss) return [];

    const objets = [];

    // Plafond cassé avec 2-3 fissures dentelées
    objets.push(...peindrePlafondCasse(scene, palette, rng));

    // Murs latéraux gauche + droit
    objets.push(...peindreMurLateral(scene, palette, 'gauche', rng));
    objets.push(...peindreMurLateral(scene, palette, 'droite', rng));

    return objets;
}
