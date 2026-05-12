// CLOUD — Champignon-Spore.
//
// Stationnaire au sol. Émet périodiquement un nuage de spores à proximité
// (cf. render/PerceptionCloud.js). Le nuage est purement visuel — pas de
// dégâts au passage, mais réduit la lisibilité de la zone temporairement.

import { registerComportement } from './_registry.js';
import { creerNuageSpore } from '../../render/PerceptionCloud.js';

function init(enemy) {
    enemy.prochaineSpore = enemy.scene.time.now + 1500 + Math.random() * 1500;
}

function update(enemy, player) {
    const body = enemy.sprite.body;
    body.setVelocity(0, 0);
    if (!player) return;
    const def = enemy.def;
    const now = enemy.scene.time.now;

    const dx = player.x - enemy.sprite.x;
    const dy = player.y - enemy.sprite.y;
    if (Math.hypot(dx, dy) > (def.rayonEmission ?? 320)) return;

    if (now < enemy.prochaineSpore) return;
    enemy.prochaineSpore = now + (def.frequenceSpore ?? 5000);

    // Émet un nuage centré sur le joueur (mais visuel près du champignon)
    const cx = enemy.sprite.x + Math.sign(dx || 1) * 40;
    const cy = enemy.sprite.y - 10;
    creerNuageSpore(enemy.scene, cx, cy, def.rayonNuage ?? 90, def.dureeNuage ?? 3000, {
        couleur: def.palette?.spore ?? 0x2a1a3a,
        intensite: 0.55
    });
}

registerComportement('cloud', { init, update });
export default { init, update };
