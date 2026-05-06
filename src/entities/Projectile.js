// Projectile — tir d'un Tireur ou d'un boss Tisseur.
// Visuel : petit orbe avec halo additif + traînée de particules.
// Physique : Rectangle invisible avec gravité désactivée. S'overlap avec le
// joueur (dégâts) et collide avec les plateformes (destruction).
// Les projectiles homing pivotent légèrement vers le joueur chaque frame.

import { DEPTH } from '../render/PainterlyRenderer.js';

const RAYON_HITBOX = 8;
const DUREE_MAX = 4000; // ms

export class Projectile {
    /**
     * @param {Phaser.Scene} scene
     * @param {object} options { x, y, cibleX, cibleY, vitesse, portee,
     *                          degats, couleur, halo, homing }
     */
    constructor(scene, options) {
        this.scene = scene;
        this.options = options;
        this.degats = options.degats ?? 6;
        this.homing = options.homing ?? false;
        this.naissance = scene.time.now;
        this.distanceParcourue = 0;
        this.detruit = false;

        // Sprite physique invisible
        this.sprite = scene.add.rectangle(options.x, options.y, RAYON_HITBOX * 2, RAYON_HITBOX * 2, 0xffffff, 0);
        this.sprite.setAlpha(0);
        scene.physics.add.existing(this.sprite);
        const body = this.sprite.body;
        body.allowGravity = false;

        // Vélocité initiale vers la cible
        const dx = options.cibleX - options.x;
        const dy = options.cibleY - options.y;
        const dist = Math.hypot(dx, dy) || 1;
        const v = options.vitesse ?? 200;
        body.setVelocity((dx / dist) * v, (dy / dist) * v);
        this.sprite._projectile = this;

        // === Visuel : orbe + halo + traînée ===
        this.visual = scene.add.container(options.x, options.y);
        this.visual.setDepth(DEPTH.EFFETS);

        const halo = scene.add.graphics();
        halo.setBlendMode(Phaser.BlendModes.ADD);
        halo.fillStyle(options.halo ?? 0xffd070, 0.45);
        halo.fillCircle(0, 0, 14);
        halo.fillStyle(options.halo ?? 0xffd070, 0.7);
        halo.fillCircle(0, 0, 9);
        this.visual.add(halo);

        const noyau = scene.add.graphics();
        noyau.setBlendMode(Phaser.BlendModes.ADD);
        noyau.fillStyle(0xffffff, 1);
        noyau.fillCircle(0, 0, 4);
        noyau.fillStyle(options.couleur ?? 0xff8040, 1);
        noyau.fillCircle(0, 0, 2.5);
        this.visual.add(noyau);

        // Pulse subtil
        scene.tweens.add({
            targets: this.visual,
            scale: { from: 0.9, to: 1.15 },
            duration: 280,
            yoyo: true, repeat: -1,
            ease: 'Sine.InOut'
        });

        // Traînée de particules
        if (scene.textures.exists('_particule')) {
            this.trail = scene.add.particles(0, 0, '_particule', {
                lifespan: 320,
                speed: { min: 8, max: 24 },
                scale: { start: 0.4, end: 0 },
                tint: [options.halo ?? 0xffd070, options.couleur ?? 0xff8040],
                quantity: 1,
                frequency: 30,
                blendMode: Phaser.BlendModes.ADD,
                alpha: { start: 0.85, end: 0 }
            });
            this.trail.setDepth(DEPTH.EFFETS - 1);
        }
    }

    /**
     * Met à jour le projectile. Appelé par GameScene.
     * @param {Phaser.GameObjects.Rectangle} player rectangle physique
     */
    update(player) {
        if (this.detruit) return;
        const body = this.sprite.body;

        // Homing : pivote légèrement vers le joueur
        if (this.homing && player) {
            const vx = body.velocity.x;
            const vy = body.velocity.y;
            const speed = Math.hypot(vx, vy) || 1;
            const dx = player.x - this.sprite.x;
            const dy = player.y - this.sprite.y;
            const distP = Math.hypot(dx, dy) || 1;
            const PIVOT = 0.045;  // facteur de mélange (0 = pas de homing, 1 = piste parfaitement)
            const newVx = vx * (1 - PIVOT) + (dx / distP) * speed * PIVOT;
            const newVy = vy * (1 - PIVOT) + (dy / distP) * speed * PIVOT;
            const newSpeed = Math.hypot(newVx, newVy) || 1;
            body.setVelocity((newVx / newSpeed) * speed, (newVy / newSpeed) * speed);
        }

        // Suivi du visuel + trail
        if (this.visual?.active) {
            this.visual.setPosition(this.sprite.x, this.sprite.y);
        }
        if (this.trail?.active) {
            this.trail.setPosition(this.sprite.x, this.sprite.y);
        }

        // Distance parcourue
        const vx = body.velocity.x, vy = body.velocity.y;
        this.distanceParcourue += Math.hypot(vx, vy) * (1 / 60);

        // Conditions de destruction : portée, durée max, ou hors monde
        if (this.distanceParcourue > (this.options.portee ?? 400)) this.detruire();
        else if (this.scene.time.now - this.naissance > DUREE_MAX) this.detruire();
        else if (this.sprite.body.blocked.left || this.sprite.body.blocked.right ||
                 this.sprite.body.blocked.up   || this.sprite.body.blocked.down) {
            this.detruire(true);
        }
    }

    /**
     * Détruit le projectile. Si `impact`, joue un petit burst de particules.
     */
    detruire(impact = false) {
        if (this.detruit) return;
        this.detruit = true;

        if (impact && this.scene.textures.exists('_particule')) {
            const burst = this.scene.add.particles(this.sprite.x, this.sprite.y, '_particule', {
                lifespan: 280,
                speed: { min: 40, max: 100 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.5, end: 0 },
                tint: [this.options.halo ?? 0xffd070, this.options.couleur ?? 0xff8040],
                quantity: 6,
                blendMode: Phaser.BlendModes.ADD,
                alpha: { start: 1, end: 0 }
            });
            burst.setDepth(DEPTH.EFFETS);
            burst.explode(6);
            this.scene.time.delayedCall(300, () => burst.destroy());
        }

        this.sprite.body.enable = false;
        this.scene.tweens.add({
            targets: this.visual,
            alpha: 0,
            scale: 1.4,
            duration: 160,
            onComplete: () => {
                this.visual?.destroy();
                this.sprite?.destroy();
                this.trail?.destroy();
            }
        });
    }
}
