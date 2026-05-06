// Entité Boss — étend Enemy avec un pattern de combat dédié.
//
// Le Boss reprend la mécanique d'Enemy (sprite + visuel + dégâts + mort) mais
// remplace son `update` par un pattern de boss (Colosse / Tisseur / Hydre)
// défini dans systems/BossComportements.js. Il utilise un visuel amplifié
// (BossVisuel) et émet `boss:dead` quand il meurt (en plus de `enemy:dead`).

import { Enemy } from './Enemy.js';
import { PATTERNS_BOSS } from '../systems/BossComportements.js';
import { creerVisuelBoss } from '../render/entities/BossVisuel.js';
import { DEPTH } from '../render/PainterlyRenderer.js';

export class Boss extends Enemy {
    constructor(scene, def, x, y) {
        // On laisse Enemy faire le sprite physique. Mais on remplace le visuel.
        super(scene, def, x, y, 'boss');

        // Détruit le visuel d'archétype créé par Enemy et installe un visuel boss
        this.visual?.destroy();
        this.visual = creerVisuelBoss(scene, def);
        this.visual.setPosition(x, y);
        this.visual.setDepth(DEPTH.ENTITES + 2);

        // Init du pattern boss (override l'init d'archétype)
        const pat = PATTERNS_BOSS[def.pattern];
        if (pat?.init) pat.init(this);
    }

    update(player) {
        if (this.mort) return;
        const pat = PATTERNS_BOSS[this.def.pattern];
        if (!pat) {
            super.update(player);
            return;
        }
        pat.update(this, player);

        // Suivi visuel
        if (this.visual?.active) {
            this.visual.setPosition(this.sprite.x, this.sprite.y);
            this.visual.scaleX = this.direction || 1;
        }
    }

    mourir() {
        if (this.mort) return;
        super.mourir();
        // Émet aussi un événement boss:dead pour permettre à GameScene de
        // débloquer la porte de sortie + drop garanti.
        this.scene.events.emit('boss:dead', this);
    }
}
