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

    scene.events.on('postupdate', update);
    scene.events.once('shutdown', () => scene.events.off('postupdate', update));
}

function appliquerEffet(player, type, scene) {
    if (type === 'glissant' || type === 'gele') {
        // Marque le joueur comme glissant. Flag persiste 300 ms après dernier
        // contact pour que la sensation de glisse continue brièvement après
        // avoir quitté la tile.
        player._tileEffectGlissant = scene.time.now + 300;
    } else if (type === 'mur_feu') {
        // DPS gate : émission chaque frame d'overlap. Le handler utilise
        // `invincibleJusqu` comme gating (1 tick par 500ms d'invincibilité).
        scene.events.emit('mutator:mur_feu:hit', player);
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

/**
 * Tile gelée (variante glace) — biome Cristaux/Halls. Identique fonctionnellement
 * à glissant mais visuel bleu glace cohérent avec le thème.
 */
export function ajouterTileGele(scene, x, y, w, h, duration = 4000) {
    ensureSystem(scene);
    const visual = scene.add.graphics();
    visual.setDepth(DEPTH.SOL ?? DEPTH.ENTITES - 2);
    visual.fillStyle(0x80c0e0, 0.45);
    visual.fillRoundedRect(x, y, w, h, 4);
    visual.lineStyle(1, 0xc0e0ff, 0.6);
    visual.strokeRoundedRect(x, y, w, h, 4);
    visual.setBlendMode(Phaser.BlendModes.ADD);

    scene.tweens.add({
        targets: visual, alpha: 0,
        delay: Math.max(0, duration - 600),
        duration: 600
    });

    const tile = {
        rect: { x, y, w, h }, type: 'gele',
        expiresAt: scene.time.now + duration, visual
    };
    scene[TILES_CLE].push(tile);
    return tile;
}

/**
 * Mur de feu temporaire — DPS gate traversable. Inflige dégâts par tick
 * (event `mutator:mur_feu:hit`) avec cooldown 600 ms.
 */
export function ajouterMurFeu(scene, x, y, w, h, duration = 4000) {
    ensureSystem(scene);
    const visual = scene.add.graphics();
    visual.setDepth(DEPTH.ENTITES ?? 30);
    visual.fillStyle(0xff4020, 0.55);
    visual.fillRect(x, y, w, h);
    visual.fillStyle(0xffa040, 0.4);
    visual.fillRect(x + 2, y + 2, w - 4, h * 0.7);
    visual.fillStyle(0xffff80, 0.55);
    visual.fillRect(x + 4, y + 4, w - 8, h * 0.4);
    visual.setBlendMode(Phaser.BlendModes.ADD);

    // Flicker via scaleY (préserve alpha pour le fade-out final)
    scene.tweens.add({
        targets: visual, scaleY: { from: 0.97, to: 1.03 },
        duration: 140, yoyo: true, repeat: -1, ease: 'Sine.InOut'
    });
    // Fade-out final
    scene.tweens.add({
        targets: visual, alpha: 0,
        delay: Math.max(0, duration - 500),
        duration: 500
    });

    const tile = {
        rect: { x, y, w, h }, type: 'mur_feu',
        expiresAt: scene.time.now + duration, visual
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
