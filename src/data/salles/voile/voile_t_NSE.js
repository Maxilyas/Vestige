// Salle : Voile Inversé — Le Passage Est Déchiré (T NSE compact)
// (Phase 9.x — Migration Voile, fondation)
//
// INTENTION : verticale N/S + sortie latérale E. Miroir du Passage Ouest
// (zigzag déchiré côté gauche).

import {
    HAUTEUR_SOL, sol, plateforme,
    porteN, porteS, porteE
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const voile_t_NSE = {
    id: 'voile_t_NSE',
    biome: 'voile_inverse',
    nom: 'Le Passage Est Déchiré (NSE)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E'],
    archetypesCompatibles: ['hall', 'puits'],

    generer({ portesActives = ['N', 'S', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Zigzag ascendant côté gauche
        plateformes.push(plateforme(140, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(310, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(160, 290, 110, { oneWay: true }));
        plateformes.push(plateforme(340, 220, 130, { oneWay: true }));
        plateformes.push(plateforme(480, 130, 150, { oneWay: true })); // sous porte N

        // Palier S (côté gauche)
        plateformes.push(plateforme(240, 440, 140, { oneWay: true }));

        // Palier bas droit (footing accès E)
        plateformes.push(plateforme(760, 430, 110, { oneWay: true }));

        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(480, 40);
        if (portesActives.includes('S')) portes.S = porteS(240, 440);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes, obstacles: [], zones: [], portes,
            spawnDefault: { x: W - 80, y: Y_SOL - 20 }
        };
    }
};
