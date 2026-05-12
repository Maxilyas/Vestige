// Registry des fonctions de création de visuel d'ennemi.
//
// Chaque archétype enregistre sa fonction `creerVisuel(scene, def)` qui
// retourne un Phaser.GameObjects.Container. EnemyVisuel.js dispatche via
// ce registry.

const REGISTRY = new Map();

export function registerVisuel(archetype, fn) {
    REGISTRY.set(archetype, fn);
}

export function getVisuel(archetype) {
    return REGISTRY.get(archetype);
}
