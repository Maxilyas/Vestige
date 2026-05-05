// SpectreCendre — silhouette flottante avec voile, traînée de cendre, yeux creux.
// Animation : flottement vertical, ondulation de la robe.

import { DEPTH } from '../PainterlyRenderer.js';

export function creerVisuelSpectre(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);

    const w = def.largeur;
    const h = def.hauteur;

    // --- Robe / corps : forme ovale étirée avec un bord inférieur en zigzag ---
    const corps = scene.add.graphics();
    corps.fillStyle(0x4a5a72, 0.7);
    // Tête + torse fusionnés en oval
    corps.fillEllipse(0, -2, w, h - 4);
    // Bord inférieur en pointes (la robe qui s'effiloche)
    corps.fillStyle(0x4a5a72, 0.55);
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

    // --- Voile clair par-dessus pour effet semi-transparent ---
    const voile = scene.add.graphics();
    voile.fillStyle(0x9aa8b8, 0.35);
    voile.fillEllipse(-2, -4, w * 0.7, h * 0.4);
    container.add(voile);

    // --- Yeux creux (2 cercles noirs profonds) ---
    const yeux = scene.add.graphics();
    yeux.fillStyle(0x000000, 0.85);
    yeux.fillCircle(-4, -6, 2.2);
    yeux.fillCircle(4, -6, 2.2);
    container.add(yeux);

    // --- Traînée de fumée derrière (ParticleEmitter qui suit le container) ---
    let fumee = null;
    if (scene.textures.exists('_particule')) {
        fumee = scene.add.particles(0, 0, '_particule', {
            lifespan: 800,
            speedY: { min: 10, max: 25 },
            speedX: { min: -8, max: 8 },
            scale: { start: 0.5, end: 0 },
            tint: 0x6a7a8a,
            quantity: 1,
            frequency: 120,
            alpha: { start: 0.5, end: 0 }
        });
        fumee.setDepth(DEPTH.ENTITES - 1);
        // Suivre la position du container
        const upd = () => {
            if (!fumee.active || !container.active) return;
            fumee.setPosition(container.x, container.y + h / 2);
        };
        scene.events.on('postupdate', upd);
        scene.events.once('shutdown', () => {
            scene.events.off('postupdate', upd);
            fumee?.destroy();
        });
    }

    // --- Animations ---
    // Flottement vertical (yoyo)
    scene.tweens.add({
        targets: container,
        y: { from: 0, to: -6 },
        duration: 1500,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });
    // Ondulation de la robe (subtil)
    scene.tweens.add({
        targets: corps,
        scaleY: { from: 1, to: 1.06 },
        duration: 900,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });
    // Yeux qui clignotent rarement (scaleY)
    scene.tweens.add({
        targets: yeux,
        scaleY: { from: 1, to: 0.1 },
        duration: 80,
        yoyo: true,
        repeat: -1,
        repeatDelay: 3500 + Math.random() * 2500
    });

    return container;
}
