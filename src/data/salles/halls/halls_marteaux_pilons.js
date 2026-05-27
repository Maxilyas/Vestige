// Salle : Halls Cendrés — Les Marteaux-Pilons (OE compact, signature)
// (Phase 9.8 — Toolkit medium-cost)
//
// SIGNATURE : 3 marteaux-pilons décalés au sol. Timing strict pour passer
// entre les chutes. Paliers hauts safe pour combat aérien.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    marteauPilon
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_marteaux_pilons = {
    id: 'halls_marteaux_pilons',
    biome: 'halls_cendres',
    nom: 'Les Marteaux-Pilons',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'pont'],
    rolesAutorises: ['main', 'alt'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Paliers latéraux safe (route haute pour éviter les marteaux)
        plateformes.push(plateforme(140, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(820, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(330, 350, 110, { oneWay: true }));
        plateformes.push(plateforme(630, 350, 110, { oneWay: true }));
        plateformes.push(plateforme(480, 270, 160, { oneWay: true }));

        const obstacles = [
            // 3 marteaux-pilons : impact sur le sol (yTopImpact = Y_SOL - 80 = 420)
            // décalages temporels pour créer des fenêtres de passage alternées
            marteauPilon(250, 50, 420, { cycleMs: 2700, offsetMs: 0 }),
            marteauPilon(480, 50, 420, { cycleMs: 2700, offsetMs: 900 }),
            marteauPilon(710, 50, 420, { cycleMs: 2700, offsetMs: 1800 })
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
