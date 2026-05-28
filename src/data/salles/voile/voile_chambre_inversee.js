// Salle : Voile Inversé — La Chambre Renversée (OE compact, SIGNATURE)
// (Phase 9.x — Voile Vague 1, PROTOTYPE de la mécanique d'inversion de gravité)
//
// MÉCANIQUE SIGNATURE : une COLONNE de gravité inversée (zone `gravite_inverse`).
// Quand le joueur saute dedans, sa gravité tire vers le HAUT — il « tombe » au
// plafond, marche tête en bas sous une corniche, et récupère un coffre. En
// ressortant latéralement de la colonne, il retombe vers le sol.
//
// CHOIX DE DESIGN (prototype) : la salle reste FORGIVING. Sol plein continu →
// la traversée O↔E est toujours triviale et sûre (jamais de soft-lock même si
// la physique d'inversion a un bug). La colonne est une RÉCOMPENSE optionnelle
// (coffre au plafond), pas un passage obligé. À durcir en vraie salle signature
// (risque/ennemis) une fois le feel validé en navigateur.
//
// La corniche du plafond est taguée 'gravite_inverse' → le validateur BFS
// (gravité normale) l'ignore : elle n'est atteignable que par l'inversion.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const voile_chambre_inversee = {
    id: 'voile_chambre_inversee',
    biome: 'voile_inverse',
    nom: 'La Chambre Renversée',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'sanctuaire'],
    rolesAutorises: ['main', 'alt', 'entree'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];

        // Fermeture haute ornementale (non walkable)
        plateformes.push(plafondCathedrale(60, W - 60, 20));

        // Sol plein continu : traversée O↔E toujours possible (chemin sûr).
        plateformes.push(sol(0, W, Y_SOL));

        // Corniche du plafond (SOLIDE) = le « sol inversé ». Le joueur s'y pose
        // par en dessous une fois aspiré vers le haut par la colonne. Taguée
        // 'gravite_inverse' : atteignable seulement par l'inversion (BFS l'ignore).
        plateformes.push(plateforme(480, 150, 240, { tags: ['gravite_inverse'] }));

        // ZONE d'inversion : colonne centrale. Net gravité vers le HAUT dedans.
        // On y entre en sautant droit depuis le sol (saut normal ~96 px suffit à
        // franchir le seuil bas de la colonne, l'inversion fait le reste).
        //   y ∈ [140, 440] → ne touche PAS le joueur posé au sol (centre ~470),
        //   englobe le dessous de la corniche (centre joueur ~196) sans trou.
        const zones = [{
            type: 'gravite_inverse',
            x: 480, y: 290, largeur: 240, hauteur: 300
        }];

        // Coffre suspendu sous la corniche, au niveau du joueur tête en bas.
        const coffreForce = { x: 480, y: 196 };

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes, obstacles: [], zones, portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 },
            coffreForce
        };
    }
};
