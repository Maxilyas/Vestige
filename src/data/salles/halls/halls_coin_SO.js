// Salle : Halls Cendrés — Coin SO (foyer éteint)
// (Phase 9.6 — Migration)
//
// INTENTION : descente gauche. Foyer éteint au centre (cuvette vide).
// Éboulis bloquant côté droit (passage alt si cassé).

import {
    HAUTEUR_SOL, sol, plateforme,
    porteS, porteO,
    eboulis, pieuSol
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_coin_SO = {
    id: 'halls_coin_SO',
    biome: 'halls_cendres',
    nom: 'Foyer Éteint (SO)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'S'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['O', 'S'] } = {}) {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Foyer éteint sur estrade
        plateformes.push(plateforme(160, 340, 140));

        // Paliers descente
        plateformes.push(plateforme(260, 430, 100, { oneWay: true }));
        plateformes.push(plateforme(440, 360, 100, { oneWay: true }));
        plateformes.push(plateforme(620, 290, 100, { oneWay: true }));

        // Palier S surélevé
        plateformes.push(plateforme(720, 440, 140, { oneWay: true }));

        const obstacles = [
            eboulis(820, Y_SOL - 130, { largeur: 70, hauteur: 130, hp: 4, dropSel: true }),
            pieuSol(360, Y_SOL),
            pieuSol(540, Y_SOL)
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('S')) portes.S = porteS(720, 440);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
