// EtageGen — génère le graphe d'un étage (Phase A).
//
// STRUCTURE D'UN ÉTAGE (7 salles)
//
//          col 0    col 1    col 2    col 3    col 4 (boss)
// row -1            B'                 D'
//                   ↑                   ↑
// row 0   A → → →   B → → →   C → → →   D → → →   BOSS
//
//   - Chaîne principale : A → B → C → D → BOSS, 5 salles connectées par E/O.
//   - 2 dead-ends verticaux (B' et D') connectés par N à un node main.
//     Contiennent un coffre garanti — récompense pour explorer en hauteur.
//
// Les directions s'inversent automatiquement au retour : si A.portes.E = B.id,
// alors B.portes.O = A.id. Le joueur peut donc revenir sur ses pas.
//
// Phase 2a — Refactor (2026-05-12) : le couple (archétype, topographie)
// remplace l'archétype seul. L'archétype = thème, la topographie = structure.

import { creerRng, genererSalle } from './WorldGen.js';
import { ARCHETYPES, directionOpposee } from '../data/archetypes.js';
import { TOPOGRAPHIES, topographiesPour, BOSS_ARENA_PAR_ETAGE } from '../data/topographies.js';
import { biomePourEtage } from '../data/biomes.js';

/**
 * Hash deux entiers en un seed reproductible.
 */
function combineSeed(a, b) {
    return ((a >>> 0) ^ Math.imul((b >>> 0) | 1, 0x9E3779B9)) >>> 0;
}

/**
 * Choisit un (archétype, topographie) pour un noeud "main".
 *
 * Tirage UNIFORME PAR TOPOGRAPHIE (et non plus par archétype) : on récolte
 * toutes les topographies qui supportent `portesNec` ET qui sont compatibles
 * avec au moins un archétype du biome, puis on en tire une au hasard. Pour
 * l'archétype, on tire ensuite parmi ceux du biome qui sont compatibles avec
 * la topo retenue.
 *
 * Effet vs ancien tirage (uniforme par archétype) : les topographies
 * spécialisées (compatibles 1-2 archétypes) ne sont plus diluées par les
 * topographies "polyvalentes". La variété de topo perçue augmente.
 */
function choisirArchetypeEtTopographie(portesNec, biome, rng) {
    const archetypesBiome = biome.archetypesAutorises
        .map(id => ARCHETYPES[id])
        .filter(Boolean);
    const idsArchBiome = new Set(archetypesBiome.map(a => a.id));

    const topographiesValides = Object.values(TOPOGRAPHIES).filter(topo =>
        portesNec.every(d => topo.portesPossibles.includes(d)) &&
        topo.archetypesCompatibles.some(archId => idsArchBiome.has(archId))
    );

    if (topographiesValides.length === 0) {
        // Fallback dur : sanctuaire + arene_ouverte (toujours valide)
        return { archetype: ARCHETYPES.sanctuaire, topographie: TOPOGRAPHIES.arene_ouverte };
    }

    const topographie = topographiesValides[Math.floor(rng() * topographiesValides.length)];

    const archetypesPossibles = archetypesBiome.filter(a =>
        topographie.archetypesCompatibles.includes(a.id)
    );
    const archetype = archetypesPossibles[Math.floor(rng() * archetypesPossibles.length)];

    return { archetype, topographie };
}

/**
 * Génère un étage complet.
 *
 * @param {number} numero  1..10
 * @param {number} seedRun seed du run, mélangé au numéro pour reproductibilité
 * @returns {object} étage
 */
export function genererEtage(numero, seedRun) {
    const seedEtage = combineSeed(seedRun, numero * 1009);
    const rng = creerRng(seedEtage);
    const biome = biomePourEtage(numero);

    // ─── 1. Place les noeuds (col, row) avec leur rôle ───
    const nodes = [
        { id: 'A',    col: 0, row: 0,  role: 'entree' },
        { id: 'B',    col: 1, row: 0,  role: 'main' },
        { id: 'C',    col: 2, row: 0,  role: 'main' },
        { id: 'D',    col: 3, row: 0,  role: 'main' },
        { id: 'BOSS', col: 4, row: 0,  role: 'boss' },
        // Dead-ends verticaux : connectés par N à un node main
        { id: 'B-haut', col: 1, row: -1, role: 'deadend' },
        { id: 'D-haut', col: 3, row: -1, role: 'deadend' }
    ];
    const byId = new Map(nodes.map(n => [n.id, n]));
    for (const n of nodes) n.voisins = {};

    // ─── 2. Connecte les noeuds (bidirectionnel) ───
    const connecter = (idA, dirA, idB) => {
        const dirB = directionOpposee(dirA);
        byId.get(idA).voisins[dirA] = idB;
        byId.get(idB).voisins[dirB] = idA;
    };

    // Chaîne principale (E/O)
    connecter('A',    'E', 'B');
    connecter('B',    'E', 'C');
    connecter('C',    'E', 'D');
    connecter('D',    'E', 'BOSS');

    // Dead-ends verticaux : ~70 % de chance de garder chacun, seedé
    const garderBranche = (_clef) => rng() < 0.7;
    const branchesGardees = [];
    if (garderBranche('B')) {
        connecter('B', 'N', 'B-haut');
        branchesGardees.push('B-haut');
    }
    if (garderBranche('D')) {
        connecter('D', 'N', 'D-haut');
        branchesGardees.push('D-haut');
    }
    let nodesActifs = nodes.filter(n =>
        n.role !== 'deadend' || branchesGardees.includes(n.id)
    );

    // ─── 2b. Garde-fou : déconnecter les branches deadend si aucune
    // topographie ne supporte les portes demandées du node main.
    // ─────────────────────────────────────────────────────────────
    for (const n of nodesActifs) {
        if (n.role !== 'main') continue;
        const portesNec = Object.keys(n.voisins);
        // On simule : y a-t-il un archétype du biome avec une topographie
        // supportant ces portes ?
        const candidats = biome.archetypesAutorises
            .map(id => ARCHETYPES[id])
            .filter(a => a && topographiesPour(a.id, portesNec).length > 0);
        if (candidats.length > 0) continue;

        // Aucun candidat → on retire les voisins deadend (sacrifiables)
        for (const dir of [...Object.keys(n.voisins)]) {
            const voisinId = n.voisins[dir];
            const voisin = byId.get(voisinId);
            if (voisin?.role === 'deadend') {
                delete n.voisins[dir];
                const opp = directionOpposee(dir);
                if (voisin.voisins[opp] === n.id) delete voisin.voisins[opp];
                if (Object.keys(voisin.voisins).length === 0) {
                    nodesActifs = nodesActifs.filter(x => x.id !== voisin.id);
                    const idx = branchesGardees.indexOf(voisin.id);
                    if (idx !== -1) branchesGardees.splice(idx, 1);
                }
            }
        }
    }

    // ─── 3. Pour chaque noeud, choisit (archétype, topographie) et génère ───
    const salles = new Map();
    for (const n of nodesActifs) {
        const portesNec = [...Object.keys(n.voisins)];
        // La salle BOSS reçoit une porte E "transition d'étage" (sans voisin
        // dans le graphe — interprétée par GameScene comme passage à
        // l'étage suivant).
        if (n.role === 'boss' && !portesNec.includes('E')) {
            portesNec.push('E');
        }

        let archetype, topographie;
        if (n.role === 'boss') {
            // Boss : arène dédiée à l'étage (10 designs uniques, complexité
            // progressive, thème suivant le biome). Fallback arene_ouverte si
            // l'étage est hors-plage.
            archetype = ARCHETYPES.arene;
            topographie = BOSS_ARENA_PAR_ETAGE[numero] ?? TOPOGRAPHIES.arene_ouverte;
        } else if (n.role === 'entree') {
            // Entrée = Cité Marchande en Miroir. Sol plat large pour les 3 PNJ.
            archetype = ARCHETYPES.sanctuaire;
            topographie = TOPOGRAPHIES.arene_ouverte;
        } else if (n.role === 'deadend') {
            // Dead-end vertical : Puits Descendant (entrée par le haut, coffre en bas)
            archetype = ARCHETYPES.puits;
            topographie = TOPOGRAPHIES.puits_descente;
        } else {
            // Main : choix libre dans le pool du biome
            ({ archetype, topographie } = choisirArchetypeEtTopographie(portesNec, biome, rng));
        }

        const salle = genererSalle({
            seedEtage,
            etageNumero: numero,
            salleId: n.id,
            archetype,
            topographie,
            portesActives: portesNec,
            estBoss: n.role === 'boss',
            estEntree: n.role === 'entree'
        });

        // Ajout des métadonnées de graphe (utiles à la carte UI)
        salle.gridCol = n.col;
        salle.gridRow = n.row;
        salle.role = n.role;
        salle.voisins = { ...n.voisins };

        salles.set(n.id, salle);
    }

    // Force coffre garanti dans les dead-ends (récompense pour la verticalité).
    // Pour le Puits Descendant : coffre EN BAS (orientation inversée historique).
    for (const id of branchesGardees) {
        const salle = salles.get(id);
        if (salle && !salle.coffre) {
            const dims = salle.dims;
            const HAUTEUR_SOL = 40;
            salle.coffre = {
                x: dims.largeur / 2,
                y: dims.hauteur - HAUTEUR_SOL - 12,
                largeur: 28, hauteur: 24
            };
        }
    }

    return {
        numero,
        biome: biome.id,
        seed: seedEtage,
        salles,                          // Map<id, salle>
        salleEntreeId: 'A',
        salleBossId: 'BOSS',
        sallesVisitees: new Set(['A'])
    };
}

/**
 * Sérialise/désérialise un étage pour le registry.
 * Le registry n'aime pas les Map/Set — on les convertit.
 */
export function etageVersRegistry(etage) {
    return {
        numero: etage.numero,
        biome: etage.biome,
        seed: etage.seed,
        salles: Array.from(etage.salles.entries()),
        salleEntreeId: etage.salleEntreeId,
        salleBossId: etage.salleBossId,
        sallesVisitees: Array.from(etage.sallesVisitees)
    };
}

export function etageDepuisRegistry(data) {
    if (!data) return null;
    return {
        numero: data.numero,
        biome: data.biome,
        seed: data.seed,
        salles: new Map(data.salles),
        salleEntreeId: data.salleEntreeId,
        salleBossId: data.salleBossId,
        sallesVisitees: new Set(data.sallesVisitees)
    };
}

/** Marque une salle comme visitée et persiste. */
export function marquerVisite(etage, salleId) {
    etage.sallesVisitees.add(salleId);
}
