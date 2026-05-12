// BRISURE-TISSEUSE — insecte sombre 8-pattes acérées, abdomen rouge.

import { DEPTH } from '../../PainterlyRenderer.js';
import { assombrir, eclaircir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerBrisureTisseuse(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const p = def.palette;

    // Pattes (8 lignes en étoile)
    const pattes = scene.add.graphics();
    pattes.lineStyle(2.5, assombrir(p.corps, 0.4), 0.95);
    for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        pattes.beginPath();
        pattes.moveTo(0, 0);
        pattes.lineTo(Math.cos(a) * w * 0.6, Math.sin(a) * h * 0.55);
        pattes.strokePath();
    }
    container.add(pattes);

    // Abdomen
    const abdomen = scene.add.graphics();
    abdomen.fillStyle(assombrir(p.corps, 0.2), 1);
    abdomen.fillEllipse(0, 0, w * 0.55, h * 0.5);
    abdomen.fillStyle(p.accent ?? 0xa02040, 0.8);
    abdomen.fillEllipse(0, 0, w * 0.35, h * 0.3);
    container.add(abdomen);

    // Yeux multiples (5)
    const yeux = scene.add.graphics();
    yeux.setBlendMode(Phaser.BlendModes.ADD);
    yeux.fillStyle(p.accent ?? 0xff3040, 0.95);
    yeux.fillCircle(-3, -h / 8, 1.4);
    yeux.fillCircle( 3, -h / 8, 1.4);
    yeux.fillCircle( 0, -h / 6, 1.4);
    yeux.fillCircle(-5, -h / 12, 1);
    yeux.fillCircle( 5, -h / 12, 1);
    container.add(yeux);

    scene.tweens.add({ targets: container, scaleY: { from: 1, to: 1.04 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    return container;
}

registerVisuel('ground-fissure', creerBrisureTisseuse);
