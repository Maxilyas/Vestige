// Scène principale.
// Étapes MVP 2-6 : déplacement, génération de salle, Résonance, basculement,
// loot (coffres + drops orphelins).
//
// La scène lit ses inputs UNIQUEMENT via InputSystem (pas de Keyboard direct
// dans la logique gameplay) — pour porter sur mobile sans refactor.

import { GAME_WIDTH, GAME_HEIGHT, PLAYER, WORLD } from '../config.js';
import { genererSalle, creerRng } from '../systems/WorldGen.js';
import { ResonanceSystem } from '../systems/ResonanceSystem.js';
import { MondeSystem } from '../systems/MondeSystem.js';
import { InputSystem } from '../systems/InputSystem.js';
import { InventaireSystem } from '../systems/InventaireSystem.js';
import { tirerItem, tirerConsommable, calculerStats } from '../systems/LootSystem.js';
import { COULEURS_FAMILLE, ITEMS, CONSOMMABLES } from '../data/items.js';

const SEED_DU_RUN = 1337;

const PALETTE_NORMAL = {
    fond: '#1a1a24',
    plateforme: 0x3a3a4a,
    sortie: 0xc8a85a
};
const PALETTE_MIROIR = {
    fond: '#3a2818',
    plateforme: 0x7a3a4a,
    sortie: 0xc8a85a,
    vortex: 0x5ac8a8
};

const HAUTEUR_SOL = 40;
const BAISSE_MIROIR_DELAI_MS = 500;
const BAISSE_MIROIR_MONTANT = 1; // base — sera modifiée par les stats effectives
const BAISSE_PRESENT_DELAI_MS = 2000; // tick lent en Présent (déclenchée par items Bleu)

const CLE_POSITION_PENDANTE = 'position_pendante';

// Stats de base (avant modifications par l'équipement)
const STATS_BASE = {
    speed: PLAYER.SPEED,
    jumpVelocity: PLAYER.JUMP_VELOCITY,
    passiveMiroir: BAISSE_MIROIR_MONTANT, // pts par tick
    passivePresent: 0,                    // pts par tick (0 par défaut)
    bonusRetour: 20
};

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
        this.inputSystem = new InputSystem(this);

        // PRNG pour le contenu du loot — seedé par (run, salle, monde) pour
        // que le contenu d'un coffre soit reproductible si on revisite.
        const mondeCourant = this.monde.getMonde();
        this.rngLoot = creerRng(
            (SEED_DU_RUN ^ (this.indexSalle * 0x85EBCA6B) ^ (mondeCourant === 'miroir' ? 0xC2B2AE35 : 0)) >>> 0
        );

        // Stats effectives (recalculées à chaque équipement)
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
        const palette = enMiroir ? PALETTE_MIROIR : PALETTE_NORMAL;
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

        // --- HUD textuel ---
        const titre = enMiroir
            ? `Vestige — Salle ${salle.index + 1} (Miroir)`
            : `Vestige — Salle ${salle.index + 1}`;
        this.add.text(10, 10, titre, {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: enMiroir ? '#f0c890' : '#e8e4d8'
        });
        this.add.text(10, 32, 'Flèches/QD : bouger | ↑/Espace : sauter | E : interagir | I : inventaire | K/H : -/+ Résonance (test)', {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#8a8a9a'
        });

        // --- Hooks selon le monde ---
        if (enMiroir) {
            this.activerBaissePassive(true);
            this.surveillerAncrage();
            if (this.resonance.getValeur() === 0) this.afficherAncrage();
        } else {
            this.brancherBasculement();
        }
        // Baisse passive Présent (signature des items Bleu équipés)
        this.activerBaissePassive(false);

        this.cameras.main.fadeIn(200, 0, 0, 0);
    }

    update() {
        this.inputSystem.update();
        const i = this.inputSystem.intentions;

        // Mouvement
        const body = this.player.body;
        const auSol = body.blocked.down || body.touching.down;
        const speed = this.statsEffectives.speed;

        if (i.gauche && !i.droite) body.setVelocityX(-speed);
        else if (i.droite && !i.gauche) body.setVelocityX(speed);
        else body.setVelocityX(0);

        if (i.sauter && auSol) {
            body.setVelocityY(-this.statsEffectives.jumpVelocity);
        }

        // Interaction (E) — coffres/drops à proximité
        if (i.interagir) {
            this.essayerInteragir();
        }

        // Inventaire (I) — overlay
        if (i.ouvrirInventaire) {
            if (!this.scene.isActive('InventaireScene')) {
                this.scene.pause();
                this.scene.launch('InventaireScene');
            }
        }

        // Debug Résonance
        if (i.degatTest) this.resonance.prendreDegats(10);
        if (i.healTest) this.resonance.regagner(10);
    }

    // --- Coffres ----------------------------------------------------------
    creerCoffre(c) {
        // Couleur neutre tant qu'il est fermé : la famille du loot reste un mystère.
        this.coffre = this.add.rectangle(c.x, c.y, c.largeur, c.hauteur, 0x8a7a6a);
        this.coffre.setStrokeStyle(2, 0xc8a85a);
        this.coffreData = c;
    }

    creerDropSol(d) {
        // Petit cube pulsant cyan-pâle au sol (consommable)
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
        // Distance euclidienne simple, seuil ~40 px
        const proche = (obj) => obj && Phaser.Math.Distance.Between(px, py, obj.x, obj.y) < 40;

        if (this.coffre && proche(this.coffre)) {
            this.ouvrirCoffre();
            return;
        }
        if (this.dropSol && proche(this.dropSol)) {
            this.ramasserDropSol();
        }
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

        // Effet visuel : le coffre prend la couleur de la famille puis disparaît
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
        // Effet immédiat selon le type
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
            // Suspend la baisse passive Miroir pendant N ms
            if (this.timerMiroir) {
                this.timerMiroir.paused = true;
                this.time.delayedCall(e.duree, () => {
                    if (this.timerMiroir) this.timerMiroir.paused = false;
                });
            }
        }
    }

    // --- Zone de sortie ---------------------------------------------------
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

    // --- Transitions ------------------------------------------------------
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
            // Bonus de retour modulé par les stats effectives
            const bonus = this.statsEffectives.bonusRetour;
            this.monde.revenirAuNormal();
            // revenirAuNormal applique un bonus fixe — on ajoute le delta éventuel
            const delta = bonus - 20; // 20 = bonus de base dans MondeSystem
            if (delta !== 0) this.resonance.regagner(delta);
            this.scene.restart({ indexSalle: this.indexSalle });
        });
    }

    // --- Hooks Miroir / Présent -------------------------------------------
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
            // Tick lent : baisse uniquement si un item Bleu équipé l'active
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

    // --- Helpers ----------------------------------------------------------
    creerPlateforme(x, y, largeur, hauteur, couleur) {
        const rect = this.add.rectangle(x, y, largeur, hauteur, couleur);
        this.platforms.add(rect);
        rect.body.updateFromGameObject();
        return rect;
    }

    /**
     * Affiche un texte qui flotte vers le haut puis disparaît, au-dessus du joueur.
     */
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
