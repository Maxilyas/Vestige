// Consommable — visuel stylisé pour chaque drop orphelin au sol.
// Chaque type a son emblème (forme + couleur) + halo additif pulsant +
// flottement vertical pour signaler qu'il est ramassable.

import { DEPTH } from '../PainterlyRenderer.js';
import { CONSOMMABLES } from '../../data/items.js';

/**
 * Crée le visuel d'un consommable à la position (x, y).
 * @returns {Phaser.GameObjects.Container} container au centre (x, y)
 */
export function creerVisuelConsommable(scene, x, y, consommableId) {
    const def = CONSOMMABLES[consommableId];
    const couleur = def?.couleur ?? 0xa8c8e8;

    const container = scene.add.container(x, y);
    container.setDepth(DEPTH.DECOR_AVANT);

    // --- Halo additif pulsant ---
    const halo = scene.add.graphics();
    halo.setBlendMode(Phaser.BlendModes.ADD);
    halo.fillStyle(couleur, 0.3);
    halo.fillCircle(0, 0, 16);
    halo.fillStyle(couleur, 0.5);
    halo.fillCircle(0, 0, 10);
    container.add(halo);
    scene.tweens.add({
        targets: halo,
        scale: { from: 0.85, to: 1.15 },
        alpha: { from: 0.7, to: 1 },
        duration: 800,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });

    // --- Emblème spécifique au type de consommable ---
    const emb = scene.add.graphics();
    _peindreEmblemeSelonType(emb, consommableId, couleur);
    container.add(emb);

    // --- Flottement vertical (le contenu, pas le container, pour ne pas
    //     décaler la position de référence) ---
    scene.tweens.add({
        targets: [halo, emb],
        y: -3,
        duration: 1100,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });

    return container;
}

/**
 * Joue l'animation de ramassage : zoom out + fade en filant vers le joueur.
 */
export function jouerRamassageConsommable(scene, container, cible, onComplete) {
    if (!container?.active) {
        onComplete?.();
        return;
    }
    scene.tweens.add({
        targets: container,
        x: cible.x,
        y: cible.y,
        scale: 0.3,
        alpha: 0,
        duration: 320,
        ease: 'Cubic.In',
        onComplete: () => {
            container.destroy();
            onComplete?.();
        }
    });
}

// ============================================================
// Emblèmes par type (formes vectorielles dédiées)
// ============================================================
function _peindreEmblemeSelonType(g, id, couleur) {
    if (id === 'larme_vestige') {
        // Goutte d'eau (pointu en haut, rond en bas)
        g.fillStyle(0x000000, 0.4);
        g.beginPath();
        g.moveTo(1, -7);
        g.lineTo(6, 4); g.lineTo(0, 7); g.lineTo(-4, 4);
        g.closePath();
        g.fillPath();
        g.fillStyle(couleur, 1);
        g.beginPath();
        g.moveTo(0, -8);
        g.lineTo(5, 3); g.lineTo(-1, 6); g.lineTo(-5, 3);
        g.closePath();
        g.fillPath();
        // Reflet brillant
        g.fillStyle(0xffffff, 0.85);
        g.fillCircle(-2, -2, 1.5);
    } else if (id === 'cendre_efface') {
        // Petit nuage (3 cercles superposés)
        g.fillStyle(0x000000, 0.5);
        g.fillCircle(-4, 1, 4);
        g.fillCircle(2, 1, 4);
        g.fillCircle(-1, -2, 4);
        g.fillStyle(couleur, 1);
        g.fillCircle(-4, 0, 3.5);
        g.fillCircle(2, 0, 3.5);
        g.fillCircle(-1, -3, 3.5);
        g.fillStyle(0xa0a0a8, 0.7);
        g.fillCircle(-2, -3, 1.5);
    } else if (id === 'sel_resonance') {
        // Cristal cubique (losange + facette)
        g.fillStyle(0x000000, 0.4);
        g.beginPath();
        g.moveTo(1, -6); g.lineTo(7, 1); g.lineTo(1, 7); g.lineTo(-5, 1);
        g.closePath(); g.fillPath();
        g.fillStyle(couleur, 1);
        g.beginPath();
        g.moveTo(0, -7); g.lineTo(6, 0); g.lineTo(0, 6); g.lineTo(-6, 0);
        g.closePath(); g.fillPath();
        // Facette claire (triangle haut-gauche)
        g.fillStyle(0xffffff, 0.6);
        g.beginPath();
        g.moveTo(0, -7); g.lineTo(-6, 0); g.lineTo(0, 0);
        g.closePath(); g.fillPath();
        // Lignes de facette
        g.lineStyle(1, 0x000000, 0.5);
        g.beginPath();
        g.moveTo(0, -7); g.lineTo(0, 6);
        g.moveTo(-6, 0); g.lineTo(6, 0);
        g.strokePath();
    } else if (id === 'oeil_verre') {
        // Œil rond avec iris
        g.fillStyle(0x000000, 0.4);
        g.fillCircle(1, 1, 7);
        g.fillStyle(couleur, 1);
        g.fillCircle(0, 0, 7);
        // Iris (cercle bleu profond)
        g.fillStyle(0x2a4060, 1);
        g.fillCircle(0, 0, 4);
        // Pupille
        g.fillStyle(0x000000, 1);
        g.fillCircle(0, 0, 2);
        // Reflet
        g.fillStyle(0xffffff, 0.9);
        g.fillCircle(-1.5, -1.5, 1.2);
    } else if (id === 'pierre_ancrage') {
        // Forme angulaire massive (pierre brute)
        g.fillStyle(0x000000, 0.4);
        g.beginPath();
        g.moveTo(-4, -4); g.lineTo(5, -5); g.lineTo(7, 3); g.lineTo(1, 7); g.lineTo(-5, 4);
        g.closePath(); g.fillPath();
        g.fillStyle(couleur, 1);
        g.beginPath();
        g.moveTo(-5, -5); g.lineTo(4, -6); g.lineTo(6, 2); g.lineTo(0, 6); g.lineTo(-6, 3);
        g.closePath(); g.fillPath();
        // Facette claire (face supérieure)
        g.fillStyle(0xc8b89a, 0.6);
        g.beginPath();
        g.moveTo(-5, -5); g.lineTo(4, -6); g.lineTo(2, -2); g.lineTo(-3, -1);
        g.closePath(); g.fillPath();
    } else if (id === 'encre_temoin') {
        // Flacon noir
        g.fillStyle(0x000000, 0.5);
        // Goulot
        g.fillRect(-2, -7, 4, 3);
        // Corps (forme légèrement arrondie)
        g.beginPath();
        g.moveTo(-4, -4); g.lineTo(4, -4); g.lineTo(5, 4); g.lineTo(-5, 4);
        g.closePath(); g.fillPath();
        g.fillStyle(couleur, 1);
        g.fillRect(-2, -7, 4, 3);
        g.beginPath();
        g.moveTo(-4, -4); g.lineTo(4, -4); g.lineTo(5, 4); g.lineTo(-5, 4);
        g.closePath(); g.fillPath();
        // Bouchon doré
        g.fillStyle(0xc8a85a, 1);
        g.fillRect(-3, -8, 6, 2);
        // Reflet vertical sur le flacon
        g.fillStyle(0x4a4060, 0.5);
        g.fillRect(-3, -3, 1.5, 6);
    } else {
        // Fallback : cercle simple
        g.fillStyle(couleur, 1);
        g.fillCircle(0, 0, 6);
    }
}
