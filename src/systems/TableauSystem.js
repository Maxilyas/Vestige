// TableauSystem — tableaux figés du Cœur du Reflux (Phase 9.12, VUE DE DESSUS).
//
// Un « tableau » est une scène de la civilisation des Sources, capturée à la
// seconde du Reflux : des figures statufiées (silhouettes + aura ambrée) dont
// le regard te suit. Posées en ligne, elles forment un MUR qui barre un
// passage. Un SIGLE au sol (rune dorée) permet de les RÉVEILLER : pendant
// quelques secondes, les figures s'animent (s'écartent) et le mur s'ouvre — tu
// te glisses au travers. Quand la scène se re-fige, elle libère un éclat de
// souvenir (Fragment) à la première activation, et murmure une phrase.
//
// Trade-off (cf. COEUR.md §4a) : déclencher pour passer + le loot, mais il faut
// franchir pendant la fenêtre ouverte avant le re-figement.
//
// Données de salle (`result.tableaux`) — chaque tableau :
//   { id, x, y,                       // ancre absolue
//     figures: [{dx,dy}],             // silhouettes (relatif à x,y)
//     sigil: {dx,dy},                 // rune déclencheuse (relatif)
//     mur: {x,y,w,h},                 // barrière solide quand figée (absolu)
//     dureeMs?, fragment?, murmure? }
//
// Persistance : le Fragment n'est donné qu'une fois (registry, survit aux
// transits de salle dans le même séjour d'étage).

import { DEPTH } from '../render/PainterlyRenderer.js';

const C_AURA      = 0xffcc66;   // aura ambrée des souvenirs
const C_FIGURE    = 0x2a1420;   // silhouette sombre
const C_FIGURE_HL = 0x6a2230;   // liseré cramoisi (réveil)
const C_SIGIL     = 0xffd070;   // rune dorée
const C_MUR       = 0x3a121e;   // pierre cramoisie (barrière)
const C_MUR_BORD  = 0x7a2030;

export class TableauSystem {
    constructor(scene) {
        this.scene = scene;
        this.tableaux = [];
    }

    initSalle(defs) {
        this.tableaux = [];
        for (const def of (defs ?? [])) {
            const t = this._creerTableau(def);
            if (t) this.tableaux.push(t);
        }
    }

    _creerTableau(def) {
        const scene = this.scene;
        const ox = def.x, oy = def.y;

        const t = {
            def,
            etat: 'fige',            // 'fige' | 'anime'
            tDebut: 0,
            tFin: 0,
            reArmJusqu: 0,
            duree: def.dureeMs ?? 3000,
            figures: [],
            murSprite: null,
            murBordGfx: null,
            sigil: { x: ox + def.sigil.dx, y: oy + def.sigil.dy }
        };

        // --- Figures statufiées (silhouette top-down + aura) ---
        def.figures.forEach((f, i) => {
            const fx = ox + f.dx, fy = oy + f.dy;
            const cont = scene.add.container(fx, fy);
            cont.setDepth(DEPTH.ENTITES - 1);

            const aura = scene.add.graphics();
            aura.setBlendMode(Phaser.BlendModes.ADD);
            aura.fillStyle(C_AURA, 0.16); aura.fillCircle(0, 0, 17);
            aura.fillStyle(C_AURA, 0.10); aura.fillCircle(0, 0, 26);
            cont.add(aura);

            const sil = scene.add.graphics();
            sil.fillStyle(C_FIGURE, 0.96);
            sil.fillEllipse(0, 4, 22, 15);   // épaules vue de dessus
            sil.fillCircle(0, -3, 6);         // tête
            cont.add(sil);

            // Sens d'écartement alterné (ouvre des « fenêtres » entre les marcheurs)
            const dir = (i % 2 === 0) ? -1 : 1;
            t.figures.push({ cont, aura, sil, baseX: fx, baseY: fy, dir });
        });

        // --- Sigle déclencheur (rune au sol) ---
        t.sigilGfx = scene.add.graphics();
        t.sigilGfx.setDepth(DEPTH.PLATEFORMES + 1);
        this._dessinerSigil(t, 0);

        // --- Mur / barrière solide (présente quand figée) ---
        if (def.mur) {
            const m = def.mur;
            const spr = scene.add.rectangle(m.x, m.y, m.w, m.h, C_MUR, 1);
            spr.setDepth(DEPTH.PLATEFORMES);
            scene.physics.add.existing(spr, true);
            // Anti-tunneling : épaissit la hitbox d'un mur fin (le dash est rapide).
            if (spr.body) spr.body.setSize(Math.max(m.w, 46), Math.max(m.h, 46), true);
            if (scene.player) scene.physics.add.collider(scene.player, spr);
            t.murSprite = spr;

            const bord = scene.add.graphics();
            bord.setDepth(DEPTH.PLATEFORMES + 1);
            bord.lineStyle(2, C_MUR_BORD, 0.9);
            bord.strokeRect(m.x - m.w / 2, m.y - m.h / 2, m.w, m.h);
            t.murBordGfx = bord;
        }

        return t;
    }

    _dessinerSigil(t, intensite) {
        // intensite 0..1 : lueur croissante quand activé/proche.
        const g = t.sigilGfx; g.clear();
        const { x, y } = t.sigil;
        const a = 0.35 + 0.5 * intensite;
        g.fillStyle(C_SIGIL, 0.08 + 0.12 * intensite);
        g.fillCircle(x, y, 26);
        g.lineStyle(2, C_SIGIL, a);
        g.strokeCircle(x, y, 18);
        // glyphe simple : triangle inscrit qui tourne lentement
        const rot = (this.scene.time.now / 1400) % (Math.PI * 2);
        g.lineStyle(2, C_SIGIL, a);
        for (let k = 0; k < 3; k++) {
            const a0 = rot + k * (Math.PI * 2 / 3);
            const a1 = rot + (k + 1) * (Math.PI * 2 / 3);
            g.lineBetween(
                x + Math.cos(a0) * 12, y + Math.sin(a0) * 12,
                x + Math.cos(a1) * 12, y + Math.sin(a1) * 12
            );
        }
    }

    update(player, now) {
        if (!player) return;
        for (const t of this.tableaux) {
            if (t.etat === 'anime') {
                this._tickAnimation(t, now);
                continue;
            }
            // Figé : sigle pulse léger ; détecte le pas du joueur dessus.
            const d = Math.hypot(player.x - t.sigil.x, player.y - t.sigil.y);
            const proche = d < 36;
            this._dessinerSigil(t, proche ? 0.8 : 0.25 + 0.25 * (0.5 + 0.5 * Math.sin(now / 500)));
            if (proche && now >= t.reArmJusqu) {
                this._declencher(t, now);
            }
        }
    }

    _declencher(t, now) {
        t.etat = 'anime';
        t.tDebut = now;
        t.tFin = now + t.duree;
        // Ouvre le passage : la barrière devient franchissable.
        if (t.murSprite?.body) t.murSprite.body.enable = false;
        if (t.murSprite) t.murSprite.setAlpha(0.22);
        if (t.murBordGfx) t.murBordGfx.setAlpha(0.3);
        this.scene.audio?.jouerSfx?.('land');
    }

    _tickAnimation(t, now) {
        const progress = Math.min(1, (now - t.tDebut) / t.duree);
        // Sway 0→1→0 : les figures s'écartent puis reviennent (fenêtres).
        const sway = Math.sin(progress * Math.PI);
        for (const f of t.figures) {
            f.cont.x = f.baseX + f.dir * sway * 26;
            f.cont.y = f.baseY + sway * 6;
            // Liseré cramoisi de réveil sur la silhouette.
            f.sil.clear();
            f.sil.fillStyle(C_FIGURE, 0.96);
            f.sil.fillEllipse(0, 4, 22, 15);
            f.sil.fillCircle(0, -3, 6);
            if (sway > 0.1) {
                f.sil.lineStyle(2, C_FIGURE_HL, sway);
                f.sil.strokeEllipse(0, 4, 22, 15);
            }
        }
        this._dessinerSigil(t, 1);

        if (progress >= 1) this._refiger(t, now);
    }

    _refiger(t, now) {
        t.etat = 'fige';
        t.reArmJusqu = now + 600;   // petit délai avant re-déclenchement
        // Re-ferme la barrière.
        if (t.murSprite?.body) t.murSprite.body.enable = true;
        if (t.murSprite) t.murSprite.setAlpha(1);
        if (t.murBordGfx) t.murBordGfx.setAlpha(1);
        for (const f of t.figures) { f.cont.x = f.baseX; f.cont.y = f.baseY; }

        // Récompense : Fragment + murmure à la PREMIÈRE activation seulement.
        const cle = `tableau_lu:${this.scene.cleSalleEtage}:${t.def.id}`;
        if (!this.scene.registry.get(cle)) {
            this.scene.registry.set(cle, true);
            const famille = t.def.fragment ?? 'noir';
            this.scene.economy?.ajouterFragment?.(famille, 1);
            this.scene.afficherMessageFlottant?.(`Éclat de souvenir — Fragment ${famille}`, '#ffcc66');
            if (t.def.murmure) {
                this.scene.time.delayedCall(700, () => {
                    this.scene.afficherMessageFlottant?.(t.def.murmure, '#e8c890');
                });
            }
            // Petit burst doré au centre du tableau.
            if (this.scene.textures.exists('_particule')) {
                const b = this.scene.add.particles(t.def.x, t.def.y, '_particule', {
                    lifespan: 600, speed: { min: 30, max: 90 }, scale: { start: 0.6, end: 0 },
                    quantity: 14, tint: C_AURA, blendMode: 'ADD', emitting: false
                });
                b.setDepth(DEPTH.EFFETS);
                b.explode(14);
                this.scene.time.delayedCall(800, () => b.destroy());
            }
        }
    }
}
