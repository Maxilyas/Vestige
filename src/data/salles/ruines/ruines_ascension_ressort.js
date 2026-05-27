// Salle : Ruines basses — L'Ascension à Ressort (NSEO compact)
// (Phase 9.4 Vague 1 — pool diversité)
//
// INTENTION DESIGN : "Rayman temple ascendant" — pas de fosse mortelle,
// mais une chaîne de paliers étroits ascendants. Les ressorts dynamisent
// la montée mais ne sont pas indispensables. Pieux sol entre les zones
// d'arrivée pénalisent les ratés.
//   • Sol entier avec pieux entre paliers
//   • 5 paliers étroits (80-100 px) en zigzag ascendant
//   • 3 ressorts placés sous les paliers d'arrivée pour catapulter
//   • Palier N tout en haut
//   • Palier S surélevé latéral

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE, porteN, porteS,
    ressort, pieuSol
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const ruines_ascension_ressort = {
    id: 'ruines_ascension_ressort',
    biome: 'ruines_basses',
    nom: 'L\'Ascension à Ressort',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['hall', 'sanctuaire'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Paliers étroits en zigzag ascendant (80-100 px largeur, vert 80 entre)
        plateformes.push(plateforme(150, 420, 90, { oneWay: true }));   // bas G
        plateformes.push(plateforme(330, 340, 90, { oneWay: true }));
        plateformes.push(plateforme(150, 260, 90, { oneWay: true }));
        plateformes.push(plateforme(330, 180, 100, { oneWay: true }));

        // Couloir haut central → palier N
        plateformes.push(plateforme(480, 105, 130, { oneWay: true }));

        // Branche droite alternative (pour porte E facile)
        plateformes.push(plateforme(810, 420, 100, { oneWay: true }));
        plateformes.push(plateforme(660, 340, 90, { oneWay: true }));
        plateformes.push(plateforme(810, 260, 90, { oneWay: true }));
        plateformes.push(plateforme(660, 180, 100, { oneWay: true }));

        // Palier S surélevé
        plateformes.push(plateforme(820, 440, 130, { oneWay: true }));

        const obstacles = [
            // Ressorts qui boostent la montée
            ressort(220, Y_SOL),
            ressort(480, Y_SOL),
            ressort(740, Y_SOL),
            // Pieux entre les zones safe
            pieuSol(380, Y_SOL),
            pieuSol(580, Y_SOL)
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
