// MarchandScene — overlay du Tapis de la Glaneuse. Phase 6 : opère sur les
// INSTANCES forgées.
//
// 3 onglets :
//   VITRINE     → 4 instances proposées (seedées sur run + indexSalle)
//   RACHAT      → liste de l'inventaire (instances), conversion en Sel
//   FRAGMENTER  → liste de l'inventaire (instances), conversion en Fragments

import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { InventaireSystem } from '../systems/InventaireSystem.js';
import {
    EconomySystem, EVT_SEL_CHANGE, EVT_FRAGMENTS_CHANGE, EVT_ENCRE_CHANGE
} from '../systems/EconomySystem.js';
import {
    MarchandSystem, prixAchat, prixRachat, fragmentsRendus, genererVitrine
} from '../systems/MarchandSystem.js';
import {
    phraseAccueil, phraseVenteReussie, phraseVentePauvre,
    phraseRachatReussi, phraseFragmentation, phraseFragmentationBonus,
    phraseInvPlein, phraseRienAVendre, phraseVitrineVide
} from '../data/phrases-marchand.js';
import { COULEURS_FAMILLE } from '../data/items.js';
import { peindreEmblemeFamille } from '../render/ui/EmblemeFamille.js';
import { COULEURS_INVENTAIRE, poserCadreInventaire, poserBoutonFermer } from '../render/ui/CadreInventaire.js';
import { creerSlot } from '../render/ui/SlotInventaire.js';
import { estInstance, tierPourScore, couleurPourScore } from '../systems/ScoreSystem.js';
import { TEMPLATES } from '../data/templatesItems.js';

const couleurHex = (n) => '#' + n.toString(16).padStart(6, '0');

const ONGLET_VITRINE = 'vitrine';
const ONGLET_RACHAT = 'rachat';
const ONGLET_FRAG = 'fragmenter';

const LABEL_ONGLET = {
    [ONGLET_VITRINE]: 'VITRINE',
    [ONGLET_RACHAT]: 'RACHAT',
    [ONGLET_FRAG]: 'FRAGMENTER'
};

export class MarchandScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MarchandScene' });
    }

    init(data) {
        this.rngVitrine = data?.rngVitrine ?? Math.random;
        this.rngPhrase = data?.rngPhrase ?? Math.random;
    }

    create() {
        this.economy = new EconomySystem(this.registry);
        this.inventaire = new InventaireSystem(this.registry);
        this.marchand = new MarchandSystem(this.economy, this.inventaire);

        // Vitrine cachée par salle pour rester stable lors d'aller-retours
        const cleVitrine = `vitrine6:${this.registry.get('marchand_room_id') ?? 0}`;
        let cache = this.registry.get(cleVitrine);
        if (!cache || !Array.isArray(cache) || cache.length === 0) {
            cache = genererVitrine(this.rngVitrine);
            this.registry.set(cleVitrine, cache);
        }
        this.vitrine = [...cache];
        this.cleVitrine = cleVitrine;

        this.ongletActif = ONGLET_VITRINE;
        this.uidSelectionne = null;
        this.idxSelectionne = null;
        this.dernierePhrase = phraseAccueil(this.rngPhrase);
        this.couleurPhrase = '#c8a8d8';

        const cadre = poserCadreInventaire(this, GAME_WIDTH, GAME_HEIGHT);
        cadre.titre.setText('LE TAPIS DE LA GLANEUSE');

        poserBoutonFermer(this, GAME_WIDTH - 50, 50, () => this.fermer());

        this._dessinerTout();

        this.input.keyboard.on('keydown-ESC', () => this.fermer());
        this.input.keyboard.on('keydown-ONE', () => this._changerOnglet(ONGLET_VITRINE));
        this.input.keyboard.on('keydown-TWO', () => this._changerOnglet(ONGLET_RACHAT));
        this.input.keyboard.on('keydown-THREE', () => this._changerOnglet(ONGLET_FRAG));

        const handler = () => this._dessinerTout();
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
        [codes.ESC, codes.ONE, codes.TWO, codes.THREE].forEach(c => keys[c]?.reset());
        this.scene.resume('GameScene');
        this.scene.stop();
    }

    _changerOnglet(id) {
        if (this.ongletActif === id) return;
        this.ongletActif = id;
        this.uidSelectionne = null;
        this.idxSelectionne = null;
        this._dessinerTout();
    }

    _dessinerTout() {
        if (this.contMain) this.contMain.destroy();
        this.contMain = this.add.container(0, 0).setDepth(310);

        this._dessinerPhrase();
        this._dessinerOnglets();
        this._dessinerZone();
        this._dessinerBandeRessources();
    }

    // ============================================================
    // PHRASE + ONGLETS
    // ============================================================
    _dessinerPhrase() {
        this.contMain.add(this.add.text(GAME_WIDTH / 2, 78, '"' + this.dernierePhrase + '"', {
            fontFamily: 'monospace', fontSize: '12px',
            color: this.couleurPhrase, fontStyle: 'italic',
            stroke: '#000', strokeThickness: 2,
            wordWrap: { width: GAME_WIDTH - 140 }, align: 'center'
        }).setOrigin(0.5, 0));
    }

    _dessinerOnglets() {
        const ids = [ONGLET_VITRINE, ONGLET_RACHAT, ONGLET_FRAG];
        const yOnglets = 112;
        const espace = 16;
        const largOnglet = 140;
        const xDebut = GAME_WIDTH / 2 - (3 * largOnglet + 2 * espace) / 2;

        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const x = xDebut + i * (largOnglet + espace);
            const actif = this.ongletActif === id;

            const fond = this.add.graphics();
            fond.fillStyle(actif ? 0x2a1810 : 0x14100a, 1);
            fond.fillRect(x, yOnglets, largOnglet, 26);
            fond.lineStyle(actif ? 2 : 1, actif ? COULEURS_INVENTAIRE.orClair : COULEURS_INVENTAIRE.or, actif ? 1 : 0.6);
            fond.strokeRect(x, yOnglets, largOnglet, 26);
            this.contMain.add(fond);

            this.contMain.add(this.add.text(x + largOnglet / 2, yOnglets + 13, LABEL_ONGLET[id], {
                fontFamily: 'monospace', fontSize: '12px',
                color: actif ? '#ffd070' : '#a8a8b8',
                fontStyle: 'bold', stroke: '#000', strokeThickness: 2
            }).setOrigin(0.5));

            const hit = this.add.rectangle(x + largOnglet / 2, yOnglets + 13, largOnglet, 26, 0xffffff, 0)
                .setInteractive({ useHandCursor: true });
            hit.on('pointerdown', () => this._changerOnglet(id));
            this.contMain.add(hit);
        }
        this.contMain.add(this.add.text(GAME_WIDTH / 2, yOnglets + 32, '— 1 / 2 / 3 pour changer d\'onglet —', {
            fontFamily: 'monospace', fontSize: '9px', color: '#6a6a7a'
        }).setOrigin(0.5));
    }

    // ============================================================
    // ZONES PRINCIPALES
    // ============================================================
    _dessinerZone() {
        if (this.ongletActif === ONGLET_VITRINE) this._renderVitrine();
        else if (this.ongletActif === ONGLET_RACHAT) this._renderRachat();
        else this._renderFragmenter();
    }

    _renderVitrine() {
        const xDebut = 60;
        const yDebut = 175;
        this.contMain.add(this.add.text(xDebut, yDebut - 22, '— OBJETS DISPONIBLES —', {
            fontFamily: 'monospace', fontSize: '11px',
            color: '#c8a8d8', fontStyle: 'bold'
        }));

        if (this.vitrine.length === 0) {
            this.contMain.add(this.add.text(xDebut, yDebut + 16, phraseVitrineVide(this.rngPhrase), {
                fontFamily: 'monospace', fontSize: '11px',
                color: '#6a6a7a', fontStyle: 'italic'
            }));
            return;
        }

        const taille = 56;
        const espace = 14;
        for (let i = 0; i < this.vitrine.length; i++) {
            const inst = this.vitrine[i];
            const x = xDebut + i * (taille + espace) + taille / 2;
            const y = yDebut + 40;
            const selectionne = this.idxSelectionne === i;
            const s = creerSlot(this, x, y, {
                taille,
                itemId: inst,
                onClick: () => {
                    this.idxSelectionne = i;
                    this._dessinerTout();
                }
            });
            this.contMain.add(s.container);
            if (selectionne) {
                const ring = this.add.graphics();
                ring.lineStyle(2, COULEURS_INVENTAIRE.orClair, 1);
                ring.strokeRect(x - taille / 2 - 3, y - taille / 2 - 3, taille + 6, taille + 6);
                this.contMain.add(ring);
            }
            // Prix sous chaque slot
            const prix = prixAchat(inst);
            const peutPayer = this.economy.getSel() >= prix;
            this.contMain.add(this.add.text(x, y + taille / 2 + 18, `${prix} Sel`, {
                fontFamily: 'monospace', fontSize: '11px',
                color: peutPayer ? '#ffd070' : '#ff6060', fontStyle: 'bold'
            }).setOrigin(0.5));
        }

        // Panneau détail + bouton ACHETER
        this._renderPanneauDetail(this.idxSelectionne !== null ? this.vitrine[this.idxSelectionne] : null, 'acheter');
    }

    _renderRachat() {
        const xDebut = 60;
        const yDebut = 175;
        this.contMain.add(this.add.text(xDebut, yDebut - 22, '— TON INVENTAIRE —', {
            fontFamily: 'monospace', fontSize: '11px',
            color: '#c8a8d8', fontStyle: 'bold'
        }));

        const inv = this.inventaire.getInventaire();
        const instances = [];
        for (let i = 0; i < inv.length; i++) {
            if (estInstance(inv[i])) instances.push({ inst: inv[i], idx: i });
        }
        if (instances.length === 0) {
            this.contMain.add(this.add.text(xDebut, yDebut + 16, phraseRienAVendre(), {
                fontFamily: 'monospace', fontSize: '11px',
                color: '#6a6a7a', fontStyle: 'italic'
            }));
            return;
        }

        this._renderGrilleInstances(instances, xDebut, yDebut, 'rachat');
        this._renderPanneauDetail(
            this.uidSelectionne ? this._instanceParUid(this.uidSelectionne) : null,
            'vendre'
        );
    }

    _renderFragmenter() {
        const xDebut = 60;
        const yDebut = 175;
        this.contMain.add(this.add.text(xDebut, yDebut - 22, '— FRAGMENTER —', {
            fontFamily: 'monospace', fontSize: '11px',
            color: '#c8a8d8', fontStyle: 'bold'
        }));

        const inv = this.inventaire.getInventaire();
        const instances = [];
        for (let i = 0; i < inv.length; i++) {
            if (estInstance(inv[i])) instances.push({ inst: inv[i], idx: i });
        }
        if (instances.length === 0) {
            this.contMain.add(this.add.text(xDebut, yDebut + 16, phraseRienAVendre(), {
                fontFamily: 'monospace', fontSize: '11px',
                color: '#6a6a7a', fontStyle: 'italic'
            }));
            return;
        }

        this._renderGrilleInstances(instances, xDebut, yDebut, 'fragmenter');
        this._renderPanneauDetail(
            this.uidSelectionne ? this._instanceParUid(this.uidSelectionne) : null,
            'fragmenter'
        );
    }

    _renderGrilleInstances(instances, xDebut, yDebut, mode) {
        const taille = 40;
        const espace = 6;
        const cols = 6;
        for (let k = 0; k < Math.min(instances.length, cols * 6); k++) {
            const { inst, idx } = instances[k];
            const c = k % cols;
            const r = Math.floor(k / cols);
            const x = xDebut + c * (taille + espace) + taille / 2;
            const y = yDebut + 16 + r * (taille + espace) + taille / 2;
            const selectionne = this.uidSelectionne === inst.uid;
            const s = creerSlot(this, x, y, {
                taille,
                itemId: inst,
                onClick: () => {
                    this.uidSelectionne = inst.uid;
                    this.idxSelectionne = idx;
                    this._dessinerTout();
                }
            });
            this.contMain.add(s.container);
            if (selectionne) {
                const ring = this.add.graphics();
                ring.lineStyle(2, COULEURS_INVENTAIRE.orClair, 1);
                ring.strokeRect(x - taille / 2 - 3, y - taille / 2 - 3, taille + 6, taille + 6);
                this.contMain.add(ring);
            }
        }
    }

    // ============================================================
    // PANNEAU DÉTAIL (à droite)
    // ============================================================
    _renderPanneauDetail(inst, action) {
        const xPan = 510;
        const yPan = 175;
        const wPan = GAME_WIDTH - xPan - 50;
        const hPan = 280;

        const cadre = this.add.graphics();
        cadre.fillStyle(0x0a0805, 0.85);
        cadre.fillRect(xPan, yPan, wPan, hPan);
        cadre.lineStyle(1, COULEURS_INVENTAIRE.or, 0.9);
        cadre.strokeRect(xPan, yPan, wPan, hPan);
        this.contMain.add(cadre);

        if (!inst) {
            this.contMain.add(this.add.text(xPan + wPan / 2, yPan + hPan / 2,
                'Sélectionne un objet.', {
                    fontFamily: 'monospace', fontSize: '11px',
                    color: '#6a6a7a', fontStyle: 'italic'
                }
            ).setOrigin(0.5));
            return;
        }

        const tpl = TEMPLATES[inst.templateId];
        const tier = tierPourScore(inst.score);
        const couleur = couleurPourScore(inst.score);
        const css = couleurHex(couleur);

        // Header
        const xL = xPan + 30, yL = yPan + 28;
        const halo = this.add.graphics();
        halo.setBlendMode(Phaser.BlendModes.ADD);
        halo.fillStyle(couleur, 0.6);
        halo.fillCircle(xL, yL, 18);
        this.contMain.add(halo);
        const losange = this.add.graphics();
        losange.fillStyle(couleur, 1);
        const rL = 14;
        losange.beginPath();
        losange.moveTo(xL, yL - rL);
        losange.lineTo(xL + rL, yL);
        losange.lineTo(xL, yL + rL);
        losange.lineTo(xL - rL, yL);
        losange.closePath();
        losange.fillPath();
        this.contMain.add(losange);
        this.contMain.add(this.add.text(xL, yL, String(inst.score), {
            fontFamily: 'monospace', fontSize: '11px', color: '#000', fontStyle: 'bold'
        }).setOrigin(0.5));

        this.contMain.add(this.add.text(xL + 22, yL - 12, tpl ? tpl.nom : 'Forgé', {
            fontFamily: 'monospace', fontSize: '13px', color: css,
            fontStyle: 'bold', stroke: '#000', strokeThickness: 2
        }));
        this.contMain.add(this.add.text(xL + 22, yL + 4, tier.nomLong, {
            fontFamily: 'monospace', fontSize: '9px', color: '#8a8a9a'
        }));

        // Info action
        let yC = yPan + 80;
        if (action === 'acheter') {
            const prix = prixAchat(inst);
            const peutPayer = this.economy.getSel() >= prix;
            const invPlein = this.inventaire.estPlein();
            this.contMain.add(this.add.text(xPan + wPan / 2, yC, `Prix d'achat : ${prix} Sel`, {
                fontFamily: 'monospace', fontSize: '12px',
                color: peutPayer ? '#ffd070' : '#ff6060', fontStyle: 'bold'
            }).setOrigin(0.5, 0));
            this._ajouterBouton(xPan + wPan / 2, yPan + hPan - 30, 'ACHETER',
                peutPayer && !invPlein,
                () => {
                    const res = this.marchand.acheter(inst);
                    if (!res.success) {
                        this.dernierePhrase = res.raison === 'inventaire_plein'
                            ? phraseInvPlein(this.rngPhrase)
                            : phraseVentePauvre(this.rngPhrase);
                        this.couleurPhrase = '#ff8060';
                    } else {
                        // Retire de la vitrine
                        const i = this.vitrine.findIndex(v => v === inst);
                        if (i >= 0) this.vitrine.splice(i, 1);
                        this.registry.set(this.cleVitrine, this.vitrine);
                        this.dernierePhrase = phraseVenteReussie(this.rngPhrase);
                        this.couleurPhrase = '#c8a8d8';
                        this.idxSelectionne = null;
                    }
                    this._dessinerTout();
                }
            );
        } else if (action === 'vendre') {
            const gain = prixRachat(inst);
            this.contMain.add(this.add.text(xPan + wPan / 2, yC, `Tu recevras : ${gain} Sel`, {
                fontFamily: 'monospace', fontSize: '12px',
                color: '#ffd070', fontStyle: 'bold'
            }).setOrigin(0.5, 0));
            this._ajouterBouton(xPan + wPan / 2, yPan + hPan - 30, 'VENDRE',
                true,
                () => {
                    const res = this.marchand.vendre(this.idxSelectionne);
                    if (res.success) {
                        this.dernierePhrase = phraseRachatReussi(this.rngPhrase);
                        this.couleurPhrase = '#ffd070';
                        this.uidSelectionne = null;
                        this.idxSelectionne = null;
                    }
                    this._dessinerTout();
                }
            );
        } else if (action === 'fragmenter') {
            const qte = fragmentsRendus(inst);
            const famille = tpl?.famille ?? 'blanc';
            this.contMain.add(this.add.text(xPan + wPan / 2, yC, `Tu recevras : ${qte} Fragment ${famille}`, {
                fontFamily: 'monospace', fontSize: '12px',
                color: couleurHex(COULEURS_FAMILLE[famille] ?? 0xc8c4b8), fontStyle: 'bold'
            }).setOrigin(0.5, 0));
            if (inst.score >= 70) {
                this.contMain.add(this.add.text(xPan + wPan / 2, yC + 18, `Bonus possible : 1 Fragment Noir`, {
                    fontFamily: 'monospace', fontSize: '9px',
                    color: '#a08080', fontStyle: 'italic'
                }).setOrigin(0.5, 0));
            }
            this._ajouterBouton(xPan + wPan / 2, yPan + hPan - 30, 'FRAGMENTER',
                true,
                () => {
                    const res = this.marchand.fragmenter(this.idxSelectionne, this.rngPhrase);
                    if (res.success) {
                        this.dernierePhrase = res.bonusNoir
                            ? phraseFragmentationBonus(this.rngPhrase)
                            : phraseFragmentation(this.rngPhrase);
                        this.couleurPhrase = '#c8a8d8';
                        this.uidSelectionne = null;
                        this.idxSelectionne = null;
                    }
                    this._dessinerTout();
                }
            );
        }
    }

    _instanceParUid(uid) {
        const inv = this.inventaire.getInventaire();
        for (const e of inv) if (estInstance(e) && e.uid === uid) return e;
        return null;
    }

    // ============================================================
    // BANDE RESSOURCES (en bas)
    // ============================================================
    _dessinerBandeRessources() {
        const cx = GAME_WIDTH / 2;
        const y = GAME_HEIGHT - 55;
        const liseré = this.add.graphics();
        liseré.lineStyle(1, COULEURS_INVENTAIRE.or, 0.5);
        liseré.beginPath();
        liseré.moveTo(cx - 240, y - 8);
        liseré.lineTo(cx + 240, y - 8);
        liseré.strokePath();
        this.contMain.add(liseré);

        const blocs = [
            { label: 'SEL', val: this.economy.getSel(), couleur: '#ffd070' },
            { label: 'BLANC', val: this.economy.getFragment('blanc'), couleur: '#e8e4d8', fam: 'blanc' },
            { label: 'BLEU', val: this.economy.getFragment('bleu'), couleur: '#a8c8e8', fam: 'bleu' },
            { label: 'NOIR', val: this.economy.getFragment('noir'), couleur: '#a0a0c0', fam: 'noir' }
        ];
        const espace = 110;
        const xDebut = cx - (blocs.length - 1) / 2 * espace;
        for (let i = 0; i < blocs.length; i++) {
            const b = blocs[i];
            const x = xDebut + i * espace;
            if (b.fam) {
                this.contMain.add(peindreEmblemeFamille(this, x - 22, y + 6, b.fam, 13));
            }
            this.contMain.add(this.add.text(x - 12, y, b.label, {
                fontFamily: 'monospace', fontSize: '9px', color: '#8a8a9a', fontStyle: 'bold'
            }));
            this.contMain.add(this.add.text(x + 26, y - 2, String(b.val), {
                fontFamily: 'monospace', fontSize: '13px', color: b.couleur,
                fontStyle: 'bold', stroke: '#000', strokeThickness: 3
            }));
        }
    }

    _ajouterBouton(x, y, label, actif, onClick) {
        const w = 180, h = 28;
        const cx = x - w / 2;
        const couleurFond = actif ? 0x14100a : 0x0a0805;
        const couleurBord = actif ? COULEURS_INVENTAIRE.or : 0x3a3a4a;
        const couleurTexte = actif ? '#ffd070' : '#5a5a6a';

        const fond = this.add.graphics();
        fond.fillStyle(couleurFond, 1);
        fond.fillRect(cx, y - h / 2, w, h);
        fond.lineStyle(1.5, couleurBord, 1);
        fond.strokeRect(cx, y - h / 2, w, h);
        this.contMain.add(fond);
        this.contMain.add(this.add.text(x, y, label, {
            fontFamily: 'monospace', fontSize: '13px', color: couleurTexte,
            fontStyle: 'bold', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5));
        if (actif) {
            const hit = this.add.rectangle(x, y, w, h, 0xffffff, 0)
                .setInteractive({ useHandCursor: true });
            hit.on('pointerdown', onClick);
            this.contMain.add(hit);
        }
    }
}
