// FondeurUpgradeSystem — méta-progression du Fondeur entre runs.
//
// 5 paliers (N0 → N5) persistés dans localStorage. Chaque palier monte le
// score moyen produit par la forge (Fragments + Combiner) et réduit le risque
// de Brisé. Les coûts sont volontairement élevés : c'est une montée longue
// qu'on grimpe sur plusieurs runs.

const CLE_STORAGE = 'vestige_fondeur_niveau_v1';

export const PALIERS_FONDEUR = [
    {
        niveau: 0,
        nom: 'Foyer du Vestige',
        scoreBonus: 0,
        risqueBriseReduit: 0,
        cout: null
    },
    {
        niveau: 1,
        nom: 'Foyer attisé',
        scoreBonus: 5,
        risqueBriseReduit: 0.05,
        cout: { sel: 200, fragments: { blanc: 3 } },
        description: '+5 au score moyen forgé, -5 % risque de Brisé.'
    },
    {
        niveau: 2,
        nom: 'Foyer affermi',
        scoreBonus: 10,
        risqueBriseReduit: 0.10,
        cout: { sel: 500, fragments: { bleu: 5 } },
        description: '+10 au score moyen, -10 % risque de Brisé.'
    },
    {
        niveau: 3,
        nom: 'Foyer éveillé',
        scoreBonus: 15,
        risqueBriseReduit: 0.15,
        cout: { sel: 1500, fragments: { bleu: 8, noir: 2 } },
        description: '+15 au score moyen, -15 % risque de Brisé.'
    },
    {
        niveau: 4,
        nom: 'Foyer souverain',
        scoreBonus: 20,
        risqueBriseReduit: 0.20,
        cout: { sel: 4000, fragments: { bleu: 12, noir: 5 } },
        description: '+20 au score moyen, -20 % risque de Brisé.'
    },
    {
        niveau: 5,
        nom: 'Foyer du Reflux',
        scoreBonus: 30,
        risqueBriseReduit: 0.30,
        cout: { sel: 12000, fragments: { noir: 20 } },
        description: '+30 au score moyen, -30 % risque de Brisé.'
    }
];

export const NIVEAU_MAX = PALIERS_FONDEUR.length - 1;

export class FondeurUpgradeSystem {
    constructor() {
        this.niveau = this._lire();
    }

    /** Niveau courant (0-5). */
    getNiveau() {
        return this.niveau;
    }

    getPalier() {
        return PALIERS_FONDEUR[this.niveau];
    }

    /** Palier suivant (null si déjà max). */
    getPalierSuivant() {
        if (this.niveau >= NIVEAU_MAX) return null;
        return PALIERS_FONDEUR[this.niveau + 1];
    }

    /** Bonus au scoreBase produit par la forge. */
    getScoreBonus() {
        return PALIERS_FONDEUR[this.niveau].scoreBonus;
    }

    /** Réduction du risque Brisé (0-0.30). */
    getRisqueBriseReduit() {
        return PALIERS_FONDEUR[this.niveau].risqueBriseReduit;
    }

    /**
     * Tente d'upgrader au palier suivant.
     * @param {EconomySystem} economy
     * @returns {{ success, raison?, palier? }}
     */
    upgrader(economy) {
        const suivant = this.getPalierSuivant();
        if (!suivant) return { success: false, raison: 'niveau_max' };
        const cout = suivant.cout;
        // Vérification atomique
        if (economy.getSel() < cout.sel) return { success: false, raison: 'sel_insuffisant' };
        for (const fam of Object.keys(cout.fragments ?? {})) {
            if (economy.getFragment(fam) < cout.fragments[fam]) {
                return { success: false, raison: `${fam}_insuffisant` };
            }
        }
        // Paiement
        economy.retirerSel(cout.sel);
        for (const fam of Object.keys(cout.fragments ?? {})) {
            economy.retirerFragment(fam, cout.fragments[fam]);
        }
        this.niveau += 1;
        this._ecrire();
        return { success: true, palier: this.getPalier() };
    }

    _lire() {
        try {
            const v = parseInt(localStorage.getItem(CLE_STORAGE) ?? '0', 10);
            return Math.max(0, Math.min(NIVEAU_MAX, isNaN(v) ? 0 : v));
        } catch (_e) { return 0; }
    }

    _ecrire() {
        try { localStorage.setItem(CLE_STORAGE, String(this.niveau)); }
        catch (_e) { /* private mode → silent */ }
    }
}
