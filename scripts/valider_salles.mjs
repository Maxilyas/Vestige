// scripts/valider_salles.mjs — Détecte les plateformes inaccessibles dans
// les salles handcrafted Ruines.
//
// Lance avec : node scripts/valider_salles.mjs
//
// Méthode : BFS depuis le sol (plateforme la plus large) en simulant les
// règles de saut du joueur (saut max 96 vert, 130 horiz edge-to-edge).
// Liste les plateformes non atteintes pour chaque salle.

const JUMP_VERT_MAX  = 96;
const JUMP_HORIZ_MAX = 130;
const PLAYER_H = 60;

function topPlatf(p)    { return p.y - p.hauteur / 2; }
function bottomPlatf(p) { return p.y + p.hauteur / 2; }
function leftPlatf(p)   { return p.x - p.largeur / 2; }
function rightPlatf(p)  { return p.x + p.largeur / 2; }

/**
 * Peut-on aller de la plateforme P vers Q ?
 * - Saut depuis le TOP de P : on peut atteindre y = topP - JUMP_VERT_MAX
 *   (la tête du joueur arrive max à topP - JUMP_VERT_MAX, donc le BOTTOM
 *    du joueur peut atteindre topP - JUMP_VERT_MAX + PLAYER_H si on est au sommet).
 * - On peut atterrir sur Q si topQ ∈ [topP - JUMP_VERT_MAX, topP + ∞ raisonnable].
 *   (Drop OK pour topQ > topP).
 * - Horizontal : edge-to-edge ≤ JUMP_HORIZ_MAX.
 *   Overlap horizontal = gap 0.
 */
function peutAtteindre(P, Q) {
    const topP = topPlatf(P), topQ = topPlatf(Q);
    // Vertical : Q doit être atteignable au saut (peut être au-dessus,
    // même hauteur, ou plus bas via drop).
    if (topQ < topP - JUMP_VERT_MAX) return false; // trop haut

    // Horizontal : gap edge-to-edge ≤ 130
    let gap;
    if (rightPlatf(P) < leftPlatf(Q))      gap = leftPlatf(Q) - rightPlatf(P);
    else if (rightPlatf(Q) < leftPlatf(P)) gap = leftPlatf(P) - rightPlatf(Q);
    else                                     gap = 0;
    return gap <= JUMP_HORIZ_MAX;
}

function valider(salle) {
    // Ignore les plateformes 'decoratif' (purement visuelles) ET 'structurel'
    // (murs latéraux, plafonds, cloisons — non walkable par design).
    const plateformes = salle.plateformes.filter(p =>
        !p.tags?.includes('decoratif') && !p.tags?.includes('structurel')
    );
    if (plateformes.length === 0) return [];

    // Sol = la plus large plateforme (souvent yTop le plus bas aussi)
    const sol = plateformes.reduce((m, p) => p.largeur > m.largeur ? p : m);
    const visited = new Set([sol]);
    const queue = [sol];

    while (queue.length) {
        const P = queue.shift();
        for (const Q of plateformes) {
            if (visited.has(Q)) continue;
            if (peutAtteindre(P, Q)) {
                visited.add(Q);
                queue.push(Q);
            }
        }
    }

    return plateformes.filter(p => !visited.has(p));
}

// Importe le catalogue et valide chaque salle
const mod = await import('../src/data/salles/_index.js');
const { sallesCompatibles } = mod;

// Récupère TOUTES les salles Ruines (compatibles avec n'importe quelle porte)
// → on génère chaque salle avec ses portesPossibles complètes
const directions = ['N','S','E','O'];
const ids = ['ruines_grimpeur','ruines_passage_humble','ruines_carrefour',
             'ruines_couloir_traversant','ruines_puits_vertical',
             'ruines_coin_NE','ruines_coin_SO','ruines_t_NEO','ruines_t_SEO',
             'ruines_impasse_O','ruines_impasse_E','ruines_arche_brisee',
             'ruines_cathedrale','ruines_tour_sentinelles','ruines_atelier',
             'ruines_3plaques','ruines_crypte_profonde','ruines_pont_soupirs',
             'ruines_tour_brouillage','ruines_caveau_scelle',
             // ─── Phase 9.2/9.3 — Salles compactes 960×540 ───
             'ruines_atrium_effondre',
             'ruines_couloir_brise','ruines_escaliers_effrites',
             'ruines_arene_pieux','ruines_arene_ressorts',
             // Phase 9.3c — Pool compact complet
             'ruines_carrefour_compact',
             'ruines_puits_compact','ruines_cheminee_compact',
             'ruines_coin_NE_compact','ruines_coin_NO_compact',
             'ruines_coin_SE_compact','ruines_coin_SO_compact',
             'ruines_t_NEO_compact','ruines_t_SEO_compact',
             'ruines_t_NSO_compact','ruines_t_NSE_compact',
             'ruines_impasse_O_compact','ruines_impasse_E_compact',
             'ruines_impasse_N_compact','ruines_impasse_S_compact',
             // ─── Halls Cendrés (Phase 8, vague 5) ───
             'halls_couloir_brasiers','halls_grand_mur','halls_cascade_pierres',
             'halls_brasserie','halls_voute_basse','halls_pont_braise',
             'halls_atelier_marteau','halls_couloir_explosif',
             'halls_crypte_effondree','halls_cheminee_braise','halls_puits_cendres',
             'halls_coin_NE','halls_coin_SO','halls_coin_NO','halls_coin_SE',
             'halls_t_NEO','halls_t_SEO','halls_t_NSO','halls_t_NSE',
             'halls_impasse_O','halls_impasse_E','halls_impasse_N','halls_impasse_S',
             'halls_foyer_eteint','halls_reseau_plaques','halls_carrefour_brasier'];

let totalBugs = 0;
for (const id of ids) {
    const salle = mod.sallePar(id);
    if (!salle) { console.log(`[?] ${id} introuvable`); continue; }
    const portesActives = salle.portesPossibles ?? ['O','E'];
    const result = salle.generer({ portesActives });
    const inaccess = valider(result);
    if (inaccess.length === 0) {
        console.log(`[OK] ${id.padEnd(28)} — ${result.plateformes.length} plateformes`);
    } else {
        totalBugs += inaccess.length;
        console.log(`[KO] ${id.padEnd(28)} — ${inaccess.length}/${result.plateformes.length} INACCESSIBLES :`);
        for (const p of inaccess) {
            const x = Math.round(p.x);
            const yTop = Math.round(p.y - p.hauteur / 2);
            console.log(`       → x=${x} yTop=${yTop} w=${p.largeur} ${p.oneWay ? '(oneWay)' : ''}`);
        }
    }
}
console.log(`\nTotal plateformes inaccessibles : ${totalBugs}`);
