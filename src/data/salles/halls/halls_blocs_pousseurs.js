// Salle : Halls Cendrés — Les Blocs Pousseurs (OE compact, signature)
// (Phase 9.7 — Extension toolkit)
//
// SIGNATURE : puzzle de poussée. 2 blocs de charbon + 2 brasiers cycliques.
// Combo : pousser un bloc dans un brasier ON → s'enflamme → explose. Le
// joueur peut soit traverser au timing, soit utiliser les explosions
// pour ouvrir un passage (mur explosif qui bloque le couloir bas).

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    brasier, blocCharbon, murExplosif
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_blocs_pousseurs = {
    id: 'halls_blocs_pousseurs',
    biome: 'halls_cendres',
    nom: 'Les Blocs Pousseurs',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'sanctuaire'],
    rolesAutorises: ['main', 'alt'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // 2 foyers brasiers (à utiliser pour enflammer les blocs)
        plateformes.push(plateforme(320, Y_SOL - 20, 80));
        plateformes.push(plateforme(640, Y_SOL - 20, 80));

        // Paliers latéraux pour combat aérien
        plateformes.push(plateforme(140, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(820, 430, 110, { oneWay: true }));

        // Route haute alt (au-dessus du puzzle)
        plateformes.push(plateforme(310, 350, 100, { oneWay: true }));
        plateformes.push(plateforme(650, 350, 100, { oneWay: true }));
        plateformes.push(plateforme(480, 270, 180, { oneWay: true }));

        const obstacles = [
            // 2 blocs charbon placés près des paliers latéraux (poussables vers brasiers)
            blocCharbon(220, Y_SOL, { taille: 50 }),
            blocCharbon(740, Y_SOL, { taille: 50 }),
            // 2 brasiers cycliques (pour enflammer blocs poussés dessus)
            brasier(320, Y_SOL - 20, { cycleMs: 3000, offsetMs: 0,    largeur: 70 }),
            brasier(640, Y_SOL - 20, { cycleMs: 3000, offsetMs: 1500, largeur: 70 }),
            // Mur explosif central qui bloque le couloir bas — détruisible par
            // l'explosion d'un bloc charbon enflammé (ou attaque directe).
            murExplosif(480, Y_SOL - 100, { largeur: 32, hauteur: 100, hp: 4, dropFragmentFamille: 'noir' })
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
