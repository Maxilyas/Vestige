// Salle : Halls Cendrés — Le Daïs du Marteau (NSEO compact, signature)
// (Phase 9.6 — Pool diversité, fixed BFS v2)

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale, plafond,
    porteN, porteS, porteE, porteO,
    brasier, pieuPlafond
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_dais_du_marteau = {
    id: 'halls_dais_du_marteau',
    biome: 'halls_cendres',
    nom: 'Le Daïs du Marteau',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['hall', 'sanctuaire'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Plafond bas (oppression visuelle, restreint la zone de saut)
        plateformes.push(plafond(280, 680, 320));

        // 2 foyers sol latéraux (brasiers)
        plateformes.push(plateforme(220, Y_SOL - 20, 80));
        plateformes.push(plateforme(740, Y_SOL - 20, 80));

        // Paliers safe latéraux bas
        plateformes.push(plateforme(120, 430, 90, { oneWay: true }));
        plateformes.push(plateforme(840, 430, 90, { oneWay: true }));

        // Mid paliers (vert 70 depuis latéraux)
        plateformes.push(plateforme(320, 360, 100, { oneWay: true }));
        plateformes.push(plateforme(640, 360, 100, { oneWay: true }));

        // Stepping centre vers ascension (au-dessus du plafond bas)
        plateformes.push(plateforme(480, 275, 130, { oneWay: true }));   // edges 415..545 — reachable depuis mid paliers
        plateformes.push(plateforme(480, 180, 160, { oneWay: true }));
        plateformes.push(plateforme(480, 100, 130, { oneWay: true }));

        // Palier S surélevé
        plateformes.push(plateforme(820, 440, 130, { oneWay: true }));

        const obstacles = [
            brasier(220, Y_SOL - 20, { cycleMs: 2400, offsetMs: 0,    largeur: 70 }),
            brasier(740, Y_SOL - 20, { cycleMs: 2400, offsetMs: 1200, largeur: 70 }),
            pieuPlafond(370, 334),
            pieuPlafond(480, 334),
            pieuPlafond(590, 334)
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
