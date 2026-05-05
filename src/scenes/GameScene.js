// Scène principale.
// Étapes MVP 2-5 : déplacement / saut / génération de salle / Résonance / Basculement.
//
// Cette scène fait double office : Monde Normal ET Monde Miroir.
// Elle lit le monde courant dans le MondeSystem et applique :
//   - une palette de couleurs différente
//   - une zone interactive différente (sortie de salle vs portail de retour)
//   - une baisse passive de la Résonance dans le Miroir
//   - un basculement automatique quand la Résonance touche 0 dans le Normal

import { GAME_WIDTH, GAME_HEIGHT, PLAYER } from '../config.js';
import { genererSalle } from '../systems/WorldGen.js';
import { ResonanceSystem } from '../systems/ResonanceSystem.js';
import { MondeSystem } from '../systems/MondeSystem.js';

const SEED_DU_RUN = 1337;

// Palettes — centralisées ici pour pouvoir les tuner sans chercher
const PALETTE_NORMAL = {
    fond: '#1a1a24',
    plateforme: 0x3a3a4a,
    sortie: 0xc8a85a // doré : avance vers la salle suivante
};
const PALETTE_MIROIR = {
    fond: '#3a2818',
    plateforme: 0x7a3a4a,
    sortie: 0xc8a85a, // doré : avance dans la progression (reste en Miroir)
    vortex: 0x5ac8a8  // cyan-vert : vortex de retour vers le Présent
};

// Clé registry pour la continuité spatiale lors d'un basculement / retour vortex.
// On stocke la position juste avant le fade-out, on la consomme au create suivant.
const CLE_POSITION_PENDANTE = 'position_pendante';

// Hauteur du sol (cohérent avec WorldGen)
const HAUTEUR_SOL = 40;

// Baisse passive du Miroir : 1 point toutes les 500 ms = 2 pts/seconde
const BAISSE_MIROIR_DELAI_MS = 500;
const BAISSE_MIROIR_MONTANT = 1;

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
        // --- Systèmes (registry-backed, survivent aux restart) ---
        this.resonance = new ResonanceSystem(this.registry);
        this.monde = new MondeSystem(this.registry);

        // --- HUD parallèle ---
        if (!this.scene.isActive('UIScene')) {
            this.scene.launch('UIScene');
        }

        // --- Palette selon le monde courant ---
        const enMiroir = this.monde.estDansMiroir();
        const palette = enMiroir ? PALETTE_MIROIR : PALETTE_NORMAL;
        this.cameras.main.setBackgroundColor(palette.fond);

        // --- Salle (géométrie identique entre les deux mondes : même seed) ---
        const salle = genererSalle(SEED_DU_RUN, this.indexSalle);

        this.platforms = this.physics.add.staticGroup();
        for (const p of salle.plateformes) {
            this.creerPlateforme(p.x, p.y, p.largeur, p.hauteur, palette.plateforme);
        }

        // --- Joueur : position de spawn ---
        // Trois cas, dans l'ordre de priorité :
        //   1. Position pendante dans le registry → c'est qu'on vient juste de
        //      basculer (Présent ↔ Miroir) : on conserve la position exacte du
        //      joueur, pour la continuité spatiale du Vestige. (cf. LORE)
        //   2. Sinon : spawn standard à gauche, comme une entrée de salle naturelle.
        const positionPendante = this.registry.get(CLE_POSITION_PENDANTE);
        let spawn;
        if (positionPendante) {
            spawn = positionPendante;
            this.registry.remove(CLE_POSITION_PENDANTE);
        } else {
            spawn = salle.spawnJoueur;
        }

        this.player = this.add.rectangle(
            spawn.x,
            spawn.y,
            PLAYER.WIDTH,
            PLAYER.HEIGHT,
            PLAYER.COLOR
        );
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.platforms);

        // --- Zones interactives ---
        // Sortie de salle : présente dans les DEUX mondes (option C de la Doctrine).
        // Avancer en Miroir fait aussi avancer en Présent — c'est un raccourci risqué.
        this.creerSortieSalle(salle.sortie, palette.sortie);

        // Vortex de retour : uniquement en Miroir, position aléatoire seedée
        // (sur une plateforme), pas à un endroit fixe. Lecture lore : la Trame
        // s'ouvre où elle peut, pas où le joueur l'attend. Voir LORE.md.
        if (enMiroir) {
            this.creerVortex(salle.vortex, palette.vortex);
        }

        // --- Contrôles ---
        this.cursors = this.input.keyboard.createCursorKeys();
        this.touches = this.input.keyboard.addKeys({
            gauche: Phaser.Input.Keyboard.KeyCodes.Q,
            droite: Phaser.Input.Keyboard.KeyCodes.D,
            saut: Phaser.Input.Keyboard.KeyCodes.SPACE
        });
        // PROVISOIRE — touches debug pour la Résonance (cf. CLAUDE.md)
        this.touchesDebug = this.input.keyboard.addKeys({
            degatTest: Phaser.Input.Keyboard.KeyCodes.K,
            healTest: Phaser.Input.Keyboard.KeyCodes.H
        });

        // --- HUD textuel (info de salle + monde + aide) ---
        const titre = enMiroir
            ? `Vestige — Salle ${salle.index + 1} (Miroir)`
            : `Vestige — Salle ${salle.index + 1}`;
        this.add.text(10, 10, titre, {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: enMiroir ? '#f0c890' : '#e8e4d8'
        });
        this.add.text(10, 32, 'Flèches / QD : bouger | ↑ ou Espace : sauter | K : -10 / H : +10 (test)', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#8a8a9a'
        });

        // --- Hooks selon le monde ---
        if (enMiroir) {
            this.activerBaissePassive();
            this.surveillerAncrage();
            // Affichage immédiat si on rentre déjà à 0
            if (this.resonance.getValeur() === 0) this.afficherAncrage();
        } else {
            this.brancherBasculement();
        }

        // --- Fade-in après transition ---
        this.cameras.main.fadeIn(200, 0, 0, 0);
    }

    update() {
        const body = this.player.body;
        const auSol = body.blocked.down || body.touching.down;

        const gauche = this.cursors.left.isDown || this.touches.gauche.isDown;
        const droite = this.cursors.right.isDown || this.touches.droite.isDown;

        if (gauche && !droite) body.setVelocityX(-PLAYER.SPEED);
        else if (droite && !gauche) body.setVelocityX(PLAYER.SPEED);
        else body.setVelocityX(0);

        const veutSauter =
            Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
            Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
            Phaser.Input.Keyboard.JustDown(this.touches.saut);

        if (veutSauter && auSol) {
            body.setVelocityY(-PLAYER.JUMP_VELOCITY);
        }

        // PROVISOIRE — touches debug Résonance
        if (Phaser.Input.Keyboard.JustDown(this.touchesDebug.degatTest)) {
            this.resonance.prendreDegats(10);
        }
        if (Phaser.Input.Keyboard.JustDown(this.touchesDebug.healTest)) {
            this.resonance.regagner(10);
        }
    }

    // --- Zone de sortie (Monde Normal uniquement) -----------------------------
    creerSortieSalle(s, couleur) {
        this.sortie = this.add.rectangle(s.x, s.y, s.largeur, s.hauteur, couleur, 0.35);
        this.sortie.setStrokeStyle(2, couleur, 0.9);
        this.physics.add.existing(this.sortie, true);
        this.physics.add.overlap(this.player, this.sortie, () => this.salleSuivante());
    }

    // --- Vortex de retour (Monde Miroir uniquement) ---------------------------
    // Position fournie par WorldGen (aléatoire seedée). Pulsation visuelle pour
    // signaler que c'est un objet "vivant" et non décoratif.
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

    // --- Transitions ----------------------------------------------------------
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

        // Continuité spatiale : on mémorise la position exacte du joueur pour
        // qu'il réapparaisse au même endroit dans le Miroir.
        this.registry.set(CLE_POSITION_PENDANTE, { x: this.player.x, y: this.player.y });

        // Fade rouge bref pour signaler que c'est dramatique, pas une transition normale
        this.cameras.main.fadeOut(300, 80, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.monde.basculerVersMiroir();
            this.scene.restart({ indexSalle: this.indexSalle });
        });
    }

    retourAuNormal() {
        if (this.transitionEnCours) return;
        this.transitionEnCours = true;

        // Continuité spatiale : on conserve aussi la position au retour vortex.
        this.registry.set(CLE_POSITION_PENDANTE, { x: this.player.x, y: this.player.y });

        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.monde.revenirAuNormal();
            this.scene.restart({ indexSalle: this.indexSalle });
        });
    }

    // --- Hooks Miroir / Normal -------------------------------------------------
    brancherBasculement() {
        // En mode Normal, on écoute le passage à 0 de la Résonance pour basculer.
        // On garde une réf au handler pour pouvoir le détacher au shutdown
        // (sinon il s'accumulerait sur le registry, qui survit aux restart).
        this.handlerVide = () => this.basculerVersMiroir();
        this.registry.events.on('resonance:vide', this.handlerVide);

        this.events.once('shutdown', () => {
            this.registry.events.off('resonance:vide', this.handlerVide);
        });
    }

    activerBaissePassive() {
        this.timerMiroir = this.time.addEvent({
            delay: BAISSE_MIROIR_DELAI_MS,
            loop: true,
            callback: () => this.resonance.prendreDegats(BAISSE_MIROIR_MONTANT)
        });

        this.events.once('shutdown', () => {
            if (this.timerMiroir) this.timerMiroir.remove(false);
        });
    }

    surveillerAncrage() {
        // Affiche le texte "ANCRÉ" si la Résonance tombe à 0 pendant qu'on est ici.
        const handler = (_p, valeur) => {
            if (valeur === 0 && !this.texteAncrage) this.afficherAncrage();
        };
        this.registry.events.on('changedata-resonance', handler);

        this.events.once('shutdown', () => {
            this.registry.events.off('changedata-resonance', handler);
        });
    }

    afficherAncrage() {
        this.texteAncrage = this.add.text(
            GAME_WIDTH / 2,
            70,
            'ANCRÉ DANS LE MIROIR',
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#ff6060',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5, 0);
    }

    // --- Helper interne -------------------------------------------------------
    creerPlateforme(x, y, largeur, hauteur, couleur) {
        const rect = this.add.rectangle(x, y, largeur, hauteur, couleur);
        this.platforms.add(rect);
        rect.body.updateFromGameObject();
        return rect;
    }
}
