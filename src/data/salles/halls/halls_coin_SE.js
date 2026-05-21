// Salle : Halls Cendrés — Coin SE (descente de forge)
//
// ARCHITECTURE : coin en L (entrée E, sortie S). Mur lateral GAUCHE plein.
// Plafond avec poutres. Forge active sur l'étage haut droit (foyer puissant).
// Plaque de pression active pieux dans le couloir descendant.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteE, porteS,
    mur, murLateralGauche,
    plaque, brasier
} from '../_format.js';

const W = 1600;
const H = 1100;
const Y_SOL = H - HAUTEUR_SOL;        // 1060
const Y_PLAFOND = 60;

export const halls_coin_SE = {
    id: 'halls_coin_SE',
    biome: 'halls_cendres',
    nom: 'Coin SE (descente de forge)',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['E', 'S'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['E', 'S'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),

            // ─── PLAFOND avec poutres
            plafondCathedrale(0,    600,  Y_PLAFOND + 100),
            plafondCathedrale(600,  1000, Y_PLAFOND + 200),
            plafondCathedrale(1000, W,    Y_PLAFOND + 80),

            // ─── MURS LATÉRAUX
            murLateralGauche(Y_PLAFOND, Y_SOL),  // GAUCHE plein
            ...(portesActives.includes('E') ? [mur(W - 15, Y_PLAFOND, Y_SOL - 100)] : []),

            // ─── ESCALIER vers forge (côté droit, Δ70 chaîne)
            plateforme(W - 200, 990, 160, { oneWay: true }),
            plateforme(W - 380, 920, 160, { oneWay: true }),
            plateforme(W - 200, 850, 160, { oneWay: true }),
            plateforme(W - 380, 780, 160, { oneWay: true }),
            plateforme(W - 200, 710, 160, { oneWay: false }),  // palier forge

            // Voie centrale
            plateforme(600, 990, 200, { oneWay: true })
        ];

        const obstacles = [
            // Plaque qui spawn 3 pieux dans le couloir bas
            plaque(W / 2, Y_SOL, 'pieux', {
                positions: [
                    { x: W / 2 - 200, y: Y_SOL - 14 },
                    { x: W / 2,        y: Y_SOL - 14 },
                    { x: W / 2 + 200, y: Y_SOL - 14 }
                ],
                dureeMs: 3000
            }),
            // Brasier de forge SUR le palier haut (justifié)
            brasier(W - 280, 710, { largeur: 100, cycleMs: 2800, offsetMs: 0 })
        ];

        const portes = {};
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('S')) portes.S = porteS(W / 2, Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
