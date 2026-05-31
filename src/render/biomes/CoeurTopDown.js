// Décor VUE DE DESSUS — Cœur du Reflux (Phase 9.11).
//
// Remplace le stack side-scroll (ciel + parallax + brume + rayons) quand la
// salle est en `vue: 'topDown'`. On ne regarde plus un horizon : on regarde le
// SOL d'en haut. Le décor est donc un PLAN — dallage de marbre fissuré, veines
// cramoisi du Reflux, mares de lumière dorée tombée d'en haut, poussière de
// souvenir qui dérive.
//
// Doctrine painterly (cf. mémoire) : peu de Graphics (1 par couche), cohérence
// chromatique ambre/cramoisi, pas de détail max. La pierre froide (fond) porte
// le contraste avec le cramoisi vivant du Reflux (cf. biomes.js coeur_reflux).

import { DEPTH } from '../PainterlyRenderer.js';

// Palette (alignée sur coeur_reflux.paletteBiome, réinterprétée à plat)
const SOL_BASE     = 0x14131f;  // ardoise froide profonde
const SOL_DALLE    = 0x211d30;  // joints de dallage (un cran plus clair)
const FISSURE      = 0x7a2030;  // marbre fendu cramoisi sombre
const VEINE        = 0xff2030;  // veine incandescente du Reflux (ADD)
const LUEUR_OR     = 0xc06030;  // halo de lumière tombée (ADD)
const LUEUR_OR_VIF = 0xffcc66;  // cœur de la mare lumineuse (ADD)
const MOTE         = 0xffb060;  // poussière de souvenir dorée

/**
 * Compose tout le décor top-down d'une salle Cœur. À appeler à la place du
 * stack side-scroll. Tous les éléments sont posés en coordonnées absolues
 * (caméra figée 960×540).
 *
 * @param {Phaser.Scene} scene
 * @param {{largeur:number, hauteur:number}} dims
 * @param {Function} [rng]  RNG seedé (sinon Math.random)
 * @returns {object} refs (pour nettoyage éventuel)
 */
export function composerCoeurTopDown(scene, dims, rng) {
    const W = dims.largeur, H = dims.hauteur;
    const r = (typeof rng === 'function') ? rng : Math.random;

    // ── 1. Sol : base ardoise + dallage régulier (lecture « surface ») ──
    const sol = scene.add.graphics();
    sol.setDepth(DEPTH.CIEL);               // sous tout
    sol.fillStyle(SOL_BASE, 1);
    sol.fillRect(0, 0, W, H);
    sol.lineStyle(1, SOL_DALLE, 0.9);
    const pas = 120;
    for (let x = pas; x < W; x += pas) sol.lineBetween(x, 0, x, H);
    for (let y = pas; y < H; y += pas) sol.lineBetween(0, y, W, y);

    // ── 2. Fissures cramoisi : lignes brisées qui rampent sur le marbre ──
    const cracks = scene.add.graphics();
    cracks.setDepth(DEPTH.CIEL + 1);
    cracks.lineStyle(2, FISSURE, 0.5);
    for (let i = 0; i < 6; i++) {
        let px = r() * W, py = r() * H;
        cracks.beginPath();
        cracks.moveTo(px, py);
        const seg = 3 + Math.floor(r() * 3);
        for (let s = 0; s < seg; s++) {
            px += (r() - 0.5) * 240;
            py += (r() - 0.5) * 240;
            cracks.lineTo(px, py);
        }
        cracks.strokePath();
    }

    // ── 3. Veines incandescentes du Reflux : convergent vers le centre,
    //       pulsent lentement (rythme cardiaque). 1 Graphics ADD + 1 tween. ──
    const veines = scene.add.graphics();
    veines.setDepth(DEPTH.CIEL + 2);
    veines.setBlendMode(Phaser.BlendModes.ADD);
    const cx = W / 2, cy = H / 2;
    veines.lineStyle(3, VEINE, 0.22);
    for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + r() * 0.6;
        const ex = cx + Math.cos(a) * W * 0.62;
        const ey = cy + Math.sin(a) * H * 0.62;
        // veine légèrement coudée (point de contrôle décalé)
        const mx = cx + Math.cos(a) * W * 0.30 + (r() - 0.5) * 60;
        const my = cy + Math.sin(a) * H * 0.30 + (r() - 0.5) * 60;
        veines.beginPath();
        veines.moveTo(cx, cy);
        veines.lineTo(mx, my);
        veines.lineTo(ex, ey);
        veines.strokePath();
    }
    const tweenVeines = scene.tweens.add({
        targets: veines,
        alpha: { from: 0.55, to: 1 },
        duration: 1000,                 // ~60 BPM : le Cœur bat
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });

    // ── 4. Mares de lumière : rais d'or tombés d'en haut, rendus au sol ──
    const pools = scene.add.graphics();
    pools.setDepth(DEPTH.DECOR_MILIEU);
    pools.setBlendMode(Phaser.BlendModes.ADD);
    const nbPools = 3;
    for (let i = 0; i < nbPools; i++) {
        const px = (i + 1) * (W / (nbPools + 1)) + (r() - 0.5) * 70;
        const py = H * 0.28 + r() * H * 0.44;
        const rad = 95 + r() * 60;
        pools.fillStyle(LUEUR_OR, 0.05);
        pools.fillCircle(px, py, rad);
        pools.fillStyle(LUEUR_OR_VIF, 0.045);
        pools.fillCircle(px, py, rad * 0.55);
    }

    // ── 5. Poussière de souvenir : motes dorés qui dérivent lentement ──
    let motes = null;
    if (scene.textures.exists('_particule')) {
        motes = scene.add.particles(0, 0, '_particule', {
            x: { min: 0, max: W },
            y: { min: 0, max: H },
            lifespan: 7000,
            speed: { min: 4, max: 16 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.5, end: 0 },
            tint: MOTE,
            blendMode: 'ADD',
            frequency: 220,
            quantity: 1
        });
        motes.setDepth(DEPTH.PARTICULES);
    }

    return { sol, cracks, veines, tweenVeines, pools, motes };
}
