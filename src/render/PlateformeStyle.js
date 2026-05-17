// PlateformeStyle — ornements visuels par-dessus les plateformes physiques.
//
// La plateforme physique reste un Phaser.Rectangle (pour la collision arcade).
// Au-dessus, on dessine un Graphics qui apporte la patine peinte :
//   - Présent — branche par biome :
//       ruines_basses : pierre humide, mousse vivace, fleurs occasionnelles,
//                       luminescence vert pâle (ADD)
//       halls_cendres : pierre carbonisée, suie aux bords, fissures rougeoyantes,
//                       braises ADD pulsantes + foyers éteints cuivre terni
//                       (gradient narratif étage 3 vifs → étage 4 mourants)
//   - Miroir          : pavés ornés avec chasse-pieds doré, motifs de joints

import { DEPTH } from './PainterlyRenderer.js';

/**
 * Pose un ornement visuel par-dessus une plateforme. La plateforme physique
 * (Rectangle dans GameScene) reste tel quel pour la collision.
 *
 * @param {Phaser.Scene} scene
 * @param {number} x, y      centre de la plateforme physique
 * @param {number} largeur, hauteur dimensions de la plateforme
 * @param {string} monde
 * @param {Object} palette
 * @param {boolean} oneWay   true si plateforme one-way (corniche)
 * @param {boolean} estSol   true si c'est le sol principal (gros bandeau horizontal)
 */
export function peindreOrnementPlateforme(scene, x, y, largeur, hauteur, monde, palette, oneWay, estSol) {
    const g = scene.add.graphics();
    g.setDepth(DEPTH.PLATEFORMES + 1);

    const xG = x - largeur / 2;
    const yT = y - hauteur / 2;
    const yB = y + hauteur / 2;
    const enMiroir = monde === 'miroir';

    if (!enMiroir) {
        // === PRÉSENT — branche par biome ===
        const biomeId = scene.registry.get('biome_id_courant') || 'ruines_basses';
        if (biomeId === 'halls_cendres') {
            peindreOrnementHallsCendres(scene, g, xG, yT, yB, largeur, hauteur, palette, estSol);
            return g;
        }

        // === PRÉSENT — style "tableau peint" (Ruines basses, défaut) ===
        // Le but : signaler "ici on marche" sans tomber dans le tranché Hollow
        // Knight. On joue sur 4 leviers : top highlight peint, ombre portée
        // qui décolle la plateforme du décor, micro-variations de teinte sur
        // la surface (pas un aplat), et touffes/fleurs vivantes au sommet.

        // (1) Ombre portée — dégradé sombre 7 px sous la plateforme, décolle
        //     visuellement du décor lointain en dessous.
        for (let i = 0; i < 7; i++) {
            const a = 0.20 * (1 - i / 7);
            g.fillStyle(0x101810, a);
            g.fillRect(xG + 1 + i * 0.5, yB + i, largeur - 2 - i, 1);
        }

        // (2) Micro-variations de teinte sur la surface — 3-5 zones légèrement
        //     plus claires/sombres, donne l'effet "peint à main", pas aplat.
        const nbZones = Math.max(3, Math.floor(largeur / 60));
        for (let i = 0; i < nbZones; i++) {
            const t = (i + 0.5) / nbZones;
            const xZ = xG + t * largeur + (Math.random() - 0.5) * 8;
            const wZ = largeur / nbZones * (0.6 + Math.random() * 0.4);
            const variation = Math.random() < 0.5 ? palette.pierreClaire : palette.pierreSombre;
            const alphaZ = 0.18 + Math.random() * 0.10;
            g.fillStyle(variation, alphaZ);
            g.fillRect(xZ - wZ / 2, yT + 2, wZ, hauteur - 3);
        }

        // (3) Top highlight peint — ligne 2 px claire au sommet (signal "praticable")
        //     Couleur palette.plateformeContour avec un poil de variation pour
        //     éviter l'aspect tracé droit.
        g.fillStyle(palette.plateformeContour, 0.85);
        g.fillRect(xG, yT, largeur, 1);
        g.fillStyle(palette.pierreClaire, 0.50);
        g.fillRect(xG, yT + 1, largeur, 1);

        // (4) Bordure érodée (encoches subtiles en haut — moins denses qu'avant)
        g.fillStyle(palette.pierreSombre, 0.6);
        const nbEncoches = Math.max(2, Math.floor(largeur / 45));
        for (let i = 0; i < nbEncoches; i++) {
            if (Math.random() < 0.4) {
                const xE = xG + ((i + 0.5) / nbEncoches) * largeur;
                g.fillRect(xE - 2, yT - 1, 4, 2);
            }
        }

        // (5) Fissures discrètes (segments courts, pas longues lignes verticales)
        if (!estSol) {
            const nbFissures = Math.max(1, Math.floor(largeur / 70));
            g.lineStyle(1, palette.pierreSombre, 0.45);
            for (let i = 0; i < nbFissures; i++) {
                const xF = xG + ((i + 0.5) / nbFissures) * largeur + (Math.random() - 0.5) * 6;
                const yF1 = yT + 3 + Math.random() * (hauteur - 6) * 0.3;
                const yF2 = yF1 + (hauteur - 6) * (0.3 + Math.random() * 0.3);
                g.beginPath();
                g.moveTo(xF, yF1);
                g.lineTo(xF + (Math.random() - 0.5) * 3, yF2);
                g.strokePath();
            }
        }

        // (6) Mousse / herbes sur le top — densité variable selon largeur
        //     Mix de vert vif (palette.mousse) et rare pourpre (palette.racine)
        const nbTouffes = Math.max(2, Math.floor(largeur / 24));
        for (let i = 0; i < nbTouffes; i++) {
            if (Math.random() < 0.65) {
                const xT0 = xG + 3 + (i / nbTouffes) * (largeur - 6) + (Math.random() - 0.5) * 6;
                const pourpre = Math.random() < 0.12;
                const couleurT = pourpre ? palette.racine : palette.mousse;
                const alphaT = pourpre ? 0.55 : 0.75;
                const hauteurH = 3 + Math.random() * 5;
                g.lineStyle(1, couleurT, alphaT);
                g.beginPath();
                g.moveTo(xT0, yT);
                g.lineTo(xT0 + (Math.random() - 0.5) * 1.5, yT - hauteurH);
                g.strokePath();
                // 1 petit brin secondaire
                if (Math.random() < 0.45) {
                    g.beginPath();
                    g.moveTo(xT0 + 1, yT);
                    g.lineTo(xT0 + 1 + (Math.random() - 0.5) * 1, yT - hauteurH * 0.7);
                    g.strokePath();
                }
            }
        }

        // (7) Touffes de mousse plus grasse aux deux extrémités (les bords retiennent
        //     plus d'humidité — détail peint qui donne du poids visuel aux extrémités)
        g.fillStyle(palette.mousse, 0.65);
        g.fillEllipse(xG + 5, yT + 1, 10, 3);
        g.fillEllipse(xG + largeur - 5, yT + 1, 10, 3);
        g.fillStyle(palette.racine, 0.4);
        g.fillCircle(xG + 4, yT + 2, 2);
        g.fillCircle(xG + largeur - 4, yT + 2, 2);

        // (8) Petite fleur occasionnelle (1 plateforme sur ~4) — un petit point
        //     de couleur qui attire l'œil et rend chaque plateforme unique
        if (Math.random() < 0.25) {
            const xFl = xG + 10 + Math.random() * (largeur - 20);
            const couleurFl = Math.random() < 0.5 ? 0xc8a85a : palette.racine;
            g.fillStyle(couleurFl, 0.85);
            g.fillCircle(xFl, yT - 4, 1.5);
            // Tige
            g.lineStyle(0.8, palette.mousse, 0.7);
            g.beginPath();
            g.moveTo(xFl, yT);
            g.lineTo(xFl, yT - 4);
            g.strokePath();
        }

        // (9) Mousse luminescente — 1-2 touches vert pâle qui luisent
        //     subtilement (ADD), évoque la magie qui imprègne les ruines.
        //     Sur un Graphics séparé pour pouvoir l'animer en pulsation.
        const luminescence = scene.add.graphics();
        luminescence.setDepth(DEPTH.PLATEFORMES + 1);
        luminescence.setBlendMode(Phaser.BlendModes.ADD);
        const nbLum = 1 + (Math.random() < 0.6 ? 1 : 0);
        for (let i = 0; i < nbLum; i++) {
            const xL = xG + 12 + Math.random() * Math.max(8, largeur - 24);
            luminescence.fillStyle(0xc8e090, 0.32);
            luminescence.fillEllipse(xL, yT + 1, 14, 5);
            luminescence.fillStyle(0xe8ffb0, 0.45);
            luminescence.fillEllipse(xL, yT + 1, 6, 2.5);
        }
        // Pulse très doux
        scene.tweens.add({
            targets: luminescence,
            alpha: { from: 0.55, to: 1.0 },
            duration: 1800 + Math.random() * 1400,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
    } else {
        // === MIROIR — pavés ornés ===

        // Chasse-pieds doré en haut (signature Miroir, détail brillant)
        g.fillStyle(palette.accent, 0.85);
        g.fillRect(xG, yT, largeur, 2);
        g.fillStyle(palette.flamme, 0.4);
        g.fillRect(xG, yT, largeur, 1); // highlight encore plus clair

        // Joints verticaux entre pavés
        g.lineStyle(1, palette.pierreSombre, 0.45);
        const nbJoints = Math.max(1, Math.floor(largeur / 32));
        for (let i = 1; i < nbJoints; i++) {
            const xJ = xG + (i / nbJoints) * largeur;
            g.beginPath();
            g.moveTo(xJ, yT + 2);
            g.lineTo(xJ, yB);
            g.strokePath();
        }

        // Motif central doré sur le sol uniquement (frise)
        if (estSol) {
            const nbMotifs = Math.floor(largeur / 60);
            for (let i = 0; i < nbMotifs; i++) {
                const xM = xG + ((i + 0.5) / nbMotifs) * largeur;
                g.fillStyle(palette.accent, 0.6);
                g.fillRect(xM - 2, yT + 6, 4, 2);
                g.fillStyle(palette.flamme, 0.5);
                g.fillRect(xM - 1, yT + 6, 2, 2);
            }
        }

        // Petites fleurs/herbes vertes aux extrémités du sol
        if (estSol) {
            g.fillStyle(palette.mousse, 0.7);
            g.fillCircle(xG + 4, yT - 1, 2);
            g.fillCircle(xG + largeur - 4, yT - 1, 2);
        }
    }

    return g;
}

// ============================================================
// HALLS CENDRÉS — pierre carbonisée, suie, braises rougeoyantes
// ============================================================
//
// Signature visuelle opposée aux Ruines basses :
//   - pas de mousse vivante : SUIE (dépôts noirs profonds aux bords)
//   - pas de fissures grises : FISSURES ROUGEOYANTES (lignes ADD orange)
//   - pas de fleur occasionnelle : BRAISE ACTIVE pulsante (ADD chaud)
//   - pas de luminescence verte : BRAISE LUMINESCENTE orange (ADD)
//   - touffes d'extrémité : DÉPÔTS CUIVRE TERNI (coins fondus)
//
// Gradient narratif "feu s'éteint" étage 3 → 4 :
//   - étage 3 : ~60 % des plateformes ont une braise active (foyer vif)
//   - étage 4 : ~25 % des plateformes ont une braise active (foyers mourants)
//   les autres ont des foyers éteints (cuivre terni mat, pas d'ADD).
function peindreOrnementHallsCendres(scene, g, xG, yT, yB, largeur, hauteur, palette, estSol) {
    const etage = scene.registry.get('etage_courant') ?? 3;
    const ratioBraiseActive = etage <= 3 ? 0.60 : 0.25;

    // (1) Ombre portée chaude-noire — la pierre brûlée tire vers le cuivre
    //     foncé en dessous, pas vert sombre.
    for (let i = 0; i < 7; i++) {
        const a = 0.22 * (1 - i / 7);
        g.fillStyle(0x0a0604, a);
        g.fillRect(xG + 1 + i * 0.5, yB + i, largeur - 2 - i, 1);
    }

    // (2) Micro-variations de teinte — alternance pierre claire / sombre,
    //     donne l'effet "peint à main" sur la surface brûlée.
    const nbZones = Math.max(3, Math.floor(largeur / 60));
    for (let i = 0; i < nbZones; i++) {
        const t = (i + 0.5) / nbZones;
        const xZ = xG + t * largeur + (Math.random() - 0.5) * 8;
        const wZ = largeur / nbZones * (0.6 + Math.random() * 0.4);
        const variation = Math.random() < 0.5 ? palette.pierreClaire : palette.pierreSombre;
        const alphaZ = 0.18 + Math.random() * 0.10;
        g.fillStyle(variation, alphaZ);
        g.fillRect(xZ - wZ / 2, yT + 2, wZ, hauteur - 3);
    }

    // (3) Top highlight — poussière de cendre déposée sur la pierre (plus clair)
    g.fillStyle(palette.plateformeContour, 0.85);
    g.fillRect(xG, yT, largeur, 1);
    g.fillStyle(palette.pierreClaire, 0.45);
    g.fillRect(xG, yT + 1, largeur, 1);

    // (4) Bordure érodée — encoches subtiles, identique aux Ruines mais sur
    //     pierre brûlée donc plus rares (la pierre est friable)
    g.fillStyle(palette.pierreSombre, 0.7);
    const nbEncoches = Math.max(2, Math.floor(largeur / 45));
    for (let i = 0; i < nbEncoches; i++) {
        if (Math.random() < 0.35) {
            const xE = xG + ((i + 0.5) / nbEncoches) * largeur;
            g.fillRect(xE - 2, yT - 1, 4, 2);
        }
    }

    // (5) FISSURES ROUGEOYANTES — la signature interactive du biome.
    //     ADD orange pour qu'elles luisent comme si la chaleur n'avait pas
    //     quitté la pierre. Sur un graphics séparé pour le blend mode.
    if (!estSol) {
        const fissures = scene.add.graphics();
        fissures.setDepth(DEPTH.PLATEFORMES + 1);
        fissures.setBlendMode(Phaser.BlendModes.ADD);
        const nbFissures = Math.max(1, Math.floor(largeur / 70));
        const couleurBraise = palette.racine; // signature halls = racine slot
        for (let i = 0; i < nbFissures; i++) {
            const xF = xG + ((i + 0.5) / nbFissures) * largeur + (Math.random() - 0.5) * 6;
            const yF1 = yT + 3 + Math.random() * (hauteur - 6) * 0.3;
            const yF2 = yF1 + (hauteur - 6) * (0.3 + Math.random() * 0.3);
            // Halo flou (luminosité diffuse)
            fissures.lineStyle(3, couleurBraise, 0.18);
            fissures.beginPath();
            fissures.moveTo(xF, yF1);
            fissures.lineTo(xF + (Math.random() - 0.5) * 3, yF2);
            fissures.strokePath();
            // Cœur rouge-orange net
            fissures.lineStyle(1, couleurBraise, 0.75);
            fissures.beginPath();
            fissures.moveTo(xF, yF1);
            fissures.lineTo(xF + (Math.random() - 0.5) * 3, yF2);
            fissures.strokePath();
        }
        // Respiration très lente (la chaleur palpite)
        scene.tweens.add({
            targets: fissures,
            alpha: { from: 0.65, to: 1.0 },
            duration: 2400 + Math.random() * 1600,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
    }

    // (6) Dépôts de SUIE au sommet — 4-6 petits tas noirs irréguliers
    //     (remplace les touffes de mousse des Ruines basses). Densité plus faible
    //     pour laisser respirer la pierre brûlée.
    const nbSuie = Math.max(2, Math.floor(largeur / 32));
    for (let i = 0; i < nbSuie; i++) {
        if (Math.random() < 0.55) {
            const xS = xG + 3 + (i / nbSuie) * (largeur - 6) + (Math.random() - 0.5) * 6;
            const wS = 3 + Math.random() * 5;
            const hS = 1 + Math.random() * 1.5;
            g.fillStyle(palette.mousse, 0.7); // mousse slot = suie en halls_cendres
            g.fillEllipse(xS, yT - hS * 0.3, wS, hS);
            // Petit grain plus sombre par-dessus
            if (Math.random() < 0.5) {
                g.fillStyle(0x000000, 0.4);
                g.fillCircle(xS + (Math.random() - 0.5) * 2, yT - 1, 0.8);
            }
        }
    }

    // (7) Coins fondus aux deux extrémités — dépôts cuivre terni qui évoquent
    //     du métal coulé refroidi sur la pierre (remplace les touffes de mousse
    //     grasses des Ruines basses).
    g.fillStyle(palette.accent, 0.55); // accent = cuivre terni
    g.fillEllipse(xG + 5, yT + 1, 12, 3.5);
    g.fillEllipse(xG + largeur - 5, yT + 1, 12, 3.5);
    g.fillStyle(0x000000, 0.4);
    g.fillCircle(xG + 4, yT + 2, 1.5);
    g.fillCircle(xG + largeur - 4, yT + 2, 1.5);

    // (8) BRAISE ACTIVE / FOYER ÉTEINT — équivalent de la fleur des Ruines,
    //     mais bi-ton selon ratioBraiseActive (gradient narratif étage 3 → 4).
    if (Math.random() < 0.35) {
        const xB = xG + 10 + Math.random() * (largeur - 20);
        const active = Math.random() < ratioBraiseActive;
        if (active) {
            // Foyer encore vif — point orange ADD pulsant
            const braise = scene.add.graphics();
            braise.setDepth(DEPTH.PLATEFORMES + 1);
            braise.setBlendMode(Phaser.BlendModes.ADD);
            braise.fillStyle(palette.racine, 0.55);
            braise.fillCircle(xB, yT - 2, 5);
            braise.fillStyle(0xffd060, 0.85);
            braise.fillCircle(xB, yT - 2, 2);
            scene.tweens.add({
                targets: braise,
                alpha: { from: 0.55, to: 1.0 },
                duration: 700 + Math.random() * 500,
                ease: 'Sine.InOut',
                yoyo: true,
                repeat: -1
            });
        } else {
            // Foyer éteint — cuivre terni mat (pas d'ADD), trahit qu'il a brûlé
            g.fillStyle(palette.accent, 0.75);
            g.fillCircle(xB, yT - 2, 2.5);
            g.fillStyle(0x000000, 0.5);
            g.fillCircle(xB, yT - 2, 1.2);
        }
    }

    // (9) Braise luminescente — équivalent de la mousse luminescente des Ruines
    //     mais en ADD orange chaud. Sur les plateformes "vives" uniquement
    //     (utilise ratioBraiseActive pour gardar le narratif feu qui s'éteint).
    if (Math.random() < ratioBraiseActive) {
        const luminescence = scene.add.graphics();
        luminescence.setDepth(DEPTH.PLATEFORMES + 1);
        luminescence.setBlendMode(Phaser.BlendModes.ADD);
        const nbLum = 1 + (Math.random() < 0.5 ? 1 : 0);
        for (let i = 0; i < nbLum; i++) {
            const xL = xG + 12 + Math.random() * Math.max(8, largeur - 24);
            luminescence.fillStyle(palette.racine, 0.32);
            luminescence.fillEllipse(xL, yT + 1, 16, 5);
            luminescence.fillStyle(0xffb060, 0.50);
            luminescence.fillEllipse(xL, yT + 1, 7, 2.5);
        }
        scene.tweens.add({
            targets: luminescence,
            alpha: { from: 0.50, to: 1.0 },
            duration: 1400 + Math.random() * 1200,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
    }
}
