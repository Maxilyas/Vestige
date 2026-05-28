// Salle : Voile Inversé — La Faille Oblique (coin SE compact)
// (Phase 9.x — Migration Voile, fondation)
//
// INTENTION : carrefour bas reliant E (sol) et S (descente). Montée latérale
// gauche vers un coffre votif accroché à la paroi déchirée.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteS, porteE
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const voile_coin_SE = {
    id: 'voile_coin_SE',
    biome: 'voile_inverse',
    nom: 'La Faille Oblique (SE)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['S', 'E'],
    archetypesCompatibles: ['crypte', 'hall'],

    generer({ portesActives = ['S', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Palier S surélevé (porte S dessus)
        plateformes.push(plateforme(480, 440, 140, { oneWay: true }));

        // Montée vers coffre votif (côté gauche)
        plateformes.push(plateforme(200, 410, 120, { oneWay: true }));
        plateformes.push(plateforme(380, 340, 130, { oneWay: true }));
        plateformes.push(plateforme(560, 290, 140, { oneWay: true }));

        const portes = {};
        if (portesActives.includes('S')) portes.S = porteS(480, 440);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        const coffreForce = { x: 560, y: 290 - 12 };

        return {
            plateformes, obstacles: [], zones: [], portes,
            spawnDefault: { x: W - 80, y: Y_SOL - 20 },
            coffreForce
        };
    }
};
