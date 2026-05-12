// PHASER — Mirage.
// Traqueur classique mais visuel invisible (alpha 0) tant que le joueur est
// loin. Fade-in progressif quand le joueur s'approche.

import { registerComportement } from './_registry.js';

function update(enemy, player) {
    const body = enemy.sprite.body;
    if (!player) {
        body.setVelocity(0, 0);
        if (enemy.visual?.active) enemy.visual.setAlpha(0);
        return;
    }
    const def = enemy.def;
    const dx = player.x - enemy.sprite.x;
    const dy = player.y - enemy.sprite.y;
    const dist = Math.hypot(dx, dy);

    // Alpha basé sur la distance (fade-in à l'approche)
    const seuilProche = def.distanceReveal ?? 100;
    const seuilLoin = def.distanceFade ?? 220;
    let alphaCible = 0;
    if (dist < seuilProche) alphaCible = 1;
    else if (dist < seuilLoin) alphaCible = 1 - (dist - seuilProche) / (seuilLoin - seuilProche);
    if (enemy.visual?.active) {
        const cur = enemy.visual.alpha ?? 0;
        enemy.visual.setAlpha(cur + (alphaCible - cur) * 0.15);
    }

    // Poursuite quand visible
    if (alphaCible > 0.3 && dist > 0) {
        const v = def.vitesse;
        body.setVelocity((dx / dist) * v, (dy / dist) * v);
        if (Math.abs(dx) > 4) enemy.direction = dx > 0 ? 1 : -1;
    } else {
        body.setVelocity(0, 0);
    }
}

registerComportement('phaser', { init: null, update });
export default { init: null, update };
