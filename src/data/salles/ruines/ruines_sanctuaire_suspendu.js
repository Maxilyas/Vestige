// Salle : Ruines basses — Le Sanctuaire Suspendu v3.2 (vrais trous + asymétrie)
// (Phase 9.4 — Vague 1)
//
// CADRE DESIGN — 5 critères (5/5) :
//   ✓ Risque    : fosse mortelle 180 px sous le pilier (gouffreMort = retour Cité)
//                 + sol D abaissé de 30 px = saut + dénivelé évident
//   ✓ Pression  : stalactites pendues sous plafonds courts, vautour aérien
//   ✓ Choix     : 4 voies — escalade longue / TROU mur secret pilier / mobile vert /
//                 ancrage plateau Metroidvania
//   ✓ Combat    : vautour Élite (zone G) + Statue Rare (refuge G)
//   ✓ Lecture   : pilier descend dans fosse mortelle = silhouette claire,
//                 asymétrie sols (G haut, D bas), parois latérales structurelles
//
// FIXES v3.2 vs v3.1 :
//   • PILIER en 2 morceaux (top y=80..210 + bottom y=270..540) — le mur secret
//     REMPLIT le gap y=210..270. Cassé → VRAI trou pour traverser G↔D
//   • MUR SECRET DROIT déplacé à l'intérieur (x=880, pas sur paroi extérieure).
//     Niche secrète à droite (x=910) entre mur cassable et paroi extérieure x=945
//   • SOL ASYMÉTRIQUE retrouvé : sol G y=500 + sol D y=530 (-30 px). Asymétrie
//     visuelle évidente + porte E plus basse
//   • FOSSE MORTELLE ÉLARGIE à 180 px (x=380..560 hors pilier). Infranchissable
//     au saut horizontal (max 130). Force vraiment à grimper le pilier
//   • Palier latéral D repositionné à y=460 pour accès depuis sol D y=530

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale, plafond,
    porteO, porteE,
    plateformeMobile, pieuPlafond,
    murSecret, antiAncrage, mur
} from '../_format.js';

const W = 960;
const H = 540;
const Y_SOL = H - HAUTEUR_SOL;          // 500
const Y_SOL_D = Y_SOL + 30;             // 530 — sol D abaissé (asymétrie)

export const ruines_sanctuaire_suspendu = {
    id: 'ruines_sanctuaire_suspendu',
    biome: 'ruines_basses',
    nom: 'Le Sanctuaire Suspendu',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['sanctuaire', 'hall'],
    rolesAutorises: ['main', 'alt'],
    unique: true,
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];

        // ─── Voûte cathédrale (couvre toute la largeur) ────────────────
        plateformes.push(plafondCathedrale(40, W - 40, 24));

        // ─── PAROIS LATÉRALES extérieures (ferment la salle) ───────────
        plateformes.push(mur(15, 38, Y_SOL));
        plateformes.push(mur(945, 38, Y_SOL));

        // ─── SOLS ASYMÉTRIQUES + FOSSE MORTELLE LARGE ──────────────────
        // Sol G normal y=500 — porte O
        plateformes.push(sol(0, 380, Y_SOL));
        // Sol D abaissé y=530 (-30 asymétrie) — porte E plus basse
        plateformes.push(sol(560, W, Y_SOL_D));
        // → Fosse mortelle 180 px entre x=380 et x=560 (autour du pilier)
        // → gouffreMort par défaut (WorldGen) = chute = retour Cité

        // ─── PILIER en 2 MORCEAUX (vrai trou possible via mur secret) ──
        // Top : du plafond à y=210
        plateformes.push(mur(490, 80, 210, { epaisseur: 40 }));
        // Bottom : de y=270 jusqu'au bas du canvas (émerge de la fosse)
        plateformes.push(mur(490, 270, H, { epaisseur: 40 }));
        // → Entre y=210 et y=270 : le mur secret remplit. Cassé = passage G↔D

        // ─── ESCALIER côté GAUCHE du pilier (4 paliers) ────────────────
        plateformes.push(plateforme(440, 430, 60, { oneWay: true }));
        plateformes.push(plateforme(440, 340, 60, { oneWay: true }));
        plateformes.push(plateforme(440, 250, 60, { oneWay: true })); // refuge G
        plateformes.push(plateforme(440, 160, 60, { oneWay: true }));

        // ─── ESCALIER côté DROIT du pilier (4 paliers) ─────────────────
        plateformes.push(plateforme(540, 430, 60, { oneWay: true }));
        plateformes.push(plateforme(540, 340, 60, { oneWay: true }));
        plateformes.push(plateforme(540, 250, 60, { oneWay: true })); // refuge D
        plateformes.push(plateforme(540, 160, 60, { oneWay: true }));

        // ─── SOMMET du pilier (coffre principal) ──────────────────────
        plateformes.push(plateforme(490, 80, 100, { oneWay: true }));

        // ─── PLATEAU METROIDVANIA (gating ancrage ou wall-jump futur) ──
        plateformes.push(plateforme(830, 80, 80, { oneWay: true, tags: ['metroidvania'] }));

        // ─── PALIER LATÉRAL G d'accès aux paliers du pilier ────────────
        plateformes.push(plateforme(200, 430, 100, { oneWay: true }));
        // ─── PALIER LATÉRAL D (y=460 pour accès depuis sol D y=530) ────
        plateformes.push(plateforme(700, 460, 100, { oneWay: true }));

        // ─── NICHE SECRÈTE droite (derrière mur secret intérieur) ──────
        plateformes.push(plateforme(910, 230, 60, { oneWay: true, tags: ['secret'] }));

        // ─── PLAFONDS COURTS qui ancrent les stalactites visuellement ──
        plateformes.push(plafond(340, 420, 100));    // au-dessus paliers G hauts
        plateformes.push(plafond(560, 640, 100));    // au-dessus paliers D hauts

        // ─── Obstacles ─────────────────────────────────────────────────
        const obstacles = [
            // Mobile vertical côté D : oscille y ∈ [160..400]
            plateformeMobile(650, 280, 90, {
                axe: 'verticale',
                amplitude: 120,
                periode: 2800
            }),
            // Mobile horizontale côté G : oscille x ∈ [80..280]
            plateformeMobile(180, 370, 80, {
                axe: 'horizontale',
                amplitude: 100,
                periode: 2200
            }),

            // STALACTITES attachées aux plafonds courts (visuel cohérent)
            pieuPlafond(370, 114),
            pieuPlafond(400, 114),
            pieuPlafond(590, 114),
            pieuPlafond(620, 114),

            // MUR SECRET DANS LE PILIER (remplit le gap y=210..270)
            // Cassé = vrai trou horizontal G↔D à mi-hauteur
            murSecret(490, 210, 40, 60, { hp: 3, dropSel: true }),

            // MUR SECRET intérieur droit (x=880, pas sur paroi extérieure)
            // Derrière : niche secrète accessible (entre x=880 et x=945)
            murSecret(880, 190, 30, 100, { hp: 3, dropSel: true }),

            // ANTI-ANCRAGE au-dessus de la fosse mortelle pilier
            antiAncrage(490, 200, 280, 280)
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        // Porte E sur le sol D abaissé
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL_D);

        // ─── ENNEMIS forcés ────────────────────────────────────────────
        const ennemisForce = [
            { x: 250, y: 220, enemyId: 'vautour_debris', tier: 'elite' },
            { x: 440, y: 250 - 20, enemyId: 'statue_eveillee', tier: 'rare' }
        ];

        // Drop Sel forcé sur refuge G (récompense Statue tuée)
        const dropSolForce = { x: 440, y: 250 - 12 };

        // Coffre principal sur sommet pilier
        const coffreForce = { x: 490, y: 80 - 12 };

        return {
            plateformes,
            obstacles,
            zones: [],
            portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 },
            coffreForce,
            dropSolForce,
            ennemisForce
        };
    }
};
