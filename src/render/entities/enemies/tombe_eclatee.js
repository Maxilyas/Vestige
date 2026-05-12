// TOMBE ÉCLATÉE — pierre tombale fissurée. Pulse violet quand elle ponde.

import { DEPTH } from '../../PainterlyRenderer.js';
import { assombrir, eclaircir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerTombeEclatee(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const palette = def.palette;

    // Pierre tombale (stèle)
    const corps = scene.add.graphics();
    corps.fillStyle(assombrir(palette.corps, 0.25), 1);
    corps.beginPath();
    corps.moveTo(-w / 2 + 2, h / 2);
    corps.lineTo(-w / 2 + 4, -h / 2 + 12);
    corps.lineTo(-w / 4, -h / 2);
    corps.lineTo( w / 4, -h / 2);
    corps.lineTo( w / 2 - 4, -h / 2 + 12);
    corps.lineTo( w / 2 - 2, h / 2);
    corps.closePath();
    corps.fillPath();
    corps.fillStyle(palette.corps, 0.8);
    corps.fillRect(-w / 4, -h / 2, w / 2, 3);
    container.add(corps);

    // Croix brisée
    const croix = scene.add.graphics();
    croix.fillStyle(assombrir(palette.corps, 0.4), 1);
    croix.fillRect(-2, -h / 2 + 14, 4, 16);
    croix.fillRect(-8, -h / 2 + 18, 7, 4); // bras gauche (cassé court)
    container.add(croix);

    // Grosses fissures
    const fissures = scene.add.graphics();
    fissures.lineStyle(2, palette.fissure ?? 0x1a0a1a, 0.9);
    fissures.beginPath();
    fissures.moveTo(-w / 4, -h / 4);
    fissures.lineTo(0, 0);
    fissures.lineTo(w / 6, h / 4);
    fissures.strokePath();
    fissures.beginPath();
    fissures.moveTo(w / 4, -h / 6);
    fissures.lineTo(w / 8, h / 6);
    fissures.strokePath();
    container.add(fissures);

    // Lueur intérieure visible à travers les fissures (additive)
    const lueur = scene.add.graphics();
    lueur.setBlendMode(Phaser.BlendModes.ADD);
    lueur.fillStyle(palette.accent ?? 0xa040c0, 0.5);
    lueur.fillCircle(0, 0, w * 0.3);
    container.add(lueur);

    scene.tweens.add({
        targets: lueur, alpha: { from: 0.3, to: 0.8 }, scale: { from: 0.85, to: 1.1 },
        duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.InOut'
    });
    return container;
}

registerVisuel('spawner', creerTombeEclatee);
