// Fondeur — visuel du PNJ artisan dans la salle Miroir.
// Refonte : vrai personnage coloré (peau, cheveux, vêtements, barbe),
// pas une silhouette. Cohérent avec une cité Miroir vivante et chaleureuse.

import { DEPTH } from '../PainterlyRenderer.js';

// Palette du personnage
const PEAU      = 0xd8a878;
const PEAU_OMBRE = 0x9a6a48;
const CHEVEUX   = 0x3a2218;       // brun foncé
const BARBE     = 0x4a3220;
const TUNIQUE   = 0x6a3a30;       // bordeaux
const TUNIQUE_C = 0xa05848;       // version claire
const TABLIER   = 0x4a3018;       // cuir brun
const TABLIER_C = 0x6a4830;
const CEINTURE  = 0xc8a85a;       // dorée
const PANTALON  = 0x3a2818;
const BOTTES    = 0x2a1a14;
const BLANC_CHEMISE = 0xe8d8b0;

/**
 * Crée le visuel du Fondeur. (x, y) = position des PIEDS (sol).
 */
export function creerVisuelFondeur(scene, x, y) {
    const container = scene.add.container(x, y);
    container.setDepth(DEPTH.ENTITES - 1);

    // === Halo doré subtil (repérage à distance) ===
    const halo = scene.add.graphics();
    halo.setBlendMode(Phaser.BlendModes.ADD);
    halo.fillStyle(0xffa040, 0.15);
    halo.fillEllipse(8, -22, 110, 70);
    halo.fillStyle(0xffd070, 0.18);
    halo.fillEllipse(8, -22, 65, 40);
    container.add(halo);
    scene.tweens.add({
        targets: halo,
        alpha: { from: 0.7, to: 1 },
        duration: 1800,
        yoyo: true, repeat: -1,
        ease: 'Sine.InOut'
    });

    // === Brasero au sol (à droite du Fondeur) ===
    const xB = 26;
    const yB = -8;
    const brasero = scene.add.graphics();
    brasero.fillStyle(0x1a1a24, 1);
    brasero.fillEllipse(xB, yB + 6, 28, 8);
    brasero.fillStyle(0x4a4a5a, 1);
    brasero.fillEllipse(xB, yB + 4, 24, 6);
    brasero.fillStyle(0x6a6a7a, 0.7);
    brasero.fillEllipse(xB - 6, yB + 3, 8, 3);
    // Pieds du brasero
    brasero.fillStyle(0x2a2a34, 1);
    brasero.fillRect(xB - 11, yB + 6, 2, 8);
    brasero.fillRect(xB + 9, yB + 6, 2, 8);
    container.add(brasero);

    // === Flammes (3 couches additives qui pulsent) ===
    const flammes = scene.add.graphics();
    flammes.setBlendMode(Phaser.BlendModes.ADD);
    flammes.fillStyle(0xff6020, 0.7);
    flammes.fillEllipse(xB, yB - 8, 22, 16);
    flammes.fillStyle(0xffa040, 0.85);
    flammes.fillEllipse(xB, yB - 10, 14, 12);
    flammes.fillStyle(0xffff80, 0.9);
    flammes.fillEllipse(xB, yB - 12, 6, 8);
    container.add(flammes);
    scene.tweens.add({
        targets: flammes,
        scaleY: { from: 1, to: 1.18 },
        scaleX: { from: 1, to: 0.92 },
        alpha: { from: 0.85, to: 1 },
        duration: 600,
        yoyo: true, repeat: -1,
        ease: 'Sine.InOut'
    });

    // === Fumée additive (ParticleEmitter qui monte du brasero) ===
    if (scene.textures.exists('_particule')) {
        scene.add.particles(0, 0, '_particule', {
            x: x + xB, y: y + yB - 14,
            lifespan: 1400,
            speedY: { min: -45, max: -25 },
            speedX: { min: -8, max: 8 },
            scale: { start: 0.4, end: 0 },
            tint: 0x8a8090,
            quantity: 1,
            frequency: 220,
            alpha: { start: 0.55, end: 0 }
        }).setDepth(DEPTH.ENTITES);
    }

    // ============================================================
    // PERSONNAGE — construction par couches du bas vers le haut
    // ============================================================
    const personnage = scene.add.container(0, 0);

    // --- Bottes ---
    const bottes = scene.add.graphics();
    bottes.fillStyle(BOTTES, 1);
    bottes.fillRect(-17, -3, 6, 5);
    bottes.fillRect(-9, -3, 6, 5);
    // Bouts de bottes
    bottes.fillStyle(0x1a0e08, 1);
    bottes.fillRect(-18, -1, 7, 3);
    bottes.fillRect(-10, -1, 7, 3);
    personnage.add(bottes);

    // --- Pantalon ---
    const pantalon = scene.add.graphics();
    pantalon.fillStyle(PANTALON, 1);
    pantalon.fillRect(-17, -16, 6, 14);
    pantalon.fillRect(-9, -16, 6, 14);
    // Highlight côté gauche
    pantalon.fillStyle(0x5a3a28, 0.5);
    pantalon.fillRect(-17, -16, 2, 14);
    pantalon.fillRect(-9, -16, 2, 14);
    personnage.add(pantalon);

    // --- Tunique (sous le tablier, visible aux bras et au cou) ---
    const tunique = scene.add.graphics();
    tunique.fillStyle(TUNIQUE, 1);
    tunique.fillRect(-19, -32, 18, 18);
    // Manches courtes
    tunique.fillRect(-22, -28, 5, 12);  // manche gauche
    tunique.fillRect(0, -28, 5, 12);    // manche droite
    // Highlight
    tunique.fillStyle(TUNIQUE_C, 0.7);
    tunique.fillRect(-19, -32, 3, 18);
    tunique.fillRect(-22, -28, 2, 12);
    personnage.add(tunique);

    // --- Tablier de cuir (par-dessus la tunique, du haut du torse au bas) ---
    const tablier = scene.add.graphics();
    tablier.fillStyle(TABLIER, 1);
    // Forme trapézoïdale (plus large en bas)
    tablier.beginPath();
    tablier.moveTo(-15, -29);
    tablier.lineTo(-3, -29);
    tablier.lineTo(-1, -10);
    tablier.lineTo(-17, -10);
    tablier.closePath();
    tablier.fillPath();
    // Highlight cuir
    tablier.fillStyle(TABLIER_C, 0.5);
    tablier.beginPath();
    tablier.moveTo(-15, -29);
    tablier.lineTo(-13, -29);
    tablier.lineTo(-15, -10);
    tablier.lineTo(-17, -10);
    tablier.closePath();
    tablier.fillPath();
    // Bretelles du tablier
    tablier.fillStyle(TABLIER, 1);
    tablier.fillRect(-14, -32, 3, 4);
    tablier.fillRect(-7, -32, 3, 4);
    personnage.add(tablier);

    // --- Ceinture dorée ---
    const ceinture = scene.add.graphics();
    ceinture.fillStyle(0x1a0e08, 1);
    ceinture.fillRect(-18, -16, 16, 4);
    ceinture.fillStyle(CEINTURE, 1);
    ceinture.fillRect(-18, -15, 16, 2);
    // Boucle
    ceinture.fillStyle(0xffd070, 1);
    ceinture.fillRect(-12, -16, 3, 4);
    personnage.add(ceinture);

    // --- Bras visibles (peau, le bras droit tendu vers le brasero) ---
    const bras = scene.add.graphics();
    bras.fillStyle(PEAU, 1);
    // Bras gauche (long le corps)
    bras.fillRect(-22, -16, 4, 7);
    // Bras droit (tendu vers la droite)
    bras.fillRect(0, -22, 4, 5);
    bras.fillRect(2, -20, 12, 4);
    // Ombre sur les bras
    bras.fillStyle(PEAU_OMBRE, 0.6);
    bras.fillRect(-21, -10, 2, 4);
    bras.fillRect(8, -18, 4, 2);
    personnage.add(bras);

    // --- Mains/Gants brûlés ---
    const gants = scene.add.graphics();
    gants.fillStyle(0x6a3010, 1);
    gants.fillRect(-23, -10, 5, 5);  // gant gauche
    gants.fillRect(12, -22, 5, 5);   // gant droit (vers le brasero)
    // Highlight cuir
    gants.fillStyle(0x8a4818, 0.6);
    gants.fillRect(-23, -10, 5, 1);
    gants.fillRect(12, -22, 5, 1);
    personnage.add(gants);

    // --- Cou ---
    const cou = scene.add.graphics();
    cou.fillStyle(PEAU, 1);
    cou.fillRect(-12, -36, 6, 4);
    cou.fillStyle(PEAU_OMBRE, 0.5);
    cou.fillRect(-12, -33, 6, 1);
    personnage.add(cou);

    // --- Tête (peau + cheveux + barbe + yeux) ---
    const tete = scene.add.graphics();
    // Crâne (peau)
    tete.fillStyle(PEAU, 1);
    tete.fillCircle(-9, -42, 7);
    // Ombre du visage (côté droit)
    tete.fillStyle(PEAU_OMBRE, 0.4);
    tete.fillCircle(-7, -42, 6);
    // Cheveux (top + côtés courts)
    tete.fillStyle(CHEVEUX, 1);
    tete.beginPath();
    tete.arc(-9, -45, 7.5, Math.PI, 0, false);
    tete.lineTo(-2, -42);
    tete.lineTo(-9, -42);
    tete.closePath();
    tete.fillPath();
    // Frange dépassant légèrement sur le front
    tete.fillRect(-13, -45, 3, 3);
    tete.fillRect(-7, -47, 3, 3);
    // Barbe taillée (arrondie sous le menton)
    tete.fillStyle(BARBE, 1);
    tete.fillEllipse(-9, -36, 12, 6);
    tete.fillRect(-15, -39, 3, 4);
    tete.fillRect(-6, -39, 3, 4);
    // Yeux (2 points sombres)
    tete.fillStyle(0x1a0a08, 1);
    tete.fillCircle(-12, -42, 1.2);
    tete.fillCircle(-7, -42, 1.2);
    // Reflet dans les yeux
    tete.fillStyle(0xffffff, 0.9);
    tete.fillCircle(-12, -42.5, 0.4);
    tete.fillCircle(-7, -42.5, 0.4);
    // Bouche (petit trait)
    tete.lineStyle(1, 0x4a2818, 0.85);
    tete.beginPath();
    tete.moveTo(-11, -38);
    tete.lineTo(-7, -38);
    tete.strokePath();
    // Sourcils (broussailleux)
    tete.fillStyle(CHEVEUX, 1);
    tete.fillRect(-13, -44, 3, 1);
    tete.fillRect(-8, -44, 3, 1);
    personnage.add(tete);

    // --- Petite étincelle qui tombe d'un coup de marteau (cyclique) ---
    if (scene.textures.exists('_particule')) {
        // Position approximative du gant droit qui frappe le brasero
        scene.add.particles(0, 0, '_particule', {
            x: x + 16, y: y - 18,
            lifespan: 500,
            speedY: { min: -10, max: 30 },
            speedX: { min: -25, max: 25 },
            scale: { start: 0.35, end: 0 },
            tint: [0xffd070, 0xff8040],
            quantity: 1,
            frequency: 700,
            blendMode: Phaser.BlendModes.ADD,
            alpha: { start: 1, end: 0 }
        }).setDepth(DEPTH.ENTITES);
    }

    container.add(personnage);

    // Animation respiration très lente
    scene.tweens.add({
        targets: personnage,
        scaleY: { from: 1, to: 1.018 },
        duration: 2400,
        yoyo: true, repeat: -1,
        ease: 'Sine.InOut'
    });

    return container;
}
