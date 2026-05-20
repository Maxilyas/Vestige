// Salle : Ruines basses — Forum (T-NEO)
//
// T-shape : O-E + N (mezzanine haute). 2 étages : sol combat, mezzanine
// haute (porte N + coffre). Escalier latéral pour monter.

import {
    HAUTEUR_SOL, sol, plafond, plateforme,
    porteO, porteE, porteN,
    plaque, eboulis
} from '../_format.js';

const W = 2400;
const H = 1100;
const Y_SOL = H - HAUTEUR_SOL;        // 1060
const Y_MEZZANINE = 280;

export const ruines_t_NEO = {
    id: 'ruines_t_NEO',
    biome: 'ruines_basses',
    nom: 'Forum (T-NEO)',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['N', 'E', 'O'],
    archetypesCompatibles: ['hall', 'sanctuaire'],

    generer({ portesActives = ['O', 'E', 'N'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),

            // ─── Voûtes effondrées au sol (couverture combat) ──────────
            plateforme(500,  990, 130, { oneWay: true }),  // saut 70 depuis sol
            plateforme(900,  990, 130, { oneWay: true }),
            plateforme(1300, 990, 130, { oneWay: true }),
            plateforme(W - 500, 990, 130, { oneWay: true }),

            // ─── Escalier latéral gauche vers mezzanine ────────────────
            plateforme(200,  990, 110, { oneWay: true }),
            plateforme(80,   920, 110, { oneWay: true }),
            plateforme(200,  850, 110, { oneWay: true }),
            plateforme(80,   780, 110, { oneWay: true }),
            plateforme(200,  710, 110, { oneWay: true }),
            plateforme(80,   640, 110, { oneWay: true }),
            plateforme(200,  570, 110, { oneWay: true }),
            plateforme(80,   500, 110, { oneWay: true }),
            plateforme(200,  430, 110, { oneWay: true }),
            plateforme(80,   360, 110, { oneWay: true }),
            // Palier raccord vers mezzanine (saut horiz vers centre)
            plateforme(220,  290, 110, { oneWay: true }),

            // ─── Mezzanine haute large (porte N + coffre) ──────────────
            plateforme(W / 2, Y_MEZZANINE, 1800, { oneWay: false })
        ];

        const obstacles = [
            // Plaque sol : déclenche pieux devant porte E
            plaque(700, Y_SOL, 'pieux', {
                dureeMs: 2500,
                positions: [
                    { x: W - 200, y: Y_SOL - 9 },
                    { x: W - 120, y: Y_SOL - 9 }
                ]
            }),
            // Éboulis qui bloque le sol vers la droite (force détour ou casse)
            eboulis(1700, Y_SOL - 110, { largeur: 110, hp: 3, dropSel: true })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('N')) portes.N = porteN(W / 2, Y_MEZZANINE - 90);

        const coffreForce = { x: W / 2 + 400, y: Y_MEZZANINE - 12 };

        return {
            plateformes,
            obstacles,
            zones: [],
            portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 },
            coffreForce
        };
    }
};
