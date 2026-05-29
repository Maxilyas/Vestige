// Salle : Voile Inversé — La Balance Gravitationnelle (OE compact, SIGNATURE — mécanique neuve)
// (Phase 9.x — Voile Vague 2, 2e des 2 mécaniques de gravité)
//
// MÉCANIQUE NEUVE `balance` : deux plateaux ridables reliés par une poulie
// (yG = yRepos + θ·A, yD = yRepos − θ·A). Le couple = (chargeG − chargeD) × signe
// de la gravité du JOUEUR → un flip d'inversion INVERSE le penchant. Le
// `contrepoids` (pierre poussable) ajoute son poids au plateau où il repose.
//
// PUZZLE : un contrepoids repose sur le plateau GAUCHE → en gravité normale il
// fait DESCENDRE la gauche et MONTER la droite (le plateau-coffre est alors en
// haut, hors de portée). Au flip (pendule), le penchant s'inverse : la droite
// DESCEND près du sol. Quand la gravité revient normale, la droite REMONTE — le
// joueur, tombé du plafond sur le plateau droit qui remonte, est porté jusqu'au
// coffre. Sans le contrepoids, la droite ne remonte pas : le contrepoids est la
// clé (le déloger = échec). « Indiana Jones » — le poids et la gravité.
//
// CADRE DESIGN — 5 critères (≈4/5) :
//   ✓ Risque    : tomber du mauvais côté = repartir un cycle (perte de temps)
//   ✓ Pression  : timing du flip (se placer au plafond au-dessus du plateau droit)
//   ✓ Choix     : garder/déplacer le contrepoids change tout le comportement
//   ✓ Lecture   : poulie + câbles + contrepoids à rune de masse + télégraphe
//   ~ Combat    : aucun (test de manipulation pur)
//
// Validateur-safe : O↔E trivial par le sol ; la corniche-plafond est taguée
// gravite_inverse (ignorée par le BFS) ; la corniche-coffre est atteignable via
// les positions virtuelles du plateau droit (cf. valider_salles.mjs).
//
// À TESTER EN NAVIGATEUR : amplitude/vitesse de la balance + period du pendule
// pour que la chute-sur-plateau-qui-remonte soit jouable.

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    balanceGravite, contrepoids
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;          // 500
const Y_CORNICHE = 110;                 // corniche-plafond (marche inversée)

export const voile_balance_gravitationnelle = {
    id: 'voile_balance_gravitationnelle',
    biome: 'voile_inverse',
    nom: 'La Balance Gravitationnelle',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'arene', 'pont'],
    rolesAutorises: ['main', 'alt'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];
        plateformes.push(plafondCathedrale(40, W - 40, 16));

        // Sol plein : traversée O↔E triviale (validateur-safe).
        plateformes.push(sol(0, W, Y_SOL));

        // Corniche-plafond pleine largeur = la « marche » où le joueur se pose en
        // phase inversée (il y marche tête en bas pour se placer au-dessus du
        // plateau droit). Taguée gravite_inverse → BFS l'ignore.
        plateformes.push(plateforme(W / 2, Y_CORNICHE, W, { tags: ['gravite_inverse'] }));

        // Corniche-coffre : atteinte par le plateau droit à son point haut (210).
        plateformes.push(plateforme(620, 168, 130, { oneWay: true, tags: ['gravite_inverse'] }));

        // Balance : plateau gauche x340, plateau droit x620, équilibre y330,
        // amplitude 120 → plateaux entre 210 (haut) et 450 (bas, près du sol).
        const balance = balanceGravite(340, 620, 330, { amplitude: 120, vitesse: 1.5 });

        // Contrepoids posé sur le plateau gauche (au repos θ=0 : top plateau 322).
        // Il fait descendre la gauche en gravité normale → la droite monte.
        const obstacles = [
            balance,
            contrepoids(340, 322, { poids: 1.6 })
        ];

        // Pendule : fournit le flip qui inverse le penchant de la balance.
        const penduleInversion = { periode: 3000, telegraphMs: 800, depart: 'bas' };

        // Coffre sur la corniche-coffre droite (atteinte en haut du plateau droit).
        const coffreForce = { x: 620, y: 138 };

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 70, y: Y_SOL - 20 },
            coffreForce, ennemisForce: [], penduleInversion
        };
    }
};
