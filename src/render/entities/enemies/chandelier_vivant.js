// CHANDELIER VIVANT — cierge haut + flamme dansante.

import { DEPTH } from '../../PainterlyRenderer.js';
import { assombrir, eclaircir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerChandelierVivant(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const palette = def.palette;

    // Pied
    const pied = scene.add.graphics();
    pied.fillStyle(assombrir(palette.corps, 0.4), 1);
    pied.fillEllipse(0, h / 2 - 2, w * 0.9, 6);
    pied.fillStyle(palette.corps, 0.9);
    pied.fillEllipse(0, h / 2 - 4, w * 0.7, 4);
    container.add(pied);

    // Cierge (corps long)
    const cierge = scene.add.graphics();
    cierge.fillStyle(palette.corps, 1);
    cierge.fillRect(-w / 4, -h / 2 + 8, w / 2, h - 12);
    cierge.fillStyle(eclaircir(palette.corps, 0.3), 0.8);
    cierge.fillRect(-w / 4 + 1, -h / 2 + 8, 2, h - 12);
    container.add(cierge);

    // Coupelle au sommet
    const coupelle = scene.add.graphics();
    coupelle.fillStyle(eclaircir(palette.corps, 0.2), 1);
    coupelle.fillEllipse(0, -h / 2 + 8, w * 0.7, 6);
    container.add(coupelle);

    // Flamme dansante (additive)
    const flamme = scene.add.graphics();
    flamme.setBlendMode(Phaser.BlendModes.ADD);
    const c = palette.flamme ?? palette.accent ?? 0xffd070;
    flamme.fillStyle(c, 0.5);
    flamme.fillEllipse(0, -h / 2 + 2, 12, 18);
    flamme.fillStyle(c, 0.85);
    flamme.fillEllipse(0, -h / 2 + 2, 7, 13);
    flamme.fillStyle(0xffffff, 1);
    flamme.fillEllipse(0, -h / 2 + 4, 3, 7);
    container.add(flamme);

    // Halo de lumière
    const halo = scene.add.graphics();
    halo.setBlendMode(Phaser.BlendModes.ADD);
    halo.fillStyle(c, 0.18);
    halo.fillCircle(0, -h / 2 + 4, 28);
    halo.fillStyle(c, 0.3);
    halo.fillCircle(0, -h / 2 + 4, 16);
    container.add(halo);

    scene.tweens.add({
        targets: flamme, scaleY: { from: 0.85, to: 1.1 }, scaleX: { from: 1, to: 0.92 },
        duration: 320, yoyo: true, repeat: -1, ease: 'Sine.InOut'
    });
    scene.tweens.add({
        targets: halo, alpha: { from: 0.55, to: 1 }, scale: { from: 0.92, to: 1.1 },
        duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut'
    });
    return container;
}

registerVisuel('lighting-mod', creerChandelierVivant);
