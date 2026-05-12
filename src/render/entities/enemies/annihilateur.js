// ANNIHILATEUR — monolithe noir avec sceau brisé rouge cramoisi.

import { DEPTH } from '../../PainterlyRenderer.js';
import { eclaircir, assombrir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerAnnihilateur(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const p = def.palette;

    // Monolithe sombre
    const corps = scene.add.graphics();
    corps.fillStyle(p.corps, 1);
    corps.fillRect(-w / 2, -h / 2, w, h);
    corps.fillStyle(eclaircir(p.corps, 0.2), 0.6);
    corps.fillRect(-w / 2 + 2, -h / 2 + 2, 3, h - 4);
    container.add(corps);

    // Sceau brisé (rune triangulaire fendue)
    const sceau = scene.add.graphics();
    sceau.lineStyle(2, p.accent ?? 0xff4040, 0.9);
    sceau.setBlendMode(Phaser.BlendModes.ADD);
    sceau.beginPath();
    sceau.moveTo(0, -h / 3);
    sceau.lineTo(-w / 4, h / 6);
    sceau.lineTo( w / 4, h / 6);
    sceau.closePath();
    sceau.strokePath();
    // Fente
    sceau.beginPath();
    sceau.moveTo(-w / 8, -h / 4);
    sceau.lineTo(w / 12, h / 10);
    sceau.strokePath();
    container.add(sceau);

    // Yeux fendus
    const yeux = scene.add.graphics();
    yeux.fillStyle(p.accent ?? 0xff4040, 0.95);
    yeux.fillRect(-w / 6, -h / 3 - 4, w / 8, 2);
    yeux.fillRect( w / 12, -h / 3 - 4, w / 8, 2);
    container.add(yeux);

    scene.tweens.add({ targets: sceau, alpha: { from: 0.6, to: 1 }, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    return container;
}

registerVisuel('parry-lock', creerAnnihilateur);
