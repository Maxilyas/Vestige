// Salle : Halls Cendrés — La Chaîne des Braseros (NSEO compact)
// (Phase 9.6 — Pool diversité)
//
// INTENTION : couloir 5 brasiers séquencés au sol (décalages 1/5 du cycle).
// Vagues progressives qui obligent à avancer constamment.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteS, porteE, porteO,
    brasier
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_chaine_braseros = {
    id: 'halls_chaine_braseros',
    biome: 'halls_cendres',
    nom: 'La Chaîne des Braseros',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['hall', 'pont'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // 5 foyers en chaîne
        plateformes.push(plateforme(180, Y_SOL - 20, 70));
        plateformes.push(plateforme(330, Y_SOL - 20, 70));
        plateformes.push(plateforme(480, Y_SOL - 20, 70));
        plateformes.push(plateforme(630, Y_SOL - 20, 70));
        plateformes.push(plateforme(780, Y_SOL - 20, 70));

        // Paliers latéraux et mid pour combat aérien
        plateformes.push(plateforme(100, 430, 80, { oneWay: true }));
        plateformes.push(plateforme(860, 430, 80, { oneWay: true }));
        plateformes.push(plateforme(280, 350, 100, { oneWay: true }));
        plateformes.push(plateforme(680, 350, 100, { oneWay: true }));

        // Ascension N
        plateformes.push(plateforme(480, 280, 160, { oneWay: true }));
        plateformes.push(plateforme(480, 190, 140, { oneWay: true }));
        plateformes.push(plateforme(480, 110, 130, { oneWay: true }));

        // Palier S
        plateformes.push(plateforme(820, 440, 130, { oneWay: true }));

        // Vagues séquencées : cycle 2500ms, offset 500ms = vague qui balaie de gauche à droite
        const obstacles = [
            brasier(180, Y_SOL - 20, { cycleMs: 2500, offsetMs: 0,    largeur: 60 }),
            brasier(330, Y_SOL - 20, { cycleMs: 2500, offsetMs: 500,  largeur: 60 }),
            brasier(480, Y_SOL - 20, { cycleMs: 2500, offsetMs: 1000, largeur: 60 }),
            brasier(630, Y_SOL - 20, { cycleMs: 2500, offsetMs: 1500, largeur: 60 }),
            brasier(780, Y_SOL - 20, { cycleMs: 2500, offsetMs: 2000, largeur: 60 })
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
