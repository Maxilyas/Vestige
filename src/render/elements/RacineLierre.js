// Élément Racine / Lierre — végétation pourpre/verte qui anime les structures.
// Présent : racines pourpres descendant de manière chaotique
// Miroir  : lierre vert/doré ascendant avec petites fleurs

import { DEPTH } from '../PainterlyRenderer.js';

/**
 * Trace une courbe organique (racine ou lierre) avec embranchements.
 * @param {number} xBase, yBase — point d'origine
 * @param {number} dx, dy — direction principale (vers où va la courbe)
 * @param {number} longueur
 */
export function peindreRacine(scene, xBase, yBase, dx, dy, longueur, monde, palette) {
    const g = scene.add.graphics({ x: xBase, y: yBase });
    // Présent → racines en arrière (DECOR_ARRIERE), Miroir → lierre devant
    g.setDepth(monde === 'miroir' ? DEPTH.DECOR_AVANT : DEPTH.DECOR_ARRIERE);

    const enMiroir = monde === 'miroir';
    const couleur = enMiroir ? palette.mousse : palette.racine;
    const couleurAccent = enMiroir ? palette.accent : palette.pierreClaire;

    // Tronc principal — courbe brisée pour effet organique
    g.lineStyle(3, couleur, 0.85);
    let x = 0, y = 0;
    g.beginPath();
    g.moveTo(x, y);
    const nbSegments = Math.max(4, Math.floor(longueur / 18));
    const dxParSeg = (dx * longueur) / nbSegments;
    const dyParSeg = (dy * longueur) / nbSegments;
    for (let i = 1; i <= nbSegments; i++) {
        x += dxParSeg + (Math.random() - 0.5) * 8;
        y += dyParSeg + (Math.random() - 0.5) * 8;
        g.lineTo(x, y);
    }
    g.strokePath();

    // Embranchements (3-4 petites racines secondaires)
    const nbBranches = 3 + Math.floor(Math.random() * 2);
    g.lineStyle(2, couleur, 0.7);
    for (let b = 0; b < nbBranches; b++) {
        const tParent = 0.3 + Math.random() * 0.6;
        const xb = dx * longueur * tParent + (Math.random() - 0.5) * 6;
        const yb = dy * longueur * tParent + (Math.random() - 0.5) * 6;
        const angleRel = (Math.random() - 0.5) * 1.4;
        const longueurB = longueur * (0.2 + Math.random() * 0.25);
        const cosA = Math.cos(angleRel);
        const sinA = Math.sin(angleRel);
        const dxBranch = dx * cosA - dy * sinA;
        const dyBranch = dx * sinA + dy * cosA;
        g.beginPath();
        g.moveTo(xb, yb);
        g.lineTo(xb + dxBranch * longueurB, yb + dyBranch * longueurB);
        g.strokePath();
    }

    // Petites feuilles / fleurs aux extrémités (Miroir uniquement, accent visuel)
    if (enMiroir) {
        g.fillStyle(couleurAccent, 0.85);
        for (let i = 0; i < 5; i++) {
            const t = 0.4 + Math.random() * 0.55;
            const fx = dx * longueur * t + (Math.random() - 0.5) * 12;
            const fy = dy * longueur * t + (Math.random() - 0.5) * 12;
            g.fillCircle(fx, fy, 2);
        }
    }

    return g;
}
