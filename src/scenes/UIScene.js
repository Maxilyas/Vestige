// HUD — jauge de Résonance + 3 slots équipés.
// S'abonne aux events du registry pour se redessiner à chaque changement.

import { GAME_WIDTH } from '../config.js';
import { RESONANCE_CLE, RESONANCE_MAX } from '../systems/ResonanceSystem.js';
import { EVT_EQUIP_CHANGE } from '../systems/InventaireSystem.js';
import { ITEMS, COULEURS_FAMILLE } from '../data/items.js';

const LARGEUR_BARRE = 200;
const HAUTEUR_BARRE = 14;
const MARGE = 16;
const TAILLE_SLOT = 26;
const ECART_SLOT = 6;

export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        const x = GAME_WIDTH - LARGEUR_BARRE - MARGE;
        const y = MARGE;

        // --- Jauge de Résonance ---
        this.add.text(x, y - 14, 'RÉSONANCE', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#8a8a9a'
        });
        this.texte = this.add.text(x + LARGEUR_BARRE, y - 14, '', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#e8e4d8'
        }).setOrigin(1, 0);

        this.fond = this.add.rectangle(x, y, LARGEUR_BARRE, HAUTEUR_BARRE, 0x1f1f28)
            .setOrigin(0, 0)
            .setStrokeStyle(1, 0x4a4a5a);
        this.barre = this.add.rectangle(x, y, LARGEUR_BARRE, HAUTEUR_BARRE, 0xe8e4d8)
            .setOrigin(0, 0);

        this.miseAJourResonance(this.registry.get(RESONANCE_CLE) ?? RESONANCE_MAX);

        const handlerRes = (_p, valeur) => this.miseAJourResonance(valeur);
        this.registry.events.on(`changedata-${RESONANCE_CLE}`, handlerRes);

        // --- Équipement (3 slots sous la jauge) ---
        const yEquip = y + HAUTEUR_BARRE + 14;
        const xEquipDebut = GAME_WIDTH - (TAILLE_SLOT * 3 + ECART_SLOT * 2) - MARGE;

        this.add.text(xEquipDebut, yEquip - 12, 'ÉQUIPEMENT', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#8a8a9a'
        });

        this.slotsVisuels = {};
        const labelsSlot = ['T', 'C', 'A'];
        const slotIds = ['tete', 'corps', 'accessoire'];
        for (let k = 0; k < 3; k++) {
            const sx = xEquipDebut + k * (TAILLE_SLOT + ECART_SLOT);
            const cadre = this.add.rectangle(sx, yEquip, TAILLE_SLOT, TAILLE_SLOT, 0x1f1f28)
                .setOrigin(0, 0)
                .setStrokeStyle(1, 0x4a4a5a);
            const remplissage = this.add.rectangle(sx + 3, yEquip + 3, TAILLE_SLOT - 6, TAILLE_SLOT - 6, 0x1f1f28)
                .setOrigin(0, 0);
            const label = this.add.text(sx + TAILLE_SLOT / 2, yEquip + TAILLE_SLOT / 2, labelsSlot[k], {
                fontFamily: 'monospace',
                fontSize: '11px',
                color: '#5a5a6a',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            this.slotsVisuels[slotIds[k]] = { cadre, remplissage, label };
        }

        this.miseAJourEquipement(this.registry.get('equipement') ?? { tete: null, corps: null, accessoire: null });

        const handlerEquip = () => this.miseAJourEquipement(this.registry.get('equipement'));
        this.registry.events.on(EVT_EQUIP_CHANGE, handlerEquip);

        // Nettoyage si la scène est arrêtée un jour
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

    miseAJourEquipement(equip) {
        for (const slot of ['tete', 'corps', 'accessoire']) {
            const v = this.slotsVisuels[slot];
            const id = equip?.[slot];
            if (id && ITEMS[id]) {
                const couleur = COULEURS_FAMILLE[ITEMS[id].famille];
                v.remplissage.setFillStyle(couleur);
                v.label.setColor('#1a1a24');
            } else {
                v.remplissage.setFillStyle(0x1f1f28);
                v.label.setColor('#5a5a6a');
            }
        }
    }
}
