// Salle : Halls Cendrés — La Brasserie (signature)
//
// ARCHITECTURE : grande forge verticale. 4 étages de plateformes + foyers
// principaux. Murs latéraux pleins (atelier fermé). Plafond haut avec
// stalactites. Brasiers groupés près des CHEMINÉES (trous du plafond),
// pas étalés au sol.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    mur, murLateralGauche, murLateralDroit,
    pieuPlafond, ressort, brasier, murSecret
} from '../_format.js';

const W = 2400;
const H = 1200;
const Y_SOL = H - HAUTEUR_SOL;        // 1160
const Y_PLAFOND = 60;

export const halls_brasserie = {
    id: 'halls_brasserie',
    biome: 'halls_cendres',
    nom: 'La Brasserie',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'pont'],
    rolesAutorises: ['main', 'alt', 'entree'],
    unique: true,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),

            // ─── PLAFOND avec 2 CHEMINÉES (trous où la fumée monte)
            plafondCathedrale(0,        500,  Y_PLAFOND + 80),
            plafondCathedrale(700,      900,  Y_PLAFOND + 60),       // cheminée 1 ouverte (gap 500-700)
            plafondCathedrale(1100,     1300, Y_PLAFOND + 60),       // pic plafond
            plafondCathedrale(1500,     1700, Y_PLAFOND + 60),       // cheminée 2 ouverte (gap 1700-1900)
            plafondCathedrale(1900,     W,    Y_PLAFOND + 80),

            // ─── MURS LATÉRAUX
            ...(portesActives.includes('O') ? [mur(15, Y_PLAFOND, Y_SOL - 100)] : [murLateralGauche(Y_PLAFOND, Y_SOL)]),
            ...(portesActives.includes('E') ? [mur(W - 15, Y_PLAFOND, Y_SOL - 100)] : [murLateralDroit(W, Y_PLAFOND, Y_SOL)]),

            // ─── FOYERS PRINCIPAUX (cuvettes surélevées sous les cheminées)
            plateforme(600,  Y_SOL - 80, 240, { oneWay: false }),  // foyer 1 sous cheminée
            plateforme(1800, Y_SOL - 80, 240, { oneWay: false }),  // foyer 2 sous cheminée

            // ─── ÉTAGES VERTICAUX (Δ85)
            plateforme(400,  1075, 160, { oneWay: true }),
            plateforme(900,  1075, 160, { oneWay: true }),
            plateforme(1300, 1075, 160, { oneWay: true }),
            plateforme(1900, 1075, 160, { oneWay: true }),
            // Étage 2 (Δ85)
            plateforme(550,  990, 180, { oneWay: true }),
            plateforme(1100, 990, 180, { oneWay: true }),
            plateforme(1500, 990, 180, { oneWay: true }),
            // Étage 3 (Δ85)
            plateforme(750,  905, 200, { oneWay: true }),
            plateforme(1300, 905, 200, { oneWay: true }),
            // Étage 4 (Δ85, route alt safe)
            plateforme(W / 2, 820, 380, { oneWay: false }),

            // ─── PALIER SECRET tout en haut (sous la cheminée 2, derrière murSecret)
            // Bridge depuis étage 4 (W/2=1200, 820) vers colonne secret (1800)
            plateforme(1500, 770, 160, { oneWay: true }),     // Δ50 vert, gap 20 depuis étage 4
            plateforme(1650, 700, 160, { oneWay: true }),     // Δ70
            plateforme(1800, 630, 180, { oneWay: true }),     // Δ70
            plateforme(1800, 560, 180, { oneWay: true }),
            plateforme(1800, 490, 180, { oneWay: true }),
            plateforme(1800, 420, 180, { oneWay: true }),
            plateforme(1800, 350, 180, { oneWay: true }),
            plateforme(1800, 280, 200, { oneWay: false })     // coffre caché (Δ70)
        ];

        const obstacles = [
            // Ressorts pour shortcuts verticaux
            ressort(220, Y_SOL),
            ressort(W - 220, Y_SOL),
            // Pieux plafond au-dessus de l'étage 4 (signal "pas plus haut sans cheminée")
            pieuPlafond(W / 2 - 120, 790),
            pieuPlafond(W / 2,        790),
            pieuPlafond(W / 2 + 120, 790),

            // 2 brasiers MAJEURS sur les foyers (sous les cheminées)
            brasier(600,  Y_SOL - 80, { largeur: 200, cycleMs: 3000, offsetMs: 0 }),
            brasier(1800, Y_SOL - 80, { largeur: 200, cycleMs: 3000, offsetMs: 1500 }),

            // Mur SECRET dans le plafond de la cheminée 2 (accès au palier secret)
            // Le joueur monte par la cheminée 2 (trou ouvert) et tape le plafond
            murSecret(1800, 360, 200, 40, { hp: 4, orientation: 'sol', dropSel: true, dropFragmentFamille: 'blanc' })
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
