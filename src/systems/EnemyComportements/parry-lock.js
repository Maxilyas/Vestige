// PARRY-LOCK — Annihilateur.
// Stationnaire passif. Si joueur dans aura, applique flag _parryLockJusqu
// (refresh par frame). Le GameScene.tenterParry vérifie ce flag et fait
// no-op + message si actif.

import { registerComportement } from './_registry.js';
import { appliquerParryLock } from '../PerceptionSystem.js';

function update(enemy, player) {
    enemy.sprite.body.setVelocity(0, 0);
    if (!player) return;
    const def = enemy.def;
    const dx = player.x - enemy.sprite.x;
    const dy = player.y - enemy.sprite.y;
    if (Math.hypot(dx, dy) < (def.rayonAura ?? 220)) {
        appliquerParryLock(enemy.scene, player, 200);
    }
}

registerComportement('parry-lock', { init: null, update });
export default { init: null, update };
