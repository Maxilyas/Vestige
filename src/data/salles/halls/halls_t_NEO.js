// Salle : Halls Cendrés — Voûte Fendue (NEO compact, signature)
// (Phase 9.6 — Migration)
//
// SIGNATURE : 3 étages avec mur fissuré central (raccourci si cassé).
// Brasiers latéraux sur foyers d'autel.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteE, porteO,
    brasier, murFissure
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_t_NEO = {
    id: 'halls_t_NEO',
    biome: 'halls_cendres',
    nom: 'La Voûte Fendue',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'E', 'O'],
    archetypesCompatibles: ['hall', 'sanctuaire'],
    rolesAutorises: ['main', 'alt', 'entree'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['N', 'E', 'O'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, 380, 24));
        plateformes.push(plafondCathedrale(580, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Foyers latéraux (brasiers d'autel)
        plateformes.push(plateforme(200, Y_SOL - 20, 80));
        plateformes.push(plateforme(760, Y_SOL - 20, 80));

        // Étage 1 latéraux
        plateformes.push(plateforme(160, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(800, 430, 110, { oneWay: true }));

        // Étage 2 (mid-haut)
        plateformes.push(plateforme(310, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(650, 360, 110, { oneWay: true }));

        // Étage 3 (passerelle centrale, coupée par mur fissuré)
        plateformes.push(plateforme(390, 280, 90, { oneWay: true }));
        plateformes.push(plateforme(570, 280, 90, { oneWay: true }));

        // Palier N
        plateformes.push(plateforme(480, 190, 140, { oneWay: true }));
        plateformes.push(plateforme(480, 110, 130, { oneWay: true }));

        const obstacles = [
            brasier(200, Y_SOL - 20, { cycleMs: 2800, offsetMs: 0,    largeur: 70 }),
            brasier(760, Y_SOL - 20, { cycleMs: 2800, offsetMs: 1400, largeur: 70 }),
            // Mur fissuré central (raccourci entre 2 paliers de l'étage 3)
            murFissure(480, 250, { largeur: 30, hauteur: 60, hp: 4, dropSel: true })
        ];

        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(480, 30);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
