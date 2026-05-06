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

import { creerRng, genererSalle } from './WorldGen.js';
import { ARCHETYPES, directionOpposee } from '../data/archetypes.js';
import { biomePourEtage } from '../data/biomes.js';

/**
 * Hash deux entiers en un seed reproductible.
 */
function combineSeed(a, b) {
    return ((a >>> 0) ^ Math.imul((b >>> 0) | 1, 0x9E3779B9)) >>> 0;
}

/**
 * Choisit un archétype dans le biome qui supporte les directions de portes
 * demandées. On préfère un archétype dont les `portesPossibles` couvrent
 * `portesNecessaires`, et qui correspond au niveau de danger d'étage.
 */
function choisirArchetypeAvecPortes(portesNecessaires, niveauEtage, biome, rng) {
    const candidats = biome.archetypesAutorises
        .map(id => ARCHETYPES[id])
        .filter(a => portesNecessaires.every(d => a.portesPossibles.includes(d)));

    if (candidats.length === 0) {
        // Fallback : sanctuaire (E + O) pour les chaînes horizontales basiques
        return ARCHETYPES.sanctuaire;
    }

    // On privilégie ceux qui correspondent au niveau de danger d'étage
    const matchNiveau = candidats.filter(a => a.niveauxAssocies.includes(niveauEtage));
    const pool = matchNiveau.length > 0 ? matchNiveau : candidats;
    return pool[Math.floor(rng() * pool.length)];
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
    // Format interne avant compilation en salles :
    //   { id, col, row, role, voisins: { dir → id } }
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

    // Dead-ends verticaux : B et D ont une porte N vers la salle au-dessus
    // On choisit aléatoirement (seedé) si l'on garde les deux ou si on en
    // mute un en ne le générant pas — pour que les étages soient variés.
    const garderBranche = (clef) => rng() < 0.7;
    const branchesGardees = [];
    if (garderBranche('B')) {
        connecter('B', 'N', 'B-haut');
        branchesGardees.push('B-haut');
    }
    if (garderBranche('D')) {
        connecter('D', 'N', 'D-haut');
        branchesGardees.push('D-haut');
    }
    // Filtre les nodes finalement utilisés
    let nodesActifs = nodes.filter(n =>
        n.role !== 'deadend' || branchesGardees.includes(n.id)
    );

    // ─── 2b. Garde-fou : déconnecter les branches deadend si le noeud
    // principal n'a aucun archétype capable de supporter ses portes.
    // Évite les portes "fantômes" sans plateforme d'accès.
    // ─────────────────────────────────────────────────────────────
    const niveauEtage = numero <= 2 ? 0 : numero <= 4 ? 1 : numero <= 6 ? 2 : 3;
    for (const n of nodesActifs) {
        if (n.role !== 'main') continue;
        const portesNec = Object.keys(n.voisins);
        const candidats = biome.archetypesAutorises
            .map(id => ARCHETYPES[id])
            .filter(a => portesNec.every(d => a.portesPossibles.includes(d)));
        if (candidats.length > 0) continue;

        // Aucun archétype ne supporte ces portes → on retire les voisins
        // deadend (les seuls qu'on peut sacrifier sans casser la chaîne)
        for (const dir of [...Object.keys(n.voisins)]) {
            const voisinId = n.voisins[dir];
            const voisin = byId.get(voisinId);
            if (voisin?.role === 'deadend') {
                delete n.voisins[dir];
                const opp = directionOpposee(dir);
                if (voisin.voisins[opp] === n.id) delete voisin.voisins[opp];
                // Retire le deadend de la liste active s'il n'a plus de voisins
                if (Object.keys(voisin.voisins).length === 0) {
                    nodesActifs = nodesActifs.filter(x => x.id !== voisin.id);
                    const idx = branchesGardees.indexOf(voisin.id);
                    if (idx !== -1) branchesGardees.splice(idx, 1);
                }
            }
        }
    }

    // ─── 3. Génère la salle pour chaque noeud ───
    const salles = new Map();
    for (const n of nodesActifs) {
        const portesNec = [...Object.keys(n.voisins)];
        // La salle BOSS reçoit en plus une porte E "transition d'étage" (sans
        // voisin dans le graphe — interprétée par GameScene comme passage à
        // l'étage suivant).
        if (n.role === 'boss' && !portesNec.includes('E')) {
            portesNec.push('E');
        }

        let archetype;
        if (n.role === 'boss') {
            // La salle de boss : Arène du Reflux (sol dégagé pour combat futur).
            // Phase C ajoutera un vrai boss.
            archetype = ARCHETYPES.arene;
        } else if (n.role === 'entree') {
            // L'entrée de l'étage est TOUJOURS un Sanctuaire — c'est la cité
            // marchande quand on est en Miroir. Layout consistant pour que le
            // joueur reconnaisse l'endroit comme un repère stable.
            archetype = ARCHETYPES.sanctuaire;
        } else if (n.role === 'deadend') {
            // Dead-ends verticaux : on privilégie le Puits Inversé (porte N native)
            archetype = ARCHETYPES.puits;
        } else {
            archetype = choisirArchetypeAvecPortes(portesNec, niveauEtage, biome, rng);
        }

        const salle = genererSalle({
            seedEtage,
            etageNumero: numero,
            salleId: n.id,
            archetype,
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
    // Le Puits Inversé a sa porte S au SOMMET (orientation inversée) — donc le
    // coffre est posé EN BAS, au sol, pour récompenser la descente exploratoire.
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
        sallesVisitees: new Set(['A'])   // l'entrée est connue dès l'arrivée
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
