// Salle : Halls Cendrés — Les Pistons Thermiques (OE compact, signature)
// (Phase 9.8 — Toolkit medium-cost)
//
// SIGNATURE : 4 pistons latéraux (2 sortent du mur G vers droite, 2 du mur D
// vers gauche). Knockback fort à l'extension. Brasier central qui menace
// quand on est repoussé dedans.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    pistonThermique, brasier
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_pistons_thermiques = {
    id: 'halls_pistons_thermiques',
    biome: 'halls_cendres',
    nom: 'Les Pistons Thermiques',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'pont'],
    rolesAutorises: ['main', 'alt'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Foyer central + brasier (menace combo : repoussé dedans = brûlé)
        plateformes.push(plateforme(480, Y_SOL - 20, 100));

        // Paliers latéraux bas (entrée O/E)
        plateformes.push(plateforme(120, 430, 90, { oneWay: true }));
        plateformes.push(plateforme(840, 430, 90, { oneWay: true }));

        // Paliers mid au-dessus des pistons (route safe alt) — vert 90
        plateformes.push(plateforme(280, 340, 110, { oneWay: true }));
        plateformes.push(plateforme(680, 340, 110, { oneWay: true }));
        plateformes.push(plateforme(480, 250, 160, { oneWay: true }));

        const obstacles = [
            // Brasier central (menace combo)
            brasier(480, Y_SOL - 20, { cycleMs: 3200, offsetMs: 0, largeur: 90 }),
            // 2 pistons sortant du mur G vers droite (à 2 hauteurs)
            pistonThermique(30, Y_SOL - 80, 'droite', { hauteur: 50, offsetMs: 0 }),
            pistonThermique(30, Y_SOL - 180, 'droite', { hauteur: 50, offsetMs: 1500 }),
            // 2 pistons sortant du mur D vers gauche
            pistonThermique(W - 30, Y_SOL - 80, 'gauche', { hauteur: 50, offsetMs: 750 }),
            pistonThermique(W - 30, Y_SOL - 180, 'gauche', { hauteur: 50, offsetMs: 2250 })
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
