// Salle : Halls Cendrés — Le Marteau Destructeur (NSEO compact)
// (Phase 9.6 — Pool diversité)
//
// INTENTION : séquence éboulis + murs explosifs au sol. Combat aérien
// pour éviter les projectiles braises.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteS, porteE, porteO,
    eboulis, murExplosif
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_marteau_destructeur = {
    id: 'halls_marteau_destructeur',
    biome: 'halls_cendres',
    nom: 'Le Marteau Destructeur',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Paliers latéraux bas
        plateformes.push(plateforme(140, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(820, 430, 110, { oneWay: true }));

        // Paliers mid combat aérien (au-dessus de la zone destruction)
        plateformes.push(plateforme(310, 350, 110, { oneWay: true }));
        plateformes.push(plateforme(650, 350, 110, { oneWay: true }));

        // Ascension centre vers N
        plateformes.push(plateforme(480, 270, 180, { oneWay: true }));
        plateformes.push(plateforme(480, 180, 140, { oneWay: true }));
        plateformes.push(plateforme(480, 100, 130, { oneWay: true }));

        // Palier S
        plateformes.push(plateforme(820, 440, 130, { oneWay: true }));

        const obstacles = [
            eboulis(280, Y_SOL - 130, { largeur: 60, hauteur: 130, hp: 3, dropSel: true }),
            murExplosif(480, Y_SOL - 130, { largeur: 32, hauteur: 130, hp: 3, dropFragmentFamille: 'noir' }),
            eboulis(680, Y_SOL - 130, { largeur: 60, hauteur: 130, hp: 3, dropFragmentFamille: 'blanc' })
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
