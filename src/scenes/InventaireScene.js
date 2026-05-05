// Scène overlay — affiche l'inventaire et permet d'équiper / jeter.
//
// Fonctionnement :
//   - Lancée par GameScene.scene.launch('InventaireScene') sur intention "ouvrirInventaire"
//   - GameScene est mise en pause au launch (sauf en Miroir où la baisse continue —
//     le code de pause est côté GameScene, ici on se contente de dessiner)
//   - I, ESC ou clic sur "Fermer" : ferme l'overlay et reprend GameScene
//   - Tap sur un item : ouvre un mini-menu Équiper / Jeter / Annuler
//
// Tier de révélation :
//   tier 1 — nom + tous les effets visibles
//   tier 2 — nom + effets dont visible: true uniquement (le reste = "?")
//   tier 3 — nom + ★ marqueur, aucune stat (mystère total)

import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import {
    InventaireSystem, SLOTS, EVT_INV_CHANGE, EVT_EQUIP_CHANGE, CAPACITE_INVENTAIRE
} from '../systems/InventaireSystem.js';
import { ITEMS, COULEURS_FAMILLE } from '../data/items.js';

const COLS = 8;
const ROWS = 5;
const TAILLE = 48;
const ECART = 6;

export class InventaireScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InventaireScene' });
    }

    create() {
        this.inventaire = new InventaireSystem(this.registry);

        // Fond semi-transparent qui mange les clics derrière
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.78)
            .setInteractive(); // bloque les clics pour qu'ils ne passent pas à GameScene

        // Titre
        this.add.text(GAME_WIDTH / 2, 30, 'INVENTAIRE', {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#e8e4d8',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);

        this.add.text(GAME_WIDTH / 2, 58, 'I ou ÉCHAP pour fermer  •  Clic sur un objet pour interagir', {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#8a8a9a'
        }).setOrigin(0.5, 0);

        // --- Slots équipés (en haut) ---
        this.dessinerEquipement();

        // --- Grille de l'inventaire ---
        this.dessinerGrille();

        // --- Zone détail (à droite) ---
        this.zoneDetail = this.add.container(GAME_WIDTH - 280, 130);

        // --- Touches de fermeture (clavier MVP — sera doublé par bouton tactile plus tard) ---
        this.input.keyboard.on('keydown-I', () => this.fermer());
        this.input.keyboard.on('keydown-ESC', () => this.fermer());
        // Bouton de fermeture cliquable (mobile-friendly)
        const btnFermer = this.add.text(GAME_WIDTH - 30, 30, '✕', {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#e8e4d8'
        }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
        btnFermer.on('pointerdown', () => this.fermer());

        // Redessine la grille / l'équipement à chaque changement
        const handlerInv = () => { this.dessinerGrille(); this.dessinerEquipement(); };
        const handlerEquip = () => { this.dessinerGrille(); this.dessinerEquipement(); };
        this.registry.events.on(EVT_INV_CHANGE, handlerInv);
        this.registry.events.on(EVT_EQUIP_CHANGE, handlerEquip);
        this.events.once('shutdown', () => {
            this.registry.events.off(EVT_INV_CHANGE, handlerInv);
            this.registry.events.off(EVT_EQUIP_CHANGE, handlerEquip);
        });
    }

    fermer() {
        // On reset l'état des touches I et ESC : sinon Phaser garde JustDown=true
        // pour cette frame, et GameScene rouvrirait l'inventaire dès la reprise.
        const codes = Phaser.Input.Keyboard.KeyCodes;
        const keys = this.input.keyboard.keys;
        [codes.I, codes.ESC].forEach(c => keys[c]?.reset());

        this.scene.resume('GameScene');
        this.scene.stop();
    }

    // ----- Équipement -----
    dessinerEquipement() {
        if (this.contEquip) this.contEquip.destroy();
        this.contEquip = this.add.container(GAME_WIDTH / 2, 100);

        const labels = ['Tête', 'Corps', 'Accessoire'];
        const equip = this.inventaire.getEquipement();
        const espaceCase = TAILLE + 80; // espace entre les 3 slots équipés
        const xDebut = -espaceCase;

        for (let k = 0; k < 3; k++) {
            const slot = SLOTS[k];
            const id = equip[slot];
            const x = xDebut + k * espaceCase;

            this.contEquip.add(this.add.text(x, -28, labels[k], {
                fontFamily: 'monospace',
                fontSize: '11px',
                color: '#8a8a9a'
            }).setOrigin(0.5, 0));

            const cadre = this.add.rectangle(x, 0, TAILLE, TAILLE, 0x1f1f28)
                .setStrokeStyle(2, id ? 0xe8e4d8 : 0x4a4a5a)
                .setInteractive({ useHandCursor: !!id });
            this.contEquip.add(cadre);

            if (id && ITEMS[id]) {
                const item = ITEMS[id];
                this.contEquip.add(this.add.rectangle(x, 0, TAILLE - 8, TAILLE - 8, COULEURS_FAMILLE[item.famille]));
                if (item.tier === 3) {
                    this.contEquip.add(this.add.text(x + TAILLE / 2 - 4, -TAILLE / 2 + 2, '★', {
                        fontFamily: 'monospace',
                        fontSize: '10px',
                        color: '#ff6060'
                    }).setOrigin(1, 0));
                }
                cadre.on('pointerdown', () => this.afficherDetail(item, { equipe: true, slot }));
            } else {
                cadre.on('pointerdown', () => this.afficherTexteDetail('Slot vide.'));
            }
        }
    }

    // ----- Grille -----
    dessinerGrille() {
        if (this.contGrille) this.contGrille.destroy();
        this.contGrille = this.add.container(0, 0);

        const inv = this.inventaire.getInventaire();
        const totalLargeur = COLS * TAILLE + (COLS - 1) * ECART;
        const xDebut = (GAME_WIDTH - totalLargeur) / 2 - 140; // décalé à gauche pour laisser place au détail à droite
        const yDebut = 200;

        // Compteur en haut à gauche de la grille
        this.contGrille.add(this.add.text(xDebut, yDebut - 18, `${inv.length}/${CAPACITE_INVENTAIRE}`, {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#8a8a9a'
        }));

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const idx = r * COLS + c;
                const x = xDebut + c * (TAILLE + ECART) + TAILLE / 2;
                const y = yDebut + r * (TAILLE + ECART) + TAILLE / 2;

                const id = inv[idx];
                const cadre = this.add.rectangle(x, y, TAILLE, TAILLE, 0x1f1f28)
                    .setStrokeStyle(1, id ? 0x6a6a7a : 0x2a2a34)
                    .setInteractive({ useHandCursor: !!id });
                this.contGrille.add(cadre);

                if (id && ITEMS[id]) {
                    const item = ITEMS[id];
                    this.contGrille.add(
                        this.add.rectangle(x, y, TAILLE - 8, TAILLE - 8, COULEURS_FAMILLE[item.famille])
                    );
                    if (item.tier === 3) {
                        this.contGrille.add(this.add.text(x + TAILLE / 2 - 4, y - TAILLE / 2 + 2, '★', {
                            fontFamily: 'monospace',
                            fontSize: '10px',
                            color: '#ff6060'
                        }).setOrigin(1, 0));
                    }
                    cadre.on('pointerdown', () => this.afficherDetail(item, { equipe: false, indexInv: idx }));
                }
            }
        }
    }

    // ----- Détail / actions -----
    afficherTexteDetail(txt) {
        this.zoneDetail.removeAll(true);
        this.zoneDetail.add(this.add.text(0, 0, txt, {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#8a8a9a',
            wordWrap: { width: 240 }
        }));
    }

    afficherDetail(item, ctx) {
        this.zoneDetail.removeAll(true);

        const familleHex = COULEURS_FAMILLE[item.famille];
        const couleurCss = '#' + familleHex.toString(16).padStart(6, '0');

        // Nom + tier
        let titre = item.nom;
        if (item.tier === 3) titre += ' ★';
        this.zoneDetail.add(this.add.text(0, 0, titre, {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: couleurCss,
            fontStyle: 'bold',
            wordWrap: { width: 260 }
        }));

        // Slot + famille
        this.zoneDetail.add(this.add.text(0, 22, `${item.famille.toUpperCase()} • ${item.slot}`, {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#8a8a9a'
        }));

        // Description
        this.zoneDetail.add(this.add.text(0, 40, item.description, {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#e8e4d8',
            wordWrap: { width: 260 },
            fontStyle: 'italic'
        }));

        // Effets selon tier
        const yEff = 80;
        const effets = item.effets ?? [];
        let lignes = [];
        if (item.tier === 1) {
            lignes = effets.map(e => this.formatEffet(e));
        } else if (item.tier === 2) {
            for (const e of effets) {
                lignes.push(e.visible ? this.formatEffet(e) : '? — effet inconnu');
            }
        } else {
            lignes.push('Cet objet ne se laisse pas lire.');
        }
        this.zoneDetail.add(this.add.text(0, yEff, lignes.join('\n'), {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#c8c8d4',
            lineSpacing: 4
        }));

        // Boutons d'action
        const yBtn = yEff + lignes.length * 16 + 20;
        if (ctx.equipe) {
            this.bouton('Déséquiper', 0, yBtn, () => {
                if (this.inventaire.desequiper(ctx.slot)) {
                    this.afficherTexteDetail('Déséquipé.');
                } else {
                    this.afficherTexteDetail('Inventaire plein, impossible de déséquiper.');
                }
            });
        } else {
            this.bouton('Équiper', 0, yBtn, () => {
                this.inventaire.equiperDepuisInventaire(ctx.indexInv, item);
                this.afficherTexteDetail(`Équipé : ${item.nom}`);
            });
            this.bouton('Jeter', 110, yBtn, () => {
                this.inventaire.jeter(ctx.indexInv);
                this.afficherTexteDetail('Jeté.');
            });
        }
    }

    formatEffet(e) {
        const signe = e.delta >= 0 ? '+' : '';
        return `${signe}${e.delta} ${e.cible}`;
    }

    bouton(texte, x, y, onClick) {
        const fond = this.add.rectangle(x, y, 100, 24, 0x2a2a3a)
            .setOrigin(0, 0)
            .setStrokeStyle(1, 0x6a6a7a)
            .setInteractive({ useHandCursor: true });
        const txt = this.add.text(x + 50, y + 12, texte, {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#e8e4d8'
        }).setOrigin(0.5);
        fond.on('pointerover', () => fond.setFillStyle(0x4a4a5a));
        fond.on('pointerout', () => fond.setFillStyle(0x2a2a3a));
        fond.on('pointerdown', onClick);
        this.zoneDetail.add(fond);
        this.zoneDetail.add(txt);
    }
}
