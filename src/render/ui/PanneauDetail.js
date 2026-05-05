// PanneauDetail — panneau d'information à droite de l'inventaire.
// Affiche un emblème agrandi, le nom stylisé, la description italique encadrée,
// les effets lus selon le tier de révélation, et les boutons d'action.

import { peindreEmblemeFamille } from './EmblemeFamille.js';
import { COULEURS_INVENTAIRE } from './CadreInventaire.js';
import { COULEURS_FAMILLE } from '../../data/items.js';

const couleurHex = (n) => '#' + n.toString(16).padStart(6, '0');

/**
 * Construit le panneau détail dans la zone (x, y, largeur, hauteur).
 * @returns {{ container, afficherTexte, afficherItem, vider }}
 */
export function creerPanneauDetail(scene, x, y, largeur, hauteur) {
    const container = scene.add.container(x, y);
    container.setScrollFactor(0);
    container.setDepth(305);

    // --- Cadre du panneau ---
    const cadre = scene.add.graphics();
    cadre.fillStyle(0x0a0805, 0.85);
    cadre.fillRect(0, 0, largeur, hauteur);
    cadre.lineStyle(1, COULEURS_INVENTAIRE.or, 0.9);
    cadre.strokeRect(0, 0, largeur, hauteur);
    cadre.lineStyle(1, COULEURS_INVENTAIRE.orClair, 0.4);
    cadre.strokeRect(3, 3, largeur - 6, hauteur - 6);
    container.add(cadre);

    // --- Container interne pour le contenu (peut être vidé/redessiné) ---
    let contenu = scene.add.container(0, 0);
    container.add(contenu);

    function vider() {
        contenu.destroy();
        contenu = scene.add.container(0, 0);
        container.add(contenu);
    }

    function afficherTexte(texte) {
        vider();
        const t = scene.add.text(largeur / 2, hauteur / 2, texte, {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#8a8a9a',
            align: 'center',
            wordWrap: { width: largeur - 30 },
            fontStyle: 'italic'
        }).setOrigin(0.5);
        contenu.add(t);
    }

    /**
     * Affiche un item complet.
     * @param {Object} item
     * @param {Object} ctx  { equipe: bool, slot?: string, indexInv?: number }
     * @param {Object} actions  { onEquiper, onDesequiper, onJeter }
     */
    function afficherItem(item, ctx, actions) {
        vider();

        const familleColor = COULEURS_FAMILLE[item.famille];
        const couleurCss = couleurHex(familleColor);
        const cx = largeur / 2;

        // --- Emblème agrandi avec halo ---
        const halo = scene.add.graphics();
        halo.setBlendMode(Phaser.BlendModes.ADD);
        halo.fillStyle(familleColor, 0.4);
        halo.fillCircle(cx, 50, 38);
        halo.fillStyle(familleColor, 0.7);
        halo.fillCircle(cx, 50, 24);
        contenu.add(halo);
        const emb = peindreEmblemeFamille(scene, cx, 50, item.famille, 38);
        contenu.add(emb);

        scene.tweens.add({
            targets: halo,
            alpha: { from: 0.7, to: 1 },
            duration: 1200,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });

        // --- Nom stylisé ---
        let nomTexte = item.nom;
        if (item.tier === 3) nomTexte += ' ★';
        const nom = scene.add.text(cx, 100, nomTexte, {
            fontFamily: 'monospace',
            fontSize: '15px',
            color: couleurCss,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center',
            wordWrap: { width: largeur - 20 }
        }).setOrigin(0.5, 0);
        contenu.add(nom);

        // --- Sous-titre famille • slot ---
        const sous = scene.add.text(cx, 124, `${item.famille.toUpperCase()}  •  ${item.slot}`, {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#8a8a9a',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        contenu.add(sous);

        // --- Petit liseré séparateur ---
        const sep = scene.add.graphics();
        sep.lineStyle(1, COULEURS_INVENTAIRE.or, 0.7);
        sep.beginPath();
        sep.moveTo(cx - 60, 146);
        sep.lineTo(cx + 60, 146);
        sep.strokePath();
        sep.fillStyle(COULEURS_INVENTAIRE.orClair, 1);
        sep.beginPath();
        sep.moveTo(cx, 143);
        sep.lineTo(cx + 4, 146);
        sep.lineTo(cx, 149);
        sep.lineTo(cx - 4, 146);
        sep.closePath();
        sep.fillPath();
        contenu.add(sep);

        // --- Description italique encadrée ---
        const descBox = scene.add.graphics();
        descBox.lineStyle(1, COULEURS_INVENTAIRE.or, 0.4);
        descBox.strokeRect(12, 158, largeur - 24, 50);
        contenu.add(descBox);

        const desc = scene.add.text(cx, 183, item.description ?? '...', {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#e8e4d8',
            fontStyle: 'italic',
            align: 'center',
            wordWrap: { width: largeur - 36 }
        }).setOrigin(0.5);
        contenu.add(desc);

        // --- Effets selon tier ---
        const yEff = 220;
        const lignes = [];
        const effets = item.effets ?? [];
        if (item.tier === 1) {
            for (const e of effets) lignes.push(formatEffet(e));
        } else if (item.tier === 2) {
            for (const e of effets) {
                lignes.push(e.visible ? formatEffet(e) : '? — effet inconnu');
            }
        } else {
            lignes.push("Cet objet ne se laisse pas lire.");
        }

        // Titre "Effets" en or
        const titreEff = scene.add.text(20, yEff, 'EFFETS', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: couleurHex(COULEURS_INVENTAIRE.or),
            fontStyle: 'bold'
        });
        contenu.add(titreEff);

        // Ligne sous le titre
        const sepEff = scene.add.graphics();
        sepEff.lineStyle(1, COULEURS_INVENTAIRE.or, 0.4);
        sepEff.beginPath();
        sepEff.moveTo(20, yEff + 14);
        sepEff.lineTo(largeur - 20, yEff + 14);
        sepEff.strokePath();
        contenu.add(sepEff);

        // Lignes d'effets avec puces dorées
        let yL = yEff + 22;
        for (const ligne of lignes) {
            const isUnknown = ligne.startsWith('?');
            const isMystere = ligne.startsWith('Cet objet');

            // Puce
            const puce = scene.add.graphics();
            puce.fillStyle(isMystere ? 0xff6060 : COULEURS_INVENTAIRE.orClair, 1);
            puce.fillCircle(28, yL + 7, 2);
            contenu.add(puce);

            const txt = scene.add.text(38, yL, ligne, {
                fontFamily: 'monospace',
                fontSize: '11px',
                color: isMystere ? '#ff8080' : (isUnknown ? '#7a7a8a' : '#d8d4c8'),
                fontStyle: isMystere ? 'italic' : 'normal'
            });
            contenu.add(txt);
            yL += 16;
        }

        // --- Boutons d'action ---
        // yL contient la position après la dernière ligne d'effet : on place
        // les boutons AU MOINS 24 px sous les effets, sinon à 44 px du bas
        const yBtn = Math.max(yL + 24, hauteur - 44);
        if (ctx.equipe) {
            ajouterBouton(scene, contenu, 20, yBtn, 'Déséquiper', () => actions.onDesequiper());
        } else {
            ajouterBouton(scene, contenu, 20, yBtn, 'Équiper', () => actions.onEquiper());
            ajouterBouton(scene, contenu, 130, yBtn, 'Jeter', () => actions.onJeter(), true);
        }
    }

    function formatEffet(e) {
        const signe = e.delta >= 0 ? '+' : '';
        return `${signe}${e.delta} ${e.cible}`;
    }

    afficherTexte('Sélectionne un objet pour voir ses détails.');

    return { container, afficherTexte, afficherItem, vider };
}

// ============================================================
// Bouton stylisé "manuscrit"
// ============================================================
function ajouterBouton(scene, parent, x, y, label, onClick, danger = false) {
    const w = 100, h = 28;
    const couleurFond = danger ? 0x2a0a0a : 0x14100a;
    const couleurFondHover = danger ? 0x4a1010 : 0x2a1810;
    const couleurBord = danger ? 0xff6060 : COULEURS_INVENTAIRE.or;
    const couleurBordHover = danger ? 0xff8080 : COULEURS_INVENTAIRE.orClair;

    const fond = scene.add.graphics();
    const txt = scene.add.text(x + w / 2, y + h / 2, label, {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: danger ? '#ffa0a0' : '#ffd070',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
    }).setOrigin(0.5);
    const hit = scene.add.rectangle(x + w / 2, y + h / 2, w, h, 0xffffff, 0)
        .setInteractive({ useHandCursor: true });

    function dessinerFond(hover) {
        fond.clear();
        fond.fillStyle(hover ? couleurFondHover : couleurFond, 1);
        fond.fillRect(x, y, w, h);
        fond.lineStyle(1.5, hover ? couleurBordHover : couleurBord, 1);
        fond.strokeRect(x, y, w, h);
        // Petits coins
        fond.lineStyle(1, couleurBordHover, 0.7);
        const c = 4;
        fond.beginPath();
        fond.moveTo(x, y + c); fond.lineTo(x, y); fond.lineTo(x + c, y);
        fond.moveTo(x + w - c, y); fond.lineTo(x + w, y); fond.lineTo(x + w, y + c);
        fond.moveTo(x, y + h - c); fond.lineTo(x, y + h); fond.lineTo(x + c, y + h);
        fond.moveTo(x + w - c, y + h); fond.lineTo(x + w, y + h); fond.lineTo(x + w, y + h - c);
        fond.strokePath();
    }
    dessinerFond(false);

    hit.on('pointerover', () => dessinerFond(true));
    hit.on('pointerout', () => dessinerFond(false));
    hit.on('pointerdown', onClick);

    parent.add(fond);
    parent.add(txt);
    parent.add(hit);
}
