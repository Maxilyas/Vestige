// REACTIVE-SHOOTER — Anti-Bond.
// Tireur qui ne tire QUE quand le joueur est en l'air (saut/chute).

import { registerComportement } from './_registry.js';

function init(enemy) {
    enemy.prochainTir = enemy.scene.time.now + 600;
}

function update(enemy, player) {
    const def = enemy.def;
    const body = enemy.sprite.body;
    body.setVelocity(0, 0);
    if (!def.gravite) body.setVelocityY(0);
    if (!player) return null;

    const dx = player.x - enemy.sprite.x;
    const dy = player.y - enemy.sprite.y;
    const dist = Math.hypot(dx, dy);
    if (Math.abs(dx) > 4) enemy.direction = dx > 0 ? 1 : -1;

    const now = enemy.scene.time.now;
    // Joueur en l'air : pas auSol (body.blocked.down false)
    const enLAir = !(player.body?.blocked.down || player.body?.touching.down);
    if (dist < def.rayonDetection && enLAir && now >= enemy.prochainTir) {
        enemy.prochainTir = now + (def.delaiTir ?? 800);
        return {
            tirer: {
                x: enemy.sprite.x, y: enemy.sprite.y,
                cibleX: player.x, cibleY: player.y,
                vitesse: def.vitesseProjectile ?? 260,
                portee: def.portéeProjectile ?? 420,
                degats: def.degatsProjectile ?? 8,
                couleur: def.palette?.iris ?? 0xc080ff,
                halo: def.palette?.halo ?? 0xc080ff,
                homing: false
            }
        };
    }
    return null;
}

registerComportement('reactive-shooter', { init, update });
export default { init, update };
