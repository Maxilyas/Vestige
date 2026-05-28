// Salle : Voile Inversé — La Cella Inversée (impasse S compact)
// (Phase 9.x — Migration Voile, fondation)
//
// INTENTION : deadend. Entrée par la porte S (palier bas), ascension d'une
// cascade déchirée jusqu'au coffre au sommet (récompense l'escalade).

import {
    HAUTEUR_SOL, sol, plateforme,
    porteS
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const voile_impasse_S = {
    id: 'voile_impasse_S',
    biome: 'voile_inverse',
    nom: 'La Cella Inversée (S)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['S'],
    archetypesCompatibles: ['crypte', 'puits'],
    rolesAutorises: ['deadend', 'alt'],

    generer() {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Palier S surélevé (porte S dessus, spawn ici)
        plateformes.push(plateforme(480, 440, 140, { oneWay: true }));

        // Cascade ascendante vers le coffre au sommet
        plateformes.push(plateforme(180, 430, 130, { oneWay: true }));
        plateformes.push(plateforme(780, 430, 130, { oneWay: true }));
        plateformes.push(plateforme(320, 360, 130, { oneWay: true }));
        plateformes.push(plateforme(640, 360, 130, { oneWay: true }));
        plateformes.push(plateforme(220, 290, 130, { oneWay: true }));
        plateformes.push(plateforme(740, 290, 130, { oneWay: true }));
        plateformes.push(plateforme(480, 220, 200, { oneWay: true }));
        plateformes.push(plateforme(480, 130, 160, { oneWay: true }));   // sommet (coffre)

        const portes = { S: porteS(480, 440) };
        const coffreForce = { x: 480, y: 130 - 12 };

        return {
            plateformes, obstacles: [], zones: [], portes,
            spawnDefault: { x: 480, y: 440 - 20 },
            coffreForce
        };
    }
};
