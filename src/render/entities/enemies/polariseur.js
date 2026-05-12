// POLARISEUR — prisme hexagonal qui irradie une aura tournante.

import { DEPTH } from '../../PainterlyRenderer.js';
import { eclaircir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerPolariseur(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const p = def.palette;

    // Hexagone principal
    const corps = scene.add.graphics();
    corps.fillStyle(p.corps, 1);
    const r = Math.min(w, h) / 2;
    corps.beginPath();
    for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        if (i === 0) corps.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else corps.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    corps.closePath();
    corps.fillPath();
    // Highlight
    corps.fillStyle(eclaircir(p.corps, 0.35), 0.7);
    corps.beginPath();
    corps.moveTo(0, -r);
    corps.lineTo(r * 0.87, -r * 0.5);
    corps.lineTo(0, 0);
    corps.closePath();
    corps.fillPath();
    container.add(corps);

    // 2 cercles concentriques additifs
    const auras = scene.add.graphics();
    auras.setBlendMode(Phaser.BlendModes.ADD);
    auras.lineStyle(2, p.accent ?? 0xc080ff, 0.7);
    auras.strokeCircle(0, 0, r * 0.6);
    auras.lineStyle(1, p.accent ?? 0xc080ff, 0.5);
    auras.strokeCircle(0, 0, r * 0.85);
    container.add(auras);

    // Cœur
    const coeur = scene.add.graphics();
    coeur.setBlendMode(Phaser.BlendModes.ADD);
    coeur.fillStyle(p.accent ?? 0xc080ff, 0.9);
    coeur.fillCircle(0, 0, r * 0.25);
    coeur.fillStyle(0xffffff, 1);
    coeur.fillCircle(0, 0, r * 0.1);
    container.add(coeur);

    scene.tweens.add({ targets: auras, angle: 360, duration: 5000, repeat: -1, ease: 'Linear' });
    scene.tweens.add({ targets: coeur, scale: { from: 0.9, to: 1.2 }, alpha: { from: 0.85, to: 1 }, duration: 850, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    return container;
}

registerVisuel('control-inverter', creerPolariseur);
