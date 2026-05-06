// MapScene — overlay de la carte de l'étage. Découverte à mesure.
//
// Règles de visibilité :
//   - Salle visitée : pleine, colorée, label visible
//   - Salle adjacente à une visitée (= "connue mais inexplorée") : silhouette
//     en pointillés, opacité réduite, pas de label
//   - Salle inconnue : invisible
//
// Le boss n'est révélé qu'à partir du moment où on a visité une salle
// adjacente (typiquement D). Avant ça, c'est juste "on sait qu'il y a
// quelque chose au bout".

import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { etageDepuisRegistry } from '../systems/EtageGen.js';
import { COULEURS_INVENTAIRE, poserCadreInventaire, poserBoutonFermer } from '../render/ui/CadreInventaire.js';

const COULEUR_VISITEE   = 0xc8a85a;
const COULEUR_COURANTE  = 0xffd070;
const COULEUR_ADJACENTE = 0x6a6878;
const COULEUR_BOSS      = 0xff6060;
const COULEUR_LIGNE     = 0x8a7858;

// Espacement de la grille
const ESPACE_COL = 110;
const ESPACE_ROW = 80;
const RAYON_NOEUD = 22;

export class MapScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MapScene' });
    }

    create() {
        const cadre = poserCadreInventaire(this, GAME_WIDTH, GAME_HEIGHT);
        cadre.titre.setText('CARTE DE L\'ÉTAGE');

        poserBoutonFermer(this, GAME_WIDTH - 50, 50, () => this.fermer());

        const etageData = this.registry.get('etage_data');
        const salleCouranteId = this.registry.get('salle_courante_id');
        const etage = etageDepuisRegistry(etageData);

        if (!etage) {
            this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2,
                'Pas de carte disponible.', {
                    fontFamily: 'monospace', fontSize: '14px', color: '#8a8a9a'
                }).setOrigin(0.5).setDepth(310);
            this.input.keyboard.on('keydown-ESC', () => this.fermer());
            this.input.keyboard.on('keydown-M', () => this.fermer());
            return;
        }

        // Sous-titre : étage / biome / progression
        const visites = etage.sallesVisitees.size;
        const total = etage.salles.size;
        this.add.text(GAME_WIDTH / 2, 78,
            `Étage ${etage.numero}  ·  ${etage.biome}  ·  ${visites}/${total} salles`,
            {
                fontFamily: 'monospace', fontSize: '12px',
                color: '#c8a85a', fontStyle: 'italic',
                stroke: '#000', strokeThickness: 2
            }
        ).setOrigin(0.5, 0).setDepth(310);

        this._dessinerGraphe(etage, salleCouranteId);

        // Légende en bas
        this._dessinerLegende();

        // Touches
        this.input.keyboard.on('keydown-ESC', () => this.fermer());
        this.input.keyboard.on('keydown-M', () => this.fermer());
    }

    fermer() {
        const codes = Phaser.Input.Keyboard.KeyCodes;
        const keys = this.input.keyboard.keys;
        [codes.ESC, codes.M].forEach(c => keys[c]?.reset());
        this.scene.resume('GameScene');
        this.scene.stop();
    }

    _dessinerGraphe(etage, salleCouranteId) {
        // Cadrage : on calcule les bornes de la grille pour centrer le tout
        let colMin = Infinity, colMax = -Infinity, rowMin = Infinity, rowMax = -Infinity;
        for (const salle of etage.salles.values()) {
            if (salle.gridCol < colMin) colMin = salle.gridCol;
            if (salle.gridCol > colMax) colMax = salle.gridCol;
            if (salle.gridRow < rowMin) rowMin = salle.gridRow;
            if (salle.gridRow > rowMax) rowMax = salle.gridRow;
        }
        const largeurGrille = (colMax - colMin) * ESPACE_COL;
        const hauteurGrille = (rowMax - rowMin) * ESPACE_ROW;
        const offsetX = (GAME_WIDTH - largeurGrille) / 2 - colMin * ESPACE_COL;
        const offsetY = (GAME_HEIGHT - hauteurGrille) / 2 - rowMin * ESPACE_ROW + 20;

        const posDe = (salle) => ({
            x: offsetX + salle.gridCol * ESPACE_COL,
            y: offsetY + salle.gridRow * ESPACE_ROW
        });

        // Set des id "connus" : visités + adjacents aux visités
        const connus = new Set(etage.sallesVisitees);
        for (const id of etage.sallesVisitees) {
            const salle = etage.salles.get(id);
            if (!salle) continue;
            for (const voisinId of Object.values(salle.voisins)) {
                connus.add(voisinId);
            }
        }

        // ─── Lignes de connexions (avant les nœuds, pour qu'elles soient en-dessous) ───
        const dejaTraite = new Set();
        for (const salle of etage.salles.values()) {
            if (!connus.has(salle.id)) continue;
            const p1 = posDe(salle);
            for (const voisinId of Object.values(salle.voisins)) {
                if (!connus.has(voisinId)) continue;
                const cle = [salle.id, voisinId].sort().join('|');
                if (dejaTraite.has(cle)) continue;
                dejaTraite.add(cle);
                const voisin = etage.salles.get(voisinId);
                if (!voisin) continue;
                const p2 = posDe(voisin);

                const visiteeOuConnue =
                    etage.sallesVisitees.has(salle.id) && etage.sallesVisitees.has(voisinId);

                const ligne = this.add.graphics();
                ligne.lineStyle(visiteeOuConnue ? 2 : 1, COULEUR_LIGNE, visiteeOuConnue ? 0.85 : 0.35);
                ligne.beginPath();
                ligne.moveTo(p1.x, p1.y);
                ligne.lineTo(p2.x, p2.y);
                ligne.strokePath();
                ligne.setDepth(310);
            }
        }

        // ─── Noeuds ───
        for (const salle of etage.salles.values()) {
            if (!connus.has(salle.id)) continue;
            const { x, y } = posDe(salle);

            const visitee = etage.sallesVisitees.has(salle.id);
            const courante = salle.id === salleCouranteId;

            // Halo si courante
            if (courante) {
                const halo = this.add.graphics();
                halo.setBlendMode(Phaser.BlendModes.ADD);
                halo.fillStyle(COULEUR_COURANTE, 0.45);
                halo.fillCircle(x, y, RAYON_NOEUD + 12);
                halo.setDepth(310);
                this.tweens.add({
                    targets: halo,
                    alpha: { from: 0.4, to: 0.85 },
                    duration: 900,
                    yoyo: true, repeat: -1, ease: 'Sine.InOut'
                });
            }

            // Disque
            const couleur = courante
                ? COULEUR_COURANTE
                : (salle.estBoss && visitee ? COULEUR_BOSS
                : (visitee ? COULEUR_VISITEE : COULEUR_ADJACENTE));
            const alpha = visitee ? 1 : 0.55;

            const disque = this.add.graphics();
            disque.fillStyle(0x14100a, 0.95);
            disque.fillCircle(x, y, RAYON_NOEUD);
            disque.lineStyle(2, couleur, alpha);
            disque.strokeCircle(x, y, RAYON_NOEUD);
            // Si non-visitée, on dessine un trait pointillé en superposition pour
            // signaler "connue mais pas explorée"
            if (!visitee) {
                disque.lineStyle(1, couleur, 0.5);
                for (let a = 0; a < Math.PI * 2; a += 0.45) {
                    disque.beginPath();
                    const x1 = x + Math.cos(a) * (RAYON_NOEUD - 4);
                    const y1 = y + Math.sin(a) * (RAYON_NOEUD - 4);
                    const x2 = x + Math.cos(a + 0.18) * (RAYON_NOEUD - 4);
                    const y2 = y + Math.sin(a + 0.18) * (RAYON_NOEUD - 4);
                    disque.moveTo(x1, y1);
                    disque.lineTo(x2, y2);
                    disque.strokePath();
                }
            }
            disque.setDepth(311);

            // Symbole : ENT pour entrée, étoile pour boss, point pour autres
            if (visitee) {
                if (salle.estBoss) {
                    // Étoile rouge au centre
                    const eto = this.add.graphics();
                    eto.fillStyle(COULEUR_BOSS, 1);
                    eto.beginPath();
                    for (let i = 0; i < 10; i++) {
                        const ang = (i * Math.PI) / 5 - Math.PI / 2;
                        const r = (i % 2 === 0) ? 9 : 4;
                        const ex = x + Math.cos(ang) * r;
                        const ey = y + Math.sin(ang) * r;
                        if (i === 0) eto.moveTo(ex, ey); else eto.lineTo(ex, ey);
                    }
                    eto.closePath();
                    eto.fillPath();
                    eto.setDepth(312);
                } else if (salle.estEntree) {
                    this.add.text(x, y, 'ENT', {
                        fontFamily: 'monospace', fontSize: '11px',
                        color: '#ffd070', fontStyle: 'bold',
                        stroke: '#000', strokeThickness: 2
                    }).setOrigin(0.5).setDepth(312);
                } else {
                    // Petit point central
                    const pt = this.add.graphics();
                    pt.fillStyle(couleur, 0.85);
                    pt.fillCircle(x, y, 4);
                    pt.setDepth(312);
                }
            } else {
                // Inconnue → '?'
                this.add.text(x, y, '?', {
                    fontFamily: 'monospace', fontSize: '14px',
                    color: '#8a8a9a', fontStyle: 'bold'
                }).setOrigin(0.5).setDepth(312);
            }
        }
    }

    _dessinerLegende() {
        const y = GAME_HEIGHT - 60;
        const cx = GAME_WIDTH / 2;
        const items = [
            { couleur: COULEUR_COURANTE,  label: 'ICI' },
            { couleur: COULEUR_VISITEE,   label: 'visitée' },
            { couleur: COULEUR_ADJACENTE, label: 'connue' },
            { couleur: COULEUR_BOSS,      label: 'boss' }
        ];
        const espace = 130;
        const xDebut = cx - (items.length * espace) / 2 + espace / 2;
        for (let i = 0; i < items.length; i++) {
            const x = xDebut + i * espace;
            const g = this.add.graphics();
            g.lineStyle(2, items[i].couleur, 1);
            g.strokeCircle(x - 30, y, 8);
            g.setDepth(310);
            this.add.text(x - 18, y, items[i].label, {
                fontFamily: 'monospace', fontSize: '11px',
                color: '#c8c0a8', fontStyle: 'bold'
            }).setOrigin(0, 0.5).setDepth(310);
        }
    }
}
