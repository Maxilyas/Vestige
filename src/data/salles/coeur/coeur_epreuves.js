// Salle : Cœur du Reflux — Les Épreuves du Seuil (vue de dessus, OE)
// (Phase 9.11 — démo des 4 obstacles top-down restants)
//
// INTENTION : gauntlet de test exerçant laser_surveillance + onde_radiale +
// pieu_mnemonique + regard_fige sur un trajet O→E. Non létal mais punitif
// (chaque hazard a son télégraphe). Placeholder pinné en attendant les vraies
// salles é9/é10 (cf. COEUR.md : Le Pouls, La Salle aux Mille Regards…).

import {
    HAUTEUR_PORTE,
    mur, porteO, porteE,
    laserSurveillance, ondeRadiale, pieuMnemonique, regardFige
} from '../_format.js';

const W = 960;
const H = 540;

export const coeur_epreuves = {
    id: 'coeur_epreuves',
    biome: 'coeur_reflux',
    nom: 'Les Épreuves du Seuil',
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
        // Quelques blocs de pierre = abris (couper les lignes de tir/laser).
        const plateformes = [
            mur(470, 410, 70, { epaisseur: 30 }),       // abri central-bas
            mur(690, 120, 60, { epaisseur: 30 })        // abri haut-droite
        ];

        const obstacles = [
            // 1. Regard figé : statue en haut-centre qui surveille le couloir
            //    médian (regarde vers le bas). Tire un projectile parry-able.
            regardFige(480, 52, { angle: Math.PI / 2, demiCone: 0.5, portee: 360 }),

            // 2. Onde radiale : pulse depuis la gauche-centre (à franchir au rythme).
            ondeRadiale(260, 300, { periodeMs: 2600, vitesse: 240, rayonMax: 300 }),

            // 3. Pieux mnémoniques : 2 patchs alternés sur le trajet médian.
            pieuMnemonique(520, 300, { cycleMs: 2400, offsetMs: 0 }),
            pieuMnemonique(620, 235, { cycleMs: 2400, offsetMs: 1200 }),

            // 4. Laser de surveillance : balaie le quart droit près de la sortie.
            laserSurveillance(810, 270, { longueur: 300, vitesse: 0.8 })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(H / 2 + HAUTEUR_PORTE / 2);
        if (portesActives.includes('E')) portes.E = porteE(W, H / 2 + HAUTEUR_PORTE / 2);

        return {
            plateformes,
            obstacles,
            zones: [],
            portes,
            ennemisForce: [],
            spawnDefault: { x: 70, y: H / 2 }
        };
    }
};
