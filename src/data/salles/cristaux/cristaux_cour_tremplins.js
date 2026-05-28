// Salle : Cristaux Glacés — La Cour des Tremplins (OE compact)
// (Phase 9.x — Migration Cristaux)
//
// INTENTION : "mobilité aérienne". Cour ouverte, cristaux-tremplins
// (ressorts) qui catapultent vers une mezzanine asymétrique penchée à
// gauche. Tous les paliers restent atteignables au saut normal — les
// tremplins ne sont qu'un accélérateur ludique.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    ressort
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const cristaux_cour_tremplins = {
    id: 'cristaux_cour_tremplins',
    biome: 'cristaux_glaces',
    nom: 'La Cour des Tremplins',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['arene', 'hall'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(60, W - 60, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Escalier ascendant asymétrique (penche à gauche)
        plateformes.push(plateforme(760, 430, 130, { oneWay: true }));   // sol+70 droite
        plateformes.push(plateforme(560, 360, 120, { oneWay: true }));
        plateformes.push(plateforme(360, 300, 120, { oneWay: true }));
        plateformes.push(plateforme(180, 240, 130, { oneWay: true }));   // mezzanine sommet gauche

        // Palier bas gauche (footing combat)
        plateformes.push(plateforme(160, 430, 120, { oneWay: true }));

        const obstacles = [
            ressort(280, Y_SOL),    // catapulte vers la mezzanine
            ressort(660, Y_SOL)
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: W - 80, y: Y_SOL - 20 }
        };
    }
};
