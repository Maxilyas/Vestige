// TRAQUEUR — silhouette flottante voilée, yeux creux, traînée de fumée.

import { DEPTH } from '../../PainterlyRenderer.js';
import { assombrir, eclaircir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerTraqueur(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const palette = def.palette;

    const corps = scene.add.graphics();
    corps.fillStyle(palette.corps, 0.7);
    corps.fillEllipse(0, -2, w, h - 4);
    corps.fillStyle(palette.corps, 0.55);
    corps.beginPath();
    corps.moveTo(-w / 2 + 2, h / 2 - 6);
    corps.lineTo(-w / 2 + 4, h / 2 + 4);
    corps.lineTo(-w / 4, h / 2 - 4);
    corps.lineTo(0, h / 2 + 6);
    corps.lineTo(w / 4, h / 2 - 4);
    corps.lineTo(w / 2 - 4, h / 2 + 4);
    corps.lineTo(w / 2 - 2, h / 2 - 6);
    corps.closePath();
    corps.fillPath();
    container.add(corps);

    const voile = scene.add.graphics();
    voile.fillStyle(palette.voile ?? eclaircir(palette.corps, 0.4), 0.35);
    voile.fillEllipse(-2, -4, w * 0.7, h * 0.4);
    container.add(voile);

    const yeux = scene.add.graphics();
    yeux.fillStyle(palette.yeux ?? 0x000000, 0.85);
    yeux.fillCircle(-4, -6, 2.2);
    yeux.fillCircle( 4, -6, 2.2);
    if (palette.yeux && palette.yeux !== 0x000000) {
        const haloYeux = scene.add.graphics();
        haloYeux.setBlendMode(Phaser.BlendModes.ADD);
        haloYeux.fillStyle(palette.yeux, 0.6);
        haloYeux.fillCircle(-4, -6, 4);
        haloYeux.fillCircle( 4, -6, 4);
        container.add(haloYeux);
    }
    container.add(yeux);

    if (scene.textures.exists('_particule')) {
        const fumee = scene.add.particles(0, 0, '_particule', {
            lifespan: 800,
            speedY: { min: 10, max: 25 },
            speedX: { min: -8, max: 8 },
            scale: { start: 0.5, end: 0 },
            tint: assombrir(palette.corps, 0.3),
            quantity: 1,
            frequency: 120,
            alpha: { start: 0.5, end: 0 }
        });
        fumee.setDepth(DEPTH.ENTITES - 1);
        const upd = () => {
            if (!fumee.active || !container.active) return;
            fumee.setPosition(container.x, container.y + h / 2);
        };
        scene.events.on('postupdate', upd);
        scene.events.once('shutdown', () => {
            scene.events.off('postupdate', upd);
            fumee?.destroy();
        });
        container._fumee = fumee;
    }

    scene.tweens.add({
        targets: container, y: { from: 0, to: -6 },
        duration: 1500, ease: 'Sine.InOut', yoyo: true, repeat: -1
    });
    scene.tweens.add({
        targets: corps, scaleY: { from: 1, to: 1.06 },
        duration: 900, ease: 'Sine.InOut', yoyo: true, repeat: -1
    });
    scene.tweens.add({
        targets: yeux, scaleY: { from: 1, to: 0.1 },
        duration: 80, yoyo: true, repeat: -1,
        repeatDelay: 3500 + Math.random() * 2500
    });
    return container;
}

registerVisuel('traqueur', creerTraqueur);
