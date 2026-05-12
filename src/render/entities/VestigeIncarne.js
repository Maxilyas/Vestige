// VestigeIncarne — silhouette enrichie du héros après fusion avec l'Artefact.
//
// Phase 5c. Sert deux usages :
//   1. Dans GameScene au moment de la cinématique de fusion (remplace le
//      JoueurVisuel à la fin de l'absorption de l'Artefact).
//   2. Dans FinScene en hero shot central immobile.
//
// Garde les proportions du JoueurVisuel (tête à -14, jambes à 18) pour que le
// cross-fade entre silhouette d'ombre et personnage incarné soit cohérent.
//
// Palette signature (cf. CLAUDE.md, design Phase 5c) :
//   - peau ivoire patiné, sous-tons dorés
//   - manteau bleu-violet profond avec broderies d'or fracturé
//   - plastron de cuir sombre avec sigil doré central
//   - couronne discrète d'or fracturé sur le front
//   - yeux dorés lumineux (la Résonance a migré vers le regard)
//   - cœur stable doré (cohérence retrouvée)

import { DEPTH } from '../PainterlyRenderer.js';

const C_PEAU       = 0xe8d8a8; // ivoire patiné
const C_PEAU_OMBRE = 0xb89868; // ombre peau
const C_MANTEAU    = 0x2c1c4a; // bleu-violet profond
const C_MANTEAU_LUM = 0x5a3c8c; // reflet manteau
const C_PLASTRON   = 0x1a1018; // cuir sombre presque noir
const C_OR         = 0xffd070;
const C_OR_VIF     = 0xfff0a0;
const C_FRAGMENT_BL = 0x6a98d8; // fragment azur à la ceinture
const C_FRAGMENT_NR = 0x3a1840; // fragment obsidienne à la ceinture

export class VestigeIncarne {
    /**
     * @param {Phaser.Scene} scene
     * @param {object} [opts]
     * @param {number} [opts.scale=1] échelle globale (utiliser 2-3 pour hero shot)
     * @param {boolean} [opts.alpha=1] alpha initial (0 pour fade-in)
     * @param {boolean} [opts.particules=true] particules dorées ascensionnelles
     */
    constructor(scene, opts = {}) {
        this.scene = scene;
        this.direction = 1;
        const scale = opts.scale ?? 1;
        const alpha = opts.alpha ?? 1;
        const avecParticules = opts.particules !== false;

        // --- Conteneur principal ---
        this.container = scene.add.container(0, 0);
        this.container.setDepth(DEPTH.ENTITES);
        this.container.setAlpha(alpha);

        // --- Manteau (derrière le corps) ---
        // Sous-container séparé pour pouvoir l'animer (ondulation)
        this.manteau = scene.add.graphics();
        this._dessinerManteau(this.manteau);
        this.container.add(this.manteau);

        // --- Corps (plastron + bras + jambes + tête) ---
        this.corps = scene.add.graphics();
        this._dessinerCorps(this.corps);
        this.container.add(this.corps);

        // --- Détails dorés (couronne, sigil, ornements manteau) ---
        this.ornements = scene.add.graphics();
        this._dessinerOrnements(this.ornements);
        this.container.add(this.ornements);

        // --- Yeux dorés lumineux ---
        this.yeux = scene.add.graphics();
        this.yeux.setBlendMode(Phaser.BlendModes.ADD);
        this._dessinerYeux(this.yeux);
        this.container.add(this.yeux);

        // --- Cœur central doré stable ---
        this.coeur = scene.add.graphics();
        this.coeur.setBlendMode(Phaser.BlendModes.ADD);
        this._dessinerCoeur(this.coeur);
        this.container.add(this.coeur);

        this.container.setScale(scale);

        // --- Animations idle ---
        this.tweenIdle = scene.tweens.add({
            targets: this.container,
            scaleY: { from: scale, to: scale * 1.02 },
            duration: 1800,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
        this.tweenCoeur = scene.tweens.add({
            targets: this.coeur,
            alpha: { from: 0.85, to: 1 },
            duration: 1200,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
        this.tweenYeux = scene.tweens.add({
            targets: this.yeux,
            alpha: { from: 0.85, to: 1 },
            duration: 1500,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
        // Manteau ondulant
        this.tweenManteau = scene.tweens.add({
            targets: this.manteau,
            scaleX: { from: 1, to: 1.04 },
            duration: 2200,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });

        // --- Particules dorées ascensionnelles ---
        this.particules = [];
        if (avecParticules) {
            this._spawnerParticules(scale);
        }

        scene.events.once('shutdown', () => this.detruire());
    }

    _dessinerManteau(g) {
        g.clear();
        // Capuche / collerette derrière la tête
        g.fillStyle(C_MANTEAU, 1);
        g.beginPath();
        g.moveTo(-10, -16);
        g.lineTo(10, -16);
        g.lineTo(12, -6);
        g.lineTo(-12, -6);
        g.closePath();
        g.fillPath();
        // Pan principal derrière le corps (large vers le bas)
        g.fillStyle(C_MANTEAU, 0.95);
        g.beginPath();
        g.moveTo(-10, -8);
        g.lineTo(10, -8);
        g.lineTo(16, 22);
        g.lineTo(-16, 22);
        g.closePath();
        g.fillPath();
        // Reflet de lumière sur un bord du manteau
        g.fillStyle(C_MANTEAU_LUM, 0.5);
        g.beginPath();
        g.moveTo(-10, -6);
        g.lineTo(-7, -6);
        g.lineTo(-13, 22);
        g.lineTo(-16, 22);
        g.closePath();
        g.fillPath();
    }

    _dessinerCorps(g) {
        g.clear();
        // Cou
        g.fillStyle(C_PEAU_OMBRE, 1);
        g.fillRect(-2, -10, 4, 4);
        // Tête
        g.fillStyle(C_PEAU, 1);
        g.fillCircle(0, -14, 6);
        // Ombre douce côté gauche du visage
        g.fillStyle(C_PEAU_OMBRE, 0.45);
        g.fillCircle(-2, -13, 4);
        // Plastron (torse) — cuir sombre
        g.fillStyle(C_PLASTRON, 1);
        g.beginPath();
        g.moveTo(-7, -7);
        g.lineTo(7, -7);
        g.lineTo(5, 8);
        g.lineTo(-5, 8);
        g.closePath();
        g.fillPath();
        // Bras (peau visible)
        g.fillStyle(C_PEAU, 1);
        g.fillRect(-9, -5, 3, 11);
        g.fillRect(6, -5, 3, 11);
        // Bordure dorée des manches
        g.fillStyle(C_OR, 0.8);
        g.fillRect(-9, 5, 3, 1);
        g.fillRect(6, 5, 3, 1);
        // Jambes (cuir sombre, comme bottes hautes)
        g.fillStyle(C_PLASTRON, 1);
        g.fillRect(-4, 8, 3, 10);
        g.fillRect(1, 8, 3, 10);
    }

    _dessinerOrnements(g) {
        g.clear();
        // Couronne discrète d'or fracturé sur le front (arc + 3 pointes)
        g.fillStyle(C_OR, 1);
        g.fillRect(-5, -19, 10, 1);
        g.fillTriangle(-4, -19, -3, -22, -2, -19);
        g.fillTriangle(-1, -19, 0,  -23, 1,  -19);
        g.fillTriangle(2,  -19, 3,  -22, 4,  -19);
        // Sigil doré au centre du plastron (losange + cercle)
        g.fillStyle(C_OR, 1);
        g.fillTriangle(0, -3, 3, 0, 0, 3);
        g.fillTriangle(0, -3, -3, 0, 0, 3);
        g.fillStyle(C_OR_VIF, 1);
        g.fillCircle(0, 0, 1);
        // Broderies d'or sur le manteau (3 traits courts en bas)
        g.fillStyle(C_OR, 0.85);
        g.fillRect(-12, 18, 3, 1);
        g.fillRect(-1, 19, 2, 1);
        g.fillRect(9, 18, 3, 1);
        // Ceinture : éclats de fragments (les 3 familles)
        g.fillStyle(0xe8e4d8, 1);
        g.fillCircle(-4, 8, 1.2);
        g.fillStyle(C_FRAGMENT_BL, 1);
        g.fillCircle(0, 9, 1.2);
        g.fillStyle(C_FRAGMENT_NR, 1);
        g.fillCircle(4, 8, 1.2);
    }

    _dessinerYeux(g) {
        g.clear();
        // 2 petits points dorés lumineux
        g.fillStyle(C_OR_VIF, 0.7);
        g.fillCircle(-2, -14, 1.4);
        g.fillCircle(2, -14, 1.4);
        g.fillStyle(0xffffff, 0.9);
        g.fillCircle(-2, -14, 0.6);
        g.fillCircle(2, -14, 0.6);
    }

    _dessinerCoeur(g) {
        g.clear();
        // Halo doré stable
        g.fillStyle(C_OR, 0.35);
        g.fillCircle(0, 0, 8);
        g.fillStyle(C_OR, 0.85);
        g.fillCircle(0, 0, 3.5);
        g.fillStyle(C_OR_VIF, 0.9);
        g.fillCircle(0, 0, 1.5);
    }

    _spawnerParticules(scale) {
        // Spawn périodique de particules dorées ascensionnelles autour du corps
        this.particuleTimer = this.scene.time.addEvent({
            delay: 220,
            loop: true,
            callback: () => {
                const x = this.container.x + (Math.random() - 0.5) * 26 * scale;
                const y = this.container.y + (Math.random() * 4 + 14) * scale;
                const p = this.scene.add.circle(x, y, 1.4 * scale, C_OR_VIF, 0.85);
                p.setBlendMode(Phaser.BlendModes.ADD);
                p.setDepth(DEPTH.ENTITES);
                this.particules.push(p);
                this.scene.tweens.add({
                    targets: p,
                    y: y - (40 + Math.random() * 40) * scale,
                    alpha: { from: 0.85, to: 0 },
                    duration: 1400 + Math.random() * 600,
                    ease: 'Sine.Out',
                    onComplete: () => {
                        p.destroy();
                        const idx = this.particules.indexOf(p);
                        if (idx !== -1) this.particules.splice(idx, 1);
                    }
                });
            }
        });
    }

    setPosition(x, y) {
        this.container.setPosition(x, y);
    }

    setDirection(dir) {
        if (dir !== this.direction) {
            this.direction = dir;
            const baseScale = this.container.scaleY / 1; // approximatif, on garde l'échelle
            this.container.scaleX = dir * Math.abs(this.container.scaleX);
        }
    }

    setAlpha(a) {
        this.container.setAlpha(a);
    }

    /** Flash doré sur l'apparition (fusion). */
    flashOr() {
        const flash = this.scene.add.graphics();
        flash.fillStyle(C_OR_VIF, 0.8);
        flash.fillCircle(this.container.x, this.container.y, 80);
        flash.setBlendMode(Phaser.BlendModes.ADD);
        flash.setDepth(DEPTH.ENTITES);
        this.scene.tweens.add({
            targets: flash,
            alpha: 0, scale: 2.5,
            duration: 700,
            ease: 'Quad.Out',
            onComplete: () => flash.destroy()
        });
    }

    detruire() {
        this.tweenIdle?.stop();
        this.tweenCoeur?.stop();
        this.tweenYeux?.stop();
        this.tweenManteau?.stop();
        this.particuleTimer?.remove();
        for (const p of this.particules) p.destroy();
        this.particules.length = 0;
        this.container.destroy();
    }
}
