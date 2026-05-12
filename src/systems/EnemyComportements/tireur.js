// Comportement TIREUR — stationnaire (ou kite lent) + tirs périodiques.
// Tire un projectile vers la position du joueur quand celui-ci est dans
// rayonDetection ET que le cooldown est écoulé. Le projectile est instancié
// par Enemy.js (qui a la référence à la scène) via le retour { tirer: {...} }.

function init(enemy) {
    enemy.prochainTir = enemy.scene.time.now + 600 + Math.random() * 600;
}

function update(enemy, player) {
    const def = enemy.def;
    const body = enemy.sprite.body;
    const now = enemy.scene.time.now;

    if (!player) return null;
    const dx = player.x - enemy.sprite.x;
    const dy = player.y - enemy.sprite.y;
    const dist = Math.hypot(dx, dy);

    if (Math.abs(dx) > 4) enemy.direction = dx > 0 ? 1 : -1;

    // Kite lent HORIZONTAL uniquement
    if (def.vitesse > 0 && dist < def.rayonDetection * 0.5 && Math.abs(dx) > 4) {
        body.setVelocityX(-Math.sign(dx) * def.vitesse);
    } else {
        body.setVelocityX(0);
    }
    if (!def.gravite) body.setVelocityY(0);

    if (dist < def.rayonDetection && now >= enemy.prochainTir) {
        enemy.prochainTir = now + def.delaiTir;
        return {
            tirer: {
                x: enemy.sprite.x,
                y: enemy.sprite.y,
                cibleX: player.x,
                cibleY: player.y,
                vitesse: def.vitesseProjectile,
                portee: def.portéeProjectile,
                degats: def.degatsProjectile,
                couleur: def.palette?.iris ?? 0xff8040,
                halo: def.palette?.halo ?? 0xffd070,
                homing: false
            }
        };
    }
    return null;
}

export default { init, update };
