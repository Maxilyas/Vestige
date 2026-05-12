// BRÛLEUR LENT — silhouette ronde rouge brasier. Expose des hooks pour
// telegraph d'explosion (pulse rouge grandissant) et annulation parry.

import { DEPTH } from '../../PainterlyRenderer.js';
import { assombrir, eclaircir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerBruleurLent(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const palette = def.palette;

    // Corps rond brasier
    const corps = scene.add.graphics();
    corps.fillStyle(assombrir(palette.corps, 0.3), 1);
    corps.fillEllipse(0, 0, w, h);
    corps.fillStyle(palette.corps, 0.85);
    corps.fillEllipse(0, -2, w * 0.9, h * 0.85);
    container.add(corps);

    // Cœur incandescent (additif)
    const coeur = scene.add.graphics();
    coeur.setBlendMode(Phaser.BlendModes.ADD);
    const c = palette.accent ?? 0xff5020;
    coeur.fillStyle(c, 0.6);
    coeur.fillCircle(0, 0, w / 3);
    coeur.fillStyle(c, 0.9);
    coeur.fillCircle(0, 0, w / 5);
    coeur.fillStyle(0xffffa0, 1);
    coeur.fillCircle(0, 0, w / 10);
    container.add(coeur);

    // Fissures braises
    const fissures = scene.add.graphics();
    fissures.lineStyle(1.5, c, 0.7);
    fissures.setBlendMode(Phaser.BlendModes.ADD);
    fissures.beginPath();
    fissures.moveTo(-w / 3, -h / 4); fissures.lineTo(-w / 6, h / 8);
    fissures.moveTo( w / 3, -h / 5); fissures.lineTo( w / 8, h / 6);
    fissures.strokePath();
    container.add(fissures);

    // Pulse cœur
    scene.tweens.add({
        targets: coeur, scale: { from: 0.85, to: 1.15 }, alpha: { from: 0.85, to: 1 },
        duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.InOut'
    });

    // Halo de telegraph (initialement invisible)
    let haloTelegraph = null;

    container._declencherTelegraph = (scene, dureeMs) => {
        haloTelegraph = scene.add.graphics();
        haloTelegraph.setDepth(DEPTH.EFFETS - 1);
        haloTelegraph.setBlendMode(Phaser.BlendModes.ADD);
        haloTelegraph.setPosition(container.x, container.y);
        haloTelegraph.fillStyle(c, 0.45);
        haloTelegraph.fillCircle(0, 0, 28);
        haloTelegraph.fillStyle(c, 0.7);
        haloTelegraph.fillCircle(0, 0, 14);
        // Pulse rapide qui s'accélère
        scene.tweens.add({
            targets: haloTelegraph, scale: { from: 0.6, to: 3.2 }, alpha: { from: 1, to: 0.4 },
            duration: dureeMs, ease: 'Cubic.In',
            onUpdate: () => {
                if (haloTelegraph?.active && container.active) {
                    haloTelegraph.setPosition(container.x, container.y);
                }
            }
        });
        container._haloTelegraph = haloTelegraph;
        // Auto-destruct si le container meurt avant la fin du telegraph
        // (le halo est dans la scène, pas un enfant du container, donc il
        // ne suit pas la destruction automatique).
        container.once('destroy', () => {
            if (haloTelegraph?.active) {
                scene.tweens.killTweensOf(haloTelegraph);
                haloTelegraph.destroy();
            }
        });
    };

    container._annulerTelegraph = (scene) => {
        if (container._haloTelegraph?.active) {
            scene.tweens.killTweensOf(container._haloTelegraph);
            scene.tweens.add({
                targets: container._haloTelegraph, alpha: 0, scale: 0.4,
                duration: 220,
                onComplete: () => container._haloTelegraph?.destroy()
            });
        }
    };

    return container;
}

registerVisuel('detonator', creerBruleurLent);
