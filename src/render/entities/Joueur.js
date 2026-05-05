// JoueurVisuel — silhouette stylisée du Vestige avec cœur lumineux réactif.
//
// Lore : le joueur est un fragment de conscience entre deux mondes. Son corps
// vient du Présent (silhouette sombre), son âme vient du Miroir (cœur lumineux
// visible à travers la chair). La couleur du cœur reflète sa Résonance —
// quand elle baisse, le cœur s'assombrit et vire au rouge.
//
// Implémentation : Container Phaser qui suit le Rectangle physique du joueur
// via setPosition() chaque frame (le Rectangle reste pour la collision).

import { DEPTH } from '../PainterlyRenderer.js';
import { RESONANCE_CLE, RESONANCE_MAX } from '../../systems/ResonanceSystem.js';
import { PLAYER } from '../../config.js';

const COULEUR_CORPS = 0x1a1a24;

// Couleur du cœur selon le pourcentage de Résonance (0..100)
function couleurCoeur(pct) {
    if (pct >= 70) return 0xe8f0ff; // blanc bleuté serein
    if (pct >= 40) return 0xffd070; // ambre clair
    if (pct >= 20) return 0xff8040; // ambre vif
    if (pct > 0)  return 0xff4040;  // rouge inquiet
    return 0x3a1010;                // quasi noir vacillant
}

export class JoueurVisuel {
    constructor(scene) {
        this.scene = scene;
        this.direction = 1;
        this.dernierAuSol = true;

        // --- Conteneur principal ---
        this.container = scene.add.container(0, 0);
        this.container.setDepth(DEPTH.ENTITES);

        // --- Silhouette ---
        this.silhouette = scene.add.graphics();
        this._dessinerSilhouette(this.silhouette);
        this.container.add(this.silhouette);

        // --- Cœur lumineux (additif, pulse continu) ---
        this.coeur = scene.add.graphics();
        this.coeur.setBlendMode(Phaser.BlendModes.ADD);
        this._dessinerCoeur(0xe8f0ff);
        this.container.add(this.coeur);

        // --- Animation idle : respiration verticale très subtile ---
        this.tweenIdle = scene.tweens.add({
            targets: this.container,
            scaleY: { from: 1, to: 1.02 },
            duration: 1500,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });

        // --- Pulse du cœur ---
        this.tweenCoeur = scene.tweens.add({
            targets: this.coeur,
            alpha: { from: 0.85, to: 1 },
            duration: 900,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });

        // --- Listener Résonance : couleur du cœur ---
        const handler = (_p, valeur) => this._dessinerCoeur(couleurCoeur(valeur));
        scene.registry.events.on(`changedata-${RESONANCE_CLE}`, handler);
        scene.events.once('shutdown', () => {
            scene.registry.events.off(`changedata-${RESONANCE_CLE}`, handler);
            this.tweenIdle?.stop();
            this.tweenCoeur?.stop();
        });

        // Init couleur cœur depuis valeur courante
        const v = scene.registry.get(RESONANCE_CLE) ?? RESONANCE_MAX;
        this._dessinerCoeur(couleurCoeur(v));
    }

    _dessinerSilhouette(g) {
        g.clear();
        g.fillStyle(COULEUR_CORPS, 1);
        // Tête : petit cercle haut
        g.fillCircle(0, -14, 6);
        // Cou (court)
        g.fillRect(-2, -10, 4, 3);
        // Torse : trapèze légèrement évasé
        g.beginPath();
        g.moveTo(-7, -7);
        g.lineTo(7, -7);
        g.lineTo(5, 8);
        g.lineTo(-5, 8);
        g.closePath();
        g.fillPath();
        // Bras suggérés (2 traits qui suivent le torse)
        g.fillRect(-9, -5, 3, 11);
        g.fillRect(6, -5, 3, 11);
        // Jambes : 2 rectangles fins
        g.fillRect(-4, 8, 3, 10);
        g.fillRect(1, 8, 3, 10);
    }

    _dessinerCoeur(couleur) {
        this.coeur.clear();
        // Halo extérieur diffus
        this.coeur.fillStyle(couleur, 0.4);
        this.coeur.fillCircle(0, -1, 8);
        // Cœur principal
        this.coeur.fillStyle(couleur, 0.85);
        this.coeur.fillCircle(0, -1, 4);
        // Pointe centrale très claire
        this.coeur.fillStyle(0xffffff, 0.7);
        this.coeur.fillCircle(0, -1, 1.5);
    }

    // Appelé chaque frame depuis GameScene avec la position du Rectangle physique
    setPosition(x, y) {
        this.container.setPosition(x, y);
    }

    setDirection(dir) {
        if (dir !== this.direction) {
            this.direction = dir;
            this.container.scaleX = dir;
        }
    }

    /**
     * Met à jour l'animation selon l'état physique :
     *   - au sol + immobile         → idle
     *   - au sol + vitesse          → marche (bobs)
     *   - en l'air, vy < 0          → saut (stretch)
     *   - en l'air, vy > 0          → chute (squash léger)
     *   - retour au sol             → atterrissage (squash bref)
     */
    setEtat({ auSol, vx, vy }) {
        const enMouvement = Math.abs(vx) > 5;

        if (auSol && !this.dernierAuSol) {
            // Atterrissage : squash bref
            this.scene.tweens.add({
                targets: this.container,
                scaleX: { from: this.direction * 1.15, to: this.direction * 1 },
                scaleY: { from: 0.85, to: 1 },
                duration: 140,
                ease: 'Cubic.Out'
            });
        }
        this.dernierAuSol = auSol;

        if (!auSol) {
            // En l'air : un peu d'allongement vertical pour sentir le saut
            const stretch = vy < 0 ? 1.06 : 1.02;
            this.container.scaleY = stretch;
            this.container.scaleX = this.direction * (vy < 0 ? 0.94 : 0.98);
            // Pause du tween idle pendant le saut
            if (this.tweenIdle.isPlaying()) this.tweenIdle.pause();
        } else {
            // Au sol : reprend le tween idle, scaleX = direction
            this.container.scaleX = this.direction;
            if (this.tweenIdle.paused) this.tweenIdle.resume();
            // Marche : petit bobs vertical via offset Y additionnel
            // (on ne touche pas à la position du container parce qu'elle est
            //  contrôlée par le Rectangle physique — donc on tweak Y du visuel
            //  via la propriété y des Graphics enfants au besoin. Pour simplicité,
            //  on laisse le tween idle gérer l'animation au sol pour MVP.)
        }
    }

    flashBlanc() {
        this.scene.tweens.add({
            targets: this.silhouette,
            alpha: { from: 1, to: 0.3 },
            yoyo: true,
            repeat: 1,
            duration: 80
        });
    }

    flashRouge() {
        // Teinte rouge brève sur la silhouette via tween de redessinage
        const original = COULEUR_CORPS;
        this.silhouette.clear();
        this.silhouette.fillStyle(0xff6060, 1);
        this._redessinerForme();
        this.scene.time.delayedCall(120, () => {
            this.silhouette.clear();
            this.silhouette.fillStyle(original, 1);
            this._redessinerForme();
        });
        // Tremblement (shake) sur le container
        this.scene.tweens.add({
            targets: this.container,
            x: { from: this.container.x - 3, to: this.container.x + 3 },
            yoyo: true,
            repeat: 3,
            duration: 40
        });
    }

    _redessinerForme() {
        const g = this.silhouette;
        g.fillCircle(0, -14, 6);
        g.fillRect(-2, -10, 4, 3);
        g.beginPath();
        g.moveTo(-7, -7);
        g.lineTo(7, -7);
        g.lineTo(5, 8);
        g.lineTo(-5, 8);
        g.closePath();
        g.fillPath();
        g.fillRect(-9, -5, 3, 11);
        g.fillRect(6, -5, 3, 11);
        g.fillRect(-4, 8, 3, 10);
        g.fillRect(1, 8, 3, 10);
    }

    detruire() {
        this.tweenIdle?.stop();
        this.tweenCoeur?.stop();
        this.container.destroy();
    }
}
