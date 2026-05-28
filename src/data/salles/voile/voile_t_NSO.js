// Salle : Voile Inversé — Le Passage Ouest Déchiré (T NSO compact)
// (Phase 9.x — Migration Voile, fondation)
//
// INTENTION : verticale N/S + sortie latérale O. Zigzag ascendant côté droit,
// palier S à droite, footing bas-gauche pour l'accès O.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteN, porteS, porteO
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const voile_t_NSO = {
    id: 'voile_t_NSO',
    biome: 'voile_inverse',
    nom: 'Le Passage Ouest Déchiré (NSO)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'O'],
    archetypesCompatibles: ['hall', 'puits'],

    generer({ portesActives = ['N', 'S', 'O'] } = {}) {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Zigzag ascendant côté droit
        plateformes.push(plateforme(820, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(650, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(800, 290, 110, { oneWay: true }));
        plateformes.push(plateforme(620, 220, 130, { oneWay: true }));
        plateformes.push(plateforme(480, 130, 150, { oneWay: true })); // sous porte N

        // Palier S (côté droit)
        plateformes.push(plateforme(720, 440, 140, { oneWay: true }));

        // Palier bas gauche (footing accès O)
        plateformes.push(plateforme(200, 430, 110, { oneWay: true }));

        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(480, 40);
        if (portesActives.includes('S')) portes.S = porteS(720, 440);
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);

        return {
            plateformes, obstacles: [], zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
