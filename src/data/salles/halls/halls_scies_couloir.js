// Salle : Halls Cendrés — Le Couloir des Scies (OE compact, signature)
// (Phase 9.8 — Toolkit medium-cost)
//
// SIGNATURE : 3 scies circulaires en mouvement constant (2 horizontales
// + 1 verticale). Pas de timing offert : il faut anticiper le va-et-vient.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    scieCirculaire
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_scies_couloir = {
    id: 'halls_scies_couloir',
    biome: 'halls_cendres',
    nom: 'Le Couloir des Scies',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'pont'],
    rolesAutorises: ['main', 'alt'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Paliers latéraux bas safe
        plateformes.push(plateforme(140, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(820, 430, 110, { oneWay: true }));

        // Paliers mid pour combat aérien — vert 90 depuis paliers bas
        plateformes.push(plateforme(290, 340, 110, { oneWay: true }));
        plateformes.push(plateforme(670, 340, 110, { oneWay: true }));

        // Palier sommet (coffre — récompense traversée) — vert 90
        plateformes.push(plateforme(480, 250, 160, { oneWay: true }));

        const obstacles = [
            // 2 scies horizontales (au sol + à mi-hauteur)
            scieCirculaire(480, Y_SOL - 18, 'horizontale', { rayon: 24, amplitude: 180, periode: 2400 }),
            scieCirculaire(480, 370, 'horizontale', { rayon: 22, amplitude: 200, periode: 2800 }),
            // 1 scie verticale au centre (entre 130 et 290)
            scieCirculaire(480, 280, 'verticale', { rayon: 22, amplitude: 80, periode: 2200 })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        const coffreForce = { x: 480, y: 230 - 12 };

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 },
            coffreForce
        };
    }
};
