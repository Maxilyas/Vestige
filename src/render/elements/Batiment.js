// Élément Bâtiment — édifice à étages avec fenêtres.
// Présent : murs effondrés, fenêtres aveugles, lierre dévorant
// Miroir  : intact, fenêtres allumées (avec clignotement subtil), toit en tuiles, drapeau

import { DEPTH } from '../PainterlyRenderer.js';

/**
 * @param {Object} opts.silhouette  si true, dessine en arrière-plan flou (depth=-50, alpha=0.5)
 */
export function peindreBatiment(scene, x, yBase, hauteur, largeur, monde, palette, opts = {}) {
    const g = scene.add.graphics({ x, y: yBase });
    const enMiroir = monde === 'miroir';

    if (opts.silhouette) {
        g.setDepth(DEPTH.SILHOUETTES);
        g.setAlpha(0.45);
    } else {
        g.setDepth(DEPTH.DECOR_ARRIERE);
    }

    const lwHalf = largeur / 2;
    const nbEtages = Math.max(2, Math.floor(hauteur / 70));
    const hEtage = hauteur / nbEtages;

    if (!enMiroir) {
        // === PRÉSENT — bâtiment effondré ===
        const hReelle = hauteur * (0.55 + Math.random() * 0.3);

        // Mur principal (ombre + fond)
        g.fillStyle(palette.pierreSombre);
        g.fillRect(-lwHalf - 2, -hReelle, largeur + 4, hReelle);
        g.fillStyle(palette.plateforme);
        g.fillRect(-lwHalf, -hReelle, largeur, hReelle);
        g.fillStyle(palette.pierreClaire, 0.3);
        g.fillRect(-lwHalf, -hReelle, 6, hReelle);

        // Fenêtres aveugles (rectangles très sombres, certaines manquantes)
        const fenLargeur = 12;
        const fenHauteur = 18;
        for (let etg = 0; etg < nbEtages; etg++) {
            const yEtg = -hEtage * (etg + 0.5);
            const nbFenetres = Math.max(2, Math.floor(largeur / 30));
            for (let f = 0; f < nbFenetres; f++) {
                if (Math.random() < 0.3) continue; // fenêtres manquantes
                const xFen = -lwHalf + (f + 0.5) * (largeur / nbFenetres);
                g.fillStyle(0x000000, 0.85);
                g.fillRect(xFen - fenLargeur / 2, yEtg - fenHauteur / 2, fenLargeur, fenHauteur);
            }
        }

        // Sommet effondré (ligne brisée irrégulière)
        g.fillStyle(palette.pierreSombre);
        g.beginPath();
        g.moveTo(-lwHalf, -hReelle);
        const segs = 6;
        for (let i = 1; i <= segs; i++) {
            const sx = -lwHalf + (largeur * i / segs);
            const sy = -hReelle + (Math.random() - 0.5) * 24 - 8;
            g.lineTo(sx, sy);
        }
        g.lineTo(lwHalf, -hReelle);
        g.closePath();
        g.fillPath();

        // Lierre/racine pourpre qui dévore le mur
        g.fillStyle(palette.racine, 0.5);
        for (let i = 0; i < 4; i++) {
            g.fillCircle(-lwHalf + Math.random() * largeur, -Math.random() * hReelle * 0.7, 4 + Math.random() * 4);
        }
        // Pierres tombées au pied
        if (!opts.silhouette) {
            g.fillStyle(palette.pierre, 0.7);
            g.fillCircle(-lwHalf - 8, -3, 4);
            g.fillCircle(lwHalf + 5, -2, 3);
        }
    } else {
        // === MIROIR — bâtiment intact ===
        // Mur (ombre + fond + highlight)
        g.fillStyle(palette.pierreSombre);
        g.fillRect(-lwHalf - 2, -hauteur, largeur + 4, hauteur);
        g.fillStyle(palette.pierre);
        g.fillRect(-lwHalf, -hauteur, largeur, hauteur);
        g.fillStyle(palette.pierreClaire, 0.35);
        g.fillRect(-lwHalf, -hauteur, 8, hauteur);

        // Fenêtres allumées
        const fenLargeur = 12;
        const fenHauteur = 18;
        for (let etg = 0; etg < nbEtages; etg++) {
            const yEtg = -hEtage * (etg + 0.5);
            const nbFenetres = Math.max(2, Math.floor(largeur / 30));
            for (let f = 0; f < nbFenetres; f++) {
                const xFen = -lwHalf + (f + 0.5) * (largeur / nbFenetres);
                // Cadre sombre
                g.fillStyle(palette.pierreSombre);
                g.fillRect(xFen - fenLargeur / 2 - 1, yEtg - fenHauteur / 2 - 1, fenLargeur + 2, fenHauteur + 2);
                // Lumière chaude
                g.fillStyle(palette.flamme, 0.85);
                g.fillRect(xFen - fenLargeur / 2, yEtg - fenHauteur / 2, fenLargeur, fenHauteur);

                // Animation subtile : clignotement aléatoire
                if (!opts.silhouette && Math.random() < 0.4) {
                    const fenetre = scene.add.rectangle(
                        x + xFen, yBase + yEtg,
                        fenLargeur, fenHauteur,
                        palette.flamme, 0.5
                    );
                    fenetre.setDepth(DEPTH.DECOR_ARRIERE + 1);
                    scene.tweens.add({
                        targets: fenetre,
                        alpha: { from: 0.2, to: 0.6 },
                        duration: 1500 + Math.random() * 2000,
                        yoyo: true,
                        repeat: -1,
                        delay: Math.random() * 1000
                    });
                }
            }
        }

        // Toit en pente (triangle sombre)
        const hToit = 24;
        g.fillStyle(palette.pierreSombre);
        g.beginPath();
        g.moveTo(-lwHalf - 4, -hauteur);
        g.lineTo(0, -hauteur - hToit);
        g.lineTo(lwHalf + 4, -hauteur);
        g.closePath();
        g.fillPath();
        g.fillStyle(palette.drape);
        g.beginPath();
        g.moveTo(-lwHalf, -hauteur);
        g.lineTo(0, -hauteur - hToit + 2);
        g.lineTo(lwHalf, -hauteur);
        g.closePath();
        g.fillPath();

        // Petit drapeau au sommet (Miroir non silhouette uniquement)
        if (!opts.silhouette) {
            g.fillStyle(palette.accent);
            g.fillRect(-1, -hauteur - hToit - 12, 2, 12);
            g.fillStyle(palette.flamme);
            g.beginPath();
            g.moveTo(0, -hauteur - hToit - 12);
            g.lineTo(8, -hauteur - hToit - 9);
            g.lineTo(0, -hauteur - hToit - 6);
            g.closePath();
            g.fillPath();
        }
    }

    return g;
}
