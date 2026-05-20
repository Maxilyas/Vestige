// Salle : Ruines basses — Le Pont des Soupirs
//
// Salle SIGNATURE qui exploite à fond les sols qui s'effritent + ancrages.
// Le sol entier est constitué d'une SUCCESSION DE PLATEFORMES qui s'effritent
// au contact. Pas de vrai "sol bas" — le joueur DOIT enchaîner : marche →
// effrite → saute → effrite → ancre → effrite... Au fond, pieux mécaniques
// désynchronisés qui finissent les chutes ratées.
//
// Une mezzanine haute (chemin alternatif lent) longe la salle pour les
// joueurs qui ne veulent pas risquer le pont (mais plus long, plus
// d'ennemis, sans coffre).

import {
    HAUTEUR_SOL, sol, plateforme, ancre,
    porteO, porteE,
    solEffrite, racinesReflux
} from '../_format.js';

const W = 3000;
const H = 1200;
const Y_PONT = H - HAUTEUR_SOL;        // 1160 — "sol effrite" niveau du pont
const Y_FOND = H - 20;                 // 1180 — fond piégé (visible)
const Y_MEZZANINE = 450;

export const ruines_pont_soupirs = {
    id: 'ruines_pont_soupirs',
    biome: 'ruines_basses',
    nom: 'Pont des Soupirs',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['pont', 'hall'],
    rolesAutorises: ['main', 'alt', 'entree'],
    unique: true,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [];

        // ─── Îles sol aux 2 bords (sécurisées) ─────────────────────────
        plateformes.push(sol(0,         300, Y_PONT));
        plateformes.push(sol(W - 300,   W,   Y_PONT));
        // ─── Fond du gouffre (sol visible avec pieux dessus) ───────────
        plateformes.push(sol(300, W - 300, Y_FOND, { h: 14 }));

        // ─── Escalier vers la mezzanine haute (côté gauche) ────────────
        plateformes.push(plateforme(180, 1090, 90, { oneWay: true }));
        plateformes.push(plateforme(80,  1020, 90, { oneWay: true }));
        plateformes.push(plateforme(180,  950, 90, { oneWay: true }));
        plateformes.push(plateforme(80,   880, 90, { oneWay: true }));
        plateformes.push(plateforme(180,  810, 90, { oneWay: true }));
        plateformes.push(plateforme(80,   740, 90, { oneWay: true }));
        plateformes.push(plateforme(180,  670, 90, { oneWay: true }));
        plateformes.push(plateforme(80,   600, 90, { oneWay: true }));
        plateformes.push(plateforme(180,  530, 90, { oneWay: true }));
        // Palier intermédiaire entre escalier et mezzanine (raccord)
        plateformes.push(plateforme(310, 460, 110, { oneWay: true }));

        // ─── Mezzanine haute (longue, traversée alt) ──────────────────
        plateformes.push(plateforme(W / 2, Y_MEZZANINE, 2100, { oneWay: false }));

        // ─── Escalier symétrique côté droit ────────────────────────────
        plateformes.push(plateforme(W - 180, 530, 90, { oneWay: true }));
        plateformes.push(plateforme(W - 310, 460, 110, { oneWay: true }));
        plateformes.push(plateforme(W - 80,  600, 90, { oneWay: true }));
        plateformes.push(plateforme(W - 180, 670, 90, { oneWay: true }));
        plateformes.push(plateforme(W - 80,  740, 90, { oneWay: true }));
        plateformes.push(plateforme(W - 180, 810, 90, { oneWay: true }));
        plateformes.push(plateforme(W - 80,  880, 90, { oneWay: true }));
        plateformes.push(plateforme(W - 180, 950, 90, { oneWay: true }));
        plateformes.push(plateforme(W - 80, 1020, 90, { oneWay: true }));
        plateformes.push(plateforme(W - 180, 1090, 90, { oneWay: true }));

        // ─── Obstacles : sols qui s'effritent + pieux méca au fond ─────
        const obstacles = [];

        // Le pont du milieu : ~8 sols qui s'effritent au passage.
        // Espacement 120 px (saut horiz facile depuis chacun).
        for (let i = 0; i < 8; i++) {
            const x = 350 + i * 280;
            obstacles.push(solEffrite(x, Y_PONT, 100));
        }

        // Pieux mécaniques au fond du gouffre, désynchronisés
        const positionsRacines = [600, 900, 1200, 1500, 1800, 2100, 2400];
        for (let i = 0; i < positionsRacines.length; i++) {
            obstacles.push(racinesReflux(
                positionsRacines[i],
                Y_FOND,
                { largeur: 60, hauteur: 50, offsetMs: i * 400 }
            ));
        }

        // ─── Zones ancrables : nombreuses, alignées sur le pont ────────
        // Le joueur reconstruit son chemin avec des ancres entre les
        // plateformes qui s'effritent.
        const zones = [];
        for (let i = 0; i < 7; i++) {
            const x = 490 + i * 280;
            zones.push(ancre(x, Y_PONT - 80, 100, 30, { plateformeW: 110, plateformeH: 14 }));
        }

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_PONT);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_PONT);

        return {
            plateformes,
            obstacles,
            zones,
            portes,
            spawnDefault: { x: 80, y: Y_PONT - 20 }
        };
    }
};
