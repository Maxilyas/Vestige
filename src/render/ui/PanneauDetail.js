// PanneauDetail — panneau d'information à droite de l'inventaire.
// Affiche un emblème agrandi, le nom stylisé, la description italique encadrée,
// les effets lus selon le tier de révélation, et les boutons d'action.

import { peindreEmblemeFamille } from './EmblemeFamille.js';
import { COULEURS_INVENTAIRE } from './CadreInventaire.js';
import { COULEURS_FAMILLE } from '../../data/items.js';
import { IdentificationSystem } from '../../systems/IdentificationSystem.js';

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

        // ─── HEADER HORIZONTAL : emblème + nom sur la même ligne ─────────
        // Layout responsive Phase 5b — économise ~60 px verticaux pour la
        // liste d'effets. Emblème à gauche, infos (nom + sous-titre) à droite.
        const xEmb = 32;
        const yEmb = 28;
        const rEmb = 18;

        const halo = scene.add.graphics();
        halo.setBlendMode(Phaser.BlendModes.ADD);
        halo.fillStyle(familleColor, 0.4);
        halo.fillCircle(xEmb, yEmb, rEmb + 6);
        halo.fillStyle(familleColor, 0.7);
        halo.fillCircle(xEmb, yEmb, rEmb - 4);
        contenu.add(halo);
        const emb = peindreEmblemeFamille(scene, xEmb, yEmb, item.famille, rEmb * 2);
        contenu.add(emb);

        scene.tweens.add({
            targets: halo,
            alpha: { from: 0.7, to: 1 },
            duration: 1200,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });

        // Nom à droite de l'emblème, baseline alignée
        let nomTexte = item.nom;
        if (item.tier === 3) nomTexte += ' ★';
        const xInfo = xEmb + rEmb + 14;
        const nom = scene.add.text(xInfo, yEmb - 12, nomTexte, {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: couleurCss,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3,
            wordWrap: { width: largeur - xInfo - 12 }
        }).setOrigin(0, 0);
        contenu.add(nom);

        // Sous-titre famille • slot sous le nom
        const sous = scene.add.text(xInfo, yEmb + 6, `${item.famille.toUpperCase()}  •  ${item.slot}`, {
            fontFamily: 'monospace',
            fontSize: '9px',
            color: '#8a8a9a',
            fontStyle: 'bold'
        }).setOrigin(0, 0);
        contenu.add(sous);

        // ─── Liseré séparateur horizontal sous le header ───────────────
        const sep = scene.add.graphics();
        sep.lineStyle(1, COULEURS_INVENTAIRE.or, 0.4);
        sep.beginPath();
        sep.moveTo(12, 58);
        sep.lineTo(largeur - 12, 58);
        sep.strokePath();
        contenu.add(sep);

        // ─── Description italique (sur toute la largeur, 2 lignes max) ──
        const desc = scene.add.text(largeur / 2, 70, item.description ?? '...', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#c8c4b8',
            fontStyle: 'italic',
            align: 'center',
            wordWrap: { width: largeur - 28 }
        }).setOrigin(0.5, 0);
        contenu.add(desc);

        // ─── Effets (zone large : de yEff à hauteur-40 réservé aux boutons) ──
        // Calcul de la position : juste sous la description, mais on tient compte
        // de sa hauteur dynamique (1, 2 ou 3 lignes) en mesurant sa height réelle.
        const yEff = Math.max(108, 70 + desc.height + 8);
        const lignes = [];
        // IdentificationSystem calcule l'état réel des effets (Tier 1 = tout
        // visible, Tier 2 = visible:true ou révélé, Tier 3 = uniquement révélé)
        const ident = new IdentificationSystem(scene.registry);
        const effetsCalc = ident.effetsEffectifs(item);
        const aucunVisible = effetsCalc.length > 0 && effetsCalc.every(e => !e.visible);
        if (aucunVisible) {
            lignes.push("Cet objet ne se laisse pas lire.");
        } else {
            for (const e of effetsCalc) {
                lignes.push(e.visible ? formatEffet(e) : '? — effet inconnu');
            }
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

        // Lignes d'effets avec puces dorées (compactes)
        let yL = yEff + 18;
        for (const ligne of lignes) {
            const isUnknown = ligne.startsWith('?');
            const isMystere = ligne.startsWith('Cet objet');

            // Puce
            const puce = scene.add.graphics();
            puce.fillStyle(isMystere ? 0xff6060 : COULEURS_INVENTAIRE.orClair, 1);
            puce.fillCircle(28, yL + 5, 2);
            contenu.add(puce);

            const txt = scene.add.text(38, yL, ligne, {
                fontFamily: 'monospace',
                fontSize: '10px',
                color: isMystere ? '#ff8080' : (isUnknown ? '#7a7a8a' : '#d8d4c8'),
                fontStyle: isMystere ? 'italic' : 'normal'
            });
            contenu.add(txt);
            yL += 12;
        }

        // --- Boutons d'action — toujours collés au bas du panneau ---
        const yBtn = hauteur - 32;
        if (ctx.equipe) {
            ajouterBouton(scene, contenu, 20, yBtn, 'Déséquiper', () => actions.onDesequiper());
        } else {
            ajouterBouton(scene, contenu, 20, yBtn, 'Équiper', () => actions.onEquiper());
            ajouterBouton(scene, contenu, 130, yBtn, 'Jeter', () => actions.onJeter(), true);
        }
    }


    afficherTexte('Sélectionne un objet pour voir ses détails.');

    function formatEffet(e) {
        const signe = e.delta >= 0 ? '+' : '';
        return `${signe}${e.delta} ${e.cible}`;
    }

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
