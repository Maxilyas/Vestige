// MarchandSystem — logique pure du Marchand (la Glaneuse). Phase 6 : opère sur
// les INSTANCES forgées (pas de legacy).
//
// Trois actions atomiques :
//   - acheter(indexVitrine)         : retire le Sel, ajoute l'instance à l'inventaire
//   - vendre(indexInventaire)       : retire l'instance, ajoute du Sel
//   - fragmenter(indexInventaire)   : retire l'instance, rend des Fragments
//                                     (qté proportionnelle au score, famille du template)
//
// Le prix d'achat et de rachat est calculé depuis le SCORE de l'instance.
// La vitrine est générée par genererVitrine() avec un PRNG seedé.

import { tirerItem } from './LootSystem.js';
import { estInstance, tierPourScore } from './ScoreSystem.js';
import { TEMPLATES } from '../data/templatesItems.js';

export const TAILLE_VITRINE = 4;
export const COEF_RACHAT = 0.30;
export const PROBA_BONUS_NOIR = 0.10; // chance d'un Fragment Noir bonus en fragmentation (>=70)

/**
 * Prix d'achat en Sel selon le score d'une instance (courbe douce, plus chère
 * sur les hauts scores). 15-700 Sel.
 */
export function prixAchat(instance) {
    if (!estInstance(instance)) return 0;
    const s = instance.score;
    // Quadratique modéré : score 30 → 18, 50 → 40, 70 → 90, 85 → 175, 95 → 350, 100 → 700
    return Math.max(8, Math.round(8 + Math.pow(s / 10, 2.4)));
}

export function prixRachat(instance) {
    return Math.max(1, Math.floor(prixAchat(instance) * COEF_RACHAT));
}

/**
 * Fragments rendus à la fragmentation : 1-4 selon le score.
 */
export function fragmentsRendus(instance) {
    if (!estInstance(instance)) return 0;
    const s = instance.score;
    if (s >= 85) return 4;
    if (s >= 70) return 3;
    if (s >= 50) return 2;
    return 1;
}

/**
 * Génère une vitrine de N instances seedées. Les scores sont skewed pour avoir
 * un mix : 1 brisé/commun, 2 étoilés/spectraux, 1 rare spectral+.
 */
export function genererVitrine(rng, taille = TAILLE_VITRINE) {
    const instances = [];
    const profilsScore = [40, 55, 65, 75]; // 4 paliers de base
    for (let i = 0; i < taille; i++) {
        const sBase = profilsScore[i % profilsScore.length] + Math.round((rng() - 0.5) * 12);
        const inst = tirerItem('miroir', rng, { contexte: 'forge', scoreBase: sBase });
        if (inst) instances.push(inst);
    }
    return instances;
}

export class MarchandSystem {
    constructor(economy, inventaire) {
        this.economy = economy;
        this.inventaire = inventaire;
    }

    /**
     * Achat d'une instance de la vitrine (par référence directe).
     * Retire l'instance de la vitrine côté caller (la scene gère son état).
     */
    acheter(instance) {
        if (!estInstance(instance)) return { success: false, raison: 'instance_invalide' };
        if (this.inventaire.estPlein()) return { success: false, raison: 'inventaire_plein' };
        const cout = prixAchat(instance);
        if (!this.economy.peutPayer(cout)) return { success: false, raison: 'sel_insuffisant' };

        if (!this.inventaire.ajouter(instance)) return { success: false, raison: 'inventaire_plein' };
        if (!this.economy.retirerSel(cout)) {
            const inv = this.inventaire.getInventaire();
            this.inventaire.retirerIndex(inv.length - 1);
            return { success: false, raison: 'sel_insuffisant' };
        }
        return { success: true, instance };
    }

    /** Rachat d'une instance de l'inventaire. */
    vendre(indexInventaire) {
        const inv = this.inventaire.getInventaire();
        if (indexInventaire < 0 || indexInventaire >= inv.length) {
            return { success: false, raison: 'index_invalide' };
        }
        const inst = inv[indexInventaire];
        if (!estInstance(inst)) return { success: false, raison: 'pas_une_instance' };

        const gain = prixRachat(inst);
        const retire = this.inventaire.retirerIndex(indexInventaire);
        if (!retire) return { success: false, raison: 'retrait_echec' };
        this.economy.ajouterSel(gain);
        return { success: true, instance: inst, gain };
    }

    /** Fragmente une instance → Fragments famille du template. */
    fragmenter(indexInventaire, rng) {
        const inv = this.inventaire.getInventaire();
        if (indexInventaire < 0 || indexInventaire >= inv.length) {
            return { success: false, raison: 'index_invalide' };
        }
        const inst = inv[indexInventaire];
        if (!estInstance(inst)) return { success: false, raison: 'pas_une_instance' };

        const qte = fragmentsRendus(inst);
        const famille = TEMPLATES[inst.templateId]?.famille ?? 'blanc';
        const r = (rng ?? Math.random)();
        const bonusNoir = inst.score >= 70 && r < PROBA_BONUS_NOIR;

        const retire = this.inventaire.retirerIndex(indexInventaire);
        if (!retire) return { success: false, raison: 'retrait_echec' };

        if (qte > 0) this.economy.ajouterFragment(famille, qte);
        if (bonusNoir) this.economy.ajouterFragment('noir', 1);

        return {
            success: true,
            instance: inst,
            famille,
            quantite: qte,
            bonusNoir
        };
    }
}
