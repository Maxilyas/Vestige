// Plateforme mobile — plateforme qui se déplace en aller-retour.
// Visuel : plateforme stylisée (plateau ornementé) + chaînes ou cordon de
// suspension qui pivote selon la position.

import { DEPTH } from '../PainterlyRenderer.js';

const PALETTES_BIOME = {
    ruines_basses:    { plateau: 0x6a5a3a, bord: 0x2a1a0a, accent: 0xc8a060 },
    halls_cendres:    { plateau: 0x6a4a3a, bord: 0x2a1004, accent: 0xffa040 },
    cristaux_glaces:  { plateau: 0x4a6a8a, bord: 0x1a2a4a, accent: 0xa0d0ff },
    voile_inverse:    { plateau: 0x4a3a6a, bord: 0x1a0a2a, accent: 0xc080ff },
    coeur_reflux:     { plateau: 0x4a1a1a, bord: 0x1a0000, accent: 0xff4040 }
};

export function creerVisuelPlateformeMobile(scene, x, y, largeur, hauteur, biomeId) {
    const palette = PALETTES_BIOME[biomeId] ?? PALETTES_BIOME.ruines_basses;
    const container = scene.add.container(x, y);
    container.setDepth(DEPTH.PLATEFORMES);

    const g = scene.add.graphics();

    // Ombre dessous
    g.fillStyle(palette.bord, 0.5);
    g.fillRect(-largeur / 2 - 2, hauteur / 2, largeur + 4, 4);

    // Corps : plateau bord sombre + intérieur plus clair
    g.fillStyle(palette.bord, 1);
    g.fillRect(-largeur / 2, -hauteur / 2, largeur, hauteur);
    g.fillStyle(palette.plateau, 1);
    g.fillRect(-largeur / 2 + 2, -hauteur / 2 + 2, largeur - 4, hauteur - 4);

    // Liseré supérieur doré (lecture comme plateforme atterrissable)
    g.fillStyle(palette.accent, 1);
    g.fillRect(-largeur / 2 + 2, -hauteur / 2 + 1, largeur - 4, 1);

    // Détails ornementaux : 2 cabochons sur les bords
    g.fillStyle(palette.accent, 0.85);
    g.fillCircle(-largeur / 2 + 6, 0, 2);
    g.fillCircle( largeur / 2 - 6, 0, 2);

    container.add(g);
    return container;
}
