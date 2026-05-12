// IdentificationSystem — tracking des effets révélés par l'Identifieur.
//
// Stockage : objet { itemId: [indexEffet1, indexEffet2, ...] } dans le registry.
// Globale par itemId : si tu identifies "Mantra du Vide" et que tu en re-trouves
// un autre, ses effets seront déjà visibles. C'est de la connaissance.
//
// Coûts d'identification :
//   Tier 2 : 5 Sel par effet
//   Tier 3 : 12 Sel par effet
//   ou 1 Encre du Témoin (gratuit en Sel)

const CLE_IDENTIFIES = 'items_identifies';

export const EVT_IDENT_CHANGE = 'ident:change';

export class IdentificationSystem {
    constructor(registry) {
        this.registry = registry;
        if (this.registry.get(CLE_IDENTIFIES) === undefined) {
            this.registry.set(CLE_IDENTIFIES, {});
        }
    }

    /** Liste des indices d'effets révélés pour un itemId */
    getEffetsReveles(itemId) {
        const data = this.registry.get(CLE_IDENTIFIES) ?? {};
        return data[itemId] ?? [];
    }

    /** Marque un effet (par index) comme révélé pour un itemId. */
    revelerEffet(itemId, indexEffet) {
        const data = { ...(this.registry.get(CLE_IDENTIFIES) ?? {}) };
        const liste = data[itemId] ? [...data[itemId]] : [];
        if (!liste.includes(indexEffet)) {
            liste.push(indexEffet);
        }
        data[itemId] = liste;
        this.registry.set(CLE_IDENTIFIES, data);
        this.registry.events.emit(EVT_IDENT_CHANGE, itemId, indexEffet);
    }

    /**
     * Calcule l'état "effectif" des effets d'un item :
     *   { ...effet, visible: bool calculé selon tier + révélations }
     *
     * Phase 5b.2 — si le Vestige Œil Saigné est équipé (flag `revelationTotale`
     * actif via le registre), tous les effets sont rendus visibles. C'est un
     * raccourci puissant qui dispense d'aller chez l'Identifieur.
     */
    effetsEffectifs(item) {
        if (!item || !item.effets) return [];
        const reveles = this.getEffetsReveles(item.id);
        const revelationTotale = this.registry.get('vestige_revelation_totale') === true;
        return item.effets.map((e, i) => {
            if (revelationTotale) return { ...e, visible: true };
            // Tier 1 : tous visibles
            if (item.tier === 1) return { ...e, visible: true };
            // Tier 2 : visible si flag d'origine est true OU effet révélé
            if (item.tier === 2) {
                const v = (e.visible === true) || reveles.includes(i);
                return { ...e, visible: v };
            }
            // Tier 3 : caché par défaut, visible UNIQUEMENT si révélé
            return { ...e, visible: reveles.includes(i) };
        });
    }

    /** Combien d'effets cachés restent à révéler */
    nbEffetsCaches(item) {
        return this.effetsEffectifs(item).filter(e => !e.visible).length;
    }

    /** Index du premier effet caché (-1 si aucun) */
    premierEffetCache(item) {
        return this.effetsEffectifs(item).findIndex(e => !e.visible);
    }

    /** Coût en Sel pour révéler un effet selon le tier de l'item */
    coutEnSelPour(item) {
        if (!item) return 0;
        if (item.tier === 2) return 5;
        if (item.tier === 3) return 12;
        return 0;
    }

    /**
     * Tier "effectif" de l'item : si tous les effets sont devenus visibles,
     * l'item monte de Tier 3 → 2 → 1.
     */
    tierEffectif(item) {
        if (!item) return null;
        const cache = this.nbEffetsCaches(item);
        if (cache === 0) return 1; // tout visible = Tier 1 effectif
        if (item.tier === 3) return 3;
        return 2;
    }
}
