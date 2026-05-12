// ANTI-PARRY — bipède aux yeux violets intenses + aura imparable rouge-violet.

import { DEPTH } from '../../PainterlyRenderer.js';
import { eclaircir, assombrir } from './_helpers.js';
import { registerVisuel } from './_registry.js';

export function creerAntiParry(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const p = def.palette;

    // Corps agressif (forme allongée)
    const corps = scene.add.graphics();
    corps.fillStyle(assombrir(p.corps, 0.3), 1);
    corps.beginPath();
    corps.moveTo(-w / 2, h / 2);
    corps.lineTo(-w / 2 + 4, -h / 2 + 6);
    corps.lineTo(-w / 4, -h / 2);
    corps.lineTo( w / 4, -h / 2);
    corps.lineTo( w / 2 - 4, -h / 2 + 6);
    corps.lineTo( w / 2, h / 2);
    corps.closePath();
    corps.fillPath();
    container.add(corps);

    // Cornes violentes
    const cornes = scene.add.graphics();
    cornes.fillStyle(assombrir(p.accent ?? 0xc080ff, 0.3), 1);
    cornes.beginPath();
    cornes.moveTo(-w / 4, -h / 2);
    cornes.lineTo(-w / 2 - 2, -h / 2 - 14);
    cornes.lineTo(-w / 4 + 4, -h / 2);
    cornes.closePath();
    cornes.fillPath();
    cornes.beginPath();
    cornes.moveTo( w / 4, -h / 2);
    cornes.lineTo( w / 2 + 2, -h / 2 - 14);
    cornes.lineTo( w / 4 - 4, -h / 2);
    cornes.closePath();
    cornes.fillPath();
    container.add(cornes);

    // Yeux brûlants
    const yeux = scene.add.graphics();
    yeux.setBlendMode(Phaser.BlendModes.ADD);
    const c = p.accent ?? 0xff80ff;
    yeux.fillStyle(c, 1);
    yeux.fillCircle(-w / 8, -h / 3, 2.5);
    yeux.fillCircle( w / 8, -h / 3, 2.5);
    container.add(yeux);

    // Aura imparable
    const aura = scene.add.graphics();
    aura.setBlendMode(Phaser.BlendModes.ADD);
    aura.lineStyle(2, c, 0.5);
    aura.strokeRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8);
    container.add(aura);

    scene.tweens.add({ targets: yeux, alpha: { from: 0.7, to: 1 }, duration: 350, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    scene.tweens.add({ targets: aura, alpha: { from: 0.4, to: 0.9 }, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    return container;
}

registerVisuel('unstoppable-charger', creerAntiParry);
