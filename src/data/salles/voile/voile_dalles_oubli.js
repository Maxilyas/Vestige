// Salle : Voile Inversé — Les Dalles de l'Oubli (OE compact)
// (Phase 9.x — Migration Voile, fondation — mix vide + écho)
//
// INTENTION : transit signature du biome en miniature. Un gouffre de Présent
// pur coupe le sol. On le franchit par deux vraies dalles — mais une fausse
// dalle-écho (intangible, ondulation) est intercalée : il faut LIRE avant de
// sauter. Route haute sûre en contournement.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    fauxSolMiroir
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const voile_dalles_oubli = {
    id: 'voile_dalles_oubli',
    biome: 'voile_inverse',
    nom: 'Les Dalles de l\'Oubli',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['pont', 'hall'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));

        // Sol coupé : gouffre mortel central (320 → 640)
        plateformes.push(sol(0, 320, Y_SOL));
        plateformes.push(sol(640, W, Y_SOL));

        // VRAIES dalles de traversée (marbre déchiré)
        plateformes.push(plateforme(380, 440, 90, { oneWay: true }));
        plateformes.push(plateforme(560, 440, 90, { oneWay: true }));

        // Route HAUTE sûre (contournement)
        plateformes.push(plateforme(480, 350, 170, { oneWay: true }));

        const obstacles = [
            // FAUX sol-écho intercalé entre les vraies dalles (piège de lecture)
            fauxSolMiroir(470, 440, 80)
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
