// Boss SIDE-SCROLL des biomes 3-4 (Cristaux Glacés é5-6 / Voile Inversé é7-8).
// Difficulté ESCALADANTE — chaque combat pousse au-delà du « confort » établi
// (densité, vitesse, fenêtres serrées) ; é8 = CLIMAX du platformer 2D (le plus dur).
// Arènes en 960×540 → caméra FIGÉE (arène entière + plafond visibles).
//
//   • é5 LE CHŒUR PÉTRIFIÉ   — séquence/mémoire : ne frapper QUE la statue qui
//        chante, dans l'ordre, sur un sol VERGLACÉ ; secret = faux signaux à l'envers.
//   • é6 LES JUMEAUX RÉSONANTS — deux corps liés par un faisceau ; équilibrer leurs
//        PV (sinon résurrection) ; secret = fusion en colosse à brèche rotative.
//   • é7 LE TYRAN-MIROIR      — il copie tes mouvements ; le PIÉGER dans les hasards ;
//        la GRAVITÉ s'inverse ; secret = miroir inversé (il fait l'opposé) + flips rapides.
//   • é8 LE SOUVERAIN DU VOILE — CLIMAX : danmaku + inversions de gravité + échos de TOI
//        + Orbe à parer + arène qui se rétrécit ; secret = tout en même temps.

import { DEPTH } from '../render/PainterlyRenderer.js';
import { degatsJoueur, tirRadial, anneau } from './BossHelpers.js';
import {
    SOL, arene, cacherDefaut, placer, joueurAuSol, flashCorps, intensiteFlash,
    installerGate, brancherAttaque, majPhases, ouvrir,
    ajouterZoneSol, majZonesSol, lancerOnde, majOndes, chuteGravats, nettoyer
} from './BossSideScrollHelpers.js';
import { EchoGhostSystem } from './EchoGhostSystem.js';

// ════════════════════════════════════════════════════════════════════
// HELPERS LOCAUX
// ════════════════════════════════════════════════════════════════════
// Anneau-onde RADIAL qui grandit depuis (x,y) — touche au front (à traverser/fuir).
function anneauOnde(boss, x, y, opts = {}) {
    const s = boss.scene;
    (boss._anneaux ??= []).push({
        x, y, r: opts.r0 ?? 16, v: opts.v ?? 4.2, max: opts.max ?? 600,
        degats: opts.degats ?? 7, couleur: opts.couleur ?? 0x9fe0ec, ep: opts.ep ?? 18,
        gfx: s.add.graphics().setDepth(DEPTH.EFFETS)
    });
}
function majAnneauxOndes(boss, player, now) {
    if (!boss._anneaux) return;
    boss._anneaux = boss._anneaux.filter(o => {
        if (o.r > o.max || boss.mort) { o.gfx.destroy(); return false; }
        o.r += o.v;
        const g = o.gfx; g.clear(); g.setBlendMode(Phaser.BlendModes.ADD);
        g.lineStyle(o.ep, o.couleur, 0.40); g.strokeCircle(o.x, o.y, o.r);
        g.lineStyle(3, 0xffffff, 0.85); g.strokeCircle(o.x, o.y, o.r);
        const d = Math.hypot(player.x - o.x, player.y - o.y);
        if (Math.abs(d - o.r) < o.ep / 2 + 13) degatsJoueur(boss, o.degats, o.couleur);
        return true;
    });
}

// Maintient le sol glissant (verglas Cristaux) — appeler chaque frame.
function maintenirGlace(boss, force = 1) {
    const p = boss.scene.player;
    if (p) p._tileEffectGlissant = boss.scene.time.now + 120;
}

// Faisceau-segment (entre deux points) — hit MANUEL si le joueur est près du segment.
function faisceauSegment(g, ax, ay, bx, by, player, opts = {}) {
    g.lineStyle(opts.ep ?? 10, opts.couleur ?? 0x9fe0ec, opts.alpha ?? 0.25);
    g.lineBetween(ax, ay, bx, by);
    g.lineStyle((opts.ep ?? 10) * 0.4, 0xffffff, 0.7); g.lineBetween(ax, ay, bx, by);
    // distance point→segment
    const vx = bx - ax, vy = by - ay, L2 = vx * vx + vy * vy || 1;
    let t = ((player.x - ax) * vx + (player.y - ay) * vy) / L2;
    t = Phaser.Math.Clamp(t, 0, 1);
    const px = ax + t * vx, py = ay + t * vy;
    return Math.hypot(player.x - px, player.y - py) < (opts.ep ?? 10) / 2 + 12;
}

// ════════════════════════════════════════════════════════════════════
// é5 — LE CHŒUR PÉTRIFIÉ  (séquence/mémoire + verglas)
// ════════════════════════════════════════════════════════════════════
const STATUE_X = [140, 310, 480, 650, 820];
const STATUE_Y = [210, 160, 140, 160, 210];

export function initChoeurPetrifie(boss) {
    const s = boss.scene, { L, solY } = arene(boss);
    boss.phase = 1; boss._vulnerable = false; boss._secret = false; boss._fenetreVulnFin = 0;
    boss._contactInoffensif = true;
    cacherDefaut(boss);
    placer(boss, L * 0.5, 74);               // le Maestro flotte en haut au centre

    // Statues DEBOUT sur le sol (atteignables en mêlée) ; y = centre de frappe.
    boss._statues = STATUE_X.map((x, i) => ({
        x, y: solY - 58, idx: i, gfx: s.add.graphics().setDepth(DEPTH.ENTITES + 1),
        riposteJusqu: 0, consommee: false
    }));
    boss._corps = s.add.graphics().setDepth(DEPTH.ENTITES);
    boss._prochaineOnde = s.time.now + 1400;
    boss._prochainEclat = s.time.now + 2600;
    boss._melodieDecoy = [];
    nouvelleMelodie(boss);

    installerGate(boss, declencherChoeurSecret);
    brancherAttaque(boss, (info) => onAttaqueChoeur(boss, info));
    nettoyer(boss, ['_statues', '_anneaux']);
    s.afficherMessageFlottant?.('Ne frappe QUE la statue qui chante — dans l\'ordre', '#9fe0ec');
}

function nouvelleMelodie(boss) {
    const n = 2 + boss.phase;                // P1=3, P2=4, P3=5
    boss._melodie = [];
    let prev = -1;
    for (let i = 0; i < n; i++) {
        let k; do { k = Math.floor(Math.random() * 5); } while (k === prev);
        boss._melodie.push(k); prev = k;
    }
    boss._melodieIdx = 0;
    boss._statues.forEach(st => st.consommee = false);
}

function chanteurCourant(boss) { return boss._melodie[boss._melodieIdx]; }

function onAttaqueChoeur(boss, info) {
    if (boss._vulnerable) return;            // pendant la fenêtre : on tape le Maestro (recevoirDegats)
    const { solY } = arene(boss);
    for (const st of boss._statues) {
        if (!info.dansZone(st.x, st.y, 56, 90)) continue;
        info.signalerTouche();
        const estVraiChanteur = (st.idx === chanteurCourant(boss)) && !estDecoy(boss, st.idx);
        if (estVraiChanteur) {
            boss._melodieIdx++;
            st.consommee = true;
            boss.scene.audio?.jouerSfx?.('land');
            boss.scene.cameras?.main?.shake?.(60, 0.004);
            if (boss._melodieIdx >= boss._melodie.length) {
                // Mélodie complétée → le Maestro DESCEND à portée de mêlée, exposé.
                boss.sprite.y = solY - 52;
                ouvrir(boss, 4200, 'LE CHŒUR SE TAIT — FRAPPE LE MAESTRO', '#60ffa0');
            }
        } else {
            // Mauvaise statue → riposte + reset de la mélodie.
            st.riposteJusqu = boss.scene.time.now + 400;
            const a = Math.atan2(boss.scene.player.y - st.y, boss.scene.player.x - st.x);
            tirRadial(boss, a, { x: st.x, y: st.y, vitesse: 300, degats: 9, couleur: 0xb0e8ff, halo: 0xffffff });
            boss.scene.afficherMessageFlottant?.('Dissonance !', '#ff6080');
            boss._melodieIdx = 0;
            boss._statues.forEach(s2 => s2.consommee = false);
        }
        break;
    }
}

function estDecoy(boss, idx) { return boss._secret && boss._melodieDecoy.includes(idx); }

export function updateChoeurPetrifie(boss, player) {
    const s = boss.scene, now = s.time.now;
    if (boss.sprite.body) boss.sprite.body.setVelocity(0, 0);
    if (!player) return;

    maintenirGlace(boss);                    // sol verglacé en permanence
    majAnneauxOndes(boss, player, now);
    majZonesSol(boss, player, now);

    if (boss._secret) { updateChoeurSecret(boss, player, now); }
    else {
        majPhases(boss);
        if (boss._vulnerable && now >= boss._fenetreVulnFin) {
            boss._vulnerable = false; boss.sprite.y = 74; nouvelleMelodie(boss);
        }
        if (!boss._vulnerable) {
            // Onde sonore depuis le chanteur courant.
            if (now >= boss._prochaineOnde) {
                boss._prochaineOnde = now + (boss.phase === 3 ? 1500 : 2000);
                const st = boss._statues[chanteurCourant(boss)];
                if (st) anneauOnde(boss, st.x, st.y, { degats: 7, v: 3.8 + boss.phase * 0.5 });
            }
            // Éclats de glace qui tombent (P2+).
            if (boss.phase >= 2 && now >= boss._prochainEclat) {
                boss._prochainEclat = now + (boss.phase === 3 ? 1400 : 2000);
                const x = 80 + Math.random() * (arene(boss).L - 160);
                chuteGravats(boss, x, { delai: 700, degats: 7, couleur: 0x9fe0ec, blocCouleur: 0xbfeaf2, demiL: 26 });
            }
        }
    }
    dessinerChoeur(boss, now);
}

function dessinerChoeur(boss, now) {
    const { L, solY } = arene(boss);
    // Sol verglacé (lueur cyan).
    const g = boss._corps; g.clear();
    g.setBlendMode(Phaser.BlendModes.ADD);
    g.fillStyle(0x6fd0e8, 0.07 + 0.03 * Math.sin(now / 500)); g.fillRect(0, solY - 6, L, 6);
    g.setBlendMode(Phaser.BlendModes.NORMAL);
    // Maestro (chef d'orchestre flottant).
    const cx = boss.sprite.x, cy = boss.sprite.y, fl = intensiteFlash(boss);
    const cM = fl ? 0xffffff : (boss._vulnerable ? 0xbfeaf2 : 0x3a4a6a);
    g.fillStyle(cM, 1);
    g.beginPath(); g.moveTo(cx, cy - 26); g.lineTo(cx + 22, cy + 26); g.lineTo(cx - 22, cy + 26); g.closePath(); g.fillPath();
    g.fillStyle(cM, 1); g.fillCircle(cx, cy - 30, 12);
    g.lineStyle(3, 0xbfeaf2, 0.9); g.lineBetween(cx + 14, cy - 18, cx + 34, cy - 34);   // baguette
    g.setBlendMode(Phaser.BlendModes.ADD);
    g.fillStyle(0x9fe0ec, 0.2 + 0.1 * Math.sin(now / 220)); g.fillCircle(cx, cy, 34);
    g.setBlendMode(Phaser.BlendModes.NORMAL);

    // Statues (dieux de marbre). Chanteur = lumineux ; decoy = leurre.
    const trueIdx = boss._secret ? -1 : chanteurCourant(boss);
    for (const st of boss._statues) {
        const sg = st.gfx; sg.clear();
        const chante = (!boss._vulnerable) && (st.idx === chanteurCourant(boss));
        const decoy = estDecoy(boss, st.idx);
        const riposte = now < st.riposteJusqu;
        const cBase = 0x8a93a8;
        // Statue de dieu DEBOUT sur le sol (fût + buste + socle).
        const topY = solY - 104;
        sg.fillStyle(chante && !decoy ? 0xe8f4ff : cBase, 1);
        sg.fillRect(st.x - 16, topY, 32, 100);
        sg.fillStyle(chante && !decoy ? 0xffffff : 0xa8b0c4, 1);
        sg.fillCircle(st.x, topY - 6, 14);                 // tête
        sg.fillStyle(0x9aa0b4, 1); sg.fillRect(st.x - 22, solY - 12, 44, 12);   // socle
        // halo de chant (cyan vrai / bleu terne pour les leurres)
        if (chante || decoy) {
            sg.setBlendMode(Phaser.BlendModes.ADD);
            const pulse = 0.5 + 0.5 * Math.sin(now / (decoy ? 90 : 150));
            const c = decoy ? 0x6a80c0 : 0x9fe0ec;
            sg.fillStyle(c, (decoy ? 0.16 : 0.32) * pulse); sg.fillCircle(st.x, solY - 55, 44);
            sg.fillStyle(0xffffff, (decoy ? 0.2 : 0.55) * pulse); sg.fillCircle(st.x, topY - 6, 6);
            sg.setBlendMode(Phaser.BlendModes.NORMAL);
        }
        if (riposte) { sg.lineStyle(3, 0xff6080, 0.9); sg.strokeRect(st.x - 18, topY, 36, 116); }
    }
}

// SECRET — faux signaux : les statues consommées rechantent (leurres) + nova.
function declencherChoeurSecret(boss) {
    const s = boss.scene;
    boss.hp = Math.round(boss.hpMax * 0.36);
    boss._vulnerable = false; boss.sprite.y = 74;
    boss._prochainNova = s.time.now + 2200;
    nouvelleMelodie(boss);
    rafraichirDecoys(boss);
    s.afficherMessageFlottant?.('LE CHŒUR SE SOUVIENT À L\'ENVERS', '#ff6080');
    s.cameras?.main?.shake?.(500, 0.012);
    s.events.emit('boss:phase', boss, 4);
}
function rafraichirDecoys(boss) {
    // 1-2 statues leurres (autres que le vrai chanteur) chantent en faux.
    const vrai = chanteurCourant(boss);
    const autres = [0, 1, 2, 3, 4].filter(i => i !== vrai);
    Phaser.Utils.Array.Shuffle(autres);
    boss._melodieDecoy = autres.slice(0, 1 + Math.floor(Math.random() * 2));
}

function updateChoeurSecret(boss, player, now) {
    const s = boss.scene;
    if (boss._vulnerable) {
        if (now >= boss._fenetreVulnFin) { boss._vulnerable = false; boss.sprite.y = 74; nouvelleMelodie(boss); rafraichirDecoys(boss); }
        return;
    }
    // Ondes sonores + nova centrale + leurres tournants.
    if (now >= boss._prochaineOnde) {
        boss._prochaineOnde = now + 1300;
        const st = boss._statues[chanteurCourant(boss)];
        if (st) anneauOnde(boss, st.x, st.y, { degats: 8, v: 4.6 });
        rafraichirDecoys(boss);
    }
    if (now >= boss._prochainNova) {
        boss._prochainNova = now + 3000;
        anneauOnde(boss, boss.sprite.x, 270, { degats: 9, v: 3.4, ep: 26, couleur: 0xb0e8ff, max: 700 });
    }
}

// ════════════════════════════════════════════════════════════════════
// é6 — LES JUMEAUX RÉSONANTS  (deux corps liés + fusion)
// ════════════════════════════════════════════════════════════════════
export function initJumeauxResonants(boss) {
    const s = boss.scene, { L, H, solY } = arene(boss);
    boss.phase = 1; boss._secret = false; boss._contactInoffensif = true;
    cacherDefaut(boss);
    boss._hpMaxA = Math.round(boss.hpMax / 2); boss._hpMaxB = boss.hpMax - boss._hpMaxA;
    boss._hpA = boss._hpMaxA; boss._hpB = boss._hpMaxB;
    boss._angle = 0; boss._rayonOrbite = 140; boss._enrageJusqu = 0;
    boss._orbiteCY = solY - 120;     // orbite BASSE (atteignable depuis la plateforme centrale)
    placer(boss, L * 0.5 - 140, boss._orbiteCY);
    boss._twinB = { x: L * 0.5 + 140, y: boss._orbiteCY, gfx: s.add.graphics().setDepth(DEPTH.ENTITES) };
    boss._corps = s.add.graphics().setDepth(DEPTH.ENTITES);
    boss._beamGfx = s.add.graphics().setDepth(DEPTH.EFFETS);
    boss._prochainSalve = s.time.now + 1500;
    boss._prochainHeal = s.time.now + 1000;

    // Damage routing custom (deux cibles) — pas le gate standard.
    boss._origRecevoir = boss.recevoirDegats.bind(boss);
    boss.recevoirDegats = function (m) { degatsTwin(boss, 'A', m); };
    brancherAttaque(boss, (info) => {
        if (boss._secret) { onAttaqueFusion(boss, info); return; }
        // Twin B (et A en secours) frappés via la zone d'attaque.
        if (info.dansZone(boss._twinB.x, boss._twinB.y, 60, 80)) { info.signalerTouche(); degatsTwin(boss, 'B', info.degats); }
    });
    s.events.once('boss:dead', () => { boss._twinB?.gfx?.destroy(); boss._beamGfx?.destroy(); boss._corps?.destroy(); boss._seamGfx?.destroy(); });
    s.afficherMessageFlottant?.('Affaiblis-les ENSEMBLE — sinon l\'un ressuscite l\'autre', '#a0e0ff');
}

function enrager(boss, ms = 4000) {
    boss._enrageJusqu = boss.scene.time.now + ms;
    boss.scene.afficherMessageFlottant?.('RÉSONANCE — ils enragent', '#ff5078');
    boss.scene.cameras?.main?.shake?.(300, 0.012);
}

function degatsTwin(boss, which, m) {
    if (boss.mort || boss._secret) return;
    if (which === 'A') boss._hpA = Math.max(0, boss._hpA - m); else boss._hpB = Math.max(0, boss._hpB - m);
    flashCorps(boss); boss.scene.audio?.jouerSfx?.('hit');
    // Résurrection si l'écart est trop grand (il faut les tuer ÉQUILIBRÉS).
    if (boss._hpA <= 0 && boss._hpB > 0.22 * boss._hpMaxB) { boss._hpA = Math.round(0.30 * boss._hpMaxA); enrager(boss); }
    if (boss._hpB <= 0 && boss._hpA > 0.22 * boss._hpMaxA) { boss._hpB = Math.round(0.30 * boss._hpMaxB); enrager(boss); }
    boss.hp = boss._hpA + boss._hpB;
    if (boss._hpA <= 0 && boss._hpB <= 0) { boss._secret = true; declencherFusion(boss); }
}

export function updateJumeauxResonants(boss, player) {
    const s = boss.scene, now = s.time.now, { L, H } = arene(boss);
    if (boss.sprite.body) boss.sprite.body.setVelocity(0, 0);
    if (!player) return;
    maintenirGlace(boss);
    majZonesSol(boss, player, now);
    majAnneauxOndes(boss, player, now);

    if (boss._secret) { updateFusion(boss, player, now); dessinerJumeaux(boss, now); return; }

    boss.hp = boss._hpA + boss._hpB;
    majPhases(boss);
    const enrage = now < boss._enrageJusqu;

    // Orbite autour du centre : le faisceau qui les relie BALAIE l'arène.
    const vit = (boss.phase === 3 ? 0.016 : boss.phase === 2 ? 0.012 : 0.009) * (enrage ? 1.7 : 1);
    boss._angle += vit;
    const cx = L * 0.5, cy = boss._orbiteCY, R = boss._rayonOrbite;
    const aMort = boss._hpA <= 0, bMort = boss._hpB <= 0;
    if (!aMort) { boss.sprite.x = cx + Math.cos(boss._angle) * R; boss.sprite.y = cy + Math.sin(boss._angle) * R * 0.42; }
    if (!bMort) { boss._twinB.x = cx - Math.cos(boss._angle) * R; boss._twinB.y = cy - Math.sin(boss._angle) * R * 0.42; }

    // Salves alternées d'éclats de glace.
    if (now >= boss._prochainSalve) {
        boss._prochainSalve = now + (enrage ? 900 : boss.phase === 3 ? 1300 : 1800);
        const src = (Math.floor(now / 1000) % 2 === 0 && !aMort) ? boss.sprite : (!bMort ? boss._twinB : boss.sprite);
        const a0 = Math.atan2(player.y - src.y, player.x - src.x);
        const n = boss.phase + 2;
        for (let k = 0; k < n; k++) {
            const a = a0 + (k - (n - 1) / 2) * 0.18;
            tirRadial(boss, a, { x: src.x, y: src.y, vitesse: 190 + boss.phase * 20, degats: 6, couleur: 0xbfeaf2, halo: 0xffffff });
        }
    }
    // Soin de résonance si les deux sont proches (télégraphé par le faisceau brillant).
    const dist = Math.hypot(boss.sprite.x - boss._twinB.x, boss.sprite.y - boss._twinB.y);
    boss._resonne = !aMort && !bMort && dist < 210;
    if (boss._resonne && now >= boss._prochainHeal) {
        boss._prochainHeal = now + 600;
        boss._hpA = Math.min(boss._hpMaxA, boss._hpA + 1); boss._hpB = Math.min(boss._hpMaxB, boss._hpB + 1);
    }
    dessinerJumeaux(boss, now);
}

function dessinerJumeaux(boss, now) {
    const fl = intensiteFlash(boss);
    const drawTwin = (g, x, y, mort, c) => {
        g.clear(); if (mort) return;
        g.fillStyle(fl ? 0xffffff : c, 1);
        g.beginPath(); g.moveTo(x, y - 30); g.lineTo(x + 26, y + 22); g.lineTo(x - 26, y + 22); g.closePath(); g.fillPath();
        g.fillStyle(0xe8f4ff, 0.6); g.fillCircle(x, y - 22, 12);
        g.setBlendMode(Phaser.BlendModes.ADD); g.fillStyle(c, 0.22 + 0.1 * Math.sin(now / 200)); g.fillCircle(x, y, 30); g.setBlendMode(Phaser.BlendModes.NORMAL);
    };
    if (!boss._secret) {
        drawTwin(boss._corps, boss.sprite.x, boss.sprite.y, boss._hpA <= 0, 0x6fb0e8);
        drawTwin(boss._twinB.gfx, boss._twinB.x, boss._twinB.y, boss._hpB <= 0, 0xb06fe8);
        // Faisceau de résonance entre les deux (hazard + télégraphe du soin).
        const bg = boss._beamGfx; bg.clear();
        if (boss._hpA > 0 && boss._hpB > 0) {
            const touche = faisceauSegment(bg, boss.sprite.x, boss.sprite.y, boss._twinB.x, boss._twinB.y, boss.scene.player,
                { ep: boss._resonne ? 16 : 10, couleur: boss._resonne ? 0x60ffa0 : 0x9fe0ec, alpha: boss._resonne ? 0.5 : 0.3 });
            if (touche) degatsJoueur(boss, boss._resonne ? 8 : 6, 0x9fe0ec);
        }
    }
}

// SECRET — FUSION en colosse à deux têtes ; brèche rotative à frapper.
function declencherFusion(boss) {
    const s = boss.scene, { L, H } = arene(boss);
    boss._hpA = 0; boss._hpB = 0;
    boss.hp = Math.round(boss.hpMax * 0.4); boss._vulnerable = false;
    boss._beamGfx?.clear();
    placer(boss, L * 0.5, arene(boss).solY - 120);   // colosse atteignable (brèche en saut)
    boss._seamAngle = 0; boss._seamGfx = s.add.graphics().setDepth(DEPTH.ENTITES + 1);
    boss._prochainCroix = s.time.now + 1500;
    s.afficherMessageFlottant?.('ILS FUSIONNENT — frappe la brèche', '#ff5078');
    s.cameras?.main?.shake?.(600, 0.02);
    s.events.emit('boss:phase', boss, 4);
}
function onAttaqueFusion(boss, info) {
    // La brèche (seam) tourne autour du colosse ; vulnérable quand on la frappe.
    const sx = boss.sprite.x + Math.cos(boss._seamAngle) * 46;
    const sy = boss.sprite.y + Math.sin(boss._seamAngle) * 46;
    if (info.dansZone(sx, sy, 30, 30)) {
        info.signalerTouche(); boss.hp -= info.degats; flashCorps(boss); boss.scene.audio?.jouerSfx?.('hit');
        if (boss.hp <= 0) boss._origRecevoir(99999);
    }
}
function updateFusion(boss, player, now) {
    if (boss.sprite.body) boss.sprite.body.setVelocity(0, 0);
    boss._seamAngle += 0.03;
    // Croix rotative de faisceaux (à esquiver) + danmaku.
    const bg = boss._beamGfx; bg.clear();
    for (let k = 0; k < 4; k++) {
        const a = boss._seamAngle * 1.4 + k * (Math.PI / 2);
        const ex = boss.sprite.x + Math.cos(a) * 600, ey = boss.sprite.y + Math.sin(a) * 600;
        if (faisceauSegment(bg, boss.sprite.x, boss.sprite.y, ex, ey, player, { ep: 12, couleur: 0xff5078, alpha: 0.3 }))
            degatsJoueur(boss, 8, 0xff5078);
    }
    if (now >= boss._prochainCroix) { boss._prochainCroix = now + 1300; anneau(boss, 14, boss._seamAngle, { x: boss.sprite.x, y: boss.sprite.y, vitesse: 180, degats: 6 }); }
    // Corps fusionné + brèche lumineuse.
    const g = boss._corps; g.clear(); const fl = intensiteFlash(boss);
    g.fillStyle(fl ? 0xffffff : 0x7a5ab0, 1); g.fillCircle(boss.sprite.x, boss.sprite.y, 44);
    g.fillStyle(0xe8f4ff, 0.5); g.fillCircle(boss.sprite.x - 16, boss.sprite.y - 8, 12); g.fillCircle(boss.sprite.x + 16, boss.sprite.y - 8, 12);
    const sx = boss.sprite.x + Math.cos(boss._seamAngle) * 46, sy = boss.sprite.y + Math.sin(boss._seamAngle) * 46;
    const sg = boss._seamGfx; sg.clear(); sg.setBlendMode(Phaser.BlendModes.ADD);
    const pulse = 0.5 + 0.5 * Math.sin(now / 130);
    sg.fillStyle(0x60ffa0, 0.4 * pulse); sg.fillCircle(sx, sy, 22);
    sg.fillStyle(0xffffff, 0.9 * pulse); sg.fillCircle(sx, sy, 9);
}

// ════════════════════════════════════════════════════════════════════
// é7 — LE TYRAN-MIROIR  (miroir de tes mouvements + inversions de gravité)
// ════════════════════════════════════════════════════════════════════
const TYRAN_LASER_X = [200, 480, 760];

export function initTyranMiroir(boss) {
    const s = boss.scene, { L, solY } = arene(boss);
    boss.phase = 1; boss._vulnerable = false; boss._secret = false; boss._fenetreVulnFin = 0;
    boss._staggered = false; boss._phaseGrav = 0; boss._contactInoffensif = true;
    cacherDefaut(boss);
    placer(boss, L * 0.5, solY - 60);
    boss._lasers = TYRAN_LASER_X.map(x => ({ x, w: 54, actifJusqu: 0, teleJusqu: 0 }));
    boss._laserIdx = 0; boss._prochainLaser = s.time.now + 1600;
    boss._lames = []; boss._prochaineLame = s.time.now + 2400;
    boss._corps = s.add.graphics().setDepth(DEPTH.ENTITES);
    boss._laserGfx = s.add.graphics().setDepth(DEPTH.EFFETS);

    // Inversions de gravité (réutilise le pendule du Voile) — lentes au départ.
    s._initPendule({ periode: 6000, telegraphMs: 1000, depart: 'bas' });

    installerGate(boss, declencherTyranSecret);
    brancherAttaque(boss, () => {});
    nettoyer(boss, ['_lasers']);
    s.events.once('boss:dead', () => { boss._laserGfx?.destroy(); (boss._lames ?? []).forEach(l => l.gfx?.destroy()); s._initPendule(null); });
    s.events.once('shutdown', () => s._initPendule(null));
    s.afficherMessageFlottant?.('Il copie ton reflet — piège-le dans un laser de gel', '#ff80ff');
}

function refletCible(boss, player) {
    const { L, H } = arene(boss);
    if (boss._secret) return { x: L - player.x, y: H - player.y };   // symétrie CENTRALE (désapprendre)
    return { x: L - player.x, y: player.y };                          // miroir HORIZONTAL
}

function majLasersTyran(boss, player, now) {
    const intens = boss._secret ? 3 : boss.phase;
    if (now >= boss._prochainLaser) {
        const nb = intens >= 2 ? 2 : 1;
        for (let k = 0; k < nb; k++) {
            const las = boss._lasers[(boss._laserIdx + k) % 3];
            las.teleJusqu = now + (intens === 3 ? 600 : 850);
            las.actifJusqu = las.teleJusqu + (intens === 3 ? 1300 : 1700);
        }
        boss._laserIdx = (boss._laserIdx + nb) % 3;
        boss._prochainLaser = now + (intens === 3 ? 1700 : 2500);
    }
    const g = boss._laserGfx; g.clear(); g.setBlendMode(Phaser.BlendModes.ADD);
    for (const las of boss._lasers) {
        const tele = now < las.teleJusqu;
        const actif = now >= las.teleJusqu && now < las.actifJusqu;
        if (tele) { g.fillStyle(0xff60c0, 0.08 + 0.18 * Math.abs(Math.sin(now / 60))); g.fillRect(las.x - las.w / 2, 0, las.w, 540); }
        if (actif) {
            g.fillStyle(0xff40e0, 0.32); g.fillRect(las.x - las.w / 2, 0, las.w, 540);
            g.fillStyle(0xffffff, 0.6); g.fillRect(las.x - 6, 0, 12, 540);
            if (Math.abs(player.x - las.x) < las.w / 2) degatsJoueur(boss, 8, 0xff40e0);
        }
    }
    g.setBlendMode(Phaser.BlendModes.NORMAL);
}

function tenterPiege(boss, now, dureeWin) {
    if (boss._vulnerable) return;
    for (const las of boss._lasers) {
        if (now >= las.teleJusqu && now < las.actifJusqu && Math.abs(boss.sprite.x - las.x) < las.w / 2) {
            las.actifJusqu = 0;                       // le laser se décharge dans le reflet
            boss._staggered = true;
            ouvrir(boss, dureeWin, 'REFLET PIÉGÉ — FRAPPE !', '#60ffa0');
            boss.scene.cameras?.main?.shake?.(220, 0.012);
            return;
        }
    }
}

function poserLame(boss, player) {
    boss._lames.push({ x: player.x, y: player.y, t: boss.scene.time.now + 650, gfx: boss.scene.add.graphics().setDepth(DEPTH.EFFETS) });
}
function majLames(boss, player, now) {
    if (!boss._lames) return;
    boss._lames = boss._lames.filter(l => {
        const g = l.gfx; g.clear();
        if (now < l.t) { g.lineStyle(2, 0xff60c0, 0.6); g.strokeCircle(l.x, l.y, 26); return true; }
        g.setBlendMode(Phaser.BlendModes.ADD); g.fillStyle(0xff40e0, 0.55); g.fillCircle(l.x, l.y, 30); g.setBlendMode(Phaser.BlendModes.NORMAL);
        if (Math.hypot(player.x - l.x, player.y - l.y) < 32) degatsJoueur(boss, 9, 0xff40e0);
        if (now > l.t + 180) { g.destroy(); return false; }
        return true;
    });
}

export function updateTyranMiroir(boss, player) {
    const s = boss.scene, now = s.time.now, { L, solY } = arene(boss);
    if (boss.sprite.body) boss.sprite.body.setVelocity(0, 0);
    if (!player) return;

    if (boss._secret) { updateTyranSecret(boss, player, now); return; }
    majPhases(boss);
    // Accélère les inversions de gravité par phase (une re-init par changement).
    if (boss.phase !== boss._phaseGrav) {
        boss._phaseGrav = boss.phase;
        s._initPendule({ periode: boss.phase === 3 ? 3600 : boss.phase === 2 ? 4800 : 6000, telegraphMs: 900, depart: s._penduleInverse ? 'haut' : 'bas' });
    }

    if (!boss._vulnerable) {
        const m = refletCible(boss, player);
        boss.sprite.x = Phaser.Math.Clamp(m.x, 30, L - 30);
        boss.sprite.y = Phaser.Math.Clamp(m.y, 60, solY - 16);
        boss.direction = (m.x < player.x) ? 1 : -1;
    } else if (now >= boss._fenetreVulnFin) { boss._vulnerable = false; boss._staggered = false; }

    majLasersTyran(boss, player, now);
    tenterPiege(boss, now, 3800);   // le reflet piégé est loin (≈560 px) → fenêtre généreuse
    if (boss.phase >= 2) { majLames(boss, player, now); if (now >= boss._prochaineLame) { boss._prochaineLame = now + (boss.phase === 3 ? 1400 : 2200); poserLame(boss, player); } }
    dessinerTyran(boss, now);
}

function dessinerTyran(boss, now) {
    const g = boss._corps; g.clear();
    const cx = boss.sprite.x, cy = boss.sprite.y, fl = intensiteFlash(boss);
    const expose = boss._vulnerable;
    // Halo de reflet (miroitement magenta).
    g.setBlendMode(Phaser.BlendModes.ADD);
    g.fillStyle(expose ? 0x60ffa0 : 0xc040ff, (expose ? 0.3 : 0.18) + 0.08 * Math.sin(now / 160)); g.fillCircle(cx, cy, 38);
    g.setBlendMode(Phaser.BlendModes.NORMAL);
    // Corps : roi-reflet sombre, couronne dentelée.
    g.fillStyle(fl ? 0xffffff : (expose ? 0x9a6ad0 : 0x2a1838), 1);
    g.beginPath(); g.moveTo(cx, cy - 36); g.lineTo(cx + 26, cy + 34); g.lineTo(cx - 26, cy + 34); g.closePath(); g.fillPath();
    g.fillStyle(fl ? 0xffffff : (expose ? 0xc0a0e8 : 0x3a2450), 1); g.fillCircle(cx, cy - 40, 14);
    // couronne
    g.fillStyle(0xff80ff, 0.9);
    for (const dx of [-12, 0, 12]) { g.fillTriangle(cx + dx - 4, cy - 50, cx + dx + 4, cy - 50, cx + dx, cy - 62); }
    // yeux
    g.fillStyle(0xff40e0, 1); g.fillCircle(cx - 6, cy - 40, 3); g.fillCircle(cx + 6, cy - 40, 3);
}

// SECRET — le miroir s'INVERSE (symétrie centrale) + inversions de gravité rapides.
function declencherTyranSecret(boss) {
    const s = boss.scene;
    boss.hp = Math.round(boss.hpMax * 0.4); boss._vulnerable = false; boss._staggered = false;
    s._initPendule({ periode: 2600, telegraphMs: 700, depart: s._penduleInverse ? 'haut' : 'bas' });
    s.afficherMessageFlottant?.('LE MIROIR S\'INVERSE — désapprends', '#ff40e0');
    s.cameras?.main?.flash?.(400, 60, 0, 80);
    s.cameras?.main?.shake?.(500, 0.015);
    s.events.emit('boss:phase', boss, 4);
}
function updateTyranSecret(boss, player, now) {
    const { L, solY } = arene(boss);
    if (boss.sprite.body) boss.sprite.body.setVelocity(0, 0);
    if (!boss._vulnerable) {
        const m = refletCible(boss, player);
        boss.sprite.x = Phaser.Math.Clamp(m.x, 30, L - 30);
        boss.sprite.y = Phaser.Math.Clamp(m.y, 60, solY - 16);
    } else if (now >= boss._fenetreVulnFin) { boss._vulnerable = false; boss._staggered = false; }
    majLasersTyran(boss, player, now);
    tenterPiege(boss, now, 3200);
    majLames(boss, player, now);
    if (now >= boss._prochaineLame) { boss._prochaineLame = now + 1200; poserLame(boss, player); }
    dessinerTyran(boss, now);
}

// ════════════════════════════════════════════════════════════════════
// é8 — LE SOUVERAIN DU VOILE  (CLIMAX du platformer 2D — le plus dur)
// ════════════════════════════════════════════════════════════════════
// Empile TOUT : danmaku dense + inversions de gravité télégraphiées + échos de
// TOI + Orbe du Verdict à parer + arène qui se rétrécit dans le vide. Secret =
// tout en même temps + DPS-check sur micro-fenêtres post-flip → mène au Cœur.

export function initSouverainVoile(boss) {
    const s = boss.scene, { L, solY } = arene(boss);
    boss.phase = 1; boss._vulnerable = false; boss._secret = false; boss._fenetreVulnFin = 0;
    boss._contactInoffensif = true;
    cacherDefaut(boss);
    boss._cx = L / 2; boss._cyAir = 150;          // poste aérien (origine du danmaku)
    placer(boss, boss._cx, boss._cyAir);
    boss._spin = 0;
    boss._prochainAnneau = s.time.now + 1600; boss._prochainSpirale = s.time.now + 100;
    boss._orbe = null; boss._prochainOrbe = s.time.now + 3500;
    boss._echos = null; boss._fluxR = 9999; boss._lastInverse = false;
    boss._corps = s.add.graphics().setDepth(DEPTH.ENTITES);
    boss._orbeGfx = s.add.graphics().setDepth(DEPTH.EFFETS);
    boss._fluxGfx = s.add.graphics().setDepth(DEPTH.PLATEFORMES - 1);
    boss._periodeGrav = 0;
    souverainGravite(boss, 5200);

    installerGate(boss, declencherSouverainSecret);
    brancherAttaque(boss, () => {});
    nettoyer(boss, []);
    s.events.once('boss:dead', () => {
        boss._orbeGfx?.destroy(); boss._fluxGfx?.destroy();
        boss._echos?.ghosts?.forEach(gh => gh.visual?.destroy());
        s._initPendule(null);
    });
    s.events.once('shutdown', () => s._initPendule(null));
    s.afficherMessageFlottant?.('LE SOUVERAIN DU VOILE', '#ff40e0');
}

// (Re)configure la cadence des inversions de gravité (réutilise le pendule Voile).
function souverainGravite(boss, periode) {
    const s = boss.scene;
    if (boss._periodeGrav === periode) return;
    boss._periodeGrav = periode;
    s._initPendule({ periode, telegraphMs: Math.min(1000, periode * 0.28), depart: s._penduleInverse ? 'haut' : 'bas' });
}

// Fenêtre de DPS (P1-3) : gravité STABILISÉE (normale) + le boss descend au sol.
function ouvrirFenetreSouverain(boss, duree) {
    const s = boss.scene, { L, solY } = arene(boss);
    s._pendule = null; s._penduleInverse = false;     // pause des flips pendant le DPS
    boss.sprite.y = solY - 50; boss.sprite.x = Phaser.Math.Clamp(s.player.x + 70, 60, L - 60);
    ouvrir(boss, duree, 'LE SOUVERAIN VACILLE — FRAPPE', '#60ffa0');
}
function fermerFenetreSouverain(boss) {
    const s = boss.scene;
    boss._vulnerable = false;
    boss.sprite.x = boss._cx; boss.sprite.y = boss._cyAir;
    boss._periodeGrav = 0; souverainGravite(boss, boss.phase === 3 ? 3600 : boss.phase === 2 ? 4400 : 5200);
}

// ── Orbe du Verdict (géré par le pattern, parable manuellement) ──
function lancerOrbe(boss, player) {
    const a = Math.atan2(player.y - boss._cyAir, player.x - boss._cx);
    boss._orbe = { x: boss._cx, y: boss._cyAir, vx: Math.cos(a) * 2.6, vy: Math.sin(a) * 2.6 };
    boss.scene.afficherMessageFlottant?.('ORBE DU VERDICT — PARE (C)', '#ffd070');
}
function majOrbe(boss, player, now, dureeWin) {
    const o = boss._orbe, g = boss._orbeGfx; g.clear();
    if (!o) return;
    o.x += o.vx; o.y += o.vy;
    g.setBlendMode(Phaser.BlendModes.ADD);
    g.fillStyle(0xffd070, 0.3 + 0.1 * Math.sin(now / 90)); g.fillCircle(o.x, o.y, 26);
    g.fillStyle(0xfff0c0, 0.95); g.fillCircle(o.x, o.y, 12);
    g.setBlendMode(Phaser.BlendModes.NORMAL);
    const { L, H } = arene(boss);
    if (Math.hypot(player.x - o.x, player.y - o.y) < 40) {
        if (boss.scene.estParryActif?.()) {
            boss.scene.parryActifJusqu = 0;
            boss.scene.resonance?.regagner?.(boss.scene.statsEffectives?.parryBonusResonance ?? 5);
            boss.scene.afficherMessageFlottant?.('VERDICT PARÉ', '#60ffa0');
            boss.scene._jouerEffetParryReussi?.();
            boss._orbe = null; g.clear();
            boss._prochainOrbe = now + (boss.phase === 3 ? 3200 : 4400);
            ouvrirFenetreSouverain(boss, dureeWin);
        } else {
            degatsJoueur(boss, 14, 0xffd070); boss._orbe = null; g.clear(); boss._prochainOrbe = now + 4400;
        }
        return;
    }
    if (o.x < -40 || o.x > L + 40 || o.y < -40 || o.y > H + 40) { boss._orbe = null; g.clear(); boss._prochainOrbe = now + 4400; }
}

// ── Flux qui rétrécit (disque sûr ; hors disque = dégâts) ──
function majFlux(boss, player, now, minR) {
    const { L, H } = arene(boss), cx = L / 2, cy = H / 2;
    if (boss._fluxR > 9000) boss._fluxR = 380;
    boss._fluxR = Math.max(minR, boss._fluxR - 0.11);
    const g = boss._fluxGfx; g.clear();
    g.fillStyle(0x3a0a40, 0.42); g.fillRect(0, 0, L, H);          // vide qui ronge l'arène
    g.lineStyle(4, 0xff40e0, 0.55 + 0.2 * Math.sin(now / 200)); g.strokeCircle(cx, cy, boss._fluxR);
    if (Math.hypot(player.x - cx, player.y - cy) > boss._fluxR && now >= (boss._fluxTick ?? 0)) {
        boss._fluxTick = now + 360; degatsJoueur(boss, 7, 0xff40e0);
    }
}

function danmakuSouverain(boss, now, dense) {
    const cx = boss._cx, cy = boss._cyAir;
    if (now >= boss._prochainAnneau) {
        boss._prochainAnneau = now + (dense ? 1700 : 2300);
        const gap = ((boss._spin % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        anneau(boss, 18 + boss.phase * 2, boss._spin, { x: cx, y: cy, vitesse: 150, degats: 6, gapDeb: gap, gapFin: gap + 0.9 });
    }
    if (now >= boss._prochainSpirale) {
        boss._prochainSpirale = now + 95;
        tirRadial(boss, boss._spin * 2.2, { x: cx, y: cy, vitesse: 170, degats: 6 });
        if (dense) tirRadial(boss, boss._spin * 2.2 + Math.PI, { x: cx, y: cy, vitesse: 170, degats: 6 });
    }
}

export function updateSouverainVoile(boss, player) {
    const s = boss.scene, now = s.time.now;
    if (boss.sprite.body) boss.sprite.body.setVelocity(0, 0);
    if (!player) return;
    boss._spin += 0.02;

    if (boss._secret) { updateSouverainSecret(boss, player, now); dessinerSouverain(boss, now); return; }

    majPhases(boss);
    souverainGravite(boss, boss.phase === 3 ? 3600 : boss.phase === 2 ? 4400 : 5200);

    if (boss._vulnerable) {
        if (now >= boss._fenetreVulnFin) fermerFenetreSouverain(boss);
    } else {
        boss.sprite.x = boss._cx; boss.sprite.y = boss._cyAir;
        danmakuSouverain(boss, now, boss.phase === 3);
        majOrbe(boss, player, now, boss.phase === 3 ? 3000 : 3800);
        if (!boss._orbe && now >= boss._prochainOrbe) lancerOrbe(boss, player);
    }
    // Échos de TOI (P2+).
    if (boss.phase >= 2) {
        if (!boss._echos) boss._echos = new EchoGhostSystem(s, { nbGhosts: boss.phase >= 3 ? 3 : 2, decalageMs: 820, degats: 6, seuilHit: 26 });
        boss._echos.update(player, now);
    }
    // Arène qui se rétrécit (P3).
    if (boss.phase >= 3) majFlux(boss, player, now, 240);

    dessinerSouverain(boss, now);
}

function dessinerSouverain(boss, now) {
    const g = boss._corps; g.clear();
    const cx = boss.sprite.x, cy = boss.sprite.y, fl = intensiteFlash(boss);
    const exp = boss._vulnerable;
    // Aura de vide.
    g.setBlendMode(Phaser.BlendModes.ADD);
    g.fillStyle(exp ? 0x60ffa0 : 0xc040ff, 0.16 + 0.07 * Math.sin(now / 180)); g.fillCircle(cx, cy, 52);
    g.fillStyle(0xff40e0, 0.12); g.fillCircle(cx, cy, 30);
    g.setBlendMode(Phaser.BlendModes.NORMAL);
    // Manteau (cloche large).
    g.fillStyle(fl ? 0xffffff : (exp ? 0x7a4ab0 : 0x1e1030), 1);
    g.beginPath(); g.moveTo(cx, cy - 44); g.lineTo(cx + 42, cy + 40); g.lineTo(cx - 42, cy + 40); g.closePath(); g.fillPath();
    // Tête + couronne fracturée.
    g.fillStyle(fl ? 0xffffff : (exp ? 0xc0a0e8 : 0x2e1c44), 1); g.fillCircle(cx, cy - 50, 16);
    g.fillStyle(0xff80ff, 0.95);
    for (const dx of [-16, -6, 6, 16]) g.fillTriangle(cx + dx - 4, cy - 62, cx + dx + 4, cy - 62, cx + dx, cy - 78 + Math.abs(dx) * 0.4);
    // Multiples yeux du Voile.
    g.setBlendMode(Phaser.BlendModes.ADD); g.fillStyle(0xff40e0, 0.9);
    g.fillCircle(cx - 8, cy - 50, 3); g.fillCircle(cx + 8, cy - 50, 3);
    g.fillStyle(0xffffff, 0.8); g.fillCircle(cx, cy - 30, 4);
    g.fillCircle(cx - 18, cy - 20, 3); g.fillCircle(cx + 18, cy - 20, 3);
    g.setBlendMode(Phaser.BlendModes.NORMAL);
}

// ── SECRET PHASE — « Le Reflux te réclame » : tout + micro-fenêtres post-flip ──
function declencherSouverainSecret(boss) {
    const s = boss.scene;
    boss.hp = Math.round(boss.hpMax * 0.42); boss._vulnerable = false;
    if (!boss._echos) boss._echos = new EchoGhostSystem(s, { nbGhosts: 3, decalageMs: 720, degats: 7, seuilHit: 26 });
    boss._fluxR = 340; boss._lastInverse = s._penduleInverse;
    boss._cx = arene(boss).L / 2; boss.sprite.x = boss._cx; boss.sprite.y = boss._cyAir;
    boss._periodeGrav = 0; souverainGravite(boss, 2600);          // flips SERRÉS
    s.afficherMessageFlottant?.('LE REFLUX TE RÉCLAME', '#ff2060');
    s.cameras?.main?.flash?.(500, 80, 0, 60); s.cameras?.main?.shake?.(600, 0.02);
    s.events.emit('boss:phase', boss, 5);
}

function updateSouverainSecret(boss, player, now) {
    const s = boss.scene, { L, solY } = arene(boss);
    souverainGravite(boss, 2600);
    boss._echos.update(player, now);
    majFlux(boss, player, now, 150);
    // Danmaku constant (ne pas re-pauser : c'est le climax).
    danmakuSouverain(boss, now, true);
    // Micro-fenêtre : à CHAQUE flip de gravité le Souverain est désorienté ~1.1 s.
    const inv = s._penduleInverse;
    if (inv !== boss._lastInverse) {
        boss._lastInverse = inv;
        boss._vulnerable = true; boss._fenetreVulnFin = now + 1100;
        boss.sprite.y = inv ? 96 : solY - 50;
        boss.sprite.x = Phaser.Math.Clamp(player.x + 50, 60, L - 60);
        s.afficherMessageFlottant?.('DÉSORIENTÉ — FRAPPE !', '#60ffa0');
    }
    if (boss._vulnerable && now >= boss._fenetreVulnFin) { boss._vulnerable = false; boss.sprite.x = boss._cx; boss.sprite.y = boss._cyAir; }
    // Orbe à parer aussi (fenêtre bonus).
    majOrbe(boss, player, now, 2600);
    if (!boss._orbe && now >= (boss._prochainOrbe ?? 0)) lancerOrbe(boss, player);
}
