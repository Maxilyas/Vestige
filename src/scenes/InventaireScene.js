// Scène overlay — Carnet du Vestige.
//
// Refonte 8b5 : style "tableau gravé" — cadre stylisé, slots vectoriels,
// emblèmes par famille, panneau détail enrichi, animations à l'ouverture.
// Toute la composition vit dans src/render/ui/. Ici on orchestre.

import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import {
    InventaireSystem, SLOTS, SLOTS_VESTIGE,
    EVT_INV_CHANGE, EVT_EQUIP_CHANGE, EVT_VESTIGES_CHANGE, CAPACITE_INVENTAIRE
} from '../systems/InventaireSystem.js';
import { EVT_SEL_CHANGE, EVT_FRAGMENTS_CHANGE } from '../systems/EconomySystem.js';
import { ITEMS, getItemOuVestige } from '../data/items.js';
import { poserCadreInventaire, poserBoutonFermer } from '../render/ui/CadreInventaire.js';
import { creerSlot } from '../render/ui/SlotInventaire.js';
import { creerPanneauDetail } from '../render/ui/PanneauDetail.js';
import { peindreEmblemeFamille } from '../render/ui/EmblemeFamille.js';

// Layout
const TAILLE_SLOT_INV = 36;
const TAILLE_SLOT_EQUIP = 50;
const ESPACE_SLOT = 6;
const COLS = 8;
const ROWS = 5;

const LABELS_SLOT = { tete: 'TÊTE', corps: 'CORPS', accessoire: 'ACC.' };
const LABELS_VESTIGE = { geste: 'GESTE (V)', maitrise1: 'MAÎTRISE I', maitrise2: 'MAÎTRISE II' };
const TAILLE_SLOT_VESTIGE = 38;

export class InventaireScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InventaireScene' });
    }

    create() {
        this.inventaire = new InventaireSystem(this.registry);
        this.slotsInv = [];      // tableau de { container, refresh }
        this.slotsEquip = {};    // map slot → { container, refresh }
        this.slotsVestige = {};  // map slot → { container, refresh } (Phase 5b)

        // --- Cadre stylisé ---
        const cadre = poserCadreInventaire(this, GAME_WIDTH, GAME_HEIGHT);
        this.cadre = cadre;

        // Bouton fermer
        poserBoutonFermer(this, GAME_WIDTH - 50, 50, () => this.fermer());

        // --- Bande RESSOURCES (Sel + Fragments) sous le titre ---
        this._dessinerBandeRessources(GAME_WIDTH);

        // --- Section slots équipés et Vestige (deux colonnes côte à côte) ---
        // Layout Phase 5b : équipement à gauche du centre, vestiges à droite.
        this._dessinerEquipement();
        this._dessinerVestiges();

        // --- Section grille inventaire (à gauche), juste sous les deux colonnes ---
        const xGrilleDebut = 60;
        const yGrilleDebut = 270;
        this._dessinerGrille(xGrilleDebut, yGrilleDebut);

        // --- Compteur N/40 (juste au-dessus de la grille) ---
        const compteur = this.add.text(
            xGrilleDebut,
            yGrilleDebut - 18,
            `${this.inventaire.getInventaire().length} / ${CAPACITE_INVENTAIRE}`,
            { fontFamily: 'monospace', fontSize: '11px', color: '#8a8a9a', fontStyle: 'bold' }
        ).setScrollFactor(0).setDepth(305);
        this.compteur = compteur;

        // --- Panneau détail (à droite, aligné sur la grille) ---
        const xPan = xGrilleDebut + COLS * (TAILLE_SLOT_INV + ESPACE_SLOT) + 30;
        const yPan = yGrilleDebut;
        const wPan = GAME_WIDTH - xPan - 50;
        // Hauteur : strictement aligné sur la grille (5 × 42 = 210 + 10
        // d'amortissement = 220 px). Avec yPan=270 → fin 490, sous le cadre
        // intérieur du carnet qui se termine vers y=510. 20 px d'air.
        const hPan = ROWS * (TAILLE_SLOT_INV + ESPACE_SLOT) + 10;
        this.panneau = creerPanneauDetail(this, xPan, yPan, wPan, hPan);

        // --- Animation d'ouverture en cascade ---
        this._jouerCascadeOuverture();

        // --- Touches + redessins ---
        this.input.keyboard.on('keydown-I', () => this.fermer());
        this.input.keyboard.on('keydown-ESC', () => this.fermer());

        const handlerInv = () => this._refreshTout();
        const handlerEquip = () => this._refreshTout();
        const handlerVestiges = () => this._refreshTout();
        const handlerEco = () => this._refreshRessources();
        this.registry.events.on(EVT_INV_CHANGE, handlerInv);
        this.registry.events.on(EVT_EQUIP_CHANGE, handlerEquip);
        this.registry.events.on(EVT_VESTIGES_CHANGE, handlerVestiges);
        this.registry.events.on(EVT_SEL_CHANGE, handlerEco);
        this.registry.events.on(EVT_FRAGMENTS_CHANGE, handlerEco);
        this.events.once('shutdown', () => {
            this.registry.events.off(EVT_INV_CHANGE, handlerInv);
            this.registry.events.off(EVT_EQUIP_CHANGE, handlerEquip);
            this.registry.events.off(EVT_VESTIGES_CHANGE, handlerVestiges);
            this.registry.events.off(EVT_SEL_CHANGE, handlerEco);
            this.registry.events.off(EVT_FRAGMENTS_CHANGE, handlerEco);
        });
    }

    /**
     * 3 slots Vestige (Phase 5b). Colonne droite, miroir de l'équipement.
     * Plus compacts, liseré cramoisi. Clic = desequipe vers inventaire.
     */
    _dessinerVestiges() {
        const v = this.inventaire.getVestiges();
        const espaceCase = TAILLE_SLOT_VESTIGE + 22;
        const xColonne = GAME_WIDTH * 0.73;
        const yCentre = 195;

        // Titre section
        this.add.text(xColonne, yCentre - 42, '— VESTIGES —', {
            fontFamily: 'monospace', fontSize: '11px', color: '#c04040',
            fontStyle: 'bold', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5, 0).setDepth(305);

        for (let k = 0; k < SLOTS_VESTIGE.length; k++) {
            const slot = SLOTS_VESTIGE[k];
            const x = xColonne + (k - 1) * espaceCase;
            const y = yCentre;
            const itemId = v[slot];

            const s = creerSlot(this, x, y, {
                taille: TAILLE_SLOT_VESTIGE,
                itemId,
                equipe: true,
                label: LABELS_VESTIGE[slot],
                onClick: () => {
                    const id = this.inventaire.getVestiges()[slot];
                    if (!id) {
                        this.panneau.afficherTexte(`Slot ${LABELS_VESTIGE[slot]} vide.`);
                    } else {
                        const def = getItemOuVestige(id);
                        this.panneau.afficherItem(def, { equipe: true, slot, vestige: true }, {
                            onDesequiper: () => {
                                if (this.inventaire.desequiperVestige(slot)) {
                                    this.panneau.afficherTexte('Vestige déséquipé.');
                                } else {
                                    this.panneau.afficherTexte("Inventaire plein, impossible de déséquiper.");
                                }
                            }
                        });
                    }
                }
            });
            this.slotsVestige[slot] = s;
        }
    }

    /**
     * Bande horizontale sous le titre : Sel doré + 3 compteurs Fragments avec emblèmes.
     * Centrée horizontalement.
     */
    _dessinerBandeRessources(largeur) {
        // Phase 5b — Réorganisation : bande remontée en haut du carnet (sous le
        // titre), pour libérer la zone centrale aux deux colonnes Équip./Vest.
        const y = 110;
        const xGauche = 60;
        // Largeur grille : 8 cols × 36 + 7 gaps × 6 = 288 + 42 = 330 px
        const largeurZone = 330;

        const bande = this.add.container(0, 0);
        bande.setScrollFactor(0);
        bande.setDepth(310);

        // 4 blocs (Sel + 3 Fragments) répartis dans la zone de la grille
        const blocs = [
            { type: 'sel', label: 'SEL', couleur: '#ffd070' },
            { type: 'frag', famille: 'blanc', label: 'BLANC' },
            { type: 'frag', famille: 'bleu',  label: 'BLEU' },
            { type: 'frag', famille: 'noir',  label: 'NOIR' }
        ];

        this.compteursFragmentsInv = {};
        const espace = largeurZone / blocs.length;

        for (let i = 0; i < blocs.length; i++) {
            const b = blocs[i];
            const xCentre = xGauche + espace * i + espace / 2;

            // Symbole (cristal pour Sel, emblème pour Fragments) à gauche
            if (b.type === 'sel') {
                const cristal = this.add.graphics({ x: xCentre - 28, y: y + 8 });
                cristal.fillStyle(0xffd070, 1);
                cristal.beginPath();
                cristal.moveTo(0, -6);
                cristal.lineTo(5, 0);
                cristal.lineTo(0, 6);
                cristal.lineTo(-5, 0);
                cristal.closePath();
                cristal.fillPath();
                cristal.fillStyle(0xffffff, 0.7);
                cristal.fillCircle(-2, -2, 1.5);
                bande.add(cristal);
            } else {
                const emb = peindreEmblemeFamille(this, xCentre - 28, y + 8, b.famille, 12);
                bande.add(emb);
            }

            // Label compact à droite du symbole
            bande.add(this.add.text(xCentre - 18, y - 1, b.label, {
                fontFamily: 'monospace', fontSize: '9px', color: '#8a8a9a',
                fontStyle: 'bold'
            }));

            // Valeur en gras sous le label
            const couleurValeur = b.type === 'sel' ? '#ffd070' : '#e8e4d8';
            const txt = this.add.text(xCentre - 18, y + 9, '0', {
                fontFamily: 'monospace', fontSize: '13px', color: couleurValeur,
                fontStyle: 'bold', stroke: '#000', strokeThickness: 2
            });
            bande.add(txt);

            if (b.type === 'sel') this.texteSelInv = txt;
            else this.compteursFragmentsInv[b.famille] = txt;
        }

        // Liseré doré qui sépare la bande du compteur en dessous
        const liseré = this.add.graphics();
        liseré.lineStyle(1, 0xc8a85a, 0.5);
        liseré.beginPath();
        liseré.moveTo(xGauche, y + 28);
        liseré.lineTo(xGauche + largeurZone, y + 28);
        liseré.strokePath();
        bande.add(liseré);

        this._refreshRessources();
    }

    _refreshRessources() {
        const sel = this.registry.get('sel_resonance') ?? 0;
        if (this.texteSelInv) this.texteSelInv.setText(`${sel}`);
        const f = this.registry.get('fragments') ?? { blanc: 0, bleu: 0, noir: 0 };
        for (const fam of ['blanc', 'bleu', 'noir']) {
            this.compteursFragmentsInv?.[fam]?.setText(`${f[fam] ?? 0}`);
        }
    }

    fermer() {
        // Reset des touches I/ESC pour éviter une réouverture immédiate
        const codes = Phaser.Input.Keyboard.KeyCodes;
        const keys = this.input.keyboard.keys;
        [codes.I, codes.ESC].forEach(c => keys[c]?.reset());
        this.scene.resume('GameScene');
        this.scene.stop();
    }

    // ============================================================
    // Slots équipés (3 slots, COLONNE GAUCHE — Phase 5b)
    // ============================================================
    _dessinerEquipement() {
        const equip = this.inventaire.getEquipement();
        // 3 slots compacts côte à côte, centrés autour de xColonneEquipement
        const espaceCase = TAILLE_SLOT_EQUIP + 16;
        const xColonne = GAME_WIDTH * 0.27;
        const yCentre = 195;

        // Titre section
        this.add.text(xColonne, yCentre - 42, '— ÉQUIPEMENT —', {
            fontFamily: 'monospace', fontSize: '11px', color: '#c8a85a',
            fontStyle: 'bold', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5, 0).setDepth(305);

        for (let k = 0; k < SLOTS.length; k++) {
            const slot = SLOTS[k];
            const x = xColonne + (k - 1) * espaceCase;
            const y = yCentre;
            const itemId = equip[slot];

            const s = creerSlot(this, x, y, {
                taille: TAILLE_SLOT_EQUIP,
                itemId,
                equipe: true,
                label: LABELS_SLOT[slot],
                onClick: () => {
                    const id = this.inventaire.getEquipement()[slot];
                    if (!id) {
                        this.panneau.afficherTexte('Slot vide.');
                    } else {
                        const it = ITEMS[id];
                        this.panneau.afficherItem(it, { equipe: true, slot }, {
                            onDesequiper: () => {
                                if (this.inventaire.desequiper(slot)) {
                                    this.panneau.afficherTexte('Déséquipé.');
                                } else {
                                    this.panneau.afficherTexte("Inventaire plein, impossible de déséquiper.");
                                }
                            }
                        });
                    }
                }
            });
            this.slotsEquip[slot] = s;
        }
    }

    // ============================================================
    // Grille inventaire (8 × 5 = 40 slots)
    // ============================================================
    _dessinerGrille(xDebut, yDebut) {
        const inv = this.inventaire.getInventaire();
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const idx = r * COLS + c;
                const x = xDebut + c * (TAILLE_SLOT_INV + ESPACE_SLOT) + TAILLE_SLOT_INV / 2;
                const y = yDebut + r * (TAILLE_SLOT_INV + ESPACE_SLOT) + TAILLE_SLOT_INV / 2;
                const itemId = inv[idx] ?? null;

                const s = creerSlot(this, x, y, {
                    taille: TAILLE_SLOT_INV,
                    itemId,
                    onClick: () => {
                        const inv2 = this.inventaire.getInventaire();
                        const id = inv2[idx];
                        if (!id) {
                            this.panneau.afficherTexte('Slot vide.');
                            return;
                        }
                        const def = getItemOuVestige(id);
                        const estVestige = def?.categorie === 'vestige';
                        this.panneau.afficherItem(def, { equipe: false, indexInv: idx, vestige: estVestige }, {
                            onEquiper: () => {
                                const ok = estVestige
                                    ? this.inventaire.equiperVestigeDepuisInventaire(idx, def)
                                    : this.inventaire.equiperDepuisInventaire(idx, def);
                                this.panneau.afficherTexte(ok ? `Équipé : ${def.nom}` : 'Équipement impossible.');
                            },
                            onJeter: () => {
                                this.inventaire.jeter(idx);
                                this.panneau.afficherTexte('Jeté.');
                            }
                        });
                    }
                });
                this.slotsInv.push(s);
            }
        }
    }

    // ============================================================
    // Refresh & cascade
    // ============================================================
    _refreshTout() {
        const inv = this.inventaire.getInventaire();
        for (let i = 0; i < this.slotsInv.length; i++) {
            this.slotsInv[i].refresh(inv[i] ?? null);
        }
        const equip = this.inventaire.getEquipement();
        for (const slot of SLOTS) {
            this.slotsEquip[slot]?.refresh(equip[slot] ?? null);
        }
        const vest = this.inventaire.getVestiges();
        for (const slot of SLOTS_VESTIGE) {
            this.slotsVestige[slot]?.refresh(vest[slot] ?? null);
        }
        if (this.compteur) {
            this.compteur.setText(`${inv.length} / ${CAPACITE_INVENTAIRE}`);
        }
    }

    _jouerCascadeOuverture() {
        // Tous les slots commencent invisibles, on les rend visibles avec délai
        const tous = [...Object.values(this.slotsEquip), ...this.slotsInv];
        for (const s of tous) s.container.setAlpha(0);

        // Cadre fade-in
        this.cadre.container.setAlpha(0);
        this.tweens.add({
            targets: this.cadre.container,
            alpha: 1,
            duration: 220,
            ease: 'Cubic.Out'
        });

        // Cascade des slots équipés
        let delai = 200;
        for (const slot of SLOTS) {
            const s = this.slotsEquip[slot];
            this.tweens.add({
                targets: s.container,
                alpha: 1,
                duration: 200,
                delay: delai,
                ease: 'Cubic.Out'
            });
            delai += 60;
        }

        // Cascade des slots inventaire
        delai += 80;
        for (let i = 0; i < this.slotsInv.length; i++) {
            this.tweens.add({
                targets: this.slotsInv[i].container,
                alpha: 1,
                duration: 200,
                delay: delai,
                ease: 'Cubic.Out'
            });
            delai += 18;
        }
    }
}
