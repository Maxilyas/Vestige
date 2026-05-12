// Comportement TRAQUEUR — vol + poursuite du joueur dans rayonDetection.

function update(enemy, player) {
    if (!player) return;
    const body = enemy.sprite.body;
    const dx = player.x - enemy.sprite.x;
    const dy = player.y - enemy.sprite.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0 && dist < enemy.def.rayonDetection) {
        const v = enemy.def.vitesse;
        body.setVelocity((dx / dist) * v, (dy / dist) * v);
        if (Math.abs(dx) > 4) enemy.direction = dx > 0 ? 1 : -1;
    } else {
        body.setVelocity(0, 0);
    }
}

export default { init: null, update };
