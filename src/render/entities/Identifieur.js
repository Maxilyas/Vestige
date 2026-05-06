// Identifieur — un être hiératique en méditation, voile blanc sur les yeux.
// Il pose ses mains sur les objets pour en révéler les effets cachés.

import { DEPTH } from '../PainterlyRenderer.js';

const PEAU_CLAIRE = 0xe8d8c8;
const PEAU_OMBRE = 0xc8a890;
const ROBE_CREME = 0xe8d8c0;
const ROBE_OMBRE = 0xc8b89a;
const COR_OR = 0xc8a85a;
const VOILE = 0xffffff;
const CHEVEUX_BLANC = 0xe8e8f0;

export function creerVisuelIdentifieur(scene, x, y) {
    const container = scene.add.container(x, y);
    container.setDepth(DEPTH.ENTITES - 1);

    // === Halo bleu argenté (signature, repérage) ===
    const halo = scene.add.graphics();
    halo.setBlendMode(Phaser.BlendModes.ADD);
    halo.fillStyle(0xa0c8ff, 0.18);
    halo.fillEllipse(0, -28, 110, 70);
    halo.fillStyle(0xc8d8ff, 0.25);
    halo.fillEllipse(0, -28, 65, 40);
    container.add(halo);
    scene.tweens.add({
        targets: halo,
        alpha: { from: 0.65, to: 1 },
        duration: 2000,
        yoyo: true, repeat: -1,
        ease: 'Sine.InOut'
    });

    // ============================================================
    // PERSONNAGE en méditation, du bas vers le haut
    // ============================================================
    const personnage = scene.add.container(0, 0);

    // --- Coussin de méditation (tapis sous lui) ---
    const tapis = scene.add.graphics();
    tapis.fillStyle(0x4a3018, 1);
    tapis.fillEllipse(0, -2, 32, 6);
    tapis.fillStyle(COR_OR, 0.7);
    tapis.fillEllipse(0, -3, 28, 3);
    personnage.add(tapis);

    // --- Robe ample (forme triangulaire évasée vers le bas) ---
    const robe = scene.add.graphics();
    robe.fillStyle(ROBE_CREME, 1);
    robe.beginPath();
    robe.moveTo(-22, -2);
    robe.lineTo(-12, -32);
    robe.lineTo(12, -32);
    robe.lineTo(22, -2);
    robe.closePath();
    robe.fillPath();
    // Plis ombrés
    robe.fillStyle(ROBE_OMBRE, 0.5);
    robe.fillRect(-13, -28, 1, 26);
    robe.fillRect(-1, -30, 1, 28);
    robe.fillRect(11, -28, 1, 26);
    // Bord doré du col
    robe.fillStyle(COR_OR, 0.9);
    robe.fillRect(-12, -32, 24, 1);
    personnage.add(robe);

    // --- Cordon doré à la taille ---
    const cordon = scene.add.graphics();
    cordon.fillStyle(COR_OR, 1);
    cordon.fillRect(-15, -16, 30, 2);
    // Frange du cordon (2 brins qui pendent)
    cordon.fillRect(-2, -16, 1, 6);
    cordon.fillRect(2, -16, 1, 6);
    personnage.add(cordon);

    // --- Cou ---
    const cou = scene.add.graphics();
    cou.fillStyle(PEAU_CLAIRE, 1);
    cou.fillRect(-3, -36, 6, 4);
    cou.fillStyle(PEAU_OMBRE, 0.4);
    cou.fillRect(-3, -33, 6, 1);
    personnage.add(cou);

    // --- Bras + mains levées (paumes vers le haut, position d'offrande) ---
    const bras = scene.add.graphics();
    bras.fillStyle(ROBE_CREME, 1);
    // Manches amples
    bras.fillRect(-21, -28, 7, 13);
    bras.fillRect(14, -28, 7, 13);
    bras.fillStyle(ROBE_OMBRE, 0.4);
    bras.fillRect(-21, -28, 1, 13);
    bras.fillRect(14, -28, 1, 13);
    // Mains qui sortent des manches (peau)
    bras.fillStyle(PEAU_CLAIRE, 1);
    bras.fillRect(-22, -16, 8, 4);
    bras.fillRect(14, -16, 8, 4);
    // Paumes vers le haut (highlight clair)
    bras.fillStyle(0xffffff, 0.5);
    bras.fillRect(-21, -16, 6, 1);
    bras.fillRect(15, -16, 6, 1);
    // Doigts (5 petits traits)
    bras.fillStyle(PEAU_OMBRE, 0.7);
    for (let i = 0; i < 4; i++) {
        bras.fillRect(-22 + i * 2, -16, 1, 2);
        bras.fillRect(14 + i * 2, -16, 1, 2);
    }
    personnage.add(bras);

    // --- Tête ---
    const tete = scene.add.graphics();
    // Crâne (peau)
    tete.fillStyle(PEAU_CLAIRE, 1);
    tete.fillCircle(0, -42, 7);
    // Ombre légère
    tete.fillStyle(PEAU_OMBRE, 0.3);
    tete.fillCircle(2, -42, 6);
    // Cheveux blancs (top)
    tete.fillStyle(CHEVEUX_BLANC, 1);
    tete.beginPath();
    tete.arc(0, -45, 7.5, Math.PI, 0, false);
    tete.lineTo(7, -42);
    tete.lineTo(0, -45);
    tete.closePath();
    tete.fillPath();
    // Mèches courtes des côtés
    tete.fillRect(-7, -42, 2, 4);
    tete.fillRect(5, -42, 2, 4);
    // Voile blanc qui couvre les yeux (légèrement transparent)
    tete.fillStyle(VOILE, 0.92);
    tete.fillRect(-8, -44, 16, 5);
    // Liseré du voile (gris très pâle)
    tete.lineStyle(1, 0xb0b0c0, 0.5);
    tete.beginPath();
    tete.moveTo(-8, -44);
    tete.lineTo(8, -44);
    tete.moveTo(-8, -39);
    tete.lineTo(8, -39);
    tete.strokePath();
    // Bouche neutre (trait fin)
    tete.lineStyle(1, 0x8a6840, 0.85);
    tete.beginPath();
    tete.moveTo(-2, -36);
    tete.lineTo(2, -36);
    tete.strokePath();
    personnage.add(tete);

    container.add(personnage);

    // === Animation : oscillation très lente verticale (méditation) ===
    scene.tweens.add({
        targets: personnage,
        y: { from: 0, to: -3 },
        duration: 2400,
        yoyo: true, repeat: -1,
        ease: 'Sine.InOut'
    });

    return container;
}
