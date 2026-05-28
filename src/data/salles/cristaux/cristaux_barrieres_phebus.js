// Salle : Cristaux Glacés — Les Barrières de Phébus (OE compact, SIGNATURE)
// (Phase 9.x — Tranche 2 Vague 2 : le Miroir)
//
// SIGNATURE : couloir barré de faisceaux laser prismatiques cycliques
// (charge télégraphiée puis tir). Toucher un faisceau actif = gel
// (immobilisation). Franchir au rythme, en se réfugiant sur les paliers
// entre les barrières. Critères : risque (gel), pression (timing), lecture
// (charge/tir lisibles).

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    laserPrisme
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const cristaux_barrieres_phebus = {
    id: 'cristaux_barrieres_phebus',
    biome: 'cristaux_glaces',
    nom: 'Les Barrières de Phébus',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'pont'],
    rolesAutorises: ['main', 'alt', 'entree'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Paliers refuges entre les barrières
        plateformes.push(plateforme(410, 410, 100, { oneWay: true }));
        plateformes.push(plateforme(630, 410, 100, { oneWay: true }));

        const obstacles = [
            // 3 barrières verticales cycliques décalées (du plafond au sol)
            laserPrisme(300, 280, 440, { axe: 'verticale', cycleMs: 2400, offsetMs: 0 }),
            laserPrisme(520, 280, 440, { axe: 'verticale', cycleMs: 2400, offsetMs: 800 }),
            laserPrisme(720, 280, 440, { axe: 'verticale', cycleMs: 2400, offsetMs: 1600 })
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
