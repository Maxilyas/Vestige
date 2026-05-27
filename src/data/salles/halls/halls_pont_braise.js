// Salle : Halls Cendrés — Pont de la Braise (OE compact)
// (Phase 9.6 — Migration)
//
// INTENTION : pont au-dessus d'une fosse mortelle. Sous le pont, 3 brasiers
// permanents visibles ("abîme rougeoyant"). 2 plateformes intermédiaires
// étroites pour traverser.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    brasier
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_pont_braise = {
    id: 'halls_pont_braise',
    biome: 'halls_cendres',
    nom: 'Le Pont de la Braise',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'pont'],
    rolesAutorises: ['main', 'alt'],
    gouffreMort: true,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));

        // Sol G + Sol D, fosse mortelle 250..710 (460 px)
        plateformes.push(sol(0, 250, Y_SOL));
        plateformes.push(sol(710, W, Y_SOL));

        // 3 plateformes étroites pour traverser (le "pont")
        plateformes.push(plateforme(340, 440, 90, { oneWay: true }));
        plateformes.push(plateforme(480, 440, 90, { oneWay: true }));
        plateformes.push(plateforme(620, 440, 90, { oneWay: true }));

        // Paliers ascendants vers paliers hauts (alt route)
        plateformes.push(plateforme(150, 420, 100, { oneWay: true }));
        plateformes.push(plateforme(810, 420, 100, { oneWay: true }));
        plateformes.push(plateforme(290, 340, 100, { oneWay: true }));
        plateformes.push(plateforme(670, 340, 100, { oneWay: true }));
        plateformes.push(plateforme(480, 270, 160, { oneWay: true }));

        const obstacles = [
            // 3 brasiers décoratifs dans la fosse (signalent l'abîme)
            // Note : peu importe s'ils brûlent ou non — le gouffreMort tue avant
            brasier(340, Y_SOL + 80, { cycleMs: 3000, offsetMs: 0,    largeur: 80 }),
            brasier(480, Y_SOL + 80, { cycleMs: 3000, offsetMs: 1000, largeur: 80 }),
            brasier(620, Y_SOL + 80, { cycleMs: 3000, offsetMs: 2000, largeur: 80 })
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
