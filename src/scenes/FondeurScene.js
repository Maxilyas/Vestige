// Scène overlay — Table de Forge du Fondeur.
//
// Phase 6 — 3 onglets :
//   1. FRAGMENTS  : forge legacy (1-2 fragments + Sel → item legacy T3)
//   2. COMBINER   : combine 2 instances Phase 6 → 1 nouvelle (variance + risque Brisé)
//   3. RE-RÉSONNER : reroll d'une instance avec Encre du Témoin + Sel
//
// Style "tableau gravé" cohérent avec le Carnet du Vestige.

import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { InventaireSystem } from '../systems/InventaireSystem.js';
import { EconomySystem, EVT_SEL_CHANGE, EVT_FRAGMENTS_CHANGE, EVT_ENCRE_CHANGE } from '../systems/EconomySystem.js';
import { FondeurSystem } from '../systems/FondeurSystem.js';
import { CraftingSystem, COUTS_COMBINAISON, RISQUE_BRISE, COUTS_REROLL } from '../systems/CraftingSystem.js';
import { FondeurUpgradeSystem, PALIERS_FONDEUR, NIVEAU_MAX } from '../systems/FondeurUpgradeSystem.js';
import { coutEnSel, phraseFondeur, PHRASE_INV_PLEIN } from '../data/recettes.js';
import { ITEMS, COULEURS_FAMILLE, getItemOuVestige } from '../data/items.js';
import { peindreEmblemeFamille } from '../render/ui/EmblemeFamille.js';
import { COULEURS_INVENTAIRE, poserCadreInventaire, poserBoutonFermer } from '../render/ui/CadreInventaire.js';
import { creerSlot } from '../render/ui/SlotInventaire.js';
import { estInstance, tierPourScore, couleurPourScore } from '../systems/ScoreSystem.js';
import { STATS } from '../data/stats.js';
import { TEMPLATES } from '../data/templatesItems.js';

const ONGLETS = ['fragments', 'combiner', 'reroll', 'upgrade'];
const LABEL_ONGLET = {
    fragments: 'FRAGMENTS',
    combiner: 'COMBINER',
    reroll: 'RE-RÉSONNER',
    upgrade: 'AMÉLIORER'
};

export class FondeurScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FondeurScene' });
    }

    init(data) {
        this.rngForge = data?.rng ?? Math.random;
    }

    create() {
        this.economy = new EconomySystem(this.registry);
        this.inventaire = new InventaireSystem(this.registry);
        this.fondeur = new FondeurSystem(this.economy, this.inventaire);
        this.crafting = new CraftingSystem(this.economy, this.inventaire);
        this.upgradeSys = new FondeurUpgradeSystem();

        // État commun
        this.ongletActif = 'fragments';
        // Onglet Fragments — résultat est une INSTANCE Phase 6
        this.slots = [null, null, null];
        this.instanceResultat = null;
        // Onglet Combiner
        this.uidA = null;
        this.uidB = null;
        this.combinerResultat = null;
        // Onglet Reroll
        this.uidReroll = null;
        this.lockedStat = null;
        this.rerollResultat = null;

        // Cadre stylisé
        const cadre = poserCadreInventaire(this, GAME_WIDTH, GAME_HEIGHT);
        cadre.titre.setText('TABLE DE FORGE');
        poserBoutonFermer(this, GAME_WIDTH - 50, 50, () => this.fermer());

        // Phrase du Fondeur (haute)
        this.phraseTexte = this.add.text(GAME_WIDTH / 2, 78, '"' + phraseFondeur([]) + '"', {
            fontFamily: 'monospace', fontSize: '12px', color: '#c8a85a',
            fontStyle: 'italic', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5, 0).setDepth(310);

        // Barre d'onglets sous la phrase
        this._dessinerOnglets();

        // Zone principale (réservée à l'onglet actif)
        this.zoneCont = this.add.container(0, 0).setDepth(310);
        this._dessinerContenuOnglet();

        // Bande ressources fixe en bas
        this._dessinerBandeRessources();

        // Touches
        this.input.keyboard.on('keydown-ESC', () => this.fermer());
        this.input.keyboard.on('keydown-ONE', () => this._changerOnglet('fragments'));
        this.input.keyboard.on('keydown-TWO', () => this._changerOnglet('combiner'));
        this.input.keyboard.on('keydown-THREE', () => this._changerOnglet('reroll'));
        this.input.keyboard.on('keydown-FOUR', () => this._changerOnglet('upgrade'));

        const handlerEco = () => this._refreshTout();
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
        [codes.ESC, codes.ONE, codes.TWO, codes.THREE, codes.FOUR].forEach(c => keys[c]?.reset());
        this.scene.resume('GameScene');
        this.scene.stop();
    }

    // ============================================================
    // ONGLETS
    // ============================================================
    _dessinerOnglets() {
        if (this.contOnglets) this.contOnglets.destroy();
        this.contOnglets = this.add.container(0, 0).setDepth(310);

        const yOnglets = 108;
        const espace = 12;
        const largOnglet = 118;
        const xDebut = GAME_WIDTH / 2 - (ONGLETS.length * largOnglet + (ONGLETS.length - 1) * espace) / 2;

        for (let i = 0; i < ONGLETS.length; i++) {
            const id = ONGLETS[i];
            const x = xDebut + i * (largOnglet + espace);
            const actif = this.ongletActif === id;

            const fond = this.add.graphics();
            fond.fillStyle(actif ? 0x2a1810 : 0x14100a, 1);
            fond.fillRect(x, yOnglets, largOnglet, 28);
            fond.lineStyle(actif ? 2 : 1, actif ? COULEURS_INVENTAIRE.orClair : COULEURS_INVENTAIRE.or, actif ? 1 : 0.6);
            fond.strokeRect(x, yOnglets, largOnglet, 28);
            this.contOnglets.add(fond);

            const txt = this.add.text(x + largOnglet / 2, yOnglets + 14, LABEL_ONGLET[id], {
                fontFamily: 'monospace', fontSize: '12px',
                color: actif ? '#ffd070' : '#a8a8b8',
                fontStyle: 'bold', stroke: '#000', strokeThickness: 2
            }).setOrigin(0.5);
            this.contOnglets.add(txt);

            const hit = this.add.rectangle(x + largOnglet / 2, yOnglets + 14, largOnglet, 28, 0xffffff, 0)
                .setInteractive({ useHandCursor: true });
            hit.on('pointerdown', () => this._changerOnglet(id));
            this.contOnglets.add(hit);
        }

        // Hint touches 1/2/3/4 sous les onglets
        const hint = this.add.text(GAME_WIDTH / 2, yOnglets + 38, '— 1 / 2 / 3 / 4 pour changer d\'onglet —', {
            fontFamily: 'monospace', fontSize: '9px', color: '#6a6a7a'
        }).setOrigin(0.5);
        this.contOnglets.add(hint);
    }

    _changerOnglet(id) {
        if (this.ongletActif === id) return;
        this.ongletActif = id;
        // Reset état spécifique
        this.instanceResultat = null;
        this.combinerResultat = null;
        this.rerollResultat = null;
        this._dessinerOnglets();
        this._dessinerContenuOnglet();
    }

    _dessinerContenuOnglet() {
        this.zoneCont.removeAll(true);
        if (this.ongletActif === 'fragments') this._renderOngletFragments();
        else if (this.ongletActif === 'combiner') this._renderOngletCombiner();
        else if (this.ongletActif === 'reroll') this._renderOngletReroll();
        else if (this.ongletActif === 'upgrade') this._renderOngletUpgrade();
    }

    // ============================================================
    // ONGLET 4 — AMÉLIORER (méta-progression du Fondeur)
    // ============================================================
    _renderOngletUpgrade() {
        const cx = GAME_WIDTH / 2;
        const y0 = 180;

        const niveau = this.upgradeSys.getNiveau();
        const palier = this.upgradeSys.getPalier();
        const suivant = this.upgradeSys.getPalierSuivant();

        // Titre + palier actuel
        this.zoneCont.add(this.add.text(cx, y0 - 18, 'PALIER DU FOYER', {
            fontFamily: 'monospace', fontSize: '10px',
            color: '#c8a85a', fontStyle: 'bold'
        }).setOrigin(0.5, 0));
        this.zoneCont.add(this.add.text(cx, y0, `Niveau ${niveau}  •  ${palier.nom}`, {
            fontFamily: 'monospace', fontSize: '14px',
            color: '#ffd070', fontStyle: 'bold',
            stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5, 0));

        // Effets actuels
        let yC = y0 + 32;
        this.zoneCont.add(this.add.text(cx, yC, `+${palier.scoreBonus} au score moyen forgé`, {
            fontFamily: 'monospace', fontSize: '11px', color: '#d8d4c8'
        }).setOrigin(0.5, 0));
        yC += 16;
        this.zoneCont.add(this.add.text(cx, yC,
            `-${Math.round(palier.risqueBriseReduit * 100)} % risque de Brisé en combinaison`, {
            fontFamily: 'monospace', fontSize: '11px', color: '#d8d4c8'
        }).setOrigin(0.5, 0));
        yC += 28;

        // Aperçu palier suivant
        if (!suivant) {
            this.zoneCont.add(this.add.text(cx, yC, '— Tu as atteint le sommet du Foyer —', {
                fontFamily: 'monospace', fontSize: '12px',
                color: '#ff8030', fontStyle: 'italic bold'
            }).setOrigin(0.5, 0));
            return;
        }

        // Liseré
        const sep = this.add.graphics();
        sep.lineStyle(1, COULEURS_INVENTAIRE.or, 0.4);
        sep.beginPath();
        sep.moveTo(cx - 200, yC); sep.lineTo(cx + 200, yC);
        sep.strokePath();
        this.zoneCont.add(sep);
        yC += 16;

        this.zoneCont.add(this.add.text(cx, yC, `PROCHAIN PALIER : ${suivant.nom}`, {
            fontFamily: 'monospace', fontSize: '11px',
            color: '#ffd070', fontStyle: 'bold'
        }).setOrigin(0.5, 0));
        yC += 18;
        this.zoneCont.add(this.add.text(cx, yC, suivant.description, {
            fontFamily: 'monospace', fontSize: '10px', color: '#c8c4b8',
            fontStyle: 'italic',
            wordWrap: { width: 500 }, align: 'center'
        }).setOrigin(0.5, 0));
        yC += 30;

        // Coût détaillé
        const cout = suivant.cout;
        this.zoneCont.add(this.add.text(cx, yC, 'COÛT :', {
            fontFamily: 'monospace', fontSize: '10px',
            color: '#c8a85a', fontStyle: 'bold'
        }).setOrigin(0.5, 0));
        yC += 16;

        const sel = this.economy.getSel();
        const okSel = sel >= cout.sel;
        this.zoneCont.add(this.add.text(cx, yC, `${cout.sel} Sel  (tu en as ${sel})`, {
            fontFamily: 'monospace', fontSize: '11px',
            color: okSel ? '#ffd070' : '#ff6060', fontStyle: 'bold'
        }).setOrigin(0.5, 0));
        yC += 16;

        let tousFragOk = true;
        for (const fam of Object.keys(cout.fragments ?? {})) {
            const need = cout.fragments[fam];
            const have = this.economy.getFragment(fam);
            const ok = have >= need;
            if (!ok) tousFragOk = false;
            this.zoneCont.add(this.add.text(cx, yC,
                `${need} Fragment ${fam}  (tu en as ${have})`, {
                fontFamily: 'monospace', fontSize: '11px',
                color: ok ? '#d8d4c8' : '#ff6060'
            }).setOrigin(0.5, 0));
            yC += 15;
        }

        // Bouton
        yC += 16;
        const peutUpgrader = okSel && tousFragOk;
        this._ajouterBouton(this.zoneCont, cx, yC, 'AMÉLIORER LE FOYER', peutUpgrader, () => {
            const res = this.upgradeSys.upgrader(this.economy);
            if (!res.success) {
                this.phraseTexte.setText('"Le Foyer attend encore."');
                this.phraseTexte.setColor('#ff6060');
                return;
            }
            // Resync les autres systèmes pour appliquer le nouveau bonus
            this.fondeur.upgrade = this.upgradeSys;
            this.crafting.upgrade = this.upgradeSys;
            this.phraseTexte.setText(`"${res.palier.nom} — le Foyer rugit."`);
            this.phraseTexte.setColor('#ffd070');
            this._dessinerContenuOnglet();
        });
    }

    // ============================================================
    // ONGLET 1 — FRAGMENTS (forge par fragments)
    // Layout vertical compact :
    //   Y_SLOTS (168)      slots fragments à fondre
    //   Y_LABEL_BIN (196)  label "FRAGMENTS"
    //   Y_BTN_AJOUT (232)  3 boutons d'ajout par famille
    //   Y_SEP (290)        séparateur
    //   Y_COUT (300)       texte du coût
    //   Y_BTN (326)        bouton FONDRE
    //   Y_SEP2 (354)       séparateur
    //   Y_RESULTAT (366)   titre + losange + nom du résultat
    // ============================================================
    _renderOngletFragments() {
        const cx = GAME_WIDTH / 2;

        // ─── Slots à fondre (3 cases) ─────────────────────────────
        const yS = 168;
        const taille = 50;
        const espace = 14;
        for (let i = 0; i < 3; i++) {
            const x = cx + (i - 1) * (taille + espace);
            const cadre = this.add.graphics();
            cadre.fillStyle(0x080604, 1);
            cadre.fillRect(x - taille / 2, yS - taille / 2, taille, taille);
            cadre.lineStyle(2, COULEURS_INVENTAIRE.or, 0.85);
            cadre.strokeRect(x - taille / 2, yS - taille / 2, taille, taille);
            this.zoneCont.add(cadre);
            const fam = this.slots[i];
            if (fam) this.zoneCont.add(peindreEmblemeFamille(this, x, yS, fam, 24));
            const hit = this.add.rectangle(x, yS, taille, taille, 0xffffff, 0)
                .setInteractive({ useHandCursor: true });
            hit.on('pointerdown', () => { this.slots[i] = null; this._dessinerContenuOnglet(); });
            this.zoneCont.add(hit);
        }
        this.zoneCont.add(this.add.text(cx, yS + taille / 2 + 6, 'FRAGMENTS À FONDRE', {
            fontFamily: 'monospace', fontSize: '9px', color: '#8a8a9a', fontStyle: 'bold'
        }).setOrigin(0.5, 0));

        // ─── Boutons d'ajout (3 familles) ─────────────────────────
        const yA = 234;
        const tailleBtn = 38;
        const familles = ['blanc', 'bleu', 'noir'];
        // Petit titre au-dessus
        this.zoneCont.add(this.add.text(cx, yA - tailleBtn / 2 - 10, '— AJOUTER UN FRAGMENT —', {
            fontFamily: 'monospace', fontSize: '8px', color: '#6a6a7a'
        }).setOrigin(0.5, 0));
        for (let i = 0; i < familles.length; i++) {
            const fam = familles[i];
            const x = cx + (i - 1) * (tailleBtn + 14);
            const dispo = this._fragDispo(fam);
            const interactif = dispo > 0 && this.slots.some(s => s === null);
            const cadre = this.add.graphics();
            cadre.fillStyle(0x080604, 1);
            cadre.fillRect(x - tailleBtn / 2, yA - tailleBtn / 2, tailleBtn, tailleBtn);
            cadre.lineStyle(1, interactif ? COULEURS_INVENTAIRE.or : 0x4a4a5a, interactif ? 0.85 : 0.4);
            cadre.strokeRect(x - tailleBtn / 2, yA - tailleBtn / 2, tailleBtn, tailleBtn);
            this.zoneCont.add(cadre);
            const emb = peindreEmblemeFamille(this, x, yA - 4, fam, 20);
            if (!interactif) emb.setAlpha(0.35);
            this.zoneCont.add(emb);
            this.zoneCont.add(this.add.text(x, yA + tailleBtn / 2 - 6, String(dispo), {
                fontFamily: 'monospace', fontSize: '10px',
                color: interactif ? '#e8e4d8' : '#5a5a6a', fontStyle: 'bold'
            }).setOrigin(0.5));
            if (interactif) {
                const hit = this.add.rectangle(x, yA, tailleBtn, tailleBtn, 0xffffff, 0)
                    .setInteractive({ useHandCursor: true });
                hit.on('pointerdown', () => {
                    const idx = this.slots.findIndex(s => s === null);
                    if (idx >= 0) { this.slots[idx] = fam; this._dessinerContenuOnglet(); }
                });
                this.zoneCont.add(hit);
            }
        }

        // ─── Séparateur ───────────────────────────────────────────
        this._tracerSep(282);

        // ─── Coût + bouton FONDRE ─────────────────────────────────
        const nbFrag = this.slots.filter(s => s !== null).length;
        const cout = coutEnSel(nbFrag);
        const sel = this.economy.getSel();
        const peutPayer = sel >= cout;
        const invPlein = this.inventaire.estPlein();
        const peutForger = nbFrag > 0 && peutPayer && !invPlein;
        const couleurCout = peutPayer ? '#ffd070' : '#ff6060';
        this.zoneCont.add(this.add.text(cx, 294, `Coût : ${cout} Sel`, {
            fontFamily: 'monospace', fontSize: '12px', color: couleurCout,
            fontStyle: 'bold', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5, 0));
        this._ajouterBouton(this.zoneCont, cx, 326, 'FONDRE', peutForger, () => {
            const fragments = this.slots.filter(s => s !== null);
            const res = this.fondeur.forger(fragments, this.rngForge);
            if (!res.success) {
                this.phraseTexte.setText('"' + (res.raison === 'inventaire_plein' ? PHRASE_INV_PLEIN : 'Le foyer refuse.') + '"');
                this.phraseTexte.setColor('#ff6060');
                return;
            }
            this.instanceResultat = res.instance;
            this.slots = [null, null, null];
            this._dessinerContenuOnglet();
        });

        // ─── Séparateur ───────────────────────────────────────────
        this._tracerSep(354);

        // ─── Résultat ─────────────────────────────────────────────
        this.zoneCont.add(this.add.text(cx, 364, '— RÉSULTAT —', {
            fontFamily: 'monospace', fontSize: '10px', color: '#c8a85a', fontStyle: 'bold'
        }).setOrigin(0.5, 0));
        if (this.instanceResultat) {
            const inst = this.instanceResultat;
            const tpl = TEMPLATES[inst.templateId];
            const couleur = couleurPourScore(inst.score);
            const css = '#' + couleur.toString(16).padStart(6, '0');
            const yRes = 392;
            const halo = this.add.graphics();
            halo.setBlendMode(Phaser.BlendModes.ADD);
            halo.fillStyle(couleur, 0.6);
            halo.fillCircle(cx, yRes, 26);
            this.zoneCont.add(halo);
            const losange = this.add.graphics();
            losange.fillStyle(couleur, 1);
            const r = 16;
            losange.beginPath();
            losange.moveTo(cx, yRes - r);
            losange.lineTo(cx + r, yRes);
            losange.lineTo(cx, yRes + r);
            losange.lineTo(cx - r, yRes);
            losange.closePath();
            losange.fillPath();
            this.zoneCont.add(losange);
            this.zoneCont.add(this.add.text(cx, yRes, String(inst.score), {
                fontFamily: 'monospace', fontSize: '12px', color: '#000', fontStyle: 'bold'
            }).setOrigin(0.5));
            const nom = `${tpl ? tpl.nom : 'Forgé'} • ${tierPourScore(inst.score).nomLong}`;
            this.zoneCont.add(this.add.text(cx, yRes + r + 6, nom, {
                fontFamily: 'monospace', fontSize: '12px', color: css,
                fontStyle: 'bold', stroke: '#000', strokeThickness: 3
            }).setOrigin(0.5, 0));
        }
    }

    /** Trace un liseré horizontal doré à hauteur y. */
    _tracerSep(y) {
        const cx = GAME_WIDTH / 2;
        const g = this.add.graphics();
        g.lineStyle(1, COULEURS_INVENTAIRE.or, 0.35);
        g.beginPath();
        g.moveTo(cx - 220, y);
        g.lineTo(cx + 220, y);
        g.strokePath();
        this.zoneCont.add(g);
    }

    // ============================================================
    // ONGLET 2 — COMBINER (2 instances → 1 nouvelle)
    // Layout :
    //   Y_EXPL (160)       texte explicatif
    //   Y_SLOTS (200)      slots A + B + signe central
    //   Y_LABEL (240)      label OBJET A / OBJET B
    //   Y_BTN_CHOISIR (260) bouton CHANGER / CHOISIR sous chaque slot
    //   Y_SEP (296)        séparateur
    //   Y_PREVIEW (308)    preview du résultat
    //   Y_BTN (380)        bouton COMBINER
    //   Y_SEP2 (408)       séparateur
    //   Y_RES (418)        résultat
    // ============================================================
    _renderOngletCombiner() {
        const cx = GAME_WIDTH / 2;

        this.zoneCont.add(this.add.text(cx, 162, 'Combine deux objets forgés en un seul.', {
            fontFamily: 'monospace', fontSize: '11px', color: '#a8a8b8', fontStyle: 'italic'
        }).setOrigin(0.5, 0));

        // ─── 2 slots A + B + signe central ────────────────────────
        const yS = 204;
        const xA = cx - 90;
        const xB = cx + 90;
        this._dessinerSlotCombiner(xA, yS, this.uidA, 'A', (uid) => { this.uidA = uid; this._dessinerContenuOnglet(); });
        this._dessinerSlotCombiner(xB, yS, this.uidB, 'B', (uid) => { this.uidB = uid; this._dessinerContenuOnglet(); });

        this.zoneCont.add(this.add.text(cx, yS, '+', {
            fontFamily: 'monospace', fontSize: '28px', color: '#c8a85a', fontStyle: 'bold'
        }).setOrigin(0.5));

        // ─── Séparateur ───────────────────────────────────────────
        this._tracerSep(296);

        // ─── Preview du résultat ──────────────────────────────────
        const preview = this.uidA && this.uidB
            ? this.crafting.previewCombinaison(this.uidA, this.uidB)
            : null;
        if (preview) {
            const couleur = couleurPourScore(preview.scoreBase);
            const css = '#' + couleur.toString(16).padStart(6, '0');
            this.zoneCont.add(this.add.text(cx, 306, 'Résultat probable :', {
                fontFamily: 'monospace', fontSize: '10px', color: '#8a8a9a'
            }).setOrigin(0.5, 0));
            this.zoneCont.add(this.add.text(cx, 320, `${preview.template.nom} • ${preview.tier.nomLong}`, {
                fontFamily: 'monospace', fontSize: '12px', color: css, fontStyle: 'bold',
                stroke: '#000', strokeThickness: 2
            }).setOrigin(0.5, 0));
            const peutPayer = this.economy.getSel() >= preview.cout;
            this.zoneCont.add(this.add.text(cx, 340, `Coût : ${preview.cout} Sel  •  score base ${preview.scoreBase} ± 15`, {
                fontFamily: 'monospace', fontSize: '10px',
                color: peutPayer ? '#ffd070' : '#ff6060', fontStyle: 'bold'
            }).setOrigin(0.5, 0));
            if (preview.risque > 0) {
                this.zoneCont.add(this.add.text(cx, 356, `Risque de Brisé : ${Math.round(preview.risque * 100)}%`, {
                    fontFamily: 'monospace', fontSize: '10px', color: '#ff8060'
                }).setOrigin(0.5, 0));
            }
        } else {
            this.zoneCont.add(this.add.text(cx, 320, 'Sélectionne deux objets forgés à combiner.', {
                fontFamily: 'monospace', fontSize: '11px', color: '#6a6a7a', fontStyle: 'italic'
            }).setOrigin(0.5, 0));
        }

        // ─── Bouton COMBINER ─────────────────────────────────────
        const peutCombiner = preview && this.economy.getSel() >= preview.cout && !this.inventaire.estPlein();
        this._ajouterBouton(this.zoneCont, cx, 388, 'COMBINER', peutCombiner, () => {
            const res = this.crafting.combiner(this.uidA, this.uidB, this.rngForge);
            if (!res.success) {
                this.phraseTexte.setText('"' + (res.raison === 'inventaire_plein' ? PHRASE_INV_PLEIN : 'Les Vestiges refusent.') + '"');
                this.phraseTexte.setColor('#ff6060');
                return;
            }
            this.combinerResultat = res;
            this.uidA = null;
            this.uidB = null;
            this._dessinerContenuOnglet();
        });

        // ─── Résultat ─────────────────────────────────────────────
        if (this.combinerResultat) {
            this._tracerSep(416);
            const inst = this.combinerResultat.instance;
            const brise = this.combinerResultat.brise;
            const couleur = brise ? 0x5a5a6a : couleurPourScore(inst.score);
            const css = '#' + couleur.toString(16).padStart(6, '0');
            const tpl = TEMPLATES[inst.templateId];
            const titre = brise ? 'BRISÉ' : tierPourScore(inst.score).nomLong;
            this.zoneCont.add(this.add.text(cx, 424, '— RÉSULTAT —', {
                fontFamily: 'monospace', fontSize: '9px', color: '#c8a85a', fontStyle: 'bold'
            }).setOrigin(0.5, 0));
            this.zoneCont.add(this.add.text(cx, 438, `${inst.score}  ★  ${tpl ? tpl.nom : '???'}  •  ${titre}`, {
                fontFamily: 'monospace', fontSize: '13px', color: css, fontStyle: 'bold',
                stroke: '#000', strokeThickness: 3
            }).setOrigin(0.5, 0));
        }
    }

    _dessinerSlotCombiner(x, y, uid, label, onPick) {
        const inst = uid ? this._trouverInstance(uid) : null;
        const taille = 56;
        const cadre = this.add.graphics();
        cadre.fillStyle(0x080604, 1);
        cadre.fillRect(x - taille / 2, y - taille / 2, taille, taille);
        const couleurBord = inst ? couleurPourScore(inst.score) : COULEURS_INVENTAIRE.or;
        cadre.lineStyle(2, couleurBord, 0.9);
        cadre.strokeRect(x - taille / 2, y - taille / 2, taille, taille);
        this.zoneCont.add(cadre);

        if (inst) {
            // Losange coloré centre
            const g = this.add.graphics();
            g.fillStyle(couleurBord, 0.95);
            const r = 16;
            g.beginPath();
            g.moveTo(x, y - r); g.lineTo(x + r, y); g.lineTo(x, y + r); g.lineTo(x - r, y);
            g.closePath(); g.fillPath();
            this.zoneCont.add(g);
            this.zoneCont.add(this.add.text(x, y, String(inst.score), {
                fontFamily: 'monospace', fontSize: '11px', color: '#000', fontStyle: 'bold'
            }).setOrigin(0.5));
        } else {
            this.zoneCont.add(this.add.text(x, y, '?', {
                fontFamily: 'monospace', fontSize: '24px', color: '#3a3a4a', fontStyle: 'bold'
            }).setOrigin(0.5));
        }

        this.zoneCont.add(this.add.text(x, y + taille / 2 + 6, `OBJET ${label}`, {
            fontFamily: 'monospace', fontSize: '9px', color: '#8a8a9a', fontStyle: 'bold'
        }).setOrigin(0.5, 0));

        // Bouton "Choisir" sous le slot
        this._ajouterBouton(this.zoneCont, x, y + taille / 2 + 26, inst ? 'CHANGER' : 'CHOISIR', true, () => {
            this._ouvrirSelectionInstance((selUid) => onPick(selUid), inst ? inst.uid : null);
        }, 84, 22, 11);
    }

    // ============================================================
    // ONGLET 3 — RE-RÉSONNER (reroll d'un objet)
    // Layout :
    //   Y_EXPL (160)       texte explicatif
    //   Y_SLOT (200)       slot CIBLE central
    //   Y_BTN_CHOISIR (260) bouton CHANGER / CHOISIR
    //   Y_SEP (286)        séparateur
    //   Y_TITRE (296)      "VERROUILLER UNE STAT"
    //   Y_STATS (314+)     stats cliquables (4 max)
    //   Y_COUT (388)       texte du coût
    //   Y_BTN (414)        bouton RÉSONNER
    //   Y_RES (442)        résultat
    // ============================================================
    _renderOngletReroll() {
        const cx = GAME_WIDTH / 2;

        this.zoneCont.add(this.add.text(cx, 162, 'Reroll un objet forgé (verrouille une stat si tu veux).', {
            fontFamily: 'monospace', fontSize: '11px', color: '#a8a8b8', fontStyle: 'italic'
        }).setOrigin(0.5, 0));

        const inst = this.uidReroll ? this._trouverInstance(this.uidReroll) : null;

        // ─── Slot CIBLE ──────────────────────────────────────────
        this._dessinerSlotCombiner(cx, 204, this.uidReroll, 'CIBLE', (uid) => {
            this.uidReroll = uid;
            this.lockedStat = null;
            this._dessinerContenuOnglet();
        });

        if (inst) {
            this._tracerSep(286);

            // ─── Liste des stats verrouillables ──────────────────
            this.zoneCont.add(this.add.text(cx, 296, 'VERROUILLER UNE STAT (optionnel) :', {
                fontFamily: 'monospace', fontSize: '10px', color: '#c8a85a', fontStyle: 'bold'
            }).setOrigin(0.5, 0));

            for (let i = 0; i < inst.affixesPrim.length; i++) {
                const aff = inst.affixesPrim[i];
                const def = STATS[aff.statId];
                const verrouille = this.lockedStat === aff.statId;
                const y = 316 + i * 16;
                const txt = `${verrouille ? '🔒 ' : '   '}${def?.label ?? aff.statId} (${aff.delta > 0 ? '+' : ''}${aff.delta})`;
                const t = this.add.text(cx, y, txt, {
                    fontFamily: 'monospace', fontSize: '11px',
                    color: verrouille ? '#ffd070' : '#a8a8b8',
                    fontStyle: verrouille ? 'bold' : 'normal'
                }).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });
                t.on('pointerdown', () => {
                    this.lockedStat = (this.lockedStat === aff.statId) ? null : aff.statId;
                    this._dessinerContenuOnglet();
                });
                this.zoneCont.add(t);
            }

            // ─── Coût + bouton RÉSONNER ──────────────────────────
            const tier = tierPourScore(inst.score);
            const cout = COUTS_REROLL[tier.id] ?? 50;
            const peutPayer = this.economy.getSel() >= cout;
            const aEncre = this.economy.getEncre() >= 1;
            this.zoneCont.add(this.add.text(cx, 388, `Coût : ${cout} Sel + 1 Encre du Témoin`, {
                fontFamily: 'monospace', fontSize: '11px',
                color: (peutPayer && aEncre) ? '#ffd070' : '#ff6060',
                fontStyle: 'bold'
            }).setOrigin(0.5, 0));

            const peutReroll = peutPayer && aEncre;
            this._ajouterBouton(this.zoneCont, cx, 414, 'RÉSONNER', peutReroll, () => {
                const res = this.crafting.rerollItem(this.uidReroll, this.lockedStat, this.rngForge);
                if (!res.success) {
                    this.phraseTexte.setText('"L\'écho refuse."');
                    this.phraseTexte.setColor('#ff6060');
                    return;
                }
                this.rerollResultat = res.instance;
                this._dessinerContenuOnglet();
            });
        }

        if (this.rerollResultat) {
            this._tracerSep(440);
            const inst = this.rerollResultat;
            const couleur = couleurPourScore(inst.score);
            const css = '#' + couleur.toString(16).padStart(6, '0');
            this.zoneCont.add(this.add.text(cx, 448, '— NOUVEAU SCORE —', {
                fontFamily: 'monospace', fontSize: '9px', color: '#c8a85a', fontStyle: 'bold'
            }).setOrigin(0.5, 0));
            this.zoneCont.add(this.add.text(cx, 462, `${inst.score}  •  ${tierPourScore(inst.score).nomLong}`, {
                fontFamily: 'monospace', fontSize: '13px', color: css, fontStyle: 'bold',
                stroke: '#000', strokeThickness: 3
            }).setOrigin(0.5, 0));
        }
    }

    // ============================================================
    // PICKER D'INSTANCES (modale légère)
    // ============================================================
    _ouvrirSelectionInstance(onPick, excludeUid = null) {
        // Récupère toutes les instances Phase 6 disponibles
        const inv = this.inventaire.getInventaire();
        const instances = inv.filter(e => estInstance(e) && e.uid !== excludeUid);
        if (instances.length === 0) {
            this.phraseTexte.setText('"Aucun Vestige forgé dans ton inventaire."');
            this.phraseTexte.setColor('#ff6060');
            return;
        }

        // Overlay modal
        const overlay = this.add.container(0, 0).setDepth(400);
        const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6);
        bg.setInteractive();
        overlay.add(bg);

        const cadre = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 520, 380, 0x14100a);
        cadre.setStrokeStyle(2, COULEURS_INVENTAIRE.or);
        overlay.add(cadre);

        overlay.add(this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 170, 'CHOISIR UN VESTIGE FORGÉ', {
            fontFamily: 'monospace', fontSize: '12px', color: '#ffd070', fontStyle: 'bold'
        }).setOrigin(0.5));

        // Grille 6 colonnes × 5 lignes max
        const cols = 6;
        const taille = 56;
        const espace = 8;
        const x0 = GAME_WIDTH / 2 - (cols * (taille + espace) - espace) / 2 + taille / 2;
        const y0 = GAME_HEIGHT / 2 - 130;

        const max = Math.min(instances.length, 30);
        for (let i = 0; i < max; i++) {
            const inst = instances[i];
            const c = i % cols;
            const r = Math.floor(i / cols);
            const cx = x0 + c * (taille + espace);
            const cy = y0 + r * (taille + espace);
            const s = creerSlot(this, cx, cy, {
                taille,
                itemId: inst, // SlotInventaire sait gérer une instance
                onClick: () => {
                    overlay.destroy();
                    onPick(inst.uid);
                }
            });
            overlay.add(s.container);
        }

        // Bouton Fermer
        this._ajouterBouton(overlay, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 160, 'ANNULER', true, () => overlay.destroy(), 120, 28, 12);
        bg.on('pointerdown', () => overlay.destroy());
    }

    _trouverInstance(uid) {
        const inv = this.inventaire.getInventaire();
        for (const e of inv) {
            if (estInstance(e) && e.uid === uid) return e;
        }
        const eq = this.inventaire.getEquipement();
        for (const slot of ['tete', 'corps', 'accessoire']) {
            const e = eq[slot];
            if (estInstance(e) && e.uid === uid) return e;
        }
        return null;
    }

    // ============================================================
    // BANDE RESSOURCES
    // ============================================================
    _dessinerBandeRessources() {
        if (this.contRessources) this.contRessources.destroy();
        this.contRessources = this.add.container(0, 0).setDepth(310);

        const cx = GAME_WIDTH / 2;
        const y = GAME_HEIGHT - 55;

        const liseré = this.add.graphics();
        liseré.lineStyle(1, COULEURS_INVENTAIRE.or, 0.5);
        liseré.beginPath();
        liseré.moveTo(cx - 260, y - 8);
        liseré.lineTo(cx + 260, y - 8);
        liseré.strokePath();
        this.contRessources.add(liseré);

        // 5 blocs : Sel, Encre, Frag×3
        const blocs = [
            { type: 'sel', label: 'SEL', valeur: this.economy.getSel(), couleur: '#ffd070' },
            { type: 'encre', label: 'ENCRE', valeur: this.economy.getEncre(), couleur: '#a0a0c8' },
            { type: 'frag', fam: 'blanc', label: 'BLANC', valeur: this.economy.getFragment('blanc') },
            { type: 'frag', fam: 'bleu', label: 'BLEU', valeur: this.economy.getFragment('bleu') },
            { type: 'frag', fam: 'noir', label: 'NOIR', valeur: this.economy.getFragment('noir') }
        ];
        const espace = 100;
        const xDebut = cx - (blocs.length - 1) / 2 * espace;
        for (let i = 0; i < blocs.length; i++) {
            const b = blocs[i];
            const x = xDebut + i * espace;
            if (b.type === 'frag') {
                this.contRessources.add(peindreEmblemeFamille(this, x - 22, y + 6, b.fam, 13));
            } else {
                const g = this.add.graphics({ x: x - 22, y: y + 6 });
                g.fillStyle(b.type === 'encre' ? 0xa0a0c8 : 0xffd070, 1);
                g.beginPath();
                g.moveTo(0, -6); g.lineTo(5, 0); g.lineTo(0, 6); g.lineTo(-5, 0);
                g.closePath(); g.fillPath();
                this.contRessources.add(g);
            }
            this.contRessources.add(this.add.text(x - 12, y, b.label, {
                fontFamily: 'monospace', fontSize: '9px', color: '#8a8a9a', fontStyle: 'bold'
            }));
            this.contRessources.add(this.add.text(x + 26, y - 2, String(b.valeur), {
                fontFamily: 'monospace', fontSize: '13px',
                color: b.couleur ?? '#e8e4d8', fontStyle: 'bold',
                stroke: '#000', strokeThickness: 3
            }));
        }
    }

    _refreshTout() {
        this._dessinerContenuOnglet();
        this._dessinerBandeRessources();
    }

    _fragDispo(famille) {
        const stock = this.economy.getFragment(famille);
        const surTable = this.slots.filter(s => s === famille).length;
        return stock - surTable;
    }

    // ============================================================
    // BOUTON STYLISÉ
    // ============================================================
    _ajouterBouton(parent, x, y, label, actif, onClick, w = 130, h = 28, fontSize = 13) {
        const cx = x - w / 2;
        const couleurFond = actif ? 0x14100a : 0x0a0805;
        const couleurFondHover = actif ? 0x2a1810 : 0x0a0805;
        const couleurBord = actif ? COULEURS_INVENTAIRE.or : 0x3a3a4a;
        const couleurTexte = actif ? '#ffd070' : '#5a5a6a';

        const fond = this.add.graphics();
        const dessiner = (hover) => {
            fond.clear();
            fond.fillStyle(hover ? couleurFondHover : couleurFond, 1);
            fond.fillRect(cx, y - h / 2, w, h);
            fond.lineStyle(1.5, hover ? COULEURS_INVENTAIRE.orClair : couleurBord, 1);
            fond.strokeRect(cx, y - h / 2, w, h);
        };
        dessiner(false);
        parent.add(fond);
        parent.add(this.add.text(x, y, label, {
            fontFamily: 'monospace', fontSize: `${fontSize}px`,
            color: couleurTexte, fontStyle: 'bold',
            stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5));
        if (actif) {
            const hit = this.add.rectangle(x, y, w, h, 0xffffff, 0).setInteractive({ useHandCursor: true });
            hit.on('pointerover', () => dessiner(true));
            hit.on('pointerout', () => dessiner(false));
            hit.on('pointerdown', onClick);
            parent.add(hit);
        }
    }
}

