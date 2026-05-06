// Obstacle — entité unifiée gérant pieux, ressorts et plateformes mobiles.
//
// Le Rectangle physique invisible porte la collision arcade. Le visuel
// suit la position du body (utile pour les plateformes mobiles).
//
// Pour les pieux : overlap → dégâts (avec invincibilité courte).
// Pour les ressorts : overlap si vy > 0 → set vy = boostVy + animation.
// Pour les plateformes mobiles : collider one-way par dessus, body.immovable.

import { TYPES_OBSTACLES } from '../data/obstacles.js';
import { creerVisuelPieux } from '../render/entities/Pieux.js';
import { creerVisuelRessort, jouerDeclenchementRessort } from '../render/entities/Ressort.js';
import { creerVisuelPlateformeMobile } from '../render/entities/PlateformeMobile.js';

export class Obstacle {
    /**
     * @param {Phaser.Scene} scene
     * @param {object} data { type, x, y, orientation?, amplitude?, periode?, axe? }
     * @param {string} biomeId
     */
    constructor(scene, data, biomeId = 'ruines_basses') {
        this.scene = scene;
        this.data = data;
        this.biomeId = biomeId;
        this.dernierHit = 0;
        this.dernierBoost = 0;

        const def = TYPES_OBSTACLES[data.type];
        if (!def) {
            console.warn('[Obstacle] type inconnu :', data.type);
            return;
        }
        this.def = def;

        if (data.type === 'pieu')               this._creerPieu();
        else if (data.type === 'ressort')       this._creerRessort();
        else if (data.type === 'plateforme_mobile') this._creerPlateformeMobile();
    }

    _creerPieu() {
        const w = this.def.largeur, h = this.def.hauteur;
        const orientation = this.data.orientation ?? 'sol';
        // Sprite physique : on rétrécit le hitbox aux pointes (pas tout le socle)
        const hitH = h - 6;
        // Le centre du body est décalé pour ne couvrir QUE les pointes.
        const offsetY = orientation === 'sol' ? -3 : 3;
        this.sprite = this.scene.add.rectangle(
            this.data.x, this.data.y + offsetY,
            w - 4, hitH, 0xffffff, 0
        );
        this.sprite.setAlpha(0);
        this.scene.physics.add.existing(this.sprite, true); // static body
        this.sprite._obstacle = this;

        // Visuel : centre de la zone d'origine
        this.visual = creerVisuelPieux(
            this.scene, this.data.x, this.data.y,
            w, h, orientation, this.biomeId
        );
    }

    _creerRessort() {
        const w = this.def.largeur, h = this.def.hauteur;
        // Hitbox : on prend toute la zone du plateau (top du ressort)
        this.sprite = this.scene.add.rectangle(
            this.data.x, this.data.y - 2,
            w, h, 0xffffff, 0
        );
        this.sprite.setAlpha(0);
        this.scene.physics.add.existing(this.sprite, true);
        this.sprite._obstacle = this;

        this.visual = creerVisuelRessort(this.scene, this.data.x, this.data.y, w, h);
    }

    _creerPlateformeMobile() {
        const w = this.data.largeur ?? this.def.largeur;
        const h = this.data.hauteur ?? this.def.hauteur;
        const axe = this.data.axe ?? 'horizontale';
        const amplitude = this.data.amplitude ?? this.def.amplitudeDefault;
        const periode = this.data.periode ?? this.def.periodeDefault;

        // Sprite physique mobile (dynamic body)
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.y, w, h, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.scene.physics.add.existing(this.sprite);
        const body = this.sprite.body;
        body.allowGravity = false;
        body.immovable = true;          // ne se laisse pas pousser par le joueur
        body.moves = true;
        // Empêche les collisions par-dessous/côtés (one-way virtuel) :
        body.checkCollision.down = false;
        body.checkCollision.left = false;
        body.checkCollision.right = false;
        this.sprite._obstacle = this;

        this.visual = creerVisuelPlateformeMobile(this.scene, this.data.x, this.data.y, w, h, this.biomeId);

        // Mouvement : on tween la position du sprite, et on synchronise
        // body.velocity pour que le joueur soit transporté correctement par
        // les colliders de Phaser.
        this.axe = axe;
        this.centreX = this.data.x;
        this.centreY = this.data.y;
        this.amplitude = amplitude;
        this.periode = periode;
        this._t0 = this.scene.time.now;
    }

    update() {
        if (!this.sprite || !this.sprite.active) return;
        // Plateforme mobile : oscillation sinusoïdale via velocity. On laisse
        // Phaser intégrer la position (la velocity transporte naturellement le
        // joueur posé dessus). Un clamp léger empêche la dérive d'intégration.
        if (this.data.type === 'plateforme_mobile') {
            const t = (this.scene.time.now - this._t0) / this.periode;
            const omega = (Math.PI * 2) / (this.periode / 1000);  // rad/s
            // Vitesse cible = dérivée d'une sinusoïde d'amplitude `amplitude`
            const v = Math.cos(t * Math.PI * 2) * this.amplitude * omega;
            const body = this.sprite.body;
            if (this.axe === 'horizontale') {
                body.setVelocity(v, 0);
                // Clamp si dérive de l'intégration
                const dx = this.sprite.x - this.centreX;
                if (Math.abs(dx) > this.amplitude * 1.08) {
                    this.sprite.x = this.centreX + Math.sign(dx) * this.amplitude;
                }
            } else {
                body.setVelocity(0, v);
                const dy = this.sprite.y - this.centreY;
                if (Math.abs(dy) > this.amplitude * 1.08) {
                    this.sprite.y = this.centreY + Math.sign(dy) * this.amplitude;
                }
            }
            if (this.visual?.active) this.visual.setPosition(this.sprite.x, this.sprite.y);
        }
    }

    /**
     * Appelé par GameScene quand le joueur touche cet obstacle.
     * Le retour indique si l'overlap doit "consommer" l'événement (par ex.
     * pour stopper le bouclage des hits).
     */
    onContactJoueur(scene, player) {
        const now = scene.time.now;
        if (this.data.type === 'pieu') {
            if (now - this.dernierHit < this.def.invincibiliteApresHit) return;
            // Délégué : GameScene applique les dégâts + invincibilité globale
            this.dernierHit = now;
            scene.events.emit('obstacle:pieu:hit', this);
        } else if (this.data.type === 'ressort') {
            if (now - this.dernierBoost < this.def.cooldown) return;
            this.dernierBoost = now;
            // Boost vertical si le joueur descend ou est posé dessus
            const body = player.body;
            if (body.velocity.y >= -100) {  // pas s'il est déjà en montée rapide
                body.setVelocityY(this.def.boostVy);
                jouerDeclenchementRessort(scene, this.visual);
            }
        }
    }

    detruire() {
        this.sprite?.destroy();
        this.visual?.destroy();
    }
}
