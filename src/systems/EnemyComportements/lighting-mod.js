// LIGHTING-MOD — Chandelier Vivant.
//
// Stationnaire et passif (pas d'attaque). Sa mort déclenche un assombrissement
// de tous les autres ennemis vivants de la salle (alpha 0.4 pendant 5s).
// Stratégie : tuer le chandelier en dernier pour éviter la perte de visibilité.

import { registerComportement } from './_registry.js';

const DUREE_OBSCURCISSEMENT = 5000; // ms

function init(enemy) {
    // Écoute la mort de SON instance via l'event scène
    const onDead = (mort) => {
        if (mort !== enemy) return;
        enemy.scene.events.off('enemy:dead', onDead);
        // Applique alpha 0.4 + tween retour à 1 après 5s sur les autres ennemis vivants
        const scene = enemy.scene;
        const autres = (scene.enemies ?? []).filter(e => e !== enemy && !e.mort && e.visual?.active);
        for (const e of autres) {
            const v = e.visual;
            scene.tweens.add({
                targets: v, alpha: 0.4,
                duration: 400, ease: 'Cubic.Out'
            });
            scene.tweens.add({
                targets: v, alpha: 1,
                delay: DUREE_OBSCURCISSEMENT,
                duration: 600, ease: 'Cubic.In'
            });
        }
        // Petit screen-flash (la lumière s'éteint)
        const overlay = scene.add.graphics();
        overlay.setDepth(250);
        overlay.setScrollFactor(0);
        overlay.fillStyle(0x000000, 0.4);
        overlay.fillRect(0, 0, scene.scale.width, scene.scale.height);
        overlay.alpha = 0;
        scene.tweens.add({
            targets: overlay, alpha: 1,
            duration: 200, yoyo: true,
            hold: 200,
            onComplete: () => overlay.destroy()
        });
    };
    enemy.scene.events.on('enemy:dead', onDead);
}

function update(enemy) {
    // Stationnaire passif
    enemy.sprite.body.setVelocity(0, 0);
}

registerComportement('lighting-mod', { init, update });
export default { init, update };
