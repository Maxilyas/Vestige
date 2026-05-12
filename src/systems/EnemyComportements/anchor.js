// ANCHOR — Racine Étouffante.
//
// Stationnaire au sol. Quand le joueur entre dans `rayonAttraction`, applique
// une force de traction sur lui (modif directe de body.velocity). L'ennemi
// elle-même ne bouge pas.
//
// La force diminue avec la distance (plus fort proche → ralentit l'évasion).

import { registerComportement } from './_registry.js';

function update(enemy, player) {
    const body = enemy.sprite.body;
    body.setVelocity(0, 0);
    if (!player?.body) return;
    const def = enemy.def;
    const dx = enemy.sprite.x - player.x;
    const dy = enemy.sprite.y - player.y;
    const dist = Math.hypot(dx, dy);
    const rayon = def.rayonAttraction ?? 200;
    if (dist > 0 && dist < rayon) {
        const force = def.forceAttraction ?? 110;
        // Force inversement proportionnelle à la distance (max à mi-rayon)
        const intensite = Math.min(1, (rayon - dist) / rayon * 1.4);
        const fx = (dx / dist) * force * intensite;
        const fy = (dy / dist) * force * intensite;
        // On AJOUTE à la velocity du joueur (combat-friendly, n'écrase pas le saut)
        player.body.velocity.x += fx * 0.02 * 60; // normalisé pour 60 fps
        player.body.velocity.y += fy * 0.02 * 60;
        if (Math.abs(dx) > 4) enemy.direction = -Math.sign(dx);
    }
}

registerComportement('anchor', { init: null, update });
export default { init: null, update };
