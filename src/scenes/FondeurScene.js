// Scène overlay — Table de Forge du Fondeur.
//
// Style "tableau gravé" cohérent avec le Carnet du Vestige :
//   - Cadre pierre + double bordure dorée
//   - 3 emplacements pour Fragments
//   - 3 boutons d'ajout (cliquer un emblème pour ajouter au prochain emplacement libre)
//   - Bouton FONDRE (consomme Fragments + Sel, révèle un item)
//   - Phrase cryptique du Fondeur qui change selon les Fragments déposés
//   - Aucune recette n'est jamais affichée — mystère préservé

import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { InventaireSystem } from '../systems/InventaireSystem.js';
import { EconomySystem, EVT_SEL_CHANGE, EVT_FRAGMENTS_CHANGE } from '../systems/EconomySystem.js';
import { FondeurSystem } from '../systems/FondeurSystem.js';
import { coutEnSel, phraseFondeur, PHRASE_INV_PLEIN } from '../data/recettes.js';
import { ITEMS, COULEURS_FAMILLE } from '../data/items.js';
import { peindreEmblemeFamille } from '../render/ui/EmblemeFamille.js';
import { COULEURS_INVENTAIRE, poserCadreInventaire, poserBoutonFermer } from '../render/ui/CadreInventaire.js';

export class FondeurScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FondeurScene' });
    }

    init(data) {
        // PRNG pour tirer le résultat (passé depuis GameScene pour reproductibilité)
        this.rngForge = data?.rng ?? Math.random;
    }

    create() {
        this.economy = new EconomySystem(this.registry);
        this.inventaire = new InventaireSystem(this.registry);
        this.fondeur = new FondeurSystem(this.economy, this.inventaire);

        // Slots de la table : tableau de famille (string) ou null
        this.slots = [null, null, null];
        this.itemResultat = null;

        // --- Cadre stylisé ---
        const cadre = poserCadreInventaire(this, GAME_WIDTH, GAME_HEIGHT);
        // Réécrit le titre du cadre
        cadre.titre.setText('TABLE DE FORGE');

        // Bouton fermer
        poserBoutonFermer(this, GAME_WIDTH - 50, 50, () => this.fermer());

        // --- Phrase du Fondeur ---
        this.phraseTexte = this.add.text(GAME_WIDTH / 2, 78, '"' + phraseFondeur([]) + '"', {
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#c8a85a',
            fontStyle: 'italic',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(310);

        // --- Zone des emplacements (3 carrés au centre) ---
        this._dessinerEmplacements();

        // --- Boutons d'ajout (3 emblèmes Blanc/Bleu/Noir) ---
        this._dessinerBoutonsAjout();

        // --- Coût + boutons FONDRE / FERMER ---
        this._dessinerActions();

        // --- Zone résultat ---
        this._dessinerResultat();

        // --- Bande ressources en bas ---
        this._dessinerBandeRessources();

        // --- Touches ---
        this.input.keyboard.on('keydown-ESC', () => this.fermer());

        // Refresh global au changement de Sel/Fragments (autres sources)
        const handlerEco = () => this._refreshTout();
        this.registry.events.on(EVT_SEL_CHANGE, handlerEco);
        this.registry.events.on(EVT_FRAGMENTS_CHANGE, handlerEco);
        this.events.once('shutdown', () => {
            this.registry.events.off(EVT_SEL_CHANGE, handlerEco);
            this.registry.events.off(EVT_FRAGMENTS_CHANGE, handlerEco);
        });
    }

    fermer() {
        // Reset les touches pour éviter les surdéclenchements
        const codes = Phaser.Input.Keyboard.KeyCodes;
        const keys = this.input.keyboard.keys;
        [codes.ESC].forEach(c => keys[c]?.reset());
        this.scene.resume('GameScene');
        this.scene.stop();
    }

    // ============================================================
    // EMPLACEMENTS DE FORGE
    // ============================================================
    _dessinerEmplacements() {
        if (this.contEmplacements) this.contEmplacements.destroy();
        this.contEmplacements = this.add.container(0, 0).setDepth(310).setScrollFactor(0);

        const cx = GAME_WIDTH / 2;
        const y = 130;
        const taille = 56;
        const espace = 20;

        for (let i = 0; i < 3; i++) {
            const x = cx + (i - 1) * (taille + espace);

            // Cadre du slot
            const cadre = this.add.graphics();
            cadre.fillStyle(0x080604, 1);
            cadre.fillRect(x - taille / 2, y - taille / 2, taille, taille);
            cadre.lineStyle(2, COULEURS_INVENTAIRE.or, 0.85);
            cadre.strokeRect(x - taille / 2, y - taille / 2, taille, taille);
            cadre.lineStyle(1, COULEURS_INVENTAIRE.orClair, 0.5);
            cadre.strokeRect(x - taille / 2 + 3, y - taille / 2 + 3, taille - 6, taille - 6);
            this.contEmplacements.add(cadre);

            // Si rempli : emblème de la famille au centre
            const fam = this.slots[i];
            if (fam) {
                const emb = peindreEmblemeFamille(this, x, y, fam, 28);
                this.contEmplacements.add(emb);
            }

            // Hitbox cliquable (pour retirer)
            const hit = this.add.rectangle(x, y, taille, taille, 0xffffff, 0)
                .setInteractive({ useHandCursor: true });
            hit.on('pointerdown', () => this._retirerSlot(i));
            this.contEmplacements.add(hit);
        }

        // Label sous les emplacements
        const lbl = this.add.text(cx, y + taille / 2 + 10, 'FRAGMENTS', {
            fontFamily: 'monospace', fontSize: '10px', color: '#8a8a9a',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        this.contEmplacements.add(lbl);
    }

    // ============================================================
    // BOUTONS D'AJOUT (emblèmes des 3 familles)
    // ============================================================
    _dessinerBoutonsAjout() {
        if (this.contBoutonsAjout) this.contBoutonsAjout.destroy();
        this.contBoutonsAjout = this.add.container(0, 0).setDepth(310).setScrollFactor(0);

        const cx = GAME_WIDTH / 2;
        const y = 235;
        const taille = 44;
        const espace = 16;
        const familles = ['blanc', 'bleu', 'noir'];

        // Label clairement au-dessus des boutons (40 px d'écart)
        const lbl = this.add.text(cx, y - 40, '— AJOUTER UN FRAGMENT —', {
            fontFamily: 'monospace', fontSize: '10px', color: '#c8a85a',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        this.contBoutonsAjout.add(lbl);

        for (let i = 0; i < familles.length; i++) {
            const fam = familles[i];
            const x = cx + (i - 1) * (taille + espace);
            const dispo = this.economy.getFragment(fam);

            const cadre = this.add.graphics();
            const interactif = dispo > 0;
            const couleurBord = interactif ? COULEURS_INVENTAIRE.or : 0x4a4a5a;
            cadre.fillStyle(0x080604, 1);
            cadre.fillRect(x - taille / 2, y - taille / 2, taille, taille);
            cadre.lineStyle(1, couleurBord, interactif ? 0.85 : 0.4);
            cadre.strokeRect(x - taille / 2, y - taille / 2, taille, taille);
            this.contBoutonsAjout.add(cadre);

            const emb = peindreEmblemeFamille(this, x, y - 4, fam, 22);
            if (!interactif) emb.setAlpha(0.35);
            this.contBoutonsAjout.add(emb);

            // Compteur de Fragments dispo
            const compteur = this.add.text(x, y + taille / 2 - 7, `${dispo}`, {
                fontFamily: 'monospace', fontSize: '11px',
                color: interactif ? '#e8e4d8' : '#5a5a6a',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            this.contBoutonsAjout.add(compteur);

            if (interactif) {
                const hit = this.add.rectangle(x, y, taille, taille, 0xffffff, 0)
                    .setInteractive({ useHandCursor: true });
                hit.on('pointerdown', () => this._ajouterSlot(fam));
                hit.on('pointerover', () => {
                    cadre.clear();
                    cadre.fillStyle(0x14100a, 1);
                    cadre.fillRect(x - taille / 2, y - taille / 2, taille, taille);
                    cadre.lineStyle(2, COULEURS_INVENTAIRE.orClair, 1);
                    cadre.strokeRect(x - taille / 2, y - taille / 2, taille, taille);
                });
                hit.on('pointerout', () => {
                    cadre.clear();
                    cadre.fillStyle(0x080604, 1);
                    cadre.fillRect(x - taille / 2, y - taille / 2, taille, taille);
                    cadre.lineStyle(1, COULEURS_INVENTAIRE.or, 0.85);
                    cadre.strokeRect(x - taille / 2, y - taille / 2, taille, taille);
                });
                this.contBoutonsAjout.add(hit);
            }
        }
    }

    // ============================================================
    // ACTIONS (coût + bouton FONDRE)
    // ============================================================
    _dessinerActions() {
        if (this.contActions) this.contActions.destroy();
        this.contActions = this.add.container(0, 0).setDepth(310).setScrollFactor(0);

        const cx = GAME_WIDTH / 2;
        const yCout = 290;
        const yBoutons = 332; // bien séparé du coût (42 px)
        const nbFrag = this.slots.filter(s => s !== null).length;
        const cout = coutEnSel(nbFrag);
        const sel = this.economy.getSel();
        const peutPayer = sel >= cout;
        const invPlein = this.inventaire.estPlein();
        const peutForger = nbFrag > 0 && peutPayer && !invPlein;

        // Coût (en haut, séparé)
        const couleurCout = peutPayer ? '#ffd070' : '#ff6060';
        const txtCout = this.add.text(cx, yCout, `Coût : ${cout} Sel`, {
            fontFamily: 'monospace', fontSize: '13px',
            color: couleurCout, fontStyle: 'bold',
            stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5, 0);
        this.contActions.add(txtCout);

        // Boutons FONDRE / FERMER (clairement séparés du coût)
        this._ajouterBoutonContexte(this.contActions, cx - 70, yBoutons, 'FONDRE', peutForger,
            () => this._tenterForger(),
            invPlein ? 'inv' : (!peutPayer ? 'sel' : 'normal'));
        this._ajouterBouton(this.contActions, cx + 70, yBoutons, 'FERMER', () => this.fermer());
    }

    // ============================================================
    // ZONE RÉSULTAT
    // ============================================================
    _dessinerResultat() {
        if (this.contResultat) this.contResultat.destroy();
        this.contResultat = this.add.container(0, 0).setDepth(310).setScrollFactor(0);

        const cx = GAME_WIDTH / 2;
        const y = 380;

        const lbl = this.add.text(cx, y, '— RÉSULTAT —', {
            fontFamily: 'monospace', fontSize: '10px', color: '#c8a85a',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        this.contResultat.add(lbl);

        const tailleZone = 60;
        const yZone = y + 18;

        const cadre = this.add.graphics();
        cadre.fillStyle(0x080604, 1);
        cadre.fillRect(cx - tailleZone / 2, yZone, tailleZone, tailleZone);
        cadre.lineStyle(1, COULEURS_INVENTAIRE.or, 0.7);
        cadre.strokeRect(cx - tailleZone / 2, yZone, tailleZone, tailleZone);
        this.contResultat.add(cadre);

        if (this.itemResultat) {
            const item = ITEMS[this.itemResultat];
            const familleColor = COULEURS_FAMILLE[item.famille];
            // Halo additif
            const halo = this.add.graphics();
            halo.setBlendMode(Phaser.BlendModes.ADD);
            halo.fillStyle(familleColor, 0.5);
            halo.fillCircle(cx, yZone + tailleZone / 2, 28);
            this.contResultat.add(halo);

            // Emblème
            const emb = peindreEmblemeFamille(this, cx, yZone + tailleZone / 2, item.famille, 32);
            this.contResultat.add(emb);

            // Étoile rouge si Tier 3
            if (item.tier === 3) {
                const eto = this.add.graphics();
                eto.fillStyle(0xff6060, 1);
                const dx = cx + tailleZone / 2 - 7;
                const dy = yZone + 7;
                eto.beginPath();
                for (let i = 0; i < 10; i++) {
                    const ang = (i * Math.PI) / 5 - Math.PI / 2;
                    const r = (i % 2 === 0) ? 5 : 2;
                    const ex = dx + Math.cos(ang) * r;
                    const ey = dy + Math.sin(ang) * r;
                    if (i === 0) eto.moveTo(ex, ey); else eto.lineTo(ex, ey);
                }
                eto.closePath();
                eto.fillPath();
                this.contResultat.add(eto);
            }

            // Nom (à droite du cadre)
            let nomTexte = item.nom;
            if (item.tier === 3) nomTexte += ' ★';
            const nom = this.add.text(cx + tailleZone / 2 + 14, yZone + tailleZone / 2, nomTexte, {
                fontFamily: 'monospace', fontSize: '13px',
                color: '#' + familleColor.toString(16).padStart(6, '0'),
                fontStyle: 'bold', stroke: '#000', strokeThickness: 3
            }).setOrigin(0, 0.5);
            this.contResultat.add(nom);

            // Texte "Ajouté à l'inventaire."
            const ajout = this.add.text(cx, yZone + tailleZone + 6, 'Ajouté à l\'inventaire.', {
                fontFamily: 'monospace', fontSize: '10px', color: '#8a8a9a',
                fontStyle: 'italic'
            }).setOrigin(0.5, 0);
            this.contResultat.add(ajout);
        } else {
            const txt = this.add.text(cx, yZone + tailleZone / 2, '?', {
                fontFamily: 'monospace', fontSize: '24px', color: '#3a3a4a',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            this.contResultat.add(txt);
        }
    }

    // ============================================================
    // BANDE RESSOURCES (en bas)
    // ============================================================
    _dessinerBandeRessources() {
        if (this.contRessources) this.contRessources.destroy();
        this.contRessources = this.add.container(0, 0).setDepth(310).setScrollFactor(0);

        const cx = GAME_WIDTH / 2;
        // Bande remontée pour ne pas chevaucher la bordure du cadre
        const y = GAME_HEIGHT - 55;

        const liseré = this.add.graphics();
        liseré.lineStyle(1, COULEURS_INVENTAIRE.or, 0.5);
        liseré.beginPath();
        liseré.moveTo(cx - 220, y - 8);
        liseré.lineTo(cx + 220, y - 8);
        liseré.strokePath();
        this.contRessources.add(liseré);

        const espace = 105;
        const xDebut = cx - (4 * espace) / 2;

        // Sel
        const xSel = xDebut + espace / 2;
        const cristal = this.add.graphics({ x: xSel - 22, y: y + 6 });
        cristal.fillStyle(0xffd070, 1);
        cristal.beginPath();
        cristal.moveTo(0, -6); cristal.lineTo(5, 0); cristal.lineTo(0, 6); cristal.lineTo(-5, 0);
        cristal.closePath(); cristal.fillPath();
        cristal.fillStyle(0xffffff, 0.7);
        cristal.fillCircle(-2, -2, 1.5);
        this.contRessources.add(cristal);
        this.contRessources.add(this.add.text(xSel - 12, y, 'SEL', {
            fontFamily: 'monospace', fontSize: '10px', color: '#8a8a9a', fontStyle: 'bold'
        }));
        this.contRessources.add(this.add.text(xSel + 22, y - 2, `${this.economy.getSel()}`, {
            fontFamily: 'monospace', fontSize: '14px', color: '#ffd070',
            fontStyle: 'bold', stroke: '#000', strokeThickness: 3
        }));

        // 3 Fragments
        const familles = ['blanc', 'bleu', 'noir'];
        const labels = { blanc: 'BLANC', bleu: 'BLEU', noir: 'NOIR' };
        for (let k = 0; k < familles.length; k++) {
            const fam = familles[k];
            const xF = xDebut + espace * (k + 1) + espace / 2;
            this.contRessources.add(peindreEmblemeFamille(this, xF - 22, y + 6, fam, 14));
            this.contRessources.add(this.add.text(xF - 12, y, labels[fam], {
                fontFamily: 'monospace', fontSize: '10px', color: '#8a8a9a', fontStyle: 'bold'
            }));
            this.contRessources.add(this.add.text(xF + 22, y - 2, `${this.economy.getFragment(fam)}`, {
                fontFamily: 'monospace', fontSize: '14px', color: '#e8e4d8',
                fontStyle: 'bold', stroke: '#000', strokeThickness: 3
            }));
        }
    }

    // ============================================================
    // ACTIONS UTILISATEUR
    // ============================================================
    _ajouterSlot(famille) {
        // Trouve le prochain emplacement libre
        const idx = this.slots.findIndex(s => s === null);
        if (idx === -1) return; // tous remplis
        if (this.economy.getFragment(famille) <= 0) return; // pas dispo (sécurité)

        // On RÉSERVE pas le Fragment ici — on le décompte VISUELLEMENT mais le retrait
        // réel se fait à la forge. Pour cohérence, on fait un système de "réserve" :
        // on diminue les Fragments disponibles via getFragmentsDispo() qui soustrait
        // ce qui est posé sur la table.
        this.slots[idx] = famille;
        this._refreshTout();
    }

    _retirerSlot(idx) {
        if (this.slots[idx] === null) return;
        this.slots[idx] = null;
        this.itemResultat = null; // efface le résultat précédent
        this._refreshTout();
    }

    _tenterForger() {
        const fragments = this.slots.filter(s => s !== null);
        const res = this.fondeur.forger(fragments, this.rngForge);
        if (!res.success) {
            // Affichage discret du motif d'échec dans la phrase
            if (res.raison === 'inventaire_plein') {
                this.phraseTexte.setText('"' + PHRASE_INV_PLEIN + '"');
                this.phraseTexte.setColor('#ff6060');
            }
            return;
        }
        // Succès : on stocke le résultat, on vide la table
        this.itemResultat = res.itemId;
        this.slots = [null, null, null];

        // Petit feedback visuel : flash sur la zone résultat
        this._refreshTout();
    }

    /**
     * Disponibilité réelle d'un Fragment = stock - posé sur la table.
     */
    _fragDispo(famille) {
        const stock = this.economy.getFragment(famille);
        const surTable = this.slots.filter(s => s === famille).length;
        return stock - surTable;
    }

    _refreshTout() {
        // Met à jour la phrase
        const fragments = this.slots.filter(s => s !== null);
        if (this.inventaire.estPlein() && fragments.length > 0) {
            this.phraseTexte.setText('"' + PHRASE_INV_PLEIN + '"');
            this.phraseTexte.setColor('#ff6060');
        } else {
            this.phraseTexte.setText('"' + phraseFondeur(fragments) + '"');
            this.phraseTexte.setColor('#c8a85a');
        }

        this._dessinerEmplacements();
        this._dessinerBoutonsAjoutAvecDispo();
        this._dessinerActions();
        this._dessinerResultat();
        this._dessinerBandeRessources();
    }

    /**
     * Variante de _dessinerBoutonsAjout qui utilise la dispo "réelle"
     * (stock moins ce qui est sur la table) pour griser les boutons.
     */
    _dessinerBoutonsAjoutAvecDispo() {
        if (this.contBoutonsAjout) this.contBoutonsAjout.destroy();
        this.contBoutonsAjout = this.add.container(0, 0).setDepth(310).setScrollFactor(0);

        const cx = GAME_WIDTH / 2;
        const y = 235;
        const taille = 44;
        const espace = 16;
        const familles = ['blanc', 'bleu', 'noir'];

        // Label clairement au-dessus des boutons (40 px d'écart)
        const lbl = this.add.text(cx, y - 40, '— AJOUTER UN FRAGMENT —', {
            fontFamily: 'monospace', fontSize: '10px', color: '#c8a85a',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        this.contBoutonsAjout.add(lbl);

        const tousPleins = this.slots.every(s => s !== null);

        for (let i = 0; i < familles.length; i++) {
            const fam = familles[i];
            const x = cx + (i - 1) * (taille + espace);
            const dispoReelle = this._fragDispo(fam);
            const interactif = dispoReelle > 0 && !tousPleins;
            const couleurBord = interactif ? COULEURS_INVENTAIRE.or : 0x4a4a5a;

            const cadre = this.add.graphics();
            cadre.fillStyle(0x080604, 1);
            cadre.fillRect(x - taille / 2, y - taille / 2, taille, taille);
            cadre.lineStyle(1, couleurBord, interactif ? 0.85 : 0.4);
            cadre.strokeRect(x - taille / 2, y - taille / 2, taille, taille);
            this.contBoutonsAjout.add(cadre);

            const emb = peindreEmblemeFamille(this, x, y - 4, fam, 22);
            if (!interactif) emb.setAlpha(0.35);
            this.contBoutonsAjout.add(emb);

            const compteur = this.add.text(x, y + taille / 2 - 7, `${dispoReelle}`, {
                fontFamily: 'monospace', fontSize: '11px',
                color: interactif ? '#e8e4d8' : '#5a5a6a',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            this.contBoutonsAjout.add(compteur);

            if (interactif) {
                const hit = this.add.rectangle(x, y, taille, taille, 0xffffff, 0)
                    .setInteractive({ useHandCursor: true });
                hit.on('pointerdown', () => this._ajouterSlot(fam));
                hit.on('pointerover', () => {
                    cadre.clear();
                    cadre.fillStyle(0x14100a, 1);
                    cadre.fillRect(x - taille / 2, y - taille / 2, taille, taille);
                    cadre.lineStyle(2, COULEURS_INVENTAIRE.orClair, 1);
                    cadre.strokeRect(x - taille / 2, y - taille / 2, taille, taille);
                });
                hit.on('pointerout', () => {
                    cadre.clear();
                    cadre.fillStyle(0x080604, 1);
                    cadre.fillRect(x - taille / 2, y - taille / 2, taille, taille);
                    cadre.lineStyle(1, COULEURS_INVENTAIRE.or, 0.85);
                    cadre.strokeRect(x - taille / 2, y - taille / 2, taille, taille);
                });
                this.contBoutonsAjout.add(hit);
            }
        }
    }

    // ============================================================
    // BOUTONS STYLISÉS
    // ============================================================
    _ajouterBouton(parent, x, y, label, onClick) {
        this._ajouterBoutonContexte(parent, x, y, label, true, onClick, 'normal');
    }

    _ajouterBoutonContexte(parent, x, y, label, actif, onClick, contexte = 'normal') {
        const w = 120, h = 30;
        const cx = x - w / 2;

        const couleurBord = actif ? COULEURS_INVENTAIRE.or : 0x4a4a5a;
        const couleurBordHover = COULEURS_INVENTAIRE.orClair;
        const couleurFond = 0x14100a;
        const couleurFondHover = 0x2a1810;
        const couleurTexte = actif ? '#ffd070' : '#5a5a6a';

        const fond = this.add.graphics();
        const dessinerFond = (hover) => {
            fond.clear();
            fond.fillStyle(hover ? couleurFondHover : couleurFond, 1);
            fond.fillRect(cx, y - h / 2, w, h);
            fond.lineStyle(1.5, hover ? couleurBordHover : couleurBord, 1);
            fond.strokeRect(cx, y - h / 2, w, h);
            // Petits coins
            fond.lineStyle(1, couleurBordHover, hover ? 0.8 : 0.5);
            const c = 4;
            fond.beginPath();
            fond.moveTo(cx, y - h / 2 + c); fond.lineTo(cx, y - h / 2); fond.lineTo(cx + c, y - h / 2);
            fond.moveTo(cx + w - c, y - h / 2); fond.lineTo(cx + w, y - h / 2); fond.lineTo(cx + w, y - h / 2 + c);
            fond.moveTo(cx, y + h / 2 - c); fond.lineTo(cx, y + h / 2); fond.lineTo(cx + c, y + h / 2);
            fond.moveTo(cx + w - c, y + h / 2); fond.lineTo(cx + w, y + h / 2); fond.lineTo(cx + w, y + h / 2 - c);
            fond.strokePath();
        };
        dessinerFond(false);
        parent.add(fond);

        const txt = this.add.text(x, y, label, {
            fontFamily: 'monospace', fontSize: '13px',
            color: couleurTexte, fontStyle: 'bold',
            stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5);
        parent.add(txt);

        if (actif) {
            const hit = this.add.rectangle(x, y, w, h, 0xffffff, 0)
                .setInteractive({ useHandCursor: true });
            hit.on('pointerover', () => dessinerFond(true));
            hit.on('pointerout', () => dessinerFond(false));
            hit.on('pointerdown', onClick);
            parent.add(hit);
        } else {
            // Indication visuelle de la raison (Sel / Inventaire plein)
            if (contexte === 'sel') {
                const sub = this.add.text(x, y + h / 2 + 6, '(Sel insuffisant)', {
                    fontFamily: 'monospace', fontSize: '9px', color: '#ff6060'
                }).setOrigin(0.5, 0);
                parent.add(sub);
            } else if (contexte === 'inv') {
                const sub = this.add.text(x, y + h / 2 + 6, '(Inventaire plein)', {
                    fontFamily: 'monospace', fontSize: '9px', color: '#ff6060'
                }).setOrigin(0.5, 0);
                parent.add(sub);
            }
        }
    }
}
