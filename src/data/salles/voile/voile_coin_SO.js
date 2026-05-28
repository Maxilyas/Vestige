// Salle : Voile Inversé — La Crypte Renversée (coin SO compact)
// (Phase 9.x — Migration Voile, fondation)
//
// INTENTION : carrefour bas reliant O (sol) et S (descente). Miroir de la
// Faille Oblique (coffre votif côté droit).

import {
    HAUTEUR_SOL, sol, plateforme,
    porteS, porteO
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const voile_coin_SO = {
    id: 'voile_coin_SO',
    biome: 'voile_inverse',
    nom: 'La Crypte Renversée (SO)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['S', 'O'],
    archetypesCompatibles: ['crypte', 'hall'],

    generer({ portesActives = ['S', 'O'] } = {}) {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Palier S surélevé (porte S dessus)
        plateformes.push(plateforme(480, 440, 140, { oneWay: true }));

        // Montée vers coffre votif (côté droit)
        plateformes.push(plateforme(760, 410, 120, { oneWay: true }));
        plateformes.push(plateforme(580, 340, 130, { oneWay: true }));
        plateformes.push(plateforme(400, 290, 140, { oneWay: true }));

        const portes = {};
        if (portesActives.includes('S')) portes.S = porteS(480, 440);
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);

        const coffreForce = { x: 400, y: 290 - 12 };

        return {
            plateformes, obstacles: [], zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 },
            coffreForce
        };
    }
};
