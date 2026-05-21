// Salle : Halls Cendrés — Chambre du Brasier (impasse E)
//
// ARCHITECTURE : chambre close avec brasier central PERMANENT. Mur lateral
// gauche plein. Plafond bas (étouffant). Coffre haut sur estrade — timer
// le brasier pour passer.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteE,
    mur, murLateralGauche,
    brasier
} from '../_format.js';

const W = 1400;
const H = 900;
const Y_SOL = H - HAUTEUR_SOL;        // 860
const Y_PLAFOND = 60;

export const halls_impasse_E = {
    id: 'halls_impasse_E',
    biome: 'halls_cendres',
    nom: 'Chambre du Brasier',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['E'],
    archetypesCompatibles: ['sanctuaire', 'crypte'],
    rolesAutorises: ['deadend', 'alt'],

    generer({ portesActives = ['E'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),

            // ─── PLAFOND bas étouffant
            plafondCathedrale(0,    500,  Y_PLAFOND + 80),
            plafondCathedrale(500,  900,  Y_PLAFOND + 150),
            plafondCathedrale(900,  W,    Y_PLAFOND + 80),

            // ─── MURS LATÉRAUX
            murLateralGauche(Y_PLAFOND, Y_SOL),  // GAUCHE plein
            mur(W - 15, Y_PLAFOND, Y_SOL - 100),  // droit partial (porte E)

            // ─── FOYER CENTRAL (estrade massive surélevée)
            plateforme(W / 2, Y_SOL - 60, 280, { oneWay: false }),

            // ─── PALIERS d'évitement (timing brasier)
            plateforme(200,  790, 140, { oneWay: true }),
            plateforme(400,  720, 140, { oneWay: true }),
            plateforme(200,  650, 140, { oneWay: true }),
            plateforme(400,  580, 140, { oneWay: true }),
            // Estrade haute (coffre)
            plateforme(280, 510, 220, { oneWay: false })
        ];

        const obstacles = [
            // Brasier central permanent (cycle long inversé : actif 60% du temps)
            brasier(W / 2, Y_SOL - 60, { largeur: 220, cycleMs: 4000, offsetMs: 0 })
        ];

        const portes = {};
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: W - 80, y: Y_SOL - 20 }
        };
    }
};
