// WALL-BUILDER — Tisseur d'Embrasement.
//
// Stationnaire ou kite léger. Périodiquement, érige un mur de feu temporaire
// (DPS gate) entre lui et le joueur — le joueur peut traverser au prix de
// dégâts forfaitaires (4 par tick toutes les 600ms).

import { registerComportement } from './_registry.js';
import { ajouterMurFeu } from '../EnvironmentMutators.js';

function init(enemy) {
    enemy.prochainMur = enemy.scene.time.now + 1500 + Math.random() * 1500;
}

function update(enemy, player) {
    const body = enemy.sprite.body;
    body.setVelocityX(0);
    if (!enemy.def.gravite) body.setVelocityY(0);
    if (!player) return;
    const def = enemy.def;
    const now = enemy.scene.time.now;

    const dx = player.x - enemy.sprite.x;
    if (Math.abs(dx) > 4) enemy.direction = dx > 0 ? 1 : -1;
    if (Math.hypot(dx, player.y - enemy.sprite.y) > (def.rayonDetection ?? 380)) return;

    if (now < enemy.prochainMur) return;
    enemy.prochainMur = now + (def.delaiMur ?? 4200);

    // Mur érigé à mi-chemin entre Tisseur et joueur (axe X), centré sur la
    // hauteur du joueur (axe Y) pour que le mur soit toujours dans son niveau
    // de marche — le Tisseur peut être sur une plateforme différente.
    const xMur = enemy.sprite.x + dx * 0.5;
    const wMur = def.murLargeur ?? 24;
    const hMur = def.murHauteur ?? 120;
    const yMur = player.y - hMur / 2;
    ajouterMurFeu(enemy.scene, xMur - wMur / 2, yMur, wMur, hMur, def.dureeMur ?? 3500);
}

registerComportement('wall-builder', { init, update });
export default { init, update };
