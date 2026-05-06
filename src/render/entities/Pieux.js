// Pieux — rangée de pointes acérées. Visuel adapté au biome (couleur + texture).
// Posé soit au sol (pointes vers le haut) soit au plafond (pointes vers le bas).

import { DEPTH } from '../PainterlyRenderer.js';

const PALETTES_BIOME = {
    ruines_basses:    { base: 0x4a3a2a, pointe: 0xc8a070, bord: 0x1a0a04 },
    halls_cendres:    { base: 0x5a3a2a, pointe: 0xffa040, bord: 0x2a1004 },
    cristaux_glaces:  { base: 0x5a7a9a, pointe: 0xc0e0ff, bord: 0x1a2a4a },
    voile_inverse:    { base: 0x5a3a7a, pointe: 0xc080ff, bord: 0x1a0a2a },
    coeur_reflux:     { base: 0x4a0a1a, pointe: 0xff4040, bord: 0x1a0000 }
};

/**
 * Crée le visuel des pieux. (x, y) = centre de la zone d'effet.
 * @param {Phaser.Scene} scene
 * @param {number} x, y
 * @param {number} largeur, hauteur
 * @param {string} orientation 'sol' (pointes ↑) | 'plafond' (pointes ↓)
 * @param {string} biomeId
 */
export function creerVisuelPieux(scene, x, y, largeur, hauteur, orientation, biomeId) {
    const palette = PALETTES_BIOME[biomeId] ?? PALETTES_BIOME.ruines_basses;
    const sens = orientation === 'plafond' ? -1 : 1;
    const container = scene.add.container(x, y);
    container.setDepth(DEPTH.ENTITES);

    const g = scene.add.graphics();

    // === Socle (rectangle sombre encastré dans le sol/plafond) ===
    g.fillStyle(palette.bord, 1);
    g.fillRect(-largeur / 2, sens > 0 ? hauteur / 2 - 4 : -hauteur / 2,
               largeur, 4);
    g.fillStyle(palette.base, 1);
    g.fillRect(-largeur / 2 + 1, sens > 0 ? hauteur / 2 - 3 : -hauteur / 2 + 1,
               largeur - 2, 2);

    // === Pointes (3 triangles) ===
    const nbPointes = 3;
    const espace = largeur / nbPointes;
    for (let i = 0; i < nbPointes; i++) {
        const cx = -largeur / 2 + espace / 2 + i * espace;
        const baseY = sens > 0 ? hauteur / 2 - 4 : -hauteur / 2 + 4;
        const pointeY = sens > 0 ? -hauteur / 2 + 2 : hauteur / 2 - 2;
        // Ombre
        g.fillStyle(palette.bord, 1);
        g.beginPath();
        g.moveTo(cx - espace / 2 + 2, baseY);
        g.lineTo(cx + espace / 2 - 2, baseY);
        g.lineTo(cx + 1, pointeY);
        g.closePath();
        g.fillPath();
        // Corps
        g.fillStyle(palette.base, 1);
        g.beginPath();
        g.moveTo(cx - espace / 2 + 3, baseY);
        g.lineTo(cx + espace / 2 - 3, baseY);
        g.lineTo(cx, pointeY);
        g.closePath();
        g.fillPath();
        // Reflet bord
        g.fillStyle(palette.pointe, 0.85);
        g.beginPath();
        g.moveTo(cx - 1, pointeY + 2);
        g.lineTo(cx + 1, pointeY + 2);
        g.lineTo(cx, pointeY);
        g.closePath();
        g.fillPath();
    }
    container.add(g);

    // === Halo léger sur les pointes (lecture rapide du danger) ===
    const halo = scene.add.graphics();
    halo.setBlendMode(Phaser.BlendModes.ADD);
    halo.fillStyle(palette.pointe, 0.25);
    halo.fillEllipse(0, sens > 0 ? -hauteur / 2 + 4 : hauteur / 2 - 4,
                     largeur * 1.1, 14);
    container.add(halo);
    scene.tweens.add({
        targets: halo, alpha: { from: 0.5, to: 1 },
        duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.InOut'
    });

    return container;
}
