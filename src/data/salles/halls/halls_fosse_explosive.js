// Salle : Halls Cendrés — La Fosse Explosive (NSEO compact)
// (Phase 9.6 — Pool diversité)
//
// INTENTION : fosse mortelle au centre, traversée par paliers, murs
// explosifs latéraux qui menacent quand on monte vers porte N.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteS, porteE, porteO,
    murExplosif
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_fosse_explosive = {
    id: 'halls_fosse_explosive',
    biome: 'halls_cendres',
    nom: 'La Fosse Explosive',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['hall', 'pont'],
    gouffreMort: true,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));

        // Sol G + Sol D, fosse mortelle 300..660
        plateformes.push(sol(0, 300, Y_SOL));
        plateformes.push(sol(660, W, Y_SOL));

        // 3 paliers pour traverser la fosse
        plateformes.push(plateforme(360, 440, 80, { oneWay: true }));
        plateformes.push(plateforme(480, 400, 80, { oneWay: true }));
        plateformes.push(plateforme(600, 440, 80, { oneWay: true }));

        // Ascension N centrale
        plateformes.push(plateforme(480, 320, 130, { oneWay: true }));
        plateformes.push(plateforme(480, 230, 130, { oneWay: true }));
        plateformes.push(plateforme(480, 140, 130, { oneWay: true }));

        // Paliers latéraux pour combat
        plateformes.push(plateforme(140, 420, 100, { oneWay: true }));
        plateformes.push(plateforme(820, 420, 100, { oneWay: true }));

        // Palier S
        plateformes.push(plateforme(820, 440, 130, { oneWay: true }));

        const obstacles = [
            // Murs explosifs latéraux verticaux (orientation = mur classique)
            murExplosif(250, 280, { largeur: 32, hauteur: 130, hp: 3, dropFragmentFamille: 'noir' }),
            murExplosif(710, 280, { largeur: 32, hauteur: 130, hp: 3, dropSel: true })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('N')) portes.N = porteN(480, 30);
        if (portesActives.includes('S')) portes.S = porteS(820, 440);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
