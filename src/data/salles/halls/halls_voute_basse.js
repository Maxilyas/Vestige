// Salle : Halls Cendrés — Voûte basse
//
// ARCHITECTURE : tunnel intérieur très bas (plafond proche). Murs latéraux
// pleins. Sol continu mais oppressant (peu de hauteur de plafond). Brasier
// unique dans une niche carrée du mur droit. Mur SECRET dans le sol →
// passage vers cave inférieure (chute volontaire).
//
// gouffreMort: false — la cave inférieure est plate, le joueur peut y descendre

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    mur, murLateralGauche, murLateralDroit,
    eboulis, brasier, murSecret
} from '../_format.js';

const W = 2400;
const H = 1050;
const Y_SOL = H - HAUTEUR_SOL;        // 1010
const Y_VOUTE = Y_SOL - 130;          // plafond bas (130 = serré mais passable)
const Y_PLAFOND = 60;

export const halls_voute_basse = {
    id: 'halls_voute_basse',
    biome: 'halls_cendres',
    nom: 'Voûte basse',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['crypte', 'hall'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),

            // ─── DOUBLE PLAFOND : voûte basse (intérieur tunnel) +
            // plafond supérieur de la salle. Crée une sous-section "tunnel".
            // Plafond tunnel (intérieur) avec gap central pour le passage haut
            plafondCathedrale(0,             W / 2 - 200, Y_VOUTE),
            plafondCathedrale(W / 2 + 200,   W,           Y_VOUTE),
            // Plafond extérieur ultime
            plafondCathedrale(0,    600,  Y_PLAFOND + 100),
            plafondCathedrale(600,  900,  Y_PLAFOND + 200),
            plafondCathedrale(900,  1500, Y_PLAFOND + 300),    // gros creux où l'on peut monter
            plafondCathedrale(1500, 1800, Y_PLAFOND + 200),
            plafondCathedrale(1800, W,    Y_PLAFOND + 100),

            // ─── MURS LATÉRAUX
            ...(portesActives.includes('O') ? [mur(15, Y_PLAFOND, Y_SOL - 100)] : [murLateralGauche(Y_PLAFOND, Y_SOL)]),
            ...(portesActives.includes('E') ? [mur(W - 15, Y_PLAFOND, Y_SOL - 100)] : [murLateralDroit(W, Y_PLAFOND, Y_SOL)]),

            // ─── NICHE BRASIER (creusée dans le mur droit, hauteur du sol)
            plateforme(W - 200, Y_SOL - 50, 140, { oneWay: false }),  // estrade niche

            // ─── PASSAGE HAUT (atteignable par le gap central du plafond bas)
            // Stepping stones depuis sol pour traverser le gap voûte (Δ70-80)
            plateforme(W / 2,       Y_SOL - 70,  180, { oneWay: true }),    // Δ70 depuis sol 1010 → 940
            plateforme(W / 2 - 200, Y_SOL - 150, 140, { oneWay: true }),
            plateforme(W / 2 + 200, Y_SOL - 150, 140, { oneWay: true }),
            plateforme(W / 2 - 240, Y_VOUTE - 90, 140, { oneWay: true }),    // 790 (Δ70)
            plateforme(W / 2 + 240, Y_VOUTE - 90, 140, { oneWay: true }),
            plateforme(W / 2,       Y_VOUTE - 180, 220, { oneWay: false }),  // mezzanine haute 700 (Δ90)

            // ─── PALIER COFFRE caché (au-dessus de la mezzanine, derrière mur secret latéral)
            plateforme(W / 2 + 300, Y_VOUTE - 250, 180, { oneWay: false })   // 630 (Δ70)
        ];

        const obstacles = [
            // Éboulis dans le couloir bas (force tunnel) — 2 max, espacés
            eboulis(700,  Y_SOL - 110, { largeur: 80, hauteur: 110, hp: 2 }),
            eboulis(1700, Y_SOL - 110, { largeur: 80, hauteur: 110, hp: 2 }),

            // Brasier UNIQUE dans la niche du mur droit
            brasier(W - 200, Y_SOL - 50, { largeur: 100, cycleMs: 4000, offsetMs: 0 }),

            // Mur SECRET vertical entre mezzanine haute et palier coffre caché
            murSecret(W / 2 + 200, Y_VOUTE - 250, 50, 130, { hp: 4, orientation: 'mur', dropSel: true })
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
