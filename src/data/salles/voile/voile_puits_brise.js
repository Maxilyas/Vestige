// Salle : Voile Inversé — Le Puits Brisé (NS compact)
// (Phase 9.x — Migration Voile, fondation)
//
// INTENTION : transition verticale lisible. Porte N en haut, porte S sur
// palier surélevé. Zigzag de paliers déchirés utilisable dans les deux sens.
// Coffre sur un palier latéral (récompense remontée).

import {
    HAUTEUR_SOL, sol, plateforme,
    porteN, porteS
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const voile_puits_brise = {
    id: 'voile_puits_brise',
    biome: 'voile_inverse',
    nom: 'Le Puits Brisé',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S'],
    archetypesCompatibles: ['puits', 'crypte'],

    generer({ portesActives = ['N', 'S'] } = {}) {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Zigzag de descente/montée (overlaps horizontaux, 70 vert)
        plateformes.push(plateforme(700, 430, 130, { oneWay: true }));
        plateformes.push(plateforme(500, 360, 130, { oneWay: true }));
        plateformes.push(plateforme(700, 290, 130, { oneWay: true }));
        plateformes.push(plateforme(500, 220, 130, { oneWay: true }));
        plateformes.push(plateforme(480, 130, 150, { oneWay: true }));   // sous porte N

        // Palier S surélevé (porte S dessus)
        plateformes.push(plateforme(480, 440, 140, { oneWay: true }));

        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(480, 40);
        if (portesActives.includes('S')) portes.S = porteS(480, 440);

        const coffreForce = { x: 700, y: 290 - 12 };

        return {
            plateformes, obstacles: [], zones: [], portes,
            spawnDefault: { x: 480, y: 130 - 20 },
            coffreForce
        };
    }
};
