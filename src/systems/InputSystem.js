// Système d'input — abstrait les touches en INTENTIONS sémantiques.
//
// Pourquoi : la cible plateforme est mobile (cf. GDD). On ne veut JAMAIS
// que la logique gameplay lise `this.input.keyboard` directement, sinon
// porter sur tactile demande un gros refactor. Ici, on expose un objet
// `intentions` que la scène consomme. Pour ajouter le tactile plus tard,
// il suffira de créer un autre fichier qui produit les mêmes intentions.
//
// USAGE :
//   this.inputSystem = new InputSystem(this); // dans create()
//   this.inputSystem.update();                // dans update(), au début
//   if (this.inputSystem.intentions.gauche) ... // partout ailleurs

export class InputSystem {
    constructor(scene) {
        this.scene = scene;

        // --- Touches clavier brutes (lues uniquement par cette classe) ---
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.touches = scene.input.keyboard.addKeys({
            gauche: Phaser.Input.Keyboard.KeyCodes.Q,
            droite: Phaser.Input.Keyboard.KeyCodes.D,
            descendre: Phaser.Input.Keyboard.KeyCodes.S,
            saut: Phaser.Input.Keyboard.KeyCodes.SPACE,
            interagir: Phaser.Input.Keyboard.KeyCodes.E,
            inventaire: Phaser.Input.Keyboard.KeyCodes.I,
            carte: Phaser.Input.Keyboard.KeyCodes.M,
            // Combat (étape 7)
            attaquer: Phaser.Input.Keyboard.KeyCodes.X,
            parry: Phaser.Input.Keyboard.KeyCodes.C,
            sort: Phaser.Input.Keyboard.KeyCodes.Z,
            // Caméra — dézoom continu tant que maintenue (lecture salle XL).
            // TAB : standard "vue d'ensemble" (minimap/scoreboard). N était
            // déjà pris par AudioSystem (toggle mute global, cf. doctrine
            // projet).
            zoomOut: Phaser.Input.Keyboard.KeyCodes.TAB,
            // Phase 5b.2 — déclenche le Geste du Vestige équipé en slot Geste
            geste: Phaser.Input.Keyboard.KeyCodes.V,
            // Étape 2A — geste d'ancrage Ruines basses (poser une plateforme
            // sur la zone ancre_construction la plus proche, coût 1 Fragment Blanc)
            ancrer: Phaser.Input.Keyboard.KeyCodes.A,
            // Phase 6 — sorts des items équipés (1 = tête, 2 = corps, 3 = accessoire)
            sort1: Phaser.Input.Keyboard.KeyCodes.ONE,
            sort2: Phaser.Input.Keyboard.KeyCodes.TWO,
            sort3: Phaser.Input.Keyboard.KeyCodes.THREE,
            // Provisoires (debug — ne seront pas portés sur mobile)
            degatTest: Phaser.Input.Keyboard.KeyCodes.K,
            healTest: Phaser.Input.Keyboard.KeyCodes.H
        });

        // Empêche le navigateur de consommer TAB (sinon cycle focus DOM)
        scene.input.keyboard.addCapture('TAB');

        // --- Intentions exposées (la seule chose que la scène devrait lire) ---
        this.intentions = {
            // Continues (true tant que la touche est pressée)
            gauche: false,
            droite: false,
            descendre: false,
            // Phase 9.10 — déplacement vertical en vue de dessus (Cœur du Reflux).
            // Continus : ↑/Z = haut, ↓/S = bas. Ignorés hors top-down.
            haut: false,
            bas: false,
            zoomOutTenu: false,  // continu — true tant que la touche N est pressée
            // Edge (true uniquement la frame du déclenchement)
            sauter: false,
            // Phase 9.10 — dash en vue de dessus (remplace le saut). Même touche
            // que le saut (Espace) : impulse → impulse. Ignoré hors top-down.
            dash: false,
            interagir: false,
            ouvrirInventaire: false,
            ouvrirCarte: false,
            attaquer: false,
            parry: false,
            sort: false,
            geste: false,
            ancrer: false,
            sort1: false,
            sort2: false,
            sort3: false,
            descendreEdge: false,
            // Provisoires (debug)
            degatTest: false,
            healTest: false
        };
    }

    // Doit être appelé en début de update() de la scène, AVANT toute lecture
    // des intentions. Met à jour l'état pour la frame courante.
    update() {
        const i = this.intentions;
        i.gauche = this.cursors.left.isDown || this.touches.gauche.isDown;
        i.droite = this.cursors.right.isDown || this.touches.droite.isDown;
        i.descendre = this.cursors.down.isDown || this.touches.descendre.isDown;
        i.zoomOutTenu = this.touches.zoomOut.isDown;

        // Vertical top-down (continu) — ↑/Z = haut, ↓/S = bas. La touche Z porte
        // aussi `sort` (edge, JustDown), sans conflit : top-down ignore `sort`,
        // side-scroll ignore `haut`. Le bas réutilise `descendre`.
        i.haut = this.cursors.up.isDown || this.touches.sort.isDown;
        i.bas = i.descendre;

        // Edge des touches de saut/dash — JustDown ne doit être lu QU'UNE fois par
        // Key (il consomme le flag). On calcule chaque edge une seule fois ici.
        const upJust = Phaser.Input.Keyboard.JustDown(this.cursors.up);
        const spaceJust = Phaser.Input.Keyboard.JustDown(this.cursors.space);
        const sautKeyJust = Phaser.Input.Keyboard.JustDown(this.touches.saut);
        i.sauter = upJust || spaceJust || sautKeyJust;
        // Dash = Espace (la touche de saut). Même impulsion, autre mode.
        i.dash = spaceJust || sautKeyJust;

        i.interagir = Phaser.Input.Keyboard.JustDown(this.touches.interagir);
        i.ouvrirInventaire = Phaser.Input.Keyboard.JustDown(this.touches.inventaire);
        i.ouvrirCarte = Phaser.Input.Keyboard.JustDown(this.touches.carte);

        i.attaquer = Phaser.Input.Keyboard.JustDown(this.touches.attaquer);
        i.parry = Phaser.Input.Keyboard.JustDown(this.touches.parry);
        i.sort = Phaser.Input.Keyboard.JustDown(this.touches.sort);
        i.geste = Phaser.Input.Keyboard.JustDown(this.touches.geste);
        i.ancrer = Phaser.Input.Keyboard.JustDown(this.touches.ancrer);
        i.sort1 = Phaser.Input.Keyboard.JustDown(this.touches.sort1);
        i.sort2 = Phaser.Input.Keyboard.JustDown(this.touches.sort2);
        i.sort3 = Phaser.Input.Keyboard.JustDown(this.touches.sort3);

        // Edge sur descendre — utilisé pour déclencher le drop-through
        i.descendreEdge =
            Phaser.Input.Keyboard.JustDown(this.cursors.down) ||
            Phaser.Input.Keyboard.JustDown(this.touches.descendre);

        i.degatTest = Phaser.Input.Keyboard.JustDown(this.touches.degatTest);
        i.healTest = Phaser.Input.Keyboard.JustDown(this.touches.healTest);
    }
}
