// MarchandSystem — logique pure du Marchand (la Glaneuse).
//
// Trois actions atomiques :
//   - acheter(itemId)            : retire le Sel, ajoute l'item à l'inventaire
//   - vendre(indexInventaire)    : retire l'item de l'inventaire, ajoute du Sel
//   - fragmenter(indexInventaire): retire l'item, ajoute des Fragments de la
//                                  famille (qté = tier ; T3 ★ a 10 % chance de
//                                  donner 1 Fragment Noir bonus en plus)
//
// Aucune logique visuelle ici. La vitrine est générée par genererVitrine()
// avec un PRNG seedé sur (run_seed + indexSalle), passé depuis GameScene.

import { ITEMS, COULEURS_FAMILLE } from '../data/items.js';
import { tirerItem } from './LootSystem.js';

// Prix d'achat en Sel selon le tier d'un item
export const PRIX_ACHAT = { 1: 8, 2: 20, 3: 50 };

// Le rachat est une fraction du prix d'achat (la Glaneuse vit de la marge)
export const COEF_RACHAT = 0.30;

// Quantité de Fragments rendus selon le tier
export const FRAG_PAR_TIER = { 1: 1, 2: 2, 3: 3 };

// Probabilité d'un Fragment Noir bonus à la fragmentation d'un Tier 3
export const PROBA_BONUS_NOIR_T3 = 0.10;

// Taille de la vitrine
export const TAILLE_VITRINE = 4;

/**
 * Génère une vitrine seedée. Tirée selon les proba Miroir (puisque la Glaneuse
 * spawn en Miroir). Le résultat est une liste d'itemIds (peuvent contenir des
 * doublons — c'est cohérent : un même objet peut traîner deux fois sur le tapis).
 */
export function genererVitrine(rng, taille = TAILLE_VITRINE) {
    const items = [];
    for (let i = 0; i < taille; i++) {
        const item = tirerItem('miroir', rng);
        if (item) items.push(item.id);
    }
    return items;
}

export function prixAchat(item) {
    if (!item) return 0;
    return PRIX_ACHAT[item.tier] ?? 0;
}

export function prixRachat(item) {
    return Math.max(1, Math.floor(prixAchat(item) * COEF_RACHAT));
}

export function fragmentsRendus(item) {
    if (!item) return 0;
    return FRAG_PAR_TIER[item.tier] ?? 0;
}

export class MarchandSystem {
    constructor(economy, inventaire) {
        this.economy = economy;
        this.inventaire = inventaire;
    }

    /**
     * Achat d'un item de la vitrine. Atomique.
     * @returns {{ success, raison?, itemId? }}
     */
    acheter(itemId) {
        const item = ITEMS[itemId];
        if (!item) return { success: false, raison: 'item_inconnu' };
        if (this.inventaire.estPlein()) return { success: false, raison: 'inventaire_plein' };

        const cout = prixAchat(item);
        if (!this.economy.peutPayer(cout)) return { success: false, raison: 'sel_insuffisant' };

        if (!this.inventaire.ajouter(itemId)) {
            return { success: false, raison: 'inventaire_plein' };
        }
        if (!this.economy.retirerSel(cout)) {
            // Cas de course : on rembobine l'inventaire
            const inv = this.inventaire.getInventaire();
            this.inventaire.retirerIndex(inv.length - 1);
            return { success: false, raison: 'sel_insuffisant' };
        }
        return { success: true, itemId };
    }

    /**
     * Rachat : la Glaneuse rachète un item de l'inventaire.
     */
    vendre(indexInventaire) {
        const inv = this.inventaire.getInventaire();
        if (indexInventaire < 0 || indexInventaire >= inv.length) {
            return { success: false, raison: 'index_invalide' };
        }
        const itemId = inv[indexInventaire];
        const item = ITEMS[itemId];
        if (!item) return { success: false, raison: 'item_inconnu' };

        const gain = prixRachat(item);
        const retire = this.inventaire.retirerIndex(indexInventaire);
        if (!retire) return { success: false, raison: 'retrait_echec' };
        this.economy.ajouterSel(gain);
        return { success: true, itemId, gain };
    }

    /**
     * Fragmentation : retire l'item, rend des Fragments.
     * Tier 3 : 10 % chance d'un Fragment Noir bonus (Reflux), peu importe la
     * famille d'origine. Petit easter egg lore.
     */
    fragmenter(indexInventaire, rng) {
        const inv = this.inventaire.getInventaire();
        if (indexInventaire < 0 || indexInventaire >= inv.length) {
            return { success: false, raison: 'index_invalide' };
        }
        const itemId = inv[indexInventaire];
        const item = ITEMS[itemId];
        if (!item) return { success: false, raison: 'item_inconnu' };

        const qte = fragmentsRendus(item);
        const famille = item.famille;

        // Bonus Reflux ?
        const r = (rng ?? Math.random)();
        const bonusNoir = (item.tier === 3) && (r < PROBA_BONUS_NOIR_T3);

        const retire = this.inventaire.retirerIndex(indexInventaire);
        if (!retire) return { success: false, raison: 'retrait_echec' };

        if (qte > 0) this.economy.ajouterFragment(famille, qte);
        if (bonusNoir) this.economy.ajouterFragment('noir', 1);

        return {
            success: true,
            itemId,
            famille,
            quantite: qte,
            bonusNoir
        };
    }
}
