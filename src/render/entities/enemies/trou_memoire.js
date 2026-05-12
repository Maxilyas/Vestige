// TROU DE MÉMOIRE — disque sombre béant bordé de filaments violets.

import { DEPTH } from '../../PainterlyRenderer.js';
import { eclaircir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerTrouMemoire(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const p = def.palette;

    // Disque noir
    const noir = scene.add.graphics();
    noir.fillStyle(0x000000, 1);
    noir.fillCircle(0, 0, w / 2);
    container.add(noir);

    // Bordure filamenteuse
    const bord = scene.add.graphics();
    bord.lineStyle(2, p.accent ?? 0xc080ff, 0.9);
    bord.strokeCircle(0, 0, w / 2 - 1);
    bord.setBlendMode(Phaser.BlendModes.ADD);
    // Filaments irréguliers
    for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        bord.beginPath();
        bord.moveTo(Math.cos(a) * (w / 2 - 2), Math.sin(a) * (w / 2 - 2));
        bord.lineTo(Math.cos(a) * (w / 2 + 6), Math.sin(a) * (w / 2 + 6));
        bord.strokePath();
    }
    container.add(bord);

    // Centre pulsant (additif faible)
    const pulse = scene.add.graphics();
    pulse.setBlendMode(Phaser.BlendModes.ADD);
    pulse.fillStyle(p.accent ?? 0xc080ff, 0.5);
    pulse.fillCircle(0, 0, w * 0.25);
    container.add(pulse);

    scene.tweens.add({ targets: bord, angle: 360, duration: 5000, repeat: -1, ease: 'Linear' });
    scene.tweens.add({ targets: pulse, alpha: { from: 0.3, to: 0.7 }, scale: { from: 0.9, to: 1.2 }, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    return container;
}

registerVisuel('teleporter', creerTrouMemoire);
