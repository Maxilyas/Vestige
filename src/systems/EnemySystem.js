// Persistance des ennemis morts — survit aux scene.restart.
// Clé registry : 'enemies_dead' = liste de "monde:salle:idx".

const CLE = 'enemies_dead';

export class EnemySystem {
    constructor(registry) {
        this.registry = registry;
        if (this.registry.get(CLE) === undefined) {
            this.registry.set(CLE, []);
        }
    }

    _key(monde, salle, idx) {
        return `${monde}:${salle}:${idx}`;
    }

    estMort(monde, salle, idx) {
        return this.registry.get(CLE).includes(this._key(monde, salle, idx));
    }

    marquerMort(monde, salle, idx) {
        const k = this._key(monde, salle, idx);
        const liste = this.registry.get(CLE);
        if (!liste.includes(k)) {
            this.registry.set(CLE, [...liste, k]);
        }
    }
}
