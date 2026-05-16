// MenuScene — écran de démarrage (Phase 5c.1).
//
// Lancée au boot avant GameScene. Présente l'identité du jeu (titre,
// sous-titre poétique) sur une ambiance "ruines au crépuscule" : ciel
// dégradé bleu nuit + silhouettes lointaines + lanternes éteintes
// scintillant faiblement + particules de cendre flottantes.
//
// 3 boutons :
//   - Nouvelle partie : démarre un run propre (clear `vestige_run_actif_v1`)
//   - Continuer       : Phase 5c.1 = placeholder grisé (option C, cf. CLAUDE.md).
//                       Vrai save/load = phase ultérieure (state run dans le
//                       registry RAM, pas en localStorage actuellement).
//   - Quitter         : fade noir + "Le Vestige se retire."
//
// Si `vestige_fin_atteinte_v1` (joueur a déjà fini une fois) : étoile dorée
// discrète près du titre + variante de sous-titre.

import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { DEPTH, paletteDuMonde } from '../render/PainterlyRenderer.js';
import { poserCiel, poserSilhouettesLointaines } from '../render/Parallaxe.js';
import { peindreLanterne } from '../render/elements/Lanterne.js';
import { getAudioSystem } from '../systems/AudioSystem.js';

const C_OR = 0xffd070;
const C_OR_VIF = 0xfff0a0;
const C_OR_CSS = '#ffd070';
const C_OR_FADE_CSS = '#9a8050';
const C_SUBTLE_CSS = '#7a6a4a';
const C_DESACTIVE_CSS = '#4a4258';

const CLE_RUN_ACTIF = 'vestige_run_actif_v1';
const CLE_FIN_ATTEINTE = 'vestige_fin_atteinte_v1';

// Petit PRNG déterministe pour que la composition du fond soit la même à
// chaque ouverture du menu (sinon les silhouettes sautent au reload).
function rngFixe() {
    let s = 0x9e3779b1;
    return () => {
        s = Math.imul(s ^ (s >>> 15), 0x85ebca6b);
        s = Math.imul(s ^ (s >>> 13), 0xc2b2ae35);
        return ((s ^ (s >>> 16)) >>> 0) / 0xFFFFFFFF;
    };
}

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        // ── 1. CIEL + AMBIANCE PARALLAXE ────────────────────────────────────
        poserCiel(this, 'normal');

        // Particules de poussière/cendre flottant lentement
        this._spawnerCendres();

        // Silhouettes lointaines (ruines parallax x0.3, alpha 0.32)
        const dims = { largeur: GAME_WIDTH, hauteur: GAME_HEIGHT };
        const rng = rngFixe();
        poserSilhouettesLointaines(this, dims, 'normal', rng);

        // ── 2. SOL + LANTERNES ÉTEINTES ─────────────────────────────────────
        const palette = paletteDuMonde('normal');
        const ySol = GAME_HEIGHT - 40;

        // Bande de sol sombre
        const sol = this.add.graphics();
        sol.fillStyle(0x0a1018, 1);
        sol.fillRect(0, ySol, GAME_WIDTH, 40);
        sol.fillStyle(palette.pierreSombre, 0.6);
        sol.fillRect(0, ySol, GAME_WIDTH, 4);
        sol.setDepth(DEPTH.DECOR_MILIEU);

        // Brume bleutée au sol
        for (let i = 0; i < 4; i++) {
            const g = this.add.graphics();
            g.fillStyle(palette.brume, 0.20);
            g.fillEllipse(0, 0, 280 + Math.random() * 100, 36);
            g.fillStyle(palette.brume, 0.13);
            g.fillEllipse(15, -6, 180, 24);
            const xDebut = (GAME_WIDTH / 4) * i + Math.random() * 80;
            const yPos = ySol - 6 + Math.random() * 8;
            g.setPosition(xDebut, yPos);
            g.setDepth(DEPTH.DECOR_AVANT - 1);
            this.tweens.add({
                targets: g,
                x: xDebut + GAME_WIDTH,
                duration: 32000 + Math.random() * 12000,
                ease: 'Linear',
                repeat: -1,
                onRepeat: () => { g.x = xDebut - 120; }
            });
        }

        // Lanternes éteintes — 3 réparties horizontalement avec scintillement
        // subtil (la flamme reste éteinte mais un reflet faible vacille — comme
        // une mémoire qui pourrait se rallumer)
        const positionsLanternes = [
            { x: GAME_WIDTH * 0.18, y: ySol - 5 },
            { x: GAME_WIDTH * 0.55, y: ySol - 5 },
            { x: GAME_WIDTH * 0.82, y: ySol - 5 }
        ];
        for (const pos of positionsLanternes) {
            peindreLanterne(this, pos.x, pos.y, 'normal', palette, 'au_sol');
            // Petit reflet doré faible qui scintille (la lanterne du jeu est
            // éteinte, mais ici on suggère une mémoire qui rougeoie).
            // Graphics positionné sur le reflet ; le cercle dessiné à (0,0)
            // pour que `scale` agisse bien autour du centre.
            const reflet = this.add.graphics({ x: pos.x, y: pos.y - 6 });
            reflet.setBlendMode(Phaser.BlendModes.ADD);
            reflet.fillStyle(C_OR, 1);
            reflet.fillCircle(0, 0, 8);
            reflet.setAlpha(0.18);
            reflet.setDepth(DEPTH.DECOR_AVANT - 1);
            this.tweens.add({
                targets: reflet,
                alpha: { from: 0.18, to: 0.55 },
                scale: { from: 0.9, to: 1.15 },
                duration: 1200 + Math.random() * 800,
                ease: 'Sine.InOut',
                yoyo: true,
                repeat: -1
            });
        }

        // Vignette sombre aux bords
        const vignette = this.add.graphics().setDepth(DEPTH.VIGNETTE);
        vignette.fillStyle(0x000000, 0.4);
        for (let r = 0; r < 10; r++) {
            const ep = 4;
            vignette.fillRect(0, r * ep, GAME_WIDTH, ep * 0.6);
            vignette.fillRect(0, GAME_HEIGHT - r * ep - ep, GAME_WIDTH, ep * 0.6);
        }

        // ── 3. TITRE + SOUS-TITRE ───────────────────────────────────────────
        const finAtteinte = this._estFinAtteinte();
        const titreY = GAME_HEIGHT * 0.30;

        // Halo doré derrière le titre
        const haloTitre = this.add.graphics();
        haloTitre.setBlendMode(Phaser.BlendModes.ADD);
        haloTitre.fillStyle(C_OR, 0.10);
        haloTitre.fillCircle(GAME_WIDTH / 2, titreY, 180);
        haloTitre.fillStyle(C_OR, 0.05);
        haloTitre.fillCircle(GAME_WIDTH / 2, titreY, 260);
        haloTitre.setDepth(DEPTH.PARTICULES);
        this.tweens.add({
            targets: haloTitre,
            alpha: { from: 0.85, to: 1 },
            duration: 3000,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });

        // Titre principal — Georgia, large, doré
        const titre = this.add.text(GAME_WIDTH / 2, titreY, 'VESTIGE', {
            fontFamily: 'Georgia, serif',
            fontSize: '56px',
            color: C_OR_CSS,
            fontStyle: 'bold',
            stroke: '#000', strokeThickness: 5
        }).setOrigin(0.5).setDepth(DEPTH.EFFETS);
        // Letter spacing simulé via shadow doux
        titre.setShadow(0, 0, '#ffd070', 12, true, true);

        // Étoile dorée discrète si la fin a été atteinte
        if (finAtteinte) {
            const ex = GAME_WIDTH / 2 + 175;
            const ey = titreY - 18;
            const etoile = this.add.graphics({ x: ex, y: ey });
            etoile.setBlendMode(Phaser.BlendModes.ADD);
            etoile.setDepth(DEPTH.EFFETS + 1);
            this._dessinerEtoile(etoile, 0, 0, 7, C_OR_VIF);
            this.tweens.add({
                targets: etoile,
                alpha: { from: 0.7, to: 1 },
                scale: { from: 0.95, to: 1.1 },
                duration: 1600,
                ease: 'Sine.InOut',
                yoyo: true,
                repeat: -1
            });
        }

        // Sous-titre poétique
        const sousTitreTexte = finAtteinte
            ? 'Le souvenir reformé t\'attend encore'
            : 'La mémoire marche entre deux mondes';
        this.add.text(GAME_WIDTH / 2, titreY + 48, sousTitreTexte, {
            fontFamily: 'Georgia, serif',
            fontSize: '15px',
            color: C_OR_FADE_CSS,
            fontStyle: 'italic',
            stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(DEPTH.EFFETS);

        // ── 4. BOUTONS ──────────────────────────────────────────────────────
        const boutonsY = GAME_HEIGHT * 0.66;
        const ecartBoutons = 50;

        this._creerBouton(GAME_WIDTH / 2, boutonsY, 'Nouvelle partie', () => this._nouvellePartie());
        this._creerBouton(GAME_WIDTH / 2, boutonsY + ecartBoutons, 'Continuer', null, { desactive: true });
        this._creerBouton(GAME_WIDTH / 2, boutonsY + ecartBoutons * 2, 'Quitter', () => this._quitter());

        // ── 5. UI AUDIO + CRÉDIT DISCRET EN BAS ─────────────────────────────
        this._creerUIAudio(GAME_WIDTH / 2, GAME_HEIGHT - 38);

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 16,
            '— prototype — VESTIGE —', {
                fontFamily: 'Georgia, serif',
                fontSize: '10px',
                color: C_SUBTLE_CSS,
                fontStyle: 'italic'
            }
        ).setOrigin(0.5).setDepth(DEPTH.EFFETS);

        // Fade-in d'ouverture
        this.cameras.main.fadeIn(700, 0, 0, 0);

        // ENTRÉE = raccourci "Nouvelle partie"
        this.input.keyboard.on('keydown-ENTER', () => this._nouvellePartie());
        this.input.keyboard.on('keydown-SPACE', () => this._nouvellePartie());

        // Audio : démarrer Tone à la première interaction utilisateur
        // (Web Audio l'exige). On n'attend pas un bouton précis — n'importe
        // quel clic ou keydown suffit comme gesture.
        this._brancherDemarrageAudio();
    }

    _estRunActif() {
        try { return localStorage.getItem(CLE_RUN_ACTIF) === 'true'; }
        catch (_e) { return false; }
    }

    _estFinAtteinte() {
        try { return localStorage.getItem(CLE_FIN_ATTEINTE) === 'true'; }
        catch (_e) { return false; }
    }

    _dessinerEtoile(g, x, y, taille, couleur) {
        g.fillStyle(couleur, 0.9);
        // Étoile 4 branches (losange étiré horizontal + vertical)
        g.fillTriangle(x - taille, y, x, y - taille * 0.4, x, y + taille * 0.4);
        g.fillTriangle(x + taille, y, x, y - taille * 0.4, x, y + taille * 0.4);
        g.fillTriangle(x, y - taille, x - taille * 0.4, y, x + taille * 0.4, y);
        g.fillTriangle(x, y + taille, x - taille * 0.4, y, x + taille * 0.4, y);
        // Centre éclat blanc
        g.fillStyle(0xffffff, 1);
        g.fillCircle(x, y, taille * 0.3);
    }

    _creerBouton(x, y, label, onClick, opts = {}) {
        const desactive = !!opts.desactive;
        const largeur = 220;
        const hauteur = 38;

        const container = this.add.container(x, y).setDepth(DEPTH.EFFETS);

        const bg = this.add.graphics();
        this._dessinerBoutonFond(bg, largeur, hauteur, false, desactive);
        container.add(bg);

        const couleurTexte = desactive ? C_DESACTIVE_CSS : C_OR_CSS;
        const txt = this.add.text(0, 0, label, {
            fontFamily: 'Georgia, serif',
            fontSize: '16px',
            color: couleurTexte,
            stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5);
        container.add(txt);

        if (desactive) {
            // Petit hint à côté pour signifier "à venir"
            const hint = this.add.text(largeur / 2 + 6, 0,
                '(bientôt)', {
                    fontFamily: 'Georgia, serif',
                    fontSize: '11px',
                    color: C_SUBTLE_CSS,
                    fontStyle: 'italic'
                }
            ).setOrigin(0, 0.5);
            container.add(hint);
            return { container, txt, bg, desactive };
        }

        const hit = this.add.rectangle(0, 0, largeur, hauteur, 0xffffff, 0)
            .setInteractive({ useHandCursor: true });
        container.add(hit);

        hit.on('pointerover', () => {
            this._dessinerBoutonFond(bg, largeur, hauteur, true, false);
            txt.setColor('#fff0a0');
        });
        hit.on('pointerout', () => {
            this._dessinerBoutonFond(bg, largeur, hauteur, false, false);
            txt.setColor(C_OR_CSS);
        });
        hit.on('pointerdown', () => onClick?.());

        return { container, txt, bg, hit };
    }

    _dessinerBoutonFond(g, largeur, hauteur, hover, desactive) {
        g.clear();
        const w = largeur, h = hauteur;
        if (desactive) {
            g.fillStyle(0x1a1018, 0.5);
            g.fillRoundedRect(-w / 2, -h / 2, w, h, 4);
            g.lineStyle(1, 0x4a4258, 0.5);
            g.strokeRoundedRect(-w / 2, -h / 2, w, h, 4);
            return;
        }
        const couleurFond = hover ? 0x3a2c5c : 0x1a1018;
        const alphaFond = hover ? 0.9 : 0.85;
        const couleurBord = hover ? C_OR_VIF : C_OR;
        const epaisseur = hover ? 2 : 1.5;
        const alphaBord = hover ? 1 : 0.75;
        g.fillStyle(couleurFond, alphaFond);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 4);
        g.lineStyle(epaisseur, couleurBord, alphaBord);
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 4);
    }

    _spawnerCendres() {
        // Particules de cendre/poussière dorée ascensionnelles
        this.time.addEvent({
            delay: 220,
            loop: true,
            callback: () => {
                const x = Math.random() * GAME_WIDTH;
                const y = GAME_HEIGHT + 10;
                const p = this.add.circle(x, y, 1.4, C_OR_VIF, 0.7);
                p.setBlendMode(Phaser.BlendModes.ADD);
                p.setDepth(DEPTH.PARTICULES);
                this.tweens.add({
                    targets: p,
                    y: -10,
                    x: x + (Math.random() - 0.5) * 80,
                    alpha: { from: 0.7, to: 0 },
                    duration: 9000 + Math.random() * 4000,
                    ease: 'Sine.InOut',
                    onComplete: () => p.destroy()
                });
            }
        });
    }

    _nouvellePartie() {
        // Hard reset du run : on vide le registry pour repartir d'une seed
        // neuve, inventaire vide, étage 1. localStorage (sceaux + carte +
        // marker fin) est préservé — c'est la méta-progression du joueur.
        //
        // Au tout premier boot le registry est déjà vide, mais si on revient
        // ici depuis FinScene → Quitter → Nouvelle partie, le registry porte
        // encore l'état du run gagné. Sans reset, GameScene récupérerait la
        // même seed et le même étage 10. Donc on reset systématiquement.
        // (Itération manuelle plutôt que .reset() pour compat large Phaser.)
        //
        // IMPORTANT : on préserve `audio_system` à travers le wipe. C'est un
        // singleton transverse au run (contexte Web Audio + Transport déjà
        // démarrés sur gesture utilisateur). Si on le drop ici, le nouveau
        // GameScene crée une instance "pas prête" qui ne peut plus démarrer
        // faute de nouveau gesture → la musique du menu joue à jamais.
        const audioPreserve = this.registry.get('audio_system');
        const all = this.registry.getAll();
        for (const k of Object.keys(all)) this.registry.remove(k);
        if (audioPreserve) this.registry.set('audio_system', audioPreserve);

        // GameScene.create() re-posera le marker, mais on l'écrit aussi ici
        // au cas où l'utilisateur ferme l'onglet entre le clic et l'init.
        try { localStorage.setItem(CLE_RUN_ACTIF, 'true'); }
        catch (_e) { /* privacy → no-op */ }

        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene');
        });
    }

    _creerUIAudio(x, y) {
        const audio = getAudioSystem(this);
        const container = this.add.container(x, y).setDepth(DEPTH.EFFETS);

        const label = this.add.text(-72, 0, '♪ Musique', {
            fontFamily: 'Georgia, serif', fontSize: '11px',
            color: C_OR_FADE_CSS, fontStyle: 'italic'
        }).setOrigin(1, 0.5);
        container.add(label);

        const valeur = this.add.text(0, 0, '', {
            fontFamily: 'Georgia, serif', fontSize: '12px',
            color: C_OR_CSS
        }).setOrigin(0.5);
        container.add(valeur);

        const refresh = () => {
            const pct = Math.round(audio.getVolume() * 100);
            valeur.setText(audio.estMute() ? 'coupé' : `${pct}%`);
            valeur.setColor(audio.estMute() ? C_DESACTIVE_CSS : C_OR_CSS);
        };

        const flecheStyle = {
            fontFamily: 'Georgia, serif', fontSize: '16px',
            color: C_OR_CSS, fontStyle: 'bold'
        };
        const moins = this.add.text(-40, 0, '◂', flecheStyle).setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
        moins.on('pointerover', () => moins.setColor('#fff0a0'));
        moins.on('pointerout',  () => moins.setColor(C_OR_CSS));
        moins.on('pointerdown', () => {
            if (audio.estMute()) audio.toggleMute(); // sortir du mute en baissant un cran
            audio.setVolume(Math.max(0, audio.getVolume() - 0.1));
            refresh();
        });
        container.add(moins);

        const plus = this.add.text(40, 0, '▸', flecheStyle).setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
        plus.on('pointerover', () => plus.setColor('#fff0a0'));
        plus.on('pointerout',  () => plus.setColor(C_OR_CSS));
        plus.on('pointerdown', () => {
            if (audio.estMute()) audio.toggleMute();
            audio.setVolume(Math.min(1, audio.getVolume() + 0.1));
            refresh();
        });
        container.add(plus);

        const hint = this.add.text(75, 0, '(N pour couper)', {
            fontFamily: 'Georgia, serif', fontSize: '10px',
            color: C_SUBTLE_CSS, fontStyle: 'italic'
        }).setOrigin(0, 0.5);
        container.add(hint);

        // Repeint quand le mute global change via touche N
        this.registry.events.on('changedata', refresh);
        this.events.once('shutdown', () => {
            this.registry.events.off('changedata', refresh);
        });
        // Tick périodique pour suivre le mute via touche N (le système ne
        // notifie pas via registry — petit poll de courtoisie suffit)
        this.time.addEvent({ delay: 200, loop: true, callback: refresh });

        refresh();
    }

    _brancherDemarrageAudio() {
        const audio = getAudioSystem(this);
        if (audio.estPret()) return;
        const demarrer = () => {
            audio.demarrer('menu');
        };
        // Tout user gesture (clic ou touche) déclenche le contexte audio
        this.input.once('pointerdown', demarrer);
        this.input.keyboard.once('keydown', demarrer);
    }

    _quitter() {
        // Le navigateur ne peut pas être quitté programmatiquement (window.close
        // ne marche que si window a été ouverte par JS). On affiche un fade
        // d'adieu et on attend que l'utilisateur ferme l'onglet.
        getAudioSystem(this).arreterTout();
        this.cameras.main.fadeOut(900, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.children.removeAll(true);
            this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2,
                GAME_WIDTH, GAME_HEIGHT, 0x000000, 1).setDepth(0);
            this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10,
                'Le Vestige se retire.', {
                    fontFamily: 'Georgia, serif',
                    fontSize: '18px',
                    color: C_OR_CSS,
                    fontStyle: 'italic'
                }).setOrigin(0.5).setDepth(10);
            this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 24,
                '— ferme l\'onglet pour le laisser dormir —', {
                    fontFamily: 'Georgia, serif',
                    fontSize: '11px',
                    color: C_SUBTLE_CSS,
                    fontStyle: 'italic'
                }).setOrigin(0.5).setDepth(10);
            this.cameras.main.fadeIn(700, 0, 0, 0);
        });
    }
}
