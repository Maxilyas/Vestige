// Config globale du jeu Vestige
// Centralise les constantes pour éviter les "magic numbers" éparpillés

import { GameScene } from './scenes/GameScene.js';

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
    parent: 'game',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: WORLD.BG_COLOR,
    pixelArt: false,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: WORLD.GRAVITY_Y },
            debug: false
        }
    },
    scene: [GameScene]
};
