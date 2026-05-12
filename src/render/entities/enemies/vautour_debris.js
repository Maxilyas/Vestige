// VAUTOUR DE DÉBRIS — silhouette ailée volant en hauteur, ailes battantes.

import { DEPTH } from '../../PainterlyRenderer.js';
import { assombrir, eclaircir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerVautourDebris(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const palette = def.palette;

    // Corps central effilé
    const corps = scene.add.graphics();
    corps.fillStyle(assombrir(palette.corps, 0.3), 1);
    corps.fillEllipse(0, 0, w * 0.5, h * 0.6);
    corps.fillStyle(palette.corps, 0.85);
    corps.fillEllipse(0, -2, w * 0.4, h * 0.45);
    container.add(corps);

    // Bec acéré
    const bec = scene.add.graphics();
    bec.fillStyle(palette.accent ?? 0xc0a060, 1);
    bec.beginPath();
    bec.moveTo(0, -h * 0.2);
    bec.lineTo(0, -h * 0.05);
    bec.lineTo(6, -h * 0.05);
    bec.closePath();
    bec.fillPath();
    container.add(bec);

    // Œil rouge
    const oeil = scene.add.graphics();
    oeil.setBlendMode(Phaser.BlendModes.ADD);
    oeil.fillStyle(0xff4040, 0.9);
    oeil.fillCircle(-2, -h * 0.15, 1.8);
    container.add(oeil);

    // 2 ailes (graphics qu'on redessine pour animation flap)
    const ailes = scene.add.graphics();
    container.add(ailes);
    let battement = 0;
    const tracerAiles = () => {
        if (!ailes.active) return;
        ailes.clear();
        const a = Math.sin(battement) * 0.4;
        const t = 1 + a * 0.3;       // amplitude verticale du flap
        ailes.fillStyle(assombrir(palette.corps, 0.4), 0.9);
        // Aile gauche
        ailes.beginPath();
        ailes.moveTo(-w * 0.2, 0);
        ailes.lineTo(-w * 0.8, -h * 0.3 * t);
        ailes.lineTo(-w * 0.55, h * 0.15);
        ailes.closePath();
        ailes.fillPath();
        // Aile droite
        ailes.beginPath();
        ailes.moveTo( w * 0.2, 0);
        ailes.lineTo( w * 0.8, -h * 0.3 * t);
        ailes.lineTo( w * 0.55, h * 0.15);
        ailes.closePath();
        ailes.fillPath();
    };
    tracerAiles();
    const interval = scene.time.addEvent({
        delay: 60, loop: true,
        callback: () => { battement += 0.5; tracerAiles(); }
    });
    scene.events.once('shutdown', () => interval.remove());

    return container;
}

registerVisuel('diver', creerVautourDebris);
