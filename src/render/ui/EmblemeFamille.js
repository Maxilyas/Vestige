// EmblemeFamille — symboles vectoriels par famille de loot.
//
//   Blanc → cercle plein avec reflet (perle, pureté du Présent)
//   Bleu  → triangle pointe en haut + chevron intérieur (élévation)
//   Noir  → losange + point central (instabilité du Reflux)
//
// Usage : peindreEmblemeFamille(scene, x, y, famille, taille)
// Retourne un Graphics (à ajouter à un Container ou positionné directement).

import { COULEURS_FAMILLE } from '../../data/items.js';

export function peindreEmblemeFamille(scene, x, y, famille, taille = 18) {
    const g = scene.add.graphics({ x, y });
    const couleur = COULEURS_FAMILLE[famille] ?? 0xc8c8c8;
    const r = taille / 2;

    if (famille === 'blanc') {
        // Cercle plein avec ombre + reflet
        g.fillStyle(0x000000, 0.4);
        g.fillCircle(1, 1, r);
        g.fillStyle(couleur, 1);
        g.fillCircle(0, 0, r);
        g.fillStyle(0xffffff, 0.85);
        g.fillCircle(-r * 0.35, -r * 0.35, r * 0.3);
    } else if (famille === 'bleu') {
        // Triangle pointe en haut
        g.fillStyle(0x000000, 0.4);
        g.beginPath();
        g.moveTo(1, -r + 1);
        g.lineTo(r + 1, r * 0.7 + 1);
        g.lineTo(-r + 1, r * 0.7 + 1);
        g.closePath();
        g.fillPath();
        g.fillStyle(couleur, 1);
        g.beginPath();
        g.moveTo(0, -r);
        g.lineTo(r, r * 0.7);
        g.lineTo(-r, r * 0.7);
        g.closePath();
        g.fillPath();
        // Chevron intérieur clair
        g.lineStyle(2, 0xa0c8ff, 0.85);
        g.beginPath();
        g.moveTo(-r * 0.45, r * 0.3);
        g.lineTo(0, -r * 0.3);
        g.lineTo(r * 0.45, r * 0.3);
        g.strokePath();
    } else if (famille === 'noir') {
        // Losange (carré tourné 45°)
        g.fillStyle(0x000000, 0.5);
        g.beginPath();
        g.moveTo(1, -r + 1);
        g.lineTo(r + 1, 1);
        g.lineTo(1, r + 1);
        g.lineTo(-r + 1, 1);
        g.closePath();
        g.fillPath();
        g.fillStyle(couleur, 1);
        g.beginPath();
        g.moveTo(0, -r);
        g.lineTo(r, 0);
        g.lineTo(0, r);
        g.lineTo(-r, 0);
        g.closePath();
        g.fillPath();
        // Bord pourpre
        g.lineStyle(1.5, 0x6a2858, 0.9);
        g.beginPath();
        g.moveTo(0, -r);
        g.lineTo(r, 0);
        g.lineTo(0, r);
        g.lineTo(-r, 0);
        g.closePath();
        g.strokePath();
        // Point central pourpre
        g.fillStyle(0x6a2858, 1);
        g.fillCircle(0, 0, r * 0.18);
    } else {
        // Inconnu (fallback)
        g.fillStyle(0x6a6a7a, 1);
        g.fillCircle(0, 0, r);
    }

    return g;
}
