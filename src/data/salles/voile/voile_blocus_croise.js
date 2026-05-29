// Salle : Voile Inversé — Le Blocus Croisé (OE compact, SIGNATURE — mécanique neuve)
// (Phase 9.x — Voile Vague 2, 1re des 2 mécaniques de gravité)
//
// MÉCANIQUE NEUVE `bloc_gravite` : un bloc solide ridable dont la chute suit la
// gravité de la SALLE (pendule) XOR sa polarité. Deux blocs de polarité opposée
// placés côte à côte se CROISENT à mi-hauteur au flip → marchepied éphémère.
//
// DESIGN : la traversée O↔E reste triviale par le sol plein (validateur-safe, pas
// de soft-lock). Le coffre se mérite : il est sur une corniche à mi-hauteur (top
// 300) séparée d'un palier d'approche par un gouffre de 155 px (> saut horiz max).
// Au moment où les deux blocs se croisent à y=300, ils comblent le gouffre =
// pont éphémère. Skill-timing (cf. Parabole en S) : rater = chute sur les pieux.
//
// CADRE DESIGN — 5 critères (≈4/5) :
//   ✓ Risque    : pieux au sol sous le gouffre (chute punie)
//   ✓ Pression  : fenêtre de croisement brève + flip qui inverse aussi le joueur
//   ✓ Choix     : tenter le coffre (skill) ou poursuivre par le sol
//   ✓ Lecture   : 2 blocs aubergine + chevron magenta de polarité + télégraphe
//   ~ Combat    : 1 Larme Tisseuse harcèle pendant le timing
//
// À TESTER EN NAVIGATEUR : caler period/vitesse pour que la fenêtre de croisement
// soit franchissable sans être triviale.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    pieuSol, blocGravite
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;          // 500

export const voile_blocus_croise = {
    id: 'voile_blocus_croise',
    biome: 'voile_inverse',
    nom: 'Le Blocus Croisé',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'arene', 'pont'],
    rolesAutorises: ['main', 'alt'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 16));

        // Sol plein : traversée O↔E toujours possible (validateur-safe).
        plateformes.push(sol(0, W, Y_SOL));

        // Escalier d'approche gauche → palier à mi-hauteur (top 300).
        plateformes.push(plateforme(140, 430, 130, { oneWay: true }));
        plateformes.push(plateforme(300, 360, 130, { oneWay: true }));
        plateformes.push(plateforme(380, 300, 140, { oneWay: true }));   // palier d'élan

        // Niche-coffre à droite, même hauteur (top 300), au-delà du gouffre.
        plateformes.push(plateforme(680, 300, 150, { oneWay: true }));

        // Deux blocs de polarité opposée dans le gouffre (palier 450 → niche 605).
        // Repos bas top 446 / repos haut top 154 → ils se croisent à top 300
        // (= la hauteur du palier et de la niche → pont à l'instant du croisement).
        const obstacles = [
            blocGravite(500, 446, 154, { inverse: false }),
            blocGravite(570, 446, 154, { inverse: true }),
            // Pieux au fond du gouffre : un saut raté = dégâts.
            pieuSol(490, Y_SOL), pieuSol(540, Y_SOL), pieuSol(590, Y_SOL)
        ];

        // Pendule : pilote les blocs (et bascule aussi la gravité du joueur).
        const penduleInversion = { periode: 2600, telegraphMs: 800, depart: 'bas' };

        const coffreForce = { x: 680, y: 270 };

        // Harceleur flottant (insensible au flip, chasse en 2D).
        const ennemisForce = [
            { x: 250, y: 300, enemyId: 'larme_tisseuse' }
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 70, y: Y_SOL - 20 },
            coffreForce, ennemisForce, penduleInversion
        };
    }
};
