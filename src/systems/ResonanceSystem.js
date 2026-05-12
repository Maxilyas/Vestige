// Système de Résonance — la jauge centrale du jeu (remplace la "barre de vie").
//
// Architecture : la valeur vit dans le registry Phaser (DataManager global du jeu),
// pas dans la classe. Pourquoi ? Parce que `GameScene.restart()` (utilisé pour les
// transitions de salle) détruit la scène et tout son état local. Le registry, lui,
// vit aussi longtemps que `Phaser.Game` — la Résonance survit donc aux transitions.
//
// Effet de bord utile : `registry.set(cle, valeur)` émet automatiquement un event
// `changedata-<cle>` que la UIScene écoute pour redessiner la jauge. Découplage
// gratuit entre le système et le HUD.

export const RESONANCE_CLE = 'resonance';
export const RESONANCE_MAX_CLE = 'resonance_max';
export const RESONANCE_MIN = 0;
export const RESONANCE_MAX = 100;
export const RESONANCE_INITIALE = 100;

export class ResonanceSystem {
    /**
     * @param {Phaser.Data.DataManager} registry  registry Phaser (this.registry depuis une scène)
     */
    constructor(registry) {
        this.registry = registry;

        // Initialise la valeur uniquement la première fois — sinon on écraserait
        // l'état entre deux salles.
        if (this.registry.get(RESONANCE_CLE) === undefined) {
            this.registry.set(RESONANCE_CLE, RESONANCE_INITIALE);
        }
        // Phase 5b.2 — max dynamique (Cœur Pierreux peut l'augmenter).
        if (this.registry.get(RESONANCE_MAX_CLE) === undefined) {
            this.registry.set(RESONANCE_MAX_CLE, RESONANCE_MAX);
        }
    }

    getValeur() {
        return this.registry.get(RESONANCE_CLE);
    }

    /** Max effectif courant (lecture registry, fallback constante). */
    getMaxEffectif() {
        return this.registry.get(RESONANCE_MAX_CLE) ?? RESONANCE_MAX;
    }

    /**
     * Met à jour le max effectif et reclampe la valeur courante. Émet
     * implicitement les changedata- attendus par la UI.
     */
    setMaxEffectif(nouveau) {
        const max = Math.max(RESONANCE_MAX, Math.round(nouveau));
        this.registry.set(RESONANCE_MAX_CLE, max);
        const valeur = this.getValeur();
        if (valeur > max) this.registry.set(RESONANCE_CLE, max);
    }

    /**
     * Inflige des dégâts. La valeur est plafonnée dans [MIN, MAX effectif].
     * Émet `resonance:vide` sur le registry events lorsque la valeur passe
     * de >0 à 0 — c'est ce qui déclenche le basculement (cf. GameScene).
     */
    prendreDegats(montant) {
        const ancienne = this.getValeur();
        const max = this.getMaxEffectif();
        const nouvelle = Phaser.Math.Clamp(ancienne - montant, RESONANCE_MIN, max);
        this.registry.set(RESONANCE_CLE, nouvelle);

        if (ancienne > 0 && nouvelle === 0) {
            this.registry.events.emit('resonance:vide');
        }
    }

    regagner(montant) {
        this.prendreDegats(-montant);
    }
}
