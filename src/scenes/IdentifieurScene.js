// IdentifieurScene — overlay de révélation des effets cachés.
//
// Workflow :
//   1. Liste filtrée de l'inventaire : Tier 2 et Tier 3 avec effets cachés
//   2. Sélection d'un item → panneau détail avec effets visibles + cachés (?)
//   3. Boutons RÉVÉLER : payer en Sel OU en Encre du Témoin
//   4. Animation : halo doré + phrase poétique cryptique
//   5. L'effet est révélé (globale par itemId)

import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { InventaireSystem, CAPACITE_INVENTAIRE } from '../systems/InventaireSystem.js';
import {
    EconomySystem, EVT_SEL_CHANGE, EVT_FRAGMENTS_CHANGE, EVT_ENCRE_CHANGE
} from '../systems/EconomySystem.js';
import { IdentificationSystem, EVT_IDENT_CHANGE } from '../systems/IdentificationSystem.js';
import { phraseEffet } from '../data/phrases-identifieur.js';
import { ITEMS, COULEURS_FAMILLE } from '../data/items.js';
import { peindreEmblemeFamille } from '../render/ui/EmblemeFamille.js';
import { COULEURS_INVENTAIRE, poserCadreInventaire, poserBoutonFermer } from '../render/ui/CadreInventaire.js';

const couleurHex = (n) => '#' + n.toString(16).padStart(6, '0');

export class IdentifieurScene extends Phaser.Scene {
    constructor() {
        super({ key: 'IdentifieurScene' });
    }

    init(data) {
        this.rngPhrase = data?.rng ?? Math.random;
    }

    create() {
        this.economy = new EconomySystem(this.registry);
        this.inventaire = new InventaireSystem(this.registry);
        this.identification = new IdentificationSystem(this.registry);

        this.itemSelectionneId = null;
        this.dernierePhrase = null;

        // --- Cadre stylisé ---
        const cadre = poserCadreInventaire(this, GAME_WIDTH, GAME_HEIGHT);
        cadre.titre.setText('L\'IDENTIFIEUR');

        poserBoutonFermer(this, GAME_WIDTH - 50, 50, () => this.fermer());

        // --- Phrase d'accueil ---
        this.phraseAccueil = this.add.text(GAME_WIDTH / 2, 78,
            '"Pose un objet entre mes mains."',
            {
                fontFamily: 'monospace', fontSize: '13px',
                color: '#a0c8ff', fontStyle: 'italic',
                stroke: '#000', strokeThickness: 2
            }
        ).setOrigin(0.5, 0).setScrollFactor(0).setDepth(310);

        // --- Sections principales ---
        this._dessinerListeItems();
        this._dessinerPanneauItem();
        this._dessinerBandeRessources();

        // --- Touches ---
        this.input.keyboard.on('keydown-ESC', () => this.fermer());

        // Écoute des events pour redessin
        const handlerEco = () => this._refreshTout();
        const handlerIdent = () => this._refreshTout();
        this.registry.events.on(EVT_SEL_CHANGE, handlerEco);
        this.registry.events.on(EVT_FRAGMENTS_CHANGE, handlerEco);
        this.registry.events.on(EVT_ENCRE_CHANGE, handlerEco);
        this.registry.events.on(EVT_IDENT_CHANGE, handlerIdent);
        this.events.once('shutdown', () => {
            this.registry.events.off(EVT_SEL_CHANGE, handlerEco);
            this.registry.events.off(EVT_FRAGMENTS_CHANGE, handlerEco);
            this.registry.events.off(EVT_ENCRE_CHANGE, handlerEco);
            this.registry.events.off(EVT_IDENT_CHANGE, handlerIdent);
        });
    }

    fermer() {
        const codes = Phaser.Input.Keyboard.KeyCodes;
        const keys = this.input.keyboard.keys;
        [codes.ESC].forEach(c => keys[c]?.reset());
        this.scene.resume('GameScene');
        this.scene.stop();
    }

    /**
     * Items éligibles à l'identification : Tier 2 ou Tier 3 avec effets
     * cachés restants. Renvoie [{ itemId, item, indexEffet }, ...].
     */
    _itemsEligibles() {
        const inv = this.inventaire.getInventaire();
        const equip = this.inventaire.getEquipement();
        const tousIds = [...inv, ...Object.values(equip).filter(Boolean)];
        // Dédupe par itemId : si plusieurs instances, on n'affiche qu'une fois
        const dejaVus = new Set();
        const resultat = [];
        for (const id of tousIds) {
            if (dejaVus.has(id)) continue;
            dejaVus.add(id);
            const item = ITEMS[id];
            if (!item) continue;
            if (item.tier === 1) continue;
            if (this.identification.nbEffetsCaches(item) === 0) continue;
            resultat.push({ itemId: id, item });
        }
        return resultat;
    }

    // ============================================================
    // LISTE DES ITEMS (à gauche, slots filtrés)
    // ============================================================
    _dessinerListeItems() {
        if (this.contListe) this.contListe.destroy();
        this.contListe = this.add.container(0, 0).setDepth(310).setScrollFactor(0);

        const xDebut = 60;
        const yDebut = 130;
        const taille = 38;
        const espace = 6;
        const cols = 7;

        const eligibles = this._itemsEligibles();

        // Titre + sous-titre de la liste (remontés pour ne plus chevaucher
        // le haut des slots qui commencent à yDebut - taille/2 = 111)
        this.contListe.add(this.add.text(xDebut, yDebut - 38, 'OBJETS À IDENTIFIER', {
            fontFamily: 'monospace', fontSize: '10px', color: '#a0c8ff',
            fontStyle: 'bold'
        }));
        this.contListe.add(this.add.text(xDebut, yDebut - 23, `${eligibles.length} restant${eligibles.length > 1 ? 's' : ''}`, {
            fontFamily: 'monospace', fontSize: '10px', color: '#8a8a9a'
        }));

        if (eligibles.length === 0) {
            // Message vide
            this.contListe.add(this.add.text(xDebut, yDebut + 30,
                'Aucun objet n\'a d\'effet à révéler.\nReviens avec un objet Tier 2 ou 3.',
                {
                    fontFamily: 'monospace', fontSize: '11px',
                    color: '#6a6a7a', fontStyle: 'italic',
                    wordWrap: { width: 320 }
                }
            ));
            return;
        }

        for (let i = 0; i < eligibles.length; i++) {
            const { itemId, item } = eligibles[i];
            const c = i % cols;
            const r = Math.floor(i / cols);
            const x = xDebut + c * (taille + espace) + taille / 2;
            const y = yDebut + r * (taille + espace) + taille / 2;

            const selectionne = this.itemSelectionneId === itemId;
            const couleurBord = selectionne ? COULEURS_INVENTAIRE.orClair : 0x6a6a7a;

            // Cadre
            const cadre = this.add.graphics();
            cadre.fillStyle(0x080604, 1);
            cadre.fillRect(x - taille / 2, y - taille / 2, taille, taille);
            cadre.lineStyle(selectionne ? 2 : 1, couleurBord, 1);
            cadre.strokeRect(x - taille / 2, y - taille / 2, taille, taille);
            this.contListe.add(cadre);

            // Fond teinté de la couleur de famille
            const tinted = this.add.graphics();
            tinted.fillStyle(COULEURS_FAMILLE[item.famille], 0.18);
            tinted.fillRect(x - taille / 2 + 1, y - taille / 2 + 1, taille - 2, taille - 2);
            this.contListe.add(tinted);

            // Emblème
            const emb = peindreEmblemeFamille(this, x, y, item.famille, 18);
            this.contListe.add(emb);

            // Étoile rouge si Tier 3
            if (item.tier === 3) {
                const eto = this.add.graphics();
                eto.fillStyle(0xff6060, 1);
                const dx = x + taille / 2 - 6;
                const dy = y - taille / 2 + 6;
                eto.beginPath();
                for (let k = 0; k < 10; k++) {
                    const ang = (k * Math.PI) / 5 - Math.PI / 2;
                    const r0 = (k % 2 === 0) ? 4 : 1.7;
                    const ex = dx + Math.cos(ang) * r0;
                    const ey = dy + Math.sin(ang) * r0;
                    if (k === 0) eto.moveTo(ex, ey); else eto.lineTo(ex, ey);
                }
                eto.closePath();
                eto.fillPath();
                this.contListe.add(eto);
            }

            // Hitbox
            const hit = this.add.rectangle(x, y, taille, taille, 0xffffff, 0)
                .setInteractive({ useHandCursor: true });
            hit.on('pointerdown', () => {
                this.itemSelectionneId = itemId;
                this.dernierePhrase = null; // efface phrase précédente
                this._refreshTout();
            });
            this.contListe.add(hit);
        }
    }

    // ============================================================
    // PANNEAU DE L'ITEM SÉLECTIONNÉ (à droite)
    // ============================================================
    _dessinerPanneauItem() {
        if (this.contPanneau) this.contPanneau.destroy();
        this.contPanneau = this.add.container(0, 0).setDepth(310).setScrollFactor(0);

        const xDebut = 460;
        const yDebut = 130;
        const w = 470;
        const h = 320;

        // Cadre du panneau
        const cadre = this.add.graphics();
        cadre.fillStyle(0x0a0805, 0.85);
        cadre.fillRect(xDebut, yDebut, w, h);
        cadre.lineStyle(1, COULEURS_INVENTAIRE.or, 0.85);
        cadre.strokeRect(xDebut, yDebut, w, h);
        cadre.lineStyle(1, COULEURS_INVENTAIRE.orClair, 0.4);
        cadre.strokeRect(xDebut + 3, yDebut + 3, w - 6, h - 6);
        this.contPanneau.add(cadre);

        if (!this.itemSelectionneId) {
            this.contPanneau.add(this.add.text(xDebut + w / 2, yDebut + h / 2,
                'Sélectionne un objet à gauche\npour voir ses effets cachés.',
                {
                    fontFamily: 'monospace', fontSize: '12px',
                    color: '#8a8a9a', fontStyle: 'italic',
                    align: 'center', wordWrap: { width: w - 30 }
                }
            ).setOrigin(0.5));
            return;
        }

        const item = ITEMS[this.itemSelectionneId];
        if (!item) return;
        const familleColor = COULEURS_FAMILLE[item.famille];
        const cssCouleur = couleurHex(familleColor);
        const cx = xDebut + w / 2;

        // Emblème agrandi avec halo
        const halo = this.add.graphics();
        halo.setBlendMode(Phaser.BlendModes.ADD);
        halo.fillStyle(familleColor, 0.4);
        halo.fillCircle(cx, yDebut + 50, 38);
        halo.fillStyle(familleColor, 0.7);
        halo.fillCircle(cx, yDebut + 50, 24);
        this.contPanneau.add(halo);
        this.contPanneau.add(peindreEmblemeFamille(this, cx, yDebut + 50, item.famille, 38));
        this.tweens.add({
            targets: halo,
            alpha: { from: 0.7, to: 1 },
            duration: 1200,
            yoyo: true, repeat: -1
        });

        // Nom
        let nom = item.nom;
        if (item.tier === 3 && this.identification.nbEffetsCaches(item) > 0) nom += ' ★';
        this.contPanneau.add(this.add.text(cx, yDebut + 95, nom, {
            fontFamily: 'monospace', fontSize: '15px',
            color: cssCouleur, fontStyle: 'bold',
            stroke: '#000', strokeThickness: 4,
            align: 'center', wordWrap: { width: w - 20 }
        }).setOrigin(0.5, 0));

        // Sous-titre
        this.contPanneau.add(this.add.text(cx, yDebut + 119,
            `${item.famille.toUpperCase()}  •  ${item.slot}`,
            {
                fontFamily: 'monospace', fontSize: '10px',
                color: '#8a8a9a', fontStyle: 'bold'
            }
        ).setOrigin(0.5, 0));

        // Liste des effets selon ce qui est visible/caché
        const effets = this.identification.effetsEffectifs(item);
        let yL = yDebut + 145;
        for (let i = 0; i < effets.length; i++) {
            const e = effets[i];
            const puce = this.add.graphics();
            puce.fillStyle(e.visible ? COULEURS_INVENTAIRE.orClair : 0x6a6a7a, 1);
            puce.fillCircle(xDebut + 30, yL + 7, 2.5);
            this.contPanneau.add(puce);

            const texte = e.visible
                ? `${e.delta >= 0 ? '+' : ''}${e.delta} ${e.cible}`
                : '? — effet inconnu';
            this.contPanneau.add(this.add.text(xDebut + 40, yL, texte, {
                fontFamily: 'monospace', fontSize: '11px',
                color: e.visible ? '#d8d4c8' : '#7a7a8a',
                fontStyle: e.visible ? 'normal' : 'italic'
            }));
            yL += 16;
        }

        // Phrase de révélation (apparaît juste après une action)
        if (this.dernierePhrase) {
            const yPhrase = yL + 8;
            this.contPanneau.add(this.add.text(cx, yPhrase,
                `"${this.dernierePhrase}"`,
                {
                    fontFamily: 'monospace', fontSize: '12px',
                    color: '#a0c8ff', fontStyle: 'italic',
                    align: 'center', wordWrap: { width: w - 30 },
                    stroke: '#000', strokeThickness: 2
                }
            ).setOrigin(0.5, 0));
            yL = yPhrase + 28;
        }

        // Boutons RÉVÉLER (Sel) + RÉVÉLER (Encre)
        const nbCaches = this.identification.nbEffetsCaches(item);
        if (nbCaches > 0) {
            const yBtn = yDebut + h - 56;
            const cout = this.identification.coutEnSelPour(item);
            const peutSel = this.economy.peutPayer(cout);
            const peutEncre = this.economy.getEncre() > 0;

            const labelSel = `Révéler (${cout} Sel)`;
            const labelEncre = `Révéler (1 Encre)`;

            this._ajouterBouton(this.contPanneau, xDebut + 30, yBtn, labelSel, peutSel,
                () => this._revelerAvecSel(item));
            this._ajouterBouton(this.contPanneau, xDebut + w - 170, yBtn, labelEncre, peutEncre,
                () => this._revelerAvecEncre(item));

            this.contPanneau.add(this.add.text(cx, yBtn + 36,
                `${nbCaches} effet${nbCaches > 1 ? 's' : ''} encore caché${nbCaches > 1 ? 's' : ''}`,
                {
                    fontFamily: 'monospace', fontSize: '10px',
                    color: '#8a8a9a', fontStyle: 'italic'
                }
            ).setOrigin(0.5, 0));
        } else {
            this.contPanneau.add(this.add.text(cx, yDebut + h - 30,
                'Tous les effets sont révélés.',
                {
                    fontFamily: 'monospace', fontSize: '11px',
                    color: '#6a8aa0', fontStyle: 'italic'
                }
            ).setOrigin(0.5, 0));
        }
    }

    // ============================================================
    // BANDE RESSOURCES (Sel + Encre + Fragments)
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

        // 5 blocs : Sel + Encre + 3 Fragments
        const blocs = [
            { type: 'sel', label: 'SEL', val: this.economy.getSel(), couleur: '#ffd070' },
            { type: 'encre', label: 'ENCRE', val: this.economy.getEncre(), couleur: '#a0a0c8' },
            { type: 'frag', famille: 'blanc', label: 'BLANC', val: this.economy.getFragment('blanc') },
            { type: 'frag', famille: 'bleu', label: 'BLEU', val: this.economy.getFragment('bleu') },
            { type: 'frag', famille: 'noir', label: 'NOIR', val: this.economy.getFragment('noir') }
        ];

        const espace = 110;
        const xDebut = cx - (5 * espace) / 2;
        for (let k = 0; k < blocs.length; k++) {
            const b = blocs[k];
            const x = xDebut + espace * k + espace / 2;

            // Symbole
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
                // Petit flacon noir
                const flacon = this.add.graphics({ x: x - 22, y: y + 6 });
                flacon.fillStyle(0xc8a85a, 1);  // bouchon doré
                flacon.fillRect(-2, -8, 4, 2);
                flacon.fillStyle(0x1a1a24, 1);
                flacon.fillRect(-3, -6, 6, 9);
                flacon.fillStyle(0x4a4a5a, 0.8);
                flacon.fillRect(-2, -5, 1, 7);
                this.contRessources.add(flacon);
            } else {
                this.contRessources.add(peindreEmblemeFamille(this, x - 22, y + 6, b.famille, 14));
            }

            // Label
            this.contRessources.add(this.add.text(x - 12, y, b.label, {
                fontFamily: 'monospace', fontSize: '10px',
                color: '#8a8a9a', fontStyle: 'bold'
            }));

            // Valeur
            const couleurValeur = b.couleur ?? '#e8e4d8';
            this.contRessources.add(this.add.text(x + 22, y - 2, `${b.val}`, {
                fontFamily: 'monospace', fontSize: '14px',
                color: couleurValeur, fontStyle: 'bold',
                stroke: '#000', strokeThickness: 3
            }));
        }
    }

    // ============================================================
    // ACTIONS
    // ============================================================
    _revelerAvecSel(item) {
        const cout = this.identification.coutEnSelPour(item);
        if (!this.economy.peutPayer(cout)) return;
        const idx = this.identification.premierEffetCache(item);
        if (idx === -1) return;
        const cible = item.effets[idx]?.cible;

        this.economy.retirerSel(cout);
        this.identification.revelerEffet(item.id, idx);
        this.dernierePhrase = phraseEffet(cible, this.rngPhrase);
        this._jouerEffetRevelation(item);
        this._refreshTout();
    }

    _revelerAvecEncre(item) {
        if (this.economy.getEncre() <= 0) return;
        const idx = this.identification.premierEffetCache(item);
        if (idx === -1) return;
        const cible = item.effets[idx]?.cible;

        this.economy.retirerEncre(1);
        this.identification.revelerEffet(item.id, idx);
        this.dernierePhrase = phraseEffet(cible, this.rngPhrase);
        this._jouerEffetRevelation(item);
        this._refreshTout();
    }

    _jouerEffetRevelation(item) {
        const xDebut = 460, yDebut = 130, w = 470;
        const cx = xDebut + w / 2;
        const cy = yDebut + 50;

        // Burst doré sur l'emblème
        const flash = this.add.graphics();
        flash.setBlendMode(Phaser.BlendModes.ADD);
        flash.setDepth(315);
        flash.setScrollFactor(0);
        flash.fillStyle(0xffd070, 0.85);
        flash.fillCircle(cx, cy, 30);
        flash.fillStyle(0xffffff, 0.7);
        flash.fillCircle(cx, cy, 16);
        this.tweens.add({
            targets: flash,
            scale: { from: 0.5, to: 2.4 },
            alpha: { from: 1, to: 0 },
            duration: 480,
            ease: 'Cubic.Out',
            onComplete: () => flash.destroy()
        });

        // Particules dorées
        if (this.textures.exists('_particule')) {
            const burst = this.add.particles(cx, cy, '_particule', {
                lifespan: 600,
                speed: { min: 60, max: 180 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.55, end: 0 },
                tint: [0xffd070, 0xc8a85a, 0xa0c8ff],
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

    _refreshTout() {
        // Si l'item sélectionné n'a plus d'effets cachés, on garde la sélection
        // (l'utilisateur voit "Tous les effets sont révélés.")
        // Si l'item n'est plus dans l'inventaire (équipé/jeté), on désélectionne
        const eligibles = this._itemsEligibles();
        if (this.itemSelectionneId) {
            const item = ITEMS[this.itemSelectionneId];
            const encoreInv = this.inventaire.getInventaire().includes(this.itemSelectionneId)
                || Object.values(this.inventaire.getEquipement()).includes(this.itemSelectionneId);
            if (!item || !encoreInv) {
                this.itemSelectionneId = null;
                this.dernierePhrase = null;
            }
        }
        this._dessinerListeItems();
        this._dessinerPanneauItem();
        this._dessinerBandeRessources();
    }

    // ============================================================
    // BOUTON STYLISÉ
    // ============================================================
    _ajouterBouton(parent, x, y, label, actif, onClick) {
        const w = 140, h = 30;

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
            fontFamily: 'monospace', fontSize: '11px',
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
}
