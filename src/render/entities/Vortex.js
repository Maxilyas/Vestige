// Vortex — instabilité de la Trame qui ramène au Présent.
// Visuel : portail tourbillonnant cyan-vert avec anneaux rotatifs et halo
// pulsant. Cœur sombre central (le "passage"). Particules additives
// émanant du portail.

import { DEPTH } from '../PainterlyRenderer.js';

const COUL_VORTEX = 0x5ac8a8;
const COUL_VORTEX_CLAIR = 0xa0e8d8;
const COUL_COEUR_SOMBRE = 0x0a1820;

export function creerVisuelVortex(scene, x, y, largeur, hauteur) {
    const container = scene.add.container(x, y);
    container.setDepth(DEPTH.PLATEFORMES);

    const rayon = Math.min(largeur, hauteur) / 2;

    // --- Halo extérieur additif qui pulse ---
    const halo = scene.add.graphics();
    halo.setBlendMode(Phaser.BlendModes.ADD);
    halo.fillStyle(COUL_VORTEX, 0.22);
    halo.fillCircle(0, 0, rayon * 1.4);
    halo.fillStyle(COUL_VORTEX, 0.4);
    halo.fillCircle(0, 0, rayon * 1.0);
    halo.fillStyle(COUL_VORTEX_CLAIR, 0.5);
    halo.fillCircle(0, 0, rayon * 0.6);
    container.add(halo);
    scene.tweens.add({
        targets: halo,
        scale: { from: 0.9, to: 1.12 },
        alpha: { from: 0.85, to: 1 },
        duration: 1100,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });

    // --- Anneau 1 (extérieur, rotation lente) ---
    const anneau1 = scene.add.graphics();
    anneau1.lineStyle(3, COUL_VORTEX, 0.9);
    anneau1.strokeCircle(0, 0, rayon * 0.8);
    // Accents : 4 points cardinaux clairs
    anneau1.fillStyle(COUL_VORTEX_CLAIR, 1);
    for (let a = 0; a < 4; a++) {
        const ang = a * Math.PI / 2;
        anneau1.fillCircle(Math.cos(ang) * rayon * 0.8, Math.sin(ang) * rayon * 0.8, 3);
    }
    container.add(anneau1);
    scene.tweens.add({
        targets: anneau1,
        angle: 360,
        duration: 7000,
        repeat: -1
    });

    // --- Anneau 2 (intérieur, rotation inverse plus rapide) ---
    const anneau2 = scene.add.graphics();
    anneau2.lineStyle(2, COUL_VORTEX_CLAIR, 0.9);
    anneau2.strokeCircle(0, 0, rayon * 0.5);
    // Accents : 6 points
    anneau2.fillStyle(COUL_VORTEX, 1);
    for (let a = 0; a < 6; a++) {
        const ang = a * Math.PI / 3 + Math.PI / 6;
        anneau2.fillCircle(Math.cos(ang) * rayon * 0.5, Math.sin(ang) * rayon * 0.5, 2.5);
    }
    container.add(anneau2);
    scene.tweens.add({
        targets: anneau2,
        angle: -360,
        duration: 4500,
        repeat: -1
    });

    // --- Cœur sombre central (le "passage") ---
    const coeur = scene.add.graphics();
    coeur.fillStyle(COUL_COEUR_SOMBRE, 0.95);
    coeur.fillCircle(0, 0, rayon * 0.28);
    coeur.fillStyle(0x000000, 1);
    coeur.fillCircle(0, 0, rayon * 0.18);
    container.add(coeur);
    // Léger pulse du cœur
    scene.tweens.add({
        targets: coeur,
        scale: { from: 0.95, to: 1.1 },
        duration: 800,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });

    // --- Particules additives émanant du portail ---
    if (scene.textures.exists('_particule')) {
        const part = scene.add.particles(0, 0, '_particule', {
            lifespan: 1100,
            speed: { min: 25, max: 55 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            tint: [COUL_VORTEX, COUL_VORTEX_CLAIR],
            quantity: 1,
            frequency: 90,
            blendMode: Phaser.BlendModes.ADD,
            alpha: { start: 0.85, end: 0 },
            emitZone: {
                type: 'edge',
                source: new Phaser.Geom.Circle(0, 0, rayon * 0.4),
                quantity: 12
            }
        });
        part.setDepth(DEPTH.PLATEFORMES + 1);
        // Suivre le container
        const upd = () => {
            if (!part.active || !container.active) return;
            part.setPosition(container.x, container.y);
        };
        scene.events.on('postupdate', upd);
        scene.events.once('shutdown', () => {
            scene.events.off('postupdate', upd);
            part?.destroy();
        });
    }

    return container;
}
