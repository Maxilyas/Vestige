// Salle : Voile Inversé — La Cour des Fragments (OE compact)
// (Phase 9.x — Migration Voile, fondation — vide non létal)
//
// INTENTION : mobilité aérienne. Escalier ascendant asymétrique, ressorts
// catapultes vers la mezzanine. Une faille de Présent (drain, non létale)
// fend le sol au centre : tomber dedans coûte de la Résonance et repousse.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    ressort, failleVide
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const voile_cour_fragments = {
    id: 'voile_cour_fragments',
    biome: 'voile_inverse',
    nom: 'La Cour des Fragments',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['arene', 'hall'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(60, W - 60, 24));

        // Sol fendu par une faille (gap 100 px, franchissable au saut)
        plateformes.push(sol(0, 430, Y_SOL));
        plateformes.push(sol(530, W, Y_SOL));

        // Escalier ascendant asymétrique (penche à gauche)
        plateformes.push(plateforme(760, 430, 130, { oneWay: true }));
        plateformes.push(plateforme(560, 360, 120, { oneWay: true }));
        plateformes.push(plateforme(360, 300, 120, { oneWay: true }));
        plateformes.push(plateforme(180, 240, 130, { oneWay: true }));   // mezzanine
        plateformes.push(plateforme(160, 430, 120, { oneWay: true }));   // footing gauche

        const obstacles = [
            failleVide(480, Y_SOL, 100),   // drain de Présent (non létal)
            ressort(280, Y_SOL),           // catapulte vers la mezzanine
            ressort(660, Y_SOL)
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: W - 80, y: Y_SOL - 20 }
        };
    }
};
