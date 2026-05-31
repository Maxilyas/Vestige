// Boss VUE DE DESSUS du Cœur du Reflux — Le Doyen (é9) & Le Cœur (é10).
// Refonte « esprit WoW » (cf. BOSS_CONCEPTS.md §22-23) : deux combats aux
// VERBES opposés pour éliminer le « déjà-vu ».
//
//   • LE DOYEN (é9) — MACRO-GESTION : boss mobile entre 4 tribunes, livraison
//     de Preuves sous DoT (« Outrage au Tribunal », soft-rage), faucheux
//     rétro-temporel qui retrace tes pas, secret phase « La Cour se retire »
//     (arène de survie : ondes par quadrant + parade en mouvement).
//
//   • LE CŒUR (é10) — MICRO-EXÉCUTION : chaque phase change de verbe — sceaux +
//     DPS-check des siphons (P1), relier les battements (P2), gavage à
//     contre-aspiration (P3), secret phase « Le Procès de tes Choix » (miroir
//     de ton style de jeu + montée du Reflux + sceaux de pourtour).
//
// Adaptation top-down : pas de saut → les « sceaux en hauteur » deviennent des
// sceaux sur le POURTOUR atteints en dash. Mort du Cœur → FinScene (déjà câblé).

import { DEPTH } from '../render/PainterlyRenderer.js';
import {
    degatsJoueur, tirRadial, anneau, faisceauBalayeur,
    creerMandala, dessinerMandala, creerObjet, dessinerObjet, detruireObjet
} from './BossHelpers.js';

const CX = 480, CY = 270, RX = 360, RY = 200;   // arène ovale (canvas 960×540)

// Positions cardinales N/E/S/O (tribunes / sceaux).
function cardinaux(facteur = 0.9) {
    const out = [];
    for (let i = 0; i < 4; i++) {
        const a = -Math.PI / 2 + i * (Math.PI / 2);
        out.push({ x: CX + Math.cos(a) * RX * facteur, y: CY + Math.sin(a) * RY * facteur });
    }
    return out;  // [N, E, S, O]
}

function quadrantDe(x, y) {
    // 0=NE,1=SE,2=SO,3=NO selon l'angle depuis le centre.
    const a = Math.atan2(y - CY, x - CX);
    return ((Math.floor((a + Math.PI * 2) / (Math.PI / 2)) % 4) + 4) % 4;
}

// ════════════════════════════════════════════════════════════════════
// LE DOYEN — Procès du Vestige (macro-gestion, soft-rage, danse)
// ════════════════════════════════════════════════════════════════════
export function initDoyen(boss) {
    const s = boss.scene, now = s.time.now;
    boss.phase = 1; boss._spin = 0;
    boss._vulnerable = false; boss._fenetreVulnFin = 0;
    boss._secret = false;
    boss._tribunes = cardinaux(0.92);
    boss._balance = { x: CX, y: CY };
    boss._tribuneIdx = 0;
    boss._prochainTp = now + 3000;
    boss._prochainVerdict = now + 4500;
    boss._prochainPreuve = now + 1200;
    boss._prochainReaper = now + 6000;
    boss._objets = []; boss._porte = null; boss._depots = 0;
    boss._trace = []; boss._reapers = [];
    if (boss.sprite.body) { boss.sprite.body.allowGravity = false; boss.sprite.body.setVelocity(0, 0); }
    teleporterDoyen(boss, 0, true);
    creerMandala(boss, 0xffd070);

    // Balance centrale (cible de dépôt).
    boss._balanceGfx = s.add.graphics().setDepth(DEPTH.PLATEFORMES + 1);

    // Gate d'invulnérabilité + secret phase à 0 PV.
    boss._origRecevoir = boss.recevoirDegats.bind(boss);
    boss.recevoirDegats = function (m) {
        if (boss.mort) return;
        if (!boss._vulnerable) { s.cameras?.main?.flash?.(30, 80, 80, 60); return; }
        boss.hp -= m;
        if (boss.hp <= 0) {
            if (!boss._secret) { boss._secret = true; declencherCourSeRetire(boss); }
            else boss._origRecevoir(99999);   // vraie mort → drop + porte
        }
    };
    s.events.once('boss:dead', () => {
        boss._objets.forEach(o => detruireObjet(o));
        boss._balanceGfx?.destroy(); boss._tribunesGfx?.forEach(g => g.destroy());
        boss._reapers.forEach(r => r.gfx?.destroy());
    });
    boss._tribunesGfx = boss._tribunes.map(() => s.add.graphics().setDepth(DEPTH.PLATEFORMES + 1));
}

function teleporterDoyen(boss, idx, instant) {
    boss._tribuneIdx = idx;
    const t = boss._tribunes[idx];
    boss.sprite.x = t.x; boss.sprite.y = t.y;
    if (boss.sprite.body) boss.sprite.body.reset(t.x, t.y);
    if (!instant) boss.scene.cameras?.main?.flash?.(120, 120, 100, 40);
}

function dessinerTribunesDoyen(boss) {
    for (let i = 0; i < boss._tribunes.length; i++) {
        const t = boss._tribunes[i], g = boss._tribunesGfx[i]; g.clear();
        const actif = i === boss._tribuneIdx;
        g.lineStyle(2, actif ? 0xffd070 : 0x6a5a3a, 0.7); g.strokeCircle(t.x, t.y, 30);
    }
    // Balance centrale (s'illumine si on porte une Preuve).
    const g = boss._balanceGfx; g.clear();
    const chaud = !!boss._porte;
    g.lineStyle(3, chaud ? 0x60ffa0 : 0xffd070, 0.8); g.strokeCircle(CX, CY, 40);
    g.fillStyle(chaud ? 0x60ffa0 : 0xffd070, chaud ? 0.16 : 0.06); g.fillCircle(CX, CY, 40);
}

function declencherCourSeRetire(boss) {
    const s = boss.scene;
    boss._vulnerable = true;              // géant exposé : on peut le frapper
    boss.hp = Math.round(boss.hpMax * 0.30);
    boss._objets.forEach(o => detruireObjet(o)); boss._objets = []; boss._porte = null;
    teleporterDoyen(boss, 0, true);
    boss.sprite.x = CX; boss.sprite.y = CY;
    if (boss.sprite.body) boss.sprite.body.reset(CX, CY);
    boss._prochainSlam = s.time.now + 1200;
    boss._slamSafe = -1;
    s.afficherMessageFlottant?.('LA COUR SE RETIRE', '#ffd070');
    s.cameras?.main?.shake?.(500, 0.012);
    s.events.emit('boss:phase', boss, 4);
}

export function updateDoyen(boss, player) {
    const s = boss.scene, now = s.time.now;
    if (boss.sprite.body) boss.sprite.body.setVelocity(0, 0);
    if (!player) return;

    // Trace du joueur (pour le faucheux rétro-temporel) — ~3 s.
    boss._trace.push({ x: player.x, y: player.y, t: now });
    while (boss._trace.length > 2 && boss._trace[0].t < now - 3200) boss._trace.shift();

    boss._spin += 0.02;
    dessinerMandala(boss, boss._spin, boss._secret ? 1.4 : 0.8);

    if (boss._secret) { updateDoyenSecret(boss, player, now); return; }

    dessinerTribunesDoyen(boss);

    // Transitions de phase.
    const ratio = boss.hp / Math.max(1, boss.hpMax);
    if (boss.phase === 1 && ratio <= 0.66) { boss.phase = 2; s.events.emit('boss:phase', boss, 2); }
    if (boss.phase === 2 && ratio <= 0.33) { boss.phase = 3; s.events.emit('boss:phase', boss, 3); }
    const requis = boss.phase;            // 1 / 2 / 3 dépôts pour ouvrir

    // Téléportation entre tribunes (le boss DANSE).
    if (!boss._vulnerable && now >= boss._prochainTp) {
        boss._prochainTp = now + (boss.phase === 3 ? 2200 : 3000);
        teleporterDoyen(boss, (boss._tribuneIdx + 1 + Math.floor(Math.random() * 3)) % 4);
    }

    // « Le Regard » : faisceau balayeur depuis la tribune courante.
    faisceauBalayeur(boss, boss._spin * (1.0 + boss.phase * 0.4), { degats: 6 });

    // Drop de Preuves (à ramasser).
    if (!boss._vulnerable && now >= boss._prochainPreuve && boss._objets.length < 3) {
        boss._prochainPreuve = now + (boss.phase === 1 ? 2600 : 1900);
        const t = boss._tribunes[(boss._tribuneIdx + 2) % 4];   // tribune opposée
        boss._objets.push(creerObjet(s, t.x + (Math.random() - 0.5) * 40, t.y + (Math.random() - 0.5) * 40, 'preuve'));
    }

    // Portage : ramasser / DoT « Outrage au Tribunal » / déposer sur la Balance.
    if (!boss._porte) {
        for (const o of boss._objets) {
            if (!o.mort && !o.porte && Math.hypot(player.x - o.x, player.y - o.y) < 34) { o.porte = true; boss._porte = o; break; }
        }
    } else {
        boss._porte.x = player.x; boss._porte.y = player.y - 26; dessinerObjet(s, boss._porte);
        // Soft-rage : DoT croissant tant qu'on garde la Preuve (bypass i-frames).
        if (now >= (boss._dotTick ?? 0)) {
            boss._dotTick = now + 700;
            s.resonance?.prendreDegats?.(2 + boss.phase);
            s.flashJoueur?.(0x9a40c0);
        }
        if (Math.hypot(player.x - CX, player.y - CY) < 46) {
            detruireObjet(boss._porte);
            boss._objets = boss._objets.filter(o => o !== boss._porte); boss._porte = null;
            boss._depots++;
            s.afficherMessageFlottant?.('Preuve déposée', '#ffd070');
            if (boss._depots >= requis) {
                boss._depots = 0; boss._vulnerable = true; boss._fenetreVulnFin = now + 5000;
                s.afficherMessageFlottant?.('LE DOYEN EST CONDAMNÉ', '#60ffa0');
                teleporterDoyen(boss, boss._tribuneIdx, true);  // descend (reste exposé)
            }
        }
    }
    if (boss._vulnerable && now >= boss._fenetreVulnFin) { boss._vulnerable = false; }

    // Orbe de Verdict (à parer).
    if (now >= boss._prochainVerdict) {
        boss._prochainVerdict = now + (boss.phase === 3 ? 2600 : 3600);
        s.events.emit('boss:tir', boss, {
            x: boss.sprite.x, y: boss.sprite.y, cibleX: player.x, cibleY: player.y,
            vitesse: 105, portee: 1100, degats: Math.round((boss.def.degatsContact ?? 22) * 0.9),
            couleur: 0xffd070, halo: 0xffe0a0
        });
    }

    // Faucheux rétro-temporel (P2+) : retrace tes 3 dernières secondes.
    if (boss.phase >= 2 && now >= boss._prochainReaper) {
        boss._prochainReaper = now + 5500;
        lancerFaucheux(boss);
    }
    majFaucheux(boss, player, now);

    // Lignes d'accusation convergentes (P3).
    if (boss.phase === 3 && now % 1000 < 18) {
        for (const t of boss._tribunes) {
            const a = Math.atan2(player.y - t.y, player.x - t.x);
            tirRadial(boss, a, { x: t.x, y: t.y, vitesse: 200, degats: 5 });
        }
    }
}

function lancerFaucheux(boss) {
    if (boss._trace.length < 4) return;
    const g = boss.scene.add.graphics().setDepth(DEPTH.EFFETS).setBlendMode(Phaser.BlendModes.ADD);
    boss._reapers.push({ trace: boss._trace.slice(), idx: 0, gfx: g });
    boss.scene.afficherMessageFlottant?.('Le Passé est jugé', '#a0c0ff');
}

function majFaucheux(boss, player, now) {
    for (const r of boss._reapers) {
        if (r.idx >= r.trace.length) { r.gfx.destroy(); r.fini = true; continue; }
        r.idx += 2;                                   // vitesse de retrace
        const p = r.trace[Math.min(r.idx, r.trace.length - 1)];
        const g = r.gfx; g.clear();
        g.fillStyle(0xa0c0ff, 0.25); g.fillCircle(p.x, p.y, 26);
        g.fillStyle(0xe0f0ff, 0.9); g.fillCircle(p.x, p.y, 12);
        if (Math.hypot(player.x - p.x, player.y - p.y) < 26) degatsJoueur(boss, 8, 0xa0c0ff);
    }
    boss._reapers = boss._reapers.filter(r => !r.fini);
}

function updateDoyenSecret(boss, player, now) {
    const s = boss.scene;
    // ── Onde de choc par QUADRANT : un quadrant safe s'allume, le reste frappe. ──
    if (boss._slamSafe < 0 && now >= boss._prochainSlam) {
        boss._slamSafe = Math.floor(Math.random() * 4);
        boss._slamImpact = now + 1300;                 // fenêtre de lecture
    }
    // Télégraphe des quadrants.
    if (!boss._slamGfx) boss._slamGfx = s.add.graphics().setDepth(DEPTH.PLATEFORMES);
    const g = boss._slamGfx; g.clear();
    if (boss._slamSafe >= 0) {
        for (let q = 0; q < 4; q++) {
            const a0 = -Math.PI + q * (Math.PI / 2);
            const safe = q === boss._slamSafe;
            g.fillStyle(safe ? 0x4060ff : 0xff3030, safe ? 0.16 : 0.10);
            g.slice(CX, CY, 520, a0, a0 + Math.PI / 2, false); g.fillPath();
        }
        if (now >= boss._slamImpact) {
            // IMPACT : hors du quadrant bleu = lourd.
            if (quadrantDe(player.x, player.y) !== boss._slamSafe) degatsJoueur(boss, 18, 0xff3030);
            s.cameras?.main?.shake?.(220, 0.014);
            boss._slamSafe = -1;
            boss._prochainSlam = now + 2200;
        }
    }
    // Orbe de Verdict entre les frappes (à parer EN COURANT).
    if (now >= (boss._prochainVerdict ?? 0)) {
        boss._prochainVerdict = now + 2000;
        s.events.emit('boss:tir', boss, {
            x: CX, y: CY, cibleX: player.x, cibleY: player.y,
            vitesse: 120, portee: 1100, degats: 16, couleur: 0xffd070, halo: 0xffe0a0
        });
    }
}

// ════════════════════════════════════════════════════════════════════
// LE CŒUR — Polymorphe (micro-exécution ; mort → FinScene)
// ════════════════════════════════════════════════════════════════════
const SCEAU_OK = 0x60ffa0, SCEAU_CIBLE = 0xffd070, SCEAU_OFF = 0x6a3050;

export function initCoeur(boss) {
    const s = boss.scene, now = s.time.now;
    boss.phase = 1; boss._spin = 0;
    boss._vulnerable = false; boss._fenetreVulnFin = 0;
    boss._secret = false; boss._enResurrection = false;
    boss._buffDegats = 0;
    boss.prochainTir = now + 1200; boss.prochainOnde = now + 1800;
    if (boss.sprite.body) { boss.sprite.body.allowGravity = false; boss.sprite.body.setVelocity(0, 0); }
    creerMandala(boss, 0xff2030);

    // Sceaux cardinaux.
    boss._sceaux = cardinaux(1.0).map(p => ({ x: p.x, y: p.y, gfx: s.add.graphics().setDepth(9), lit: false }));
    boss._sceauCible = 0; boss._sceauxRequis = 1;

    // État des verbes par phase.
    boss._siphons = []; boss._prochainSiphon = now + 1500;
    boss._battements = []; boss._battActif = 0; boss._battProgress = 0;
    boss._objets = []; boss._porte = null; boss._gaves = 0; boss._prochainVerite = now + 2000;
    boss._fluxRayon = 9999;

    // Gate + fausse mort / secret phase.
    boss._origRecevoir = boss.recevoirDegats.bind(boss);
    boss.recevoirDegats = function (m) {
        if (boss.mort) return;
        if (!boss._vulnerable) { s.cameras?.main?.flash?.(30, 70, 70, 80); return; }
        boss.hp -= m;
        if (boss.hp <= 0) {
            if (!boss._secret) { boss._secret = true; declencherProcesDesChoix(boss); }
            else boss._origRecevoir(99999);   // vraie mort → FinScene (etage 10)
        }
    };
    s.events.once('boss:dead', () => {
        boss._sceaux.forEach(sc => sc.gfx?.destroy());
        boss._siphons.forEach(si => si.gfx?.destroy());
        boss._battements.forEach(b => b.gfx?.destroy());
        boss._objets.forEach(o => detruireObjet(o));
        boss._fluxGfx?.destroy(); boss._echos?.forEach(e => e.gfx?.destroy());
    });
}

function dessinerSceaux(boss, surMur = false) {
    for (let i = 0; i < boss._sceaux.length; i++) {
        const sc = boss._sceaux[i], g = sc.gfx; g.clear();
        const cible = (i === boss._sceauCible) && !boss._vulnerable;
        const c = sc.lit ? SCEAU_OK : (cible ? SCEAU_CIBLE : SCEAU_OFF);
        const pulse = cible ? (0.6 + 0.4 * Math.sin(boss.scene.time.now / 160)) : 1;
        g.lineStyle(3, c, 0.85 * pulse); g.strokeCircle(sc.x, sc.y, surMur ? 20 : 26);
        g.fillStyle(c, 0.12 * pulse); g.fillCircle(sc.x, sc.y, surMur ? 20 : 26);
        if (sc.lit) { g.fillStyle(SCEAU_OK, 0.5); g.fillCircle(sc.x, sc.y, 10); }
    }
}

// Allume le sceau désigné si le joueur le touche ; renvoie true si la fenêtre s'ouvre.
function gererSceaux(boss, player) {
    if (boss._vulnerable) return false;
    const sc = boss._sceaux[boss._sceauCible];
    if (sc && !sc.lit && Math.hypot(player.x - sc.x, player.y - sc.y) < 38) {
        sc.lit = true; boss.scene.audio?.jouerSfx?.('land');
        const nbLit = boss._sceaux.filter(x => x.lit).length;
        if (nbLit >= boss._sceauxRequis) return true;
        const restants = boss._sceaux.map((x, i) => i).filter(i => !boss._sceaux[i].lit);
        boss._sceauCible = restants[Math.floor(Math.random() * restants.length)] ?? 0;
    }
    return false;
}

function ouvrir(boss, duree = 5000) {
    boss._vulnerable = true; boss._fenetreVulnFin = boss.scene.time.now + duree;
    boss.scene.afficherMessageFlottant?.('LE CŒUR S\'OUVRE', '#ffd070');
}
function refermer(boss) {
    boss._vulnerable = false;
    boss._sceaux.forEach(x => x.lit = false);
    boss._sceauCible = Math.floor(Math.random() * 4);
}

export function updateCoeur(boss, player) {
    const s = boss.scene, now = s.time.now;
    if (boss.sprite.body) boss.sprite.body.setVelocity(0, 0);

    const battement = 0.85 + 0.15 * Math.sin(now / 500);
    boss._spin += 0.006 + boss.phase * 0.003;
    dessinerMandala(boss, boss._spin, battement * (boss._vulnerable ? 1.3 : 0.8));

    if (boss._enResurrection || !player) return;

    if (boss._secret) { updateCoeurSecret(boss, player, now); return; }

    // Transitions par PV.
    const ratio = boss.hp / Math.max(1, boss.hpMax);
    if (boss.phase === 1 && ratio <= 0.66) { boss.phase = 2; s.events.emit('boss:phase', boss, 2); demarrerBattements(boss); }
    if (boss.phase === 2 && ratio <= 0.33) { boss.phase = 3; s.events.emit('boss:phase', boss, 3); }

    if (boss._vulnerable && now >= boss._fenetreVulnFin) refermer(boss);

    if (boss.phase === 1) updateCoeurP1(boss, player, now);
    else if (boss.phase === 2) updateCoeurP2(boss, player, now);
    else updateCoeurP3(boss, player, now);
}

// ── P1 : SOUVENIR — sceaux verrouillés tant que les SIPHONS ne sont pas purgés ──
function updateCoeurP1(boss, player, now) {
    const s = boss.scene;
    // Spawn de siphons (DPS-check : les atteindre avant la fin de leur incantation).
    if (now >= boss._prochainSiphon && boss._siphons.length < 2 && !boss._vulnerable) {
        boss._prochainSiphon = now + 5000;
        const c = cardinaux(0.7)[Math.floor(Math.random() * 4)];
        boss._siphons.push({ x: c.x, y: c.y, gfx: s.add.graphics().setDepth(10), castFin: now + 4500 });
    }
    for (const si of boss._siphons) {
        if (si.mort) continue;
        const g = si.gfx; g.clear();
        const t = Phaser.Math.Clamp((si.castFin - now) / 4500, 0, 1);
        g.lineStyle(3, 0xff6030, 0.9); g.strokeCircle(si.x, si.y, 22);
        g.fillStyle(0xff3010, 0.25); g.slice(si.x, si.y, 22, -Math.PI / 2, -Math.PI / 2 + (1 - t) * Math.PI * 2, false); g.fillPath();
        // Atteint par le joueur → purgé.
        if (Math.hypot(player.x - si.x, player.y - si.y) < 30) { si.mort = true; si.gfx.destroy(); s.afficherMessageFlottant?.('Siphon purgé', '#60ffa0'); }
        // Incantation terminée → buff permanent du Cœur.
        else if (now >= si.castFin) {
            si.mort = true; si.gfx.destroy();
            boss._buffDegats++;
            s.afficherMessageFlottant?.('LE CŒUR SE GORGE (+dégâts)', '#ff3030');
            s.cameras?.main?.shake?.(200, 0.01);
        }
    }
    boss._siphons = boss._siphons.filter(si => !si.mort);

    const siphonsActifs = boss._siphons.length > 0;
    dessinerSceaux(boss);
    // Sceaux verrouillés tant qu'un siphon vit.
    if (!siphonsActifs && gererSceaux(boss, player)) ouvrir(boss);

    // Danmaku léger (dégât amplifié par les buffs ratés).
    if (now >= boss.prochainOnde) { boss.prochainOnde = now + 2200; anneau(boss, 12, boss._spin, { vitesse: 120, degats: 6 + boss._buffDegats * 2 }); }
}

// ── P2 : ÉCHO — relier les 4 BATTEMENTS dans l'ordre où ils pulsent ──
function demarrerBattements(boss) {
    const s = boss.scene;
    boss._battements = cardinaux(0.6).map(p => ({ x: p.x, y: p.y, gfx: s.add.graphics().setDepth(10) }));
    boss._battActif = 0; boss._battProgress = 0;
}
function updateCoeurP2(boss, player, now) {
    const s = boss.scene;
    if (boss._battements.length === 0) demarrerBattements(boss);
    // Rotation lente des battements autour du centre.
    for (let i = 0; i < boss._battements.length; i++) {
        const a = boss._spin * 0.8 + i * (Math.PI / 2);
        const b = boss._battements[i];
        b.x = CX + Math.cos(a) * RX * 0.55; b.y = CY + Math.sin(a) * RY * 0.55;
        const g = b.gfx; g.clear();
        const actif = (i === boss._battActif) && !boss._vulnerable;
        const c = (i < boss._battProgress) ? SCEAU_OK : (actif ? 0xffd070 : 0x8a3050);
        const pulse = actif ? (0.5 + 0.5 * Math.sin(now / 130)) : 1;
        g.fillStyle(c, 0.25 * pulse); g.fillCircle(b.x, b.y, 22);
        g.lineStyle(2, c, 0.8 * pulse); g.strokeCircle(b.x, b.y, 22);
        // Chaque battement crache une spirale (esquive).
        if (!boss._vulnerable && now % 700 < 18) tirRadial(boss, a + boss._spin, { x: b.x, y: b.y, vitesse: 150, degats: 6 });
    }
    // Toucher le battement actif (dash dedans) → avance la chaîne.
    if (!boss._vulnerable) {
        const b = boss._battements[boss._battActif];
        if (b && Math.hypot(player.x - b.x, player.y - b.y) < 30) {
            boss._battProgress++; boss._battActif++;
            s.audio?.jouerSfx?.('land');
            if (boss._battProgress >= 4) { boss._battActif = 0; boss._battProgress = 0; ouvrir(boss); }
        }
    }
}

// ── P3 : GOUFFRE — aspiration ; NE PAS frapper, GAVER les Vérités à contre-courant ──
function updateCoeurP3(boss, player, now) {
    const s = boss.scene;
    // Aspiration vers le centre (le joueur glisse).
    const dx = CX - player.x, dy = CY - player.y, d = Math.hypot(dx, dy) || 1;
    const force = boss._porte ? 40 : 95;     // porter une Vérité = ancre (résiste)
    if (player.body) { player.body.velocity.x += (dx / d) * force; player.body.velocity.y += (dy / d) * force; }
    if (d < 50) degatsJoueur(boss, 8, 0xff3030);   // happé par la gueule

    // Spawn de Vérités (ancres à pousser dans le Cœur).
    if (now >= boss._prochainVerite && boss._objets.length < 2 && !boss._vulnerable) {
        boss._prochainVerite = now + 4000;
        const c = cardinaux(0.85)[Math.floor(Math.random() * 4)];
        boss._objets.push(creerObjet(s, c.x, c.y, 'verite'));
    }
    // Portage : ramasser une Vérité / la déposer DANS la gueule (centre).
    if (!boss._porte) {
        for (const o of boss._objets) {
            if (!o.mort && !o.porte && Math.hypot(player.x - o.x, player.y - o.y) < 36) { o.porte = true; boss._porte = o; break; }
        }
    } else {
        boss._porte.x = player.x; boss._porte.y = player.y; dessinerObjet(s, boss._porte);
        if (Math.hypot(player.x - CX, player.y - CY) < 60) {
            detruireObjet(boss._porte); boss._objets = boss._objets.filter(o => o !== boss._porte); boss._porte = null;
            boss._gaves++;
            s.afficherMessageFlottant?.('Vérité gavée', '#ff8090');
            if (boss._gaves >= 2) { boss._gaves = 0; ouvrir(boss, 4500); }
        }
    }
    if (boss._vulnerable && now >= boss._fenetreVulnFin) refermer(boss);
    dessinerSceaux(boss);   // visuel d'ambiance (inactifs en P3)
    if (now >= boss.prochainOnde) { boss.prochainOnde = now + 1700; anneau(boss, 16, boss._spin, { vitesse: 130, degats: 6 + boss._buffDegats * 2 }); }
}

// ── SECRET PHASE : « Le Procès de tes Choix » ──
function declencherProcesDesChoix(boss) {
    const s = boss.scene;
    boss._vulnerable = false; boss._enResurrection = true;
    boss._sceaux.forEach(sc => sc.lit = false);
    if (boss._mandala) s.tweens.add({ targets: boss._mandala, alpha: 0, duration: 900 });
    s.afficherMessageFlottant?.('…', '#88203a');
    s.cameras?.main?.flash?.(400, 0, 0, 0);
    // Lit le style de jeu du joueur (capacité la plus utilisée).
    const stats = s._usageStats ?? { attaque: 1, dash: 0, sort: 0 };
    boss._styleMiroir = Object.keys(stats).sort((a, b) => (stats[b] || 0) - (stats[a] || 0))[0] || 'attaque';
    s.time.delayedCall(1600, () => {
        if (boss.mort) return;
        boss.phase = 'secret'; boss.hp = Math.round(boss.hpMax * 0.4);
        boss._enResurrection = false;
        if (boss._mandala) boss._mandala.setAlpha(1);
        // Sceaux remontés sur le POURTOUR (atteints en dash sous la montée du Reflux).
        boss._sceaux.forEach((sc, i) => { const c = cardinaux(1.08)[i]; sc.x = Phaser.Math.Clamp(c.x, 30, 930); sc.y = Phaser.Math.Clamp(c.y, 30, 510); sc.lit = false; });
        boss._sceauCible = 0; boss._sceauxRequis = 4;
        boss._fluxRayon = 360; boss._fluxGfx = s.add.graphics().setDepth(DEPTH.PLATEFORMES - 1);
        boss._echos = []; boss._prochainEcho = s.time.now + 800;
        s.afficherMessageFlottant?.('LE PROCÈS DE TES CHOIX', '#ff3030');
        s.cameras?.main?.shake?.(500, 0.012);
        s.events.emit('boss:phase', boss, 5);
    });
}

function updateCoeurSecret(boss, player, now) {
    const s = boss.scene;
    // ── Montée du Reflux : disque sûr qui rétrécit (hors disque = dégâts). ──
    boss._fluxRayon = Math.max(150, boss._fluxRayon - 0.10);
    const g = boss._fluxGfx; g.clear();
    g.fillStyle(0x6a0a30, 0.18); g.fillCircle(CX, CY, 2000);   // tout le sol = Reflux
    g.fillStyle(0x000000, 0.0001);
    // « trou » sûr : on dessine un anneau de bord lumineux.
    g.lineStyle(4, 0xff5060, 0.5); g.strokeCircle(CX, CY, boss._fluxRayon);
    if (Math.hypot(player.x - CX, player.y - CY) > boss._fluxRayon) degatsJoueur(boss, 6, 0xff3060);

    // ── Échos de TON style de jeu (le miroir te ressort tes habitudes). ──
    if (now >= (boss._prochainEcho ?? 0)) {
        boss._prochainEcho = now + (boss._styleMiroir === 'dash' ? 1400 : 1100);
        const a = Math.atan2(player.y - boss.sprite.y, player.x - boss.sprite.x);
        if (boss._styleMiroir === 'sort') {
            anneau(boss, 14, boss._spin, { vitesse: 175, degats: 7 });          // tu spammais les sorts → nova
        } else if (boss._styleMiroir === 'dash') {
            for (let k = -1; k <= 1; k++) tirRadial(boss, a + k * 0.25, { vitesse: 320, degats: 8 });  // dash-rush
        } else {
            for (let k = -2; k <= 2; k++) tirRadial(boss, a + k * 0.16, { vitesse: 230, degats: 7 });  // salve d'attaques
        }
    }

    // ── Sceaux de pourtour : tout allumer dans l'ordre → ouverture finale. ──
    dessinerSceaux(boss, true);
    if (gererSceaux(boss, player)) ouvrir(boss, 6000);
    if (boss._vulnerable && now >= boss._fenetreVulnFin) {
        refermer(boss); boss._sceauxRequis = 4;
        boss._sceaux.forEach((sc, i) => { const c = cardinaux(1.08)[i]; sc.x = Phaser.Math.Clamp(c.x, 30, 930); sc.y = Phaser.Math.Clamp(c.y, 30, 510); });
    }
    // Danmaku de fond constant.
    if (now % 260 < 18) tirRadial(boss, boss._spin * 3.0, { vitesse: 170, degats: 6 });
}
