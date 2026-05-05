// Entité Enemy — encapsule un ennemi : visuel stylisé, physique, IA simple, dégâts.
//
// Le sprite physique (Rectangle invisible) porte la collision arcade. Un visuel
// séparé (Container avec Graphics) rend la silhouette et les animations. Le
// visuel suit la position du sprite chaque frame.

import { ENEMIES } from '../data/enemies.js';
import { creerVisuelGardien } from '../render/entities/GardienPierre.js';
import { creerVisuelSpectre } from '../render/entities/SpectreCendre.js';
import { DEPTH, tracerCourbeQuadratique } from '../render/PainterlyRenderer.js';

export class Enemy {
    constructor(scene, def, x, y, indexEnnemi) {
        this.scene = scene;
        this.def = def;
        this.indexEnnemi = indexEnnemi;
        this.hp = def.hp;
        this.direction = 1;
        this.xInit = x;
        this.yInit = y;
        this.mort = false;

        // Rectangle physique invisible — porte la hitbox de collision
        this.sprite = scene.add.rectangle(x, y, def.largeur, def.hauteur, def.couleur, 0);
        this.sprite.setAlpha(0);
        scene.physics.add.existing(this.sprite);
        const body = this.sprite.body;
        body.allowGravity = !!def.gravite;
        if (def.gravite) {
            body.setCollideWorldBounds(true);
        }
        this.sprite._enemy = this;

        // Visuel stylisé selon le type
        this.visual = (def.id === 'gardien_pierre')
            ? creerVisuelGardien(scene, def)
            : creerVisuelSpectre(scene, def);
        this.visual.setPosition(x, y);
    }

    update(player) {
        if (this.mort) return;
        const def = this.def;

        if (def.comportement === 'patrouille') {
            this.updatePatrouille();
        } else if (def.comportement === 'vol_suivi') {
            this.updateVolSuivi(player);
        }

        // Le visuel suit la position du sprite physique
        if (this.visual?.active) {
            this.visual.setPosition(this.sprite.x, this.sprite.y);
            // Flip horizontal selon la direction (patrouille uniquement)
            if (def.comportement === 'patrouille') {
                this.visual.scaleX = this.direction;
            }
        }
    }

    updatePatrouille() {
        const body = this.sprite.body;
        body.setVelocityX(this.def.vitesse * this.direction);
        const portee = this.def.porteePatrouille;
        if (this.sprite.x > this.xInit + portee || body.blocked.right) this.direction = -1;
        else if (this.sprite.x < this.xInit - portee || body.blocked.left) this.direction = 1;
    }

    updateVolSuivi(player) {
        if (!player) return;
        const body = this.sprite.body;
        const dx = player.x - this.sprite.x;
        const dy = player.y - this.sprite.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0 && dist < this.def.rayonDetection) {
            const v = this.def.vitesse;
            body.setVelocity((dx / dist) * v, (dy / dist) * v);
        } else {
            body.setVelocity(0, 0);
        }
    }

    recevoirDegats(montant) {
        if (this.mort) return;
        this.hp -= montant;

        // Flash blanc bref sur le visuel (alpha tween + tint via overlay)
        if (this.visual?.active) {
            const overlay = this.scene.add.graphics();
            overlay.setDepth(this.visual.depth + 1);
            overlay.fillStyle(0xffffff, 0.85);
            overlay.fillRect(-this.def.largeur / 2, -this.def.hauteur / 2, this.def.largeur, this.def.hauteur);
            overlay.setPosition(this.sprite.x, this.sprite.y);
            overlay.setBlendMode(Phaser.BlendModes.ADD);
            this.scene.tweens.add({
                targets: overlay,
                alpha: 0,
                duration: 100,
                onComplete: () => overlay.destroy()
            });
        }

        if (this.hp <= 0) this.mourir();
    }

    /**
     * Animation d'attaque déclenchée quand l'ennemi inflige des dégâts au contact.
     * Visuel signature par type, plus de flash blanc générique :
     *   - Gardien : poing rocailleux qui jaillit + œil rouge qui pulse intensément
     *   - Spectre : griffe spectrale en éventail + yeux qui s'enflamment de bleu
     * Plus squash & stretch + particules d'impact (couleurs adaptées).
     */
    jouerAttaqueContact(scene, cible) {
        if (this.mort || !this.visual?.active) return;

        const w = this.def.largeur, h = this.def.hauteur;
        const dirX = cible ? Math.sign(cible.x - this.sprite.x) || 1 : 1;
        const visualDepth = this.visual.depth ?? DEPTH.ENTITES;

        if (this.def.id === 'gardien_pierre') {
            this._attaqueGardien(scene, dirX, w, h, visualDepth);
        } else {
            this._attaqueSpectre(scene, dirX, w, h, visualDepth);
        }

        // --- Squash & stretch signature mouvement ---
        if (this.def.comportement === 'patrouille') {
            scene.tweens.add({
                targets: this.visual,
                scaleX: { from: 1, to: 1.25 * dirX },
                scaleY: { from: 1, to: 0.82 },
                duration: 90,
                ease: 'Cubic.Out',
                yoyo: true,
                onComplete: () => {
                    if (this.visual?.active) {
                        this.visual.scaleX = dirX;
                        this.visual.scaleY = 1;
                    }
                }
            });
        } else {
            scene.tweens.add({
                targets: this.visual,
                scaleY: { from: 1, to: 1.3 },
                scaleX: { from: 1, to: 0.85 },
                duration: 100,
                ease: 'Cubic.Out',
                yoyo: true,
                onComplete: () => {
                    if (this.visual?.active) {
                        this.visual.scaleX = 1;
                        this.visual.scaleY = 1;
                    }
                }
            });
        }

        // --- Particules d'impact (couleurs adaptées au type) ---
        if (cible && scene.textures.exists('_particule')) {
            const impactX = (this.sprite.x + cible.x) / 2;
            const impactY = (this.sprite.y + cible.y) / 2;
            const estGardien = this.def.id === 'gardien_pierre';
            const couleur = estGardien ? [0xff6060, 0xff8040] : [0xa0c0d8, 0x6a8aa8];

            const burst = scene.add.particles(impactX, impactY, '_particule', {
                lifespan: 360,
                speed: { min: 60, max: 160 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.5, end: 0 },
                tint: couleur,
                quantity: 8,
                blendMode: Phaser.BlendModes.ADD,
                alpha: { start: 0.9, end: 0 }
            });
            burst.setDepth(DEPTH.EFFETS);
            burst.explode(8);
            scene.time.delayedCall(400, () => burst.destroy());
        }
    }

    // === Visuel d'attaque GARDIEN — poing rocailleux + œil rouge ===
    _attaqueGardien(scene, dirX, w, h, visualDepth) {
        // Poing en pierre qui jaillit vers le joueur
        const poing = scene.add.graphics();
        poing.setDepth(DEPTH.EFFETS);
        poing.setPosition(this.sprite.x + dirX * (w / 2), this.sprite.y);
        // Trapèze pierre (ombre)
        poing.fillStyle(0x1a1a24, 1);
        poing.beginPath();
        poing.moveTo(0, -11);
        poing.lineTo(dirX * 30, -5);
        poing.lineTo(dirX * 30, 5);
        poing.lineTo(0, 11);
        poing.closePath();
        poing.fillPath();
        // Trapèze pierre (corps)
        poing.fillStyle(0x4a4a5a, 1);
        poing.beginPath();
        poing.moveTo(0, -10);
        poing.lineTo(dirX * 28, -4);
        poing.lineTo(dirX * 28, 4);
        poing.lineTo(0, 10);
        poing.closePath();
        poing.fillPath();
        // Highlight haut
        poing.fillStyle(0x7a7a8a, 0.7);
        poing.beginPath();
        poing.moveTo(0, -10);
        poing.lineTo(dirX * 28, -4);
        poing.lineTo(dirX * 24, -2);
        poing.lineTo(0, -7);
        poing.closePath();
        poing.fillPath();
        // Liseré rouge brillant additif
        const liseré = scene.add.graphics();
        liseré.setDepth(DEPTH.EFFETS);
        liseré.setPosition(this.sprite.x + dirX * (w / 2), this.sprite.y);
        liseré.setBlendMode(Phaser.BlendModes.ADD);
        liseré.lineStyle(2, 0xff4040, 0.9);
        liseré.beginPath();
        liseré.moveTo(0, -10);
        liseré.lineTo(dirX * 28, -4);
        liseré.lineTo(dirX * 28, 4);
        liseré.lineTo(0, 10);
        liseré.strokePath();

        scene.tweens.add({
            targets: [poing, liseré],
            scaleX: { from: 0.3, to: 1.15 },
            alpha: { from: 1, to: 0 },
            duration: 240,
            ease: 'Cubic.Out',
            onComplete: () => { poing.destroy(); liseré.destroy(); }
        });

        // Pulse rouge intense de l'œil (additif au-dessus du visuel)
        const oeil = scene.add.graphics();
        oeil.setPosition(this.sprite.x, this.sprite.y - 2);
        oeil.setDepth(visualDepth + 1);
        oeil.setBlendMode(Phaser.BlendModes.ADD);
        oeil.fillStyle(0xff3030, 0.85);
        oeil.fillCircle(0, 0, 9);
        oeil.fillStyle(0xff8080, 1);
        oeil.fillCircle(0, 0, 4);
        scene.tweens.add({
            targets: oeil,
            scale: { from: 0.5, to: 2 },
            alpha: { from: 1, to: 0 },
            duration: 240,
            ease: 'Cubic.Out',
            onComplete: () => oeil.destroy()
        });
    }

    // === Visuel d'attaque SPECTRE — serres spectrales courbes en éventail ===
    // Griffes dessinées avec quadraticCurveTo pour avoir des arcs organiques,
    // pas des lignes droites. Plusieurs couches + traînée de particules.
    _attaqueSpectre(scene, dirX, w, h, visualDepth) {
        const baseX = this.sprite.x + dirX * (w / 2);
        const baseY = this.sprite.y;

        // Décalages des 4 serres en éventail (haut → bas)
        const offsets = [-16, -6, 6, 16];

        const tracerCourbes = (g, lineWidth, couleur, alpha, longueur) => {
            g.lineStyle(lineWidth, couleur, alpha);
            for (const yOff of offsets) {
                // Bézier quadratique avec point de contrôle exagéré → arc organique
                const cpX = dirX * (longueur * 0.45);
                const cpY = yOff * 1.6;
                tracerCourbeQuadratique(
                    g,
                    0, yOff * 0.25,
                    cpX, cpY,
                    dirX * longueur, yOff,
                    14
                );
            }
        };

        // Couche extérieure : voile diffus, très large
        const couche1 = scene.add.graphics();
        couche1.setDepth(DEPTH.EFFETS);
        couche1.setBlendMode(Phaser.BlendModes.ADD);
        couche1.setPosition(baseX, baseY);
        tracerCourbes(couche1, 10, 0x6a8aaa, 0.35, 30);

        // Couche moyenne : corps de la griffe
        const couche2 = scene.add.graphics();
        couche2.setDepth(DEPTH.EFFETS);
        couche2.setBlendMode(Phaser.BlendModes.ADD);
        couche2.setPosition(baseX, baseY);
        tracerCourbes(couche2, 5, 0xa0c0d8, 0.85, 30);

        // Couche centrale : trait clair lumineux
        const couche3 = scene.add.graphics();
        couche3.setDepth(DEPTH.EFFETS);
        couche3.setBlendMode(Phaser.BlendModes.ADD);
        couche3.setPosition(baseX, baseY);
        tracerCourbes(couche3, 2, 0xe8f4ff, 1, 28);

        // Cœur lumineux à la base (signature spectre)
        const coeur = scene.add.graphics();
        coeur.setDepth(DEPTH.EFFETS);
        coeur.setBlendMode(Phaser.BlendModes.ADD);
        coeur.setPosition(baseX, baseY);
        coeur.fillStyle(0xc0d8e8, 0.6);
        coeur.fillCircle(0, 0, 9);
        coeur.fillStyle(0xffffff, 0.85);
        coeur.fillCircle(0, 0, 4);

        // Animation : balayage en arc + scale qui s'élargit + fade
        scene.tweens.add({
            targets: [couche1, couche2, couche3, coeur],
            scaleX: { from: 0.35, to: 1.4 },
            scaleY: { from: 1.2, to: 0.9 },
            alpha: { from: 1, to: 0 },
            duration: 320,
            ease: 'Cubic.Out',
            onComplete: () => {
                couche1.destroy(); couche2.destroy();
                couche3.destroy(); coeur.destroy();
            }
        });

        // Traînée de particules qui suit la pointe des serres
        if (scene.textures.exists('_particule')) {
            const trail = scene.add.particles(baseX, baseY, '_particule', {
                lifespan: 380,
                speed: { min: 80, max: 180 },
                angle: dirX > 0 ? { min: -50, max: 50 } : { min: 130, max: 230 },
                scale: { start: 0.55, end: 0 },
                tint: [0xa0c0d8, 0xe8f4ff, 0x6a8aaa],
                quantity: 10,
                blendMode: Phaser.BlendModes.ADD,
                alpha: { start: 1, end: 0 }
            });
            trail.setDepth(DEPTH.EFFETS);
            trail.explode(10);
            scene.time.delayedCall(420, () => trail.destroy());
        }

        // Yeux qui s'enflamment d'un bleu vif intense
        const yeux = scene.add.graphics();
        yeux.setPosition(this.sprite.x, this.sprite.y - 8);
        yeux.setDepth(visualDepth + 1);
        yeux.setBlendMode(Phaser.BlendModes.ADD);
        yeux.fillStyle(0xa0d0ff, 0.95);
        yeux.fillCircle(-4, 0, 6);
        yeux.fillCircle(4, 0, 6);
        yeux.fillStyle(0xffffff, 0.9);
        yeux.fillCircle(-4, 0, 2.5);
        yeux.fillCircle(4, 0, 2.5);
        scene.tweens.add({
            targets: yeux,
            scale: { from: 0.5, to: 1.7 },
            alpha: { from: 1, to: 0 },
            duration: 260,
            ease: 'Cubic.Out',
            onComplete: () => yeux.destroy()
        });
    }

    mourir() {
        if (this.mort) return;
        this.mort = true;
        this.sprite.body.enable = false;

        // Animation de mort sur le visuel (fade + scale down)
        if (this.visual?.active) {
            this.scene.tweens.add({
                targets: this.visual,
                alpha: 0,
                scaleX: 0.6,
                scaleY: 0.6,
                duration: 250,
                onComplete: () => this.visual?.destroy()
            });
        }
        // Sprite physique : on le détruit aussi (invisible mais propre)
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0,
            duration: 250,
            onComplete: () => this.sprite.destroy()
        });

        this.scene.events.emit('enemy:dead', this);
    }
}
