// Salle : Halls Cendrés — Coin NO (compact)
// (Phase 9.6 — Migration)
//
// INTENTION : ascension gauche. Mur explosif bloque une niche supérieure
// (warning visible = choix : casser ou pas).

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteO,
    murExplosif, brasier
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_coin_NO = {
    id: 'halls_coin_NO',
    biome: 'halls_cendres',
    nom: 'Cendrier Suspendu (NO)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'N'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['O', 'N'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(580, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Escalier ascension gauche
        plateformes.push(plateforme(790, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(580, 370, 110, { oneWay: true }));
        plateformes.push(plateforme(360, 310, 110, { oneWay: true }));   // foyer brasier
        plateformes.push(plateforme(180, 240, 110, { oneWay: true }));
        plateformes.push(plateforme(360, 170, 130, { oneWay: true }));
        plateformes.push(plateforme(480, 110, 150, { oneWay: true }));

        const obstacles = [
            brasier(360, 310, { cycleMs: 2600, offsetMs: 600, largeur: 100 }),
            // Mur explosif vertical qui cache niche bonus (sur côté D bas)
            murExplosif(880, 380, { largeur: 32, hauteur: 110, hp: 3, dropFragmentFamille: 'noir' })
        ];

        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(480, 30);
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: W - 80, y: Y_SOL - 20 }
        };
    }
};
