// Génération procédurale de salles — pilote les archétypes architecturaux.
//
// La structure de chaque salle (plateformes, dimensions) est déléguée à un
// archétype (cf. data/archetypes.js). WorldGen ajoute par-dessus :
//   - position seedée du vortex (sur une plateforme accessible)
//   - position seedée du coffre (60 % de proba)
//   - position seedée du drop sol (30 % si pas de coffre)
//   - liste seedée des ennemis (selon le niveau de danger, Présent uniquement)
//
// Tout est seedé : même seed + même indexSalle = même salle exacte. Présent et
// Miroir partagent la géométrie (la même seed est utilisée pour la structure).

import { PLAYER, WORLD } from '../config.js';
import {
    ARCHETYPES, choisirArchetype, calculerSortie,
    VORTEX_DIMS, HAUTEUR_SOL_EXPORT as HAUTEUR_SOL
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

// --- Patterns de difficulté (Présent uniquement) ---
const COURBE_DANGER = [0, 0, 1, 1, 2, 3];
export function niveauDanger(indexSalle) {
    return COURBE_DANGER[indexSalle % COURBE_DANGER.length];
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
 * Génère la description d'une salle.
 * @returns {{
 *   index: number,
 *   archetype: string,
 *   dims: {largeur:number, hauteur:number},
 *   plateformes: Array,
 *   sortie: object,
 *   vortex: object,
 *   spawnJoueur: object,
 *   coffre: object|null,
 *   dropSol: object|null,
 *   ennemis: Array,
 *   niveauDanger: number
 * }}
 */
export function genererSalle(seed, indexSalle) {
    const rng = creerRng((seed ^ (indexSalle * 0x9E3779B9)) >>> 0);
    const niveau = niveauDanger(indexSalle);
    const archetype = choisirArchetype(niveau, rng);
    const dims = archetype.dimensions;

    // 1. Plateformes (script propre à l'archétype)
    const plateformes = archetype.genererPlateformes(rng, dims);

    // 2. Spawn joueur
    const spawnJoueur = archetype.spawnJoueur(dims);

    // 3. Sortie
    const sortie = calculerSortie(archetype, dims);

    // 4. Vortex — sur une plateforme flottante différente du spawn et de la sortie,
    //    avec distance min. Fallback : centre.
    // Filtre des plateformes "posables" : pas le sol principal (la plus large),
    // pas un pilier vertical (hauteur > largeur).
    const platfMaxLargeur = plateformes.reduce((m, p) => Math.max(m, p.largeur), 0);
    const plateformesFlottantes = plateformes.filter(p =>
        p.largeur < platfMaxLargeur * 0.95 &&  // exclut le sol principal
        p.largeur > p.hauteur                  // exclut piliers verticaux
    );
    const candidatsVortex = plateformesFlottantes.map(p => ({
        x: p.x,
        y: p.y - p.hauteur / 2 - VORTEX_DIMS.hauteur / 2
    }));
    const DIST_MIN = 200;
    const valides = candidatsVortex.filter(c =>
        Math.abs(c.x - spawnJoueur.x) >= DIST_MIN &&
        Math.abs(c.x - sortie.x) >= DIST_MIN
    );
    let posVortex;
    if (valides.length > 0) {
        posVortex = valides[entreEntier(rng, 0, valides.length - 1)];
    } else if (candidatsVortex.length > 0) {
        // Plateforme la plus proche du centre
        posVortex = candidatsVortex.reduce((meilleur, c) =>
            Math.abs(c.x - dims.largeur / 2) < Math.abs(meilleur.x - dims.largeur / 2) ? c : meilleur
        );
    } else {
        posVortex = { x: dims.largeur / 2, y: dims.hauteur - HAUTEUR_SOL - VORTEX_DIMS.hauteur / 2 };
    }
    const vortex = {
        x: posVortex.x, y: posVortex.y,
        largeur: VORTEX_DIMS.largeur, hauteur: VORTEX_DIMS.hauteur
    };

    // 5. Coffre (60 %)
    let coffre = null;
    if (rng() < PROBA_COFFRE) {
        const candidatsCoffre = plateformesFlottantes
            .map(p => ({ x: p.x, y: p.y - p.hauteur / 2 - 16 }))
            .filter(c =>
                Math.abs(c.x - vortex.x) > 60 &&
                Math.abs(c.x - spawnJoueur.x) > 100 &&
                Math.abs(c.x - sortie.x) > 100
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

    // 6. Drop orphelin (30 % si pas de coffre)
    let dropSol = null;
    if (!coffre && rng() < PROBA_DROP_SOL) {
        dropSol = {
            x: entre(rng, 200, dims.largeur - 200),
            y: dims.hauteur - HAUTEUR_SOL - 10,
            largeur: 18, hauteur: 18
        };
    }

    // 7. Ennemis (selon niveau, Présent uniquement à l'instanciation côté GameScene)
    const fourchette = ENNEMIS_PAR_NIVEAU[niveau];
    const nbEnnemis = entreEntier(rng, fourchette.min, fourchette.max);
    const ennemis = [];
    const positionsRefus = [
        { x: spawnJoueur.x, marge: 150 },
        { x: sortie.x, marge: 100 },
        { x: vortex.x, marge: 100 }
    ];
    if (coffre) positionsRefus.push({ x: coffre.x, marge: 80 });

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
        // Tentative de respect des zones de refus (best effort, on ne ré-essaye pas)
        ennemis.push({ x, y, idx: i });
    }

    return {
        index: indexSalle,
        archetype: archetype.id,
        dims,
        plateformes,
        sortie,
        vortex,
        spawnJoueur,
        coffre,
        dropSol,
        ennemis,
        niveauDanger: niveau
    };
}
