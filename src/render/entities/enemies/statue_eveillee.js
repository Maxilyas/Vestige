// STATUE ÉVEILLÉE — pierre humanoïde grise, yeux fermés. À l'activation,
// les yeux s'embrasent en rouge et les fissures luisent.

import { DEPTH } from '../../PainterlyRenderer.js';
import { assombrir, eclaircir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerStatueEveillee(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const palette = def.palette;

    // Pierre humanoïde
    const corps = scene.add.graphics();
    corps.fillStyle(assombrir(palette.corps, 0.2), 1);
    corps.beginPath();
    corps.moveTo(-w / 2 + 4, h / 2);
    corps.lineTo(-w / 2 + 6, -h / 4);
    corps.lineTo(-w / 4, -h / 2 + 4);
    corps.lineTo( w / 4, -h / 2 + 4);
    corps.lineTo( w / 2 - 6, -h / 4);
    corps.lineTo( w / 2 - 4, h / 2);
    corps.closePath();
    corps.fillPath();
    corps.fillStyle(palette.corps, 0.7);
    corps.fillRect(-w / 4, -h / 2 + 4, w / 2, 4);
    container.add(corps);

    // Fissures (visibles dormantes, lumineuses en éveil)
    const fissures = scene.add.graphics();
    fissures.lineStyle(2, palette.fissure ?? 0x1a1a14, 0.7);
    fissures.beginPath();
    fissures.moveTo(-w / 6, -h / 4);
    fissures.lineTo(-2, 0);
    fissures.lineTo(-w / 8, h / 4);
    fissures.strokePath();
    fissures.beginPath();
    fissures.moveTo(w / 6, -h / 4 + 4);
    fissures.lineTo(2, 4);
    fissures.strokePath();
    container.add(fissures);

    // Yeux fermés (traits)
    const yeux = scene.add.graphics();
    yeux.lineStyle(2, 0x000000, 1);
    yeux.beginPath();
    yeux.moveTo(-w / 6, -h / 3); yeux.lineTo(-w / 8, -h / 3);
    yeux.moveTo( w / 8, -h / 3); yeux.lineTo( w / 6, -h / 3);
    yeux.strokePath();
    container.add(yeux);

    // Méthode d'activation : appelée par le comportement dormant
    container._reveiller = (scene) => {
        // Yeux brillants rouges
        yeux.clear();
        yeux.setBlendMode(Phaser.BlendModes.ADD);
        const r = palette.accent ?? 0xff3030;
        yeux.fillStyle(r, 0.9);
        yeux.fillCircle(-w / 7, -h / 3, 3);
        yeux.fillCircle( w / 7, -h / 3, 3);
        // Halo flash
        const halo = scene.add.graphics();
        halo.setDepth(DEPTH.EFFETS);
        halo.setBlendMode(Phaser.BlendModes.ADD);
        halo.fillStyle(r, 0.8);
        halo.fillCircle(container.x, container.y, w * 0.7);
        scene.tweens.add({
            targets: halo, scale: { from: 0.4, to: 2.2 }, alpha: { from: 1, to: 0 },
            duration: 500, ease: 'Cubic.Out',
            onComplete: () => halo.destroy()
        });
        // Fissures rougeoyantes
        fissures.clear();
        fissures.lineStyle(2, r, 0.9);
        fissures.beginPath();
        fissures.moveTo(-w / 6, -h / 4); fissures.lineTo(-2, 0); fissures.lineTo(-w / 8, h / 4);
        fissures.strokePath();
        fissures.beginPath();
        fissures.moveTo(w / 6, -h / 4 + 4); fissures.lineTo(2, 4);
        fissures.strokePath();
        fissures.setBlendMode(Phaser.BlendModes.ADD);
        scene.tweens.add({
            targets: fissures, alpha: { from: 0.7, to: 1 },
            duration: 600, yoyo: true, repeat: -1
        });
    };

    return container;
}

registerVisuel('dormant', creerStatueEveillee);
