// Scène overlay — Carnet du Vestige.
//
// Refonte 8b5 : style "tableau gravé" — cadre stylisé, slots vectoriels,
// emblèmes par famille, panneau détail enrichi, animations à l'ouverture.
// Toute la composition vit dans src/render/ui/. Ici on orchestre.

import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import {
    InventaireSystem, SLOTS, EVT_INV_CHANGE, EVT_EQUIP_CHANGE, CAPACITE_INVENTAIRE
} from '../systems/InventaireSystem.js';
import { ITEMS } from '../data/items.js';
import { poserCadreInventaire, poserBoutonFermer } from '../render/ui/CadreInventaire.js';
import { creerSlot } from '../render/ui/SlotInventaire.js';
import { creerPanneauDetail } from '../render/ui/PanneauDetail.js';

// Layout
const TAILLE_SLOT_INV = 36;
const TAILLE_SLOT_EQUIP = 50;
const ESPACE_SLOT = 6;
const COLS = 8;
const ROWS = 5;

const LABELS_SLOT = { tete: 'TÊTE', corps: 'CORPS', accessoire: 'ACC.' };

export class InventaireScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InventaireScene' });
    }

    create() {
        this.inventaire = new InventaireSystem(this.registry);
        this.slotsInv = [];     // tableau de { container, refresh }
        this.slotsEquip = {};   // map slot → { container, refresh }

        // --- Cadre stylisé ---
        const cadre = poserCadreInventaire(this, GAME_WIDTH, GAME_HEIGHT);
        this.cadre = cadre;

        // Bouton fermer
        poserBoutonFermer(this, GAME_WIDTH - 50, 50, () => this.fermer());

        // --- Section slots équipés (centrée en haut) ---
        this._dessinerEquipement();

        // --- Section grille inventaire (à gauche) ---
        const xGrilleDebut = 60;
        const yGrilleDebut = 215;
        this._dessinerGrille(xGrilleDebut, yGrilleDebut);

        // --- Compteur N/40 ---
        const compteur = this.add.text(
            xGrilleDebut,
            yGrilleDebut - 18,
            `${this.inventaire.getInventaire().length} / ${CAPACITE_INVENTAIRE}`,
            { fontFamily: 'monospace', fontSize: '11px', color: '#8a8a9a', fontStyle: 'bold' }
        ).setScrollFactor(0).setDepth(305);
        this.compteur = compteur;

        // --- Panneau détail (à droite) ---
        const xPan = xGrilleDebut + COLS * (TAILLE_SLOT_INV + ESPACE_SLOT) + 30;
        const yPan = 175;
        const wPan = GAME_WIDTH - xPan - 50;
        const hPan = 320; // assez grand pour 4-5 effets + boutons sans chevauchement
        this.panneau = creerPanneauDetail(this, xPan, yPan, wPan, hPan);

        // --- Animation d'ouverture en cascade ---
        this._jouerCascadeOuverture();

        // --- Touches + redessins ---
        this.input.keyboard.on('keydown-I', () => this.fermer());
        this.input.keyboard.on('keydown-ESC', () => this.fermer());

        const handlerInv = () => this._refreshTout();
        const handlerEquip = () => this._refreshTout();
        this.registry.events.on(EVT_INV_CHANGE, handlerInv);
        this.registry.events.on(EVT_EQUIP_CHANGE, handlerEquip);
        this.events.once('shutdown', () => {
            this.registry.events.off(EVT_INV_CHANGE, handlerInv);
            this.registry.events.off(EVT_EQUIP_CHANGE, handlerEquip);
        });
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
    // Slots équipés (3 grands centrés en haut)
    // ============================================================
    _dessinerEquipement() {
        const equip = this.inventaire.getEquipement();
        const espaceCase = TAILLE_SLOT_EQUIP + 90;
        const xCentre = GAME_WIDTH / 2;
        const yCentre = 110;

        for (let k = 0; k < SLOTS.length; k++) {
            const slot = SLOTS[k];
            const x = xCentre + (k - 1) * espaceCase;
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
                        } else {
                            const it = ITEMS[id];
                            this.panneau.afficherItem(it, { equipe: false, indexInv: idx }, {
                                onEquiper: () => {
                                    this.inventaire.equiperDepuisInventaire(idx, it);
                                    this.panneau.afficherTexte(`Équipé : ${it.nom}`);
                                },
                                onJeter: () => {
                                    this.inventaire.jeter(idx);
                                    this.panneau.afficherTexte('Jeté.');
                                }
                            });
                        }
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
