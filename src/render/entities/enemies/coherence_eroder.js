// COHÉRENCE-ÉRODER — champignon-ombre tordu, aura érosive sombre.

import { DEPTH } from '../../PainterlyRenderer.js';
import { eclaircir, assombrir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerCoherenceEroder(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const p = def.palette;

    // Pied tordu
    const pied = scene.add.graphics();
    pied.fillStyle(assombrir(p.corps, 0.4), 1);
    pied.beginPath();
    pied.moveTo(-w / 6, h / 2);
    pied.lineTo(-w / 5, 0);
    pied.lineTo(-3, -h / 4);
    pied.lineTo( 3, -h / 4);
    pied.lineTo( w / 4, -h / 6);
    pied.lineTo( w / 6, h / 2);
    pied.closePath();
    pied.fillPath();
    container.add(pied);

    // Chapeau noir
    const chapeau = scene.add.graphics();
    chapeau.fillStyle(0x1a0a14, 1);
    chapeau.beginPath();
    chapeau.moveTo(-w / 2, -h / 4);
    chapeau.lineTo(-w / 2 + 4, -h / 2 + 4);
    chapeau.lineTo(0, -h / 2);
    chapeau.lineTo( w / 2 - 4, -h / 2 + 4);
    chapeau.lineTo( w / 2, -h / 4);
    chapeau.lineTo( w / 3, -h / 5);
    chapeau.lineTo(-w / 3, -h / 5);
    chapeau.closePath();
    chapeau.fillPath();
    // Highlight
    chapeau.fillStyle(eclaircir(p.corps, 0.2), 0.5);
    chapeau.fillEllipse(-2, -h * 0.4, w * 0.5, h * 0.12);
    container.add(chapeau);

    // Aura érosive (additif rouge sombre)
    const aura = scene.add.graphics();
    aura.setBlendMode(Phaser.BlendModes.ADD);
    aura.fillStyle(p.accent ?? 0xa02040, 0.25);
    aura.fillCircle(0, 0, w * 0.7);
    container.add(aura);

    // Pulse aura
    scene.tweens.add({ targets: aura, alpha: { from: 0.4, to: 0.75 }, scale: { from: 0.95, to: 1.15 }, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    scene.tweens.add({ targets: chapeau, scaleX: { from: 1, to: 1.04 }, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    return container;
}

registerVisuel('drain-aura', creerCoherenceEroder);
