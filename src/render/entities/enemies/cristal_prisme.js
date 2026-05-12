// CRISTAL-PRISME — pyramide de cristal violet/cyan qui projette une aura.

import { DEPTH } from '../../PainterlyRenderer.js';
import { eclaircir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerCristalPrisme(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const p = def.palette;

    // Pyramide
    const corps = scene.add.graphics();
    corps.fillStyle(p.corps, 1);
    corps.beginPath();
    corps.moveTo(0, -h / 2);
    corps.lineTo( w / 2, h / 4);
    corps.lineTo( w / 3, h / 2);
    corps.lineTo(-w / 3, h / 2);
    corps.lineTo(-w / 2, h / 4);
    corps.closePath();
    corps.fillPath();
    // Reflets
    corps.fillStyle(eclaircir(p.corps, 0.4), 0.8);
    corps.beginPath();
    corps.moveTo(0, -h / 2);
    corps.lineTo(-w / 2, h / 4);
    corps.lineTo(-w / 4, h / 4);
    corps.closePath();
    corps.fillPath();
    container.add(corps);

    // Cœur lumineux
    const coeur = scene.add.graphics();
    coeur.setBlendMode(Phaser.BlendModes.ADD);
    coeur.fillStyle(p.accent ?? 0xa080ff, 0.85);
    coeur.fillCircle(0, 0, w * 0.18);
    coeur.fillStyle(0xffffff, 1);
    coeur.fillCircle(0, 0, w * 0.08);
    container.add(coeur);

    // Halo distorsion
    const halo = scene.add.graphics();
    halo.setBlendMode(Phaser.BlendModes.ADD);
    halo.fillStyle(p.accent ?? 0xa080ff, 0.25);
    halo.fillCircle(0, 0, w * 0.7);
    container.add(halo);

    scene.tweens.add({ targets: coeur, scale: { from: 0.85, to: 1.15 }, alpha: { from: 0.85, to: 1 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    scene.tweens.add({ targets: halo, alpha: { from: 0.55, to: 1 }, scale: { from: 0.95, to: 1.1 }, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    return container;
}

registerVisuel('vision-distorter', creerCristalPrisme);
