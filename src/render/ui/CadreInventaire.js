// CadreInventaire — cadre stylisé "tableau gravé" pour l'inventaire.
// Fond pierre sombre, double bordure dorée, coins ornementés, titre gravé.

const COUL_FOND = 0x14100a;        // Pierre sombre uniforme (méta, hors univers)
const COUL_FOND_OMBRE = 0x0a0805;
const COUL_OR = 0xc8a85a;
const COUL_OR_CLAIR = 0xffd070;

/**
 * Pose le cadre complet à l'écran. Tout est setScrollFactor(0).
 * @returns {{ container, contour, titre }}
 */
export function poserCadreInventaire(scene, gameWidth, gameHeight) {
    const container = scene.add.container(0, 0);
    container.setScrollFactor(0);
    container.setDepth(300);

    // Backdrop semi-transparent qui mange les clics derrière
    const backdrop = scene.add.rectangle(
        gameWidth / 2, gameHeight / 2,
        gameWidth, gameHeight,
        0x000000, 0.72
    );
    backdrop.setScrollFactor(0);
    backdrop.setDepth(290);
    backdrop.setInteractive();

    // Marges du cadre
    const marge = 28;
    const x = marge;
    const y = marge;
    const w = gameWidth - marge * 2;
    const h = gameHeight - marge * 2;

    // --- Fond pierre avec ombre douce ---
    const fond = scene.add.graphics();
    // Ombre extérieure
    fond.fillStyle(0x000000, 0.75);
    fond.fillRect(x - 4, y - 4, w + 8, h + 8);
    // Fond principal
    fond.fillStyle(COUL_FOND, 1);
    fond.fillRect(x, y, w, h);
    // Texture subtile : lignes horizontales très claires (gravure)
    fond.lineStyle(1, COUL_FOND_OMBRE, 0.6);
    for (let yL = y + 8; yL < y + h; yL += 4) {
        fond.beginPath();
        fond.moveTo(x + 3, yL);
        fond.lineTo(x + w - 3, yL);
        fond.strokePath();
    }
    container.add(fond);

    // --- Double bordure dorée ---
    const bord = scene.add.graphics();
    // Bordure extérieure épaisse
    bord.lineStyle(3, COUL_OR, 1);
    bord.strokeRect(x, y, w, h);
    // Bordure intérieure fine
    bord.lineStyle(1, COUL_OR_CLAIR, 0.85);
    bord.strokeRect(x + 5, y + 5, w - 10, h - 10);
    container.add(bord);

    // --- Coins ornementés (4 motifs en L doré) ---
    const ornementCoin = (cx, cy, dirX, dirY) => {
        const co = scene.add.graphics();
        co.lineStyle(2, COUL_OR_CLAIR, 1);
        // Premier trait
        co.beginPath();
        co.moveTo(cx + dirX * 4, cy + dirY * 4);
        co.lineTo(cx + dirX * 22, cy + dirY * 4);
        co.lineTo(cx + dirX * 22, cy + dirY * 8);
        co.strokePath();
        // Deuxième trait perpendiculaire
        co.beginPath();
        co.moveTo(cx + dirX * 4, cy + dirY * 4);
        co.lineTo(cx + dirX * 4, cy + dirY * 22);
        co.lineTo(cx + dirX * 8, cy + dirY * 22);
        co.strokePath();
        // Petit losange décoratif
        co.fillStyle(COUL_OR_CLAIR, 1);
        co.beginPath();
        co.moveTo(cx + dirX * 13, cy + dirY * 13);
        co.lineTo(cx + dirX * 16, cy + dirY * 10);
        co.lineTo(cx + dirX * 19, cy + dirY * 13);
        co.lineTo(cx + dirX * 16, cy + dirY * 16);
        co.closePath();
        co.fillPath();
        container.add(co);
    };
    ornementCoin(x, y, 1, 1);                  // Haut-gauche
    ornementCoin(x + w, y, -1, 1);             // Haut-droite
    ornementCoin(x, y + h, 1, -1);             // Bas-gauche
    ornementCoin(x + w, y + h, -1, -1);        // Bas-droite

    // --- Titre gravé "CARNET DU VESTIGE" ---
    const titre = scene.add.text(gameWidth / 2, y + 14, 'CARNET DU VESTIGE', {
        fontFamily: 'monospace',
        fontSize: '17px',
        color: '#ffd070',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(0.5, 0);
    container.add(titre);

    // Petit liseré sous le titre
    const liseré = scene.add.graphics();
    liseré.lineStyle(1, COUL_OR_CLAIR, 0.7);
    liseré.beginPath();
    liseré.moveTo(gameWidth / 2 - 100, y + 38);
    liseré.lineTo(gameWidth / 2 + 100, y + 38);
    liseré.strokePath();
    // Petit losange central
    liseré.fillStyle(COUL_OR, 1);
    liseré.beginPath();
    liseré.moveTo(gameWidth / 2, y + 35);
    liseré.lineTo(gameWidth / 2 + 4, y + 38);
    liseré.lineTo(gameWidth / 2, y + 41);
    liseré.lineTo(gameWidth / 2 - 4, y + 38);
    liseré.closePath();
    liseré.fillPath();
    container.add(liseré);

    return { container, backdrop, titre, zoneInterieure: { x, y, w, h } };
}

/**
 * Bouton "fermer" stylisé en haut à droite.
 */
export function poserBoutonFermer(scene, x, y, onClick) {
    const g = scene.add.graphics();
    g.setScrollFactor(0).setDepth(310);
    g.lineStyle(2, COUL_OR, 1);
    g.strokeCircle(x, y, 12);
    g.lineStyle(2, COUL_OR_CLAIR, 1);
    g.beginPath();
    g.moveTo(x - 5, y - 5);
    g.lineTo(x + 5, y + 5);
    g.moveTo(x + 5, y - 5);
    g.lineTo(x - 5, y + 5);
    g.strokePath();

    const hitbox = scene.add.rectangle(x, y, 28, 28, 0xffffff, 0)
        .setScrollFactor(0)
        .setDepth(311)
        .setInteractive({ useHandCursor: true });
    hitbox.on('pointerdown', onClick);
    hitbox.on('pointerover', () => {
        g.clear();
        g.lineStyle(2, COUL_OR_CLAIR, 1);
        g.strokeCircle(x, y, 12);
        g.lineStyle(2.5, 0xffffff, 1);
        g.beginPath();
        g.moveTo(x - 5, y - 5);
        g.lineTo(x + 5, y + 5);
        g.moveTo(x + 5, y - 5);
        g.lineTo(x - 5, y + 5);
        g.strokePath();
    });
    hitbox.on('pointerout', () => {
        g.clear();
        g.lineStyle(2, COUL_OR, 1);
        g.strokeCircle(x, y, 12);
        g.lineStyle(2, COUL_OR_CLAIR, 1);
        g.beginPath();
        g.moveTo(x - 5, y - 5);
        g.lineTo(x + 5, y + 5);
        g.moveTo(x + 5, y - 5);
        g.lineTo(x - 5, y + 5);
        g.strokePath();
    });

    return { g, hitbox };
}

export const COULEURS_INVENTAIRE = {
    fond: COUL_FOND,
    fondOmbre: COUL_FOND_OMBRE,
    or: COUL_OR,
    orClair: COUL_OR_CLAIR
};
