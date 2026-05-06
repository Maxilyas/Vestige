// BossVisuel — amplification du visuel paramétrique pour les boss.
//
// Un boss = silhouette de l'archétype (réutilise EnemyVisuel) + éléments signature :
//   - halo additif large pulsant, couleur du boss
//   - liseré rouge cramoisi qui ondule autour de la silhouette
//   - couronne royale (variantes par skin : cornes_courtes/longues/épines/yeux)
//   - traînée de braises permanente (étincelles qui montent du corps)

import { creerVisuelEnnemi } from './EnemyVisuel.js';
import { DEPTH } from '../PainterlyRenderer.js';

export function creerVisuelBoss(scene, def) {
    // Container racine. Le visuel d'archétype est placé dedans. On dessine
    // les couches "boss" au-dessus et en-dessous.
    const racine = scene.add.container(0, 0);
    racine.setDepth(DEPTH.ENTITES + 1);

    // === Halo de boss derrière la silhouette ===
    const haloFond = scene.add.graphics();
    haloFond.setBlendMode(Phaser.BlendModes.ADD);
    const couleurHalo = def.palette.halo ?? def.palette.accent ?? 0xff8080;
    haloFond.fillStyle(couleurHalo, 0.25);
    haloFond.fillCircle(0, 0, def.largeur * 1.1);
    haloFond.fillStyle(couleurHalo, 0.4);
    haloFond.fillCircle(0, 0, def.largeur * 0.7);
    racine.add(haloFond);
    scene.tweens.add({
        targets: haloFond,
        alpha: { from: 0.6, to: 1 },
        scale: { from: 0.9, to: 1.12 },
        duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.InOut'
    });

    // === Silhouette de l'archétype ===
    const silhouette = creerVisuelEnnemi(scene, def);
    silhouette.setDepth(DEPTH.ENTITES + 1);
    racine.add(silhouette);

    // === Liseré écarlate qui ondule autour de la silhouette ===
    const liseré = scene.add.graphics();
    liseré.setBlendMode(Phaser.BlendModes.ADD);
    liseré.lineStyle(2, couleurHalo, 0.85);
    liseré.strokeRect(
        -def.largeur / 2 - 4, -def.hauteur / 2 - 4,
        def.largeur + 8, def.hauteur + 8
    );
    racine.add(liseré);
    scene.tweens.add({
        targets: liseré, alpha: { from: 0.4, to: 1 },
        duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut'
    });

    // === Traînée de braises permanente qui monte du corps ===
    if (scene.textures.exists('_particule')) {
        const braises = scene.add.particles(0, 0, '_particule', {
            lifespan: 900,
            speedY: { min: -45, max: -20 },
            speedX: { min: -10, max: 10 },
            scale: { start: 0.5, end: 0 },
            tint: [couleurHalo, def.palette.accent ?? 0xff8040, 0xffffff],
            quantity: 1,
            frequency: 90,
            blendMode: Phaser.BlendModes.ADD,
            alpha: { start: 0.85, end: 0 }
        });
        braises.setDepth(DEPTH.ENTITES);
        const upd = () => {
            if (!braises.active || !racine.active) return;
            braises.setPosition(racine.x, racine.y + def.hauteur * 0.2);
        };
        scene.events.on('postupdate', upd);
        scene.events.once('shutdown', () => {
            scene.events.off('postupdate', upd);
            braises?.destroy();
        });
        racine._braises = braises;
    }

    return racine;
}
