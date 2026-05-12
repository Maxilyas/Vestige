// ARDENT MIROIR — statue trapue avec disque miroir frontal réfléchissant.

import { DEPTH } from '../../PainterlyRenderer.js';
import { assombrir, eclaircir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerArdentMiroir(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const palette = def.palette;

    // Pied trapu
    const pied = scene.add.graphics();
    pied.fillStyle(assombrir(palette.corps, 0.3), 1);
    pied.beginPath();
    pied.moveTo(-w / 2 + 2, h / 2);
    pied.lineTo(-w / 3, -h / 4);
    pied.lineTo( w / 3, -h / 4);
    pied.lineTo( w / 2 - 2, h / 2);
    pied.closePath();
    pied.fillPath();
    container.add(pied);

    // Cadre du miroir (anneau doré)
    const cadre = scene.add.graphics();
    cadre.lineStyle(3, palette.accent ?? 0xffd070, 0.95);
    cadre.strokeCircle(0, -h / 6, w * 0.4);
    cadre.lineStyle(1, eclaircir(palette.accent ?? 0xffd070, 0.5), 1);
    cadre.strokeCircle(0, -h / 6, w * 0.36);
    container.add(cadre);

    // Surface réfléchissante (bleuté glacial)
    const surface = scene.add.graphics();
    surface.setBlendMode(Phaser.BlendModes.ADD);
    surface.fillStyle(palette.miroir ?? 0xa0c0d0, 0.55);
    surface.fillCircle(0, -h / 6, w * 0.35);
    surface.fillStyle(0xffffff, 0.45);
    surface.fillEllipse(-w * 0.1, -h / 6 - 2, w * 0.15, h * 0.12);
    container.add(surface);

    // Pulse subtil
    scene.tweens.add({
        targets: surface, alpha: { from: 0.8, to: 1 },
        duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.InOut'
    });
    scene.tweens.add({
        targets: cadre, angle: 360,
        duration: 12000, repeat: -1, ease: 'Linear'
    });
    return container;
}

registerVisuel('reflector', creerArdentMiroir);
