// GROUND-FISSURE — Brisure-Tisseuse.
// Stationnaire ou lent. Périodiquement, fait fissurer le sol sous la
// position courante du joueur — la fissure explose après 1.5s (cf.
// EnvironmentMutators.ajouterTileFissure).

import { registerComportement } from './_registry.js';
import { ajouterTileFissure } from '../EnvironmentMutators.js';

function init(enemy) {
    enemy.prochaineFissure = enemy.scene.time.now + 1500;
}

function update(enemy, player) {
    enemy.sprite.body.setVelocity(0, 0);
    if (!player) return;
    const def = enemy.def;
    const now = enemy.scene.time.now;
    const dx = player.x - enemy.sprite.x;
    const dy = player.y - enemy.sprite.y;
    if (Math.hypot(dx, dy) > (def.rayonAction ?? 400)) return;

    if (now < enemy.prochaineFissure) return;
    enemy.prochaineFissure = now + (def.frequenceFissure ?? 3000);

    const w = def.fissureLargeur ?? 60;
    const h = def.fissureHauteur ?? 12;
    ajouterTileFissure(
        enemy.scene,
        player.x - w / 2,
        player.y + (player.height ?? 36) / 2 - h,
        w, h,
        def.dureeAvantExplosion ?? 1500
    );
}

registerComportement('ground-fissure', { init, update });
export default { init, update };
