// HUD — scène parallèle qui dessine la jauge de Résonance.
//
// Elle ne contient AUCUNE logique de gameplay : elle écoute les changements
// du registry et redessine, c'est tout. Elle est lancée en parallèle de
// GameScene et survit aux `scene.restart()` des transitions de salle.

import { GAME_WIDTH } from '../config.js';
import { RESONANCE_CLE, RESONANCE_MAX } from '../systems/ResonanceSystem.js';

const LARGEUR_BARRE = 200;
const HAUTEUR_BARRE = 14;
const MARGE = 16;

export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        const x = GAME_WIDTH - LARGEUR_BARRE - MARGE;
        const y = MARGE;

        // Libellé au-dessus de la barre
        this.add.text(x, y - 14, 'RÉSONANCE', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#8a8a9a'
        });

        // Texte "NN%" aligné à droite, sur la même ligne que le libellé
        // (origin 1,0 = ancre top-right, le texte s'étend vers la gauche)
        this.texte = this.add.text(x + LARGEUR_BARRE, y - 14, '', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#e8e4d8'
        }).setOrigin(1, 0);

        // Cadre + fond sombre
        this.fond = this.add.rectangle(x, y, LARGEUR_BARRE, HAUTEUR_BARRE, 0x1f1f28)
            .setOrigin(0, 0)
            .setStrokeStyle(1, 0x4a4a5a);

        // Remplissage (largeur dynamique)
        this.barre = this.add.rectangle(x, y, LARGEUR_BARRE, HAUTEUR_BARRE, 0xe8e4d8)
            .setOrigin(0, 0);

        // Affichage initial
        this.miseAJour(this.registry.get(RESONANCE_CLE) ?? RESONANCE_MAX);

        // S'abonner aux changements du registry. Le handler reçoit (parent, valeur, valeurPrecedente).
        const handler = (_parent, valeur) => this.miseAJour(valeur);
        this.registry.events.on(`changedata-${RESONANCE_CLE}`, handler);

        // Nettoyage si la scène est arrêtée un jour (pas le cas pour l'instant,
        // mais évite une fuite si on appelle scene.stop('UIScene') plus tard)
        this.events.once('shutdown', () => {
            this.registry.events.off(`changedata-${RESONANCE_CLE}`, handler);
        });
    }

    miseAJour(valeur) {
        const ratio = Phaser.Math.Clamp(valeur / RESONANCE_MAX, 0, 1);
        this.barre.width = LARGEUR_BARRE * ratio;
        this.texte.setText(`${Math.round(valeur)}%`);
    }
}
