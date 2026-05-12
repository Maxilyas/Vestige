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
            // Phase 5b.2 — déclenche le Geste du Vestige équipé en slot Geste
            geste: Phaser.Input.Keyboard.KeyCodes.V,
            // Phase 6 — sorts des items équipés (1 = tête, 2 = corps, 3 = accessoire)
            sort1: Phaser.Input.Keyboard.KeyCodes.ONE,
            sort2: Phaser.Input.Keyboard.KeyCodes.TWO,
            sort3: Phaser.Input.Keyboard.KeyCodes.THREE,
            // Provisoires (debug — ne seront pas portés sur mobile)
            degatTest: Phaser.Input.Keyboard.KeyCodes.K,
            healTest: Phaser.Input.Keyboard.KeyCodes.H
        });

        // --- Intentions exposées (la seule chose que la scène devrait lire) ---
        this.intentions = {
            // Continues (true tant que la touche est pressée)
            gauche: false,
            droite: false,
            descendre: false,
            // Edge (true uniquement la frame du déclenchement)
            sauter: false,
            interagir: false,
            ouvrirInventaire: false,
            ouvrirCarte: false,
            attaquer: false,
            parry: false,
            sort: false,
            geste: false,
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

        i.sauter =
            Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
            Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
            Phaser.Input.Keyboard.JustDown(this.touches.saut);

        i.interagir = Phaser.Input.Keyboard.JustDown(this.touches.interagir);
        i.ouvrirInventaire = Phaser.Input.Keyboard.JustDown(this.touches.inventaire);
        i.ouvrirCarte = Phaser.Input.Keyboard.JustDown(this.touches.carte);

        i.attaquer = Phaser.Input.Keyboard.JustDown(this.touches.attaquer);
        i.parry = Phaser.Input.Keyboard.JustDown(this.touches.parry);
        i.sort = Phaser.Input.Keyboard.JustDown(this.touches.sort);
        i.geste = Phaser.Input.Keyboard.JustDown(this.touches.geste);
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
