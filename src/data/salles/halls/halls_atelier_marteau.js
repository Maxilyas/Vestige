// Salle : Halls Cendrés — Atelier du Marteau (OE compact)
// (Phase 9.6 — Migration)
//
// INTENTION : ancienne salle de forge. Foyer central brasier + 2 niches
// d'établi (éboulis cassables) qui cachent un coffre.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    brasier, eboulis, murFissure
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_atelier_marteau = {
    id: 'halls_atelier_marteau',
    biome: 'halls_cendres',
    nom: 'L\'Atelier du Marteau',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'crypte'],
    rolesAutorises: ['main', 'alt'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Foyer central surélevé
        plateformes.push(plateforme(480, Y_SOL - 25, 160));

        // Paliers latéraux + mid
        plateformes.push(plateforme(140, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(820, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(300, 350, 110, { oneWay: true }));
        plateformes.push(plateforme(660, 350, 110, { oneWay: true }));

        // Palier sommet (alt route) — vert 95 depuis mid paliers (y=350)
        plateformes.push(plateforme(480, 255, 160, { oneWay: true }));

        const obstacles = [
            // Brasier central majeur
            brasier(480, Y_SOL - 25, { cycleMs: 2800, offsetMs: 0, largeur: 140 }),
            // 2 éboulis niches d'établi (sous paliers latéraux)
            eboulis(140, Y_SOL - 110, { largeur: 60, hauteur: 110, hp: 3, dropSel: true }),
            eboulis(820, Y_SOL - 110, { largeur: 60, hauteur: 110, hp: 3, dropFragmentFamille: 'blanc' }),
            // Mur fissuré gauche qui cache un coffre dans une niche secrète
            murFissure(60, 380, { largeur: 30, hauteur: 120, hp: 4 })
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
