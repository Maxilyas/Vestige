// ANNEAU DE GLACE — noyau central avec aura cyan. Les éclats orbitaux
// sont créés et animés par le comportement, pas ici.

import { DEPTH } from '../../PainterlyRenderer.js';
import { eclaircir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerAnneauGlace(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const p = def.palette;

    // Noyau central
    const noyau = scene.add.graphics();
    noyau.fillStyle(p.corps, 1);
    noyau.fillCircle(0, 0, w / 2);
    noyau.fillStyle(eclaircir(p.corps, 0.3), 0.7);
    noyau.fillCircle(-2, -2, w / 3);
    container.add(noyau);

    // Anneau gravé
    const anneau = scene.add.graphics();
    anneau.lineStyle(2, p.accent ?? 0xa0d0ff, 0.85);
    anneau.strokeCircle(0, 0, w / 2 - 3);
    container.add(anneau);

    // Iris central
    const iris = scene.add.graphics();
    iris.setBlendMode(Phaser.BlendModes.ADD);
    iris.fillStyle(p.accent ?? 0xa0d0ff, 0.9);
    iris.fillCircle(0, 0, w / 5);
    iris.fillStyle(0xffffff, 1);
    iris.fillCircle(0, 0, w / 10);
    container.add(iris);

    scene.tweens.add({ targets: iris, scale: { from: 0.85, to: 1.15 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    scene.tweens.add({ targets: anneau, angle: -360, duration: 10000, repeat: -1, ease: 'Linear' });
    return container;
}

registerVisuel('orbital', creerAnneauGlace);
