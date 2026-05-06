// Point d'entrée — instancie le jeu Phaser avec la config globale
// et y branche les scènes. On garde l'import des scènes ici (et pas
// dans config.js) pour éviter toute dépendance circulaire.

import { gameConfig } from './config.js';
import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';
import { InventaireScene } from './scenes/InventaireScene.js';
import { FondeurScene } from './scenes/FondeurScene.js';
import { IdentifieurScene } from './scenes/IdentifieurScene.js';
import { MarchandScene } from './scenes/MarchandScene.js';
import { MapScene } from './scenes/MapScene.js';

// L'ordre dans `scene` détermine l'ordre de rendu (les suivantes au-dessus).
// GameScene est lancée par défaut ; les overlays sont lancés à la demande.
// eslint-disable-next-line no-new
new Phaser.Game({
    ...gameConfig,
    scene: [GameScene, UIScene, InventaireScene, FondeurScene, IdentifieurScene, MarchandScene, MapScene]
});
