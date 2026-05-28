// Salle : Cristaux Glacés — Le Dallage de Givre (OE compact)
// (Phase 9.x — Migration Cristaux)
//
// INTENTION : "deux routes, deux risques". Le centre est un gouffre mortel
// franchi par des dalles de givre qui s'effritent (route rapide risquée),
// OU contourné par une passerelle haute de marbre (route lente sûre).

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale, solEffrite,
    porteO, porteE
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const cristaux_dallage_givre = {
    id: 'cristaux_dallage_givre',
    biome: 'cristaux_glaces',
    nom: 'Le Dallage de Givre',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['pont', 'hall'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));

        // Sol coupé : gouffre mortel central (340 → 620)
        plateformes.push(sol(0, 340, Y_SOL));
        plateformes.push(sol(620, W, Y_SOL));

        // ─── Route HAUTE sûre (passerelle de marbre) ─────────────────
        plateformes.push(plateforme(240, 410, 130, { oneWay: true }));
        plateformes.push(plateforme(480, 340, 200, { oneWay: true }));
        plateformes.push(plateforme(720, 410, 130, { oneWay: true }));

        // ─── Route BASSE rapide : dalles de givre qui s'effritent ─────
        const obstacles = [
            solEffrite(420, Y_SOL, 90),
            solEffrite(540, Y_SOL, 90)
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
