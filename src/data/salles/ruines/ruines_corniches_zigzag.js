// Salle : Ruines basses — Les Corniches en Zigzag (NSEO compact)
// (Phase 9.4 Vague 1 — pool diversité)
//
// INTENTION DESIGN : "Donkey Kong vintage" — petites corniches étroites
// (70 px) en quinconce serrée. Pieux au sol entre les zones d'arrivée
// punissent les ratés. Pas de fosse mortelle — la mort vient des pieux
// accumulés.
//   • Sol entier "miné" : 4 pieux espacés ~150 px
//   • 6 corniches étroites en zigzag (70 px largeur)
//   • 1 plateau central plus large (refuge)
//   • Palier N tout en haut
//   • Palier S surélevé latéral

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE, porteN, porteS,
    pieuSol
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const ruines_corniches_zigzag = {
    id: 'ruines_corniches_zigzag',
    biome: 'ruines_basses',
    nom: 'Les Corniches en Zigzag',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Corniches étroites en zigzag (70 px, vert 70 entre)
        plateformes.push(plateforme(120, 430, 70, { oneWay: true }));
        plateformes.push(plateforme(260, 360, 70, { oneWay: true }));
        plateformes.push(plateforme(400, 290, 70, { oneWay: true }));
        plateformes.push(plateforme(560, 290, 70, { oneWay: true }));
        plateformes.push(plateforme(700, 360, 70, { oneWay: true }));
        plateformes.push(plateforme(840, 430, 70, { oneWay: true }));

        // Plateau central refuge (large)
        plateformes.push(plateforme(480, 210, 180, { oneWay: true }));

        // Couloir haut vers porte N
        plateformes.push(plateforme(480, 120, 140, { oneWay: true }));

        // Palier S surélevé droit
        plateformes.push(plateforme(820, 440, 130, { oneWay: true }));

        const obstacles = [
            // 4 pieux au sol espacés ~150 px (gaps safe entre)
            pieuSol(200, Y_SOL),
            pieuSol(350, Y_SOL),
            pieuSol(510, Y_SOL),
            pieuSol(670, Y_SOL)
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
