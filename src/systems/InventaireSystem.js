// Inventaire et équipement — état dans le registry (survit aux scene.restart).
//
// Modèle :
//   inventaire   : Array<itemId>          — taille variable, plafonnée à CAPACITE
//   equipement   : { tete, corps, accessoire } — chaque slot contient un itemId ou null
//   coffres_vus  : Set<string>            — clé "monde:indexSalle" → coffre déjà ouvert
//   drops_pris   : Set<string>            — idem pour les drops orphelins au sol
//
// Un item équipé n'EST PAS dans l'inventaire (il en est sorti). On peut le
// déséquiper, il revient dans l'inventaire (si place).
//
// Tous les changements émettent des events sur le registry pour que UIScene
// et InventaireScene se redessinent automatiquement.

export const CAPACITE_INVENTAIRE = 40;

export const SLOTS = ['tete', 'corps', 'accessoire'];

const CLE_INVENTAIRE = 'inventaire';
const CLE_EQUIPEMENT = 'equipement';
const CLE_COFFRES_VUS = 'coffres_vus';
const CLE_DROPS_PRIS = 'drops_pris';

export const EVT_INV_CHANGE = 'inventaire:change';
export const EVT_EQUIP_CHANGE = 'equipement:change';

export class InventaireSystem {
    constructor(registry) {
        this.registry = registry;

        if (this.registry.get(CLE_INVENTAIRE) === undefined) {
            this.registry.set(CLE_INVENTAIRE, []);
        }
        if (this.registry.get(CLE_EQUIPEMENT) === undefined) {
            this.registry.set(CLE_EQUIPEMENT, { tete: null, corps: null, accessoire: null });
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
}
