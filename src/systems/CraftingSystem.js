// CraftingSystem — opérations de forge avancée Phase 6.
//
// Trois modes :
//   1. forgerFragments(fragments, rng)  — legacy : 1-2 Fragments → item legacy T3
//      (délègue à FondeurSystem existant)
//   2. combinerItems(uidA, uidB, rng)   — fusion : 2 instances → 1 nouvelle instance
//      score = max(scoreA, scoreB) + variance (±15, jackpot +25 à 1%, fail -15 → Brisé)
//      coût Sel dépend du tier du résultat. Détruit les composants.
//   3. rerollItem(uid, lockedStatId, rng) — reroll : 1 instance + Encre du Témoin
//      regenère les affixes (sauf la stat verrouillée). Score conservé. Consomme Encre.

import { genererInstance } from './ItemForge.js';
import { estInstance, tierPourScore, tirerScoreDrop } from './ScoreSystem.js';
import { TEMPLATES, getTemplate } from '../data/templatesItems.js';

// ============================================================
// COÛTS — coûts exponentiels par tier du résultat anticipé
// ============================================================
// Lecture : pour combiner deux items dont la moyenne score donne un tier T,
// le coût est COUTS_COMBINAISON[T]. Idem 1% chance de fail (Brisé) à partir
// de score moyen >= 70.

export const COUTS_COMBINAISON = {
    brise: 10,
    commun: 30,
    etoile: 100,
    spectral: 350,
    royal: 1200,
    reliquaire: 4000,
    perfect: 4000
};

export const RISQUE_BRISE = {
    brise: 0,
    commun: 0,
    etoile: 0.05,
    spectral: 0.15,
    royal: 0.25,
    reliquaire: 0.35,
    perfect: 0.4
};

// Coût Re-Résonner (reroll) — toujours 1 Encre du Témoin + Sel modulé selon tier
export const COUTS_REROLL = {
    brise: 5,
    commun: 15,
    etoile: 50,
    spectral: 150,
    royal: 500,
    reliquaire: 1500,
    perfect: 1500
};

export class CraftingSystem {
    constructor(economy, inventaire) {
        this.economy = economy;
        this.inventaire = inventaire;
    }

    // ============================================================
    // COMBINAISON DE 2 INSTANCES
    // ============================================================

    /**
     * Preview du résultat probable d'une combinaison (sans consommer).
     * Renvoie { template, scoreEspere, tier, cout, risque }.
     */
    previewCombinaison(uidA, uidB) {
        const a = this._trouverInstance(uidA);
        const b = this._trouverInstance(uidB);
        if (!a || !b) return null;

        const tplA = getTemplate(a.templateId);
        const tplB = getTemplate(b.templateId);
        if (!tplA || !tplB) return null;
        // Le template du résultat = celui du composant au score le plus haut
        const tplGagnant = a.score >= b.score ? tplA : tplB;
        const scoreBase = Math.max(a.score, b.score);
        const tier = tierPourScore(scoreBase);
        return {
            template: tplGagnant,
            scoreBase,
            tier,
            cout: COUTS_COMBINAISON[tier.id] ?? 100,
            risque: RISQUE_BRISE[tier.id] ?? 0
        };
    }

    /**
     * Combine deux items. Atomique.
     * @returns {{ success, instance?, brise?, raison? }}
     */
    combiner(uidA, uidB, rng) {
        const a = this._trouverInstance(uidA);
        const b = this._trouverInstance(uidB);
        if (!a || !b) return { success: false, raison: 'instance_introuvable' };
        if (a === b) return { success: false, raison: 'meme_instance' };

        const prev = this.previewCombinaison(uidA, uidB);
        if (!prev) return { success: false, raison: 'preview_echec' };

        if (!this.economy.peutPayer(prev.cout)) {
            return { success: false, raison: 'sel_insuffisant' };
        }

        // Détruire les composants : retire les deux des inventaires/équipements
        const retraitA = this._retirerInstance(uidA);
        const retraitB = this._retirerInstance(uidB);
        if (!retraitA || !retraitB) {
            // Rollback si l'un des deux n'a pas pu être retiré
            if (retraitA) this._reposerInstance(a);
            if (retraitB) this._reposerInstance(b);
            return { success: false, raison: 'retrait_echec' };
        }

        this.economy.retirerSel(prev.cout);

        // Jackpot/fail/normal
        let scoreFinal;
        let brise = false;
        const tirage = rng();
        if (tirage < (RISQUE_BRISE[prev.tier.id] ?? 0)) {
            // Brisé : un item gris dont le score est divisé par 2
            scoreFinal = Math.max(5, Math.round(prev.scoreBase * 0.4));
            brise = true;
        } else if (tirage > 0.99) {
            // Jackpot ★ : +25
            scoreFinal = Math.min(100, prev.scoreBase + 20 + Math.round(rng() * 8));
        } else {
            // Normal : variance ±12 vers le haut (skew positif modéré)
            const delta = (rng() - 0.3) * 24; // moyenne +2.4
            scoreFinal = Math.max(10, Math.min(100, Math.round(prev.scoreBase + delta)));
        }

        const nouvelle = genererInstance({
            templateId: prev.template.id,
            score: scoreFinal,
            contexte: 'forge',
            scoreBase: scoreFinal,
            rng
        });

        if (!this.inventaire.ajouter(nouvelle)) {
            // Cas pathologique : rollback ressources, mais les composants sont
            // perdus (sans inventaire pour les rendre). On rend le Sel pour ne
            // pas léser.
            this.economy.ajouterSel(prev.cout);
            return { success: false, raison: 'inventaire_plein' };
        }
        return { success: true, instance: nouvelle, brise };
    }

    // ============================================================
    // REROLL (Re-Résonner)
    // ============================================================

    /**
     * Reroll une instance. Consomme 1 Encre du Témoin + Sel selon tier.
     *
     * @param {string} uid
     * @param {string|null} lockedStatId si fourni, conserve l'affixe primaire
     *                                   correspondant à cette stat (le reste reroll).
     */
    rerollItem(uid, lockedStatId, rng) {
        const inst = this._trouverInstance(uid);
        if (!inst) return { success: false, raison: 'instance_introuvable' };

        const tier = tierPourScore(inst.score);
        const cout = COUTS_REROLL[tier.id] ?? 50;
        if (this.economy.getEncre() < 1) return { success: false, raison: 'encre_insuffisante' };
        if (!this.economy.peutPayer(cout)) return { success: false, raison: 'sel_insuffisant' };

        const tpl = getTemplate(inst.templateId);
        if (!tpl) return { success: false, raison: 'template_introuvable' };

        // Affixe à préserver
        const lockedAffixe = lockedStatId
            ? inst.affixesPrim.find(a => a.statId === lockedStatId)
            : null;

        this.economy.retirerEncre(1);
        this.economy.retirerSel(cout);

        // Régénère le contenu — on garde le score quasi-identique (±5)
        const scoreCible = Math.max(10, Math.min(100, inst.score + Math.round((rng() - 0.5) * 10)));
        const nouvelle = genererInstance({
            templateId: tpl.id,
            score: scoreCible,
            contexte: 'forge',
            scoreBase: scoreCible,
            rng
        });

        // Réinjecte le locked affixe (en remplaçant un primaire existant)
        if (lockedAffixe) {
            // Si la stat verrouillée n'apparaît pas, on remplace le 1er primaire
            const idxExistant = nouvelle.affixesPrim.findIndex(a => a.statId === lockedAffixe.statId);
            if (idxExistant >= 0) {
                nouvelle.affixesPrim[idxExistant] = { ...lockedAffixe };
            } else if (nouvelle.affixesPrim.length > 0) {
                nouvelle.affixesPrim[0] = { ...lockedAffixe };
            } else {
                nouvelle.affixesPrim.push({ ...lockedAffixe });
            }
        }

        // Mute IN-PLACE : on garde l'uid de l'instance d'origine pour conserver
        // sa position dans l'inventaire/équipement
        inst.templateId = nouvelle.templateId;
        inst.score = nouvelle.score;
        inst.affixesPrim = nouvelle.affixesPrim;
        inst.affixesExo = nouvelle.affixesExo;
        inst.sortId = nouvelle.sortId;
        inst.signatureId = nouvelle.signatureId;
        // Reset la révélation (sauf si lockedStat — alors on garde sa révélation)
        inst.revele = { prim: [], exo: [], sort: false, signature: false };
        if (lockedAffixe) {
            const idx = inst.affixesPrim.findIndex(a => a.statId === lockedStatId);
            if (idx >= 0) inst.revele.prim.push(idx);
        }
        inst.compteurs = { hits: 0, parries: 0, sauts: 0, sorts: 0, temps: 0 };

        // Forcer un refresh des registries (l'instance a muté)
        const inv = this.inventaire.getInventaire();
        this.inventaire.registry.set('inventaire', [...inv]);
        const eq = this.inventaire.getEquipement();
        this.inventaire.registry.set('equipement', { ...eq });

        return { success: true, instance: inst };
    }

    // ============================================================
    // HELPERS PRIVÉS
    // ============================================================

    _trouverInstance(uid) {
        const inv = this.inventaire.getInventaire();
        for (const entry of inv) {
            if (estInstance(entry) && entry.uid === uid) return entry;
        }
        const eq = this.inventaire.getEquipement();
        for (const slot of ['tete', 'corps', 'accessoire']) {
            const e = eq[slot];
            if (estInstance(e) && e.uid === uid) return e;
        }
        return null;
    }

    _retirerInstance(uid) {
        const inv = [...this.inventaire.getInventaire()];
        const idx = inv.findIndex(e => estInstance(e) && e.uid === uid);
        if (idx >= 0) {
            inv.splice(idx, 1);
            this.inventaire.registry.set('inventaire', inv);
            this.inventaire.registry.events.emit('inventaire:change');
            return true;
        }
        // Cherche en équipement
        const eq = { ...this.inventaire.getEquipement() };
        for (const slot of ['tete', 'corps', 'accessoire']) {
            if (estInstance(eq[slot]) && eq[slot].uid === uid) {
                eq[slot] = null;
                this.inventaire.registry.set('equipement', eq);
                this.inventaire.registry.events.emit('equipement:change');
                return true;
            }
        }
        return false;
    }

    _reposerInstance(instance) {
        this.inventaire.ajouter(instance);
    }
}
