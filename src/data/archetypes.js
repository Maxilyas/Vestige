// Archétypes de salle — 6 templates architecturaux qui donnent leur identité
// à chaque salle de Vestige.
//
// DOCTRINE 8a' (refonte) : "voie principale plate + verticalité bonus"
// ───────────────────────────────────────────────────────────────────
//   - La sortie est TOUJOURS à droite, accessible sans saut héroïque.
//   - La voie principale (sol → sortie) ne demande pas de saut difficile :
//     écart vertical max 70 px, écart horizontal entre plateformes max 130 px.
//   - La verticalité (paliers hauts, autel, sommet du puits) est OPTIONNELLE :
//     elle contient des coffres et récompenses bonus, plus accessible avec
//     des items qui boostent le saut (Souffle Glacé, Voile Pourpre, etc.).
//   - Les items deviennent significatifs : équiper +saut débloque une
//     dimension d'exploration entière (philosophie metroidvania).

import { PLAYER, WORLD } from '../config.js';

const HAUTEUR_SOL = 40;
const LARGEUR_SORTIE = 60;
const HAUTEUR_SORTIE = 90;
const LARGEUR_VORTEX = 60;
const HAUTEUR_VORTEX = 90;

// Marge confortable sur les sauts. La hauteur max du saut est ~96 px,
// mais en mouvement (avec composante horizontale) on perd de la marge.
// 70 px verticalement laisse une vraie respiration.
const ECART_VERT_SAFE = 70;

// ============================================================
// HELPERS
// ============================================================
function solHorizontal(yTop, xDebut, xFin, hauteur = HAUTEUR_SOL) {
    return {
        x: (xDebut + xFin) / 2,
        y: yTop + hauteur / 2,
        largeur: xFin - xDebut,
        hauteur,
        oneWay: false
    };
}

function plateforme(x, yTop, largeur, hauteur = 16, oneWay = false) {
    return { x, y: yTop + hauteur / 2, largeur, hauteur, oneWay };
}

// ============================================================
// 🕯 SANCTUAIRE — Refuge calme, voie principale plate, autel central bonus
// ============================================================
function genererSanctuaire(rng, dims) {
    const yTopSol = dims.hauteur - HAUTEUR_SOL;     // 500
    const yTopBalcon = yTopSol - ECART_VERT_SAFE;   // 430
    const yTopAutel = yTopBalcon - ECART_VERT_SAFE; // 360
    const cx = dims.largeur / 2;
    const platf = [];

    // Voie principale : sol entier
    platf.push(solHorizontal(yTopSol, 0, dims.largeur));

    // Verticalité bonus : 2 balcons latéraux pour monter à l'autel
    platf.push(plateforme(cx - 320, yTopBalcon, 240, 16, false));
    platf.push(plateforme(cx + 320, yTopBalcon, 240, 16, false));

    // Sommet : autel central (contient le coffre rare bonus)
    platf.push(plateforme(cx, yTopAutel, 140, 18, false));

    return platf;
}

// ============================================================
// 📜 HALL DES ÉCHOS — Salle large, mezzanine et cintres bonus
// ============================================================
function genererHall(rng, dims) {
    const yTopSol = dims.hauteur - HAUTEUR_SOL;     // 500
    const yTopMezz = yTopSol - ECART_VERT_SAFE;     // 430
    const yTopCintres = yTopMezz - ECART_VERT_SAFE; // 360
    const cx = dims.largeur / 2;
    const platf = [];

    // Voie principale : sol entier
    platf.push(solHorizontal(yTopSol, 0, dims.largeur));

    // Mezzanine centrale (bonus 1)
    platf.push(plateforme(cx, yTopMezz, dims.largeur * 0.4, 18, false));

    // Cintres latéraux (bonus 2 — atteignables depuis la mezzanine)
    platf.push(plateforme(cx - dims.largeur * 0.32, yTopCintres, dims.largeur * 0.25, 16, false));
    platf.push(plateforme(cx + dims.largeur * 0.32, yTopCintres, dims.largeur * 0.25, 16, false));

    return platf;
}

// ============================================================
// 🪨 CRYPTE DES MURMURES — Sol entier, corniches one-way pour bonus
// ============================================================
function genererCrypte(rng, dims) {
    const yTopSol = dims.hauteur - HAUTEUR_SOL;
    const yTopN2 = yTopSol - ECART_VERT_SAFE;       // 430
    const yTopN3 = yTopN2 - ECART_VERT_SAFE;        // 360
    const platf = [];

    // Voie principale : sol entier
    platf.push(solHorizontal(yTopSol, 0, dims.largeur));

    // Niveau 2 : 3 corniches one-way (drop-through possible vers le sol)
    platf.push(plateforme(dims.largeur * 0.20, yTopN2, 200, 14, true));
    platf.push(plateforme(dims.largeur * 0.50, yTopN2, 220, 14, true));
    platf.push(plateforme(dims.largeur * 0.80, yTopN2, 200, 14, true));

    // Niveau 3 : 2 corniches one-way (atteignables depuis N2 par chevauchement)
    platf.push(plateforme(dims.largeur * 0.32, yTopN3, 180, 14, true));
    platf.push(plateforme(dims.largeur * 0.68, yTopN3, 180, 14, true));

    return platf;
}

// ============================================================
// 🌉 PONT SUSPENDU — Sols séparés, plateformes du pont, plus de gouffre piège
// ============================================================
function genererPontSuspendu(rng, dims) {
    const yTopSol = dims.hauteur - HAUTEUR_SOL;     // 500
    const platf = [];

    const xFinGauche = dims.largeur * 0.27;
    const xDebutDroit = dims.largeur - xFinGauche;

    // Sols principaux gauche / droit
    platf.push(solHorizontal(yTopSol, 0, xFinGauche));
    platf.push(solHorizontal(yTopSol, xDebutDroit, dims.largeur));

    // Sol bas dans le gouffre — accessible par chute, ET RAMENABLE par saut.
    // À yTop=560 (60 px sous les sols principaux), il permet de remonter sur
    // la plateforme la plus basse du pont (à yTop=490, écart 70).
    const yTopGouffre = yTopSol + 60;               // 560
    platf.push(solHorizontal(yTopGouffre, xFinGauche, xDebutDroit));

    // 5 plateformes du pont, hauteurs variant en arc descendant puis remontant.
    // Voie principale : sol gauche → plateformes (490, 420, 360, 420, 490) → sol droit
    // Tous les sauts ≤ 70 px verticalement.
    const yTopsArc = [yTopSol - 10, yTopSol - 80, yTopSol - 140, yTopSol - 80, yTopSol - 10];
    const xPlatfs = [];
    const nbPont = 5;
    for (let i = 0; i < nbPont; i++) {
        xPlatfs.push(xFinGauche + 60 + i * ((xDebutDroit - xFinGauche - 120) / (nbPont - 1)));
    }
    for (let i = 0; i < nbPont; i++) {
        platf.push(plateforme(xPlatfs[i], yTopsArc[i], 110, 14, false));
    }

    // Verticalité bonus : 2 plateformes hautes au-dessus du pont (coffres rares)
    platf.push(plateforme(dims.largeur * 0.4, yTopSol - 220, 100, 14, false));
    platf.push(plateforme(dims.largeur * 0.6, yTopSol - 220, 100, 14, false));

    return platf;
}

// ============================================================
// 🌀 PUITS INVERSÉ — Sortie À MI-HAUTEUR à droite, sommet bonus
// ============================================================
function genererPuitsInverse(rng, dims) {
    const yTopSol = dims.hauteur - HAUTEUR_SOL;     // 1040
    const platf = [];

    // Sol bas
    platf.push(solHorizontal(yTopSol, 0, dims.largeur));

    // Voie principale (vers la sortie) : 2 paliers menant au niveau de sortie.
    // Sortie à yTop=900, posée sur un palier-sortie qui s'étend jusqu'au bord droit.
    platf.push(plateforme(dims.largeur * 0.30, 970, 240, 14, false));
    // Palier-sortie : s'étend du milieu jusqu'à la droite pour porter la sortie
    const largeurPalierSortie = dims.largeur * 0.55;
    platf.push(plateforme(
        dims.largeur - largeurPalierSortie / 2,
        900,
        largeurPalierSortie,
        18,
        false
    ));

    // Verticalité bonus : zigzag montant. Chaque palier à 70 px d'écart vertical,
    // alternance horizontale resserrée pour rester atteignable (~100 px bord à bord).
    let yTop = 830;
    let cote = 0;
    while (yTop > 100) {
        const x = cote === 0 ? dims.largeur * 0.30 : dims.largeur * 0.70;
        platf.push(plateforme(x, yTop, 240, 14, false));
        yTop -= ECART_VERT_SAFE;
        cote = 1 - cote;
    }

    // Sommet : plateforme finale (contient un coffre très rare)
    platf.push(plateforme(dims.largeur / 2, 80, 200, 14, false));

    return platf;
}

// ============================================================
// ⚔ ARÈNE DU REFLUX — Sol dégagé pour le combat, gradins concentriques bonus
// ============================================================
function genererArene(rng, dims) {
    const yTopSol = dims.hauteur - HAUTEUR_SOL;     // 680
    const yTopGradin1 = yTopSol - ECART_VERT_SAFE;  // 610
    const yTopGradin2 = yTopGradin1 - ECART_VERT_SAFE; // 540
    const yTopHaut = yTopGradin2 - ECART_VERT_SAFE; // 470
    const cx = dims.largeur / 2;
    const platf = [];

    // Voie principale : sol entier (l'arène elle-même)
    platf.push(solHorizontal(yTopSol, 0, dims.largeur));

    // Gradins concentriques (bonus, contiennent des coffres)
    platf.push(plateforme(cx - 380, yTopGradin1, 240, 14, false));
    platf.push(plateforme(cx + 380, yTopGradin1, 240, 14, false));
    platf.push(plateforme(cx - 240, yTopGradin2, 200, 14, false));
    platf.push(plateforme(cx + 240, yTopGradin2, 200, 14, false));

    // Plateforme centrale haute (vue dramatique sur l'arène)
    platf.push(plateforme(cx, yTopHaut, 200, 14, false));

    return platf;
}

// ============================================================
// CATALOGUE
// ============================================================
export const ARCHETYPES = {
    sanctuaire: {
        id: 'sanctuaire',
        nom: 'Sanctuaire',
        dimensions: { largeur: 1280, hauteur: 540 },
        niveauxAssocies: [0],
        spawnJoueur: (dims) => ({ x: 60, y: dims.hauteur - HAUTEUR_SOL - PLAYER.HEIGHT }),
        genererPlateformes: genererSanctuaire
    },
    hall: {
        id: 'hall',
        nom: 'Hall des Échos',
        dimensions: { largeur: 1920, hauteur: 540 },
        niveauxAssocies: [1, 2],
        spawnJoueur: (dims) => ({ x: 60, y: dims.hauteur - HAUTEUR_SOL - PLAYER.HEIGHT }),
        genererPlateformes: genererHall
    },
    crypte: {
        id: 'crypte',
        nom: 'Crypte des Murmures',
        dimensions: { largeur: 1280, hauteur: 540 },
        niveauxAssocies: [2],
        spawnJoueur: (dims) => ({ x: 60, y: dims.hauteur - HAUTEUR_SOL - PLAYER.HEIGHT }),
        genererPlateformes: genererCrypte
    },
    pont: {
        id: 'pont',
        nom: 'Pont Suspendu',
        dimensions: { largeur: 2200, hauteur: 540 },
        niveauxAssocies: [2, 3],
        spawnJoueur: (dims) => ({ x: 60, y: dims.hauteur - HAUTEUR_SOL - PLAYER.HEIGHT }),
        genererPlateformes: genererPontSuspendu
    },
    puits: {
        id: 'puits',
        nom: 'Puits Inversé',
        dimensions: { largeur: 960, hauteur: 1080 },
        niveauxAssocies: [3],
        // Sortie À MI-HAUTEUR à droite, posée sur le palier-sortie (yTop=900)
        sortiePosition: { yTop: 900 },
        spawnJoueur: (dims) => ({ x: 60, y: dims.hauteur - HAUTEUR_SOL - PLAYER.HEIGHT }),
        genererPlateformes: genererPuitsInverse
    },
    arene: {
        id: 'arene',
        nom: 'Arène du Reflux',
        dimensions: { largeur: 1280, hauteur: 720 },
        niveauxAssocies: [3],
        spawnJoueur: (dims) => ({ x: 60, y: dims.hauteur - HAUTEUR_SOL - PLAYER.HEIGHT }),
        genererPlateformes: genererArene
    }
};

export function choisirArchetype(niveau, rng) {
    const candidats = Object.values(ARCHETYPES).filter(a => a.niveauxAssocies.includes(niveau));
    if (candidats.length === 0) return ARCHETYPES.sanctuaire;
    return candidats[Math.floor(rng() * candidats.length)];
}

/**
 * Position de la sortie. Toujours à droite. Si l'archétype définit
 * `sortiePosition.yTop`, la sortie est posée à cette altitude (cas du Puits
 * Inversé). Sinon, posée sur le sol bas standard.
 */
export function calculerSortie(archetype, dims) {
    const x = dims.largeur - LARGEUR_SORTIE / 2 - 8;
    const yTop = archetype.sortiePosition?.yTop
        ?? (dims.hauteur - HAUTEUR_SOL - HAUTEUR_SORTIE);
    return {
        x,
        y: yTop + HAUTEUR_SORTIE / 2,
        largeur: LARGEUR_SORTIE,
        hauteur: HAUTEUR_SORTIE
    };
}

export const VORTEX_DIMS = { largeur: LARGEUR_VORTEX, hauteur: HAUTEUR_VORTEX };
export const HAUTEUR_SOL_EXPORT = HAUTEUR_SOL;
