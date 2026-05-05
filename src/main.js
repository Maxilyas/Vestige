// Point d'entrée — instancie le jeu Phaser avec la config globale.
// Toute la logique vit dans les scènes (cf. src/scenes/).

import { gameConfig } from './config.js';

// eslint-disable-next-line no-new
new Phaser.Game(gameConfig);
