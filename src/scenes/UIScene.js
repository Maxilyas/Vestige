// HUD — jauge de Résonance + slots équipés + compteurs Sel/Fragments.
// S'abonne aux events du registry pour se redessiner à chaque changement.

import { GAME_WIDTH } from '../config.js';
import { RESONANCE_CLE, RESONANCE_MAX } from '../systems/ResonanceSystem.js';
import { MONDE_CLE, MONDE_MIROIR } from '../systems/MondeSystem.js';
import { EVT_EQUIP_CHANGE, SLOTS } from '../systems/InventaireSystem.js';
import { EVT_SEL_CHANGE, EVT_FRAGMENTS_CHANGE } from '../systems/EconomySystem.js';
import { creerSlot } from '../render/ui/SlotInventaire.js';
import { peindreEmblemeFamille } from '../render/ui/EmblemeFamille.js';

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
        this._appliquerOpaciteJauge();

        const handlerRes = (_p, valeur) => this.miseAJourResonance(valeur);
        const handlerMonde = () => this._appliquerOpaciteJauge();
        this.registry.events.on(`changedata-${RESONANCE_CLE}`, handlerRes);
        this.registry.events.on(`changedata-${MONDE_CLE}`, handlerMonde);

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

        // --- Compteurs Sel + Fragments (sous l'équipement) ---
        const yEco = yEquip + TAILLE_SLOT_HUD + 38;
        this._dessinerCompteurs(xEquipDebut, yEco, totalLargeurSlots);

        const handlerSel = () => this._refreshSel();
        const handlerFragments = () => this._refreshFragments();
        this.registry.events.on(EVT_SEL_CHANGE, handlerSel);
        this.registry.events.on(EVT_FRAGMENTS_CHANGE, handlerFragments);

        this.events.once('shutdown', () => {
            this.registry.events.off(`changedata-${RESONANCE_CLE}`, handlerRes);
            this.registry.events.off(`changedata-${MONDE_CLE}`, handlerMonde);
            this.registry.events.off(EVT_EQUIP_CHANGE, handlerEquip);
            this.registry.events.off(EVT_SEL_CHANGE, handlerSel);
            this.registry.events.off(EVT_FRAGMENTS_CHANGE, handlerFragments);
        });
    }

    /**
     * En Miroir, la Résonance n'est plus une jauge de combat (pas de drain, pas
     * de mort possible). On grise la jauge pour signaler son inactivité.
     */
    _appliquerOpaciteJauge() {
        const enMiroir = this.registry.get(MONDE_CLE) === MONDE_MIROIR;
        const alpha = enMiroir ? 0.35 : 1;
        this.fond?.setAlpha(alpha);
        this.barre?.setAlpha(alpha);
        this.texte?.setAlpha(alpha);
    }

    /**
     * Dessine la zone "ressources" : Sel sur une ligne, 3 Fragments en dessous.
     * Empilé verticalement pour éviter la superposition.
     */
    _dessinerCompteurs(xDebut, y, largeurZone) {
        // === Ligne 1 : Sel ===
        const symboleSel = this.add.graphics({ x: xDebut + 8, y: y + 6 });
        symboleSel.fillStyle(0xffd070, 1);
        symboleSel.beginPath();
        symboleSel.moveTo(0, -6);
        symboleSel.lineTo(5, 0);
        symboleSel.lineTo(0, 6);
        symboleSel.lineTo(-5, 0);
        symboleSel.closePath();
        symboleSel.fillPath();
        symboleSel.fillStyle(0xffffff, 0.7);
        symboleSel.fillCircle(-2, -2, 1.5);

        this.add.text(xDebut + 18, y - 1, 'SEL', {
            fontFamily: 'monospace', fontSize: '9px', color: '#8a8a9a'
        });
        this.texteSel = this.add.text(xDebut + largeurZone, y - 1, '0', {
            fontFamily: 'monospace', fontSize: '13px', color: '#ffd070',
            fontStyle: 'bold', stroke: '#000', strokeThickness: 2
        }).setOrigin(1, 0);

        // === Ligne 2 : 3 Fragments alignés ===
        const yLigne2 = y + 18;
        this.compteursFragments = {};
        const familles = ['blanc', 'bleu', 'noir'];
        const espace = largeurZone / 3;
        for (let k = 0; k < familles.length; k++) {
            const fam = familles[k];
            const fx = xDebut + espace * k + espace / 2;
            peindreEmblemeFamille(this, fx - 9, yLigne2 + 6, fam, 11);
            const txt = this.add.text(fx + 2, yLigne2 - 1, '0', {
                fontFamily: 'monospace', fontSize: '12px', color: '#e8e4d8',
                fontStyle: 'bold', stroke: '#000', strokeThickness: 2
            });
            this.compteursFragments[fam] = txt;
        }

        this._refreshSel();
        this._refreshFragments();
    }

    _refreshSel() {
        const v = this.registry.get('sel_resonance') ?? 0;
        if (this.texteSel) this.texteSel.setText(`${v}`);
    }

    _refreshFragments() {
        const f = this.registry.get('fragments') ?? { blanc: 0, bleu: 0, noir: 0 };
        for (const fam of ['blanc', 'bleu', 'noir']) {
            this.compteursFragments?.[fam]?.setText(`${f[fam] ?? 0}`);
        }
    }

    miseAJourResonance(valeur) {
        const ratio = Phaser.Math.Clamp(valeur / RESONANCE_MAX, 0, 1);
        this.barre.width = LARGEUR_BARRE * ratio;
        this.texte.setText(`${Math.round(valeur)}%`);
    }
}
