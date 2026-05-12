// CinematiqueFusion — séquence scriptée jouée dans GameScene quand le boss
// de l'étage 10 meurt (Phase 5c).
//
// Séquence :
//   1. Lock inputs (flag `scene._cinematiqueFinEnCours`)
//   2. Freeze ennemis et projectiles encore en vol
//   3. Flash blanc bref + ralentissement temporel
//   4. Artefact descend du ciel (rectangle doré + halo pulsant + particules)
//   5. Joueur avance automatiquement vers l'Artefact (tween position)
//   6. Contact : explosion de lumière dorée, JoueurVisuel s'efface
//   7. VestigeIncarne apparaît à la place avec flash + particules
//   8. Hold contemplatif 1.5 s
//   9. Camera fade to black → FinScene
//
// Toute la séquence vit ici. GameScene n'a qu'à appeler `lancerCinematiqueFin()`
// et oublier — le système gère ses tweens et la transition de scène.

import { DEPTH } from '../render/PainterlyRenderer.js';
import { VestigeIncarne } from '../render/entities/VestigeIncarne.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

const C_OR = 0xffd070;
const C_OR_VIF = 0xfff0a0;

/**
 * Lance la cinématique de fin. À appeler à la mort du boss étage 10.
 * @param {Phaser.Scene} scene  GameScene
 * @param {object} boss         entité Boss morte (sprite.x/y pour positionner)
 */
export function lancerCinematiqueFin(scene, boss) {
    // Garde anti-double-appel
    if (scene._cinematiqueFinEnCours) return;
    scene._cinematiqueFinEnCours = true;

    // Stoppe les inputs côté GameScene (lu par update())
    // Désactive le HUD distractif
    scene.scene.sleep('UIScene');

    // Freeze le joueur : vélocité nulle + gravité désactivée pour qu'il ne
    // tombe pas pendant la descente de l'Artefact (sinon il sortirait du
    // cadre cinématique).
    if (scene.player?.body) {
        scene.player.body.setVelocity(0, 0);
        scene.player.body.setAllowGravity(false);
    }

    // Freeze ennemis vivants (rare à ce stade) et projectiles encore en vol
    for (const e of scene.enemies ?? []) {
        if (e.sprite?.body) e.sprite.body.setVelocity(0, 0);
    }
    for (const p of scene.projectiles ?? []) {
        p.detruit = true;
        p.sprite?.destroy?.();
    }

    const px = scene.player.x;
    const py = scene.player.y;

    // ── 1. Flash blanc bref ────────────────────────────────────────────────
    const flash = scene.add.rectangle(
        GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 1
    ).setScrollFactor(0).setDepth(DEPTH.EFFETS + 100);
    scene.tweens.add({
        targets: flash, alpha: { from: 1, to: 0 },
        duration: 600, ease: 'Quad.Out',
        onComplete: () => flash.destroy()
    });
    scene.cameras.main.shake(220, 0.005);

    // ── 2. Spawn Artefact dans le ciel ─────────────────────────────────────
    const artefactStartY = -30;
    const artefactEndY = py - 60;
    const artefactX = px;

    // Artefact = cube doré incandescent + halo additif
    const artefactCube = scene.add.rectangle(artefactX, artefactStartY, 18, 18, C_OR);
    artefactCube.setStrokeStyle(2, C_OR_VIF, 1);
    artefactCube.setDepth(DEPTH.EFFETS);
    artefactCube.setAlpha(0);

    const artefactHalo = scene.add.graphics();
    artefactHalo.setDepth(DEPTH.EFFETS);
    artefactHalo.setBlendMode(Phaser.BlendModes.ADD);
    artefactHalo.setAlpha(0);
    const redessinerHalo = () => {
        artefactHalo.clear();
        artefactHalo.fillStyle(C_OR, 0.35);
        artefactHalo.fillCircle(artefactCube.x, artefactCube.y, 30);
        artefactHalo.fillStyle(C_OR_VIF, 0.55);
        artefactHalo.fillCircle(artefactCube.x, artefactCube.y, 14);
    };
    redessinerHalo();

    // Apparition de l'Artefact (fade-in) après le flash
    scene.tweens.add({
        targets: [artefactCube, artefactHalo],
        alpha: 1,
        duration: 500,
        delay: 300,
        ease: 'Quad.Out'
    });

    // Rotation lente de l'Artefact (charm) + descente
    scene.tweens.add({
        targets: artefactCube,
        angle: 360,
        duration: 3500,
        delay: 600,
        ease: 'Sine.InOut',
        onUpdate: redessinerHalo
    });
    scene.tweens.add({
        targets: artefactCube,
        y: artefactEndY,
        duration: 2200,
        delay: 800,
        ease: 'Sine.InOut',
        onUpdate: redessinerHalo,
        onComplete: () => onArtefactArrive()
    });

    // Particules dorées ascensionnelles autour de l'Artefact pendant la descente
    const particulesInterval = scene.time.addEvent({
        delay: 90,
        loop: true,
        callback: () => {
            const dx = (Math.random() - 0.5) * 40;
            const dy = (Math.random() - 0.5) * 20;
            const p = scene.add.circle(
                artefactCube.x + dx, artefactCube.y + dy, 1.8, C_OR_VIF, 0.9
            );
            p.setBlendMode(Phaser.BlendModes.ADD);
            p.setDepth(DEPTH.EFFETS);
            scene.tweens.add({
                targets: p,
                y: p.y - 30 - Math.random() * 30,
                alpha: 0,
                duration: 900,
                ease: 'Sine.Out',
                onComplete: () => p.destroy()
            });
        }
    });

    // ── 3. Quand l'Artefact arrive : joueur s'élève vers lui ───────────────
    function onArtefactArrive() {
        // Joueur saute / s'élève symboliquement vers l'Artefact (par tween)
        scene.tweens.add({
            targets: scene.player,
            x: artefactCube.x,
            y: artefactEndY,
            duration: 900,
            ease: 'Cubic.InOut',
            onComplete: () => onFusion()
        });
        // Gravité déjà désactivée au début, on confirme vélocité nulle.
        if (scene.player?.body) {
            scene.player.body.setVelocity(0, 0);
        }
        // Faisceau de lumière entre joueur et Artefact
        const faisceau = scene.add.graphics();
        faisceau.setDepth(DEPTH.EFFETS);
        faisceau.setBlendMode(Phaser.BlendModes.ADD);
        const redrawFaisceau = () => {
            faisceau.clear();
            faisceau.lineStyle(3, C_OR_VIF, 0.7);
            faisceau.beginPath();
            faisceau.moveTo(scene.player.x, scene.player.y);
            faisceau.lineTo(artefactCube.x, artefactCube.y);
            faisceau.strokePath();
            faisceau.lineStyle(1, 0xffffff, 0.9);
            faisceau.beginPath();
            faisceau.moveTo(scene.player.x, scene.player.y);
            faisceau.lineTo(artefactCube.x, artefactCube.y);
            faisceau.strokePath();
        };
        const refreshTimer = scene.time.addEvent({
            delay: 16, loop: true, callback: redrawFaisceau
        });
        scene._cinemaFaisceauTimer = refreshTimer;
        scene._cinemaFaisceau = faisceau;
    }

    // ── 4. Fusion : flash plein écran, swap visuel ─────────────────────────
    function onFusion() {
        // Stop le faisceau et les particules
        scene._cinemaFaisceauTimer?.remove();
        scene._cinemaFaisceau?.destroy();
        particulesInterval.remove();

        // Flash plein écran intense
        const flashFusion = scene.add.rectangle(
            GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 1
        ).setScrollFactor(0).setDepth(DEPTH.EFFETS + 200);
        scene.cameras.main.shake(350, 0.012);

        scene.tweens.add({
            targets: flashFusion,
            alpha: 0,
            duration: 1100,
            ease: 'Quad.Out',
            onComplete: () => flashFusion.destroy()
        });

        // L'Artefact disparaît (absorbé)
        scene.tweens.add({
            targets: [artefactCube, artefactHalo],
            alpha: 0, scale: 0.3,
            duration: 400,
            ease: 'Quad.In',
            onComplete: () => {
                artefactCube.destroy();
                artefactHalo.destroy();
            }
        });

        // Le JoueurVisuel s'efface
        if (scene.playerVisual) {
            scene.tweens.add({
                targets: scene.playerVisual.container,
                alpha: 0,
                duration: 350,
                ease: 'Quad.In'
            });
        }

        // 250 ms après le pic du flash, on instancie le VestigeIncarne au même
        // endroit (le flash masque la transition) avec alpha 0 → 1
        scene.time.delayedCall(250, () => {
            const incarne = new VestigeIncarne(scene, {
                scale: 1.4,
                alpha: 0,
                particules: true
            });
            incarne.setPosition(scene.player.x, scene.player.y);
            scene._vestigeIncarne = incarne;
            scene.tweens.add({
                targets: incarne.container,
                alpha: 1,
                duration: 600,
                ease: 'Quad.Out',
                onComplete: () => onHold()
            });
            // Petit déplacement de "pose" (le héros se redresse)
            scene.tweens.add({
                targets: incarne.container,
                y: scene.player.y - 6,
                duration: 700,
                ease: 'Sine.Out'
            });
        });
    }

    // ── 5. Hold contemplatif puis fade to black → FinScene ─────────────────
    function onHold() {
        scene.time.delayedCall(1500, () => {
            // Fade to black
            const black = scene.add.rectangle(
                GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0
            ).setScrollFactor(0).setDepth(DEPTH.EFFETS + 300);
            scene.tweens.add({
                targets: black,
                alpha: 1,
                duration: 1400,
                ease: 'Quad.InOut',
                onComplete: () => {
                    // Marker localStorage et bascule FinScene
                    try { localStorage.setItem('vestige_fin_atteinte_v1', 'true'); }
                    catch (_e) { /* privacy mode → no-op */ }
                    scene.scene.start('FinScene');
                }
            });
        });
    }
}
