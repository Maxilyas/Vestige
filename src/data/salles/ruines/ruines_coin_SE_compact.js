// Salle : Ruines basses — Descente Oubliée SE (coin SE compact)
// (Phase 9.3c)
// INTENTION : "descente vers le bas droite" — entrée par O ou par S, sortie E.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteS, porteE
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const ruines_coin_SE_compact = {
    id: 'ruines_coin_SE_compact',
    biome: 'ruines_basses',
    nom: 'Descente Oubliée (SE)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['S', 'E'],
    archetypesCompatibles: ['crypte', 'hall'],

    generer({ portesActives = ['S', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Palier S surélevé bas (porte S dessus, position visuelle = direction sud)
        plateformes.push(plateforme(480, 440, 140, { oneWay: true }));

        // Paliers latéraux combat aérien
        plateformes.push(plateforme(150, 430, 130, { oneWay: true }));
        plateformes.push(plateforme(820, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(330, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(680, 320, 110, { oneWay: true }));

        // Passerelle centrale (combat aérien)
        plateformes.push(plateforme(480, 290, 180, { oneWay: true }));

        // Palier haut décoratif + coffre
        plateformes.push(plateforme(220, 200, 110, { oneWay: true }));

        const portes = {};
        if (portesActives.includes('S')) portes.S = porteS(480, 440);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        const coffreForce = { x: 220, y: 200 - 12 };

        return {
            plateformes, obstacles: [], zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 },
            coffreForce
        };
    }
};
