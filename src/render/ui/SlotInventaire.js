// SlotInventaire — un slot stylisé (cadre + état + emblème + ★ tier III + glow hover).
//
// Deux modes :
//   - inventaire : carré ~36 px, cadre fin gravé
//   - équipé     : carré ~50 px, cadre doré ornementé + label en dessous

import { peindreEmblemeFamille } from './EmblemeFamille.js';
import { COULEURS_INVENTAIRE } from './CadreInventaire.js';
import { COULEURS_FAMILLE, getItemOuVestige } from '../../data/items.js';

/**
 * Crée un slot complet à la position (x, y).
 * @param {Object} options
 *   - taille    : taille en px (36 par défaut, 50 pour équipé)
 *   - itemId    : id d'item à afficher, null si vide
 *   - equipe    : true si c'est un slot équipé (cadre doré ornementé + label)
 *   - label     : texte sous le slot (équipé : "TÊTE" / "CORPS" / "ACC.")
 *   - onClick   : callback au clic (avec hover doré)
 * @returns {{ container, refresh(itemId) }}
 */
export function creerSlot(scene, x, y, options = {}) {
    const {
        taille = 36,
        itemId = null,
        equipe = false,
        label = null,
        onClick = null
    } = options;

    const container = scene.add.container(x, y);
    container.setScrollFactor(0);
    container.setDepth(305);

    // --- Fond ---
    const fond = scene.add.graphics();
    fond.fillStyle(0x080604, 1);
    fond.fillRect(-taille / 2, -taille / 2, taille, taille);
    container.add(fond);

    // --- Bordure ---
    const bord = scene.add.graphics();
    container.add(bord);

    // --- Halo (visible uniquement pour Tier III ou hover) ---
    const halo = scene.add.graphics();
    halo.setBlendMode(Phaser.BlendModes.ADD);
    container.add(halo);

    // --- Couches dynamiques (emblème + étoile + tinted bg) ---
    let couches = scene.add.container(0, 0);
    container.add(couches);

    // --- Label sous le slot (équipés uniquement) ---
    if (label) {
        const lbl = scene.add.text(0, taille / 2 + 8, label, {
            fontFamily: 'monospace',
            fontSize: '9px',
            color: '#c8a85a',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5, 0);
        container.add(lbl);
    }

    // --- Hitbox cliquable ---
    let hover = false;
    if (onClick) {
        const hit = scene.add.rectangle(0, 0, taille, taille, 0xffffff, 0)
            .setInteractive({ useHandCursor: true });
        hit.on('pointerdown', () => onClick());
        hit.on('pointerover', () => { hover = true; redessiner(); });
        hit.on('pointerout', () => { hover = false; redessiner(); });
        container.add(hit);
    }

    // --- Fonction de redessin (appelée au refresh d'item ou hover) ---
    let courantItemId = itemId;
    function redessiner() {
        bord.clear();
        halo.clear();
        couches.removeAll(true);

        const item = courantItemId ? getItemOuVestige(courantItemId) : null;
        const familleColor = item ? COULEURS_FAMILLE[item.famille] : null;

        // Fond légèrement teinté de la couleur de famille si plein
        if (item) {
            const tinted = scene.add.graphics();
            tinted.fillStyle(familleColor, 0.18);
            tinted.fillRect(-taille / 2 + 1, -taille / 2 + 1, taille - 2, taille - 2);
            couches.add(tinted);
        }

        // Bordure
        const couleurBord = hover
            ? COULEURS_INVENTAIRE.orClair
            : (equipe ? COULEURS_INVENTAIRE.or : (item ? 0x6a6a7a : 0x3a3a3a));
        const epaisseur = equipe ? 2 : 1;
        bord.lineStyle(epaisseur, couleurBord, 1);
        bord.strokeRect(-taille / 2, -taille / 2, taille, taille);

        // Cadre ornementé pour les slots équipés
        if (equipe) {
            bord.lineStyle(1, COULEURS_INVENTAIRE.orClair, 0.7);
            bord.strokeRect(-taille / 2 + 3, -taille / 2 + 3, taille - 6, taille - 6);
            // Petits coins
            const cornerLen = 4;
            const c = COULEURS_INVENTAIRE.orClair;
            bord.lineStyle(1.5, c, 1);
            const tCoin = (cx, cy, dx, dy) => {
                bord.beginPath();
                bord.moveTo(cx, cy);
                bord.lineTo(cx + dx * cornerLen, cy);
                bord.moveTo(cx, cy);
                bord.lineTo(cx, cy + dy * cornerLen);
                bord.strokePath();
            };
            tCoin(-taille / 2, -taille / 2, 1, 1);
            tCoin(taille / 2, -taille / 2, -1, 1);
            tCoin(-taille / 2, taille / 2, 1, -1);
            tCoin(taille / 2, taille / 2, -1, -1);
        }

        // Glow doré au hover
        if (hover) {
            halo.fillStyle(COULEURS_INVENTAIRE.orClair, 0.25);
            halo.fillRect(-taille / 2 - 4, -taille / 2 - 4, taille + 8, taille + 8);
        }

        // Emblème + étoile pour les items
        if (item) {
            const tEmb = equipe ? Math.min(28, taille * 0.55) : Math.min(20, taille * 0.55);
            const emb = peindreEmblemeFamille(scene, 0, 0, item.famille, tEmb);
            couches.add(emb);

            // Étoile rouge pour Tier III
            if (item.tier === 3) {
                const eto = scene.add.graphics();
                eto.fillStyle(0xff6060, 1);
                // Étoile à 5 branches
                const dx = taille / 2 - 5;
                const dy = -taille / 2 + 5;
                const r1 = 4;
                const r2 = 1.7;
                eto.beginPath();
                for (let i = 0; i < 10; i++) {
                    const ang = (i * Math.PI) / 5 - Math.PI / 2;
                    const r = (i % 2 === 0) ? r1 : r2;
                    const ex = dx + Math.cos(ang) * r;
                    const ey = dy + Math.sin(ang) * r;
                    if (i === 0) eto.moveTo(ex, ey);
                    else eto.lineTo(ex, ey);
                }
                eto.closePath();
                eto.fillPath();
                // Glow rouge subtil derrière l'étoile
                halo.fillStyle(0xff4040, 0.35);
                halo.fillCircle(dx, dy, 7);
                couches.add(eto);
            }
        }
    }

    redessiner();

    return {
        container,
        refresh(newItemId) {
            courantItemId = newItemId;
            redessiner();
        }
    };
}
