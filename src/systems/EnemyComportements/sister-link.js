// SISTER-LINK — Esprit Divisé.
// L'instance "originale" spawn 2 sœurs (taguées `_isSister: true` pour
// éviter le re-spawn). Les 3 partagent un groupId. Quand UNE meurt, les
// 2 autres meurent aussi (suicide en chaîne).

import { registerComportement } from './_registry.js';

function init(enemy) {
    const scene = enemy.scene;
    scene._sisterGroups = scene._sisterGroups ?? {};

    let groupId;
    if (enemy.def._isSister) {
        // Soeur clonée → récupère le groupId du parent
        groupId = enemy.def._parentSisterGroup;
    } else {
        // Originale → crée un nouveau groupe + spawn 2 sœurs après court délai
        groupId = 'sg_' + Math.random().toString(36).slice(2, 7);
        scene.time.delayedCall(50, () => {
            if (enemy.mort) return;
            const defSoeur = {
                ...enemy.def,
                _isSister: true,
                _parentSisterGroup: groupId,
                spawned: true
            };
            for (let i = 0; i < 2; i++) {
                const ox = (i === 0 ? -1 : 1) * 50;
                scene.events.emit('enemy:spawn', enemy, {
                    def: defSoeur,
                    x: enemy.sprite.x + ox,
                    y: enemy.sprite.y
                });
            }
        });
    }

    enemy._sisterGroup = groupId;
    scene._sisterGroups[groupId] = scene._sisterGroups[groupId] ?? [];
    scene._sisterGroups[groupId].push(enemy);

    // Listener mort en chaîne — quand UNE sœur meurt, kill les autres
    const handler = (mort) => {
        if (!mort?._sisterGroup || mort._sisterGroup !== enemy._sisterGroup) return;
        if (mort === enemy) return; // notre propre mort, rien à faire
        // Une autre sœur meurt → on meurt aussi (court délai pour effet)
        if (!enemy.mort) {
            scene.time.delayedCall(80 + Math.random() * 120, () => {
                if (!enemy.mort) enemy.mourir();
            });
        }
    };
    scene.events.on('enemy:dead', handler);
    enemy._sisterDeadHandler = handler;
}

function update(enemy, player) {
    if (!player) return;
    const body = enemy.sprite.body;
    const dx = player.x - enemy.sprite.x;
    const dy = player.y - enemy.sprite.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0 && dist < (enemy.def.rayonDetection ?? 280)) {
        const v = enemy.def.vitesse;
        body.setVelocity((dx / dist) * v, (dy / dist) * v);
        if (Math.abs(dx) > 4) enemy.direction = dx > 0 ? 1 : -1;
    } else {
        body.setVelocity(0, 0);
    }
}

registerComportement('sister-link', { init, update });
export default { init, update };
