// Salle : Cristaux Glacés — Les Pas Incertains (OE compact, SIGNATURE)
// (Phase 9.x — Tranche 2 Vague 2 : le Miroir)
//
// SIGNATURE : gouffre mortel franchi par des plateformes-miroirs qui
// oscillent solide↔intangible (décalées dans le temps). Traversée au timing.
// La rive d'arrivée (porte E) est taguée metroidvania (gated par la mécanique,
// ignorée du validateur). Critères : risque (gouffre), pression (timing),
// lecture (clignotement d'avertissement).

import {
    HAUTEUR_SOL, sol, plafondCathedrale,
    porteO, porteE,
    plateformeMiroir
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const cristaux_pas_incertains = {
    id: 'cristaux_pas_incertains',
    biome: 'cristaux_glaces',
    nom: 'Les Pas Incertains',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['pont', 'hall'],
    rolesAutorises: ['main', 'alt', 'entree'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));

        // Rive de départ (porte O) + rive d'arrivée gated (porte E, metroidvania)
        plateformes.push(sol(0, 280, Y_SOL));
        plateformes.push(sol(700, W, Y_SOL, { tags: ['metroidvania'] }));

        const obstacles = [
            // Plateformes-miroirs oscillantes décalées (chemin qui se déplace)
            plateformeMiroir(370, 440, 100, { cycleMs: 2800, offsetMs: 0 }),
            plateformeMiroir(500, 420, 100, { cycleMs: 2800, offsetMs: 930 }),
            plateformeMiroir(630, 440, 100, { cycleMs: 2800, offsetMs: 1860 })
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
