// Élément Lanterne — point lumineux signature du Miroir.
// Présent : éteinte, cassée, suspendue de travers
// Miroir  : allumée avec halo additif + flicker subtil

import { DEPTH } from '../PainterlyRenderer.js';

/**
 * @param {string} mode 'suspendue' | 'au_sol' — où la lanterne est posée
 */
export function peindreLanterne(scene, x, yBase, monde, palette, mode = 'suspendue') {
    const enMiroir = monde === 'miroir';
    const g = scene.add.graphics({ x, y: yBase });
    g.setDepth(DEPTH.DECOR_AVANT);

    if (mode === 'suspendue') {
        // Câble qui descend du décor (5 px à droite)
        g.lineStyle(1, palette.pierreSombre, 0.85);
        g.beginPath();
        g.moveTo(0, -28);
        g.lineTo(enMiroir ? 0 : 2, -10);
        g.strokePath();
    }

    // Corps de la lanterne (carré + chapeau)
    const xLamp = enMiroir ? 0 : 2; // penche en présent
    g.fillStyle(palette.pierreSombre);
    g.fillRect(xLamp - 6, -10, 12, 12);
    g.fillStyle(palette.accent, 0.7);
    g.fillRect(xLamp - 7, -11, 14, 2); // chapeau doré

    if (!enMiroir) {
        // === PRÉSENT — lanterne éteinte ===
        // Vitre cassée
        g.fillStyle(0x000000, 0.85);
        g.fillRect(xLamp - 5, -9, 10, 10);
        // Fissure
        g.lineStyle(1, palette.pierreClaire, 0.4);
        g.beginPath();
        g.moveTo(xLamp - 4, -8);
        g.lineTo(xLamp + 1, -3);
        g.lineTo(xLamp + 4, 0);
        g.strokePath();
    } else {
        // === MIROIR — lanterne allumée ===
        // Vitre dorée
        g.fillStyle(palette.flamme, 0.95);
        g.fillRect(xLamp - 5, -9, 10, 10);
        // Reflet intérieur
        g.fillStyle(palette.rayon, 0.7);
        g.fillRect(xLamp - 5, -9, 4, 5);

        // Halo lumineux additif (ce qui donne la chaleur du Miroir)
        const halo = scene.add.graphics({ x, y: yBase - 4 });
        halo.setDepth(DEPTH.DECOR_AVANT - 1);
        halo.setBlendMode(Phaser.BlendModes.ADD);
        halo.fillStyle(palette.flamme, 0.35);
        halo.fillCircle(0, 0, 22);
        halo.fillStyle(palette.rayon, 0.5);
        halo.fillCircle(0, 0, 12);

        // Flicker animé — taille et alpha respirent doucement
        scene.tweens.add({
            targets: halo,
            scale: { from: 0.92, to: 1.08 },
            alpha: { from: 0.85, to: 1 },
            duration: 600 + Math.random() * 400,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
    }

    return g;
}
