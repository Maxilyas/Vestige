// CinematiqueBascule — la bascule 8→9 : le monde passe en VUE DE DESSUS.
// (Phase 9.14 — Cœur du Reflux.)
//
// Jouée une fois par run, à la première entrée dans le Cœur (étage 9, Présent).
// La transition EST la cinématique (cf. COEUR.md §9) : pas de vraie caméra 3D,
// on SUGGÈRE le tilt 90°. Le décor side-scroll (barres horizontales) s'écrase
// (scaleY → 0) pendant qu'une grille de sol top-down monte d'un point de fuite,
// la palette glisse du violet (Voile) vers l'ambre-cramoisi (Cœur), et un
// murmure clôt la bascule.
//
// GameScene n'a qu'à appeler lancerCinematiqueBascule(scene) ; le flag
// `scene._cinematiqueBasculeEnCours` suspend l'input (lu par update()).

import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

const C_VOILE  = 0x8a4ad8;   // violet Voile (d'où l'on vient)
const C_AMBRE  = 0xffcc66;   // ambre du souvenir (Cœur)
const C_SANG   = 0xff2030;   // cramoisi du Reflux

export function lancerCinematiqueBascule(scene, onComplete) {
    if (scene._cinematiqueBasculeEnCours) return;
    scene._cinematiqueBasculeEnCours = true;

    const W = GAME_WIDTH, H = GAME_HEIGHT, cx = W / 2, cy = H / 2;
    const D = 320;   // depth au-dessus de tout (vignette = 150)

    // Fige le joueur le temps de la bascule.
    if (scene.player?.body) scene.player.body.setVelocity(0, 0);

    // Voile plein écran (on part du noir-violet du Voile).
    const veil = scene.add.rectangle(cx, cy, W, H, 0x0a0414, 1)
        .setScrollFactor(0).setDepth(D);

    // Couche « side-scroll » : barres horizontales (les plateformes vues de face).
    const lignes = scene.add.graphics().setScrollFactor(0).setDepth(D + 1);
    lignes.lineStyle(4, C_VOILE, 0.7);
    for (let i = 1; i <= 6; i++) {
        const y = (H / 7) * i;
        lignes.lineBetween(W * 0.12, y, W * 0.88, y);
    }
    lignes.setPosition(0, 0);

    // Couche « top-down » : grille de sol qui monte d'un point de fuite (scaleY 0→1).
    const grille = scene.add.graphics().setScrollFactor(0).setDepth(D + 1);
    grille.lineStyle(1, C_AMBRE, 0.5);
    const pas = 60;
    for (let x = -W; x <= W * 2; x += pas) grille.lineBetween(cx + (x - cx), 0, cx + (x - cx) * 2, H);
    for (let gy = 0; gy <= H; gy += pas) grille.lineBetween(0, gy, W, gy);
    grille.setAlpha(0);
    grille.setScale(1, 0.05);
    grille.y = cy;   // monte depuis le centre

    // Flash de teinte (violet → cramoisi).
    const flash = scene.add.rectangle(cx, cy, W, H, C_SANG, 0)
        .setScrollFactor(0).setDepth(D + 2).setBlendMode(Phaser.BlendModes.ADD);

    // Murmure.
    const murmure = scene.add.text(cx, cy + 150, '', {
        fontFamily: 'Georgia, serif', fontSize: '20px', color: '#ffe0a0',
        fontStyle: 'italic', align: 'center', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 3).setAlpha(0);

    const cleanup = () => {
        scene._cinematiqueBasculeEnCours = false;
        [veil, lignes, grille, flash, murmure].forEach(o => o?.destroy?.());
        onComplete?.();
    };
    // Sécurité : si la scène s'arrête pendant la bascule, on lève le flag.
    scene.events.once('shutdown', () => { scene._cinematiqueBasculeEnCours = false; });

    // ── Séquence ──
    // 1. Hold bref (le monde figé du Voile).
    scene.time.delayedCall(400, () => {
        // 2. TILT : les barres s'écrasent, la grille top-down se déploie.
        scene.tweens.add({ targets: lignes, scaleY: 0.04, alpha: 0, y: cy, duration: 1100, ease: 'Cubic.In' });
        scene.tweens.add({ targets: grille, scaleY: 1, alpha: 1, y: 0, duration: 1200, ease: 'Cubic.Out' });
        // 3. Flash de bascule de palette.
        scene.tweens.add({ targets: flash, alpha: { from: 0, to: 0.35 }, duration: 600, yoyo: true });
        // 4. Murmure.
        scene.time.delayedCall(1100, () => {
            murmure.setText('Tu n\'as plus à tomber.\nRegarde.');
            scene.tweens.add({ targets: murmure, alpha: 1, duration: 500 });
        });
        // 5. Lever le voile → révèle la salle top-down.
        scene.time.delayedCall(1900, () => {
            scene.tweens.add({ targets: [veil, grille], alpha: 0, duration: 700, ease: 'Sine.Out' });
            scene.tweens.add({ targets: murmure, alpha: 0, duration: 700, delay: 300, onComplete: cleanup });
        });
    });
}
