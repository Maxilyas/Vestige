// VEILLEUR — quadrupède pierreux trapu, œil rougeoyant.

import { DEPTH } from '../../PainterlyRenderer.js';
import { assombrir, eclaircir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerVeilleur(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const palette = def.palette;
    const corps = scene.add.graphics();

    // Silhouette légèrement bombée
    corps.fillStyle(assombrir(palette.corps, 0.35), 1);
    corps.beginPath();
    corps.moveTo(-w / 2 + 2, h / 2 - 8);
    corps.lineTo(-w / 2 + 4, -h / 2 + 4);
    corps.lineTo(-w / 2 + 8, -h / 2);
    corps.lineTo( w / 2 - 8, -h / 2);
    corps.lineTo( w / 2 - 4, -h / 2 + 4);
    corps.lineTo( w / 2 - 2, h / 2 - 8);
    corps.closePath();
    corps.fillPath();
    corps.fillStyle(palette.corps, 0.85);
    corps.fillRect(-w / 2 + 4, -h / 2, w - 8, 4);
    corps.fillStyle(assombrir(palette.corps, 0.45), 1);
    corps.fillRect(-w / 2 + 2, h / 2 - 8, 8, 8);
    corps.fillRect( w / 2 - 10, h / 2 - 8, 8, 8);
    container.add(corps);

    const fissures = scene.add.graphics();
    fissures.lineStyle(1, palette.fissure ?? assombrir(palette.corps, 0.6), 0.7);
    fissures.beginPath();
    fissures.moveTo(-w / 2 + 5, -h / 2 + 6);
    fissures.lineTo(-w / 2 + 9, -h / 2 + 14);
    fissures.lineTo(-w / 2 + 6, -h / 2 + 20);
    fissures.strokePath();
    fissures.beginPath();
    fissures.moveTo(w / 2 - 4, -h / 2 + 8);
    fissures.lineTo(w / 2 - 8, h / 2 - 12);
    fissures.strokePath();
    container.add(fissures);

    const oeil = scene.add.graphics();
    oeil.setBlendMode(Phaser.BlendModes.ADD);
    oeil.fillStyle(assombrir(palette.accent, 0.65), 0.4);
    oeil.fillCircle(0, -2, 9);
    oeil.fillStyle(palette.accent, 0.85);
    oeil.fillCircle(0, -2, 5);
    oeil.fillStyle(eclaircir(palette.accent, 0.5), 1);
    oeil.fillCircle(0, -2, 2);
    container.add(oeil);

    scene.tweens.add({
        targets: container, scaleY: { from: 1, to: 1.03 },
        duration: 2200, ease: 'Sine.InOut', yoyo: true, repeat: -1
    });
    scene.tweens.add({
        targets: oeil, alpha: { from: 0.7, to: 1 },
        duration: 700, ease: 'Sine.InOut', yoyo: true, repeat: -1
    });
    return container;
}

registerVisuel('veilleur', creerVeilleur);
