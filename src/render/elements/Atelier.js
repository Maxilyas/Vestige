// Élément Atelier / Forge — bâtiment trapu avec cheminée.
// Présent : toit effondré, cheminée fendue
// Miroir  : cheminée fumante (particules), brasero rougeoyant

import { DEPTH } from '../PainterlyRenderer.js';

export function peindreAtelier(scene, x, yBase, hauteur, largeur, monde, palette, opts = {}) {
    const g = scene.add.graphics({ x, y: yBase });
    const enMiroir = monde === 'miroir';

    if (opts.silhouette) {
        g.setDepth(DEPTH.SILHOUETTES);
        g.setAlpha(0.45);
    } else {
        g.setDepth(DEPTH.DECOR_ARRIERE);
    }

    const lwH = largeur / 2;

    if (!enMiroir) {
        // === PRÉSENT — atelier en ruine ===
        const hReelle = hauteur * 0.65;

        // Mur trapu
        g.fillStyle(palette.pierreSombre);
        g.fillRect(-lwH - 1, -hReelle, largeur + 2, hReelle);
        g.fillStyle(palette.plateforme);
        g.fillRect(-lwH, -hReelle, largeur, hReelle);
        g.fillStyle(palette.pierreClaire, 0.3);
        g.fillRect(-lwH, -hReelle, 5, hReelle);

        // Porte béante
        g.fillStyle(0x000000, 0.85);
        g.fillRect(-8, -28, 16, 28);

        // Toit effondré (forme tordue)
        g.fillStyle(palette.pierreSombre);
        g.beginPath();
        g.moveTo(-lwH - 2, -hReelle);
        g.lineTo(-lwH * 0.5, -hReelle - 6);
        g.lineTo(0, -hReelle - 2);
        g.lineTo(lwH * 0.4, -hReelle - 8);
        g.lineTo(lwH + 2, -hReelle);
        g.closePath();
        g.fillPath();

        // Cheminée fendue
        g.fillStyle(palette.pierreSombre);
        g.fillRect(lwH * 0.5 - 6, -hReelle - 22, 12, 22);
        g.fillStyle(palette.plateforme);
        g.fillRect(lwH * 0.5 - 5, -hReelle - 22, 10, 22);
        // Fissure
        g.lineStyle(1, palette.pierreSombre, 0.7);
        g.beginPath();
        g.moveTo(lwH * 0.5 + 1, -hReelle - 22);
        g.lineTo(lwH * 0.5 - 1, -hReelle - 8);
        g.lineTo(lwH * 0.5 + 2, -hReelle);
        g.strokePath();

        // Lierre/racine pourpre
        g.fillStyle(palette.racine, 0.6);
        g.fillCircle(-lwH + 4, -3, 4);
        g.fillCircle(lwH - 2, -2, 3);
        g.fillCircle(-lwH * 0.4, -hReelle * 0.7, 3);

        // Outils rouillés au sol (petits rectangles dispersés)
        if (!opts.silhouette) {
            g.fillStyle(palette.pierreSombre, 0.7);
            g.fillRect(-lwH - 6, -3, 8, 2);
            g.fillRect(lwH + 2, -2, 6, 2);
        }
    } else {
        // === MIROIR — atelier en activité ===
        // Mur
        g.fillStyle(palette.pierreSombre);
        g.fillRect(-lwH - 1, -hauteur, largeur + 2, hauteur);
        g.fillStyle(palette.pierre);
        g.fillRect(-lwH, -hauteur, largeur, hauteur);
        g.fillStyle(palette.pierreClaire, 0.35);
        g.fillRect(-lwH, -hauteur, 6, hauteur);

        // Toit en tuiles
        const hToit = 18;
        g.fillStyle(palette.pierreSombre);
        g.beginPath();
        g.moveTo(-lwH - 4, -hauteur);
        g.lineTo(0, -hauteur - hToit);
        g.lineTo(lwH + 4, -hauteur);
        g.closePath();
        g.fillPath();
        g.fillStyle(palette.drape);
        g.beginPath();
        g.moveTo(-lwH, -hauteur);
        g.lineTo(0, -hauteur - hToit + 2);
        g.lineTo(lwH, -hauteur);
        g.closePath();
        g.fillPath();

        // Porte ouverte avec brasero rougeoyant à l'intérieur
        g.fillStyle(palette.pierreSombre);
        g.fillRect(-9, -32, 18, 32);
        g.fillStyle(palette.flamme, 0.85);
        g.fillRect(-7, -22, 14, 12); // lueur du brasero

        // Cheminée
        g.fillStyle(palette.pierreSombre);
        g.fillRect(lwH * 0.5 - 6, -hauteur - 20, 12, 20);
        g.fillStyle(palette.pierre);
        g.fillRect(lwH * 0.5 - 5, -hauteur - 20, 10, 20);
        g.fillStyle(palette.accent, 0.7);
        g.fillRect(lwH * 0.5 - 6, -hauteur - 20, 12, 2); // ornement haut

        // Fenêtre allumée
        g.fillStyle(palette.pierreSombre);
        g.fillRect(-lwH * 0.5 - 7, -hauteur * 0.5 - 8, 14, 16);
        g.fillStyle(palette.flamme, 0.85);
        g.fillRect(-lwH * 0.5 - 6, -hauteur * 0.5 - 7, 12, 14);

        // Fumée qui sort de la cheminée (particules rapides en local)
        if (!opts.silhouette && scene.textures.exists('_particule')) {
            const fumee = scene.add.particles(x + lwH * 0.5, yBase - hauteur - 18, '_particule', {
                lifespan: 2000,
                speedY: { min: -30, max: -15 },
                speedX: { min: -8, max: 8 },
                scale: { start: 0.4, end: 0 },
                tint: 0xa09080,
                quantity: 1,
                frequency: 220,
                alpha: { start: 0.5, end: 0 }
            });
            fumee.setDepth(DEPTH.DECOR_ARRIERE);
        }
    }

    return g;
}
