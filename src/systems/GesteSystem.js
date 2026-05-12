// GesteSystem — Phase 5b.2. Registry des Gestes (capacités actives des Vestiges).
//
// Chaque Geste = fonction qui prend (scene, player, params) et exécute la
// capacité (créer un projectile, infliger des dégâts AOE, appliquer un dash,
// etc.). Cette architecture est modulaire pour préparer Phase 6 (combinaisons
// d'items qui pourraient créer de nouveaux Gestes ou modifier les existants).
//
// Les 4 Gestes actuels (mappés aux 4 boss qui drop des Vestiges Geste) :
//   - onde_du_glas       (boss étage 3) : AOE en arc devant le joueur
//   - filet_de_cendre    (boss étage 4) : tir rectiligne, projectile droit
//   - oeil_temoin_boss   (boss étage 6) : tir téléguidé, projectile homing
//   - seve_hydre         (boss étage 7) : dash horizontal + invulnérabilité
//
// USAGE depuis GameScene :
//   import { executerGeste } from './GesteSystem.js';
//   executerGeste('filet_de_cendre', this, this.player, { degats: 4, ... });

import { Projectile } from '../entities/Projectile.js';

// ============================================================
// Helpers
// ============================================================
function joueurDirection(scene) {
    return scene.lastDirection >= 0 ? 1 : -1;
}

function flashJoueur(scene, couleur, dureeMs = 200) {
    scene.flashJoueur?.(couleur, dureeMs);
}

// ============================================================
// REGISTRY — chaque entrée = fonction `executer(scene, player, params)`
// ============================================================
const GESTES = {
    /**
     * Onde du Glas — AOE rectangulaire devant le joueur.
     * params: { degats, portee, hauteur }
     */
    onde_du_glas(scene, player, params) {
        const dir = joueurDirection(scene);
        const portee = params.portee ?? 180;
        const hauteur = params.hauteur ?? 60;
        const degats = params.degats ?? 6;

        // Hitbox AOE centrée devant le joueur, à mi-portée
        const xCentre = player.x + dir * (portee / 2);
        const yCentre = player.y;

        // Test overlap manuel avec tous les ennemis (pas besoin d'un body physique)
        for (const ennemi of scene.enemies ?? []) {
            if (!ennemi?.sprite) continue;
            const dx = Math.abs(ennemi.sprite.x - xCentre);
            const dy = Math.abs(ennemi.sprite.y - yCentre);
            if (dx < portee / 2 + 20 && dy < hauteur / 2 + 20) {
                ennemi.recevoirDegats?.(degats);
            }
        }
        // Boss aussi
        if (scene.boss?.sprite) {
            const dx = Math.abs(scene.boss.sprite.x - xCentre);
            const dy = Math.abs(scene.boss.sprite.y - yCentre);
            if (dx < portee / 2 + 30 && dy < hauteur / 2 + 30) {
                scene.boss.recevoirDegats?.(degats);
            }
        }

        // ─── FX : onde semi-circulaire qui se propage devant le joueur ───
        const onde = scene.add.graphics();
        onde.setDepth(150);
        onde.setBlendMode(Phaser.BlendModes.ADD);
        // Centre de l'arc = direction du facing (0 = droite, π = gauche).
        // Demi-angle 90° → on couvre un arc de ±90° autour du facing.
        const angCentre = dir > 0 ? 0 : Math.PI;
        const arcDemi = Math.PI / 2;
        scene.tweens.addCounter({
            from: 0, to: 1,
            duration: 280,
            onUpdate: (t) => {
                const progression = t.getValue();
                onde.clear();
                const r = progression * portee;
                onde.lineStyle(4 * (1 - progression), 0xc8a85a, 1 - progression * 0.5);
                onde.beginPath();
                onde.arc(player.x, player.y, r, angCentre - arcDemi, angCentre + arcDemi, false);
                onde.strokePath();
            },
            onComplete: () => onde.destroy()
        });

        scene.cameras?.main?.shake(150, 0.005);
        flashJoueur(scene, 0xffd070, 120);
    },

    /**
     * Filet de Cendre — tir rectiligne, projectile droit.
     * params: { degats, vitesse, portee }
     */
    filet_de_cendre(scene, player, params) {
        const dir = joueurDirection(scene);
        scene._creerProjectile?.({
            origine: 'joueur',
            x: player.x + dir * 18,
            y: player.y,
            cibleX: player.x + dir * 9999,
            cibleY: player.y,
            vitesse: params.vitesse ?? 520,
            portee: params.portee ?? 600,
            degats: params.degats ?? 4,
            couleur: 0x9a3a3a,
            halo: 0xff8060
        });
    },

    /**
     * Œil-Témoin du Sans-Fin — tir téléguidé, suit la cible la plus proche.
     * params: { degats, vitesse, portee }
     */
    oeil_temoin_boss(scene, player, params) {
        const dir = joueurDirection(scene);
        // Cible la plus proche encore vivante (ennemi ou boss)
        let cible = null;
        let distMin = Infinity;
        const all = [...(scene.enemies ?? []), scene.boss].filter(e => e?.sprite && !e.mort);
        for (const e of all) {
            const dx = e.sprite.x - player.x;
            const dy = e.sprite.y - player.y;
            const d = Math.hypot(dx, dy);
            if (d < distMin) { distMin = d; cible = e; }
        }
        const cibleX = cible ? cible.sprite.x : player.x + dir * 400;
        const cibleY = cible ? cible.sprite.y : player.y;

        scene._creerProjectile?.({
            origine: 'joueur',
            x: player.x + dir * 18,
            y: player.y,
            cibleX, cibleY,
            vitesse: params.vitesse ?? 320,
            portee: params.portee ?? 700,
            degats: params.degats ?? 5,
            couleur: 0xa0d0ff,
            halo: 0xc0e0ff,
            homing: cible?.sprite ?? null,
            homingForce: 0.06
        });
    },

    /**
     * Sève d'Hydre — dash horizontal + invulnérabilité courte.
     * params: { distance, dureeMs, invuMs }
     */
    seve_hydre(scene, player, params) {
        const dir = joueurDirection(scene);
        const distance = params.distance ?? 380;
        const dureeMs = params.dureeMs ?? 240;
        const invuMs = params.invuMs ?? 500;

        const body = player.body;
        if (!body) return;
        const vx = (distance / dureeMs) * 1000 * dir;

        // Phase 5b.2 — Active un flag dash sur la scène : tant que cette
        // fenêtre est ouverte, GameScene.update() court-circuite le mouvement
        // horizontal normal et préserve la vélocité du dash.
        scene._dashJusqu = scene.time.now + dureeMs;
        body.setVelocityX(vx);
        body.setVelocityY(Math.min(body.velocity.y, 0));   // annule la chute

        // Invulnérabilité : prolonge le flag invincibleJusqu du joueur
        scene.invincibleJusqu = Math.max(scene.invincibleJusqu ?? 0, scene.time.now + invuMs);

        // ─── FX : traînée de cendres derrière le joueur ───
        for (let k = 0; k < 8; k++) {
            scene.time.delayedCall(k * 22, () => {
                if (!player.active) return;
                const p = scene.add.circle(player.x, player.y, 4, 0xff8060, 0.7);
                p.setDepth(140);
                p.setBlendMode(Phaser.BlendModes.ADD);
                scene.tweens.add({
                    targets: p, alpha: 0, scale: 0.3,
                    duration: 350,
                    onComplete: () => p.destroy()
                });
            });
        }
        flashJoueur(scene, 0xff8060, 250);
    }
};

/**
 * Exécute le geste identifié par `code` dans `scene` pour `player`. Retourne
 * vrai si le geste a été trouvé et exécuté.
 */
export function executerGeste(code, scene, player, params = {}) {
    const fn = GESTES[code];
    if (!fn) {
        console.warn(`[GesteSystem] Geste inconnu: ${code}`);
        return false;
    }
    fn(scene, player, params);
    return true;
}

/** Vrai si un Geste avec ce code existe dans le registry. */
export function gesteExiste(code) {
    return GESTES[code] !== undefined;
}
