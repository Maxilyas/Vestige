// CONTROL-INVERTER — Polariseur.
// Stationnaire passif. Si joueur dans aura, applique flag d'inversion
// contrôles gauche/droite (1s persistant, refresh à chaque frame d'overlap).

import { registerComportement } from './_registry.js';
import { appliquerControleInverse } from '../PerceptionSystem.js';

function update(enemy, player) {
    enemy.sprite.body.setVelocity(0, 0);
    if (!player) return;
    const def = enemy.def;
    const dx = player.x - enemy.sprite.x;
    const dy = player.y - enemy.sprite.y;
    if (Math.hypot(dx, dy) < (def.rayonAura ?? 200)) {
        appliquerControleInverse(enemy.scene, player, def.dureeInversion ?? 1000);
    }
}

registerComportement('control-inverter', { init: null, update });
export default { init: null, update };
