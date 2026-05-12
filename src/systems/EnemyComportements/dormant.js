// DORMANT — Statue Éveillée.
//
// État inerte (looks like decor) jusqu'à ce que le joueur entre dans
// `rayonReveil`. Puis transition vers un comportement Chargeur basique.
//
// Phases :
//   DORMANT  : immobile, visuel "endormi"
//   REVEIL   : courte phase d'activation visuelle (~400 ms)
//   ROVE     : rôde + détecte joueur
//   TELEGRAPH : pause + lueur
//   CHARGE   : sprint
//   RECOVERY : étourdi puis ROVE

import { registerComportement } from './_registry.js';

const ETATS = {
    DORMANT: 'dormant',
    REVEIL: 'reveil',
    ROVE: 'rove',
    TELEGRAPH: 'telegraph',
    CHARGE: 'charge',
    RECOVERY: 'recovery'
};

function init(enemy) {
    enemy.etat = ETATS.DORMANT;
    enemy.etatFin = 0;
    enemy.chargeDirX = 1;
}

function update(enemy, player) {
    const now = enemy.scene.time.now;
    const def = enemy.def;
    const body = enemy.sprite.body;

    switch (enemy.etat) {
        case ETATS.DORMANT: {
            body.setVelocityX(0);
            if (!player) return;
            const dx = player.x - enemy.sprite.x;
            const dy = player.y - enemy.sprite.y;
            if (Math.hypot(dx, dy) < (def.rayonReveil ?? 180)) {
                enemy.etat = ETATS.REVEIL;
                enemy.etatFin = now + 400;
                if (enemy.visual?._reveiller) enemy.visual._reveiller(enemy.scene);
                enemy.scene.events.emit('enemy:reveil', enemy);
            }
            break;
        }
        case ETATS.REVEIL: {
            body.setVelocityX(0);
            if (now >= enemy.etatFin) enemy.etat = ETATS.ROVE;
            break;
        }
        case ETATS.ROVE: {
            body.setVelocityX(def.vitesseDetection * enemy.direction);
            const portee = def.porteePatrouille ?? 100;
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

registerComportement('dormant', { init, update });
export default { init, update };
