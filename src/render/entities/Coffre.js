// Coffre — visuel avec couvercle articulé pour animation d'ouverture.
//
// Structure :
//   container (centre = pivot du coffre)
//   ├── corps    : Graphics du coffre (rectangle bois + cerclages dorés)
//   ├── couvercle: Container séparé (pour rotation autour de la charnière arrière)
//   │   └── couvercleGfx : Graphics (trapèze + serrure)
//   └── (au moment de l'ouverture, on ajoute particules + cube item)

import { DEPTH } from '../PainterlyRenderer.js';
import { COULEURS_FAMILLE } from '../../data/items.js';

const COUL_BOIS = 0x3a2818;
const COUL_BOIS_CLAIR = 0x5a3a20;
const COUL_OR = 0xc8a85a;
const COUL_OR_CLAIR = 0xffd070;

export function creerVisuelCoffre(scene, x, y, largeur, hauteur) {
    const container = scene.add.container(x, y);
    container.setDepth(DEPTH.DECOR_AVANT);

    const w = largeur, h = hauteur;
    const hCorps = h * 0.75;
    const hCouvercle = h * 0.45;
    const yCorpsTop = h / 2 - hCorps;     // top du corps (relative au centre du conteneur)

    // --- Corps du coffre ---
    const corps = scene.add.graphics();
    // Ombre
    corps.fillStyle(0x1a0c08, 1);
    corps.fillRect(-w / 2 - 1, yCorpsTop, w + 2, hCorps + 1);
    // Bois principal
    corps.fillStyle(COUL_BOIS, 1);
    corps.fillRect(-w / 2, yCorpsTop, w, hCorps);
    // Veines bois (simulées par lignes verticales)
    corps.lineStyle(1, COUL_BOIS_CLAIR, 0.5);
    for (let i = -w / 2 + 4; i < w / 2; i += 5) {
        corps.beginPath();
        corps.moveTo(i, yCorpsTop + 2);
        corps.lineTo(i + 1, yCorpsTop + hCorps - 1);
        corps.strokePath();
    }
    // 2 cerclages dorés
    corps.fillStyle(COUL_OR, 1);
    corps.fillRect(-w / 2, yCorpsTop + hCorps * 0.3, w, 2);
    corps.fillRect(-w / 2, yCorpsTop + hCorps * 0.7, w, 2);
    container.add(corps);

    // --- Couvercle (Container pour pivot) ---
    // Pivot au bord arrière (haut-arrière du coffre vu de profil) :
    // on positionne le container du couvercle à (x_centre, y_haut_corps),
    // et on dessine le couvercle "vers l'avant" (en y négatif relatif)
    const couvercle = scene.add.container(0, yCorpsTop);

    const couvGfx = scene.add.graphics();
    // Ombre
    couvGfx.fillStyle(0x1a0c08, 1);
    couvGfx.beginPath();
    couvGfx.moveTo(-w / 2 - 1, 1);
    couvGfx.lineTo(w / 2 + 1, 1);
    couvGfx.lineTo(w / 2 - 2, -hCouvercle);
    couvGfx.lineTo(-w / 2 + 2, -hCouvercle);
    couvGfx.closePath();
    couvGfx.fillPath();
    // Trapèze bois (légèrement plus large en bas qu'en haut)
    couvGfx.fillStyle(COUL_BOIS, 1);
    couvGfx.beginPath();
    couvGfx.moveTo(-w / 2, 0);
    couvGfx.lineTo(w / 2, 0);
    couvGfx.lineTo(w / 2 - 3, -hCouvercle);
    couvGfx.lineTo(-w / 2 + 3, -hCouvercle);
    couvGfx.closePath();
    couvGfx.fillPath();
    // Bord supérieur clair (highlight)
    couvGfx.fillStyle(COUL_BOIS_CLAIR, 0.8);
    couvGfx.fillRect(-w / 2 + 3, -hCouvercle, w - 6, 2);
    // Cerclages dorés (haut + bas)
    couvGfx.fillStyle(COUL_OR, 1);
    couvGfx.fillRect(-w / 2 + 3, -hCouvercle + 1, w - 6, 1);
    couvGfx.fillRect(-w / 2, -1, w, 2);
    // Serrure dorée au centre
    couvGfx.fillStyle(0x1a0c08, 1);
    couvGfx.fillCircle(0, -hCouvercle / 2, 3);
    couvGfx.fillStyle(COUL_OR, 1);
    couvGfx.fillCircle(0, -hCouvercle / 2, 2.2);
    couvGfx.fillStyle(COUL_OR_CLAIR, 1);
    couvGfx.fillCircle(-0.5, -hCouvercle / 2 - 0.5, 0.8);

    couvercle.add(couvGfx);
    container.add(couvercle);

    return { container, couvercle, corps };
}

/**
 * Joue l'animation d'ouverture : couvercle pivote, étincelles, item qui sort.
 *
 * @param {Phaser.Scene} scene
 * @param {Object} visuel  retour de creerVisuelCoffre
 * @param {string} familleItem  'blanc' | 'bleu' | 'noir' (couleur du loot révélé)
 * @param {Function} onComplete  appelé quand le cube atteint le joueur
 * @param {{x:number,y:number}} cible  position du joueur (centre)
 */
export function jouerOuvertureCoffre(scene, visuel, familleItem, cible, onComplete) {
    const { container, couvercle } = visuel;

    // 1. Couvercle pivote vers l'arrière (rotation négative en degrés)
    scene.tweens.add({
        targets: couvercle,
        angle: -110,
        duration: 280,
        ease: 'Cubic.Out'
    });

    // 2. Burst d'étincelles dorées
    if (scene.textures.exists('_particule')) {
        const burst = scene.add.particles(container.x, container.y - 8, '_particule', {
            lifespan: 700,
            speed: { min: 50, max: 120 },
            scale: { start: 0.5, end: 0 },
            tint: [COUL_OR_CLAIR, COUL_OR],
            quantity: 24,
            blendMode: Phaser.BlendModes.ADD,
            angle: { min: -110, max: -70 },
            alpha: { start: 1, end: 0 }
        });
        burst.setDepth(DEPTH.EFFETS);
        burst.explode(24);
        scene.time.delayedCall(800, () => burst.destroy());
    }

    // 3. Cube coloré qui sort du coffre et flotte vers le joueur
    const couleurFam = COULEURS_FAMILLE[familleItem] ?? 0xe8e4d8;
    const cube = scene.add.rectangle(container.x, container.y - 4, 14, 14, couleurFam);
    cube.setDepth(DEPTH.EFFETS);
    cube.setBlendMode(Phaser.BlendModes.ADD);
    // Halo derrière le cube
    const halo = scene.add.graphics();
    halo.setBlendMode(Phaser.BlendModes.ADD);
    halo.setDepth(DEPTH.EFFETS - 1);
    halo.fillStyle(couleurFam, 0.5);
    halo.fillCircle(0, 0, 14);
    halo.setPosition(cube.x, cube.y);

    const updHalo = () => {
        if (!halo.active || !cube.active) return;
        halo.setPosition(cube.x, cube.y);
    };
    scene.events.on('postupdate', updHalo);

    // Saut puis vol vers le joueur (chain remplace timeline depuis Phaser 3.60+)
    scene.tweens.chain({
        targets: cube,
        tweens: [
            { y: container.y - 30, duration: 220, ease: 'Cubic.Out' },
            {
                x: cible.x, y: cible.y,
                alpha: { from: 1, to: 0 },
                duration: 360, ease: 'Cubic.In'
            }
        ],
        onComplete: () => {
            scene.events.off('postupdate', updHalo);
            cube.destroy();
            halo.destroy();
            if (onComplete) onComplete();
        }
    });
}

/**
 * Met le coffre en mode "vide" : couleur tamisée, fade léger.
 */
export function fermerCoffreVide(scene, visuel) {
    const { container } = visuel;
    scene.tweens.add({
        targets: container,
        alpha: 0.45,
        duration: 600,
        ease: 'Cubic.Out'
    });
}
