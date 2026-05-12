// INVERSEUR DE GRAVITÉ — disque tournant avec vortex central violet.

import { DEPTH } from '../../PainterlyRenderer.js';
import { eclaircir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerInverseurGravite(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const p = def.palette;

    // Disque
    const corps = scene.add.graphics();
    corps.fillStyle(p.corps, 1);
    corps.fillCircle(0, 0, w / 2);
    corps.fillStyle(eclaircir(p.corps, 0.3), 0.5);
    corps.fillCircle(-2, -2, w / 2 - 4);
    container.add(corps);

    // Spirale (vortex)
    const spirale = scene.add.graphics();
    spirale.lineStyle(2, p.accent ?? 0xc080ff, 0.85);
    spirale.setBlendMode(Phaser.BlendModes.ADD);
    spirale.beginPath();
    for (let t = 0; t < Math.PI * 4; t += 0.2) {
        const r = (t / (Math.PI * 4)) * (w / 2 - 4);
        const x = Math.cos(t) * r;
        const y = Math.sin(t) * r;
        if (t === 0) spirale.moveTo(x, y);
        else spirale.lineTo(x, y);
    }
    spirale.strokePath();
    container.add(spirale);

    // Cœur
    const coeur = scene.add.graphics();
    coeur.setBlendMode(Phaser.BlendModes.ADD);
    coeur.fillStyle(p.accent ?? 0xc080ff, 0.9);
    coeur.fillCircle(0, 0, w * 0.18);
    coeur.fillStyle(0xffffff, 1);
    coeur.fillCircle(0, 0, w * 0.08);
    container.add(coeur);

    scene.tweens.add({ targets: spirale, angle: -360, duration: 3000, repeat: -1, ease: 'Linear' });
    scene.tweens.add({ targets: coeur, scale: { from: 0.85, to: 1.2 }, duration: 750, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    return container;
}

registerVisuel('gravity-flipper', creerInverseurGravite);
