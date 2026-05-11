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

    // Bascule Présent → Miroir : déclenchée par la mort (Résonance 0) ou un vortex
    // volontaire. Pas de pénalité — la cité régénère le Vestige à pleine Résonance.
    basculerVersMiroir() {
        this.registry.set(MONDE_CLE, MONDE_MIROIR);
        this.registry.set(RESONANCE_CLE, RESONANCE_MAX);
    }

    // Retour Miroir → Présent via vortex : pleine Résonance, on repart en cured.
    revenirAuNormal() {
        this.registry.set(MONDE_CLE, MONDE_NORMAL);
        this.registry.set(RESONANCE_CLE, RESONANCE_MAX);
    }
}
