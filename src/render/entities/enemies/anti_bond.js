// ANTI-BOND — œil violet avec anneau de visée (signature "vise les sauts").

import { DEPTH } from '../../PainterlyRenderer.js';
import { eclaircir, assombrir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerAntiBond(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const p = def.palette;

    // Corps globulaire
    const corps = scene.add.graphics();
    corps.fillStyle(assombrir(p.corps, 0.3), 1);
    corps.fillCircle(0, 0, w / 2);
    corps.fillStyle(p.corps, 0.85);
    corps.fillCircle(0, -2, w / 2 - 3);
    container.add(corps);

    // Iris violet
    const iris = scene.add.graphics();
    iris.setBlendMode(Phaser.BlendModes.ADD);
    iris.fillStyle(p.iris ?? 0xc080ff, 0.9);
    iris.fillCircle(0, 0, w * 0.35);
    iris.fillStyle(0xffffff, 1);
    iris.fillCircle(0, 0, w * 0.12);
    container.add(iris);

    // Anneau de visée tournant
    const reticle = scene.add.graphics();
    reticle.lineStyle(2, p.iris ?? 0xc080ff, 0.7);
    reticle.strokeCircle(0, 0, w * 0.6);
    // Marques cardinales
    for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        reticle.beginPath();
        reticle.moveTo(Math.cos(a) * w * 0.55, Math.sin(a) * w * 0.55);
        reticle.lineTo(Math.cos(a) * w * 0.7, Math.sin(a) * w * 0.7);
        reticle.strokePath();
    }
    container.add(reticle);

    scene.tweens.add({ targets: reticle, angle: 360, duration: 4000, repeat: -1, ease: 'Linear' });
    scene.tweens.add({ targets: iris, alpha: { from: 0.7, to: 1 }, scale: { from: 0.9, to: 1.1 }, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    return container;
}

registerVisuel('reactive-shooter', creerAntiBond);
