// Salle : Cœur du Reflux — L'Écho Persistant (vue de dessus, OE)
// (Phase 9.12 — démo écho-ghost)
//
// INTENTION : salle ouverte où chaque pas est rejoué par des écho-ghosts dorés
// qui te suivent en décalé. Ils te blessent au contact : il faut traverser O→E
// sans recroiser sa propre trace récente (pas de demi-tour serré, pas de
// boucle). Deux blocs de pierre forcent à manœuvrer sans pour autant piéger.

import {
    HAUTEUR_PORTE,
    mur, porteO, porteE
} from '../_format.js';

const W = 960;
const H = 540;

export const coeur_echo = {
    id: 'coeur_echo',
    biome: 'coeur_reflux',
    nom: 'L\'Écho Persistant',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    vue: 'topDown',
    gouffreMort: false,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'crypte', 'arene'],
    unique: true,
    rolesAutorises: ['main', 'alt', 'entree'],
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        // Deux blocs : créent des détours sans enfermer (laisser des couloirs vides).
        const plateformes = [
            mur(380, 170, 130, { epaisseur: 30 }),
            mur(600, 370, 130, { epaisseur: 30 })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(H / 2 + HAUTEUR_PORTE / 2);
        if (portesActives.includes('E')) portes.E = porteE(W, H / 2 + HAUTEUR_PORTE / 2);

        return {
            plateformes,
            obstacles: [],
            zones: [],
            echoGhost: { nbGhosts: 2, decalageMs: 850, degats: 5, seuilHit: 26 },
            portes,
            ennemisForce: [],
            spawnDefault: { x: 70, y: H / 2 }
        };
    }
};
