// DEATH-SHARDS — Cœur Fragmenté.
// Traqueur classique. À la mort, spawn 3 éclats qui restent au sol 2s puis
// explosent en AOE locale (-10 dgts si joueur dans rayon).

import { registerComportement } from './_registry.js';
import { DEPTH } from '../../render/PainterlyRenderer.js';

function spawnerEclats(scene, x, y, def) {
    const couleur = def.palette?.accent ?? 0xff3040;
    const dgts = def.degatsEclat ?? 10;
    const rayon = def.rayonExplosion ?? 70;
    const dureeAvantExplosion = def.dureeEclat ?? 2000;

    for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 + Math.random() * 0.5;
        const dx = Math.cos(a) * 30;
        const dy = Math.sin(a) * 20;
        const eclat = scene.add.graphics();
        eclat.setDepth(DEPTH.EFFETS ?? 60);
        eclat.setBlendMode(Phaser.BlendModes.ADD);
        eclat.setPosition(x, y);
        eclat.fillStyle(couleur, 0.85);
        eclat.fillCircle(0, 0, 6);
        eclat.fillStyle(0xffffff, 1);
        eclat.fillCircle(0, 0, 2);
        // Lance l'éclat
        scene.tweens.add({
            targets: eclat, x: x + dx, y: y + dy,
            duration: 300, ease: 'Cubic.Out'
        });
        // Pulse
        scene.tweens.add({
            targets: eclat, scale: { from: 0.8, to: 1.3 }, alpha: { from: 0.8, to: 1 },
            duration: 250, yoyo: true, repeat: -1, ease: 'Sine.InOut'
        });
        // Explosion à la fin
        scene.time.delayedCall(dureeAvantExplosion, () => {
            if (!eclat.active) return;
            const ex = eclat.x, ey = eclat.y;
            // FX burst
            const burst = scene.add.graphics();
            burst.setDepth(DEPTH.EFFETS ?? 60);
            burst.setBlendMode(Phaser.BlendModes.ADD);
            burst.setPosition(ex, ey);
            burst.fillStyle(couleur, 0.85);
            burst.fillCircle(0, 0, rayon * 0.5);
            scene.tweens.add({
                targets: burst, scale: { from: 0.4, to: 1.6 }, alpha: { from: 1, to: 0 },
                duration: 340, ease: 'Cubic.Out',
                onComplete: () => burst.destroy()
            });
            // Damage si joueur en range
            const player = scene.player;
            if (player) {
                const pdx = player.x - ex, pdy = player.y - ey;
                if (Math.hypot(pdx, pdy) < rayon) {
                    if (scene.time.now >= (scene.invincibleJusqu ?? 0)) {
                        scene.resonance?.prendreDegats?.(dgts);
                        scene.invincibleJusqu = scene.time.now + 500;
                        scene.flashJoueur?.(0xff4040);
                    }
                }
            }
            scene.tweens.killTweensOf(eclat);
            eclat.destroy();
        });
    }
}

function init(enemy) {
    const handler = (mort) => {
        if (mort !== enemy) return;
        enemy.scene.events.off('enemy:dead', handler);
        spawnerEclats(enemy.scene, enemy.sprite.x, enemy.sprite.y, enemy.def);
    };
    enemy.scene.events.on('enemy:dead', handler);
}

function update(enemy, player) {
    // Traqueur basique
    if (!player) return;
    const body = enemy.sprite.body;
    const dx = player.x - enemy.sprite.x;
    const dy = player.y - enemy.sprite.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0 && dist < (enemy.def.rayonDetection ?? 300)) {
        const v = enemy.def.vitesse;
        body.setVelocity((dx / dist) * v, (dy / dist) * v);
        if (Math.abs(dx) > 4) enemy.direction = dx > 0 ? 1 : -1;
    } else {
        body.setVelocity(0, 0);
    }
}

registerComportement('death-shards', { init, update });
export default { init, update };
