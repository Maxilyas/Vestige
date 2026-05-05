// SolDecore — couche d'ornements posée par-dessus le sol uni.
// Présent : dalles fissurées + mousse pourpre + ronces + champignons
// Miroir  : pavé propre en motif + petites fleurs + lierre vert

import { DEPTH } from '../PainterlyRenderer.js';

/**
 * Décore le sol horizontal entre xDebut et xFin, à la hauteur yTopSol.
 * Ne crée pas de collision : c'est purement visuel.
 */
export function peindreSolDecore(scene, xDebut, xFin, yTopSol, monde, palette, rng) {
    const g = scene.add.graphics();
    g.setDepth(DEPTH.DECOR_MILIEU);

    const enMiroir = monde === 'miroir';
    const largeur = xFin - xDebut;

    // Dalles / pavé : alterner couleurs sur la largeur
    const tailleDalle = 32;
    const nbDalles = Math.floor(largeur / tailleDalle);
    for (let i = 0; i < nbDalles; i++) {
        const xD = xDebut + i * tailleDalle;
        const irreg = rng() * 4 - 2;

        if (!enMiroir) {
            // Dalles fissurées du Présent (couleur déphasée + fissures)
            const couleurDalle = (i % 2 === 0) ? palette.pierreSombre : palette.plateforme;
            g.fillStyle(couleurDalle, 0.45);
            g.fillRect(xD, yTopSol - 1, tailleDalle - 2, 4);
            // Fissure aléatoire
            if (rng() < 0.4) {
                g.lineStyle(1, palette.pierreSombre, 0.7);
                g.beginPath();
                g.moveTo(xD + 4 + irreg, yTopSol - 1);
                g.lineTo(xD + tailleDalle - 8 + irreg, yTopSol + 2);
                g.strokePath();
            }
        } else {
            // Pavé propre Miroir : motif régulier doré
            const couleurDalle = (i % 2 === 0) ? palette.pierre : palette.plateforme;
            g.fillStyle(couleurDalle, 0.6);
            g.fillRect(xD, yTopSol - 1, tailleDalle - 1, 3);
            if (i % 4 === 0) {
                g.fillStyle(palette.accent, 0.5);
                g.fillRect(xD + tailleDalle / 2 - 2, yTopSol - 1, 3, 2);
            }
        }
    }

    // Végétation rampante : touffes éparses
    const nbToufes = Math.floor(largeur / 60);
    for (let i = 0; i < nbToufes; i++) {
        if (rng() < 0.3) continue;
        const xT = xDebut + (i + rng()) * 60;
        const yT = yTopSol - 2;

        if (!enMiroir) {
            // Mousse pourpre + ronces
            g.fillStyle(palette.racine, 0.7);
            g.fillCircle(xT, yT, 4 + rng() * 3);
            g.fillCircle(xT - 3, yT + 1, 3);
            g.fillCircle(xT + 3, yT + 1, 3);
            // Petite ronce verticale
            g.lineStyle(1, palette.racine, 0.6);
            g.beginPath();
            g.moveTo(xT, yT - 2);
            g.lineTo(xT - 1, yT - 7);
            g.lineTo(xT + 2, yT - 11);
            g.strokePath();
        } else {
            // Petite fleur ou herbe verte
            g.fillStyle(palette.mousse, 0.85);
            g.fillCircle(xT, yT, 3);
            g.fillCircle(xT - 2, yT + 1, 2);
            // Fleur dorée
            if (rng() < 0.5) {
                g.fillStyle(palette.accent, 0.9);
                g.fillCircle(xT, yT - 4, 1.5);
                g.fillCircle(xT + 2, yT - 3, 1.2);
            }
        }
    }

    // Pierres / éclats dispersés (Présent surtout)
    if (!enMiroir) {
        const nbEclats = Math.floor(largeur / 80);
        for (let i = 0; i < nbEclats; i++) {
            const xE = xDebut + rng() * largeur;
            g.fillStyle(palette.pierre, 0.7);
            g.fillCircle(xE, yTopSol - 1, 2 + rng() * 2);
            g.fillStyle(palette.pierreSombre, 0.6);
            g.fillCircle(xE - 1, yTopSol, 1 + rng());
        }
    }

    return g;
}
