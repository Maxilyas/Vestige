// Génération procédurale d'une salle individuelle.
//
// Une salle = topographie (structure physique) + thème archétype +
// zones interactives (portes, vortex, coffre, drop sol, ennemis).
//
// Phase 2a (2026-05-12) — Refactor : la topographie owns dims + plateformes
// + obstacles + portes positions + spawnDefault. L'archétype owns thème.
// WorldGen orchestre : appelle topographie.generer() puis empile les zones
// interactives par-dessus.

import { VORTEX_DIMS, HAUTEUR_SOL_EXPORT as HAUTEUR_SOL } from '../data/archetypes.js';
import { biomePourEtage } from '../data/biomes.js';
import { tirerRarete, probasPourEtage } from './RaritySystem.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

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
export function niveauDangerEtage(etageNumero) {
    if (etageNumero <= 2) return 0;
    if (etageNumero <= 4) return 1;
    if (etageNumero <= 6) return 2;
    return 3;
}

// Conservé pour compat — utilisé pour l'affichage textuel
export function niveauDanger(_indexSalle) {
    return 0;
}

// Densité de fallback si le biome ne fournit pas la sienne
const ENNEMIS_PAR_NIVEAU = {
    0: { min: 2, max: 4 },
    1: { min: 3, max: 5 },
    2: { min: 4, max: 7 },
    3: { min: 6, max: 10 }
};

// --- Probabilités loot ---
const PROBA_COFFRE = 0.6;
const PROBA_DROP_SOL = 0.3;

/**
 * Hash stable d'un id de salle (string) pour le mélanger dans un seed.
 * Exporté pour qu'EtageGen puisse calculer un seed dérivé identique
 * (utile pour pré-assembler une salle via RoomAssembler).
 */
export function hashStr(s) {
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
 *   - archetype : objet ARCHETYPES.* (thème)
 *   - topographie : objet TOPOGRAPHIES.* (structure)
 *   - portesActives : array de directions ('N','S','E','O') — portes à instancier
 *   - estBoss : bool
 *   - estEntree : bool
 *
 * @returns {object} salle
 */
export function genererSalle({
    seedEtage, etageNumero, salleId,
    archetype, topographie, portesActives = ['E'],
    estBoss = false, estEntree = false
}) {
    const seed = (seedEtage ^ hashStr(salleId)) >>> 0;
    const rng = creerRng(seed);
    const niveau = niveauDangerEtage(etageNumero);

    // 1. Structure physique : la topographie owns dims + plateformes + obstacles
    //    + portes positions + spawnDefault.
    //
    // Phase 9 — Salles compactes : si la topographie déclare `dimsCanvas: true`,
    // on force les dims à la taille du canvas (960×540) et la caméra sera figée
    // sur la salle (cf. GameScene). Permet une transition progressive : ancien
    // pipeline scrollé pour les salles legacy, nouveau pipeline fixe pour les
    // salles compactes refondues à partir de Phase 9.
    const dims = topographie.dimsCanvas
        ? { largeur: GAME_WIDTH, hauteur: GAME_HEIGHT }
        : topographie.dims;
    const result = topographie.generer({ rng, portesActives, dims });
    const plateformes = result.plateformes;
    const obstacles = result.obstacles ?? [];
    const portes = result.portes ?? {};
    const spawnDefault = result.spawnDefault;
    // Zones interactives spécifiques au biome (ancres construction Ruines,
    // gouffres lethaux Cristaux, etc.). Issues uniquement des salles
    // handcrafted XL pour l'instant (les topographies legacy n'en exposent pas).
    const zones = result.zones ?? [];

    // 2. Vortex Miroir : sur une plateforme flottante différente du spawn et des
    //    portes, avec distance min. Fallback : centre.
    //    (En Présent, ce vortex n'est plus utilisé depuis Phase 1 — il vit pour
    //    la Cité Marchande en Miroir.)
    const platfMaxLargeur = plateformes.reduce((m, p) => Math.max(m, p.largeur), 0);
    // Exclut les éléments `structurel` (plafondCathedrale, murs ornementaux) :
    // visuellement des décors fermant la salle, pas des paliers walkable. Sinon
    // ennemis/coffre/vortex pouvaient y être placés et tomber depuis le top.
    const plateformesFlottantes = plateformes.filter(p =>
        p.largeur < platfMaxLargeur * 0.95 &&
        p.largeur > p.hauteur &&
        !(p.tags?.includes('structurel'))
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
    const tropProche = (cx, _cy) => positionsRefus.some(r =>
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

    // 3. Coffre — pas dans boss room ni à l'entrée.
    // Une topographie peut forcer un coffre à une position précise (récompense
    // pour atteindre une zone secrète) via `result.coffreForce`. Sinon, tirage
    // probabiliste sur plateforme flottante.
    let coffre = null;
    if (!estBoss && !estEntree && result.coffreForce) {
        coffre = {
            x: result.coffreForce.x,
            y: result.coffreForce.y,
            largeur: 28, hauteur: 24
        };
    } else if (!estBoss && !estEntree && rng() < PROBA_COFFRE) {
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

    // 4. Drop orphelin.
    //    - Si la salle handcrafted déclare `dropSolForce: {x, y}`, on l'utilise
    //      (récompense intermédiaire de design : palier refuge d'une salle puzzle).
    //    - Sinon, 30 % aléatoire si pas de coffre et pas dans boss/entrée.
    let dropSol = null;
    if (!estBoss && !estEntree && result.dropSolForce) {
        dropSol = {
            x: result.dropSolForce.x,
            y: result.dropSolForce.y,
            largeur: 18, hauteur: 18
        };
    } else if (!coffre && !estBoss && !estEntree && rng() < PROBA_DROP_SOL) {
        dropSol = {
            x: entre(rng, 200, dims.largeur - 200),
            y: dims.hauteur - HAUTEUR_SOL - 10,
            largeur: 18, hauteur: 18
        };
    }

    // 5. Ennemis — densité dictée par le biome de l'étage.
    //    Pas d'ennemis dans la salle d'entrée ni de boss (boss instancié séparément).
    //    Scale linéaire selon largeur réelle (réf 1600 px = densité de base).
    //    Salles chunks 2400-5000 px → 1.5× à 3.1× ennemis pour densité perçue
    //    constante. Plafonné à 3× pour éviter explosion sur très longues salles.
    //
    //    Si la salle handcrafted déclare `ennemisForce: [{x, y, enemyId, tier?}, ...]`,
    //    on utilise UNIQUEMENT ces ennemis (la salle contrôle son combat — utile
    //    pour les salles signature avec rôles gardien/patrouille précis).
    const biome = biomePourEtage(etageNumero);
    const rngRarete = creerRng((seedEtage ^ 0x5A17B0B0 ^ hashStr(salleId)) >>> 0);
    const probasRarete = probasPourEtage(etageNumero);
    const ennemis = [];

    if (!estEntree && !estBoss && Array.isArray(result.ennemisForce)) {
        // Mode handcrafted : la salle dicte ses ennemis (positions + types).
        // Le tier est forcé si déclaré, sinon tiré comme d'habitude.
        result.ennemisForce.forEach((e, i) => {
            ennemis.push({
                x: e.x, y: e.y, idx: i,
                enemyId: e.enemyId ?? null,
                tier: e.tier ?? tirerRarete(rngRarete, probasRarete)
            });
        });
    } else {
        const fourchette = biome?.densite ?? ENNEMIS_PAR_NIVEAU[niveau];
        const scaleLargeur = Math.min(3, Math.max(1, dims.largeur / 1600));
        let nbEnnemis = Math.round(entreEntier(rng, fourchette.min, fourchette.max) * scaleLargeur);
        if (estEntree || estBoss) nbEnnemis = 0;
        // Pour éviter que les ennemis spawnent sur les plateformes d'échelle
        // one-way (rendant la montée pénible), on filtre : ennemi sur plateforme
        // flottante NORMALE uniquement, fallback sol si aucune normale dispo.
        const plateformesEnnemiSpawn = plateformesFlottantes.filter(p => !p.oneWay);
        const pool = biome?.ennemisPool ?? [];
        for (let i = 0; i < nbEnnemis; i++) {
            const enemyId = pool.length > 0
                ? pool[Math.floor(rng() * pool.length)]
                : null;
            const surSol = plateformesEnnemiSpawn.length === 0 || rng() < 0.5;
            let x, y;
            if (surSol) {
                x = entre(rng, 150, dims.largeur - 150);
                y = dims.hauteur - HAUTEUR_SOL - 20;
            } else {
                const p = plateformesEnnemiSpawn[entreEntier(rng, 0, plateformesEnnemiSpawn.length - 1)];
                x = p.x;
                y = p.y - p.hauteur / 2 - 20;
            }
            const tier = tirerRarete(rngRarete, probasRarete);
            ennemis.push({ x, y, idx: i, enemyId, tier });
        }
    }

    // Convention globale : toute salle compacte (dimsCanvas) active `gouffreMort`
    // par défaut. Tomber sous le canvas = mort + retour Cité Miroir. Permet aux
    // designs d'avoir des fosses dangereuses sans coincer le joueur. La salle
    // peut explicitement opt-out via `topographie.gouffreMort = false`.
    const gouffreMort = topographie.gouffreMort
        ?? result.gouffreMort
        ?? !!topographie.dimsCanvas;

    return {
        id: salleId,
        archetype: archetype.id,
        topographie: topographie.id,
        etageNumero,
        dims,
        // Phase 9 — propagé à GameScene pour décider de figer la caméra ou non.
        // Les salles legacy (XL, dims variables) gardent le scroll caméra ;
        // les salles compactes (960×540) ont caméra figée sur 0,0.
        dimsCanvas: !!topographie.dimsCanvas,
        gouffreMort,            // tomber sous canvas = mort + retour Cité
        plateformes,
        obstacles,
        portes,                 // { N?, S?, E?, O? } chaque porte = { direction, x, y, largeur, hauteur, interieur }
        zones,                  // zones interactives biome (ancrage Ruines, gouffres Cristaux...)
        vortex,
        spawnDefault,
        coffre,
        dropSol,
        ennemis,
        niveauDanger: niveau,
        estBoss,
        estEntree,
        biomeId: biome?.id ?? 'ruines_basses'
    };
}
