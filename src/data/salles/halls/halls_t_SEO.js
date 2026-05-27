// Salle : Halls Cendrés — Carrefour des Dépôts (SEO compact)
// (Phase 9.6 — Migration)
//
// INTENTION : carrefour S+E+O au sol + paliers latéraux. Éboulis répartis
// (anciens dépôts de charbon).

import {
    HAUTEUR_SOL, sol, plateforme,
    porteS, porteE, porteO,
    eboulis, brasier
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_t_SEO = {
    id: 'halls_t_SEO',
    biome: 'halls_cendres',
    nom: 'Carrefour des Dépôts',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['S', 'E', 'O'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['S', 'E', 'O'] } = {}) {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Foyer central
        plateformes.push(plateforme(480, Y_SOL - 20, 100));

        // Palier S surélevé
        plateformes.push(plateforme(480, 440, 140, { oneWay: true }));

        // Paliers latéraux + mid
        plateformes.push(plateforme(150, 430, 100, { oneWay: true }));
        plateformes.push(plateforme(810, 430, 100, { oneWay: true }));
        plateformes.push(plateforme(280, 360, 100, { oneWay: true }));
        plateformes.push(plateforme(680, 360, 100, { oneWay: true }));

        // Passerelle haute
        plateformes.push(plateforme(480, 270, 180, { oneWay: true }));

        const obstacles = [
            brasier(480, Y_SOL - 20, { cycleMs: 2400, offsetMs: 0, largeur: 90 }),
            // Éboulis dépôts charbon
            eboulis(300, Y_SOL - 120, { largeur: 60, hauteur: 120, hp: 3, dropSel: true }),
            eboulis(660, Y_SOL - 120, { largeur: 60, hauteur: 120, hp: 3, dropFragmentFamille: 'blanc' })
        ];

        const portes = {};
        if (portesActives.includes('S')) portes.S = porteS(480, 440);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
