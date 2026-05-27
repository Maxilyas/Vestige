// Salle : Halls Cendrés — Le Geyser Central (OE compact, signature)
// (Phase 9.7 — Extension toolkit)
//
// SIGNATURE : geyser permanent central. Le palier sommet (coffre) n'est
// atteignable QUE via boost geyser → mécanique de mobilité forcée.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    geyserVapeur, brasier
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_geyser_central = {
    id: 'halls_geyser_central',
    biome: 'halls_cendres',
    nom: 'Le Geyser Central',
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

        // Foyers latéraux (brasiers cycliques classiques)
        plateformes.push(plateforme(200, Y_SOL - 20, 80));
        plateformes.push(plateforme(760, Y_SOL - 20, 80));

        // Paliers safe latéraux
        plateformes.push(plateforme(120, 430, 100, { oneWay: true }));
        plateformes.push(plateforme(840, 430, 100, { oneWay: true }));

        // Mid paliers (combat aérien autour du geyser)
        plateformes.push(plateforme(290, 340, 100, { oneWay: true }));
        plateformes.push(plateforme(670, 340, 100, { oneWay: true }));

        // Palier sommet COFFRE — ATTENDS le geyser pour y monter
        // (vert 120 depuis mid paliers = inatteignable au saut normal)
        plateformes.push(plateforme(480, 215, 160, { oneWay: true, tags: ['metroidvania'] }));

        // Paliers intermédiaires accessibles au saut (route safe alt)
        plateformes.push(plateforme(330, 270, 100, { oneWay: true }));
        plateformes.push(plateforme(630, 270, 100, { oneWay: true }));

        const obstacles = [
            // Geyser CENTRAL — phase ON catapulte vers le palier sommet
            geyserVapeur(480, Y_SOL, { hauteur: 240, cycleMs: 3200, offsetMs: 0 }),
            // 2 brasiers latéraux pour pression supplémentaire
            brasier(200, Y_SOL - 20, { cycleMs: 2600, offsetMs: 0,    largeur: 70 }),
            brasier(760, Y_SOL - 20, { cycleMs: 2600, offsetMs: 1300, largeur: 70 })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        const coffreForce = { x: 480, y: 215 - 12 };

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 },
            coffreForce
        };
    }
};
