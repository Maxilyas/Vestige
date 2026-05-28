// Salle : Voile Inversé — Les Fragments Flottants (NSEO compact)
// (Phase 9.x — Migration Voile, fondation — mix vide + écho)
//
// INTENTION : vertige. Gouffre mortel central franchi par des fragments de
// cité flottants. Portes O/E aux rives, ascension centrale vers N, porte S
// sur le fragment central. Deux faux fragments-échos (intangibles) flanquent
// les vrais : lecture avant de sauter.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteN, porteS, porteO, porteE,
    fauxSolMiroir
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const voile_fragments_flottants = {
    id: 'voile_fragments_flottants',
    biome: 'voile_inverse',
    nom: 'Les Fragments Flottants',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['pont', 'hall'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];

        // Sol coupé : gouffre mortel central (300 → 660)
        plateformes.push(sol(0, 300, Y_SOL));
        plateformes.push(sol(660, W, Y_SOL));

        // Fragments flottants de traversée (vrais)
        plateformes.push(plateforme(400, 440, 110, { oneWay: true }));
        plateformes.push(plateforme(480, 440, 110, { oneWay: true }));   // fragment central (porte S)
        plateformes.push(plateforme(560, 440, 110, { oneWay: true }));

        // Ascension centrale vers la porte N
        plateformes.push(plateforme(480, 360, 140, { oneWay: true }));
        plateformes.push(plateforme(480, 270, 140, { oneWay: true }));
        plateformes.push(plateforme(480, 180, 140, { oneWay: true }));
        plateformes.push(plateforme(480, 110, 130, { oneWay: true }));   // sous porte N

        const obstacles = [
            // Faux fragments-échos flanquant les vrais (pièges de lecture)
            fauxSolMiroir(330, 440, 80),
            fauxSolMiroir(630, 440, 80)
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
