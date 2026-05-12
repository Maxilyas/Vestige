// ÉCLAT-MULTIPLICATEUR — cristal multi-facettes brillant.

import { DEPTH } from '../../PainterlyRenderer.js';
import { eclaircir, assombrir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerEclatMultiplicateur(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const p = def.palette;

    // Forme octogonale (cristal taillé)
    const corps = scene.add.graphics();
    corps.fillStyle(p.corps, 1);
    corps.beginPath();
    const r = Math.min(w, h) / 2;
    for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(a) * r * (i % 2 === 0 ? 1 : 0.7);
        const y = Math.sin(a) * r * (i % 2 === 0 ? 1 : 0.7);
        if (i === 0) corps.moveTo(x, y); else corps.lineTo(x, y);
    }
    corps.closePath();
    corps.fillPath();
    // Facettes claires
    corps.fillStyle(eclaircir(p.corps, 0.4), 0.6);
    corps.beginPath();
    corps.moveTo(0, -r);
    corps.lineTo(r * 0.7, 0);
    corps.lineTo(0, 0);
    corps.closePath();
    corps.fillPath();
    container.add(corps);

    // Cœur additif
    const coeur = scene.add.graphics();
    coeur.setBlendMode(Phaser.BlendModes.ADD);
    coeur.fillStyle(p.accent ?? 0xc0e0ff, 0.85);
    coeur.fillCircle(0, 0, r * 0.4);
    coeur.fillStyle(0xffffff, 1);
    coeur.fillCircle(0, 0, r * 0.15);
    container.add(coeur);

    scene.tweens.add({ targets: container, angle: 360, duration: 6000, repeat: -1, ease: 'Linear' });
    scene.tweens.add({ targets: coeur, scale: { from: 0.85, to: 1.15 }, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    return container;
}

registerVisuel('mirror-clone', creerEclatMultiplicateur);
