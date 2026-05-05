// Élément Statue — primitive architecturale.
// Décapitée et érodée en Présent, intacte avec couronne dorée en Miroir.

import { DEPTH, fissure } from '../PainterlyRenderer.js';

/**
 * Peint une statue stylisée à la position (x, yBase).
 */
export function peindreStatue(scene, x, yBase, hauteur, monde, palette) {
    const g = scene.add.graphics({ x, y: yBase });
    g.setDepth(DEPTH.DECOR_ARRIERE);

    const enMiroir = monde === 'miroir';

    // Socle (commun, plus bas en Présent)
    g.fillStyle(palette.pierreSombre);
    g.fillRect(-22, -16, 44, 16);
    g.fillStyle(palette.pierre);
    g.fillRect(-20, -15, 40, 14);
    g.fillStyle(palette.pierreClaire, 0.4);
    g.fillRect(-18, -15, 6, 14);

    if (!enMiroir) {
        // === PRÉSENT — statue décapitée ===
        const hCorps = hauteur * 0.5; // tronquée au cou

        // Drapé du corps (forme conique large en bas, étroite en haut)
        g.fillStyle(palette.pierreSombre);
        g.beginPath();
        g.moveTo(-18, -16);
        g.lineTo(-12, -16 - hCorps);
        g.lineTo(12, -16 - hCorps);
        g.lineTo(18, -16);
        g.closePath();
        g.fillPath();
        g.fillStyle(palette.pierre);
        g.beginPath();
        g.moveTo(-16, -16);
        g.lineTo(-10, -16 - hCorps + 2);
        g.lineTo(10, -16 - hCorps + 2);
        g.lineTo(16, -16);
        g.closePath();
        g.fillPath();
        g.fillStyle(palette.pierreClaire, 0.35);
        g.beginPath();
        g.moveTo(-14, -16);
        g.lineTo(-8, -16 - hCorps + 4);
        g.lineTo(-2, -16 - hCorps + 4);
        g.lineTo(-2, -16);
        g.closePath();
        g.fillPath();

        // Sommet brisé (cou cassé)
        g.fillStyle(palette.pierreSombre);
        g.beginPath();
        g.moveTo(-12, -16 - hCorps);
        g.lineTo(-6, -16 - hCorps - 5);
        g.lineTo(2, -16 - hCorps + 1);
        g.lineTo(8, -16 - hCorps - 3);
        g.lineTo(12, -16 - hCorps);
        g.closePath();
        g.fillPath();

        // Fissure verticale dans le drapé
        fissure(g, 0, -16 - hCorps, -2, -16, palette.pierreSombre, 0.6, 5);

        // Mousse pourpre à la base
        g.fillStyle(palette.racine, 0.65);
        g.fillCircle(-15, -3, 4);
        g.fillCircle(14, -2, 4);
        g.fillCircle(0, -1, 3);
    } else {
        // === MIROIR — statue intacte avec tête couronnée ===
        const hCorps = hauteur * 0.55;
        const yTete = -16 - hCorps;
        const rayonTete = 11;

        // Drapé
        g.fillStyle(palette.pierreSombre);
        g.beginPath();
        g.moveTo(-18, -16);
        g.lineTo(-12, yTete);
        g.lineTo(12, yTete);
        g.lineTo(18, -16);
        g.closePath();
        g.fillPath();
        g.fillStyle(palette.pierre);
        g.beginPath();
        g.moveTo(-16, -16);
        g.lineTo(-10, yTete + 2);
        g.lineTo(10, yTete + 2);
        g.lineTo(16, -16);
        g.closePath();
        g.fillPath();
        g.fillStyle(palette.pierreClaire, 0.4);
        g.beginPath();
        g.moveTo(-14, -16);
        g.lineTo(-8, yTete + 4);
        g.lineTo(-2, yTete + 4);
        g.lineTo(-2, -16);
        g.closePath();
        g.fillPath();

        // Drapé doré (ceinture)
        g.fillStyle(palette.accent, 0.7);
        g.fillRect(-16, -16 - hCorps * 0.3, 32, 3);
        g.fillStyle(palette.drape, 0.6);
        g.fillRect(-14, -16 - hCorps * 0.3 + 4, 28, 6);

        // Tête (cercle pierre claire)
        g.fillStyle(palette.pierreSombre);
        g.fillCircle(0, yTete - rayonTete + 2, rayonTete + 1);
        g.fillStyle(palette.pierre);
        g.fillCircle(0, yTete - rayonTete + 2, rayonTete);
        g.fillStyle(palette.pierreClaire, 0.5);
        g.fillCircle(-3, yTete - rayonTete - 1, 4);

        // Couronne dorée (3 pointes)
        g.fillStyle(palette.accent);
        const yC = yTete - rayonTete * 2;
        g.beginPath();
        g.moveTo(-9, yC + 3);
        g.lineTo(-7, yC - 3);
        g.lineTo(-4, yC + 1);
        g.lineTo(0, yC - 5);
        g.lineTo(4, yC + 1);
        g.lineTo(7, yC - 3);
        g.lineTo(9, yC + 3);
        g.closePath();
        g.fillPath();
    }

    return g;
}
