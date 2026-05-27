// Salle : Halls Cendrés — Voûte Basse (OE compact)
// (Phase 9.6 — Migration)
//
// INTENTION : voûte basse + sols effrités au-dessus d'une fosse de brasier.
// Timing serré pour traverser sans toucher le feu.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale, plafond,
    porteO, porteE,
    solEffrite, brasier
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_voute_basse = {
    id: 'halls_voute_basse',
    biome: 'halls_cendres',
    nom: 'La Voûte Basse',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'pont'],
    rolesAutorises: ['main', 'alt'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Plafond bas qui descend au centre (oppression visuelle)
        plateformes.push(plafond(300, 660, 280));

        // Foyer surélevé + brasier central permanent
        plateformes.push(plateforme(480, Y_SOL - 25, 200));

        // Paliers latéraux (sol+70)
        plateformes.push(plateforme(160, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(800, 430, 110, { oneWay: true }));

        // Sols effrités pour traverser la voûte par le haut
        plateformes.push(solEffrite(330, 360, 90));
        plateformes.push(solEffrite(480, 360, 90));
        plateformes.push(solEffrite(630, 360, 90));

        const obstacles = [
            brasier(480, Y_SOL - 25, { cycleMs: 2200, offsetMs: 0, largeur: 180 })
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
