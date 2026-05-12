// CHAMPIGNON-SPORE — stem + chapeau, halo de spores lentement émises.

import { DEPTH } from '../../PainterlyRenderer.js';
import { assombrir, eclaircir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerChampignonSpore(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const palette = def.palette;

    // Stem (pied)
    const stem = scene.add.graphics();
    stem.fillStyle(eclaircir(palette.corps, 0.3), 1);
    stem.fillEllipse(0, h / 4, w * 0.45, h * 0.55);
    stem.fillStyle(assombrir(palette.corps, 0.15), 0.7);
    stem.fillEllipse(2, h / 4, w * 0.25, h * 0.45);
    container.add(stem);

    // Chapeau
    const chapeau = scene.add.graphics();
    chapeau.fillStyle(assombrir(palette.accent ?? 0x6a3a8a, 0.2), 1);
    chapeau.beginPath();
    chapeau.moveTo(-w / 2, -h / 6);
    chapeau.lineTo(-w * 0.4, -h * 0.45);
    chapeau.lineTo( 0, -h * 0.55);
    chapeau.lineTo( w * 0.4, -h * 0.45);
    chapeau.lineTo( w / 2, -h / 6);
    chapeau.lineTo( w * 0.35, -h * 0.15);
    chapeau.lineTo(-w * 0.35, -h * 0.15);
    chapeau.closePath();
    chapeau.fillPath();
    // Highlight
    chapeau.fillStyle(eclaircir(palette.accent ?? 0xa060c0, 0.3), 0.85);
    chapeau.fillEllipse(-4, -h * 0.42, w * 0.5, h * 0.18);
    container.add(chapeau);

    // Taches lumineuses (pores) sur chapeau
    const pores = scene.add.graphics();
    pores.setBlendMode(Phaser.BlendModes.ADD);
    const c = palette.accent ?? 0xa060c0;
    const positions = [[-w * 0.2, -h * 0.4], [w * 0.15, -h * 0.4], [0, -h * 0.3], [-w * 0.1, -h * 0.25]];
    for (const [x, y] of positions) {
        pores.fillStyle(c, 0.7);
        pores.fillCircle(x, y, 2.2);
    }
    container.add(pores);

    // Pulse pores
    scene.tweens.add({
        targets: pores, alpha: { from: 0.6, to: 1 },
        duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.InOut'
    });
    // Léger sway
    scene.tweens.add({
        targets: chapeau, scaleX: { from: 1, to: 1.03 },
        duration: 1900, yoyo: true, repeat: -1, ease: 'Sine.InOut'
    });
    return container;
}

registerVisuel('cloud', creerChampignonSpore);
