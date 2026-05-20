// Salle : Ruines basses — Le Caveau scellé
//
// OE coupée en 2 arènes par un mur fissuré central. Le joueur entre par O,
// doit casser le mur OU contourner par la passerelle haute (exposée aux rocs).

import {
    HAUTEUR_SOL, sol, plateforme,
    porteO, porteE,
    murFissure, rocQuiTombe
} from '../_format.js';

const W = 2400;
const H = 1000;
const Y_SOL = H - HAUTEUR_SOL;        // 960
const X_MUR = W / 2;

export const ruines_caveau_scelle = {
    id: 'ruines_caveau_scelle',
    biome: 'ruines_basses',
    nom: 'Caveau scellé',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['crypte', 'hall'],
    rolesAutorises: ['main', 'alt'],
    unique: true,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [
            sol(0, W, Y_SOL),

            // ─── Côté gauche : escalier ascendant pour atteindre passerelle ─
            plateforme(280,  890, 120, { oneWay: true }),  // saut 70 depuis sol
            plateforme(450,  820, 120, { oneWay: true }),
            plateforme(280,  750, 120, { oneWay: true }),
            plateforme(450,  680, 120, { oneWay: true }),
            plateforme(680,  620, 130, { oneWay: true }),
            plateforme(880,  560, 130, { oneWay: true }),
            plateforme(1060, 500, 130, { oneWay: true }),
            plateforme(X_MUR - 200, 440, 150, { oneWay: true }),

            // ─── Côté droit symétrique ──────────────────────────────────
            plateforme(W - 280,  890, 120, { oneWay: true }),
            plateforme(W - 450,  820, 120, { oneWay: true }),
            plateforme(W - 280,  750, 120, { oneWay: true }),
            plateforme(W - 450,  680, 120, { oneWay: true }),
            plateforme(W - 680,  620, 130, { oneWay: true }),
            plateforme(W - 880,  560, 130, { oneWay: true }),
            plateforme(W - 1060, 500, 130, { oneWay: true }),
            plateforme(X_MUR + 200, 440, 150, { oneWay: true }),

            // ─── Passerelle haute centrale (contournement risqué — rocs) ─
            plateforme(X_MUR, 380, 240, { oneWay: false })
        ];

        const obstacles = [
            // Mur fissuré central : sépare les 2 arènes
            murFissure(X_MUR, 510, { largeur: 40, hauteur: 360, hp: 4, dropSel: true }),
            // 2 rocs au-dessus de la passerelle (timing pendant qu'on casse le mur)
            rocQuiTombe(X_MUR - 80, 60, 350),
            rocQuiTombe(X_MUR + 80, 60, 350)
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
