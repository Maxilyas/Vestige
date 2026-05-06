// EconomySystem — gestion du Sel de Résonance (monnaie) et des Fragments
// (matière première). Les deux sont stockés comme COMPTEURS dans le registry
// Phaser pour persister entre les transitions de salle / basculements.
//
// Pourquoi pas dans l'inventaire 40 slots ? Parce qu'un joueur peut accumuler
// 30+ Fragments sans gêne, et qu'un compteur est plus pratique qu'un slot.

import { FAMILLES_FRAGMENT } from '../data/fragments.js';

const CLE_SEL = 'sel_resonance';
const CLE_FRAGMENTS = 'fragments'; // objet { blanc: N, bleu: N, noir: N }

export const EVT_SEL_CHANGE = 'eco:sel:change';
export const EVT_FRAGMENTS_CHANGE = 'eco:fragments:change';

export class EconomySystem {
    constructor(registry) {
        this.registry = registry;

        if (this.registry.get(CLE_SEL) === undefined) {
            this.registry.set(CLE_SEL, 0);
        }
        if (this.registry.get(CLE_FRAGMENTS) === undefined) {
            this.registry.set(CLE_FRAGMENTS, { blanc: 0, bleu: 0, noir: 0 });
        }
    }

    // ----- Sel -----
    getSel() {
        return this.registry.get(CLE_SEL) ?? 0;
    }

    ajouterSel(montant) {
        if (montant <= 0) return;
        const v = this.getSel() + montant;
        this.registry.set(CLE_SEL, v);
        this.registry.events.emit(EVT_SEL_CHANGE, v, montant);
    }

    /**
     * Tente de retirer `montant` Sel. Renvoie true si réussi, false sinon.
     */
    retirerSel(montant) {
        if (montant <= 0) return true;
        const courant = this.getSel();
        if (courant < montant) return false;
        const v = courant - montant;
        this.registry.set(CLE_SEL, v);
        this.registry.events.emit(EVT_SEL_CHANGE, v, -montant);
        return true;
    }

    peutPayer(montant) {
        return this.getSel() >= montant;
    }

    // ----- Fragments -----
    getFragments() {
        return { ...this.registry.get(CLE_FRAGMENTS) };
    }

    getFragment(famille) {
        if (!FAMILLES_FRAGMENT.includes(famille)) return 0;
        return this.registry.get(CLE_FRAGMENTS)?.[famille] ?? 0;
    }

    ajouterFragment(famille, n = 1) {
        if (!FAMILLES_FRAGMENT.includes(famille) || n <= 0) return;
        const courant = this.getFragments();
        courant[famille] = (courant[famille] ?? 0) + n;
        this.registry.set(CLE_FRAGMENTS, courant);
        this.registry.events.emit(EVT_FRAGMENTS_CHANGE, courant);
    }

    /**
     * Tente de retirer `n` fragments d'une famille. Renvoie true si réussi.
     */
    retirerFragment(famille, n = 1) {
        if (!FAMILLES_FRAGMENT.includes(famille) || n <= 0) return true;
        const courant = this.getFragments();
        if ((courant[famille] ?? 0) < n) return false;
        courant[famille] -= n;
        this.registry.set(CLE_FRAGMENTS, courant);
        this.registry.events.emit(EVT_FRAGMENTS_CHANGE, courant);
        return true;
    }

    /**
     * Tente de retirer un lot de fragments. La requête est atomique :
     * si un seul des fragments manque, rien n'est retiré.
     * @param {Object} lot { blanc?: number, bleu?: number, noir?: number }
     */
    retirerLot(lot) {
        const courant = this.getFragments();
        for (const fam of FAMILLES_FRAGMENT) {
            if ((lot[fam] ?? 0) > (courant[fam] ?? 0)) return false;
        }
        for (const fam of FAMILLES_FRAGMENT) {
            courant[fam] = (courant[fam] ?? 0) - (lot[fam] ?? 0);
        }
        this.registry.set(CLE_FRAGMENTS, courant);
        this.registry.events.emit(EVT_FRAGMENTS_CHANGE, courant);
        return true;
    }
}
