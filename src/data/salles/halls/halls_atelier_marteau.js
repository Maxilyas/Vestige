// Salle : Halls Cendrés — Atelier du Marteau
//
// ARCHITECTURE : ancienne salle de forge. Sol continu. Murs latéraux pleins.
// Plafond avec poutres apparentes (irrégulier). 2 NICHES de travail latérales
// (établis en éboulis cassables). Foyer principal au centre (1 brasier majeur).
// Mur SECRET dans la cloison droite (cache cellule de stockage avec coffre).

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    mur, murLateralGauche, murLateralDroit,
    eboulis, brasier, murSecret
} from '../_format.js';

const W = 2400;
const H = 1050;
const Y_SOL = H - HAUTEUR_SOL;        // 1010
const Y_PLAFOND = 60;

export const halls_atelier_marteau = {
    id: 'halls_atelier_marteau',
    biome: 'halls_cendres',
    nom: 'Atelier du Marteau',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),

            // ─── PLAFOND avec poutres apparentes (irrégulier, signal atelier)
            plafondCathedrale(0,    400,  Y_PLAFOND + 80),
            plafondCathedrale(400,  700,  Y_PLAFOND + 160),
            plafondCathedrale(700,  1100, Y_PLAFOND + 100),    // poutre principale
            plafondCathedrale(1100, 1500, Y_PLAFOND + 160),
            plafondCathedrale(1500, 2000, Y_PLAFOND + 100),    // poutre principale 2
            plafondCathedrale(2000, W,    Y_PLAFOND + 80),

            // ─── MURS LATÉRAUX
            ...(portesActives.includes('O') ? [mur(15, Y_PLAFOND, Y_SOL - 100)] : [murLateralGauche(Y_PLAFOND, Y_SOL)]),
            ...(portesActives.includes('E') ? [mur(W - 15, Y_PLAFOND, Y_SOL - 100)] : [murLateralDroit(W, Y_PLAFOND, Y_SOL)]),

            // ─── CLOISON INTÉRIEURE (sépare l'atelier de la cellule cachée)
            mur(W - 400, Y_SOL - 280, Y_SOL),

            // ─── PALIERS DE TRAVAIL (étagères + établis hauts)
            plateforme(400,  920, 130, { oneWay: true }),
            plateforme(620,  860, 130, { oneWay: true }),
            plateforme(840,  800, 130, { oneWay: true }),
            plateforme(1060, 730, 140, { oneWay: true }),
            plateforme(1280, 660, 140, { oneWay: true }),
            plateforme(1500, 590, 140, { oneWay: true }),
            plateforme(1740, 520, 240, { oneWay: false }),  // grand établi haut

            // ─── CELLULE CACHÉE (derrière la cloison, accessible via mur secret)
            // Stepping stones depuis sol (l'in-game la cloison bloque, mais la
            // géométrie reste cohérente pour le validateur BFS)
            plateforme(W - 200, Y_SOL - 70, 140, { oneWay: true }),   // Δ70 depuis sol
            plateforme(W - 200, Y_SOL - 140, 140, { oneWay: true }),
            plateforme(W - 200, Y_SOL - 200, 320, { oneWay: false })  // coffre intérieur (Δ60)
        ];

        const obstacles = [
            // Établis en éboulis (décor + obstacle léger au sol)
            eboulis(700,  Y_SOL - 110, { largeur: 80, hauteur: 110, hp: 2, dropSel: true }),
            eboulis(1500, Y_SOL - 110, { largeur: 80, hauteur: 110, hp: 2, dropSel: true }),

            // Forge éteinte au centre (brasier rare)
            brasier(W / 2, Y_SOL, { largeur: 140, cycleMs: 4500, offsetMs: 0 }),

            // Mur SECRET dans la cloison (visuellement identique à la paroi)
            murSecret(W - 400, Y_SOL - 200, 40, 110, { hp: 4, orientation: 'mur', dropSel: true, dropFragmentFamille: 'blanc' })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
