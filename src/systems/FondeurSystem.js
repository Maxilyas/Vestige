// FondeurSystem — forge basique à partir de Fragments. Phase 6 : produit une
// INSTANCE forgée (au lieu d'un itemId legacy).
//
// Le score de base dépend du nombre de fragments + des familles utilisées :
//   - 1 fragment   → scoreBase 38 (Commun bas)
//   - 2 fragments  → scoreBase 52 (Étoilé bas)
//   - 3 fragments  → scoreBase 65 (Spectral)
//   - Bonus de +5 par fragment de Bleu/Noir (familles rares)
//
// La famille de l'instance dérive de la famille MAJORITAIRE des fragments.
// Le slot est tiré aléatoirement (un fragment ne porte pas de slot intrinsèque).

import { coutEnSel } from '../data/recettes.js';
import { genererInstance } from './ItemForge.js';
import { FondeurUpgradeSystem } from './FondeurUpgradeSystem.js';

export class FondeurSystem {
    constructor(economy, inventaire) {
        this.economy = economy;
        this.inventaire = inventaire;
        this.upgrade = new FondeurUpgradeSystem();
    }

    /**
     * Tente de forger. Atomique : si une condition échoue, rien n'est consommé.
     * @param {string[]} fragments  ex ['blanc', 'bleu']
     * @param {() => number} rng    PRNG pour tirer le résultat
     * @returns {{ success: boolean, instance?: Object, raison?: string }}
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

        // ─── Phase 6 : produit une INSTANCE forgée ─────────────────
        const scoreBaseParNb = { 1: 38, 2: 52, 3: 65 };
        let scoreBase = scoreBaseParNb[fragments.length] ?? 50;
        // Bonus pour fragments rares
        scoreBase += (lot.bleu ?? 0) * 5;
        scoreBase += (lot.noir ?? 0) * 5;
        // Bonus du palier d'upgrade Fondeur (méta-progression entre runs)
        scoreBase += this.upgrade.getScoreBonus();

        // Famille majoritaire (fallback : première du lot)
        const familleMajeure = Object.keys(lot)
            .filter(f => lot[f] > 0)
            .sort((a, b) => lot[b] - lot[a])[0] ?? 'blanc';

        // Consomme atomiquement
        if (!this.economy.retirerLot(lot)) {
            return { success: false, raison: 'fragments_manquants' };
        }
        this.economy.retirerSel(cout);

        const instance = genererInstance({
            famille: familleMajeure,
            contexte: 'forge',
            scoreBase,
            rng
        });

        if (!this.inventaire.ajouter(instance)) {
            for (const fam of ['blanc', 'bleu', 'noir']) {
                if (lot[fam]) this.economy.ajouterFragment(fam, lot[fam]);
            }
            this.economy.ajouterSel(cout);
            return { success: false, raison: 'inventaire_plein' };
        }

        return { success: true, instance };
    }
}
