// ORBITAL — Anneau de Glace.
// Stationnaire avec 2 éclats orbitant. Les éclats infligent dégâts au contact
// du joueur (check d'overlap manuel chaque frame).

import { registerComportement } from './_registry.js';
import { DEPTH } from '../../render/PainterlyRenderer.js';

function init(enemy) {
    enemy.orbitalsPhase = 0;
    enemy.orbitals = []; // {graphics, dx, dy}
    // Création des 2 éclats orbitaux (visuels uniquement, overlap check manuel)
    const c = enemy.def.palette?.accent ?? 0xa0d0ff;
    for (let i = 0; i < 2; i++) {
        const g = enemy.scene.add.graphics();
        g.setDepth(DEPTH.ENTITES + 1);
        g.setBlendMode(Phaser.BlendModes.ADD);
        g.fillStyle(c, 0.85);
        g.fillCircle(0, 0, 6);
        g.fillStyle(0xffffff, 0.95);
        g.fillCircle(0, 0, 2.5);
        enemy.orbitals.push({ graphics: g, angle: i * Math.PI });
    }
    enemy.dernierContactOrbital = 0;
}

function update(enemy, player) {
    enemy.sprite.body.setVelocity(0, 0);
    const def = enemy.def;
    const scene = enemy.scene;
    const now = scene.time.now;
    const rayon = def.rayonOrbital ?? 38;
    const vitesseRot = def.vitesseOrbitale ?? 0.06;

    enemy.orbitalsPhase += vitesseRot;
    for (let i = 0; i < enemy.orbitals.length; i++) {
        const o = enemy.orbitals[i];
        const a = enemy.orbitalsPhase + (i / enemy.orbitals.length) * Math.PI * 2;
        const ox = Math.cos(a) * rayon;
        const oy = Math.sin(a) * rayon * 0.7;
        const wx = enemy.sprite.x + ox;
        const wy = enemy.sprite.y + oy;
        o.graphics.setPosition(wx, wy);
        // Overlap avec joueur (rayon 10)
        if (player && now - enemy.dernierContactOrbital > 600) {
            const pdx = wx - player.x;
            const pdy = wy - player.y;
            if (Math.hypot(pdx, pdy) < 14) {
                if (now >= (scene.invincibleJusqu ?? 0)) {
                    scene.resonance?.prendreDegats?.(def.degatsOrbital ?? 8);
                    scene.invincibleJusqu = now + 500;
                    scene.flashJoueur?.(0xa0d0ff);
                    enemy.dernierContactOrbital = now;
                }
            }
        }
    }

    // Clean au death — bind once
    if (!enemy._orbitalsCleanRegistered) {
        enemy._orbitalsCleanRegistered = true;
        scene.events.once('shutdown', () => enemy.orbitals?.forEach(o => o.graphics?.destroy()));
        // Quand l'ennemi meurt, détruit les orbitaux
        const origMourir = enemy.mourir.bind(enemy);
        enemy.mourir = () => {
            origMourir();
            enemy.orbitals?.forEach(o => {
                if (o.graphics?.active) {
                    scene.tweens.add({
                        targets: o.graphics, alpha: 0, scale: 0.3,
                        duration: 200, onComplete: () => o.graphics.destroy()
                    });
                }
            });
        };
    }
}

registerComportement('orbital', { init, update });
export default { init, update };
