// SpawnerSystem — helpers pour les ennemis "spawner" qui pondent des enfants.
//
// MODÈLE
// ──────
// Un ennemi spawner garde une liste de ses enfants vivants sur lui-même
// (`enemy.enfants`). À chaque tentative de spawn, on prune les morts et on
// applique un cap dur. Le spawn effectif se fait via l'event `enemy:spawn`
// que GameScene relaie pour instancier le nouvel Enemy.
//
// Usage côté comportement :
//   import { peutSpawner, marquerSpawn } from '../SpawnerSystem.js';
//   if (peutSpawner(enemy, capEnfants)) {
//       marquerSpawn(enemy, /* future enfant ref renseignée par GameScene */);
//       return { spawn: { defChild, x, y } };
//   }

/**
 * Vérifie si l'ennemi parent peut spawn un nouvel enfant (cap respecté).
 * Nettoie d'office les enfants morts.
 */
export function peutSpawner(parent, capEnfants = 3) {
    if (!parent.enfants) parent.enfants = [];
    // Purge des enfants morts (ou détruits)
    parent.enfants = parent.enfants.filter(c => c && !c.mort);
    return parent.enfants.length < capEnfants;
}

/**
 * Enregistre une référence d'enfant sur le parent. Appelée par GameScene
 * une fois l'Enemy enfant instancié.
 */
export function enregistrerEnfant(parent, childEnemy) {
    if (!parent.enfants) parent.enfants = [];
    parent.enfants.push(childEnemy);
}

/**
 * Compteur d'enfants vivants (utile pour debug ou logique conditionnelle).
 */
export function compterEnfantsVivants(parent) {
    if (!parent.enfants) return 0;
    return parent.enfants.filter(c => c && !c.mort).length;
}

/**
 * Construit une def "mini" en clonant une def de base avec stats réduites.
 * Pratique pour les enfants spawnés (ex: mini-spectre depuis Tombe Éclatée).
 *
 * @param {object} baseDef       def source à cloner
 * @param {object} reductions    { hpMult, degatsMult, vitesseMult, tailleMult }
 */
export function defMini(baseDef, reductions = {}) {
    const hpMult = reductions.hpMult ?? 0.5;
    const degatsMult = reductions.degatsMult ?? 0.7;
    const vitesseMult = reductions.vitesseMult ?? 0.85;
    const tailleMult = reductions.tailleMult ?? 0.7;
    return {
        ...baseDef,
        id: baseDef.id + '_mini',
        nom: baseDef.nom + ' (jeune)',
        hp: Math.max(1, Math.round(baseDef.hp * hpMult)),
        degatsContact: Math.max(1, Math.round(baseDef.degatsContact * degatsMult)),
        vitesse: Math.round((baseDef.vitesse ?? 0) * vitesseMult),
        largeur: Math.round(baseDef.largeur * tailleMult),
        hauteur: Math.round(baseDef.hauteur * tailleMult),
        probaDrop: 0.15,    // Les mini-ennemis droppent moins
        spawned: true       // Tag pour exclure de la persistance "ennemi mort"
    };
}
