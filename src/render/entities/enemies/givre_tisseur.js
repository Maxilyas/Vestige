// GIVRE-TISSEUR — petite araignée glacée, pattes acérées.

import { DEPTH } from '../../PainterlyRenderer.js';
import { assombrir, eclaircir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerGivreTisseur(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const p = def.palette;

    // Corps bulbeux
    const corps = scene.add.graphics();
    corps.fillStyle(assombrir(p.corps, 0.2), 1);
    corps.fillEllipse(0, 0, w * 0.6, h * 0.7);
    corps.fillStyle(p.corps, 0.9);
    corps.fillEllipse(0, -2, w * 0.5, h * 0.55);
    container.add(corps);

    // Pattes glacées (6 en étoile)
    const pattes = scene.add.graphics();
    pattes.lineStyle(2, p.accent ?? 0xa0e0ff, 0.95);
    for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        pattes.beginPath();
        pattes.moveTo(0, 0);
        pattes.lineTo(Math.cos(a) * w * 0.7, Math.sin(a) * h * 0.6);
        pattes.strokePath();
    }
    container.add(pattes);

    // Yeux
    const yeux = scene.add.graphics();
    yeux.setBlendMode(Phaser.BlendModes.ADD);
    yeux.fillStyle(p.accent ?? 0xa0e0ff, 0.95);
    yeux.fillCircle(-3, -h / 6, 1.8);
    yeux.fillCircle( 3, -h / 6, 1.8);
    container.add(yeux);

    scene.tweens.add({ targets: container, scaleY: { from: 1, to: 0.94 }, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    scene.tweens.add({ targets: pattes, angle: 360, duration: 8000, repeat: -1, ease: 'Linear' });
    return container;
}

registerVisuel('floor-froster', creerGivreTisseur);
