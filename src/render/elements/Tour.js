// Élément Tour — structure verticale élancée.
// Présent : sommet brisé, fissures
// Miroir  : créneaux dorés, drapeau ondulant au sommet

import { DEPTH } from '../PainterlyRenderer.js';

export function peindreTour(scene, x, yBase, hauteur, monde, palette, opts = {}) {
    const g = scene.add.graphics({ x, y: yBase });
    const enMiroir = monde === 'miroir';

    if (opts.silhouette) {
        g.setDepth(DEPTH.SILHOUETTES);
        g.setAlpha(0.45);
    } else {
        g.setDepth(DEPTH.DECOR_ARRIERE);
    }

    const largeurBase = 32;
    const largeurSommet = 26;

    if (!enMiroir) {
        // === PRÉSENT — tour brisée ===
        const hReelle = hauteur * (0.6 + Math.random() * 0.2);

        // Fût trapézoïdal (s'affine légèrement vers le haut)
        g.fillStyle(palette.pierreSombre);
        g.beginPath();
        g.moveTo(-largeurBase / 2 - 1, 0);
        g.lineTo(-largeurSommet / 2, -hReelle);
        g.lineTo(largeurSommet / 2, -hReelle);
        g.lineTo(largeurBase / 2 + 1, 0);
        g.closePath();
        g.fillPath();
        g.fillStyle(palette.plateforme);
        g.beginPath();
        g.moveTo(-largeurBase / 2 + 2, 0);
        g.lineTo(-largeurSommet / 2 + 1, -hReelle);
        g.lineTo(largeurSommet / 2 - 1, -hReelle);
        g.lineTo(largeurBase / 2 - 2, 0);
        g.closePath();
        g.fillPath();
        g.fillStyle(palette.pierreClaire, 0.3);
        g.fillRect(-largeurBase / 2 + 2, -hReelle, 4, hReelle);

        // Quelques fenêtres-meurtrières aveugles
        g.fillStyle(0x000000, 0.7);
        for (let i = 1; i <= 3; i++) {
            const yF = -hReelle * (i / 4);
            g.fillRect(-3, yF - 5, 6, 10);
        }

        // Sommet brisé (forme dentée)
        g.fillStyle(palette.pierreSombre);
        g.beginPath();
        g.moveTo(-largeurSommet / 2, -hReelle);
        g.lineTo(-largeurSommet / 2 + 4, -hReelle - 6);
        g.lineTo(0, -hReelle + 1);
        g.lineTo(largeurSommet / 2 - 2, -hReelle - 8);
        g.lineTo(largeurSommet / 2, -hReelle);
        g.closePath();
        g.fillPath();

        // Fissures
        g.lineStyle(1, palette.pierreSombre, 0.6);
        g.beginPath();
        g.moveTo(3, -hReelle * 0.8);
        g.lineTo(-2, -hReelle * 0.4);
        g.lineTo(4, 0);
        g.strokePath();
    } else {
        // === MIROIR — tour intacte avec créneaux et drapeau ===
        // Fût
        g.fillStyle(palette.pierreSombre);
        g.beginPath();
        g.moveTo(-largeurBase / 2 - 1, 0);
        g.lineTo(-largeurSommet / 2, -hauteur);
        g.lineTo(largeurSommet / 2, -hauteur);
        g.lineTo(largeurBase / 2 + 1, 0);
        g.closePath();
        g.fillPath();
        g.fillStyle(palette.pierre);
        g.beginPath();
        g.moveTo(-largeurBase / 2 + 2, 0);
        g.lineTo(-largeurSommet / 2 + 1, -hauteur);
        g.lineTo(largeurSommet / 2 - 1, -hauteur);
        g.lineTo(largeurBase / 2 - 2, 0);
        g.closePath();
        g.fillPath();
        g.fillStyle(palette.pierreClaire, 0.4);
        g.fillRect(-largeurBase / 2 + 2, -hauteur, 5, hauteur);

        // Bandes ornementales (anneaux dorés)
        for (let i = 1; i <= 3; i++) {
            const yA = -hauteur * (i / 4);
            g.fillStyle(palette.accent, 0.7);
            g.fillRect(-largeurSommet / 2 - 1, yA, largeurSommet + 2, 2);
        }

        // Fenêtres allumées
        g.fillStyle(palette.flamme, 0.85);
        for (let i = 1; i <= 3; i++) {
            const yF = -hauteur * (i / 4) - 12;
            g.fillRect(-3, yF, 6, 10);
        }

        // Créneaux au sommet
        const cren = 4;
        g.fillStyle(palette.pierreSombre);
        for (let i = -2; i <= 2; i++) {
            g.fillRect(i * 6 - 2, -hauteur - cren, 4, cren);
        }
        g.fillStyle(palette.pierre);
        g.fillRect(-largeurSommet / 2 - 2, -hauteur - 2, largeurSommet + 4, 4);

        // Mât + drapeau (qu'on anime ensuite si non-silhouette)
        g.fillStyle(palette.pierreSombre);
        g.fillRect(-1, -hauteur - cren - 22, 2, 22);

        if (!opts.silhouette) {
            // Drapeau séparé pour pouvoir l'animer
            const drapeau = scene.add.graphics({ x: x + 1, y: yBase - hauteur - cren - 20 });
            drapeau.setDepth(DEPTH.DECOR_ARRIERE);
            drapeau.fillStyle(palette.drape);
            drapeau.beginPath();
            drapeau.moveTo(0, 0);
            drapeau.lineTo(14, 4);
            drapeau.lineTo(0, 8);
            drapeau.closePath();
            drapeau.fillPath();
            // Petite ondulation
            scene.tweens.add({
                targets: drapeau,
                scaleX: { from: 1, to: 0.85 },
                duration: 900,
                ease: 'Sine.InOut',
                yoyo: true,
                repeat: -1
            });
        }
    }

    return g;
}
