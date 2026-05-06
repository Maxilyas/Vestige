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
const LARGEUR_PORTE = 60;
const HAUTEUR_PORTE = 90;
const LARGEUR_VORTEX = 60;
const HAUTEUR_VORTEX = 90;
// Aliases conservés pour compatibilité descendante
const LARGEUR_SORTIE = LARGEUR_PORTE;
const HAUTEUR_SORTIE = HAUTEUR_PORTE;

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
function genererSanctuaire(rng, dims, options = {}) {
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

    // Plateforme "ciel" pour la porte N (uniquement si demandée)
    // 70 px au-dessus de l'autel, atteignable par saut depuis l'autel.
    // Largeur 160 px pour accommoder le spawn décalé (54 px du centre).
    if (options.portesActives?.includes('N')) {
        const yTopCiel = yTopAutel - ECART_VERT_SAFE; // 290
        platf.push(plateforme(cx, yTopCiel, 160, 16, false));
    }

    return platf;
}

// ============================================================
// 📜 HALL DES ÉCHOS — Salle large, mezzanine et cintres bonus
// ============================================================
function genererHall(rng, dims, options = {}) {
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

    // Voûte centrale pour la porte N (uniquement si demandée).
    // 70 px au-dessus des cintres, atteignable depuis les cintres latéraux par saut.
    if (options.portesActives?.includes('N')) {
        const yTopVoute = yTopCintres - ECART_VERT_SAFE; // 290
        platf.push(plateforme(cx, yTopVoute, 140, 16, false));
    }

    return platf;
}

// ============================================================
// 🪨 CRYPTE DES MURMURES — Sol entier, corniches one-way pour bonus
// ============================================================
function genererCrypte(rng, dims, options = {}) {
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

    // Niveau 4 (voûte) pour la porte N (uniquement si demandée).
    // Plateforme NORMALE (pas one-way) car c'est l'accès à la porte du haut.
    if (options.portesActives?.includes('N')) {
        const yTopVoute = yTopN3 - ECART_VERT_SAFE; // 290
        platf.push(plateforme(dims.largeur * 0.5, yTopVoute, 140, 16, false));
    }

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
// 🌀 PUITS INVERSÉ — Vertical, accès N (sommet) + S (sol) + E (palier mi-haut)
// ============================================================
function genererPuitsInverse(rng, dims) {
    const yTopSol = dims.hauteur - HAUTEUR_SOL;     // 1040
    const platf = [];

    // Sol bas (continu, large palier d'arrivée pour la porte S)
    platf.push(solHorizontal(yTopSol, 0, dims.largeur));

    // Voie principale (vers la sortie E) : 2 paliers menant au niveau du palier-sortie.
    platf.push(plateforme(dims.largeur * 0.30, 970, 240, 14, false));
    // Palier-sortie : s'étend du milieu jusqu'à la droite pour porter la porte E
    const largeurPalierSortie = dims.largeur * 0.55;
    platf.push(plateforme(
        dims.largeur - largeurPalierSortie / 2,
        900,
        largeurPalierSortie,
        18,
        false
    ));

    // Verticalité : zigzag montant. Chaque palier à 70 px d'écart vertical,
    // alternance horizontale resserrée pour rester atteignable (~100 px bord à bord).
    // Le dernier palier doit rester à <= 70 px de la plateforme du sommet
    // pour que la remontée soit possible.
    let yTop = 830;
    let cote = 0;
    while (yTop > 100) {
        const x = cote === 0 ? dims.largeur * 0.30 : dims.largeur * 0.70;
        platf.push(plateforme(x, yTop, 240, 14, false));
        yTop -= ECART_VERT_SAFE;
        cote = 1 - cote;
    }

    // Sommet : plateforme finale ÉLARGIE pour porter la porte S (orientation
    // inversée du Puits). Largeur 320 pour spawn confortable du joueur.
    // ONE-WAY pour permettre au joueur de la traverser par le bas en remontant
    // depuis le dernier palier — sinon il bloque sur le dessous.
    platf.push(plateforme(dims.largeur / 2, 80, 320, 18, true));

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
        portesPossibles: ['E', 'O', 'N'],
        // Porte N posée sur la plateforme "ciel" (yTopCiel=290), accessible
        // depuis l'autel par un saut de 70 px. Plateforme uniquement générée
        // si 'N' est dans portesActives — voir genererSanctuaire.
        portePosN: { yTop: 290 - HAUTEUR_PORTE },
        spawnJoueur: (dims) => ({ x: 60, y: dims.hauteur - HAUTEUR_SOL - PLAYER.HEIGHT }),
        genererPlateformes: genererSanctuaire
    },
    hall: {
        id: 'hall',
        nom: 'Hall des Échos',
        dimensions: { largeur: 1920, hauteur: 540 },
        niveauxAssocies: [1, 2],
        portesPossibles: ['E', 'O', 'N'],
        portePosN: { yTop: 290 - HAUTEUR_PORTE },
        spawnJoueur: (dims) => ({ x: 60, y: dims.hauteur - HAUTEUR_SOL - PLAYER.HEIGHT }),
        genererPlateformes: genererHall
    },
    crypte: {
        id: 'crypte',
        nom: 'Crypte des Murmures',
        dimensions: { largeur: 1280, hauteur: 540 },
        niveauxAssocies: [2],
        portesPossibles: ['E', 'O', 'N'],
        portePosN: { yTop: 290 - HAUTEUR_PORTE },
        spawnJoueur: (dims) => ({ x: 60, y: dims.hauteur - HAUTEUR_SOL - PLAYER.HEIGHT }),
        genererPlateformes: genererCrypte
    },
    pont: {
        id: 'pont',
        nom: 'Pont Suspendu',
        dimensions: { largeur: 2200, hauteur: 540 },
        niveauxAssocies: [2, 3],
        // Pas de N : le layout en arc traverse déjà horizontalement le centre,
        // ajouter une voûte casserait l'identité du pont.
        portesPossibles: ['E', 'O'],
        spawnJoueur: (dims) => ({ x: 60, y: dims.hauteur - HAUTEUR_SOL - PLAYER.HEIGHT }),
        genererPlateformes: genererPontSuspendu
    },
    puits: {
        id: 'puits',
        nom: 'Puits Inversé',
        dimensions: { largeur: 960, hauteur: 1080 },
        niveauxAssocies: [3],
        // Archétype vertical : porte N (sommet), S (sol bas), E (palier mi-haut),
        // O (sol bas, gauche). Le sol bas étant continu de x=0 à x=largeur,
        // la porte O est triviale.
        portesPossibles: ['N', 'S', 'E', 'O'],
        // Position du palier-sortie pour la porte E (cf. genererPuitsInverse)
        portePalierE: { yTop: 900 },
        spawnJoueur: (dims) => ({ x: 60, y: dims.hauteur - HAUTEUR_SOL - PLAYER.HEIGHT }),
        genererPlateformes: genererPuitsInverse
    },
    arene: {
        id: 'arene',
        nom: 'Arène du Reflux',
        dimensions: { largeur: 1280, hauteur: 720 },
        niveauxAssocies: [3],
        portesPossibles: ['E', 'O'],
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
 * Position d'une porte d'une salle selon une direction (N/S/E/O).
 *
 * Chaque porte porte aussi un attribut `interieur` qui indique de quel côté
 * le joueur doit apparaître quand il entre par cette porte :
 *   - 'gauche' / 'droite' : pour les portes latérales (E/O)
 *   - 'bas' : porte au-dessus d'une plateforme support, joueur spawn en bas
 *   - 'haut' : porte au sol, joueur spawn au-dessus
 *
 * Cas spécial — Puits Inversé : son orientation est inversée par construction.
 * Sa porte S (entrée depuis main path par "le sud" du graphe) est posée AU
 * SOMMET du puits, sur la plateforme finale. Le joueur arrive en haut et
 * descend pour explorer (le coffre est tout en bas). Ressort par la même
 * porte S au sommet pour retourner sur main path.
 */
export function calculerPorte(archetype, dims, direction) {
    const yTopSol = dims.hauteur - HAUTEUR_SOL - HAUTEUR_PORTE;
    const margeBord = 8;

    if (direction === 'E') {
        const yTop = archetype.portePalierE?.yTop ?? yTopSol;
        return {
            direction: 'E',
            x: dims.largeur - LARGEUR_PORTE / 2 - margeBord,
            y: yTop + HAUTEUR_PORTE / 2,
            largeur: LARGEUR_PORTE,
            hauteur: HAUTEUR_PORTE,
            interieur: 'gauche'
        };
    }
    if (direction === 'O') {
        return {
            direction: 'O',
            x: LARGEUR_PORTE / 2 + margeBord,
            y: yTopSol + HAUTEUR_PORTE / 2,
            largeur: LARGEUR_PORTE,
            hauteur: HAUTEUR_PORTE,
            interieur: 'droite'
        };
    }
    if (direction === 'N') {
        // Porte au-dessus d'une plateforme support :
        //   - Sanctuaire/Hall/Crypte : portePosN.yTop défini par l'archétype
        //   - Puits : déjà au sommet (80 - HAUTEUR_PORTE)
        //   - Autres : top de salle (8)
        const yTopHaut = archetype.portePosN?.yTop
            ?? (archetype.id === 'puits' ? 80 - HAUTEUR_PORTE : 8);
        return {
            direction: 'N',
            x: dims.largeur / 2,
            y: yTopHaut + HAUTEUR_PORTE / 2,
            largeur: LARGEUR_PORTE,
            hauteur: HAUTEUR_PORTE,
            interieur: 'bas'  // joueur spawn EN DESSOUS = sur la plateforme support
        };
    }
    if (direction === 'S') {
        if (archetype.id === 'puits') {
            // Puits Inversé : porte S posée AU SOMMET (orientation inversée).
            // Joueur spawn sur la plateforme du sommet, descend pour explorer.
            const yTopHaut = 80 - HAUTEUR_PORTE;
            return {
                direction: 'S',
                x: dims.largeur / 2,
                y: yTopHaut + HAUTEUR_PORTE / 2,
                largeur: LARGEUR_PORTE,
                hauteur: HAUTEUR_PORTE,
                interieur: 'bas'  // spawn sur la plateforme du sommet, sous la porte
            };
        }
        // Cas générique : centre bas, au sol — joueur spawn au-dessus
        return {
            direction: 'S',
            x: dims.largeur / 2,
            y: yTopSol + HAUTEUR_PORTE / 2,
            largeur: LARGEUR_PORTE,
            hauteur: HAUTEUR_PORTE,
            interieur: 'haut'
        };
    }
    return null;
}

/**
 * Compat : ancienne API utilisée par WorldGen.genererSalle. La sortie est
 * désormais une porte E. Conservé pour ne pas tout casser d'un coup.
 */
export function calculerSortie(archetype, dims) {
    return calculerPorte(archetype, dims, 'E');
}

/**
 * Position de spawn du joueur depuis une porte donnée. Lit `porte.interieur`
 * pour décider de quel côté placer le joueur.
 *
 *   - 'gauche'  : à gauche de la porte (porte E)
 *   - 'droite'  : à droite de la porte (porte O)
 *   - 'bas'     : posé SUR la plateforme support juste sous la porte. Le bas
 *                 du joueur s'aligne avec le bas de la porte (= top de la
 *                 plateforme support).
 *   - 'haut'    : au-dessus de la porte (porte au sol)
 *
 * Pour les portes verticales, on ajoute un décalage horizontal (~54 px) pour
 * sortir le joueur de la zone X de la porte — il peut alors se déplacer
 * librement sur la plateforme sans re-trigger la porte. Pour la rouvrir, il
 * doit revenir volontairement au-dessus de la porte (au centre).
 */
export function spawnDepuisPorte(porte) {
    if (!porte) return null;
    const halfH = porte.hauteur / 2;
    const halfW = porte.largeur / 2;
    const halfPlayerH = PLAYER.HEIGHT / 2;
    const bufferLat = 24;
    const bufferVert = 24;
    const decalageX = halfW + 24;

    if (porte.interieur === 'gauche') return { x: porte.x - halfW - bufferLat, y: porte.y };
    if (porte.interieur === 'droite') return { x: porte.x + halfW + bufferLat, y: porte.y };
    // 'bas' : posé sur la plateforme support juste sous la porte. Le centre du
    // joueur est à porte.y + halfH - halfPlayerH (son bottom = top de plateforme).
    if (porte.interieur === 'bas')    return { x: porte.x + decalageX, y: porte.y + halfH - halfPlayerH };
    if (porte.interieur === 'haut')   return { x: porte.x + decalageX, y: porte.y - halfH - bufferVert };
    return { x: porte.x, y: porte.y };
}

/** Direction opposée à une direction donnée. */
export function directionOpposee(direction) {
    return { N: 'S', S: 'N', E: 'O', O: 'E' }[direction] ?? null;
}

export const VORTEX_DIMS = { largeur: LARGEUR_VORTEX, hauteur: HAUTEUR_VORTEX };
export const HAUTEUR_SOL_EXPORT = HAUTEUR_SOL;
