// REFLET-DOUBLE — silhouette joueur-like bleu glacial.

import { DEPTH } from '../../PainterlyRenderer.js';
import { assombrir, eclaircir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerRefletDouble(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const p = def.palette;

    // Silhouette type joueur
    const corps = scene.add.graphics();
    corps.fillStyle(p.corps, 0.85);
    corps.fillRoundedRect(-w / 2, -h / 2, w, h, 5);
    // Highlight
    corps.fillStyle(eclaircir(p.corps, 0.3), 0.6);
    corps.fillRect(-w / 2 + 2, -h / 2 + 2, 3, h - 4);
    container.add(corps);

    // Cœur lumineux (équivalent du cœur Résonance joueur)
    const coeur = scene.add.graphics();
    coeur.setBlendMode(Phaser.BlendModes.ADD);
    coeur.fillStyle(p.accent ?? 0xa0e0ff, 0.9);
    coeur.fillCircle(0, -h / 8, 4);
    coeur.fillStyle(0xffffff, 1);
    coeur.fillCircle(0, -h / 8, 1.5);
    container.add(coeur);

    // Yeux luminescents
    const yeux = scene.add.graphics();
    yeux.fillStyle(p.accent ?? 0xa0e0ff, 0.95);
    yeux.fillCircle(-3, -h / 3, 1.5);
    yeux.fillCircle( 3, -h / 3, 1.5);
    container.add(yeux);

    scene.tweens.add({ targets: coeur, alpha: { from: 0.7, to: 1 }, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    return container;
}

registerVisuel('mirror-being', creerRefletDouble);
