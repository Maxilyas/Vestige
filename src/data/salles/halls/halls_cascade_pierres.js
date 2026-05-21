// Salle : Halls Cendrés — La Cascade de Pierres (signature)
//
// ARCHITECTURE : ancienne galerie effondrée. Sol NON-CONTINU (gouffre central
// mortel — la voûte s'est effondrée). Murs latéraux pleins. Plafond crevé.
// Le joueur doit traverser le gouffre par les paliers hauts — mais des rocs
// tombent rythme cardiaque.
//
// Mur SECRET dans le mur lateral gauche → niche coffre cachée.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    mur, murLateralGauche, murLateralDroit,
    rocQuiTombe, murSecret, brasier
} from '../_format.js';

const W = 2800;
const H = 1300;
const Y_SOL = H - HAUTEUR_SOL;        // 1260
const Y_PLAFOND = 60;

export const halls_cascade_pierres = {
    id: 'halls_cascade_pierres',
    biome: 'halls_cendres',
    nom: 'Cascade de Pierres',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['crypte', 'hall'],
    rolesAutorises: ['main', 'alt', 'entree'],
    unique: true,
    gouffreMort: true,   // gouffre central = chute mortelle

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [
            // ─── SOL FRAGMENTÉ : 2 segments séparés par un gouffre central
            sol(0,    900,   Y_SOL),    // sol gauche
            sol(1900, W,     Y_SOL),    // sol droite
            // Le gouffre = de x=900 à x=1900 (1000 px de vide mortel)

            // ─── PLAFOND brisé (lecture "effondrement")
            plafondCathedrale(0,    700,  Y_PLAFOND + 100),
            plafondCathedrale(700,  1200, Y_PLAFOND + 280),    // grand trou (par où les rocs tombent)
            plafondCathedrale(1200, 1800, Y_PLAFOND + 380),
            plafondCathedrale(1800, 2200, Y_PLAFOND + 280),
            plafondCathedrale(2200, W,    Y_PLAFOND + 100),

            // ─── MURS LATÉRAUX ──
            ...(portesActives.includes('O') ? [mur(15, Y_PLAFOND, Y_SOL - 100)] : [murLateralGauche(Y_PLAFOND, Y_SOL)]),
            ...(portesActives.includes('E') ? [mur(W - 15, Y_PLAFOND, Y_SOL - 100)] : [murLateralDroit(W, Y_PLAFOND, Y_SOL)]),

            // ─── PALIERS DE TRAVERSÉE (au-dessus du gouffre)
            plateforme(700,  1180, 150, { oneWay: true }),
            plateforme(880,  1100, 140, { oneWay: true }),
            plateforme(1080, 1020, 140, { oneWay: true }),
            plateforme(1280,  940, 140, { oneWay: true }),
            plateforme(1500,  860, 200, { oneWay: false }),   // palier central refuge
            plateforme(1720,  940, 140, { oneWay: true }),
            plateforme(1920, 1020, 140, { oneWay: true }),
            plateforme(2100, 1100, 140, { oneWay: true }),

            // ─── NICHE LATÉRALE (sous le mur lateral gauche, derrière mur secret)
            // Accès depuis sol gauche via stepping stone (Δ60 du sol 1260)
            plateforme(220, Y_SOL - 60, 140, { oneWay: true }),   // stepping
            plateforme(120, Y_SOL - 110, 180, { oneWay: false })  // palier coffre caché
        ];

        const obstacles = [
            // Rocs tombant depuis le trou du plafond (rythme tension)
            rocQuiTombe(1080, 280, 1020),
            rocQuiTombe(1500, 280, 860),
            rocQuiTombe(1920, 280, 1020),

            // Mur SECRET vertical dans le mur lateral gauche (au-dessus du palier coffre)
            // Le joueur doit attaquer le "mur" qu'il croit être la paroi
            murSecret(50, Y_SOL - 200, 60, 110, { hp: 4, orientation: 'mur', dropSel: true, dropFragmentFamille: 'blanc' }),

            // Brasier d'ambiance dans la niche (témoin oublié)
            brasier(120, Y_SOL - 110, { largeur: 100, cycleMs: 5000, offsetMs: 0 })
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
