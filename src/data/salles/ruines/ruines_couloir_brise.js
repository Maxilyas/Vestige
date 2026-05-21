// Salle : Ruines basses — Le Couloir Brisé
// (Phase 9.3 — Salle compacte 960×540)
//
// INTENTION DE DESIGN : "salle de combat propre" (style Hollow Knight)
//   • Lecture immédiate : on voit toute la salle en 1 coup d'œil
//   • Sol entier pour combat horizontal confortable
//   • 4 paliers latéraux pour combat aérien / repli
//   • 0 hazard environnemental (la salle se concentre sur les ennemis)
//   • Le joueur peut OU traverser direct, OU rester pour clear
//
// RYTHME : tension douce, salle de respiration entre les pièces plus
// punitives. Bonne candidate pour début de run (post-entrée).

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;          // 500

export const ruines_couloir_brise = {
    id: 'ruines_couloir_brise',
    biome: 'ruines_basses',
    nom: 'Le Couloir Brisé',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'crypte'],
    rolesAutorises: ['main', 'alt'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];

        // Voûte décorative (top de la salle)
        plateformes.push(plafondCathedrale(60, W - 60, 24));

        // Sol entier
        plateformes.push(sol(0, W, Y_SOL));

        // ─── Paliers latéraux (combat aérien) ──────────────────────────
        // Disposition asymétrique pour éviter l'effet "miroir" rigide.
        // Bas gauche (sol + 70 vert)
        plateformes.push(plateforme(150, 430, 130, { oneWay: true }));
        // Bas droit légèrement décalé en hauteur (sol + 80 vert)
        plateformes.push(plateforme(810, 420, 130, { oneWay: true }));

        // Mid gauche (bas+70)
        plateformes.push(plateforme(280, 360, 110, { oneWay: true }));
        // Mid droit (bas+80)
        plateformes.push(plateforme(680, 350, 110, { oneWay: true }));

        // ─── Petite corniche centrale haute pour repli tactique ───────
        // Atteignable depuis mid (mid+70). Largeur courte = peu de safe space.
        plateformes.push(plateforme(480, 280, 140, { oneWay: true }));

        // ─── Portes ──────────────────────────────────────────────────
        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes,
            obstacles: [],
            zones: [],
            portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
