// Helpers partagés des boss VUE DE DESSUS (Cœur du Reflux).
// Utilisés par BossCoeurReflux.js (Le Doyen, Le Cœur). Aucune dépendance vers
// BossComportements → pas d'import circulaire.

import { DEPTH } from '../render/PainterlyRenderer.js';

// ─── Dégâts au joueur (hazards à hit MANUEL : faisceaux, ondes, aspiration) ───
export function degatsJoueur(boss, montant, couleur) {
    const s = boss.scene, now = s.time.now;
    if (now < (s.invincibleJusqu ?? 0)) return;
    s.resonance?.prendreDegats?.(montant);
    s.invincibleJusqu = now + 600;
    s.flashJoueur?.(couleur ?? 0xff4040);
    s.cameras?.main?.shake?.(100, 0.004);
}

// ─── Projectile radial depuis le boss vers l'angle `ang` ───
export function tirRadial(boss, ang, opts = {}) {
    const bx = (opts.x ?? boss.sprite.x), by = (opts.y ?? boss.sprite.y);
    boss.scene.events.emit('boss:tir', boss, {
        x: bx, y: by,
        cibleX: bx + Math.cos(ang) * 120,
        cibleY: by + Math.sin(ang) * 120,
        vitesse: opts.vitesse ?? 170,
        portee: opts.portee ?? 900,
        degats: opts.degats ?? 6,        // danmaku dense : dégât modéré (i-frames 600ms)
        couleur: opts.couleur ?? (boss.def.palette?.accent ?? 0xff2030),
        halo: opts.halo ?? (boss.def.palette?.halo ?? 0xff6060),
        homing: false
    });
}

// ─── Anneau complet de `nb` projectiles, trouée optionnelle (gapDeb..gapFin) ───
export function anneau(boss, nb, base, opts = {}) {
    const gapDeb = opts.gapDeb, gapFin = opts.gapFin;
    for (let i = 0; i < nb; i++) {
        const ang = base + (i / nb) * Math.PI * 2;
        if (gapDeb !== undefined) {
            const a = (((ang - gapDeb) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            if (a < (gapFin - gapDeb)) continue;
        }
        tirRadial(boss, ang, opts);
    }
}

// ─── Faisceau balayeur : rayon qui pivote depuis le boss, hit manuel ───
export function faisceauBalayeur(boss, angle, opts = {}) {
    if (!boss._beamGfx) {
        boss._beamGfx = boss.scene.add.graphics().setDepth(22).setBlendMode(Phaser.BlendModes.ADD);
        boss.scene.events.once('boss:dead', () => { boss._beamGfx?.destroy(); boss._beamGfx = null; });
    }
    const g = boss._beamGfx; g.clear();
    const px = (opts.x ?? boss.sprite.x), py = (opts.y ?? boss.sprite.y);
    const lon = opts.longueur ?? 620, epais = opts.epaisseur ?? 14;
    const ex = px + Math.cos(angle) * lon, ey = py + Math.sin(angle) * lon;
    g.lineStyle(epais, 0xff2030, 0.18); g.lineBetween(px, py, ex, ey);
    g.lineStyle(epais * 0.4, 0xffd070, 0.6); g.lineBetween(px, py, ex, ey);
    const pl = boss.scene.player; if (!pl) return;
    const rx = pl.x - px, ry = pl.y - py;
    const along = rx * Math.cos(angle) + ry * Math.sin(angle);
    if (along < 0 || along > lon) return;
    const perp = Math.abs(-rx * Math.sin(angle) + ry * Math.cos(angle));
    if (perp <= epais / 2 + 16) degatsJoueur(boss, opts.degats ?? 6, 0xffd070);
}

// ─── Mandala (robe déployée / cœur pulsant) ───
export function creerMandala(boss, couleur) {
    const g = boss.scene.add.graphics();
    g.setDepth(DEPTH.ENTITES - 1);
    boss._mandala = g;
    boss._mandalaCouleur = couleur;
    boss.visual?.setAlpha?.(0);
    boss.scene.events.once('boss:dead', () => { boss._mandala?.destroy(); boss._mandala = null; });
    dessinerMandala(boss, 0, 1);
}

export function dessinerMandala(boss, rot, intensite) {
    const g = boss._mandala; if (!g) return;
    const c = boss._mandalaCouleur;
    const cx = boss.sprite.x, cy = boss.sprite.y;
    g.clear();
    g.setBlendMode(Phaser.BlendModes.ADD);
    g.fillStyle(c, 0.10 * intensite); g.fillCircle(cx, cy, 54);
    g.fillStyle(c, 0.18 * intensite); g.fillCircle(cx, cy, 30);
    g.fillStyle(0xffffff, 0.5 * intensite); g.fillCircle(cx, cy, 8);
    g.lineStyle(2, c, 0.5 * intensite);
    g.strokeCircle(cx, cy, 34);
    g.strokeCircle(cx, cy, 50);
    const nb = 10;
    g.lineStyle(3, c, 0.6 * intensite);
    for (let i = 0; i < nb; i++) {
        const a = rot + (i / nb) * Math.PI * 2;
        g.lineBetween(cx + Math.cos(a) * 16, cy + Math.sin(a) * 16,
                      cx + Math.cos(a) * 56, cy + Math.sin(a) * 56);
    }
}

// ─── Objets portables (Preuves / Vérités) ────────────────────────────
// Le joueur en porte UN à la fois ; ramassé au contact, déposé sur une cible.
export function creerObjet(scene, x, y, type) {
    const g = scene.add.graphics().setDepth(DEPTH.EFFETS - 1);
    const o = { x, y, type, gfx: g, porte: false, mort: false };
    dessinerObjet(scene, o);
    return o;
}

export function dessinerObjet(scene, o) {
    const g = o.gfx; g.clear();
    g.setBlendMode(Phaser.BlendModes.ADD);
    if (o.type === 'preuve') {
        // parchemin doré (Doyen)
        g.fillStyle(0xffd070, 0.25); g.fillCircle(o.x, o.y, 16);
        g.fillStyle(0xfff0c0, 0.95); g.fillRoundedRect(o.x - 7, o.y - 9, 14, 18, 3);
        g.lineStyle(1, 0xc09030, 1); g.strokeRoundedRect(o.x - 7, o.y - 9, 14, 18, 3);
    } else {
        // Vérité : orbe cramoisi-blanc (Cœur)
        g.fillStyle(0xff5060, 0.30); g.fillCircle(o.x, o.y, 18);
        g.fillStyle(0xffffff, 0.9); g.fillCircle(o.x, o.y, 7);
        g.fillStyle(0xff8090, 1); g.fillCircle(o.x, o.y, 4);
    }
}

export function detruireObjet(o) { o.mort = true; o.gfx?.destroy(); }
