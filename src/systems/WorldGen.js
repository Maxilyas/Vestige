// Génération procédurale d'une salle individuelle.
//
// Une salle = layout d'un archétype + zones interactives (portes, vortex,
// coffre, drop sol, ennemis). La connectivité entre salles est gérée par
// EtageGen (Phase A) — WorldGen ne connaît qu'une salle isolée.
//
// Tout est seedé : (seed étage, salleId, archetype) déterminent intégralement
// la salle. Présent et Miroir partagent la même géométrie (même seed).

import {
    calculerPorte, VORTEX_DIMS,
    HAUTEUR_SOL_EXPORT as HAUTEUR_SOL
} from '../data/archetypes.js';

// --- PRNG déterministe (Mulberry32) ---
export function creerRng(seed) {
    let etat = seed >>> 0;
    return function () {
        etat = (etat + 0x6D2B79F5) >>> 0;
        let t = etat;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function entre(rng, min, max) { return min + rng() * (max - min); }
function entreEntier(rng, min, max) { return Math.floor(entre(rng, min, max + 1)); }

// --- Patterns de difficulté ---
// Pour Phase A, on garde la courbe simple par numéro d'étage (1..10).
// Plus on monte, plus c'est dangereux.
export function niveauDangerEtage(etageNumero) {
    if (etageNumero <= 2) return 0;
    if (etageNumero <= 4) return 1;
    if (etageNumero <= 6) return 2;
    return 3;
}

// Conservé pour compat — utilisé par UIScene pour l'affichage textuel
export function niveauDanger(_indexSalle) {
    return 0;
}

const ENNEMIS_PAR_NIVEAU = {
    0: { min: 0, max: 0 },
    1: { min: 0, max: 1 },
    2: { min: 1, max: 2 },
    3: { min: 2, max: 3 }
};

// --- Probabilités loot ---
const PROBA_COFFRE = 0.6;
const PROBA_DROP_SOL = 0.3;

/**
 * Hash stable d'un id de salle (string) pour le mélanger dans un seed.
 */
function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

/**
 * Génère une salle complète.
 *
 * @param {object} options
 *   - seedEtage : seed de l'étage
 *   - etageNumero : 1..10
 *   - salleId : string unique dans l'étage
 *   - archetype : objet ARCHETYPES.*
 *   - portesActives : array de directions ('N','S','E','O') — portes à instancier
 *   - estBoss : bool — la salle est la salle de boss
 *   - estEntree : bool — la salle est l'entrée de l'étage
 *
 * @returns {object} salle
 */
export function genererSalle({
    seedEtage, etageNumero, salleId,
    archetype, portesActives = ['E'],
    estBoss = false, estEntree = false
}) {
    const seed = (seedEtage ^ hashStr(salleId)) >>> 0;
    const rng = creerRng(seed);
    const niveau = niveauDangerEtage(etageNumero);
    const dims = archetype.dimensions;

    // 1. Plateformes (script propre à l'archétype). On passe les directions de
    //    portes actives en options pour que l'archétype puisse ajouter des
    //    plateformes conditionnelles (ex : voûte d'accès à la porte N).
    const plateformes = archetype.genererPlateformes(rng, dims, { portesActives });

    // 2. Spawn par défaut (utilisé si on entre depuis nulle part — boss room
    //    ou première salle du run)
    const spawnDefault = archetype.spawnJoueur(dims);

    // 3. Portes (une par direction active)
    const portes = {};
    for (const dir of portesActives) {
        const p = calculerPorte(archetype, dims, dir);
        if (p) portes[dir] = p;
    }

    // 4. Vortex Miroir : sur une plateforme flottante différente du spawn et des portes,
    //    avec distance min. Fallback : centre.
    const platfMaxLargeur = plateformes.reduce((m, p) => Math.max(m, p.largeur), 0);
    const plateformesFlottantes = plateformes.filter(p =>
        p.largeur < platfMaxLargeur * 0.95 &&
        p.largeur > p.hauteur
    );
    const candidatsVortex = plateformesFlottantes.map(p => ({
        x: p.x,
        y: p.y - p.hauteur / 2 - VORTEX_DIMS.hauteur / 2
    }));
    const DIST_MIN = 200;
    const positionsRefus = [
        { x: spawnDefault.x, marge: DIST_MIN },
        ...Object.values(portes).map(p => ({ x: p.x, marge: DIST_MIN }))
    ];
    const tropProche = (cx, cy) => positionsRefus.some(r =>
        Math.abs(cx - r.x) < r.marge
    );
    const valides = candidatsVortex.filter(c => !tropProche(c.x, c.y));
    let posVortex;
    if (valides.length > 0) {
        posVortex = valides[entreEntier(rng, 0, valides.length - 1)];
    } else if (candidatsVortex.length > 0) {
        posVortex = candidatsVortex.reduce((m, c) =>
            Math.abs(c.x - dims.largeur / 2) < Math.abs(m.x - dims.largeur / 2) ? c : m
        );
    } else {
        posVortex = { x: dims.largeur / 2, y: dims.hauteur - HAUTEUR_SOL - VORTEX_DIMS.hauteur / 2 };
    }
    const vortex = {
        x: posVortex.x, y: posVortex.y,
        largeur: VORTEX_DIMS.largeur, hauteur: VORTEX_DIMS.hauteur
    };

    // 5. Coffre — dans une boss room et l'entrée, on n'en met pas
    let coffre = null;
    if (!estBoss && !estEntree && rng() < PROBA_COFFRE) {
        const candidatsCoffre = plateformesFlottantes
            .map(p => ({ x: p.x, y: p.y - p.hauteur / 2 - 16 }))
            .filter(c =>
                Math.abs(c.x - vortex.x) > 60 &&
                !tropProche(c.x, c.y)
            );
        if (candidatsCoffre.length > 0) {
            const choisi = candidatsCoffre[entreEntier(rng, 0, candidatsCoffre.length - 1)];
            coffre = { x: choisi.x, y: choisi.y, largeur: 28, hauteur: 24 };
        } else {
            coffre = {
                x: dims.largeur / 2,
                y: dims.hauteur - HAUTEUR_SOL - 12,
                largeur: 28, hauteur: 24
            };
        }
    }

    // 6. Drop orphelin (30 % si pas de coffre, et pas dans boss/entrée)
    let dropSol = null;
    if (!coffre && !estBoss && !estEntree && rng() < PROBA_DROP_SOL) {
        dropSol = {
            x: entre(rng, 200, dims.largeur - 200),
            y: dims.hauteur - HAUTEUR_SOL - 10,
            largeur: 18, hauteur: 18
        };
    }

    // 7. Ennemis (selon niveau de danger d'étage, Présent uniquement à l'instanciation)
    //    Pas d'ennemis dans la salle d'entrée (pour laisser le joueur s'orienter).
    //    Boss : géré séparément (Phase C — pour Phase A on laisse vide aussi).
    const fourchette = ENNEMIS_PAR_NIVEAU[niveau];
    let nbEnnemis = entreEntier(rng, fourchette.min, fourchette.max);
    if (estEntree || estBoss) nbEnnemis = 0;
    const ennemis = [];
    for (let i = 0; i < nbEnnemis; i++) {
        const surSol = plateformesFlottantes.length === 0 || rng() < 0.5;
        let x, y;
        if (surSol) {
            x = entre(rng, 150, dims.largeur - 150);
            y = dims.hauteur - HAUTEUR_SOL - 20;
        } else {
            const p = plateformesFlottantes[entreEntier(rng, 0, plateformesFlottantes.length - 1)];
            x = p.x;
            y = p.y - p.hauteur / 2 - 20;
        }
        ennemis.push({ x, y, idx: i });
    }

    return {
        id: salleId,
        archetype: archetype.id,
        etageNumero,
        dims,
        plateformes,
        portes,                 // { N?, S?, E?, O? } chaque porte = { direction, x, y, largeur, hauteur }
        vortex,
        spawnDefault,
        coffre,
        dropSol,
        ennemis,
        niveauDanger: niveau,
        estBoss,
        estEntree
    };
}
