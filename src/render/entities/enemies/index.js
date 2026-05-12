// Index des visuels d'ennemis — l'import déclenche l'enregistrement des
// 4 archétypes de base dans le registry (side-effect des fichiers).
// Phase 3b+ ajoutera ici les nouveaux archétypes innovants.

import './veilleur.js';
import './traqueur.js';
import './chargeur.js';
import './tireur.js';
// Phase 3b — visuels innovants (Ruines basses)
import './statue_eveillee.js';
import './racine_etouffante.js';
import './mousse_glissante.js';
import './tombe_eclatee.js';
import './vautour_debris.js';
import './champignon_spore.js';
// Phase 3c — visuels innovants (Halls Cendrés)
import './chandelier_vivant.js';
import './bruleur_lent.js';
import './cendre_tisseuse.js';
import './ardent_miroir.js';
import './soupir_glacial.js';
import './tisseur_embrasement.js';

export { getVisuel } from './_registry.js';
export { peindreAccessoire } from './_accessoires.js';
