// TRAIL-TILE — Mousse Glissante.
//
// Crawler lent au sol qui dépose une tile glissante tous les
// `frequenceTrail` ms. La tile rend le sol glissant pour le joueur via
// EnvironmentMutators.

import { registerComportement } from './_registry.js';
import { ajouterTileGlissant } from '../EnvironmentMutators.js';

function init(enemy) {
    enemy.prochainTrail = enemy.scene.time.now + 400;
}

function update(enemy, player) {
    const body = enemy.sprite.body;
    const def = enemy.def;
    const now = enemy.scene.time.now;

    // Crawl simple (patrouille comme Veilleur)
    body.setVelocityX(def.vitesse * enemy.direction);
    const portee = def.porteePatrouille ?? 100;
    if (enemy.sprite.x > enemy.xInit + portee || body.blocked.right) enemy.direction = -1;
    else if (enemy.sprite.x < enemy.xInit - portee || body.blocked.left) enemy.direction = 1;

    // Dépose une tile glissante derrière lui périodiquement
    if (now >= enemy.prochainTrail) {
        const tw = def.trailLargeur ?? 50;
        const th = def.trailHauteur ?? 8;
        const xTile = enemy.sprite.x - (tw / 2);
        const yTile = enemy.sprite.y + (def.hauteur / 2) - th;
        ajouterTileGlissant(enemy.scene, xTile, yTile, tw, th, def.trailDuree ?? 4000);
        enemy.prochainTrail = now + (def.frequenceTrail ?? 800);
    }
}

registerComportement('trail-tile', { init, update });
export default { init, update };
