// EchoGhostSystem — « L'Écho Persistant » (Phase 9.12, Cœur du Reflux).
//
// Le Cœur n'oublie aucun de tes pas. Chaque mouvement du Vestige est enregistré
// puis REJOUÉ par des écho-ghosts dorés qui te suivent en décalé (comme une
// queue de serpent temporelle). Ils te BLESSENT au contact : il faut donc se
// déplacer en laissant des couloirs vides derrière soi — ne jamais recroiser sa
// propre trace récente. Réf. lore : la mort = devenir un habitant du passé ;
// ici, ton passé immédiat te poursuit.
//
// Config de salle (`result.echoGhost`) :
//   { dureeMs?, nbGhosts?, decalageMs?, degats?, seuilHit? }
//
// Implémentation : buffer d'historique {x,y,t}. Le ghost i se place à la
// position enregistrée à (now − i·decalageMs). Hit MANUEL (distance < seuil).

import { DEPTH } from '../render/PainterlyRenderer.js';

const C_GHOST = 0xffcc66;   // doré (souvenir)
const C_GHOST_COEUR = 0xff7040;

export class EchoGhostSystem {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.decalageMs = config.decalageMs ?? 900;
        this.nbGhosts = config.nbGhosts ?? 2;
        this.degats = config.degats ?? 5;
        this.seuilHit = config.seuilHit ?? 26;
        this.dureeMs = config.dureeMs ?? (this.decalageMs * this.nbGhosts + 400);

        this.historique = [];     // [{x,y,t}]
        this.ghosts = [];         // visuels
        this._t0 = scene.time.now;

        for (let i = 0; i < this.nbGhosts; i++) {
            this.ghosts.push({
                delai: this.decalageMs * (i + 1),
                visual: this._creerVisuelGhost(),
                actif: false
            });
        }
    }

    _creerVisuelGhost() {
        const scene = this.scene;
        const cont = scene.add.container(-9999, -9999);
        cont.setDepth(DEPTH.ENTITES - 1);
        cont.setAlpha(0);

        const halo = scene.add.graphics();
        halo.setBlendMode(Phaser.BlendModes.ADD);
        halo.fillStyle(C_GHOST, 0.18); halo.fillCircle(0, 0, 18);
        cont.add(halo);

        const sil = scene.add.graphics();
        sil.fillStyle(C_GHOST, 0.45);
        sil.fillEllipse(0, 3, 24, 16);    // épaules vue de dessus (comme le joueur)
        sil.fillCircle(0, -4, 6.5);        // tête
        cont.add(sil);

        const coeur = scene.add.graphics();
        coeur.setBlendMode(Phaser.BlendModes.ADD);
        coeur.fillStyle(C_GHOST_COEUR, 0.8); coeur.fillCircle(0, 0, 3);
        cont.add(coeur);

        return cont;
    }

    update(player, now) {
        if (!player) return;

        // 1. Enregistre la position courante.
        this.historique.push({ x: player.x, y: player.y, t: now });
        // Purge ce qui est plus vieux que le plus grand délai (+ marge).
        const limite = now - (this.dureeMs + 200);
        while (this.historique.length > 2 && this.historique[0].t < limite) {
            this.historique.shift();
        }

        // 2. Place chaque ghost à sa position retardée + test de contact.
        for (const ghost of this.ghosts) {
            const cible = now - ghost.delai;
            const pos = this._echantillonA(cible);
            if (!pos) {
                if (ghost.actif) { ghost.visual.setAlpha(0); ghost.actif = false; }
                continue;
            }
            if (!ghost.actif) { ghost.actif = true; ghost.visual.setAlpha(1); }
            ghost.visual.setPosition(pos.x, pos.y);

            // Hit manuel : si le joueur recroise sa trace récente.
            const d = Math.hypot(player.x - pos.x, player.y - pos.y);
            if (d < this.seuilHit) this._toucher(now);
        }
    }

    // Échantillon enregistré le plus proche de l'instant cible (ou null si
    // l'historique ne remonte pas encore assez loin).
    _echantillonA(tCible) {
        const h = this.historique;
        if (h.length === 0 || h[0].t > tCible) return null;
        // Scan depuis la fin (les plus récents) vers le début.
        for (let i = h.length - 1; i >= 0; i--) {
            if (h[i].t <= tCible) return h[i];
        }
        return h[0];
    }

    _toucher(now) {
        const s = this.scene;
        if (now < (s.invincibleJusqu ?? 0)) return;
        s.resonance?.prendreDegats?.(this.degats);
        s.invincibleJusqu = now + 700;
        s.flashJoueur?.(0xffaa50);
        s.cameras?.main?.shake?.(110, 0.004);
    }
}
