// Salle : Voile Inversé — La Descente Voilée (NS compact)
// (Phase 9.x — Migration Voile, fondation)
//
// INTENTION : escalier monumental diagonal (haut-gauche → bas-droite). Porte
// N au sommet, porte S sur palier surélevé. Pieux affleurants sur deux
// marches (lecture du danger). Coffre au sommet.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteN, porteS,
    pieuSol
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const voile_descente_voilee = {
    id: 'voile_descente_voilee',
    biome: 'voile_inverse',
    nom: 'La Descente Voilée',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S'],
    archetypesCompatibles: ['puits', 'crypte'],

    generer({ portesActives = ['N', 'S'] } = {}) {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Escalier monumental diagonal (haut-gauche → bas-droite)
        plateformes.push(plateforme(200, 150, 140, { oneWay: true }));   // sommet (sous porte N)
        plateformes.push(plateforme(340, 220, 130, { oneWay: true }));
        plateformes.push(plateforme(480, 290, 130, { oneWay: true }));
        plateformes.push(plateforme(620, 360, 130, { oneWay: true }));
        plateformes.push(plateforme(760, 430, 130, { oneWay: true }));

        // Palier S surélevé (porte S dessus)
        plateformes.push(plateforme(480, 440, 140, { oneWay: true }));

        const obstacles = [
            pieuSol(340, 220),
            pieuSol(620, 360)
        ];

        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(200, 60);
        if (portesActives.includes('S')) portes.S = porteS(480, 440);

        const coffreForce = { x: 200, y: 150 - 12 };

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 480, y: 440 - 20 },
            coffreForce
        };
    }
};
