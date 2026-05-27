// Salle : Halls Cendrés — La Descente du Laitier (SO compact, alt)
// (Phase 9.6 — Pool diversité)
//
// INTENTION : 2ème salle SO Halls — descente via sols effrités cassables,
// brasier dans la fosse finale.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteS, porteO,
    solEffrite, brasier
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_descente_SO = {
    id: 'halls_descente_SO',
    biome: 'halls_cendres',
    nom: 'La Descente du Laitier',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'S'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['O', 'S'] } = {}) {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Paliers d'entrée + descente effritée
        plateformes.push(plateforme(160, 430, 110, { oneWay: true }));
        plateformes.push(solEffrite(330, 360, 100));
        plateformes.push(solEffrite(540, 360, 100));
        plateformes.push(solEffrite(380, 280, 100));
        plateformes.push(solEffrite(580, 280, 100));
        plateformes.push(plateforme(480, 200, 130, { oneWay: true }));

        // Foyer en bas (brasier marque la fosse)
        plateformes.push(plateforme(720, Y_SOL - 25, 100));

        // Palier S surélevé
        plateformes.push(plateforme(720, 440, 140, { oneWay: true }));

        const obstacles = [
            brasier(720, Y_SOL - 25, { cycleMs: 2800, offsetMs: 0, largeur: 90 })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('S')) portes.S = porteS(720, 440);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
