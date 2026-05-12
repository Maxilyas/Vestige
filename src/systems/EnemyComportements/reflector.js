// REFLECTOR — Ardent Miroir.
//
// Stationnaire. Détecte chaque frame les projectiles dans son rayon et
// INVERSE leur vélocité — le projectile repart vers son tireur. Le projectile
// réfléchi peut tuer son tireur original ou tout autre ennemi qu'il touche.
//
// Limitation Phase 3c : le projectile réfléchi peut aussi toucher le joueur
// au retour (le contact projectile-joueur reste actif). C'est volontaire — le
// joueur doit timer ses passages quand un Miroir traite des projectiles.

import { registerComportement } from './_registry.js';
import { DEPTH } from '../../render/PainterlyRenderer.js';

function update(enemy) {
    const scene = enemy.scene;
    enemy.sprite.body.setVelocity(0, 0);

    const projs = scene.projectiles ?? [];
    const rayon = enemy.def.rayonReflexion ?? 50;
    const rayonSq = rayon * rayon;

    for (const p of projs) {
        if (!p?.sprite?.active || p.detruit) continue;

        // Réflexion à l'entrée dans le rayon
        if (!p._estReflechi) {
            const dx = enemy.sprite.x - p.sprite.x;
            const dy = enemy.sprite.y - p.sprite.y;
            if (dx * dx + dy * dy < rayonSq) {
                const body = p.sprite.body;
                body.setVelocity(-body.velocity.x, -body.velocity.y);
                p._estReflechi = true;
                p.degats = Math.round(p.degats * 1.4);
                // FX flash blanc
                if (p.visual?.active) {
                    scene.tweens.add({
                        targets: p.visual, scale: { from: 1, to: 1.5 },
                        duration: 180, yoyo: true, ease: 'Cubic.Out'
                    });
                }
            }
        }

        // Si réfléchi, check overlap avec les autres ennemis (linéaire)
        if (p._estReflechi) {
            for (const e of (scene.enemies ?? [])) {
                if (!e || e === enemy || e.mort || !e.sprite?.active) continue;
                const edx = e.sprite.x - p.sprite.x;
                const edy = e.sprite.y - p.sprite.y;
                if (Math.hypot(edx, edy) < (e.def?.largeur ?? 30) * 0.6) {
                    e.recevoirDegats?.(p.degats);
                    p.detruire?.(true);
                    break;
                }
            }
        }
    }
}

registerComportement('reflector', { init: null, update });
export default { init: null, update };
