// BarreGarde — barre de Garde Phase 6 affichée SOUS la Résonance.
//
// Visuel : barre fine (5 px) bleu vif, sans label (pour ne pas alourdir le HUD).
// Valeur numérique discrète à droite. Cachée si garde_max = 0.

import { EVT_GARDE_CHANGE } from '../../systems/GardeSystem.js';

const COULEUR_FOND = 0x0a1018;
const COULEUR_BARRE = 0x60a0e8;
const COULEUR_BORD = 0x3a5a7a;
const COULEUR_TEXTE = '#60a0e8';

/**
 * Crée la barre Garde dans la scène, à la position (x, y), de largeur donnée.
 * Renvoie une référence pour cleanup.
 */
export function poserBarreGarde(scene, x, y, largeur) {
    const hauteur = 5; // barre fine

    // Pas de label texte — la couleur bleue suffit à identifier la barre.
    // Valeur compacte SOUS la barre, alignée à droite, pour ne pas chevaucher
    // la barre Résonance située au-dessus.
    const valeurTxt = scene.add.text(x + largeur, y + hauteur + 2, '', {
        fontFamily: 'monospace', fontSize: '8px', color: COULEUR_TEXTE
    }).setOrigin(1, 0);
    // Réfs label pour le cleanup ; ici label = juste un placeholder vide.
    const label = { setVisible: () => {} };

    const fond = scene.add.rectangle(x, y, largeur, hauteur, COULEUR_FOND)
        .setOrigin(0, 0)
        .setStrokeStyle(1, COULEUR_BORD);
    const barre = scene.add.rectangle(x, y, 0, hauteur, COULEUR_BARRE)
        .setOrigin(0, 0)
        .setBlendMode(Phaser.BlendModes.NORMAL);

    function update(val, max) {
        const visible = max > 0;
        label.setVisible(visible);
        valeurTxt.setVisible(visible);
        fond.setVisible(visible);
        barre.setVisible(visible);
        if (!visible) return;
        const ratio = Phaser.Math.Clamp(val / max, 0, 1);
        barre.width = largeur * ratio;
        valeurTxt.setText(`${Math.round(val)} / ${max}`);
    }

    // État initial
    update(scene.registry.get('garde_actuelle') ?? 0, scene.registry.get('garde_max') ?? 0);

    const handler = (val, max) => update(val, max);
    scene.registry.events.on(EVT_GARDE_CHANGE, handler);
    scene.events.once('shutdown', () => scene.registry.events.off(EVT_GARDE_CHANGE, handler));

    return { label, valeurTxt, fond, barre, update };
}
