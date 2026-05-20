// Obstacle — entité unifiée pour tous les éléments interactifs des salles.
//
// Hérités :
//   - pieu              : dégâts au contact
//   - ressort           : boost vertical
//   - plateforme_mobile : oscillation (joueur transporté)
//
// Vague 1 (Ruines, étape 4C) :
//   - eboulis           : statique bloquant, cassable en N hits
//   - mur_fissure       : statique vertical, cassable en N hits
//   - sol_effrite       : plateforme one-way qui s'effondre après contact
//   - roc_tombe         : roc cyclique depuis plafond (avertissement + chute)
//   - plaque_pression   : déclenche effet à l'overlap joueur
//
// Vague 2 :
//   - racines_reflux    : zone cyclique pieu↔plateforme
//   - anti_ancrage      : zone non-physique (lecture par AncrageSystem)

import { TYPES_OBSTACLES } from '../data/obstacles.js';
import { creerVisuelPieux } from '../render/entities/Pieux.js';
import { creerVisuelRessort, jouerDeclenchementRessort } from '../render/entities/Ressort.js';
import { creerVisuelPlateformeMobile } from '../render/entities/PlateformeMobile.js';

// Palette Ruines basses (utilisée pour les visuels inline ci-dessous)
const COULEUR_PIERRE       = 0x5a6850;
const COULEUR_PIERRE_FONCE = 0x2a352a;
const COULEUR_PIERRE_CLAIR = 0x7a8a6a;
const COULEUR_RACINE       = 0x6a2070;
const COULEUR_RACINE_VIVE  = 0xa030c0;
const COULEUR_FISSURE      = 0x1a1a1a;
const COULEUR_PLAQUE       = 0x88643a;     // or terni (cf. paletteBiome.accent)

export class Obstacle {
    /**
     * @param {Phaser.Scene} scene
     * @param {object} data
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

        // Routage par type
        if      (data.type === 'pieu')              this._creerPieu();
        else if (data.type === 'ressort')           this._creerRessort();
        else if (data.type === 'plateforme_mobile') this._creerPlateformeMobile();
        else if (data.type === 'eboulis')           this._creerCassable('eboulis');
        else if (data.type === 'mur_fissure')       this._creerCassable('mur_fissure');
        else if (data.type === 'sol_effrite')       this._creerSolEffrite();
        else if (data.type === 'roc_tombe')         this._creerRocTombe();
        else if (data.type === 'plaque_pression')   this._creerPlaque();
        else if (data.type === 'racines_reflux')    this._creerRacinesReflux();
        else if (data.type === 'anti_ancrage')      this._creerAntiAncrage();
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
        if (this.data.type === 'plateforme_mobile') {
            if (!this.sprite || !this.sprite.active) return;
            const t = (this.scene.time.now - this._t0) / this.periode;
            const omega = (Math.PI * 2) / (this.periode / 1000);
            const v = Math.cos(t * Math.PI * 2) * this.amplitude * omega;
            const body = this.sprite.body;
            if (this.axe === 'horizontale') {
                body.setVelocity(v, 0);
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
        else if (this.data.type === 'roc_tombe') {
            // Le visuel suit le sprite (chute)
            if (this.sprite?.active && this.visual) {
                this.visual.clear();
                this._dessinerRoc(this.sprite.x, this.sprite.y, this.def.largeur, this.def.hauteur);
                // Si le roc atteint le point d'impact, fige + déclenche cycle suivant
                if (this.rocPhase === 'chute' && this.sprite.y >= this.data.yImpact) {
                    this.sprite.y = this.data.yImpact;
                    this.sprite.body.setVelocity(0, 0);
                    this.rocPhase = 'impact';
                    // Petit shake + particules à l'impact
                    if (this.scene.textures.exists('_particule')) {
                        const burst = this.scene.add.particles(this.data.x, this.data.yImpact, '_particule', {
                            lifespan: 400,
                            speed: { min: 80, max: 180 },
                            angle: { min: -160, max: -20 },
                            scale: { start: 0.6, end: 0 },
                            tint: [COULEUR_PIERRE, COULEUR_PIERRE_CLAIR],
                            quantity: 10,
                            alpha: { start: 1, end: 0 }
                        });
                        burst.setDepth(15);
                        burst.explode(10);
                        this.scene.time.delayedCall(450, () => burst.destroy());
                    }
                    this.scene.cameras.main.shake(80, 0.003);
                }
            }
        }
        else if (this.data.type === 'racines_reflux') {
            if (!this.sprite || !this.sprite.active) return;
            this._updateRacines(this.scene.time.now);
        }
        else if (this.data.type === 'anti_ancrage') {
            // Anime les spores qui flottent dans la zone (pas de sprite physique)
            if (this.visual?.active) this._dessinerAntiAncrage();
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
            this.dernierHit = now;
            scene.events.emit('obstacle:pieu:hit', this);
        } else if (this.data.type === 'ressort') {
            if (now - this.dernierBoost < this.def.cooldown) return;
            this.dernierBoost = now;
            const body = player.body;
            if (body.velocity.y >= -100) {
                body.setVelocityY(this.def.boostVy);
                jouerDeclenchementRessort(scene, this.visual);
            }
        } else if (this.data.type === 'sol_effrite') {
            // Au premier contact, déclenche le compte à rebours d'effondrement.
            this._declencherEffondrement();
        } else if (this.data.type === 'roc_tombe') {
            // Dégâts uniquement pendant la phase 'chute' (le roc s'écrase dessus)
            if (this.rocPhase !== 'chute') return;
            if (now - this.dernierHit < this.def.invincibiliteApresHit) return;
            this.dernierHit = now;
            scene.events.emit('obstacle:pieu:hit', this);  // réutilise pipeline dégâts pieu
        } else if (this.data.type === 'plaque_pression') {
            this._activerPlaque();
        } else if (this.data.type === 'racines_reflux') {
            // Dégâts uniquement en phase 'pieu'
            if (this.racinesPhase !== 'pieu') return;
            if (now - this.dernierHit < this.def.invincibiliteApresHit) return;
            this.dernierHit = now;
            scene.events.emit('obstacle:pieu:hit', this);
        }
    }

    detruire() {
        this.sprite?.destroy();
        this.visual?.destroy();
        if (this._timers) for (const t of this._timers) t?.remove?.();
    }

    // ════════════════════════════════════════════════════════════════
    // VAGUE 1 — Éboulis & mur fissuré (statique, cassable)
    // ════════════════════════════════════════════════════════════════

    _creerCassable(typeVisuel) {
        const w = this.data.largeur ?? this.def.largeurDefault;
        const h = this.data.hauteur ?? this.def.hauteurDefault;
        this.hp = this.data.hp ?? this.def.hpDefault;

        // Hitbox bloquante : on l'ajoute au group platforms de la scene pour
        // que le joueur ne puisse PAS le traverser. Cassable = subirDegats().
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.y, w, h, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.scene.physics.add.existing(this.sprite, true); // static body
        this.sprite._obstacle = this;
        // Si la scène a un group obstacles_solides, on s'y ajoute pour collider
        if (this.scene.obstaclesSolides) this.scene.obstaclesSolides.add(this.sprite);
        else if (this.scene.platforms) this.scene.platforms.add(this.sprite);

        // Visuel inline (painterly) : pierre cassée (éboulis) ou mur (mur_fissure)
        this.visual = this.scene.add.graphics();
        this.visual.setDepth(8);
        this._dessinerCassable(typeVisuel, w, h);
    }

    _dessinerCassable(typeVisuel, w, h) {
        const g = this.visual;
        g.clear();
        const cx = this.data.x, cy = this.data.y;

        if (typeVisuel === 'eboulis') {
            // Tas de pierres : ellipse de base + plusieurs pierres empilées
            g.fillStyle(COULEUR_PIERRE_FONCE, 1);
            g.fillEllipse(cx, cy + h / 4, w, h / 2);
            // Pierres principales (3-4 blocs irréguliers)
            const rocks = [
                { dx: -w * 0.3, dy: -h * 0.05, rw: w * 0.45, rh: h * 0.55 },
                { dx:  w * 0.15, dy: -h * 0.10, rw: w * 0.55, rh: h * 0.70 },
                { dx: -w * 0.05, dy: -h * 0.30, rw: w * 0.40, rh: h * 0.50 },
                { dx:  w * 0.30, dy:  h * 0.15, rw: w * 0.35, rh: h * 0.40 }
            ];
            for (const r of rocks) {
                g.fillStyle(COULEUR_PIERRE, 1);
                g.fillEllipse(cx + r.dx, cy + r.dy, r.rw, r.rh);
                g.fillStyle(COULEUR_PIERRE_CLAIR, 0.6);
                g.fillEllipse(cx + r.dx - r.rw * 0.15, cy + r.dy - r.rh * 0.15, r.rw * 0.5, r.rh * 0.25);
            }
            // Fissures (indique cassable)
            g.lineStyle(2, COULEUR_FISSURE, 0.7);
            g.beginPath(); g.moveTo(cx - w * 0.15, cy - h * 0.2); g.lineTo(cx + w * 0.05, cy + h * 0.1); g.strokePath();
            g.beginPath(); g.moveTo(cx + w * 0.10, cy - h * 0.3); g.lineTo(cx + w * 0.25, cy);          g.strokePath();
        } else if (typeVisuel === 'mur_fissure') {
            // Mur vertical : pierre + fissure visible (sait qu'il est cassable)
            g.fillStyle(COULEUR_PIERRE_FONCE, 1);
            g.fillRect(cx - w / 2, cy - h / 2, w, h);
            g.fillStyle(COULEUR_PIERRE, 1);
            g.fillRect(cx - w / 2 + 2, cy - h / 2 + 2, w - 4, h - 4);
            // Mousse sur le haut
            g.fillStyle(0x4a6240, 0.5);
            g.fillRect(cx - w / 2, cy - h / 2, w, 4);
            // Fissure verticale centrale (la plus visible)
            g.lineStyle(2, COULEUR_FISSURE, 0.9);
            g.beginPath();
            g.moveTo(cx, cy - h * 0.4);
            g.lineTo(cx - w * 0.15, cy - h * 0.15);
            g.lineTo(cx + w * 0.1, cy + h * 0.1);
            g.lineTo(cx, cy + h * 0.4);
            g.strokePath();
        }

        // Indicateur de HP : on assombrit selon les hits reçus
        const totalHp = this.data.hp ?? this.def.hpDefault;
        if (this.hp < totalHp) {
            const tx = 1 - (this.hp / totalHp);
            g.fillStyle(0x000000, tx * 0.3);
            g.fillRect(cx - w / 2, cy - h / 2, w, h);
        }
    }

    /** Appelé par GameScene quand le joueur attaque un obstacle cassable. */
    subirDegats(amount = 1) {
        if (this.hp == null || this.hp <= 0) return false;
        this.hp -= amount;
        if (this.hp <= 0) {
            this._briser();
            return true;
        }
        // Visuel : flash + redessine (pour montrer la dégradation)
        this.scene.tweens.add({
            targets: this.visual,
            alpha: { from: 0.3, to: 1 },
            duration: 120
        });
        this._dessinerCassable(this.data.type, this.data.largeur ?? this.def.largeurDefault, this.data.hauteur ?? this.def.hauteurDefault);
        return false;
    }

    _briser() {
        // Persister l'état brisé : la salle ne re-créera pas cet obstacle
        // au prochain load (transit entre salles). Mort = restart étage =
        // reset (cf. retourAuNormal qui purge le registry).
        if (this._cleBrise) this.scene.registry.set(this._cleBrise, true);
        // Burst de particules à la destruction
        if (this.scene.textures.exists('_particule')) {
            const burst = this.scene.add.particles(this.data.x, this.data.y, '_particule', {
                lifespan: 500,
                speed: { min: 80, max: 200 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.7, end: 0 },
                tint: [COULEUR_PIERRE, COULEUR_PIERRE_CLAIR, 0x88643a],
                quantity: 18,
                alpha: { start: 1, end: 0 }
            });
            burst.setDepth(15);
            burst.explode(18);
            this.scene.time.delayedCall(550, () => burst.destroy());
        }
        // Drops optionnels
        if (this.data.dropSel) {
            this.scene.events.emit('obstacle:drop:sel', { x: this.data.x, y: this.data.y, amount: 3 });
        }
        if (this.data.dropFragmentFamille) {
            this.scene.events.emit('obstacle:drop:fragment', { x: this.data.x, y: this.data.y, famille: this.data.dropFragmentFamille });
        }
        // Détruit la collision + le visuel
        this.sprite?.body?.destroy();
        this.sprite?.destroy();
        this.visual?.destroy();
        this.sprite = null;
        this.visual = null;
    }

    // ════════════════════════════════════════════════════════════════
    // VAGUE 1 — Sol qui s'effrite (synergie ancrage)
    // ════════════════════════════════════════════════════════════════

    _creerSolEffrite() {
        const w = this.data.largeur ?? this.def.largeurDefault;
        const h = this.data.hauteur ?? this.def.hauteurDefault;

        // Plateforme one-way (le joueur peut sauter à travers par le bas)
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.y, w, h, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.scene.physics.add.existing(this.sprite, true);
        this.sprite._obstacle = this;
        const body = this.sprite.body;
        body.checkCollision.down = false;
        body.checkCollision.left = false;
        body.checkCollision.right = false;
        if (this.scene.oneWayPlatforms) this.scene.oneWayPlatforms.add(this.sprite);

        // Visuel : plateforme fissurée (subtilité visuelle pour signaler le danger)
        this.visual = this.scene.add.graphics();
        this.visual.setDepth(7);
        this._dessinerSolEffrite(w, h, 0);

        this.effondrementDeclenche = false;
        this._timers = [];
    }

    _dessinerSolEffrite(w, h, intensiteFissure = 0) {
        const g = this.visual;
        g.clear();
        const cx = this.data.x, cy = this.data.y;
        // Plateforme pierre normale (un peu plus claire pour signaler "fragile")
        g.fillStyle(0x7a6850, 1);
        g.fillRect(cx - w / 2, cy - h / 2, w, h);
        g.lineStyle(1, 0x4a3825, 0.8);
        g.strokeRect(cx - w / 2, cy - h / 2, w, h);
        // Fissures de plus en plus marquées (0 = neuf, 1 = sur le point de tomber)
        const nbFissures = Math.floor(2 + intensiteFissure * 5);
        g.lineStyle(1, 0x1a1a1a, 0.4 + intensiteFissure * 0.5);
        for (let i = 0; i < nbFissures; i++) {
            const x1 = cx - w / 2 + (i / nbFissures) * w + (Math.sin(i * 13) * 5);
            const x2 = x1 + 8 + Math.cos(i * 7) * 6;
            g.beginPath();
            g.moveTo(x1, cy - h / 2 + 2);
            g.lineTo(x2, cy + h / 2 - 2);
            g.strokePath();
        }
    }

    _declencherEffondrement() {
        if (this.effondrementDeclenche || !this.sprite) return;
        this.effondrementDeclenche = true;
        const w = this.data.largeur ?? this.def.largeurDefault;
        const h = this.data.hauteur ?? this.def.hauteurDefault;

        // Phase 1 : 1.2s de tremblement / fissures qui s'intensifient
        const totalMs = this.def.delaiEffondrementMs;
        const steps = 6;
        for (let i = 1; i <= steps; i++) {
            this._timers.push(this.scene.time.delayedCall((totalMs / steps) * i, () => {
                if (this.visual) this._dessinerSolEffrite(w, h, i / steps);
                // Petit tremblement
                if (this.visual) this.visual.x = (Math.random() - 0.5) * 3;
            }));
        }
        // Phase 2 : disparition (fade)
        this._timers.push(this.scene.time.delayedCall(totalMs, () => {
            if (!this.sprite) return;
            this.scene.tweens.add({
                targets: this.visual,
                alpha: 0,
                y: this.visual.y + 60,
                duration: this.def.fadeDureeMs,
                onComplete: () => {
                    this.sprite?.body?.destroy();
                    this.sprite?.destroy();
                    this.visual?.destroy();
                    this.sprite = null;
                    this.visual = null;
                }
            });
            // Désactive la collision immédiatement (le visuel finit son fade en chute)
            if (this.sprite?.body) this.sprite.body.checkCollision.up = false;
        }));
    }

    // ════════════════════════════════════════════════════════════════
    // VAGUE 1 — Roc qui tombe
    // ════════════════════════════════════════════════════════════════

    _creerRocTombe() {
        const w = this.def.largeur, h = this.def.hauteur;

        // Sprite : invisible, body sera téléporté entre origine/impact selon phase.
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.yOrigine, w, h, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.scene.physics.add.existing(this.sprite);
        this.sprite._obstacle = this;
        const body = this.sprite.body;
        body.allowGravity = false;
        body.immovable = true;          // le joueur ne peut PAS pousser/grimper sur le roc
        body.setVelocity(0, 0);

        // Visuel : rocher gris (cercle + fissures), placé en haut
        this.visual = this.scene.add.graphics();
        this.visual.setDepth(8);
        this._dessinerRoc(this.data.x, this.data.yOrigine, w, h);

        // Ombre au sol (signal d'avertissement) — au point d'impact
        this.ombre = this.scene.add.ellipse(this.data.x, this.data.yImpact + 14, w * 1.2, 10, 0x000000, 0.4);
        this.ombre.setDepth(6);
        this.ombre.setAlpha(0);

        // Cycle FSM : 'repos' (visible en haut) → 'avertir' (ombre) → 'chute' → 'repos'
        this.rocPhase = 'repos';
        this._timers = [];
        this._lancerCycleRoc();
    }

    _dessinerRoc(cx, cy, w, h) {
        const g = this.visual;
        g.clear();
        g.fillStyle(COULEUR_PIERRE_FONCE, 1);
        g.fillCircle(cx, cy + 2, w / 2);
        g.fillStyle(COULEUR_PIERRE, 1);
        g.fillCircle(cx, cy, w / 2 - 2);
        g.fillStyle(COULEUR_PIERRE_CLAIR, 0.7);
        g.fillCircle(cx - 4, cy - 5, w / 4);
        g.lineStyle(1, COULEUR_FISSURE, 0.6);
        g.beginPath(); g.moveTo(cx - 8, cy - 5); g.lineTo(cx + 6, cy + 8); g.strokePath();
        g.beginPath(); g.moveTo(cx + 4, cy - 8); g.lineTo(cx + 10, cy + 2); g.strokePath();
    }

    _lancerCycleRoc() {
        const lancer = () => {
            if (!this.sprite) return;
            this.rocPhase = 'avertir';
            // Ombre pulse
            this.scene.tweens.add({
                targets: this.ombre,
                alpha: { from: 0, to: 0.7 },
                scaleX: { from: 0.8, to: 1.3 },
                duration: this.def.delaiAvertissementMs,
                ease: 'Sine.easeIn'
            });
            this._timers.push(this.scene.time.delayedCall(this.def.delaiAvertissementMs, () => {
                if (!this.sprite) return;
                this.rocPhase = 'chute';
                this.sprite.body.allowGravity = false;
                this.sprite.body.setVelocityY(this.def.vitesseChute);
            }));
        };

        // Lance immédiatement, et toutes les (avertir + chute_estimée + repos) ms
        const cycleTotalMs = this.def.delaiAvertissementMs +
                             ((this.data.yImpact - this.data.yOrigine) / this.def.vitesseChute * 1000) +
                             this.def.delaiReposMs;
        this._timers.push(this.scene.time.delayedCall(800, lancer));
        this._timers.push(this.scene.time.addEvent({
            delay: cycleTotalMs,
            loop: true,
            startAt: 0,
            callback: () => {
                // Reset roc en haut, ombre off, relance cycle
                if (!this.sprite) return;
                this.sprite.y = this.data.yOrigine;
                this.sprite.body.setVelocity(0, 0);
                if (this.visual) {
                    this.visual.clear();
                    this._dessinerRoc(this.data.x, this.data.yOrigine, this.def.largeur, this.def.hauteur);
                }
                if (this.ombre) this.ombre.setAlpha(0).setScale(1);
                this.rocPhase = 'repos';
                this._timers.push(this.scene.time.delayedCall(this.def.delaiReposMs / 2, lancer));
            }
        }));
    }

    // ════════════════════════════════════════════════════════════════
    // VAGUE 1 — Plaque de pression
    // ════════════════════════════════════════════════════════════════

    _creerPlaque() {
        const w = this.def.largeurDefault, h = this.def.hauteurDefault;
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.y, w, h, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.scene.physics.add.existing(this.sprite, true);
        this.sprite._obstacle = this;

        // Visuel : plaque de pierre/cuivre encastrée
        this.visual = this.scene.add.graphics();
        this.visual.setDepth(6);
        this._dessinerPlaque(w, h, false);

        this.plaqueActivee = false;
        this.dernierBoost = 0; // réutilise pour cooldown réactivation
        this._effetsActifs = [];
    }

    _dessinerPlaque(w, h, active) {
        const g = this.visual;
        g.clear();
        const cx = this.data.x, cy = this.data.y;
        // Socle pierre
        g.fillStyle(COULEUR_PIERRE_FONCE, 1);
        g.fillRect(cx - w / 2, cy - h / 2, w, h);
        // Plaque cuivre/or
        g.fillStyle(active ? 0xc8a85a : COULEUR_PLAQUE, 1);
        g.fillRect(cx - w / 2 + 2, cy - h / 2 + 2, w - 4, h - 4);
        // Glyphes runiques au centre
        g.lineStyle(1, active ? 0xffd070 : 0x553318, 0.8);
        g.beginPath();
        g.moveTo(cx - 8, cy - 1);
        g.lineTo(cx + 8, cy - 1);
        g.moveTo(cx, cy - 3);
        g.lineTo(cx, cy + 1);
        g.strokePath();
    }

    _activerPlaque() {
        const now = this.scene.time.now;
        if (this.plaqueActivee && now - this.dernierBoost < this.def.cooldownReactivationMs) return;
        this.dernierBoost = now;
        this.plaqueActivee = true;
        this._dessinerPlaque(this.def.largeurDefault, this.def.hauteurDefault, true);

        // Effet : pour MVP, 'pieux' fait apparaitre des pieux à params.positions
        if (this.data.effet === 'pieux' && Array.isArray(this.data.params?.positions)) {
            const dureeMs = this.data.params.dureeMs ?? 2500;
            const pieux = [];
            for (const pos of this.data.params.positions) {
                // Sprite physique pieu (static body)
                const pieuRect = this.scene.add.rectangle(pos.x, pos.y, 20, 14, 0xffffff, 0);
                pieuRect.setAlpha(0);
                this.scene.physics.add.existing(pieuRect, true);
                pieuRect._dernierHit = 0;
                // Overlap direct avec le joueur : émet 'obstacle:pieu:hit' avec
                // un faux objet { def } que le handler global lit pour dégâts.
                // PAS d'ajout à scene.obstacles[] (ça casserait update() global —
                // ces pieux n'ont pas de cycle, juste une durée de vie).
                const fauxObs = { def: TYPES_OBSTACLES.pieu };
                const overlap = this.scene.physics.add.overlap(
                    this.scene.player, pieuRect, () => {
                        const t = this.scene.time.now;
                        if (t - pieuRect._dernierHit < 600) return;
                        pieuRect._dernierHit = t;
                        this.scene.events.emit('obstacle:pieu:hit', fauxObs);
                    }
                );
                // Visuel : triangles pourpres (différents des pieux fixes)
                const visuel = this.scene.add.graphics();
                visuel.setDepth(8);
                visuel.fillStyle(COULEUR_RACINE_VIVE, 1);
                visuel.fillTriangle(pos.x - 8, pos.y + 7, pos.x + 8, pos.y + 7, pos.x, pos.y - 7);
                visuel.setAlpha(0);
                this.scene.tweens.add({ targets: visuel, alpha: 1, duration: 150 });
                pieux.push({ rect: pieuRect, visuel, overlap });
            }
            // Retire les pieux après dureeMs
            this.scene.time.delayedCall(dureeMs, () => {
                for (const p of pieux) {
                    p.overlap?.destroy();
                    p.rect?.destroy();
                    p.visuel?.destroy();
                }
                this.plaqueActivee = false;
                this._dessinerPlaque(this.def.largeurDefault, this.def.hauteurDefault, false);
            });
        }
    }

    // ════════════════════════════════════════════════════════════════
    // VAGUE 2 — Racines tentaculaires du Reflux
    // ════════════════════════════════════════════════════════════════

    _creerRacinesReflux() {
        const w = this.data.largeur ?? this.def.largeurDefault;
        const h = this.data.hauteur ?? this.def.hauteurDefault;

        // Sprite : la collision sera réactivée/désactivée selon la phase du cycle
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.y, w, h, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.scene.physics.add.existing(this.sprite, true);
        this.sprite._obstacle = this;
        // On l'ajoute aux oneWayPlatforms : utilisable en phase "plateforme"
        if (this.scene.oneWayPlatforms) this.scene.oneWayPlatforms.add(this.sprite);
        const body = this.sprite.body;
        body.checkCollision.down = false;
        body.checkCollision.left = false;
        body.checkCollision.right = false;

        this.visual = this.scene.add.graphics();
        this.visual.setDepth(7);
        this.racinesPhase = 'plateforme';
        this._t0 = this.scene.time.now + (this.data.offsetMs ?? 0);
    }

    _updateRacines(now) {
        const cycle = this.data.cycleMs ?? this.def.cycleMs;
        const t = ((now - this._t0) % cycle) / cycle;
        // 33% du cycle = plateforme (utilisable), 67% = pieu (dégâts)
        const enPlateforme = t < this.def.plateformeRatio;
        const w = this.data.largeur ?? this.def.largeurDefault;
        const h = this.data.hauteur ?? this.def.hauteurDefault;
        const cx = this.data.x, cy = this.data.y;

        // Redessine selon phase
        const g = this.visual;
        g.clear();
        // Calcule la progression dans la phase courante (0..1) pour anim subtile
        const phaseProgress = enPlateforme ? t / this.def.plateformeRatio
                                          : (t - this.def.plateformeRatio) / (1 - this.def.plateformeRatio);

        // DA "mécanisme ancien Ruines" : socle de pierre encastré au sol,
        // pieux métalliques anciens qui sortent et rentrent du socle. Le
        // Reflux est visible dans les rainures pourpres pulsantes (au lieu
        // de racines organiques pourpres pas cohérentes avec Ruines).
        const socleH = Math.min(h * 0.4, 18);
        const socleTop = cy + h / 2 - socleH;
        // Socle pierre commun aux 2 phases
        g.fillStyle(COULEUR_PIERRE_FONCE, 1);
        g.fillRect(cx - w / 2, socleTop, w, socleH);
        g.fillStyle(COULEUR_PIERRE, 1);
        g.fillRect(cx - w / 2 + 3, socleTop + 3, w - 6, socleH - 6);
        // Rainure du mécanisme (ouverture où les pieux émergent)
        g.fillStyle(0x1a1a1a, 1);
        g.fillRect(cx - w * 0.35, socleTop + 2, w * 0.7, 4);

        if (enPlateforme) {
            // PHASE REPOS : mécanisme rentré. Plaque cuivre + glyphes dorées
            // qui pulsent. Surface plate utilisable.
            g.fillStyle(COULEUR_PLAQUE, 1);
            g.fillRect(cx - w / 2 + 6, socleTop - 4, w - 12, 4);
            const intensite = 0.4 + 0.4 * Math.sin(phaseProgress * Math.PI);
            g.lineStyle(1, 0xffd070, intensite);
            for (let i = 0; i < 3; i++) {
                const gx = cx - w / 2 + (i + 1) * (w / 4);
                g.beginPath();
                g.moveTo(gx - 4, socleTop - 1);
                g.lineTo(gx + 4, socleTop - 1);
                g.strokePath();
                g.beginPath();
                g.moveTo(gx, socleTop - 3);
                g.lineTo(gx, socleTop + 1);
                g.strokePath();
            }
        } else {
            // PHASE PIEUX : mécanisme ACTIF. Pieux métalliques sortent du
            // socle. Animation de sortie (0 → 1 sur le début de la phase).
            const sortie = Math.min(1, phaseProgress * 3);
            const hauteurPics = (h * 0.6) * sortie;
            const piecsBaseY = socleTop;
            const piecsTopY = piecsBaseY - hauteurPics;

            // Lueur pourpre du Reflux qui active le mécanisme
            g.fillStyle(COULEUR_RACINE_VIVE, 0.12 * sortie);
            g.fillRect(cx - w / 2, piecsTopY - 4, w, hauteurPics + 10);

            const nbPics = 4;
            for (let i = 0; i < nbPics; i++) {
                const px = cx - w / 2 + (i + 0.5) * (w / nbPics);
                const variation = (i % 2) * 2;
                const pTop = piecsTopY + variation;
                const pBot = piecsBaseY;
                const pWidth = 8;
                if (pBot - pTop <= 0) continue;
                // Tige métallique sombre
                g.fillStyle(0x2a2a2a, 1);
                g.fillRect(px - pWidth / 2, pTop, pWidth, pBot - pTop);
                // Reflet clair côté gauche
                g.fillStyle(0x6a6a6a, 0.9);
                g.fillRect(px - pWidth / 2, pTop, 2, pBot - pTop);
                // Pointe acérée triangulaire
                g.fillStyle(0x9a9a9a, 1);
                g.fillTriangle(
                    px - pWidth / 2, pTop + 2,
                    px + pWidth / 2, pTop + 2,
                    px, pTop - 6
                );
                // Rainure pourpre centrale (le Reflux palpite)
                const pulseR = 0.5 + 0.5 * Math.sin(phaseProgress * Math.PI * 4 + i);
                g.fillStyle(COULEUR_RACINE_VIVE, pulseR);
                g.fillRect(px - 1, pTop + 4, 2, Math.max(0, pBot - pTop - 8));
            }
        }

        // Active/désactive la collision
        if (this.sprite?.body) {
            this.sprite.body.checkCollision.up = enPlateforme;
        }
        this.racinesPhase = enPlateforme ? 'plateforme' : 'pieu';
    }

    // ════════════════════════════════════════════════════════════════
    // VAGUE 2 — Anti-ancrage (zone non-physique)
    // ════════════════════════════════════════════════════════════════

    _creerAntiAncrage() {
        const w = this.data.largeur ?? this.def.largeurDefault;
        const h = this.data.hauteur ?? this.def.hauteurDefault;
        // Pas de sprite physique : zone purement logique pour AncrageSystem.
        this.zoneRect = new Phaser.Geom.Rectangle(
            this.data.x - w / 2, this.data.y - h / 2, w, h
        );

        // Visuel : NUAGE de petites veines pourpres flottantes, pas de fond
        // plein. Discret mais identifiable. Particules animées tournent
        // lentement dans la zone pour la signaler sans dominer la salle.
        this.visual = this.scene.add.graphics();
        this.visual.setDepth(4);

        // Génère N "spores" pourpres qui flottent + tournent dans la zone
        const cx = this.data.x, cy = this.data.y;
        const seed = (cx * 13 + cy * 7) | 0;
        const rand = (i) => {
            const x = Math.sin(seed + i * 91.6) * 10000;
            return x - Math.floor(x);
        };
        this._spores = [];
        const nb = Math.floor(w * h / 12000);    // densité ~1 spore par 110×110 px
        for (let i = 0; i < nb; i++) {
            const x = cx - w / 2 + rand(i * 3) * w;
            const y = cy - h / 2 + rand(i * 3 + 1) * h;
            const phase = rand(i * 3 + 2) * Math.PI * 2;
            const taille = 2 + rand(i * 3 + 5) * 3;
            this._spores.push({ x, y, phase, taille, baseX: x, baseY: y });
        }
        this._t0 = this.scene.time.now;
        this._dessinerAntiAncrage();
        // Update régulier (cf. update() pour le dessin animé)
    }

    _dessinerAntiAncrage() {
        const g = this.visual;
        g.clear();
        if (!this._spores) return;
        const now = this.scene.time.now;
        const t = (now - this._t0) / 1000;     // secondes
        g.setBlendMode(Phaser.BlendModes.ADD);
        for (const s of this._spores) {
            // Léger flottement orbital autour de la position de base
            const ox = Math.sin(t * 0.7 + s.phase) * 12;
            const oy = Math.cos(t * 0.9 + s.phase) * 10;
            const x = s.baseX + ox;
            const y = s.baseY + oy;
            const pulse = 0.4 + 0.3 * Math.sin(t * 1.5 + s.phase);
            // Halo flou (pourpre clair)
            g.fillStyle(COULEUR_RACINE_VIVE, pulse * 0.5);
            g.fillCircle(x, y, s.taille * 2.5);
            // Cœur dense (pourpre foncé)
            g.fillStyle(COULEUR_RACINE, pulse);
            g.fillCircle(x, y, s.taille);
        }
        g.setBlendMode(Phaser.BlendModes.NORMAL);
    }

    /** Lecture par AncrageSystem : le point (px,py) est-il dans la zone ? */
    contient(px, py) {
        if (this.data.type !== 'anti_ancrage' || !this.zoneRect) return false;
        return this.zoneRect.contains(px, py);
    }
}
