// Salle : Ruines basses — Les Lames Pendulantes (NSEO compact, signature)
// (Phase 9.4 Vague 1 — pool diversité)
//
// CADRE DESIGN — 5 critères (5/5) :
//   ✓ Risque    : fosse mortelle 360 px + chute du mobile = mort
//   ✓ Pression  : pieux plafond hangants, mobile timing serré 3s/cycle
//   ✓ Choix     : traverser au sol mobile OU monter par paliers latéraux
//   ✓ Combat    : ennemi spawn possible sur paliers latéraux, vautour en l'air
//   ✓ Lecture   : silhouette pieux plafond + mobile claire dès l'entrée

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale, plafond,
    porteO, porteE, porteN, porteS,
    plateformeMobile, pieuPlafond, vestigeLore
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const ruines_lames_pendulantes = {
    id: 'ruines_lames_pendulantes',
    biome: 'ruines_basses',
    nom: 'Les Lames Pendulantes',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['hall', 'sanctuaire'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));

        // Sols G et D, fosse mortelle 300..660 (mobile traverse au-dessus)
        plateformes.push(sol(0, 300, Y_SOL));
        plateformes.push(sol(660, W, Y_SOL));

        // Paliers latéraux bas (sol+70)
        plateformes.push(plateforme(150, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(810, 430, 110, { oneWay: true }));

        // Ascension centrale vers porte N (depuis mobile y=420)
        plateformes.push(plateforme(480, 325, 130, { oneWay: true }));
        plateformes.push(plateforme(480, 235, 120, { oneWay: true }));
        plateformes.push(plateforme(480, 145, 140, { oneWay: true }));

        // Palier S surélevé droit
        plateformes.push(plateforme(820, 440, 130, { oneWay: true }));

        // Plafonds courts décoratifs (ancrage visuel des pieux)
        plateformes.push(plafond(300, 410, 286));   // plafond G
        plateformes.push(plafond(550, 660, 286));   // plafond D

        const obstacles = [
            // Mobile horizontale au-dessus de la fosse — traverse 340..620
            plateformeMobile(480, 420, 110, {
                axe: 'horizontale',
                amplitude: 140,
                periode: 3000
            }),
            // Pieux plafond hangants des 2 plafonds courts (laissent gap au centre)
            pieuPlafond(330, 300),
            pieuPlafond(380, 300),
            pieuPlafond(580, 300),
            pieuPlafond(630, 300)
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('N')) portes.N = porteN(480, 30);
        if (portesActives.includes('S')) portes.S = porteS(820, 440);

        // Monolithe sur palier S surélevé (refuge sûr droite, hors path mobile)
        const zones = [
            vestigeLore(820, 440, { loreId: 'lames_pendulantes' })
        ];

        return {
            plateformes, obstacles, zones, portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
