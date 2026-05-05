// Parallaxe — couches lointaines (ciel + silhouettes très éloignées) avec
// scrollFactor inférieur à 1, pour donner un effet de profondeur quand le
// joueur se déplace.
//
// Les silhouettes proches du DecorRegistry restent à scrollFactor 0.7 (modulé
// par DecorRegistry directement). Ici on s'occupe :
//   - de la couche 1 : ciel/abîme avec dégradé vertical (scrollFactor 0)
//   - de la couche 2 : silhouettes très lointaines (scrollFactor 0.3)

import { peindreBatiment } from './elements/Batiment.js';
import { peindreTour } from './elements/Tour.js';
import { peindreDome } from './elements/Dome.js';
import { paletteDuMonde, DEPTH } from './PainterlyRenderer.js';

// ============================================================
// CIEL / ABÎME — dégradé vertical via texture Canvas
// ============================================================

function preparerTextureCiel(scene, monde) {
    const id = `_ciel_${monde}`;
    if (scene.textures.exists(id)) return id;
    const cv = scene.textures.createCanvas(id, 4, 540);
    const ctx = cv.getContext();
    const gradient = ctx.createLinearGradient(0, 0, 0, 540);
    if (monde === 'miroir') {
        gradient.addColorStop(0, '#5a3a20');
        gradient.addColorStop(0.55, '#2a1810');
        gradient.addColorStop(1, '#0a0604');
    } else {
        gradient.addColorStop(0, '#162236');
        gradient.addColorStop(0.55, '#0a1424');
        gradient.addColorStop(1, '#03050c');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 4, 540);
    cv.refresh();
    return id;
}

/**
 * Pose le ciel/abîme : image stretchée à la taille du canvas, fixe à l'écran.
 */
export function poserCiel(scene, monde) {
    const cam = scene.cameras.main;
    const id = preparerTextureCiel(scene, monde);
    const ciel = scene.add.image(cam.width / 2, cam.height / 2, id);
    ciel.setDisplaySize(cam.width, cam.height);
    ciel.setScrollFactor(0); // collé à la caméra (parallax x0 — fond fixe)
    ciel.setDepth(DEPTH.CIEL);
    return ciel;
}

// ============================================================
// ÉTOILES / POUSSIÈRE D'OR — particules très lentes en arrière du ciel
// ============================================================

export function poserEtoilesOuPoussiere(scene, dims, monde) {
    if (!scene.textures.exists('_particule')) return null;
    const palette = paletteDuMonde(monde);
    const enMiroir = monde === 'miroir';

    const config = {
        x: { min: 0, max: dims.largeur },
        y: { min: 0, max: dims.hauteur * 0.7 },
        lifespan: 12000,
        speedY: { min: -3, max: 3 },
        speedX: { min: -3, max: 3 },
        scale: { start: 0.3, end: 0.1 },
        tint: enMiroir ? palette.particule : 0xc8d4ff,
        quantity: 1,
        frequency: 800,
        alpha: { start: 0.6, end: 0 },
        blendMode: enMiroir ? Phaser.BlendModes.ADD : Phaser.BlendModes.NORMAL
    };

    const em = scene.add.particles(0, 0, '_particule', config);
    em.setScrollFactor(0.15); // très peu de parallax — c'est presque un fond
    em.setDepth(DEPTH.CIEL + 1);
    return em;
}

// ============================================================
// SILHOUETTES LOINTAINES — bâtiments/tours/dômes en parallax x0.3
// ============================================================

/**
 * Pose une rangée de silhouettes très lointaines, parallax x0.3, alpha 0.3.
 * Composition seedée par rng.
 */
export function poserSilhouettesLointaines(scene, dims, monde, rng) {
    const palette = paletteDuMonde(monde);
    const ySol = dims.hauteur - 40;

    // 5-7 silhouettes réparties horizontalement, sur une largeur étendue
    // (parce que parallax 0.3 = on voit plus de la couche que la salle elle-même)
    const largeurEtendue = dims.largeur * 1.5;
    const nbSilhouettes = 6;
    const objets = [];

    for (let i = 0; i < nbSilhouettes; i++) {
        const x = (largeurEtendue / nbSilhouettes) * i + (rng() - 0.5) * 60;
        const choix = rng();

        let obj;
        if (choix < 0.35) {
            obj = peindreBatiment(scene, x, ySol, 200 + rng() * 80, 70 + rng() * 30, monde, palette, { silhouette: true });
        } else if (choix < 0.7) {
            obj = peindreTour(scene, x, ySol, 240 + rng() * 100, monde, palette, { silhouette: true });
        } else {
            obj = peindreDome(scene, x, ySol, 40 + rng() * 25, monde, palette, { silhouette: true });
        }

        if (obj) {
            // Ces silhouettes-là sont encore plus lointaines que celles du DecorRegistry
            obj.setScrollFactor(0.3);
            obj.setDepth(DEPTH.SILHOUETTES);
            obj.setAlpha(0.32);
            objets.push(obj);
        }
    }

    return objets;
}
