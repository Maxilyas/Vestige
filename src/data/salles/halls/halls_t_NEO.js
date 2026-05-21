// Salle : Halls Cendrés — Voûte Fendue (signature, T-NEO)
//
// ARCHITECTURE : grande nef 3 étages. Murs latéraux pleins selon portes.
// Mezzanine fendue par un mur fissuré central (raccourci si cassé). Plafond
// haut avec cheminée porte N. Brasiers latéraux dans niches d'autel.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE, porteN,
    mur, murLateralGauche, murLateralDroit,
    murFissure, brasier, eboulis, murSecret
} from '../_format.js';

const W = 2400;
const H = 1400;
const Y_SOL = H - HAUTEUR_SOL;        // 1360
const Y_MEZZ = 900;
const Y_PALIER_N = 330;
const Y_PLAFOND = 60;

export const halls_t_NEO = {
    id: 'halls_t_NEO',
    biome: 'halls_cendres',
    nom: 'Voûte Fendue',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['N', 'E', 'O'],
    archetypesCompatibles: ['hall', 'crypte'],
    rolesAutorises: ['main', 'alt', 'entree'],
    unique: true,

    generer({ portesActives = ['N', 'E', 'O'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),

            // ─── PLAFOND : cheminée porte N centrale + voûte aux bords
            plafondCathedrale(0,           W / 2 - 200, Y_PLAFOND + 80),
            plafondCathedrale(W / 2 + 200, W,           Y_PLAFOND + 80),

            // ─── MURS LATÉRAUX
            ...(portesActives.includes('O') ? [mur(15, Y_PLAFOND, Y_SOL - 100)] : [murLateralGauche(Y_PLAFOND, Y_SOL)]),
            ...(portesActives.includes('E') ? [mur(W - 15, Y_PLAFOND, Y_SOL - 100)] : [murLateralDroit(W, Y_PLAFOND, Y_SOL)]),

            // ─── NICHES D'AUTEL (estrades latérales pour brasiers)
            plateforme(200,    Y_SOL - 60, 200, { oneWay: false }),
            plateforme(W - 200, Y_SOL - 60, 200, { oneWay: false }),

            // ─── ÉTAGE 1 : mezzanine continue fendue (mur central HP=5)
            plateforme(W / 2 - 540, Y_MEZZ, 700, { oneWay: false }),
            plateforme(W / 2 + 540, Y_MEZZ, 700, { oneWay: false }),

            // ─── ACCÈS MEZZANINE côté gauche (Δ80 chaîne)
            plateforme(220,  1290, 130, { oneWay: true }),
            plateforme(400,  1210, 130, { oneWay: true }),
            plateforme(220,  1130, 130, { oneWay: true }),
            plateforme(400,  1050, 130, { oneWay: true }),
            plateforme(220,   970, 130, { oneWay: true }),
            // Accès mezzanine côté droit
            plateforme(W - 220, 1290, 130, { oneWay: true }),
            plateforme(W - 400, 1210, 130, { oneWay: true }),
            plateforme(W - 220, 1130, 130, { oneWay: true }),
            plateforme(W - 400, 1050, 130, { oneWay: true }),
            plateforme(W - 220,  970, 130, { oneWay: true }),

            // ─── ÉTAGE 2 : approche porte N (Δ80 chaîne)
            plateforme(W / 2 - 320, 820, 160, { oneWay: true }),
            plateforme(W / 2 + 320, 820, 160, { oneWay: true }),
            plateforme(W / 2 - 160, 740, 160, { oneWay: true }),
            plateforme(W / 2 + 160, 740, 160, { oneWay: true }),
            plateforme(W / 2,       660, 200, { oneWay: true }),
            plateforme(W / 2,       580, 200, { oneWay: true }),
            plateforme(W / 2,       500, 200, { oneWay: true }),
            plateforme(W / 2,       430, 220, { oneWay: true }),

            // ─── PALIER porte N
            plateforme(W / 2, Y_PALIER_N + 70, 280, { oneWay: true }),
            plateforme(W / 2, Y_PALIER_N,      280, { oneWay: true })
        ];

        const obstacles = [
            // Mur fissuré central qui fend la mezzanine (raccourci visible)
            murFissure(W / 2, Y_MEZZ - 130, { largeur: 50, hauteur: 130, hp: 5, dropSel: true, dropFragmentFamille: 'blanc' }),

            // Éboulis ambiance au sol
            eboulis(W / 2 - 200, Y_SOL - 110, { largeur: 90, hauteur: 110, hp: 2 }),
            eboulis(W / 2 + 200, Y_SOL - 110, { largeur: 90, hauteur: 110, hp: 2 }),

            // Brasiers sur les niches d'autel (foyers funéraires latéraux)
            brasier(200,    Y_SOL - 60, { largeur: 140, cycleMs: 4000, offsetMs: 0 }),
            brasier(W - 200, Y_SOL - 60, { largeur: 140, cycleMs: 4000, offsetMs: 2000 }),

            // Mur SECRET dans le plafond du couloir gauche de la mezzanine
            // (au-dessus du palier 740, à gauche)
            murSecret(W / 2 - 160, 690, 160, 40, { hp: 4, orientation: 'sol', dropSel: true })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('N')) portes.N = porteN(W / 2, Y_PALIER_N - 90);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
