// Salle : Ruines basses — Les Escaliers Effrités
// (Phase 9.3 — Salle compacte 960×540)
//
// INTENTION DE DESIGN : "timing sol fragile" (style Celeste / Super Meat Boy)
//   • Geste répété : descendre 5 paliers en zigzag
//   • 3 paliers sont des sols effrités (s'écroulent 1.2s après contact)
//   • 1 plateforme safe à mi-chemin pour respirer (récompense lecture)
//   • Coffre garanti en bas (récompense la descente complète sans dégâts)
//   • Pas d'éboulis ni de pieux : c'est UNIQUEMENT le timing qui mord
//
// ALTERNATIVE TACTIQUE :
//   • Le joueur peut aussi PASSER PAR LE SOL si déjà débloqué (entrée O au
//     sol, sortie E au sol). Les escaliers sont un détour pour le coffre.
//
// RYTHME : tension constante mais lisible. Pas de mort instantanée — un
// raté coûte des PV de chute (Résonance). Bonne mid-run quand le joueur
// a déjà du loot à perdre.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteO, porteE,
    solEffrite
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;          // 500

export const ruines_escaliers_effrites = {
    id: 'ruines_escaliers_effrites',
    biome: 'ruines_basses',
    nom: 'Les Escaliers Effrités',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'crypte'],
    rolesAutorises: ['main', 'alt'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];

        // Sol entier (route basse safe)
        plateformes.push(sol(0, W, Y_SOL));

        // ─── Escalier DESCENDANT depuis le haut-gauche vers le bas-droit ─
        // Le joueur peut entrer par le haut s'il vient de l'ouest en sautant
        // sur le premier palier (saut depuis sol). Les sols effrités forcent
        // la descente sans pause.

        // Palier #1 : safe (point d'entrée haut depuis sol +70)
        plateformes.push(plateforme(170, 430, 120, { oneWay: true }));

        // Palier #2 : SOL EFFRITÉ (s'écroule au contact)
        plateformes.push(solEffrite(330, 380, 120));

        // Palier #3 : safe (refuge / respiration)
        plateformes.push(plateforme(480, 330, 140, { oneWay: true }));

        // Palier #4 : SOL EFFRITÉ (couloir tendu)
        plateformes.push(solEffrite(640, 280, 120));

        // Palier #5 : SOL EFFRITÉ (final, descente forcée)
        plateformes.push(solEffrite(800, 230, 120));

        // ─── Coffre HAUT sur petit palier safe (récompense montée) ────
        plateformes.push(plateforme(880, 170, 90, { oneWay: true }));

        // ─── Portes ──────────────────────────────────────────────────
        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        // Coffre sur le palier haut-droit (le sommet de la salle)
        const coffreForce = { x: 880, y: 170 - 12 };

        return {
            plateformes,
            obstacles: [],
            zones: [],
            portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 },
            coffreForce
        };
    }
};
