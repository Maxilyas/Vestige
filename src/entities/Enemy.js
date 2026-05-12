// Entité Enemy — un ennemi du Présent.
//
// Architecture :
//   - Rectangle physique invisible (sprite) qui porte la collision arcade.
//   - Visuel paramétrique (Container Phaser) qui suit le sprite chaque frame.
//   - IA dispatchée via `def.archetype` (cf. systems/EnemyComportements.js).
//   - Tireur peut émettre `enemy:tir` que GameScene capte pour spawner un
//     Projectile.

import { COMPORTEMENTS } from '../systems/EnemyComportements/index.js';
import { creerVisuelEnnemi } from '../render/entities/EnemyVisuel.js';
import { DEPTH, tracerCourbeQuadratique } from '../render/PainterlyRenderer.js';

export class Enemy {
    constructor(scene, def, x, y, indexEnnemi) {
        this.scene = scene;
        this.def = def;
        this.indexEnnemi = indexEnnemi;
        this.hp = def.hp;
        this.hpMax = def.hp;
        this.direction = 1;
        this.xInit = x;
        this.yInit = y;
        this.mort = false;
        this.estBoss = !!def.estBoss;

        // Rectangle physique invisible
        this.sprite = scene.add.rectangle(x, y, def.largeur, def.hauteur, 0xffffff, 0);
        this.sprite.setAlpha(0);
        scene.physics.add.existing(this.sprite);
        const body = this.sprite.body;
        body.allowGravity = !!def.gravite;
        // Toujours clamp dans les bounds du monde, même pour les ennemis volants —
        // sinon un Tisseur/Tireur peut s'échapper de la salle pendant le kite.
        body.setCollideWorldBounds(true);
        this.sprite._enemy = this;

        // Visuel paramétrique
        this.visual = creerVisuelEnnemi(scene, def);
        this.visual.setPosition(x, y);

        // Init du comportement (si requis)
        const compo = COMPORTEMENTS[def.archetype];
        if (compo?.init) compo.init(this);
    }

    update(player) {
        if (this.mort) return;
        const compo = COMPORTEMENTS[this.def.archetype];
        if (!compo) return;

        const result = compo.update(this, player);

        // Tir éventuel (Tireur)
        if (result?.tirer) {
            this.scene.events.emit('enemy:tir', this, result.tirer);
        }
        // Spawn éventuel (Spawner) — params { def, x, y }
        if (result?.spawn) {
            this.scene.events.emit('enemy:spawn', this, result.spawn);
        }

        // Le visuel suit la position du sprite physique
        if (this.visual?.active) {
            this.visual.setPosition(this.sprite.x, this.sprite.y);
            // Flip horizontal selon la direction (sauf Tireur stationnaire neutre)
            if (this.def.archetype !== 'tireur' || this.def.vitesse > 0) {
                this.visual.scaleX = this.direction || 1;
            }
        }
    }

    recevoirDegats(montant) {
        if (this.mort) return;
        this.hp -= montant;

        // Flash blanc sur le visuel
        if (this.visual?.active) {
            const overlay = this.scene.add.graphics();
            overlay.setDepth((this.visual.depth ?? DEPTH.ENTITES) + 1);
            overlay.fillStyle(0xffffff, 0.85);
            overlay.fillRect(-this.def.largeur / 2, -this.def.hauteur / 2,
                             this.def.largeur, this.def.hauteur);
            overlay.setPosition(this.sprite.x, this.sprite.y);
            overlay.setBlendMode(Phaser.BlendModes.ADD);
            this.scene.tweens.add({
                targets: overlay, alpha: 0, duration: 100,
                onComplete: () => overlay.destroy()
            });
        }

        if (this.hp <= 0) this.mourir();
    }

    /**
     * Animation d'attaque déclenchée quand l'ennemi inflige des dégâts au contact.
     * Visuel signature par archétype, plus particules d'impact + squash & stretch.
     */
    jouerAttaqueContact(scene, cible) {
        if (this.mort || !this.visual?.active) return;
        const w = this.def.largeur, h = this.def.hauteur;
        const dirX = cible ? Math.sign(cible.x - this.sprite.x) || 1 : 1;
        const visualDepth = this.visual.depth ?? DEPTH.ENTITES;

        switch (this.def.archetype) {
            case 'veilleur': this._attaqueVeilleur(scene, dirX, w, h, visualDepth); break;
            case 'traqueur': this._attaqueTraqueur(scene, dirX, w, h, visualDepth); break;
            case 'chargeur': this._attaqueChargeur(scene, dirX, w, h, visualDepth); break;
            case 'tireur':   this._attaqueTireur  (scene, dirX, w, h, visualDepth); break;
        }

        // Squash & stretch
        const auSol = !!this.def.gravite;
        scene.tweens.add({
            targets: this.visual,
            scaleX: { from: this.direction, to: (auSol ? 1.25 : 0.85) * this.direction },
            scaleY: { from: 1, to: auSol ? 0.82 : 1.3 },
            duration: 100, ease: 'Cubic.Out', yoyo: true,
            onComplete: () => {
                if (this.visual?.active) {
                    this.visual.scaleX = this.direction;
                    this.visual.scaleY = 1;
                }
            }
        });

        // Particules d'impact (couleurs adaptées)
        if (cible && scene.textures.exists('_particule')) {
            const impactX = (this.sprite.x + cible.x) / 2;
            const impactY = (this.sprite.y + cible.y) / 2;
            const tint = this._couleursImpact();
            const burst = scene.add.particles(impactX, impactY, '_particule', {
                lifespan: 360,
                speed: { min: 60, max: 160 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.5, end: 0 },
                tint, quantity: 8,
                blendMode: Phaser.BlendModes.ADD,
                alpha: { start: 0.9, end: 0 }
            });
            burst.setDepth(DEPTH.EFFETS);
            burst.explode(8);
            scene.time.delayedCall(400, () => burst.destroy());
        }
    }

    _couleursImpact() {
        const accent = this.def.palette?.accent ?? 0xff8040;
        return [0xffffff, accent];
    }

    // === Veilleur : poing rocailleux + œil pulsant (signature historique) ===
    _attaqueVeilleur(scene, dirX, w, h, visualDepth) {
        const couleurAccent = this.def.palette?.accent ?? 0xff3030;
        const couleurCorps = this.def.palette?.corps ?? 0x4a4a5a;
        const poing = scene.add.graphics();
        poing.setDepth(DEPTH.EFFETS);
        poing.setPosition(this.sprite.x + dirX * (w / 2), this.sprite.y);
        poing.fillStyle(0x1a1a24, 1);
        poing.beginPath();
        poing.moveTo(0, -11); poing.lineTo(dirX * 30, -5);
        poing.lineTo(dirX * 30, 5); poing.lineTo(0, 11);
        poing.closePath(); poing.fillPath();
        poing.fillStyle(couleurCorps, 1);
        poing.beginPath();
        poing.moveTo(0, -10); poing.lineTo(dirX * 28, -4);
        poing.lineTo(dirX * 28, 4); poing.lineTo(0, 10);
        poing.closePath(); poing.fillPath();

        const liseré = scene.add.graphics();
        liseré.setDepth(DEPTH.EFFETS);
        liseré.setPosition(this.sprite.x + dirX * (w / 2), this.sprite.y);
        liseré.setBlendMode(Phaser.BlendModes.ADD);
        liseré.lineStyle(2, couleurAccent, 0.9);
        liseré.beginPath();
        liseré.moveTo(0, -10); liseré.lineTo(dirX * 28, -4);
        liseré.lineTo(dirX * 28, 4); liseré.lineTo(0, 10);
        liseré.strokePath();

        scene.tweens.add({
            targets: [poing, liseré],
            scaleX: { from: 0.3, to: 1.15 }, alpha: { from: 1, to: 0 },
            duration: 240, ease: 'Cubic.Out',
            onComplete: () => { poing.destroy(); liseré.destroy(); }
        });

        // Pulse de l'œil/accent
        const oeil = scene.add.graphics();
        oeil.setPosition(this.sprite.x, this.sprite.y - 2);
        oeil.setDepth(visualDepth + 1);
        oeil.setBlendMode(Phaser.BlendModes.ADD);
        oeil.fillStyle(couleurAccent, 0.85);
        oeil.fillCircle(0, 0, 9);
        oeil.fillStyle(0xffffff, 0.9);
        oeil.fillCircle(0, 0, 4);
        scene.tweens.add({
            targets: oeil, scale: { from: 0.5, to: 2 }, alpha: { from: 1, to: 0 },
            duration: 240, ease: 'Cubic.Out', onComplete: () => oeil.destroy()
        });
    }

    // === Traqueur : serres spectrales en éventail (signature historique) ===
    _attaqueTraqueur(scene, dirX, w, h, visualDepth) {
        const baseX = this.sprite.x + dirX * (w / 2);
        const baseY = this.sprite.y;
        const palette = this.def.palette ?? {};
        const cVoile = palette.voile ?? 0xa0c0d8;
        const cYeux = palette.yeux ?? 0xa0d0ff;
        const offsets = [-16, -6, 6, 16];

        const tracerCourbes = (g, lineWidth, couleur, alpha, longueur) => {
            g.lineStyle(lineWidth, couleur, alpha);
            for (const yOff of offsets) {
                const cpX = dirX * (longueur * 0.45);
                const cpY = yOff * 1.6;
                tracerCourbeQuadratique(
                    g, 0, yOff * 0.25, cpX, cpY, dirX * longueur, yOff, 14
                );
            }
        };

        const couches = [
            { lw: 10, c: cVoile, a: 0.35, l: 30 },
            { lw: 5,  c: cYeux,  a: 0.85, l: 30 },
            { lw: 2,  c: 0xe8f4ff, a: 1, l: 28 }
        ];
        const objets = couches.map(({ lw, c, a, l }) => {
            const g = scene.add.graphics();
            g.setDepth(DEPTH.EFFETS);
            g.setBlendMode(Phaser.BlendModes.ADD);
            g.setPosition(baseX, baseY);
            tracerCourbes(g, lw, c, a, l);
            return g;
        });
        scene.tweens.add({
            targets: objets,
            scaleX: { from: 0.35, to: 1.4 }, scaleY: { from: 1.2, to: 0.9 },
            alpha: { from: 1, to: 0 }, duration: 320, ease: 'Cubic.Out',
            onComplete: () => objets.forEach(o => o.destroy())
        });
    }

    // === Chargeur : impact de course frontal — onde de choc + poussière ===
    _attaqueChargeur(scene, dirX, w, h, visualDepth) {
        const cAccent = this.def.palette?.accent ?? 0xffa040;
        // Onde de choc en arc
        const onde = scene.add.graphics();
        onde.setDepth(DEPTH.EFFETS);
        onde.setBlendMode(Phaser.BlendModes.ADD);
        onde.setPosition(this.sprite.x + dirX * (w / 2 + 4), this.sprite.y);
        onde.lineStyle(4, cAccent, 0.85);
        onde.beginPath();
        onde.arc(0, 0, 18, dirX > 0 ? -1.0 : Math.PI - 1.0,
                          dirX > 0 ? 1.0 : Math.PI + 1.0, false);
        onde.strokePath();
        onde.lineStyle(2, 0xffffff, 1);
        onde.beginPath();
        onde.arc(0, 0, 12, dirX > 0 ? -1.0 : Math.PI - 1.0,
                          dirX > 0 ? 1.0 : Math.PI + 1.0, false);
        onde.strokePath();
        scene.tweens.add({
            targets: onde, scale: { from: 0.6, to: 2.2 },
            alpha: { from: 1, to: 0 }, duration: 280, ease: 'Cubic.Out',
            onComplete: () => onde.destroy()
        });
        // Tampon de poussière au sol
        if (scene.textures.exists('_particule')) {
            const burst = scene.add.particles(this.sprite.x, this.sprite.y + h / 2 - 4, '_particule', {
                lifespan: 380,
                speed: { min: 60, max: 140 },
                angle: dirX > 0 ? { min: -50, max: 30 } : { min: 150, max: 230 },
                scale: { start: 0.55, end: 0 },
                tint: [0xa08060, 0xc8a060, 0x6a4a3a],
                quantity: 10,
                alpha: { start: 0.9, end: 0 }
            });
            burst.setDepth(DEPTH.EFFETS);
            burst.explode(10);
            scene.time.delayedCall(420, () => burst.destroy());
        }
    }

    // === Tireur : pulse de l'iris au contact (rare cas) ===
    _attaqueTireur(scene, dirX, w, h, visualDepth) {
        const cAccent = this.def.palette?.iris ?? this.def.palette?.accent ?? 0xff8040;
        const pulse = scene.add.graphics();
        pulse.setDepth(visualDepth + 1);
        pulse.setBlendMode(Phaser.BlendModes.ADD);
        pulse.setPosition(this.sprite.x, this.sprite.y);
        pulse.fillStyle(cAccent, 0.7);
        pulse.fillCircle(0, 0, w * 0.45);
        pulse.fillStyle(0xffffff, 0.85);
        pulse.fillCircle(0, 0, w * 0.22);
        scene.tweens.add({
            targets: pulse, scale: { from: 0.4, to: 2.2 },
            alpha: { from: 1, to: 0 }, duration: 280, ease: 'Cubic.Out',
            onComplete: () => pulse.destroy()
        });
    }

    mourir() {
        if (this.mort) return;
        this.mort = true;
        this.sprite.body.enable = false;

        if (this.visual?.active) {
            this.scene.tweens.add({
                targets: this.visual,
                alpha: 0, scaleX: 0.6, scaleY: 0.6, duration: 250,
                onComplete: () => this.visual?.destroy()
            });
        }
        this.scene.tweens.add({
            targets: this.sprite, alpha: 0, duration: 250,
            onComplete: () => this.sprite.destroy()
        });
        this.scene.events.emit('enemy:dead', this);
    }
}
