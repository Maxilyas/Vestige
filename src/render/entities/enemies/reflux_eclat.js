// REFLUX-ÉCLAT — larme cristalline rose/violet brisée.

import { DEPTH } from '../../PainterlyRenderer.js';
import { eclaircir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerRefluxEclat(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const p = def.palette;

    // Larme allongée
    const corps = scene.add.graphics();
    corps.fillStyle(p.corps, 0.85);
    corps.beginPath();
    corps.moveTo(0, -h / 2);
    corps.lineTo( w / 2, h / 4);
    corps.lineTo( w / 4, h / 2);
    corps.lineTo(-w / 4, h / 2);
    corps.lineTo(-w / 2, h / 4);
    corps.closePath();
    corps.fillPath();
    // Reflet clair
    corps.fillStyle(eclaircir(p.corps, 0.4), 0.6);
    corps.beginPath();
    corps.moveTo(0, -h / 2);
    corps.lineTo(-w / 4, 0);
    corps.lineTo(0, 0);
    corps.closePath();
    corps.fillPath();
    container.add(corps);

    // Fêlure
    const felure = scene.add.graphics();
    felure.lineStyle(1.5, 0x300520, 0.85);
    felure.beginPath();
    felure.moveTo(0, -h / 3);
    felure.lineTo(-w / 6, 0);
    felure.lineTo(w / 8, h / 4);
    felure.strokePath();
    container.add(felure);

    // Halo additif rose
    const halo = scene.add.graphics();
    halo.setBlendMode(Phaser.BlendModes.ADD);
    halo.fillStyle(p.accent ?? 0xff80ff, 0.4);
    halo.fillCircle(0, 0, w * 0.5);
    container.add(halo);

    scene.tweens.add({ targets: halo, alpha: { from: 0.35, to: 0.7 }, scale: { from: 0.95, to: 1.1 }, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    return container;
}

registerVisuel('vulnerability-shooter', creerRefluxEclat);
