// FLOOR-FROSTER — Givre-Tisseur.
// Stationnaire qui gèle périodiquement la tile sous le joueur.

import { registerComportement } from './_registry.js';
import { ajouterTileGele } from '../EnvironmentMutators.js';

function init(enemy) {
    enemy.prochainGel = enemy.scene.time.now + 1200;
}

function update(enemy, player) {
    enemy.sprite.body.setVelocity(0, 0);
    if (!player) return;
    const def = enemy.def;
    const now = enemy.scene.time.now;
    const dx = player.x - enemy.sprite.x;
    const dy = player.y - enemy.sprite.y;
    if (Math.hypot(dx, dy) > (def.rayonAction ?? 360)) return;

    if (now >= enemy.prochainGel) {
        enemy.prochainGel = now + (def.frequenceGel ?? 2000);
        const tw = def.gelLargeur ?? 56;
        const th = def.gelHauteur ?? 8;
        ajouterTileGele(enemy.scene,
            player.x - tw / 2,
            player.y + (player.height ?? 36) / 2 - th,
            tw, th,
            def.gelDuree ?? 3000);
    }
}

registerComportement('floor-froster', { init, update });
export default { init, update };
