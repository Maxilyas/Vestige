// Boss SIDE-SCROLL des biomes 1-2 (Ruines basses / Halls Cendrés).
// Refonte « esprit WoW » : 4 verbes de gameplay OPPOSÉS, aucun danmaku-tourelle.
// (cf. BOSS_CONCEPTS.md — #6, #15, #5, #12)
//
//   • é1 LA CARIATIDE         — DÉTRUIRE l'environnement : briser les piliers
//        porteurs pour faire ployer la géante sous la voûte. Secret : elle
//        arrache la voûte et devient MOBILE (chasse au sol).
//   • é2 LE COLOSSE DE SEL     — GRIMPER le boss : escalader son corps (corniches)
//        pour frapper les nœuds de sel lumineux. Secret : il s'effrite en éclats
//        mobiles qui convergent pour se reformer — les détruire avant.
//   • é3 LE PORTEUR DE LANTERNES — ÉCLAIRER + porter : ramasser ses lanternes,
//        allumer les vasques pour le débusquer de l'ombre. Secret : tout s'éteint,
//        TU portes la seule lumière — qu'il traque (la lumière = la cible).
//   • é4 L'EFFIGIE ARDENTE     — KITER vers l'eau : attirer l'Effigie dans les
//        bassins pour l'éteindre → vulnérable. Secret : l'arène s'embrase, seules
//        les dalles que TU as refroidies (+ les bassins) sont sûres.
//
// Contraintes side-scroll respectées : gravité + saut (≤96 px vert / ≤130 horiz),
// pas de dash de base. Détection des coups sur destructibles via l'event
// `joueur:attaque` émis par GameScene.tenterAttaque.

import { DEPTH } from '../render/PainterlyRenderer.js';
import { degatsJoueur, tirRadial, anneau } from './BossHelpers.js';

const SOL = 40;   // = HAUTEUR_SOL (data/topographies.js)

// ════════════════════════════════════════════════════════════════════
// HELPERS COMMUNS
// ════════════════════════════════════════════════════════════════════
function arene(boss) {
    const d = boss.scene.salle?.dims ?? { largeur: 1400, hauteur: 640 };
    return { L: d.largeur, H: d.hauteur, solY: d.hauteur - SOL };
}

function cacherDefaut(boss) { boss.visual?.setAlpha?.(0); }

function placer(boss, x, y) {
    boss.sprite.x = x; boss.sprite.y = y;
    const b = boss.sprite.body;
    if (b) { b.allowGravity = false; b.reset(x, y); b.setVelocity(0, 0); }
}

function joueurAuSol(s) {
    const b = s.player?.body;
    return !!(b && (b.blocked?.down || b.onFloor?.()));
}

function flashCorps(boss) { boss._flashJusqu = boss.scene.time.now + 90; }
function intensiteFlash(boss) {
    return (boss.scene.time.now < (boss._flashJusqu ?? 0)) ? 1 : 0;
}

// Gate d'invulnérabilité + interception de la mort pour la SECRET PHASE.
// declencherSecret(boss) est appelé la 1ère fois que hp atteint 0.
function installerGate(boss, declencherSecret) {
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
function brancherAttaque(boss, handler) {
    const s = boss.scene;
    boss._onAttaque = (info) => { if (!boss.mort) handler(info); };
    s.events.on('joueur:attaque', boss._onAttaque);
    const cleanup = () => s.events.off('joueur:attaque', boss._onAttaque);
    s.events.once('boss:dead', cleanup);
    s.events.once('shutdown', cleanup);
}

// Transitions de phase par PV (P2 à 66 %, P3 à 33 %).
function majPhases(boss) {
    const s = boss.scene;
    const r = boss.hp / Math.max(1, boss.hpMax);
    if (boss.phase === 1 && r <= (boss.def.seuilPhase2 ?? 0.66)) { boss.phase = 2; s.events.emit('boss:phase', boss, 2); return 2; }
    if (boss.phase === 2 && r <= (boss.def.seuilPhase3 ?? 0.33)) { boss.phase = 3; s.events.emit('boss:phase', boss, 3); return 3; }
    return 0;
}

function ouvrir(boss, duree, message, couleur) {
    boss._vulnerable = true;
    boss._fenetreVulnFin = boss.scene.time.now + duree;
    if (message) boss.scene.afficherMessageFlottant?.(message, couleur ?? '#ffd070');
}

// ── Zones de danger au sol (ondes / feu) — bande horizontale, hit MANUEL ──
function ajouterZoneSol(boss, x, demiL, opts = {}) {
    const s = boss.scene;
    const z = {
        x, demiL, expire: s.time.now + (opts.duree ?? 600),
        degats: opts.degats ?? 6, couleur: opts.couleur ?? 0xff6030,
        h: opts.hauteur ?? 16, tick: 0,
        gfx: s.add.graphics().setDepth(DEPTH.EFFETS - 1)
    };
    (boss._zonesSol ??= []).push(z);
    return z;
}
function majZonesSol(boss, player, now) {
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
        }
        return true;
    });
}

// ── Onde de choc qui court le long du sol depuis originX (à SAUTER) ──
function lancerOnde(boss, originX, opts = {}) {
    const s = boss.scene;
    (boss._ondes ??= []).push({
        x: originX, r: 20, vitesse: opts.vitesse ?? 7, max: opts.max ?? 900,
        degats: opts.degats ?? 8, couleur: opts.couleur ?? 0xffd070, deja: false,
        gfx: s.add.graphics().setDepth(DEPTH.EFFETS)
    });
}
function majOndes(boss, player, now) {
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
        // Touche si le joueur est au sol et à la distance du front de l'onde.
        const d = Math.abs(Math.abs(player.x - o.x) - o.r);
        if (d < 22 && joueurAuSol(boss.scene)) degatsJoueur(boss, o.degats, o.couleur);
        return true;
    });
}

// ── Chute de gravats : télégraphe (colonne) puis impact au sol ──
function chuteGravats(boss, x, opts = {}) {
    const s = boss.scene, { solY } = arene(boss);
    const tele = s.add.graphics().setDepth(DEPTH.EFFETS - 2);
    const demiL = opts.demiL ?? 34;
    let t0 = s.time.now; const delai = opts.delai ?? 720;
    const dessine = () => {
        if (!tele.active) return;
        const k = Phaser.Math.Clamp((s.time.now - t0) / delai, 0, 1);
        tele.clear();
        tele.fillStyle(0xff5030, 0.10 + 0.18 * k);
        tele.fillRect(x - demiL, 0, demiL * 2, solY);
        tele.fillStyle(0xffd070, 0.6);
        tele.fillRect(x - demiL, solY - 4, demiL * 2 * k, 4);
    };
    const upd = () => dessine();
    s.events.on('postupdate', upd);
    s.time.delayedCall(delai, () => {
        s.events.off('postupdate', upd); tele.destroy();
        if (boss.mort) return;
        // Bloc qui tombe
        const bloc = s.add.graphics().setDepth(DEPTH.EFFETS);
        bloc.fillStyle(0x6a5a48, 1); bloc.fillRect(-demiL, -26, demiL * 2, 30);
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

function nettoyer(boss, listes) {
    boss.scene.events.once('boss:dead', () => {
        for (const l of listes) (boss[l] ?? []).forEach(o => o?.gfx?.destroy?.());
        boss._corps?.destroy(); boss._aura?.destroy();
    });
}

// ════════════════════════════════════════════════════════════════════
// é1 — LA CARIATIDE  (DÉTRUIRE l'environnement)
// ════════════════════════════════════════════════════════════════════
export function initCariatide(boss) {
    const s = boss.scene, { L, H, solY } = arene(boss);
    boss.phase = 1; boss._vulnerable = false; boss._secret = false; boss._fenetreVulnFin = 0;
    boss._contactInoffensif = true;   // elle blesse par gravats/ondes, pas au contact
    cacherDefaut(boss);
    placer(boss, L * 0.5, solY - 70);   // cible de frappe à hauteur du joueur au sol

    // 3 piliers porteurs (détruits à l'attaque). Dessinés AU-DESSUS du corps
    // pour rester lisibles (le pilier central se lit devant la géante).
    boss._piliers = [0.18, 0.5, 0.82].map(fx => ({
        x: L * fx, hp: 4, hpMax: 4, brise: false, regen: 0,
        gfx: s.add.graphics().setDepth(DEPTH.ENTITES + 2)
    }));
    boss._corps = s.add.graphics().setDepth(DEPTH.ENTITES);
    boss._voute = s.add.graphics().setDepth(DEPTH.ENTITES - 1);
    boss._prochainGravats = s.time.now + 2600;
    boss._prochainSlam = s.time.now + 4200;
    boss._ployee = false;

    installerGate(boss, declencherCariatideMobile);
    brancherAttaque(boss, (info) => onAttaqueCariatide(boss, info));
    nettoyer(boss, ['_piliers']);
    s.events.once('boss:dead', () => { boss._voute?.destroy(); });
    s.afficherMessageFlottant?.('Brise les piliers qui la soutiennent', '#d8c89a');
}

function onAttaqueCariatide(boss, info) {
    if (boss._secret) return;   // en secret phase, plus de piliers
    for (const p of boss._piliers) {
        if (p.brise) continue;
        if (info.dansZone(p.x, arene(boss).solY - 90, 40, 180)) {
            p.hp -= info.degats; info.signalerTouche();
            boss.scene.cameras?.main?.shake?.(60, 0.004);
            if (p.hp <= 0) briserPilier(boss, p);
        }
    }
}

function briserPilier(boss, p) {
    const s = boss.scene, { solY } = arene(boss);
    p.brise = true; p.regen = 0;
    s.audio?.jouerSfx?.('hit');
    s.cameras?.main?.shake?.(220, 0.012);
    if (s.textures.exists('_particule')) {
        const b = s.add.particles(p.x, solY - 90, '_particule', {
            lifespan: 700, speed: { min: 60, max: 220 }, angle: { min: 0, max: 360 },
            gravityY: 500, scale: { start: 0.9, end: 0 },
            tint: [0x6a6457, 0x8a8474, 0xd8c89a], quantity: 18, alpha: { start: 1, end: 0 }
        });
        b.setDepth(DEPTH.EFFETS); b.explode(18); s.time.delayedCall(760, () => b.destroy());
    }
    // Gravats là où le pilier cède.
    chuteGravats(boss, p.x, { delai: 480, degats: 8 });
    const restants = boss._piliers.filter(x => !x.brise).length;
    if (restants === 0) {
        // Tous brisés → elle ploie longuement (exposée), puis rebâtit les piliers.
        boss._ployee = true;
        ouvrir(boss, 5200, 'LA VOÛTE L\'ÉCRASE', '#60ffa0');
        boss._reformerA = s.time.now + 5200;
    } else {
        // Stagger court à chaque pilier qui tombe.
        ouvrir(boss, 1300, 'Elle vacille', '#ffd070');
    }
}

export function updateCariatide(boss, player) {
    const s = boss.scene, now = s.time.now, { L, solY } = arene(boss);
    if (boss.sprite.body) boss.sprite.body.setVelocity(0, 0);
    if (!player) return;

    majZonesSol(boss, player, now);
    majOndes(boss, player, now);

    if (boss._secret) { updateCariatideMobile(boss, player, now); return; }

    majPhases(boss);
    if (boss._vulnerable && now >= boss._fenetreVulnFin) {
        boss._vulnerable = false; boss._ployee = false;
        // Reformer les piliers une fois la fenêtre longue terminée.
        if (boss._reformerA && now >= boss._reformerA) {
            boss._reformerA = 0;
            boss._piliers.forEach(p => { p.brise = false; p.hp = p.hpMax; });
            s.afficherMessageFlottant?.('Elle redresse les colonnes', '#d8c89a');
        }
    }

    // Gravats périodiques depuis la voûte fissurée (cadence ↑ par phase).
    if (now >= boss._prochainGravats) {
        boss._prochainGravats = now + (boss.phase === 1 ? 2600 : boss.phase === 2 ? 1900 : 1300);
        const x = Phaser.Math.Clamp(player.x + (Math.random() - 0.5) * 160, 80, L - 80);
        chuteGravats(boss, x, { degats: 8 });
    }
    // Frappe au sol → onde de choc à sauter (P2+).
    if (boss.phase >= 2 && !boss._ployee && now >= boss._prochainSlam) {
        boss._prochainSlam = now + (boss.phase === 3 ? 3200 : 4200);
        s.cameras?.main?.shake?.(180, 0.01);
        lancerOnde(boss, boss.sprite.x, { degats: 9, couleur: 0xd8c89a });
    }

    dessinerCariatide(boss, now);
}

function dessinerCariatide(boss, now) {
    const { L, solY } = arene(boss), cx = boss.sprite.x;
    const vaultY = solY - 360;                 // sous-face de la voûte (DANS le champ caméra)
    const brisCount = boss._piliers.filter(p => p.brise).length;
    const sag = brisCount * 8;                  // la voûte s'affaisse quand les piliers cèdent

    // ── Voûte maîtresse qu'elle soutient (poutre lourde + fissures) ──
    const v = boss._voute; v.clear();
    v.fillStyle(0x2e2a22, 1); v.fillRect(0, vaultY - 28 + sag, L, 30);
    v.fillStyle(0x4a443a, 1); v.fillRect(0, vaultY - 28 + sag, L, 8);
    if (brisCount > 0) {
        v.lineStyle(3, 0xffcaa0, 0.3 + 0.18 * brisCount);
        for (let i = 0; i < brisCount * 3; i++) { const x = 160 + i * 150; v.lineBetween(x, vaultY + sag, x + 22, vaultY + 10 + sag); }
    }

    // ── Piliers cannelés (chapiteau + base + fissures lumineuses) ──
    for (const p of boss._piliers) {
        const g = p.gfx; g.clear();
        if (p.brise) {
            g.fillStyle(0x4a463c, 1); g.fillRect(p.x - 24, solY - 46, 48, 46);   // moignon
            g.fillStyle(0x35322a, 1); g.fillRect(p.x - 24, solY - 46, 48, 10);
            g.fillStyle(0x5a5448, 1); g.fillCircle(p.x - 28, solY - 6, 11); g.fillCircle(p.x + 26, solY - 4, 8);
        } else {
            const dmg = 1 - p.hp / p.hpMax;
            const h = solY - vaultY;
            // Pierre FROIDE (gris bleuté) → tranche avec le calcaire chaud de la géante.
            g.fillStyle(0x6e7480, 1); g.fillRect(p.x - 22, vaultY, 44, h);
            g.fillStyle(0x9aa0aa, 1); g.fillRect(p.x - 22, vaultY, 12, h);        // facette claire
            g.fillStyle(0x4c515b, 1); g.fillRect(p.x + 12, vaultY, 10, h);        // ombre
            g.lineStyle(1, 0x4c515b, 0.6);
            for (const dx of [-11, 1, 12]) g.lineBetween(p.x + dx, vaultY + 6, p.x + dx, solY - 6);
            g.fillStyle(0xaeb4be, 1); g.fillRect(p.x - 28, vaultY - 14, 56, 16);  // chapiteau
            g.fillStyle(0x868c96, 1); g.fillRect(p.x - 28, solY - 14, 56, 14);    // base
            if (dmg > 0) {
                g.lineStyle(3, 0xffd9a0, 0.45 + 0.5 * dmg); g.setBlendMode(Phaser.BlendModes.ADD);
                g.lineBetween(p.x - 6, solY - 30, p.x + 9, solY - 120 - 90 * dmg);
                g.lineBetween(p.x + 9, solY - 120 - 90 * dmg, p.x - 5, solY - 220 - 90 * dmg);
                g.setBlendMode(Phaser.BlendModes.NORMAL);
            }
        }
    }

    // ── La Cariatide : géante de calcaire, bras levés tenant la voûte ──
    const g = boss._corps; g.clear();
    const fl = intensiteFlash(boss);
    const ploie = boss._ployee ? 34 : 0;
    const baseY = solY;
    const cStone = fl ? 0xffffff : (boss._vulnerable ? 0xcabf94 : 0x9a937e);
    const cLight = fl ? 0xffffff : 0xc8c0aa, cDark = 0x615c50;
    // drapé en cloche (socle)
    g.fillStyle(cStone, 1);
    g.beginPath();
    g.moveTo(cx - 32, baseY - 230 + ploie); g.lineTo(cx + 32, baseY - 230 + ploie);
    g.lineTo(cx + 66, baseY); g.lineTo(cx - 66, baseY); g.closePath(); g.fillPath();
    g.fillStyle(cLight, 0.45); g.fillRect(cx - 32, baseY - 226 + ploie, 16, 226 - ploie);
    g.lineStyle(2, cDark, 0.55);
    for (const dx of [-34, 0, 34]) g.lineBetween(cx + dx * 0.55, baseY - 210 + ploie, cx + dx, baseY - 8);
    // torse
    g.fillStyle(cStone, 1); g.fillRect(cx - 36, baseY - 300 + ploie, 72, 80);
    g.fillStyle(cLight, 0.45); g.fillRect(cx - 36, baseY - 300 + ploie, 16, 80);
    // tête voilée
    g.fillStyle(cStone, 1); g.fillRect(cx - 21, baseY - 346 + ploie, 42, 48);
    g.fillStyle(cDark, 1); g.fillRect(cx - 12, baseY - 332 + ploie, 24, 16);   // visage en ombre
    // bras en arche vers la voûte (se replient si elle ploie)
    const handY = vaultY + 6 + ploie * 2;
    g.lineStyle(24, cStone, 1);
    g.beginPath(); g.moveTo(cx - 30, baseY - 292 + ploie); g.lineTo(cx - 50, (baseY - 320 + handY) / 2); g.lineTo(cx - 30, handY); g.strokePath();
    g.beginPath(); g.moveTo(cx + 30, baseY - 292 + ploie); g.lineTo(cx + 50, (baseY - 320 + handY) / 2); g.lineTo(cx + 30, handY); g.strokePath();
    // cœur exposé (vulnérable) — à hauteur de frappe (= sprite)
    if (boss._vulnerable) {
        const pulse = 0.6 + 0.4 * Math.sin(now / 140);
        g.setBlendMode(Phaser.BlendModes.ADD);
        g.fillStyle(0x60ffa0, 0.45 * pulse); g.fillCircle(cx, boss.sprite.y, 30);
        g.fillStyle(0xa0ffd0, 0.8 * pulse); g.fillCircle(cx, boss.sprite.y, 16);
        g.fillStyle(0xffffff, 0.95 * pulse); g.fillCircle(cx, boss.sprite.y, 7);
        g.setBlendMode(Phaser.BlendModes.NORMAL);
    }
}

// SECRET PHASE — elle arrache la voûte et CHASSE (mobile, toujours vulnérable).
function declencherCariatideMobile(boss) {
    const s = boss.scene, { L } = arene(boss);
    boss._secret = true;
    boss.hp = Math.round(boss.hpMax * 0.42);
    boss._vulnerable = true;     // exposée en permanence désormais
    boss._piliers.forEach(p => { p.brise = true; });
    boss._voute && s.tweens.add({ targets: boss._voute, alpha: 0, duration: 700 });
    boss._prochainSlam = s.time.now + 1400;
    s.afficherMessageFlottant?.('ELLE ARRACHE LA VOÛTE', '#ff6040');
    s.cameras?.main?.shake?.(600, 0.02);
    s.events.emit('boss:phase', boss, 4);
    // Chute de gravats massive (la voûte s'effondre).
    for (let i = 0; i < 6; i++) s.time.delayedCall(i * 140, () => chuteGravats(boss, 120 + Math.random() * (L - 240), { degats: 7 }));
}

function updateCariatideMobile(boss, player, now) {
    const { solY } = arene(boss);
    // Marche vers le joueur (mouvement manuel : pas de collider en gravite:false).
    const dx = player.x - boss.sprite.x;
    const dir = Math.sign(dx) || 1;
    if (Math.abs(dx) > 50) boss.sprite.x += dir * 2.4;
    boss.sprite.y = solY - 70;
    boss.direction = dir;
    // Frappe au sol périodique (onde à sauter).
    if (now >= boss._prochainSlam) {
        boss._prochainSlam = now + 2400;
        boss.scene.cameras?.main?.shake?.(200, 0.012);
        lancerOnde(boss, boss.sprite.x, { degats: 10, couleur: 0xff8050, vitesse: 8 });
    }
    dessinerCariatide(boss, now);
}

// ════════════════════════════════════════════════════════════════════
// é2 — LE COLOSSE DE SEL  (GRIMPER le boss)
// ════════════════════════════════════════════════════════════════════
// Corniches = plateformes one-way de la topographie arene_boss_ruines_2.
// CONTRAT de coordonnées (doit matcher la topo) : zigzag depuis le sol.
const COLOSSE_LEDGES = [
    { x: 720, dy: 60 }, { x: 600, dy: 128 }, { x: 720, dy: 196 },
    { x: 600, dy: 264 }, { x: 720, dy: 332 }, { x: 610, dy: 400 }
];

export function initColosseSel(boss) {
    const s = boss.scene, { L, solY } = arene(boss);
    boss.phase = 1; boss._vulnerable = false; boss._secret = false;
    boss._contactInoffensif = true;   // on grimpe dessus — pas de dégâts au contact (sauf secousse)
    cacherDefaut(boss);
    // Le corps occupe le centre-droit ; le sprite (cible) suit le nœud actif.
    boss._noeuds = COLOSSE_LEDGES.map((l, i) => ({ x: l.x, y: solY - l.dy - 18, idx: i }));
    boss._noeudActif = 1;
    boss._secousseA = s.time.now + 5000;
    boss._secousseTele = 0;
    boss._prochainCristaux = s.time.now + 3000;
    boss._corps = s.add.graphics().setDepth(DEPTH.ENTITES);
    boss._noeudGfx = s.add.graphics().setDepth(DEPTH.ENTITES + 1);
    placer(boss, boss._noeuds[1].x, boss._noeuds[1].y);

    installerGate(boss, declencherColosseEclats);
    nettoyer(boss, []);
    s.events.once('boss:dead', () => { boss._noeudGfx?.destroy(); (boss._eclats ?? []).forEach(e => e.gfx?.destroy()); boss._glyphe?.destroy(); });
    s.afficherMessageFlottant?.('Grimpe son corps, frappe les nœuds de sel', '#9fe0ec');
}

export function updateColosseSel(boss, player) {
    const s = boss.scene, now = s.time.now;
    if (boss.sprite.body) boss.sprite.body.setVelocity(0, 0);
    if (!player) return;

    majZonesSol(boss, player, now);

    if (boss._secret) { updateColosseEclats(boss, player, now); return; }

    majPhases(boss);
    const noeud = boss._noeuds[boss._noeudActif];
    // Vulnérable UNIQUEMENT près du nœud actif (et hors secousse).
    const pres = Math.hypot(player.x - noeud.x, player.y - noeud.y) < 84;
    boss._vulnerable = pres && (now > (boss._secousseTele + 1)) && !boss._enSecousse;
    // Le sprite-cible se cale sur le nœud actif (l'attaque mêlée le touche).
    boss.sprite.x = noeud.x; boss.sprite.y = noeud.y;

    // Secousse périodique : télégraphe puis éjection de quiconque grimpe.
    if (now >= boss._secousseA && !boss._enSecousse) {
        boss._enSecousse = true; boss._secousseTele = now;
        s.afficherMessageFlottant?.('IL SE SECOUE', '#e6f6ff');
        s.cameras?.main?.shake?.(300, 0.006);
        s.time.delayedCall(820, () => {
            if (boss.mort || boss._secret) return;
            s.cameras?.main?.shake?.(320, 0.02);
            // Éjecte le joueur s'il n'est PAS au sol (il grimpe).
            if (!joueurAuSol(s)) {
                const dir = Math.sign(player.x - boss.sprite.x) || -1;
                player.body?.setVelocity(dir * 280, -220);
                degatsJoueur(boss, 9, 0xe6f6ff);
            }
            // Nouveau nœud actif (relocalise la cible → re-grimper).
            boss._noeudActif = (boss._noeudActif + 1 + Math.floor(Math.random() * 2)) % boss._noeuds.length;
            boss._enSecousse = false;
            boss._secousseA = now + (boss.phase === 3 ? 4200 : boss.phase === 2 ? 5200 : 6200);
        });
    }
    // Pluie de cristaux (P2+) : projectiles qui retombent.
    if (boss.phase >= 2 && now >= boss._prochainCristaux) {
        boss._prochainCristaux = now + (boss.phase === 3 ? 1700 : 2400);
        const { L } = arene(boss);
        for (let k = 0; k < (boss.phase === 3 ? 3 : 2); k++) {
            const x = 120 + Math.random() * (L - 240);
            s.events.emit('boss:tir', boss, {
                x, y: 20, cibleX: x, cibleY: 600, vitesse: 230, portee: 900,
                degats: 6, couleur: 0xbfeaf2, halo: 0xe6f6ff
            });
        }
    }
    dessinerColosse(boss, now);
}

function dessinerColosse(boss, now) {
    const { solY } = arene(boss);
    const g = boss._corps; g.clear();
    const fl = intensiteFlash(boss);
    const baseX = 660;
    // Corps massif de sel : blocs empilés et jaggés.
    const blocs = [
        { x: baseX, y: solY - 30, w: 200, h: 60 },
        { x: baseX + 20, y: solY - 110, w: 175, h: 90 },
        { x: baseX - 10, y: solY - 200, w: 160, h: 100 },
        { x: baseX + 25, y: solY - 300, w: 150, h: 110 },
        { x: baseX, y: solY - 392, w: 120, h: 100 }
    ];
    for (let i = 0; i < blocs.length; i++) {
        const b = blocs[i];
        g.fillStyle(fl ? 0xffffff : (i % 2 ? 0xc6bda8 : 0xd6cdb8), 1);
        g.fillRect(b.x - b.w / 2, b.y - b.h, b.w, b.h);
        g.fillStyle(0xe8e0cf, fl ? 0.2 : 0.5);
        g.fillRect(b.x - b.w / 2, b.y - b.h, b.w * 0.3, b.h);   // facette claire
        g.lineStyle(2, 0x9aa8a4, 0.5); g.strokeRect(b.x - b.w / 2, b.y - b.h, b.w, b.h);
    }
    // Veines cristallines bleutées
    g.lineStyle(2, 0x9fe0ec, 0.5);
    g.lineBetween(baseX - 40, solY - 40, baseX + 30, solY - 320);
    // Nœuds de sel : actif = lumineux cyan, autres = ternes.
    const ng = boss._noeudGfx; ng.clear(); ng.setBlendMode(Phaser.BlendModes.ADD);
    for (const n of boss._noeuds) {
        const actif = n.idx === boss._noeudActif && !boss._enSecousse;
        const c = actif ? 0x9fe0ec : 0x5a6a6a;
        const pulse = actif ? (0.6 + 0.4 * Math.sin(now / 150)) : 0.5;
        ng.fillStyle(c, 0.3 * pulse); ng.fillCircle(n.x, n.y, 24);
        ng.fillStyle(actif ? 0xe6f6ff : 0x88a0a0, 0.9 * pulse); ng.fillCircle(n.x, n.y, 9);
    }
}

// SECRET PHASE — il s'effrite en éclats mobiles qui convergent (à empêcher).
function declencherColosseEclats(boss) {
    const s = boss.scene, { L, solY } = arene(boss);
    boss._secret = true; boss._vulnerable = false;
    boss._reform = boss._reform ?? 0;
    boss._glyphe = s.add.graphics().setDepth(DEPTH.PLATEFORMES);
    boss._reformPoint = { x: 660, y: solY - 200 };
    spawnEclats(boss);
    s.afficherMessageFlottant?.('IL SE DISLOQUE — détruis les éclats !', '#9fe0ec');
    s.cameras?.main?.shake?.(600, 0.02);
    s.events.emit('boss:phase', boss, 4);
    // Détecter les coups sur les éclats.
    brancherAttaque(boss, (info) => {
        if (!boss._secret) return;
        for (const e of boss._eclats) {
            if (e.mort) continue;
            if (info.dansZone(e.x, e.y, 40, 40)) {
                e.hp -= info.degats; info.signalerTouche(); flashCorps(boss);
                if (e.hp <= 0) { e.mort = true; e.gfx.destroy(); s.audio?.jouerSfx?.('hit'); }
            }
        }
        if (boss._eclats.every(e => e.mort)) boss._origRecevoir(99999);   // tous détruits → mort
    });
}
function spawnEclats(boss) {
    const s = boss.scene, { L, solY } = arene(boss);
    boss._eclats = [];
    const xs = [L * 0.25, L * 0.45, L * 0.6, L * 0.78];
    for (const x of xs) boss._eclats.push({
        x, y: solY - (40 + Math.random() * 280), hp: 4, mort: false,
        gfx: s.add.graphics().setDepth(DEPTH.ENTITES)
    });
}
function updateColosseEclats(boss, player, now) {
    const s = boss.scene;
    const rp = boss._reformPoint;
    // Glyphe de reformation (pulse).
    const gg = boss._glyphe; gg.clear(); gg.setBlendMode(Phaser.BlendModes.ADD);
    const pr = 0.4 + 0.3 * Math.sin(now / 200);
    gg.lineStyle(3, 0x9fe0ec, 0.6); gg.strokeCircle(rp.x, rp.y, 40);
    gg.fillStyle(0x9fe0ec, 0.10 + 0.10 * pr); gg.fillCircle(rp.x, rp.y, 40);
    let vivants = 0;
    for (const e of boss._eclats) {
        if (e.mort) continue; vivants++;
        // Dérive lente vers le point de reformation.
        const dx = rp.x - e.x, dy = rp.y - e.y, d = Math.hypot(dx, dy) || 1;
        e.x += (dx / d) * 0.8; e.y += (dy / d) * 0.8;
        const g = e.gfx; g.clear();
        const fl = intensiteFlash(boss);
        g.fillStyle(fl ? 0xffffff : 0xd6cdb8, 1);
        g.beginPath(); g.moveTo(e.x, e.y - 20); g.lineTo(e.x + 18, e.y); g.lineTo(e.x, e.y + 20); g.lineTo(e.x - 18, e.y); g.closePath(); g.fillPath();
        g.lineStyle(2, 0x9fe0ec, 0.8); g.strokePath();
        // Contact = dégâts.
        if (Math.hypot(player.x - e.x, player.y - e.y) < 26) degatsJoueur(boss, 8, 0x9fe0ec);
        // Absorbé par le glyphe → reform partielle.
        if (d < 36) { e.mort = true; e.gfx.destroy(); boss._reform++; s.afficherMessageFlottant?.('un éclat se ressoude…', '#ff8060'); }
    }
    // Tous absorbés → le Colosse se reforme (retente la secret phase).
    if (vivants === 0 && boss._eclats.some(e => e.mort) && boss._reform >= boss._eclats.length) {
        boss._reform = 0; boss.hp = Math.max(4, Math.round(boss.hpMax * 0.18));
        s.afficherMessageFlottant?.('LE COLOSSE SE REFORME', '#e6f6ff');
        s.cameras?.main?.shake?.(400, 0.015);
        spawnEclats(boss);
    }
}

// ════════════════════════════════════════════════════════════════════
// é3 — LE PORTEUR DE LANTERNES  (ÉCLAIRER + objets à livrer)
// ════════════════════════════════════════════════════════════════════
// Vasque V1 sur corniche (doit matcher arene_boss_halls_3).
export function initPorteurLanternes(boss) {
    const s = boss.scene, { L, H, solY } = arene(boss);
    boss.phase = 1; boss._vulnerable = false; boss._secret = false; boss._chasse = false;
    boss._contactInoffensif = true;   // il blesse par phalènes/ombre, pas au contact
    cacherDefaut(boss);
    placer(boss, L * 0.5, 200);
    boss._vasques = [
        { x: L * 0.18, y: solY - 18, lit: 0 },
        { x: L * 0.5, y: solY - 84, lit: 0 },   // sur corniche (atteinte d'un saut)
        { x: L * 0.82, y: solY - 18, lit: 0 }
    ];
    boss._vasques.forEach(v => v.gfx = s.add.graphics().setDepth(DEPTH.PLATEFORMES + 1));
    boss._lanternes = []; boss._porte = null;
    boss._prochainLanterne = s.time.now + 800;
    boss._prochainMoth = s.time.now + 2600;
    boss._ombre = s.add.graphics().setDepth(DEPTH.EFFETS + 2);   // voile d'obscurité
    boss._corps = s.add.graphics().setDepth(DEPTH.ENTITES);
    boss._lumGfx = s.add.graphics().setDepth(DEPTH.EFFETS + 1);
    boss._vasquesRequis = 1;

    installerGate(boss, declencherLanternesChasse);
    brancherAttaque(boss, () => {});   // pas de destructible : le boss se frappe directement
    nettoyer(boss, ['_vasques', '_lanternes']);
    s.events.once('boss:dead', () => { boss._ombre?.destroy(); boss._lumGfx?.destroy(); });
    s.afficherMessageFlottant?.('Allume les vasques pour le débusquer de l\'ombre', '#ffd987');
}

function lanterneCreer(boss, x, y) {
    const s = boss.scene;
    const o = { x, y, vy: 0, posee: false, porte: false, mort: false, gfx: s.add.graphics().setDepth(DEPTH.EFFETS) };
    boss._lanternes.push(o); return o;
}

export function updatePorteurLanternes(boss, player) {
    const s = boss.scene, now = s.time.now, { L, solY } = arene(boss);
    if (boss.sprite.body) boss.sprite.body.setVelocity(0, 0);
    if (!player) return;

    if (boss._secret) { updateLanternesChasse(boss, player, now); return; }
    majPhases(boss);
    boss._vasquesRequis = boss.phase;   // P1=1, P2=2, P3=3 vasques à allumer

    // Vol latéral lent du Porteur — figé pendant la fenêtre (il reste à la vasque).
    if (!boss._vulnerable) {
        boss.sprite.x = L * 0.5 + Math.sin(now / 1700) * (L * 0.28);
        boss.sprite.y = 180 + Math.sin(now / 900) * 24;
    }

    // Drop de lanternes (tombent au sol).
    if (now >= boss._prochainLanterne && boss._lanternes.filter(l => !l.mort && !l.posee).length < 3) {
        boss._prochainLanterne = now + 2600;
        lanterneCreer(boss, boss.sprite.x, boss.sprite.y);
    }
    // Physique simple des lanternes (chute).
    for (const l of boss._lanternes) {
        if (l.mort) continue;
        if (l === boss._porte) { l.x = player.x; l.y = player.y - 26; }
        else if (!l.posee) { l.vy = Math.min(l.vy + 0.5, 9); l.y = Math.min(l.y + l.vy, solY - 12); }
    }
    // Ramasser / poser sur une vasque.
    if (!boss._porte) {
        for (const l of boss._lanternes) {
            if (!l.mort && !l.posee && Math.hypot(player.x - l.x, player.y - l.y) < 30) { l.porte = true; boss._porte = l; break; }
        }
    } else {
        for (const v of boss._vasques) {
            if (v.lit <= 0 && Math.hypot(player.x - v.x, player.y - v.y) < 40) {
                v.lit = now + (boss.phase === 3 ? 7000 : 9000);   // s'éteint avec le temps
                boss._porte.mort = true; boss._porte.gfx.destroy();
                boss._lanternes = boss._lanternes.filter(x => x !== boss._porte); boss._porte = null;
                s.audio?.jouerSfx?.('land'); s.afficherMessageFlottant?.('Vasque allumée', '#ffd987');
                break;
            }
        }
    }
    // Expiration des vasques.
    for (const v of boss._vasques) if (v.lit > 0 && now >= v.lit) v.lit = 0;
    const nbLit = boss._vasques.filter(v => v.lit > 0).length;

    // Assez de vasques allumées → le Porteur est débusqué (fenêtre).
    if (!boss._vulnerable && nbLit >= boss._vasquesRequis) {
        const vCible = boss._vasques.find(v => v.lit > 0);
        boss.sprite.x = vCible.x; boss.sprite.y = vCible.y - 60;
        ouvrir(boss, 4200, 'IL EST DÉBUSQUÉ', '#ffd987');
    }
    if (boss._vulnerable && now >= boss._fenetreVulnFin) boss._vulnerable = false;

    // Nuée de phalènes (projectiles vers le joueur).
    if (now >= boss._prochainMoth && !boss._vulnerable) {
        boss._prochainMoth = now + (boss.phase === 3 ? 2000 : 2900);
        const a = Math.atan2(player.y - boss.sprite.y, player.x - boss.sprite.x);
        for (let k = -1; k <= 1; k++) tirRadial(boss, a + k * 0.22, { vitesse: 150, degats: 6, couleur: 0x6a5a7a, halo: 0xffb040 });
    }
    // Tendrils d'ombre rampants depuis les bords (dégâts dans le noir au sol).
    majOmbre(boss, player, now, nbLit);
    dessinerLanternes(boss, now, nbLit);
}

function majOmbre(boss, player, now, nbLit) {
    const { L, solY } = arene(boss);
    // L'obscurité gagne ; les zones éclairées sont sûres.
    boss._ombre.clear();
    const noirceur = Phaser.Math.Clamp(0.5 - nbLit * 0.12, 0.12, 0.5);
    boss._ombre.fillStyle(0x05030a, noirceur);
    boss._ombre.fillRect(0, 0, L, arene(boss).H);
    // « trous » de lumière (vasques) — soustraits via ADD lumineux dans _lumGfx.
    // Dégâts si le joueur est au sol ET hors de toute lumière (les tendrils mordent).
    const dansLumiere = estDansLumiere(boss, player.x, player.y, now);
    if (joueurAuSol(boss.scene) && !dansLumiere && now >= (boss._ombreTick ?? 0)) {
        boss._ombreTick = now + 600; degatsJoueur(boss, 5, 0x4a2a6a);
    }
}

function estDansLumiere(boss, x, y, now) {
    if (boss._porte) { if (Math.hypot(x - boss._porte.x, y - boss._porte.y) < 110) return true; }
    for (const v of boss._vasques) if (v.lit > 0 && Math.hypot(x - v.x, y - v.y) < 130) return true;
    return false;
}

function dessinerLanternes(boss, now, nbLit) {
    const { solY } = arene(boss);
    // Halos de lumière (vasques + lanterne portée).
    const lg = boss._lumGfx; lg.clear(); lg.setBlendMode(Phaser.BlendModes.ADD);
    for (const v of boss._vasques) {
        const g = v.gfx; g.clear();
        // pied de vasque
        g.fillStyle(0x3a3030, 1); g.fillRect(v.x - 10, v.y - 18, 20, 18);
        g.fillStyle(v.lit > 0 ? 0xffb040 : 0x5a4a3a, 1); g.fillCircle(v.x, v.y - 22, 10);
        if (v.lit > 0) {
            const k = 0.5 + 0.5 * Math.sin(now / 160);
            lg.fillStyle(0xffb040, 0.10 * k); lg.fillCircle(v.x, v.y - 22, 130);
            lg.fillStyle(0xffd987, 0.16 * k); lg.fillCircle(v.x, v.y - 22, 70);
        }
    }
    // Lanternes au sol / portée.
    for (const l of boss._lanternes) {
        if (l.mort) continue;
        const g = l.gfx; g.clear(); g.setBlendMode(Phaser.BlendModes.ADD);
        g.fillStyle(0xffb040, 0.25); g.fillCircle(l.x, l.y, 18);
        g.fillStyle(0xffe9b0, 0.95); g.fillRect(l.x - 6, l.y - 8, 12, 16);
        g.lineStyle(1, 0xc08020, 1); g.strokeRect(l.x - 6, l.y - 8, 12, 16);
        if (l === boss._porte) { lg.fillStyle(0xffb040, 0.12); lg.fillCircle(l.x, l.y, 110); }
    }
    // Corps du Porteur (silhouette voilée — révélée si vulnérable/éclairé).
    const g = boss._corps; g.clear();
    const cx = boss.sprite.x, cy = boss.sprite.y, fl = intensiteFlash(boss);
    const revele = boss._vulnerable;
    g.fillStyle(fl ? 0xffffff : (revele ? 0x6a5a4a : 0x140f1c), revele ? 1 : 0.92);
    // robe en cloche
    g.beginPath(); g.moveTo(cx, cy - 46); g.lineTo(cx + 34, cy + 46); g.lineTo(cx - 34, cy + 46); g.closePath(); g.fillPath();
    g.fillStyle(fl ? 0xffffff : (revele ? 0x8a7a5a : 0x241a30), 1);
    g.fillCircle(cx, cy - 50, 16);   // capuche
    if (revele) { g.setBlendMode(Phaser.BlendModes.ADD); g.fillStyle(0xffb040, 0.4 + 0.3 * Math.sin(now / 150)); g.fillCircle(cx, cy, 18); g.setBlendMode(Phaser.BlendModes.NORMAL); }
    else { g.fillStyle(0xffb040, 0.8); g.fillCircle(cx - 22, cy - 6, 5); g.fillCircle(cx + 22, cy - 6, 5); }   // yeux
    // Lanterne-bâton qu'il tient
    g.fillStyle(0xffb040, 0.9); g.fillCircle(cx + 30, cy - 20, 6);
}

// SECRET PHASE — tout s'éteint, TU portes la lumière, il la TRAQUE.
function declencherLanternesChasse(boss) {
    const s = boss.scene, { L, solY } = arene(boss);
    boss._secret = true; boss._chasse = true; boss._vulnerable = false;
    boss.hp = Math.round(boss.hpMax * 0.4);
    boss._vasques.forEach(v => { v.lit = 0; });
    boss._lanternes.forEach(l => { if (l !== boss._porte) { l.mort = true; l.gfx.destroy(); } });
    // Le joueur reçoit d'office UNE lanterne (la seule lumière).
    if (!boss._porte) boss._porte = lanterneCreer(boss, player_x_safe(s), 0);
    boss._porte.porte = true;
    boss._prochainLunge = s.time.now + 1500; boss._lungeEtat = 'idle';
    s.afficherMessageFlottant?.('TOUT S\'ÉTEINT — il traque ta lumière', '#ff6040');
    s.cameras?.main?.flash?.(500, 0, 0, 0);
    s.events.emit('boss:phase', boss, 5);
}
function player_x_safe(s) { return s.player?.x ?? 480; }

function updateLanternesChasse(boss, player, now) {
    const s = boss.scene, { L, solY } = arene(boss);
    // La lanterne portée suit le joueur (sa seule bulle de lumière).
    if (boss._porte) { boss._porte.x = player.x; boss._porte.y = player.y - 20; }

    // Obscurité quasi totale + bulle de lumière autour du joueur.
    boss._ombre.clear(); boss._ombre.fillStyle(0x04020a, 0.66); boss._ombre.fillRect(0, 0, L, arene(boss).H);
    const lg = boss._lumGfx; lg.clear(); lg.setBlendMode(Phaser.BlendModes.ADD);
    lg.fillStyle(0xffb040, 0.12); lg.fillCircle(player.x, player.y, 130);
    lg.fillStyle(0xffd987, 0.18); lg.fillCircle(player.x, player.y, 70);

    // Il fonce sur la LUMIÈRE (le joueur). Cycle : approche → charge télégraphée → exposé.
    const dx = player.x - boss.sprite.x, dir = Math.sign(dx) || 1;
    if (boss._lungeEtat === 'idle') {
        boss.sprite.x += dir * 1.6; boss.sprite.y += (player.y - boss.sprite.y) * 0.03;
        if (now >= boss._prochainLunge) { boss._lungeEtat = 'tele'; boss._lungeA = now + 600; boss._lungeDir = dir; s.afficherMessageFlottant?.('!', '#ff6040'); }
    } else if (boss._lungeEtat === 'tele') {
        if (now >= boss._lungeA) { boss._lungeEtat = 'charge'; boss._lungeFin = now + 420; }
    } else if (boss._lungeEtat === 'charge') {
        boss.sprite.x += boss._lungeDir * 11;
        if (Math.abs(player.x - boss.sprite.x) < 30 && Math.abs(player.y - boss.sprite.y) < 60) degatsJoueur(boss, 12, 0xff6040);
        if (now >= boss._lungeFin) { boss._lungeEtat = 'expose'; boss._vulnerable = true; boss._fenetreVulnFin = now + 1500; s.afficherMessageFlottant?.('exposé !', '#60ffa0'); }
    } else if (boss._lungeEtat === 'expose') {
        if (now >= boss._fenetreVulnFin) { boss._vulnerable = false; boss._lungeEtat = 'idle'; boss._prochainLunge = now + 1800; }
    }
    boss.sprite.x = Phaser.Math.Clamp(boss.sprite.x, 40, L - 40);
    boss.direction = dir;
    // Dégâts si le joueur reste collé dans le noir trop longtemps ? Non : la bulle le protège.
    dessinerLanternes(boss, now, 0);
}

// ════════════════════════════════════════════════════════════════════
// é4 — L'EFFIGIE ARDENTE  (KITER vers l'eau)
// ════════════════════════════════════════════════════════════════════
// Bassins = zones d'eau au sol (doivent matcher arene_boss_halls_4).
export function initEffigieArdente(boss) {
    const s = boss.scene, { L, solY } = arene(boss);
    boss.phase = 1; boss._vulnerable = false; boss._secret = false;
    boss._hot = true; boss._eteint = false;
    cacherDefaut(boss);
    // gravite:true → un collider a été posé par GameScene. On marche au sol.
    boss._bassins = [{ x0: L * 0.18, x1: L * 0.30 }, { x0: L * 0.70, x1: L * 0.82 }];
    boss._refroidies = [];   // bandes de sol refroidies (sûres en secret phase)
    boss._prochainTrail = s.time.now + 1400;
    boss._prochainBraises = s.time.now + 3000;
    boss._corps = s.add.graphics().setDepth(DEPTH.ENTITES);
    boss._bassinGfx = s.add.graphics().setDepth(DEPTH.PLATEFORMES - 1);
    boss._refroiGfx = s.add.graphics().setDepth(DEPTH.PLATEFORMES - 1);
    boss._brasierGfx = s.add.graphics().setDepth(DEPTH.EFFETS - 2);

    installerGate(boss, declencherEffigieBrasier);
    brancherAttaque(boss, () => {});
    nettoyer(boss, []);
    s.events.once('boss:dead', () => { boss._bassinGfx?.destroy(); boss._refroiGfx?.destroy(); boss._brasierGfx?.destroy(); });
    s.afficherMessageFlottant?.('Attire-la dans l\'eau pour l\'éteindre', '#ff9050');
}

function dansBassin(boss, x) { return boss._bassins.some(b => x >= b.x0 && x <= b.x1); }
function dansRefroidie(boss, x) { return boss._refroidies.some(r => Math.abs(x - r) < 60); }

export function updateEffigieArdente(boss, player) {
    const s = boss.scene, now = s.time.now, { L, solY } = arene(boss);
    if (!player) return;

    majZonesSol(boss, player, now);
    dessinerBassins(boss, now);

    if (boss._secret) { updateEffigieBrasier(boss, player, now); return; }
    majPhases(boss);

    // Chasse le joueur au sol (walker).
    const dx = player.x - boss.sprite.x, dir = Math.sign(dx) || 1;
    const v = boss._eteint ? boss.def.vitesse * 0.25 : boss.def.vitesse * (1 + 0.12 * (boss.phase - 1));
    if (boss.sprite.body) boss.sprite.body.setVelocityX(Math.abs(dx) > 30 ? dir * v : 0);
    boss.direction = dir;

    // Au-dessus d'un bassin et encore ardente → extinction (fenêtre de vuln).
    if (boss._hot && !boss._eteint && dansBassin(boss, boss.sprite.x)) {
        boss._hot = false; boss._eteint = true;
        ouvrir(boss, 3600, 'L\'EFFIGIE S\'ÉTEINT', '#a0e0ff');
        vapeur(boss, boss.sprite.x, solY);
        // Refroidit la dalle où elle s'éteint (sûre plus tard).
        boss._refroidies.push(boss.sprite.x);
    }
    if (boss._eteint && now >= boss._fenetreVulnFin) {
        boss._eteint = false; boss._hot = true; boss._vulnerable = false;
        s.afficherMessageFlottant?.('elle se rallume', '#ff5020');
    }

    // Traînées de feu derrière elle (uniquement ardente).
    if (boss._hot && now >= boss._prochainTrail) {
        boss._prochainTrail = now + (boss.phase === 3 ? 900 : boss.phase === 2 ? 1200 : 1600);
        if (!dansBassin(boss, boss.sprite.x)) ajouterZoneSol(boss, boss.sprite.x, 26, { duree: 2600, degats: 7, couleur: 0xff5020, hauteur: 14 });
    }
    // Gerbes de braises (P2+) : projectiles en cloche.
    if (boss._hot && boss.phase >= 2 && now >= boss._prochainBraises) {
        boss._prochainBraises = now + (boss.phase === 3 ? 2100 : 2900);
        for (let k = -2; k <= 2; k++) {
            s.events.emit('boss:tir', boss, {
                x: boss.sprite.x, y: boss.sprite.y - 30, cibleX: boss.sprite.x + k * 60, cibleY: boss.sprite.y - 120,
                vitesse: 200, portee: 700, degats: 6, couleur: 0xff7030, halo: 0xffb070
            });
        }
    }
    dessinerEffigie(boss, now);
}

function vapeur(boss, x, solY) {
    const s = boss.scene;
    if (!s.textures.exists('_particule')) return;
    const b = s.add.particles(x, solY - 20, '_particule', {
        lifespan: 900, speedY: { min: -60, max: -20 }, speedX: { min: -30, max: 30 },
        scale: { start: 0.8, end: 0 }, tint: [0xffffff, 0xc0e0ff], quantity: 3, frequency: 40,
        blendMode: Phaser.BlendModes.ADD, alpha: { start: 0.6, end: 0 }
    });
    b.setDepth(DEPTH.EFFETS); s.time.delayedCall(1400, () => { b.stop(); s.time.delayedCall(900, () => b.destroy()); });
}

function dessinerBassins(boss, now) {
    const { solY } = arene(boss);
    const g = boss._bassinGfx; g.clear();
    for (const b of boss._bassins) {
        g.fillStyle(0x10324a, 0.9); g.fillRect(b.x0, solY - 8, b.x1 - b.x0, 14);
        g.fillStyle(0x2a86b8, 0.5 + 0.2 * Math.sin(now / 400)); g.fillRect(b.x0, solY - 8, b.x1 - b.x0, 6);
        g.lineStyle(2, 0x8fd8ff, 0.5); g.lineBetween(b.x0, solY - 8, b.x1, solY - 8);
    }
    // Dalles refroidies (sûres).
    const r = boss._refroiGfx; r.clear();
    for (const rx of boss._refroidies) {
        r.fillStyle(0x3a5a6a, 0.5); r.fillRect(rx - 60, solY - 6, 120, 8);
        r.lineStyle(1, 0x8fd8ff, 0.4); r.strokeRect(rx - 60, solY - 6, 120, 8);
    }
}

function dessinerEffigie(boss, now) {
    const g = boss._corps; g.clear();
    const cx = boss.sprite.x, cy = boss.sprite.y, fl = intensiteFlash(boss);
    const h = boss.def.hauteur, w = boss.def.largeur;
    // Carcasse de bois/charbon.
    const cCorps = boss._eteint ? 0x2a2420 : (fl ? 0xffffff : 0x3a1a12);
    g.fillStyle(cCorps, 1);
    g.beginPath(); g.moveTo(cx, cy - h / 2); g.lineTo(cx + w / 2, cy + h / 2); g.lineTo(cx - w / 2, cy + h / 2); g.closePath(); g.fillPath();
    g.fillStyle(cCorps, 1); g.fillCircle(cx, cy - h / 2 + 6, 16);
    // Fissures de lave / flammes (éteintes = grises).
    g.setBlendMode(Phaser.BlendModes.ADD);
    if (boss._eteint) {
        g.fillStyle(0xc0e0ff, 0.25 + 0.1 * Math.sin(now / 200)); g.fillCircle(cx, cy, 14);
    } else {
        const k = 0.6 + 0.4 * Math.sin(now / 120);
        g.fillStyle(0xff5020, 0.5 * k); g.fillCircle(cx, cy, 22);
        g.fillStyle(0xffb050, 0.8 * k); g.fillCircle(cx, cy - 4, 10);
        g.lineStyle(2, 0xff7030, 0.7 * k);
        g.lineBetween(cx - 10, cy - 20, cx - 4, cy + 10);
        g.lineBetween(cx + 10, cy - 16, cx + 2, cy + 12);
        // Cornes ardentes
        g.lineStyle(3, 0xff6020, 0.8); g.lineBetween(cx - 10, cy - h / 2, cx - 18, cy - h / 2 - 16); g.lineBetween(cx + 10, cy - h / 2, cx + 18, cy - h / 2 - 16);
    }
    g.setBlendMode(Phaser.BlendModes.NORMAL);
}

// SECRET PHASE — l'arène s'embrase ; seules les dalles refroidies + bassins sont sûres.
function declencherEffigieBrasier(boss) {
    const s = boss.scene, { L } = arene(boss);
    boss._secret = true; boss._hot = true; boss._eteint = false; boss._vulnerable = false;
    boss.hp = Math.round(boss.hpMax * 0.4);
    boss._brasierActif = true;
    s.afficherMessageFlottant?.('L\'ARÈNE S\'EMBRASE — survis sur les dalles froides', '#ff6040');
    s.cameras?.main?.flash?.(500, 120, 30, 0);
    s.cameras?.main?.shake?.(600, 0.02);
    s.events.emit('boss:phase', boss, 4);
}

function updateEffigieBrasier(boss, player, now) {
    const s = boss.scene, { L, solY } = arene(boss);
    // Brasier global : tout le sol brûle SAUF bassins + dalles refroidies.
    const g = boss._brasierGfx; g.clear(); g.setBlendMode(Phaser.BlendModes.ADD);
    const k = 0.4 + 0.2 * Math.sin(now / 110);
    g.fillStyle(0xff4010, 0.16 * k); g.fillRect(0, solY - 20, L, 24);
    g.fillStyle(0xffa030, 0.10 * k); g.fillRect(0, solY - 34, L, 18);
    // Chase au sol.
    const dx = player.x - boss.sprite.x, dir = Math.sign(dx) || 1;
    const v = boss._eteint ? boss.def.vitesse * 0.25 : boss.def.vitesse * 1.15;
    if (boss.sprite.body) boss.sprite.body.setVelocityX(Math.abs(dx) > 30 ? dir * v : 0);
    boss.direction = dir;
    // Extinction sur bassin (seule façon de la tuer).
    if (boss._hot && !boss._eteint && dansBassin(boss, boss.sprite.x)) {
        boss._hot = false; boss._eteint = true; ouvrir(boss, 3200, 'ÉTEINTE — frappe !', '#a0e0ff'); vapeur(boss, boss.sprite.x, solY);
    }
    if (boss._eteint && now >= boss._fenetreVulnFin) { boss._eteint = false; boss._hot = true; boss._vulnerable = false; }
    // Dégâts du brasier : au sol, hors bassin/dalle froide.
    if (joueurAuSol(s) && !dansBassin(boss, player.x) && !dansRefroidie(boss, player.x) && now >= (boss._brasierTick ?? 0)) {
        boss._brasierTick = now + 360; degatsJoueur(boss, 7, 0xff4010);
    }
    dessinerEffigie(boss, now);
}
