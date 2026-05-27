// Salle : Halls Cendrés — La Forge Folle (NSEO compact, signature ULTIME)
// (Phase 9.7 — Extension toolkit)
//
// SIGNATURE ULTIME : combo des 3 nouvelles mécaniques + brasiers + rideaux.
// Geyser central pour atteindre paliers hauts + 2 rideaux acide latéraux +
// 1 bloc charbon poussable + 1 brasier d'enflammage.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteN, porteS, porteE, porteO,
    geyserVapeur, rideauAcide, blocCharbon, brasier
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_combo_total = {
    id: 'halls_combo_total',
    biome: 'halls_cendres',
    nom: 'La Forge Folle',
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

        // Foyer brasier d'enflammage (central, sous le geyser)
        plateformes.push(plateforme(480, Y_SOL - 20, 100));

        // Paliers latéraux bas safe (à l'écart des rideaux)
        plateformes.push(plateforme(110, 430, 80, { oneWay: true }));
        plateformes.push(plateforme(850, 430, 80, { oneWay: true }));

        // Mid paliers (combat aérien autour du geyser) — vert 90 depuis lat
        plateformes.push(plateforme(280, 340, 90, { oneWay: true }));
        plateformes.push(plateforme(680, 340, 90, { oneWay: true }));

        // Palier centre (route geyser → palier N) — vert 95 depuis mid
        plateformes.push(plateforme(480, 245, 130, { oneWay: true }));

        // Ascension N — vert 90 entre chaque
        plateformes.push(plateforme(480, 155, 160, { oneWay: true }));
        plateformes.push(plateforme(480, 80, 130, { oneWay: true }));

        // Palier S surélevé
        plateformes.push(plateforme(820, 440, 130, { oneWay: true }));

        const obstacles = [
            // Geyser central (catapulte joueur vers paliers hauts)
            geyserVapeur(480, Y_SOL, { hauteur: 200, cycleMs: 3200, offsetMs: 0 }),
            // Brasier central (enflamme le bloc charbon si poussé dedans)
            brasier(480, Y_SOL - 20, { cycleMs: 3000, offsetMs: 1500, largeur: 90 }),
            // Bloc charbon (poussable depuis paliers latéraux)
            blocCharbon(180, Y_SOL, { taille: 45 }),
            // 2 rideaux acide latéraux (couloirs G et D)
            rideauAcide(240, 80, 380),
            rideauAcide(720, 80, 380)
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
