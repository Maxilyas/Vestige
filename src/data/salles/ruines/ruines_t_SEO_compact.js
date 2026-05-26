// Salle : Ruines basses — Embranchement des Dépôts SEO (T-shape compact)
// (Phase 9.3c)
// INTENTION : "passage E/O au sol + sortie S vers caveau".
//
// Convention porte S : palier S placé en BAS de la salle (y=440) pour que
// la position visuelle de l'arche corresponde à sa direction (sud sur carte).

import {
    HAUTEUR_SOL, sol, plateforme,
    porteS, porteE, porteO,
    pieuSol
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const ruines_t_SEO_compact = {
    id: 'ruines_t_SEO_compact',
    biome: 'ruines_basses',
    nom: 'Embranchement des Dépôts (SEO)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['S', 'E', 'O'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['S', 'E', 'O'] } = {}) {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Palier S surélevé bas (porte S dessus, descente vers la salle sud)
        plateformes.push(plateforme(480, 440, 140, { oneWay: true }));

        // Paliers latéraux pour combat aérien
        plateformes.push(plateforme(150, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(810, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(290, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(670, 360, 110, { oneWay: true }));

        // Passerelle centrale (combat aérien, plus de porte ici)
        plateformes.push(plateforme(480, 290, 180, { oneWay: true }));

        // Palier haut + accès coffre
        plateformes.push(plateforme(480, 200, 130, { oneWay: true }));

        const obstacles = [
            pieuSol(380, Y_SOL),
            pieuSol(580, Y_SOL)
        ];

        const portes = {};
        if (portesActives.includes('S')) portes.S = porteS(480, 440);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);

        const coffreForce = { x: 480, y: 200 - 12 };

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 },
            coffreForce
        };
    }
};
