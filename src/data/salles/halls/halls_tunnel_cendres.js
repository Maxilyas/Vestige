// Salle : Halls Cendrés — Le Tunnel des Cendres (NSEO compact)
// (Phase 9.6 — Pool diversité)
//
// INTENTION : 3 étages séparés par sols effrités cassables (le joueur
// traverse l'étage en cassant le sol-effrité juste sous lui).

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteS, porteE, porteO,
    solEffrite, brasier
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_tunnel_cendres = {
    id: 'halls_tunnel_cendres',
    biome: 'halls_cendres',
    nom: 'Le Tunnel des Cendres',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['hall', 'crypte'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Paliers latéraux d'entrée
        plateformes.push(plateforme(140, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(820, 430, 110, { oneWay: true }));

        // Étage 1 : sols effrités centraux
        plateformes.push(solEffrite(330, 370, 100));
        plateformes.push(solEffrite(630, 370, 100));

        // Étage 2 : plateformes stables
        plateformes.push(plateforme(280, 290, 100, { oneWay: true }));
        plateformes.push(plateforme(680, 290, 100, { oneWay: true }));

        // Étage 3 : sols effrités + foyer brasier
        plateformes.push(solEffrite(380, 210, 100));
        plateformes.push(solEffrite(580, 210, 100));

        // Palier N
        plateformes.push(plateforme(480, 130, 150, { oneWay: true }));

        // Foyer central + brasier
        plateformes.push(plateforme(480, Y_SOL - 20, 80));

        // Palier S
        plateformes.push(plateforme(820, 440, 130, { oneWay: true }));

        const obstacles = [
            brasier(480, Y_SOL - 20, { cycleMs: 2400, offsetMs: 0, largeur: 70 })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('N')) portes.N = porteN(480, 40);
        if (portesActives.includes('S')) portes.S = porteS(820, 440);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
