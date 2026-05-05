// Élément Banderole / Drapeau — tissu suspendu entre deux points.
// Présent : déchirée, ternie
// Miroir  : couleur vive (pourpre/dorée), ondulation horizontale

import { DEPTH } from '../PainterlyRenderer.js';

/**
 * Trace une banderole entre les points (x1, y1) et (x2, y2).
 * Le tissu pend entre les deux ancrages avec un creux.
 */
export function peindreBanderole(scene, x1, y1, x2, y2, monde, palette) {
    const enMiroir = monde === 'miroir';
    const g = scene.add.graphics();
    g.setDepth(DEPTH.DECOR_AVANT);

    const couleurFond = enMiroir ? palette.drape : palette.pierreSombre;
    const couleurBord = enMiroir ? palette.accent : palette.plateforme;

    const cx = (x1 + x2) / 2;
    const cy = Math.max(y1, y2) + 12; // creux du tissu

    // Câble (corde tendue entre les ancrages)
    g.lineStyle(1, palette.pierreSombre, 0.85);
    g.beginPath();
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);
    g.strokePath();

    if (!enMiroir) {
        // === PRÉSENT — banderole déchirée ===
        // Quelques lambeaux pendants au lieu d'une bande continue
        const nbLambeaux = 3 + Math.floor(Math.random() * 2);
        for (let i = 0; i < nbLambeaux; i++) {
            const t = (i + 0.5) / nbLambeaux;
            const xL = x1 + (x2 - x1) * t;
            const yL = y1 + (y2 - y1) * t + 1;
            const lLambeau = 6 + Math.random() * 8;
            g.fillStyle(couleurFond, 0.7);
            g.fillRect(xL - 2, yL, 4, lLambeau);
            // Bord déchiré
            g.beginPath();
            g.moveTo(xL - 2, yL + lLambeau);
            g.lineTo(xL, yL + lLambeau + 3);
            g.lineTo(xL + 2, yL + lLambeau);
            g.closePath();
            g.fillPath();
        }
    } else {
        // === MIROIR — banderole intacte ===
        // Tissu en arc descendant (moitié inférieure d'ellipse)
        g.fillStyle(couleurFond);
        g.beginPath();
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);
        g.lineTo(cx + 3, cy + 4);
        g.lineTo(cx - 3, cy + 4);
        g.closePath();
        g.fillPath();

        // Plis verticaux
        g.lineStyle(1, palette.pierreSombre, 0.4);
        for (let i = 1; i <= 3; i++) {
            const t = i / 4;
            const xP = x1 + (x2 - x1) * t;
            const yPHaut = y1 + (y2 - y1) * t;
            const yPBas = cy + 2 - Math.abs(t - 0.5) * 8;
            g.beginPath();
            g.moveTo(xP, yPHaut);
            g.lineTo(xP, yPBas);
            g.strokePath();
        }

        // Liseré doré en bas
        g.lineStyle(1.5, couleurBord, 0.85);
        g.beginPath();
        g.moveTo(x1, y1);
        g.lineTo(cx, cy + 4);
        g.lineTo(x2, y2);
        g.strokePath();

        // Petite ondulation : tween de scaleY pour imiter le vent
        scene.tweens.add({
            targets: g,
            scaleY: { from: 1, to: 1.08 },
            duration: 1300,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
    }

    return g;
}
