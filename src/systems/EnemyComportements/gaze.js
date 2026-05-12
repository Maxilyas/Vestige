// GAZE — Regard du Reflux.
// Stationnaire. Si joueur dans rayon, tick dgts toutes les `intervalleDrain` ms.
// Visuel : rayon laser persistant de l'ennemi vers le joueur quand actif.

import { registerComportement } from './_registry.js';
import { DEPTH } from '../../render/PainterlyRenderer.js';

function init(enemy) {
    enemy.prochainDrain = enemy.scene.time.now + 500;
    enemy.rayonVisuel = null;
}

function update(enemy, player) {
    enemy.sprite.body.setVelocity(0, 0);
    const scene = enemy.scene;
    const def = enemy.def;
    const now = scene.time.now;

    if (!player) {
        if (enemy.rayonVisuel?.active) enemy.rayonVisuel.clear();
        return;
    }
    const dx = player.x - enemy.sprite.x;
    const dy = player.y - enemy.sprite.y;
    const dist = Math.hypot(dx, dy);

    if (dist > (def.rayonRegard ?? 360)) {
        // Out of range : clean visual
        if (enemy.rayonVisuel?.active) enemy.rayonVisuel.clear();
        return;
    }
    // Update rayon visuel
    if (!enemy.rayonVisuel) {
        enemy.rayonVisuel = scene.add.graphics();
        enemy.rayonVisuel.setDepth(DEPTH.EFFETS ?? 60);
        enemy.rayonVisuel.setBlendMode(Phaser.BlendModes.ADD);
    }
    enemy.rayonVisuel.clear();
    enemy.rayonVisuel.lineStyle(2, def.palette?.accent ?? 0xff4040, 0.65);
    enemy.rayonVisuel.beginPath();
    enemy.rayonVisuel.moveTo(enemy.sprite.x, enemy.sprite.y);
    enemy.rayonVisuel.lineTo(player.x, player.y);
    enemy.rayonVisuel.strokePath();

    // Tick drain
    if (now >= enemy.prochainDrain) {
        enemy.prochainDrain = now + (def.intervalleDrain ?? 1000);
        scene.resonance?.prendreDegats?.(def.degatsDrain ?? 2);
        scene.flashJoueur?.(0xff4040);
    }

    // Cleanup visuel à la mort
    if (!enemy._rayonCleanRegistered) {
        enemy._rayonCleanRegistered = true;
        const origMourir = enemy.mourir.bind(enemy);
        enemy.mourir = () => {
            origMourir();
            if (enemy.rayonVisuel?.active) enemy.rayonVisuel.destroy();
        };
    }
}

registerComportement('gaze', { init, update });
export default { init, update };
