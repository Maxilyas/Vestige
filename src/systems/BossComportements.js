// 3 patterns de boss — Colosse, Tisseur, Hydre.
//
// Chaque pattern expose `init(boss)` et `update(boss, player)`. Les boss
// utilisent en interne les comportements de leurs archétypes (Veilleur /
// Tireur) mais avec une logique d'attaque spéciale par-dessus :
//   - Colosse : SMASH AOE périodique (telegraph 800ms → impact zone + gravats)
//   - Tisseur : SALVE de N projectiles téléguidés (accent : pas un seul tir,
//                une rafale en éventail vers le joueur)
//   - Hydre   : composite. Phase 1 = mode Tisseur. Phase 2 (≤ seuilPhase2) =
//               mode Colosse. Phase 3 (≤ seuilPhase3, optionnelle) = enrage,
//               les deux en alternance plus rapide.
//
// Les attaques émettent des événements scène (`boss:smash`, `boss:tir`) que
// GameScene capte pour appliquer les dégâts et les effets visuels.

// ============================================================
// COLOSSE — smash AOE périodique
// ============================================================
export function initColosse(boss) {
    boss.prochainSmash = boss.scene.time.now + 1200;
    boss.smashEnCours = false;
}

export function updateColosse(boss, player) {
    const now = boss.scene.time.now;
    const def = boss.def;
    const body = boss.sprite.body;

    // Marche lente vers le joueur (le Colosse est inéluctable)
    if (player) {
        const dx = player.x - boss.sprite.x;
        const dirX = Math.sign(dx) || 1;
        if (Math.abs(dx) > 60) body.setVelocityX(def.vitesse * dirX);
        else body.setVelocityX(0);
        boss.direction = dirX;
    }

    // Smash périodique
    if (!boss.smashEnCours && now >= boss.prochainSmash) {
        boss.smashEnCours = true;
        boss.scene.events.emit('boss:smash:telegraph', boss);
        boss.scene.time.delayedCall(800, () => {
            if (boss.mort) return;
            boss.scene.events.emit('boss:smash:impact', boss);
            boss.smashEnCours = false;
            boss.prochainSmash = boss.scene.time.now + (def.delaiSmash ?? 3000);
        });
    }
}

// ============================================================
// TISSEUR — salve de projectiles (téléguidés selon def.homing)
// ============================================================
export function initTisseur(boss) {
    boss.prochainTir = boss.scene.time.now + 1200;
}

export function updateTisseur(boss, player) {
    const now = boss.scene.time.now;
    const def = boss.def;
    const body = boss.sprite.body;

    // Le Tisseur lévite à hauteur fixe et kite HORIZONTALEMENT seulement
    // (le kiter sur Y ferait fuir le boss en l'air hors de portée).
    body.setVelocity(0, 0);
    if (player && def.vitesse > 0) {
        const dx = player.x - boss.sprite.x;
        if (Math.abs(dx) < 220 && Math.abs(dx) > 4) {
            body.setVelocityX(-Math.sign(dx) * def.vitesse);
        }
        boss.direction = dx > 0 ? 1 : -1;
    }

    if (now >= boss.prochainTir && player) {
        boss.prochainTir = now + (def.delaiTir ?? 1200);
        const nb = def.nbProjectiles ?? 3;
        // Salve en éventail : ouverture totale 60° centrée sur la direction joueur
        const dxBase = player.x - boss.sprite.x;
        const dyBase = player.y - boss.sprite.y;
        const angBase = Math.atan2(dyBase, dxBase);
        const ouverture = nb > 1 ? 1.0 : 0;  // ~57° total
        for (let i = 0; i < nb; i++) {
            const t = nb > 1 ? (i / (nb - 1)) - 0.5 : 0;
            const ang = angBase + t * ouverture;
            const cibleX = boss.sprite.x + Math.cos(ang) * 200;
            const cibleY = boss.sprite.y + Math.sin(ang) * 200;
            boss.scene.events.emit('boss:tir', boss, {
                x: boss.sprite.x, y: boss.sprite.y,
                cibleX, cibleY,
                vitesse: def.vitesseProjectile ?? 200,
                portee: def.portéeProjectile ?? 600,
                degats: def.degatsProjectile ?? 8,
                couleur: def.palette.accent ?? 0xff8040,
                halo: def.palette.halo ?? 0xffd070,
                homing: !!def.homing
            });
        }
    }
}

// ============================================================
// HYDRE — composite. Switche de pattern selon les seuils HP.
// ============================================================
export function initHydre(boss) {
    boss.phase = 1;
    initTisseur(boss);
    initColosse(boss);
}

export function updateHydre(boss, player) {
    const def = boss.def;
    const ratioHp = boss.hp / Math.max(1, boss.hpMax);

    // Détection des transitions de phase
    if (boss.phase === 1 && def.seuilPhase2 && ratioHp <= def.seuilPhase2) {
        boss.phase = 2;
        boss.scene.events.emit('boss:phase', boss, 2);
    }
    if (boss.phase === 2 && def.seuilPhase3 && ratioHp <= def.seuilPhase3) {
        boss.phase = 3;
        boss.scene.events.emit('boss:phase', boss, 3);
    }

    if (boss.phase === 1) {
        updateTisseur(boss, player);
    } else if (boss.phase === 2) {
        updateColosse(boss, player);
    } else {
        // Phase 3 : alterne les deux en accéléré
        const tic = Math.floor(boss.scene.time.now / 1500) % 2;
        if (tic === 0) updateColosse(boss, player);
        else           updateTisseur(boss, player);
    }
}

export const PATTERNS_BOSS = {
    colosse: { init: initColosse, update: updateColosse },
    tisseur: { init: initTisseur, update: updateTisseur },
    hydre:   { init: initHydre,   update: updateHydre }
};
