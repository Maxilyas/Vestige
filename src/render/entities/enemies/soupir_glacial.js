// SOUPIR GLACIAL — silhouette translucide bleu glacial, fragments cristallins.

import { DEPTH } from '../../PainterlyRenderer.js';
import { assombrir, eclaircir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerSoupirGlacial(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const palette = def.palette;

    // Voile translucide
    const voile = scene.add.graphics();
    voile.fillStyle(palette.voile ?? 0xc0e0f0, 0.5);
    voile.fillEllipse(0, 0, w, h);
    voile.fillStyle(palette.corps, 0.7);
    voile.fillEllipse(0, -2, w * 0.75, h * 0.7);
    container.add(voile);

    // Yeux glacés
    const yeux = scene.add.graphics();
    yeux.setBlendMode(Phaser.BlendModes.ADD);
    yeux.fillStyle(palette.accent ?? 0x80b0d0, 0.85);
    yeux.fillCircle(-4, -h / 6, 2.5);
    yeux.fillCircle( 4, -h / 6, 2.5);
    yeux.fillStyle(0xffffff, 1);
    yeux.fillCircle(-4, -h / 6, 1);
    yeux.fillCircle( 4, -h / 6, 1);
    container.add(yeux);

    // Petits éclats de glace flottants
    const eclats = scene.add.graphics();
    eclats.fillStyle(palette.accent ?? 0x80b0d0, 0.8);
    for (const [x, y] of [[-w * 0.3, h * 0.2], [w * 0.4, -h * 0.1], [w * 0.2, h * 0.3]]) {
        eclats.beginPath();
        eclats.moveTo(x, y - 3);
        eclats.lineTo(x + 2, y);
        eclats.lineTo(x, y + 3);
        eclats.lineTo(x - 2, y);
        eclats.closePath();
        eclats.fillPath();
    }
    container.add(eclats);

    // Hover + transparency pulse
    scene.tweens.add({
        targets: container, y: { from: 0, to: -4 },
        duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.InOut'
    });
    scene.tweens.add({
        targets: voile, alpha: { from: 0.65, to: 0.9 },
        duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.InOut'
    });
    scene.tweens.add({
        targets: eclats, angle: 360,
        duration: 4000, repeat: -1, ease: 'Linear'
    });
    return container;
}

registerVisuel('frost-trailer', creerSoupirGlacial);
