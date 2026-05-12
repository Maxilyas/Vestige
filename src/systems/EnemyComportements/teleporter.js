// TELEPORTER — Trou de Mémoire.
// Stationnaire. Si joueur à proximité ET cooldown écoulé, téléporte le joueur
// à un spot aléatoire de la salle. FX dramatique au TP.

import { registerComportement } from './_registry.js';
import { DEPTH } from '../../render/PainterlyRenderer.js';

function init(enemy) {
    enemy.prochainTeleport = enemy.scene.time.now + 2000;
}

function update(enemy, player) {
    enemy.sprite.body.setVelocity(0, 0);
    if (!player) return;
    const def = enemy.def;
    const scene = enemy.scene;
    const now = scene.time.now;

    const dx = player.x - enemy.sprite.x;
    const dy = player.y - enemy.sprite.y;
    if (Math.hypot(dx, dy) > (def.rayonTeleport ?? 140)) return;
    if (now < enemy.prochainTeleport) return;
    enemy.prochainTeleport = now + (def.cooldownTeleport ?? 4500);

    // Position cible aléatoire dans la salle
    const dims = scene.salle?.dims ?? { largeur: 1600, hauteur: 720 };
    const targetX = 100 + Math.random() * (dims.largeur - 200);
    const targetY = 100 + Math.random() * (dims.hauteur - 200);

    // FX implosion au départ
    const flashStart = scene.add.graphics();
    flashStart.setDepth(DEPTH.EFFETS ?? 60);
    flashStart.setBlendMode(Phaser.BlendModes.ADD);
    flashStart.setPosition(player.x, player.y);
    flashStart.fillStyle(0xc080ff, 0.85);
    flashStart.fillCircle(0, 0, 28);
    scene.tweens.add({
        targets: flashStart, scale: { from: 1, to: 0.2 }, alpha: { from: 1, to: 0 },
        duration: 250, ease: 'Cubic.In',
        onComplete: () => flashStart.destroy()
    });

    // Déplacement effectif (après court délai pour la lecture du flash)
    scene.time.delayedCall(220, () => {
        if (!player.body) return;
        player.x = targetX;
        player.y = targetY;
        player.body.reset(targetX, targetY);

        // FX explosion à l'arrivée
        const flashEnd = scene.add.graphics();
        flashEnd.setDepth(DEPTH.EFFETS ?? 60);
        flashEnd.setBlendMode(Phaser.BlendModes.ADD);
        flashEnd.setPosition(targetX, targetY);
        flashEnd.fillStyle(0xc080ff, 0.85);
        flashEnd.fillCircle(0, 0, 8);
        scene.tweens.add({
            targets: flashEnd, scale: { from: 0.2, to: 2 }, alpha: { from: 1, to: 0 },
            duration: 380, ease: 'Cubic.Out',
            onComplete: () => flashEnd.destroy()
        });
        scene.afficherMessageFlottant?.('TÉLÉPORTÉ', '#c080ff');
    });
}

registerComportement('teleporter', { init, update });
export default { init, update };
