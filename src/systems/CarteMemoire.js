// CarteMemoire — persistance des salles visitées entre runs (Phase 4).
//
// Doctrine : "le Vestige se souvient". Dès qu'une salle est visitée une fois
// (même dans un run abandonné), elle reste révélée sur la carte pour tous les
// runs suivants. Récompense l'exploration et signale au joueur les zones où
// il a déjà mis les pieds, étage par étage.
//
// Stockage : localStorage, clé `vestige_carte_v1`.
// Format JSON : { "<etageNumero>": ["A", "B", "B-haut", ...] }
//
// Robustesse : try/catch autour de toutes les ops localStorage (privacy mode,
// quota, mode incognito → on dégrade silencieusement en mémoire vive).

const CLE_STORAGE = 'vestige_carte_v1';

// Cache en mémoire (autoritaire en cas d'échec localStorage)
let cache = null;

function chargerDepuisStorage() {
    if (cache !== null) return cache;
    try {
        const raw = localStorage.getItem(CLE_STORAGE);
        cache = raw ? JSON.parse(raw) : {};
    } catch (_e) {
        cache = {};
    }
    return cache;
}

function sauvegarderVersStorage() {
    if (!cache) return;
    try {
        localStorage.setItem(CLE_STORAGE, JSON.stringify(cache));
    } catch (_e) {
        // Quota / privacy mode : on continue en mémoire vive
    }
}

/**
 * Renvoie les IDs de salles déjà visitées pour cet étage, à tous les runs
 * confondus. Tableau (ordre non garanti). Vide si jamais visité.
 */
export function sallesVisiteesPersistantes(etageNumero) {
    const data = chargerDepuisStorage();
    return Array.isArray(data[etageNumero]) ? [...data[etageNumero]] : [];
}

/**
 * Marque une salle comme visitée durablement.
 */
export function marquerSalleVisiteePersistant(etageNumero, salleId) {
    const data = chargerDepuisStorage();
    if (!Array.isArray(data[etageNumero])) data[etageNumero] = [];
    if (!data[etageNumero].includes(salleId)) {
        data[etageNumero].push(salleId);
        sauvegarderVersStorage();
    }
}

/**
 * Efface toute la mémoire de carte (debug / reset complet).
 */
export function resetCarteMemoire() {
    cache = {};
    try { localStorage.removeItem(CLE_STORAGE); } catch (_e) { /* */ }
}
