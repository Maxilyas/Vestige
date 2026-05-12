// DETONATOR — Brûleur Lent.
//
// Marche lentement vers le joueur. À proximité (`rayonDetonation`), entre en
// TELEGRAPH (~3s) puis EXPLODE en AOE. Si parry actif pendant TELEGRAPH et
// joueur proche → explosion annulée + RECOVERY 1s + retour à APPROACH.
// L'explosion tue l'ennemi.

import { registerComportement } from './_registry.js';
import { DEPTH } from '../../render/PainterlyRenderer.js';

const ETATS = {
    APPROACH: 'approach', TELEGRAPH: 'telegraph', EXPLODE: 'explode', RECOVERY: 'recovery'
};

function init(enemy) {
    enemy.etat = ETATS.APPROACH;
    enemy.etatFin = 0;
}

function exploser(enemy) {
    const scene = enemy.scene;
    const def = enemy.def;
    const rayon = def.rayonExplosion ?? 110;
    const dgts = def.degatsExplosion ?? 14;

    // FX : onde de choc rouge/orange
    const onde = scene.add.graphics();
    onde.setDepth(DEPTH.EFFETS);
    onde.setBlendMode(Phaser.BlendModes.ADD);
    onde.setPosition(enemy.sprite.x, enemy.sprite.y);
    onde.fillStyle(0xff4020, 0.7);
    onde.fillCircle(0, 0, rayon * 0.4);
    onde.fillStyle(0xffa040, 0.55);
    onde.fillCircle(0, 0, rayon * 0.7);
    onde.fillStyle(0xffff80, 0.4);
    onde.fillCircle(0, 0, rayon);
    scene.tweens.add({
        targets: onde, scale: { from: 0.4, to: 1.4 }, alpha: { from: 1, to: 0 },
        duration: 380, ease: 'Cubic.Out',
        onComplete: () => onde.destroy()
    });
    scene.cameras.main.shake(160, 0.008);

    // Dégâts si joueur dans rayon
    const player = scene.player;
    if (player && !scene.estParryActif?.()) {
        const dx = player.x - enemy.sprite.x;
        const dy = player.y - enemy.sprite.y;
        if (Math.hypot(dx, dy) < rayon) {
            const now = scene.time.now;
            if (now >= (scene.invincibleJusqu ?? 0)) {
                scene.resonance?.prendreDegats?.(dgts);
                scene.invincibleJusqu = now + 700;
                scene.flashJoueur?.(0xff6060);
            }
        }
    }

    // Detruit le halo telegraph (sinon persiste après la mort)
    const halo = enemy.visual?._haloTelegraph;
    if (halo?.active) {
        scene.tweens.killTweensOf(halo);
        halo.destroy();
    }

    // L'ennemi se sacrifie
    enemy.recevoirDegats(enemy.hpMax + 1);
}

function update(enemy, player) {
    const now = enemy.scene.time.now;
    const def = enemy.def;
    const body = enemy.sprite.body;

    switch (enemy.etat) {
        case ETATS.APPROACH: {
            if (!player) { body.setVelocityX(0); return; }
            const dx = player.x - enemy.sprite.x;
            const dy = player.y - enemy.sprite.y;
            const dir = Math.sign(dx) || 1;
            body.setVelocityX(def.vitesse * dir);
            enemy.direction = dir;
            if (Math.hypot(dx, dy) < (def.rayonDetonation ?? 100)) {
                enemy.etat = ETATS.TELEGRAPH;
                enemy.etatFin = now + (def.delaiTelegraph ?? 2000);
                body.setVelocityX(0);
                if (enemy.visual?._declencherTelegraph) {
                    enemy.visual._declencherTelegraph(enemy.scene, def.delaiTelegraph ?? 2000);
                }
                enemy.scene.events.emit('enemy:telegraph', enemy);
            }
            break;
        }
        case ETATS.TELEGRAPH: {
            body.setVelocityX(0);
            // Parry — annule l'explosion si actif + joueur proche
            if (player && enemy.scene.estParryActif?.()) {
                const dxAbs = Math.abs(player.x - enemy.sprite.x);
                if (dxAbs < (def.rayonDetonation ?? 100) * 1.6) {
                    enemy.etat = ETATS.RECOVERY;
                    enemy.etatFin = now + 1000;
                    if (enemy.visual?._annulerTelegraph) enemy.visual._annulerTelegraph(enemy.scene);
                    enemy.scene.parryActifJusqu = 0;
                    enemy.scene.resonance?.regagner?.(enemy.scene.statsEffectives?.parryBonusResonance ?? 4);
                    enemy.scene.afficherMessageFlottant?.('PARRY', '#ffd070');
                    enemy.scene.events.emit('enemy:parried', enemy);
                    return;
                }
            }
            if (now >= enemy.etatFin) {
                enemy.etat = ETATS.EXPLODE;
                exploser(enemy);
            }
            break;
        }
        case ETATS.RECOVERY: {
            body.setVelocityX(0);
            if (now >= enemy.etatFin) enemy.etat = ETATS.APPROACH;
            break;
        }
        case ETATS.EXPLODE: default: {
            body.setVelocityX(0);
            break;
        }
    }
}

registerComportement('detonator', { init, update });
export default { init, update };
