// Salle : Halls Cendrés — Le Foyer Éteint (signature OES)
//
// ARCHITECTURE : grande nef 3 niveaux. Mezzanines latérales + sous-salle
// haute (palier coffre derrière mur explosif visible). Murs latéraux pleins
// selon portes. Foyer central énorme dans cuvette de pierre.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE, porteS,
    mur, murLateralGauche, murLateralDroit,
    murExplosif, brasier, eboulis
} from '../_format.js';

const W = 2800;
const H = 1300;
const Y_SOL = H - HAUTEUR_SOL;        // 1260
const Y_MEZZ = 870;
const Y_HAUT = 540;
const Y_PLAFOND = 60;

export const halls_foyer_eteint = {
    id: 'halls_foyer_eteint',
    biome: 'halls_cendres',
    nom: 'Le Foyer Éteint',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['O', 'E', 'S'],
    archetypesCompatibles: ['hall', 'crypte'],
    rolesAutorises: ['main', 'alt', 'entree'],
    unique: true,

    generer({ portesActives = ['O', 'E', 'S'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),

            // ─── PLAFOND organique cathédrale
            plafondCathedrale(0,    600,  Y_PLAFOND + 80),
            plafondCathedrale(600,  1100, Y_PLAFOND + 200),
            plafondCathedrale(1100, 1700, Y_PLAFOND + 280),    // grande voûte centrale
            plafondCathedrale(1700, 2200, Y_PLAFOND + 200),
            plafondCathedrale(2200, W,    Y_PLAFOND + 80),

            // ─── MURS LATÉRAUX
            ...(portesActives.includes('O') ? [mur(15, Y_PLAFOND, Y_SOL - 100)] : [murLateralGauche(Y_PLAFOND, Y_SOL)]),
            ...(portesActives.includes('E') ? [mur(W - 15, Y_PLAFOND, Y_SOL - 100)] : [murLateralDroit(W, Y_PLAFOND, Y_SOL)]),

            // ─── FOYER CENTRAL (cuvette massive de pierre — brasier majeur)
            plateforme(W / 2, Y_SOL - 80, 360, { oneWay: false }),

            // ─── MEZZANINE continue fendue par mur explosif central
            plateforme(W / 2 - 400, Y_MEZZ, 600, { oneWay: false }),
            plateforme(W / 2 + 400, Y_MEZZ, 600, { oneWay: false }),
            plateforme(W / 2, Y_MEZZ - 80, 160, { oneWay: true }),    // stepping central

            // ─── ACCÈS MEZZANINE (Δ80 chaîne) côté gauche
            plateforme(240,  1190, 140, { oneWay: true }),
            plateforme(420,  1110, 140, { oneWay: true }),
            plateforme(580,  1030, 140, { oneWay: true }),
            plateforme(720,   950, 160, { oneWay: true }),
            // Accès mezzanine côté droit
            plateforme(W - 240, 1190, 140, { oneWay: true }),
            plateforme(W - 420, 1110, 140, { oneWay: true }),
            plateforme(W - 580, 1030, 140, { oneWay: true }),
            plateforme(W - 720,  950, 160, { oneWay: true }),

            // ─── STEPPING STONES vers sous-salle haute (Δ85 chaîne)
            plateforme(W / 2 - 400, 785, 140, { oneWay: true }),
            plateforme(W / 2 + 400, 785, 140, { oneWay: true }),
            plateforme(W / 2 - 200, 700, 160, { oneWay: true }),
            plateforme(W / 2 + 200, 700, 160, { oneWay: true }),
            plateforme(W / 2,       615, 200, { oneWay: true }),
            plateforme(W / 2,       Y_HAUT, 280, { oneWay: false })  // palier coffre 540
        ];

        const obstacles = [
            // Mur EXPLOSIF visible gardant la sous-salle haute (avertissement rouge)
            murExplosif(W / 2, Y_HAUT + 30, { largeur: 200, hauteur: 40, hp: 5, dropSel: true, dropFragmentFamille: 'blanc' }),

            // Foyer central majeur SUR la cuvette (cycle long, danger violent)
            brasier(W / 2, Y_SOL - 80, { largeur: 280, cycleMs: 5000, offsetMs: 0 }),
            // Brasiers latéraux décalés sur niches d'autel
            brasier(W / 2 - 800, Y_SOL, { largeur: 100, cycleMs: 3500, offsetMs: 1500 }),
            brasier(W / 2 + 800, Y_SOL, { largeur: 100, cycleMs: 3500, offsetMs: 3500 }),
            // Éboulis ambiance
            eboulis(600,     Y_SOL - 110, { largeur: 80, hauteur: 110, hp: 2 }),
            eboulis(W - 600, Y_SOL - 110, { largeur: 80, hauteur: 110, hp: 2 })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('S')) portes.S = porteS(W / 2 + 600, Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
