// UNSTOPPABLE-CHARGER — Anti-Parry.
// Comportement identique au Chargeur classique (state machine ROVE → TELEGRAPH
// → CHARGE → RECOVERY) mais le def.parryImmune = true → GameScene.contactEnnemi
// ignore le parry et inflige des dgts normaux. Le joueur doit ESQUIVER au lieu
// de parry.

import { registerComportement } from './_registry.js';

const ETATS = { ROVE: 'rove', TELEGRAPH: 'telegraph', CHARGE: 'charge', RECOVERY: 'recovery' };

function init(enemy) {
    enemy.etat = ETATS.ROVE;
    enemy.etatFin = 0;
    enemy.chargeDirX = 1;
}

function update(enemy, player) {
    const now = enemy.scene.time.now;
    const def = enemy.def;
    const body = enemy.sprite.body;

    switch (enemy.etat) {
        case ETATS.ROVE: {
            body.setVelocityX(def.vitesseDetection * enemy.direction);
            if (!def.gravite) body.setVelocityY(0);
            const portee = def.porteePatrouille ?? 110;
            if (enemy.sprite.x > enemy.xInit + portee || body.blocked.right) enemy.direction = -1;
            else if (enemy.sprite.x < enemy.xInit - portee || body.blocked.left) enemy.direction = 1;
            if (player) {
                const dx = player.x - enemy.sprite.x;
                const dy = player.y - enemy.sprite.y;
                if (Math.hypot(dx, dy) < def.rayonDetection) {
                    enemy.etat = ETATS.TELEGRAPH;
                    enemy.etatFin = now + def.delaiTelegraph;
                    enemy.chargeDirX = dx > 0 ? 1 : -1;
                    enemy.direction = enemy.chargeDirX;
                    enemy.scene.events.emit('enemy:telegraph', enemy);
                }
            }
            break;
        }
        case ETATS.TELEGRAPH: {
            body.setVelocity(0, 0);
            if (now >= enemy.etatFin) {
                enemy.etat = ETATS.CHARGE;
                enemy.etatFin = now + def.delaiCharge;
                enemy.scene.events.emit('enemy:charge', enemy);
            }
            break;
        }
        case ETATS.CHARGE: {
            body.setVelocityX(def.vitesse * enemy.chargeDirX);
            if (!def.gravite) body.setVelocityY(0);
            if ((enemy.chargeDirX > 0 && body.blocked.right) ||
                (enemy.chargeDirX < 0 && body.blocked.left) ||
                now >= enemy.etatFin) {
                enemy.etat = ETATS.RECOVERY;
                enemy.etatFin = now + def.delaiRecuperation;
                body.setVelocityX(0);
            }
            break;
        }
        case ETATS.RECOVERY: {
            body.setVelocity(0, 0);
            if (now >= enemy.etatFin) enemy.etat = ETATS.ROVE;
            break;
        }
    }
}

registerComportement('unstoppable-charger', { init, update });
export default { init, update };
