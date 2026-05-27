// Salle : Halls Cendrés — Arène des Braseros (NSEO compact)
// (Phase 9.6 — Pool diversité)
//
// INTENTION : arène centrale avec 4 brasiers cycliques en quinconce.
// Paliers safe latéraux + ascension N + palier S.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteS, porteE, porteO,
    brasier
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_arene_braseros = {
    id: 'halls_arene_braseros',
    biome: 'halls_cendres',
    nom: 'L\'Arène des Braseros',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['arene', 'hall'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // 4 foyers en quinconce
        plateformes.push(plateforme(200, Y_SOL - 20, 80));
        plateformes.push(plateforme(420, Y_SOL - 20, 80));
        plateformes.push(plateforme(540, Y_SOL - 20, 80));
        plateformes.push(plateforme(760, Y_SOL - 20, 80));

        // Paliers safe latéraux
        plateformes.push(plateforme(120, 420, 90, { oneWay: true }));
        plateformes.push(plateforme(840, 420, 90, { oneWay: true }));

        // Ascension centrale vers porte N
        plateformes.push(plateforme(310, 350, 110, { oneWay: true }));
        plateformes.push(plateforme(650, 350, 110, { oneWay: true }));
        plateformes.push(plateforme(480, 280, 180, { oneWay: true }));
        plateformes.push(plateforme(480, 190, 140, { oneWay: true }));
        plateformes.push(plateforme(480, 110, 130, { oneWay: true }));

        // Palier S surélevé
        plateformes.push(plateforme(820, 440, 130, { oneWay: true }));

        const obstacles = [
            brasier(200, Y_SOL - 20, { cycleMs: 2400, offsetMs: 0,    largeur: 70 }),
            brasier(420, Y_SOL - 20, { cycleMs: 2400, offsetMs: 600,  largeur: 70 }),
            brasier(540, Y_SOL - 20, { cycleMs: 2400, offsetMs: 1200, largeur: 70 }),
            brasier(760, Y_SOL - 20, { cycleMs: 2400, offsetMs: 1800, largeur: 70 })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('N')) portes.N = porteN(480, 30);
        if (portesActives.includes('S')) portes.S = porteS(820, 440);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
