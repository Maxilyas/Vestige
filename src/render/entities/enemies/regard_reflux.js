// REGARD DU REFLUX — œil massif sans corps, iris rouge cramoisi.

import { DEPTH } from '../../PainterlyRenderer.js';
import { eclaircir, assombrir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerRegardReflux(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const p = def.palette;

    // Halo extérieur
    const halo = scene.add.graphics();
    halo.setBlendMode(Phaser.BlendModes.ADD);
    halo.fillStyle(p.accent ?? 0xff4040, 0.3);
    halo.fillCircle(0, 0, w * 0.85);
    halo.fillStyle(p.accent ?? 0xff4040, 0.5);
    halo.fillCircle(0, 0, w * 0.55);
    container.add(halo);

    // Sclera (blanc cassé)
    const sclera = scene.add.graphics();
    sclera.fillStyle(0x2a0a0a, 1);
    sclera.fillCircle(0, 0, w / 2);
    sclera.fillStyle(eclaircir(p.corps, 0.5), 0.7);
    sclera.fillEllipse(0, 0, w * 0.85, h * 0.7);
    container.add(sclera);

    // Iris
    const iris = scene.add.graphics();
    iris.fillStyle(p.accent ?? 0xff4040, 1);
    iris.fillCircle(0, 0, w * 0.3);
    iris.lineStyle(1, 0x800000, 0.9);
    iris.strokeCircle(0, 0, w * 0.3);
    container.add(iris);

    // Pupille noire
    const pupille = scene.add.graphics();
    pupille.fillStyle(0x000000, 1);
    pupille.fillCircle(0, 0, w * 0.15);
    pupille.fillStyle(0xffffff, 0.8);
    pupille.fillCircle(-2, -2, w * 0.06);
    container.add(pupille);

    scene.tweens.add({ targets: halo, alpha: { from: 0.7, to: 1 }, scale: { from: 0.95, to: 1.1 }, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    scene.tweens.add({ targets: pupille, scale: { from: 0.85, to: 1.15 }, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    return container;
}

registerVisuel('gaze', creerRegardReflux);
