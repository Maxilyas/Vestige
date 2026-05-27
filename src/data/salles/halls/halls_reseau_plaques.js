// Salle : Halls Cendrés — Réseau de Plaques (NEO compact, signature)
// (Phase 9.6 — Migration)
//
// SIGNATURE : puzzle 2 étages. 3 plaques de pression activent des pieux
// distants. Brasier marquage porte N.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteE, porteO,
    plaque, brasier
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_reseau_plaques = {
    id: 'halls_reseau_plaques',
    biome: 'halls_cendres',
    nom: 'Le Réseau de Plaques',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'E', 'O'],
    archetypesCompatibles: ['hall', 'sanctuaire'],
    rolesAutorises: ['main', 'alt'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['N', 'E', 'O'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Paliers d'ascension vers porte N
        plateformes.push(plateforme(160, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(800, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(310, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(650, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(480, 290, 180, { oneWay: true }));
        plateformes.push(plateforme(480, 200, 140, { oneWay: true }));
        plateformes.push(plateforme(480, 110, 130, { oneWay: true }));

        // Foyer brasier marquage porte N
        plateformes.push(plateforme(480, Y_SOL - 20, 80));

        const obstacles = [
            brasier(480, Y_SOL - 20, { cycleMs: 3000, offsetMs: 0, largeur: 70 }),
            // 3 plaques pression réparties — chacune spawn 2 pieux temporaires ailleurs
            plaque(160, 430, 'pieux', {
                positions: [{ x: 380, y: Y_SOL }, { x: 580, y: Y_SOL }]
            }),
            plaque(800, 430, 'pieux', {
                positions: [{ x: 250, y: 430 }, { x: 700, y: 430 }]
            }),
            plaque(480, 290, 'pieux', {
                positions: [{ x: 310, y: 360 }, { x: 650, y: 360 }]
            })
        ];

        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(480, 30);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
