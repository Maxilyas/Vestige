// GardienPierre — silhouette de pierre trapue avec un œil rougeoyant unique.
// Animation : respiration rocailleuse lente, œil qui pulse.

import { DEPTH } from '../PainterlyRenderer.js';

export function creerVisuelGardien(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);

    const w = def.largeur;
    const h = def.hauteur;

    // --- Corps principal (silhouette de pierre trapue) ---
    const corps = scene.add.graphics();
    corps.fillStyle(0x2a2a34, 1);
    // Silhouette légèrement bombée
    corps.beginPath();
    corps.moveTo(-w / 2 + 2, h / 2 - 8);
    corps.lineTo(-w / 2 + 4, -h / 2 + 4);
    corps.lineTo(-w / 2 + 8, -h / 2);
    corps.lineTo(w / 2 - 8, -h / 2);
    corps.lineTo(w / 2 - 4, -h / 2 + 4);
    corps.lineTo(w / 2 - 2, h / 2 - 8);
    corps.closePath();
    corps.fillPath();
    // Couche lumière (bord supérieur)
    corps.fillStyle(0x4a4a5a, 0.85);
    corps.fillRect(-w / 2 + 4, -h / 2, w - 8, 4);
    // Pattes : 2 rectangles aux coins du bas
    corps.fillStyle(0x2a2a34, 1);
    corps.fillRect(-w / 2 + 2, h / 2 - 8, 8, 8);
    corps.fillRect(w / 2 - 10, h / 2 - 8, 8, 8);
    container.add(corps);

    // --- Fissures dessinées ---
    const fissures = scene.add.graphics();
    fissures.lineStyle(1, 0x1a1a24, 0.7);
    fissures.beginPath();
    fissures.moveTo(-w / 2 + 5, -h / 2 + 6);
    fissures.lineTo(-w / 2 + 9, -h / 2 + 14);
    fissures.lineTo(-w / 2 + 6, -h / 2 + 20);
    fissures.strokePath();
    fissures.beginPath();
    fissures.moveTo(w / 2 - 4, -h / 2 + 8);
    fissures.lineTo(w / 2 - 8, h / 2 - 12);
    fissures.strokePath();
    fissures.beginPath();
    fissures.moveTo(0, h / 2 - 12);
    fissures.lineTo(3, h / 2 - 6);
    fissures.strokePath();
    container.add(fissures);

    // --- Œil rougeoyant central (additif) ---
    const oeil = scene.add.graphics();
    oeil.setBlendMode(Phaser.BlendModes.ADD);
    oeil.fillStyle(0x551010, 0.4);
    oeil.fillCircle(0, -2, 9);
    oeil.fillStyle(0xff3030, 0.85);
    oeil.fillCircle(0, -2, 5);
    oeil.fillStyle(0xffa0a0, 1);
    oeil.fillCircle(0, -2, 2);
    container.add(oeil);

    // --- Animations ---
    // Respiration lente du corps
    scene.tweens.add({
        targets: container,
        scaleY: { from: 1, to: 1.03 },
        duration: 2200,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });
    // Pulse de l'œil
    scene.tweens.add({
        targets: oeil,
        alpha: { from: 0.7, to: 1 },
        duration: 700,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });

    return container;
}
