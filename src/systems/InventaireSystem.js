// Inventaire et équipement — état dans le registry (survit aux scene.restart).
//
// Modèle :
//   inventaire   : Array<itemId>          — taille variable, plafonnée à CAPACITE
//   equipement   : { tete, corps, accessoire } — chaque slot contient un itemId ou null
//   vestiges     : { geste, maitrise1, maitrise2 } — 3 slots Vestige (Phase 5b)
//   coffres_vus  : Set<string>            — clé "monde:indexSalle" → coffre déjà ouvert
//   drops_pris   : Set<string>            — idem pour les drops orphelins au sol
//
// Un item équipé n'EST PAS dans l'inventaire (il en est sorti). On peut le
// déséquiper, il revient dans l'inventaire (si place).
//
// Tous les changements émettent des events sur le registry pour que UIScene
// et InventaireScene se redessinent automatiquement.

import { VESTIGES } from '../data/vestiges.js';

export const CAPACITE_INVENTAIRE = 40;

export const SLOTS = ['tete', 'corps', 'accessoire'];

// Slots Vestige (Phase 5b) : 1 Geste (touche V) + 2 Maîtrises (passifs).
// `trophee` accepté dans n'importe quel slot.
export const SLOTS_VESTIGE = ['geste', 'maitrise1', 'maitrise2'];

const CLE_INVENTAIRE = 'inventaire';
const CLE_EQUIPEMENT = 'equipement';
const CLE_VESTIGES_EQUIPES = 'vestiges_equipes';
const CLE_COFFRES_VUS = 'coffres_vus';
const CLE_DROPS_PRIS = 'drops_pris';

export const EVT_INV_CHANGE = 'inventaire:change';
export const EVT_EQUIP_CHANGE = 'equipement:change';
export const EVT_VESTIGES_CHANGE = 'vestiges:change';

export class InventaireSystem {
    constructor(registry) {
        this.registry = registry;

        if (this.registry.get(CLE_INVENTAIRE) === undefined) {
            this.registry.set(CLE_INVENTAIRE, []);
        }
        if (this.registry.get(CLE_EQUIPEMENT) === undefined) {
            this.registry.set(CLE_EQUIPEMENT, { tete: null, corps: null, accessoire: null });
        }
        if (this.registry.get(CLE_VESTIGES_EQUIPES) === undefined) {
            this.registry.set(CLE_VESTIGES_EQUIPES, { geste: null, maitrise1: null, maitrise2: null });
        }
        if (this.registry.get(CLE_COFFRES_VUS) === undefined) {
            this.registry.set(CLE_COFFRES_VUS, []); // serialisable, pas Set
        }
        if (this.registry.get(CLE_DROPS_PRIS) === undefined) {
            this.registry.set(CLE_DROPS_PRIS, []);
        }
    }

    // ----- Inventaire -----
    getInventaire() {
        return this.registry.get(CLE_INVENTAIRE);
    }

    estPlein() {
        return this.getInventaire().length >= CAPACITE_INVENTAIRE;
    }

    /**
     * Tente d'ajouter un item à l'inventaire. Retourne true si ajouté.
     */
    ajouter(itemId) {
        const inv = [...this.getInventaire()];
        if (inv.length >= CAPACITE_INVENTAIRE) return false;
        inv.push(itemId);
        this.registry.set(CLE_INVENTAIRE, inv);
        this.registry.events.emit(EVT_INV_CHANGE);
        return true;
    }

    /**
     * Retire l'item à l'index donné. Retourne l'itemId retiré, ou null.
     */
    retirerIndex(index) {
        const inv = [...this.getInventaire()];
        if (index < 0 || index >= inv.length) return null;
        const [retire] = inv.splice(index, 1);
        this.registry.set(CLE_INVENTAIRE, inv);
        this.registry.events.emit(EVT_INV_CHANGE);
        return retire;
    }

    // ----- Équipement -----
    getEquipement() {
        return this.registry.get(CLE_EQUIPEMENT);
    }

    /**
     * Équipe l'item à l'index donné (issu de l'inventaire). L'ancien item
     * du slot revient dans l'inventaire à la place. Retourne true si OK.
     */
    equiperDepuisInventaire(index, itemDef) {
        if (!itemDef || !SLOTS.includes(itemDef.slot)) return false;
        const inv = [...this.getInventaire()];
        if (index < 0 || index >= inv.length) return false;

        const equip = { ...this.getEquipement() };
        const slot = itemDef.slot;
        const ancienId = equip[slot];

        // L'item équipé sort de l'inventaire à son index, l'ancien y prend sa place
        // (s'il y avait quelque chose), sinon le slot d'inventaire est juste retiré.
        inv.splice(index, 1);
        equip[slot] = itemDef.id;
        if (ancienId) {
            inv.splice(index, 0, ancienId);
        }

        this.registry.set(CLE_INVENTAIRE, inv);
        this.registry.set(CLE_EQUIPEMENT, equip);
        this.registry.events.emit(EVT_INV_CHANGE);
        this.registry.events.emit(EVT_EQUIP_CHANGE);
        return true;
    }

    /**
     * Déséquipe le slot. L'item retourne dans l'inventaire (si place).
     * Si l'inventaire est plein, échec.
     */
    desequiper(slot) {
        const equip = { ...this.getEquipement() };
        if (!equip[slot]) return false;
        if (this.estPlein()) return false;

        const inv = [...this.getInventaire(), equip[slot]];
        equip[slot] = null;

        this.registry.set(CLE_INVENTAIRE, inv);
        this.registry.set(CLE_EQUIPEMENT, equip);
        this.registry.events.emit(EVT_INV_CHANGE);
        this.registry.events.emit(EVT_EQUIP_CHANGE);
        return true;
    }

    /**
     * Jette définitivement l'item à l'index donné.
     */
    jeter(index) {
        return this.retirerIndex(index) !== null;
    }

    // ============================================================
    // Vestiges (Phase 5b)
    // ============================================================
    getVestiges() {
        return this.registry.get(CLE_VESTIGES_EQUIPES);
    }

    /**
     * Renvoie l'array des Vestiges (def) actuellement équipés, ordre :
     * [geste, maitrise1, maitrise2]. Les slots vides retournent null.
     */
    getVestigesDefs() {
        const v = this.getVestiges();
        return [
            v.geste ? VESTIGES[v.geste] : null,
            v.maitrise1 ? VESTIGES[v.maitrise1] : null,
            v.maitrise2 ? VESTIGES[v.maitrise2] : null
        ];
    }

    /**
     * Slot dans lequel un Vestige peut être équipé selon son sousType :
     *   - 'geste'   → 'geste'
     *   - 'maitrise' / 'trophee' → 1er slot maîtrise libre, sinon 'maitrise1'
     */
    _slotPourVestige(vestige) {
        if (!vestige) return null;
        const v = this.getVestiges();
        if (vestige.sousType === 'geste') return 'geste';
        if (vestige.sousType === 'trophee') {
            // Trophée → priorité Geste si libre, sinon maîtrise libre
            if (!v.geste) return 'geste';
        }
        // Maîtrise (et fallback trophée) : 1er slot libre, sinon 'maitrise1'
        if (!v.maitrise1) return 'maitrise1';
        if (!v.maitrise2) return 'maitrise2';
        return 'maitrise1';
    }

    /**
     * Équipe un Vestige depuis l'inventaire à l'index donné. L'ancien Vestige
     * du slot retourne dans l'inventaire (à la place du nouveau). Retourne
     * true si OK.
     *
     * @param {number} index   index dans l'inventaire
     * @param {object} vestige  def du Vestige
     * @param {string} [slotForce]  Si fourni, force le slot cible
     *   ('geste'/'maitrise1'/'maitrise2'). Validation: doit être compatible
     *   avec le sousType (Geste → 'geste' uniquement, Maîtrise → 'maitriseN'
     *   uniquement, Trophée → n'importe lequel).
     */
    equiperVestigeDepuisInventaire(index, vestige, slotForce = null) {
        if (!vestige || vestige.categorie !== 'vestige') return false;
        const inv = [...this.getInventaire()];
        if (index < 0 || index >= inv.length) return false;
        if (inv[index] !== vestige.id) return false;

        const v = { ...this.getVestiges() };
        let slot;
        if (slotForce) {
            // Validation slotForce : compat avec sousType
            const okGeste = slotForce === 'geste' && (vestige.sousType === 'geste' || vestige.sousType === 'trophee');
            const okMaitrise = (slotForce === 'maitrise1' || slotForce === 'maitrise2') &&
                                (vestige.sousType === 'maitrise' || vestige.sousType === 'trophee');
            if (!okGeste && !okMaitrise) return false;
            slot = slotForce;
        } else {
            slot = this._slotPourVestige(vestige);
        }
        if (!slot) return false;

        const ancienId = v[slot];
        inv.splice(index, 1);
        v[slot] = vestige.id;
        if (ancienId) inv.splice(index, 0, ancienId);

        this.registry.set(CLE_INVENTAIRE, inv);
        this.registry.set(CLE_VESTIGES_EQUIPES, v);
        this.registry.events.emit(EVT_INV_CHANGE);
        this.registry.events.emit(EVT_VESTIGES_CHANGE);
        return true;
    }

    /**
     * Déséquipe le Vestige du slot donné. Retourne dans l'inventaire. Échec
     * si inventaire plein.
     */
    desequiperVestige(slot) {
        const v = { ...this.getVestiges() };
        if (!v[slot]) return false;
        if (this.estPlein()) return false;

        const inv = [...this.getInventaire(), v[slot]];
        v[slot] = null;

        this.registry.set(CLE_INVENTAIRE, inv);
        this.registry.set(CLE_VESTIGES_EQUIPES, v);
        this.registry.events.emit(EVT_INV_CHANGE);
        this.registry.events.emit(EVT_VESTIGES_CHANGE);
        return true;
    }

    /**
     * Vrai si le Vestige est soit en inventaire, soit équipé. Utilisé pour
     * éviter les doublons : si déjà possédé, le boss ne re-drop pas.
     */
    possedeVestige(vestigeId) {
        if (this.getInventaire().includes(vestigeId)) return true;
        const v = this.getVestiges();
        return v.geste === vestigeId || v.maitrise1 === vestigeId || v.maitrise2 === vestigeId;
    }

    /** Renvoie true si au moins un Vestige équipé porte le flag donné. */
    aVestigeFlag(flag) {
        return this.getVestigesDefs().some(d => d?.flags?.[flag] === true);
    }

    // ----- État des coffres / drops -----
    _cleSalle(monde, indexSalle) {
        return `${monde}:${indexSalle}`;
    }

    coffreEstOuvert(monde, indexSalle) {
        return this.registry.get(CLE_COFFRES_VUS).includes(this._cleSalle(monde, indexSalle));
    }

    marquerCoffreOuvert(monde, indexSalle) {
        const cle = this._cleSalle(monde, indexSalle);
        const liste = this.registry.get(CLE_COFFRES_VUS);
        if (!liste.includes(cle)) {
            this.registry.set(CLE_COFFRES_VUS, [...liste, cle]);
        }
    }

    dropEstRamasse(monde, indexSalle) {
        return this.registry.get(CLE_DROPS_PRIS).includes(this._cleSalle(monde, indexSalle));
    }

    marquerDropRamasse(monde, indexSalle) {
        const cle = this._cleSalle(monde, indexSalle);
        const liste = this.registry.get(CLE_DROPS_PRIS);
        if (!liste.includes(cle)) {
            this.registry.set(CLE_DROPS_PRIS, [...liste, cle]);
        }
    }

    /**
     * Reset les flags coffres+drops d'un étage entier (tous mondes confondus).
     * Utilisé au retour Miroir → Présent : "try again" → tout réapparaît.
     * Les clés ont la forme "monde:e<numero>:<salleId>", on filtre par `:e<numero>:`.
     */
    resetEtage(etageNumero) {
        const motif = `:e${etageNumero}:`;
        const coffres = this.registry.get(CLE_COFFRES_VUS) ?? [];
        const drops = this.registry.get(CLE_DROPS_PRIS) ?? [];
        this.registry.set(CLE_COFFRES_VUS, coffres.filter(k => !k.includes(motif)));
        this.registry.set(CLE_DROPS_PRIS, drops.filter(k => !k.includes(motif)));
    }
}
