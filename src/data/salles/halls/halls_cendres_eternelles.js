// Salle : Halls Cendrés — Les Cendres Éternelles (NSEO compact)
// (Phase 9.6 — Pool diversité)
//
// INTENTION : multi-niveaux avec rocs qui tombent périodiquement du plafond.
// Paliers safe entre les axes de chute.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteS, porteE, porteO,
    rocQuiTombe, brasier
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_cendres_eternelles = {
    id: 'halls_cendres_eternelles',
    biome: 'halls_cendres',
    nom: 'Les Cendres Éternelles',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Foyer central + brasier
        plateformes.push(plateforme(480, Y_SOL - 20, 100));

        // Paliers ascendants en zigzag (entre axes de chute)
        plateformes.push(plateforme(140, 420, 100, { oneWay: true }));
        plateformes.push(plateforme(820, 420, 100, { oneWay: true }));
        plateformes.push(plateforme(290, 340, 100, { oneWay: true }));
        plateformes.push(plateforme(670, 340, 100, { oneWay: true }));
        plateformes.push(plateforme(480, 260, 160, { oneWay: true }));
        plateformes.push(plateforme(290, 180, 100, { oneWay: true }));
        plateformes.push(plateforme(670, 180, 100, { oneWay: true }));
        plateformes.push(plateforme(480, 110, 130, { oneWay: true }));

        // Palier S
        plateformes.push(plateforme(820, 440, 130, { oneWay: true }));

        const obstacles = [
            brasier(480, Y_SOL - 20, { cycleMs: 2800, offsetMs: 0, largeur: 90 }),
            // 3 rocs tombants (axes décalés)
            rocQuiTombe(210, 90, 320),
            rocQuiTombe(750, 90, 320),
            rocQuiTombe(480, 70, 230)
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
