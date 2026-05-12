// Comportement VEILLEUR — patrouille courte autour du point d'init.

function update(enemy) {
    const body = enemy.sprite.body;
    body.setVelocityX(enemy.def.vitesse * enemy.direction);
    const portee = enemy.def.porteePatrouille ?? 90;
    if (enemy.sprite.x > enemy.xInit + portee || body.blocked.right) enemy.direction = -1;
    else if (enemy.sprite.x < enemy.xInit - portee || body.blocked.left) enemy.direction = 1;
}

export default { init: null, update };
