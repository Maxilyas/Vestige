// HUD — jauge de Résonance + slots équipés + compteurs Sel/Fragments + sceaux.
// S'abonne aux events du registry pour se redessiner à chaque changement.

import { GAME_WIDTH } from '../config.js';
import { RESONANCE_CLE, RESONANCE_MAX, RESONANCE_MAX_CLE } from '../systems/ResonanceSystem.js';
import { MONDE_CLE, MONDE_MIROIR } from '../systems/MondeSystem.js';
import { EVT_EQUIP_CHANGE, EVT_VESTIGES_CHANGE, SLOTS, SLOTS_VESTIGE } from '../systems/InventaireSystem.js';
import { EVT_SEL_CHANGE, EVT_FRAGMENTS_CHANGE } from '../systems/EconomySystem.js';
import { sceauObtenu, EVT_SCEAU_OBTENU } from '../systems/SceauxSystem.js';
import { creerSlot } from '../render/ui/SlotInventaire.js';
import { peindreEmblemeFamille } from '../render/ui/EmblemeFamille.js';
import { peindreSceau, SCEAU_DIAMETRE } from '../render/ui/Sceau.js';
import { poserBarreGarde } from '../render/ui/BarreGarde.js';
import { poserSlotSort } from '../render/ui/SlotSort.js';
import { getSort } from '../data/sorts.js';
import { estInstance } from '../systems/ScoreSystem.js';

const ECART_SCEAU = 6;

const LARGEUR_BARRE = 200;
const HAUTEUR_BARRE = 14;
const MARGE = 16;
const TAILLE_SLOT_HUD = 32;
const ECART_SLOT = 8;

const LABELS_SLOT = { tete: 'TÊTE', corps: 'CORPS', accessoire: 'ACC.' };
// Phase 5b — labels courts pour les slots Vestige du HUD (espacement serré).
const LABELS_VESTIGE = { geste: 'GESTE', maitrise1: 'MAÎT. I', maitrise2: 'MAÎT. II' };

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

        // --- Barre Garde Phase 6 — fine ligne bleue SOUS la Résonance ---
        // Hauteur 5 px, collée 2 px sous la Résonance.
        // (cachée tant qu'aucun item Phase 6 n'octroie de Garde)
        this.barreGarde = poserBarreGarde(this, x, y + HAUTEUR_BARRE + 2, LARGEUR_BARRE);

        // --- 3 slots SORTS Phase 6 — à GAUCHE de la Résonance ---
        // 3 × 32 px + 2 × 6 espace = 108 px largeur. Posés juste à gauche
        // de la jauge avec 14 px d'écart.
        const tailleSort = 32;
        const espaceSort = 6;
        const largeurSorts = 3 * tailleSort + 2 * espaceSort;
        const xSorts = x - largeurSorts - 14;
        this.slotsSort = [];
        for (let s = 0; s < 3; s++) {
            const sx = xSorts + s * (tailleSort + espaceSort) + tailleSort / 2;
            const sy = y + tailleSort / 2;
            this.slotsSort.push(poserSlotSort(this, sx, sy, s + 1));
        }
        // Petit label "SORTS"
        this.add.text(xSorts, y - 14, 'SORTS', {
            fontFamily: 'monospace', fontSize: '10px', color: '#8a8a9a'
        });

        // Tick d'actualisation des cooldowns sorts (10 Hz est suffisant pour
        // l'œil — overlay radial recalculé)
        this._sortRefreshEvt = this.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => this._refreshSorts()
        });
        this._refreshSorts();

        const handlerRes = (_p, valeur) => this.miseAJourResonance(valeur);
        const handlerMax = () => this.miseAJourResonance(this.registry.get(RESONANCE_CLE) ?? 0);
        const handlerMonde = () => this._appliquerOpaciteJauge();
        this.registry.events.on(`changedata-${RESONANCE_CLE}`, handlerRes);
        this.registry.events.on(`changedata-${RESONANCE_MAX_CLE}`, handlerMax);
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

        // --- 3 slots Vestige sous l'équipement (Phase 5b) ---
        // Espacement généreux (60 px) pour laisser place aux labels équipement
        // (TÊTE/CORPS/ACC.) puis au titre VESTIGES sans collision verticale.
        const yVestige = yEquip + TAILLE_SLOT_HUD + 60;
        this._dessinerSlotsVestige(xEquipDebut, yVestige, totalLargeurSlots);

        const handlerVestiges = () => {
            const v = this.registry.get('vestiges_equipes') ?? { geste: null, maitrise1: null, maitrise2: null };
            for (const slot of SLOTS_VESTIGE) {
                this.slotsVestige[slot]?.refresh(v[slot] ?? null);
            }
        };
        this.registry.events.on(EVT_VESTIGES_CHANGE, handlerVestiges);

        // --- Compteurs Sel + Fragments (sous les Vestiges) ---
        const yEco = yVestige + TAILLE_SLOT_HUD + 32;
        this._dessinerCompteurs(xEquipDebut, yEco, totalLargeurSlots);

        const handlerSel = () => this._refreshSel();
        const handlerFragments = () => this._refreshFragments();
        this.registry.events.on(EVT_SEL_CHANGE, handlerSel);
        this.registry.events.on(EVT_FRAGMENTS_CHANGE, handlerFragments);

        // --- Bandeau de sceaux (10 emblèmes centrés en haut) ---
        this._dessinerSceaux();
        const handlerSceau = (etageNumero) => this._refreshSceau(etageNumero, true);
        this.registry.events.on(EVT_SCEAU_OBTENU, handlerSceau);

        this.events.once('shutdown', () => {
            this.registry.events.off(`changedata-${RESONANCE_CLE}`, handlerRes);
            this.registry.events.off(`changedata-${RESONANCE_MAX_CLE}`, handlerMax);
            this.registry.events.off(`changedata-${MONDE_CLE}`, handlerMonde);
            this.registry.events.off(EVT_EQUIP_CHANGE, handlerEquip);
            this.registry.events.off(EVT_VESTIGES_CHANGE, handlerVestiges);
            this.registry.events.off(EVT_SEL_CHANGE, handlerSel);
            this.registry.events.off(EVT_FRAGMENTS_CHANGE, handlerFragments);
            this.registry.events.off(EVT_SCEAU_OBTENU, handlerSceau);
        });
    }

    /**
     * 3 slots Vestige (Phase 5b) sous l'équipement principal.
     * Label "VESTIGES" + liseré cramoisi (au lieu du doré équipement).
     */
    _dessinerSlotsVestige(xDebut, y, largeurZone) {
        this.add.text(xDebut, y - 22, 'VESTIGES', {
            fontFamily: 'monospace', fontSize: '10px', color: '#c04040',
            fontStyle: 'bold', stroke: '#000', strokeThickness: 2
        });
        const liseré = this.add.graphics();
        liseré.lineStyle(1, 0xc04040, 0.55);
        liseré.beginPath();
        liseré.moveTo(xDebut, y - 9);
        liseré.lineTo(xDebut + largeurZone, y - 9);
        liseré.strokePath();

        this.slotsVestige = {};
        const v = this.registry.get('vestiges_equipes') ?? { geste: null, maitrise1: null, maitrise2: null };
        for (let k = 0; k < SLOTS_VESTIGE.length; k++) {
            const slot = SLOTS_VESTIGE[k];
            const sx = xDebut + k * (TAILLE_SLOT_HUD + ECART_SLOT) + TAILLE_SLOT_HUD / 2;
            const sy = y + TAILLE_SLOT_HUD / 2;
            const s = creerSlot(this, sx, sy, {
                taille: TAILLE_SLOT_HUD,
                itemId: v[slot],
                equipe: true,
                label: LABELS_VESTIGE[slot]
            });
            this.slotsVestige[slot] = s;
        }
    }

    /**
     * Bandeau de 10 sceaux centrés horizontalement en haut de l'écran.
     * Chaque sceau est un Container — on les stocke dans `this.sceaux[i]` pour
     * pouvoir les remplacer à chaud quand un boss tombe.
     */
    _dessinerSceaux() {
        const total = 10 * SCEAU_DIAMETRE + 9 * ECART_SCEAU;
        const xDebut = (GAME_WIDTH - total) / 2 + SCEAU_DIAMETRE / 2;
        // Sous les 3 lignes texte du HUD gauche (titre y=10, touches y=30,
        // label danger y=48). 64 laisse 4-6 px d'air.
        const y = 64;

        this.sceaux = [];
        for (let i = 1; i <= 10; i++) {
            const sx = xDebut + (i - 1) * (SCEAU_DIAMETRE + ECART_SCEAU);
            const obtenu = sceauObtenu(i);
            const s = peindreSceau(this, sx, y, i, obtenu);
            s.setDepth(220);
            this.sceaux[i] = s;
        }
    }

    /**
     * Replace le visuel d'un sceau. Si `flash` est vrai, joue une anim de
     * scale + flash doré pour souligner l'obtention.
     */
    _refreshSceau(etageNumero, flash = false) {
        if (etageNumero < 1 || etageNumero > 10) return;
        const ancien = this.sceaux[etageNumero];
        const x = ancien?.x;
        const y = ancien?.y;
        ancien?.destroy();
        const s = peindreSceau(this, x, y, etageNumero, sceauObtenu(etageNumero));
        s.setDepth(220);
        this.sceaux[etageNumero] = s;

        if (!flash) return;
        // Anim "pop" + flash doré
        s.setScale(0.2);
        this.tweens.add({
            targets: s,
            scale: 1,
            duration: 280,
            ease: 'Back.Out'
        });
        const halo = this.add.graphics().setDepth(219);
        halo.fillStyle(0xffd070, 0.85);
        halo.fillCircle(x, y, SCEAU_DIAMETRE * 1.3);
        halo.setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({
            targets: halo,
            alpha: 0,
            duration: 600,
            ease: 'Quad.Out',
            onComplete: () => halo.destroy()
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

    _refreshSorts() {
        if (!this.slotsSort) return;
        const equipement = this.registry.get('equipement') ?? {};
        const gs = this.scene.get('GameScene');
        const cdMap = gs?._sortCdJusqu ?? {};
        const now = gs?.time?.now ?? 0;
        const slots = ['tete', 'corps', 'accessoire'];
        for (let i = 0; i < 3; i++) {
            const entry = equipement[slots[i]];
            const inst = estInstance(entry) ? entry : null;
            let cdRestant = 0;
            let cdTotal = 0;
            if (inst?.sortId) {
                const sortDef = getSort(inst.sortId);
                cdTotal = sortDef?.cooldownMs ?? 0;
                const cdJusqu = cdMap[slots[i]] ?? 0;
                cdRestant = Math.max(0, cdJusqu - now);
            }
            this.slotsSort[i].refresh(entry, cdRestant, cdTotal);
        }
    }

    miseAJourResonance(valeur) {
        // Phase 5b.2 — max dynamique (Cœur Pierreux peut l'augmenter à 120)
        const max = this.registry.get(RESONANCE_MAX_CLE) ?? RESONANCE_MAX;
        const ratio = Phaser.Math.Clamp(valeur / max, 0, 1);
        this.barre.width = LARGEUR_BARRE * ratio;
        this.texte.setText(`${Math.round(valeur)} / ${max}`);
    }
}
