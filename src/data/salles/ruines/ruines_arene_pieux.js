// Salle : Ruines basses — L'Arène des Pieux
// (Phase 9.3 — Salle compacte 960×540)
//
// INTENTION DE DESIGN : "combat sur sol piégé" (style Castlevania SotN)
//   • Le sol est PARSEMÉ de pieux qui forcent le mouvement constant
//   • 4 zones safe latérales + 1 refuge central élevé
//   • Combat aérien obligatoire OU navigation très précise au sol
//   • Récompense placement : coffre sur le refuge central (visible mais
//     demande de tenir sa position pour l'attraper)
//
// RYTHME : pic de tension. Salle "boss-like" en termes de demande
// d'attention. À placer mid-étage quand le joueur est échauffé.
//
// SYNERGIE ANCRAGE : possibilité de poser une ancre pour créer un
// pont entre les zones safe (si Résonance disponible).

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    pieuSol
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;          // 500

export const ruines_arene_pieux = {
    id: 'ruines_arene_pieux',
    biome: 'ruines_basses',
    nom: 'L\'Arène des Pieux',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['arene', 'hall'],
    rolesAutorises: ['main', 'alt'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];

        // Voûte décorative
        plateformes.push(plafondCathedrale(60, W - 60, 24));

        // Sol entier (avec pieux par-dessus — voir obstacles)
        plateformes.push(sol(0, W, Y_SOL));

        // ─── 4 paliers safe latéraux (refuge depuis pieux) ────────────
        // Disposés en quinconce pour combat aérien fluide
        plateformes.push(plateforme(120, 430, 110, { oneWay: true }));   // bas gauche
        plateformes.push(plateforme(840, 430, 110, { oneWay: true }));   // bas droit
        plateformes.push(plateforme(250, 350, 100, { oneWay: true }));   // mid gauche
        plateformes.push(plateforme(710, 350, 100, { oneWay: true }));   // mid droit

        // ─── Refuge central élevé (récompense de placement) ──────────
        // Atteignable depuis mid latéraux (mid +60 vert, ~120 horiz edge = saute long)
        plateformes.push(plateforme(480, 290, 180, { oneWay: true }));

        // ─── 2 corniches supérieures (combat air vs ennemis volants) ─
        plateformes.push(plateforme(310, 200, 90, { oneWay: true }));
        plateformes.push(plateforme(650, 200, 90, { oneWay: true }));

        // ─── PIEUX au sol : forcent le mouvement constant ────────────
        // Espacés ~180 px → gaps safe d'environ 100 px entre pieux
        const obstacles = [
            pieuSol(280, Y_SOL),
            pieuSol(460, Y_SOL),
            pieuSol(640, Y_SOL),
            pieuSol(820, Y_SOL)   // pieu proche porte E (forcé sauter à l'arrivée)
        ];

        // ─── Portes ──────────────────────────────────────────────────
        // Les portes sont LIBRES de pieux (zones d'entrée/sortie safe)
        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        // Coffre sur le refuge central (récompense maintenir position)
        const coffreForce = { x: 480, y: 290 - 12 };

        return {
            plateformes,
            obstacles,
            zones: [],
            portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 },
            coffreForce
        };
    }
};
