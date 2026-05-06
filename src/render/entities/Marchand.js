// La Glaneuse — vieille femme assise sur un tapis brodé, jambes croisées,
// items étalés au sol, pipe fumante. Posée, lasse, observatrice.
// Halo violet/mauve discret pour la repérer dans la salle Miroir.

import { DEPTH } from '../PainterlyRenderer.js';

const PEAU         = 0xc8a888;
const PEAU_OMBRE   = 0x9a7868;
const CHEVEUX_GRIS = 0xc0c0c8;
const CHEVEUX_OMB  = 0x8a8a98;
const TAPIS_FOND   = 0x6a2a2a;
const TAPIS_TRAME  = 0x9a4a3a;
const TAPIS_OR     = 0xc8a85a;
const CHALE        = 0x6a4a8a;
const CHALE_CLAIR  = 0x9a7aa8;
const CHALE_BORD   = 0xc8a85a;
const ROBE         = 0x4a2a4a;
const PIPE_BOIS    = 0x3a2218;
const PIPE_BRAISE  = 0xff6020;

/**
 * Crée le visuel de la Glaneuse. (x, y) = position des PIEDS / sol.
 */
export function creerVisuelMarchand(scene, x, y) {
    const container = scene.add.container(x, y);
    container.setDepth(DEPTH.ENTITES - 1);

    // === Halo mauve (signature, repérage) ===
    const halo = scene.add.graphics();
    halo.setBlendMode(Phaser.BlendModes.ADD);
    halo.fillStyle(0x8a5aa8, 0.16);
    halo.fillEllipse(0, -22, 130, 80);
    halo.fillStyle(0xb088c8, 0.20);
    halo.fillEllipse(0, -22, 80, 50);
    container.add(halo);
    scene.tweens.add({
        targets: halo,
        alpha: { from: 0.6, to: 1 },
        duration: 2200,
        yoyo: true, repeat: -1,
        ease: 'Sine.InOut'
    });

    // ============================================================
    // TAPIS BRODÉ (large, étalé devant elle)
    // ============================================================
    const tapis = scene.add.graphics();
    // Ombre sous le tapis
    tapis.fillStyle(0x000000, 0.35);
    tapis.fillEllipse(0, 1, 78, 10);
    // Fond du tapis
    tapis.fillStyle(TAPIS_FOND, 1);
    tapis.fillRoundedRect(-38, -4, 76, 8, 2);
    // Trame ocre (rayures fines)
    tapis.fillStyle(TAPIS_TRAME, 0.7);
    for (let i = -34; i < 34; i += 6) {
        tapis.fillRect(i, -3, 2, 6);
    }
    // Liseré doré (bord haut/bas)
    tapis.fillStyle(TAPIS_OR, 0.9);
    tapis.fillRect(-38, -4, 76, 1);
    tapis.fillRect(-38, 3, 76, 1);
    // Petits losanges centraux
    tapis.fillStyle(TAPIS_OR, 0.85);
    for (let i = -24; i <= 24; i += 12) {
        tapis.fillRect(i - 1, -1, 2, 2);
    }
    container.add(tapis);

    // ============================================================
    // ITEMS ÉTALÉS SUR LE TAPIS (4 silhouettes décoratives)
    // ============================================================
    const items = scene.add.graphics();
    // À gauche : flacon
    items.fillStyle(0x2a4a6a, 1);
    items.fillRect(-30, -10, 4, 6);
    items.fillStyle(0xc8a85a, 1);
    items.fillRect(-30, -11, 4, 1);
    // Petit livre fermé
    items.fillStyle(0x4a2818, 1);
    items.fillRect(-20, -8, 8, 5);
    items.fillStyle(0xc8a85a, 0.8);
    items.fillRect(-20, -8, 8, 1);
    // Médaillon (cercle doré)
    items.fillStyle(0xc8a85a, 1);
    items.fillCircle(24, -6, 3);
    items.fillStyle(0xffd070, 0.8);
    items.fillCircle(24, -6, 1.5);
    // Anneau
    items.lineStyle(1.5, 0xc8c8d0, 1);
    items.strokeCircle(34, -7, 2.5);
    container.add(items);

    // ============================================================
    // PERSONNAGE — assise jambes croisées (style méditation)
    // ============================================================
    const personnage = scene.add.container(0, -2);

    // --- Robe / jupe étalée autour des jambes croisées (forme évasée basse) ---
    const robe = scene.add.graphics();
    robe.fillStyle(ROBE, 1);
    robe.beginPath();
    robe.moveTo(-20, -2);
    robe.lineTo(-13, -22);
    robe.lineTo(13, -22);
    robe.lineTo(20, -2);
    robe.closePath();
    robe.fillPath();
    // Ombre côté droit
    robe.fillStyle(0x2a1224, 0.5);
    robe.fillRect(8, -22, 12, 20);
    // Bord doré bas de robe
    robe.fillStyle(TAPIS_OR, 0.6);
    robe.fillRect(-19, -3, 38, 1);
    personnage.add(robe);

    // --- Châle mauve sur les épaules (large, retombe sur les bras) ---
    const chale = scene.add.graphics();
    chale.fillStyle(CHALE, 1);
    chale.beginPath();
    chale.moveTo(-18, -36);
    chale.lineTo(-22, -16);
    chale.lineTo(-12, -22);
    chale.lineTo(-9, -36);
    chale.closePath();
    chale.fillPath();
    chale.beginPath();
    chale.moveTo(9, -36);
    chale.lineTo(22, -16);
    chale.lineTo(12, -22);
    chale.lineTo(18, -36);
    chale.closePath();
    chale.fillPath();
    // Centre du châle (couvre le torse)
    chale.fillRect(-12, -36, 24, 16);
    // Highlight mauve clair (côté gauche)
    chale.fillStyle(CHALE_CLAIR, 0.55);
    chale.fillRect(-12, -36, 4, 16);
    chale.fillRect(-20, -28, 3, 10);
    // Bord doré du châle
    chale.fillStyle(CHALE_BORD, 0.85);
    chale.fillRect(-12, -36, 24, 1);
    chale.fillRect(-22, -16, 11, 1);
    chale.fillRect(11, -16, 11, 1);
    // Petites franges (3 brins par côté)
    chale.fillStyle(CHALE_BORD, 0.9);
    for (let i = 0; i < 3; i++) {
        chale.fillRect(-22 + i * 3, -15, 1, 3);
        chale.fillRect(15 + i * 3, -15, 1, 3);
    }
    personnage.add(chale);

    // --- Bras posés sur les genoux ---
    const bras = scene.add.graphics();
    // Manches du châle
    bras.fillStyle(CHALE, 1);
    bras.fillRect(-16, -22, 8, 8);
    bras.fillRect(8, -22, 8, 8);
    bras.fillStyle(CHALE_CLAIR, 0.45);
    bras.fillRect(-16, -22, 2, 8);
    // Mains qui dépassent (peau) — main droite tient la pipe
    bras.fillStyle(PEAU, 1);
    bras.fillRect(-12, -16, 5, 4);
    bras.fillRect(9, -16, 5, 4);
    // Doigts (lignes ombrées)
    bras.fillStyle(PEAU_OMBRE, 0.55);
    for (let i = 0; i < 3; i++) {
        bras.fillRect(-12 + i * 1.5, -16, 1, 1);
        bras.fillRect(10 + i * 1.5, -16, 1, 1);
    }
    personnage.add(bras);

    // --- Cou ---
    const cou = scene.add.graphics();
    cou.fillStyle(PEAU, 1);
    cou.fillRect(-3, -40, 6, 4);
    cou.fillStyle(PEAU_OMBRE, 0.5);
    cou.fillRect(-3, -37, 6, 1);
    personnage.add(cou);

    // --- Tête ---
    const tete = scene.add.graphics();
    // Crâne (peau parchemin)
    tete.fillStyle(PEAU, 1);
    tete.fillCircle(0, -46, 7);
    tete.fillStyle(PEAU_OMBRE, 0.4);
    tete.fillCircle(2, -46, 6);
    // Cheveux gris en chignon (top + arrière)
    tete.fillStyle(CHEVEUX_GRIS, 1);
    tete.beginPath();
    tete.arc(0, -49, 7.5, Math.PI, 0, false);
    tete.lineTo(7, -46);
    tete.lineTo(0, -49);
    tete.closePath();
    tete.fillPath();
    // Chignon (cercle au-dessus)
    tete.fillCircle(0, -54, 4);
    tete.fillStyle(CHEVEUX_OMB, 0.7);
    tete.fillCircle(1, -54, 3);
    // Mèches qui s'échappent sur les côtés
    tete.fillStyle(CHEVEUX_GRIS, 1);
    tete.fillRect(-7, -46, 2, 4);
    tete.fillRect(5, -46, 2, 4);
    // Yeux mi-clos (deux traits horizontaux)
    tete.lineStyle(1.5, 0x2a1818, 0.85);
    tete.beginPath();
    tete.moveTo(-4, -46);
    tete.lineTo(-1, -46);
    tete.moveTo(2, -46);
    tete.lineTo(5, -46);
    tete.strokePath();
    // Petites rides sous les yeux
    tete.lineStyle(1, PEAU_OMBRE, 0.6);
    tete.beginPath();
    tete.moveTo(-4, -44);
    tete.lineTo(-2, -43.5);
    tete.moveTo(3, -44);
    tete.lineTo(5, -43.5);
    tete.strokePath();
    // Bouche (trait fin) qui tient la pipe (légèrement décalée à droite)
    tete.lineStyle(1, 0x6a3818, 0.9);
    tete.beginPath();
    tete.moveTo(-1, -41);
    tete.lineTo(3, -41);
    tete.strokePath();
    personnage.add(tete);

    // --- Pipe (longue, sort de la bouche vers la droite) ---
    const pipe = scene.add.graphics();
    // Tuyau fin
    pipe.fillStyle(PIPE_BOIS, 1);
    pipe.fillRect(3, -41, 14, 1.5);
    // Bol (fourneau de la pipe)
    pipe.fillStyle(PIPE_BOIS, 1);
    pipe.fillRect(16, -45, 4, 5);
    pipe.fillStyle(0x2a1810, 1);
    pipe.fillRect(16, -45, 4, 1);
    // Braise rougeoyante (additive)
    const braise = scene.add.graphics();
    braise.setBlendMode(Phaser.BlendModes.ADD);
    braise.fillStyle(PIPE_BRAISE, 0.9);
    braise.fillCircle(18, -45, 2);
    braise.fillStyle(0xffd070, 0.7);
    braise.fillCircle(18, -45, 1);
    personnage.add(pipe);
    personnage.add(braise);

    // Pulse de la braise
    scene.tweens.add({
        targets: braise,
        alpha: { from: 0.55, to: 1 },
        duration: 1400,
        yoyo: true, repeat: -1,
        ease: 'Sine.InOut'
    });

    container.add(personnage);

    // ============================================================
    // FUMÉE de la pipe (ParticleEmitter additif)
    // ============================================================
    if (scene.textures.exists('_particule')) {
        scene.add.particles(0, 0, '_particule', {
            x: x + 19, y: y - 47,
            lifespan: 1600,
            speedY: { min: -30, max: -15 },
            speedX: { min: -6, max: 10 },
            scale: { start: 0.35, end: 0 },
            tint: [0xc8b8d0, 0xa898b8],
            quantity: 1,
            frequency: 380,
            alpha: { start: 0.55, end: 0 }
        }).setDepth(DEPTH.ENTITES);
    }

    // Animation respiration très lente
    scene.tweens.add({
        targets: personnage,
        y: { from: -2, to: -4 },
        duration: 2800,
        yoyo: true, repeat: -1,
        ease: 'Sine.InOut'
    });

    return container;
}
