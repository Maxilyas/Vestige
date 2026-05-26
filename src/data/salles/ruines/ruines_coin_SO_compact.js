// Salle : Ruines basses — Caveau Affaissé SO (coin SO compact)
// (Phase 9.3c)
// INTENTION : "descente vers bas-gauche". Miroir de coin_SE.

import {
    HAUTEUR_SOL, sol, plateforme,
    porteS, porteO,
    eboulis
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const ruines_coin_SO_compact = {
    id: 'ruines_coin_SO_compact',
    biome: 'ruines_basses',
    nom: 'Caveau Affaissé (SO)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['S', 'O'],
    archetypesCompatibles: ['crypte', 'hall'],

    generer({ portesActives = ['S', 'O'] } = {}) {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        plateformes.push(plateforme(810, 430, 130, { oneWay: true }));
        plateformes.push(plateforme(630, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(140, 380, 110, { oneWay: true }));
        plateformes.push(plateforme(280, 320, 110, { oneWay: true }));

        // Palier S central
        plateformes.push(plateforme(480, 290, 180, { oneWay: true }));

        // Palier haut + coffre
        plateformes.push(plateforme(740, 200, 110, { oneWay: true }));

        // Petit hazard : éboulis cassable sur le sol près de la porte O
        const obstacles = [
            eboulis(280, Y_SOL - 110, { largeur: 80, hp: 2 })
        ];

        const portes = {};
        if (portesActives.includes('S')) portes.S = porteS(480, 290);
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);

        const coffreForce = { x: 740, y: 200 - 12 };

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: W - 80, y: Y_SOL - 20 },
            coffreForce
        };
    }
};
