// Salle : Halls Cendrés — La Fournaise Centrale (NSEO compact, signature)
// (Phase 9.6 — Pool diversité)
//
// SIGNATURE : énorme foyer central permanent. Combat sur paliers ascendants
// autour. Cycle long mais zone d'effet large.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteS, porteE, porteO,
    brasier
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_fournaise_centrale = {
    id: 'halls_fournaise_centrale',
    biome: 'halls_cendres',
    nom: 'La Fournaise Centrale',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['arene', 'sanctuaire'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Foyer central énorme (cuvette pierre)
        plateformes.push(plateforme(480, Y_SOL - 30, 280));

        // Pyramide ascendante autour
        plateformes.push(plateforme(140, 420, 100, { oneWay: true }));
        plateformes.push(plateforme(820, 420, 100, { oneWay: true }));
        plateformes.push(plateforme(290, 340, 100, { oneWay: true }));
        plateformes.push(plateforme(670, 340, 100, { oneWay: true }));
        plateformes.push(plateforme(480, 260, 180, { oneWay: true }));
        plateformes.push(plateforme(480, 170, 140, { oneWay: true }));
        plateformes.push(plateforme(480, 100, 130, { oneWay: true }));

        // Palier S surélevé
        plateformes.push(plateforme(820, 440, 130, { oneWay: true }));

        const obstacles = [
            brasier(480, Y_SOL - 30, { cycleMs: 3500, offsetMs: 0, largeur: 260 })
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
