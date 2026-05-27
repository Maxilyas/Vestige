// Salle : Ruines basses — Le Belvédère Pendule (NO compact, signature)
// (Phase 9.4 Vague 1 — pool diversité)
//
// CADRE DESIGN — 5 critères (4/5) :
//   ✓ Risque    : fosse mortelle 280 px entre les 2 paliers G et la corniche N
//   ✓ Pression  : mobile horizontale longue (amplitude 200) = timing serré
//                 pour traverser
//   ✓ Choix     : passer par mobile (rapide) OU contourner via paliers hauts
//   ✓ Combat    : pas forcé — la salle est une épreuve de mobilité pure
//   ✓ Lecture   : mobile visible au centre, fosse béante claire
//
// Salle NO orientée gauche : entrée sol par porte O, sortie haut par N.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteO,
    plateformeMobile, pieuSol, vestigeLore
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const ruines_belvedere_pendule = {
    id: 'ruines_belvedere_pendule',
    biome: 'ruines_basses',
    nom: 'Le Belvédère Pendule (NO)',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'O'],
    archetypesCompatibles: ['hall', 'sanctuaire'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['N', 'O'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));

        // Sol G + Sol D, fosse mortelle 250..530
        plateformes.push(sol(0, 250, Y_SOL));
        plateformes.push(sol(530, W, Y_SOL));

        // Paliers d'ascension G (route lente safe)
        // palier y=340 décalé droite pour rejoindre le belvédère (gap edge ≤130)
        plateformes.push(plateforme(140, 430, 100, { oneWay: true }));
        plateformes.push(plateforme(240, 340, 100, { oneWay: true }));

        // Belvédère central (refuge depuis mobile OU depuis palier G y=340)
        plateformes.push(plateforme(400, 270, 130, { oneWay: true }));

        // Couloir ascension vers porte N (du côté gauche)
        plateformes.push(plateforme(280, 180, 140, { oneWay: true }));
        plateformes.push(plateforme(280, 95, 140, { oneWay: true }));   // palier N

        // Palier latéral D (combat aérien)
        plateformes.push(plateforme(800, 430, 110, { oneWay: true }));

        const obstacles = [
            // Mobile horizontale longue — traverse fosse depuis sol D vers belvédère
            plateformeMobile(490, 380, 100, {
                axe: 'horizontale',
                amplitude: 180,
                periode: 3200
            }),
            // Pieux sol D (combat sous mobile)
            pieuSol(620, Y_SOL),
            pieuSol(780, Y_SOL)
        ];

        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(280, 30);
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);

        // Monolithe sur le belvédère central (récompense traversée mobile)
        const zones = [
            vestigeLore(400, 270, { loreId: 'belvedere_pendule' })
        ];

        return {
            plateformes, obstacles, zones, portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
