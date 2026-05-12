// Auras visuelles par tier de rareté.
//
// Attaché à un Enemy via `attacherAura(scene, enemy)` qui retourne un handle
// `{ halo, particles, tier }`. Le suivi de position est fait par Enemy.update
// (cf. méthode `suivreAura`). Cleanup via `detruireAura` à la mort.
//
// Style "painterly" cohérent avec le reste du projet : Graphics + Particles,
// pas d'asset externe. Halo = 3 cercles concentriques semi-transparents en
// blend ADD pour donner un effet de glow doux.

import { TIERS } from '../../systems/RaritySystem.js';
import { DEPTH } from '../PainterlyRenderer.js';

const COULEUR_TIER = {
    [TIERS.ELITE]:      0xffd060, // doré
    [TIERS.RARE]:       0xd8d8e8, // argenté
    [TIERS.LEGENDAIRE]: 0xff3040  // cramoisi
};

// Multiplicateur du rayon de base (dérivé de la diagonale ennemi)
const RAYON_MULT_TIER = {
    [TIERS.ELITE]:      0.85,
    [TIERS.RARE]:       1.05,
    [TIERS.LEGENDAIRE]: 1.45
};

const PULSE_HZ_TIER = {
    [TIERS.ELITE]:      1.5,
    [TIERS.RARE]:       1.2,
    [TIERS.LEGENDAIRE]: 1.8
};

/**
 * Crée halo + particules pour un ennemi tagué non-commun. No-op pour Commun.
 * Déclenche un screen-shake initial pour Légendaire.
 */
export function attacherAura(scene, enemy) {
    const tier = enemy?.def?.rarete;
    if (!tier || tier === TIERS.COMMUN) return null;

    const couleur = COULEUR_TIER[tier];
    if (couleur == null) return null;

    const w = enemy.def.largeur, h = enemy.def.hauteur;
    const rayonBase = Math.max(w, h) * 0.6 * (RAYON_MULT_TIER[tier] ?? 1);

    // ── Halo : 3 cercles concentriques en blend ADD ──
    const halo = scene.add.graphics();
    halo.setDepth(DEPTH.ENTITES - 1); // derrière l'ennemi
    halo.setBlendMode(Phaser.BlendModes.ADD);
    halo.fillStyle(couleur, 0.16);
    halo.fillCircle(0, 0, rayonBase * 1.4);
    halo.fillStyle(couleur, 0.28);
    halo.fillCircle(0, 0, rayonBase * 1.0);
    halo.fillStyle(couleur, 0.42);
    halo.fillCircle(0, 0, rayonBase * 0.62);

    // Pulse infini
    const pulseHz = PULSE_HZ_TIER[tier];
    const pulseTween = scene.tweens.add({
        targets: halo,
        scale: { from: 0.88, to: 1.18 },
        alpha: { from: 0.95, to: 0.55 },
        duration: 1000 / pulseHz / 2,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut'
    });

    // ── Particules ascensionnelles (Rare + Légendaire) ──
    let particles = null;
    if (scene.textures.exists('_particule') && tier !== TIERS.ELITE) {
        const lourd = tier === TIERS.LEGENDAIRE;
        particles = scene.add.particles(0, 0, '_particule', {
            lifespan: lourd ? 720 : 600,
            speed: { min: 25, max: 65 },
            angle: { min: 250, max: 290 },         // vers le haut
            scale: { start: 0.45, end: 0 },
            tint: couleur,
            quantity: lourd ? 2 : 1,
            frequency: lourd ? 90 : 180,
            blendMode: Phaser.BlendModes.ADD,
            alpha: { start: 0.9, end: 0 }
        });
        particles.setDepth(DEPTH.ENTITES + 1);
    }

    // ── Screen-shake initial pour Légendaire ──
    if (tier === TIERS.LEGENDAIRE && scene.cameras?.main) {
        scene.cameras.main.shake(220, 0.009);
    }

    return { halo, particles, tier, pulseTween };
}

/** Met à jour la position du halo + des particules. */
export function suivreAura(aura, x, y) {
    if (!aura) return;
    if (aura.halo?.active) aura.halo.setPosition(x, y);
    if (aura.particles?.active) aura.particles.setPosition(x, y);
}

/** Détruit halo + particules + arrête le tween. À appeler à la mort. */
export function detruireAura(aura) {
    if (!aura) return;
    aura.pulseTween?.stop?.();
    aura.halo?.destroy();
    aura.particles?.destroy();
}
