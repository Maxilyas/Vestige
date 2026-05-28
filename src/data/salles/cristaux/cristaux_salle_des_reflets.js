// Salle : Cristaux Glacés — La Salle des Reflets (NSEO compact, SIGNATURE)
// (Phase 9.x — Tranche 2 Vague 2 : combo Miroir)
//
// SIGNATURE : combo des trois mécaniques Miroir. Ascension vers la porte N
// par des plateformes-miroirs oscillantes, un faux sol piège au centre, et un
// faisceau laser qui balaie la base. Le sommet (porte N) est gated par la
// mécanique (tagué metroidvania). Critères : risque + pression + choix + lecture.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteN, porteS, porteO, porteE,
    plateformeMiroir, fauxSolMiroir, laserPrisme
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const cristaux_salle_des_reflets = {
    id: 'cristaux_salle_des_reflets',
    biome: 'cristaux_glaces',
    nom: 'La Salle des Reflets',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['sanctuaire', 'hall'],
    rolesAutorises: ['main', 'alt', 'entree'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Estrades latérales (footing) + palier S
        plateformes.push(plateforme(180, 420, 120, { oneWay: true }));
        plateformes.push(plateforme(780, 420, 120, { oneWay: true }));
        plateformes.push(plateforme(480, 440, 140, { oneWay: true }));
        // Premières marches réelles de l'ascension
        plateformes.push(plateforme(300, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(660, 360, 110, { oneWay: true }));
        // Sommet sous porte N — gated par la mécanique (ignoré du validateur)
        plateformes.push(plateforme(480, 140, 150, { oneWay: true, tags: ['metroidvania'] }));

        const obstacles = [
            // Ascension par plateformes-miroirs oscillantes
            plateformeMiroir(420, 290, 110, { cycleMs: 3000, offsetMs: 0 }),
            plateformeMiroir(560, 210, 110, { cycleMs: 3000, offsetMs: 1000 }),
            // Faux sol piège au centre (semble une marche, intangible)
            fauxSolMiroir(480, 250, 100),
            // Laser horizontal qui balaie la base (pression à l'entrée)
            laserPrisme(480, 410, 180, { axe: 'horizontale', cycleMs: 2600, offsetMs: 0 })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('N')) portes.N = porteN(480, 30);
        if (portesActives.includes('S')) portes.S = porteS(480, 440);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
