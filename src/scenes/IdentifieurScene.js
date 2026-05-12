// IdentifieurScene — révélation des affixes cachés sur les instances Phase 6.
//
// Workflow :
//   1. Liste filtrée : instances de l'inventaire + équipement qui ont quelque
//      chose à révéler (exotique non-révélé, sort non-révélé, signature non-révélée)
//   2. Sélection d'une instance → panneau de droite avec les éléments cachés
//   3. Boutons RÉVÉLER : Sel ou Encre du Témoin
//        - Révéler 1 exotique :  6 Sel
//        - Révéler le sort     : 15 Sel
//        - Révéler la signature: 30 Sel
//        - Tout révéler        : 1 Encre du Témoin
//   4. La révélation mute `instance.revele` puis force un refresh registry
//      pour que l'UI / GameScene voient le changement.

import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { InventaireSystem } from '../systems/InventaireSystem.js';
import {
    EconomySystem, EVT_SEL_CHANGE, EVT_FRAGMENTS_CHANGE, EVT_ENCRE_CHANGE
} from '../systems/EconomySystem.js';
import { RevelationSystem } from '../systems/RevelationSystem.js';
import { phraseEffet } from '../data/phrases-identifieur.js';
import { COULEURS_FAMILLE } from '../data/items.js';
import { peindreEmblemeFamille } from '../render/ui/EmblemeFamille.js';
import { COULEURS_INVENTAIRE, poserCadreInventaire, poserBoutonFermer } from '../render/ui/CadreInventaire.js';
import { creerSlot } from '../render/ui/SlotInventaire.js';
import { estInstance, tierPourScore, couleurPourScore } from '../systems/ScoreSystem.js';
import { TEMPLATES } from '../data/templatesItems.js';
import { EXOTIQUES } from '../data/affixes.js';
import { SORTS as SORTS_DEF, getSort } from '../data/sorts.js';
import { SIGNATURES, getSignature } from '../data/signatures.js';

const couleurHex = (n) => '#' + n.toString(16).padStart(6, '0');

// Coûts en Sel
const COUT_EXOTIQUE = 6;
const COUT_SORT = 15;
const COUT_SIGNATURE = 30;

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
        this.revelation = new RevelationSystem(this.registry, this.inventaire);

        this.uidSelectionne = null;
        this.dernierePhrase = null;

        const cadre = poserCadreInventaire(this, GAME_WIDTH, GAME_HEIGHT);
        cadre.titre.setText('L\'IDENTIFIEUR');

        poserBoutonFermer(this, GAME_WIDTH - 50, 50, () => this.fermer());

        this.phraseAccueil = this.add.text(GAME_WIDTH / 2, 78,
            '"Pose un objet entre mes mains."',
            {
                fontFamily: 'monospace', fontSize: '13px',
                color: '#a0c8ff', fontStyle: 'italic',
                stroke: '#000', strokeThickness: 2
            }
        ).setOrigin(0.5, 0).setScrollFactor(0).setDepth(310);

        this._dessinerTout();

        this.input.keyboard.on('keydown-ESC', () => this.fermer());

        const handlerEco = () => this._dessinerTout();
        this.registry.events.on(EVT_SEL_CHANGE, handlerEco);
        this.registry.events.on(EVT_FRAGMENTS_CHANGE, handlerEco);
        this.registry.events.on(EVT_ENCRE_CHANGE, handlerEco);
        this.events.once('shutdown', () => {
            this.registry.events.off(EVT_SEL_CHANGE, handlerEco);
            this.registry.events.off(EVT_FRAGMENTS_CHANGE, handlerEco);
            this.registry.events.off(EVT_ENCRE_CHANGE, handlerEco);
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
     * Instances éligibles à l'identification (au moins un élément caché).
     */
    _instancesEligibles() {
        const inv = this.inventaire.getInventaire();
        const equip = this.inventaire.getEquipement();
        const tous = [...inv, ...Object.values(equip)].filter(estInstance);
        return tous.filter(inst => this._aElementsCaches(inst));
    }

    _aElementsCaches(inst) {
        const exoCaches = inst.affixesExo.length - inst.revele.exo.length;
        const sortCache = inst.sortId && !inst.revele.sort;
        const sigCachee = inst.signatureId && !inst.revele.signature;
        return exoCaches > 0 || sortCache || sigCachee;
    }

    _instanceParUid(uid) {
        const inv = this.inventaire.getInventaire();
        for (const e of inv) if (estInstance(e) && e.uid === uid) return e;
        const equip = this.inventaire.getEquipement();
        for (const slot of ['tete', 'corps', 'accessoire']) {
            const e = equip[slot];
            if (estInstance(e) && e.uid === uid) return e;
        }
        return null;
    }

    _dessinerTout() {
        if (this.contMain) this.contMain.destroy();
        this.contMain = this.add.container(0, 0).setDepth(310);

        this._dessinerListe();
        this._dessinerPanneau();
        this._dessinerBandeRessources();
    }

    // ============================================================
    // LISTE (à gauche)
    // ============================================================
    _dessinerListe() {
        const xDebut = 60;
        const yDebut = 130;
        const taille = 40;
        const espace = 6;
        const cols = 6;

        this.contMain.add(this.add.text(xDebut, yDebut - 22, '— OBJETS NON RÉVÉLÉS —', {
            fontFamily: 'monospace', fontSize: '11px', color: '#a0c8ff', fontStyle: 'bold'
        }));

        const eligibles = this._instancesEligibles();
        if (eligibles.length === 0) {
            this.contMain.add(this.add.text(xDebut, yDebut, 'Aucun mystère à révéler.', {
                fontFamily: 'monospace', fontSize: '11px',
                color: '#6a6a7a', fontStyle: 'italic'
            }));
            return;
        }

        for (let i = 0; i < Math.min(eligibles.length, cols * 6); i++) {
            const inst = eligibles[i];
            const c = i % cols;
            const r = Math.floor(i / cols);
            const x = xDebut + c * (taille + espace) + taille / 2;
            const y = yDebut + r * (taille + espace) + taille / 2;
            const selectionne = this.uidSelectionne === inst.uid;
            const s = creerSlot(this, x, y, {
                taille,
                itemId: inst,
                onClick: () => {
                    this.uidSelectionne = inst.uid;
                    this._dessinerTout();
                }
            });
            this.contMain.add(s.container);
            if (selectionne) {
                // Anneau de sélection
                const ring = this.add.graphics();
                ring.lineStyle(2, COULEURS_INVENTAIRE.orClair, 1);
                ring.strokeRect(x - taille / 2 - 3, y - taille / 2 - 3, taille + 6, taille + 6);
                this.contMain.add(ring);
            }
        }
    }

    // ============================================================
    // PANNEAU (à droite)
    // ============================================================
    _dessinerPanneau() {
        const xPan = 470;
        const yPan = 130;
        const wPan = GAME_WIDTH - xPan - 50;
        const hPan = 320;

        const cadre = this.add.graphics();
        cadre.fillStyle(0x0a0805, 0.85);
        cadre.fillRect(xPan, yPan, wPan, hPan);
        cadre.lineStyle(1, COULEURS_INVENTAIRE.or, 0.9);
        cadre.strokeRect(xPan, yPan, wPan, hPan);
        this.contMain.add(cadre);

        const inst = this.uidSelectionne ? this._instanceParUid(this.uidSelectionne) : null;
        if (!inst) {
            this.contMain.add(this.add.text(xPan + wPan / 2, yPan + hPan / 2,
                'Sélectionne un objet à révéler.', {
                    fontFamily: 'monospace', fontSize: '11px',
                    color: '#6a6a7a', fontStyle: 'italic'
                }
            ).setOrigin(0.5));
            return;
        }

        // Header : losange + nom + score
        const tpl = TEMPLATES[inst.templateId];
        const tier = tierPourScore(inst.score);
        const couleur = couleurPourScore(inst.score);
        const css = couleurHex(couleur);

        const xL = xPan + 30;
        const yL = yPan + 28;
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
            fontFamily: 'monospace', fontSize: '13px',
            color: css, fontStyle: 'bold', stroke: '#000', strokeThickness: 2
        }));
        this.contMain.add(this.add.text(xL + 22, yL + 4, tier.nomLong, {
            fontFamily: 'monospace', fontSize: '9px', color: '#8a8a9a'
        }));

        // Liste éléments cachés + boutons
        let yC = yPan + 70;

        // Exotiques
        for (let i = 0; i < inst.affixesExo.length; i++) {
            const exoId = inst.affixesExo[i];
            const def = EXOTIQUES[exoId];
            const revele = inst.revele.exo.includes(i);
            const yEntry = yC;
            if (revele) {
                this.contMain.add(this.add.text(xPan + 18, yEntry, `★ ${def?.label}`, {
                    fontFamily: 'monospace', fontSize: '10px',
                    color: '#c0a0e8', fontStyle: 'bold'
                }));
            } else {
                this.contMain.add(this.add.text(xPan + 18, yEntry, '★ Exotique inconnu', {
                    fontFamily: 'monospace', fontSize: '10px',
                    color: '#6a6a7a', fontStyle: 'italic'
                }));
                this._ajouterBoutonInline(xPan + wPan - 100, yEntry - 4,
                    `${COUT_EXOTIQUE} Sel`,
                    this.economy.getSel() >= COUT_EXOTIQUE,
                    () => this._revelerExotique(inst, i));
            }
            yC += 18;
        }

        // Sort
        if (inst.sortId) {
            const def = getSort(inst.sortId);
            const yEntry = yC;
            if (inst.revele.sort) {
                this.contMain.add(this.add.text(xPan + 18, yEntry, `→ ${def?.label}`, {
                    fontFamily: 'monospace', fontSize: '10px',
                    color: '#ffd070', fontStyle: 'bold'
                }));
            } else {
                this.contMain.add(this.add.text(xPan + 18, yEntry, '→ Sort inconnu', {
                    fontFamily: 'monospace', fontSize: '10px',
                    color: '#6a6a7a', fontStyle: 'italic'
                }));
                this._ajouterBoutonInline(xPan + wPan - 100, yEntry - 4,
                    `${COUT_SORT} Sel`,
                    this.economy.getSel() >= COUT_SORT,
                    () => this._revelerSort(inst));
            }
            yC += 18;
        }

        // Signature
        if (inst.signatureId) {
            const def = getSignature(inst.signatureId);
            const yEntry = yC;
            if (inst.revele.signature) {
                this.contMain.add(this.add.text(xPan + 18, yEntry, `« ${def?.nom} »`, {
                    fontFamily: 'monospace', fontSize: '10px',
                    color: '#ffd070', fontStyle: 'italic bold'
                }));
            } else {
                this.contMain.add(this.add.text(xPan + 18, yEntry, '« Signature inconnue »', {
                    fontFamily: 'monospace', fontSize: '10px',
                    color: '#6a6a7a', fontStyle: 'italic'
                }));
                this._ajouterBoutonInline(xPan + wPan - 100, yEntry - 4,
                    `${COUT_SIGNATURE} Sel`,
                    this.economy.getSel() >= COUT_SIGNATURE,
                    () => this._revelerSignature(inst));
            }
            yC += 18;
        }

        // Bouton "Tout révéler avec 1 Encre"
        if (this._aElementsCaches(inst)) {
            const yBtn = yPan + hPan - 36;
            this._ajouterBouton(xPan + wPan / 2, yBtn,
                'TOUT RÉVÉLER (1 Encre)',
                this.economy.getEncre() >= 1,
                () => {
                    if (this.economy.retirerEncre(1)) {
                        this.revelation.revelerTout(inst);
                        this._dessinerTout();
                    }
                }
            );
        }

        // Phrase poétique récente
        if (this.dernierePhrase) {
            this.contMain.add(this.add.text(xPan + wPan / 2, yPan + hPan - 64,
                `"${this.dernierePhrase}"`, {
                    fontFamily: 'monospace', fontSize: '9px',
                    color: '#a0c8ff', fontStyle: 'italic',
                    wordWrap: { width: wPan - 30 },
                    align: 'center'
                }
            ).setOrigin(0.5));
        }
    }

    _revelerExotique(inst, index) {
        if (!this.economy.retirerSel(COUT_EXOTIQUE)) return;
        this.revelation.revelerExotique(inst, index);
        this._forceRefreshRegistry();
        this.dernierePhrase = this._phrase();
        this._dessinerTout();
    }

    _revelerSort(inst) {
        if (!this.economy.retirerSel(COUT_SORT)) return;
        this.revelation.revelerSort(inst);
        this._forceRefreshRegistry();
        this.dernierePhrase = this._phrase();
        this._dessinerTout();
    }

    _revelerSignature(inst) {
        if (!this.economy.retirerSel(COUT_SIGNATURE)) return;
        this.revelation.revelerSignature(inst);
        this._forceRefreshRegistry();
        this.dernierePhrase = this._phrase();
        this._dessinerTout();
    }

    _forceRefreshRegistry() {
        const inv = this.inventaire.getInventaire();
        this.registry.set('inventaire', [...inv]);
        const eq = this.inventaire.getEquipement();
        this.registry.set('equipement', { ...eq });
    }

    _phrase() {
        try { return phraseEffet('inconnu', this.rngPhrase); }
        catch (_e) { return 'L\'écho s\'éclaircit.'; }
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
        liseré.moveTo(cx - 200, y - 8);
        liseré.lineTo(cx + 200, y - 8);
        liseré.strokePath();
        this.contMain.add(liseré);

        // Sel (à gauche)
        this.contMain.add(this.add.text(cx - 80, y, `SEL  ${this.economy.getSel()}`, {
            fontFamily: 'monospace', fontSize: '12px', color: '#ffd070',
            fontStyle: 'bold', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5, 0));
        // Encre (à droite)
        this.contMain.add(this.add.text(cx + 80, y, `ENCRE  ${this.economy.getEncre()}`, {
            fontFamily: 'monospace', fontSize: '12px', color: '#a0a0c8',
            fontStyle: 'bold', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5, 0));
    }

    // ============================================================
    // BOUTONS
    // ============================================================
    _ajouterBoutonInline(x, y, label, actif, onClick) {
        const w = 80, h = 22;
        const couleurFond = actif ? 0x14100a : 0x0a0805;
        const couleurBord = actif ? COULEURS_INVENTAIRE.or : 0x3a3a4a;
        const couleurTexte = actif ? '#ffd070' : '#5a5a6a';

        const fond = this.add.graphics();
        fond.fillStyle(couleurFond, 1);
        fond.fillRect(x, y, w, h);
        fond.lineStyle(1, couleurBord, 1);
        fond.strokeRect(x, y, w, h);
        this.contMain.add(fond);
        this.contMain.add(this.add.text(x + w / 2, y + h / 2, label, {
            fontFamily: 'monospace', fontSize: '10px', color: couleurTexte, fontStyle: 'bold'
        }).setOrigin(0.5));
        if (actif) {
            const hit = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0xffffff, 0)
                .setInteractive({ useHandCursor: true });
            hit.on('pointerdown', onClick);
            this.contMain.add(hit);
        }
    }

    _ajouterBouton(x, y, label, actif, onClick) {
        const w = 220, h = 28;
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
            fontFamily: 'monospace', fontSize: '12px', color: couleurTexte,
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
