// Salle : Cristaux Glacés — L'Escalier d'Olympe (NS compact)
// (Phase 9.x — Migration Cristaux)
//
// INTENTION : escalier monumental en diagonale. Porte N en haut à gauche,
// porte S en bas centre. Cascade de marches de marbre descendant vers la
// droite ; pieux de givre sur quelques marches forcent le placement.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteN, porteS,
    pieuSol
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const cristaux_escalier_olympe = {
    id: 'cristaux_escalier_olympe',
    biome: 'cristaux_glaces',
    nom: 'L\'Escalier d\'Olympe',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['N', 'S'] } = {}) {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Escalier monumental diagonal (haut-gauche → bas-droite)
        plateformes.push(plateforme(200, 150, 140, { oneWay: true }));   // sommet (sous porte N)
        plateformes.push(plateforme(340, 220, 130, { oneWay: true }));
        plateformes.push(plateforme(480, 290, 130, { oneWay: true }));
        plateformes.push(plateforme(620, 360, 130, { oneWay: true }));
        plateformes.push(plateforme(760, 430, 130, { oneWay: true }));   // sol+70

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
