// Sceau — visuel d'un sceau d'étage (Phase 5a).
//
// 10 sceaux à collecter (1 par boss vaincu). Affichés dans le HUD en bandeau
// centré supérieur. État vide = silhouette discrète. État rempli = couleur
// du biome + symbole thématique. Le 10ᵉ (Souverain) a une surcouche
// couronne et un liseré cramoisi distinct.
//
// Usage : peindreSceau(scene, x, y, etage, biomeId, obtenu)
// Retourne un Container qui contient toute la primitive (utile pour les
// anims de scale au remplissage).

import { BIOMES, biomePourEtage } from '../../data/biomes.js';

const RAYON = 9;                 // diamètre 18 px
const COULEUR_VIDE_FOND = 0x14141c;
const COULEUR_VIDE_BORDURE = 0x3a3a48;
const COULEUR_VIDE_NUM = 0x5a5a68;
const COULEUR_LISERE_SOUVERAIN = 0xff4040;

/** Symbole thématique par biome, peint dans un graphics centré (0,0). */
function peindreSymbole(g, biomeId, rayon, couleurAccent) {
    const r = rayon * 0.55;
    g.lineStyle(1.5, couleurAccent, 1);
    g.fillStyle(couleurAccent, 1);

    if (biomeId === 'ruines_basses') {
        // Pierre brisée : triangle pointe en bas, ébréché à droite
        g.beginPath();
        g.moveTo(-r, -r * 0.6);
        g.lineTo(r, -r * 0.6);
        g.lineTo(r * 0.2, r);
        g.lineTo(-r * 0.5, r * 0.4);
        g.closePath();
        g.fillPath();
    } else if (biomeId === 'halls_cendres') {
        // Flamme stylisée : forme de goutte inversée avec petite pointe haute
        g.beginPath();
        g.moveTo(0, -r);
        g.lineTo(r * 0.7, 0);
        g.lineTo(r * 0.3, r * 0.7);
        g.lineTo(-r * 0.3, r * 0.7);
        g.lineTo(-r * 0.7, 0);
        g.closePath();
        g.fillPath();
        // Petit reflet clair
        g.fillStyle(0xfff0c0, 0.7);
        g.fillCircle(-r * 0.2, -r * 0.1, r * 0.18);
    } else if (biomeId === 'cristaux_glaces') {
        // Cristal : losange élancé
        g.beginPath();
        g.moveTo(0, -r);
        g.lineTo(r * 0.6, 0);
        g.lineTo(0, r);
        g.lineTo(-r * 0.6, 0);
        g.closePath();
        g.fillPath();
        // Arête centrale claire
        g.lineStyle(1, 0xffffff, 0.6);
        g.beginPath();
        g.moveTo(0, -r * 0.8);
        g.lineTo(0, r * 0.8);
        g.strokePath();
    } else if (biomeId === 'voile_inverse') {
        // Voile/croissant : arc de cercle
        g.beginPath();
        g.arc(0, 0, r, Math.PI * 0.2, Math.PI * 1.1, false);
        g.strokePath();
        g.lineStyle(2.5, couleurAccent, 1);
        g.beginPath();
        g.arc(r * 0.25, 0, r * 0.7, Math.PI * 0.3, Math.PI * 1.0, false);
        g.strokePath();
    } else if (biomeId === 'coeur_reflux') {
        // Œil du Reflux : cercle creux + pupille centrale
        g.lineStyle(1.5, couleurAccent, 1);
        g.strokeCircle(0, 0, r * 0.9);
        g.fillStyle(couleurAccent, 1);
        g.fillCircle(0, 0, r * 0.35);
    } else {
        // Fallback : petit disque
        g.fillCircle(0, 0, r * 0.5);
    }
}

/** Surcouche couronne sur le sceau du Souverain (étage 10). */
function peindreCouronne(g, rayon) {
    g.fillStyle(0xffd070, 1);
    g.lineStyle(1, 0x6a3010, 1);
    const y = -rayon - 2;
    g.beginPath();
    g.moveTo(-rayon * 0.7, y + 3);
    g.lineTo(-rayon * 0.45, y - 2);
    g.lineTo(-rayon * 0.2, y + 2);
    g.lineTo(0, y - 3);
    g.lineTo(rayon * 0.2, y + 2);
    g.lineTo(rayon * 0.45, y - 2);
    g.lineTo(rayon * 0.7, y + 3);
    g.lineTo(rayon * 0.7, y + 4);
    g.lineTo(-rayon * 0.7, y + 4);
    g.closePath();
    g.fillPath();
    g.strokePath();
}

/**
 * Peint un sceau à la position donnée.
 * @param {Phaser.Scene} scene
 * @param {number} x, y
 * @param {number} etage 1..10
 * @param {boolean} obtenu
 * @returns {Phaser.GameObjects.Container} contenant le visuel (centré).
 */
export function peindreSceau(scene, x, y, etage, obtenu) {
    const container = scene.add.container(x, y);
    const biome = biomePourEtage(etage);
    const estSouverain = (etage === 10);

    if (!obtenu) {
        // ─── État vide : disque discret + numéro étage ───
        const fond = scene.add.graphics();
        fond.fillStyle(COULEUR_VIDE_FOND, 1);
        fond.fillCircle(0, 0, RAYON);
        fond.lineStyle(1.2, COULEUR_VIDE_BORDURE, 1);
        fond.strokeCircle(0, 0, RAYON);
        container.add(fond);

        const num = scene.add.text(0, 0, `${etage}`, {
            fontFamily: 'monospace', fontSize: '10px',
            color: '#' + COULEUR_VIDE_NUM.toString(16).padStart(6, '0')
        }).setOrigin(0.5, 0.5);
        container.add(num);
        return container;
    }

    // ─── État rempli ───
    const couleurFond = biome.palette.ambiance;
    const couleurAccent = biome.palette.accent;
    const couleurLisere = estSouverain ? COULEUR_LISERE_SOUVERAIN : couleurAccent;

    // Disque rempli
    const fond = scene.add.graphics();
    fond.fillStyle(couleurFond, 1);
    fond.fillCircle(0, 0, RAYON);
    fond.lineStyle(estSouverain ? 2 : 1.5, couleurLisere, 1);
    fond.strokeCircle(0, 0, RAYON);
    container.add(fond);

    // Symbole biome au centre
    const symbole = scene.add.graphics();
    peindreSymbole(symbole, biome.id, RAYON, couleurAccent);
    container.add(symbole);

    // Couronne pour le Souverain
    if (estSouverain) {
        const couronne = scene.add.graphics();
        peindreCouronne(couronne, RAYON);
        container.add(couronne);
    }

    return container;
}

export const SCEAU_DIAMETRE = RAYON * 2;
