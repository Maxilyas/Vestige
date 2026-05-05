// PorteSortie — arche architecturale par laquelle on passe à la salle suivante.
// Visuel :
//   - Miroir  : arche ornée + intérieur DORÉ lumineux qui pulse + particules dorées
//                (vivant, accueillant, soleil rasant)
//   - Présent : arche érodée + intérieur BLEU FROID fantomatique tamisé + particules
//                bleutées (vestige éteint, lueur ancienne, oubli)

import { DEPTH, paletteDuMonde } from '../PainterlyRenderer.js';

// Lumière chaude du Miroir
const COUL_LUMIERE_MIROIR = 0xc8a85a;
const COUL_LUMIERE_MIROIR_CLAIRE = 0xffd070;
// Lueur froide / fantomatique du Présent (bleu pâle, vestige éteint)
const COUL_LUMIERE_PRESENT = 0x4a6a8a;
const COUL_LUMIERE_PRESENT_CLAIRE = 0x90a8c8;

export function creerVisuelPorteSortie(scene, x, y, largeur, hauteur, monde) {
    const container = scene.add.container(x, y);
    container.setDepth(DEPTH.PLATEFORMES);

    const enMiroir = monde === 'miroir';
    const palette = paletteDuMonde(monde);
    const couleurPierre = enMiroir ? palette.pierre : palette.plateforme;
    const couleurPierreSombre = palette.pierreSombre;

    // Couleurs de lumière selon le monde — chaud Miroir, fantomatique Présent
    const couleurLumiere = enMiroir ? COUL_LUMIERE_MIROIR : COUL_LUMIERE_PRESENT;
    const couleurLumiereClaire = enMiroir ? COUL_LUMIERE_MIROIR_CLAIRE : COUL_LUMIERE_PRESENT_CLAIRE;
    // En Présent la lumière est vraiment tamisée — elle ne brille plus, elle s'attarde
    const intensite = enMiroir ? 1 : 0.45;

    const w = largeur, h = hauteur;
    const epaisseurPied = 7;
    const hauteurArc = w / 2;

    // --- Halo extérieur (additif, pulse) ---
    // Miroir : franc et chaleureux. Présent : très diffus, presque imperceptible.
    const halo = scene.add.graphics();
    halo.setBlendMode(Phaser.BlendModes.ADD);
    if (enMiroir) {
        halo.fillStyle(couleurLumiere, 0.18);
        halo.fillEllipse(0, 0, w + 30, h + 30);
        halo.fillStyle(couleurLumiere, 0.3);
        halo.fillEllipse(0, 0, w + 10, h + 10);
    } else {
        halo.fillStyle(couleurLumiere, 0.07);
        halo.fillEllipse(0, 0, w + 18, h + 18);
        halo.fillStyle(couleurLumiere, 0.12);
        halo.fillEllipse(0, 0, w + 4, h + 4);
    }
    container.add(halo);
    scene.tweens.add({
        targets: halo,
        alpha: { from: enMiroir ? 0.7 : 0.5, to: 1 },
        scale: { from: 0.95, to: 1.05 },
        duration: enMiroir ? 1500 : 2400,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });

    // --- Intérieur lumineux ---
    const interieur = scene.add.graphics();
    interieur.setBlendMode(Phaser.BlendModes.ADD);
    // Rectangle bas (le seuil) — alpha modulé par intensite
    interieur.fillStyle(couleurLumiere, 0.55 * intensite);
    interieur.fillRect(-w / 2 + epaisseurPied, -h / 2 + hauteurArc, w - 2 * epaisseurPied, h / 2 + h / 2 - hauteurArc);
    // Demi-cercle haut (sous l'arche)
    interieur.fillStyle(couleurLumiere, 0.45 * intensite);
    interieur.beginPath();
    interieur.moveTo(-w / 2 + epaisseurPied, -h / 2 + hauteurArc);
    interieur.arc(0, -h / 2 + hauteurArc, w / 2 - epaisseurPied, Math.PI, 0, false);
    interieur.lineTo(w / 2 - epaisseurPied, -h / 2 + hauteurArc);
    interieur.closePath();
    interieur.fillPath();
    // Cœur central — très lumineux en Miroir, juste une lueur résiduelle en Présent
    interieur.fillStyle(couleurLumiereClaire, 0.65 * intensite);
    interieur.fillEllipse(0, 0, w * 0.5, h * 0.6);
    container.add(interieur);

    // Pulse de l'intérieur — plus lent et discret en Présent (lueur ancienne, fatiguée)
    scene.tweens.add({
        targets: interieur,
        alpha: { from: enMiroir ? 0.8 : 0.6, to: 1 },
        duration: enMiroir ? 1300 : 2200,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });

    // --- Arche de pierre (par-dessus l'intérieur lumineux pour silhouette nette) ---
    const arche = scene.add.graphics();

    // Pied gauche
    arche.fillStyle(couleurPierreSombre, 1);
    arche.fillRect(-w / 2 - 1, -h / 2 + hauteurArc - 2, epaisseurPied + 2, h / 2 + h / 2 - hauteurArc + 4);
    arche.fillStyle(couleurPierre, 1);
    arche.fillRect(-w / 2, -h / 2 + hauteurArc, epaisseurPied, h / 2 + h / 2 - hauteurArc);
    // Pied droit
    arche.fillStyle(couleurPierreSombre, 1);
    arche.fillRect(w / 2 - epaisseurPied - 1, -h / 2 + hauteurArc - 2, epaisseurPied + 2, h / 2 + h / 2 - hauteurArc + 4);
    arche.fillStyle(couleurPierre, 1);
    arche.fillRect(w / 2 - epaisseurPied, -h / 2 + hauteurArc, epaisseurPied, h / 2 + h / 2 - hauteurArc);

    // Linteau d'arche (anneau de pierre en demi-cercle au sommet)
    arche.lineStyle(epaisseurPied + 2, couleurPierreSombre, 1);
    arche.beginPath();
    arche.arc(0, -h / 2 + hauteurArc, w / 2 - epaisseurPied / 2, Math.PI, 0, false);
    arche.strokePath();
    arche.lineStyle(epaisseurPied, couleurPierre, 1);
    arche.beginPath();
    arche.arc(0, -h / 2 + hauteurArc, w / 2 - epaisseurPied / 2, Math.PI, 0, false);
    arche.strokePath();

    // Clé de voûte ornementale au sommet
    if (enMiroir) {
        // Miroir : pierre dorée brillante avec reflet
        arche.fillStyle(palette.accent, 1);
        arche.fillCircle(0, -h / 2 + hauteurArc - w / 2 + 2, 4);
        arche.fillStyle(COUL_LUMIERE_MIROIR_CLAIRE, 1);
        arche.fillCircle(-1, -h / 2 + hauteurArc - w / 2 + 1, 1.5);
    } else {
        // Présent : pierre érodée + petite fissure verticale, accent gris-bleuté délavé
        arche.fillStyle(couleurPierreSombre, 1);
        arche.fillCircle(0, -h / 2 + hauteurArc - w / 2 + 2, 3);
        arche.lineStyle(1, couleurPierreSombre, 0.7);
        arche.beginPath();
        arche.moveTo(0, -h / 2 + hauteurArc - w / 2);
        arche.lineTo(1, -h / 2 + hauteurArc - w / 2 + 6);
        arche.strokePath();
    }

    // Highlight sur les bords internes pour effet 3D subtil
    arche.fillStyle(palette.pierreClaire, 0.4);
    arche.fillRect(-w / 2, -h / 2 + hauteurArc, 1, h / 2 + h / 2 - hauteurArc);
    arche.fillRect(w / 2 - 1, -h / 2 + hauteurArc, 1, h / 2 + h / 2 - hauteurArc);

    container.add(arche);

    // --- Particules additives qui montent depuis le seuil ---
    // Dorées chaudes en Miroir, bleutées froides et plus rares en Présent
    if (scene.textures.exists('_particule')) {
        const part = scene.add.particles(0, 0, '_particule', {
            lifespan: enMiroir ? 1300 : 1800,
            speedY: enMiroir ? { min: -45, max: -20 } : { min: -25, max: -12 },
            speedX: { min: -6, max: 6 },
            scale: { start: enMiroir ? 0.45 : 0.35, end: 0 },
            tint: [couleurLumiere, couleurLumiereClaire],
            quantity: 1,
            frequency: enMiroir ? 180 : 380, // beaucoup plus rare en Présent
            blendMode: Phaser.BlendModes.ADD,
            alpha: { start: enMiroir ? 0.9 : 0.5, end: 0 },
            emitZone: {
                type: 'random',
                source: new Phaser.Geom.Rectangle(
                    -w / 2 + epaisseurPied + 4,
                    h / 2 - 10,
                    w - 2 * epaisseurPied - 8,
                    8
                )
            }
        });
        part.setDepth(DEPTH.PLATEFORMES + 1);
        const upd = () => {
            if (!part.active || !container.active) return;
            part.setPosition(container.x, container.y);
        };
        scene.events.on('postupdate', upd);
        scene.events.once('shutdown', () => {
            scene.events.off('postupdate', upd);
            part?.destroy();
        });
    }

    return container;
}
