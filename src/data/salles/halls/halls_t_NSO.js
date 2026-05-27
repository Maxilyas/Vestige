// Salle : Halls Cendrés — Passage Triple Ouest (NSO compact)
// (Phase 9.6 — Migration)
//
// INTENTION : verticale N/S + sortie latérale O. Escalier vertical droit.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteN, porteS, porteO,
    brasier
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_t_NSO = {
    id: 'halls_t_NSO',
    biome: 'halls_cendres',
    nom: 'Passage Triple Ouest',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'O'],
    archetypesCompatibles: ['hall', 'puits'],

    generer({ portesActives = ['N', 'S', 'O'] } = {}) {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Escalier ascendant droit (force traversée)
        plateformes.push(plateforme(820, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(640, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(800, 290, 110, { oneWay: true }));   // foyer brasier
        plateformes.push(plateforme(620, 220, 130, { oneWay: true }));
        plateformes.push(plateforme(480, 130, 150, { oneWay: true }));

        // Palier S surélevé droit
        plateformes.push(plateforme(720, 440, 140, { oneWay: true }));

        // Palier mid-gauche
        plateformes.push(plateforme(200, 430, 110, { oneWay: true }));

        const obstacles = [
            brasier(800, 290, { cycleMs: 2600, offsetMs: 0, largeur: 100 })
        ];

        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(480, 40);
        if (portesActives.includes('S')) portes.S = porteS(720, 440);
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
