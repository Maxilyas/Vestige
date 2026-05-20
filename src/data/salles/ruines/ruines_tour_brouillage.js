// Salle : Ruines basses — La Tour du Brouillage
//
// Salle OES SIGNATURE qui exploite l'ANTI-ANCRAGE comme contrainte centrale.
// Au cœur de la salle, une vaste zone de spores pourpres brouille la
// résonance — impossible d'ancrer dedans. Les paliers sont sur les bords
// (SAFE) et la traversée demande des sauts longs qu'on ne PEUT PAS compenser
// par l'ancrage. Pour les sauts trop loins → poser ancre AVANT la zone +
// sauter pendant le passage.
//
// PUZZLE : timing + planification. Si on a posé toutes ses ancres avant
// d'entrer dans la zone brouillée, on peut traverser. Sinon, demi-tour.

import {
    HAUTEUR_SOL, sol, plateforme, ancre,
    porteO, porteE, porteS,
    antiAncrage
} from '../_format.js';

const W = 2600;
const H = 1000;
const Y_SOL = H - HAUTEUR_SOL;        // 960

export const ruines_tour_brouillage = {
    id: 'ruines_tour_brouillage',
    biome: 'ruines_basses',
    nom: 'Tour du Brouillage',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['O', 'E', 'S'],
    archetypesCompatibles: ['hall', 'crypte'],
    rolesAutorises: ['main', 'alt'],
    unique: true,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),

            // Paliers SAFE sur les bords (corridors qui longent la zone)
            // Côté gauche — montée en colimaçon
            plateforme(180,  870, 110, { oneWay: true }),
            plateforme(80,   780, 110, { oneWay: true }),
            plateforme(180,  690, 110, { oneWay: true }),
            plateforme(80,   600, 110, { oneWay: true }),
            plateforme(180,  510, 110, { oneWay: true }),
            // Corniche haute (traverse) — large + serrée pour saut horiz OK
            plateforme(380,  450, 200, { oneWay: true }),
            plateforme(580,  450, 200, { oneWay: true }),

            // Centre HAUT : plateformes serrées (gap ≤130 horiz)
            plateforme(800,  450, 200, { oneWay: true }),
            plateforme(1020, 450, 200, { oneWay: true }),
            plateforme(1240, 450, 200, { oneWay: true }),
            plateforme(1460, 450, 200, { oneWay: true }),
            plateforme(1680, 450, 200, { oneWay: true }),
            plateforme(1900, 450, 200, { oneWay: true }),

            // Corniche haute côté droit
            plateforme(2120, 450, 200, { oneWay: true }),
            plateforme(W - 180, 510, 110, { oneWay: true }),
            plateforme(W - 80,  600, 110, { oneWay: true }),
            plateforme(W - 180, 690, 110, { oneWay: true }),
            plateforme(W - 80,  780, 110, { oneWay: true }),
            plateforme(W - 180, 870, 110, { oneWay: true })
        ];

        // ─── Anti-ancrage : zone CENTRALE qui couvre la mi-hauteur ────
        // Force le passage par les bords (corridors) OU par les plateformes
        // hautes (qui sont OUT de la zone).
        const obstacles = [
            antiAncrage(W / 2, 720, 1800, 400)
        ];

        // ─── Zones ancrables : SUR les bords (en dehors de la zone brouillée)
        // Le joueur peut ancrer pour combler les sauts longs uniquement
        // depuis les bords.
        const zones = [
            // Aide à passer du palier gauche 510 vers corniche haute 450
            ancre(310, 530, 100, 30),
            // Aide à passer entre corniche haute et plateforme centrale
            ancre(900, 530, 100, 30),
            // Côté droit, symétrique
            ancre(W - 900, 530, 100, 30),
            ancre(W - 310, 530, 100, 30)
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('S')) portes.S = porteS(Math.round(W * 0.5), Y_SOL);

        return {
            plateformes,
            obstacles,
            zones,
            portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
