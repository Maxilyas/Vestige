// CloneIllusionSystem — clones illusoires (visuels uniquement, pas de physique).
//
// Usage :
//   - Mirror-clone (Éclat-Multiplicateur) : spawn un clone visuel à chaque
//     hit reçu, qui imite la silhouette de l'ennemi pour confondre.
//   - Mirror-being (Reflet-Double) : utilise creerCloneVisuelEnnemi pour
//     fabriquer un clone permanent de l'apparence-joueur.

import { creerVisuelEnnemi } from '../render/entities/EnemyVisuel.js';
import { DEPTH } from '../render/PainterlyRenderer.js';

/**
 * Crée un clone illusoire d'un ennemi à une position donnée. Pas de physique,
 * pas de dmg infligé — purement visuel. Auto-destruct après `duree` ms.
 */
export function creerCloneIllusoire(scene, def, x, y, duree = 3000) {
    const visual = creerVisuelEnnemi(scene, def);
    visual.setPosition(x, y);
    visual.setAlpha(0.65);
    visual.setDepth(DEPTH.ENTITES);

    // Léger drift horizontal pour vie "fantôme"
    const dx = (Math.random() - 0.5) * 60;
    scene.tweens.add({
        targets: visual,
        x: visual.x + dx,
        y: visual.y + (Math.random() - 0.5) * 20,
        duration: duree,
        ease: 'Sine.InOut'
    });
    scene.tweens.add({
        targets: visual,
        alpha: 0,
        delay: Math.max(0, duree - 400),
        duration: 400,
        onComplete: () => visual.destroy()
    });
    return visual;
}
