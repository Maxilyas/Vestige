// MIRROR-CLONE — Éclat-Multiplicateur.
// Traqueur classique. À chaque hit reçu, spawn un clone illusoire (visuel
// seulement, sans physique) à proximité — confond le joueur.

import { registerComportement } from './_registry.js';
import { creerCloneIllusoire } from '../CloneIllusionSystem.js';

function init(enemy) {
    // Wrap recevoirDegats pour intercepter les hits
    const orig = enemy.recevoirDegats.bind(enemy);
    enemy.recevoirDegats = (montant) => {
        const hpAvant = enemy.hp;
        orig(montant);
        if (!enemy.mort && enemy.hp < hpAvant) {
            const offset = 40 + Math.random() * 40;
            const side = Math.random() < 0.5 ? -1 : 1;
            creerCloneIllusoire(enemy.scene, enemy.def,
                enemy.sprite.x + side * offset, enemy.sprite.y,
                3000);
        }
    };
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

registerComportement('mirror-clone', { init, update });
export default { init, update };
