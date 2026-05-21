// Salle : Halls Cendrés — Réseau de Plaques (signature NEO)
//
// ARCHITECTURE : salle puzzle 2 étages. Murs latéraux pleins selon portes.
// 3 plaques de pression réparties activent des pieux distants. Mur SECRET
// dans le mur lateral gauche (niche bonus). Brasier UNIQUE marquer porte N
// au-dessus de l'escalier central.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE, porteN,
    mur, murLateralGauche, murLateralDroit,
    plaque, murSecret, brasier
} from '../_format.js';

const W = 2600;
const H = 1200;
const Y_SOL = H - HAUTEUR_SOL;        // 1160
const Y_PALIER_N = 310;
const Y_PLAFOND = 60;

export const halls_reseau_plaques = {
    id: 'halls_reseau_plaques',
    biome: 'halls_cendres',
    nom: 'Réseau de Plaques',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['N', 'E', 'O'],
    archetypesCompatibles: ['hall', 'crypte'],
    rolesAutorises: ['main', 'alt', 'entree'],
    unique: true,

    generer({ portesActives = ['N', 'E', 'O'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),

            // ─── PLAFOND avec cheminée porte N centrale
            plafondCathedrale(0,           1100,        Y_PLAFOND + 100),
            plafondCathedrale(1500,        W,           Y_PLAFOND + 100),

            // ─── MURS LATÉRAUX
            ...(portesActives.includes('O') ? [mur(15, Y_PLAFOND, Y_SOL - 100)] : [murLateralGauche(Y_PLAFOND, Y_SOL)]),
            ...(portesActives.includes('E') ? [mur(W - 15, Y_PLAFOND, Y_SOL - 100)] : [murLateralDroit(W, Y_PLAFOND, Y_SOL)]),

            // ─── ESCALADE Δ80 gauche→droite
            plateforme(400,  1090, 200, { oneWay: true }),
            plateforme(700,  1010, 200, { oneWay: true }),
            plateforme(1000,  930, 200, { oneWay: true }),
            plateforme(1300,  850, 200, { oneWay: true }),
            plateforme(1600,  770, 200, { oneWay: true }),
            plateforme(1900,  690, 200, { oneWay: true }),
            plateforme(2200,  610, 200, { oneWay: true }),

            // ─── NICHE CACHÉE (latérale gauche, derrière mur secret)
            plateforme(180, 1090, 160, { oneWay: false }),

            // ─── COUCHE HAUTE : approche porte N (Δ80 chaîne au-dessus palier 850 central)
            plateforme(1300,  770, 280, { oneWay: true }),
            plateforme(1300,  690, 280, { oneWay: true }),
            plateforme(1300,  610, 280, { oneWay: true }),
            plateforme(1300,  530, 280, { oneWay: true }),
            plateforme(1300,  450, 280, { oneWay: true }),
            plateforme(1300, Y_PALIER_N + 70, 220, { oneWay: true }),  // 380
            plateforme(1300, Y_PALIER_N,      220, { oneWay: true })   // 310
        ];

        const obstacles = [
            // 3 plaques au sol — chacune spawn pieux dans une zone différente
            plaque(500, Y_SOL, 'pieux', {
                positions: [
                    { x: 1100, y: Y_SOL - 14 },
                    { x: 1300, y: Y_SOL - 14 },
                    { x: 1500, y: Y_SOL - 14 }
                ],
                dureeMs: 2500
            }),
            plaque(1300, Y_SOL, 'pieux', {
                positions: [
                    { x: 1900, y: Y_SOL - 14 },
                    { x: 2100, y: Y_SOL - 14 }
                ],
                dureeMs: 2500
            }),
            plaque(2100, Y_SOL, 'pieux', {
                positions: [
                    { x: 400, y: Y_SOL - 14 },
                    { x: 700, y: Y_SOL - 14 }
                ],
                dureeMs: 2500
            }),

            // Mur SECRET dans le mur lateral gauche (cache la niche)
            murSecret(50, 1080, 60, 120, { hp: 4, orientation: 'mur', dropSel: true }),

            // Brasier marqueur porte N (sur palier central)
            brasier(1300, Y_SOL, { largeur: 140, cycleMs: 4000, offsetMs: 0 })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('N')) portes.N = porteN(1300, Y_PALIER_N - 90);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
