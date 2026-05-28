// Salle : Cristaux Glacés — La Faille du Présent (OE compact, SIGNATURE)
// (Phase 9.x — Tranche 2, re-skin failles + souffle blizzard)
//
// SIGNATURE : le sol est lézardé de failles de « Présent pur » qui drainent
// la Résonance. Route basse rapide (enjamber les failles au sol) vs route
// haute sûre (corniches), mais un souffle de blizzard pousse les sauts vers
// la gauche. Critères : risque (drain), choix (haut/bas), pression (vent).

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    failleVide, souffleBlizzard
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const cristaux_faille_du_present = {
    id: 'cristaux_faille_du_present',
    biome: 'cristaux_glaces',
    nom: 'La Faille du Présent',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['pont', 'crypte'],
    rolesAutorises: ['main', 'alt', 'entree'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Route HAUTE sûre : corniches au-dessus des failles
        plateformes.push(plateforme(200, 420, 120, { oneWay: true }));
        plateformes.push(plateforme(410, 420, 120, { oneWay: true }));
        plateformes.push(plateforme(620, 420, 120, { oneWay: true }));
        plateformes.push(plateforme(820, 420, 120, { oneWay: true }));

        const obstacles = [
            // Route BASSE : failles de Présent pur dans le sol (drain)
            failleVide(300, Y_SOL, 90),
            failleVide(520, Y_SOL, 90),
            failleVide(720, Y_SOL, 90),
            // Souffle de blizzard central qui pousse les sauts vers la gauche
            souffleBlizzard(480, 250, 320, 220, { force: -110 })
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
