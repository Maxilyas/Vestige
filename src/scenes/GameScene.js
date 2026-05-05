// Scène principale — Monde Normal.
// Étape MVP n°3 : la scène consomme WorldGen pour générer une salle,
// affiche un compteur de salle, et déclenche la salle suivante quand
// le joueur entre dans la zone de sortie à droite.

import { GAME_WIDTH, GAME_HEIGHT, PLAYER } from '../config.js';
import { genererSalle } from '../systems/WorldGen.js';

// Seed globale du run. Plus tard, on la randomisera à chaque "nouveau run"
// et on l'exposera quelque part (URL, écran de démarrage…).
const SEED_DU_RUN = 1337;

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.indexSalle = 0;
    }

    // On accepte un index de salle en paramètre pour que la transition
    // puisse appeler scene.restart({ indexSalle: ... }).
    init(data) {
        this.indexSalle = data?.indexSalle ?? 0;
    }

    create() {
        // 1. Demande à WorldGen la description de la salle courante
        const salle = genererSalle(SEED_DU_RUN, this.indexSalle);

        // 2. Matérialise les plateformes
        this.platforms = this.physics.add.staticGroup();
        for (const p of salle.plateformes) {
            this.creerPlateforme(p.x, p.y, p.largeur, p.hauteur, 0x3a3a4a);
        }

        // 3. Joueur (toujours un simple rectangle pour l'instant)
        this.player = this.add.rectangle(
            salle.spawnJoueur.x,
            salle.spawnJoueur.y,
            PLAYER.WIDTH,
            PLAYER.HEIGHT,
            PLAYER.COLOR
        );
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.platforms);

        // 4. Zone de sortie — visible (rectangle doré) + détection d'overlap
        const s = salle.sortie;
        this.sortie = this.add.rectangle(s.x, s.y, s.largeur, s.hauteur, 0xc8a85a, 0.35);
        this.sortie.setStrokeStyle(2, 0xc8a85a, 0.9);
        this.physics.add.existing(this.sortie, true); // true = static body
        this.physics.add.overlap(this.player, this.sortie, () => this.salleSuivante());

        // 5. Contrôles
        this.cursors = this.input.keyboard.createCursorKeys();
        this.touches = this.input.keyboard.addKeys({
            gauche: Phaser.Input.Keyboard.KeyCodes.Q,
            droite: Phaser.Input.Keyboard.KeyCodes.D,
            saut: Phaser.Input.Keyboard.KeyCodes.SPACE
        });

        // 6. Petit HUD textuel — sera remplacé par UIScene plus tard
        this.add.text(10, 10, `Vestige — Salle ${salle.index + 1}`, {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#e8e4d8'
        });
        this.add.text(10, 32, 'Flèches / QD pour bouger, ↑ ou Espace pour sauter', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#8a8a9a'
        });

        // Garde-fou : empêche un overlap déclenché plusieurs fois pendant la
        // même frame de provoquer plusieurs scene.restart() en cascade
        this.transitionEnCours = false;
    }

    update() {
        const body = this.player.body;
        const auSol = body.blocked.down || body.touching.down;

        const gauche = this.cursors.left.isDown || this.touches.gauche.isDown;
        const droite = this.cursors.right.isDown || this.touches.droite.isDown;

        if (gauche && !droite) {
            body.setVelocityX(-PLAYER.SPEED);
        } else if (droite && !gauche) {
            body.setVelocityX(PLAYER.SPEED);
        } else {
            body.setVelocityX(0);
        }

        const veutSauter =
            Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
            Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
            Phaser.Input.Keyboard.JustDown(this.touches.saut);

        if (veutSauter && auSol) {
            body.setVelocityY(-PLAYER.JUMP_VELOCITY);
        }
    }

    // Transition vers la salle suivante : on restart la scène avec un index +1
    salleSuivante() {
        if (this.transitionEnCours) return;
        this.transitionEnCours = true;

        // Petit fade-out pour que la transition ne soit pas brutale
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.restart({ indexSalle: this.indexSalle + 1 });
        });
    }

    // Helper interne : crée une plateforme statique à (x, y) (centre)
    creerPlateforme(x, y, largeur, hauteur, couleur) {
        const rect = this.add.rectangle(x, y, largeur, hauteur, couleur);
        this.platforms.add(rect);
        rect.body.updateFromGameObject();
        return rect;
    }
}
