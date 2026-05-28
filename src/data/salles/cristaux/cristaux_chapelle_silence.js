// Salle : Cristaux Glacés — La Chapelle du Silence (OE compact, SIGNATURE)
// (Phase 9.x — Tranche 2, Pilier 1 : le silence brisé)
//
// SIGNATURE : voûte hérissée de stalactites de Résonance « mortes ». Elles
// tombent quand le joueur fait DU BRUIT (attaque). Traverser/combattre ici
// = doser ses coups. Critères : risque (chute), pression (ennemis poussent
// à attaquer), combat-dans-l'environnement, lecture (pics gris au plafond).

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    stalactiteResonance, pieuSol
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const cristaux_chapelle_silence = {
    id: 'cristaux_chapelle_silence',
    biome: 'cristaux_glaces',
    nom: 'La Chapelle du Silence',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'sanctuaire'],
    rolesAutorises: ['main', 'alt', 'entree'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Paliers de combat latéraux (footing aérien)
        plateformes.push(plateforme(240, 410, 130, { oneWay: true }));
        plateformes.push(plateforme(720, 410, 130, { oneWay: true }));
        // Estrade centrale (via les paliers latéraux)
        plateformes.push(plateforme(480, 330, 160, { oneWay: true }));

        const obstacles = [
            // Voûte de stalactites mortes au-dessus de la zone de combat
            stalactiteResonance(360, 46, Y_SOL),
            stalactiteResonance(480, 46, Y_SOL),
            stalactiteResonance(600, 46, Y_SOL),
            stalactiteResonance(700, 46, Y_SOL),
            // Hazard fixe : 1 pieu au sol (lecture danger statique)
            pieuSol(480, Y_SOL)
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
