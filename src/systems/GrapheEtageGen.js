// GrapheEtageGen — génération algorithmique du graphe d'un étage.
//
// Approche "spanning tree avec branches et boucles" inspirée de Binding of
// Isaac / Hollow Knight. Étapes :
//
//   1. Place ENTRÉE (col=0, row aléatoire) et BOSS (col=N-1, row aléatoire)
//   2. Trace un CHEMIN CRITIQUE (random walk biaisé vers boss) qui garantit
//      la jouabilité.
//   3. Ajoute des BRANCHES depuis le chemin critique dans les cases vides
//      (depth-first stochastique).
//   4. Ajoute des BOUCLES : 10% chance de connecter 2 cases voisines non
//      reliées (transforme l'arbre en mini-réseau).
//   5. Marque comme DEADEND tout nœud avec 1 seul voisin.
//
// L'algo retourne une LISTE de noeuds { id, col, row, role, voisins }.
// Pas de salles assignées — c'est EtageGen qui pioche dans le catalogue
// (sallesCompatibles) en fonction des portes nécessaires (= directions
// des voisins) de chaque nœud.

const OPPOSEES = { N: 'S', S: 'N', E: 'O', O: 'E' };
const DELTAS = {
    N: { dc: 0,  dr: -1 },
    S: { dc: 0,  dr: 1 },
    E: { dc: 1,  dr: 0 },
    O: { dc: -1, dr: 0 }
};
const DIRS = ['N', 'S', 'E', 'O'];

const DIMS_DEFAUT = { cols: 6, rows: 5 };
const PROBA_BOUCLE      = 0.18;   // chance qu'une paire voisine non connectée se relie
const PROBA_BRANCHE     = 0.85;   // chance qu'un nœud du chemin engendre une branche
const PROBA_BRANCHE_EXT = 0.65;   // chance qu'une branche s'étende d'1 case de plus

// Phase 9 — cible "mini-Metroidvania" : 12-18 salles par étage.
// Si après la phase 3 (branches naturelles) on est sous ce seuil, une passe
// de remplissage force des branches additionnelles depuis n'importe quel nœud
// du graphe vers les cases libres adjacentes, jusqu'à atteindre TARGET_MIN.
const TARGET_MIN_SALLES = 12;
const TARGET_MAX_SALLES = 18;

function k(col, row) { return col + ',' + row; }

function dansGrille(col, row, dims) {
    return col >= 0 && col < dims.cols && row >= 0 && row < dims.rows;
}

function connecter(a, dir, b) {
    a.voisins[dir] = b.id;
    b.voisins[OPPOSEES[dir]] = a.id;
}

/**
 * Génère un graphe d'étage par spanning tree + branches + boucles.
 *
 * @param {() => number} rng - fonction PRNG seedée
 * @param {object} [options]
 *   - dims: { cols, rows } (défaut 5×5)
 *   - probaBoucle: 0..1 (défaut 0.10)
 * @returns {Array<{id, col, row, role, voisins}>} liste des noeuds
 */
export function genererGrapheSpanningTree(rng, options = {}) {
    const dims = options.dims ?? DIMS_DEFAUT;
    const probaBoucle = options.probaBoucle ?? PROBA_BOUCLE;
    const grid = {};
    const idGen = { next: 0 };
    const newId = () => 'R' + String(idGen.next++).padStart(2, '0');

    // ─── 1. Place entrée, boss, ET antichambre du boss ────────────────
    // L'antichambre garantit que le boss n'a qu'une seule porte O (à l'ouest).
    // Préserve la mise en scène horizontale des arènes boss (le joueur arrive
    // toujours par la gauche, le boss apparaît à droite). Sans elle, le
    // spanning tree pourrait connecter le boss par N/S/E ce qui briserait la
    // composition des arènes legacy.
    const entreeRow = Math.floor(rng() * dims.rows);
    const bossRow   = Math.floor(rng() * dims.rows);
    const entree       = { id: 'A',    col: 0,             row: entreeRow, role: 'entree', voisins: {} };
    const boss         = { id: 'BOSS', col: dims.cols - 1, row: bossRow,   role: 'boss',   voisins: {} };
    const antichambre  = { id: newId(), col: dims.cols - 2, row: bossRow, role: 'main', voisins: {} };
    grid[k(entree.col, entree.row)] = entree;
    grid[k(boss.col, boss.row)] = boss;
    grid[k(antichambre.col, antichambre.row)] = antichambre;
    connecter(antichambre, 'E', boss);

    // ─── 2. Chemin critique : random walk depuis entrée → ANTICHAMBRE ──
    // (pas vers le boss directement — c'est l'antichambre qui mène au boss).
    const chemin = [entree];
    let cur = entree;
    const cible = antichambre;
    let safety = 60;
    while (!(cur.col === cible.col && cur.row === cible.row) && safety-- > 0) {
        // Directions disponibles (in bounds + case libre OU = cible/antichambre)
        const dispo = [];
        for (const d of DIRS) {
            const { dc, dr } = DELTAS[d];
            const nc = cur.col + dc, nr = cur.row + dr;
            if (!dansGrille(nc, nr, dims)) continue;
            const occupant = grid[k(nc, nr)];
            // On accepte la cible (antichambre) comme destination ; on refuse
            // le boss (interdit, on doit y arriver via l'antichambre) ; et
            // toute autre cellule déjà occupée est refusée.
            if (occupant === boss) continue;
            if (occupant && occupant !== cible) continue;
            dispo.push(d);
        }
        if (dispo.length === 0) {
            // Bloqué (île). Fallback : force connexion directe à la cible.
            console.warn('[GrapheEtageGen] Chemin critique bloqué, force connexion vers antichambre');
            const dirVersCible = cible.col > cur.col ? 'E'
                              : cible.col < cur.col ? 'O'
                              : cible.row > cur.row ? 'S'
                              : 'N';
            connecter(cur, dirVersCible, cible);
            chemin.push(cible);
            cur = cible;
            break;
        }

        // Biais fort vers la cible (= antichambre) : 85% rapprochement.
        const distCur = Math.abs(cible.col - cur.col) + Math.abs(cible.row - cur.row);
        const dispoRapproche = [];
        const dispoEloigne = [];
        for (const d of dispo) {
            const { dc, dr } = DELTAS[d];
            const distNext = Math.abs(cible.col - (cur.col + dc)) + Math.abs(cible.row - (cur.row + dr));
            (distNext < distCur ? dispoRapproche : dispoEloigne).push(d);
        }
        let pool;
        if (dispoRapproche.length === 0) pool = dispoEloigne;
        else if (dispoEloigne.length === 0 || rng() < 0.85) pool = dispoRapproche;
        else pool = dispoEloigne;
        const choisi = pool[Math.floor(rng() * pool.length)];
        const { dc, dr } = DELTAS[choisi];
        const nc = cur.col + dc, nr = cur.row + dr;

        let voisin;
        if (nc === cible.col && nr === cible.row) {
            voisin = cible;
        } else {
            voisin = { id: newId(), col: nc, row: nr, role: 'main', voisins: {} };
            grid[k(nc, nr)] = voisin;
        }
        connecter(cur, choisi, voisin);
        chemin.push(voisin);
        cur = voisin;
    }
    if (cur !== cible) {
        console.warn('[GrapheEtageGen] Chemin critique a timeout sans atteindre antichambre');
        connecter(cur, 'E', cible);
    }

    // ─── 3. Branches depuis le chemin critique ────────────────────────
    for (const nodeBase of [...chemin]) {
        if (nodeBase.role === 'entree' || nodeBase.role === 'boss') continue;
        for (const d of DIRS) {
            if (nodeBase.voisins[d]) continue;
            const { dc, dr } = DELTAS[d];
            const nc = nodeBase.col + dc, nr = nodeBase.row + dr;
            if (!dansGrille(nc, nr, dims) || grid[k(nc, nr)]) continue;
            if (rng() >= PROBA_BRANCHE) continue;
            etendreBranche(nodeBase, d, grid, dims, rng, newId);
        }
    }

    // ─── 3b. Phase 9 — Remplissage cible mini-Metroidvania ─────────────
    // Si le graphe est en-dessous de la cible minimum, on force des branches
    // supplémentaires depuis n'importe quel nœud existant (hors entrée/boss
    // qui restent à 1-2 connexions) vers les cases libres adjacentes. Stop
    // dès qu'on atteint la cible OU qu'il n'y a plus de case libre.
    let nbActuel = Object.keys(grid).length;
    if (nbActuel < TARGET_MIN_SALLES) {
        const candidats = Object.values(grid).filter(n =>
            n.role !== 'entree' && n.role !== 'boss'
        );
        // Mélange seedé pour répartir les nouvelles branches
        for (let i = candidats.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [candidats[i], candidats[j]] = [candidats[j], candidats[i]];
        }
        let safetyRemplissage = 40;
        while (nbActuel < TARGET_MAX_SALLES && safetyRemplissage-- > 0) {
            let aProgresse = false;
            for (const nodeBase of candidats) {
                if (nbActuel >= TARGET_MAX_SALLES) break;
                // Direction libre adjacente avec case vide
                const dirsLibres = [];
                for (const d of DIRS) {
                    if (nodeBase.voisins[d]) continue;
                    const { dc, dr } = DELTAS[d];
                    const nc = nodeBase.col + dc, nr = nodeBase.row + dr;
                    if (!dansGrille(nc, nr, dims) || grid[k(nc, nr)]) continue;
                    dirsLibres.push(d);
                }
                if (dirsLibres.length === 0) continue;
                const d = dirsLibres[Math.floor(rng() * dirsLibres.length)];
                etendreBranche(nodeBase, d, grid, dims, rng, newId);
                aProgresse = true;
                nbActuel = Object.keys(grid).length;
                // Une fois min atteint, on arrête (sauf si on est dans la
                // marge basse < 14 où on continue pour densifier)
                if (nbActuel >= TARGET_MIN_SALLES && rng() < 0.4) break;
            }
            if (!aProgresse) break;
        }
    }

    // ─── 4. Boucles : 18% chance de relier 2 voisines non connectées ──
    // Le boss est EXCLU des boucles (il doit n'avoir que l'unique porte O
    // depuis l'antichambre, sinon la mise en scène horizontale de l'arène
    // boss est cassée).
    for (const node of Object.values(grid)) {
        if (node.role === 'boss') continue;
        for (const d of DIRS) {
            if (node.voisins[d]) continue;
            const { dc, dr } = DELTAS[d];
            const voisin = grid[k(node.col + dc, node.row + dr)];
            if (!voisin) continue;
            if (voisin.role === 'boss') continue;
            if (voisin.voisins[OPPOSEES[d]]) continue;
            if (rng() < probaBoucle) {
                connecter(node, d, voisin);
            }
        }
    }

    // ─── 5. Marquer les deadends (1 seul voisin, sauf entrée/boss) ────
    for (const node of Object.values(grid)) {
        if (node.role === 'entree' || node.role === 'boss') continue;
        if (Object.keys(node.voisins).length === 1) node.role = 'deadend';
    }

    return Object.values(grid);
}

function etendreBranche(start, dirInit, grid, dims, rng, newId) {
    const { dc: dc0, dr: dr0 } = DELTAS[dirInit];
    const nc0 = start.col + dc0, nr0 = start.row + dr0;
    if (!dansGrille(nc0, nr0, dims) || grid[k(nc0, nr0)]) return;

    const node1 = { id: newId(), col: nc0, row: nr0, role: 'main', voisins: {} };
    grid[k(nc0, nr0)] = node1;
    connecter(start, dirInit, node1);

    // Continue à étendre la branche dans une direction libre
    let cur = node1;
    while (rng() < PROBA_BRANCHE_EXT) {
        const dirsLibres = [];
        for (const d of DIRS) {
            if (cur.voisins[d]) continue;
            const { dc, dr } = DELTAS[d];
            const nc = cur.col + dc, nr = cur.row + dr;
            if (!dansGrille(nc, nr, dims) || grid[k(nc, nr)]) continue;
            dirsLibres.push(d);
        }
        if (dirsLibres.length === 0) break;
        const d = dirsLibres[Math.floor(rng() * dirsLibres.length)];
        const { dc, dr } = DELTAS[d];
        const newer = { id: newId(), col: cur.col + dc, row: cur.row + dr, role: 'main', voisins: {} };
        grid[k(newer.col, newer.row)] = newer;
        connecter(cur, d, newer);
        cur = newer;
    }
}
