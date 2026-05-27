// Salle : Ruines basses — Le Pont Effrité (NSEO compact, signature)
// (Phase 9.4 Vague 1 — pool diversité)
//
// CADRE DESIGN — 5 critères (5/5) :
//   ✓ Risque    : fosse mortelle 560 px sous le pont effrité = mort instant
//   ✓ Pression  : 5 dalles sol_effrite qui s'écroulent en cascade au passage
//   ✓ Choix     : pont DIRECT (rapide+risqué) OU détour par paliers hauts
//                 (long mais safe)
//   ✓ Combat    : statue éveillée au début du pont force la décision rapide
//   ✓ Lecture   : pont visible dans toute la salle, fosse béante évidente

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE, porteN, porteS,
    solEffrite, vestigeLore
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const ruines_pont_effrite = {
    id: 'ruines_pont_effrite',
    biome: 'ruines_basses',
    nom: 'Le Pont Effrité',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['pont', 'hall'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));

        // Sol G + Sol D, fosse mortelle 200..760
        plateformes.push(sol(0, 200, Y_SOL));
        plateformes.push(sol(760, W, Y_SOL));

        // PONT DE SOLS EFFRITÉS (course-poursuite forcée)
        plateformes.push(solEffrite(260, 440, 80));
        plateformes.push(solEffrite(370, 440, 80));
        plateformes.push(solEffrite(480, 440, 80));
        plateformes.push(solEffrite(590, 440, 80));
        plateformes.push(solEffrite(700, 440, 80));

        // DÉTOUR safe par paliers hauts (long mais sans risque effrité)
        plateformes.push(plateforme(140, 360, 100, { oneWay: true }));   // bas G
        plateformes.push(plateforme(300, 290, 100, { oneWay: true }));
        plateformes.push(plateforme(480, 230, 150, { oneWay: true }));   // refuge centre
        plateformes.push(plateforme(660, 290, 100, { oneWay: true }));
        plateformes.push(plateforme(820, 360, 100, { oneWay: true }));   // bas D

        // Ascension N depuis refuge centre
        plateformes.push(plateforme(480, 140, 140, { oneWay: true }));

        // Palier S surélevé sur sol D
        plateformes.push(plateforme(820, 440, 130, { oneWay: true }));

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('N')) portes.N = porteN(480, 50);
        if (portesActives.includes('S')) portes.S = porteS(820, 440);

        // Statue Rare en début de pont pour forcer la décision (route haute ou basse)
        const ennemisForce = [
            { x: 260, y: 440 - 20, enemyId: 'statue_eveillee', tier: 'rare' }
        ];

        // Monolithe sur le refuge centre (récompense route haute safe)
        const zones = [
            vestigeLore(480, 230, { loreId: 'pont_effrite' })
        ];

        return {
            plateformes, obstacles: [], zones, portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 },
            ennemisForce
        };
    }
};
