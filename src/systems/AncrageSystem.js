// AncrageSystem — mécanique signature du biome Ruines basses.
//
// Le joueur peut poser des plateformes "ancrées" sur des zones spéciales
// (type 'ancre_construction') définies dans les salles handcrafted.
// Coût : 1 Fragment Blanc par ancre. Limite : 3 ancres simultanées par
// salle, FIFO (la 4ᵉ remplace la 1ère — évite le blocage si placements
// foireux).
//
// Geste joueur : touche A (intention `ancrer`, abstraite via InputSystem).
// La zone ancrable doit être sous/proche du joueur (distance manhattan
// limitée). Sinon : no-op + petit feedback "rien à ancrer ici".
//
// Cycle de vie :
//   - GameScene.create() crée le système, appelle initSalle(salle.zones)
//   - À chaque update(), si i.ancrer && joueur proche d'une ancre → spawn
//   - Au shutdown de la scène, tout est cleanup automatiquement (la scene
//     restart détruit les Game Objects)

const COULEUR_PLATEFORME_ANCREE = 0x88643a;   // or terni Ruines (paletteBiome.accent)
const COULEUR_GLOW             = 0xc8a85a;    // accent biome
const DIST_DETECTION = 140;                   // px : distance joueur ↔ centre ancre.
// 140 ≈ saut horiz max (130) + marge. Permet de poser une plateforme depuis
// le bord d'un palier sans devoir être pile en dessous → marge d'erreur saine.
const MAX_ANCRES = 3;
const COUT_RESONANCE = 5;                     // coût par ancre (drain Vestige)

export class AncrageSystem {
    /**
     * @param {Phaser.Scene} scene
     * @param {object} economy - instance EconomySystem
     */
    constructor(scene, resonance) {
        this.scene = scene;
        this.resonance = resonance;
        this.zones = [];               // zones ancrables de la salle courante
        this.platsAncrees = [];        // FIFO de plateformes posées
        this._cooldownFin = 0;
        this.obstaclesAntiAncrage = []; // zones où l'ancrage est désactivé
    }

    /** Injection des zones anti-ancrage (lecture par tenterAncrage). */
    setObstaclesAntiAncrage(obstacles) {
        this.obstaclesAntiAncrage = obstacles ?? [];
    }

    /**
     * Initialise les zones ancrables pour la salle courante.
     * @param {Array} zonesSalle - liste des zones (objets {type, x, yTop, w, h, params})
     */
    initSalle(zonesSalle = []) {
        this.zones = zonesSalle.filter(z => z?.type === 'ancre_construction');
        this.platsAncrees = [];
        this._cooldownFin = 0;
        this._dessinerSilhouettesAncres();
    }

    /**
     * À appeler depuis update() de GameScene quand i.ancrer est true.
     */
    tenterAncrage(player) {
        if (this.scene.time.now < this._cooldownFin) return;
        if (!player) return;

        // Anti-ancrage : si le joueur est dans une zone de brouillage du
        // Reflux, le geste échoue avec feedback narratif.
        for (const obs of this.obstaclesAntiAncrage) {
            if (obs.contient?.(player.x, player.y)) {
                this._feedbackEchec('Le Reflux brouille la résonance ici');
                return;
            }
        }

        const zone = this._zoneLaPlusProche(player.x, player.y);
        if (!zone) {
            this._feedbackEchec('Aucune ancre à portée');
            return;
        }

        // Coût en Résonance : on retire COUT_RESONANCE PV au Vestige. Lore :
        // l'acte de manifestation matérielle coûte un peu de cohérence au
        // Vestige. Refus si la Résonance restante serait nulle (suicide
        // accidentel par ancrage).
        const valeurCourante = this.resonance?.getValeur() ?? 0;
        if (valeurCourante <= COUT_RESONANCE) {
            this._feedbackEchec('Résonance trop basse');
            return;
        }
        this.resonance?.prendreDegats(COUT_RESONANCE);

        this._poserPlateforme(zone);
        this._cooldownFin = this.scene.time.now + 250;
    }

    // ─── Internes ───────────────────────────────────────────────────

    _zoneLaPlusProche(px, py) {
        let meilleure = null;
        let meilleureDist = DIST_DETECTION;
        for (const z of this.zones) {
            const dx = (z.x) - px;
            const dy = (z.yTop + z.h / 2) - py;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < meilleureDist) {
                meilleureDist = d;
                meilleure = z;
            }
        }
        return meilleure;
    }

    _poserPlateforme(zone) {
        const w = zone.params?.plateformeW ?? 90;
        const h = zone.params?.plateformeH ?? 14;
        const x = zone.x;
        const y = zone.yTop + h / 2;

        // Plateforme physique : on réutilise creerPlateforme du GameScene pour
        // bénéficier du même pipeline (group, ornement). On force oneWay pour
        // permettre au joueur de la traverser par le bas (cohérent avec
        // l'attente "je peux poser au-dessus de ma tête puis sauter dessus").
        const rect = this.scene.creerPlateforme(x, y, w, h, COULEUR_PLATEFORME_ANCREE, true, false);

        // Glow + FX d'apparition
        const glow = this.scene.add.rectangle(x, y, w + 6, h + 6, COULEUR_GLOW, 0.45);
        glow.setBlendMode(Phaser.BlendModes.ADD);
        glow.setDepth(rect.depth - 1);
        this.scene.tweens.add({
            targets: glow,
            alpha: 0,
            duration: 600,
            ease: 'Quad.easeOut'
        });
        // Burst de particules courtes
        this.scene.tweens.add({
            targets: rect,
            scaleY: { from: 0.2, to: 1 },
            duration: 180,
            ease: 'Back.easeOut'
        });

        const entry = { rect, glow, zoneRef: zone };
        this.platsAncrees.push(entry);

        // FIFO : si dépassement, retire la plus ancienne
        if (this.platsAncrees.length > MAX_ANCRES) {
            const vieille = this.platsAncrees.shift();
            this._detruirePlateforme(vieille);
        }
    }

    _detruirePlateforme(entry) {
        if (!entry) return;
        // FX de dissipation
        if (entry.rect?.active) {
            this.scene.tweens.add({
                targets: entry.rect,
                alpha: 0,
                duration: 180,
                onComplete: () => entry.rect.destroy()
            });
        }
        if (entry.glow?.active) entry.glow.destroy();
    }

    _dessinerSilhouettesAncres() {
        // Pour chaque zone ancrable, dessine une silhouette discrète (rectangle
        // outline + ADD pulse léger) qui suggère "ici tu peux poser". Pas de
        // tutoriel, juste un indice visuel cohérent avec le lore (le Vestige
        // sent les nœuds de Résonance dans la pierre).
        for (const z of this.zones) {
            const w = z.params?.plateformeW ?? 90;
            const h = z.params?.plateformeH ?? 14;
            const x = z.x;
            const y = z.yTop + h / 2;
            const ghost = this.scene.add.rectangle(x, y, w, h, COULEUR_GLOW, 0.12);
            ghost.setStrokeStyle(1, COULEUR_GLOW, 0.3);
            ghost.setBlendMode(Phaser.BlendModes.ADD);
            ghost.setDepth(2);  // au-dessus du fond, sous les plateformes
            this.scene.tweens.add({
                targets: ghost,
                alpha: { from: 0.12, to: 0.22 },
                duration: 1400,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    _feedbackEchec(message) {
        if (this.scene.afficherMessageFlottant) {
            this.scene.afficherMessageFlottant(message, '#c08866');
        }
    }
}
