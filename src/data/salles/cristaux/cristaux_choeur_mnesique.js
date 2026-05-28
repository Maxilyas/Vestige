// Salle : Cristaux Glacés — Le Chœur Mnésique (NSEO compact, SIGNATURE)
// (Phase 9.x — Tranche 2, centerpiece : la dualité du bruit)
//
// SIGNATURE : le bruit a deux tranchants. Frapper les cristaux mnésiques
// (violet, sur les bords) RÉVÈLE les plateformes de résonance pour monter
// vers la porte N. Mais des stalactites mortes pendent au-dessus de
// l'ascension centrale : attaquer là les décroche. La solution élégante :
// faire du bruit AUX BORDS (zone sûre), puis grimper le centre EN SILENCE.
// Critères : risque + pression + choix + lecture (4/5).

import {
    HAUTEUR_SOL, sol, plateforme,
    porteN, porteS, porteO, porteE,
    stalactiteResonance, cristalResonant, plateformeResonance
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const cristaux_choeur_mnesique = {
    id: 'cristaux_choeur_mnesique',
    biome: 'cristaux_glaces',
    nom: 'Le Chœur Mnésique',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['sanctuaire', 'hall'],
    rolesAutorises: ['main', 'alt', 'entree'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(sol(0, W, Y_SOL));

        // Estrades latérales (footing + supports des cristaux mnésiques)
        plateformes.push(plateforme(150, 420, 150, { oneWay: true }));
        plateformes.push(plateforme(810, 420, 150, { oneWay: true }));
        // Palier S surélevé (porte S)
        plateformes.push(plateforme(480, 440, 140, { oneWay: true }));
        // Palier sommet sous porte N — accessible UNIQUEMENT via le chant
        // (révélation des plateformes de résonance). Tagué metroidvania :
        // le validateur l'ignore (gating de progression par mécanique).
        plateformes.push(plateforme(480, 120, 150, { oneWay: true, tags: ['metroidvania'] }));

        const obstacles = [
            // Cristaux mnésiques AUX BORDS (zone sûre pour faire du bruit)
            cristalResonant(110, 420, { lien: 'choeur' }),
            cristalResonant(850, 420, { lien: 'choeur' }),
            // Plateformes de résonance : ascension centrale révélée par le chant
            plateformeResonance(330, 350, 120, { lien: 'choeur' }),
            plateformeResonance(540, 290, 120, { lien: 'choeur' }),
            plateformeResonance(420, 210, 120, { lien: 'choeur' }),
            // Stalactites mortes au-dessus de l'ascension : grimper EN SILENCE
            stalactiteResonance(330, 46, 360),
            stalactiteResonance(480, 46, Y_SOL),
            stalactiteResonance(560, 46, 300)
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('N')) portes.N = porteN(480, 30);
        if (portesActives.includes('S')) portes.S = porteS(480, 440);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
