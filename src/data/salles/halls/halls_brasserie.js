// Salle : Halls Cendrés — La Brasserie (OE compact, signature)
// (Phase 9.6 — Migration depuis XL)
//
// SIGNATURE : forge verticale dense. 4 étages, 2 foyers brasiers, ressort
// shortcut. Combat aérien soutenu. Coffre haut.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    brasier, ressort, pieuPlafond
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_brasserie = {
    id: 'halls_brasserie',
    biome: 'halls_cendres',
    nom: 'La Brasserie',
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

        // 2 foyers surélevés (brasiers majeurs)
        plateformes.push(plateforme(240, Y_SOL - 25, 110));
        plateformes.push(plateforme(720, Y_SOL - 25, 110));

        // Étage 1 : paliers latéraux (sol + 70)
        plateformes.push(plateforme(100, 430, 80, { oneWay: true }));
        plateformes.push(plateforme(860, 430, 80, { oneWay: true }));

        // Étage 2 : paliers mid (combat vertical)
        plateformes.push(plateforme(220, 360, 100, { oneWay: true }));
        plateformes.push(plateforme(740, 360, 100, { oneWay: true }));
        plateformes.push(plateforme(480, 360, 130, { oneWay: true }));

        // Étage 3 : palier central plus large
        plateformes.push(plateforme(350, 280, 100, { oneWay: true }));
        plateformes.push(plateforme(610, 280, 100, { oneWay: true }));

        // Étage 4 : palier sommet (coffre)
        plateformes.push(plateforme(480, 200, 180, { oneWay: true }));

        const obstacles = [
            ressort(440, Y_SOL),       // shortcut central
            ressort(520, Y_SOL),
            brasier(240, Y_SOL - 25, { cycleMs: 3000, offsetMs: 0,    largeur: 100 }),
            brasier(720, Y_SOL - 25, { cycleMs: 3000, offsetMs: 1500, largeur: 100 }),
            // Pieux plafond signature (stalactites)
            pieuPlafond(380, 60),
            pieuPlafond(580, 60)
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        const coffreForce = { x: 480, y: 200 - 12 };

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 },
            coffreForce
        };
    }
};
