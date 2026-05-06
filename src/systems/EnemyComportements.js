// 4 archétypes de comportement d'ennemi.
//
// Chaque archétype expose une fonction `update(enemy, player)` qui pilote la
// physique du sprite. La signature standardise l'IA — Enemy.js dispatche
// simplement vers le bon archétype selon `def.archetype`.
//
// Convention : tous les archétypes mettent à jour le `body` du sprite (vélocité)
// et peuvent exposer des callbacks pour effets visuels (ex: telegraph du
// chargeur). Les attaques au contact sont gérées dans Enemy.js, et les
// projectiles du Tireur sont créés via callback `onTir`.

// ============================================================
// VEILLEUR — patrouille courte autour du point d'init.
// Idem au comportement 'patrouille' historique.
// ============================================================
export function updateVeilleur(enemy) {
    const body = enemy.sprite.body;
    body.setVelocityX(enemy.def.vitesse * enemy.direction);
    const portee = enemy.def.porteePatrouille ?? 90;
    if (enemy.sprite.x > enemy.xInit + portee || body.blocked.right) enemy.direction = -1;
    else if (enemy.sprite.x < enemy.xInit - portee || body.blocked.left) enemy.direction = 1;
}

// ============================================================
// TRAQUEUR — vol + poursuite du joueur dans rayonDetection.
// Idem au comportement 'vol_suivi' historique.
// ============================================================
export function updateTraqueur(enemy, player) {
    if (!player) return;
    const body = enemy.sprite.body;
    const dx = player.x - enemy.sprite.x;
    const dy = player.y - enemy.sprite.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0 && dist < enemy.def.rayonDetection) {
        const v = enemy.def.vitesse;
        body.setVelocity((dx / dist) * v, (dy / dist) * v);
        // Maj direction pour le flip horizontal du visuel
        if (Math.abs(dx) > 4) enemy.direction = dx > 0 ? 1 : -1;
    } else {
        body.setVelocity(0, 0);
    }
}

// ============================================================
// CHARGEUR — état machine 4 phases :
//   ROVE      : rôde lentement (xInit ± portée), idem patrouille mais lent
//   TELEGRAPH : s'arrête, lueur d'avertissement (gérée par Enemy via `etat`)
//   CHARGE    : sprint vers la position télégraphée
//   RECOVERY  : étourdi, vélocité 0
// Transitions seedées par le timer scène.
// ============================================================
const ETATS_CHARGEUR = {
    ROVE: 'rove', TELEGRAPH: 'telegraph', CHARGE: 'charge', RECOVERY: 'recovery'
};

export function initChargeur(enemy) {
    enemy.etat = ETATS_CHARGEUR.ROVE;
    enemy.etatFin = 0;
    enemy.chargeDirX = 1;
}

export function updateChargeur(enemy, player) {
    const now = enemy.scene.time.now;
    const def = enemy.def;
    const body = enemy.sprite.body;

    switch (enemy.etat) {
        case ETATS_CHARGEUR.ROVE: {
            // Patrouille lente
            body.setVelocityX(def.vitesseDetection * enemy.direction);
            if (!def.gravite) body.setVelocityY(0);

            const portee = def.porteePatrouille ?? 110;
            if (enemy.sprite.x > enemy.xInit + portee || body.blocked.right) enemy.direction = -1;
            else if (enemy.sprite.x < enemy.xInit - portee || body.blocked.left) enemy.direction = 1;

            // Détection joueur
            if (player) {
                const dx = player.x - enemy.sprite.x;
                const dy = player.y - enemy.sprite.y;
                if (Math.hypot(dx, dy) < def.rayonDetection) {
                    enemy.etat = ETATS_CHARGEUR.TELEGRAPH;
                    enemy.etatFin = now + def.delaiTelegraph;
                    enemy.chargeDirX = dx > 0 ? 1 : -1;
                    enemy.direction = enemy.chargeDirX;
                    enemy.scene.events.emit('enemy:telegraph', enemy);
                }
            }
            break;
        }

        case ETATS_CHARGEUR.TELEGRAPH: {
            body.setVelocity(0, 0);
            if (now >= enemy.etatFin) {
                enemy.etat = ETATS_CHARGEUR.CHARGE;
                enemy.etatFin = now + def.delaiCharge;
                enemy.scene.events.emit('enemy:charge', enemy);
            }
            break;
        }

        case ETATS_CHARGEUR.CHARGE: {
            body.setVelocityX(def.vitesse * enemy.chargeDirX);
            if (!def.gravite) body.setVelocityY(0);
            // Mur frappé : arrête net
            if ((enemy.chargeDirX > 0 && body.blocked.right) ||
                (enemy.chargeDirX < 0 && body.blocked.left) ||
                now >= enemy.etatFin) {
                enemy.etat = ETATS_CHARGEUR.RECOVERY;
                enemy.etatFin = now + def.delaiRecuperation;
                body.setVelocityX(0);
            }
            break;
        }

        case ETATS_CHARGEUR.RECOVERY: {
            body.setVelocity(0, 0);
            if (now >= enemy.etatFin) {
                enemy.etat = ETATS_CHARGEUR.ROVE;
            }
            break;
        }
    }
}

// ============================================================
// TIREUR — stationnaire (ou kite lent) + tirs périodiques.
// Tire un projectile vers la position du joueur quand celui-ci est dans
// rayonDetection ET que le cooldown est écoulé. Le projectile est instancié
// par Enemy.js (qui a la référence à la scène) via le retour { tirer: {...} }.
// ============================================================
export function initTireur(enemy) {
    enemy.prochainTir = enemy.scene.time.now + 600 + Math.random() * 600;
}

export function updateTireur(enemy, player) {
    const def = enemy.def;
    const body = enemy.sprite.body;
    const now = enemy.scene.time.now;

    if (!player) return null;
    const dx = player.x - enemy.sprite.x;
    const dy = player.y - enemy.sprite.y;
    const dist = Math.hypot(dx, dy);

    // Maj direction pour orienter le visuel
    if (Math.abs(dx) > 4) enemy.direction = dx > 0 ? 1 : -1;

    // Kite lent HORIZONTAL uniquement (le kite sur Y faisait fuir les Tireurs
    // volants hors de portée du joueur).
    if (def.vitesse > 0 && dist < def.rayonDetection * 0.5 && Math.abs(dx) > 4) {
        body.setVelocityX(-Math.sign(dx) * def.vitesse);
    } else {
        body.setVelocityX(0);
    }
    if (!def.gravite) body.setVelocityY(0);

    // Tir
    if (dist < def.rayonDetection && now >= enemy.prochainTir) {
        enemy.prochainTir = now + def.delaiTir;
        return {
            tirer: {
                x: enemy.sprite.x,
                y: enemy.sprite.y,
                cibleX: player.x,
                cibleY: player.y,
                vitesse: def.vitesseProjectile,
                portee: def.portéeProjectile,
                degats: def.degatsProjectile,
                couleur: def.palette?.iris ?? 0xff8040,
                halo: def.palette?.halo ?? 0xffd070,
                homing: false
            }
        };
    }
    return null;
}

export const COMPORTEMENTS = {
    veilleur: { update: updateVeilleur, init: null },
    traqueur: { update: updateTraqueur, init: null },
    chargeur: { update: updateChargeur, init: initChargeur },
    tireur:   { update: updateTireur,   init: initTireur }
};
