// EnvironmentMutators — tiles d'état qui modifient temporairement le sol.
//
// Phase 3b : type unique 'glissant' utilisé par Mousse Glissante.
// Phase 3c+ ajoutera 'gele', 'enflammé', 'fissuré' (tile-crumble), etc.
//
// MODÈLE
// ──────
// Chaque tile = rectangle au sol + métadonnées (type, expire). Une boucle
// auto-attachée via `scene.events.on('update')` :
//   - expire les tiles écoulées
//   - applique l'effet au joueur en overlap
//
// Stateless API : `ajouterTileGlissant(scene, x, y, w, h, duration)` se
// charge de tout (création visuelle, expiration, application d'effet).

import { DEPTH } from '../render/PainterlyRenderer.js';

const TILES_CLE = '_envMutatorsTiles';
const INIT_CLE = '_envMutatorsReady';

function ensureSystem(scene) {
    // Flag scene-local : après shutdown, la scène est détruite et l'instance
    // suivante repart à zéro. Le registry global n'est pas utilisé pour
    // éviter le faux skip entre scènes.
    if (scene[INIT_CLE]) return;
    scene[INIT_CLE] = true;
    if (!scene[TILES_CLE]) scene[TILES_CLE] = [];

    const update = () => {
        if (!scene.sys.isActive()) return;
        const now = scene.time.now;
        // Expire les tiles
        const tiles = scene[TILES_CLE];
        for (let i = tiles.length - 1; i >= 0; i--) {
            const t = tiles[i];
            if (now >= t.expiresAt) {
                t.visual?.destroy();
                tiles.splice(i, 1);
            }
        }
        // Applique effets au joueur
        const player = scene.player;
        if (!player?.body) return;
        const px = player.x, py = player.y;
        const phw = player.width / 2, phh = player.height / 2;
        for (const t of tiles) {
            const rect = t.rect;
            if (px + phw < rect.x || px - phw > rect.x + rect.w) continue;
            if (py + phh < rect.y || py - phh > rect.y + rect.h) continue;
            appliquerEffet(player, t.type, scene);
        }
    };

    scene.events.on('update', update);
    scene.events.once('shutdown', () => scene.events.off('update', update));
    scene.registry.set(INIT_CLE, scene.scene.key);
}

function appliquerEffet(player, type, scene) {
    if (type === 'glissant') {
        // Marque le joueur comme glissant — InputSystem/joueur controller
        // peut lire ce flag pour réduire l'accélération horizontale.
        // En attendant l'intégration côté input, on applique une drag réduite.
        player._tileEffectGlissant = scene.time.now + 100; // expire 100 ms après dernier contact
    }
}

/**
 * Ajoute une tile glissante au sol.
 * @param {Phaser.Scene} scene
 * @param {number} x  top-left
 * @param {number} y  top-left
 * @param {number} w  largeur
 * @param {number} h  hauteur
 * @param {number} duration  ms avant expiration
 */
export function ajouterTileGlissant(scene, x, y, w, h, duration = 4000) {
    ensureSystem(scene);
    const visual = scene.add.graphics();
    visual.setDepth(DEPTH.SOL ?? DEPTH.ENTITES - 2);
    visual.fillStyle(0x80c0a0, 0.35);
    visual.fillRoundedRect(x, y, w, h, 4);
    visual.setBlendMode(Phaser.BlendModes.ADD);

    // Fade-out doux à la fin
    scene.tweens.add({
        targets: visual,
        alpha: 0,
        delay: Math.max(0, duration - 600),
        duration: 600
    });

    const tile = {
        rect: { x, y, w, h },
        type: 'glissant',
        expiresAt: scene.time.now + duration,
        visual
    };
    scene[TILES_CLE].push(tile);
    return tile;
}

/** Le joueur est-il actuellement sur une tile glissante ? */
export function estSurGlissant(player, scene) {
    if (!player) return false;
    const exp = player._tileEffectGlissant ?? 0;
    return scene.time.now < exp;
}
