// PainterlyRenderer — helpers pour le style "Painterly Vector" de Vestige.
//
// Style : formes vectorielles avec palette restreinte, dégradés simulés par
// superposition de couches semi-transparentes, ornements dessinés. Pas de flat
// design pur, pas de pixel art, pas d'assets externes — tout en Phaser Graphics.
//
// Identité forte voulue par le projet : chaque salle doit être *immédiatement*
// lisible Présent/Miroir.

// ============================================================
// PALETTES — Présent (Mémoire Endormie) et Miroir (Mémoire Vive)
// ============================================================

export const PALETTE_PRESENT = {
    fond: '#0a1428',         // ciel/abîme bleu nuit
    fondGradientHaut: '#162236',
    fondGradientBas: '#070d1c',

    plateforme: 0x2a3a52,    // pierre bleutée des plateformes
    plateformeContour: 0x4a5a72,
    plateformeOrnement: 0x5a4060, // pourpre fané pour les "fissures" et accents

    pierre: 0x4a5a7a,        // pierre claire (colonnes intactes — n/a en présent)
    pierreSombre: 0x2a3a52,  // ombre des structures
    pierreClaire: 0x6a7a9a,  // highlight subtil

    mousse: 0x3a4a3a,        // mousse verte fanée à la base des structures
    racine: 0x5a3060,        // racines pourpres traversantes
    accent: 0x6a4a78,        // accent fané

    brume: 0x4060a0,         // brume bleutée au sol
    particule: 0xa0a8c0      // poussière fine qui tombe
};

export const PALETTE_MIROIR = {
    fond: '#3a2818',
    fondGradientHaut: '#5a3a20',
    fondGradientBas: '#1a0c08',

    plateforme: 0x7a3a4a,    // pierre chaude
    plateformeContour: 0xa05050,
    plateformeOrnement: 0xc8a85a, // or vif pour les chasse-pieds

    pierre: 0x8a6a4a,
    pierreSombre: 0x4a2818,
    pierreClaire: 0xc8a85a,

    mousse: 0x6a7a3a,        // lierre vert vivant
    racine: 0x8a3060,        // pourpre royal
    accent: 0xc8a85a,        // or

    drape: 0x8a3060,         // tapisseries pourpres
    flamme: 0xffa040,        // lanternes
    rayon: 0xffd8a0,         // rayons de lumière chauds

    particule: 0xffd070      // étincelles dorées qui montent
};

export function paletteDuMonde(monde) {
    return monde === 'miroir' ? PALETTE_MIROIR : PALETTE_PRESENT;
}

// ============================================================
// COUCHES Z-ORDER — strict, pour un rendu propre
// ============================================================
export const DEPTH = {
    CIEL: -100,
    SILHOUETTES: -50,
    DECOR_ARRIERE: -20,
    DECOR_MILIEU: -10,
    PLATEFORMES: 0,
    DECOR_AVANT: 10,
    ENTITES: 20,
    PARTICULES: 50,
    EFFETS: 100,
    VIGNETTE: 150
};

// ============================================================
// VIGNETTE — overlay sombre aux bords pour une finition cinéma
// ============================================================

let _texVignetteCreee = false;

/**
 * Crée la texture de vignette une seule fois (radial gradient noir transparent
 * au centre, opaque aux bords). À appeler depuis une scène, sera réutilisée.
 */
export function preparerTextureVignette(scene, largeur = 960, hauteur = 540) {
    if (_texVignetteCreee || scene.textures.exists('_vignette')) return;
    const cv = scene.textures.createCanvas('_vignette', largeur, hauteur);
    const ctx = cv.getContext();
    const gradient = ctx.createRadialGradient(
        largeur / 2, hauteur / 2, Math.min(largeur, hauteur) * 0.3,
        largeur / 2, hauteur / 2, Math.max(largeur, hauteur) * 0.65
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.6, 'rgba(0,0,0,0.25)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, largeur, hauteur);
    cv.refresh();
    _texVignetteCreee = true;
}

/**
 * Pose une vignette fixe à l'écran (suit la caméra). À appeler après que la
 * scène soit prête. Renvoie l'image pour pouvoir l'animer si besoin.
 */
export function poserVignette(scene, intensite = 1) {
    preparerTextureVignette(scene);
    const cam = scene.cameras.main;
    const vignette = scene.add.image(cam.width / 2, cam.height / 2, '_vignette');
    vignette.setScrollFactor(0);
    vignette.setDepth(DEPTH.VIGNETTE);
    vignette.setAlpha(intensite);
    vignette.setDisplaySize(cam.width, cam.height);
    return vignette;
}

// ============================================================
// PARTICULES D'AMBIANCE
// ============================================================

let _texParticuleCreee = false;

export function preparerTextureParticule(scene) {
    if (_texParticuleCreee || scene.textures.exists('_particule')) return;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture('_particule', 8, 8);
    g.destroy();
    _texParticuleCreee = true;
}

/**
 * Émetteur d'ambiance selon le monde :
 *   - Présent : poussière qui tombe lentement (cendres bleutées)
 *   - Miroir  : étincelles dorées qui montent (chaleur, vie)
 */
export function poserParticulesAmbiance(scene, dims, monde) {
    preparerTextureParticule(scene);
    const palette = paletteDuMonde(monde);
    const enMiroir = monde === 'miroir';

    const config = enMiroir
        ? {
            x: { min: 0, max: dims.largeur },
            y: dims.hauteur,
            lifespan: 6000,
            speedY: { min: -50, max: -20 },
            speedX: { min: -10, max: 10 },
            scale: { start: 0.4, end: 0 },
            tint: palette.particule,
            quantity: 1,
            frequency: 280,
            alpha: { start: 0.7, end: 0 },
            blendMode: Phaser.BlendModes.ADD
        }
        : {
            x: { min: 0, max: dims.largeur },
            y: 0,
            lifespan: 8000,
            speedY: { min: 15, max: 40 },
            speedX: { min: -8, max: 8 },
            scale: { start: 0.45, end: 0 },
            tint: palette.particule,
            quantity: 1,
            frequency: 350,
            alpha: { start: 0.35, end: 0 }
        };

    const emetteur = scene.add.particles(0, 0, '_particule', config);
    emetteur.setDepth(DEPTH.PARTICULES);
    emetteur.setScrollFactor(0.9); // léger parallax
    return emetteur;
}

// ============================================================
// HELPERS DE DESSIN — formes peintes
// ============================================================

/**
 * Dessine une forme avec ombre + remplissage + highlight pour un look
 * "peint" plutôt que flat. Reçoit un Phaser.GameObjects.Graphics et des
 * points formant un polygone.
 */
export function formeAvecVolume(graphics, points, couleurFond, couleurOmbre, couleurHighlight) {
    // Ombre (offset bas-droite)
    if (couleurOmbre !== undefined) {
        graphics.fillStyle(couleurOmbre, 1);
        graphics.beginPath();
        graphics.moveTo(points[0].x + 2, points[0].y + 2);
        for (let i = 1; i < points.length; i++) {
            graphics.lineTo(points[i].x + 2, points[i].y + 2);
        }
        graphics.closePath();
        graphics.fillPath();
    }

    // Remplissage principal
    graphics.fillStyle(couleurFond, 1);
    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.closePath();
    graphics.fillPath();

    // Highlight (forme intérieure plus claire en haut-gauche)
    if (couleurHighlight !== undefined) {
        graphics.fillStyle(couleurHighlight, 0.4);
        graphics.beginPath();
        graphics.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            const p = points[i];
            graphics.lineTo(p.x - 1, p.y - 1);
        }
        graphics.closePath();
        graphics.fillPath();
    }
}

/**
 * Trace une ligne brisée (pour fissures) avec irrégularités.
 */
export function fissure(graphics, x1, y1, x2, y2, couleur, alpha = 0.6, segments = 5) {
    graphics.lineStyle(1, couleur, alpha);
    graphics.beginPath();
    graphics.moveTo(x1, y1);
    for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const x = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 6;
        const y = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 4;
        graphics.lineTo(x, y);
    }
    graphics.lineTo(x2, y2);
    graphics.strokePath();
}
