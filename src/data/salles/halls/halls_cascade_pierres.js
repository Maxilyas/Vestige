// Salle : Halls Cendrés — La Cascade de Pierres (OE compact, signature)
// (Phase 9.6 — Migration, fixed BFS v2)
//
// SIGNATURE : réaction en chaîne. Fosse mortelle entre 2 sols, traversée
// par un palier-pont + ascension centrale. Mur explosif + 2 rocs tombants.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    murExplosif, rocQuiTombe
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_cascade_pierres = {
    id: 'halls_cascade_pierres',
    biome: 'halls_cendres',
    nom: 'La Cascade de Pierres',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'crypte'],
    rolesAutorises: ['main', 'alt'],
    unique: true,
    tirageWeight: 3,
    gouffreMort: true,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));

        // Sols G + D, fosse mortelle 420..540 (120 px — non franchissable au saut horiz)
        plateformes.push(sol(0, 420, Y_SOL));
        plateformes.push(sol(540, W, Y_SOL));

        // Palier-pont juste au-dessus de la fosse (sol+70)
        plateformes.push(plateforme(480, 430, 100, { oneWay: true }));   // edges 430..530

        // Paliers latéraux (sol+70 latéraux)
        plateformes.push(plateforme(180, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(780, 430, 110, { oneWay: true }));

        // Ascension centrale (vert 90)
        plateformes.push(plateforme(480, 340, 130, { oneWay: true }));   // edges 415..545
        plateformes.push(plateforme(330, 270, 110, { oneWay: true }));   // edges 275..385
        plateformes.push(plateforme(630, 270, 110, { oneWay: true }));   // edges 575..685
        plateformes.push(plateforme(480, 190, 160, { oneWay: true }));   // sommet

        const obstacles = [
            murExplosif(480, 280, { largeur: 32, hauteur: 60, hp: 3, dropSel: true }),
            rocQuiTombe(370, 70, 320),
            rocQuiTombe(590, 70, 320)
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
