// RACINE ÉTOUFFANTE — tronc fixé au sol avec tendrils sinueux animés.

import { DEPTH, tracerCourbeQuadratique } from '../../PainterlyRenderer.js';
import { assombrir, eclaircir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerRacineEtouffante(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const palette = def.palette;

    // Tronc gnarled
    const tronc = scene.add.graphics();
    tronc.fillStyle(assombrir(palette.corps, 0.3), 1);
    tronc.beginPath();
    tronc.moveTo(-w / 3, h / 2);
    tronc.lineTo(-w / 4, -h / 3);
    tronc.lineTo(-2, -h / 2 + 2);
    tronc.lineTo( 2, -h / 2 + 2);
    tronc.lineTo( w / 4, -h / 3);
    tronc.lineTo( w / 3, h / 2);
    tronc.closePath();
    tronc.fillPath();
    tronc.fillStyle(palette.corps, 0.8);
    tronc.fillRect(-w / 4, -h / 2 + 4, w / 2, 4);
    container.add(tronc);

    // Œil rouge sur le tronc (signe de vie)
    const oeil = scene.add.graphics();
    oeil.setBlendMode(Phaser.BlendModes.ADD);
    const c = palette.accent ?? 0xff5050;
    oeil.fillStyle(c, 0.85);
    oeil.fillCircle(0, -h / 4, 4);
    oeil.fillStyle(0xffffff, 0.9);
    oeil.fillCircle(0, -h / 4, 1.5);
    container.add(oeil);

    // Tendrils (4 courbes animées sortant des côtés)
    const tendrils = scene.add.graphics();
    container.add(tendrils);
    let phase = 0;
    const tracerTendrils = () => {
        if (!tendrils.active) return;
        tendrils.clear();
        tendrils.lineStyle(2, assombrir(palette.corps, 0.5), 0.85);
        const tendrilSpecs = [
            { x0: -w / 3, y0: h / 4, dir: -1, longueur: 20 },
            { x0: -w / 3, y0: 0, dir: -1, longueur: 16 },
            { x0:  w / 3, y0: h / 4, dir:  1, longueur: 20 },
            { x0:  w / 3, y0: 0, dir:  1, longueur: 16 }
        ];
        for (const t of tendrilSpecs) {
            const sway = Math.sin(phase + t.x0) * 4;
            tracerCourbeQuadratique(
                tendrils,
                t.x0, t.y0,
                t.x0 + t.dir * t.longueur, t.y0 - 6 + sway,
                t.x0 + t.dir * (t.longueur + 8), t.y0 + 6 + sway,
                10
            );
        }
    };
    tracerTendrils();
    const interval = scene.time.addEvent({
        delay: 80, loop: true,
        callback: () => { phase += 0.2; tracerTendrils(); }
    });
    scene.events.once('shutdown', () => interval.remove());

    // Pulse de l'œil
    scene.tweens.add({
        targets: oeil, alpha: { from: 0.7, to: 1 },
        duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut'
    });
    return container;
}

registerVisuel('anchor', creerRacineEtouffante);
