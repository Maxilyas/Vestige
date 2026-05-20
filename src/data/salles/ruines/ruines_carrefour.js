// Salle : Ruines basses — Le Carrefour des artisans
//
// Salle "passe-partout" : supporte les 4 portes (N, S, E, O). Sert :
//  - de salle de carrefour central quand le spanning tree alloue une
//    cellule à 4 voisins
//  - de FALLBACK quand aucune autre salle du pool Ruines ne supporte
//    la combinaison de portes demandée par le graphe
//
// Volontairement plus modeste que les salles signature : c'est un nœud
// de réseau, pas un puzzle. Le combat reste léger.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteO, porteE, porteN, porteS
} from '../_format.js';

const W = 1600;
const H = 800;
const Y_SOL = H - HAUTEUR_SOL;        // 760
const Y_MEZZANINE = 480;              // pour porte N accessible

export const ruines_carrefour = {
    id: 'ruines_carrefour',
    biome: 'ruines_basses',
    nom: 'Le Carrefour des artisans',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['hall', 'crypte', 'sanctuaire'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];

        // Sol entier (axe horizontal du carrefour)
        plateformes.push(sol(0, W, Y_SOL));

        // Escalier d'accès à la mezzanine (gauche) — espacement resserré pour
        // garantir jump horizontal ≤130 edge-to-edge.
        plateformes.push(plateforme(180,  680, 100, { oneWay: true }));
        plateformes.push(plateforme(330,  610, 100, { oneWay: true }));
        plateformes.push(plateforme(490,  540, 100, { oneWay: true }));

        // Mezzanine centrale : ÉLARGIE pour rester atteignable depuis palier3
        // (avant : w=280 → gap 160 entre palier3 et mezzanine, infranchissable.
        //  Maintenant : w=480 → gap < 130).
        plateformes.push(plateforme(W / 2, Y_MEZZANINE, 480, { oneWay: true }));

        // Escalier symétrique côté droit
        plateformes.push(plateforme(W - 490, 540, 100, { oneWay: true }));
        plateformes.push(plateforme(W - 330, 610, 100, { oneWay: true }));
        plateformes.push(plateforme(W - 180, 680, 100, { oneWay: true }));

        // ─── Portes ──────────────────────────────────────────────────
        // Positions : O au bord gauche, E au bord droit, N au centre (sur
        // mezzanine), S à 70% de la largeur (séparé visuellement de N et E
        // pour éviter "porte au milieu" qui décontextualise la salle).
        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('N')) portes.N = porteN(W / 2, Y_MEZZANINE - 90);
        if (portesActives.includes('S')) portes.S = porteS(Math.round(W * 0.7), Y_SOL);

        const spawnDefault = { x: 80, y: Y_SOL - 20 };

        return {
            plateformes,
            obstacles: [],
            zones: [],
            portes,
            spawnDefault
        };
    }
};
