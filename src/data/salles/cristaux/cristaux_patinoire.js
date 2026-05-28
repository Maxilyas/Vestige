// Salle : Cristaux Glacés — La Patinoire (OE compact, SIGNATURE)
// (Phase 9.x — Tranche 2, Pilier 2 : la glisse)
//
// SIGNATURE : sol de verglas. Le joueur glisse, doit doser ses élans et
// sauter sur les îlots de marbre (non glissants) pour s'arrêter avant les
// stalagmites (pieux). Critères : risque (pieux), pression (inertie),
// choix (îlots refuges vs glisse au sol), lecture (plaques brillantes).

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    verglas, pieuSol
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const cristaux_patinoire = {
    id: 'cristaux_patinoire',
    biome: 'cristaux_glaces',
    nom: 'La Patinoire',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'pont'],
    rolesAutorises: ['main', 'alt', 'entree'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Îlots de marbre NON glissants (refuges au-dessus du verglas)
        plateformes.push(plateforme(160, 410, 120, { oneWay: true }));
        plateformes.push(plateforme(480, 410, 120, { oneWay: true }));
        plateformes.push(plateforme(800, 410, 120, { oneWay: true }));

        const obstacles = [
            // Deux grandes plaques de verglas sur le sol
            verglas(280, Y_SOL, 360),
            verglas(680, Y_SOL, 360),
            // Stalagmites (pieux) où l'on glisse si on ne s'arrête pas à temps
            pieuSol(450, Y_SOL),
            pieuSol(510, Y_SOL)
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
