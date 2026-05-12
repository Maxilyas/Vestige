// CHARGEUR — bipède trapu, casque, posture de course.

import { DEPTH } from '../../PainterlyRenderer.js';
import { assombrir, eclaircir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerChargeur(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const palette = def.palette;

    const corps = scene.add.graphics();
    corps.fillStyle(assombrir(palette.corps, 0.3), 1);
    corps.beginPath();
    corps.moveTo(-w / 2 + 4, h / 2 - 2);
    corps.lineTo(-w / 2 + 8, -h / 4);
    corps.lineTo(-w / 4 - 2, -h / 2 + 6);
    corps.lineTo( w / 4 + 2, -h / 2 + 6);
    corps.lineTo( w / 2 - 8, -h / 4);
    corps.lineTo( w / 2 - 4, h / 2 - 2);
    corps.closePath();
    corps.fillPath();
    corps.fillStyle(palette.corps, 0.8);
    corps.fillRect(-w / 4 - 1, -h / 2 + 6, w / 2 + 2, 3);
    corps.fillStyle(assombrir(palette.corps, 0.5), 1);
    corps.fillRect(-w / 2 + 4, h / 2 - 4, 8, 4);
    corps.fillRect( w / 2 - 12, h / 2 - 4, 8, 4);
    container.add(corps);

    const casque = scene.add.graphics();
    casque.fillStyle(palette.casque ?? eclaircir(palette.corps, 0.2), 1);
    casque.beginPath();
    casque.moveTo(-w / 4, -h / 2 + 6);
    casque.lineTo(-w / 4 + 3, -h / 2 - 2);
    casque.lineTo( w / 4 - 3, -h / 2 - 2);
    casque.lineTo( w / 4, -h / 2 + 6);
    casque.closePath();
    casque.fillPath();
    casque.fillStyle(assombrir(palette.casque ?? palette.corps, 0.4), 1);
    casque.fillRect(-w / 4 + 2, -h / 2, w / 2 - 4, 3);
    container.add(casque);

    const yeux = scene.add.graphics();
    yeux.setBlendMode(Phaser.BlendModes.ADD);
    yeux.fillStyle(palette.accent, 0.9);
    yeux.fillCircle(-w / 8, -h / 2 + 1.5, 2.2);
    yeux.fillCircle( w / 8, -h / 2 + 1.5, 2.2);
    container.add(yeux);

    scene.tweens.add({
        targets: container, scaleY: { from: 1, to: 1.04 },
        duration: 1400, ease: 'Sine.InOut', yoyo: true, repeat: -1
    });
    scene.tweens.add({
        targets: yeux, alpha: { from: 0.6, to: 1 },
        duration: 500, ease: 'Sine.InOut', yoyo: true, repeat: -1
    });
    container._yeux = yeux;
    return container;
}

registerVisuel('chargeur', creerChargeur);
