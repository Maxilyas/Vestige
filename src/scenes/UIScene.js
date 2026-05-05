// HUD — jauge de Résonance + 3 slots équipés stylisés.
// S'abonne aux events du registry pour se redessiner à chaque changement.

import { GAME_WIDTH } from '../config.js';
import { RESONANCE_CLE, RESONANCE_MAX } from '../systems/ResonanceSystem.js';
import { EVT_EQUIP_CHANGE, SLOTS } from '../systems/InventaireSystem.js';
import { creerSlot } from '../render/ui/SlotInventaire.js';

const LARGEUR_BARRE = 200;
const HAUTEUR_BARRE = 14;
const MARGE = 16;
const TAILLE_SLOT_HUD = 32;
const ECART_SLOT = 8;

const LABELS_SLOT = { tete: 'TÊTE', corps: 'CORPS', accessoire: 'ACC.' };

export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        const x = GAME_WIDTH - LARGEUR_BARRE - MARGE;
        const y = MARGE;

        // --- Jauge de Résonance ---
        this.add.text(x, y - 14, 'RÉSONANCE', {
            fontFamily: 'monospace', fontSize: '10px', color: '#8a8a9a'
        });
        this.texte = this.add.text(x + LARGEUR_BARRE, y - 14, '', {
            fontFamily: 'monospace', fontSize: '10px', color: '#e8e4d8'
        }).setOrigin(1, 0);

        this.fond = this.add.rectangle(x, y, LARGEUR_BARRE, HAUTEUR_BARRE, 0x1f1f28)
            .setOrigin(0, 0)
            .setStrokeStyle(1, 0x4a4a5a);
        this.barre = this.add.rectangle(x, y, LARGEUR_BARRE, HAUTEUR_BARRE, 0xe8e4d8)
            .setOrigin(0, 0);

        this.miseAJourResonance(this.registry.get(RESONANCE_CLE) ?? RESONANCE_MAX);

        const handlerRes = (_p, valeur) => this.miseAJourResonance(valeur);
        this.registry.events.on(`changedata-${RESONANCE_CLE}`, handlerRes);

        // --- 3 slots équipés stylisés sous la jauge ---
        // Empilés avec les mêmes cadres dorés que dans l'inventaire
        const totalLargeurSlots = SLOTS.length * TAILLE_SLOT_HUD + (SLOTS.length - 1) * ECART_SLOT;
        const xEquipDebut = GAME_WIDTH - totalLargeurSlots - MARGE;
        const yEquip = y + HAUTEUR_BARRE + 28;

        this.add.text(xEquipDebut, yEquip - 22, 'ÉQUIPEMENT', {
            fontFamily: 'monospace', fontSize: '10px', color: '#c8a85a',
            fontStyle: 'bold', stroke: '#000', strokeThickness: 2
        });

        // Petit liseré doré sous le titre
        const liseré = this.add.graphics();
        liseré.lineStyle(1, 0xc8a85a, 0.6);
        liseré.beginPath();
        liseré.moveTo(xEquipDebut, yEquip - 9);
        liseré.lineTo(xEquipDebut + totalLargeurSlots, yEquip - 9);
        liseré.strokePath();

        this.slotsEquip = {};
        const equip = this.registry.get('equipement') ?? { tete: null, corps: null, accessoire: null };
        for (let k = 0; k < SLOTS.length; k++) {
            const slot = SLOTS[k];
            const sx = xEquipDebut + k * (TAILLE_SLOT_HUD + ECART_SLOT) + TAILLE_SLOT_HUD / 2;
            const sy = yEquip + TAILLE_SLOT_HUD / 2;
            const s = creerSlot(this, sx, sy, {
                taille: TAILLE_SLOT_HUD,
                itemId: equip[slot],
                equipe: true,
                label: LABELS_SLOT[slot]
            });
            this.slotsEquip[slot] = s;
        }

        const handlerEquip = () => {
            const e = this.registry.get('equipement') ?? { tete: null, corps: null, accessoire: null };
            for (const slot of SLOTS) {
                this.slotsEquip[slot]?.refresh(e[slot] ?? null);
            }
        };
        this.registry.events.on(EVT_EQUIP_CHANGE, handlerEquip);

        this.events.once('shutdown', () => {
            this.registry.events.off(`changedata-${RESONANCE_CLE}`, handlerRes);
            this.registry.events.off(EVT_EQUIP_CHANGE, handlerEquip);
        });
    }

    miseAJourResonance(valeur) {
        const ratio = Phaser.Math.Clamp(valeur / RESONANCE_MAX, 0, 1);
        this.barre.width = LARGEUR_BARRE * ratio;
        this.texte.setText(`${Math.round(valeur)}%`);
    }
}
