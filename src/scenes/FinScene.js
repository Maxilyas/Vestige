// FinScene — écran de fin du mini-jeu (Phase 5c).
//
// Lancée automatiquement à la fin de la cinématique de fusion (cf.
// `CinematiqueFusion.js`) après défaite du Souverain du Reflux.
//
// Composition :
//   - Fond noir profond avec particules dorées flottantes
//   - Hero shot central : VestigeIncarne en pose immobile
//   - Texte poétique défilant ligne par ligne (typewriter-like fade)
//   - 3 boutons : Recommencer / Rester contempler / Quitter
//
// "Recommencer" → recharge la page (registry vidé, run reset, mais localStorage
// préservé donc sceaux + carte + identifications + marker fin conservés).
// "Rester contempler" → masque les boutons, on reste sur le tableau.
// "Quitter" → fade noir + message d'adieu (le menu démarrage viendra en 5c.1).

import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { VestigeIncarne } from '../render/entities/VestigeIncarne.js';
import { getAudioSystem } from '../systems/AudioSystem.js';

const C_OR = 0xffd070;
const C_OR_VIF = 0xfff0a0;
const C_OR_CSS = '#ffd070';
const C_TEXT_CSS = '#e8d8a8';
const C_SUBTLE_CSS = '#8a7a5a';

// Texte poétique de fin — éditorialisé dans le style LORE.md.
// Chaque entrée = une ligne. Une ligne vide produit un saut visuel (pause).
const LIGNES_FIN = [
    "Au commencement, tu n'étais qu'une lueur entre deux mondes.",
    "Une mémoire qui marchait, sans savoir de qui.",
    "",
    "Dix règnes oubliés. Dix échos de toi-même.",
    "Chacun te rendait un fragment.",
    "",
    "Au sommet du Reflux, l'Artefact attendait.",
    "Pas une arme. Pas une couronne.",
    "Un nom — le tien.",
    "",
    "Tu te souviens, maintenant.",
    "Tu es entier."
];

const DELAI_LIGNE_MS = 650;     // intervalle entre apparition de chaque ligne
const DUREE_FADE_LIGNE_MS = 1100;
const DELAI_AVANT_TEXTE_MS = 1300; // temps de respiration avant que le texte commence
const DELAI_BOUTONS_MS = 1500;    // après la dernière ligne

// Layout vertical (coords internes 960×540)
const HERO_Y = 130;             // centre du hero shot
const HERO_SCALE = 2.2;
const TEXTE_DEBUT_Y = 245;      // 1ère ligne de texte
const TEXTE_ECART = 17;         // espacement entre lignes
const TEXTE_ECART_VIDE = 9;     // espacement supplémentaire pour ligne vide
const BOUTONS_Y = 510;
const HINT_Y = 510;             // hint "Rester contempler" remplace les boutons

export class FinScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FinScene' });
    }

    create() {
        // Stop tous les overlays / scènes encore actifs depuis le run
        for (const k of ['UIScene', 'InventaireScene', 'MapScene',
                         'FondeurScene', 'IdentifieurScene', 'MarchandScene']) {
            if (this.scene.isActive(k)) this.scene.stop(k);
        }

        // La musique du run s'éteint en douceur — la fin se savoure en silence
        getAudioSystem(this).arreterTout();

        // Phase 5c.1 — le run est terminé, on clear le marker "run actif" pour
        // que le bouton "Continuer" du MenuScene soit grisé au prochain boot.
        try { localStorage.removeItem('vestige_run_actif_v1'); }
        catch (_e) { /* privacy → no-op */ }

        // --- Fond noir profond ---
        this.add.rectangle(
            GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x080610, 1
        ).setDepth(0);

        // Vignette douce
        const vignette = this.add.graphics().setDepth(1);
        vignette.fillStyle(0x000000, 0.55);
        for (let r = 0; r < 8; r++) {
            vignette.fillRect(0, 0, GAME_WIDTH, 30 - r * 3);
            vignette.fillRect(0, GAME_HEIGHT - (30 - r * 3), GAME_WIDTH, 30 - r * 3);
        }

        // --- Particules dorées flottantes ambient ---
        this._spawnerParticulesAmbient();

        // --- Hero shot : VestigeIncarne au centre-haut ---
        this.heros = new VestigeIncarne(this, {
            scale: HERO_SCALE,
            alpha: 0,
            particules: true
        });
        this.heros.setPosition(GAME_WIDTH / 2, HERO_Y);
        // Fade-in du héros depuis 0
        this.tweens.add({
            targets: this.heros.container,
            alpha: 1,
            duration: 1500,
            ease: 'Quad.Out'
        });

        // Petit halo doré derrière le héros
        const halo = this.add.graphics().setDepth(1);
        halo.setBlendMode(Phaser.BlendModes.ADD);
        halo.fillStyle(C_OR, 0.15);
        halo.fillCircle(GAME_WIDTH / 2, HERO_Y, 95);
        halo.fillStyle(C_OR, 0.08);
        halo.fillCircle(GAME_WIDTH / 2, HERO_Y, 150);
        this.tweens.add({
            targets: halo,
            alpha: { from: 0.85, to: 1 },
            duration: 2400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.InOut'
        });

        // --- Texte poétique : apparition ligne par ligne ---
        this.lignesTexte = [];
        let yCurr = TEXTE_DEBUT_Y;
        let delayCurr = DELAI_AVANT_TEXTE_MS;

        for (const ligne of LIGNES_FIN) {
            if (ligne === '') {
                yCurr += TEXTE_ECART_VIDE;
                delayCurr += DELAI_LIGNE_MS * 0.4;
                continue;
            }
            const t = this.add.text(GAME_WIDTH / 2, yCurr, ligne, {
                fontFamily: 'Georgia, serif',
                fontSize: '13px',
                color: C_TEXT_CSS,
                align: 'center',
                stroke: '#000', strokeThickness: 2
            }).setOrigin(0.5, 0).setAlpha(0).setDepth(10);

            this.tweens.add({
                targets: t,
                alpha: 1,
                duration: DUREE_FADE_LIGNE_MS,
                delay: delayCurr,
                ease: 'Quad.Out'
            });

            this.lignesTexte.push(t);
            yCurr += TEXTE_ECART;
            delayCurr += DELAI_LIGNE_MS;
        }

        // --- Boutons : apparition après la dernière ligne ---
        const tempsAvantBoutons = delayCurr + DELAI_BOUTONS_MS;
        this.time.delayedCall(tempsAvantBoutons, () => this._creerBoutons());

        // Esc / R : accélère l'apparition des boutons si pas encore là
        this.input.keyboard.on('keydown-ENTER', () => this._forcerBoutons());
        this.input.keyboard.on('keydown-SPACE', () => this._forcerBoutons());
    }

    _spawnerParticulesAmbient() {
        this.time.addEvent({
            delay: 250,
            loop: true,
            callback: () => {
                const x = Math.random() * GAME_WIDTH;
                const y = GAME_HEIGHT + 10;
                const p = this.add.circle(x, y, 1.2, C_OR_VIF, 0.8);
                p.setBlendMode(Phaser.BlendModes.ADD);
                p.setDepth(2);
                this.tweens.add({
                    targets: p,
                    y: -10,
                    x: x + (Math.random() - 0.5) * 60,
                    alpha: { from: 0.8, to: 0 },
                    duration: 7000 + Math.random() * 4000,
                    ease: 'Sine.InOut',
                    onComplete: () => p.destroy()
                });
            }
        });
    }

    _forcerBoutons() {
        if (this.boutonsActifs) return;
        // Termine instantanément tous les tweens de texte
        for (const t of this.lignesTexte) {
            this.tweens.killTweensOf(t);
            t.setAlpha(1);
        }
        this._creerBoutons();
    }

    _creerBoutons() {
        if (this.boutonsActifs) return;
        this.boutonsActifs = true;

        const cy = BOUTONS_Y;
        const positions = [
            { x: GAME_WIDTH * 0.22, label: 'Recommencer',       action: () => this._recommencer() },
            { x: GAME_WIDTH * 0.50, label: 'Rester contempler', action: () => this._contempler() },
            { x: GAME_WIDTH * 0.78, label: 'Quitter',            action: () => this._quitter() }
        ];

        this.boutons = [];
        let delay = 0;
        for (const pos of positions) {
            const bouton = this._creerBouton(pos.x, cy, pos.label, pos.action);
            bouton.container.setAlpha(0);
            this.tweens.add({
                targets: bouton.container,
                alpha: 1,
                duration: 800,
                delay,
                ease: 'Quad.Out'
            });
            this.boutons.push(bouton);
            delay += 200;
        }
    }

    _creerBouton(x, y, label, onClick) {
        const container = this.add.container(x, y).setDepth(20);

        const bg = this.add.graphics();
        bg.fillStyle(0x1a1018, 0.85);
        bg.fillRoundedRect(-90, -18, 180, 36, 4);
        bg.lineStyle(1.5, C_OR, 0.7);
        bg.strokeRoundedRect(-90, -18, 180, 36, 4);
        container.add(bg);

        const txt = this.add.text(0, 0, label, {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: C_OR_CSS,
            stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5);
        container.add(txt);

        // Zone interactive
        const hit = this.add.rectangle(0, 0, 180, 36, 0xffffff, 0)
            .setInteractive({ useHandCursor: true });
        container.add(hit);

        hit.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(0x3a2c5c, 0.9);
            bg.fillRoundedRect(-90, -18, 180, 36, 4);
            bg.lineStyle(2, C_OR_VIF, 1);
            bg.strokeRoundedRect(-90, -18, 180, 36, 4);
            txt.setColor('#fff0a0');
        });
        hit.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(0x1a1018, 0.85);
            bg.fillRoundedRect(-90, -18, 180, 36, 4);
            bg.lineStyle(1.5, C_OR, 0.7);
            bg.strokeRoundedRect(-90, -18, 180, 36, 4);
            txt.setColor(C_OR_CSS);
        });
        hit.on('pointerdown', () => onClick());

        return { container, hit };
    }

    _recommencer() {
        // Hard reset du run : reload la page. Le registry est vidé (run reset),
        // mais le localStorage est préservé : sceaux, carte mémoire, marker fin.
        // → fresh seed, fresh étage 1, mais le joueur conserve sa méta-progression.
        this._fadeNoir(() => window.location.reload());
    }

    _contempler() {
        // Masque les boutons + sous-titre, on reste sur le tableau indéfiniment.
        for (const b of this.boutons) {
            this.tweens.add({
                targets: b.container,
                alpha: 0,
                duration: 800,
                ease: 'Quad.Out',
                onComplete: () => {
                    b.hit.disableInteractive();
                }
            });
        }
        // Petit hint discret remplaçant les boutons (même y) — n'apparaît
        // qu'après leur fade-out pour ne pas se télescoper avec le texte.
        this.time.delayedCall(1800, () => {
            const hint = this.add.text(
                GAME_WIDTH / 2, HINT_Y,
                '— recharge la page pour repartir —',
                {
                    fontFamily: 'Georgia, serif',
                    fontSize: '10px',
                    color: C_SUBTLE_CSS,
                    fontStyle: 'italic'
                }
            ).setOrigin(0.5).setAlpha(0).setDepth(20);
            this.tweens.add({
                targets: hint,
                alpha: 0.55,
                duration: 1800,
                ease: 'Quad.Out'
            });
        });
    }

    _quitter() {
        // Retour au menu de démarrage (Phase 5c.1). Le marker run_actif a déjà
        // été cleared en début de create(), donc "Continuer" sera grisé et le
        // joueur verra la variante post-fin du sous-titre.
        this._fadeNoir(() => this.scene.start('MenuScene'));
    }

    _fadeNoir(onComplete) {
        const black = this.add.rectangle(
            GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0
        ).setDepth(50);
        this.tweens.add({
            targets: black,
            alpha: 1,
            duration: 900,
            ease: 'Quad.InOut',
            onComplete
        });
    }
}
