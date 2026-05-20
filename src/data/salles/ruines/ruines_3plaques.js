// Salle : Ruines basses — La Salle des 3 plaques
//
// Salle OE classique en apparence : sol entier, traversée directe possible.
// MAIS, en hauteur, un coffre (sur un palier inaccessible normalement) est
// protégé par des pieux. Les 3 plaques de pression au sol contrôlent les
// pieux : si on les active dans le bon ordre, elles s'éteignent. Bon ordre
// = gauche → centre → droite.
//
// Pour MVP : chaque plaque déclenche des pieux temporaires. On ne code pas
// un système de séquence — on signale "puzzle" par la disposition et le
// joueur intuite. Le coffre reste atteignable via les paliers latéraux
// (sans plaque), mais avec des pieux.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteO, porteE,
    plaque
} from '../_format.js';

const W = 2200;
const H = 900;
const Y_SOL = H - HAUTEUR_SOL;        // 860

export const ruines_3plaques = {
    id: 'ruines_3plaques',
    biome: 'ruines_basses',
    nom: 'Salle des 3 plaques',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['sanctuaire', 'hall'],
    rolesAutorises: ['main', 'alt'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),

            // Escaliers latéraux pour atteindre le palier coffre
            plateforme(180,  790, 100, { oneWay: true }),
            plateforme(330,  720, 100, { oneWay: true }),
            plateforme(490,  650, 100, { oneWay: true }),
            plateforme(680,  600, 110, { oneWay: true }),    // raccord vers mezzanine
            plateforme(W - 180, 790, 100, { oneWay: true }),
            plateforme(W - 330, 720, 100, { oneWay: true }),
            plateforme(W - 490, 650, 100, { oneWay: true }),
            plateforme(W - 680, 600, 110, { oneWay: true }),  // raccord droit

            // Mezzanine large (saut 50 horiz depuis paliers raccord)
            plateforme(W / 2, 600, 600, { oneWay: false })
        ];

        // Les 3 plaques sont espacées sur le sol entre les escaliers
        const positionsPieux = (cx) => [
            { x: cx - 40, y: Y_SOL - 9 },
            { x: cx,      y: Y_SOL - 9 },
            { x: cx + 40, y: Y_SOL - 9 }
        ];

        const obstacles = [
            // 3 plaques sur le sol — chacune déclenche un essaim de pieux
            // près du palier coffre (oblige le joueur à les éviter)
            plaque(700,  Y_SOL, 'pieux', {
                dureeMs: 2500,
                positions: [
                    { x: W / 2 - 200, y: 568 },
                    { x: W / 2 - 100, y: 568 }
                ]
            }),
            plaque(W / 2, Y_SOL, 'pieux', {
                dureeMs: 2500,
                positions: positionsPieux(W / 2)  // pieux centraux sur le sol entre escaliers
            }),
            plaque(W - 700, Y_SOL, 'pieux', {
                dureeMs: 2500,
                positions: [
                    { x: W / 2 + 100, y: 568 },
                    { x: W / 2 + 200, y: 568 }
                ]
            })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        const coffreForce = { x: W / 2, y: 600 - 12 };

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
