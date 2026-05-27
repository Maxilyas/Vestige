// NarrativeSystem — gestion des monolithes Vestige (lore + drop bonus).
//
// Une zone `vestige_lore` posée dans une salle handcrafted devient un point
// d'intérêt narratif. Le joueur s'en approche + appui E → popup texte +
// drop Fragment Noir à la 1ère lecture SEULEMENT (persistance localStorage).
//
// Cycle de vie :
//   • GameScene.create() crée le système + appelle initSalle(salle.zones)
//   • À chaque appui E (essayerInteragir), GameScene demande monolitheProche()
//   • Si monolithe trouvé, GameScene déclenche : marquerLu() puis launch
//     PopupLoreScene avec { loreId, premiereLecture }
//
// Persistance : Set des loreId lus, sérialisé en JSON dans localStorage sous
// la clé `vestige_lore_lus_v1`. La progression survit aux runs et aux deaths.

const STORAGE_KEY = 'vestige_lore_lus_v1';
const DIST_INTERACTION = 50;   // px : distance joueur ↔ centre monolithe

export class NarrativeSystem {
    /**
     * @param {Phaser.Scene} scene
     * @param {object} economy - instance EconomySystem (pour drop Fragment Noir)
     */
    constructor(scene, economy) {
        this.scene = scene;
        this.economy = economy;
        this.lus = this._chargerLus();
        this.zones = [];          // zones vestige_lore de la salle courante
    }

    /**
     * Initialise les zones narratives pour la salle courante.
     * À appeler après chaque transition de salle.
     */
    initSalle(zonesSalle = []) {
        this.zones = zonesSalle.filter(z => z?.type === 'vestige_lore');
    }

    /** True si ce loreId a déjà été lu (across-run persistant). */
    estLu(loreId) {
        return this.lus.has(loreId);
    }

    /**
     * Cherche un monolithe à portée d'interaction du joueur.
     * @returns {object|null} zone vestige_lore la plus proche, ou null.
     */
    monolitheProche(px, py) {
        for (const z of this.zones) {
            const dx = Math.abs(px - z.x);
            const dy = Math.abs(py - z.y);
            // Boîte d'interaction = boîte du monolithe + marge DIST_INTERACTION
            if (dx < z.largeur / 2 + DIST_INTERACTION &&
                dy < z.hauteur / 2 + DIST_INTERACTION) {
                return z;
            }
        }
        return null;
    }

    /**
     * Marque le lore comme lu ET déclenche le drop bonus si 1ère lecture.
     * @returns {boolean} true si c'était la 1ère lecture (= drop a été fait).
     */
    marquerLu(loreId) {
        if (this.lus.has(loreId)) return false;
        this.lus.add(loreId);
        this._sauverLus();
        // Bonus 1ère lecture : 1 Fragment Noir
        this.economy?.ajouterFragment?.('noir', 1);
        return true;
    }

    _chargerLus() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return new Set();
            const arr = JSON.parse(raw);
            return new Set(Array.isArray(arr) ? arr : []);
        } catch {
            return new Set();
        }
    }

    _sauverLus() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.lus]));
        } catch {
            // Quotas dépassés ou storage indispo : on continue, l'état mémoire
            // tient le run en cours. Le drop bonus a déjà eu lieu en mémoire.
        }
    }
}
