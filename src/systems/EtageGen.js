// EtageGen — génère le graphe d'un étage (Phase A).
//
// STRUCTURE D'UN ÉTAGE (7 salles max)
//
//          col 0    col 1    col 2    col 3    col 4 (boss)
// row -1            B'                 D'
//                   ↑                   ↑
// row 0   A → → →   B → → →   C → → →   D → → →   BOSS
//
//   - Chaîne principale : A → B → C → D → BOSS, 5 salles connectées par E/O.
//   - 0-2 dead-ends verticaux (B' et D') connectés par N à un node main.
//     Contiennent un coffre garanti — récompense pour explorer en hauteur.
//
// Les directions s'inversent automatiquement au retour : si A.portes.E = B.id,
// alors B.portes.O = A.id. Le joueur peut donc revenir sur ses pas.
//
// Phase 2a — Refactor (2026-05-12) : le couple (archétype, topographie)
// remplace l'archétype seul. L'archétype = thème, la topographie = structure.
//
// Phase 4 — Étages déterministes (2026-05-12) : si `ETAGES[numero]` est défini
// dans data/etages.js, ses pins (archétype, topographie, présence deadend)
// remplacent le tirage aléatoire. La microgéométrie + pool ennemis + rareté
// restent seedés (variance vivante au sein d'une structure stable).

import { creerRng, genererSalle, hashStr } from './WorldGen.js';
import { ARCHETYPES, directionOpposee } from '../data/archetypes.js';
import { TOPOGRAPHIES, topographiesPour, BOSS_ARENA_PAR_ETAGE } from '../data/topographies.js';
import { biomePourEtage } from '../data/biomes.js';
import { ETAGES, configSalle } from '../data/etages.js';
import { sallesVisiteesPersistantes, marquerSalleVisiteePersistant } from './CarteMemoire.js';
import { sallePar, tirerSalleCompatible, salleFallback } from '../data/salles/_index.js';
import { genererGrapheSpanningTree } from './GrapheEtageGen.js';

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
    const pinEtage = ETAGES[numero];

    // ─── 1. Construit le graphe ──────────────────────────────────────
    // Trois modes :
    //   (a) DATA-DRIVEN — pinEtage.noeuds explicite. Graphe arbitraire éditorial.
    //   (b) SPANNING TREE — pinEtage.spanningTree=true (ou pin absent et pas
    //       de pinEtage.salles). Algo génère un graphe sur grille NxN, tire
    //       les salles dans le catalogue par tag de portes.
    //   (c) LEGACY — pinEtage.salles défini (ancienne structure). Chaîne
    //       fixe A→B→C→D→BOSS + deadends B-haut/D-haut. Conservé pour les
    //       étages 3-10 pas encore migrés.
    let nodes, nodesActifs, branchesGardees, byId;
    let modeGraphe;

    if (pinEtage?.noeuds) {
        modeGraphe = 'data-driven';
        // ─── Mode data-driven ───
        nodes = Object.entries(pinEtage.noeuds).map(([id, def]) => ({
            id,
            col: def.col ?? 0,
            row: def.row ?? 0,
            role: def.role ?? 'main',
            voisins: { ...(def.voisins ?? {}) }
        }));
        byId = new Map(nodes.map(n => [n.id, n]));
        nodesActifs = nodes;
        branchesGardees = nodes.filter(n => n.role === 'deadend').map(n => n.id);

        // Sanity check : voisinages réciproques
        for (const n of nodes) {
            for (const [dir, voisinId] of Object.entries(n.voisins)) {
                const v = byId.get(voisinId);
                const dirOpp = directionOpposee(dir);
                if (!v) {
                    console.warn(`[EtageGen] Voisin manquant: ${n.id}.${dir} → '${voisinId}' (étage ${numero})`);
                } else if (v.voisins[dirOpp] !== n.id) {
                    console.warn(`[EtageGen] Voisinage non réciproque: ${n.id}.${dir}=${voisinId} mais ${voisinId}.${dirOpp}=${v.voisins[dirOpp]} (étage ${numero})`);
                }
            }
        }
    } else if (pinEtage?.spanningTree === true || !pinEtage?.salles) {
        // ─── Mode SPANNING TREE (nouveau défaut pour étages migrés) ───
        modeGraphe = 'spanning-tree';
        const dimsGrille = pinEtage?.grille ?? { cols: 5, rows: 5 };
        const rngGraphe = creerRng((seedEtage ^ 0x6E0DE5A1) >>> 0);
        nodes = genererGrapheSpanningTree(rngGraphe, { dims: dimsGrille });
        byId = new Map(nodes.map(n => [n.id, n]));
        nodesActifs = nodes;
        branchesGardees = nodes.filter(n => n.role === 'deadend').map(n => n.id);
    } else {
        // ─── Mode LEGACY (étages 3-10 non migrés) ───
        modeGraphe = 'legacy';
        nodes = [
            { id: 'A',    col: 0, row: 0,  role: 'entree' },
            { id: 'B',    col: 1, row: 0,  role: 'main' },
            { id: 'C',    col: 2, row: 0,  role: 'main' },
            { id: 'D',    col: 3, row: 0,  role: 'main' },
            { id: 'BOSS', col: 4, row: 0,  role: 'boss' },
            { id: 'B-haut', col: 1, row: -1, role: 'deadend' },
            { id: 'D-haut', col: 3, row: -1, role: 'deadend' }
        ];
        byId = new Map(nodes.map(n => [n.id, n]));
        for (const n of nodes) n.voisins = {};

        const connecter = (idA, dirA, idB) => {
            const dirB = directionOpposee(dirA);
            byId.get(idA).voisins[dirA] = idB;
            byId.get(idB).voisins[dirB] = idA;
        };
        connecter('A',    'E', 'B');
        connecter('B',    'E', 'C');
        connecter('C',    'E', 'D');
        connecter('D',    'E', 'BOSS');

        branchesGardees = [];
        const garderBrancheEditorialisee = (id) =>
            pinEtage ? (pinEtage.salles?.[id] !== undefined) : (rng() < 0.7);
        if (garderBrancheEditorialisee('B-haut')) {
            connecter('B', 'N', 'B-haut');
            branchesGardees.push('B-haut');
        }
        if (garderBrancheEditorialisee('D-haut')) {
            connecter('D', 'N', 'D-haut');
            branchesGardees.push('D-haut');
        }
        nodesActifs = nodes.filter(n =>
            n.role !== 'deadend' || branchesGardees.includes(n.id)
        );
    }

    // ─── 2b. Garde-fou (LEGACY uniquement) ──────────────────────────
    // Déconnecte les branches deadend si aucune topographie ne supporte
    // les portes demandées du node main. En modes data-driven et spanning-
    // tree, on tire dans le catalogue de salles handcrafted (avec fallback)
    // donc cette vérification n'est pas pertinente.
    if (modeGraphe === 'legacy') {
        for (const n of nodesActifs) {
            if (n.role !== 'main') continue;
            const portesNec = Object.keys(n.voisins);
            const candidats = biome.archetypesAutorises
                .map(id => ARCHETYPES[id])
                .filter(a => a && topographiesPour(a.id, portesNec).length > 0);
            if (candidats.length > 0) continue;

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
    }

    // ─── 3. Pour chaque noeud, choisit (archétype, topographie) et génère ───
    const salles = new Map();
    // Track des salles uniques (signature) déjà tirées dans cet étage.
    // Empêche d'avoir 3 Grimpeur de suite.
    const sallesUniquesDejaUtilisees = new Set();
    for (const n of nodesActifs) {
        const portesNec = [...Object.keys(n.voisins)];
        // La salle BOSS reçoit une porte E "transition d'étage" (sans voisin
        // dans le graphe — interprétée par GameScene comme passage à
        // l'étage suivant).
        if (n.role === 'boss' && !portesNec.includes('E')) {
            portesNec.push('E');
        }

        let archetype, topographie;
        // Pin éditorialisé (Phase 4) — priorité absolue sauf pour la salle
        // d'entrée qui DOIT rester sanctuaire/arene_ouverte (la Cité Miroir
        // s'y déploie : 3 PNJ posés au sol, doit être plat et large).
        // En mode data-driven, le pin EST le noeud (contient archetype/
        // useSalle/topographie directement). Sinon on lit depuis pinEtage.salles.
        const pin = pinEtage?.noeuds?.[n.id] ?? configSalle(numero, n.id);

        if (n.role === 'entree') {
            // Entrée = Cité Marchande en Miroir. Forçage non négociable.
            archetype = ARCHETYPES.sanctuaire;
            topographie = TOPOGRAPHIES.arene_ouverte;
        } else if (pin?.useSalle && sallePar(pin.useSalle)) {
            // ─── Salle handcrafted pinnée explicitement ──────────────
            const salleDef = sallePar(pin.useSalle);
            archetype = ARCHETYPES[pin.archetype] ?? ARCHETYPES.hall;
            topographie = salleDef;
        } else if (modeGraphe === 'spanning-tree' && n.role !== 'boss') {
            // ─── Spanning tree : tire dans le catalogue par tag de portes ─
            // portesNec = directions des voisins du nœud. Le rôle filtre les
            // salles signature hors des deadends. dejaUtilisees exclut les
            // salles `unique: true` déjà placées (Grimpeur, Arche brisée).
            const rngSalle = creerRng((seedEtage ^ 0xCA7A1067 ^ hashStr(n.id)) >>> 0);
            const salleDef = tirerSalleCompatible(biome.id, portesNec, rngSalle, n.role, sallesUniquesDejaUtilisees)
                          ?? salleFallback(biome.id);
            // Track les salles uniques placées
            if (salleDef.unique) sallesUniquesDejaUtilisees.add(salleDef.id);
            archetype = ARCHETYPES[salleDef.archetypesCompatibles?.[0]] ?? ARCHETYPES.hall;
            topographie = salleDef;
        } else if (pin && ARCHETYPES[pin.archetype] && TOPOGRAPHIES[pin.topographie]) {
            archetype = ARCHETYPES[pin.archetype];
            topographie = TOPOGRAPHIES[pin.topographie];
            // Sanity check dev : la topo doit supporter toutes les portes nécessaires.
            // (Sauf pour la salle BOSS qui force E hors-graphe : c'est attendu.)
            if (n.role !== 'boss') {
                const portesMissing = portesNec.filter(d => !topographie.portesPossibles.includes(d));
                if (portesMissing.length > 0) {
                    console.warn(
                        `[EtageGen] Pin invalide étage ${numero} salle ${n.id}: ` +
                        `topographie '${pin.topographie}' ne supporte pas porte(s) ${portesMissing.join(',')}. ` +
                        `Vérifier data/etages.js.`
                    );
                }
            }
        } else if (n.role === 'boss') {
            // Fallback boss : arène dédiée à l'étage (10 designs uniques).
            archetype = ARCHETYPES.arene;
            topographie = BOSS_ARENA_PAR_ETAGE[numero] ?? TOPOGRAPHIES.arene_ouverte;
        } else if (n.role === 'deadend') {
            // Fallback deadend : Puits Descendant classique.
            archetype = ARCHETYPES.puits;
            topographie = TOPOGRAPHIES.puits_descente;
        } else {
            // Fallback main : choix libre dans le pool du biome.
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

    // Mémoire de carte persistante.
    //   - Mode legacy : ids stables (A, B, C, D, BOSS, B-haut, D-haut), donc
    //     on hydrate les visitées d'un run précédent.
    //   - Mode spanning tree : ids générés à chaque run (R00, R01...), donc
    //     toute persistance entre runs serait incohérente. On démarre vierge
    //     à chaque génération. Le système de sauvegarde "vraie" (à venir)
    //     persistera l'étage entier en l'état, pas juste les visites.
    const visiteesInitiales = new Set(['A']);
    if (modeGraphe === 'legacy' || modeGraphe === 'data-driven') {
        for (const id of sallesVisiteesPersistantes(numero)) {
            if (salles.has(id)) visiteesInitiales.add(id);
        }
    }

    return {
        numero,
        biome: biome.id,
        seed: seedEtage,
        salles,                          // Map<id, salle>
        salleEntreeId: 'A',
        salleBossId: 'BOSS',
        sallesVisitees: visiteesInitiales
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

/** Marque une salle comme visitée (état du run + mémoire entre runs). */
export function marquerVisite(etage, salleId) {
    etage.sallesVisitees.add(salleId);
    marquerSalleVisiteePersistant(etage.numero, salleId);
}
