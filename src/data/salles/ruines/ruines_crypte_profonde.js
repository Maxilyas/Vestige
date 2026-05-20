// Salle : Ruines basses — La Crypte profonde
//
// Salle verticale NS, descente exigeante. Pieux mécaniques côté gauche
// et droit qui pulsent. Sol = fond piégé + éboulis sortie S.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteN, porteS,
    eboulis, racinesReflux
} from '../_format.js';

const W = 1400;
const H = 1400;
const Y_SOL = H - HAUTEUR_SOL;        // 1360
const Y_PORTE_N = 120;

export const ruines_crypte_profonde = {
    id: 'ruines_crypte_profonde',
    biome: 'ruines_basses',
    nom: 'Crypte profonde',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['N', 'S'],
    archetypesCompatibles: ['crypte', 'puits'],
    rolesAutorises: ['main', 'alt'],

    generer({ portesActives = ['N', 'S'] } = {}) {
        const plateformes = [];

        // Sol (fond piégé)
        plateformes.push(sol(0, W, Y_SOL));

        // Mezzanine d'entrée (porte N en haut au centre)
        plateformes.push(plateforme(W / 2, Y_PORTE_N + 80, 240, { oneWay: false }));

        // Paliers descendants ZIGZAG resserré (centres ±90, w=110 → gap ~70 ✓).
        // Premier palier yTop=270 atteignable depuis la mezzanine d'entrée (200+16/2=208).
        // Dernier palier yTop=1290 = Y_SOL-70 atteignable depuis sol (saut 70).
        const yTops = [270, 340, 410, 480, 550, 620, 690, 760, 830, 900,
                       970, 1040, 1110, 1180, 1230, 1290];
        for (let i = 0; i < yTops.length; i++) {
            const x = W / 2 + (i % 2 === 0 ? -90 : 90);
            plateformes.push(plateforme(x, yTops[i], 110, { oneWay: true }));
        }

        // ─── Obstacles ─────────────────────────────────────────────────
        const obstacles = [
            // Pieux mécaniques sur les côtés à des hauteurs variées (désync)
            racinesReflux(80,      Y_SOL, { largeur: 60, hauteur: 60, offsetMs: 0    }),
            racinesReflux(W - 80,  Y_SOL, { largeur: 60, hauteur: 60, offsetMs: 1000 }),
            racinesReflux(80,      900,   { largeur: 60, hauteur: 60, offsetMs: 1500 }),
            racinesReflux(W - 80,  900,   { largeur: 60, hauteur: 60, offsetMs: 500  }),
            racinesReflux(80,      500,   { largeur: 60, hauteur: 60, offsetMs: 2000 }),
            racinesReflux(W - 80,  500,   { largeur: 60, hauteur: 60, offsetMs: 700  }),

            // Pieux fixes au fond (entre les côtés)
            { type: 'pieu', x: 350,  y: Y_SOL - 9, orientation: 'sol' },
            { type: 'pieu', x: 1050, y: Y_SOL - 9, orientation: 'sol' },

            // Éboulis qui bloque la porte S
            eboulis(W / 2 - 60, Y_SOL - 110, { largeur: 120, hp: 4 })
        ];

        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(W / 2, Y_PORTE_N);
        if (portesActives.includes('S')) portes.S = porteS(W / 2, Y_SOL);

        return {
            plateformes,
            obstacles,
            zones: [],
            portes,
            spawnDefault: { x: W / 2, y: Y_PORTE_N + 60 }
        };
    }
};
