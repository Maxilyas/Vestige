// EnemyVisuel — visuel paramétrique pour les 4 archétypes d'ennemis.
//
// Chaque archétype produit une silhouette de base teintée par `def.palette`,
// puis un accessoire optionnel (cornes / épines / voile / aura) est peint
// par-dessus. Les 20 ennemis du jeu sont des recombinaisons de :
//   silhouette d'archétype × palette × accessoire × stats.
//
// Le retour est un Phaser.GameObjects.Container que Enemy.js positionne
// chaque frame.

import { DEPTH } from '../PainterlyRenderer.js';

// ============================================================
// API publique
// ============================================================
export function creerVisuelEnnemi(scene, def) {
    let container;
    switch (def.archetype) {
        case 'veilleur': container = creerVeilleur(scene, def); break;
        case 'traqueur': container = creerTraqueur(scene, def); break;
        case 'chargeur': container = creerChargeur(scene, def); break;
        case 'tireur':   container = creerTireur(scene, def); break;
        default:         container = creerVeilleur(scene, def);
    }
    peindreAccessoire(scene, container, def);
    return container;
}

// ============================================================
// VEILLEUR — quadrupède pierreux trapu, œil rougeoyant
// ============================================================
function creerVeilleur(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const palette = def.palette;
    const corps = scene.add.graphics();

    // Silhouette légèrement bombée
    corps.fillStyle(assombrir(palette.corps, 0.35), 1);
    corps.beginPath();
    corps.moveTo(-w / 2 + 2, h / 2 - 8);
    corps.lineTo(-w / 2 + 4, -h / 2 + 4);
    corps.lineTo(-w / 2 + 8, -h / 2);
    corps.lineTo( w / 2 - 8, -h / 2);
    corps.lineTo( w / 2 - 4, -h / 2 + 4);
    corps.lineTo( w / 2 - 2, h / 2 - 8);
    corps.closePath();
    corps.fillPath();
    // Bord supérieur (lumière)
    corps.fillStyle(palette.corps, 0.85);
    corps.fillRect(-w / 2 + 4, -h / 2, w - 8, 4);
    // Pattes
    corps.fillStyle(assombrir(palette.corps, 0.45), 1);
    corps.fillRect(-w / 2 + 2, h / 2 - 8, 8, 8);
    corps.fillRect( w / 2 - 10, h / 2 - 8, 8, 8);
    container.add(corps);

    // Fissures
    const fissures = scene.add.graphics();
    fissures.lineStyle(1, palette.fissure ?? assombrir(palette.corps, 0.6), 0.7);
    fissures.beginPath();
    fissures.moveTo(-w / 2 + 5, -h / 2 + 6);
    fissures.lineTo(-w / 2 + 9, -h / 2 + 14);
    fissures.lineTo(-w / 2 + 6, -h / 2 + 20);
    fissures.strokePath();
    fissures.beginPath();
    fissures.moveTo(w / 2 - 4, -h / 2 + 8);
    fissures.lineTo(w / 2 - 8, h / 2 - 12);
    fissures.strokePath();
    container.add(fissures);

    // Œil rougeoyant central (additif)
    const oeil = scene.add.graphics();
    oeil.setBlendMode(Phaser.BlendModes.ADD);
    oeil.fillStyle(assombrir(palette.accent, 0.65), 0.4);
    oeil.fillCircle(0, -2, 9);
    oeil.fillStyle(palette.accent, 0.85);
    oeil.fillCircle(0, -2, 5);
    oeil.fillStyle(eclaircir(palette.accent, 0.5), 1);
    oeil.fillCircle(0, -2, 2);
    container.add(oeil);

    // Animations
    scene.tweens.add({
        targets: container, scaleY: { from: 1, to: 1.03 },
        duration: 2200, ease: 'Sine.InOut', yoyo: true, repeat: -1
    });
    scene.tweens.add({
        targets: oeil, alpha: { from: 0.7, to: 1 },
        duration: 700, ease: 'Sine.InOut', yoyo: true, repeat: -1
    });
    return container;
}

// ============================================================
// TRAQUEUR — silhouette flottante voilée, yeux creux, traînée
// ============================================================
function creerTraqueur(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const palette = def.palette;

    // Robe / corps : oval avec bord en pointes
    const corps = scene.add.graphics();
    corps.fillStyle(palette.corps, 0.7);
    corps.fillEllipse(0, -2, w, h - 4);
    corps.fillStyle(palette.corps, 0.55);
    corps.beginPath();
    corps.moveTo(-w / 2 + 2, h / 2 - 6);
    corps.lineTo(-w / 2 + 4, h / 2 + 4);
    corps.lineTo(-w / 4, h / 2 - 4);
    corps.lineTo(0, h / 2 + 6);
    corps.lineTo(w / 4, h / 2 - 4);
    corps.lineTo(w / 2 - 4, h / 2 + 4);
    corps.lineTo(w / 2 - 2, h / 2 - 6);
    corps.closePath();
    corps.fillPath();
    container.add(corps);

    // Voile clair
    const voile = scene.add.graphics();
    voile.fillStyle(palette.voile ?? eclaircir(palette.corps, 0.4), 0.35);
    voile.fillEllipse(-2, -4, w * 0.7, h * 0.4);
    container.add(voile);

    // Yeux creux
    const yeux = scene.add.graphics();
    yeux.fillStyle(palette.yeux ?? 0x000000, 0.85);
    yeux.fillCircle(-4, -6, 2.2);
    yeux.fillCircle( 4, -6, 2.2);
    // Si yeux luminescents (couleur claire), petit halo additif
    if (palette.yeux && palette.yeux !== 0x000000) {
        const haloYeux = scene.add.graphics();
        haloYeux.setBlendMode(Phaser.BlendModes.ADD);
        haloYeux.fillStyle(palette.yeux, 0.6);
        haloYeux.fillCircle(-4, -6, 4);
        haloYeux.fillCircle( 4, -6, 4);
        container.add(haloYeux);
    }
    container.add(yeux);

    // Traînée de fumée
    if (scene.textures.exists('_particule')) {
        const fumee = scene.add.particles(0, 0, '_particule', {
            lifespan: 800,
            speedY: { min: 10, max: 25 },
            speedX: { min: -8, max: 8 },
            scale: { start: 0.5, end: 0 },
            tint: assombrir(palette.corps, 0.3),
            quantity: 1,
            frequency: 120,
            alpha: { start: 0.5, end: 0 }
        });
        fumee.setDepth(DEPTH.ENTITES - 1);
        const upd = () => {
            if (!fumee.active || !container.active) return;
            fumee.setPosition(container.x, container.y + h / 2);
        };
        scene.events.on('postupdate', upd);
        scene.events.once('shutdown', () => {
            scene.events.off('postupdate', upd);
            fumee?.destroy();
        });
        container._fumee = fumee;
    }

    // Animations
    scene.tweens.add({
        targets: container, y: { from: 0, to: -6 },
        duration: 1500, ease: 'Sine.InOut', yoyo: true, repeat: -1
    });
    scene.tweens.add({
        targets: corps, scaleY: { from: 1, to: 1.06 },
        duration: 900, ease: 'Sine.InOut', yoyo: true, repeat: -1
    });
    scene.tweens.add({
        targets: yeux, scaleY: { from: 1, to: 0.1 },
        duration: 80, yoyo: true, repeat: -1,
        repeatDelay: 3500 + Math.random() * 2500
    });
    return container;
}

// ============================================================
// CHARGEUR — bipède trapu, casque, posture de course
// ============================================================
function creerChargeur(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const palette = def.palette;

    // Corps : trapèze plus large en bas
    const corps = scene.add.graphics();
    corps.fillStyle(assombrir(palette.corps, 0.3), 1);
    corps.beginPath();
    corps.moveTo(-w / 2 + 4, h / 2 - 2);
    corps.lineTo(-w / 2 + 8, -h / 4);
    corps.lineTo(-w / 4 - 2, -h / 2 + 6);
    corps.lineTo( w / 4 + 2, -h / 2 + 6);
    corps.lineTo( w / 2 - 8, -h / 4);
    corps.lineTo( w / 2 - 4, h / 2 - 2);
    corps.closePath();
    corps.fillPath();
    // Bord clair en haut
    corps.fillStyle(palette.corps, 0.8);
    corps.fillRect(-w / 4 - 1, -h / 2 + 6, w / 2 + 2, 3);
    // Pattes / sabots
    corps.fillStyle(assombrir(palette.corps, 0.5), 1);
    corps.fillRect(-w / 2 + 4, h / 2 - 4, 8, 4);
    corps.fillRect( w / 2 - 12, h / 2 - 4, 8, 4);
    container.add(corps);

    // Casque (au-dessus de la tête)
    const casque = scene.add.graphics();
    casque.fillStyle(palette.casque ?? eclaircir(palette.corps, 0.2), 1);
    casque.beginPath();
    casque.moveTo(-w / 4, -h / 2 + 6);
    casque.lineTo(-w / 4 + 3, -h / 2 - 2);
    casque.lineTo( w / 4 - 3, -h / 2 - 2);
    casque.lineTo( w / 4, -h / 2 + 6);
    casque.closePath();
    casque.fillPath();
    // Visière
    casque.fillStyle(assombrir(palette.casque ?? palette.corps, 0.4), 1);
    casque.fillRect(-w / 4 + 2, -h / 2, w / 2 - 4, 3);
    container.add(casque);

    // Yeux brûlants sous la visière (additif)
    const yeux = scene.add.graphics();
    yeux.setBlendMode(Phaser.BlendModes.ADD);
    yeux.fillStyle(palette.accent, 0.9);
    yeux.fillCircle(-w / 8, -h / 2 + 1.5, 2.2);
    yeux.fillCircle( w / 8, -h / 2 + 1.5, 2.2);
    container.add(yeux);

    // Animations : respiration + scintillement des yeux
    scene.tweens.add({
        targets: container, scaleY: { from: 1, to: 1.04 },
        duration: 1400, ease: 'Sine.InOut', yoyo: true, repeat: -1
    });
    scene.tweens.add({
        targets: yeux, alpha: { from: 0.6, to: 1 },
        duration: 500, ease: 'Sine.InOut', yoyo: true, repeat: -1
    });
    container._yeux = yeux;  // exposé pour le telegraph
    return container;
}

// ============================================================
// TIREUR — silhouette globulaire avec gros œil/orbe central
// ============================================================
function creerTireur(scene, def) {
    const container = scene.add.container(0, 0);
    container.setDepth(DEPTH.ENTITES);
    const w = def.largeur, h = def.hauteur;
    const palette = def.palette;

    // Halo extérieur (signature des Tireurs : portée magique)
    const halo = scene.add.graphics();
    halo.setBlendMode(Phaser.BlendModes.ADD);
    halo.fillStyle(palette.halo ?? eclaircir(palette.iris ?? palette.corps, 0.4), 0.25);
    halo.fillCircle(0, 0, w * 0.85);
    halo.fillStyle(palette.halo ?? eclaircir(palette.iris ?? palette.corps, 0.4), 0.4);
    halo.fillCircle(0, 0, w * 0.55);
    container.add(halo);

    // Corps : globe sombre
    const corps = scene.add.graphics();
    corps.fillStyle(assombrir(palette.corps, 0.3), 1);
    corps.fillCircle(0, 0, w / 2);
    corps.fillStyle(palette.corps, 0.85);
    corps.fillCircle(0, -2, w / 2 - 4);
    container.add(corps);

    // Anneau autour du corps (signature Tireur)
    const anneau = scene.add.graphics();
    anneau.lineStyle(2, palette.iris ?? palette.accent ?? 0xffd070, 0.65);
    anneau.strokeCircle(0, 0, w / 2 - 3);
    anneau.lineStyle(1, eclaircir(palette.iris ?? 0xffd070, 0.5), 0.85);
    anneau.strokeCircle(0, 0, w / 2 - 6);
    container.add(anneau);

    // Iris (additif)
    const iris = scene.add.graphics();
    iris.setBlendMode(Phaser.BlendModes.ADD);
    iris.fillStyle(palette.iris ?? 0xffa040, 0.85);
    iris.fillCircle(0, 0, w / 4);
    container.add(iris);

    // Pupille
    const pupille = scene.add.graphics();
    pupille.fillStyle(palette.pupille ?? 0x000000, 1);
    pupille.fillCircle(0, 0, w / 8);
    pupille.fillStyle(0xffffff, 0.85);
    pupille.fillCircle(-1.5, -1.5, w / 24);
    container.add(pupille);

    // Animations : pulse halo + iris + scrutation latérale
    scene.tweens.add({
        targets: halo, alpha: { from: 0.55, to: 1 },
        duration: 1200, ease: 'Sine.InOut', yoyo: true, repeat: -1
    });
    scene.tweens.add({
        targets: iris, scale: { from: 0.92, to: 1.08 },
        duration: 800, ease: 'Sine.InOut', yoyo: true, repeat: -1
    });
    scene.tweens.add({
        targets: anneau, angle: 360,
        duration: 8000, repeat: -1, ease: 'Linear'
    });
    container._iris = iris;
    container._halo = halo;
    return container;
}

// ============================================================
// ACCESSOIRES — peint par-dessus la silhouette de base
// ============================================================
function peindreAccessoire(scene, container, def) {
    const acc = def.accessoire ?? 'aucun';
    if (acc === 'aucun') return;
    const w = def.largeur, h = def.hauteur;
    const palette = def.palette;
    const couleur = palette.accent ?? eclaircir(palette.corps ?? 0x808080, 0.4);
    const couleurO = assombrir(couleur, 0.4);
    const g = scene.add.graphics();

    if (acc === 'cornes_courtes') {
        g.fillStyle(couleurO, 1);
        g.beginPath();
        g.moveTo(-w / 4, -h / 2 + 2);
        g.lineTo(-w / 4 + 3, -h / 2 - 8);
        g.lineTo(-w / 4 + 6, -h / 2 + 2);
        g.closePath();
        g.fillPath();
        g.beginPath();
        g.moveTo( w / 4 - 6, -h / 2 + 2);
        g.lineTo( w / 4 - 3, -h / 2 - 8);
        g.lineTo( w / 4, -h / 2 + 2);
        g.closePath();
        g.fillPath();
    } else if (acc === 'cornes_longues') {
        g.fillStyle(couleurO, 1);
        g.beginPath();
        g.moveTo(-w / 4, -h / 2 + 2);
        g.lineTo(-w / 2 - 4, -h / 2 - 16);
        g.lineTo(-w / 4 + 5, -h / 2);
        g.closePath();
        g.fillPath();
        g.beginPath();
        g.moveTo( w / 4, -h / 2 + 2);
        g.lineTo( w / 2 + 4, -h / 2 - 16);
        g.lineTo( w / 4 - 5, -h / 2);
        g.closePath();
        g.fillPath();
    } else if (acc === 'cornes_arquees') {
        g.lineStyle(3, couleurO, 1);
        g.beginPath();
        g.moveTo(-w / 4, -h / 2);
        g.quadraticCurveTo(-w / 2 - 6, -h / 2 - 12, -w / 4 - 4, -h / 2 - 14);
        g.strokePath();
        g.beginPath();
        g.moveTo( w / 4, -h / 2);
        g.quadraticCurveTo( w / 2 + 6, -h / 2 - 12,  w / 4 + 4, -h / 2 - 14);
        g.strokePath();
    } else if (acc === 'cristaux_dos') {
        g.fillStyle(couleur, 0.85);
        for (let i = -2; i <= 2; i++) {
            const cx = i * 6;
            const cy = -h / 2 - 4 - Math.abs(i) * 2;
            g.beginPath();
            g.moveTo(cx, cy);
            g.lineTo(cx - 3, cy + 8);
            g.lineTo(cx + 3, cy + 8);
            g.closePath();
            g.fillPath();
        }
        g.setBlendMode(Phaser.BlendModes.ADD);
    } else if (acc === 'crocs') {
        g.fillStyle(0xffffff, 0.95);
        g.beginPath();
        g.moveTo(-3, 0);
        g.lineTo(-1, 5);
        g.lineTo( 1, 5);
        g.lineTo( 3, 0);
        g.closePath();
        g.fillPath();
        g.fillStyle(couleurO, 0.7);
        g.fillRect(-4, -1, 8, 1);
    } else if (acc === 'voile_double') {
        g.fillStyle(couleur, 0.4);
        g.fillEllipse(-w * 0.5, h * 0.1, w * 0.6, h * 0.3);
        g.fillEllipse( w * 0.5, h * 0.1, w * 0.6, h * 0.3);
        scene.tweens.add({
            targets: g, scaleX: { from: 0.95, to: 1.1 },
            duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.InOut'
        });
    } else if (acc === 'aura_glace') {
        g.setBlendMode(Phaser.BlendModes.ADD);
        g.fillStyle(couleur, 0.3);
        g.fillCircle(0, 0, w * 0.85);
        g.fillStyle(couleur, 0.5);
        g.fillCircle(0, 0, w * 0.55);
        scene.tweens.add({
            targets: g, alpha: { from: 0.65, to: 1 }, scale: { from: 0.95, to: 1.08 },
            duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.InOut'
        });
    } else if (acc === 'couronne_yeux') {
        g.setBlendMode(Phaser.BlendModes.ADD);
        const r = w * 0.55;
        for (let i = 0; i < 5; i++) {
            const a = -Math.PI / 2 + (i - 2) * 0.4;
            const ex = Math.cos(a) * r;
            const ey = Math.sin(a) * r - 2;
            g.fillStyle(couleur, 0.7);
            g.fillCircle(ex, ey, 3);
            g.fillStyle(eclaircir(couleur, 0.5), 1);
            g.fillCircle(ex, ey, 1.5);
        }
    } else if (acc === 'couronne_epines') {
        g.fillStyle(couleurO, 1);
        const r = w * 0.5;
        for (let i = 0; i < 7; i++) {
            const a = -Math.PI + i * (Math.PI / 6);
            const x0 = Math.cos(a) * r;
            const y0 = Math.sin(a) * r * 0.6 - h / 4;
            const x1 = Math.cos(a) * (r + 12);
            const y1 = Math.sin(a) * (r + 12) * 0.6 - h / 4;
            g.beginPath();
            g.moveTo(x0 - 2, y0);
            g.lineTo(x1, y1);
            g.lineTo(x0 + 2, y0);
            g.closePath();
            g.fillPath();
        }
    }

    container.add(g);
}

// ============================================================
// HELPERS COULEUR
// ============================================================
function eclaircir(c, f) {
    const r = (c >> 16) & 0xff, g = (c >> 8) & 0xff, b = c & 0xff;
    const k = (x) => Math.min(255, Math.round(x + (255 - x) * f));
    return (k(r) << 16) | (k(g) << 8) | k(b);
}
function assombrir(c, f) {
    const r = (c >> 16) & 0xff, g = (c >> 8) & 0xff, b = c & 0xff;
    const k = (x) => Math.max(0, Math.round(x * (1 - f)));
    return (k(r) << 16) | (k(g) << 8) | k(b);
}
