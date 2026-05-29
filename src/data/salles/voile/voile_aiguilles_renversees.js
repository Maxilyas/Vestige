// Salle : Voile Inversé — Les Aiguilles Renversées (OE compact, SIGNATURE)
// (Phase 9.x — Voile Vague 1, pendule cyclique : variante ASYMÉTRIQUE)
//
// MÉCANIQUE : pendule cyclique global, mais surfaces ASYMÉTRIQUES — le SOL est
// large et SÛR (refuge où respirer), le PLAFOND est hérissé de pieux. La phase
// normale est un répit ; la phase INVERSÉE jette le joueur dans un slalom serré
// au plafond où il faut viser les rares trouées safe. Lecture du danger
// inversée par rapport à l'habitude (le danger est « en haut »).
//
// CADRE DESIGN — 5 critères (4/5) :
//   ✓ Risque    : forêt de pieux au plafond (dégâts à chaque flip mal placé)
//   ✓ Pression  : flip toutes les ~3,5 s impose de viser une trouée à temps
//   ✓ Combat    : Larme Tisseuse harcèle (chasse en 2D, insensible au flip)
//   ✓ Lecture   : sol calme vs plafond hérissé + télégraphe magenta
//   ~ Choix     : quelle trouée viser / quand foncer au sol
//
// Validateur : sol plein pleine largeur (traversée O↔E triviale) ; corniche-
// plafond taguée 'gravite_inverse' ignorée par le BFS ; pieux = obstacles.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    pieuPlafond
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;          // 500
const Y_CORNICHE = 110;
const Y_CORNICHE_BAS = Y_CORNICHE + 16; // 126

export const voile_aiguilles_renversees = {
    id: 'voile_aiguilles_renversees',
    biome: 'voile_inverse',
    nom: 'Les Aiguilles Renversées',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'arene'],
    rolesAutorises: ['main', 'alt'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 16));

        // Sol plein continu = refuge SÛR (et traversée O↔E validable).
        plateformes.push(sol(0, W, Y_SOL));

        // Corniche-plafond pleine largeur = surface inversée, hérissée de pieux.
        // Taguée 'gravite_inverse' → BFS l'ignore.
        plateformes.push(plateforme(W / 2, Y_CORNICHE, W, { tags: ['gravite_inverse'] }));

        // Forêt de pieux au plafond, espacés ~160 → trouées safe à ~170, 320,
        // 480 (sous le coffre), 640, 800 et aux bords.
        const obstacles = [
            pieuPlafond(240, Y_CORNICHE_BAS),
            pieuPlafond(400, Y_CORNICHE_BAS),
            pieuPlafond(560, Y_CORNICHE_BAS),
            pieuPlafond(720, Y_CORNICHE_BAS)
        ];

        // Pendule un peu lent → temps de viser une trouée avant le flip.
        const penduleInversion = { periode: 3500, telegraphMs: 1000, depart: 'bas' };

        // Coffre dans une trouée safe du plafond (entre pieux 400 et 560).
        const coffreForce = { x: 480, y: 156 };

        // Flotteur harceleur (gravite:false → insensible au flip).
        const ennemisForce = [
            { x: 320, y: 300, enemyId: 'larme_tisseuse' }
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 },
            coffreForce, ennemisForce, penduleInversion
        };
    }
};
