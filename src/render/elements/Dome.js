// Élément Dôme / Coupole — structure de temple ou sanctuaire.
// Présent : cassé en deux, dalles tombées
// Miroir  : doré, vitraux brillants

import { DEPTH } from '../PainterlyRenderer.js';

export function peindreDome(scene, x, yBase, rayon, monde, palette, opts = {}) {
    const g = scene.add.graphics({ x, y: yBase });
    const enMiroir = monde === 'miroir';

    if (opts.silhouette) {
        g.setDepth(DEPTH.SILHOUETTES);
        g.setAlpha(0.5);
    } else {
        g.setDepth(DEPTH.DECOR_ARRIERE);
    }

    // Tambour (base cylindrique sous le dôme)
    const hTambour = rayon * 0.4;
    g.fillStyle(palette.pierreSombre);
    g.fillRect(-rayon - 1, -hTambour, rayon * 2 + 2, hTambour);
    g.fillStyle(palette.pierre);
    g.fillRect(-rayon, -hTambour, rayon * 2, hTambour);
    g.fillStyle(palette.pierreClaire, 0.35);
    g.fillRect(-rayon, -hTambour, 6, hTambour);

    if (!enMiroir) {
        // === PRÉSENT — dôme cassé en deux ===
        // Demi-coupole gauche, l'autre moitié manquante
        g.fillStyle(palette.pierreSombre);
        g.beginPath();
        g.arc(0, -hTambour, rayon + 1, Math.PI, Math.PI * 1.5, false);
        g.lineTo(0, -hTambour);
        g.closePath();
        g.fillPath();
        g.fillStyle(palette.plateforme);
        g.beginPath();
        g.arc(0, -hTambour, rayon, Math.PI, Math.PI * 1.5, false);
        g.lineTo(0, -hTambour);
        g.closePath();
        g.fillPath();

        // Bord brisé en zigzag (à l'endroit où l'autre moitié manque)
        g.fillStyle(palette.pierreSombre);
        g.beginPath();
        g.moveTo(0, -hTambour);
        g.lineTo(2, -hTambour - rayon * 0.4);
        g.lineTo(-3, -hTambour - rayon * 0.55);
        g.lineTo(4, -hTambour - rayon * 0.75);
        g.lineTo(-2, -hTambour - rayon * 0.85);
        g.lineTo(0, -hTambour - rayon);
        g.lineTo(0, -hTambour);
        g.closePath();
        g.fillPath();

        // Pierres tombées au sol
        if (!opts.silhouette) {
            g.fillStyle(palette.pierre, 0.7);
            g.fillCircle(rayon * 0.5, -3, 5);
            g.fillCircle(rayon * 0.7, -2, 3);
            g.fillCircle(rayon * 0.3, -2, 4);
        }

        // Lierre pourpre sur la coupole restante
        g.fillStyle(palette.racine, 0.55);
        g.fillCircle(-rayon * 0.7, -hTambour - rayon * 0.3, 5);
        g.fillCircle(-rayon * 0.4, -hTambour - rayon * 0.6, 4);
    } else {
        // === MIROIR — dôme intact doré avec vitraux ===
        // Coupole pleine
        g.fillStyle(palette.pierreSombre);
        g.beginPath();
        g.arc(0, -hTambour, rayon + 1, Math.PI, 0, false);
        g.closePath();
        g.fillPath();
        g.fillStyle(palette.pierre);
        g.beginPath();
        g.arc(0, -hTambour, rayon, Math.PI, 0, false);
        g.closePath();
        g.fillPath();

        // Bandes dorées (méridiens)
        g.lineStyle(2, palette.accent, 0.85);
        for (let a = 0.2; a <= 0.8; a += 0.2) {
            g.beginPath();
            const angle = Math.PI + Math.PI * a;
            g.moveTo(rayon * Math.cos(angle), -hTambour + rayon * Math.sin(angle));
            g.lineTo(0, -hTambour - rayon * 0.95);
            g.strokePath();
        }

        // Anneau doré à la base
        g.fillStyle(palette.accent);
        g.fillRect(-rayon - 1, -hTambour - 2, rayon * 2 + 2, 3);

        // Vitraux (3 fenêtres rondes lumineuses dans le tambour)
        for (let i = -1; i <= 1; i++) {
            const xV = i * rayon * 0.55;
            g.fillStyle(palette.pierreSombre);
            g.fillCircle(xV, -hTambour * 0.5, 6);
            g.fillStyle(palette.flamme, 0.9);
            g.fillCircle(xV, -hTambour * 0.5, 5);
        }

        // Pinacle au sommet
        if (!opts.silhouette) {
            g.fillStyle(palette.accent);
            g.fillRect(-1, -hTambour - rayon - 8, 2, 8);
            g.fillCircle(0, -hTambour - rayon - 10, 2.5);
        }
    }

    return g;
}
