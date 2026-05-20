// Salle : Ruines basses — Couloir traversant
//
// Couloir horizontal OE structuré en 2 ÉTAGES :
//   - Sol bas avec un TUNNEL en partie centrale (plafond bas + éboulis) →
//     impossible de traverser tout droit sans casser.
//   - Étage 2 (galerie haute) = chemin alternatif via plateformes,
//     accessible aux extrémités.
//
// Plaque de pression au sol qui déclenche des pieux temporaires.
// Roc qui tombe entre les 2 étages.

import {
    HAUTEUR_SOL, sol, plafond, plateforme,
    rocQuiTombe, plaque, eboulis,
    porteO, porteE
} from '../_format.js';

const W = 2400;
const H = 900;
const Y_SOL = H - HAUTEUR_SOL;        // 860
const Y_PLAFOND_TUNNEL = 770;         // plafond du tunnel central (h tunnel ≈75)

export const ruines_couloir_traversant = {
    id: 'ruines_couloir_traversant',
    biome: 'ruines_basses',
    nom: 'Couloir traversant',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'pont'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),
            // Plafond bas en partie centrale (forme un tunnel)
            plafond(700, 1700, Y_PLAFOND_TUNNEL),

            // Escaliers d'accès à l'étage 2 (gauche, saut 70 max)
            plateforme(300,  790, 100, { oneWay: true }),
            plateforme(450,  720, 100, { oneWay: true }),
            plateforme(550,  650, 100, { oneWay: true }),  // raccord vers galerie
            // Galerie haute (sol étage 2) — large pour bouger
            plateforme(W / 2, 580, 1400, { oneWay: true }),
            // Petites plateformes pour les ennemis volants éventuels (atteignables depuis galerie)
            plateforme(900,  510, 100, { oneWay: true }),
            plateforme(1500, 510, 100, { oneWay: true }),
            // Escaliers d'accès à l'étage 2 (droite, symétrique)
            plateforme(W - 550, 650, 100, { oneWay: true }),
            plateforme(W - 450, 720, 100, { oneWay: true }),
            plateforme(W - 300, 790, 100, { oneWay: true })
        ];

        const obstacles = [
            // Tunnel central : 2 éboulis bloquent vraiment le passage bas
            // (plafond bas → impossible de sauter par-dessus).
            eboulis(900,  Y_SOL - 110, { largeur: 100, hp: 3 }),
            eboulis(1500, Y_SOL - 110, { largeur: 100, hp: 3, dropSel: true }),

            // Plaque sur la galerie haute — déclenche pieux dans la galerie
            plaque(W / 2, 580, 'pieux', {
                dureeMs: 2500,
                positions: [
                    { x: 1100, y: 571 },
                    { x: 1200, y: 571 },
                    { x: 1300, y: 571 }
                ]
            }),

            // Roc qui tombe entre les 2 étages (frappe la galerie haute)
            rocQuiTombe(1000, 50, 560)
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes,
            obstacles,
            zones: [],
            portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
