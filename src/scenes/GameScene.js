// Scène principale — Monde Normal.
// Étape MVP n°2 : un personnage rectangulaire qui se déplace et saute sur un sol.
// Pas encore de génération procédurale, pas encore de Résonance — juste les bases.

import { GAME_WIDTH, GAME_HEIGHT, PLAYER } from '../config.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // --- Sol et plateformes ---
        // On utilise un staticGroup avec des rectangles générés via Graphics
        // (pas d'assets pour l'instant — primitives uniquement)
        this.platforms = this.physics.add.staticGroup();

        // Sol principal (large rectangle au bas de l'écran)
        this.creerPlateforme(GAME_WIDTH / 2, GAME_HEIGHT - 20, GAME_WIDTH, 40, 0x3a3a4a);

        // Quelques plateformes pour tester le saut
        this.creerPlateforme(200, GAME_HEIGHT - 140, 180, 20, 0x4a4a5a);
        this.creerPlateforme(GAME_WIDTH - 200, GAME_HEIGHT - 200, 180, 20, 0x4a4a5a);
        this.creerPlateforme(GAME_WIDTH / 2, GAME_HEIGHT - 280, 160, 20, 0x4a4a5a);

        // --- Joueur ---
        // Rectangle simple : on le créera en vrai sprite/spritesheet plus tard
        this.player = this.add.rectangle(
            100,
            GAME_HEIGHT - 100,
            PLAYER.WIDTH,
            PLAYER.HEIGHT,
            PLAYER.COLOR
        );
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        // Collision joueur / plateformes
        this.physics.add.collider(this.player, this.platforms);

        // --- Contrôles clavier ---
        // Flèches + ZQSD (AZERTY) + Espace pour le saut
        this.cursors = this.input.keyboard.createCursorKeys();
        this.touches = this.input.keyboard.addKeys({
            gauche: Phaser.Input.Keyboard.KeyCodes.Q,
            droite: Phaser.Input.Keyboard.KeyCodes.D,
            saut: Phaser.Input.Keyboard.KeyCodes.SPACE
        });

        // Petit texte d'aide en haut, sera retiré plus tard
        this.add.text(10, 10, 'Vestige — prototype\nFlèches / QD pour bouger, ↑ ou Espace pour sauter', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#8a8a9a'
        });
    }

    update() {
        const body = this.player.body;
        const auSol = body.blocked.down || body.touching.down;

        // Déplacement horizontal — on remet la vélocité à zéro chaque frame
        // pour éviter le "glissement" indésirable
        const gauche = this.cursors.left.isDown || this.touches.gauche.isDown;
        const droite = this.cursors.right.isDown || this.touches.droite.isDown;

        if (gauche && !droite) {
            body.setVelocityX(-PLAYER.SPEED);
        } else if (droite && !gauche) {
            body.setVelocityX(PLAYER.SPEED);
        } else {
            body.setVelocityX(0);
        }

        // Saut — uniquement si on touche une surface en dessous
        const veutSauter =
            Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
            Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
            Phaser.Input.Keyboard.JustDown(this.touches.saut);

        if (veutSauter && auSol) {
            body.setVelocityY(-PLAYER.JUMP_VELOCITY);
        }
    }

    // Helper interne : crée une plateforme statique colorée à (x, y)
    // x, y = centre du rectangle
    creerPlateforme(x, y, largeur, hauteur, couleur) {
        const rect = this.add.rectangle(x, y, largeur, hauteur, couleur);
        this.platforms.add(rect);
        // Recalcule la hitbox statique après ajout (sinon Phaser garde l'ancienne)
        rect.body.updateFromGameObject();
        return rect;
    }
}
