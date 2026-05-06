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
import { ARCHETYPES } from '../data/archetypes.js';
import { Enemy } from '../entities/Enemy.js';
import { EconomySystem } from '../systems/EconomySystem.js';
import { FRAGMENTS } from '../data/fragments.js';
import {
    PALETTE_PRESENT, PALETTE_MIROIR, paletteDuMonde, DEPTH,
    poserVignette, poserParticulesAmbiance, tracerCourbeQuadratique
} from '../render/PainterlyRenderer.js';
import { peindreDecor } from '../render/DecorRegistry.js';
import { poserCiel, poserEtoilesOuPoussiere, poserSilhouettesLointaines } from '../render/Parallaxe.js';
import { poserHaloJoueur, poserBrumeSol, poserRayonsLumiere } from '../render/AnimationsAmbiance.js';
import { peindreOrnementPlateforme } from '../render/PlateformeStyle.js';
import { JoueurVisuel } from '../render/entities/Joueur.js';
import { creerVisuelCoffre, jouerOuvertureCoffre, fermerCoffreVide } from '../render/entities/Coffre.js';
import { creerVisuelVortex } from '../render/entities/Vortex.js';
import { creerVisuelPorteSortie } from '../render/entities/PorteSortie.js';
import { creerVisuelConsommable, jouerRamassageConsommable } from '../render/entities/Consommable.js';

// Label affiché dans le HUD pour chaque archétype
const ARCHETYPES_LABELS = Object.fromEntries(
    Object.values(ARCHETYPES).map(a => [a.id, a.nom])
);

// Seed du run : initialisée au premier démarrage et persistée dans le registry
// pour toute la durée du run (toutes les salles, transitions, basculements).
// Au prochain rechargement de la page, on tire une nouvelle seed → nouveau run.
const CLE_SEED_RUN = 'seed_run';

// Couleurs spécifiques aux zones interactives (sortie/vortex), partagées
const COULEUR_SORTIE = 0xc8a85a; // doré
const COULEUR_VORTEX = 0x5ac8a8; // cyan-vert

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
        this.economy = new EconomySystem(this.registry);
        this.inputSystem = new InputSystem(this);

        // --- Seed du run (random à la première salle, persistée ensuite) ---
        if (this.registry.get(CLE_SEED_RUN) === undefined) {
            this.registry.set(CLE_SEED_RUN, Math.floor(Math.random() * 0xFFFFFFFF));
        }
        const seedRun = this.registry.get(CLE_SEED_RUN);

        const mondeCourant = this.monde.getMonde();
        this.rngLoot = creerRng(
            (seedRun ^ (this.indexSalle * 0x85EBCA6B) ^ (mondeCourant === 'miroir' ? 0xC2B2AE35 : 0)) >>> 0
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
        const palette = paletteDuMonde(mondeCourant);
        this.palette = palette;
        this.mondeCourant = mondeCourant;
        // Le ciel a son propre dégradé qui couvre le fond — on garde quand même
        // une couleur de secours sur la caméra au cas où une zone reste découverte.
        this.cameras.main.setBackgroundColor(palette.fond);

        const salle = genererSalle(seedRun, this.indexSalle);

        // --- Bounds caméra & monde physique selon les dimensions de l'archétype ---
        this.physics.world.setBounds(0, 0, salle.dims.largeur, salle.dims.hauteur);
        this.cameras.main.setBounds(0, 0, salle.dims.largeur, salle.dims.hauteur);

        // --- COUCHES PARALLAX (du plus loin au plus proche) ---
        // Couche 1 (x0)    : ciel/abîme avec dégradé vertical, fixe à l'écran
        poserCiel(this, mondeCourant);
        // Étoiles ou poussière d'or sur le ciel (parallax x0.15)
        poserEtoilesOuPoussiere(this, salle.dims, mondeCourant);

        // Le rng du décor est seedé pour rester reproductible
        const rngDecor = creerRng((seedRun ^ 0x517CC1B7 ^ this.indexSalle) >>> 0);

        // Couche 2 (x0.3) : silhouettes très lointaines (rangée de bâtiments à l'horizon)
        poserSilhouettesLointaines(this, salle.dims, mondeCourant, rngDecor);

        // Couche 3 (x0.7) : silhouettes proches + structures principales (DecorRegistry)
        peindreDecor(this, salle.archetype, salle.dims, mondeCourant, rngDecor, salle.plateformes);

        // Particules d'ambiance par monde (poussière Présent, étincelles Miroir)
        poserParticulesAmbiance(this, salle.dims, mondeCourant);

        // Rayons de lumière obliques (Miroir uniquement)
        poserRayonsLumiere(this, salle.dims, mondeCourant);

        // --- Plateformes (avec ornement par-dessus) ---
        // On identifie le sol principal (plus large plateforme) pour lui donner
        // un traitement visuel plus riche (frise dorée Miroir, herbes Présent).
        let largeurMax = 0;
        for (const p of salle.plateformes) if (p.largeur > largeurMax) largeurMax = p.largeur;

        this.platforms = this.physics.add.staticGroup();
        this.oneWayPlatforms = this.physics.add.staticGroup();
        for (const p of salle.plateformes) {
            const couleur = p.oneWay
                ? this.eclaircir(palette.plateforme, 0.15)
                : palette.plateforme;
            const estSol = p.largeur === largeurMax;
            this.creerPlateforme(p.x, p.y, p.largeur, p.hauteur, couleur, p.oneWay, estSol);
        }

        // Brume au sol (Présent uniquement, après les plateformes pour être devant)
        poserBrumeSol(this, salle.dims, mondeCourant);

        // --- Joueur ---
        const positionPendante = this.registry.get(CLE_POSITION_PENDANTE);
        let spawn;
        if (positionPendante) {
            spawn = positionPendante;
            this.registry.remove(CLE_POSITION_PENDANTE);
        } else {
            spawn = salle.spawnJoueur;
        }

        // Rectangle physique invisible (porte la collision arcade)
        this.player = this.add.rectangle(spawn.x, spawn.y, PLAYER.WIDTH, PLAYER.HEIGHT, PLAYER.COLOR, 0);
        this.player.setAlpha(0);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.platforms);

        // Visuel séparé : silhouette + cœur lumineux (suit la position du Rectangle)
        this.playerVisual = new JoueurVisuel(this);
        this.playerVisual.setPosition(this.player.x, this.player.y);

        // Halo lumineux qui suit le joueur en Miroir (le Vestige porte sa propre
        // lumière dans le passé)
        poserHaloJoueur(this, this.player, mondeCourant);

        // Collider one-way : le joueur peut sauter À TRAVERS par le bas (les
        // checkCollision sur les plateformes one-way bloquent les autres axes,
        // cf. creerPlateforme). Le processCallback permet le drop-through quand
        // le timer est actif.
        this.dropThroughJusqu = 0;
        this.physics.add.collider(this.player, this.oneWayPlatforms, null, () => {
            return this.time.now >= this.dropThroughJusqu;
        });

        // --- Caméra : suit le joueur avec lerp doux + deadzone ---
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setDeadzone(200, 150);

        // Direction de l'attaque
        this.lastDirection = 1;
        // Cooldowns
        this.cooldownAttaqueFin = 0;
        this.cooldownParryFin = 0;
        this.parryActifJusqu = 0;
        this.invincibleJusqu = 0;

        // --- Zones interactives ---
        this.creerSortieSalle(salle.sortie, COULEUR_SORTIE);
        if (enMiroir) {
            this.creerVortex(salle.vortex, COULEUR_VORTEX);
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
                ennemi.sprite.setDepth(DEPTH.ENTITES);
                if (def.gravite) {
                    this.physics.add.collider(ennemi.sprite, this.platforms);
                }
                this.physics.add.overlap(this.player, ennemi.sprite, () => this.contactEnnemi(ennemi));
                this.enemies.push(ennemi);
            }
        }

        // Drop garanti au climax (niveau 3) — Bleu ou Noir uniquement
        this.climaxDropDu = !enMiroir && niveau === 3;

        // --- HUD textuel (fixe à l'écran avec setScrollFactor(0)) ---
        const labelMonde = enMiroir ? ' (Miroir)' : '';
        const labelDanger = !enMiroir ? ['Refuge', 'Calme', 'Tension', 'CLIMAX'][niveau] : '';
        const archetypeLabel = ARCHETYPES_LABELS[salle.archetype] ?? salle.archetype;

        this.add.text(10, 10,
            `Vestige — Salle ${salle.index + 1}${labelMonde}  ·  ${archetypeLabel}`,
            { fontFamily: 'monospace', fontSize: '14px', color: enMiroir ? '#f0c890' : '#e8e4d8' }
        ).setScrollFactor(0).setDepth(200);

        this.add.text(10, 30,
            'QD/← →: bouger  ↑/Espace: sauter  S/↓: descendre (corniches)  X: attaque  C: parry  E: interagir  I: inventaire',
            { fontFamily: 'monospace', fontSize: '10px', color: '#8a8a9a' }
        ).setScrollFactor(0).setDepth(200);

        if (labelDanger && niveau >= 2) {
            this.add.text(10, 48, labelDanger, {
                fontFamily: 'monospace',
                fontSize: '11px',
                color: niveau === 3 ? '#ff8060' : '#c8a060',
                fontStyle: 'bold'
            }).setScrollFactor(0).setDepth(200);
        }

        // --- Vignette (overlay cinéma sombre aux bords, fixe à l'écran) ---
        poserVignette(this, 1);

        // --- Hooks selon le monde ---
        if (enMiroir) {
            this.activerBaissePassive(true);
            this.surveillerAncrage();
            if (this.resonance.getValeur() === 0) this.afficherAncrage();
        } else {
            this.brancherBasculement();
        }
        this.activerBaissePassive(false);

        // --- Mort d'ennemi : drop éventuel + Sel + Fragment ---
        const handlerEnemyDead = (ennemi) => {
            this.enemySystem.marquerMort('normal', this.indexSalle, ennemi.indexEnnemi);
            this.peutEtreDrop(ennemi);
            this._dropEconomique(ennemi);
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

        // --- Drop-through (descendre via plateforme one-way) ---
        // À l'appui de S/↓, on désactive la collision avec les one-way pendant 200 ms,
        // ce qui fait tomber le joueur à travers la corniche sur laquelle il est.
        if (i.descendreEdge && auSol) {
            this.dropThroughJusqu = this.time.now + 200;
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

        // --- Update du visuel joueur ---
        if (this.playerVisual) {
            this.playerVisual.setPosition(this.player.x, this.player.y);
            this.playerVisual.setDirection(this.lastDirection);
            this.playerVisual.setEtat({
                auSol,
                vx: this.player.body.velocity.x,
                vy: this.player.body.velocity.y
            });
        }
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

        // === SLASH COURBE 3 COUCHES (Bézier quadratique) ===
        // Trois couches concentriques avec une courbe Bézier (traceur custom)
        // donnent un arc fluide au lieu d'un V cassant. Couleurs additives.
        const tracerCourbe = (g, lineWidth, couleur, alpha, decalage) => {
            g.lineStyle(lineWidth, couleur, alpha);
            tracerCourbeQuadratique(
                g,
                dir * 8, -PLAYER.HEIGHT / 2 - decalage,
                dir * (portee + PLAYER.WIDTH / 2 + decalage), 0,
                dir * 8, PLAYER.HEIGHT / 2 + decalage
            );
        };

        const slashOuter = this.add.graphics();
        slashOuter.x = this.player.x;
        slashOuter.y = this.player.y;
        slashOuter.setDepth(DEPTH.EFFETS);
        slashOuter.setBlendMode(Phaser.BlendModes.ADD);
        tracerCourbe(slashOuter, 16, 0xffd070, 0.3, 6);

        const slashMid = this.add.graphics();
        slashMid.x = this.player.x;
        slashMid.y = this.player.y;
        slashMid.setDepth(DEPTH.EFFETS);
        slashMid.setBlendMode(Phaser.BlendModes.ADD);
        tracerCourbe(slashMid, 7, 0xffffff, 0.75, 2);

        const slashCore = this.add.graphics();
        slashCore.x = this.player.x;
        slashCore.y = this.player.y;
        slashCore.setDepth(DEPTH.EFFETS);
        slashCore.setBlendMode(Phaser.BlendModes.ADD);
        tracerCourbe(slashCore, 2.5, 0xffffff, 1, 0);

        this.tweens.add({
            targets: [slashOuter, slashMid, slashCore],
            scaleX: { from: 0.55, to: 1.2 },
            scaleY: { from: 1.15, to: 0.85 },
            alpha: { from: 1, to: 0 },
            duration: 240,
            ease: 'Cubic.Out',
            onComplete: () => {
                slashOuter.destroy(); slashMid.destroy(); slashCore.destroy();
            }
        });

        // === Pluie d'étincelles colorées ===
        if (this.textures.exists('_particule')) {
            const burst = this.add.particles(hx, hy, '_particule', {
                lifespan: 380,
                speed: { min: 110, max: 280 },
                angle: dir > 0 ? { min: -65, max: 65 } : { min: 115, max: 245 },
                scale: { start: 0.55, end: 0 },
                tint: [0xffffff, 0xffd070, 0xff8040, 0xffd070],
                quantity: 14,
                blendMode: Phaser.BlendModes.ADD,
                alpha: { start: 1, end: 0 }
            });
            burst.setDepth(DEPTH.EFFETS);
            burst.explode(14);
            this.time.delayedCall(420, () => burst.destroy());
        }

        // Test des ennemis dans la zone — on note si on a touché pour le hit feedback
        const degats = this.statsEffectives.attaqueDegats;
        const halfH = PLAYER.HEIGHT / 2 + 4;
        let aTouche = false;
        for (const e of this.enemies) {
            if (e.mort || !e.sprite.active) continue;
            const dx = Math.abs(e.sprite.x - hx);
            const dy = Math.abs(e.sprite.y - hy);
            if (dx < portee / 2 + e.def.largeur / 2 && dy < halfH + e.def.hauteur / 2) {
                e.recevoirDegats(degats);
                aTouche = true;
            }
        }

        // === HIT FEEDBACK — c'est ici que ça devient jouissif ===
        if (aTouche) {
            // 1. Screen shake court et sec
            this.cameras.main.shake(110, 0.006);

            // 2. Hit-stop : on freeze le timer de la scène pendant 60 ms.
            //    Crée une sensation d'impact (la frame "se fige" sur le contact).
            const ts = this.time.timeScale;
            this.time.timeScale = 0.05;
            this.tweens.timeScale = 0.05;
            setTimeout(() => {
                this.time.timeScale = ts;
                this.tweens.timeScale = 1;
            }, 60);

            // 3. Flash écran ultra bref (overlay blanc 12% pendant 80ms)
            const flash = this.add.rectangle(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                this.cameras.main.width,
                this.cameras.main.height,
                0xffffff, 0.12
            ).setScrollFactor(0).setDepth(199);
            this.tweens.add({
                targets: flash,
                alpha: 0,
                duration: 90,
                onComplete: () => flash.destroy()
            });

            // 4. Particules supplémentaires concentriques au centre du hit
            if (this.textures.exists('_particule')) {
                const impact = this.add.particles(hx, hy, '_particule', {
                    lifespan: 280,
                    speed: { min: 60, max: 140 },
                    angle: { min: 0, max: 360 },
                    scale: { start: 0.6, end: 0 },
                    tint: [0xffffff, 0xffd070],
                    quantity: 10,
                    blendMode: Phaser.BlendModes.ADD,
                    alpha: { start: 1, end: 0 }
                });
                impact.setDepth(DEPTH.EFFETS);
                impact.explode(10);
                this.time.delayedCall(320, () => impact.destroy());
            }
        }
    }

    tenterParry() {
        const now = this.time.now;
        if (now < this.cooldownParryFin) return;
        const fenetre = this.statsEffectives.parryFenetre;
        this.cooldownParryFin = now + this.statsEffectives.parryCooldown;
        this.parryActifJusqu = now + fenetre;

        // === Anneau doré qui s'élargit autour du joueur (signal du déclenchement) ===
        const ring = this.add.graphics();
        ring.x = this.player.x;
        ring.y = this.player.y;
        ring.setDepth(DEPTH.EFFETS);
        ring.setBlendMode(Phaser.BlendModes.ADD);
        ring.lineStyle(4, 0xffd070, 1);
        ring.strokeCircle(0, 0, 18);
        ring.lineStyle(8, 0xc8a85a, 0.4);
        ring.strokeCircle(0, 0, 14);
        this.tweens.add({
            targets: ring,
            scale: { from: 0.5, to: 1.8 },
            alpha: { from: 1, to: 0 },
            duration: fenetre,
            ease: 'Cubic.Out',
            onComplete: () => ring.destroy()
        });

        // === Halo qui suit le joueur pendant la fenêtre (attente de parade) ===
        const halo = this.add.graphics();
        halo.setDepth(DEPTH.EFFETS - 1);
        halo.setBlendMode(Phaser.BlendModes.ADD);
        halo.fillStyle(0xc8a85a, 0.45);
        halo.fillCircle(0, 0, 26);
        halo.fillStyle(0xffd070, 0.55);
        halo.fillCircle(0, 0, 14);
        halo.setPosition(this.player.x, this.player.y);

        const updHalo = () => {
            if (!halo.active) return;
            halo.setPosition(this.player.x, this.player.y);
        };
        this.events.on('postupdate', updHalo);

        this.tweens.add({
            targets: halo,
            alpha: 0,
            duration: fenetre,
            onComplete: () => {
                this.events.off('postupdate', updHalo);
                halo.destroy();
            }
        });
    }

    /**
     * Effet visuel renforcé pour un parry réussi : flash expansif + burst doré.
     */
    _jouerEffetParryReussi() {
        // Flash expansif additif
        const flash = this.add.graphics();
        flash.x = this.player.x;
        flash.y = this.player.y;
        flash.setDepth(DEPTH.EFFETS);
        flash.setBlendMode(Phaser.BlendModes.ADD);
        flash.fillStyle(0xffd070, 0.85);
        flash.fillCircle(0, 0, 38);
        flash.fillStyle(0xffffff, 0.7);
        flash.fillCircle(0, 0, 22);
        this.tweens.add({
            targets: flash,
            scale: { from: 0.4, to: 2.4 },
            alpha: { from: 1, to: 0 },
            duration: 320,
            ease: 'Cubic.Out',
            onComplete: () => flash.destroy()
        });

        // Burst de particules dorées explosif
        if (this.textures.exists('_particule')) {
            const burst = this.add.particles(this.player.x, this.player.y, '_particule', {
                lifespan: 480,
                speed: { min: 80, max: 220 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.6, end: 0 },
                tint: [0xffd070, 0xc8a85a, 0xffffff],
                quantity: 14,
                blendMode: Phaser.BlendModes.ADD,
                alpha: { start: 1, end: 0 }
            });
            burst.setDepth(DEPTH.EFFETS);
            burst.explode(14);
            this.time.delayedCall(520, () => burst.destroy());
        }
    }

    estParryActif() {
        return this.time.now < this.parryActifJusqu;
    }

    contactEnnemi(ennemi) {
        if (ennemi.mort) return;
        const now = this.time.now;
        if (now < this.invincibleJusqu) return;

        // Parry actif : on annule les dégâts + bonus Résonance + effet expansif doré
        if (this.estParryActif()) {
            this.parryActifJusqu = 0;
            this.resonance.regagner(this.statsEffectives.parryBonusResonance);
            this.afficherMessageFlottant('PARRY', '#ffd070');
            this._jouerEffetParryReussi();
            // L'ennemi est repoussé visuellement par le parry (squash inverse)
            ennemi.jouerAttaqueContact(this, this.player);
            return;
        }

        // Animation d'attaque ennemi (lunge / pulse + flash + particules d'impact)
        ennemi.jouerAttaqueContact(this, this.player);

        // Dégâts + invincibilité
        this.resonance.prendreDegats(ennemi.def.degatsContact);
        this.invincibleJusqu = now + DUREE_INVINCIBILITE_MS;
        this.flashJoueur(0xff6060);
    }

    flashJoueur(couleur) {
        // Le rectangle physique est invisible — on flash le visuel à la place.
        if (!this.playerVisual) return;
        if (couleur === 0xff6060) this.playerVisual.flashRouge();
        else this.playerVisual.flashBlanc();
    }

    // ============================================================
    // DROPS
    // ============================================================
    /**
     * À la mort d'un ennemi : Sel garanti + Fragment selon proba.
     * Famille du Fragment liée au type d'ennemi (Gardien = Blanc, Spectre = Bleu).
     */
    _dropEconomique(ennemi) {
        // Sel garanti (2-5)
        const sel = 2 + Math.floor(this.rngLoot() * 4);
        this.economy.ajouterSel(sel);

        // Fragment 35 % de proba
        if (this.rngLoot() < 0.35) {
            const famille = ennemi.def.id === 'gardien_pierre' ? 'blanc' : 'bleu';
            this.economy.ajouterFragment(famille, 1);
            // Petit feedback flottant
            const couleur = FRAGMENTS[`fragment_${famille}`].couleur;
            const couleurCss = '#' + couleur.toString(16).padStart(6, '0');
            this.afficherMessageFlottant(`+1 Fragment ${famille}`, couleurCss);
        } else {
            this.afficherMessageFlottant(`+${sel} Sel`, '#e8e4d8');
        }
    }

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
        // Coffre stylisé bois + or, neutre tant qu'il est fermé (mystère du loot).
        // Taille agrandie pour avoir plus de présence visuelle.
        const w = Math.max(28, c.largeur);
        const h = Math.max(22, c.hauteur);
        this.coffreVisuel = creerVisuelCoffre(this, c.x, c.y, w, h);
        // Référence "pivot" pour la détection d'interaction (essayerInteragir lit .x/.y)
        this.coffre = this.coffreVisuel.container;
        this.coffreData = c;
    }

    creerDropSol(d) {
        // On tire le type de consommable à la création (déterministe seedé)
        // pour que le visuel reflète le contenu avant ramassage.
        const consommable = tirerConsommable(this.rngLoot);
        if (!consommable) return;
        this.dropSolConsommable = consommable;
        this.dropSol = creerVisuelConsommable(this, d.x, d.y, consommable.id);
        this.dropSolData = d;
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
        // Doctrine 9a : les coffres dropent en très large majorité des Fragments.
        //   Présent : 85 % Fragment / 15 % item équipable
        //   Miroir  : 95 % Fragment / 5 % item (les items déjà forgés y sont rarissimes —
        //             c'est l'atelier de transformation, on y vient pour les matières).
        // Trouver un item équipable directement reste possible, mais devient un événement.
        const probaFragment = monde === 'miroir' ? 0.95 : 0.85;
        const donneFragment = this.rngLoot() < probaFragment;

        this.inventaire.marquerCoffreOuvert(monde, this.indexSalle);
        const visuel = this.coffreVisuel;
        const cible = { x: this.player.x, y: this.player.y };

        if (donneFragment) {
            // Tire la famille selon le monde (mêmes proba que les items)
            const r = this.rngLoot();
            const probas = monde === 'miroir'
                ? { blanc: 0.2, bleu: 0.6, noir: 0.2 }
                : { blanc: 0.7, bleu: 0.2, noir: 0.1 };
            let famille;
            if (r < probas.blanc) famille = 'blanc';
            else if (r < probas.blanc + probas.bleu) famille = 'bleu';
            else famille = 'noir';

            this.economy.ajouterFragment(famille, 1);
            const couleur = COULEURS_FAMILLE[famille];
            jouerOuvertureCoffre(this, visuel, famille, cible, () => {
                this.afficherMessageFlottant(`Fragment ${famille}`, this.coulHex(couleur));
            });
        } else {
            const item = tirerItem(monde, this.rngLoot);
            if (!item) return;
            if (!this.inventaire.ajouter(item.id)) {
                this.afficherMessageFlottant("Inventaire plein", '#ff6060');
                return;
            }
            const couleur = COULEURS_FAMILLE[item.famille];
            jouerOuvertureCoffre(this, visuel, item.famille, cible, () => {
                this.afficherMessageFlottant(`Ramassé : ${item.nom}`, this.coulHex(couleur));
            });
        }

        // Coffre passe en mode "vide" (couleur tamisée) une fois l'ouverture terminée
        this.time.delayedCall(900, () => fermerCoffreVide(this, visuel));

        // On libère la référence pour empêcher une nouvelle interaction
        this.coffre = null;
        this.coffreVisuel = null;
    }

    ramasserDropSol() {
        const consommable = this.dropSolConsommable;
        if (!consommable) return;
        const monde = this.monde.getMonde();
        this.appliquerConsommable(consommable);
        this.inventaire.marquerDropRamasse(monde, this.indexSalle);
        this.afficherMessageFlottant(`${consommable.nom} — ${consommable.description}`, '#a8c8e8');
        jouerRamassageConsommable(this, this.dropSol, { x: this.player.x, y: this.player.y });
        this.dropSol = null;
        this.dropSolConsommable = null;
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
    creerSortieSalle(s, _couleur) {
        // Rectangle physique invisible pour l'overlap
        this.sortie = this.add.rectangle(s.x, s.y, s.largeur, s.hauteur, 0xffffff, 0);
        this.sortie.setAlpha(0);
        this.physics.add.existing(this.sortie, true);
        this.physics.add.overlap(this.player, this.sortie, () => this.salleSuivante());
        // Visuel : arche de pierre avec intérieur lumineux doré
        creerVisuelPorteSortie(this, s.x, s.y, s.largeur, s.hauteur, this.mondeCourant);
    }

    creerVortex(v, _couleur) {
        // Rectangle physique invisible pour l'overlap
        this.vortex = this.add.rectangle(v.x, v.y, v.largeur, v.hauteur, 0xffffff, 0);
        this.vortex.setAlpha(0);
        this.physics.add.existing(this.vortex, true);
        this.physics.add.overlap(this.player, this.vortex, () => this.retourAuNormal());
        // Visuel : portail tourbillonnant cyan-vert
        creerVisuelVortex(this, v.x, v.y, v.largeur, v.hauteur);
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
        // Fixe à l'écran (setScrollFactor 0) — message de gameplay critique,
        // doit rester visible peu importe où la caméra est
        this.texteAncrage = this.add.text(GAME_WIDTH / 2, 70, 'ANCRÉ DANS LE MIROIR', {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#ff6060',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0).setScrollFactor(0);
    }

    // ============================================================
    // HELPERS
    // ============================================================
    creerPlateforme(x, y, largeur, hauteur, couleur, oneWay = false, estSol = false) {
        const rect = this.add.rectangle(x, y, largeur, hauteur, couleur);
        rect.setDepth(DEPTH.PLATEFORMES);
        const groupe = oneWay ? this.oneWayPlatforms : this.platforms;
        groupe.add(rect);
        rect.body.updateFromGameObject();
        if (oneWay) {
            rect.body.checkCollision.down = false;
            rect.body.checkCollision.left = false;
            rect.body.checkCollision.right = false;
        }

        // Ornement par-dessus la plateforme physique : pierre cassée Présent /
        // pavés ornés Miroir avec chasse-pieds doré
        peindreOrnementPlateforme(this, x, y, largeur, hauteur, this.mondeCourant, this.palette, oneWay, estSol);

        return rect;
    }

    // Éclaircit une couleur hex (0xRRGGBB) d'un facteur (0..1)
    eclaircir(couleur, facteur) {
        const r = ((couleur >> 16) & 0xff);
        const g = ((couleur >> 8) & 0xff);
        const b = (couleur & 0xff);
        const f = (c) => Math.min(255, Math.round(c + (255 - c) * facteur));
        return (f(r) << 16) | (f(g) << 8) | f(b);
    }

    afficherMessageFlottant(texte, couleurCss) {
        const t = this.add.text(this.player.x, this.player.y - 40, texte, {
            fontFamily: 'monospace',
            fontSize: '13px',
            color: couleurCss,
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5, 1).setDepth(DEPTH.EFFETS);
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
