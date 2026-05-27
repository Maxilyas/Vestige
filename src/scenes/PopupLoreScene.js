// Scène overlay — Popup de lore d'un monolithe Vestige.
//
// Lancée depuis GameScene quand le joueur interagit avec une zone
// vestige_lore (touche E). GameScene appelle scene.pause() puis launch
// avec { loreId, premiereLecture }. La popup affiche le texte ; à la
// fermeture (E ou ESC), elle stoppe et reprend GameScene.
//
// Visuel : fond noir semi-opaque + cadre central style "tablette de pierre
// gravée". Si premiereLecture, footer "Fragment Noir +1" en or terni.
//
// Pattern aligné sur InventaireScene/MapScene (scene pause + resume).

import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { loreParId } from '../data/lore_textes.js';

const COULEUR_FOND_OVERLAY  = 0x05060a;
const COULEUR_CADRE_BORD    = 0x2a2820;
const COULEUR_CADRE_FOND    = 0x141612;
const COULEUR_CADRE_LISERE  = 0x4a3e2a;
const COULEUR_TITRE         = 0xc8a85a;   // or terni (accent biome Ruines)
const COULEUR_TEXTE         = 0xd8d4c8;   // parchemin clair
const COULEUR_FOOTER        = 0x807870;
const COULEUR_BONUS_NOIR    = 0xb04060;   // rouge sombre Reflux pour Fragment Noir

const W_CADRE = 580;
const H_CADRE = 320;

export class PopupLoreScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PopupLoreScene' });
    }

    init(data) {
        this.loreId = data?.loreId ?? null;
        this.premiereLecture = !!data?.premiereLecture;
    }

    create() {
        const lore = loreParId(this.loreId);
        if (!lore) {
            // Lore introuvable : on ferme tout de suite (sécurité)
            this.fermer();
            return;
        }

        // --- Overlay plein écran semi-opaque (assombrit le jeu derrière) ---
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT,
            COULEUR_FOND_OVERLAY, 0.78);

        // --- Cadre central type "tablette de pierre" ---
        const cx = GAME_WIDTH / 2;
        const cy = GAME_HEIGHT / 2;
        this._dessinerCadre(cx, cy);

        // --- Titre (en haut du cadre) ---
        this.add.text(cx, cy - H_CADRE / 2 + 38, lore.titre, {
            fontFamily: 'serif',
            fontSize: '20px',
            fontStyle: 'italic',
            color: this._hex(COULEUR_TITRE),
            align: 'center'
        }).setOrigin(0.5);

        // Trait séparateur sous le titre
        const sep = this.add.graphics();
        sep.lineStyle(1, COULEUR_CADRE_LISERE, 0.7);
        sep.lineBetween(cx - W_CADRE / 2 + 60, cy - H_CADRE / 2 + 64,
                        cx + W_CADRE / 2 - 60, cy - H_CADRE / 2 + 64);

        // --- Corps : lignes empilées ---
        const yTexteDebut = cy - H_CADRE / 2 + 100;
        const interligne = 32;
        lore.lignes.forEach((ligne, idx) => {
            this.add.text(cx, yTexteDebut + idx * interligne, ligne, {
                fontFamily: 'serif',
                fontSize: '15px',
                color: this._hex(COULEUR_TEXTE),
                align: 'center',
                wordWrap: { width: W_CADRE - 60 }
            }).setOrigin(0.5);
        });

        // --- Bonus 1ère lecture (en bas, au-dessus du footer) ---
        if (this.premiereLecture) {
            this.add.text(cx, cy + H_CADRE / 2 - 60, '◆  Fragment Noir +1  ◆', {
                fontFamily: 'serif',
                fontSize: '14px',
                fontStyle: 'italic',
                color: this._hex(COULEUR_BONUS_NOIR)
            }).setOrigin(0.5);
        }

        // --- Footer touche fermeture ---
        this.add.text(cx, cy + H_CADRE / 2 - 28, '[ E ]  ou  [ ESC ]  pour fermer', {
            fontFamily: 'serif',
            fontSize: '12px',
            color: this._hex(COULEUR_FOOTER)
        }).setOrigin(0.5);

        // --- Inputs de fermeture ---
        this.input.keyboard.on('keydown-E',   () => this.fermer());
        this.input.keyboard.on('keydown-ESC', () => this.fermer());
    }

    fermer() {
        // Reset des touches E/ESC pour éviter une réouverture immédiate
        // (le E qui ferme la popup ne doit pas être relu par GameScene)
        const codes = Phaser.Input.Keyboard.KeyCodes;
        const keys = this.input.keyboard.keys;
        [codes.E, codes.ESC].forEach(c => keys[c]?.reset());
        this.scene.resume('GameScene');
        this.scene.stop();
    }

    _dessinerCadre(cx, cy) {
        const g = this.add.graphics();
        // Ombre portée
        g.fillStyle(0x000000, 0.5);
        g.fillRoundedRect(cx - W_CADRE / 2 + 4, cy - H_CADRE / 2 + 4, W_CADRE, H_CADRE, 8);
        // Bordure extérieure
        g.fillStyle(COULEUR_CADRE_BORD, 1);
        g.fillRoundedRect(cx - W_CADRE / 2, cy - H_CADRE / 2, W_CADRE, H_CADRE, 8);
        // Fond intérieur
        g.fillStyle(COULEUR_CADRE_FOND, 1);
        g.fillRoundedRect(cx - W_CADRE / 2 + 6, cy - H_CADRE / 2 + 6,
                          W_CADRE - 12, H_CADRE - 12, 6);
        // Liseré or terni intérieur
        g.lineStyle(1, COULEUR_CADRE_LISERE, 0.6);
        g.strokeRoundedRect(cx - W_CADRE / 2 + 12, cy - H_CADRE / 2 + 12,
                            W_CADRE - 24, H_CADRE - 24, 4);
    }

    _hex(c) {
        return '#' + c.toString(16).padStart(6, '0');
    }
}
