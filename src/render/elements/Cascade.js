// Cascade — flux décoratif vertical signature de chaque biome.
//
//   ruines_basses    : cascade d'eau bleutée
//   halls_cendres    : rivière de cendres ambrée
//   cristaux_glaces  : flux de cristaux glacés
//   voile_inverse    : voile spectral mauve
//   coeur_reflux     : flux cramoisi du Reflux

import { DEPTH } from '../PainterlyRenderer.js';

const CASCADES_BIOME = {
    ruines_basses: {
        couleurFlux: 0x4a8acc, couleurEcume: 0xc8e4ff, halo: 0x80b8e8,
        flowSpeed: 240, density: 1, blend: 'NORMAL'
    },
    halls_cendres: {
        couleurFlux: 0x6a4a2a, couleurEcume: 0xffd070, halo: 0xffa040,
        flowSpeed: 180, density: 1.3, blend: 'ADD'
    },
    cristaux_glaces: {
        couleurFlux: 0x80b8e8, couleurEcume: 0xe0f4ff, halo: 0xc0e8ff,
        flowSpeed: 150, density: 0.9, blend: 'ADD'
    },
    voile_inverse: {
        couleurFlux: 0x6a3a8a, couleurEcume: 0xc080ff, halo: 0xa060d0,
        flowSpeed: 130, density: 1.1, blend: 'ADD'
    },
    coeur_reflux: {
        couleurFlux: 0x8a1a1a, couleurEcume: 0xff4040, halo: 0xff8060,
        flowSpeed: 200, density: 1.4, blend: 'ADD'
    }
};

/**
 * Peint une cascade verticale. (x, yTop) = sommet du flux, hauteur = longueur.
 */
export function peindreCascade(scene, x, yTop, hauteur, biomeId, options = {}) {
    const conf = CASCADES_BIOME[biomeId] ?? CASCADES_BIOME.ruines_basses;
    const largeur = options.largeur ?? 28;
    const container = scene.add.container(x, yTop);
    container.setDepth(DEPTH.DECOR_AVANT ?? 5);

    // === Colonne de flux (gradient vertical via plusieurs rectangles fades) ===
    const colonne = scene.add.graphics();
    if (conf.blend === 'ADD') colonne.setBlendMode(Phaser.BlendModes.ADD);
    // Trois couches superposées de largeur croissante pour effet de profondeur
    colonne.fillStyle(conf.couleurFlux, 0.35);
    colonne.fillRect(-largeur / 2 - 4, 0, largeur + 8, hauteur);
    colonne.fillStyle(conf.couleurFlux, 0.65);
    colonne.fillRect(-largeur / 2, 0, largeur, hauteur);
    colonne.fillStyle(conf.couleurEcume, 0.45);
    colonne.fillRect(-largeur / 2 + 4, 0, largeur - 8, hauteur);
    container.add(colonne);

    // === Bandes horizontales animées (illusion de descente) ===
    const bandes = [];
    for (let i = 0; i < 4; i++) {
        const b = scene.add.graphics();
        if (conf.blend === 'ADD') b.setBlendMode(Phaser.BlendModes.ADD);
        b.fillStyle(conf.couleurEcume, 0.65);
        b.fillRect(-largeur / 2 + 2, 0, largeur - 4, 6);
        b.y = (hauteur / 4) * i;
        container.add(b);
        bandes.push(b);
    }
    // Tween pour faire glisser les bandes vers le bas en boucle
    const dureeBande = (hauteur / conf.flowSpeed) * 1000;
    bandes.forEach((b, i) => {
        scene.tweens.add({
            targets: b,
            y: hauteur,
            duration: dureeBande,
            delay: (dureeBande / 4) * i,
            repeat: -1,
            ease: 'Linear',
            onRepeat: () => { b.y = -10; }
        });
    });

    // === Halo lumineux à la source (sommet) ===
    const haloSource = scene.add.graphics();
    haloSource.setBlendMode(Phaser.BlendModes.ADD);
    haloSource.fillStyle(conf.halo, 0.55);
    haloSource.fillEllipse(0, 0, largeur * 1.6, 14);
    haloSource.fillStyle(conf.couleurEcume, 0.85);
    haloSource.fillEllipse(0, 0, largeur * 0.9, 8);
    container.add(haloSource);
    scene.tweens.add({
        targets: haloSource, alpha: { from: 0.7, to: 1 },
        duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.InOut'
    });

    // === Bassin / éclaboussure à l'arrivée (bas) ===
    const bassin = scene.add.graphics();
    if (conf.blend === 'ADD') bassin.setBlendMode(Phaser.BlendModes.ADD);
    bassin.fillStyle(conf.couleurFlux, 0.5);
    bassin.fillEllipse(0, hauteur, largeur * 2.4, 16);
    bassin.fillStyle(conf.couleurEcume, 0.7);
    bassin.fillEllipse(0, hauteur, largeur * 1.2, 8);
    container.add(bassin);

    // === Particules d'éclaboussure (en bas) ===
    if (scene.textures.exists('_particule')) {
        scene.add.particles(0, 0, '_particule', {
            x: x, y: yTop + hauteur,
            lifespan: 600,
            speedY: { min: -120, max: -50 },
            speedX: { min: -90, max: 90 },
            gravityY: 380,
            scale: { start: 0.5, end: 0 },
            tint: [conf.couleurEcume, conf.halo, conf.couleurFlux],
            quantity: Math.ceil(2 * conf.density),
            frequency: 80,
            blendMode: conf.blend === 'ADD' ? Phaser.BlendModes.ADD : Phaser.BlendModes.NORMAL,
            alpha: { start: 0.85, end: 0 }
        }).setDepth(DEPTH.DECOR_AVANT ?? 5);
    }

    return container;
}
