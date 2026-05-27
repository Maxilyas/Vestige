// Salle : Halls Cendrés — Le Grand Mur (OE compact, signature)
// (Phase 9.6 — Migration)
//
// SIGNATURE : éboulis massif central HP=8 bloque le passage bas. Soit casser,
// soit grimper par-dessus via paliers latéraux.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    eboulis
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_grand_mur = {
    id: 'halls_grand_mur',
    biome: 'halls_cendres',
    nom: 'Le Grand Mur',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'crypte'],
    rolesAutorises: ['main', 'alt'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Paliers latéraux pour grimper par-dessus
        plateformes.push(plateforme(180, 430, 130, { oneWay: true }));
        plateformes.push(plateforme(780, 430, 130, { oneWay: true }));
        plateformes.push(plateforme(320, 350, 110, { oneWay: true }));
        plateformes.push(plateforme(640, 350, 110, { oneWay: true }));

        // Pont au-dessus (passage haut alternatif)
        plateformes.push(plateforme(480, 270, 200, { oneWay: true }));

        // Paliers safe près du mur
        plateformes.push(plateforme(380, 430, 70, { oneWay: true }));
        plateformes.push(plateforme(580, 430, 70, { oneWay: true }));

        const obstacles = [
            eboulis(480, Y_SOL - 240, { largeur: 90, hauteur: 240, hp: 8, dropSel: true })
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
