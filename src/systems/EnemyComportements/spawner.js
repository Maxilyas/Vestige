// SPAWNER — Tombe Éclatée.
//
// Passive et stationnaire. Quand le joueur est dans `rayonProximite`, ponde
// une mini-créature (clone réduit d'un ennemi de base) toutes les `delaiPonte`
// ms, jusqu'à `capEnfants` enfants vivants.
//
// Le spawn est délégué à GameScene via l'event `enemy:spawn` que Enemy.js
// relaie (cf. pattern Tireur avec `enemy:tir`).

import { registerComportement } from './_registry.js';
import { peutSpawner, defMini } from '../SpawnerSystem.js';
import { ENEMIES } from '../../data/enemies/index.js';

function init(enemy) {
    enemy.prochainPonte = enemy.scene.time.now + 1500;
}

function update(enemy, player) {
    const body = enemy.sprite.body;
    body.setVelocity(0, 0);
    if (!player) return null;
    const def = enemy.def;
    const now = enemy.scene.time.now;

    const dx = player.x - enemy.sprite.x;
    const dy = player.y - enemy.sprite.y;
    if (Math.hypot(dx, dy) > (def.rayonProximite ?? 280)) return null;

    if (now < enemy.prochainPonte) return null;
    if (!peutSpawner(enemy, def.capEnfants ?? 2)) {
        enemy.prochainPonte = now + 800; // re-check soon
        return null;
    }

    enemy.prochainPonte = now + (def.delaiPonte ?? 4000);

    // Spawn d'un mini-spectre (base : spectre_cendre du biome)
    const baseDef = ENEMIES[def.spawnBaseId ?? 'spectre_cendre'];
    if (!baseDef) return null;
    const spawnDef = defMini(baseDef);
    const xOffset = Math.sign(dx || 1) * 14;
    return {
        spawn: {
            def: spawnDef,
            x: enemy.sprite.x + xOffset,
            y: enemy.sprite.y - 8
        }
    };
}

registerComportement('spawner', { init, update });
export default { init, update };
