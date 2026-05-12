// CENDRE-TISSEUSE — silhouette araignée fibreuse beige/cendre.

import { DEPTH } from '../../PainterlyRenderer.js';
import { assombrir, eclaircir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerCendreTisseuse(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const palette = def.palette;

    // 8 pattes en arc
    const pattes = scene.add.graphics();
    pattes.lineStyle(2, assombrir(palette.corps, 0.4), 0.9);
    const arcs = [
        { x0: -w / 4, y0: -h / 8, x1: -w * 0.7, y1: h * 0.2 },
        { x0: -w / 4, y0:  h / 8, x1: -w * 0.7, y1: h * 0.5 },
        { x0:  w / 4, y0: -h / 8, x1:  w * 0.7, y1: h * 0.2 },
        { x0:  w / 4, y0:  h / 8, x1:  w * 0.7, y1: h * 0.5 },
        { x0: -w / 4, y0: -h / 8, x1: -w * 0.5, y1: -h * 0.4 },
        { x0: -w / 4, y0:  h / 8, x1: -w * 0.4, y1:  h * 0.6 },
        { x0:  w / 4, y0: -h / 8, x1:  w * 0.5, y1: -h * 0.4 },
        { x0:  w / 4, y0:  h / 8, x1:  w * 0.4, y1:  h * 0.6 }
    ];
    for (const a of arcs) {
        pattes.beginPath();
        pattes.moveTo(a.x0, a.y0);
        pattes.lineTo(a.x1, a.y1);
        pattes.strokePath();
    }
    container.add(pattes);

    // Corps central ovale
    const corps = scene.add.graphics();
    corps.fillStyle(assombrir(palette.corps, 0.25), 1);
    corps.fillEllipse(0, 0, w * 0.55, h * 0.7);
    corps.fillStyle(palette.corps, 0.85);
    corps.fillEllipse(0, -2, w * 0.45, h * 0.55);
    container.add(corps);

    // Yeux multiples
    const yeux = scene.add.graphics();
    yeux.fillStyle(palette.iris ?? 0xc8b890, 0.9);
    yeux.fillCircle(-4, -h / 6, 1.5);
    yeux.fillCircle( 4, -h / 6, 1.5);
    yeux.fillCircle(-6, -h / 10, 1.2);
    yeux.fillCircle( 6, -h / 10, 1.2);
    container.add(yeux);

    // Halo lumineux
    const halo = scene.add.graphics();
    halo.setBlendMode(Phaser.BlendModes.ADD);
    halo.fillStyle(palette.halo ?? 0xe8d8b0, 0.3);
    halo.fillCircle(0, 0, w * 0.65);
    container.add(halo);

    scene.tweens.add({
        targets: container, scaleX: { from: 1, to: 1.04 },
        duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.InOut'
    });
    scene.tweens.add({
        targets: halo, alpha: { from: 0.55, to: 1 },
        duration: 800, yoyo: true, repeat: -1, ease: 'Sine.InOut'
    });
    return container;
}

registerVisuel('web-spinner', creerCendreTisseuse);
