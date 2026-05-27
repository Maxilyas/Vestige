// Salle : Ruines basses — Les Voûtes Brisées (NSEO compact)
// (Phase 9.4 Vague 1 — pool diversité)
//
// INTENTION DESIGN : "Rayman temple vertical" — multi-niveaux empilés où
// chaque étage présente une fosse partielle. Le joueur monte de niveau en
// niveau via ressorts catapultes ou sauts précis. Pieux plafond entre les
// étages = lecture verticale punitive.
//   • 3 étages empilés avec gaps verticaux et horizontaux
//   • Sol G + Sol D au rez avec fosse mortelle centrale
//   • 2 ressorts (un par sol) catapultent vers étages supérieurs
//   • Pieux sol bordant les étages supérieurs
//   • Palier N tout en haut
//   • Palier S surélevé sur sol D

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE, porteN, porteS,
    ressort, pieuSol
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const ruines_voutes_brisees = {
    id: 'ruines_voutes_brisees',
    biome: 'ruines_basses',
    nom: 'Les Voûtes Brisées',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['hall', 'sanctuaire'],

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));

        // Sols séparés par fosse mortelle 280..680
        plateformes.push(sol(0, 280, Y_SOL));
        plateformes.push(sol(680, W, Y_SOL));

        // ÉTAGE 1 (y=420) — paliers latéraux (sol+80, OK saut)
        plateformes.push(plateforme(130, 420, 130, { oneWay: true }));
        plateformes.push(plateforme(830, 420, 130, { oneWay: true }));

        // ÉTAGE 2 (y=330) — voûte intermédiaire avec fosse partielle au centre
        plateformes.push(plateforme(180, 330, 140, { oneWay: true }));  // G
        plateformes.push(plateforme(780, 330, 140, { oneWay: true }));  // D
        // Petite passerelle centrale (saut de foi entre les 2)
        plateformes.push(plateforme(480, 330, 100, { oneWay: true }));

        // ÉTAGE 3 (y=240) — pont continu plus large (refuge)
        plateformes.push(plateforme(480, 240, 240, { oneWay: true }));

        // Couloir haut vers porte N
        plateformes.push(plateforme(480, 150, 140, { oneWay: true }));

        // Palier S surélevé
        plateformes.push(plateforme(820, 440, 130, { oneWay: true }));

        const obstacles = [
            // Ressorts en bas pour booster
            ressort(150, Y_SOL),
            ressort(810, Y_SOL),
            // Pieux sol G et sol D entre paliers (pénalité retombée)
            pieuSol(220, Y_SOL),
            pieuSol(720, Y_SOL)
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('N')) portes.N = porteN(480, 50);
        if (portesActives.includes('S')) portes.S = porteS(820, 440);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
