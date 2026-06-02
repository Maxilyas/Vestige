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
