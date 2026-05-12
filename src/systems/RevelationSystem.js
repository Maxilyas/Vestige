// RevelationSystem — auto-révélation par usage des affixes primaires Phase 6.
//
// Modèle : chaque instance d'item a un objet `compteurs` (hits, parries, sauts,
// sorts, temps). Quand un compteur passe un seuil, on révèle le prochain
// affixe primaire caché. Les affixes EXOTIQUES (et le sort, et la signature)
// ne se révèlent PAS par usage — ils nécessitent l'Identifieur.
//
// Seuils par défaut (à équilibrer) :
//   30 hits  → 1 affixe primaire révélé
//   60 hits  → 2 affixes
//   100 hits → tous primaires révélés
//
// L'Identifieur (Phase 6.x) pourra révéler exotiques + sort + signature.

import { resolveItemDef } from './ItemForge.js';
import { estInstance } from './ScoreSystem.js';
import { EVT_EQUIP_CHANGE } from './InventaireSystem.js';

const SEUILS_HITS = [30, 60, 100]; // hits cumulés pour révéler 1, 2, 3 primaires

export const EVT_REVELATION = 'revelation:change';

export class RevelationSystem {
    constructor(registry, inventaireSystem) {
        this.registry = registry;
        this.inventaire = inventaireSystem;
    }

    /**
     * Incrémente le compteur d'usage pour tous les items équipés en instance.
     * Doit être appelé sur les events gameplay (hit, parry, jump, sort).
     */
    incrementer(typeCompteur, montant = 1) {
        const equipement = this.inventaire.getEquipement();
        let mutated = false;
        for (const slot of ['tete', 'corps', 'accessoire']) {
            const entry = equipement[slot];
            if (!estInstance(entry)) continue;
            entry.compteurs[typeCompteur] = (entry.compteurs[typeCompteur] ?? 0) + montant;
            if (this._verifierRevelations(entry)) mutated = true;
        }
        if (mutated) {
            // Force la mise à jour du registry pour que l'UI redessine
            this.registry.set('equipement', { ...equipement });
            this.registry.events.emit(EVT_REVELATION);
        }
    }

    /**
     * Révèle un affixe primaire si le seuil est atteint. Renvoie true si
     * quelque chose a changé.
     */
    _verifierRevelations(instance) {
        const hits = instance.compteurs.hits ?? 0;
        const aReveler = SEUILS_HITS.filter(s => hits >= s).length;
        const dejaReveles = instance.revele.prim.length;
        if (aReveler <= dejaReveles) return false;

        // Révèle les prochains affixes primaires (par ordre d'index)
        let mutated = false;
        for (let i = 0; i < instance.affixesPrim.length && instance.revele.prim.length < aReveler; i++) {
            if (!instance.revele.prim.includes(i)) {
                instance.revele.prim.push(i);
                mutated = true;
            }
        }
        return mutated;
    }

    /**
     * Révèle un affixe exotique (manuellement, via Identifieur).
     * @returns {boolean} vrai si quelque chose a été révélé.
     */
    revelerExotique(entry, index) {
        if (!estInstance(entry)) return false;
        if (entry.revele.exo.includes(index)) return false;
        entry.revele.exo.push(index);
        this.registry.events.emit(EVT_REVELATION);
        return true;
    }

    /** Révèle le sort (manuellement). */
    revelerSort(entry) {
        if (!estInstance(entry)) return false;
        if (entry.revele.sort) return false;
        entry.revele.sort = true;
        this.registry.events.emit(EVT_REVELATION);
        return true;
    }

    /** Révèle la signature (manuellement). */
    revelerSignature(entry) {
        if (!estInstance(entry)) return false;
        if (entry.revele.signature) return false;
        entry.revele.signature = true;
        this.registry.events.emit(EVT_REVELATION);
        return true;
    }

    /**
     * Force la révélation totale d'une instance (Vestige Œil Saigné existant
     * étend ce comportement aux instances Phase 6).
     */
    revelerTout(entry) {
        if (!estInstance(entry)) return false;
        const nbPrim = entry.affixesPrim.length;
        for (let i = 0; i < nbPrim; i++) {
            if (!entry.revele.prim.includes(i)) entry.revele.prim.push(i);
        }
        for (let i = 0; i < entry.affixesExo.length; i++) {
            if (!entry.revele.exo.includes(i)) entry.revele.exo.push(i);
        }
        entry.revele.sort = true;
        entry.revele.signature = true;
        this.registry.events.emit(EVT_REVELATION);
        return true;
    }
}
