// Helpers partagés des boss SIDE-SCROLL (biomes 1-8).
// Utilisés par BossRuinesHalls.js (é1-4) et BossCristauxVoile.js (é5-8).
// Aucune dépendance vers BossComportements → pas d'import circulaire.

import { DEPTH } from '../render/PainterlyRenderer.js';
import { degatsJoueur } from './BossHelpers.js';

export const SOL = 40;   // = HAUTEUR_SOL (data/topographies.js)

// Dimensions de l'arène courante (dims de la salle BOSS).
export function arene(boss) {
    const d = boss.scene.salle?.dims ?? { largeur: 1400, hauteur: 640 };
    return { L: d.largeur, H: d.hauteur, solY: d.hauteur - SOL };
}

export function cacherDefaut(boss) { boss.visual?.setAlpha?.(0); }

// Positionne un boss stationnaire (gravité coupée) et le fige.
export function placer(boss, x, y) {
    boss.sprite.x = x; boss.sprite.y = y;
    const b = boss.sprite.body;
    if (b) { b.allowGravity = false; b.reset(x, y); b.setVelocity(0, 0); }
}

// Le joueur est-il en appui (sol OU plafond si gravité inversée) ?
export function joueurAuSol(s) {
    const b = s.player?.body;
    return !!(b && (b.blocked?.down || b.blocked?.up || b.onFloor?.()));
}

export function flashCorps(boss) { boss._flashJusqu = boss.scene.time.now + 90; }
export function intensiteFlash(boss) {
    return (boss.scene.time.now < (boss._flashJusqu ?? 0)) ? 1 : 0;
}

// Gate d'invulnérabilité + interception de la mort pour la SECRET PHASE.
// declencherSecret(boss) est appelé la 1ère fois que hp atteint 0.
export function installerGate(boss, declencherSecret) {
    const s = boss.scene;
    boss._origRecevoir = boss.recevoirDegats.bind(boss);
    boss.recevoirDegats = function (m) {
        if (boss.mort) return;
        if (!boss._vulnerable) {
            s.cameras?.main?.flash?.(24, 60, 60, 60);
            s.audio?.jouerSfx?.('parry');
            s.afficherMessageFlottant?.('résistant', '#8a8a9a');
            return;
        }
        boss.hp -= m; flashCorps(boss);
        s.audio?.jouerSfx?.('hit');
        if (boss.hp <= 0) {
            if (!boss._secret) { boss._secret = true; boss._vulnerable = false; declencherSecret(boss); }
            else boss._origRecevoir(99999);   // vraie mort → boss:dead (drop + porte)
        }
    };
}

// Abonne le boss à l'event d'attaque du joueur (pour ses destructibles propres).
export function brancherAttaque(boss, handler) {
    const s = boss.scene;
    boss._onAttaque = (info) => { if (!boss.mort) handler(info); };
    s.events.on('joueur:attaque', boss._onAttaque);
    const cleanup = () => s.events.off('joueur:attaque', boss._onAttaque);
    s.events.once('boss:dead', cleanup);
    s.events.once('shutdown', cleanup);
}

// Transitions de phase par PV (P2 à 66 %, P3 à 33 % par défaut).
export function majPhases(boss) {
    const s = boss.scene;
    const r = boss.hp / Math.max(1, boss.hpMax);
    if (boss.phase === 1 && r <= (boss.def.seuilPhase2 ?? 0.66)) { boss.phase = 2; s.events.emit('boss:phase', boss, 2); return 2; }
    if (boss.phase === 2 && r <= (boss.def.seuilPhase3 ?? 0.33)) { boss.phase = 3; s.events.emit('boss:phase', boss, 3); return 3; }
    return 0;
}

export function ouvrir(boss, duree, message, couleur) {
    boss._vulnerable = true;
    boss._fenetreVulnFin = boss.scene.time.now + duree;
    if (message) boss.scene.afficherMessageFlottant?.(message, couleur ?? '#ffd070');
}

// ── Zones de danger au sol (ondes / feu / glace) — bande horizontale, hit MANUEL ──
export function ajouterZoneSol(boss, x, demiL, opts = {}) {
    const s = boss.scene;
    const z = {
        x, demiL, expire: s.time.now + (opts.duree ?? 600),
        degats: opts.degats ?? 6, couleur: opts.couleur ?? 0xff6030,
        h: opts.hauteur ?? 16, tick: 0, effet: opts.effet,
        gfx: s.add.graphics().setDepth(DEPTH.EFFETS - 1)
    };
    (boss._zonesSol ??= []).push(z);
    return z;
}
export function majZonesSol(boss, player, now) {
    if (!boss._zonesSol) return;
    const { solY } = arene(boss);
    boss._zonesSol = boss._zonesSol.filter(z => {
        if (now >= z.expire || boss.mort) { z.gfx.destroy(); return false; }
        const g = z.gfx; g.clear(); g.setBlendMode(Phaser.BlendModes.ADD);
        const a = 0.22 + 0.14 * Math.sin(now / 90);
        g.fillStyle(z.couleur, a); g.fillRect(z.x - z.demiL, solY - 8, z.demiL * 2, 12);
        g.fillStyle(z.couleur, a * 0.5); g.fillRect(z.x - z.demiL, solY - 8 - z.h, z.demiL * 2, z.h);
        if (Math.abs(player.x - z.x) < z.demiL && joueurAuSol(boss.scene) && now >= z.tick) {
            z.tick = now + 320; degatsJoueur(boss, z.degats, z.couleur);
            if (typeof z.effet === 'function') z.effet(boss.scene);
        }
        return true;
    });
}

// ── Onde de choc qui court le long du sol depuis originX (à SAUTER) ──
export function lancerOnde(boss, originX, opts = {}) {
    const s = boss.scene;
    (boss._ondes ??= []).push({
        x: originX, r: 20, vitesse: opts.vitesse ?? 7, max: opts.max ?? 900,
        degats: opts.degats ?? 8, couleur: opts.couleur ?? 0xffd070,
        gfx: s.add.graphics().setDepth(DEPTH.EFFETS)
    });
}
export function majOndes(boss, player, now) {
    if (!boss._ondes) return;
    const { solY } = arene(boss);
    boss._ondes = boss._ondes.filter(o => {
        if (o.r > o.max || boss.mort) { o.gfx.destroy(); return false; }
        o.r += o.vitesse;
        const g = o.gfx; g.clear(); g.setBlendMode(Phaser.BlendModes.ADD);
        for (const s2 of [-1, 1]) {
            const xb = o.x + s2 * o.r;
            g.fillStyle(o.couleur, 0.7); g.fillRect(xb - 9, solY - 22, 18, 22);
            g.fillStyle(0xffffff, 0.6); g.fillRect(xb - 4, solY - 30, 8, 30);
        }
        const d = Math.abs(Math.abs(player.x - o.x) - o.r);
        if (d < 22 && joueurAuSol(boss.scene)) degatsJoueur(boss, o.degats, o.couleur);
        return true;
    });
}

// ── Chute de gravats / projectile vertical : télégraphe (colonne) puis impact ──
export function chuteGravats(boss, x, opts = {}) {
    const s = boss.scene, { solY } = arene(boss);
    const tele = s.add.graphics().setDepth(DEPTH.EFFETS - 2);
    const demiL = opts.demiL ?? 34;
    const t0 = s.time.now; const delai = opts.delai ?? 720;
    const couleur = opts.couleur ?? 0xff5030;
    const dessine = () => {
        if (!tele.active) return;
        const k = Phaser.Math.Clamp((s.time.now - t0) / delai, 0, 1);
        tele.clear();
        tele.fillStyle(couleur, 0.10 + 0.18 * k);
        tele.fillRect(x - demiL, 0, demiL * 2, solY);
        tele.fillStyle(0xffd070, 0.6);
        tele.fillRect(x - demiL, solY - 4, demiL * 2 * k, 4);
    };
    const upd = () => dessine();
    s.events.on('postupdate', upd);
    s.time.delayedCall(delai, () => {
        s.events.off('postupdate', upd); tele.destroy();
        if (boss.mort) return;
        const bloc = s.add.graphics().setDepth(DEPTH.EFFETS);
        bloc.fillStyle(opts.blocCouleur ?? 0x6a5a48, 1); bloc.fillRect(-demiL, -26, demiL * 2, 30);
        bloc.fillStyle(0x8a7a60, 1); bloc.fillRect(-demiL + 4, -22, demiL * 2 - 8, 10);
        bloc.x = x; bloc.y = 0;
        s.tweens.add({
            targets: bloc, y: solY - 14, duration: 220, ease: 'Cubic.In',
            onComplete: () => {
                s.cameras?.main?.shake?.(160, 0.01);
                ajouterZoneSol(boss, x, demiL, { duree: opts.dureeImpact ?? 260, degats: opts.degats ?? 9, couleur: 0xc89060, hauteur: 8 });
                if (s.textures.exists('_particule')) {
                    const b = s.add.particles(x, solY - 10, '_particule', {
                        lifespan: 500, speed: { min: 80, max: 200 }, angle: { min: -150, max: -30 },
                        gravityY: 700, scale: { start: 0.7, end: 0 },
                        tint: [0x6a5a48, 0x8a7a60, 0xc8b88a], quantity: 12, alpha: { start: 1, end: 0 }
                    });
                    b.setDepth(DEPTH.EFFETS); b.explode(12);
                    s.time.delayedCall(560, () => b.destroy());
                }
                bloc.destroy();
            }
        });
    });
}

// Nettoyage standard à la mort du boss (détruit les gfx des listes nommées).
export function nettoyer(boss, listes) {
    boss.scene.events.once('boss:dead', () => {
        for (const l of listes) (boss[l] ?? []).forEach(o => o?.gfx?.destroy?.());
        boss._corps?.destroy(); boss._aura?.destroy();
    });
}
