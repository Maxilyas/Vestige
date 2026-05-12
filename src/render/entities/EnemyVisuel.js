// EnemyVisuel — façade publique vers le registry des visuels d'ennemis.
//
// Refactor Phase 3b.0 : la logique de création est distribuée dans
// `render/entities/enemies/<archetype>.js` (un fichier par archétype). Cette
// façade dispatch via le registry chargé par `enemies/index.js`.
//
// API inchangée : `creerVisuelEnnemi(scene, def)` retourne un Container.

import { getVisuel, peindreAccessoire } from './enemies/index.js';

export function creerVisuelEnnemi(scene, def) {
    const factory = getVisuel(def.archetype) ?? getVisuel('veilleur');
    const container = factory(scene, def);
    peindreAccessoire(scene, container, def);
    return container;
}
