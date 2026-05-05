// Point d'entrée — instancie le jeu Phaser avec la config globale
// et y branche les scènes. On garde l'import des scènes ici (et pas
// dans config.js) pour éviter toute dépendance circulaire.

import { gameConfig } from './config.js';
import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';

// L'ordre dans `scene` détermine l'ordre de rendu (UIScene au-dessus).
// GameScene est lancée par défaut ; elle se charge ensuite de `launch('UIScene')`.
// eslint-disable-next-line no-new
new Phaser.Game({ ...gameConfig, scene: [GameScene, UIScene] });
