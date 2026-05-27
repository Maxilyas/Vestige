// Salle : Halls Cendrés — Les Jets de Lave (NS compact, signature)
// (Phase 9.7 — Extension toolkit)
//
// SIGNATURE : ascension verticale forcée par geysers. 3 geysers décalés
// dans le puits central, sans lesquels la montée est impossible (paliers
// hauts hors saut normal). Timing serré, mais récompense = montée rapide.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteN, porteS,
    geyserVapeur
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_lave_jets = {
    id: 'halls_lave_jets',
    biome: 'halls_cendres',
    nom: 'Les Jets de Lave',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S'],
    archetypesCompatibles: ['puits', 'sanctuaire'],
    rolesAutorises: ['main', 'alt'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['N', 'S'] } = {}) {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Foyers surélevés où les geysers s'ancrent
        plateformes.push(plateforme(240, Y_SOL - 20, 70));
        plateformes.push(plateforme(720, Y_SOL - 20, 70));

        // Paliers safe latéraux bas (pour atterrir entre geysers)
        plateformes.push(plateforme(140, 430, 100, { oneWay: true }));
        plateformes.push(plateforme(820, 430, 100, { oneWay: true }));

        // Paliers ascendants atteignables au saut depuis sol+geyser
        plateformes.push(plateforme(360, 350, 100, { oneWay: true }));
        plateformes.push(plateforme(600, 350, 100, { oneWay: true }));
        plateformes.push(plateforme(240, 260, 100, { oneWay: true }));
        plateformes.push(plateforme(720, 260, 100, { oneWay: true }));

        // Palier sommet (porte N) — atteignable par boost geyser
        plateformes.push(plateforme(480, 170, 160, { oneWay: true }));
        plateformes.push(plateforme(480, 90, 130, { oneWay: true }));

        // Palier S
        plateformes.push(plateforme(480, 440, 140, { oneWay: true }));

        const obstacles = [
            // 3 geysers décalés (rythme alternant)
            geyserVapeur(240, Y_SOL - 20, { hauteur: 220, cycleMs: 2800, offsetMs: 0 }),
            geyserVapeur(720, Y_SOL - 20, { hauteur: 220, cycleMs: 2800, offsetMs: 1400 }),
            geyserVapeur(480, Y_SOL,      { hauteur: 300, cycleMs: 3400, offsetMs: 700 })
        ];

        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(480, 30);
        if (portesActives.includes('S')) portes.S = porteS(480, 440);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 480, y: 90 - 20 }
        };
    }
};
