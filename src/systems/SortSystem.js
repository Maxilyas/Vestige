// SortSystem — déclenchement des sorts portés par les items équipés (Phase 6).
//
// 3 slots (tête/corps/accessoire), un sort par slot maximum. Touches 1/2/3 →
// intentions `sort1`/`sort2`/`sort3` → tenter d'invoquer le sort de ce slot.
//
// Note d'archi : GameScene.enemies est un ARRAY de Enemy (pas un Phaser.Group).
// Enemy a `.sprite` (rectangle physique invisible) et `.recevoirDegats(n)`.
// Les projectiles sont stockés dans `scene.projectiles` (array).
// `scene.player` est le rectangle physique du joueur, `scene.lastDirection` ±1.

import { SORTS, getSort } from '../data/sorts.js';
import { estInstance } from './ScoreSystem.js';
import { Projectile } from '../entities/Projectile.js';

const SLOTS_ORDER = ['tete', 'corps', 'accessoire']; // 1, 2, 3

/**
 * Tente d'invoquer le sort sur le slot donné. Renvoie true si déclenché.
 */
export function tenterSort(scene, indexSlot) {
    if (indexSlot < 0 || indexSlot >= SLOTS_ORDER.length) return false;
    const slot = SLOTS_ORDER[indexSlot];
    const equip = scene.registry.get('equipement') ?? {};
    const entry = equip[slot];
    if (!estInstance(entry)) return false;
    if (!entry.sortId) return false;

    const sortDef = getSort(entry.sortId);
    if (!sortDef) return false;

    if (!scene._sortCdJusqu) scene._sortCdJusqu = { tete: 0, corps: 0, accessoire: 0 };
    if (scene.time.now < (scene._sortCdJusqu[slot] ?? 0)) return false;

    if (sortDef.coutResonance > 0) {
        const r = scene.resonance.getValeur();
        if (r <= sortDef.coutResonance) return false;
        scene.resonance.prendreDegats(sortDef.coutResonance);
    }

    executerCodeSort(scene, sortDef, slot, entry);

    let cd = sortDef.cooldownMs;
    if (slot === 'tete' && entry.signatureId === 'diademe_jumel') cd *= 0.7;
    scene._sortCdJusqu[slot] = scene.time.now + cd;
    if (scene.revelation) scene.revelation.incrementer('sorts');

    return true;
}

// ============================================================
// IMPLÉMENTATIONS PAR CODE
// ============================================================

function executerCodeSort(scene, sortDef, slot, instance) {
    const code = sortDef.code;
    const p = sortDef.params || {};
    const player = scene.player;
    if (!player) return;

    switch (code) {
        case 'tir_conique':
            spawnerProjectile(scene, p.degats, p.portee, p.couleur ?? 0xffd070);
            break;
        case 'bond_aoe':
            player.body.setVelocityY(p.vy);
            scene.time.delayedCall(180, () => spawnerAOEAutour(scene, p.portee, p.degats));
            break;
        case 'spin':
            spawnerSpin(scene, p.rayon, p.degats, p.hits ?? 3);
            break;
        case 'aoe_au_sol':
            player.body.setVelocityY(-340);
            scene.time.delayedCall(450, () => spawnerAOEAutour(scene, p.rayon, p.degats));
            break;
        case 'frappe_lourde':
            spawnerAOEDevant(scene, p.portee, p.degats, p.knockback);
            break;
        case 'pointe_devant':
            spawnerProjectile(scene, p.degats, p.portee, 0x2a2a3a, true);
            break;
        case 'mur_temporaire':
            spawnerMur(scene, p.largeur, p.hauteur, p.duree);
            break;
        case 'buff_garde':
            scene.garde?.bonusTemporaire(p.bonusGarde, p.duree, scene);
            break;
        case 'miroir_invu':
            scene._invuJusqu = scene.time.now + p.duree;
            scene.playerVisual?.setAlpha?.(0.4);
            scene.time.delayedCall(p.duree, () => scene.playerVisual?.setAlpha?.(1));
            break;
        case 'dash_invu':
            {
                const dir = scene.lastDirection || 1;
                player.body.setVelocityX(dir * (p.distance * 1000) / p.duree);
                scene._invuJusqu = scene.time.now + p.duree;
                scene.playerVisual?.setAlpha?.(0.5);
                scene.time.delayedCall(p.duree, () => scene.playerVisual?.setAlpha?.(1));
            }
            break;
        case 'buff_armure':
            scene._buffArmurePct = p.reductionPct / 100;
            scene.time.delayedCall(p.duree, () => { scene._buffArmurePct = 0; });
            break;
        case 'heal_resonance':
            scene.resonance.regagner(p.gain);
            break;
        case 'projectile_homing':
            for (let n = 0; n < (p.nb ?? 1); n++) {
                scene.time.delayedCall(n * 100, () => spawnerProjectile(scene, p.degats, p.portee, p.couleur, true));
            }
            break;
        case 'charge_horizontale':
            {
                const dir = scene.lastDirection || 1;
                player.body.setVelocityX(dir * 700);
                scene._chargeJusqu = scene.time.now + 400;
                scene._chargeDmg = p.degats;
            }
            break;
        case 'aoe_souleve':
            spawnerAOEDevant(scene, p.portee, p.degats, 0, p.vy);
            break;
        case 'super_saut':
            player.body.setVelocityY(p.vy);
            scene._invuJusqu = scene.time.now + p.invuMs;
            break;
        case 'tp_entree':
            {
                const pe = scene._posEntreeSalle ?? { x: 100, y: 400 };
                player.setPosition(pe.x, pe.y);
                player.body.setVelocity(0, 0);
                scene.resonance.regagner(p.soin);
            }
            break;
        case 'orbe_arme':
            spawnerOrbeArmes(scene, p.nb, p.degats, p.duree, p.rayon);
            break;
        case 'buff_regen_garde':
            {
                if (!scene.garde) break;
                const regenBase = scene.garde.getRegen();
                scene.registry.set('garde_regen', regenBase * (p.multi ?? 3));
                scene.time.delayedCall(p.duree, () => scene.registry.set('garde_regen', regenBase));
            }
            break;
        case 'heal_lent':
            {
                const ticks = Math.floor(p.duree / 1000);
                for (let t = 0; t < ticks; t++) {
                    scene.time.delayedCall(t * 1000, () => scene.resonance.regagner(p.gainParSec));
                }
            }
            break;
        case 'projectile_perce':
            spawnerProjectile(scene, p.degats, p.portee, p.couleur ?? 0xff6040, false);
            break;
        case 'projectile_eventail':
            for (let n = 0; n < (p.nb ?? 3); n++) {
                const angle = (n - (p.nb - 1) / 2) * 0.22;
                spawnerProjectile(scene, p.degats, p.portee, p.couleur ?? 0xff8040, false, angle);
            }
            break;
        case 'gel_zone':
            gelerEnnemisAutour(scene, p.rayon, p.duree);
            break;
        case 'invisibilite':
            scene._invisibleJusqu = scene.time.now + p.duree;
            scene.playerVisual?.setAlpha?.(0.3);
            scene.time.delayedCall(p.duree, () => scene.playerVisual?.setAlpha?.(1));
            break;
        case 'rayon':
            spawnerRayon(scene, p.portee, p.degats, p.duree);
            break;
        case 'tp_dernier_hit':
            if (scene._dernierEnnemiTouche?.active) {
                player.setPosition(scene._dernierEnnemiTouche.x, scene._dernierEnnemiTouche.y - 30);
                player.body.setVelocity(0, 0);
            }
            break;
        case 'buff_aspd':
            scene._buffAspdPct = (p.bonusPct ?? 30) / 100;
            scene.time.delayedCall(p.duree, () => { scene._buffAspdPct = 0; });
            break;
        case 'heal_garde':
            scene.garde?.restaurer(p.gain);
            break;
        default:
            console.warn('Sort inconnu :', code);
    }
}

// ============================================================
// HELPERS DE SPAWN
// ============================================================

function spawnerProjectile(scene, degats, portee, couleur, homing = false, angleOffset = 0) {
    if (!scene.player || typeof scene._creerProjectile !== 'function') return;
    const dir = scene.lastDirection || 1;
    const px = scene.player.x + dir * 20;
    const py = scene.player.y;
    const cibleX = px + Math.cos(angleOffset) * dir * portee;
    const cibleY = py + Math.sin(angleOffset) * portee;
    // Passe par _creerProjectile pour brancher les overlaps ennemis correctement.
    // L'origine "joueur" garantit que les ennemis et le boss prennent les dégâts.
    scene._creerProjectile({
        x: px, y: py, cibleX, cibleY,
        vitesse: 480,
        degats,
        portee,
        couleur,
        halo: couleur,
        homing,
        origine: 'joueur'
    });
}

/**
 * Taillade tournoyante — une lame visible qui pivote 360° autour du joueur,
 * avec N hits successifs (chaque hit applique les dégâts à tous les ennemis
 * dans le cercle). Le sens de rotation suit la direction du joueur :
 * → joueur à droite → rotation horaire ; ← joueur à gauche → antihoraire.
 */
function spawnerSpin(scene, rayon, degats, hits) {
    if (!scene.player) return;
    const dir = scene.lastDirection || 1; // sens horaire si +1, antihoraire si -1
    const dureeHit = 120;
    const dureeTotale = hits * dureeHit;
    // Angle de départ : devant le joueur (dir > 0 → 0 rad, dir < 0 → π)
    const angleStart = dir > 0 ? -Math.PI / 2 : Math.PI / 2;

    // Conteneur visuel suivant le joueur
    const cont = scene.add.container(scene.player.x, scene.player.y).setDepth(80);
    cont.setBlendMode(Phaser.BlendModes.ADD);

    // Lame qui tourne — trois couches concentriques pour la profondeur
    const lameOuter = scene.add.graphics();
    lameOuter.fillStyle(0xffd070, 0.18);
    lameOuter.slice(0, 0, rayon, 0, Math.PI * 0.55, false);
    lameOuter.fillPath();
    cont.add(lameOuter);
    const lameMid = scene.add.graphics();
    lameMid.fillStyle(0xffd070, 0.45);
    lameMid.slice(0, 0, rayon * 0.85, 0, Math.PI * 0.4, false);
    lameMid.fillPath();
    cont.add(lameMid);
    const lameCore = scene.add.graphics();
    lameCore.fillStyle(0xffffff, 0.85);
    lameCore.slice(0, 0, rayon * 0.7, 0, Math.PI * 0.25, false);
    lameCore.fillPath();
    cont.add(lameCore);

    cont.rotation = angleStart;

    // Tween de rotation : 3 tours par seconde (cohérent avec hits × 120 ms)
    const toursTotal = hits;
    scene.tweens.add({
        targets: cont,
        rotation: angleStart + dir * Math.PI * 2 * toursTotal,
        duration: dureeTotale,
        ease: 'Linear',
        onUpdate: () => {
            // Suit la position du joueur
            cont.x = scene.player.x;
            cont.y = scene.player.y;
        },
        onComplete: () => cont.destroy()
    });

    // Hits successifs : on applique les dégâts en pulses
    for (let h = 0; h < hits; h++) {
        scene.time.delayedCall(h * dureeHit, () => {
            if (!Array.isArray(scene.enemies)) return;
            const cx = scene.player.x, cy = scene.player.y;
            for (const e of scene.enemies) {
                if (!e || e.mort || !e.sprite?.active) continue;
                const dist = Phaser.Math.Distance.Between(cx, cy, e.sprite.x, e.sprite.y);
                if (dist <= rayon) e.recevoirDegats?.(degats);
            }
        });
    }
}

function spawnerAOEAutour(scene, rayon, degats) {
    if (!scene.player || !Array.isArray(scene.enemies)) return;
    const cx = scene.player.x, cy = scene.player.y;
    const g = scene.add.graphics().setDepth(80);
    g.fillStyle(0xffd070, 0.45);
    g.fillCircle(cx, cy, rayon);
    g.setBlendMode(Phaser.BlendModes.ADD);
    scene.tweens.add({ targets: g, alpha: 0, scale: 1.3, duration: 320, onComplete: () => g.destroy() });
    for (const e of scene.enemies) {
        if (!e || e.mort || !e.sprite?.active) continue;
        const dist = Phaser.Math.Distance.Between(cx, cy, e.sprite.x, e.sprite.y);
        if (dist <= rayon) e.recevoirDegats?.(degats);
    }
}

function spawnerAOEDevant(scene, portee, degats, knockback = 0, vy = 0) {
    if (!scene.player || !Array.isArray(scene.enemies)) return;
    const dir = scene.lastDirection || 1;
    const cx = scene.player.x + dir * portee / 2;
    const cy = scene.player.y;
    const g = scene.add.graphics().setDepth(80);
    g.fillStyle(0xffd070, 0.45);
    g.fillRect(cx - portee / 2, cy - 30, portee, 60);
    g.setBlendMode(Phaser.BlendModes.ADD);
    scene.tweens.add({ targets: g, alpha: 0, duration: 280, onComplete: () => g.destroy() });
    for (const e of scene.enemies) {
        if (!e || e.mort || !e.sprite?.active) continue;
        const dx = e.sprite.x - scene.player.x;
        if ((dir > 0 && dx > 0 && dx <= portee) || (dir < 0 && dx < 0 && dx >= -portee)) {
            if (Math.abs(e.sprite.y - cy) <= 60) {
                e.recevoirDegats?.(degats);
                if (knockback) e.sprite.body?.setVelocityX(dir * knockback);
                if (vy) e.sprite.body?.setVelocityY(vy);
            }
        }
    }
}

function spawnerMur(scene, largeur, hauteur, duree) {
    const dir = scene.lastDirection || 1;
    // Phase 6 fix — Centré sur la HAUTEUR du joueur (le rectangle physique a
    // sa hauteur = PLAYER.HEIGHT ≈ 36). On positionne le mur de sorte que son
    // bord bas matche le sol sous le joueur, comme un vrai mur dressé.
    const x = scene.player.x + dir * (largeur / 2 + 30);
    const playerBottom = scene.player.y + (scene.player.body?.height ?? 36) / 2;
    const y = playerBottom - hauteur / 2;

    // Conteneur visuel : volutes de cendre + halo additif. Style painterly,
    // plus joli qu'un simple rectangle.
    const cont = scene.add.container(x, y).setDepth(85);

    // Halo additif d'arrière-plan (élargi)
    const halo = scene.add.graphics();
    halo.setBlendMode(Phaser.BlendModes.ADD);
    halo.fillStyle(0xd0c8b8, 0.18);
    halo.fillRect(-largeur / 2 - 6, -hauteur / 2 - 6, largeur + 12, hauteur + 12);
    cont.add(halo);

    // Corps du mur : pierre claire avec texture
    const corps = scene.add.graphics();
    corps.fillStyle(0xc8c0b0, 0.85);
    corps.fillRect(-largeur / 2, -hauteur / 2, largeur, hauteur);
    // Stries verticales (effet pierre)
    corps.lineStyle(1, 0xa09888, 0.4);
    for (let s = -largeur / 2 + 10; s < largeur / 2; s += 14) {
        corps.beginPath();
        corps.moveTo(s, -hauteur / 2 + 4);
        corps.lineTo(s, hauteur / 2 - 4);
        corps.strokePath();
    }
    corps.lineStyle(2, 0xffd070, 0.85);
    corps.strokeRect(-largeur / 2, -hauteur / 2, largeur, hauteur);
    cont.add(corps);

    // Particules de cendre qui s'élèvent (décor)
    const partTimer = scene.time.addEvent({
        delay: 220, loop: true,
        callback: () => {
            const px = (Math.random() - 0.5) * largeur;
            const py = hauteur / 2 - 4;
            const p = scene.add.graphics().setDepth(86);
            p.setBlendMode(Phaser.BlendModes.ADD);
            p.fillStyle(0xffd070, 0.7);
            p.fillCircle(0, 0, 2);
            p.setPosition(x + px, y + py);
            scene.tweens.add({
                targets: p,
                y: y + py - 20 - Math.random() * 14,
                alpha: 0,
                duration: 600,
                onComplete: () => p.destroy()
            });
        }
    });

    // Anim d'apparition (rise from below)
    cont.setScale(1, 0);
    scene.tweens.add({ targets: cont, scaleY: 1, duration: 220, ease: 'Quad.Out' });

    scene.time.delayedCall(duree, () => {
        partTimer.remove();
        scene.tweens.add({
            targets: cont,
            alpha: 0,
            scaleY: 0.4,
            duration: 320,
            onComplete: () => cont.destroy()
        });
    });
}

function spawnerOrbeArmes(scene, nb, degats, duree, rayon) {
    const orbes = [];
    for (let i = 0; i < nb; i++) {
        const lame = scene.add.rectangle(0, 0, 24, 4, 0xffd070).setDepth(80);
        lame.setStrokeStyle(1, 0xffe8a0);
        orbes.push({ lame, angle: (Math.PI * 2 * i) / nb });
    }
    const startTime = scene.time.now;
    const ticker = scene.time.addEvent({
        delay: 16, loop: true,
        callback: () => {
            const t = scene.time.now - startTime;
            if (t >= duree || !scene.player) {
                orbes.forEach(o => o.lame.destroy());
                ticker.remove();
                return;
            }
            orbes.forEach((o) => {
                o.angle += 0.08;
                o.lame.x = scene.player.x + Math.cos(o.angle) * rayon;
                o.lame.y = scene.player.y + Math.sin(o.angle) * rayon;
                o.lame.rotation = o.angle + Math.PI / 2;
            });
            if (Array.isArray(scene.enemies)) {
                for (const e of scene.enemies) {
                    if (!e || e.mort || !e.sprite?.active) continue;
                    for (const o of orbes) {
                        if ((o.lame._hitJusqu ?? 0) > scene.time.now) continue;
                        const d = Phaser.Math.Distance.Between(o.lame.x, o.lame.y, e.sprite.x, e.sprite.y);
                        if (d < 20) {
                            e.recevoirDegats?.(degats);
                            o.lame._hitJusqu = scene.time.now + 200;
                        }
                    }
                }
            }
        }
    });
}

function gelerEnnemisAutour(scene, rayon, duree) {
    if (!scene.player || !Array.isArray(scene.enemies)) return;
    for (const e of scene.enemies) {
        if (!e || e.mort || !e.sprite?.active) continue;
        const dist = Phaser.Math.Distance.Between(scene.player.x, scene.player.y, e.sprite.x, e.sprite.y);
        if (dist <= rayon) {
            e._geleJusqu = scene.time.now + duree;
            e.sprite.body?.setVelocity(0, 0);
            const halo = scene.add.graphics().setDepth(75);
            halo.fillStyle(0xa0d0ff, 0.5);
            halo.fillCircle(e.sprite.x, e.sprite.y, 14);
            scene.tweens.add({ targets: halo, alpha: 0, duration: duree, onComplete: () => halo.destroy() });
        }
    }
}

function spawnerRayon(scene, portee, degatsTotal, duree) {
    const dir = scene.lastDirection || 1;
    const x0 = scene.player.x;
    const y0 = scene.player.y;
    const x1 = x0 + dir * portee;
    const beam = scene.add.graphics().setDepth(80);
    beam.lineStyle(6, 0x2a2a3a, 0.85);
    beam.lineBetween(x0, y0, x1, y0);
    const beamHalo = scene.add.graphics().setDepth(81);
    beamHalo.lineStyle(12, 0x4a2a4a, 0.4);
    beamHalo.lineBetween(x0, y0, x1, y0);
    beamHalo.setBlendMode(Phaser.BlendModes.ADD);

    const ticks = 5;
    const dmgParTick = degatsTotal / ticks;
    for (let t = 0; t < ticks; t++) {
        scene.time.delayedCall(t * (duree / ticks), () => {
            if (!Array.isArray(scene.enemies)) return;
            for (const e of scene.enemies) {
                if (!e || e.mort || !e.sprite?.active) continue;
                if (Math.abs(e.sprite.y - y0) > 30) continue;
                if (dir > 0 && (e.sprite.x < x0 || e.sprite.x > x1)) continue;
                if (dir < 0 && (e.sprite.x > x0 || e.sprite.x < x1)) continue;
                e.recevoirDegats?.(dmgParTick);
            }
        });
    }
    scene.time.delayedCall(duree, () => {
        beam.destroy();
        beamHalo.destroy();
    });
}
