// MIRAGE — silhouette vaporeuse à peine visible. L'alpha est piloté par
// le comportement phaser (fade-in à l'approche).

import { DEPTH } from '../../PainterlyRenderer.js';
import { eclaircir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerMirage(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    container.setAlpha(0);  // invisible au start
    const w = def.largeur, h = def.hauteur;
    const p = def.palette;

    const voile = scene.add.graphics();
    voile.fillStyle(p.corps, 0.4);
    voile.fillEllipse(0, 0, w, h);
    voile.fillStyle(eclaircir(p.corps, 0.3), 0.3);
    voile.fillEllipse(-2, -3, w * 0.7, h * 0.5);
    container.add(voile);

    const yeux = scene.add.graphics();
    yeux.setBlendMode(Phaser.BlendModes.ADD);
    yeux.fillStyle(p.accent ?? 0xc080ff, 0.85);
    yeux.fillCircle(-4, -h / 6, 2);
    yeux.fillCircle( 4, -h / 6, 2);
    container.add(yeux);

    scene.tweens.add({ targets: voile, scaleY: { from: 1, to: 1.08 }, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    return container;
}

registerVisuel('phaser', creerMirage);
