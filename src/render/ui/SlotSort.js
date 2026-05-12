// SlotSort — emplacement HUD pour un sort équipé (touche 1/2/3).
//
// Affiche : un cadre, un emblème (couleur famille de l'item), un cooldown
// radial sombre tournant qui se vide à mesure que le cooldown s'écoule.
// L'emblème est gris si :
//   - le slot est vide
//   - l'item équipé n'a pas de sort
//   - le sort n'est pas révélé (Identifieur requis pour le savoir)
//
// Numéroté en bas (1/2/3) pour l'apprentissage.

import { COULEURS_FAMILLE } from '../../data/items.js';
import { estInstance, couleurPourScore } from '../../systems/ScoreSystem.js';
import { getSort } from '../../data/sorts.js';

const TAILLE = 32;

export function poserSlotSort(scene, x, y, numero) {
    const cont = scene.add.container(x, y);

    // Fond
    const fond = scene.add.graphics();
    fond.fillStyle(0x080604, 1);
    fond.fillRect(-TAILLE / 2, -TAILLE / 2, TAILLE, TAILLE);
    fond.lineStyle(1, 0x4a4a5a, 0.9);
    fond.strokeRect(-TAILLE / 2, -TAILLE / 2, TAILLE, TAILLE);
    cont.add(fond);

    // Emblème dynamique
    const emblem = scene.add.graphics();
    cont.add(emblem);

    // Cooldown radial — sombre, tourne en sens horaire
    const cdMask = scene.add.graphics();
    cdMask.setBlendMode(Phaser.BlendModes.MULTIPLY);
    cont.add(cdMask);

    // Numéro de touche en bas-droite
    const num = scene.add.text(TAILLE / 2 - 3, TAILLE / 2 - 3, String(numero), {
        fontFamily: 'monospace', fontSize: '9px',
        color: '#c8a85a', fontStyle: 'bold',
        stroke: '#000', strokeThickness: 2
    }).setOrigin(1, 1);
    cont.add(num);

    // Hint cooldown numérique au-dessus
    const cdTxt = scene.add.text(0, -2, '', {
        fontFamily: 'monospace', fontSize: '10px',
        color: '#ffd070', fontStyle: 'bold',
        stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5, 0.5);
    cont.add(cdTxt);

    function dessinerEmblem(entry) {
        emblem.clear();
        const inst = estInstance(entry) ? entry : null;
        if (!inst || !inst.sortId) {
            // Slot vide / pas de sort → losange gris (placeholder)
            emblem.fillStyle(0x3a3a48, 1);
            emblem.fillCircle(0, 0, TAILLE * 0.25);
            return;
        }
        // Couleur basée sur score
        const c = couleurPourScore(inst.score);
        emblem.fillStyle(c, 0.92);
        // Forme : losange (sort)
        const r = TAILLE * 0.28;
        emblem.beginPath();
        emblem.moveTo(0, -r);
        emblem.lineTo(r, 0);
        emblem.lineTo(0, r);
        emblem.lineTo(-r, 0);
        emblem.closePath();
        emblem.fillPath();
        // Petite étincelle
        emblem.fillStyle(0xffffff, 0.7);
        emblem.fillCircle(-1, -1, 1.5);
    }

    function tickCooldown(cdRestantMs, cdTotalMs) {
        cdMask.clear();
        cdTxt.setText('');
        if (cdRestantMs <= 0 || cdTotalMs <= 0) return;
        const ratio = Phaser.Math.Clamp(cdRestantMs / cdTotalMs, 0, 1);
        // Disque sombre dont l'arc proportionnel au ratio est dessiné
        cdMask.fillStyle(0x000000, 0.55);
        cdMask.beginPath();
        cdMask.moveTo(0, 0);
        const start = -Math.PI / 2; // 12h
        const end = start + ratio * Math.PI * 2;
        cdMask.arc(0, 0, TAILLE * 0.55, start, end);
        cdMask.closePath();
        cdMask.fillPath();
        const sec = (cdRestantMs / 1000).toFixed(1);
        cdTxt.setText(sec);
    }

    function refresh(entry, cdRestantMs = 0, cdTotalMs = 0) {
        dessinerEmblem(entry);
        tickCooldown(cdRestantMs, cdTotalMs);
    }

    dessinerEmblem(null);

    return { container: cont, refresh, tickCooldown };
}
