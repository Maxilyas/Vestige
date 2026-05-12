// PerceptionSystem — flags d'altération de perception/contrôle joueur.
//
// FLAGS posés par les ennemis et lus par GameScene :
//   - player._visionFlouJusqu       → overlay obscurcissant suit le joueur
//   - player._controleInverseJusqu  → swap gauche/droite dans le mouvement
//   - player._graviteInverseJusqu   → gravity.y du body inversé
//   - player._parryLockJusqu        → tenterParry no-op
//   - player._vulnerabiliteJusqu    → prendre 1.5× dgts
//
// Le PerceptionSystem fournit aussi un overlay visuel "vision_flou" qui
// suit le joueur. C'est purement visuel (pas une vraie passe shader). Il
// est créé une fois par scène (auto-init), affiché alpha > 0 quand le flag
// est actif, sinon caché.

import { DEPTH } from '../render/PainterlyRenderer.js';

const INIT_CLE = '_perceptionReady';
const OVERLAY_CLE = '_perceptionOverlay';

function ensureSystem(scene) {
    if (scene[INIT_CLE]) return;
    scene[INIT_CLE] = true;

    // Overlay visuel pour vision flou : rect sombre full-screen, dessiné UNE
    // fois et toggle via setVisible. Couvre tout l'écran (setScrollFactor 0).
    const ww = scene.scale.width, hh = scene.scale.height;
    const overlay = scene.add.graphics();
    overlay.setDepth(240);  // au-dessus du gameplay, sous le HUD (>250)
    overlay.setScrollFactor(0);
    overlay.fillStyle(0x100818, 0.55);
    overlay.fillRect(0, 0, ww, hh);
    // Vignette claire vers le centre (donne le feel "tunnel vision")
    overlay.fillStyle(0x100818, 0.35);
    overlay.fillCircle(ww / 2, hh / 2, Math.min(ww, hh) * 0.4);
    overlay.setVisible(false);
    scene[OVERLAY_CLE] = overlay;

    const update = () => {
        if (!scene.sys.isActive()) return;
        const player = scene.player;
        if (!player) return;
        const flou = (player._visionFlouJusqu ?? 0) > scene.time.now;
        overlay.setVisible(flou);
    };

    scene.events.on('postupdate', update);
    scene.events.once('shutdown', () => {
        scene.events.off('postupdate', update);
        overlay?.destroy();
    });
}

/**
 * Pose le flag de vision floue sur le joueur. Appelé à chaque frame d'overlap
 * par Cristal-Prisme. Persiste 200ms après dernier contact.
 */
export function appliquerVisionFlou(scene, player, duree = 200) {
    ensureSystem(scene);
    player._visionFlouJusqu = scene.time.now + duree;
}

/**
 * Pose le flag d'inversion contrôles. Lu par GameScene.update() dans le bloc
 * mouvement (swap gauche/droite).
 */
export function appliquerControleInverse(scene, player, duree = 1000) {
    ensureSystem(scene);
    player._controleInverseJusqu = scene.time.now + duree;
}

/**
 * Pose le flag de gravité inversée. Lu par GameScene.update() qui applique
 * body.gravity.y = -2 * worldGravity.y pendant la durée.
 */
export function appliquerGraviteInverse(scene, player, duree = 2000) {
    ensureSystem(scene);
    player._graviteInverseJusqu = scene.time.now + duree;
}

/**
 * Pose le flag de lock parry. tenterParry() devient no-op tant que actif.
 */
export function appliquerParryLock(scene, player, duree = 200) {
    ensureSystem(scene);
    player._parryLockJusqu = scene.time.now + duree;
}

/**
 * Pose le flag de vulnérabilité. prendreDegats sera multiplié par 1.5.
 */
export function appliquerVulnerabilite(scene, player, duree = 3000) {
    ensureSystem(scene);
    player._vulnerabiliteJusqu = scene.time.now + duree;
}
