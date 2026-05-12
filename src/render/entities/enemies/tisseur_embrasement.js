// TISSEUR D'EMBRASEMENT — silhouette robe rouge sombre, mains brasier levées.

import { DEPTH } from '../../PainterlyRenderer.js';
import { assombrir, eclaircir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerTisseurEmbrasement(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const palette = def.palette;

    // Robe (cône)
    const robe = scene.add.graphics();
    robe.fillStyle(assombrir(palette.corps, 0.2), 1);
    robe.beginPath();
    robe.moveTo(-w / 2, h / 2);
    robe.lineTo(-w / 4, -h / 4);
    robe.lineTo( w / 4, -h / 4);
    robe.lineTo( w / 2, h / 2);
    robe.closePath();
    robe.fillPath();
    robe.fillStyle(palette.corps, 0.85);
    robe.fillRect(-w / 4 - 1, -h / 4, w / 2 + 2, 3);
    container.add(robe);

    // Capuche
    const capuche = scene.add.graphics();
    capuche.fillStyle(assombrir(palette.corps, 0.45), 1);
    capuche.beginPath();
    capuche.moveTo(-w / 4, -h / 4);
    capuche.lineTo(-w / 4 + 2, -h / 2);
    capuche.lineTo( w / 4 - 2, -h / 2);
    capuche.lineTo( w / 4, -h / 4);
    capuche.closePath();
    capuche.fillPath();
    container.add(capuche);

    // Brasier dans la capuche (additif)
    const brasier = scene.add.graphics();
    brasier.setBlendMode(Phaser.BlendModes.ADD);
    const c = palette.accent ?? 0xff5020;
    brasier.fillStyle(c, 0.8);
    brasier.fillEllipse(0, -h / 3, 6, 8);
    brasier.fillStyle(palette.flamme ?? 0xffa040, 1);
    brasier.fillEllipse(0, -h / 3, 3, 5);
    container.add(brasier);

    // Mains brasiers (2 petits points lumineux aux côtés)
    const mains = scene.add.graphics();
    mains.setBlendMode(Phaser.BlendModes.ADD);
    mains.fillStyle(c, 0.65);
    mains.fillCircle(-w / 3 - 2,  0, 5);
    mains.fillCircle( w / 3 + 2,  0, 5);
    mains.fillStyle(palette.flamme ?? 0xffa040, 0.95);
    mains.fillCircle(-w / 3 - 2,  0, 2.5);
    mains.fillCircle( w / 3 + 2,  0, 2.5);
    container.add(mains);

    scene.tweens.add({
        targets: brasier, alpha: { from: 0.75, to: 1 }, scale: { from: 0.9, to: 1.15 },
        duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut'
    });
    scene.tweens.add({
        targets: mains, alpha: { from: 0.6, to: 1 },
        duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut'
    });
    return container;
}

registerVisuel('wall-builder', creerTisseurEmbrasement);
