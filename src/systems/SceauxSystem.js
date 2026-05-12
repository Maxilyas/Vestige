// SceauxSystem — persistance des étages dont le boss a été vaincu (Phase 5a).
//
// Doctrine : chaque boss vaincu laisse une trace permanente. 10 sceaux à
// collecter (1 par étage). Le 10ᵉ déclenchera l'écran de fin (Phase 5c).
//
// Stockage : localStorage, clé `vestige_sceaux_v1`.
// Format JSON : { obtenus: [1, 3, 7] }  (tableau d'étages, ordre non garanti)
//
// Robustesse : try/catch sur toutes les ops (privacy mode → fallback mémoire).

const CLE_STORAGE = 'vestige_sceaux_v1';

/** Event émis sur le registry quand un sceau est NOUVELLEMENT obtenu (anim). */
export const EVT_SCEAU_OBTENU = 'sceau:obtenu';

let cache = null;

function charger() {
    if (cache !== null) return cache;
    try {
        const raw = localStorage.getItem(CLE_STORAGE);
        cache = raw ? JSON.parse(raw) : { obtenus: [] };
    } catch (_e) {
        cache = { obtenus: [] };
    }
    if (!Array.isArray(cache.obtenus)) cache.obtenus = [];
    return cache;
}

function sauvegarder() {
    if (!cache) return;
    try {
        localStorage.setItem(CLE_STORAGE, JSON.stringify(cache));
    } catch (_e) { /* privacy/quota — fallback mémoire vive */ }
}

/** Renvoie la liste (triée) des numéros d'étage dont le sceau est obtenu. */
export function sceauxObtenus() {
    const data = charger();
    return [...data.obtenus].sort((a, b) => a - b);
}

/** Vrai si le sceau de cet étage a déjà été obtenu. */
export function sceauObtenu(etageNumero) {
    return charger().obtenus.includes(etageNumero);
}

/**
 * Marque le sceau de cet étage comme obtenu. Retourne vrai si c'est NOUVEAU
 * (donc s'il faut déclencher l'anim + sons + check fin), faux si déjà acquis.
 */
export function marquerSceau(etageNumero) {
    const data = charger();
    if (data.obtenus.includes(etageNumero)) return false;
    data.obtenus.push(etageNumero);
    sauvegarder();
    return true;
}

/** Compte de sceaux obtenus. Utile pour la condition de fin (==10). */
export function nbSceauxObtenus() {
    return charger().obtenus.length;
}

/** Reset complet (debug). */
export function resetSceaux() {
    cache = { obtenus: [] };
    try { localStorage.removeItem(CLE_STORAGE); } catch (_e) { /* */ }
}
