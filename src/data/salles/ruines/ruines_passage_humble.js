// Salle : Ruines basses — Le Passage humble (B-bas)
//
// Voie alternative au Grimpeur. Joueur arrive d'EN HAUT (porte N depuis
// la trappe S du Grimpeur), descend à travers une mezzanine où repose
// un coffre — RÉCOMPENSE du détour. Continue vers l'est (porte E).
//
// NARRATIF — "les passages des artisans" :
//   Sous la cité noble, les ouvriers qui ne pouvaient pas grimper
//   passaient par ici. Voûtes basses, voûtes effondrées, racines
//   pourpres qui percent la pierre.
//
// GESTE DE DESIGN : 2 chemins possibles dans la mid-section.
//   - Voie BASSE (sol) : confort mais quelques éboulis à casser et
//     une zone d'anti-ancrage (Reflux qui suinte).
//   - Voie HAUTE (voûtes effondrées) : zigzag tactique, plus rapide,
//     mais demande timing de saut.

import {
    HAUTEUR_SOL, sol, plateforme, antiAncrage, eboulis,
    porteN, porteE
} from '../_format.js';

const W = 3000;
const H = 720;
const Y_SOL = H - HAUTEUR_SOL;        // 680
const Y_MEZZANINE = 270;              // mezzanine d'accès porte N + coffre

export const ruines_passage_humble = {
    id: 'ruines_passage_humble',
    biome: 'ruines_basses',
    nom: 'Le Passage humble',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['N', 'E'],
    archetypesCompatibles: ['crypte', 'hall'],

    generer({ portesActives = ['N', 'E'] } = {}) {
        const plateformes = [];

        // ─── Sol entier (voie BASSE) ─────────────────────────────────
        plateformes.push(sol(0, W, Y_SOL));

        // ─── Escalier d'accès à la mezzanine — ZIGZAG ATTEIGNABLE ────
        // Saut max vert 96, horiz 130 edge-to-edge respectés.
        plateformes.push(plateforme(80,  610, 80, { oneWay: true }));     // depuis sol (70 vert)
        plateformes.push(plateforme(200, 540, 80, { oneWay: true }));     // gap 40 horiz
        plateformes.push(plateforme(80,  470, 80, { oneWay: true }));     // zigzag
        plateformes.push(plateforme(200, 400, 80, { oneWay: true }));
        plateformes.push(plateforme(120, 330, 80, { oneWay: true }));

        // ─── Mezzanine porte N (atteignable depuis le palier 120/330) ──
        plateformes.push(plateforme(300, Y_MEZZANINE, 280, { oneWay: true }));

        // ─── Voie HAUTE : voûtes effondrées (chemin alternatif tactique) ─
        // Chaque palier est atteignable depuis le précédent (saut <96 vert,
        // <130 horiz edge-to-edge). On peut entrer par le bas (saut depuis sol
        // sur palier mid) ou poursuivre depuis l'escalier.
        plateformes.push(plateforme(700,  610, 80, { oneWay: true }));    // depuis sol (70 vert)
        plateformes.push(plateforme(870,  550, 100, { oneWay: true }));   // ↑ 60, gap 60
        plateformes.push(plateforme(1080, 510, 100, { oneWay: true }));   // ↑ 40, gap 60
        plateformes.push(plateforme(1300, 470, 120, { oneWay: true }));   // ↑ 40, gap 70
        plateformes.push(plateforme(1530, 510, 110, { oneWay: true }));   // ↓ 40
        plateformes.push(plateforme(1750, 480, 110, { oneWay: true }));
        plateformes.push(plateforme(1970, 520, 100, { oneWay: true }));
        plateformes.push(plateforme(2200, 560, 110, { oneWay: true }));
        plateformes.push(plateforme(2420, 540, 100, { oneWay: true }));
        plateformes.push(plateforme(2640, 590, 110, { oneWay: true }));   // redescente vers porte E
        plateformes.push(plateforme(2820, 620, 100, { oneWay: true }));

        // ─── Obstacles ───────────────────────────────────────────────
        const obstacles = [
            // 2 éboulis hauts (110 px) bloquent vraiment le sol : impossible
            // de sauter par-dessus, doit casser à l'attaque pour passer en
            // sol. Sinon, prendre la voie haute (voûtes effondrées).
            eboulis(1100, Y_SOL - 110, { largeur: 90, hp: 3 }),
            eboulis(2100, Y_SOL - 110, { largeur: 90, hp: 3, dropSel: true }),
            // Anti-ancrage zone RÉDUITE : seulement au centre mid-air, pas sur
            // toute la salle. Cohérent narratif "le Reflux suinte ici".
            antiAncrage(1500, 460, 400, 200)
        ];

        // ─── Zones interactives : aucune (pas d'ancrage dans la voie humble)
        const zones = [];

        // ─── Portes ──────────────────────────────────────────────────
        const portes = {};
        if (portesActives.includes('N')) portes.N = porteN(300, Y_MEZZANINE - 90);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        // ─── Coffre forcé sur la mezzanine (récompense narrative) ────
        const coffreForce = { x: 420, y: Y_MEZZANINE - 12 };

        const spawnDefault = { x: 300, y: Y_MEZZANINE - 20 };

        return { plateformes, obstacles, portes, zones, spawnDefault, coffreForce };
    }
};
