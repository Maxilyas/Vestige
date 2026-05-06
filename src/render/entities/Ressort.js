// Ressort — trampoline qui propulse le joueur vers le haut.
// Visuel : plateau métallique + spirale en compression sous le plateau.
// Animation au déclenchement : compression rapide + détente expansive + étincelles.

import { DEPTH } from '../PainterlyRenderer.js';

export function creerVisuelRessort(scene, x, y, largeur = 28, hauteur = 14) {
    const container = scene.add.container(x, y);
    container.setDepth(DEPTH.ENTITES);

    // === Base (rectangle ancré au sol) ===
    const base = scene.add.graphics();
    base.fillStyle(0x1a1a24, 1);
    base.fillRect(-largeur / 2, hauteur / 2 - 3, largeur, 3);
    base.fillStyle(0x4a4a5a, 1);
    base.fillRect(-largeur / 2 + 2, hauteur / 2 - 3, largeur - 4, 1);
    container.add(base);

    // === Spirale (3 anneaux empilés, cuivre/laiton) ===
    const spirale = scene.add.graphics();
    const couleurR = 0xc8a060;
    const couleurR2 = 0x8a6020;
    for (let i = 0; i < 3; i++) {
        const yA = hauteur / 2 - 4 - i * 3;
        spirale.lineStyle(2, couleurR2, 1);
        spirale.strokeEllipse(0, yA, largeur - 6, 3);
        spirale.lineStyle(1, couleurR, 1);
        spirale.strokeEllipse(0, yA - 0.5, largeur - 8, 2);
    }
    container.add(spirale);
    container._spirale = spirale;

    // === Plateau (top — disque doré bombé) ===
    const plateau = scene.add.graphics();
    plateau.fillStyle(0x6a4a18, 1);
    plateau.fillEllipse(0, -hauteur / 2 + 3, largeur, 6);
    plateau.fillStyle(0xc8a060, 1);
    plateau.fillEllipse(0, -hauteur / 2 + 2, largeur - 2, 5);
    plateau.fillStyle(0xffd070, 0.9);
    plateau.fillEllipse(0, -hauteur / 2 + 1, largeur - 6, 2);
    // Pointes décoratives sur le plateau
    plateau.fillStyle(0x6a4a18, 1);
    for (let i = -1; i <= 1; i++) {
        plateau.fillRect(i * 6 - 1, -hauteur / 2, 2, 2);
    }
    container.add(plateau);
    container._plateau = plateau;

    // Pulse subtil pour la lisibilité
    scene.tweens.add({
        targets: plateau, scaleY: { from: 1, to: 1.06 },
        duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.InOut'
    });

    return container;
}

/**
 * Joue l'animation de déclenchement (compression + boost de particules).
 */
export function jouerDeclenchementRessort(scene, container) {
    if (!container || !container.active) return;
    const plateau = container._plateau;
    const spirale = container._spirale;
    if (plateau) {
        scene.tweens.add({
            targets: plateau, y: 6, scaleY: 0.4,
            duration: 60, yoyo: true, ease: 'Cubic.Out'
        });
    }
    if (spirale) {
        scene.tweens.add({
            targets: spirale, scaleY: 0.4,
            duration: 60, yoyo: true, ease: 'Cubic.Out'
        });
    }
    if (scene.textures.exists('_particule')) {
        const burst = scene.add.particles(container.x, container.y - 6, '_particule', {
            lifespan: 380,
            speedY: { min: -180, max: -80 },
            speedX: { min: -50, max: 50 },
            scale: { start: 0.5, end: 0 },
            tint: [0xffd070, 0xc8a060, 0xffffff],
            quantity: 8,
            blendMode: Phaser.BlendModes.ADD,
            alpha: { start: 1, end: 0 }
        });
        burst.setDepth(DEPTH.EFFETS);
        burst.explode(8);
        scene.time.delayedCall(420, () => burst.destroy());
    }
}
