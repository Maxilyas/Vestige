// FondeurSystem — logique pure de la forge. Aucun visuel.
// Vérifie les conditions, tire le résultat, consomme les ressources.

import { tirerResultat, coutEnSel } from '../data/recettes.js';

export class FondeurSystem {
    constructor(economy, inventaire) {
        this.economy = economy;
        this.inventaire = inventaire;
    }

    /**
     * Tente de forger. Atomique : si une condition échoue, rien n'est consommé.
     * @param {string[]} fragments  ex ['blanc', 'bleu']
     * @param {() => number} rng    PRNG pour tirer le résultat
     * @returns {{ success: boolean, itemId?: string, raison?: string }}
     */
    forger(fragments, rng) {
        if (!fragments || fragments.length === 0) {
            return { success: false, raison: 'aucun_fragment' };
        }
        if (fragments.length > 3) {
            return { success: false, raison: 'trop_de_fragments' };
        }
        if (this.inventaire.estPlein()) {
            return { success: false, raison: 'inventaire_plein' };
        }

        // Compte les fragments demandés par famille (lot atomique)
        const lot = { blanc: 0, bleu: 0, noir: 0 };
        for (const f of fragments) {
            if (lot[f] === undefined) {
                return { success: false, raison: 'famille_invalide' };
            }
            lot[f]++;
        }

        const cout = coutEnSel(fragments.length);
        if (!this.economy.peutPayer(cout)) {
            return { success: false, raison: 'sel_insuffisant' };
        }

        // Tire le résultat AVANT de consommer (pour ne rien perdre si la recette
        // n'est pas définie — mais en pratique toutes nos clés sont couvertes)
        const itemId = tirerResultat(fragments, rng);
        if (!itemId) {
            return { success: false, raison: 'recette_inconnue' };
        }

        // Consomme atomiquement les Fragments puis le Sel
        if (!this.economy.retirerLot(lot)) {
            return { success: false, raison: 'fragments_manquants' };
        }
        this.economy.retirerSel(cout);

        // Ajoute l'item à l'inventaire (déjà vérifié non plein, mais double-check)
        if (!this.inventaire.ajouter(itemId)) {
            // Cas de course : on a consommé les ressources et l'inventaire est plein.
            // On rend les Fragments + Sel pour ne pas léser le joueur.
            for (const fam of ['blanc', 'bleu', 'noir']) {
                if (lot[fam]) this.economy.ajouterFragment(fam, lot[fam]);
            }
            this.economy.ajouterSel(cout);
            return { success: false, raison: 'inventaire_plein' };
        }

        return { success: true, itemId };
    }
}
