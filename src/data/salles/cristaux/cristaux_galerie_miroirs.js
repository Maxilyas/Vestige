// Salle : Cristaux Glacés — La Galerie des Miroirs (OE compact, SIGNATURE)
// (Phase 9.x — Tranche 2 Vague 2 : le Miroir)
//
// SIGNATURE : gouffre mortel franchi par une rangée de plateformes — mais
// certaines sont de faux sols miroirs (intangibles, ondulation « eau »). Il
// faut LIRE avant de sauter. Critères : risque (gouffre), choix (vraie/fausse),
// lecture (reflet vs marbre mat).

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    fauxSolMiroir
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const cristaux_galerie_miroirs = {
    id: 'cristaux_galerie_miroirs',
    biome: 'cristaux_glaces',
    nom: 'La Galerie des Miroirs',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['pont', 'hall'],
    rolesAutorises: ['main', 'alt', 'entree'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));

        // Sol coupé : gouffre mortel central (300 → 660)
        plateformes.push(sol(0, 300, Y_SOL));
        plateformes.push(sol(660, W, Y_SOL));

        // VRAIES plateformes de traversée (marbre mat)
        plateformes.push(plateforme(380, 440, 90, { oneWay: true }));
        plateformes.push(plateforme(540, 440, 90, { oneWay: true }));

        const obstacles = [
            // FAUX sols (intangibles) intercalés — pièges de lecture
            fauxSolMiroir(460, 440, 80),
            fauxSolMiroir(620, 440, 80)
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
