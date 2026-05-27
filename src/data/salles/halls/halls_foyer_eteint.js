// Salle : Halls Cendrés — Le Foyer Éteint (OES compact, signature)
// (Phase 9.6 — Migration)
//
// SIGNATURE : 3 niveaux + sous-salle haute (palier coffre derrière mur
// explosif). Foyer central énorme. 3 sorties (O, E, S).

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE, porteS,
    brasier, murExplosif
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_foyer_eteint = {
    id: 'halls_foyer_eteint',
    biome: 'halls_cendres',
    nom: 'Le Foyer Éteint',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E', 'S'],
    archetypesCompatibles: ['hall', 'sanctuaire'],
    rolesAutorises: ['main', 'alt'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E', 'S'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Foyer central énorme
        plateformes.push(plateforme(480, Y_SOL - 30, 240));

        // Palier S surélevé (sortie sud)
        plateformes.push(plateforme(720, 440, 130, { oneWay: true }));

        // Mezzanines latérales
        plateformes.push(plateforme(150, 420, 110, { oneWay: true }));
        plateformes.push(plateforme(810, 420, 110, { oneWay: true }));
        plateformes.push(plateforme(290, 340, 110, { oneWay: true }));
        plateformes.push(plateforme(670, 340, 110, { oneWay: true }));

        // Niveau 2 (combat aérien)
        plateformes.push(plateforme(480, 270, 180, { oneWay: true }));

        // Sous-salle haute (palier coffre derrière mur explosif)
        plateformes.push(plateforme(480, 180, 160, { oneWay: true, tags: ['secret'] }));

        const obstacles = [
            brasier(480, Y_SOL - 30, { cycleMs: 3200, offsetMs: 0, largeur: 220 }),
            // Mur explosif au-dessus du palier secret (orientation horizontale, sol cassable)
            murExplosif(480, 210, { largeur: 160, hauteur: 24, hp: 4, dropFragmentFamille: 'noir' })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('S')) portes.S = porteS(720, 440);

        const coffreForce = { x: 480, y: 180 - 12 };

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 },
            coffreForce
        };
    }
};
