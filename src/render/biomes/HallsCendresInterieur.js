// HallsCendresInterieur — cathédrale funéraire gothique en flammes, posée en
// coordonnées monde aux dimensions exactes de la salle BOSS étage 4.
//
// Phase 5'.7 — refonte finale après deux itérations :
//   5'.5 : parallax > 1 → drift caméra, colonnes au mauvais endroit
//   5'.6 : scrollFactor 0 (ancré écran) → effet "UI", pas un lieu, masquait portes
//   5'.7 : scrollFactor 1 (monde) → vrai bâtiment, on traverse la nef
//
// L'architecture EST la salle. Tout est dimensionné sur dims.largeur × dims.hauteur.
// Marge basse de MARGE_PORTES px réservée aux portes E (entrée/sortie) qui
// restent dégagées au sol des plateformes.
//
// Composition — cathédrale en agonie :
//   - Plafond voûté avec croisées d'ogives + 2-3 grandes brèches dentelées
//     d'où s'échappent des flammes ADD pulsantes, par où entrent ciel + rayons
//     dorés obliques + cendre tombante (gérée par le composer principal)
//   - Poutres effondrées en diagonale traversant les brèches (le toit s'écroule)
//   - Chaînes ADD pendantes aux clés de voûte
//   - Murs latéraux épais avec piliers gothiques régulièrement espacés,
//     vitraux ogive multiples, niches à statues, bandeau décoratif horizontal,
//     bord supérieur cassé qui s'intègre au plafond
//   - Bannières carbonisées en lambeaux pendantes
//   - Foyers actifs vifs au pied des piliers + escarbilles ascendantes locales
//   - Tas de gravats au pied des murs
//
// Activé UNIQUEMENT en salle BOSS étage 4. Hors contexte, renvoie [].

// Couleur cohérente palette plateformes du biome (rappel) :
//   plateforme:        0x2e2620   (base)
//   plateformeContour: 0x5a4030   (haut clair, poussière de cendre)
//   pierreClaire:      0x6e5440   (highlight painterly)
//   pierreSombre:      0x1a1208   (ombre profonde)
//   mousse (=suie):    0x18120e   (dépôts noirs)
//   racine (=braise):  0xff6020   (signature bi-ton, vif)
//   accent (cuivre terni): 0xa86838 (foyer mourant)

// Dimensions architecturales — calculées en coordonnées monde
const HAUTEUR_PLAFOND   = 150;   // px depuis y=0 (haut de la salle)
const EPAISSEUR_MUR     = 110;   // épaisseur de chaque mur latéral
const MARGE_PORTES      = 180;   // hauteur réservée en bas pour les portes E

// Depth : entre plateformes (0) et entités (20) — joueur passe devant
const DEPTH_INTERIEUR        = 11;
const DEPTH_INTERIEUR_DETAIL = 12;
const DEPTH_INTERIEUR_ADD    = 13;  // flammes/lueurs/escarbilles devant les détails

// ============================================================
// PLAFOND VOÛTÉ AVEC BRÈCHES
// ============================================================

/**
 * Tire 2 ou 3 brèches dentelées dans le plafond, positions et tailles variées.
 * Les brèches sont des trous qui laissent passer ciel + cendre + rayons dorés.
 */
function genererBreches(dims, rng) {
    const largeur = dims.largeur;
    const breches = [];

    // Brèche 1 — grande (largeur 22-32 % de la salle)
    const cote1 = rng() < 0.5 ? 'gauche' : 'droite';
    const w1 = largeur * (0.22 + rng() * 0.10);
    const x1 = cote1 === 'gauche'
        ? largeur * (0.12 + rng() * 0.10)
        : largeur * (1 - 0.12 - rng() * 0.10) - w1;
    breches.push({ x: x1, largeur: w1 });

    // Brèche 2 — moyenne (12-18 %), de l'autre côté
    const w2 = largeur * (0.12 + rng() * 0.06);
    const x2 = cote1 === 'gauche'
        ? largeur * (1 - 0.14 - rng() * 0.10) - w2
        : largeur * (0.14 + rng() * 0.10);
    breches.push({ x: x2, largeur: w2 });

    // Brèche 3 — petite optionnelle (6-9 %), placée centrale
    if (rng() < 0.6) {
        const w3 = largeur * (0.06 + rng() * 0.03);
        const x3 = largeur * (0.42 + rng() * 0.16) - w3 / 2;
        breches.push({ x: x3, largeur: w3 });
    }

    breches.sort((a, b) => a.x - b.x);

    // Anti-chevauchement
    for (let i = 1; i < breches.length; i++) {
        if (breches[i].x < breches[i - 1].x + breches[i - 1].largeur + 80) {
            breches[i].x = breches[i - 1].x + breches[i - 1].largeur + 80;
        }
    }

    return breches.filter(b => b.x + b.largeur < largeur - 60);
}

/**
 * Profil dentelé pour le bord inférieur d'un panneau de plafond entre deux
 * brèches. Renvoie un tableau de points.
 */
function profilDenteleInferieur(xDebut, xFin, yBase, rng) {
    const largeur = xFin - xDebut;
    const nbPoints = Math.max(5, Math.floor(largeur / 24));
    const points = [];
    points.push({ x: xDebut, y: yBase - 4 - rng() * 6 });
    for (let i = 1; i < nbPoints; i++) {
        const t = i / nbPoints;
        const x = xDebut + largeur * t;
        const dy = -rng() * 14;
        const pic = rng() < 0.18 ? 4 + rng() * 5 : 0;
        points.push({ x, y: yBase - 4 + dy + pic });
    }
    points.push({ x: xFin, y: yBase - 4 - rng() * 6 });
    return points;
}

/**
 * Peint un panneau de plafond entre xDebut et xFin avec modelé painterly.
 */
function peindrePanneauPlafond(g, palette, xDebut, xFin, rng) {
    const profil = profilDenteleInferieur(xDebut, xFin, HAUTEUR_PLAFOND, rng);

    // Corps : polygone bord supérieur droit + bord inférieur dentelé
    g.fillStyle(palette.plateforme ?? 0x2e2620, 1);
    g.beginPath();
    g.moveTo(xDebut, -4);
    g.lineTo(xFin, -4);
    for (let i = profil.length - 1; i >= 0; i--) g.lineTo(profil[i].x, profil[i].y);
    g.closePath();
    g.fillPath();

    // Ombre en bas (intérieur du plafond — la lumière vient du dessus)
    g.fillStyle(palette.pierreSombre ?? 0x1a1208, 0.55);
    g.beginPath();
    g.moveTo(xDebut, HAUTEUR_PLAFOND - 44);
    g.lineTo(xFin, HAUTEUR_PLAFOND - 44);
    for (let i = profil.length - 1; i >= 0; i--) g.lineTo(profil[i].x, profil[i].y);
    g.closePath();
    g.fillPath();

    // Highlight en haut (lumière qui filtre du ciel par les brèches)
    g.fillStyle(palette.pierreClaire ?? 0x6e5440, 0.35);
    g.fillRect(xDebut, -4, xFin - xDebut, 8);

    // Micro-variations de teinte (peint à main)
    const nbZones = Math.max(2, Math.floor((xFin - xDebut) / 90));
    for (let i = 0; i < nbZones; i++) {
        const t = (i + 0.5) / nbZones;
        const xZ = xDebut + t * (xFin - xDebut) + (rng() - 0.5) * 18;
        const wZ = (xFin - xDebut) / nbZones * (0.5 + rng() * 0.4);
        const variation = rng() < 0.5 ? (palette.pierreClaire ?? 0x6e5440) : (palette.pierreSombre ?? 0x1a1208);
        g.fillStyle(variation, 0.15 + rng() * 0.10);
        g.fillRect(xZ - wZ / 2, 10 + rng() * 20, wZ, 50 + rng() * 60);
    }

    // Fissures verticales internes
    g.lineStyle(1, palette.pierreSombre ?? 0x1a1208, 0.55);
    const nbFissuresInternes = 2 + Math.floor(rng() * 3);
    for (let f = 0; f < nbFissuresInternes; f++) {
        const xF = xDebut + 10 + rng() * ((xFin - xDebut) - 20);
        const yF1 = 10 + rng() * 20;
        const yF2 = yF1 + 50 + rng() * 60;
        g.beginPath();
        g.moveTo(xF, yF1);
        g.lineTo(xF + (rng() - 0.5) * 4, yF2);
        g.strokePath();
    }

    // Dépôts de suie sous le bord cassé (noirci par le passage des flammes)
    g.fillStyle(palette.mousse ?? 0x18120e, 0.7);
    for (let i = 0; i < profil.length - 1; i += 2) {
        if (rng() < 0.55) {
            g.fillEllipse(profil[i].x, profil[i].y - 2, 9 + rng() * 7, 3);
        }
    }

    return profil;
}

/**
 * Peint les nervures croisées d'ogives (motif gothique caractéristique) dans
 * un panneau de plafond : diagonales depuis les coins qui se rejoignent au
 * centre = clé de voûte décorée.
 */
function peindreNervuresCroisees(g, palette, xDebut, xFin, ySommet, rng) {
    const xCentre = (xDebut + xFin) / 2;
    const yCentre = ySommet + 40;
    const couleurNervure = palette.pierreSombre ?? 0x1a1208;

    // 4 nervures diagonales depuis les coins vers la clé
    g.lineStyle(2.5, couleurNervure, 0.78);
    g.beginPath();
    g.moveTo(xDebut, ySommet);     g.lineTo(xCentre, yCentre);
    g.moveTo(xFin,   ySommet);     g.lineTo(xCentre, yCentre);
    g.moveTo(xDebut, ySommet + 20); g.lineTo(xCentre, yCentre + 24);
    g.moveTo(xFin,   ySommet + 20); g.lineTo(xCentre, yCentre + 24);
    g.strokePath();

    // Highlight sur les nervures (1 px clair côté lumière)
    g.lineStyle(1, palette.pierreClaire ?? 0x6e5440, 0.55);
    g.beginPath();
    g.moveTo(xDebut + 1, ySommet); g.lineTo(xCentre + 1, yCentre);
    g.moveTo(xFin   - 1, ySommet); g.lineTo(xCentre - 1, yCentre);
    g.strokePath();

    // Clé de voûte décorée — médaillon central
    g.fillStyle(palette.plateformeContour ?? 0x5a4030, 0.95);
    g.fillCircle(xCentre, yCentre + 6, 9);
    g.fillStyle(couleurNervure, 0.9);
    g.fillCircle(xCentre, yCentre + 6, 6);
    g.fillStyle(palette.accent ?? 0xa86838, 0.85);
    g.fillCircle(xCentre, yCentre + 6, 2.5);
}

/**
 * Peint une poutre effondrée en diagonale qui traverse une brèche.
 */
function peindrePoutreEffondree(g, palette, breche, rng) {
    // Origine : un bord de la brèche en haut. Destination : plus bas dans la salle.
    const xOrigine = breche.x + rng() * breche.largeur;
    const yOrigine = HAUTEUR_PLAFOND - 8;
    const longueur = 90 + rng() * 80;
    const angle = (rng() < 0.5 ? -1 : 1) * (Math.PI * 0.25 + rng() * Math.PI * 0.15);
    const xFin = xOrigine + Math.sin(angle) * longueur;
    const yFin = yOrigine + Math.cos(angle) * longueur;

    const couleurBois = 0x2a1408;     // bois carbonisé presque noir
    const couleurCharbon = 0x4a2618;
    const epaisseur = 7 + rng() * 4;

    // Polygone allongé (quadrilatère épais)
    const dx = xFin - xOrigine, dy = yFin - yOrigine;
    const norm = Math.hypot(dx, dy);
    const px = -dy / norm * epaisseur / 2;
    const py = dx / norm * epaisseur / 2;

    g.fillStyle(couleurBois, 0.95);
    g.beginPath();
    g.moveTo(xOrigine + px, yOrigine + py);
    g.lineTo(xOrigine - px, yOrigine - py);
    g.lineTo(xFin - px, yFin - py);
    g.lineTo(xFin + px, yFin + py);
    g.closePath();
    g.fillPath();

    // Strie de charbon (côté éclairé)
    g.lineStyle(1.5, couleurCharbon, 0.7);
    g.beginPath();
    g.moveTo(xOrigine + px * 0.6, yOrigine + py * 0.6);
    g.lineTo(xFin + px * 0.6, yFin + py * 0.6);
    g.strokePath();

    // Bout cassé fendu
    g.fillStyle(couleurBois, 0.95);
    g.fillCircle(xFin, yFin, epaisseur * 0.55);
    g.fillStyle(couleurCharbon, 0.85);
    g.fillCircle(xFin, yFin, epaisseur * 0.3);
}

/**
 * Flammes ADD pulsantes qui lèchent le bord d'une brèche.
 */
function peindreFlammesBreche(scene, palette, breche, rng) {
    const objets = [];

    // 4-6 flammes le long du bord inférieur de la brèche, chacune pulse à son rythme
    const nbFlammes = 4 + Math.floor(rng() * 3);
    for (let f = 0; f < nbFlammes; f++) {
        const flamme = scene.add.graphics();
        flamme.setBlendMode(Phaser.BlendModes.ADD);

        const t = (f + 0.2 + rng() * 0.6) / nbFlammes;
        const x = breche.x + breche.largeur * t;
        const y = HAUTEUR_PLAFOND - 8 - rng() * 6;
        const tailleBase = 18 + rng() * 14;

        // Halo extérieur orange
        flamme.fillStyle(palette.racine ?? 0xff6020, 0.40);
        flamme.fillEllipse(x, y, tailleBase * 1.4, tailleBase * 0.9);
        // Cœur jaune-orange
        flamme.fillStyle(0xff8030, 0.70);
        flamme.fillEllipse(x, y - 4, tailleBase * 0.9, tailleBase * 0.7);
        // Languette qui monte (vers le ciel par la brèche)
        flamme.fillStyle(0xffa040, 0.55);
        flamme.fillEllipse(x, y - tailleBase * 0.5, tailleBase * 0.5, tailleBase * 0.8);
        // Cœur vif
        flamme.fillStyle(0xffd060, 0.85);
        flamme.fillCircle(x, y - 2, tailleBase * 0.25);

        flamme.setDepth(DEPTH_INTERIEUR_ADD);

        // Pulse rapide (le feu vit)
        scene.tweens.add({
            targets: flamme,
            alpha: { from: 0.55, to: 1.0 },
            scaleY: { from: 0.85, to: 1.15 },
            duration: 380 + rng() * 320,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });

        objets.push(flamme);
    }

    // Halo orange étendu autour de la brèche (sentiment "la lumière du feu remonte")
    const halo = scene.add.graphics();
    halo.setBlendMode(Phaser.BlendModes.ADD);
    halo.fillStyle(0xff7028, 0.18);
    halo.fillEllipse(breche.x + breche.largeur / 2, HAUTEUR_PLAFOND - 14, breche.largeur * 1.6, 80);
    halo.fillStyle(0xff7028, 0.10);
    halo.fillEllipse(breche.x + breche.largeur / 2, HAUTEUR_PLAFOND - 14, breche.largeur * 2.2, 140);
    halo.setDepth(DEPTH_INTERIEUR_DETAIL);
    scene.tweens.add({
        targets: halo,
        alpha: { from: 0.65, to: 1.05 },
        duration: 2200 + rng() * 1400,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });
    objets.push(halo);

    return objets;
}

/**
 * Rayon doré oblique qui rentre dans la salle par une brèche.
 */
function peindreRayonDore(scene, breche, dims, rng) {
    const objets = [];
    const nbRayons = 1 + Math.floor(rng() * 2);

    for (let r = 0; r < nbRayons; r++) {
        const xDepart = breche.x + breche.largeur * (0.3 + rng() * 0.4);
        const largeurRayon = 40 + rng() * 30;
        const decalageDiag = 200 + rng() * 200;
        const couleur = 0xffd080;

        const g = scene.add.graphics();
        g.setBlendMode(Phaser.BlendModes.ADD);
        g.fillStyle(couleur, 0.14 + rng() * 0.06);
        g.beginPath();
        g.moveTo(xDepart, HAUTEUR_PLAFOND - 6);
        g.lineTo(xDepart + largeurRayon, HAUTEUR_PLAFOND - 6);
        g.lineTo(xDepart + largeurRayon + decalageDiag, dims.hauteur - 60);
        g.lineTo(xDepart + decalageDiag, dims.hauteur - 60);
        g.closePath();
        g.fillPath();

        g.setDepth(DEPTH_INTERIEUR);

        scene.tweens.add({
            targets: g,
            alpha: { from: 0.7, to: 1.2 },
            duration: 4500 + rng() * 3000,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1
        });

        objets.push(g);
    }

    return objets;
}

/**
 * Chaîne ADD pendante depuis une clé de voûte, sway lent.
 */
function peindreChainePendante(scene, palette, x, rng) {
    const g = scene.add.graphics();
    const longueur = 50 + rng() * 60;
    const yDepart = 60;
    const couleurChaine = 0x1a1208;
    const couleurReflet = 0x4a3a28;

    const nbMaillons = Math.floor(longueur / 8);
    for (let m = 0; m < nbMaillons; m++) {
        const y = yDepart + m * 8;
        const orient = m % 2 === 0;
        const w = orient ? 6 : 3;
        const h = orient ? 4 : 8;
        g.lineStyle(1.4, couleurChaine, 0.85);
        g.strokeEllipse(0, y, w, h);
        g.lineStyle(0.6, couleurReflet, 0.55);
        g.strokeEllipse(-0.4, y - 0.4, w * 0.7, h * 0.6);
    }
    // Petit poids (encensoir) en bout
    g.fillStyle(couleurChaine, 0.9);
    g.fillCircle(0, yDepart + nbMaillons * 8 + 3, 3.5);
    g.fillStyle(palette.accent ?? 0xa86838, 0.7);
    g.fillCircle(0, yDepart + nbMaillons * 8 + 3, 1.8);

    g.x = x;
    g.y = 0;
    g.setDepth(DEPTH_INTERIEUR_DETAIL);

    scene.tweens.add({
        targets: g,
        rotation: { from: -0.06, to: 0.06 },
        duration: 5000 + rng() * 2400,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });

    return [g];
}

function poserPlafondVoute(scene, dims, palette, rng) {
    const objets = [];
    const breches = genererBreches(dims, rng);

    // Construire les panneaux de plafond entre les brèches
    const panneaux = [];
    let lastX = -10;
    for (const b of breches) {
        if (b.x > lastX) panneaux.push({ xDebut: lastX, xFin: b.x });
        lastX = b.x + b.largeur;
    }
    if (lastX < dims.largeur + 10) {
        panneaux.push({ xDebut: lastX, xFin: dims.largeur + 10 });
    }

    // Graphics unique pour tout le plafond (économie de draw calls)
    const g = scene.add.graphics();
    g.setDepth(DEPTH_INTERIEUR);

    for (const p of panneaux) {
        peindrePanneauPlafond(g, palette, p.xDebut, p.xFin, rng);
        // Nervures croisées d'ogives — seulement sur panneaux assez larges
        if (p.xFin - p.xDebut > 200) {
            peindreNervuresCroisees(g, palette, p.xDebut, p.xFin, 8, rng);
        }
    }

    // Poutres effondrées : 1-2, traversant des brèches au hasard
    const nbPoutres = breches.length >= 2 ? 1 + (rng() < 0.5 ? 1 : 0) : 1;
    for (let i = 0; i < nbPoutres; i++) {
        const breche = breches[Math.floor(rng() * breches.length)];
        peindrePoutreEffondree(g, palette, breche, rng);
    }

    objets.push(g);

    // Flammes ADD aux bords de chaque brèche + halo orange étendu
    for (const breche of breches) {
        objets.push(...peindreFlammesBreche(scene, palette, breche, rng));
        // Rayons dorés obliques qui rentrent par la brèche
        objets.push(...peindreRayonDore(scene, breche, dims, rng));
    }

    // Chaînes pendantes — 1-3 réparties sur la largeur de la salle (vers les clés
    // de voûte des panneaux). Choisis sur les panneaux les plus larges.
    const panneauxLarges = panneaux.filter(p => p.xFin - p.xDebut > 200);
    const nbChaines = Math.min(3, panneauxLarges.length);
    for (let c = 0; c < nbChaines; c++) {
        const p = panneauxLarges[c];
        const xChaine = (p.xDebut + p.xFin) / 2;
        objets.push(...peindreChainePendante(scene, palette, xChaine, rng));
    }

    return objets;
}

// ============================================================
// MURS LATÉRAUX DÉTAILLÉS
// ============================================================

/**
 * Peint un pilier gothique intégré dans la face intérieure du mur. Base
 * trapézoïdale + fût + chapiteau orné. Foyer actif à son pied.
 */
function peindrePilierGothique(scene, palette, xPilier, yHautMur, yBasMur, rng) {
    const objets = [];
    const g = scene.add.graphics();
    g.setDepth(DEPTH_INTERIEUR_DETAIL);

    const largeurFut = 28;
    const yChapiteau = yHautMur + 50 + rng() * 20;
    const yBase = yBasMur - 12;

    // Base trapézoïdale (chapiteau renversé)
    g.fillStyle(palette.plateforme ?? 0x2e2620, 1);
    g.beginPath();
    g.moveTo(xPilier - largeurFut / 2 - 7, yBase + 14);
    g.lineTo(xPilier - largeurFut / 2 - 3, yBase + 6);
    g.lineTo(xPilier - largeurFut / 2, yBase);
    g.lineTo(xPilier + largeurFut / 2, yBase);
    g.lineTo(xPilier + largeurFut / 2 + 3, yBase + 6);
    g.lineTo(xPilier + largeurFut / 2 + 7, yBase + 14);
    g.closePath();
    g.fillPath();

    // Fût
    g.fillStyle(palette.plateforme ?? 0x2e2620, 1);
    g.fillRect(xPilier - largeurFut / 2, yChapiteau, largeurFut, yBase - yChapiteau);

    // Ombre côté intérieur (gameplay) — la lumière vient des fissures du plafond
    g.fillStyle(palette.pierreSombre ?? 0x1a1208, 0.4);
    g.fillRect(xPilier + largeurFut * 0.1, yChapiteau, largeurFut * 0.4, yBase - yChapiteau);

    // Rim light côté extérieur
    g.fillStyle(palette.pierreClaire ?? 0x6e5440, 0.55);
    g.fillRect(xPilier - largeurFut / 2, yChapiteau, 2, yBase - yChapiteau);

    // Fissures verticales sur le fût
    g.lineStyle(1, palette.pierreSombre ?? 0x1a1208, 0.55);
    for (let f = 0; f < 2; f++) {
        const xF = xPilier - largeurFut / 2 + 4 + rng() * (largeurFut - 8);
        const yF1 = yChapiteau + 20 + rng() * (yBase - yChapiteau - 60);
        const yF2 = yF1 + 30 + rng() * 50;
        g.beginPath();
        g.moveTo(xF, yF1);
        g.lineTo(xF + (rng() - 0.5) * 2, yF2);
        g.strokePath();
    }

    // Chapiteau orné (s'élargit vers le haut, avec moulures)
    g.fillStyle(palette.plateforme ?? 0x2e2620, 1);
    g.beginPath();
    g.moveTo(xPilier - largeurFut / 2, yChapiteau);
    g.lineTo(xPilier - largeurFut / 2 - 6, yChapiteau - 8);
    g.lineTo(xPilier - largeurFut / 2 - 12, yChapiteau - 18);
    g.lineTo(xPilier + largeurFut / 2 + 12, yChapiteau - 18);
    g.lineTo(xPilier + largeurFut / 2 + 6, yChapiteau - 8);
    g.lineTo(xPilier + largeurFut / 2, yChapiteau);
    g.closePath();
    g.fillPath();

    // Moulure horizontale (astragale) au pied du chapiteau
    g.lineStyle(1.5, palette.pierreSombre ?? 0x1a1208, 0.85);
    g.beginPath();
    g.moveTo(xPilier - largeurFut / 2 - 2, yChapiteau + 2);
    g.lineTo(xPilier + largeurFut / 2 + 2, yChapiteau + 2);
    g.strokePath();

    // Petit motif décoratif au centre du chapiteau (croix gothique)
    g.fillStyle(palette.pierreSombre ?? 0x1a1208, 0.85);
    g.fillRect(xPilier - 1, yChapiteau - 14, 2, 10);
    g.fillRect(xPilier - 3, yChapiteau - 10, 6, 2);

    // Touche d'accent doré au centre (vestige de luxe)
    g.fillStyle(palette.accent ?? 0xa86838, 0.75);
    g.fillCircle(xPilier, yChapiteau - 9, 1.6);

    // Dépôts de suie au pied
    g.fillStyle(palette.mousse ?? 0x18120e, 0.7);
    g.fillEllipse(xPilier, yBase + 16, 30, 5);

    objets.push(g);

    // Foyer actif vif au pied du pilier (signature bi-ton biome)
    const foyer = scene.add.graphics();
    foyer.setBlendMode(Phaser.BlendModes.ADD);
    foyer.fillStyle(palette.racine ?? 0xff6020, 0.50);
    foyer.fillCircle(xPilier, yBase + 16, 16);
    foyer.fillStyle(0xff8030, 0.65);
    foyer.fillCircle(xPilier, yBase + 16, 10);
    foyer.fillStyle(0xffd060, 0.85);
    foyer.fillCircle(xPilier, yBase + 14, 4);
    foyer.setDepth(DEPTH_INTERIEUR_ADD);
    scene.tweens.add({
        targets: foyer,
        alpha: { from: 0.6, to: 1.0 },
        scaleY: { from: 0.85, to: 1.15 },
        duration: 500 + rng() * 400,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });
    objets.push(foyer);

    // Escarbilles ascendantes localisées depuis le foyer (texture _particule
    // existe — créée par GameScene au démarrage). Émetteur léger.
    if (scene.textures.exists('_particule')) {
        const escarbilles = scene.add.particles(xPilier, yBase + 14, '_particule', {
            speedY: { min: -55, max: -25 },
            speedX: { min: -10, max: 10 },
            lifespan: 1800,
            scale: { start: 0.4, end: 0.05 },
            alpha: { start: 0.85, end: 0 },
            tint: [0xff8030, 0xffd060, 0xff6020],
            blendMode: Phaser.BlendModes.ADD,
            quantity: 1,
            frequency: 220
        });
        escarbilles.setDepth(DEPTH_INTERIEUR_ADD);
        objets.push(escarbilles);
    }

    return objets;
}

/**
 * Vitrail en ogive intégré dans le mur, avec lueur ADD rouge intérieure pulsante.
 */
function peindreVitrailOgive(scene, palette, xCentre, yHaut, largeur, hauteur, rng) {
    const objets = [];
    const g = scene.add.graphics();
    g.setDepth(DEPTH_INTERIEUR_DETAIL);

    // Cadre pierre (plus sombre, c'est creusé dans le mur)
    g.fillStyle(palette.pierreSombre ?? 0x1a1208, 0.95);
    g.beginPath();
    g.moveTo(xCentre - largeur / 2 - 3, yHaut + hauteur);
    g.lineTo(xCentre - largeur / 2 - 3, yHaut + largeur / 2);
    const segs = 10;
    for (let s = 0; s <= segs; s++) {
        const t = s / segs;
        const sx = xCentre - largeur / 2 - 3 + (largeur + 6) * t;
        const sy = yHaut + largeur / 2 - Math.sin(Math.PI * t) * (largeur / 2 + 5);
        g.lineTo(sx, sy);
    }
    g.lineTo(xCentre + largeur / 2 + 3, yHaut + hauteur);
    g.closePath();
    g.fillPath();

    // Vitrail intérieur très sombre rouge-noir
    const inset = 5;
    g.fillStyle(0x1a0808, 1);
    g.beginPath();
    g.moveTo(xCentre - largeur / 2 + inset, yHaut + hauteur - 3);
    g.lineTo(xCentre - largeur / 2 + inset, yHaut + largeur / 2);
    for (let s = 0; s <= segs; s++) {
        const t = s / segs;
        const sx = xCentre - largeur / 2 + inset + (largeur - inset * 2) * t;
        const sy = yHaut + largeur / 2 - Math.sin(Math.PI * t) * (largeur / 2 - inset);
        g.lineTo(sx, sy);
    }
    g.lineTo(xCentre + largeur / 2 - inset, yHaut + hauteur - 3);
    g.closePath();
    g.fillPath();

    // Meneau central vertical + traverse horizontale
    g.fillStyle(palette.pierreSombre ?? 0x1a1208, 0.95);
    g.fillRect(xCentre - 1.5, yHaut + inset + 2, 3, hauteur - inset - 5);
    g.fillRect(xCentre - largeur / 2 + inset + 1, yHaut + hauteur * 0.55, largeur - (inset + 1) * 2, 2);

    objets.push(g);

    // Lueur ADD intérieure
    const lueur = scene.add.graphics();
    lueur.setBlendMode(Phaser.BlendModes.ADD);
    lueur.fillStyle(0x802010, 0.45);
    lueur.fillEllipse(xCentre, yHaut + hauteur * 0.65, largeur * 0.7, hauteur * 0.55);
    lueur.fillStyle(palette.racine ?? 0xff6020, 0.30);
    lueur.fillEllipse(xCentre, yHaut + hauteur * 0.65, largeur * 0.4, hauteur * 0.28);
    lueur.setDepth(DEPTH_INTERIEUR_ADD);
    scene.tweens.add({
        targets: lueur,
        alpha: { from: 0.5, to: 1.0 },
        duration: 2800 + rng() * 1600,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });
    objets.push(lueur);

    return objets;
}

/**
 * Niche à statue creusée dans le mur, avec silhouette humanoïde agenouillée
 * et petit foyer ADD au-dessous (chandelle ou veilleuse).
 */
function peindreNicheStatue(scene, palette, xCentre, yHaut, cote, rng) {
    const objets = [];
    const g = scene.add.graphics();
    g.setDepth(DEPTH_INTERIEUR_DETAIL);

    const largeur = 40;
    const hauteur = 80;

    // Renfoncement de la niche (forme rectangulaire arrondie en haut, plus sombre)
    g.fillStyle(palette.pierreSombre ?? 0x1a1208, 0.95);
    g.beginPath();
    g.moveTo(xCentre - largeur / 2, yHaut + hauteur);
    g.lineTo(xCentre - largeur / 2, yHaut + largeur / 2);
    const segs = 8;
    for (let s = 0; s <= segs; s++) {
        const t = s / segs;
        const sx = xCentre - largeur / 2 + largeur * t;
        const sy = yHaut + largeur / 2 - Math.sin(Math.PI * t) * (largeur / 2);
        g.lineTo(sx, sy);
    }
    g.lineTo(xCentre + largeur / 2, yHaut + hauteur);
    g.closePath();
    g.fillPath();

    // Silhouette agenouillée (figure penchée en prière)
    const couleurStatue = 0x3a2a20;
    g.fillStyle(couleurStatue, 0.85);
    // Corps incliné
    g.fillEllipse(xCentre, yHaut + hauteur * 0.55, 12, 22);
    // Tête baissée
    g.fillCircle(xCentre + 2, yHaut + hauteur * 0.4, 5);
    // Capuchon
    g.fillStyle(couleurStatue, 0.7);
    g.fillEllipse(xCentre + 1, yHaut + hauteur * 0.43, 12, 9);
    // Cuisses agenouillées
    g.fillStyle(couleurStatue, 0.85);
    g.fillEllipse(xCentre, yHaut + hauteur * 0.78, 16, 8);

    objets.push(g);

    // Petit foyer ADD au pied de la statue (chandelle)
    const chandelle = scene.add.graphics();
    chandelle.setBlendMode(Phaser.BlendModes.ADD);
    chandelle.fillStyle(palette.racine ?? 0xff6020, 0.45);
    chandelle.fillCircle(xCentre, yHaut + hauteur * 0.92, 6);
    chandelle.fillStyle(0xffd060, 0.85);
    chandelle.fillCircle(xCentre, yHaut + hauteur * 0.92, 2);
    chandelle.setDepth(DEPTH_INTERIEUR_ADD);
    scene.tweens.add({
        targets: chandelle,
        alpha: { from: 0.65, to: 1.0 },
        duration: 700 + rng() * 400,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });
    objets.push(chandelle);

    return objets;
}

/**
 * Bannière carbonisée en lambeaux, pend depuis le bandeau décoratif horizontal.
 */
function peindreBanniereCarbonisee(scene, palette, x, yDepart, rng) {
    const g = scene.add.graphics();
    g.setDepth(DEPTH_INTERIEUR_DETAIL);

    const longueur = 70 + rng() * 50;
    const largeur = 24;
    const couleur = 0x2a1410;          // tissu brûlé sombre
    const couleurAccent = 0x6a2818;    // bordure encore visible

    // Forme : trapèze inversé (s'élargit légèrement vers le bas), avec lambeaux
    g.fillStyle(couleur, 0.9);
    g.beginPath();
    g.moveTo(x - largeur / 2 + 2, yDepart);
    g.lineTo(x + largeur / 2 - 2, yDepart);
    g.lineTo(x + largeur / 2 + 2, yDepart + longueur * 0.7);
    // Bord inférieur déchiré (3-4 dents irrégulières)
    const nbDents = 4;
    for (let d = 0; d < nbDents; d++) {
        const t = d / (nbDents - 1);
        const dx = x + largeur / 2 - largeur * t;
        const dy = yDepart + longueur * (0.7 + rng() * 0.3);
        g.lineTo(dx, dy);
        if (d < nbDents - 1) {
            g.lineTo(dx - largeur / (nbDents - 1) / 2, yDepart + longueur * (0.55 + rng() * 0.15));
        }
    }
    g.lineTo(x - largeur / 2 - 2, yDepart + longueur * 0.7);
    g.closePath();
    g.fillPath();

    // Bordure verticale (l'ourlet ressort encore par endroits)
    g.lineStyle(1.5, couleurAccent, 0.6);
    g.beginPath();
    g.moveTo(x - largeur / 2 + 2, yDepart);
    g.lineTo(x - largeur / 2 + 2, yDepart + longueur * 0.5);
    g.moveTo(x + largeur / 2 - 2, yDepart);
    g.lineTo(x + largeur / 2 - 2, yDepart + longueur * 0.5);
    g.strokePath();

    // Petit motif central (croix gothique fanée)
    g.fillStyle(couleurAccent, 0.5);
    g.fillRect(x - 1, yDepart + 8, 2, 14);
    g.fillRect(x - 5, yDepart + 12, 10, 2);

    // Trous brûlés (3-4 cercles plus sombres dans le tissu)
    g.fillStyle(0x000000, 0.7);
    for (let t = 0; t < 4; t++) {
        const tx = x - largeur / 2 + 4 + rng() * (largeur - 8);
        const ty = yDepart + 8 + rng() * (longueur * 0.5);
        g.fillCircle(tx, ty, 1.5 + rng() * 2);
    }

    // Sway très lent (la bannière respire à peine, lourde de cendre)
    scene.tweens.add({
        targets: g,
        x: x + (rng() - 0.5) * 3,
        duration: 6000 + rng() * 3000,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1
    });

    return [g];
}

/**
 * Peint le bandeau décoratif horizontal au tiers supérieur du mur — frise
 * gothique simple (alternance de motifs en croix).
 */
function peindreBandeauDecoratif(g, palette, xDebut, xFin, yBandeau) {
    const hauteur = 14;
    // Fond du bandeau (sombre, ressort sur la pierre du mur)
    g.fillStyle(palette.pierreSombre ?? 0x1a1208, 0.8);
    g.fillRect(xDebut, yBandeau, xFin - xDebut, hauteur);

    // Lignes de cadre
    g.lineStyle(1, palette.pierreClaire ?? 0x6e5440, 0.5);
    g.beginPath();
    g.moveTo(xDebut, yBandeau); g.lineTo(xFin, yBandeau);
    g.moveTo(xDebut, yBandeau + hauteur); g.lineTo(xFin, yBandeau + hauteur);
    g.strokePath();

    // Motifs alternés tous les ~30 px
    const pas = 30;
    for (let x = xDebut + 15; x < xFin - 10; x += pas) {
        // Petite croix gothique
        g.fillStyle(palette.pierreClaire ?? 0x6e5440, 0.65);
        g.fillRect(x - 1, yBandeau + 2, 2, hauteur - 4);
        g.fillRect(x - 4, yBandeau + (hauteur - 2) / 2, 8, 2);
        // Pointe accentuée
        g.fillStyle(palette.accent ?? 0xa86838, 0.6);
        g.fillCircle(x, yBandeau + hauteur / 2, 1.2);
    }
}

function poserMurLateral(scene, dims, palette, cote, rng) {
    const objets = [];
    const estGauche = cote === 'gauche';
    const signe = estGauche ? 1 : -1;
    const xBord = estGauche ? 0 : dims.largeur;
    const xInterieur = estGauche ? EPAISSEUR_MUR : dims.largeur - EPAISSEUR_MUR;
    const yHaut = 0;
    const yBas = dims.hauteur - MARGE_PORTES;

    // Graphics principal du mur
    const g = scene.add.graphics();
    g.setDepth(DEPTH_INTERIEUR);

    // Profil supérieur dentelé (intégration avec plafond, casse irrégulière)
    const nbDentsHaut = 8;
    const bordHaut = [];
    bordHaut.push({ x: xBord, y: yHaut });
    for (let i = 1; i < nbDentsHaut; i++) {
        const t = i / nbDentsHaut;
        const x = xBord + signe * EPAISSEUR_MUR * t;
        // Près du plafond, le mur est intact ; vers l'intérieur il est cassé
        bordHaut.push({ x, y: yHaut + 12 + rng() * 14 });
    }
    bordHaut.push({ x: xInterieur, y: yHaut + 6 - rng() * 10 });

    // Profil inférieur dentelé (transition vers les gravats au sol)
    const nbDentsBas = 7;
    const bordBas = [];
    bordBas.push({ x: xBord, y: yBas });
    for (let i = 1; i < nbDentsBas; i++) {
        const t = i / nbDentsBas;
        const x = xBord + signe * EPAISSEUR_MUR * t;
        // Bas cassé en irrégularités prononcées (le mur est rongé)
        bordBas.push({ x, y: yBas - 6 + rng() * 18 });
    }
    bordBas.push({ x: xInterieur, y: yBas + 2 + rng() * 8 });

    // Corps principal du mur
    g.fillStyle(palette.plateforme ?? 0x2e2620, 1);
    g.beginPath();
    g.moveTo(xBord, yBas);
    g.lineTo(xBord, yHaut);
    for (let i = 1; i < bordHaut.length; i++) g.lineTo(bordHaut[i].x, bordHaut[i].y);
    for (let i = bordBas.length - 2; i >= 0; i--) g.lineTo(bordBas[i].x, bordBas[i].y);
    g.closePath();
    g.fillPath();

    // Highlight haut (lumière du ciel par les brèches du plafond)
    g.fillStyle(palette.pierreClaire ?? 0x6e5440, 0.30);
    g.beginPath();
    g.moveTo(xBord, bordHaut[0].y);
    for (let i = 1; i < bordHaut.length; i++) g.lineTo(bordHaut[i].x, bordHaut[i].y);
    g.lineTo(xInterieur, bordHaut[bordHaut.length - 1].y + 24);
    g.lineTo(xBord, bordHaut[0].y + 24);
    g.closePath();
    g.fillPath();

    // Ombre côté intérieur
    g.fillStyle(palette.pierreSombre ?? 0x1a1208, 0.45);
    const wOmbre = EPAISSEUR_MUR * 0.40;
    g.fillRect(estGauche ? xInterieur - wOmbre : xInterieur, yHaut + 30, wOmbre, yBas - yHaut - 50);

    // Rim light côté bord
    g.fillStyle(palette.pierreClaire ?? 0x6e5440, 0.50);
    g.fillRect(estGauche ? xBord : xBord - 2, yHaut + 20, 2, yBas - yHaut - 30);

    // Micro-variations de teinte (6 zones)
    const nbZones = 6;
    for (let i = 0; i < nbZones; i++) {
        const t = (i + 0.5) / nbZones;
        const yZ = yHaut + 30 + t * (yBas - yHaut - 40);
        const hZ = (yBas - yHaut - 40) / nbZones * (0.5 + rng() * 0.5);
        const xZ = xBord + signe * (12 + rng() * (EPAISSEUR_MUR - 24));
        const wZ = 18 + rng() * 28;
        const variation = rng() < 0.5
            ? (palette.pierreClaire ?? 0x6e5440)
            : (palette.pierreSombre ?? 0x1a1208);
        g.fillStyle(variation, 0.15 + rng() * 0.08);
        g.fillRect(xZ - wZ / 2, yZ - hZ / 2, wZ, hZ);
    }

    // Fissures verticales (4-6)
    g.lineStyle(1.2, palette.pierreSombre ?? 0x1a1208, 0.65);
    const nbFissures = 4 + Math.floor(rng() * 3);
    for (let f = 0; f < nbFissures; f++) {
        const xF = xBord + signe * (14 + rng() * (EPAISSEUR_MUR - 28));
        const yF1 = yHaut + 50 + rng() * (yBas - yHaut - 120);
        const yF2 = yF1 + 50 + rng() * 80;
        g.beginPath();
        g.moveTo(xF, yF1);
        g.lineTo(xF + (rng() - 0.5) * 3, yF2);
        g.strokePath();
    }

    // Bandeau décoratif horizontal au tiers haut
    const yBandeau = yHaut + (yBas - yHaut) * 0.32;
    const xBandeauDebut = estGauche ? 8 : dims.largeur - EPAISSEUR_MUR + 8;
    const xBandeauFin = estGauche ? EPAISSEUR_MUR - 8 : dims.largeur - 8;
    peindreBandeauDecoratif(g, palette, xBandeauDebut, xBandeauFin, yBandeau);

    // Dépôts de suie au pied (le sol près du mur est noirci)
    g.fillStyle(palette.mousse ?? 0x18120e, 0.7);
    for (let s = 0; s < 4; s++) {
        const xS = xBord + signe * (10 + rng() * (EPAISSEUR_MUR - 20));
        g.fillEllipse(xS, yBas - 4 + rng() * 6, 16 + rng() * 8, 4);
    }

    objets.push(g);

    // === Pilier gothique sur la face intérieure du mur ===
    // Sur un mur latéral vertical, 1 pilier large centré visuellement sur la
    // face intérieure suffit (vu en élévation, il couvre toute la hauteur du
    // mur et sert d'élément vertical signature gothique).
    const hauteurMur = yBas - yHaut;
    const xPilier = estGauche ? EPAISSEUR_MUR - 18 : dims.largeur - EPAISSEUR_MUR + 18;
    objets.push(...peindrePilierGothique(scene, palette, xPilier, yHaut, yBas, rng));

    // === Vitraux ogive multiples ===
    // 2-3 vitraux, espacés verticalement sur la face intérieure
    const nbVitraux = hauteurMur > 500 ? 3 : 2;
    const yVitrauxDebut = yBandeau + 30;
    const yVitrauxFin = yBas - 80;
    const espacementVitrail = (yVitrauxFin - yVitrauxDebut) / nbVitraux;
    const xVitrail = estGauche ? EPAISSEUR_MUR * 0.5 : dims.largeur - EPAISSEUR_MUR * 0.5;
    for (let v = 0; v < nbVitraux; v++) {
        const yVitrail = yVitrauxDebut + espacementVitrail * v;
        const largeurV = EPAISSEUR_MUR * 0.55;
        const hauteurV = espacementVitrail * 0.65;
        objets.push(...peindreVitrailOgive(scene, palette, xVitrail, yVitrail, largeurV, hauteurV, rng));
    }

    // === Niches à statues ===
    // 1 niche par mur, positionnée entre 2 vitraux (zone vide du mur)
    const yNiche = (yVitrauxDebut + yBandeau) / 2 + 20;
    const xNiche = estGauche ? EPAISSEUR_MUR * 0.42 : dims.largeur - EPAISSEUR_MUR * 0.42;
    objets.push(...peindreNicheStatue(scene, palette, xNiche, yNiche, cote, rng));

    // === Bannières carbonisées ===
    // 1-2 par mur, pendent depuis le bandeau décoratif
    const nbBannieres = 1 + (rng() < 0.5 ? 1 : 0);
    for (let b = 0; b < nbBannieres; b++) {
        const xBanniere = estGauche
            ? EPAISSEUR_MUR * (0.25 + rng() * 0.5)
            : dims.largeur - EPAISSEUR_MUR * (0.25 + rng() * 0.5);
        objets.push(...peindreBanniereCarbonisee(scene, palette, xBanniere, yBandeau + 14, rng));
    }

    // === Gravats au sol au pied du mur ===
    const gravats = scene.add.graphics();
    gravats.setDepth(DEPTH_INTERIEUR_DETAIL);
    gravats.fillStyle(palette.plateforme ?? 0x2e2620, 0.95);
    const nbTas = 4 + Math.floor(rng() * 3);
    for (let t = 0; t < nbTas; t++) {
        const xT = xBord + signe * (8 + rng() * (EPAISSEUR_MUR + 30));
        const yT = yBas + rng() * 8;
        // Tas = forme polygonale irrégulière (pierre tombée)
        const w = 14 + rng() * 16;
        const h = 8 + rng() * 8;
        gravats.beginPath();
        gravats.moveTo(xT - w / 2, yT);
        gravats.lineTo(xT - w / 4, yT - h);
        gravats.lineTo(xT + w / 4, yT - h * 0.85);
        gravats.lineTo(xT + w / 2, yT);
        gravats.closePath();
        gravats.fillPath();
        // Highlight
        gravats.fillStyle(palette.pierreClaire ?? 0x6e5440, 0.4);
        gravats.fillRect(xT - w / 4, yT - h, 2, h);
        gravats.fillStyle(palette.plateforme ?? 0x2e2620, 0.95);
    }
    // Ombre commune sous les gravats
    gravats.fillStyle(0x000000, 0.45);
    gravats.fillRect(xBord, yBas + 4, signe * (EPAISSEUR_MUR + 30), 4);
    objets.push(gravats);

    return objets;
}

// ============================================================
// API PUBLIQUE
// ============================================================

export function poserStructuresInterieurHallsCendres(scene, dims, rng, palette, options = {}) {
    const { etage = 3, boss = false } = options;
    if (etage !== 4 || !boss) return [];

    const objets = [];

    // Plafond voûté avec brèches en feu (en haut de la salle)
    objets.push(...poserPlafondVoute(scene, dims, palette, rng));

    // Murs latéraux détaillés (de y=0 à y=hauteur-MARGE_PORTES)
    objets.push(...poserMurLateral(scene, dims, palette, 'gauche', rng));
    objets.push(...poserMurLateral(scene, dims, palette, 'droite', rng));

    return objets;
}
