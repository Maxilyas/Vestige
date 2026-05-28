// Salle : Voile Inversé — Le Carrefour Dissous (T SEO compact)
// (Phase 9.x — Migration Voile, fondation)
//
// INTENTION : carrefour bas O/E + descente S sur palier central. Marches
// latérales vers un coffre votif accroché en hauteur.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteS, porteO, porteE
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const voile_t_SEO = {
    id: 'voile_t_SEO',
    biome: 'voile_inverse',
    nom: 'Le Carrefour Dissous (SEO)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['S', 'E', 'O'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['S', 'E', 'O'] } = {}) {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Palier S surélevé central (porte S dessus)
        plateformes.push(plateforme(480, 440, 140, { oneWay: true }));

        // Marches latérales vers coffre votif
        plateformes.push(plateforme(180, 410, 120, { oneWay: true }));
        plateformes.push(plateforme(360, 340, 130, { oneWay: true }));
        plateformes.push(plateforme(560, 300, 130, { oneWay: true }));
        plateformes.push(plateforme(760, 410, 120, { oneWay: true }));

        const portes = {};
        if (portesActives.includes('S')) portes.S = porteS(480, 440);
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        const coffreForce = { x: 560, y: 300 - 12 };

        return {
            plateformes, obstacles: [], zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 },
            coffreForce
        };
    }
};
