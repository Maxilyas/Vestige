// Salle : Halls Cendrés — La Forge Mécanique (NSEO compact, signature)
// (Phase 9.8 — Toolkit medium-cost)
//
// SIGNATURE ULTIME : combo des 3 nouvelles mécaniques. 1 marteau + 2 pistons
// + 1 scie horizontale. Ascension N via paliers hauts safe.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteS, porteE, porteO,
    marteauPilon, pistonThermique, scieCirculaire
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_forge_meca = {
    id: 'halls_forge_meca',
    biome: 'halls_cendres',
    nom: 'La Forge Mécanique',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['arene', 'sanctuaire'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Paliers latéraux bas (entrée O/E, à l'écart des pistons)
        plateformes.push(plateforme(130, 430, 90, { oneWay: true }));
        plateformes.push(plateforme(830, 430, 90, { oneWay: true }));

        // Paliers mid (combat aérien)
        plateformes.push(plateforme(310, 340, 100, { oneWay: true }));
        plateformes.push(plateforme(650, 340, 100, { oneWay: true }));

        // Ascension N (route safe par-dessus le chaos mécanique)
        plateformes.push(plateforme(480, 250, 160, { oneWay: true }));
        plateformes.push(plateforme(480, 160, 140, { oneWay: true }));
        plateformes.push(plateforme(480, 80, 130, { oneWay: true }));

        // Palier S surélevé
        plateformes.push(plateforme(820, 440, 130, { oneWay: true }));

        const obstacles = [
            // Marteau-pilon central
            marteauPilon(480, 60, 420, { cycleMs: 2700, offsetMs: 0 }),
            // 2 pistons latéraux (sortent vers le centre)
            pistonThermique(30, Y_SOL - 100, 'droite', { hauteur: 50, offsetMs: 700 }),
            pistonThermique(W - 30, Y_SOL - 100, 'gauche', { hauteur: 50, offsetMs: 2100 }),
            // 1 scie horizontale au mi-niveau (entre paliers mid)
            scieCirculaire(480, 405, 'horizontale', { rayon: 22, amplitude: 120, periode: 2400 })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('N')) portes.N = porteN(480, 30);
        if (portesActives.includes('S')) portes.S = porteS(820, 440);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
