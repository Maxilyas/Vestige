// Config globale du jeu Vestige
// Centralise les constantes pour éviter les "magic numbers" éparpillés.
// Important : ce fichier ne doit RIEN importer du dossier scenes/ ni systems/
// — sinon on crée une dépendance circulaire (TDZ sur PLAYER/WORLD).
// L'enregistrement des scènes se fait dans main.js.

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

// Constantes de gameplay réutilisées par les scènes / entités
export const PLAYER = {
    WIDTH: 24,
    HEIGHT: 36,
    SPEED: 220,
    JUMP_VELOCITY: 480,
    COLOR: 0xe8e4d8 // blanc cassé, ton "vestige"
};

export const WORLD = {
    GRAVITY_Y: 1200,
    BG_COLOR: '#1a1a24' // gris-bleu sombre, ambiance ruines
};

// Config Phaser passée à new Phaser.Game()
export const gameConfig = {
    type: Phaser.AUTO,
    backgroundColor: WORLD.BG_COLOR,
    pixelArt: false,
    // Scaling — on raisonne TOUJOURS en coordonnées internes 960x540.
    // Le Scale Manager se charge d'adapter le canvas à la taille du navigateur :
    //   FIT          = conserve le ratio, ajoute des bandes noires si besoin
    //   CENTER_BOTH  = centre le canvas horizontalement et verticalement
    // Conséquence : aucune autre partie du code n'a à se soucier de la taille
    // réelle de l'écran (mobile, desktop, etc.).
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game',
        width: GAME_WIDTH,
        height: GAME_HEIGHT
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: WORLD.GRAVITY_Y },
            debug: false
        }
    }
    // Les scènes sont injectées dans main.js (cf. structure ci-dessus)
};
