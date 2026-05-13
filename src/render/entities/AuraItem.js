// AuraItem — aura visuelle autour du joueur selon le tier max équipé Phase 6.
//
// Trois niveaux progressifs :
//   spectral (70-85)   : aura violette douce
//   royal    (85-95)   : trail doré + halo doré pulsant
//   reliquaire (95+)   : aura cramoisie massive + crépitement + cœur du joueur pulse fort
//   perfect (100)      : combo + cycle iridescent
//
// Lit l'équipement à chaque update et calcule le tier max. Recompose le visuel
// si le tier max change.

import { estInstance, tierPourScore, couleurPourScore } from '../../systems/ScoreSystem.js';

export class AuraItem {
    constructor(scene, joueur) {
        this.scene = scene;
        this.joueur = joueur;
        this.tierCourant = null;
        this.scoreMax = 0;
        this.halo = scene.add.graphics().setDepth(35);
        this.halo.setBlendMode(Phaser.BlendModes.ADD);
        this.trailEvent = null;
    }

    update(equipement, time) {
        let scoreMax = 0;
        for (const slot of ['tete', 'corps', 'accessoire']) {
            const entry = equipement[slot];
            if (estInstance(entry)) {
                if (entry.score > scoreMax) scoreMax = entry.score;
            }
        }
        if (scoreMax !== this.scoreMax) {
            this.scoreMax = scoreMax;
            this.reconstruire();
        }
        this.tick(time);
    }

    reconstruire() {
        if (this.trailEvent) {
            this.trailEvent.remove();
            this.trailEvent = null;
        }
        if (this.scoreMax < 70) {
            this.tierCourant = null;
            this.halo.clear();
            return;
        }
        const tier = tierPourScore(this.scoreMax);
        this.tierCourant = tier.id;

        // Trail particules pour royal+ (>=85)
        if (this.scoreMax >= 85) {
            const intervalle = this.scoreMax >= 95 ? 80 : 140;
            this.trailEvent = this.scene.time.addEvent({
                delay: intervalle,
                loop: true,
                callback: () => this._spawnerParticule()
            });
        }
    }

    tick(time) {
        if (!this.tierCourant || !this.joueur || !this.joueur.active) {
            this.halo.clear();
            return;
        }
        const cx = this.joueur.x;
        const cy = this.joueur.y;
        const tier = tierPourScore(this.scoreMax);
        this.halo.clear();

        // Couleur selon score — toujours la couleur du tier (rouge éclatant
        // pour Perfect, pas d'iridescence depuis la refonte palette user).
        const couleur = tier.couleur;

        // Pulse
        const pulse = 0.6 + 0.4 * Math.sin(time / 280);
        const rayonBase = this.scoreMax >= 95 ? 38 : (this.scoreMax >= 85 ? 30 : 24);
        const rayon = rayonBase * (0.85 + 0.15 * pulse);

        this.halo.fillStyle(couleur, 0.18 + 0.12 * pulse);
        this.halo.fillCircle(cx, cy + 4, rayon);
        if (this.scoreMax >= 95) {
            this.halo.fillStyle(couleur, 0.4 * pulse);
            this.halo.fillCircle(cx, cy + 4, rayon * 0.5);
        }
    }

    _spawnerParticule() {
        if (!this.joueur || !this.joueur.active) return;
        const tier = tierPourScore(this.scoreMax);
        const couleur = tier.couleur;
        const px = this.joueur.x + (Math.random() - 0.5) * 14;
        const py = this.joueur.y + (Math.random() - 0.5) * 20;
        const p = this.scene.add.graphics().setDepth(34);
        p.setBlendMode(Phaser.BlendModes.ADD);
        p.fillStyle(couleur, 0.85);
        p.fillCircle(0, 0, 2 + Math.random() * 1.5);
        p.setPosition(px, py);
        this.scene.tweens.add({
            targets: p,
            y: py - 16 - Math.random() * 14,
            alpha: 0,
            duration: 700 + Math.random() * 400,
            onComplete: () => p.destroy()
        });
    }

    destroy() {
        if (this.trailEvent) this.trailEvent.remove();
        this.halo.destroy();
    }
}
