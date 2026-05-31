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
//
// Vague 3 (Halls Cendrés) :
//   - brasier_mobile    : zone de feu cyclique (ON dégâts ↔ OFF inerte)
//   - mur_explosif      : mur fissuré qui éclate en projectiles à la rupture

import { TYPES_OBSTACLES } from '../data/obstacles.js';
import { creerVisuelPieux } from '../render/entities/Pieux.js';
import { creerVisuelRessort, jouerDeclenchementRessort } from '../render/entities/Ressort.js';
import { creerVisuelPlateformeMobile } from '../render/entities/PlateformeMobile.js';
import { peindreOrnementPlateforme } from '../render/PlateformeStyle.js';

// Palette Ruines basses (utilisée pour les visuels inline ci-dessous)
const COULEUR_PIERRE       = 0x5a6850;
const COULEUR_PIERRE_FONCE = 0x2a352a;
const COULEUR_PIERRE_CLAIR = 0x7a8a6a;
const COULEUR_RACINE       = 0x6a2070;
const COULEUR_RACINE_VIVE  = 0xa030c0;
const COULEUR_FISSURE      = 0x1a1a1a;
const COULEUR_PLAQUE       = 0x88643a;     // or terni (cf. paletteBiome.accent)

// Palette Halls Cendrés (pour brasier_mobile + mur_explosif)
const COULEUR_BRAISE       = 0xff7028;
const COULEUR_BRAISE_VIVE  = 0xffaa50;
const COULEUR_BRAISE_FONCE = 0xa83820;
const COULEUR_SUIE         = 0x18120e;
const COULEUR_CUIVRE_TERNI = 0xa86838;

// Palette Cristaux Glacés (Vague 6 — stalactite/verglas/faille/chant/blizzard)
const COULEUR_GLACE        = 0x6a92c8;   // cristal bleu (contour plateforme)
const COULEUR_GLACE_CLAIR  = 0xd8e8ff;   // givre blanc-bleu lumineux
const COULEUR_GLACE_FONCE  = 0x2a4262;   // pierre minéralisée gelée
const COULEUR_MORT         = 0x8a98aa;   // gris « résonance morte » (stalactite)
const COULEUR_MORT_FONCE   = 0x4a5566;
const COULEUR_MNESIQUE     = 0xb898e8;   // violet mnésique (cristal résonant)
const COULEUR_MNESIQUE_VIF = 0xe0c0ff;
const COULEUR_VIDE         = 0x0a0612;   // « Présent pur » (faille de vide)

// Palette Voile Inversé (Vague 8 — bloc_gravite / contrepoids / balance)
const COULEUR_VOILE_PIERRE = 0x3a2548;   // marbre aubergine corrompu
const COULEUR_VOILE_FONCE  = 0x1a0f24;   // ombre abîme violet-noir
const COULEUR_VOILE_CLAIR  = 0x5a4068;   // arête éclairée
const COULEUR_VOILE_MAGENTA = 0xff5078;  // suintement / runes d'inversion (= overlay pendule)
const COULEUR_VOILE_NACRE  = 0x70c0a0;   // nacre malade vert spectral (accent métal)

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
        else if (data.type === 'brasier_mobile')    this._creerBrasierMobile();
        else if (data.type === 'mur_explosif')      this._creerCassable('mur_explosif');
        else if (data.type === 'mur_secret')        this._creerMurSecret();
        // ─── Vague 4 (Phase 9.7) ───
        else if (data.type === 'geyser_vapeur')     this._creerGeyserVapeur();
        else if (data.type === 'rideau_acide')      this._creerRideauAcide();
        else if (data.type === 'bloc_charbon')      this._creerBlocCharbon();
        // ─── Vague 5 (Phase 9.8) ───
        else if (data.type === 'marteau_pilon')     this._creerMarteauPilon();
        else if (data.type === 'piston_thermique')  this._creerPistonThermique();
        else if (data.type === 'scie_circulaire')   this._creerScieCirculaire();
        // ─── Vague 6 (Cristaux Glacés — « Silence & Glace ») ───
        else if (data.type === 'stalactite_resonance') this._creerStalactiteResonance();
        else if (data.type === 'verglas')           this._creerVerglas();
        else if (data.type === 'faille_vide')       this._creerFailleVide();
        else if (data.type === 'cristal_resonant')  this._creerCristalResonant();
        else if (data.type === 'plateforme_resonance') this._creerPlateformeResonance();
        else if (data.type === 'souffle_blizzard')  this._creerSouffleBlizzard();
        // ─── Vague 7 (Cristaux Glacés — « Le Miroir ») ───
        else if (data.type === 'plateforme_miroir') this._creerPlateformeMiroir();
        else if (data.type === 'faux_sol_miroir')   this._creerFauxSolMiroir();
        else if (data.type === 'laser_prisme')      this._creerLaserPrisme();
        // ─── Vague 8 (Voile Inversé — mécaniques de gravité) ───
        else if (data.type === 'bloc_gravite')      this._creerBlocGravite();
        else if (data.type === 'contrepoids')       this._creerContrepoids();
        else if (data.type === 'balance')           this._creerBalance();
        // ─── Cœur du Reflux (Vague 9 — obstacles VUE DE DESSUS) ───
        else if (data.type === 'zone_oubli')        this._creerZoneOubli();
        else if (data.type === 'courant_reflux')    this._creerCourantReflux();
        else if (data.type === 'laser_surveillance') this._creerLaserSurveillance();
        else if (data.type === 'onde_radiale')      this._creerOndeRadiale();
        else if (data.type === 'pieu_mnemonique')   this._creerPieuMnemonique();
        else if (data.type === 'regard_fige')       this._creerRegardFige();
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
        else if (this.data.type === 'brasier_mobile') {
            if (!this.sprite || !this.sprite.active) return;
            this._updateBrasier(this.scene.time.now);
        }
        else if (this.data.type === 'mur_explosif') {
            // Pulse animé du cœur incandescent (lecture danger croissant)
            if (this.visual?.active) {
                this._dessinerCassable('mur_explosif',
                    this.data.largeur ?? this.def.largeurDefault,
                    this.data.hauteur ?? this.def.hauteurDefault);
            }
        }
        else if (this.data.type === 'geyser_vapeur') {
            if (!this.sprite || !this.sprite.active) return;
            this._updateGeyserVapeur(this.scene.time.now);
        }
        else if (this.data.type === 'rideau_acide') {
            if (this.visual?.active) this._dessinerRideauAcide(this.scene.time.now);
        }
        else if (this.data.type === 'bloc_charbon') {
            if (!this.sprite || !this.sprite.active) return;
            this._updateBlocCharbon(this.scene.time.now);
        }
        else if (this.data.type === 'marteau_pilon') {
            if (!this.sprite || !this.sprite.active) return;
            this._updateMarteauPilon(this.scene.time.now);
        }
        else if (this.data.type === 'piston_thermique') {
            if (!this.sprite || !this.sprite.active) return;
            this._updatePistonThermique(this.scene.time.now);
        }
        else if (this.data.type === 'scie_circulaire') {
            if (!this.sprite || !this.sprite.active) return;
            this._updateScieCirculaire(this.scene.time.now);
        }
        else if (this.data.type === 'stalactite_resonance') {
            if (this.sprite?.active) this._updateStalactite(this.scene.time.now);
        }
        else if (this.data.type === 'souffle_blizzard') {
            if (this.visual?.active) this._dessinerBlizzard(this.scene.time.now);
        }
        else if (this.data.type === 'plateforme_miroir') {
            if (this.sprite?.active) this._updatePlateformeMiroir(this.scene.time.now);
        }
        else if (this.data.type === 'faux_sol_miroir') {
            if (this.visual?.active) this._dessinerFauxSol(this.scene.time.now);
        }
        else if (this.data.type === 'laser_prisme') {
            if (this.sprite?.active) this._updateLaserPrisme(this.scene.time.now);
        }
        else if (this.data.type === 'bloc_gravite') {
            if (this.sprite?.active) this._updateBlocGravite();
        }
        else if (this.data.type === 'contrepoids') {
            if (this.visual?.active) this._dessinerContrepoids();
        }
        else if (this.data.type === 'balance') {
            if (this.spriteG?.active) this._updateBalance();
        }
        else if (this.data.type === 'courant_reflux') {
            if (this.visual?.active) this._dessinerCourant(this.scene.time.now);
        }
        else if (this.data.type === 'laser_surveillance') {
            if (this.visual?.active) this._updateLaserSurveillance(this.scene.time.now);
        }
        else if (this.data.type === 'onde_radiale') {
            if (this.visual?.active) this._updateOndeRadiale(this.scene.time.now);
        }
        else if (this.data.type === 'pieu_mnemonique') {
            if (this.sprite?.active) this._updatePieuMnemonique(this.scene.time.now);
        }
        else if (this.data.type === 'regard_fige') {
            if (this.visual?.active) this._updateRegardFige(this.scene.time.now);
        }
        // zone_oubli : visuel statique animé par tween, rien à faire par frame.
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
        } else if (this.data.type === 'brasier_mobile') {
            // Dégâts uniquement en phase 'feu'
            if (this.brasierPhase !== 'feu') return;
            if (now - this.dernierHit < this.def.invincibiliteApresHit) return;
            this.dernierHit = now;
            scene.events.emit('obstacle:pieu:hit', this);
        } else if (this.data.type === 'geyser_vapeur') {
            // Phase ON : dégâts + boost vy fort (catapulte verticale)
            if (this.geyserPhase !== 'vapeur') return;
            if (now - this.dernierHit < this.def.invincibiliteApresHit) return;
            this.dernierHit = now;
            // Catapulte : on impose vy = boostVy (au lieu d'additionner)
            const cooldownB = this.def.cooldownBoostMs ?? 250;
            if (now - this.dernierBoost > cooldownB) {
                this.dernierBoost = now;
                player.body.setVelocityY(this.data.boostVy ?? this.def.boostVy);
            }
            scene.events.emit('obstacle:pieu:hit', this);
        } else if (this.data.type === 'rideau_acide') {
            // Dégâts continus (avec invincibilité brève pour permettre traversée)
            if (now - this.dernierHit < this.def.invincibiliteApresHit) return;
            this.dernierHit = now;
            scene.events.emit('obstacle:pieu:hit', this);
        }
        // bloc_charbon : pas de dégâts au contact normal (c'est une plateforme).
        // Le push se gère dans GameScene via collider standard.
        else if (this.data.type === 'marteau_pilon') {
            // Dégâts uniquement en phase 'chute' ou 'impact'
            if (this.marteauPhase !== 'chute' && this.marteauPhase !== 'impact') return;
            if (now - this.dernierHit < this.def.invincibiliteApresHit) return;
            this.dernierHit = now;
            // Knockback horizontal selon position joueur vs marteau
            const dir = Math.sign(player.x - this.data.x) || 1;
            player.body.setVelocityX(dir * this.def.knockbackHorizontal);
            player.body.setVelocityY(-200);  // petit pop pour éviter sticky
            scene.events.emit('obstacle:pieu:hit', { def: { degatsImpact: this.def.degatsImpact } });
        }
        else if (this.data.type === 'piston_thermique') {
            // Knockback à l'impact initial de la sortie (déclenché par _updatePiston)
            // Le contact en extension/etendu inflige des dégâts normaux.
            if (this.pistonPhase === 'rentre') return;
            if (now - this.dernierHit < this.def.invincibiliteApresHit) return;
            this.dernierHit = now;
            // Knockback dans la direction de sortie
            const dir = this.data.orientation === 'gauche' ? -1 : 1;
            player.body.setVelocityX(dir * this.def.knockbackHorizontal);
            scene.events.emit('obstacle:pieu:hit', { def: { degatsImpact: this.def.degatsContact } });
        }
        else if (this.data.type === 'scie_circulaire') {
            if (now - this.dernierHit < this.def.invincibiliteApresHit) return;
            this.dernierHit = now;
            scene.events.emit('obstacle:pieu:hit', { def: { degatsImpact: this.def.degatsContact } });
        }
        // ─── Vague 6 — Cristaux Glacés ───
        else if (this.data.type === 'stalactite_resonance') {
            // Dégâts uniquement pendant la chute (le pic s'écrase dessus)
            if (this.stalPhase !== 'chute') return;
            if (now - this.dernierHit < this.def.invincibiliteApresHit) return;
            this.dernierHit = now;
            scene.events.emit('obstacle:pieu:hit', this);  // def.degatsImpact
        }
        else if (this.data.type === 'verglas') {
            // Pas de dégâts : pose l'effet glissant tant que le joueur overlap.
            player._tileEffectGlissant = now + this.def.dureeEffetMs;
        }
        else if (this.data.type === 'faille_vide') {
            // Draine une part de Résonance + repousse vers le haut (pas la mort).
            if (now - this.dernierHit < this.def.cooldownMs) return;
            this.dernierHit = now;
            scene.resonance.prendreDegats(this.def.drainResonance);
            player.body.setVelocityY(this.def.knockbackVy);
            scene.flashJoueur?.(0x9a6ad8);
            scene.afficherMessageFlottant?.(`-${this.def.drainResonance}`, '#b898e8');
            scene.cameras.main.shake(120, 0.006);
        }
        else if (this.data.type === 'souffle_blizzard') {
            // Pousse latéralement (lu par le code de mouvement). Aucun dégât.
            player._blizzardForce = this.data.force;
            player._blizzardJusqu = now + 120;
        }
        else if (this.data.type === 'zone_oubli') {
            // Éteint attaque/geste/sorts/dash tant que l'overlap dure (lu par
            // GameScene). Fenêtre rafraîchie chaque frame de contact.
            player._zoneOubliJusqu = now + (this.def.dureeEffetMs ?? 120);
        }
        else if (this.data.type === 'courant_reflux') {
            // Pousse le joueur dans la direction du courant (lu par _mouvementTopDown).
            player._courantX = this.data.dirX * this.data.force;
            player._courantY = this.data.dirY * this.data.force;
            player._courantJusqu = now + (this.def.dureeEffetMs ?? 120);
        }
        else if (this.data.type === 'pieu_mnemonique') {
            // Dégâts seulement en phase 'up' (overlap actif via body.enable).
            if (this._phase !== 'up') return;
            if (now - (this._dernierHit ?? 0) < (this.def.invincibiliteApresHit ?? 700)) return;
            this._dernierHit = now;
            scene.resonance.prendreDegats(this.data.degats ?? this.def.degatsDefault ?? 6);
            scene.invincibleJusqu = now + (this.def.invincibiliteApresHit ?? 700);
            scene.flashJoueur?.(0xff4040);
            scene.cameras.main.shake(110, 0.005);
        }
        // cristal_resonant : pas de contact physique (frappé via tenterAttaque).
        // plateforme_resonance : collision gérée par collider conditionnel (GameScene).
        else if (this.data.type === 'laser_prisme') {
            // Gel uniquement pendant le tir.
            if (this.laserPhase !== 'tir') return;
            if (now - this.dernierHit < this.def.invincibiliteApresHit) return;
            this.dernierHit = now;
            player._immobiliseJusqu = now + this.def.gelMs;
            scene.events.emit('obstacle:pieu:hit', { def: { degatsImpact: this.def.degats } });
            scene.flashJoueur?.(0x90c0ff);
        }
        // plateforme_miroir : platforme (collider), pas de dégât.
        // faux_sol_miroir : intangible, aucun contact.
    }

    detruire() {
        this.sprite?.destroy();
        this.visual?.destroy();
        this.ornement?.destroy();
        this.ombre?.destroy();
        if (this._extraVisuals) for (const v of this._extraVisuals) v?.destroy?.();
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
        } else if (typeVisuel === 'mur_explosif') {
            // Mur Halls : pierre carbonisée + runes braises rouges (avertissement)
            // Pulse de chaleur intérieure visible (lecture "ça va exploser").
            const totalHp = this.data.hp ?? this.def.hpDefault;
            const charge = 1 - (this.hp / totalHp);  // 0 → neuf, 1 → presque cassé
            // Corps : pierre carbonisée gris-anthracite (palette Halls)
            g.fillStyle(COULEUR_SUIE, 1);
            g.fillRect(cx - w / 2, cy - h / 2, w, h);
            g.fillStyle(0x3e3128, 1);  // pierre Halls
            g.fillRect(cx - w / 2 + 2, cy - h / 2 + 2, w - 4, h - 4);
            // Lueur intérieure braise qui s'intensifie avec les hits
            const pulseT = (this.scene.time.now / 400) % 1;
            const pulse = 0.4 + 0.4 * Math.sin(pulseT * Math.PI * 2);
            g.fillStyle(COULEUR_BRAISE_FONCE, 0.3 + charge * 0.5);
            g.fillRect(cx - w / 2 + 4, cy - h / 2 + 4, w - 8, h - 8);
            // Runes rouges verticales (signature avertissement)
            g.lineStyle(2, COULEUR_BRAISE, 0.7 + charge * 0.3);
            const nbRunes = 3;
            for (let i = 0; i < nbRunes; i++) {
                const ry = cy - h * 0.35 + i * (h * 0.35);
                g.beginPath();
                g.moveTo(cx - w * 0.25, ry);
                g.lineTo(cx + w * 0.25, ry);
                g.strokePath();
                g.beginPath();
                g.moveTo(cx, ry - 6);
                g.lineTo(cx, ry + 6);
                g.strokePath();
            }
            // Cœur incandescent qui s'élargit au fur et à mesure
            const coeurR = 4 + charge * 8;
            g.fillStyle(COULEUR_BRAISE_VIVE, pulse * (0.5 + charge * 0.5));
            g.fillCircle(cx, cy, coeurR);
            g.fillStyle(0xffffff, pulse * charge * 0.6);
            g.fillCircle(cx, cy, coeurR * 0.4);
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

        // Mur SECRET : pas de flash + le dessin progressif gère la révélation
        // (poussière au 1er hit, fissures fines après 2 hits, marquées vers 3+).
        if (this.data.type === 'mur_secret') {
            this._sursauterMurSecret();
            this._dessinerMurSecret();
            return false;
        }

        // Visuel cassable normal (éboulis/mur_fissure/mur_explosif) :
        // flash + redessine pour montrer la dégradation
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

        // Mur explosif : déclenche l'explosion radiale AVANT particules génériques
        if (this.data.type === 'mur_explosif') {
            this._exploserMur();
        }

        // Burst de particules à la destruction
        if (this.scene.textures.exists('_particule')) {
            const tintParticules = this.data.type === 'mur_explosif'
                ? [COULEUR_BRAISE, COULEUR_BRAISE_VIVE, COULEUR_BRAISE_FONCE]
                : [COULEUR_PIERRE, COULEUR_PIERRE_CLAIR, 0x88643a];
            const burst = this.scene.add.particles(this.data.x, this.data.y, '_particule', {
                lifespan: 500,
                speed: { min: 80, max: 200 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.7, end: 0 },
                tint: tintParticules,
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
        // Détruit la collision + le visuel + ornement éventuel (mur_secret)
        this.sprite?.body?.destroy();
        this.sprite?.destroy();
        this.visual?.destroy();
        this.ornement?.destroy();
        this.sprite = null;
        this.visual = null;
        this.ornement = null;
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

    // ════════════════════════════════════════════════════════════════
    // VAGUE 3 — Halls Cendrés : Brasier mobile
    // ════════════════════════════════════════════════════════════════

    _creerBrasierMobile() {
        const w = this.data.largeur ?? this.def.largeurDefault;
        const h = this.data.hauteur ?? this.def.hauteurDefault;

        // Sprite : zone d'overlap (pas de collision physique, le joueur PASSE
        // au travers — c'est juste une zone de dégâts cyclique).
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.y, w, h, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.scene.physics.add.existing(this.sprite, true);
        this.sprite._obstacle = this;
        // PAS d'ajout aux platforms/obstaclesSolides : zone d'overlap pure.

        this.visual = this.scene.add.graphics();
        this.visual.setDepth(7);
        this.brasierPhase = 'feu';
        this._t0 = this.scene.time.now + (this.data.offsetMs ?? 0);
    }

    _updateBrasier(now) {
        const cycle = this.data.cycleMs ?? this.def.cycleMs;
        const t = ((now - this._t0) % cycle) / cycle;
        // 55% du cycle = feu actif (dégâts), 45% = inerte (passage)
        const enFeu = t < this.def.feuRatio;
        const w = this.data.largeur ?? this.def.largeurDefault;
        const h = this.data.hauteur ?? this.def.hauteurDefault;
        const cx = this.data.x, cy = this.data.y;

        const g = this.visual;
        g.clear();

        // Socle commun : grille de cuivre encastrée (signature Halls)
        const socleH = Math.min(h * 0.5, 18);
        const socleTop = cy + h / 2 - socleH;
        g.fillStyle(COULEUR_SUIE, 1);
        g.fillRect(cx - w / 2, socleTop, w, socleH);
        g.fillStyle(COULEUR_CUIVRE_TERNI, 1);
        g.fillRect(cx - w / 2 + 3, socleTop + 3, w - 6, socleH - 6);
        // Barreaux de la grille
        g.lineStyle(2, COULEUR_SUIE, 0.9);
        const nbBarreaux = Math.floor(w / 16);
        for (let i = 1; i < nbBarreaux; i++) {
            const bx = cx - w / 2 + i * (w / nbBarreaux);
            g.beginPath();
            g.moveTo(bx, socleTop + 2);
            g.lineTo(bx, socleTop + socleH - 2);
            g.strokePath();
        }

        if (enFeu) {
            // PHASE FEU : flammes orange vif qui dansent au-dessus de la grille
            const phaseProgress = t / this.def.feuRatio;
            // Easing : montée rapide (0→0.15), plein feu (0.15→0.85), retombée (0.85→1)
            let intensite;
            if (phaseProgress < 0.15) intensite = phaseProgress / 0.15;
            else if (phaseProgress > 0.85) intensite = (1 - phaseProgress) / 0.15;
            else intensite = 1;

            const hauteurFlamme = h * 0.7 * intensite;
            const flammeTopY = socleTop - hauteurFlamme;

            // Lueur diffuse (halo orangé sous-jacent)
            g.fillStyle(COULEUR_BRAISE, 0.18 * intensite);
            g.fillRect(cx - w / 2 - 8, flammeTopY - 6, w + 16, hauteurFlamme + 14);

            // Flammes : triangles irréguliers qui dansent (3-5 selon largeur)
            const nbFlammes = Math.max(3, Math.floor(w / 28));
            const dance = Math.sin(now / 80) * 4;
            for (let i = 0; i < nbFlammes; i++) {
                const fx = cx - w / 2 + (i + 0.5) * (w / nbFlammes);
                const haut = hauteurFlamme * (0.7 + 0.3 * Math.sin(now / 90 + i * 1.3));
                const decal = Math.sin(now / 70 + i * 2) * 3;
                // Base large braise foncée
                g.fillStyle(COULEUR_BRAISE_FONCE, 0.9);
                g.fillTriangle(
                    fx - 10, socleTop,
                    fx + 10, socleTop,
                    fx + decal, socleTop - haut
                );
                // Cœur orange
                g.fillStyle(COULEUR_BRAISE, 0.95);
                g.fillTriangle(
                    fx - 6, socleTop - 2,
                    fx + 6, socleTop - 2,
                    fx + decal * 0.7, socleTop - haut * 0.85
                );
                // Pointe jaune-blanc vif
                g.fillStyle(COULEUR_BRAISE_VIVE, intensite);
                g.fillTriangle(
                    fx - 3, socleTop - haut * 0.3,
                    fx + 3, socleTop - haut * 0.3,
                    fx + decal * 0.5, socleTop - haut * 0.95
                );
                // Escarbille (petit point qui s'envole)
                if (i % 2 === 0) {
                    const ex = fx + dance + decal;
                    const ey = flammeTopY - 4 - Math.abs(Math.sin(now / 110 + i)) * 12;
                    g.fillStyle(COULEUR_BRAISE_VIVE, 0.8 * intensite);
                    g.fillCircle(ex, ey, 1.5);
                }
            }
            this.brasierPhase = 'feu';
        } else {
            // PHASE INERTE : braises résiduelles rougeoyantes dans la grille
            const phaseProgress = (t - this.def.feuRatio) / (1 - this.def.feuRatio);
            const lueur = 0.3 + 0.2 * Math.sin(now / 250);
            // Quelques braises encore actives au fond de la grille
            const nbBraises = Math.floor(w / 24);
            for (let i = 0; i < nbBraises; i++) {
                const bx = cx - w / 2 + (i + 0.5) * (w / nbBraises);
                const by = socleTop + socleH * 0.5;
                g.fillStyle(COULEUR_BRAISE_FONCE, lueur * (1 - phaseProgress * 0.6));
                g.fillCircle(bx, by, 3);
                g.fillStyle(COULEUR_BRAISE, lueur * 0.5);
                g.fillCircle(bx, by, 1.5);
            }
            this.brasierPhase = 'inerte';
        }
    }

    // ════════════════════════════════════════════════════════════════
    // VAGUE 3 — Halls Cendrés : Mur secret (cassable invisible)
    // ════════════════════════════════════════════════════════════════

    _creerMurSecret() {
        const w = this.data.largeur ?? this.def.largeurDefault;
        const h = this.data.hauteur ?? this.def.hauteurDefault;
        this.hp = this.data.hp ?? this.def.hpDefault;

        // Récupère la palette biome courante (couleur plateforme du biome).
        // Le mur doit ressembler à un morceau de mur/sol normal.
        const paletteScene = this.scene.palette || {};
        const couleurBase = paletteScene.plateforme ?? 0x3e3128;

        // Sprite physique solide (bloque le joueur — collision ajoutée par GameScene)
        // On crée DIRECTEMENT le rectangle visible avec la couleur biome.
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.y, w, h, couleurBase);
        this.sprite.setDepth(8);  // = DEPTH.PLATEFORMES, identique aux plateformes
        this.scene.physics.add.existing(this.sprite, true);
        this.sprite._obstacle = this;
        if (this.scene.obstaclesSolides) this.scene.obstaclesSolides.add(this.sprite);

        // Ornement identique aux plateformes du biome (peint par-dessus).
        // Aucun indice que c'est cassable — c'est volontaire.
        try {
            this.ornement = peindreOrnementPlateforme(
                this.scene, this.data.x, this.data.y, w, h,
                this.scene.mondeCourant, paletteScene,
                /* oneWay */ false,
                /* estSol */ this.data.orientation === 'sol'
            );
        } catch (e) {
            // Si l'ornement échoue (palette manquante), pas de crash : le mur
            // garde juste son visuel rectangulaire de base — encore moins
            // distinctif d'une plateforme.
        }

        // Couche de fissures (vide au départ — apparaîtra au fil des hits)
        this.visual = this.scene.add.graphics();
        this.visual.setDepth(9);
    }

    /**
     * Petit shake + nuage de poussière à l'impact — signal "ça sonne creux".
     * Le joueur perçoit qu'il a touché quelque chose de SPÉCIAL sans voir de
     * marque visible avant le 2ᵉ hit.
     */
    _sursauterMurSecret() {
        // Shake court
        const orig = { x: this.sprite.x, y: this.sprite.y };
        this.scene.tweens.add({
            targets: [this.sprite, this.ornement].filter(Boolean),
            x: orig.x + 2,
            duration: 40,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                if (this.sprite) this.sprite.x = orig.x;
                if (this.ornement) this.ornement.x = 0;  // ornement use absolute coords
            }
        });
        // Burst de poussière (couleur pierre claire biome) au point d'impact
        if (this.scene.textures.exists('_particule')) {
            const w = this.data.largeur ?? this.def.largeurDefault;
            const h = this.data.hauteur ?? this.def.hauteurDefault;
            const tintPalette = this.scene.palette?.pierreClaire ?? 0x6e5440;
            const burst = this.scene.add.particles(this.data.x, this.data.y, '_particule', {
                lifespan: 380,
                speed: { min: 40, max: 100 },
                angle: { min: 180, max: 360 },  // vers le haut (poussière qui s'élève)
                scale: { start: 0.4, end: 0 },
                tint: [tintPalette, 0xcccccc],
                quantity: 8,
                alpha: { start: 0.7, end: 0 }
            });
            burst.setDepth(15);
            burst.explode(8);
            this.scene.time.delayedCall(400, () => burst.destroy());
        }
    }

    _dessinerMurSecret() {
        const g = this.visual;
        if (!g) return;
        g.clear();
        const totalHp = this.data.hp ?? this.def.hpDefault;
        const dommage = (totalHp - this.hp) / totalHp;   // 0..1
        // Pas de fissure visible tant que dommage < 0.4 (1er hit sur HP=4 → 0.25, rien)
        // Première micro-fissure à dommage ≥ 0.4 (2ᵉ hit = 0.5)
        // Fissures bien marquées à dommage ≥ 0.6 (3ᵉ hit = 0.75)
        if (dommage < 0.4) return;

        const cx = this.data.x, cy = this.data.y;
        const w = this.data.largeur ?? this.def.largeurDefault;
        const h = this.data.hauteur ?? this.def.hauteurDefault;
        const epaisseur = dommage >= 0.6 ? 2 : 1;
        const alpha = 0.3 + dommage * 0.5;

        g.lineStyle(epaisseur, 0x1a1208, alpha);
        // Fissures en étoile depuis le centre (style impact)
        const seed = (cx * 13 + cy * 7) | 0;
        const rand = (i) => {
            const x = Math.sin(seed + i * 91.6) * 10000;
            return x - Math.floor(x);
        };
        const nbFissures = Math.floor(2 + dommage * 4);
        for (let i = 0; i < nbFissures; i++) {
            const angle = (i / nbFissures) * Math.PI * 2 + rand(i) * 0.5;
            const lon = Math.min(w, h) * 0.3 * (0.5 + rand(i + 7) * 0.5);
            const x2 = cx + Math.cos(angle) * lon;
            const y2 = cy + Math.sin(angle) * lon;
            g.beginPath();
            g.moveTo(cx, cy);
            g.lineTo(x2, y2);
            g.strokePath();
            // Petite ramification
            if (dommage >= 0.6) {
                const ramAngle = angle + (rand(i + 13) - 0.5) * 0.8;
                const ramLon = lon * 0.4;
                g.beginPath();
                g.moveTo(x2, y2);
                g.lineTo(x2 + Math.cos(ramAngle) * ramLon, y2 + Math.sin(ramAngle) * ramLon);
                g.strokePath();
            }
        }
    }

    // ════════════════════════════════════════════════════════════════
    // VAGUE 3 — Halls Cendrés : Mur explosif (explosion radiale)
    // ════════════════════════════════════════════════════════════════

    _exploserMur() {
        const cx = this.data.x, cy = this.data.y;
        const def = this.def;
        const nbProj = def.nbProjectiles ?? 6;
        const vitesse = def.vitesseProjectile ?? 320;
        const degats = def.degatsProjectile ?? 4;

        // Shake plus violent que la cassure simple
        this.scene.cameras.main.shake(160, 0.008);

        // Flash blanc rapide centré
        const flash = this.scene.add.circle(cx, cy, def.rayonExplosion ?? 220, 0xffffff, 0.65);
        flash.setDepth(20);
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            scale: { from: 0.3, to: 1.2 },
            duration: 280,
            ease: 'Cubic.easeOut',
            onComplete: () => flash.destroy()
        });

        // Projectiles braises radiaux
        const fauxDef = { degats, invincibiliteApresHit: 500 };
        const fauxObs = { def: fauxDef };
        for (let i = 0; i < nbProj; i++) {
            const angle = (i / nbProj) * Math.PI * 2;
            const dx = Math.cos(angle), dy = Math.sin(angle);
            const proj = this.scene.add.rectangle(cx, cy, 14, 14, 0xffffff, 0);
            proj.setAlpha(0);
            this.scene.physics.add.existing(proj);
            proj.body.allowGravity = false;
            proj.body.setVelocity(dx * vitesse, dy * vitesse);
            proj._dernierHit = 0;

            // Visuel : braise pulsante orange-jaune
            const visuel = this.scene.add.graphics();
            visuel.setDepth(14);

            // Overlap joueur : dégâts via pipeline pieu
            const overlap = this.scene.physics.add.overlap(this.scene.player, proj, () => {
                const t = this.scene.time.now;
                if (t - proj._dernierHit < 500) return;
                proj._dernierHit = t;
                this.scene.events.emit('obstacle:pieu:hit', fauxObs);
            });

            // Boucle update visuel + auto-destruction
            const tween = this.scene.tweens.addCounter({
                from: 0, to: 1,
                duration: 1100,
                onUpdate: (tw) => {
                    if (!proj.active) return;
                    visuel.clear();
                    const fade = 1 - tw.getValue();
                    // Traînée
                    visuel.fillStyle(COULEUR_BRAISE_FONCE, 0.4 * fade);
                    visuel.fillCircle(proj.x - dx * 12, proj.y - dy * 12, 8);
                    visuel.fillStyle(COULEUR_BRAISE, 0.6 * fade);
                    visuel.fillCircle(proj.x - dx * 6, proj.y - dy * 6, 6);
                    // Cœur
                    visuel.fillStyle(COULEUR_BRAISE_VIVE, fade);
                    visuel.fillCircle(proj.x, proj.y, 5);
                    visuel.fillStyle(0xffffff, fade * 0.7);
                    visuel.fillCircle(proj.x, proj.y, 2);
                },
                onComplete: () => {
                    overlap?.destroy();
                    proj?.destroy();
                    visuel?.destroy();
                }
            });
        }
    }

    // ════════════════════════════════════════════════════════════════
    // VAGUE 4 — Halls Cendrés Phase 9.7 (extension toolkit)
    // ════════════════════════════════════════════════════════════════

    _creerGeyserVapeur() {
        const w = this.data.largeur ?? this.def.largeurDefault;
        const h = this.data.hauteur ?? this.def.hauteurDefault;

        // Sprite overlap (pas de collision physique — c'est une zone de dégâts/boost)
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.y, w, h, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.scene.physics.add.existing(this.sprite, true);
        this.sprite._obstacle = this;

        this.visual = this.scene.add.graphics();
        this.visual.setDepth(7);
        this.geyserPhase = 'inerte';
        this._t0 = this.scene.time.now + (this.data.offsetMs ?? 0);
    }

    _updateGeyserVapeur(now) {
        const cycle = this.data.cycleMs ?? this.def.cycleMs;
        const t = ((now - this._t0) % cycle) / cycle;
        // vapeurRatio = 45% du cycle = ON
        const enVapeur = t < this.def.vapeurRatio;
        this.geyserPhase = enVapeur ? 'vapeur' : 'inerte';

        const w = this.data.largeur ?? this.def.largeurDefault;
        const h = this.data.hauteur ?? this.def.hauteurDefault;
        const cx = this.data.x;
        const cyBase = this.data.y + h / 2;   // base (sol)
        const yTop = this.data.y - h / 2;

        const g = this.visual;
        g.clear();

        // Socle (bouche du geyser au sol — cuivre terni)
        const socleH = 14;
        g.fillStyle(COULEUR_SUIE, 1);
        g.fillRect(cx - w / 2 - 4, cyBase - socleH, w + 8, socleH);
        g.fillStyle(COULEUR_CUIVRE_TERNI, 1);
        g.fillRect(cx - w / 2, cyBase - socleH + 2, w, socleH - 4);
        // Trou central (vapeur sort d'ici)
        g.fillStyle(0x000000, 1);
        g.fillRect(cx - w / 4, cyBase - socleH + 4, w / 2, socleH - 8);

        if (enVapeur) {
            // PHASE ON : jet de vapeur blanc/gris s'élevant
            const phaseProgress = t / this.def.vapeurRatio;
            let intensite;
            if (phaseProgress < 0.10) intensite = phaseProgress / 0.10;     // montée
            else if (phaseProgress > 0.90) intensite = (1 - phaseProgress) / 0.10;
            else intensite = 1;

            const hauteurJet = h * 0.95 * intensite;
            const jetTopY = cyBase - socleH - hauteurJet;

            // Halo diffus (large)
            g.fillStyle(0xc8d8e8, 0.18 * intensite);
            g.fillRect(cx - w / 2 - 12, jetTopY - 8, w + 24, hauteurJet + 14);

            // Colonne de vapeur (3-4 bandes verticales irrégulières)
            const dance = Math.sin(now / 60) * 3;
            const nbBandes = 4;
            for (let i = 0; i < nbBandes; i++) {
                const bx = cx - w / 3 + (i + 0.5) * (w * 2 / 3 / nbBandes);
                const swirl = Math.sin(now / 90 + i * 1.7) * 5;
                const yTopBande = jetTopY + (i % 2) * 8;
                const wBande = 10 + Math.sin(now / 110 + i) * 2;
                // Tons de gris/blanc en dégradé
                g.fillStyle(0xe8eef4, 0.7 * intensite);
                g.fillRect(bx - wBande / 2 + swirl, yTopBande, wBande, hauteurJet - (i % 2) * 8);
                g.fillStyle(0xffffff, 0.4 * intensite);
                g.fillRect(bx - wBande / 4 + swirl, yTopBande + 4, wBande / 2, hauteurJet - 8);
            }

            // Gouttes condensées qui retombent (lecture "haut sous pression")
            for (let i = 0; i < 5; i++) {
                const dx = Math.sin(now / 70 + i * 0.9) * w * 0.6;
                const dy = ((now / 4 + i * 200) % hauteurJet);
                g.fillStyle(0xb8c8d8, 0.6 * intensite);
                g.fillCircle(cx + dx, jetTopY + dy, 2);
            }

            // Lumière au socle (la vapeur a sa source)
            g.fillStyle(0xffffff, 0.5 * intensite);
            g.fillRect(cx - w / 4, cyBase - socleH + 5, w / 2, socleH - 10);
        } else {
            // PHASE OFF : silhouette inerte + craquement orange (le geyser charge)
            const tCharge = (t - this.def.vapeurRatio) / (1 - this.def.vapeurRatio);
            // Lueur croissante au socle (lecture "ça va péter")
            g.fillStyle(0xff9040, 0.2 + tCharge * 0.4);
            g.fillRect(cx - w / 4, cyBase - socleH + 5, w / 2, socleH - 10);

            // Petite vapeur résiduelle (avertissement)
            const wisp = Math.sin(now / 200) * 0.5 + 0.5;
            g.fillStyle(0xa8b8c8, 0.25 * tCharge * wisp);
            g.fillRect(cx - 6, cyBase - socleH - 20, 12, 18);
        }
    }

    _creerRideauAcide() {
        const w = this.data.largeur ?? this.def.largeurDefault;
        const h = this.data.hauteur ?? this.def.hauteurDefault;

        // Sprite overlap (zone dégâts)
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.y, w, h, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.scene.physics.add.existing(this.sprite, true);
        this.sprite._obstacle = this;

        this.visual = this.scene.add.graphics();
        this.visual.setDepth(7);
        // Tableau de gouttes virtuelles (offset y aléatoires)
        const nbGouttes = Math.max(8, Math.floor(h / 18));
        this._gouttesAcide = Array.from({ length: nbGouttes }, (_, i) => ({
            offset: (i / nbGouttes) * h + Math.random() * 12,
            dx: (Math.random() - 0.5) * (w * 0.6),
            vitesse: 1 + Math.random() * 0.5,
            taille: 1.5 + Math.random() * 1.8
        }));
    }

    _dessinerRideauAcide(now) {
        const w = this.data.largeur ?? this.def.largeurDefault;
        const h = this.data.hauteur ?? this.def.hauteurDefault;
        const cx = this.data.x;
        const yTop = this.data.y - h / 2;
        const yBot = this.data.y + h / 2;

        const g = this.visual;
        g.clear();

        // Halo vert pâle de la zone (lecture danger continue)
        g.fillStyle(0x60a040, 0.08);
        g.fillRect(cx - w / 2 - 4, yTop, w + 8, h);

        // Tube de bave central (lecture verticale forte)
        g.fillStyle(0x305018, 0.5);
        g.fillRect(cx - w / 4, yTop, w / 2, h);

        // Gouttes en chute continue (boucle infinie)
        for (const goutte of this._gouttesAcide) {
            const y = yTop + ((now / 4 * goutte.vitesse + goutte.offset) % h);
            const x = cx + goutte.dx;
            // Goutte (ellipse étirée vers le bas)
            g.fillStyle(0x80c040, 0.85);
            g.fillEllipse(x, y, goutte.taille * 1.4, goutte.taille * 3);
            g.fillStyle(0xc0e060, 0.7);
            g.fillEllipse(x, y - goutte.taille, goutte.taille * 0.8, goutte.taille * 1.6);
        }

        // Flaque acide en bas (s'élargit horizontalement)
        g.fillStyle(0x507030, 0.7);
        g.fillEllipse(cx, yBot - 4, w * 1.2, 8);
        g.fillStyle(0x80c040, 0.5);
        const bulle = Math.sin(now / 200) * 2 + 4;
        g.fillCircle(cx - 4, yBot - bulle - 2, 1.5);
        g.fillCircle(cx + 6, yBot - bulle * 0.7 - 2, 1.2);
    }

    _creerBlocCharbon() {
        const w = this.data.largeur ?? this.def.largeurDefault;
        const h = this.data.hauteur ?? this.def.hauteurDefault;
        this.hp = this.data.hp ?? this.def.hpDefault;

        // Sprite physique DYNAMIQUE (peut être poussé par le joueur)
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.y, w, h, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.scene.physics.add.existing(this.sprite); // dynamic body
        const body = this.sprite.body;
        body.allowGravity = true;
        body.setDragX(this.def.friction);
        body.setMaxVelocity(this.def.vitessePushMax, 1000);
        body.setCollideWorldBounds(false);
        this.sprite._obstacle = this;

        // Note : on N'AJOUTE PAS au platforms staticGroup (le bloc est dynamic).
        // GameScene crée les colliders nécessaires : bloc ↔ platforms (gravité),
        // bloc ↔ joueur (push), bloc ↔ obstaclesSolides.

        this.visual = this.scene.add.graphics();
        this.visual.setDepth(8);
        this.enflammeDepuis = 0;       // timestamp début enflamme
        this.estEnflamme = false;
        this._dessinerBlocCharbon(this.scene.time.now);
    }

    _updateBlocCharbon(now) {
        // Suit le sprite physique
        const x = this.sprite.x;
        const y = this.sprite.y;

        // Détection contact brasier en phase ON → s'enflamme
        if (!this.estEnflamme && this.scene.obstacles) {
            for (const o of this.scene.obstacles) {
                if (o === this) continue;
                if (o.data.type !== 'brasier_mobile') continue;
                if (o.brasierPhase !== 'feu') continue;
                // Overlap rectangle simple
                const dx = Math.abs(x - o.data.x);
                const dy = Math.abs(y - o.data.y);
                const ww = (this.data.largeur + (o.data.largeur ?? o.def.largeurDefault)) / 2;
                const hh = (this.data.hauteur + (o.data.hauteur ?? o.def.hauteurDefault)) / 2;
                if (dx < ww && dy < hh) {
                    this.estEnflamme = true;
                    this.enflammeDepuis = now;
                    break;
                }
            }
        }

        // Si enflammé, compte à rebours → explose
        if (this.estEnflamme && now - this.enflammeDepuis >= this.def.delaiEnflammeMs) {
            this._exploserBlocCharbon();
            return;
        }

        // Redraw visuel
        this._dessinerBlocCharbon(now);
    }

    _dessinerBlocCharbon(now) {
        const w = this.data.largeur;
        const h = this.data.hauteur;
        const cx = this.sprite ? this.sprite.x : this.data.x;
        const cy = this.sprite ? this.sprite.y : this.data.y;

        const g = this.visual;
        g.clear();

        if (this.estEnflamme) {
            // ENFLAMMÉ : pulse rouge + halo orangé qui croît
            const tEnflamme = (now - this.enflammeDepuis) / this.def.delaiEnflammeMs;
            // Halo
            g.fillStyle(COULEUR_BRAISE, 0.3 + tEnflamme * 0.4);
            g.fillRect(cx - w / 2 - 6, cy - h / 2 - 6, w + 12, h + 12);
            // Corps charbon ardent
            g.fillStyle(0x402010, 1);
            g.fillRect(cx - w / 2, cy - h / 2, w, h);
            // Fissures incandescentes
            const flicker = Math.sin(now / 60) * 0.2 + 0.8;
            g.fillStyle(COULEUR_BRAISE_VIVE, flicker);
            const nbFissures = 5;
            for (let i = 0; i < nbFissures; i++) {
                const fx = cx - w / 2 + 4 + (i / nbFissures) * (w - 8);
                const fy = cy - h / 2 + 4 + Math.sin(i * 1.7) * 4;
                const fh = h - 8 - Math.abs(Math.sin(i * 0.7)) * 6;
                g.fillRect(fx, fy, 2, fh);
            }
            // Étincelles
            for (let i = 0; i < 3; i++) {
                const sx = cx + Math.sin(now / 70 + i * 2.1) * w / 3;
                const sy = cy - h / 2 - 2 - Math.abs(Math.cos(now / 90 + i)) * 4;
                g.fillStyle(0xffaa30, 0.9);
                g.fillCircle(sx, sy, 1.5);
            }
        } else {
            // INERTE : bloc charbon noir avec texture granuleuse
            // Ombre portée
            g.fillStyle(0x000000, 0.5);
            g.fillRect(cx - w / 2 + 3, cy - h / 2 + 3, w, h);
            // Corps
            g.fillStyle(COULEUR_SUIE, 1);
            g.fillRect(cx - w / 2, cy - h / 2, w, h);
            // Bord biseauté
            g.fillStyle(0x282018, 1);
            g.fillRect(cx - w / 2 + 2, cy - h / 2 + 2, w - 4, 2);
            g.fillRect(cx - w / 2 + 2, cy - h / 2 + 2, 2, h - 4);
            // Reflets cuivrés discrets (charbon de forge)
            g.fillStyle(COULEUR_CUIVRE_TERNI, 0.3);
            for (let i = 0; i < 4; i++) {
                const rx = cx - w / 2 + 6 + (i * (w - 12) / 3);
                const ry = cy - h / 2 + 8 + Math.sin(i * 2.3) * 6;
                g.fillCircle(rx, ry, 1.5);
            }
            // Trait noir au centre
            g.lineStyle(1, 0x000000, 0.4);
            g.strokeRect(cx - w / 2 + 4, cy - h / 2 + 4, w - 8, h - 8);
        }
    }

    // ════════════════════════════════════════════════════════════════
    // VAGUE 8 — Voile Inversé (mécaniques de gravité)
    // ════════════════════════════════════════════════════════════════

    // ─── Blocus Croisé : bloc solide ridable piloté par le pendule ───
    _creerBlocGravite() {
        const taille = this.data.largeur ?? this.def.tailleDefault;
        this.blocInverse = this.data.inverse ?? false;
        this.blocVitesse = this.data.vitesse ?? this.def.vitesseDefault;
        this.yCentreBas  = this.data.yTopBas  + taille / 2;
        this.yCentreHaut = this.data.yTopHaut + taille / 2;
        const yInit = this.blocInverse ? this.yCentreHaut : this.yCentreBas;

        // Dynamic body immovable (pattern plateforme_mobile) : solide tous côtés,
        // porte le joueur quand il monte/descend.
        this.sprite = this.scene.add.rectangle(this.data.x, yInit, taille, taille, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.scene.physics.add.existing(this.sprite);
        const body = this.sprite.body;
        body.allowGravity = false;
        body.immovable = true;
        body.moves = true;
        this.sprite._obstacle = this;

        this.visual = this.scene.add.graphics();
        this.visual.setDepth(8);
        this._dessinerBlocGravite();
    }

    _updateBlocGravite() {
        // Suit la gravité de la SALLE (pendule) XOR la polarité du bloc.
        const flip = this.scene._penduleInverse === true;
        const versHaut = flip !== this.blocInverse;       // XOR
        const cible = versHaut ? this.yCentreHaut : this.yCentreBas;
        const body = this.sprite.body;
        const dt = (this.scene.game.loop.delta ?? 16) / 1000;
        const pas = this.blocVitesse * dt;
        const dy = cible - this.sprite.y;
        if (Math.abs(dy) <= pas + 0.5) {
            this.sprite.y = cible;
            body.setVelocity(0, 0);
        } else {
            body.setVelocity(0, Math.sign(dy) * this.blocVitesse);
        }
        this._dessinerBlocGravite();
    }

    _dessinerBlocGravite() {
        const g = this.visual;
        if (!g) return;
        const w = this.data.largeur, h = this.data.hauteur;
        const cx = this.sprite.x, cy = this.sprite.y;
        const flip = this.scene._penduleInverse === true;
        const versHaut = flip !== this.blocInverse;       // sens de chute courant
        const now = this.scene.time.now;
        g.clear();

        // Ombre portée vers le bas (abîme aubergine).
        g.fillStyle(COULEUR_VOILE_FONCE, 0.5);
        g.fillRect(cx - w / 2 + 3, cy - h / 2 + 3, w, h);
        // Corps marbre aubergine.
        g.fillStyle(COULEUR_VOILE_PIERRE, 1);
        g.fillRect(cx - w / 2, cy - h / 2, w, h);
        // Arête éclairée (biseau haut-gauche).
        g.fillStyle(COULEUR_VOILE_CLAIR, 0.9);
        g.fillRect(cx - w / 2 + 2, cy - h / 2 + 2, w - 4, 2);
        g.fillRect(cx - w / 2 + 2, cy - h / 2 + 2, 2, h - 4);
        g.lineStyle(2, COULEUR_VOILE_FONCE, 0.8);
        g.strokeRect(cx - w / 2, cy - h / 2, w, h);

        // Cœur d'inversion : chevron magenta pointant dans le sens de chute,
        // pulse pour signaler la polarité.
        const pulse = 0.55 + 0.45 * Math.sin(now / 140);
        g.fillStyle(COULEUR_VOILE_MAGENTA, 0.55 + 0.35 * pulse);
        const dir = versHaut ? -1 : 1;            // -1 = pointe vers le haut
        const ax = cx, ay = cy + dir * 6;
        const sp = 11;
        g.beginPath();
        g.moveTo(ax, ay + dir * sp);
        g.lineTo(ax - sp, ay - dir * sp);
        g.lineTo(ax + sp, ay - dir * sp);
        g.closePath();
        g.fillPath();
        // Halo du cœur.
        g.fillStyle(COULEUR_VOILE_MAGENTA, 0.18 * pulse);
        g.fillCircle(cx, cy, w * 0.42);
    }

    // ─── Contrepoids : pierre poussable thème Voile ───
    _creerContrepoids() {
        const taille = this.data.largeur ?? this.def.tailleDefault;
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.y, taille, taille, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.scene.physics.add.existing(this.sprite);     // dynamic body
        const body = this.sprite.body;
        body.allowGravity = true;
        body.setDragX(this.def.friction);
        body.setMaxVelocity(this.def.vitessePushMax, 1000);
        body.setCollideWorldBounds(false);
        this.sprite._obstacle = this;
        // Colliders créés par GameScene (platforms, joueur, obstaclesSolides,
        // plateaux de balance).

        this.visual = this.scene.add.graphics();
        this.visual.setDepth(9);
        this._dessinerContrepoids();
    }

    _dessinerContrepoids() {
        const g = this.visual;
        if (!g) return;
        const w = this.data.largeur, h = this.data.hauteur;
        const cx = this.sprite ? this.sprite.x : this.data.x;
        const cy = this.sprite ? this.sprite.y : this.data.y;
        const now = this.scene.time.now;
        g.clear();
        // Ombre.
        g.fillStyle(COULEUR_VOILE_FONCE, 0.55);
        g.fillRect(cx - w / 2 + 2, cy - h / 2 + 3, w, h);
        // Corps : pierre taillée aubergine, plus dense que les blocs.
        g.fillStyle(0x2a1a36, 1);
        g.fillRect(cx - w / 2, cy - h / 2, w, h);
        g.fillStyle(COULEUR_VOILE_PIERRE, 0.8);
        g.fillRect(cx - w / 2 + 4, cy - h / 2 + 4, w - 8, h - 8);
        // Rune de poids (cercle barré) magenta — signe « masse ».
        const pulse = 0.6 + 0.4 * Math.sin(now / 200);
        g.lineStyle(2, COULEUR_VOILE_MAGENTA, 0.7 * pulse);
        g.strokeCircle(cx, cy, w * 0.26);
        g.lineBetween(cx - w * 0.26, cy, cx + w * 0.26, cy);
        // Arête éclairée.
        g.fillStyle(COULEUR_VOILE_CLAIR, 0.7);
        g.fillRect(cx - w / 2 + 3, cy - h / 2 + 3, w - 6, 2);
        g.lineStyle(2, COULEUR_VOILE_FONCE, 0.9);
        g.strokeRect(cx - w / 2, cy - h / 2, w, h);
    }

    // ─── Balance Gravitationnelle : 2 plateaux couplés par poulie ───
    _creerBalance() {
        const w = this.data.largeur;
        const h = this.def.hauteurPlateau;
        this.balAmplitude = this.data.amplitude ?? this.def.amplitudeDefault;
        this.balVitesse = this.data.vitesse ?? this.def.vitesseDefault;
        this.balYRepos = this.data.yRepos;
        this.balTheta = 0;

        const mk = (x) => {
            const s = this.scene.add.rectangle(x, this.balYRepos, w, h, 0xffffff, 0);
            s.setAlpha(0);
            this.scene.physics.add.existing(s);
            const b = s.body;
            b.allowGravity = false;
            b.immovable = true;
            b.moves = true;
            // One-way : on n'atterrit que par le dessus (le plateau qui monte ne
            // bloque pas la tête, pas de head-bonk).
            b.checkCollision.down = false;
            b.checkCollision.left = false;
            b.checkCollision.right = false;
            s._obstacle = this;
            return s;
        };
        this.spriteG = mk(this.data.xG);
        this.spriteD = mk(this.data.xD);
        this.sprite = this.spriteG;                 // réf générique (collier/skip)
        this.spritesBalance = [this.spriteG, this.spriteD];

        this.visual = this.scene.add.graphics();
        this.visual.setDepth(7);
        this._dessinerBalance();
    }

    _updateBalance() {
        const dt = (this.scene.game.loop.delta ?? 16) / 1000;
        // Signe de la gravité du joueur (pendule OU zone). +1 normal, -1 inversé.
        const signe = this.scene._inversionGravite ? -1 : 1;
        const chargeG = this._chargeSurPlateau(this.spriteG);
        const chargeD = this._chargeSurPlateau(this.spriteD);
        // net>0 → gauche plus lourd → en gravité normale gauche descend (θ>0).
        const net = (chargeG - chargeD) * signe;
        const thetaCible = Phaser.Math.Clamp(net, -1, 1);
        this.balTheta = Phaser.Math.Linear(
            this.balTheta, thetaCible, Math.min(1, this.balVitesse * dt)
        );
        const yG = this.balYRepos + this.balTheta * this.balAmplitude;
        const yD = this.balYRepos - this.balTheta * this.balAmplitude;
        this._piloterPlateau(this.spriteG, yG, dt);
        this._piloterPlateau(this.spriteD, yD, dt);
        this._dessinerBalance();
    }

    // Déplace un plateau vers yCible par VÉLOCITÉ (porte les riders), sans
    // dépasser (clamp). dt = delta frame en secondes.
    _piloterPlateau(s, yCible, dt) {
        const dy = yCible - s.y;
        const v = Phaser.Math.Clamp(dy / dt, -700, 700);
        if (Math.abs(dy) < 0.5) { s.y = yCible; s.body.setVelocity(0, 0); }
        else s.body.setVelocity(0, v);
    }

    // Somme des charges posées sur un plateau : joueur (poidsJoueur) + chaque
    // contrepoids (poids). Détection par AABB « bas de l'objet ≈ top du plateau ».
    _chargeSurPlateau(s) {
        let c = 0;
        const p = this.scene.player;
        if (p && this._reposeSur(p, s)) c += this.def.poidsJoueur;
        if (this.scene.obstacles) {
            for (const o of this.scene.obstacles) {
                if (o.data.type !== 'contrepoids' || !o.sprite) continue;
                if (this._reposeSur(o.sprite, s)) c += (o.data.poids ?? 1);
            }
        }
        return c;
    }

    _reposeSur(obj, plateau) {
        const halfW = (plateau.width + obj.width) / 2;
        if (Math.abs(obj.x - plateau.x) > halfW) return false;
        const objBottom = obj.y + obj.height / 2;
        const platTop = plateau.y - plateau.height / 2;
        return objBottom >= platTop - 16 && objBottom <= platTop + 14;
    }

    _dessinerBalance() {
        const g = this.visual;
        if (!g) return;
        const w = this.data.largeur, h = this.def.hauteurPlateau;
        const now = this.scene.time.now;
        g.clear();

        const pivotX = this.data.x;
        const pivotY = this.balYRepos - this.balAmplitude - 26;   // poulie au-dessus
        const gx = this.spriteG.x, gy = this.spriteG.y;
        const dx = this.spriteD.x, dy = this.spriteD.y;

        // Câbles de poulie : pivot → chaque plateau.
        g.lineStyle(2, COULEUR_VOILE_NACRE, 0.6);
        g.lineBetween(pivotX, pivotY, gx, gy - h / 2);
        g.lineBetween(pivotX, pivotY, dx, dy - h / 2);
        // Poulie centrale.
        g.fillStyle(COULEUR_VOILE_FONCE, 1);
        g.fillCircle(pivotX, pivotY, 9);
        g.lineStyle(2, COULEUR_VOILE_MAGENTA, 0.5 + 0.3 * Math.sin(now / 220));
        g.strokeCircle(pivotX, pivotY, 9);

        // Plateaux.
        for (const s of [this.spriteG, this.spriteD]) {
            const cx = s.x, cy = s.y;
            g.fillStyle(COULEUR_VOILE_FONCE, 0.5);
            g.fillRect(cx - w / 2 + 2, cy - h / 2 + 3, w, h);
            g.fillStyle(COULEUR_VOILE_PIERRE, 1);
            g.fillRect(cx - w / 2, cy - h / 2, w, h);
            g.fillStyle(COULEUR_VOILE_CLAIR, 0.8);
            g.fillRect(cx - w / 2 + 2, cy - h / 2 + 1, w - 4, 2);
            g.lineStyle(2, COULEUR_VOILE_FONCE, 0.8);
            g.strokeRect(cx - w / 2, cy - h / 2, w, h);
            // Anneaux de suspension aux extrémités.
            g.fillStyle(COULEUR_VOILE_NACRE, 0.7);
            g.fillCircle(cx - w / 2 + 4, cy - h / 2, 2.5);
            g.fillCircle(cx + w / 2 - 4, cy - h / 2, 2.5);
        }
    }

    // ════════════════════════════════════════════════════════════════
    // VAGUE 5 — Halls Cendrés Phase 9.8 (toolkit medium-cost)
    // ════════════════════════════════════════════════════════════════

    _creerMarteauPilon() {
        const w = this.data.largeur ?? this.def.largeurDefault;
        const h = this.data.hauteur ?? this.def.hauteurDefault;

        // Sprite static — on déplace manuellement via setPosition + body.updateFromGameObject
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.y, w, h, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.scene.physics.add.existing(this.sprite, true);
        this.sprite._obstacle = this;

        this.visual = this.scene.add.graphics();
        this.visual.setDepth(8);
        this.marteauPhase = 'repos_haut';
        this._t0 = this.scene.time.now + (this.data.offsetMs ?? 0);
        // Tracking position pour la phase chute
        this._yCurrent = this.data.yTopRepos + h / 2;
        this._dessinerMarteauPilon(this.scene.time.now);
    }

    _updateMarteauPilon(now) {
        const cycle = this.data.cycleMs ?? this.def.cycleMs;
        const t = ((now - this._t0) % cycle) / cycle;
        const def = this.def;
        const h = this.data.hauteur ?? def.hauteurDefault;
        const yReposC = this.data.yTopRepos + h / 2;
        const yImpactC = this.data.yTopImpact + h / 2;

        // Détermine la phase
        let phase, phaseT;
        if (t < def.ratioReposHaut) {
            phase = 'repos_haut';
            phaseT = t / def.ratioReposHaut;
            this._yCurrent = yReposC;
        } else if (t < def.ratioReposHaut + def.ratioChute) {
            phase = 'chute';
            phaseT = (t - def.ratioReposHaut) / def.ratioChute;
            // Ease-in (accélération de la chute)
            const eased = phaseT * phaseT;
            this._yCurrent = yReposC + (yImpactC - yReposC) * eased;
        } else if (t < def.ratioReposHaut + def.ratioChute + def.ratioReposBas) {
            const justImpacted = this.marteauPhase === 'chute';
            phase = 'impact';
            this._yCurrent = yImpactC;
            // Shake + particules au premier frame post-chute
            if (justImpacted) {
                this.scene.cameras.main.shake(100, 0.006);
                // Bouffée de poussière à l'impact
                const x = this.data.x;
                const yBas = yImpactC + h / 2;
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI + Math.PI;  // arc supérieur
                    const dx = Math.cos(angle) * 24;
                    const dy = Math.sin(angle) * 6;
                    const p = this.scene.add.circle(x + dx, yBas + dy, 4, 0x5a4838, 0.7);
                    p.setDepth(10);
                    this.scene.tweens.add({
                        targets: p,
                        x: x + dx * 2.5,
                        y: yBas + dy - 12,
                        alpha: 0,
                        scaleX: 0.3,
                        scaleY: 0.3,
                        duration: 500,
                        onComplete: () => p.destroy()
                    });
                }
            }
            // Sub-phase pour distinguer impact instantané vs repos bas
            if (this.marteauPhase === 'chute') phase = 'impact';
            else phase = 'repos_bas';
        } else {
            phase = 'remonte';
            const localT = (t - def.ratioReposHaut - def.ratioChute - def.ratioReposBas) / def.ratioRemonte;
            // Ease-out (remontée qui ralentit)
            const eased = 1 - (1 - localT) * (1 - localT);
            this._yCurrent = yImpactC + (yReposC - yImpactC) * eased;
        }

        this.marteauPhase = phase;
        // Met à jour le sprite physique
        this.sprite.y = this._yCurrent;
        this.sprite.body.updateFromGameObject();
        // Redraw visuel
        this._dessinerMarteauPilon(now);
    }

    _dessinerMarteauPilon(now) {
        const w = this.data.largeur ?? this.def.largeurDefault;
        const h = this.data.hauteur ?? this.def.hauteurDefault;
        const cx = this.data.x;
        const cy = this._yCurrent;
        const yReposC = this.data.yTopRepos + h / 2;
        const yImpactC = this.data.yTopImpact + h / 2;

        const g = this.visual;
        g.clear();

        // Câble suspendu (du plafond au marteau) — tige métallique
        const yCableTop = this.data.yTopRepos - 8;
        g.lineStyle(4, 0x3a2a1a, 1);
        g.lineBetween(cx, yCableTop, cx, cy - h / 2);
        g.lineStyle(2, 0x6a4a30, 1);
        g.lineBetween(cx - 1, yCableTop, cx - 1, cy - h / 2);

        // Ombre projetée au sol (lecture danger en phase repos_haut)
        if (this.marteauPhase === 'repos_haut') {
            const tProche = ((now - this._t0) % (this.data.cycleMs ?? this.def.cycleMs)) /
                           (this.data.cycleMs ?? this.def.cycleMs);
            const proximite = tProche / this.def.ratioReposHaut;     // 0..1
            const intensite = 0.15 + proximite * 0.4;
            g.fillStyle(0x000000, intensite);
            const ombreLargeur = w * 1.1;
            g.fillEllipse(cx, yImpactC + h / 2 - 4, ombreLargeur, 8);
        }

        // Corps du marteau : bloc fer/cuivre
        // Ombre portée
        g.fillStyle(0x000000, 0.4);
        g.fillRect(cx - w / 2 + 3, cy - h / 2 + 3, w, h);
        // Corps principal (fer noirâtre)
        g.fillStyle(0x2a2018, 1);
        g.fillRect(cx - w / 2, cy - h / 2, w, h);
        // Bandes cuivrées horizontales (3 niveaux)
        g.fillStyle(COULEUR_CUIVRE_TERNI, 1);
        g.fillRect(cx - w / 2 + 2, cy - h / 2 + 4, w - 4, 6);
        g.fillRect(cx - w / 2 + 2, cy - h / 4 - 3, w - 4, 6);
        g.fillRect(cx - w / 2 + 2, cy + h / 4 - 3, w - 4, 6);
        // Rivets aux coins (cuivre clair)
        g.fillStyle(0xd89860, 1);
        g.fillCircle(cx - w / 2 + 5, cy - h / 2 + 6, 2);
        g.fillCircle(cx + w / 2 - 5, cy - h / 2 + 6, 2);
        g.fillCircle(cx - w / 2 + 5, cy + h / 2 - 6, 2);
        g.fillCircle(cx + w / 2 - 5, cy + h / 2 - 6, 2);
        // Face d'impact (bas) — bord plus sombre + lueur orange si chute/impact
        g.fillStyle(0x18120a, 1);
        g.fillRect(cx - w / 2, cy + h / 2 - 8, w, 8);
        if (this.marteauPhase === 'chute' || this.marteauPhase === 'impact') {
            const glow = this.marteauPhase === 'impact' ? 0.9 : 0.5;
            g.fillStyle(COULEUR_BRAISE, glow);
            g.fillRect(cx - w / 2 + 3, cy + h / 2 - 4, w - 6, 4);
            // Étincelles
            for (let i = 0; i < 3; i++) {
                const ex = cx + Math.sin(now / 50 + i * 1.7) * (w / 3);
                g.fillStyle(0xffaa30, glow * 0.8);
                g.fillCircle(ex, cy + h / 2 + 2, 2);
            }
        }
        // Liseré clair (lumière oblique gauche)
        g.fillStyle(0x504030, 0.6);
        g.fillRect(cx - w / 2 + 2, cy - h / 2 + 2, 3, h - 4);
    }

    _creerPistonThermique() {
        const def = this.def;
        const wRentre = this.data.largeur ?? def.largeurRentreDefault;
        const h = this.data.hauteur ?? def.hauteurDefault;
        const longExt = this.data.longueurExtension ?? def.longueurExtensionDefault;

        // Sprite dynamic dimensions : on resize/move selon la phase
        // Initialement rentré (longueur = wRentre)
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.y, wRentre, h, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.scene.physics.add.existing(this.sprite, true);
        this.sprite._obstacle = this;

        // Le piston EST bloquant — on l'ajoute aux obstacles solides
        if (this.scene.obstaclesSolides) this.scene.obstaclesSolides.add(this.sprite);
        else if (this.scene.platforms) this.scene.platforms.add(this.sprite);

        this.visual = this.scene.add.graphics();
        this.visual.setDepth(8);
        this.pistonPhase = 'rentre';
        this._t0 = this.scene.time.now + (this.data.offsetMs ?? 0);
        // x rentré sauvegardé pour calculs
        this._xRentre = this.data.x;
        this._dessinerPistonThermique(this.scene.time.now);
    }

    _updatePistonThermique(now) {
        const cycle = this.data.cycleMs ?? this.def.cycleMs;
        const t = ((now - this._t0) % cycle) / cycle;
        const def = this.def;
        const orient = this.data.orientation;
        const sens = orient === 'gauche' ? -1 : 1;
        const wRentre = this.data.largeur ?? def.largeurRentreDefault;
        const h = this.data.hauteur ?? def.hauteurDefault;
        const longExt = this.data.longueurExtension ?? def.longueurExtensionDefault;

        let phase, longueur, xCentre;
        if (t < def.ratioRentre) {
            phase = 'rentre';
            longueur = wRentre;
            xCentre = this._xRentre;
        } else if (t < def.ratioRentre + def.ratioSortie) {
            phase = 'sortie';
            const localT = (t - def.ratioRentre) / def.ratioSortie;
            const eased = 1 - (1 - localT) * (1 - localT);    // ease-out
            longueur = wRentre + longExt * eased;
            // x décalé pour que la base reste collée au mur
            xCentre = this._xRentre + sens * (longueur - wRentre) / 2;
        } else if (t < def.ratioRentre + def.ratioSortie + def.ratioEtendu) {
            phase = 'etendu';
            longueur = wRentre + longExt;
            xCentre = this._xRentre + sens * (longExt) / 2;
        } else {
            phase = 'retraction';
            const localT = (t - def.ratioRentre - def.ratioSortie - def.ratioEtendu) / def.ratioRetraction;
            const eased = localT * localT;                     // ease-in
            longueur = wRentre + longExt * (1 - eased);
            xCentre = this._xRentre + sens * (longueur - wRentre) / 2;
        }

        this.pistonPhase = phase;

        // Met à jour le sprite physique
        this.sprite.x = xCentre;
        this.sprite.setSize(longueur, h);
        this.sprite.body.updateFromGameObject();

        this._currentLongueur = longueur;
        this._currentXCentre = xCentre;
        this._dessinerPistonThermique(now);
    }

    _dessinerPistonThermique(now) {
        const def = this.def;
        const h = this.data.hauteur ?? def.hauteurDefault;
        const orient = this.data.orientation;
        const sens = orient === 'gauche' ? -1 : 1;
        const longueur = this._currentLongueur ?? (this.data.largeur ?? def.largeurRentreDefault);
        const xCentre = this._currentXCentre ?? this.data.x;
        const cy = this.data.y;

        const g = this.visual;
        g.clear();

        // Base ancrée au mur (carré cuivré toujours visible)
        const xBase = this._xRentre - sens * (def.largeurRentreDefault / 2);
        // tube principal
        const xLeft = xCentre - longueur / 2;
        const xRight = xCentre + longueur / 2;

        // Ombre portée
        g.fillStyle(0x000000, 0.4);
        g.fillRect(xLeft + 2, cy - h / 2 + 2, longueur, h);

        // Tige (gris fer)
        g.fillStyle(0x404048, 1);
        g.fillRect(xLeft, cy - h / 2, longueur, h);

        // Bandes cuivrées horizontales (signature Halls)
        g.fillStyle(COULEUR_CUIVRE_TERNI, 1);
        g.fillRect(xLeft + 2, cy - h / 2 + 3, longueur - 4, 4);
        g.fillRect(xLeft + 2, cy + h / 2 - 7, longueur - 4, 4);

        // Tête du piston (plus large, à la pointe de la sortie)
        const teteW = 12;
        const teteH = h + 12;
        const teteX = orient === 'gauche' ? xLeft - teteW / 2 + 6 : xRight + teteW / 2 - 6;
        g.fillStyle(0x000000, 0.5);
        g.fillRect(teteX - teteW / 2 + 2, cy - teteH / 2 + 2, teteW, teteH);
        g.fillStyle(0x2a2520, 1);
        g.fillRect(teteX - teteW / 2, cy - teteH / 2, teteW, teteH);
        g.fillStyle(COULEUR_CUIVRE_TERNI, 1);
        g.fillRect(teteX - teteW / 2 + 2, cy - teteH / 2 + 3, teteW - 4, 4);
        g.fillRect(teteX - teteW / 2 + 2, cy + teteH / 2 - 7, teteW - 4, 4);

        // Liseré incandescent en phase sortie/etendu (jet thermique)
        if (this.pistonPhase === 'sortie' || this.pistonPhase === 'etendu') {
            const intensite = this.pistonPhase === 'sortie' ? 0.9 : 0.6;
            g.fillStyle(COULEUR_BRAISE, intensite);
            g.fillRect(xLeft + 4, cy - 2, longueur - 8, 4);
            // Étincelles à la tête
            for (let i = 0; i < 3; i++) {
                const sy = cy + Math.sin(now / 60 + i * 2.1) * (h / 3);
                g.fillStyle(0xffaa30, intensite * 0.8);
                g.fillCircle(teteX, sy, 2);
            }
        }

        // Trait noir au centre de la tige (lecture sous-jacente)
        g.lineStyle(1, 0x000000, 0.5);
        g.strokeRect(xLeft + 3, cy - h / 2 + 3, longueur - 6, h - 6);
    }

    _creerScieCirculaire() {
        const r = this.data.rayon ?? this.def.rayonDefault;

        // Sprite dynamic — body se déplace via setVelocity (comme plateforme_mobile)
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.y, r * 1.4, r * 1.4, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.scene.physics.add.existing(this.sprite);
        const body = this.sprite.body;
        body.allowGravity = false;
        body.immovable = true;
        this.sprite._obstacle = this;

        this.visual = this.scene.add.graphics();
        this.visual.setDepth(8);
        this._t0 = this.scene.time.now;
        this._centreX = this.data.x;
        this._centreY = this.data.y;
        this._dessinerScieCirculaire(this.scene.time.now);
    }

    _updateScieCirculaire(now) {
        const axe = this.data.axe ?? 'horizontale';
        const amp = this.data.amplitude ?? this.def.amplitudeDefault;
        const periode = this.data.periode ?? this.def.periodeDefault;
        const omega = (Math.PI * 2) / (periode / 1000);
        const t = (now - this._t0) / periode;
        const v = Math.cos(t * Math.PI * 2) * amp * omega;
        const body = this.sprite.body;
        if (axe === 'horizontale') {
            body.setVelocity(v, 0);
            const dx = this.sprite.x - this._centreX;
            if (Math.abs(dx) > amp * 1.08) {
                this.sprite.x = this._centreX + Math.sign(dx) * amp;
            }
        } else {
            body.setVelocity(0, v);
            const dy = this.sprite.y - this._centreY;
            if (Math.abs(dy) > amp * 1.08) {
                this.sprite.y = this._centreY + Math.sign(dy) * amp;
            }
        }
        this._dessinerScieCirculaire(now);
    }

    _dessinerScieCirculaire(now) {
        const r = this.data.rayon ?? this.def.rayonDefault;
        const cx = this.sprite.x;
        const cy = this.sprite.y;
        const rotation = (now / 1000) * (this.def.vitesseRotDefault) * Math.PI * 2;

        const g = this.visual;
        g.clear();

        // Rail (ligne en pointillé selon l'axe)
        g.lineStyle(2, 0x3a2a1a, 0.6);
        const amp = this.data.amplitude ?? this.def.amplitudeDefault;
        if ((this.data.axe ?? 'horizontale') === 'horizontale') {
            g.lineBetween(this._centreX - amp - 4, cy, this._centreX + amp + 4, cy);
        } else {
            g.lineBetween(cx, this._centreY - amp - 4, cx, this._centreY + amp + 4);
        }

        // Ombre portée
        g.fillStyle(0x000000, 0.5);
        g.fillCircle(cx + 2, cy + 2, r);

        // Disque (acier sombre)
        g.fillStyle(0x707880, 1);
        g.fillCircle(cx, cy, r);
        // Bordure cuivrée
        g.lineStyle(2, COULEUR_CUIVRE_TERNI, 1);
        g.strokeCircle(cx, cy, r);

        // Dents crantées (8 dents qui tournent)
        const nbDents = 8;
        for (let i = 0; i < nbDents; i++) {
            const angle = rotation + (i / nbDents) * Math.PI * 2;
            const dx = Math.cos(angle);
            const dy = Math.sin(angle);
            // Pointe extérieure
            const px = cx + dx * (r + 5);
            const py = cy + dy * (r + 5);
            // Base intérieure (2 points pour faire un triangle)
            const a1 = angle - 0.15;
            const a2 = angle + 0.15;
            const b1x = cx + Math.cos(a1) * (r - 1);
            const b1y = cy + Math.sin(a1) * (r - 1);
            const b2x = cx + Math.cos(a2) * (r - 1);
            const b2y = cy + Math.sin(a2) * (r - 1);
            g.fillStyle(0x404048, 1);
            g.beginPath();
            g.moveTo(px, py);
            g.lineTo(b1x, b1y);
            g.lineTo(b2x, b2y);
            g.closePath();
            g.fillPath();
        }

        // Centre (axe de rotation)
        g.fillStyle(0x18120a, 1);
        g.fillCircle(cx, cy, r * 0.4);
        g.fillStyle(COULEUR_CUIVRE_TERNI, 1);
        g.fillCircle(cx, cy, r * 0.3);
        // Croix de l'axe (tourne avec le disque)
        g.lineStyle(2, 0x18120a, 1);
        const a = rotation;
        g.lineBetween(
            cx + Math.cos(a) * r * 0.25, cy + Math.sin(a) * r * 0.25,
            cx - Math.cos(a) * r * 0.25, cy - Math.sin(a) * r * 0.25
        );
        g.lineBetween(
            cx + Math.cos(a + Math.PI / 2) * r * 0.25, cy + Math.sin(a + Math.PI / 2) * r * 0.25,
            cx - Math.cos(a + Math.PI / 2) * r * 0.25, cy - Math.sin(a + Math.PI / 2) * r * 0.25
        );

        // Étincelles d'usinage (jaillissent du périmètre)
        for (let i = 0; i < 4; i++) {
            const a = rotation * 0.3 + i * 1.5;
            const sx = cx + Math.cos(a) * r * 1.1;
            const sy = cy + Math.sin(a) * r * 1.1;
            g.fillStyle(0xffaa30, 0.8);
            g.fillCircle(sx, sy, 1.5);
            // Trainée d'étincelle (court trait)
            g.lineStyle(1.5, 0xffd070, 0.6);
            g.lineBetween(sx, sy, sx + Math.cos(a) * 4, sy + Math.sin(a) * 4);
        }
    }

    _exploserBlocCharbon() {
        // Mêmes effets qu'un mur explosif détruit
        const cx = this.sprite.x;
        const cy = this.sprite.y;
        // Projectiles radiaux
        const nbProj = this.def.nbProjectilesExplosion;
        const vitesse = this.def.vitesseProjectileExplosion;
        for (let i = 0; i < nbProj; i++) {
            const angle = (i / nbProj) * Math.PI * 2;
            const dx = Math.cos(angle);
            const dy = Math.sin(angle);
            const proj = this.scene.add.rectangle(cx, cy, 12, 12, 0xffffff, 0);
            proj.setAlpha(0);
            this.scene.physics.add.existing(proj);
            proj.body.allowGravity = false;
            proj.body.setVelocity(dx * vitesse, dy * vitesse);

            // Overlap dégâts joueur
            const overlap = this.scene.physics.add.overlap(proj, this.scene.player, () => {
                this.scene.events.emit('obstacle:pieu:hit', { def: { degatsImpact: this.def.degatsProjectile } });
                overlap?.destroy();
                proj?.destroy();
            });

            const visuel = this.scene.add.graphics();
            visuel.setDepth(12);
            const t0 = this.scene.time.now;
            const dureeVie = (this.def.rayonExplosion / vitesse) * 1000;
            this.scene.tweens.addCounter({
                from: 0, to: 1, duration: dureeVie,
                onUpdate: (tw) => {
                    const fade = 1 - tw.getValue();
                    if (!proj.active) return;
                    visuel.clear();
                    visuel.fillStyle(COULEUR_BRAISE_FONCE, 0.4 * fade);
                    visuel.fillCircle(proj.x - dx * 12, proj.y - dy * 12, 8);
                    visuel.fillStyle(COULEUR_BRAISE, 0.6 * fade);
                    visuel.fillCircle(proj.x - dx * 6, proj.y - dy * 6, 6);
                    visuel.fillStyle(COULEUR_BRAISE_VIVE, fade);
                    visuel.fillCircle(proj.x, proj.y, 5);
                    visuel.fillStyle(0xffffff, fade * 0.7);
                    visuel.fillCircle(proj.x, proj.y, 2);
                },
                onComplete: () => {
                    overlap?.destroy();
                    proj?.destroy();
                    visuel?.destroy();
                }
            });
        }
        // Particules + shake
        this.scene.cameras.main.shake(140, 0.008);
        // Détruit l'instance
        this.detruire();
    }

    // ════════════════════════════════════════════════════════════════
    // VAGUE 6 — Cristaux Glacés (« Silence & Glace »)
    // ════════════════════════════════════════════════════════════════

    // ─── Stalactite de Résonance (tombe sur le bruit du joueur) ───
    _creerStalactiteResonance() {
        const w = this.def.largeur, h = this.def.hauteur;
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.yOrigine, w, h, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.scene.physics.add.existing(this.sprite);
        this.sprite._obstacle = this;
        const body = this.sprite.body;
        body.allowGravity = false;
        body.immovable = true;
        body.setVelocity(0, 0);

        this.visual = this.scene.add.graphics();
        this.visual.setDepth(8);
        this._dessinerStalactite(this.data.x, this.data.yOrigine, false);

        this.ombre = this.scene.add.ellipse(this.data.x, this.data.yImpact + h / 2 + 6,
                                            w * 1.3, 9, 0x000000, 0.35);
        this.ombre.setDepth(6);
        this.ombre.setAlpha(0);

        this.stalPhase = 'repos';     // 'repos' | 'avertir' | 'chute' | 'brise'
        this._timers = [];
    }

    _dessinerStalactite(cx, cy, fissure) {
        const g = this.visual;
        g.clear();
        const w = this.def.largeur, h = this.def.hauteur;
        // Pic gris « résonance morte » pointant vers le bas
        g.fillStyle(COULEUR_MORT_FONCE, 1);
        g.beginPath();
        g.moveTo(cx - w / 2, cy - h / 2);
        g.lineTo(cx + w / 2, cy - h / 2);
        g.lineTo(cx, cy + h / 2);
        g.closePath(); g.fillPath();
        // Facette claire (volume)
        g.fillStyle(COULEUR_MORT, 1);
        g.beginPath();
        g.moveTo(cx - w / 2 + 3, cy - h / 2);
        g.lineTo(cx + 1, cy - h / 2);
        g.lineTo(cx - 2, cy + h / 2 - 6);
        g.closePath(); g.fillPath();
        // Reflet froid
        g.lineStyle(1.5, COULEUR_GLACE_CLAIR, 0.4);
        g.lineBetween(cx - 3, cy - h / 2 + 4, cx - 1, cy + h / 2 - 10);
        // Base d'ancrage au plafond
        g.fillStyle(COULEUR_MORT_FONCE, 1);
        g.fillRect(cx - w / 2 - 2, cy - h / 2 - 4, w + 4, 6);
        // Fissures d'avertissement
        if (fissure) {
            g.lineStyle(1.5, 0x12121a, 0.9);
            g.lineBetween(cx - w / 4, cy - h / 2 + 2, cx - 2, cy);
            g.lineBetween(cx + w / 5, cy - h / 2 + 4, cx + 1, cy + h / 4);
        }
    }

    /** Appelé par GameScene quand le joueur attaque dans le rayon de bruit. */
    declencherChuteBruit() {
        if (this.stalPhase !== 'repos') return;
        this.stalPhase = 'avertir';
        this._dessinerStalactite(this.data.x, this.data.yOrigine, true);
        // Tremblement (offset du Graphics)
        this.scene.tweens.add({
            targets: this.visual, x: { from: -1.5, to: 1.5 },
            duration: 55, yoyo: true, repeat: Math.floor(this.def.delaiFissureMs / 110)
        });
        this.scene.tweens.add({
            targets: this.ombre, alpha: { from: 0, to: 0.6 }, scaleX: { from: 0.7, to: 1.2 },
            duration: this.def.delaiFissureMs, ease: 'Sine.easeIn'
        });
        this._timers.push(this.scene.time.delayedCall(this.def.delaiFissureMs, () => {
            if (!this.sprite || this.stalPhase !== 'avertir') return;
            this.visual.x = 0;
            this.stalPhase = 'chute';
            this.sprite.body.setVelocityY(this.def.vitesseChute);
        }));
    }

    _updateStalactite() {
        if (this.stalPhase !== 'chute') return;
        this._dessinerStalactite(this.data.x, this.sprite.y, false);
        if (this.sprite.y >= this.data.yImpact) {
            this.sprite.y = this.data.yImpact;
            this.sprite.body.setVelocity(0, 0);
            this.sprite.body.enable = false;   // pas de mur invisible au sol
            this.stalPhase = 'brise';
            if (this.scene.textures.exists('_particule')) {
                const burst = this.scene.add.particles(this.data.x, this.data.yImpact + this.def.hauteur / 2,
                    '_particule', {
                        lifespan: 380, speed: { min: 80, max: 200 },
                        angle: { min: -160, max: -20 }, scale: { start: 0.5, end: 0 },
                        tint: [COULEUR_MORT, COULEUR_GLACE_CLAIR], quantity: 10, alpha: { start: 1, end: 0 }
                    });
                burst.setDepth(15); burst.explode(10);
                this.scene.time.delayedCall(420, () => burst.destroy());
            }
            this.scene.cameras.main.shake(90, 0.004);
            this.visual.clear();
            if (this.ombre) this.ombre.setAlpha(0).setScale(1);
            // Re-suspension après un délai → la salle reste dangereuse
            this._timers.push(this.scene.time.delayedCall(2600, () => {
                if (!this.sprite) return;
                this.sprite.y = this.data.yOrigine;
                this.sprite.body.setVelocity(0, 0);
                this.sprite.body.enable = true;
                this.stalPhase = 'repos';
                this._dessinerStalactite(this.data.x, this.data.yOrigine, false);
            }));
        }
    }

    // ─── Verglas (zone glissante) ───
    _creerVerglas() {
        const w = this.data.largeur, h = this.data.hauteur;
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.y, w, h, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.scene.physics.add.existing(this.sprite, true);  // static, overlap
        this.sprite._obstacle = this;

        this.visual = this.scene.add.graphics();
        this.visual.setDepth(7);
        const g = this.visual;
        const x0 = this.data.x - w / 2, yBas = this.data.y + h / 2;
        g.fillStyle(COULEUR_GLACE_CLAIR, 0.16);
        g.fillRect(x0, this.data.y - h / 2, w, h);
        g.fillStyle(COULEUR_GLACE, 0.12);
        g.fillRect(x0, yBas - 8, w, 8);
        g.lineStyle(2, COULEUR_GLACE_CLAIR, 0.5);
        for (let sx = x0 + 14; sx < x0 + w - 6; sx += 46) {
            g.lineBetween(sx, yBas - 5, sx + 18, yBas - 5);
        }
        g.lineStyle(1, COULEUR_GLACE_CLAIR, 0.3);
        g.lineBetween(x0 + 4, this.data.y - h / 2 + 3, x0 + w - 8, this.data.y - h / 2 + 3);
    }

    // ─── Faille de Vide (drain de Résonance) ───
    _creerFailleVide() {
        const w = this.data.largeur, h = this.data.hauteur;
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.y, w, h, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.scene.physics.add.existing(this.sprite, true);
        this.sprite._obstacle = this;

        this.visual = this.scene.add.graphics();
        this.visual.setDepth(7);
        const g = this.visual;
        const x0 = this.data.x - w / 2, y0 = this.data.y - h / 2;
        g.fillStyle(COULEUR_VIDE, 0.92);
        g.fillRect(x0, y0, w, h);
        g.lineStyle(2, COULEUR_MNESIQUE, 0.5);
        g.strokeRect(x0, y0, w, h);

        const etoiles = this.scene.add.graphics();
        etoiles.setDepth(7);
        for (let i = 0; i < 6; i++) {
            const px = x0 + 8 + Math.random() * (w - 16);
            const py = y0 + 6 + Math.random() * (h - 12);
            etoiles.fillStyle(COULEUR_MNESIQUE_VIF, 0.7);
            etoiles.fillCircle(px, py, 1.2);
        }
        this._extraVisuals = [etoiles];
        this.scene.tweens.add({
            targets: etoiles, alpha: { from: 0.3, to: 0.9 },
            duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
    }

    // ─── Cristal Résonant (chant = révèle les plateformes liées) ───
    _creerCristalResonant() {
        const w = this.def.largeur, h = this.def.hauteur;
        // Rectangle (pas de body : frappé via tenterAttaque qui lit x/width)
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.y, w, h, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.sprite._obstacle = this;

        this.visual = this.scene.add.graphics();
        this.visual.setDepth(8);
        this._dessinerCristalResonant(false);
        this.scene.tweens.add({
            targets: this.visual, alpha: { from: 0.75, to: 1 },
            duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
    }

    _dessinerCristalResonant(actif) {
        const g = this.visual; g.clear();
        const cx = this.data.x, cy = this.data.y, w = this.def.largeur, h = this.def.hauteur;
        g.fillStyle(COULEUR_MNESIQUE_VIF, actif ? 0.5 : 0.2);
        g.fillCircle(cx, cy, w * 0.65);
        g.fillStyle(actif ? COULEUR_MNESIQUE_VIF : COULEUR_MNESIQUE, 1);
        g.beginPath();
        g.moveTo(cx, cy - h / 2);
        g.lineTo(cx + w / 2, cy);
        g.lineTo(cx, cy + h / 2);
        g.lineTo(cx - w / 2, cy);
        g.closePath(); g.fillPath();
        g.fillStyle(COULEUR_MNESIQUE_VIF, 0.7);
        g.beginPath();
        g.moveTo(cx, cy - h / 2);
        g.lineTo(cx + w / 2, cy);
        g.lineTo(cx, cy);
        g.closePath(); g.fillPath();
        g.fillStyle(0xffffff, actif ? 0.9 : 0.5);
        g.fillCircle(cx, cy, 3);
    }

    /** Appelé par GameScene quand le cristal est frappé. */
    declencherChant() {
        this._dessinerCristalResonant(true);
        const ring = this.scene.add.graphics();
        ring.setDepth(9);
        this.scene.tweens.addCounter({
            from: 0, to: 1, duration: 520,
            onUpdate: (tw) => {
                const v = tw.getValue();
                ring.clear();
                ring.lineStyle(2, COULEUR_MNESIQUE_VIF, 1 - v);
                ring.strokeCircle(this.data.x, this.data.y, 10 + v * 70);
            },
            onComplete: () => ring.destroy()
        });
        this.scene.time.delayedCall(700, () => {
            if (this.visual?.active) this._dessinerCristalResonant(false);
        });
    }

    // ─── Plateforme de Résonance (intangible → solide pendant le chant) ───
    _creerPlateformeResonance() {
        const w = this.data.largeur, h = this.data.hauteur;
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.y, w, h, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.scene.physics.add.existing(this.sprite, true);  // static
        this.sprite._obstacle = this;
        this.sprite.body.enable = false;                     // intangible par défaut
        this.revele = false;

        this.visual = this.scene.add.graphics();
        this.visual.setDepth(7);
        this._dessinerPlateformeResonance(false);
    }

    _dessinerPlateformeResonance(revele) {
        const g = this.visual; g.clear();
        const cx = this.data.x, cy = this.data.y, w = this.data.largeur, h = this.data.hauteur;
        const x0 = cx - w / 2, y0 = cy - h / 2;
        const a = revele ? 1 : 0.22;
        g.fillStyle(COULEUR_GLACE_FONCE, a);
        g.fillRect(x0, y0, w, h);
        g.fillStyle(COULEUR_GLACE, a);
        g.fillRect(x0, y0, w, 4);
        g.lineStyle(1.5, COULEUR_MNESIQUE, revele ? 0.9 : 0.4);
        g.strokeRect(x0, y0, w, h);
        g.lineStyle(1, COULEUR_MNESIQUE_VIF, revele ? 0.8 : 0.3);
        g.lineBetween(x0 + 8, cy, x0 + w - 8, cy);
    }

    setRevele(revele) {
        if (this.revele === revele) return;
        this.revele = revele;
        if (this.sprite?.body) this.sprite.body.enable = revele;
        this._dessinerPlateformeResonance(revele);
    }

    // ─── Souffle de Blizzard (poussée latérale) ───
    _creerSouffleBlizzard() {
        const w = this.data.largeur, h = this.data.hauteur;
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.y, w, h, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.scene.physics.add.existing(this.sprite, true);
        this.sprite._obstacle = this;

        this.visual = this.scene.add.graphics();
        this.visual.setDepth(6);
        this._t0 = this.scene.time.now;
        this._dessinerBlizzard(this.scene.time.now);
    }

    _dessinerBlizzard(now) {
        const g = this.visual; g.clear();
        const cx = this.data.x, cy = this.data.y, w = this.data.largeur, h = this.data.hauteur;
        const x0 = cx - w / 2, y0 = cy - h / 2;
        const dir = Math.sign(this.data.force) || 1;
        g.fillStyle(COULEUR_GLACE_CLAIR, 0.06);
        g.fillRect(x0, y0, w, h);
        const t = (now - this._t0) / 1000;
        g.lineStyle(2, COULEUR_GLACE_CLAIR, 0.18);
        const nb = 7;
        for (let i = 0; i < nb; i++) {
            const prog = ((t * 0.35 + i / nb) % 1);
            const sx = x0 + (dir > 0 ? prog * w : (1 - prog) * w);
            const sy = y0 + 12 + ((i * 53) % Math.max(24, h - 24));
            const len = 26 + (i % 3) * 10;
            g.lineBetween(sx, sy, sx + dir * len, sy);
        }
    }

    // ════════════════════════════════════════════════════════════════
    // VAGUE 9 — Cœur du Reflux (obstacles VUE DE DESSUS, Phase 9.11)
    // ════════════════════════════════════════════════════════════════

    // ─── Zone d'oubli : nappe grise désaturée (éteint les capacités) ───
    _creerZoneOubli() {
        const w = this.data.largeur, h = this.data.hauteur;
        // Corps d'overlap invisible (static).
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.y, w, h, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.scene.physics.add.existing(this.sprite, true);
        this.sprite._obstacle = this;

        // Visuel : nappe grise + hachures ternes = « ici tu n'es plus rien ».
        this.visual = this.scene.add.graphics();
        this.visual.setDepth(8);
        const x0 = this.data.x - w / 2, y0 = this.data.y - h / 2;
        this.visual.fillStyle(0x6a6870, 0.16);
        this.visual.fillRect(x0, y0, w, h);
        this.visual.lineStyle(2, 0x8a8890, 0.4);
        this.visual.strokeRect(x0, y0, w, h);
        this.visual.lineStyle(1, 0x55535c, 0.30);
        for (let gx = x0 + 16; gx < x0 + w; gx += 22) {
            this.visual.lineBetween(gx, y0, gx - 18, y0 + h);
        }
        // Léger pouls de désaturation (lecture vivante mais sourde).
        this.scene.tweens.add({
            targets: this.visual,
            alpha: { from: 0.65, to: 1 },
            duration: 1500, ease: 'Sine.InOut', yoyo: true, repeat: -1
        });
    }

    // ─── Courant de Reflux : rivière violette qui pousse le joueur ───
    _creerCourantReflux() {
        const w = this.data.largeur, h = this.data.hauteur;
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.y, w, h, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.scene.physics.add.existing(this.sprite, true);
        this.sprite._obstacle = this;

        this.visual = this.scene.add.graphics();
        this.visual.setDepth(7);
        this._t0 = this.scene.time.now;
        this._dessinerCourant(this._t0);
    }

    _dessinerCourant(now) {
        const g = this.visual; g.clear();
        const cx = this.data.x, cy = this.data.y, w = this.data.largeur, h = this.data.hauteur;
        const x0 = cx - w / 2, y0 = cy - h / 2;
        const dx = this.data.dirX, dy = this.data.dirY;

        // Nappe violette + cadre (lecture « zone de courant »).
        g.fillStyle(0xc060d8, 0.10);
        g.fillRect(x0, y0, w, h);
        g.lineStyle(1, 0xff5078, 0.22);
        g.strokeRect(x0, y0, w, h);

        // Traits de flux qui défilent DANS la direction du courant (lecture du sens).
        const t = (now - this._t0) / 1000;
        g.lineStyle(2, 0xf0a8e8, 0.5);
        const nb = 12, len = 28, course = 46;
        for (let i = 0; i < nb; i++) {
            const prog = ((t * 0.45 + i / nb) % 1);
            const baseX = x0 + ((i * 71) % Math.max(1, w));
            const baseY = y0 + ((i * 53) % Math.max(1, h));
            const sx = baseX + dx * prog * course;
            const sy = baseY + dy * prog * course;
            g.lineBetween(sx, sy, sx + dx * len, sy + dy * len);
        }
    }

    // ─── Helper de dégât pour les hazards à hit MANUEL (laser, onde) ───
    _toucherJoueurManuel(now) {
        const s = this.scene;
        if (now < (s.invincibleJusqu ?? 0)) return;
        s.resonance.prendreDegats(this.data.degats ?? this.def.degatsDefault ?? 5);
        s.invincibleJusqu = now + (this.def.invincibiliteApresHit ?? 700);
        s.flashJoueur?.(0xff4040);
        s.cameras?.main?.shake?.(110, 0.005);
    }

    // ─── Laser de surveillance : faisceau qui balaie (pivot rotatif) ───
    _creerLaserSurveillance() {
        // Sprite-ancre invisible (sans collision) : juste pour exister dans la
        // liste obstacles (le hit est MANUEL — un AABB ne tourne pas). update()
        // dessine le faisceau et teste la géométrie joueur/faisceau.
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.y, 4, 4, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.sprite._obstacle = this;
        this.visual = this.scene.add.graphics();
        this.visual.setDepth(9);
        this._t0 = this.scene.time.now;
        this._updateLaserSurveillance(this._t0);
    }

    _updateLaserSurveillance(now) {
        const d = this.data, def = this.def;
        const vitesse = d.vitesse ?? def.vitesseDefault;       // rad/s
        const longueur = d.longueur ?? def.longueurDefault;
        const epais = d.epaisseur ?? def.epaisseurDefault;
        const t = (now - this._t0) / 1000;
        // Rotation continue, ou oscillation dans un arc si `arc` est fourni.
        const angle = (d.arc && d.arc > 0)
            ? (d.angleDeb ?? 0) + Math.sin(t * vitesse) * d.arc
            : (d.angleDeb ?? 0) + t * vitesse;

        const g = this.visual; g.clear();
        const px = d.x, py = d.y;
        const ex = px + Math.cos(angle) * longueur, ey = py + Math.sin(angle) * longueur;
        g.lineStyle(epais, 0xff2030, 0.20);  g.lineBetween(px, py, ex, ey);    // halo
        g.lineStyle(epais * 0.4, 0xff7060, 0.55); g.lineBetween(px, py, ex, ey); // cœur
        g.fillStyle(0xff3030, 0.7); g.fillCircle(px, py, 9);                    // émetteur

        // Hit test : projection du joueur sur l'axe du faisceau.
        const pl = this.scene.player; if (!pl) return;
        const rx = pl.x - px, ry = pl.y - py;
        const along = rx * Math.cos(angle) + ry * Math.sin(angle);
        if (along < 0 || along > longueur) return;
        const perp = Math.abs(-rx * Math.sin(angle) + ry * Math.cos(angle));
        if (perp <= epais / 2 + 16) this._toucherJoueurManuel(now);
    }

    // ─── Onde radiale : ondes de choc concentriques depuis un centre ───
    _creerOndeRadiale() {
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.y, 4, 4, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.sprite._obstacle = this;
        this.visual = this.scene.add.graphics();
        this.visual.setDepth(9);
        this._t0 = this.scene.time.now;
        this._updateOndeRadiale(this._t0);
    }

    _updateOndeRadiale(now) {
        const d = this.data, def = this.def;
        const periode = d.periodeMs ?? def.periodeMsDefault;
        const vitesse = d.vitesse ?? def.vitesseDefault;
        const epais = d.epaisseur ?? def.epaisseurDefault;
        const rayonMax = d.rayonMax ?? def.rayonMaxDefault;
        const age = ((now - this._t0) % periode);
        const rayon = (age / 1000) * vitesse;

        const g = this.visual; g.clear();
        // Cœur pulsant au centre (télégraphe avant le départ de l'onde).
        const pulse = 0.5 + 0.5 * Math.sin(now / 300);
        g.fillStyle(0xff2030, 0.10 + 0.12 * pulse); g.fillCircle(d.x, d.y, 15);

        if (rayon <= rayonMax) {
            g.lineStyle(epais, 0xff2030, 0.16);       g.strokeCircle(d.x, d.y, rayon);
            g.lineStyle(epais * 0.4, 0xff8060, 0.45); g.strokeCircle(d.x, d.y, rayon);
            const pl = this.scene.player;
            if (pl) {
                const dist = Math.hypot(pl.x - d.x, pl.y - d.y);
                if (Math.abs(dist - rayon) <= epais / 2 + 14) this._toucherJoueurManuel(now);
            }
        }
    }

    // ─── Pieu mnémonique : pieux qui surgissent du sol (warning→up→down) ───
    _creerPieuMnemonique() {
        const w = this.data.largeur ?? this.def.largeurDefault;
        const h = this.data.hauteur ?? this.def.hauteurDefault;
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.y, w, h, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.scene.physics.add.existing(this.sprite, true);
        this.sprite.body.enable = false;            // inactif hors phase 'up'
        this.sprite._obstacle = this;
        this.visual = this.scene.add.graphics();
        this.visual.setDepth(8);
        this._t0 = this.scene.time.now;
        this._dernierHit = 0;
        this._phase = 'down';
        this._updatePieuMnemonique(this._t0);
    }

    _updatePieuMnemonique(now) {
        const d = this.data, def = this.def;
        const cycle = d.cycleMs ?? def.cycleMsDefault;
        const off = d.offsetMs ?? 0;
        const dureeUp = d.dureeUpMs ?? def.dureeUpMsDefault;
        const avert = def.avertMsDefault ?? 600;
        const t = ((((now - this._t0 + off) % cycle) + cycle) % cycle);
        let phase;
        if (t < cycle - dureeUp - avert) phase = 'down';
        else if (t < cycle - dureeUp)    phase = 'warning';
        else                              phase = 'up';
        this._phase = phase;
        if (this.sprite.body) this.sprite.body.enable = (phase === 'up');

        const g = this.visual; g.clear();
        const w = d.largeur ?? def.largeurDefault, h = d.hauteur ?? def.hauteurDefault;
        const x0 = d.x - w / 2, y0 = d.y - h / 2;
        if (phase === 'warning') {
            // Marques de surgissement imminent (lecture « recule »).
            const k = 0.5 + 0.5 * Math.sin(now / 90);
            g.fillStyle(0xff2030, 0.06 + 0.10 * k); g.fillRect(x0, y0, w, h);
            g.lineStyle(1, 0xff6060, 0.4 + 0.4 * k); g.strokeRect(x0, y0, w, h);
        } else if (phase === 'up') {
            g.fillStyle(0x4a0a14, 0.85); g.fillRect(x0, y0, w, h);
            g.fillStyle(0xff3838, 1);
            const n = 3;
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    const cx = x0 + (i + 0.5) * (w / n), cy = y0 + (j + 0.5) * (h / n);
                    g.fillTriangle(cx - 6, cy + 8, cx + 6, cy + 8, cx, cy - 9);
                }
            }
        }
    }

    // ─── Regard figé : statue qui tire dans son cône de vision ───
    _creerRegardFige() {
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.y, 32, 32, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.sprite._obstacle = this;
        this.visual = this.scene.add.graphics();
        this.visual.setDepth(9);
        this._t0 = this.scene.time.now;
        this._dernierTir = 0;
        this._dessinerRegard(this._t0, false);
    }

    _updateRegardFige(now) {
        const d = this.data, def = this.def;
        const portee = d.portee ?? def.porteeDefault;
        const demiCone = d.demiCone ?? def.demiConeDefault;
        const angle = d.angle ?? 0;
        const pl = this.scene.player;
        let cible = false;
        if (pl) {
            const dx = pl.x - d.x, dy = pl.y - d.y;
            if (Math.hypot(dx, dy) <= portee) {
                const diff = Math.abs(Phaser.Math.Angle.Wrap(Math.atan2(dy, dx) - angle));
                if (diff <= demiCone) cible = true;
            }
        }
        this._dessinerRegard(now, cible);

        if (cible && now - (this._dernierTir ?? 0) >= (d.cooldownMs ?? def.cooldownMsDefault)) {
            this._dernierTir = now;
            // Projectile parry-able via le pipeline existant (event enemy:tir).
            this.scene.events.emit('enemy:tir', this, {
                x: d.x, y: d.y, cibleX: pl.x, cibleY: pl.y,
                vitesse: d.vitesseProj ?? def.vitesseProjDefault,
                degats: d.degatsProj ?? def.degatsProjDefault,
                couleur: 0xff3030, halo: 0xff6060
            });
        }
    }

    _dessinerRegard(now, actif) {
        const g = this.visual; g.clear();
        const d = this.data, def = this.def;
        const portee = d.portee ?? def.porteeDefault;
        const demiCone = d.demiCone ?? def.demiConeDefault;
        const angle = d.angle ?? 0;
        // Cône de vision (rempli faible alpha ; rouge vif si une cible est repérée).
        const a1 = angle - demiCone, a2 = angle + demiCone;
        g.fillStyle(actif ? 0xff3030 : 0x8a3040, actif ? 0.14 : 0.06);
        g.beginPath();
        g.moveTo(d.x, d.y);
        const steps = 10;
        for (let i = 0; i <= steps; i++) {
            const a = a1 + (a2 - a1) * (i / steps);
            g.lineTo(d.x + Math.cos(a) * portee, d.y + Math.sin(a) * portee);
        }
        g.closePath(); g.fillPath();
        // Statue (socle vu de dessus) + œil orienté.
        g.fillStyle(0x3a121e, 1);   g.fillCircle(d.x, d.y, 16);
        g.lineStyle(2, 0x7a2030, 1); g.strokeCircle(d.x, d.y, 16);
        const ex = d.x + Math.cos(angle) * 7, ey = d.y + Math.sin(angle) * 7;
        g.fillStyle(actif ? 0xff3030 : 0xff8060, 1); g.fillCircle(ex, ey, actif ? 6 : 4);
        if (actif) { g.fillStyle(0xff3030, 0.25); g.fillCircle(d.x, d.y, 23); }  // halo de charge
    }

    // ════════════════════════════════════════════════════════════════
    // VAGUE 7 — Cristaux Glacés (« Le Miroir »)
    // ════════════════════════════════════════════════════════════════

    // ─── Plateforme-Miroir (clignote solide↔intangible) ───
    _creerPlateformeMiroir() {
        const w = this.data.largeur, h = this.data.hauteur;
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.y, w, h, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.scene.physics.add.existing(this.sprite, true);  // static
        this.sprite._obstacle = this;
        this.visual = this.scene.add.graphics();
        this.visual.setDepth(7);
        this._t0 = this.scene.time.now;
        this._dessinerPlateformeMiroir(true, false, this._t0);
    }

    _updatePlateformeMiroir(now) {
        const cycle = this.data.cycleMs ?? this.def.cycleMs;
        const off = this.data.offsetMs ?? 0;
        const t = ((((now - this._t0 + off) % cycle) + cycle) % cycle) / cycle;
        const solide = t < this.def.ratioSolide;
        const avert = this.def.avertissementMs / cycle;
        const clignote = solide && t > (this.def.ratioSolide - avert);
        if (this.sprite.body.enable !== solide) this.sprite.body.enable = solide;
        this._dessinerPlateformeMiroir(solide, clignote, now);
    }

    _dessinerPlateformeMiroir(solide, clignote, now) {
        const g = this.visual; g.clear();
        const cx = this.data.x, cy = this.data.y, w = this.data.largeur, h = this.data.hauteur;
        const x0 = cx - w / 2, y0 = cy - h / 2;
        if (solide) {
            const a = clignote ? (0.45 + 0.45 * Math.abs(Math.sin(now / 55))) : 1;
            g.fillStyle(COULEUR_GLACE_FONCE, a);
            g.fillRect(x0, y0, w, h);
            g.fillStyle(COULEUR_GLACE_CLAIR, a);
            g.fillRect(x0, y0, w, 4);
            g.lineStyle(1.5, COULEUR_GLACE, a);
            g.strokeRect(x0, y0, w, h);
        } else {
            // Reflet fantôme (intangible)
            g.fillStyle(COULEUR_GLACE, 0.06);
            g.fillRect(x0, y0, w, h);
            g.lineStyle(1, COULEUR_GLACE_CLAIR, 0.22);
            g.strokeRect(x0, y0, w, h);
        }
    }

    // ─── Faux sol miroir (intangible, ondulation « eau » = indice) ───
    _creerFauxSolMiroir() {
        const w = this.data.largeur, h = this.data.hauteur;
        // PAS de body : intangible (le joueur tombe au travers)
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.y, w, h, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.sprite._obstacle = this;
        this.visual = this.scene.add.graphics();
        this.visual.setDepth(7);
        this._t0 = this.scene.time.now;
        this._dessinerFauxSol(this.scene.time.now);
    }

    _dessinerFauxSol(now) {
        const g = this.visual; g.clear();
        const cx = this.data.x, cy = this.data.y, w = this.data.largeur, h = this.data.hauteur;
        const x0 = cx - w / 2, y0 = cy - h / 2;
        // Ressemble à une plateforme Cristaux normale...
        g.fillStyle(COULEUR_GLACE_FONCE, 0.9);
        g.fillRect(x0, y0, w, h);
        g.fillStyle(COULEUR_GLACE, 0.9);
        g.fillRect(x0, y0, w, 4);
        g.lineStyle(1.5, COULEUR_GLACE, 0.8);
        g.strokeRect(x0, y0, w, h);
        // ...mais INDICE : ondulations de reflet « eau » qui se déplacent
        const t = (now - this._t0) / 1000;
        g.lineStyle(2, COULEUR_GLACE_CLAIR, 0.55);
        for (let i = 0; i < 3; i++) {
            const prog = ((t * 0.5 + i / 3) % 1);
            const sx = x0 + 4 + prog * (w - 8);
            g.lineBetween(sx, y0 + 2, sx + 9, y0 + h - 2);
        }
    }

    // ─── Barrière laser de Phébus (faisceau cyclique, gel au contact) ───
    _creerLaserPrisme() {
        const w = this.data.largeur, h = this.data.hauteur;
        this.sprite = this.scene.add.rectangle(this.data.x, this.data.y, w, h, 0xffffff, 0);
        this.sprite.setAlpha(0);
        this.scene.physics.add.existing(this.sprite, true);  // static, overlap
        this.sprite._obstacle = this;
        this.sprite.body.enable = false;                     // actif seulement en phase 'tir'
        this.visual = this.scene.add.graphics();
        this.visual.setDepth(9);
        this._t0 = this.scene.time.now;
        this.laserPhase = 'repos';
        this._dessinerLaserPrisme(this._t0, 'repos');
    }

    _updateLaserPrisme(now) {
        const cycle = this.data.cycleMs ?? this.def.cycleMs;
        const off = this.data.offsetMs ?? 0;
        const t = ((((now - this._t0 + off) % cycle) + cycle) % cycle) / cycle;
        const charge = this.def.chargeMs / cycle;
        const tirStart = 1 - this.def.tirRatio;
        let phase;
        if (t >= tirStart) phase = 'tir';
        else if (t >= tirStart - charge) phase = 'charge';
        else phase = 'repos';
        this.laserPhase = phase;
        const actif = phase === 'tir';
        if (this.sprite.body.enable !== actif) this.sprite.body.enable = actif;
        this._dessinerLaserPrisme(now, phase);
    }

    _dessinerLaserPrisme(now, phase) {
        const g = this.visual; g.clear();
        const cx = this.data.x, cy = this.data.y, w = this.data.largeur, h = this.data.hauteur;
        const horiz = (this.data.axe ?? 'horizontale') === 'horizontale';
        const e1x = horiz ? cx - w / 2 : cx, e1y = horiz ? cy : cy - h / 2;
        const e2x = horiz ? cx + w / 2 : cx, e2y = horiz ? cy : cy + h / 2;

        // Faisceau / charge entre les lentilles
        if (phase === 'tir') {
            const x0 = cx - w / 2, y0 = cy - h / 2;
            g.fillStyle(COULEUR_MNESIQUE, 0.35);
            g.fillRect(x0 - 2, y0 - 2, w + 4, h + 4);
            g.fillStyle(COULEUR_MNESIQUE_VIF, 0.7);
            g.fillRect(x0, y0, w, h);
            g.fillStyle(0xffffff, 0.95);
            if (horiz) g.fillRect(x0, cy - 2, w, 4);
            else g.fillRect(cx - 2, y0, 4, h);
        } else if (phase === 'charge') {
            const pulse = 0.3 + 0.5 * Math.abs(Math.sin(now / 50));
            g.lineStyle(2, COULEUR_MNESIQUE_VIF, pulse);
            g.lineBetween(e1x, e1y, e2x, e2y);
        }

        // Lentilles aux extrémités (toujours visibles)
        const lentille = (lx, ly) => {
            g.fillStyle(COULEUR_GLACE_FONCE, 1); g.fillCircle(lx, ly, 9);
            g.fillStyle(COULEUR_MNESIQUE, phase === 'repos' ? 0.6 : 1); g.fillCircle(lx, ly, 6);
            g.fillStyle(0xffffff, phase === 'tir' ? 1 : 0.6); g.fillCircle(lx, ly, 2);
        };
        lentille(e1x, e1y);
        lentille(e2x, e2y);
    }
}
