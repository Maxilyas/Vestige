// Salle : Ruines basses — Le Puits Double (NS compact, alt)
// (Phase 9.4 Vague 1 — pool diversité)
//
// INTENTION DESIGN : Alternative à `ruines_puits_compact`. Style Donkey Kong
// vertical : 2 colonnes de paliers étroits avec ressorts pour catapulter
// entre étages. Pieux au sol entre les 2 colonnes punissent les ratés.
//   • Entrée S au sol, sortie N en haut centre
//   • 2 colonnes de paliers étroits (G et D)
//   • 2 ressorts entre colonnes (raccourcis aller-retour)
//   • Pieux sol entre colonnes

import {
    HAUTEUR_SOL, sol, plateforme,
    porteN, porteS,
    ressort, pieuSol
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const ruines_puits_double = {
    id: 'ruines_puits_double',
    biome: 'ruines_basses',
    nom: 'Le Puits Double (NS)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S'],
    archetypesCompatibles: ['puits', 'crypte'],

    generer({ portesActives = ['N', 'S'] } = {}) {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Colonne G — paliers étroits ascendants
        plateformes.push(plateforme(180, 420, 90, { oneWay: true }));
        plateformes.push(plateforme(180, 330, 90, { oneWay: true }));
        plateformes.push(plateforme(180, 240, 90, { oneWay: true }));
        plateformes.push(plateforme(180, 150, 90, { oneWay: true }));

        // Colonne D — paliers étroits ascendants
        plateformes.push(plateforme(780, 420, 90, { oneWay: true }));
        plateformes.push(plateforme(780, 330, 90, { oneWay: true }));
        plateformes.push(plateforme(780, 240, 90, { oneWay: true }));
        plateformes.push(plateforme(780, 150, 90, { oneWay: true }));

        // Pont haut central → porte N (large pour rejoindre les 2 colonnes : gap ≤130)
        plateformes.push(plateforme(480, 100, 280, { oneWay: true }));

        // Palier S surélevé central
        plateformes.push(plateforme(480, 440, 140, { oneWay: true }));

        const obstacles = [
            // Ressorts qui raccourcissent l'ascension
            ressort(380, Y_SOL),
            ressort(580, Y_SOL),
            // Pieux sol entre colonnes
            pieuSol(300, Y_SOL),
            pieuSol(660, Y_SOL)
        ];

        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(480, 30);
        if (portesActives.includes('S')) portes.S = porteS(480, 440);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 480, y: 100 - 20 }
        };
    }
};
