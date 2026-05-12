// Registry des comportements d'ennemis — isolé dans son propre module pour
// éviter les imports circulaires.
//
// Les fichiers de comportements (dormant.js, anchor.js, etc.) importent
// `registerComportement` depuis ICI, pas depuis index.js, sinon ils
// déclenchent une boucle (index.js → import dormant.js → import index.js
// non encore initialisé → 'Cannot access COMPORTEMENTS before init').

export const COMPORTEMENTS = {};

export function registerComportement(archetype, handler) {
    COMPORTEMENTS[archetype] = handler;
}

export function getComportement(archetype) {
    return COMPORTEMENTS[archetype];
}
