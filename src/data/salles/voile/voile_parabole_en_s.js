// Salle : Voile Inversé — La Parabole en S (OE compact, SIGNATURE skill)
// (Phase 9.x — Voile Vague 1, pendule cyclique : SAUT DE PRÉCISION)
//
// MÉCANIQUE : franchir un large gouffre SANS plateforme intermédiaire, en
// déclenchant l'inversion AU SOMMET du saut. La vitesse horizontale est
// conservée au switch → la chute « vers le haut » prolonge l'avancée et dessine
// un S. On atterrit pieds au plafond, sur la corniche d'arrivée décalée.
//
// SECRET DU TIMING : le pendule bascule sur un cycle fixe ; le joueur doit
// CALER son saut pour que le vertex coïncide avec le switch (le télégraphe de
// bord magenta prévient ~0,8 s avant). Skill « speedrun » — fail = chute dans
// les pics = mort = Cité = retry (boucle fail-and-retry assumée).
//
// CADRE DESIGN — 5 critères (4/5) :
//   ✓ Risque    : gouffre LÉTAL large + pics au plafond du départ
//   ✓ Pression  : fenêtre de timing serrée (vertex = switch)
//   ✓ Choix     : ~ (quand sauter dans le cycle)
//   ✓ Lecture   : départ sol / arrivée plafond décalée + télégraphe
//   ~ Combat    : aucun (la salle est un test de mobilité pur)
//
// Validateur : côté arrivée (corniche-plafond + sol droit) tagué
// 'gravite_inverse' → ignoré par le BFS. Seule la corniche de départ reste,
// donc 0 inaccessible (la traversée n'existe QUE par l'inversion, par design).

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    pieuPlafond
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;          // 500
const Y_CORNICHE = 130;                 // corniche d'arrivée au plafond

export const voile_parabole_en_s = {
    id: 'voile_parabole_en_s',
    biome: 'voile_inverse',
    nom: 'La Parabole en S',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['pont', 'hall'],
    rolesAutorises: ['main', 'alt'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 16));

        // Corniche de DÉPART (sol gauche). Le sol s'arrête net au-dessus du vide.
        plateformes.push(sol(0, 250, Y_SOL));

        // Gouffre LÉTAL ~450 px (≈ 3× saut horizontal max). Pas de plateforme.

        // Côté ARRIVÉE (droite) — tagué 'gravite_inverse' (BFS l'ignore : ce côté
        // n'est atteignable QUE par le saut inversé) :
        //   • corniche-plafond où l'on atterrit pieds en haut (S-parabole)
        plateformes.push(plateforme(810, Y_CORNICHE, 220, { tags: ['gravite_inverse'] }));
        //   • sol de réception : au flip suivant (retour gravité normale) on y
        //     retombe depuis la corniche, puis on sort par E.
        plateformes.push(sol(700, W, Y_SOL, { tags: ['gravite_inverse'] }));

        // Pics au PLAFOND au-dessus du départ : punissent un switch déclenché
        // alors qu'on traîne encore sur la corniche de départ (on est catapulté
        // dans les pics au lieu de partir en parabole).
        const obstacles = [
            pieuPlafond(90, 32),
            pieuPlafond(170, 32)
        ];

        // Pendule : demi-phase 2,8 s (fenêtre confortable pour caler le saut).
        const penduleInversion = { periode: 2800, telegraphMs: 800, depart: 'bas' };

        // Récompense sur la corniche d'arrivée (au niveau du joueur tête en bas :
        // corniche.bottom 146 + PLAYER_H/2 30 = 176).
        const coffreForce = { x: 770, y: 176 };

        // Salle de mobilité pure : aucun ennemi (tableau vide = override total).
        const ennemisForce = [];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 70, y: Y_SOL - 20 },
            coffreForce, ennemisForce, penduleInversion
        };
    }
};
