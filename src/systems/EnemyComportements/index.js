// Façade des comportements d'ennemis.
//
// Le registry vit dans `_registry.js`. Cet index :
//   1. Réexporte COMPORTEMENTS / registerComportement / getComportement
//   2. Importe les comportements de base + innovants pour déclencher leur
//      enregistrement dans le registry.
//
// Compatibilité ascendante : `import { COMPORTEMENTS } from '.../index.js'`
// continue de fonctionner (consommé par Enemy.js).

import { registerComportement } from './_registry.js';

// Comportements de base (export default → enregistrés ici)
import veilleur from './veilleur.js';
import traqueur from './traqueur.js';
import chargeur from './chargeur.js';
import tireur from './tireur.js';

registerComportement('veilleur', veilleur);
registerComportement('traqueur', traqueur);
registerComportement('chargeur', chargeur);
registerComportement('tireur',   tireur);

// Phase 3b — archétypes innovants (auto-enregistrement via side-effect)
import './dormant.js';
import './anchor.js';
import './trail-tile.js';
import './spawner.js';
import './diver.js';
import './cloud.js';

export { COMPORTEMENTS, registerComportement, getComportement } from './_registry.js';
