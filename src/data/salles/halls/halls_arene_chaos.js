// Salle : Halls Cendrés — L'Arène du Chaos (NSEO compact, signature MEGA)
// (Phase 9.8 — Toolkit medium-cost)
//
// SIGNATURE MEGA : combo v1+v2 — marteau-pilon + geyser de vapeur + brasier
// + bloc charbon. Toutes les mécaniques principales Halls dans une seule
// salle. Cœur du toolkit Halls.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteS, porteE, porteO,
    marteauPilon, geyserVapeur, brasier, blocCharbon
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_arene_chaos = {
    id: 'halls_arene_chaos',
    biome: 'halls_cendres',
    nom: 'L\'Arène du Chaos',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['N', 'S', 'E', 'O'],
    archetypesCompatibles: ['arene', 'sanctuaire'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // 2 foyers latéraux (brasier + emplacement pour bloc charbon)
        plateformes.push(plateforme(280, Y_SOL - 20, 80));
        plateformes.push(plateforme(680, Y_SOL - 20, 80));

        // Paliers safe latéraux bas
        plateformes.push(plateforme(120, 430, 90, { oneWay: true }));
        plateformes.push(plateforme(840, 430, 90, { oneWay: true }));

        // Paliers mid pour combat
        plateformes.push(plateforme(310, 340, 100, { oneWay: true }));
        plateformes.push(plateforme(650, 340, 100, { oneWay: true }));

        // Palier centre (atteignable via geyser pour route N)
        plateformes.push(plateforme(480, 240, 130, { oneWay: true, tags: ['metroidvania'] }));

        // Stepping intermédiaire pour route safe (paliers latéraux) — vert 90
        plateformes.push(plateforme(280, 250, 100, { oneWay: true }));
        plateformes.push(plateforme(680, 250, 100, { oneWay: true }));

        // Ascension N — vert 90 entre chaque
        plateformes.push(plateforme(480, 160, 160, { oneWay: true }));
        plateformes.push(plateforme(480, 80, 130, { oneWay: true }));

        // Palier S
        plateformes.push(plateforme(820, 440, 130, { oneWay: true }));

        const obstacles = [
            // Marteau-pilon décalé (impact sur sol G)
            marteauPilon(420, 60, 420, { cycleMs: 2800, offsetMs: 0 }),
            // Geyser central (catapulte joueur vers palier centre)
            geyserVapeur(480, Y_SOL, { hauteur: 200, cycleMs: 3000, offsetMs: 1200 }),
            // 2 brasiers latéraux (sur foyers, pour enflammer bloc)
            brasier(280, Y_SOL - 20, { cycleMs: 2600, offsetMs: 0,    largeur: 70 }),
            brasier(680, Y_SOL - 20, { cycleMs: 2600, offsetMs: 1300, largeur: 70 }),
            // Bloc charbon (pousser vers brasier pour explosion = combo)
            blocCharbon(160, Y_SOL, { taille: 45 })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);
        if (portesActives.includes('N')) portes.N = porteN(480, 30);
        if (portesActives.includes('S')) portes.S = porteS(820, 440);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
