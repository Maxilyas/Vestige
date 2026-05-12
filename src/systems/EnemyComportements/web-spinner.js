// WEB-SPINNER — Cendre-Tisseuse.
//
// Tireur spécial dont le projectile (`type: 'web'`) immobilise le joueur 1s au
// sol à l'impact (le joueur peut toujours attaquer/parry). Cooldown plus long
// que les Tireurs standards car l'effet est puissant.

import { registerComportement } from './_registry.js';

function init(enemy) {
    enemy.prochainTir = enemy.scene.time.now + 800 + Math.random() * 800;
}

/**
 * Effet appliqué au joueur quand le projectile web touche : pose un flag
 * `_immobiliseJusqu` lu par GameScene dans la boucle de mouvement.
 */
function effetWeb(scene, player) {
    player._immobiliseJusqu = scene.time.now + 1000;
    // FX visuel : voile de cendre sur le joueur
    const voile = scene.add.graphics();
    voile.setDepth((player.depth ?? 50) + 1);
    voile.fillStyle(0x806060, 0.45);
    voile.fillCircle(player.x, player.y, 26);
    voile.lineStyle(1.5, 0xa08080, 0.7);
    for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        voile.beginPath();
        voile.moveTo(player.x, player.y);
        voile.lineTo(player.x + Math.cos(a) * 22, player.y + Math.sin(a) * 22);
        voile.strokePath();
    }
    scene.tweens.add({
        targets: voile, alpha: 0,
        duration: 1000, ease: 'Cubic.In',
        onComplete: () => voile.destroy()
    });
    scene.afficherMessageFlottant?.('IMMOBILISÉ', '#a08060');
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
    body.setVelocityX(0);
    if (!def.gravite) body.setVelocityY(0);

    if (dist < def.rayonDetection && now >= enemy.prochainTir) {
        enemy.prochainTir = now + (def.delaiTir ?? 2400);
        return {
            tirer: {
                x: enemy.sprite.x,
                y: enemy.sprite.y,
                cibleX: player.x,
                cibleY: player.y,
                vitesse: def.vitesseProjectile ?? 180,
                portee: def.portéeProjectile ?? 400,
                degats: def.degatsProjectile ?? 4,
                couleur: def.palette?.iris ?? 0xc8b890,
                halo: def.palette?.halo ?? 0xe8d8b0,
                homing: false,
                effetImpact: effetWeb
            }
        };
    }
    return null;
}

registerComportement('web-spinner', { init, update });
export default { init, update };
