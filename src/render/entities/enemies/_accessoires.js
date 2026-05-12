// Accessoires peints par-dessus la silhouette de base d'un ennemi.
// (Cornes, cristaux, voile, aura, couronnes, etc.)

import { tracerCourbeQuadratique } from '../../PainterlyRenderer.js';
import { eclaircir, assombrir } from './_helpers.js';

export function peindreAccessoire(scene, container, def) {
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
        tracerCourbeQuadratique(g,
            -w / 4, -h / 2, -w / 2 - 6, -h / 2 - 12, -w / 4 - 4, -h / 2 - 14, 14);
        tracerCourbeQuadratique(g,
             w / 4, -h / 2,  w / 2 + 6, -h / 2 - 12,  w / 4 + 4, -h / 2 - 14, 14);
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
