// CŒUR FRAGMENTÉ — orbe rouge sombre avec fissures rougeoyantes.

import { DEPTH } from '../../PainterlyRenderer.js';
import { assombrir, eclaircir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerCoeurFragmente(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const p = def.palette;

    const corps = scene.add.graphics();
    corps.fillStyle(assombrir(p.corps, 0.3), 1);
    corps.fillCircle(0, 0, w / 2);
    corps.fillStyle(p.corps, 0.85);
    corps.fillCircle(-2, -2, w / 2 - 4);
    container.add(corps);

    // Fissures rougeoyantes (additif)
    const fiss = scene.add.graphics();
    fiss.setBlendMode(Phaser.BlendModes.ADD);
    fiss.lineStyle(2, p.accent ?? 0xff3040, 0.95);
    fiss.beginPath();
    fiss.moveTo(-w / 3, -h / 4); fiss.lineTo(-2, 0); fiss.lineTo(-w / 6, h / 4);
    fiss.moveTo(w / 4, -h / 6); fiss.lineTo(w / 8, h / 6);
    fiss.moveTo(-h / 8, h / 4); fiss.lineTo(w / 8, h / 3);
    fiss.strokePath();
    container.add(fiss);

    // Battement cardiaque
    scene.tweens.add({ targets: container, scale: { from: 1, to: 1.06 }, duration: 600, yoyo: true, repeat: -1, ease: 'Cubic.InOut' });
    scene.tweens.add({ targets: fiss, alpha: { from: 0.7, to: 1 }, duration: 400, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    return container;
}

registerVisuel('death-shards', creerCoeurFragmente);
