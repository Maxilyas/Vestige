// VISION-DISTORTER — Cristal-Prisme.
// Stationnaire passif. Si joueur dans rayon, applique flag de vision floue.

import { registerComportement } from './_registry.js';
import { appliquerVisionFlou } from '../PerceptionSystem.js';

function update(enemy, player) {
    enemy.sprite.body.setVelocity(0, 0);
    if (!player) return;
    const def = enemy.def;
    const dx = player.x - enemy.sprite.x;
    const dy = player.y - enemy.sprite.y;
    if (Math.hypot(dx, dy) < (def.rayonAura ?? 220)) {
        appliquerVisionFlou(enemy.scene, player, 200);
    }
}

registerComportement('vision-distorter', { init: null, update });
export default { init: null, update };
