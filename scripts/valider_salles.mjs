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
    // Ignore les plateformes 'decoratif' (purement visuelles), 'structurel'
    // (murs latéraux, plafonds, cloisons — non walkable par design), 'secret'
    // (niches cachées accessibles seulement après mur_secret cassé), et
    // 'metroidvania' (plateformes accessibles seulement avec upgrade futur :
    // ancrage, wall-jump, double-saut, etc. — gating de progression).
    const plateformes = salle.plateformes.filter(p =>
        !p.tags?.includes('decoratif') &&
        !p.tags?.includes('structurel') &&
        !p.tags?.includes('secret') &&
        !p.tags?.includes('metroidvania')
    );

    // Plateformes MOBILES (oscillation cyclique) : on génère 3 pseudo-plateformes
    // pour chaque mobile (centre + 2 extrémités). Le BFS les voit comme des
    // tremplins virtuels. Toutes les pseudo-plateformes d'un même mobile sont
    // marquées avec un `_mobileGroup` partagé : si le BFS en visite une, les
    // 2 autres sont automatiquement visitées (la plateforme PORTE le joueur
    // entre ses positions, indépendamment du saut max). Marqueur _virtuel
    // pour ne pas les compter dans le rapport KO.
    const mobiles = (salle.obstacles ?? []).filter(o => o.type === 'plateforme_mobile');
    const mobileGroups = new Map();  // groupId → [pseudo1, pseudo2, pseudo3]
    mobiles.forEach((m, idx) => {
        const axe = m.axe ?? 'horizontale';
        const amp = m.amplitude ?? 140;
        const groupId = `mobile_${idx}`;
        const base = {
            largeur: m.largeur, hauteur: m.hauteur,
            oneWay: true, _virtuel: true, _mobileGroup: groupId
        };
        const positions = [];
        if (axe === 'horizontale') {
            positions.push({ ...base, x: m.x - amp, y: m.y });
            positions.push({ ...base, x: m.x,       y: m.y });
            positions.push({ ...base, x: m.x + amp, y: m.y });
        } else {
            positions.push({ ...base, x: m.x, y: m.y - amp });
            positions.push({ ...base, x: m.x, y: m.y });
            positions.push({ ...base, x: m.x, y: m.y + amp });
        }
        plateformes.push(...positions);
        mobileGroups.set(groupId, positions);
    });

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
                // Si Q appartient à un groupe mobile, ses jumelles sont
                // automatiquement accessibles (la plateforme transporte le joueur).
                if (Q._mobileGroup) {
                    for (const jumelle of mobileGroups.get(Q._mobileGroup)) {
                        if (!visited.has(jumelle)) {
                            visited.add(jumelle);
                            queue.push(jumelle);
                        }
                    }
                }
            }
        }
    }

    // Exclut les pseudo-plateformes mobiles du rapport (ce sont des tremplins
    // virtuels, pas des plateformes "réelles" à valider).
    return plateformes.filter(p => !visited.has(p) && !p._virtuel);
}

// Importe le catalogue et valide chaque salle
const mod = await import('../src/data/salles/_index.js');
const { sallesCompatibles } = mod;

// Récupère TOUTES les salles Ruines (compatibles avec n'importe quelle porte)
// → on génère chaque salle avec ses portesPossibles complètes
const directions = ['N','S','E','O'];
const ids = [// ─── Ruines basses — Phase 9 compact (960×540) ───
             'ruines_atrium_effondre',
             'ruines_couloir_brise','ruines_escaliers_effrites',
             'ruines_arene_pieux','ruines_arene_ressorts',
             'ruines_carrefour_compact',
             'ruines_puits_compact','ruines_cheminee_compact',
             'ruines_coin_NE_compact','ruines_coin_NO_compact',
             'ruines_coin_SE_compact','ruines_coin_SO_compact',
             'ruines_t_NEO_compact','ruines_t_SEO_compact',
             'ruines_t_NSO_compact','ruines_t_NSE_compact',
             'ruines_impasse_O_compact','ruines_impasse_E_compact',
             'ruines_impasse_N_compact','ruines_impasse_S_compact',
             // ─── Phase 9.4 Vague 1 ───
             'ruines_sanctuaire_suspendu',
             // ─── Phase 9.4 Vague 1 : pool diversité (8 NSEO + 3 ciblées) ───
             'ruines_grand_saut','ruines_tour_chute','ruines_champignons',
             'ruines_lames_pendulantes','ruines_ascension_ressort',
             'ruines_corniches_zigzag','ruines_pont_effrite',
             'ruines_voutes_brisees','ruines_tour_garde_alt',
             'ruines_belvedere_pendule','ruines_puits_double',
             // ─── Halls Cendrés (Phase 9.6 — migration compact 960×540) ───
             'halls_couloir_brasiers','halls_grand_mur','halls_cascade_pierres',
             'halls_brasserie','halls_voute_basse','halls_pont_braise',
             'halls_atelier_marteau','halls_couloir_explosif',
             'halls_crypte_effondree','halls_cheminee_braise','halls_puits_cendres',
             'halls_coin_NE','halls_coin_SO','halls_coin_NO','halls_coin_SE',
             'halls_t_NEO','halls_t_SEO','halls_t_NSO','halls_t_NSE',
             'halls_impasse_O','halls_impasse_E','halls_impasse_N','halls_impasse_S',
             'halls_foyer_eteint','halls_reseau_plaques','halls_carrefour_brasier',
             // ─── Phase 9.6 : 11 nouvelles diversité Halls ───
             'halls_arene_braseros','halls_marteau_destructeur',
             'halls_fournaise_centrale','halls_tunnel_cendres',
             'halls_dais_du_marteau','halls_chaine_braseros',
             'halls_fosse_explosive','halls_cendres_eternelles',
             'halls_ascension_NE','halls_descente_SO','halls_double_puits_NS',
             // ─── Phase 9.7 : 5 signatures nouvelles mécaniques ───
             'halls_geyser_central','halls_rideau_acide_couloir',
             'halls_blocs_pousseurs','halls_combo_total','halls_lave_jets',
             // ─── Phase 9.8 : 5 signatures medium-cost ───
             'halls_marteaux_pilons','halls_pistons_thermiques',
             'halls_scies_couloir','halls_forge_meca','halls_arene_chaos'];

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
