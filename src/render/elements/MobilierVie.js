// MobilierVie — petits éléments du quotidien (tonneau, caisse, pot de fleurs).
// Présent : versions dégradées (pourri, brisé, abandonné)
// Miroir  : intacts, parfois empilés, signe d'activité

import { DEPTH } from '../PainterlyRenderer.js';

export function peindreTonneau(scene, x, yBase, monde, palette) {
    const g = scene.add.graphics({ x, y: yBase });
    g.setDepth(DEPTH.DECOR_AVANT);
    const enMiroir = monde === 'miroir';

    const w = 18, h = 22;
    g.fillStyle(palette.pierreSombre);
    g.fillRect(-w / 2 - 1, -h, w + 2, h);

    if (!enMiroir) {
        // Tonneau pourri : couleur fanée, planches manquantes
        g.fillStyle(palette.plateforme);
        g.fillRect(-w / 2, -h + 2, w, h - 2);
        // Cerclages cassés
        g.lineStyle(1, palette.pierreSombre, 0.7);
        g.beginPath();
        g.moveTo(-w / 2, -h + 4);
        g.lineTo(-2, -h + 4);
        g.strokePath();
        g.beginPath();
        g.moveTo(2, -4);
        g.lineTo(w / 2, -4);
        g.strokePath();
        // Trou (planche manquante)
        g.fillStyle(0x000000, 0.8);
        g.fillRect(-3, -h + 6, 4, 8);
    } else {
        // Tonneau intact, cerclé d'or
        g.fillStyle(palette.pierre);
        g.fillRect(-w / 2, -h, w, h);
        g.fillStyle(palette.pierreClaire, 0.4);
        g.fillRect(-w / 2 + 1, -h, 4, h);
        // Cerclages dorés
        g.fillStyle(palette.accent);
        g.fillRect(-w / 2 - 1, -h + 3, w + 2, 2);
        g.fillRect(-w / 2 - 1, -4, w + 2, 2);
    }
    return g;
}

export function peindreCaisse(scene, x, yBase, monde, palette) {
    const g = scene.add.graphics({ x, y: yBase });
    g.setDepth(DEPTH.DECOR_AVANT);
    const enMiroir = monde === 'miroir';

    const w = 22, h = 18;
    g.fillStyle(palette.pierreSombre);
    g.fillRect(-w / 2 - 1, -h, w + 2, h);

    if (!enMiroir) {
        g.fillStyle(palette.plateforme);
        g.fillRect(-w / 2, -h, w, h);
        // Planches gauchies
        g.lineStyle(1, palette.pierreSombre, 0.6);
        g.beginPath();
        g.moveTo(-w / 2, -h + 5);
        g.lineTo(w / 2, -h + 7);
        g.strokePath();
        g.beginPath();
        g.moveTo(-w / 2, -h + 12);
        g.lineTo(w / 2, -h + 11);
        g.strokePath();
        // Lierre dessus
        g.fillStyle(palette.racine, 0.6);
        g.fillCircle(-3, -h + 1, 2);
        g.fillCircle(5, -h - 1, 2);
    } else {
        g.fillStyle(palette.pierre);
        g.fillRect(-w / 2, -h, w, h);
        // Planches saines
        g.lineStyle(1, palette.pierreSombre, 0.5);
        for (let i = 1; i < 4; i++) {
            const yL = -h + i * (h / 4);
            g.beginPath();
            g.moveTo(-w / 2, yL);
            g.lineTo(w / 2, yL);
            g.strokePath();
        }
        // Marque dorée (estampille)
        g.fillStyle(palette.accent);
        g.fillCircle(0, -h / 2, 3);
    }
    return g;
}

export function peindrePotFleurs(scene, x, yBase, monde, palette) {
    const g = scene.add.graphics({ x, y: yBase });
    g.setDepth(DEPTH.DECOR_AVANT);
    const enMiroir = monde === 'miroir';

    const w = 14, h = 12;
    // Pot
    g.fillStyle(palette.pierreSombre);
    g.beginPath();
    g.moveTo(-w / 2, -h);
    g.lineTo(-w / 2 + 2, 0);
    g.lineTo(w / 2 - 2, 0);
    g.lineTo(w / 2, -h);
    g.closePath();
    g.fillPath();
    g.fillStyle(enMiroir ? palette.drape : palette.plateforme);
    g.beginPath();
    g.moveTo(-w / 2 + 1, -h + 1);
    g.lineTo(-w / 2 + 3, -1);
    g.lineTo(w / 2 - 3, -1);
    g.lineTo(w / 2 - 1, -h + 1);
    g.closePath();
    g.fillPath();

    if (!enMiroir) {
        // Pot vide / cassé : terre à nu
        g.fillStyle(palette.pierreSombre, 0.8);
        g.fillRect(-w / 2 + 2, -h, w - 4, 3);
        g.fillStyle(palette.racine, 0.5);
        g.fillCircle(-2, -h - 2, 2);
    } else {
        // Pot avec petite plante / fleur
        g.fillStyle(palette.mousse);
        g.fillCircle(-3, -h, 3);
        g.fillCircle(2, -h - 1, 3);
        g.fillStyle(palette.accent);
        g.fillCircle(0, -h - 4, 2);
        g.fillCircle(-3, -h - 5, 1.5);
        g.fillCircle(3, -h - 6, 1.5);
    }
    return g;
}

export function peindreEtalMarchand(scene, x, yBase, monde, palette) {
    const g = scene.add.graphics({ x, y: yBase });
    g.setDepth(DEPTH.DECOR_AVANT);
    const enMiroir = monde === 'miroir';

    const w = 50, h = 28;
    if (!enMiroir) {
        // Étal effondré : planches éparses
        g.fillStyle(palette.pierreSombre, 0.85);
        g.fillRect(-w / 2 - 5, -3, 18, 3);
        g.fillRect(0, -2, 22, 2);
        g.fillRect(-15, -5, 4, 5);
        // Lierre
        g.fillStyle(palette.racine, 0.6);
        g.fillCircle(-12, -2, 3);
        g.fillCircle(8, -2, 2);
    } else {
        // Étal monté avec auvent
        // Pieds
        g.fillStyle(palette.pierreSombre);
        g.fillRect(-w / 2, -h * 0.5, 4, h * 0.5);
        g.fillRect(w / 2 - 4, -h * 0.5, 4, h * 0.5);
        // Comptoir
        g.fillStyle(palette.pierre);
        g.fillRect(-w / 2 - 2, -h * 0.6, w + 4, 6);
        g.fillStyle(palette.accent, 0.8);
        g.fillRect(-w / 2 - 2, -h * 0.6, w + 4, 2);
        // Auvent (toile pourpre)
        g.fillStyle(palette.drape);
        g.beginPath();
        g.moveTo(-w / 2 - 4, -h);
        g.lineTo(w / 2 + 4, -h);
        g.lineTo(w / 2, -h * 0.7);
        g.lineTo(-w / 2, -h * 0.7);
        g.closePath();
        g.fillPath();
        // Bandes blanches (rayures)
        g.fillStyle(palette.pierreClaire, 0.5);
        g.fillRect(-w / 4, -h, 4, h * 0.3);
        g.fillRect(w / 4 - 4, -h, 4, h * 0.3);
        // Marchandises sur le comptoir (3 cubes colorés)
        g.fillStyle(palette.flamme);
        g.fillRect(-w / 2 + 4, -h * 0.6 - 4, 4, 4);
        g.fillStyle(palette.accent);
        g.fillRect(-4, -h * 0.6 - 5, 5, 5);
        g.fillStyle(palette.drape);
        g.fillRect(w / 2 - 10, -h * 0.6 - 4, 4, 4);
    }
    return g;
}
