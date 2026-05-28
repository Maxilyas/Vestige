// Salle : Cristaux Glacés — Les Plateaux Flottants (NSEO compact)
// (Phase 9.x — Migration Cristaux, pool diversité)
//
// INTENTION : vertige. Gouffre mortel central franchi par des plateaux de
// marbre flottants. Portes O/E aux deux rives, ascension centrale vers N,
// porte S sur le plateau central. Toute config NSEO matchée.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteN, porteS, porteO, porteE
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const cristaux_plateaux_flottants = {
    id: 'cristaux_plateaux_flottants',
    biome: 'cristaux_glaces',
    nom: 'Les Plateaux Flottants',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['pont', 'hall'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];

        // Sol coupé : gouffre mortel central (300 → 660)
        plateformes.push(sol(0, 300, Y_SOL));
        plateformes.push(sol(660, W, Y_SOL));

        // Plateaux flottants de traversée
        plateformes.push(plateforme(400, 440, 110, { oneWay: true }));
        plateformes.push(plateforme(480, 440, 110, { oneWay: true }));   // plateau central (porte S)
        plateformes.push(plateforme(560, 440, 110, { oneWay: true }));

        // Ascension centrale vers la porte N
        plateformes.push(plateforme(480, 360, 140, { oneWay: true }));
        plateformes.push(plateforme(480, 270, 140, { oneWay: true }));
        plateformes.push(plateforme(480, 180, 140, { oneWay: true }));
        plateformes.push(plateforme(480, 110, 130, { oneWay: true }));   // sous porte N

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('N')) portes.N = porteN(480, 30);
        if (portesActives.includes('S')) portes.S = porteS(480, 440);

        return {
            plateformes, obstacles: [], zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
