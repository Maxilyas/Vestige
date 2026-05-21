// Salle : Halls Cendrés — Sanctuaire éteint (impasse O)
//
// ARCHITECTURE : petite salle close, ambiance recueillie. 3 murs latéraux
// pleins (sauf O). Foyer central éteint sur estrade. Coffre garanti.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO,
    mur, murLateralDroit,
    brasier, eboulis, murSecret
} from '../_format.js';

const W = 1400;
const H = 900;
const Y_SOL = H - HAUTEUR_SOL;        // 860
const Y_PLAFOND = 60;

export const halls_impasse_O = {
    id: 'halls_impasse_O',
    biome: 'halls_cendres',
    nom: 'Sanctuaire éteint',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['O'],
    archetypesCompatibles: ['sanctuaire', 'crypte'],
    rolesAutorises: ['deadend', 'alt'],

    generer({ portesActives = ['O'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),

            // ─── PLAFOND voûte basse (sanctuaire)
            plafondCathedrale(0,    400, Y_PLAFOND + 80),
            plafondCathedrale(400,  900, Y_PLAFOND + 160),  // voûte centrale
            plafondCathedrale(900,  W,   Y_PLAFOND + 80),

            // ─── MURS LATÉRAUX
            mur(15, Y_PLAFOND, Y_SOL - 100),  // gauche partial (porte O)
            murLateralDroit(W, Y_PLAFOND, Y_SOL),  // droit plein

            // ─── ESTRADE FOYER (centre)
            plateforme(W - 400, Y_SOL - 50, 280, { oneWay: false }),

            // ─── PALIERS latéraux
            plateforme(700, 770, 130, { oneWay: true }),
            plateforme(900, 770, 130, { oneWay: true })
        ];

        const obstacles = [
            // Brasier mourant sur l'estrade (cycle TRÈS long)
            brasier(W - 400, Y_SOL - 50, { largeur: 160, cycleMs: 6000, offsetMs: 0 }),
            eboulis(450, Y_SOL - 110, { largeur: 80, hauteur: 110, hp: 2 }),

            // Mur SECRET dans le mur droit (cache une niche secondaire — bonus)
            murSecret(W - 45, Y_SOL - 200, 60, 100, { hp: 4, orientation: 'mur', dropSel: true })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
