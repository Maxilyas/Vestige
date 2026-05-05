// PlateformeStyle — ornements visuels par-dessus les plateformes physiques.
//
// La plateforme physique reste un Phaser.Rectangle (pour la collision arcade).
// Au-dessus, on dessine un Graphics qui apporte la patine peinte :
//   - Présent : pierre cassée, fissures dessinées, mousse aux bords
//   - Miroir  : pavés ornés avec chasse-pieds doré, motifs de joints

import { DEPTH } from './PainterlyRenderer.js';

/**
 * Pose un ornement visuel par-dessus une plateforme. La plateforme physique
 * (Rectangle dans GameScene) reste tel quel pour la collision.
 *
 * @param {Phaser.Scene} scene
 * @param {number} x, y      centre de la plateforme physique
 * @param {number} largeur, hauteur dimensions de la plateforme
 * @param {string} monde
 * @param {Object} palette
 * @param {boolean} oneWay   true si plateforme one-way (corniche)
 * @param {boolean} estSol   true si c'est le sol principal (gros bandeau horizontal)
 */
export function peindreOrnementPlateforme(scene, x, y, largeur, hauteur, monde, palette, oneWay, estSol) {
    const g = scene.add.graphics();
    g.setDepth(DEPTH.PLATEFORMES + 1);

    const xG = x - largeur / 2;
    const yT = y - hauteur / 2;
    const yB = y + hauteur / 2;
    const enMiroir = monde === 'miroir';

    if (!enMiroir) {
        // === PRÉSENT — pierre cassée ===

        // Bandeau supérieur ombré (créve l'illusion de plat)
        g.fillStyle(palette.pierreSombre, 0.35);
        g.fillRect(xG, yT, largeur, 2);

        // Fissures verticales aléatoires (PAS dans le sol pour ne pas le rendre trop chargé)
        if (!estSol) {
            const nbFissures = Math.max(1, Math.floor(largeur / 50));
            g.lineStyle(1, palette.pierreSombre, 0.55);
            for (let i = 0; i < nbFissures; i++) {
                const xF = xG + ((i + 0.5) / nbFissures) * largeur + (Math.random() - 0.5) * 8;
                g.beginPath();
                g.moveTo(xF, yT + 1);
                g.lineTo(xF + (Math.random() - 0.5) * 6, yB - 1);
                g.strokePath();
            }
        }

        // Bordure érodée (encoches irrégulières en haut)
        g.fillStyle(palette.pierreSombre, 0.7);
        const nbEncoches = Math.max(2, Math.floor(largeur / 30));
        for (let i = 0; i < nbEncoches; i++) {
            if (Math.random() < 0.4) {
                const xE = xG + ((i + 0.5) / nbEncoches) * largeur;
                g.fillRect(xE - 2, yT - 1, 4, 2);
            }
        }

        // Mousse aux extrémités (Présent : pourpre fanée)
        g.fillStyle(palette.racine, 0.55);
        g.fillCircle(xG + 4, yT + 2, 3);
        g.fillCircle(xG + largeur - 4, yT + 2, 3);

        // Quelques brindilles/herbes Présent (au sol uniquement, sinon trop chargé)
        if (estSol) {
            const nbHerbes = Math.floor(largeur / 80);
            g.lineStyle(1, palette.racine, 0.5);
            for (let i = 0; i < nbHerbes; i++) {
                const xH = xG + Math.random() * largeur;
                g.beginPath();
                g.moveTo(xH, yT);
                g.lineTo(xH - 1, yT - 4);
                g.lineTo(xH + 2, yT - 7);
                g.strokePath();
            }
        }
    } else {
        // === MIROIR — pavés ornés ===

        // Chasse-pieds doré en haut (signature Miroir, détail brillant)
        g.fillStyle(palette.accent, 0.85);
        g.fillRect(xG, yT, largeur, 2);
        g.fillStyle(palette.flamme, 0.4);
        g.fillRect(xG, yT, largeur, 1); // highlight encore plus clair

        // Joints verticaux entre pavés
        g.lineStyle(1, palette.pierreSombre, 0.45);
        const nbJoints = Math.max(1, Math.floor(largeur / 32));
        for (let i = 1; i < nbJoints; i++) {
            const xJ = xG + (i / nbJoints) * largeur;
            g.beginPath();
            g.moveTo(xJ, yT + 2);
            g.lineTo(xJ, yB);
            g.strokePath();
        }

        // Motif central doré sur le sol uniquement (frise)
        if (estSol) {
            const nbMotifs = Math.floor(largeur / 60);
            for (let i = 0; i < nbMotifs; i++) {
                const xM = xG + ((i + 0.5) / nbMotifs) * largeur;
                g.fillStyle(palette.accent, 0.6);
                g.fillRect(xM - 2, yT + 6, 4, 2);
                g.fillStyle(palette.flamme, 0.5);
                g.fillRect(xM - 1, yT + 6, 2, 2);
            }
        }

        // Petites fleurs/herbes vertes aux extrémités du sol
        if (estSol) {
            g.fillStyle(palette.mousse, 0.7);
            g.fillCircle(xG + 4, yT - 1, 2);
            g.fillCircle(xG + largeur - 4, yT - 1, 2);
        }
    }

    return g;
}
