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

// Phase 3b — archétypes innovants (Ruines basses)
import './dormant.js';
import './anchor.js';
import './trail-tile.js';
import './spawner.js';
import './diver.js';
import './cloud.js';
// Phase 3c — archétypes innovants (Halls Cendrés)
import './lighting-mod.js';
import './detonator.js';
import './web-spinner.js';
import './reflector.js';
import './frost-trailer.js';
import './wall-builder.js';
// Phase 3d — archétypes innovants (Cristaux Glacés)
import './vision-distorter.js';
import './floor-froster.js';
import './mirror-clone.js';
import './mirror-being.js';
import './orbital.js';
import './control-inverter.js';
// Phase 3e — archétypes innovants (Voile Inversé)
import './reactive-shooter.js';
import './unstoppable-charger.js';
import './phaser.js';
import './gravity-flipper.js';
import './teleporter.js';
import './vulnerability-shooter.js';
// Phase 3f — archétypes innovants (Cœur du Reflux)
import './death-shards.js';
import './ground-fissure.js';
import './gaze.js';
import './sister-link.js';
import './parry-lock.js';
import './drain-aura.js';

export { COMPORTEMENTS, registerComportement, getComportement } from './_registry.js';
