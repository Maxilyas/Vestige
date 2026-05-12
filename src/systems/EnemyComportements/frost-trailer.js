// FROST-TRAILER — Soupir Glacial.
//
// Variante "glace" de la Mousse Glissante : crawler froid (anti-thème dans
// le biome feu Halls Cendrés) qui dépose des tiles `gele` (visuellement
// bleu glace) avec le même effet de friction réduite.

import { registerComportement } from './_registry.js';
import { ajouterTileGele } from '../EnvironmentMutators.js';

function init(enemy) {
    enemy.prochainTrail = enemy.scene.time.now + 500;
}

function update(enemy) {
    const body = enemy.sprite.body;
    const def = enemy.def;
    const now = enemy.scene.time.now;

    body.setVelocityX(def.vitesse * enemy.direction);
    const portee = def.porteePatrouille ?? 120;
    if (enemy.sprite.x > enemy.xInit + portee || body.blocked.right) enemy.direction = -1;
    else if (enemy.sprite.x < enemy.xInit - portee || body.blocked.left) enemy.direction = 1;

    if (now >= enemy.prochainTrail) {
        const tw = def.trailLargeur ?? 56;
        const th = def.trailHauteur ?? 8;
        const xTile = enemy.sprite.x - (tw / 2);
        const yTile = enemy.sprite.y + (def.hauteur / 2) - th;
        ajouterTileGele(enemy.scene, xTile, yTile, tw, th, def.trailDuree ?? 4500);
        enemy.prochainTrail = now + (def.frequenceTrail ?? 900);
    }
}

registerComportement('frost-trailer', { init, update });
export default { init, update };
