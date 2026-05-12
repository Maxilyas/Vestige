// DIVER — Vautour de Débris.
//
// Vol horizontal au-dessus du sol (cruise), surveille la position du joueur.
// Quand le joueur passe en-dessous de lui, déclenche un télégraphe de
// plongée puis un dive à 45° vers le sol.
//
// Phases :
//   CRUISE     : vol horizontal au-dessus de xInit ± portée
//   TELEGRAPH  : pause + visuel (œil rouge, ailes levées) ~500ms
//   DIVE       : descente rapide à 45° sur la position cible
//   RETURN     : remonte vers altitude initiale après impact ou sol

import { registerComportement } from './_registry.js';

const ETATS = {
    CRUISE: 'cruise', TELEGRAPH: 'telegraph', DIVE: 'dive', RETURN: 'return'
};

function init(enemy) {
    enemy.etat = ETATS.CRUISE;
    enemy.etatFin = 0;
    enemy.yCruise = enemy.yInit;
    enemy.diveCible = { x: 0, y: 0 };
}

function update(enemy, player) {
    const body = enemy.sprite.body;
    const def = enemy.def;
    const now = enemy.scene.time.now;

    switch (enemy.etat) {
        case ETATS.CRUISE: {
            // Patrouille horizontale au plafond
            body.setVelocityX(def.vitesse * enemy.direction);
            body.setVelocityY(0);
            const portee = def.porteePatrouille ?? 200;
            if (enemy.sprite.x > enemy.xInit + portee) enemy.direction = -1;
            else if (enemy.sprite.x < enemy.xInit - portee) enemy.direction = 1;
            // Lock altitude
            enemy.sprite.y += (enemy.yCruise - enemy.sprite.y) * 0.1;
            // Détection joueur sous lui
            if (player) {
                const dxAbs = Math.abs(player.x - enemy.sprite.x);
                const dy = player.y - enemy.sprite.y;
                if (dxAbs < 50 && dy > 60 && dy < (def.rayonDive ?? 280)) {
                    enemy.etat = ETATS.TELEGRAPH;
                    enemy.etatFin = now + (def.delaiTelegraphDive ?? 500);
                    enemy.diveCible.x = player.x;
                    enemy.diveCible.y = player.y;
                    body.setVelocity(0, 0);
                    enemy.scene.events.emit('enemy:telegraph', enemy);
                }
            }
            break;
        }
        case ETATS.TELEGRAPH: {
            body.setVelocity(0, 0);
            if (now >= enemy.etatFin) {
                enemy.etat = ETATS.DIVE;
                enemy.etatFin = now + (def.delaiDive ?? 700);
                const dx = enemy.diveCible.x - enemy.sprite.x;
                const dy = enemy.diveCible.y - enemy.sprite.y;
                const dist = Math.hypot(dx, dy) || 1;
                const v = def.vitesseDive ?? 360;
                body.setVelocity((dx / dist) * v, (dy / dist) * v);
                enemy.scene.events.emit('enemy:charge', enemy);
            }
            break;
        }
        case ETATS.DIVE: {
            // Continue trajectoire jusqu'à sol ou timeout
            if (body.blocked.down || body.blocked.left || body.blocked.right || now >= enemy.etatFin) {
                enemy.etat = ETATS.RETURN;
                enemy.etatFin = now + 600;
                body.setVelocity(0, -120);
            }
            break;
        }
        case ETATS.RETURN: {
            // Remonte vers yCruise
            body.setVelocityX(0);
            const dyc = enemy.yCruise - enemy.sprite.y;
            if (Math.abs(dyc) < 12 || now >= enemy.etatFin) {
                enemy.etat = ETATS.CRUISE;
                body.setVelocityY(0);
            } else {
                body.setVelocityY(-Math.sign(dyc) * 120);
            }
            break;
        }
    }
}

registerComportement('diver', { init, update });
export default { init, update };
