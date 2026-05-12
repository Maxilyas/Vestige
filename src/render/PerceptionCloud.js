// PerceptionCloud — nuages obscurcissants statiques rendus par-dessus le monde.
//
// Phase 3b : utilisé par Champignon-Spore qui émet périodiquement un nuage
// visuel rendant cette zone partiellement opaque. Effet purement visuel — pas
// de modification de gameplay (visibilité n'est pas un système de "fog of war"
// strict, juste un confort visuel réduit pour le joueur).
//
// Phase 3d+ : sera l'embryon d'un PerceptionSystem complet (flou de vue,
// hallucinations, etc.).
//
// Stateless API : `creerNuageSpore(scene, x, y, rayon, duration)`.

import { DEPTH } from './PainterlyRenderer.js';

/**
 * Crée un nuage visuel statique à (x, y) qui s'estompe au bout de `duration`.
 * Couleurs : sombre violacé pour les spores du biome Ruines basses ; mais
 * `couleur` est paramétrable pour réutilisation future.
 */
export function creerNuageSpore(scene, x, y, rayon = 80, duration = 3000, options = {}) {
    const couleur = options.couleur ?? 0x2a1a3a;
    const intensite = options.intensite ?? 0.55;

    const g = scene.add.graphics();
    g.setDepth(DEPTH.EFFETS ?? 60);
    // Cœur dense
    g.fillStyle(couleur, intensite);
    g.fillCircle(x, y, rayon * 0.6);
    // Halo doux
    g.fillStyle(couleur, intensite * 0.5);
    g.fillCircle(x, y, rayon);
    // Edge très diffus
    g.fillStyle(couleur, intensite * 0.2);
    g.fillCircle(x, y, rayon * 1.3);

    // Animation : léger drift + scale pulsant
    scene.tweens.add({
        targets: g,
        scaleX: { from: 0.9, to: 1.1 },
        scaleY: { from: 0.9, to: 1.1 },
        duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.InOut'
    });

    // Fade-in puis fade-out
    g.alpha = 0;
    scene.tweens.add({
        targets: g, alpha: 1,
        duration: 400, ease: 'Cubic.Out'
    });
    scene.tweens.add({
        targets: g, alpha: 0,
        delay: duration - 500,
        duration: 500,
        ease: 'Cubic.In',
        onComplete: () => g.destroy()
    });

    return g;
}
