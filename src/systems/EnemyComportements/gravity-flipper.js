// GRAVITY-FLIPPER — Inverseur de Gravité.
// Stationnaire passif. Si joueur dans aura, applique flag d'inversion gravité
// (refresh chaque frame d'overlap). Le flag est lu par GameScene qui modifie
// body.gravity.y du joueur.

import { registerComportement } from './_registry.js';
import { appliquerGraviteInverse } from '../PerceptionSystem.js';

function update(enemy, player) {
    enemy.sprite.body.setVelocity(0, 0);
    if (!player) return;
    const def = enemy.def;
    const dx = player.x - enemy.sprite.x;
    const dy = player.y - enemy.sprite.y;
    if (Math.hypot(dx, dy) < (def.rayonAura ?? 200)) {
        appliquerGraviteInverse(enemy.scene, player, def.dureeInversion ?? 2000);
    }
}

registerComportement('gravity-flipper', { init: null, update });
export default { init: null, update };
