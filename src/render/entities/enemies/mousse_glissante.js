// MOUSSE GLISSANTE — blob aplati au sol, texture mousseuse vert humide.

import { DEPTH } from '../../PainterlyRenderer.js';
import { assombrir, eclaircir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerMousseGlissante(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const palette = def.palette;

    // Blob aplati
    const corps = scene.add.graphics();
    corps.fillStyle(assombrir(palette.corps, 0.3), 1);
    corps.fillEllipse(0, h / 4, w * 1.1, h * 0.9);
    corps.fillStyle(palette.corps, 0.9);
    corps.fillEllipse(0, h / 4 - 2, w * 0.95, h * 0.75);
    // Highlight glistening
    corps.fillStyle(eclaircir(palette.corps, 0.5), 0.6);
    corps.fillEllipse(-w / 6, h / 4 - 6, w * 0.4, h * 0.25);
    container.add(corps);

    // Petits "œil" en surface
    const oeil = scene.add.graphics();
    oeil.fillStyle(0x102014, 0.9);
    oeil.fillCircle(-4, h / 6, 2);
    oeil.fillCircle( 4, h / 6, 2);
    oeil.fillStyle(0xffffff, 0.7);
    oeil.fillCircle(-3, h / 6 - 1, 0.6);
    oeil.fillCircle( 5, h / 6 - 1, 0.6);
    container.add(oeil);

    // Particules mousse (humidité) émises au sol
    if (scene.textures.exists('_particule')) {
        const emit = scene.add.particles(0, 0, '_particule', {
            lifespan: 600,
            speedY: { min: -10, max: -2 },
            speedX: { min: -4, max: 4 },
            scale: { start: 0.3, end: 0 },
            tint: [palette.accent ?? eclaircir(palette.corps, 0.4)],
            quantity: 1, frequency: 280,
            alpha: { start: 0.6, end: 0 }
        });
        emit.setDepth(DEPTH.ENTITES - 1);
        const upd = () => {
            if (!emit.active || !container.active) return;
            emit.setPosition(container.x, container.y + h / 2 - 2);
        };
        scene.events.on('postupdate', upd);
        scene.events.once('shutdown', () => {
            scene.events.off('postupdate', upd);
            emit?.destroy();
        });
    }

    // Squash pulsant (respiration)
    scene.tweens.add({
        targets: corps, scaleY: { from: 1, to: 0.92 },
        duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.InOut'
    });
    return container;
}

registerVisuel('trail-tile', creerMousseGlissante);
