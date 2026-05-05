// Élément Colonne — primitive architecturale.
// Brisée en Présent (tronquée, fissurée, mousse), intacte en Miroir (ornée, chapiteau).

import { DEPTH, fissure } from '../PainterlyRenderer.js';

/**
 * Peint une colonne à la position (x, yBase). yBase = pied de la colonne (sol).
 * @param {Phaser.Scene} scene
 * @param {number} x
 * @param {number} yBase
 * @param {number} hauteur — hauteur "complète" de la colonne (réduite si Présent)
 * @param {string} monde — 'normal' ou 'miroir'
 * @param {Object} palette
 */
export function peindreColonne(scene, x, yBase, hauteur, monde, palette) {
    const g = scene.add.graphics({ x, y: yBase });
    g.setDepth(DEPTH.DECOR_ARRIERE);

    const enMiroir = monde === 'miroir';

    if (!enMiroir) {
        // === PRÉSENT — colonne brisée ===
        const hReelle = hauteur * (0.55 + Math.random() * 0.25); // hauteur tronquée variable

        // Fût : ombre puis pierre principale puis highlight
        g.fillStyle(palette.pierreSombre);
        g.fillRect(-13, -hReelle, 26, hReelle);
        g.fillStyle(palette.plateforme);
        g.fillRect(-11, -hReelle, 22, hReelle);
        g.fillStyle(palette.pierreClaire, 0.5);
        g.fillRect(-9, -hReelle, 4, hReelle);

        // Sommet brisé (forme dentée irrégulière)
        g.fillStyle(palette.pierreSombre);
        g.beginPath();
        g.moveTo(-13, -hReelle);
        g.lineTo(-9, -hReelle - 4);
        g.lineTo(-2, -hReelle + 1);
        g.lineTo(4, -hReelle - 6);
        g.lineTo(9, -hReelle - 2);
        g.lineTo(13, -hReelle);
        g.closePath();
        g.fillPath();

        // Fissure verticale
        fissure(g, 2, -hReelle + 5, 0, -2, palette.pierreSombre, 0.7, 6);

        // Mousse pourpre à la base
        g.fillStyle(palette.racine, 0.65);
        g.fillCircle(-9, -3, 5);
        g.fillCircle(7, -1, 4);
        g.fillCircle(-2, -2, 3);

        // Quelques pierres tombées au pied
        g.fillStyle(palette.pierre, 0.7);
        g.fillCircle(-17, -2, 3);
        g.fillCircle(20, -3, 2.5);
        g.fillStyle(palette.pierreSombre, 0.7);
        g.fillCircle(-15, -1, 2);
    } else {
        // === MIROIR — colonne intacte et ornée ===
        const hReelle = hauteur;

        // Base ornée (élargissement)
        g.fillStyle(palette.pierreSombre);
        g.fillRect(-17, -10, 34, 10);
        g.fillStyle(palette.accent);
        g.fillRect(-16, -9, 32, 2); // anneau doré
        g.fillStyle(palette.pierre);
        g.fillRect(-15, -7, 30, 7);

        // Fût avec dégradé simulé (3 couches verticales)
        g.fillStyle(palette.pierreSombre);
        g.fillRect(-13, -hReelle, 26, hReelle - 10);
        g.fillStyle(palette.pierre);
        g.fillRect(-11, -hReelle, 22, hReelle - 10);
        g.fillStyle(palette.pierreClaire, 0.5);
        g.fillRect(-10, -hReelle, 5, hReelle - 10);

        // Cannelures verticales (lignes gravées)
        g.lineStyle(1, palette.pierreSombre, 0.5);
        for (let i = -8; i <= 8; i += 4) {
            g.beginPath();
            g.moveTo(i, -hReelle + 4);
            g.lineTo(i, -14);
            g.strokePath();
        }

        // Chapiteau (élargissement en haut)
        g.fillStyle(palette.pierreSombre);
        g.fillRect(-17, -hReelle - 6, 34, 6);
        g.fillStyle(palette.accent);
        g.fillRect(-16, -hReelle - 6, 32, 1);
        g.fillRect(-16, -hReelle - 2, 32, 1);
        g.fillStyle(palette.pierre);
        g.fillRect(-15, -hReelle - 4, 30, 4);
    }

    return g;
}
