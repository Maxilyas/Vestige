// DRAIN-AURA — Cohérence-Éroder.
// Stationnaire passif. Si joueur dans aura, drain -1 Résonance par
// `intervalleDrain` ms. Vue HUD signature : aura sombre persistante.

import { registerComportement } from './_registry.js';

function init(enemy) {
    enemy.prochainDrain = enemy.scene.time.now + 1000;
}

function update(enemy, player) {
    enemy.sprite.body.setVelocity(0, 0);
    if (!player) return;
    const def = enemy.def;
    const scene = enemy.scene;
    const now = scene.time.now;
    const dx = player.x - enemy.sprite.x;
    const dy = player.y - enemy.sprite.y;
    if (Math.hypot(dx, dy) > (def.rayonAura ?? 180)) return;

    if (now >= enemy.prochainDrain) {
        enemy.prochainDrain = now + (def.intervalleDrain ?? 1000);
        scene.resonance?.prendreDegats?.(def.degatsDrain ?? 1);
    }
}

registerComportement('drain-aura', { init, update });
export default { init, update };
