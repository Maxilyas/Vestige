// Animations d'ambiance — éléments dynamiques qui font respirer le monde.
//
// 8b3 inclut :
//   - poserHaloJoueur (Miroir uniquement) — le Vestige porte sa propre lumière
//     dans le passé, halo additif doré autour du joueur
//   - poserBrumeSol (Présent) — bandes de brume bleutée qui rampent au sol,
//     évoque l'oubli généralisé
//   - poserRayonsLumiere (Miroir) — faisceaux de lumière dorée en diagonale,
//     évoque les vitraux invisibles et le soleil rasant

import { DEPTH, paletteDuMonde } from './PainterlyRenderer.js';

// ============================================================
// HALO JOUEUR (Miroir uniquement)
// ============================================================

export function poserHaloJoueur(scene, player, monde) {
    if (monde !== 'miroir') return null;
    const palette = paletteDuMonde(monde);

    const halo = scene.add.graphics();
    halo.setBlendMode(Phaser.BlendModes.ADD);
    halo.setDepth(DEPTH.ENTITES - 1);

    // Halo en 2 couches concentriques
    halo.fillStyle(palette.flamme, 0.25);
    halo.fillCircle(0, 0, 60);
    halo.fillStyle(palette.rayon, 0.4);
    halo.fillCircle(0, 0, 30);
    halo.fillStyle(0xffffff, 0.3);
    halo.fillCircle(0, 0, 14);

    // Suit le joueur en permanence
    const updHalo = () => {
        if (!halo.active || !player.active) return;
        halo.setPosition(player.x, player.y);
    };
    scene.events.on('postupdate', updHalo);
    scene.events.once('shutdown', () => scene.events.off('postupdate', updHalo));

    // Pulse subtil
    scene.tweens.add({
        targets: halo,
        scale: { from: 0.92, to: 1.08 },
        alpha: { from: 0.85, to: 1 },
        duration: 1200,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });

    return halo;
}

// ============================================================
// BRUME AU SOL (Présent uniquement) — couvre toute la largeur
// ============================================================

export function poserBrumeSol(scene, dims, monde) {
    if (monde !== 'normal') return [];
    const palette = paletteDuMonde(monde);
    const ySol = dims.hauteur - 40;

    const nuages = [];
    const nbNuages = 5;

    for (let i = 0; i < nbNuages; i++) {
        const g = scene.add.graphics();
        g.fillStyle(palette.brume, 0.18);
        // 2 ellipses superposées pour effet "nuage" moelleux
        g.fillEllipse(0, 0, 240 + Math.random() * 80, 40);
        g.fillStyle(palette.brume, 0.13);
        g.fillEllipse(20, -8, 180, 30);

        const xDebut = (dims.largeur / nbNuages) * i + Math.random() * 100;
        const yPos = ySol - 8 + Math.random() * 12;
        g.setPosition(xDebut, yPos);
        g.setDepth(DEPTH.DECOR_AVANT - 1);
        g.setScrollFactor(1.05); // léger parallax foreground

        // Translation horizontale très lente vers la droite, boucle infinie
        const dureeBoucle = 28000 + Math.random() * 15000;
        scene.tweens.add({
            targets: g,
            x: xDebut + dims.largeur,
            duration: dureeBoucle,
            ease: 'Linear',
            repeat: -1,
            onRepeat: () => { g.x = xDebut - 100; }
        });

        nuages.push(g);
    }
    return nuages;
}

// ============================================================
// RAYONS DE LUMIÈRE OBLIQUES (Miroir uniquement)
// ============================================================

export function poserRayonsLumiere(scene, dims, monde) {
    if (monde !== 'miroir') return [];
    const palette = paletteDuMonde(monde);

    const rayons = [];
    const nbRayons = 3;
    const largeurRayon = 100;
    const decalageDiag = 220; // angle des rayons (vers le bas-gauche)

    for (let i = 0; i < nbRayons; i++) {
        const xHaut = dims.largeur * (0.2 + i * 0.32);
        const g = scene.add.graphics();
        g.setBlendMode(Phaser.BlendModes.ADD);
        g.setDepth(DEPTH.DECOR_AVANT - 2);
        g.setScrollFactor(0.8);

        // Parallélogramme diagonal (les rayons traversent du haut vers le bas-gauche)
        g.fillStyle(palette.rayon, 0.13);
        g.beginPath();
        g.moveTo(xHaut, 0);
        g.lineTo(xHaut + largeurRayon, 0);
        g.lineTo(xHaut + largeurRayon - decalageDiag, dims.hauteur);
        g.lineTo(xHaut - decalageDiag, dims.hauteur);
        g.closePath();
        g.fillPath();

        // Cœur lumineux du rayon (plus étroit, plus vif)
        g.fillStyle(palette.flamme, 0.07);
        g.beginPath();
        g.moveTo(xHaut + 30, 0);
        g.lineTo(xHaut + largeurRayon - 30, 0);
        g.lineTo(xHaut + largeurRayon - 30 - decalageDiag, dims.hauteur);
        g.lineTo(xHaut + 30 - decalageDiag, dims.hauteur);
        g.closePath();
        g.fillPath();

        // Animation très lente de l'opacité (les rayons "respirent")
        scene.tweens.add({
            targets: g,
            alpha: { from: 0.7, to: 1 },
            duration: 4000 + Math.random() * 2000,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1,
            delay: i * 800
        });

        rayons.push(g);
    }
    return rayons;
}
