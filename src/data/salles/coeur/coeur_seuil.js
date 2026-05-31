// Salle : Cœur du Reflux — Le Seuil (vue de dessus, NSEO)
// (Phase 9.10 — fondation top-down : 1ère salle test du dernier biome)
//
// INTENTION : valider le FEEL du déplacement 8 directions + dash dans une
// salle vide et lisible. Pas d'ennemi (ennemisForce: []), pas de gouffre
// (vue topDown → gouffreMort forcé à false par genererSalle). Quelques
// piliers internes pour tester les collisions, un sigle narratif central.
//
// Convention top-down :
//   • `vue: 'topDown'` → GameScene coupe la gravité, active le 8-dir + dash.
//   • Le sol EST le plan : pas de plateforme-sol, on s'appuie sur les
//     world bounds (960×540) pour contenir le joueur. Les `mur(...)` internes
//     servent d'obstacles de collision.
//   • Portes posées au milieu de chaque bord actif (pas de palier vertical).

import {
    HAUTEUR_SOL, HAUTEUR_PORTE,
    mur, porteO, porteE, porteN, porteS,
    vestigeLore
} from '../_format.js';

const W = 960;
const H = 540;

export const coeur_seuil = {
    id: 'coeur_seuil',
    biome: 'coeur_reflux',
    nom: 'Le Seuil',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    vue: 'topDown',
    gouffreMort: false,
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['arene', 'hall', 'crypte', 'sanctuaire'],
    unique: true,
    rolesAutorises: ['main', 'alt', 'entree'],
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];

        // Deux piliers internes (bas-reliefs) pour tester la collision top-down.
        // Tagués 'structurel' : pas des paliers walkable, juste des obstacles.
        plateformes.push(mur(W * 0.36, H * 0.30, H * 0.50, { epaisseur: 30 }));
        plateformes.push(mur(W * 0.64, H * 0.50, H * 0.70, { epaisseur: 30 }));

        // Pas d'ennemi : salle d'apprentissage du mouvement.
        const obstacles = [];

        // Sigle narratif central (« Ne baisse pas les yeux. ») — les monolithes
        // vestige_lore sont lus par NarrativeSystem depuis `zones`, pas obstacles.
        const zones = [
            vestigeLore(W / 2, H / 2 + 30, { loreId: 'coeur_seuil' })
        ];

        // Portes au milieu de chaque bord actif.
        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(H / 2 + HAUTEUR_PORTE / 2);
        if (portesActives.includes('E')) portes.E = porteE(W, H / 2 + HAUTEUR_PORTE / 2);
        if (portesActives.includes('N')) portes.N = porteN(W / 2, HAUTEUR_SOL);
        if (portesActives.includes('S')) portes.S = porteS(W / 2, H - 4);

        return {
            plateformes,
            obstacles,
            zones,
            portes,
            ennemisForce: [],                 // aucune entité : feel pur
            spawnDefault: { x: 80, y: H / 2 }
        };
    }
};
