// MIRROR-BEING — Reflet-Double.
// Traqueur lent qui mime l'attaque du joueur. Quand le joueur attaque (track
// via scene.lastAttaqueAt), planifie une "attaque fantôme" à sa propre
// position 500ms plus tard. Si le joueur est en range au moment du fantôme,
// il prend dégâts.

import { registerComportement } from './_registry.js';
import { DEPTH } from '../../render/PainterlyRenderer.js';

function init(enemy) {
    enemy.dernierMimicSur = 0;
    enemy.prochaineMimic = 0;
}

function update(enemy, player) {
    if (!player) return;
    const scene = enemy.scene;
    const now = scene.time.now;
    const def = enemy.def;
    const body = enemy.sprite.body;

    // Poursuite lente du joueur
    const dx = player.x - enemy.sprite.x;
    const dy = player.y - enemy.sprite.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0 && dist < (def.rayonDetection ?? 320)) {
        const v = def.vitesse;
        body.setVelocity((dx / dist) * v, (dy / dist) * v);
        if (Math.abs(dx) > 4) enemy.direction = dx > 0 ? 1 : -1;
    } else {
        body.setVelocity(0, 0);
    }

    // Track scene.lastAttaqueAt — planifie une mimic 500ms après
    const lastAttaque = scene.lastAttaqueAt ?? 0;
    if (lastAttaque > enemy.dernierMimicSur) {
        enemy.dernierMimicSur = lastAttaque;
        enemy.prochaineMimic = now + (def.delaiMimic ?? 500);
    }

    // Déclenche la mimic (attaque fantôme)
    if (enemy.prochaineMimic > 0 && now >= enemy.prochaineMimic) {
        enemy.prochaineMimic = 0;
        // FX : slash visuel
        const portee = def.porteeMimic ?? 50;
        const dgts = def.degatsMimic ?? 8;
        const slash = scene.add.graphics();
        slash.setDepth(DEPTH.EFFETS);
        slash.setBlendMode(Phaser.BlendModes.ADD);
        slash.setPosition(enemy.sprite.x + enemy.direction * 20, enemy.sprite.y);
        slash.lineStyle(4, def.palette?.accent ?? 0xa0e0ff, 0.9);
        slash.beginPath();
        slash.moveTo(-portee / 2, -10);
        slash.lineTo( portee / 2,  10);
        slash.strokePath();
        scene.tweens.add({
            targets: slash, scale: { from: 0.6, to: 1.4 }, alpha: { from: 1, to: 0 },
            duration: 240, ease: 'Cubic.Out',
            onComplete: () => slash.destroy()
        });
        // Damage si joueur en range
        const pdx = Math.abs(player.x - (enemy.sprite.x + enemy.direction * 20));
        const pdy = Math.abs(player.y - enemy.sprite.y);
        if (pdx < portee / 2 + 20 && pdy < 30) {
            if (now >= (scene.invincibleJusqu ?? 0)) {
                scene.resonance?.prendreDegats?.(dgts);
                scene.invincibleJusqu = now + 500;
                scene.flashJoueur?.(0xff6060);
            }
        }
    }
}

registerComportement('mirror-being', { init, update });
export default { init, update };
