// GardeSystem — barre de PV temporaire au-dessus de la Résonance (Phase 6).
//
// Garde = "bouclier" qui absorbe les dégâts en priorité. Régénère après un
// délai sans subir de dégâts. Le MAX est dynamique : somme des affixes
// `gardeMax` portés par l'équipement (passé par calculerStatsForge).
//
// Stockage dans le registry (persiste aux scene.restart) :
//   garde_actuelle : valeur courante
//   garde_max      : plafond (recalc à chaque changement d'équipement)
//   garde_regen    : PV/sec après le délai
//   garde_dernier_degat_ms : timestamp du dernier dégât (pour le délai)

const CLE_GARDE = 'garde_actuelle';
const CLE_GARDE_MAX = 'garde_max';
const CLE_GARDE_REGEN = 'garde_regen';
const CLE_GARDE_DERNIER = 'garde_dernier_degat_ms';

export const EVT_GARDE_CHANGE = 'garde:change';
export const DELAI_REGEN_MS = 3000;

export class GardeSystem {
    constructor(registry) {
        this.registry = registry;

        if (this.registry.get(CLE_GARDE) === undefined) this.registry.set(CLE_GARDE, 0);
        if (this.registry.get(CLE_GARDE_MAX) === undefined) this.registry.set(CLE_GARDE_MAX, 0);
        if (this.registry.get(CLE_GARDE_REGEN) === undefined) this.registry.set(CLE_GARDE_REGEN, 2);
        if (this.registry.get(CLE_GARDE_DERNIER) === undefined) this.registry.set(CLE_GARDE_DERNIER, 0);
    }

    getValeur() { return this.registry.get(CLE_GARDE) ?? 0; }
    getMax() { return this.registry.get(CLE_GARDE_MAX) ?? 0; }
    getRegen() { return this.registry.get(CLE_GARDE_REGEN) ?? 2; }

    /**
     * Met à jour le plafond Garde + Regen depuis les stats Phase 6 effectives.
     * Reclampe la valeur courante si elle dépasse le nouveau max.
     */
    appliquerStats(statsForge) {
        const ancienMax = this.getMax();
        const nouveauMax = Math.max(0, Math.round(statsForge.gardeMax ?? 0));
        const nouveauRegen = Math.max(0, statsForge.gardeRegen ?? 2);

        this.registry.set(CLE_GARDE_MAX, nouveauMax);
        this.registry.set(CLE_GARDE_REGEN, nouveauRegen);

        // Si on vient d'équiper quelque chose qui augmente le max, on ne rend
        // pas automatiquement la Garde — elle se regen normalement. Mais on
        // clamp si on a perdu un item qui la réduit.
        const courant = this.getValeur();
        if (courant > nouveauMax) {
            this.registry.set(CLE_GARDE, nouveauMax);
        }
        // Si on passe de 0 à >0 max, on initialise au plein (sentiment "ça
        // s'active").
        if (ancienMax === 0 && nouveauMax > 0) {
            this.registry.set(CLE_GARDE, nouveauMax);
        }
        this.registry.events.emit(EVT_GARDE_CHANGE, this.getValeur(), nouveauMax);
    }

    /**
     * Absorbe `montant` dégâts. Renvoie le RESTE (qui ira à la Résonance).
     * Marque l'instant pour le délai de regen.
     */
    absorber(montant, nowMs) {
        const max = this.getMax();
        if (max <= 0 || montant <= 0) return montant;
        const courant = this.getValeur();
        if (courant <= 0) {
            // Pas de garde dispo, mais on reset le timer regen quand même
            this.registry.set(CLE_GARDE_DERNIER, nowMs);
            return montant;
        }
        const absorbe = Math.min(courant, montant);
        const reste = montant - absorbe;
        this.registry.set(CLE_GARDE, courant - absorbe);
        this.registry.set(CLE_GARDE_DERNIER, nowMs);
        this.registry.events.emit(EVT_GARDE_CHANGE, this.getValeur(), max);
        return reste;
    }

    /**
     * Régénère la garde si le délai est écoulé. À appeler dans GameScene.update.
     */
    tick(deltaMs, nowMs) {
        const max = this.getMax();
        if (max <= 0) return;
        const courant = this.getValeur();
        if (courant >= max) return;
        const dernier = this.registry.get(CLE_GARDE_DERNIER) ?? 0;
        if (nowMs - dernier < DELAI_REGEN_MS) return;
        const regen = this.getRegen();
        const ajout = (regen * deltaMs) / 1000;
        const nouveau = Math.min(max, courant + ajout);
        if (Math.abs(nouveau - courant) > 0.05) {
            this.registry.set(CLE_GARDE, nouveau);
            this.registry.events.emit(EVT_GARDE_CHANGE, nouveau, max);
        }
    }

    /** Restaure une quantité de Garde (sorts, signatures). */
    restaurer(montant) {
        const max = this.getMax();
        if (max <= 0) return;
        const nouveau = Math.min(max, this.getValeur() + montant);
        this.registry.set(CLE_GARDE, nouveau);
        this.registry.events.emit(EVT_GARDE_CHANGE, nouveau, max);
    }

    /** Bonus temporaire de max Garde (sort égide blanche). */
    bonusTemporaire(bonus, dureeMs, scene) {
        const maxAvant = this.getMax();
        this.registry.set(CLE_GARDE_MAX, maxAvant + bonus);
        this.registry.set(CLE_GARDE, this.getValeur() + bonus);
        this.registry.events.emit(EVT_GARDE_CHANGE, this.getValeur(), this.getMax());
        scene.time.delayedCall(dureeMs, () => {
            const max = this.getMax();
            const nouveauMax = Math.max(0, max - bonus);
            const courant = Math.min(this.getValeur(), nouveauMax);
            this.registry.set(CLE_GARDE_MAX, nouveauMax);
            this.registry.set(CLE_GARDE, courant);
            this.registry.events.emit(EVT_GARDE_CHANGE, courant, nouveauMax);
        });
    }
}
