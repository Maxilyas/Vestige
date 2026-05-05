// Génération procédurale de salles.
// Fonction pure : prend une seed + un index de salle, retourne la "description"
// d'une salle (plateformes, sortie, spawn). La scène se charge ensuite de
// matérialiser tout ça en objets Phaser.
//
// Pourquoi seedé : les deux mondes (Normal / Miroir) partageront la même seed
// pour générer une géométrie identique avec des règles visuelles différentes.

import { GAME_WIDTH, GAME_HEIGHT, PLAYER, WORLD } from '../config.js';

// --- PRNG déterministe (Mulberry32) ---
// Petit générateur reproductible : même seed → même séquence.
// On évite Math.random() qui n'est pas seedable.
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

// Helpers locaux
function entre(rng, min, max) {
    return min + rng() * (max - min);
}
function entreEntier(rng, min, max) {
    return Math.floor(entre(rng, min, max + 1));
}

// Capacités physiques du joueur (déduites de config.js).
// On s'en sert pour s'assurer que les plateformes restent atteignables.
const TEMPS_SAUT = (2 * PLAYER.JUMP_VELOCITY) / WORLD.GRAVITY_Y; // ~0.8s
const PORTEE_HORIZ_MAX = PLAYER.SPEED * TEMPS_SAUT;              // ~176 px
const HAUTEUR_SAUT_MAX = (PLAYER.JUMP_VELOCITY ** 2) / (2 * WORLD.GRAVITY_Y); // ~96 px

// On garde une marge de sécurité pour que tout soit confortablement faisable
const ECART_HORIZ = PORTEE_HORIZ_MAX * 0.75;
const ECART_VERT = HAUTEUR_SAUT_MAX * 0.75;

// Zones réservées
const HAUTEUR_SOL = 40;
const Y_SOL = GAME_HEIGHT - HAUTEUR_SOL / 2;
const LARGEUR_SORTIE = 60;
const HAUTEUR_SORTIE = 90;

// Vortex : portail de retour vers le Présent (uniquement consommé en Miroir).
// On en génère TOUJOURS un par salle, même si l'objet n'est instancié visuellement
// qu'en Miroir — comme la géométrie, sa position est seedée et stable.
const LARGEUR_VORTEX = 60;
const HAUTEUR_VORTEX = 90;
const DIST_MIN_VORTEX = 200; // px en X — pas trop près du spawn ni de la sortie

/**
 * Génère la description d'une salle.
 * @param {number} seed       seed globale du run
 * @param {number} indexSalle 0, 1, 2, … (incrémente à chaque transition)
 * @returns {{
 *   index: number,
 *   plateformes: Array<{x:number,y:number,largeur:number,hauteur:number}>,
 *   sortie:      {x:number,y:number,largeur:number,hauteur:number},
 *   vortex:      {x:number,y:number,largeur:number,hauteur:number},
 *   spawnJoueur: {x:number,y:number}
 * }}
 */
export function genererSalle(seed, indexSalle) {
    // Combine seed + index pour que chaque salle ait son propre flux,
    // tout en restant reproductible.
    const rng = creerRng(seed ^ (indexSalle * 0x9E3779B9));

    // --- Sol (toujours présent, occupe toute la largeur) ---
    const plateformes = [{
        x: GAME_WIDTH / 2,
        y: Y_SOL,
        largeur: GAME_WIDTH,
        hauteur: HAUTEUR_SOL
    }];

    // --- Plateformes flottantes ---
    // On en place 3 à 5, étagées de gauche à droite, en respectant les écarts max.
    const nb = entreEntier(rng, 3, 5);
    let xCourant = entre(rng, 120, 220);
    let yCourant = entre(rng, GAME_HEIGHT - 160, GAME_HEIGHT - 110);

    for (let i = 0; i < nb; i++) {
        const largeur = entre(rng, 100, 180);
        plateformes.push({
            x: xCourant,
            y: yCourant,
            largeur,
            hauteur: 20
        });

        // Plateforme suivante : décalage horizontal contrôlé + variation verticale
        const dx = entre(rng, ECART_HORIZ * 0.5, ECART_HORIZ);
        const dy = entre(rng, -ECART_VERT, ECART_VERT);
        xCourant += dx;
        yCourant = Phaser.Math.Clamp(
            yCourant + dy,
            120,                  // pas trop haut (on garde la zone de texte libre)
            GAME_HEIGHT - 90      // pas trop près du sol
        );

        // Si on déborde à droite, on s'arrête — la sortie a besoin de place
        if (xCourant > GAME_WIDTH - 160) break;
    }

    // --- Zone de sortie (côté droit) ---
    const sortie = {
        x: GAME_WIDTH - LARGEUR_SORTIE / 2 - 8,
        y: GAME_HEIGHT - HAUTEUR_SOL - HAUTEUR_SORTIE / 2,
        largeur: LARGEUR_SORTIE,
        hauteur: HAUTEUR_SORTIE
    };

    // --- Spawn joueur ---
    // Toujours à gauche, sur le sol. Évite de spawner dans une plateforme.
    const spawnJoueur = {
        x: 60,
        y: GAME_HEIGHT - HAUTEUR_SOL - PLAYER.HEIGHT
    };

    // --- Vortex (Miroir) ---
    // Posé sur une plateforme flottante choisie aléatoirement, en respectant
    // une distance minimale au spawn et à la sortie pour ne pas être trivial à
    // déclencher. Si aucune plateforme ne convient, on tombe sur la plus
    // centrale possible. Ultime fallback : centre du sol.
    const plateformesFlottantes = plateformes.slice(1); // [0] = sol
    const candidats = plateformesFlottantes.map(p => ({
        x: p.x,
        y: p.y - p.hauteur / 2 - HAUTEUR_VORTEX / 2
    }));
    const valides = candidats.filter(c =>
        Math.abs(c.x - spawnJoueur.x) >= DIST_MIN_VORTEX &&
        Math.abs(c.x - sortie.x) >= DIST_MIN_VORTEX
    );

    let posVortex;
    if (valides.length > 0) {
        posVortex = valides[entreEntier(rng, 0, valides.length - 1)];
    } else if (candidats.length > 0) {
        // Plateforme dont x est la plus proche du centre de la salle
        posVortex = candidats.reduce((meilleur, c) =>
            Math.abs(c.x - GAME_WIDTH / 2) < Math.abs(meilleur.x - GAME_WIDTH / 2)
                ? c
                : meilleur
        );
    } else {
        posVortex = {
            x: GAME_WIDTH / 2,
            y: Y_SOL - HAUTEUR_SOL / 2 - HAUTEUR_VORTEX / 2
        };
    }

    const vortex = {
        x: posVortex.x,
        y: posVortex.y,
        largeur: LARGEUR_VORTEX,
        hauteur: HAUTEUR_VORTEX
    };

    return { index: indexSalle, plateformes, sortie, vortex, spawnJoueur };
}
