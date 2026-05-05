// Scène principale.
// Étapes MVP 2-7 : déplacement, salles, Résonance, basculement, loot, ennemis & combat.
//
// Doctrine des Deux Mondes :
//   - Présent  = chasse (ennemis, combat, drops bruts, patterns de difficulté)
//   - Miroir   = atelier paisible sous timer (aucun ennemi pour MVP)

import { GAME_WIDTH, GAME_HEIGHT, PLAYER, WORLD } from '../config.js';
import { genererSalle, creerRng, niveauDanger } from '../systems/WorldGen.js';
import { ResonanceSystem } from '../systems/ResonanceSystem.js';
import { MondeSystem } from '../systems/MondeSystem.js';
import { InputSystem } from '../systems/InputSystem.js';
import { InventaireSystem } from '../systems/InventaireSystem.js';
import { EnemySystem } from '../systems/EnemySystem.js';
import { tirerItem, tirerConsommable, calculerStats } from '../systems/LootSystem.js';
import { COULEURS_FAMILLE, ITEMS } from '../data/items.js';
import { ENEMIES, tirerTypeEnnemi } from '../data/enemies.js';
import { Enemy } from '../entities/Enemy.js';

const SEED_DU_RUN = 1337;

// Palettes Présent — légèrement teintées selon le niveau de danger
const PALETTES_PRESENT = {
    0: { fond: '#1a1a24', plateforme: 0x3a3a4a, sortie: 0xc8a85a }, // refuge
    1: { fond: '#1a1a26', plateforme: 0x3a3a4a, sortie: 0xc8a85a }, // calme
    2: { fond: '#221a24', plateforme: 0x4a3a4a, sortie: 0xc8a85a }, // tension
    3: { fond: '#2c1a22', plateforme: 0x5a3a44, sortie: 0xc8a85a }  // climax
};
const PALETTE_MIROIR = {
    fond: '#3a2818', plateforme: 0x7a3a4a, sortie: 0xc8a85a, vortex: 0x5ac8a8
};

const HAUTEUR_SOL = 40;
const BAISSE_MIROIR_DELAI_MS = 500;
const BAISSE_MIROIR_MONTANT = 1;
const BAISSE_PRESENT_DELAI_MS = 2000;

const CLE_POSITION_PENDANTE = 'position_pendante';

// Stats de base (avant équipement)
const STATS_BASE = {
    speed: PLAYER.SPEED,
    jumpVelocity: PLAYER.JUMP_VELOCITY,
    passiveMiroir: BAISSE_MIROIR_MONTANT,
    passivePresent: 0,
    bonusRetour: 20,
    // Combat
    attaqueDegats: 1,
    attaquePortee: 35,
    attaqueCooldown: 400,
    parryFenetre: 300,
    parryCooldown: 600,
    parryBonusResonance: 5
};

const DUREE_INVINCIBILITE_MS = 500;

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.indexSalle = 0;
    }

    init(data) {
        this.indexSalle = data?.indexSalle ?? 0;
        this.transitionEnCours = false;
    }

    create() {
        // --- Systèmes ---
        this.resonance = new ResonanceSystem(this.registry);
        this.monde = new MondeSystem(this.registry);
        this.inventaire = new InventaireSystem(this.registry);
        this.enemySystem = new EnemySystem(this.registry);
        this.inputSystem = new InputSystem(this);

        const mondeCourant = this.monde.getMonde();
        this.rngLoot = creerRng(
            (SEED_DU_RUN ^ (this.indexSalle * 0x85EBCA6B) ^ (mondeCourant === 'miroir' ? 0xC2B2AE35 : 0)) >>> 0
        );

        this.statsEffectives = calculerStats(STATS_BASE, this.inventaire.getEquipement());
        const handlerEquip = () => {
            this.statsEffectives = calculerStats(STATS_BASE, this.inventaire.getEquipement());
        };
        this.registry.events.on('equipement:change', handlerEquip);
        this.events.once('shutdown', () => this.registry.events.off('equipement:change', handlerEquip));

        // --- HUD parallèle ---
        if (!this.scene.isActive('UIScene')) {
            this.scene.launch('UIScene');
        }

        // --- Palette + salle ---
        const enMiroir = mondeCourant === 'miroir';
        const niveau = niveauDanger(this.indexSalle);
        const palette = enMiroir ? PALETTE_MIROIR : PALETTES_PRESENT[niveau];
        this.cameras.main.setBackgroundColor(palette.fond);

        const salle = genererSalle(SEED_DU_RUN, this.indexSalle);

        this.platforms = this.physics.add.staticGroup();
        for (const p of salle.plateformes) {
            this.creerPlateforme(p.x, p.y, p.largeur, p.hauteur, palette.plateforme);
        }

        // --- Joueur ---
        const positionPendante = this.registry.get(CLE_POSITION_PENDANTE);
        let spawn;
        if (positionPendante) {
            spawn = positionPendante;
            this.registry.remove(CLE_POSITION_PENDANTE);
        } else {
            spawn = salle.spawnJoueur;
        }

        this.player = this.add.rectangle(spawn.x, spawn.y, PLAYER.WIDTH, PLAYER.HEIGHT, PLAYER.COLOR);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.platforms);

        // Direction de l'attaque
        this.lastDirection = 1;
        // Cooldowns
        this.cooldownAttaqueFin = 0;
        this.cooldownParryFin = 0;
        this.parryActifJusqu = 0;
        this.invincibleJusqu = 0;

        // --- Zones interactives ---
        this.creerSortieSalle(salle.sortie, palette.sortie);
        if (enMiroir) {
            this.creerVortex(salle.vortex, palette.vortex);
        }

        // --- Coffre + drop sol ---
        if (salle.coffre && !this.inventaire.coffreEstOuvert(mondeCourant, this.indexSalle)) {
            this.creerCoffre(salle.coffre);
        }
        if (salle.dropSol && !this.inventaire.dropEstRamasse(mondeCourant, this.indexSalle)) {
            this.creerDropSol(salle.dropSol);
        }

        // --- Ennemis (Présent uniquement) ---
        this.enemies = [];
        if (!enMiroir && salle.ennemis?.length) {
            for (const e of salle.ennemis) {
                if (this.enemySystem.estMort('normal', this.indexSalle, e.idx)) continue;
                const def = tirerTypeEnnemi('normal', this.rngLoot);
                if (!def) continue;
                const ennemi = new Enemy(this, def, e.x, e.y, e.idx);
                if (def.gravite) {
                    this.physics.add.collider(ennemi.sprite, this.platforms);
                }
                this.physics.add.overlap(this.player, ennemi.sprite, () => this.contactEnnemi(ennemi));
                this.enemies.push(ennemi);
            }
        }

        // Drop garanti au climax (niveau 3) — Bleu ou Noir uniquement
        this.climaxDropDu = !enMiroir && niveau === 3;

        // --- HUD textuel ---
        const labelMonde = enMiroir ? ' (Miroir)' : '';
        const labelDanger = !enMiroir ? ['Refuge', 'Calme', 'Tension', 'CLIMAX'][niveau] : '';
        this.add.text(10, 10, `Vestige — Salle ${salle.index + 1}${labelMonde}`, {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: enMiroir ? '#f0c890' : '#e8e4d8'
        });
        this.add.text(10, 32, 'QD/← → : bouger | ↑/Espace : sauter | X : attaque | C : parry | E : interagir | I : inventaire | K/H : test Résonance', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#8a8a9a'
        });
        if (labelDanger && niveau >= 2) {
            this.add.text(10, 50, labelDanger, {
                fontFamily: 'monospace',
                fontSize: '11px',
                color: niveau === 3 ? '#ff8060' : '#c8a060',
                fontStyle: 'bold'
            });
        }

        // --- Hooks selon le monde ---
        if (enMiroir) {
            this.activerBaissePassive(true);
            this.surveillerAncrage();
            if (this.resonance.getValeur() === 0) this.afficherAncrage();
        } else {
            this.brancherBasculement();
        }
        this.activerBaissePassive(false);

        // --- Mort d'ennemi : drop éventuel ---
        const handlerEnemyDead = (ennemi) => {
            this.enemySystem.marquerMort('normal', this.indexSalle, ennemi.indexEnnemi);
            this.peutEtreDrop(ennemi);
        };
        this.events.on('enemy:dead', handlerEnemyDead);
        this.events.once('shutdown', () => this.events.off('enemy:dead', handlerEnemyDead));

        this.cameras.main.fadeIn(200, 0, 0, 0);
    }

    update() {
        this.inputSystem.update();
        const i = this.inputSystem.intentions;

        // --- Mouvement ---
        const body = this.player.body;
        const auSol = body.blocked.down || body.touching.down;
        const speed = this.statsEffectives.speed;

        if (i.gauche && !i.droite) {
            body.setVelocityX(-speed);
            this.lastDirection = -1;
        } else if (i.droite && !i.gauche) {
            body.setVelocityX(speed);
            this.lastDirection = 1;
        } else {
            body.setVelocityX(0);
        }

        if (i.sauter && auSol) {
            body.setVelocityY(-this.statsEffectives.jumpVelocity);
        }

        // --- Combat ---
        if (i.attaquer) this.tenterAttaque();
        if (i.parry) this.tenterParry();
        // i.sort : hook réservé, pas d'effet en étape 7

        // --- Interactions / inventaire ---
        if (i.interagir) this.essayerInteragir();
        if (i.ouvrirInventaire && !this.scene.isActive('InventaireScene')) {
            this.scene.pause();
            this.scene.launch('InventaireScene');
        }

        // --- Debug Résonance ---
        if (i.degatTest) this.resonance.prendreDegats(10);
        if (i.healTest) this.resonance.regagner(10);

        // --- Update des ennemis ---
        for (const e of this.enemies) e.update(this.player);
    }

    // ============================================================
    // COMBAT
    // ============================================================
    tenterAttaque() {
        const now = this.time.now;
        if (now < this.cooldownAttaqueFin) return;
        this.cooldownAttaqueFin = now + Math.max(100, this.statsEffectives.attaqueCooldown);

        const portee = this.statsEffectives.attaquePortee;
        const dir = this.lastDirection;
        const hx = this.player.x + dir * (PLAYER.WIDTH / 2 + portee / 2);
        const hy = this.player.y;

        // Visuel : un slash blanc semi-transparent
        const slash = this.add.rectangle(hx, hy, portee, PLAYER.HEIGHT, 0xffffff, 0.5);
        this.tweens.add({
            targets: slash,
            alpha: 0,
            duration: 120,
            onComplete: () => slash.destroy()
        });

        // Test : tous les ennemis dans la zone reçoivent des dégâts
        const degats = this.statsEffectives.attaqueDegats;
        const halfH = PLAYER.HEIGHT / 2 + 4;
        for (const e of this.enemies) {
            if (e.mort || !e.sprite.active) continue;
            const dx = Math.abs(e.sprite.x - hx);
            const dy = Math.abs(e.sprite.y - hy);
            if (dx < portee / 2 + e.def.largeur / 2 && dy < halfH + e.def.hauteur / 2) {
                e.recevoirDegats(degats);
            }
        }
    }

    tenterParry() {
        const now = this.time.now;
        if (now < this.cooldownParryFin) return;
        const fenetre = this.statsEffectives.parryFenetre;
        this.cooldownParryFin = now + this.statsEffectives.parryCooldown;
        this.parryActifJusqu = now + fenetre;

        // Halo doré qui pulse pendant la fenêtre
        const halo = this.add.rectangle(
            this.player.x, this.player.y,
            PLAYER.WIDTH + 14, PLAYER.HEIGHT + 14,
            0xc8a85a, 0.4
        );
        this.tweens.add({
            targets: halo,
            alpha: 0,
            scale: 1.2,
            duration: fenetre,
            onComplete: () => halo.destroy()
        });
        // On déplace le halo avec le joueur le temps de la fenêtre
        const updHalo = () => {
            if (!halo.active) return;
            halo.setPosition(this.player.x, this.player.y);
        };
        this.events.on('postupdate', updHalo);
        this.time.delayedCall(fenetre, () => this.events.off('postupdate', updHalo));
    }

    estParryActif() {
        return this.time.now < this.parryActifJusqu;
    }

    contactEnnemi(ennemi) {
        if (ennemi.mort) return;
        const now = this.time.now;
        if (now < this.invincibleJusqu) return;

        // Parry actif : on annule les dégâts + bonus Résonance + flash doré
        if (this.estParryActif()) {
            this.parryActifJusqu = 0;
            this.resonance.regagner(this.statsEffectives.parryBonusResonance);
            this.afficherMessageFlottant('PARRY', '#c8a85a');
            this.flashJoueur(0xc8a85a);
            return;
        }

        // Dégâts + invincibilité
        this.resonance.prendreDegats(ennemi.def.degatsContact);
        this.invincibleJusqu = now + DUREE_INVINCIBILITE_MS;
        this.flashJoueur(0xff6060);
    }

    flashJoueur(couleur) {
        const original = PLAYER.COLOR;
        this.player.setFillStyle(couleur);
        this.tweens.add({
            targets: this.player,
            alpha: { from: 1, to: 0.3 },
            yoyo: true,
            repeat: 2,
            duration: 80,
            onComplete: () => {
                this.player.setAlpha(1);
                this.player.setFillStyle(original);
            }
        });
    }

    // ============================================================
    // DROPS
    // ============================================================
    peutEtreDrop(ennemi) {
        const proba = this.climaxDropDu ? 1 : ennemi.def.probaDrop;
        if (this.rngLoot() >= proba) return;

        // Climax : drop garanti, et on force Bleu ou Noir
        let item;
        if (this.climaxDropDu) {
            const familles = ['bleu', 'noir'];
            const famille = familles[Math.floor(this.rngLoot() * 2)];
            const pool = Object.values(ITEMS).filter(it => it.famille === famille);
            item = pool[Math.floor(this.rngLoot() * pool.length)];
            this.climaxDropDu = false; // une seule fois par salle
        } else {
            item = tirerItem('normal', this.rngLoot);
        }
        if (!item) return;

        // Petit visuel "ramassage automatique" : un cube qui flotte vers le joueur
        const cube = this.add.rectangle(
            ennemi.sprite.x, ennemi.sprite.y,
            14, 14,
            COULEURS_FAMILLE[item.famille]
        );
        this.tweens.add({
            targets: cube,
            x: this.player.x,
            y: this.player.y,
            alpha: 0,
            duration: 400,
            onComplete: () => {
                cube.destroy();
                if (this.inventaire.ajouter(item.id)) {
                    this.afficherMessageFlottant(`Ramassé : ${item.nom}`, this.coulHex(COULEURS_FAMILLE[item.famille]));
                } else {
                    this.afficherMessageFlottant("Inventaire plein", '#ff6060');
                }
            }
        });
    }

    // ============================================================
    // COFFRES & DROPS SOL (cf. étape 6)
    // ============================================================
    creerCoffre(c) {
        this.coffre = this.add.rectangle(c.x, c.y, c.largeur, c.hauteur, 0x8a7a6a);
        this.coffre.setStrokeStyle(2, 0xc8a85a);
        this.coffreData = c;
    }

    creerDropSol(d) {
        this.dropSol = this.add.rectangle(d.x, d.y, d.largeur, d.hauteur, 0xa8c8e8, 0.85);
        this.dropSol.setStrokeStyle(1, 0xe8e4d8);
        this.dropSolData = d;
        this.tweens.add({
            targets: this.dropSol,
            scale: { from: 1, to: 1.15 },
            duration: 600,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
    }

    essayerInteragir() {
        const px = this.player.x;
        const py = this.player.y;
        const proche = (obj) => obj && Phaser.Math.Distance.Between(px, py, obj.x, obj.y) < 40;
        if (this.coffre && proche(this.coffre)) { this.ouvrirCoffre(); return; }
        if (this.dropSol && proche(this.dropSol)) this.ramasserDropSol();
    }

    ouvrirCoffre() {
        const monde = this.monde.getMonde();
        const item = tirerItem(monde, this.rngLoot);
        if (!item) return;
        if (!this.inventaire.ajouter(item.id)) {
            this.afficherMessageFlottant("Inventaire plein", '#ff6060');
            return;
        }
        this.inventaire.marquerCoffreOuvert(monde, this.indexSalle);
        const couleur = COULEURS_FAMILLE[item.famille];
        this.afficherMessageFlottant(`Ramassé : ${item.nom}`, this.coulHex(couleur));
        this.coffre.setFillStyle(couleur);
        this.tweens.add({
            targets: this.coffre,
            alpha: 0,
            duration: 400,
            onComplete: () => this.coffre?.destroy()
        });
        this.coffre = null;
    }

    ramasserDropSol() {
        const consommable = tirerConsommable(this.rngLoot);
        if (!consommable) return;
        const monde = this.monde.getMonde();
        this.appliquerConsommable(consommable);
        this.inventaire.marquerDropRamasse(monde, this.indexSalle);
        this.afficherMessageFlottant(`${consommable.nom} — ${consommable.description}`, '#a8c8e8');
        this.tweens.add({
            targets: this.dropSol,
            alpha: 0,
            scale: 0,
            duration: 300,
            onComplete: () => this.dropSol?.destroy()
        });
        this.dropSol = null;
    }

    appliquerConsommable(c) {
        const e = c.effet;
        if (e.type === 'resonance_gain') {
            this.resonance.regagner(e.valeur);
        } else if (e.type === 'pause_miroir') {
            if (this.timerMiroir) {
                this.timerMiroir.paused = true;
                this.time.delayedCall(e.duree, () => {
                    if (this.timerMiroir) this.timerMiroir.paused = false;
                });
            }
        }
    }

    // ============================================================
    // ZONES & TRANSITIONS (cf. étapes 3-5)
    // ============================================================
    creerSortieSalle(s, couleur) {
        this.sortie = this.add.rectangle(s.x, s.y, s.largeur, s.hauteur, couleur, 0.35);
        this.sortie.setStrokeStyle(2, couleur, 0.9);
        this.physics.add.existing(this.sortie, true);
        this.physics.add.overlap(this.player, this.sortie, () => this.salleSuivante());
    }

    creerVortex(v, couleur) {
        this.vortex = this.add.rectangle(v.x, v.y, v.largeur, v.hauteur, couleur, 0.4);
        this.vortex.setStrokeStyle(2, couleur, 0.9);
        this.physics.add.existing(this.vortex, true);
        this.physics.add.overlap(this.player, this.vortex, () => this.retourAuNormal());
        this.tweens.add({
            targets: this.vortex,
            alpha: { from: 0.6, to: 1 },
            duration: 700,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
    }

    salleSuivante() {
        if (this.transitionEnCours) return;
        this.transitionEnCours = true;
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.restart({ indexSalle: this.indexSalle + 1 });
        });
    }

    basculerVersMiroir() {
        if (this.transitionEnCours) return;
        this.transitionEnCours = true;
        this.registry.set(CLE_POSITION_PENDANTE, { x: this.player.x, y: this.player.y });
        this.cameras.main.fadeOut(300, 80, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.monde.basculerVersMiroir();
            this.scene.restart({ indexSalle: this.indexSalle });
        });
    }

    retourAuNormal() {
        if (this.transitionEnCours) return;
        this.transitionEnCours = true;
        this.registry.set(CLE_POSITION_PENDANTE, { x: this.player.x, y: this.player.y });
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            const bonus = this.statsEffectives.bonusRetour;
            this.monde.revenirAuNormal();
            const delta = bonus - 20;
            if (delta !== 0) this.resonance.regagner(delta);
            this.scene.restart({ indexSalle: this.indexSalle });
        });
    }

    // ============================================================
    // HOOKS RÉSONANCE
    // ============================================================
    brancherBasculement() {
        this.handlerVide = () => this.basculerVersMiroir();
        this.registry.events.on('resonance:vide', this.handlerVide);
        this.events.once('shutdown', () => {
            this.registry.events.off('resonance:vide', this.handlerVide);
        });
    }

    activerBaissePassive(enMiroir) {
        if (enMiroir) {
            this.timerMiroir = this.time.addEvent({
                delay: BAISSE_MIROIR_DELAI_MS,
                loop: true,
                callback: () => {
                    const baisse = Math.max(0, this.statsEffectives.passiveMiroir);
                    if (baisse > 0) this.resonance.prendreDegats(baisse);
                }
            });
            this.events.once('shutdown', () => {
                if (this.timerMiroir) this.timerMiroir.remove(false);
            });
        } else {
            this.timerPresent = this.time.addEvent({
                delay: BAISSE_PRESENT_DELAI_MS,
                loop: true,
                callback: () => {
                    const baisse = Math.max(0, this.statsEffectives.passivePresent);
                    if (baisse > 0) this.resonance.prendreDegats(baisse);
                }
            });
            this.events.once('shutdown', () => {
                if (this.timerPresent) this.timerPresent.remove(false);
            });
        }
    }

    surveillerAncrage() {
        const handler = (_p, valeur) => {
            if (valeur === 0 && !this.texteAncrage) this.afficherAncrage();
        };
        this.registry.events.on('changedata-resonance', handler);
        this.events.once('shutdown', () => {
            this.registry.events.off('changedata-resonance', handler);
        });
    }

    afficherAncrage() {
        this.texteAncrage = this.add.text(GAME_WIDTH / 2, 70, 'ANCRÉ DANS LE MIROIR', {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#ff6060',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
    }

    // ============================================================
    // HELPERS
    // ============================================================
    creerPlateforme(x, y, largeur, hauteur, couleur) {
        const rect = this.add.rectangle(x, y, largeur, hauteur, couleur);
        this.platforms.add(rect);
        rect.body.updateFromGameObject();
        return rect;
    }

    afficherMessageFlottant(texte, couleurCss) {
        const t = this.add.text(this.player.x, this.player.y - 40, texte, {
            fontFamily: 'monospace',
            fontSize: '13px',
            color: couleurCss,
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5, 1);
        this.tweens.add({
            targets: t,
            y: t.y - 40,
            alpha: { from: 1, to: 0 },
            duration: 1800,
            onComplete: () => t.destroy()
        });
    }

    coulHex(n) {
        return '#' + n.toString(16).padStart(6, '0');
    }
}
