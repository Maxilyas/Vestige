// Entité Enemy — encapsule un ennemi : visuel stylisé, physique, IA simple, dégâts.
//
// Le sprite physique (Rectangle invisible) porte la collision arcade. Un visuel
// séparé (Container avec Graphics) rend la silhouette et les animations. Le
// visuel suit la position du sprite chaque frame.

import { ENEMIES } from '../data/enemies.js';
import { creerVisuelGardien } from '../render/entities/GardienPierre.js';
import { creerVisuelSpectre } from '../render/entities/SpectreCendre.js';

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
