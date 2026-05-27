// Salle : Halls Cendrés — Passage Triple Est (NSE compact)
// (Phase 9.6 — Migration)
//
// INTENTION : miroir de NSO, escalier ascendant côté gauche.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteN, porteS, porteE,
    brasier
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_t_NSE = {
    id: 'halls_t_NSE',
    biome: 'halls_cendres',
    nom: 'Passage Triple Est',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E'],
    archetypesCompatibles: ['hall', 'puits'],

    generer({ portesActives = ['N', 'S', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Escalier ascendant gauche
        plateformes.push(plateforme(140, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(320, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(160, 290, 110, { oneWay: true }));   // foyer brasier
        plateformes.push(plateforme(340, 220, 130, { oneWay: true }));
        plateformes.push(plateforme(480, 130, 150, { oneWay: true }));

        // Palier S gauche
        plateformes.push(plateforme(240, 440, 140, { oneWay: true }));

        // Palier mid-droit
        plateformes.push(plateforme(760, 430, 110, { oneWay: true }));

        const obstacles = [
            brasier(160, 290, { cycleMs: 2600, offsetMs: 0, largeur: 100 })
        ];

        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(480, 40);
        if (portesActives.includes('S')) portes.S = porteS(240, 440);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: W - 80, y: Y_SOL - 20 }
        };
    }
};
