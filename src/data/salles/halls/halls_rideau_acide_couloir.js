// Salle : Halls Cendrés — Le Couloir d'Acide (OE compact, signature)
// (Phase 9.7 — Extension toolkit)
//
// SIGNATURE : couloir horizontal traversé par 3 rideaux d'acide à
// franchir au timing (gouttes en continu, invincibilité brève après hit
// = on peut sprinter à travers en perdant peu de PV).

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    rideauAcide
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;

export const halls_rideau_acide_couloir = {
    id: 'halls_rideau_acide_couloir',
    biome: 'halls_cendres',
    nom: 'Le Couloir d\'Acide',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'pont'],
    rolesAutorises: ['main', 'alt'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 24));
        plateformes.push(sol(0, W, Y_SOL));

        // Paliers latéraux + mid pour combat aérien autour des rideaux
        plateformes.push(plateforme(140, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(820, 430, 110, { oneWay: true }));
        plateformes.push(plateforme(330, 360, 110, { oneWay: true }));
        plateformes.push(plateforme(630, 360, 110, { oneWay: true }));

        // Palier haut centre (route alternative pour éviter rideaux bas)
        plateformes.push(plateforme(480, 280, 180, { oneWay: true }));
        plateformes.push(plateforme(480, 190, 160, { oneWay: true }));

        const obstacles = [
            // 3 rideaux d'acide qui descendent du plafond jusqu'au sol
            // (largeur 30 chacun, traversables au sprint)
            rideauAcide(260, 60, 440),
            rideauAcide(480, 60, 440),
            rideauAcide(700, 60, 440)
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
