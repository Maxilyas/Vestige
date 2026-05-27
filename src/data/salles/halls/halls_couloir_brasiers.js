// Salle : Halls Cendrés — Couloir des Brasiers (OE compact)
// (Phase 9.6 — Migration Halls XL → compact 960×540)
//
// INTENTION : 3 brasiers cycliques décalés sur foyers surélevés → traversée
// timing. Paliers latéraux pour combat aérien.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    brasier
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_couloir_brasiers = {
    id: 'halls_couloir_brasiers',
    biome: 'halls_cendres',
    nom: 'Le Couloir des Brasiers',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'pont'],
    rolesAutorises: ['main', 'alt', 'entree'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // 3 foyers surélevés (cuvettes brasiers)
        plateformes.push(plateforme(240, Y_SOL - 20, 80));
        plateformes.push(plateforme(480, Y_SOL - 20, 80));
        plateformes.push(plateforme(720, Y_SOL - 20, 80));

        // Paliers latéraux safe
        plateformes.push(plateforme(120, 430, 100, { oneWay: true }));
        plateformes.push(plateforme(840, 430, 100, { oneWay: true }));

        // Paliers mid combat aérien
        plateformes.push(plateforme(330, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(630, 360, 110, { oneWay: true }));

        const obstacles = [
            brasier(240, Y_SOL - 20, { cycleMs: 2400, offsetMs: 0,    largeur: 70 }),
            brasier(480, Y_SOL - 20, { cycleMs: 2400, offsetMs: 800,  largeur: 70 }),
            brasier(720, Y_SOL - 20, { cycleMs: 2400, offsetMs: 1600, largeur: 70 })
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
