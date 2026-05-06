// MarchandScene — overlay du Tapis de la Glaneuse.
//
// 3 onglets :
//   VITRINE     → 4 items proposés (seedés sur run + indexSalle)
//   RACHAT      → liste de l'inventaire, conversion en Sel
//   FRAGMENTER  → liste de l'inventaire, conversion en Fragments
//
// Style cohérent : Carnet du Vestige, panneau détail à droite, bande ressources.

import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { InventaireSystem } from '../systems/InventaireSystem.js';
import {
    EconomySystem, EVT_SEL_CHANGE, EVT_FRAGMENTS_CHANGE, EVT_ENCRE_CHANGE
} from '../systems/EconomySystem.js';
import { IdentificationSystem } from '../systems/IdentificationSystem.js';
import {
    MarchandSystem, prixAchat, prixRachat, fragmentsRendus, genererVitrine
} from '../systems/MarchandSystem.js';
import {
    phraseAccueil, phraseVenteReussie, phraseVentePauvre,
    phraseRachatReussi, phraseFragmentation, phraseFragmentationBonus,
    phraseInvPlein, phraseRienAVendre, phraseVitrineVide
} from '../data/phrases-marchand.js';
import { ITEMS, COULEURS_FAMILLE } from '../data/items.js';
import { peindreEmblemeFamille } from '../render/ui/EmblemeFamille.js';
import { COULEURS_INVENTAIRE, poserCadreInventaire, poserBoutonFermer } from '../render/ui/CadreInventaire.js';

const couleurHex = (n) => '#' + n.toString(16).padStart(6, '0');

const ONGLET_VITRINE = 'vitrine';
const ONGLET_RACHAT = 'rachat';
const ONGLET_FRAG = 'fragmenter';

export class MarchandScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MarchandScene' });
    }

    init(data) {
        // PRNG pour la vitrine (seedé sur run + indexSalle, stable tant que la
        // GameScene n'est pas refaite — quitte / reviens = même vitrine).
        this.rngVitrine = data?.rngVitrine ?? Math.random;
        // PRNG pour les phrases / le bonus Reflux
        this.rngPhrase = data?.rngPhrase ?? Math.random;
    }

    create() {
        this.economy = new EconomySystem(this.registry);
        this.inventaire = new InventaireSystem(this.registry);
        this.identification = new IdentificationSystem(this.registry);
        this.marchand = new MarchandSystem(this.economy, this.inventaire);

        // Vitrine : générée une fois ici. Si on ferme/rouvre la scène pour ce
        // PNJ-ci, on récupère le tableau via un cache dans le registry.
        const cleVitrine = `vitrine:${this.registry.get('marchand_room_id') ?? 0}`;
        let cache = this.registry.get(cleVitrine);
        if (!cache) {
            cache = genererVitrine(this.rngVitrine);
            this.registry.set(cleVitrine, cache);
        }
        this.vitrine = [...cache];
        this.cleVitrine = cleVitrine;

        this.ongletActif = ONGLET_VITRINE;
        this.itemSelectionneIdx = null; // index dans la vitrine ou l'inventaire selon l'onglet
        this.dernierePhrase = phraseAccueil(this.rngPhrase);
        this.couleurPhrase = '#c8a8d8';

        // --- Cadre stylisé ---
        const cadre = poserCadreInventaire(this, GAME_WIDTH, GAME_HEIGHT);
        cadre.titre.setText('LE TAPIS DE LA GLANEUSE');

        poserBoutonFermer(this, GAME_WIDTH - 50, 50, () => this.fermer());

        this._dessinerPhrase();
        this._dessinerOnglets();
        this._dessinerZonePrincipale();
        this._dessinerBandeRessources();

        // --- Touches ---
        this.input.keyboard.on('keydown-ESC', () => this.fermer());

        const handler = () => this._refreshTout();
        this.registry.events.on(EVT_SEL_CHANGE, handler);
        this.registry.events.on(EVT_FRAGMENTS_CHANGE, handler);
        this.registry.events.on(EVT_ENCRE_CHANGE, handler);
        this.events.once('shutdown', () => {
            this.registry.events.off(EVT_SEL_CHANGE, handler);
            this.registry.events.off(EVT_FRAGMENTS_CHANGE, handler);
            this.registry.events.off(EVT_ENCRE_CHANGE, handler);
        });
    }

    fermer() {
        const codes = Phaser.Input.Keyboard.KeyCodes;
        const keys = this.input.keyboard.keys;
        [codes.ESC].forEach(c => keys[c]?.reset());
        this.scene.resume('GameScene');
        this.scene.stop();
    }

    _changerOnglet(onglet) {
        if (this.ongletActif === onglet) return;
        this.ongletActif = onglet;
        this.itemSelectionneIdx = null;
        this._refreshTout();
    }

    // ============================================================
    // PHRASE de la Glaneuse
    // ============================================================
    _dessinerPhrase() {
        if (this.phraseTxt) this.phraseTxt.destroy();
        this.phraseTxt = this.add.text(GAME_WIDTH / 2, 78,
            '"' + this.dernierePhrase + '"',
            {
                fontFamily: 'monospace', fontSize: '13px',
                color: this.couleurPhrase, fontStyle: 'italic',
                stroke: '#000', strokeThickness: 2,
                align: 'center', wordWrap: { width: GAME_WIDTH - 160 }
            }
        ).setOrigin(0.5, 0).setScrollFactor(0).setDepth(310);
    }

    // ============================================================
    // ONGLETS (3 boutons en haut)
    // ============================================================
    _dessinerOnglets() {
        if (this.contOnglets) this.contOnglets.destroy();
        this.contOnglets = this.add.container(0, 0).setDepth(310).setScrollFactor(0);

        const cx = GAME_WIDTH / 2;
        const y = 110;
        const w = 150, h = 26, espace = 6;
        const onglets = [
            { id: ONGLET_VITRINE, label: 'VITRINE' },
            { id: ONGLET_RACHAT,  label: 'RACHAT' },
            { id: ONGLET_FRAG,    label: 'FRAGMENTER' }
        ];
        const xDebut = cx - (3 * w + 2 * espace) / 2;

        for (let i = 0; i < onglets.length; i++) {
            const o = onglets[i];
            const x = xDebut + i * (w + espace);
            const actif = this.ongletActif === o.id;

            const fond = this.add.graphics();
            const dessiner = (hover) => {
                fond.clear();
                fond.fillStyle(actif ? 0x2a1810 : (hover ? 0x14100a : 0x080604), 1);
                fond.fillRect(x, y, w, h);
                const couleurBord = actif
                    ? COULEURS_INVENTAIRE.orClair
                    : (hover ? COULEURS_INVENTAIRE.or : 0x6a4830);
                fond.lineStyle(actif ? 2 : 1, couleurBord, 1);
                fond.strokeRect(x, y, w, h);
            };
            dessiner(false);
            this.contOnglets.add(fond);

            const txt = this.add.text(x + w / 2, y + h / 2, o.label, {
                fontFamily: 'monospace', fontSize: '12px',
                color: actif ? '#ffd070' : '#c8a85a',
                fontStyle: 'bold',
                stroke: '#000', strokeThickness: 2
            }).setOrigin(0.5);
            this.contOnglets.add(txt);

            const hit = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0xffffff, 0)
                .setInteractive({ useHandCursor: true });
            if (!actif) {
                hit.on('pointerover', () => dessiner(true));
                hit.on('pointerout', () => dessiner(false));
            }
            hit.on('pointerdown', () => this._changerOnglet(o.id));
            this.contOnglets.add(hit);
        }
    }

    // ============================================================
    // ZONE PRINCIPALE — selon l'onglet
    // ============================================================
    _dessinerZonePrincipale() {
        if (this.contZone) this.contZone.destroy();
        this.contZone = this.add.container(0, 0).setDepth(310).setScrollFactor(0);

        if (this.ongletActif === ONGLET_VITRINE) {
            this._dessinerListeVitrine();
        } else {
            this._dessinerListeInventaire();
        }
        this._dessinerPanneauDetail();
    }

    // ----- Liste vitrine (4 slots) -----
    _dessinerListeVitrine() {
        const xDebut = 60;
        const yDebut = 160;
        const taille = 56;
        const espace = 10;

        this.contZone.add(this.add.text(xDebut, yDebut - 28, 'SUR LE TAPIS', {
            fontFamily: 'monospace', fontSize: '10px',
            color: '#c8a8d8', fontStyle: 'bold'
        }));

        if (this.vitrine.length === 0) {
            this.contZone.add(this.add.text(xDebut, yDebut + 30, phraseVitrineVide(), {
                fontFamily: 'monospace', fontSize: '11px',
                color: '#6a6a7a', fontStyle: 'italic',
                wordWrap: { width: 320 }
            }));
            return;
        }

        for (let i = 0; i < this.vitrine.length; i++) {
            const itemId = this.vitrine[i];
            const item = ITEMS[itemId];
            if (!item) continue;
            const c = i % 2;
            const r = Math.floor(i / 2);
            const x = xDebut + c * (taille + espace) + taille / 2;
            const y = yDebut + r * (taille + espace) + taille / 2;
            this._slotItem(x, y, taille, item, this.itemSelectionneIdx === i, () => {
                this.itemSelectionneIdx = i;
                this._refreshTout();
            });
        }
    }

    // ----- Liste inventaire (rachat / fragmenter) -----
    _dessinerListeInventaire() {
        const xDebut = 60;
        const yDebut = 160;
        const taille = 38;
        const espace = 6;
        const cols = 7;

        const inv = this.inventaire.getInventaire();
        const titre = this.ongletActif === ONGLET_RACHAT ? 'TON SAC' : 'À FRAGMENTER';
        this.contZone.add(this.add.text(xDebut, yDebut - 28, titre, {
            fontFamily: 'monospace', fontSize: '10px',
            color: '#c8a8d8', fontStyle: 'bold'
        }));
        this.contZone.add(this.add.text(xDebut, yDebut - 14, `${inv.length} objet${inv.length > 1 ? 's' : ''}`, {
            fontFamily: 'monospace', fontSize: '10px', color: '#8a8a9a'
        }));

        if (inv.length === 0) {
            this.contZone.add(this.add.text(xDebut, yDebut + 30, phraseRienAVendre(), {
                fontFamily: 'monospace', fontSize: '11px',
                color: '#6a6a7a', fontStyle: 'italic',
                wordWrap: { width: 320 }
            }));
            return;
        }

        for (let i = 0; i < inv.length; i++) {
            const item = ITEMS[inv[i]];
            if (!item) continue;
            const c = i % cols;
            const r = Math.floor(i / cols);
            const x = xDebut + c * (taille + espace) + taille / 2;
            const y = yDebut + r * (taille + espace) + taille / 2;
            this._slotItem(x, y, taille, item, this.itemSelectionneIdx === i, () => {
                this.itemSelectionneIdx = i;
                this._refreshTout();
            });
        }
    }

    // Helper : un slot avec emblème + tier
    _slotItem(x, y, taille, item, selectionne, onClick) {
        const couleurBord = selectionne ? COULEURS_INVENTAIRE.orClair : 0x6a6a7a;

        const cadre = this.add.graphics();
        cadre.fillStyle(0x080604, 1);
        cadre.fillRect(x - taille / 2, y - taille / 2, taille, taille);
        cadre.lineStyle(selectionne ? 2 : 1, couleurBord, 1);
        cadre.strokeRect(x - taille / 2, y - taille / 2, taille, taille);
        this.contZone.add(cadre);

        // Fond teinté famille
        const tinted = this.add.graphics();
        tinted.fillStyle(COULEURS_FAMILLE[item.famille], 0.18);
        tinted.fillRect(x - taille / 2 + 1, y - taille / 2 + 1, taille - 2, taille - 2);
        this.contZone.add(tinted);

        // Emblème
        const tailleEmb = Math.max(14, Math.floor(taille * 0.5));
        this.contZone.add(peindreEmblemeFamille(this, x, y, item.famille, tailleEmb));

        // Étoile rouge si Tier 3 effectif
        const tierEff = this.identification.tierEffectif(item);
        if (tierEff === 3 || (item.tier === 3 && this.identification.nbEffetsCaches(item) > 0)) {
            const eto = this.add.graphics();
            eto.fillStyle(0xff6060, 1);
            const dx = x + taille / 2 - 6;
            const dy = y - taille / 2 + 6;
            eto.beginPath();
            for (let k = 0; k < 10; k++) {
                const ang = (k * Math.PI) / 5 - Math.PI / 2;
                const rR = (k % 2 === 0) ? 4 : 1.7;
                const ex = dx + Math.cos(ang) * rR;
                const ey = dy + Math.sin(ang) * rR;
                if (k === 0) eto.moveTo(ex, ey); else eto.lineTo(ex, ey);
            }
            eto.closePath();
            eto.fillPath();
            this.contZone.add(eto);
        }

        const hit = this.add.rectangle(x, y, taille, taille, 0xffffff, 0)
            .setInteractive({ useHandCursor: true });
        hit.on('pointerdown', onClick);
        this.contZone.add(hit);
    }

    // ----- Panneau détail (droit) -----
    _dessinerPanneauDetail() {
        const xDebut = 460, yDebut = 150, w = 470, h = 320;

        const cadre = this.add.graphics();
        cadre.fillStyle(0x0a0805, 0.85);
        cadre.fillRect(xDebut, yDebut, w, h);
        cadre.lineStyle(1, COULEURS_INVENTAIRE.or, 0.85);
        cadre.strokeRect(xDebut, yDebut, w, h);
        cadre.lineStyle(1, COULEURS_INVENTAIRE.orClair, 0.4);
        cadre.strokeRect(xDebut + 3, yDebut + 3, w - 6, h - 6);
        this.contZone.add(cadre);

        const itemId = this._itemIdSelectionne();
        const item = itemId ? ITEMS[itemId] : null;

        if (!item) {
            const msg = this.ongletActif === ONGLET_VITRINE
                ? 'Choisis un objet sur le tapis.\nLe prix s\'affichera ici.'
                : 'Choisis un objet de ton sac.';
            this.contZone.add(this.add.text(xDebut + w / 2, yDebut + h / 2, msg, {
                fontFamily: 'monospace', fontSize: '12px',
                color: '#8a8a9a', fontStyle: 'italic',
                align: 'center', wordWrap: { width: w - 30 }
            }).setOrigin(0.5));
            return;
        }

        const familleColor = COULEURS_FAMILLE[item.famille];
        const cssCouleur = couleurHex(familleColor);
        const cx = xDebut + w / 2;

        // Halo + emblème
        const halo = this.add.graphics();
        halo.setBlendMode(Phaser.BlendModes.ADD);
        halo.fillStyle(familleColor, 0.4);
        halo.fillCircle(cx, yDebut + 50, 38);
        halo.fillStyle(familleColor, 0.7);
        halo.fillCircle(cx, yDebut + 50, 24);
        this.contZone.add(halo);
        this.contZone.add(peindreEmblemeFamille(this, cx, yDebut + 50, item.famille, 38));
        this.tweens.add({
            targets: halo,
            alpha: { from: 0.7, to: 1 },
            duration: 1200, yoyo: true, repeat: -1
        });

        // Nom
        let nom = item.nom;
        if (item.tier === 3 && this.identification.nbEffetsCaches(item) > 0) nom += ' ★';
        this.contZone.add(this.add.text(cx, yDebut + 95, nom, {
            fontFamily: 'monospace', fontSize: '15px',
            color: cssCouleur, fontStyle: 'bold',
            stroke: '#000', strokeThickness: 4,
            align: 'center', wordWrap: { width: w - 20 }
        }).setOrigin(0.5, 0));

        // Sous-titre
        this.contZone.add(this.add.text(cx, yDebut + 119,
            `${item.famille.toUpperCase()}  •  ${item.slot}`,
            {
                fontFamily: 'monospace', fontSize: '10px',
                color: '#8a8a9a', fontStyle: 'bold'
            }
        ).setOrigin(0.5, 0));

        // Effets visibles
        const effets = this.identification.effetsEffectifs(item);
        let yL = yDebut + 145;
        for (let i = 0; i < effets.length; i++) {
            const e = effets[i];
            const puce = this.add.graphics();
            puce.fillStyle(e.visible ? COULEURS_INVENTAIRE.orClair : 0x6a6a7a, 1);
            puce.fillCircle(xDebut + 30, yL + 7, 2.5);
            this.contZone.add(puce);
            const texte = e.visible
                ? `${e.delta >= 0 ? '+' : ''}${e.delta} ${e.cible}`
                : '? — effet inconnu';
            this.contZone.add(this.add.text(xDebut + 40, yL, texte, {
                fontFamily: 'monospace', fontSize: '11px',
                color: e.visible ? '#d8d4c8' : '#7a7a8a',
                fontStyle: e.visible ? 'normal' : 'italic'
            }));
            yL += 16;
        }

        // Infos contextuelles + bouton d'action
        this._dessinerActionsItem(item, xDebut, yDebut, w, h);
    }

    _dessinerActionsItem(item, xDebut, yDebut, w, h) {
        const cx = xDebut + w / 2;
        const yBtn = yDebut + h - 70;

        if (this.ongletActif === ONGLET_VITRINE) {
            const cout = prixAchat(item);
            const peutPayer = this.economy.peutPayer(cout);
            const invPlein = this.inventaire.estPlein();
            const peut = peutPayer && !invPlein;

            // Étiquette de prix
            this.contZone.add(this.add.text(cx, yBtn - 26, `Prix : ${cout} Sel`, {
                fontFamily: 'monospace', fontSize: '13px',
                color: peutPayer ? '#ffd070' : '#ff6060',
                fontStyle: 'bold', stroke: '#000', strokeThickness: 2
            }).setOrigin(0.5));

            this._ajouterBouton(this.contZone, cx - 80, yBtn, 160, 'ACHETER', peut, () => {
                this._tenterAchat();
            });

            if (!peutPayer) {
                this.contZone.add(this.add.text(cx, yBtn + 40, '(Sel insuffisant)', {
                    fontFamily: 'monospace', fontSize: '10px', color: '#ff6060'
                }).setOrigin(0.5));
            } else if (invPlein) {
                this.contZone.add(this.add.text(cx, yBtn + 40, '(Inventaire plein)', {
                    fontFamily: 'monospace', fontSize: '10px', color: '#ff6060'
                }).setOrigin(0.5));
            }
        } else if (this.ongletActif === ONGLET_RACHAT) {
            const gain = prixRachat(item);
            this.contZone.add(this.add.text(cx, yBtn - 26, `Rachat : ${gain} Sel`, {
                fontFamily: 'monospace', fontSize: '13px',
                color: '#ffd070', fontStyle: 'bold',
                stroke: '#000', strokeThickness: 2
            }).setOrigin(0.5));
            this._ajouterBouton(this.contZone, cx - 80, yBtn, 160, 'VENDRE', true, () => {
                this._tenterVente();
            });
        } else if (this.ongletActif === ONGLET_FRAG) {
            const qte = fragmentsRendus(item);
            const fam = item.famille;
            const couleur = couleurHex(COULEURS_FAMILLE[fam]);
            this.contZone.add(this.add.text(cx, yBtn - 38,
                `Rendu : ${qte} Fragment${qte > 1 ? 's' : ''} ${fam}`, {
                    fontFamily: 'monospace', fontSize: '13px',
                    color: couleur, fontStyle: 'bold',
                    stroke: '#000', strokeThickness: 2
                }).setOrigin(0.5));
            if (item.tier === 3) {
                this.contZone.add(this.add.text(cx, yBtn - 18,
                    '(le Reflux peut s\'en mêler...)', {
                        fontFamily: 'monospace', fontSize: '10px',
                        color: '#a878d8', fontStyle: 'italic'
                    }).setOrigin(0.5));
            }
            this._ajouterBouton(this.contZone, cx - 80, yBtn, 160, 'FRAGMENTER', true, () => {
                this._tenterFragmentation();
            });
        }
    }

    _itemIdSelectionne() {
        if (this.itemSelectionneIdx === null) return null;
        if (this.ongletActif === ONGLET_VITRINE) {
            return this.vitrine[this.itemSelectionneIdx] ?? null;
        }
        return this.inventaire.getInventaire()[this.itemSelectionneIdx] ?? null;
    }

    // ============================================================
    // ACTIONS
    // ============================================================
    _tenterAchat() {
        const itemId = this._itemIdSelectionne();
        if (!itemId) return;
        const res = this.marchand.acheter(itemId);
        if (!res.success) {
            if (res.raison === 'inventaire_plein') {
                this.dernierePhrase = phraseInvPlein();
                this.couleurPhrase = '#ff8080';
            } else if (res.raison === 'sel_insuffisant') {
                this.dernierePhrase = phraseVentePauvre(this.rngPhrase);
                this.couleurPhrase = '#ff8080';
            }
            this._refreshTout();
            return;
        }
        // Succès : retire l'item de la vitrine et persiste
        this.vitrine.splice(this.itemSelectionneIdx, 1);
        this.registry.set(this.cleVitrine, [...this.vitrine]);
        this.itemSelectionneIdx = null;
        this.dernierePhrase = phraseVenteReussie(this.rngPhrase);
        this.couleurPhrase = '#c8a8d8';
        this._jouerEffetTransaction('or');
        this._refreshTout();
    }

    _tenterVente() {
        if (this.itemSelectionneIdx === null) return;
        const res = this.marchand.vendre(this.itemSelectionneIdx);
        if (!res.success) {
            this._refreshTout();
            return;
        }
        // L'inventaire a perdu une case, on désélectionne
        this.itemSelectionneIdx = null;
        this.dernierePhrase = phraseRachatReussi(this.rngPhrase);
        this.couleurPhrase = '#c8a8d8';
        this._jouerEffetTransaction('or');
        this._refreshTout();
    }

    _tenterFragmentation() {
        if (this.itemSelectionneIdx === null) return;
        const res = this.marchand.fragmenter(this.itemSelectionneIdx, this.rngPhrase);
        if (!res.success) {
            this._refreshTout();
            return;
        }
        this.itemSelectionneIdx = null;
        if (res.bonusNoir) {
            this.dernierePhrase = phraseFragmentationBonus(this.rngPhrase);
            this.couleurPhrase = '#a878d8';
        } else {
            this.dernierePhrase = phraseFragmentation(this.rngPhrase);
            this.couleurPhrase = '#c8a8d8';
        }
        this._jouerEffetTransaction(res.bonusNoir ? 'reflux' : 'fragments', res.famille);
        this._refreshTout();
    }

    /**
     * Petite cascade dorée centrée sur le panneau de détail.
     * mode : 'or' (pièces de Sel), 'fragments' (couleur famille), 'reflux' (violet)
     */
    _jouerEffetTransaction(mode, famille) {
        const xDebut = 460, yDebut = 150, w = 470;
        const cx = xDebut + w / 2;
        const cy = yDebut + 50;

        let couleurs = [0xffd070, 0xc8a85a];
        if (mode === 'fragments' && famille) {
            couleurs = [COULEURS_FAMILLE[famille], 0xc8a85a];
        } else if (mode === 'reflux') {
            couleurs = [0x8a5aa8, 0x4a2a6a, 0x2a0a3a];
        }

        const flash = this.add.graphics();
        flash.setBlendMode(Phaser.BlendModes.ADD);
        flash.setDepth(315);
        flash.setScrollFactor(0);
        flash.fillStyle(couleurs[0], 0.85);
        flash.fillCircle(cx, cy, 28);
        this.tweens.add({
            targets: flash,
            scale: { from: 0.5, to: 2.4 },
            alpha: { from: 1, to: 0 },
            duration: 480,
            ease: 'Cubic.Out',
            onComplete: () => flash.destroy()
        });

        if (this.textures.exists('_particule')) {
            const burst = this.add.particles(cx, cy, '_particule', {
                lifespan: 600,
                speed: { min: 60, max: 180 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.55, end: 0 },
                tint: couleurs,
                quantity: 14,
                blendMode: Phaser.BlendModes.ADD,
                alpha: { start: 1, end: 0 }
            });
            burst.setDepth(315);
            burst.setScrollFactor(0);
            burst.explode(14);
            this.time.delayedCall(650, () => burst.destroy());
        }
    }

    // ============================================================
    // BANDE RESSOURCES (en bas)
    // ============================================================
    _dessinerBandeRessources() {
        if (this.contRessources) this.contRessources.destroy();
        this.contRessources = this.add.container(0, 0).setDepth(310).setScrollFactor(0);

        const cx = GAME_WIDTH / 2;
        const y = GAME_HEIGHT - 55;

        const liseré = this.add.graphics();
        liseré.lineStyle(1, COULEURS_INVENTAIRE.or, 0.5);
        liseré.beginPath();
        liseré.moveTo(cx - 280, y - 8);
        liseré.lineTo(cx + 280, y - 8);
        liseré.strokePath();
        this.contRessources.add(liseré);

        const blocs = [
            { type: 'sel', label: 'SEL', val: this.economy.getSel(), couleur: '#ffd070' },
            { type: 'encre', label: 'ENCRE', val: this.economy.getEncre(), couleur: '#a0a0c8' },
            { type: 'frag', famille: 'blanc', label: 'BLANC', val: this.economy.getFragment('blanc') },
            { type: 'frag', famille: 'bleu',  label: 'BLEU',  val: this.economy.getFragment('bleu') },
            { type: 'frag', famille: 'noir',  label: 'NOIR',  val: this.economy.getFragment('noir') }
        ];

        const espace = 110;
        const xDebut = cx - (5 * espace) / 2;
        for (let k = 0; k < blocs.length; k++) {
            const b = blocs[k];
            const x = xDebut + espace * k + espace / 2;

            if (b.type === 'sel') {
                const cristal = this.add.graphics({ x: x - 22, y: y + 6 });
                cristal.fillStyle(0xffd070, 1);
                cristal.beginPath();
                cristal.moveTo(0, -6); cristal.lineTo(5, 0); cristal.lineTo(0, 6); cristal.lineTo(-5, 0);
                cristal.closePath(); cristal.fillPath();
                cristal.fillStyle(0xffffff, 0.7);
                cristal.fillCircle(-2, -2, 1.5);
                this.contRessources.add(cristal);
            } else if (b.type === 'encre') {
                const flacon = this.add.graphics({ x: x - 22, y: y + 6 });
                flacon.fillStyle(0xc8a85a, 1);
                flacon.fillRect(-2, -8, 4, 2);
                flacon.fillStyle(0x1a1a24, 1);
                flacon.fillRect(-3, -6, 6, 9);
                flacon.fillStyle(0x4a4a5a, 0.8);
                flacon.fillRect(-2, -5, 1, 7);
                this.contRessources.add(flacon);
            } else {
                this.contRessources.add(peindreEmblemeFamille(this, x - 22, y + 6, b.famille, 14));
            }

            this.contRessources.add(this.add.text(x - 12, y, b.label, {
                fontFamily: 'monospace', fontSize: '10px',
                color: '#8a8a9a', fontStyle: 'bold'
            }));
            this.contRessources.add(this.add.text(x + 22, y - 2, `${b.val}`, {
                fontFamily: 'monospace', fontSize: '14px',
                color: b.couleur ?? '#e8e4d8',
                fontStyle: 'bold', stroke: '#000', strokeThickness: 3
            }));
        }
    }

    // ============================================================
    // BOUTON STYLISÉ
    // ============================================================
    _ajouterBouton(parent, x, y, w, label, actif, onClick) {
        const h = 30;

        const couleurBord = actif ? COULEURS_INVENTAIRE.or : 0x4a4a5a;
        const couleurBordHover = COULEURS_INVENTAIRE.orClair;
        const couleurFond = 0x14100a;
        const couleurFondHover = 0x2a1810;
        const couleurTexte = actif ? '#ffd070' : '#5a5a6a';

        const fond = this.add.graphics();
        const dessiner = (hover) => {
            fond.clear();
            fond.fillStyle(hover ? couleurFondHover : couleurFond, 1);
            fond.fillRect(x, y, w, h);
            fond.lineStyle(1.5, hover ? couleurBordHover : couleurBord, 1);
            fond.strokeRect(x, y, w, h);
            fond.lineStyle(1, couleurBordHover, hover ? 0.8 : 0.5);
            const c = 4;
            fond.beginPath();
            fond.moveTo(x, y + c); fond.lineTo(x, y); fond.lineTo(x + c, y);
            fond.moveTo(x + w - c, y); fond.lineTo(x + w, y); fond.lineTo(x + w, y + c);
            fond.moveTo(x, y + h - c); fond.lineTo(x, y + h); fond.lineTo(x + c, y + h);
            fond.moveTo(x + w - c, y + h); fond.lineTo(x + w, y + h); fond.lineTo(x + w, y + h - c);
            fond.strokePath();
        };
        dessiner(false);
        parent.add(fond);

        const txt = this.add.text(x + w / 2, y + h / 2, label, {
            fontFamily: 'monospace', fontSize: '12px',
            color: couleurTexte, fontStyle: 'bold',
            stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5);
        parent.add(txt);

        if (actif) {
            const hit = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0xffffff, 0)
                .setInteractive({ useHandCursor: true });
            hit.on('pointerover', () => dessiner(true));
            hit.on('pointerout', () => dessiner(false));
            hit.on('pointerdown', onClick);
            parent.add(hit);
        }
    }

    _refreshTout() {
        // Si l'index sélectionné dépasse la nouvelle taille (vente / fragmentation),
        // on désélectionne proprement.
        if (this.itemSelectionneIdx !== null) {
            const taille = this.ongletActif === ONGLET_VITRINE
                ? this.vitrine.length
                : this.inventaire.getInventaire().length;
            if (this.itemSelectionneIdx >= taille) {
                this.itemSelectionneIdx = null;
            }
        }
        this._dessinerPhrase();
        this._dessinerOnglets();
        this._dessinerZonePrincipale();
        this._dessinerBandeRessources();
    }
}
