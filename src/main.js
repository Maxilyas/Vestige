// Point d'entrée — instancie le jeu Phaser avec la config globale
// et y branche les scènes. On garde l'import des scènes ici (et pas
// dans config.js) pour éviter toute dépendance circulaire.

import { gameConfig } from './config.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';
import { InventaireScene } from './scenes/InventaireScene.js';
import { FondeurScene } from './scenes/FondeurScene.js';
import { IdentifieurScene } from './scenes/IdentifieurScene.js';
import { MarchandScene } from './scenes/MarchandScene.js';
import { MapScene } from './scenes/MapScene.js';
import { FinScene } from './scenes/FinScene.js';

// L'ordre dans `scene` détermine l'ordre de rendu (les suivantes au-dessus).
// La PREMIÈRE scène (MenuScene) est lancée automatiquement au boot ; les
// autres sont lancées à la demande (GameScene depuis MenuScene, overlays
// depuis GameScene, etc.).
// Expose l'instance sur window.game pour faciliter le debug (snippets console).
window.game = new Phaser.Game({
    ...gameConfig,
    scene: [MenuScene, GameScene, UIScene, InventaireScene, FondeurScene, IdentifieurScene, MarchandScene, MapScene, FinScene]
});
