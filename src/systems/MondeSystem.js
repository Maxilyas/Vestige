// Gestion du monde courant — Normal ou Miroir.
//
// Comme la Résonance, le "monde courant" vit dans le registry pour survivre
// aux scene.restart() (transitions de salle, basculements). Toutes les bornes
// numériques liées à la transition (résonance après bascule, bonus de retour)
// sont centralisées ici pour pouvoir les tuner facilement.

import { RESONANCE_CLE, RESONANCE_MAX } from './ResonanceSystem.js';

export const MONDE_CLE = 'monde';
export const MONDE_NORMAL = 'normal';
export const MONDE_MIROIR = 'miroir';

// Tuning du basculement — déplaçables ici sans toucher aux scènes
export const RESONANCE_APRES_BASCULE = 30; // valeur après bascule Normal → Miroir
export const RESONANCE_BONUS_RETOUR = 20;  // bonus quand on revient via le portail

export class MondeSystem {
    constructor(registry) {
        this.registry = registry;
        if (this.registry.get(MONDE_CLE) === undefined) {
            this.registry.set(MONDE_CLE, MONDE_NORMAL);
        }
    }

    getMonde() {
        return this.registry.get(MONDE_CLE);
    }

    estDansMiroir() {
        return this.getMonde() === MONDE_MIROIR;
    }

    // Bascule Normal → Miroir : déclenchée quand la Résonance touche 0 dans le Normal.
    // Stabilise la Résonance à RESONANCE_APRES_BASCULE pour donner une marge au joueur.
    basculerVersMiroir() {
        this.registry.set(MONDE_CLE, MONDE_MIROIR);
        this.registry.set(RESONANCE_CLE, RESONANCE_APRES_BASCULE);
    }

    // Retour Miroir → Normal via portail : on rajoute un bonus pour récompenser
    // l'évasion réussie. Plafonné à RESONANCE_MAX.
    revenirAuNormal() {
        this.registry.set(MONDE_CLE, MONDE_NORMAL);
        const courante = this.registry.get(RESONANCE_CLE) ?? 0;
        const nouvelle = Math.min(RESONANCE_MAX, courante + RESONANCE_BONUS_RETOUR);
        this.registry.set(RESONANCE_CLE, nouvelle);
    }
}
