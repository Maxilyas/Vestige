// Salle : Ruines basses — Passage Triple Ouest NSO (T-shape compact)
// (Phase 9.3c)
// INTENTION : "verticale N/S + sortie latérale O" — combine puits + couloir.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteN, porteS, porteO
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const ruines_t_NSO_compact = {
    id: 'ruines_t_NSO_compact',
    biome: 'ruines_basses',
    nom: 'Passage Triple Ouest (NSO)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'O'],
    archetypesCompatibles: ['hall', 'puits'],

    generer({ portesActives = ['N', 'S', 'O'] } = {}) {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Zigzag ascendant côté droit (loin de la porte O, force traversée)
        plateformes.push(plateforme(820, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(650, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(800, 290, 110, { oneWay: true }));
        plateformes.push(plateforme(620, 220, 130, { oneWay: true }));

        // Palier sommet sous porte N (centré)
        plateformes.push(plateforme(480, 130, 150, { oneWay: true }));

        // Palier S surélevé (côté droit pour ne pas bloquer la trajectoire O)
        plateformes.push(plateforme(720, 440, 140, { oneWay: true }));

        // Palier mid-gauche pour combat aérien proche porte O (atteignable sol+70)
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
