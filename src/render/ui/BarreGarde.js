// BarreGarde — barre de Garde Phase 6 affichée au-dessus de la Résonance.
//
// Visuel : barre fine (8 px) ivoire-bleuté, séparée par un liseré du HUD
// principal. Cachée si garde_max = 0 (aucun item équipé n'octroie de Garde).

import { EVT_GARDE_CHANGE } from '../../systems/GardeSystem.js';

const COULEUR_FOND = 0x101018;
const COULEUR_BARRE = 0xc8d8e8;
const COULEUR_BORD = 0x4a5a6a;
const COULEUR_TEXTE = '#c8d8e8';

/**
 * Crée la barre Garde dans la scène, à la position (x, y), de largeur donnée.
 * Renvoie une référence pour cleanup.
 */
export function poserBarreGarde(scene, x, y, largeur) {
    const hauteur = 8;

    // Label compact à gauche, valeur à droite
    const label = scene.add.text(x, y - 14, 'GARDE', {
        fontFamily: 'monospace', fontSize: '9px', color: '#7a8a9a'
    });
    const valeurTxt = scene.add.text(x + largeur, y - 14, '', {
        fontFamily: 'monospace', fontSize: '9px', color: COULEUR_TEXTE
    }).setOrigin(1, 0);

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
