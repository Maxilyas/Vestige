// Salle : Halls Cendrés — Couloir Explosif (OE compact)
// (Phase 9.6 — Migration)
//
// INTENTION : 2 murs explosifs au sol bloquent le passage bas. Route haute
// safe via paliers (alt). Casser à distance OU contourner par le haut.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    murExplosif
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_couloir_explosif = {
    id: 'halls_couloir_explosif',
    biome: 'halls_cendres',
    nom: 'Le Couloir Explosif',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'pont'],
    rolesAutorises: ['main', 'alt'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Route haute alt safe : paliers latéraux + pont central
        plateformes.push(plateforme(140, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(820, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(290, 350, 110, { oneWay: true }));
        plateformes.push(plateforme(670, 350, 110, { oneWay: true }));
        plateformes.push(plateforme(480, 280, 180, { oneWay: true }));

        const obstacles = [
            // 2 murs explosifs au sol — runes rouges visibles d'avance
            murExplosif(330, Y_SOL - 130, { largeur: 32, hauteur: 130, hp: 3, dropSel: true }),
            murExplosif(630, Y_SOL - 130, { largeur: 32, hauteur: 130, hp: 3, dropFragmentFamille: 'noir' })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
