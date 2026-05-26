// Salle : Ruines basses — Passage Triple Est NSE (T-shape compact)
// (Phase 9.3c)
// INTENTION : "verticale N/S + sortie latérale E". Miroir de NSO.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteN, porteS, porteE
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const ruines_t_NSE_compact = {
    id: 'ruines_t_NSE_compact',
    biome: 'ruines_basses',
    nom: 'Passage Triple Est (NSE)',
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

        // Palier sommet sous porte N
        plateformes.push(plateforme(480, 130, 150, { oneWay: true }));

        // Palier S (côté gauche)
        plateformes.push(plateforme(240, 440, 140, { oneWay: true }));

        // Palier mid-droit (atteignable sol+70)
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
