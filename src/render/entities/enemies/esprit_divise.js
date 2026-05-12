// ESPRIT DIVISÉ — silhouette fantomatique triple-voile, brume noire.

import { DEPTH } from '../../PainterlyRenderer.js';
import { eclaircir, assombrir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerEspritDivise(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const p = def.palette;

    // 3 voiles superposés (transparents)
    const voiles = scene.add.graphics();
    voiles.fillStyle(p.corps, 0.4);
    voiles.fillEllipse(-3, 0, w * 0.7, h * 0.85);
    voiles.fillEllipse( 0, 0, w * 0.85, h * 0.85);
    voiles.fillEllipse( 3, 0, w * 0.7, h * 0.85);
    container.add(voiles);

    // 3 paires d'yeux brûlants
    const yeux = scene.add.graphics();
    yeux.setBlendMode(Phaser.BlendModes.ADD);
    const c = p.accent ?? 0xff4040;
    yeux.fillStyle(c, 0.9);
    yeux.fillCircle(-6, -h / 6, 1.5);
    yeux.fillCircle(-2, -h / 6, 1.5);
    yeux.fillCircle( 2, -h / 6, 1.5);
    yeux.fillCircle( 6, -h / 6, 1.5);
    container.add(yeux);

    // Pulse fantomatique
    scene.tweens.add({ targets: voiles, scaleX: { from: 1, to: 1.06 }, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    scene.tweens.add({ targets: yeux, alpha: { from: 0.6, to: 1 }, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    scene.tweens.add({ targets: container, y: { from: 0, to: -4 }, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    return container;
}

registerVisuel('sister-link', creerEspritDivise);
