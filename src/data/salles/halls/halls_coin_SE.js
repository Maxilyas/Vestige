// Salle : Halls Cendrés — Coin SE (descente de forge)
// (Phase 9.6 — Migration)
//
// INTENTION : descente droite. Plaque de pression active des pieux dans le
// couloir descendant (timing requis).

import {
    HAUTEUR_SOL, sol, plateforme,
    porteS, porteE,
    plaque, brasier, pieuSol
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_coin_SE = {
    id: 'halls_coin_SE',
    biome: 'halls_cendres',
    nom: 'Descente de Forge (SE)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['E', 'S'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['E', 'S'] } = {}) {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Foyer haut + brasier majeur
        plateformes.push(plateforme(800, 340, 140));

        // Paliers descente
        plateformes.push(plateforme(700, 430, 100, { oneWay: true }));
        plateformes.push(plateforme(520, 360, 100, { oneWay: true }));
        plateformes.push(plateforme(340, 290, 100, { oneWay: true }));

        // Palier S surélevé
        plateformes.push(plateforme(240, 440, 140, { oneWay: true }));

        const obstacles = [
            brasier(800, 340, { cycleMs: 3000, offsetMs: 0, largeur: 130 }),
            plaque(140, Y_SOL, 'pieux', {
                positions: [{ x: 380, y: Y_SOL }, { x: 480, y: Y_SOL }, { x: 580, y: Y_SOL }]
            }),
            pieuSol(680, Y_SOL)
        ];

        const portes = {};
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('S')) portes.S = porteS(240, 440);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: W - 80, y: Y_SOL - 20 }
        };
    }
};
