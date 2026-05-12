// TIREUR — silhouette globulaire avec gros œil/orbe central.

import { DEPTH } from '../../PainterlyRenderer.js';
import { assombrir, eclaircir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerTireur(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const palette = def.palette;

    const halo = scene.add.graphics();
    halo.setBlendMode(Phaser.BlendModes.ADD);
    halo.fillStyle(palette.halo ?? eclaircir(palette.iris ?? palette.corps, 0.4), 0.25);
    halo.fillCircle(0, 0, w * 0.85);
    halo.fillStyle(palette.halo ?? eclaircir(palette.iris ?? palette.corps, 0.4), 0.4);
    halo.fillCircle(0, 0, w * 0.55);
    container.add(halo);

    const corps = scene.add.graphics();
    corps.fillStyle(assombrir(palette.corps, 0.3), 1);
    corps.fillCircle(0, 0, w / 2);
    corps.fillStyle(palette.corps, 0.85);
    corps.fillCircle(0, -2, w / 2 - 4);
    container.add(corps);

    const anneau = scene.add.graphics();
    anneau.lineStyle(2, palette.iris ?? palette.accent ?? 0xffd070, 0.65);
    anneau.strokeCircle(0, 0, w / 2 - 3);
    anneau.lineStyle(1, eclaircir(palette.iris ?? 0xffd070, 0.5), 0.85);
    anneau.strokeCircle(0, 0, w / 2 - 6);
    container.add(anneau);

    const iris = scene.add.graphics();
    iris.setBlendMode(Phaser.BlendModes.ADD);
    iris.fillStyle(palette.iris ?? 0xffa040, 0.85);
    iris.fillCircle(0, 0, w / 4);
    container.add(iris);

    const pupille = scene.add.graphics();
    pupille.fillStyle(palette.pupille ?? 0x000000, 1);
    pupille.fillCircle(0, 0, w / 8);
    pupille.fillStyle(0xffffff, 0.85);
    pupille.fillCircle(-1.5, -1.5, w / 24);
    container.add(pupille);

    scene.tweens.add({
        targets: halo, alpha: { from: 0.55, to: 1 },
        duration: 1200, ease: 'Sine.InOut', yoyo: true, repeat: -1
    });
    scene.tweens.add({
        targets: iris, scale: { from: 0.92, to: 1.08 },
        duration: 800, ease: 'Sine.InOut', yoyo: true, repeat: -1
    });
    scene.tweens.add({
        targets: anneau, angle: 360,
        duration: 8000, repeat: -1, ease: 'Linear'
    });
    container._iris = iris;
    container._halo = halo;
    return container;
}

registerVisuel('tireur', creerTireur);
