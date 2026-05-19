// CoeurReflux — composeur parallax spécifique au biome (étages 9-10, dernier).
//
// Direction artistique : "Chambre du Cœur" — on est PASSÉ À TRAVERS une des
// déchirures du Voile (7-8) et on est entré dans la Tour. INTÉRIEUR clos.
// Climax visuel du jeu — l'origine du Reflux, le terminus.
//
// Doctrine 5'.24.5 (post-tests) :
//   - Pas de cadre vignette (ni voûte, ni pilastres, ni plinthe — retirés en
//     5'.24.3).
//   - Pas de cœur central pulsant (retiré en 5'.24.4 — un disque rouge isolé
//     ne lisait pas bien).
//   - Mur maçonné ANCRÉ À LA SALLE (5'.24.5) — pas de parallax, le mur fait
//     pile la dimension de la salle. Il ne suit pas la vue, il EST la pièce.
//   - Arêtes de Reflux infiltrées dans les briques, MIX CRAMOISI + MAGENTA
//     pour créer du contraste chromatique (le magenta rappelle les
//     déchirures du Voile : le Reflux qui s'échappait là est devenu la sève
//     qui infiltre la pierre ici).
//   - 4 GROUPES désynchronisés (delays + durées différentes) → vagues de
//     luminosité qui se propagent (pas un pouls global synchrone trop régulier).
//
// Le rouge/Reflux est porté par :
//   - les éléments physiques (sol décoré, plateformes, ennemis)
//   - les arêtes infiltrées du mur (cramoisi + magenta, désynchronisées)

import { DEPTH } from '../PainterlyRenderer.js';

// ============================================================
// MUR MAÇONNÉ + ARÊTES DE REFLUX (ancré à la salle)
// ============================================================

function poserMurMaconne(scene, dims, rng) {
    const objets = [];
    const g = scene.add.graphics();

    // === Le mur fait pile la dimension de la salle (pas de parallax) ===
    const xGaucheMur = 0;
    const yHautMur = 0;
    const largeurMur = dims.largeur;
    const hauteurMur = dims.hauteur;

    // Couleurs maçonnerie — pierre ardoise plus claire qu'en 5'.24.4 pour
    // donner plus de lumière au fond (lisibilité du joueur en silhouette).
    const couleurBlocClair  = 0x35324a;   // pierre ardoise claire (vs 0x252330)
    const couleurBlocSombre = 0x15142a;   // pierre ardoise sombre (vs 0x121120)
    const couleurJoint      = 0x4a4860;   // joint éclairé

    // === Grille calculée par taille-cible ===
    const tailleCibleX = 70;
    const tailleCibleY = 35;
    const nbCols  = Math.max(8, Math.round(largeurMur / tailleCibleX));
    const nbRangs = Math.max(6, Math.round(hauteurMur / tailleCibleY));
    const pasX = largeurMur / nbCols;
    const pasY = hauteurMur / nbRangs;

    // Liste des blocs posés — pour tirer les arêtes Reflux ensuite
    const blocs = [];

    for (let r = 0; r < nbRangs; r++) {
        // Quinconce vrai : rangs impairs décalés de pasX/2
        const decalageRang = (r % 2) * (pasX / 2);
        for (let c = -1; c < nbCols + 1; c++) {
            const xGauche = xGaucheMur + decalageRang + c * pasX
                          + (rng() - 0.5) * pasX * 0.08;
            const yTop = yHautMur + r * pasY + (rng() - 0.5) * pasY * 0.10;
            const w = pasX * (0.92 + rng() * 0.18);
            const h = pasY * (0.88 + rng() * 0.20);
            // 50/50 clair/sombre (vs 40/60 en 5'.24.4) pour plus de lumière
            const claire = rng() < 0.50;
            const couleur = claire ? couleurBlocClair : couleurBlocSombre;
            const alpha = 0.30 + rng() * 0.20;        // 0.30-0.50 (vs 0.22-0.38)
            g.fillStyle(couleur, alpha);
            g.fillRect(xGauche, yTop, w, h);
            // Joint éclairé subtil sur 60 % des blocs clairs
            if (claire && rng() < 0.6) {
                g.fillStyle(couleurJoint, 0.22);
                g.fillRect(xGauche, yTop, w, 0.8);
            }
            blocs.push({ xGauche, yTop, w, h });
        }
    }

    // Mur ancré à la salle : scrollFactor (1, 1) = défaut, pas de parallax
    g.setDepth(DEPTH.SILHOUETTES - 6);
    objets.push(g);

    // ========================================================
    // ARÊTES DE REFLUX — 4 groupes ADD désynchronisés
    // ========================================================
    //
    // 18 % des arêtes (densité +50 % vs 5'.24.4) réparties en 4 groupes ADD
    // qui pulsent chacun avec un delay et une durée légèrement différents.
    // Chaque arête peut être cramoisi vif (rouge sang) ou magenta vif
    // (rose-violet) — mix 55/45 pour contraste chromatique.

    // Palettes des deux familles d'arêtes
    const palettes = [
        { halo: 0xff2030, coeur: 0xff6878 },   // cramoisi — rouge sang
        { halo: 0xff30c0, coeur: 0xff90e0 }    // magenta — rose-violet
    ];

    // 4 groupes ADD pour la désynchronisation
    const nbGroupes = 4;
    const groupes = [];
    for (let i = 0; i < nbGroupes; i++) {
        const ga = scene.add.graphics();
        ga.setBlendMode(Phaser.BlendModes.ADD);
        ga.setDepth(DEPTH.SILHOUETTES - 5);
        groupes.push(ga);
    }

    const epaisseur = 2;
    const nbAretes = Math.floor(blocs.length * 0.18);

    for (let i = 0; i < nbAretes; i++) {
        const bloc = blocs[Math.floor(rng() * blocs.length)];
        const cote = Math.floor(rng() * 4);            // 0=haut, 1=bas, 2=gauche, 3=droite
        const groupe = groupes[Math.floor(rng() * nbGroupes)];
        const palette = palettes[rng() < 0.55 ? 0 : 1]; // 55 % cramoisi, 45 % magenta

        const alphaHalo = 0.70 + rng() * 0.25;
        const alphaCoeur = 0.90 + rng() * 0.10;

        // Halo épais 2 px
        groupe.fillStyle(palette.halo, alphaHalo);
        if (cote === 0) {
            groupe.fillRect(bloc.xGauche, bloc.yTop, bloc.w, epaisseur);
        } else if (cote === 1) {
            groupe.fillRect(bloc.xGauche, bloc.yTop + bloc.h - epaisseur, bloc.w, epaisseur);
        } else if (cote === 2) {
            groupe.fillRect(bloc.xGauche, bloc.yTop, epaisseur, bloc.h);
        } else {
            groupe.fillRect(bloc.xGauche + bloc.w - epaisseur, bloc.yTop, epaisseur, bloc.h);
        }
        // Cœur lumineux 1 px (plus saturé, lit net)
        groupe.fillStyle(palette.coeur, alphaCoeur);
        if (cote === 0) {
            groupe.fillRect(bloc.xGauche, bloc.yTop + 0.5, bloc.w, 1);
        } else if (cote === 1) {
            groupe.fillRect(bloc.xGauche, bloc.yTop + bloc.h - 1.5, bloc.w, 1);
        } else if (cote === 2) {
            groupe.fillRect(bloc.xGauche + 0.5, bloc.yTop, 1, bloc.h);
        } else {
            groupe.fillRect(bloc.xGauche + bloc.w - 1.5, bloc.yTop, 1, bloc.h);
        }
    }

    // === Tweens désynchronisés par groupe — vagues de luminosité ===
    // Delays et durées légèrement différents pour qu'aucun groupe ne soit
    // jamais en phase avec un autre — effet organique "diminue/augmente"
    // sans rythme métronomique.
    const phases = [
        { duration: 1300, delay: 0 },
        { duration: 1600, delay: 380 },
        { duration: 1450, delay: 750 },
        { duration: 1750, delay: 220 }
    ];
    for (let i = 0; i < nbGroupes; i++) {
        const ga = groupes[i];
        const phase = phases[i];
        scene.tweens.add({
            targets: ga,
            alpha: { from: 0.40, to: 1.0 },
            duration: phase.duration,
            delay: phase.delay,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });
        objets.push(ga);
    }

    return objets;
}

// ============================================================
// COMPOSER PUBLIC
// ============================================================

export function composerParallaxCoeurReflux(scene, dims, monde, rng) {
    const objets = [];

    // Mur maçonné ancré à la salle + arêtes Reflux désynchronisées
    objets.push(...poserMurMaconne(scene, dims, rng));

    return objets;
}
