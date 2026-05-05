// Entité Enemy — encapsule un ennemi : visuel, physique, IA simple, dégâts.
//
// L'IA est minimaliste (patrouille ou vol-suivi). On garde tout dans cette classe
// pour MVP ; quand on aura plus de patterns, on pourra extraire des stratégies.

import { ENEMIES } from '../data/enemies.js';

export class Enemy {
    /**
     * @param {Phaser.Scene} scene
     * @param {Object} def           — définition tirée de ENEMIES
     * @param {number} x, y          — position de spawn
     * @param {number} indexEnnemi   — identifie l'ennemi dans la salle (pour persistance)
     */
    constructor(scene, def, x, y, indexEnnemi) {
        this.scene = scene;
        this.def = def;
        this.indexEnnemi = indexEnnemi;
        this.hp = def.hp;
        this.direction = 1;
        this.xInit = x;
        this.yInit = y;
        this.mort = false;

        this.sprite = scene.add.rectangle(x, y, def.largeur, def.hauteur, def.couleur);
        scene.physics.add.existing(this.sprite);
        const body = this.sprite.body;
        body.allowGravity = !!def.gravite;
        if (def.gravite) {
            body.setCollideWorldBounds(true);
        }

        // Référence inverse pour les overlaps
        this.sprite._enemy = this;
    }

    update(player) {
        if (this.mort) return;
        const def = this.def;

        if (def.comportement === 'patrouille') {
            this.updatePatrouille();
        } else if (def.comportement === 'vol_suivi') {
            this.updateVolSuivi(player);
        }
    }

    updatePatrouille() {
        const body = this.sprite.body;
        body.setVelocityX(this.def.vitesse * this.direction);

        // Demi-tour si on s'éloigne trop du point initial OU si on heurte un mur
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
        // Flash blanc bref
        this.sprite.setFillStyle(0xffffff);
        this.scene.time.delayedCall(80, () => {
            if (!this.mort && this.sprite.active) this.sprite.setFillStyle(this.def.couleur);
        });
        if (this.hp <= 0) this.mourir();
    }

    mourir() {
        if (this.mort) return;
        this.mort = true;
        this.sprite.body.enable = false;
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0,
            scaleX: 0.6,
            scaleY: 0.6,
            duration: 250,
            onComplete: () => this.sprite.destroy()
        });
        // Emit pour que la scène gère le drop / la persistance
        this.scene.events.emit('enemy:dead', this);
    }
}
