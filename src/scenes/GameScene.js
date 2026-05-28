// Scène principale.
// Étapes MVP 2-7 : déplacement, salles, Résonance, basculement, loot, ennemis & combat.
//
// Doctrine des Deux Mondes :
//   - Présent  = chasse (ennemis, combat, drops bruts, patterns de difficulté)
//   - Miroir   = atelier paisible sous timer (aucun ennemi pour MVP)

import { GAME_WIDTH, GAME_HEIGHT, PLAYER, WORLD } from '../config.js';
import { creerRng, niveauDangerEtage } from '../systems/WorldGen.js';
import {
    genererEtage, etageVersRegistry, etageDepuisRegistry, marquerVisite
} from '../systems/EtageGen.js';
import { ResonanceSystem } from '../systems/ResonanceSystem.js';
import { MondeSystem } from '../systems/MondeSystem.js';
import { InputSystem } from '../systems/InputSystem.js';
import { InventaireSystem } from '../systems/InventaireSystem.js';
import { EnemySystem } from '../systems/EnemySystem.js';
import { tirerItem, tirerConsommable, calculerStats } from '../systems/LootSystem.js';
import { GardeSystem } from '../systems/GardeSystem.js';
import { RevelationSystem } from '../systems/RevelationSystem.js';
import { calculerStatsForge, bonusResonanceMax, flagsExotiquesActifs } from '../systems/SystemeEffets.js';
import { tenterSort } from '../systems/SortSystem.js';
import { AuraItem } from '../render/entities/AuraItem.js';
import { estInstance } from '../systems/ScoreSystem.js';
import { TEMPLATES } from '../data/templatesItems.js';
import {
    defAvecRarete, modificateursDrop, dropSignature, TIERS
} from '../systems/RaritySystem.js';
import { COULEURS_FAMILLE, ITEMS } from '../data/items.js';
import { vestigePourEtage } from '../data/vestiges.js';
import { ENEMIES } from '../data/enemies/index.js';
import { definitionBoss } from '../data/boss.js';
import { ARCHETYPES, spawnDepuisPorte, directionOpposee } from '../data/archetypes.js';
import { TOPOGRAPHIES } from '../data/topographies.js';
import { Enemy } from '../entities/Enemy.js';
import { Boss } from '../entities/Boss.js';
import { Projectile } from '../entities/Projectile.js';
import { Obstacle } from '../entities/Obstacle.js';
import { EconomySystem } from '../systems/EconomySystem.js';
import { AncrageSystem } from '../systems/AncrageSystem.js';
import { NarrativeSystem } from '../systems/NarrativeSystem.js';
import { marquerSceau, EVT_SCEAU_OBTENU } from '../systems/SceauxSystem.js';
import { executerGeste } from '../systems/GesteSystem.js';
import { lancerCinematiqueFin } from '../systems/CinematiqueFusion.js';
import { FRAGMENTS } from '../data/fragments.js';
import { getAudioSystem } from '../systems/AudioSystem.js';
import {
    PALETTE_PRESENT, PALETTE_MIROIR, paletteDuMonde, DEPTH,
    poserVignette, poserParticulesAmbiance, tracerCourbeQuadratique
} from '../render/PainterlyRenderer.js';
import { paletteBiomePourId } from '../data/biomes.js';
import { peindreDecor } from '../render/DecorRegistry.js';
import { poserCiel, poserEtoilesOuPoussiere } from '../render/Parallaxe.js';
import { composerParallaxBiome } from '../render/biomes/index.js';
import { poserHaloJoueur, poserBrumeSol, poserRayonsLumiere } from '../render/AnimationsAmbiance.js';
import { peindreOrnementPlateforme } from '../render/PlateformeStyle.js';
import { JoueurVisuel } from '../render/entities/Joueur.js';
import { creerVisuelCoffre, jouerOuvertureCoffre, fermerCoffreVide } from '../render/entities/Coffre.js';
import { creerVisuelVortex } from '../render/entities/Vortex.js';
import { creerVisuelPorteSortie } from '../render/entities/PorteSortie.js';
import { creerVisuelConsommable, jouerRamassageConsommable } from '../render/entities/Consommable.js';
import { creerVisuelFondeur } from '../render/entities/Fondeur.js';
import { creerVisuelIdentifieur } from '../render/entities/Identifieur.js';
import { creerVisuelMarchand } from '../render/entities/Marchand.js';

// Labels affichés dans le HUD
const ARCHETYPES_LABELS = Object.fromEntries(
    Object.values(ARCHETYPES).map(a => [a.id, a.nom])
);
const TOPOGRAPHIES_LABELS = Object.fromEntries(
    Object.values(TOPOGRAPHIES).map(t => [t.id, t.nom])
);

// Seed du run : initialisée au premier démarrage et persistée dans le registry
// pour toute la durée du run (toutes les salles, transitions, basculements).
// Au prochain rechargement de la page, on tire une nouvelle seed → nouveau run.
const CLE_SEED_RUN = 'seed_run';

// Modèle d'étage (Phase A) — persistance du graphe et de la salle courante
const CLE_ETAGE_NUMERO = 'etage_courant';
const CLE_ETAGE_DATA = 'etage_data';
const CLE_SALLE_COURANTE = 'salle_courante_id';
const CLE_PORTE_ARRIVEE = 'porte_arrivee'; // direction par laquelle on arrive

// Couleurs spécifiques aux zones interactives (sortie/vortex), partagées
const COULEUR_SORTIE = 0xc8a85a; // doré
const COULEUR_VORTEX = 0x5ac8a8; // cyan-vert

const HAUTEUR_SOL = 40;
const BAISSE_MIROIR_DELAI_MS = 500;
const BAISSE_MIROIR_MONTANT = 1;
const BAISSE_PRESENT_DELAI_MS = 2000;

const CLE_POSITION_PENDANTE = 'position_pendante';

// Stats de base (avant équipement)
const STATS_BASE = {
    speed: PLAYER.SPEED,
    jumpVelocity: PLAYER.JUMP_VELOCITY,
    passiveMiroir: BAISSE_MIROIR_MONTANT,
    passivePresent: 0,
    bonusRetour: 20,
    // Combat
    attaqueDegats: 1,
    attaquePortee: 35,
    attaqueCooldown: 400,
    parryFenetre: 300,
    parryCooldown: 600,
    parryBonusResonance: 5
};

const DUREE_INVINCIBILITE_MS = 500;

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.transitionEnCours = false;
        // L'étage et la salle courante sont lus depuis le registry dans create().
        // Les data passées à scene.restart peuvent override (transition de salle).
        if (data?.salleId) {
            this.registry.set(CLE_SALLE_COURANTE, data.salleId);
        }
        if (data?.porteArrivee) {
            this.registry.set(CLE_PORTE_ARRIVEE, data.porteArrivee);
        } else if (data?.porteArrivee === null) {
            this.registry.remove(CLE_PORTE_ARRIVEE);
        }
    }

    create() {
        // --- Systèmes ---
        this.resonance = new ResonanceSystem(this.registry);
        // Wrapper "vulnérabilité" : projectile Reflux-Éclat applique flag
        // `_vulnerabiliteJusqu` au joueur → tout dgts reçu pendant la durée
        // est multiplié par 1.5. Monkey-patch unique sur l'instance Resonance.
        const _origPrendreDegats = this.resonance.prendreDegats.bind(this.resonance);
        this.resonance.prendreDegats = (montant) => {
            const vuln = (this.player?._vulnerabiliteJusqu ?? 0) > this.time.now;
            const montantEffectif = vuln ? Math.round(montant * 1.5) : montant;

            // Phase 5b.2 — Renaissance (Vestige Échos du Néant) : si le coup
            // amènerait à 0 et qu'on ne l'a pas encore utilisée ce run, on
            // bloque à 1 + invu 2 s + flash + marquage.
            const aRenaissance = this.inventaire.aVestigeFlag?.('renaissance');
            const dejaUtilisee = this.registry.get('renaissance_utilisee') === true;
            const actuelle = this.resonance.getValeur();
            if (aRenaissance && !dejaUtilisee && actuelle - montantEffectif <= 0 && actuelle > 0) {
                // On encaisse juste assez pour rester à 1
                _origPrendreDegats(actuelle - 1);
                this.registry.set('renaissance_utilisee', true);
                this.invincibleJusqu = this.time.now + 2000;
                this._jouerEffetRenaissance?.();
                return;
            }
            return _origPrendreDegats(montantEffectif);
        };
        this.monde = new MondeSystem(this.registry);
        this.inventaire = new InventaireSystem(this.registry);
        this.enemySystem = new EnemySystem(this.registry);
        this.economy = new EconomySystem(this.registry);
        this.inputSystem = new InputSystem(this);
        // Phase 6 — Garde + Revelation
        this.garde = new GardeSystem(this.registry);
        this.revelation = new RevelationSystem(this.registry, this.inventaire);

        // Phase 6 — Wrapper Garde devant prendreDegats : la Garde absorbe en
        // priorité. Le reste va à la Résonance.
        const _prendreDegatsAvantGarde = this.resonance.prendreDegats;
        this.resonance.prendreDegats = (montant) => {
            if (montant <= 0) return _prendreDegatsAvantGarde(montant);
            // SFX hurt : feedback dès qu'un coup est encaissé, que ce soit la
            // Garde ou la Résonance qui absorbe. (Pas joué pour montant <= 0
            // pour ne pas spammer sur les soins/no-op.)
            this.audio?.jouerSfx('hurt');
            const reste = this.garde.absorber(montant, this.time.now);
            if (reste > 0) _prendreDegatsAvantGarde(reste);
        };

        // --- Seed du run (random à la première salle, persistée ensuite) ---
        if (this.registry.get(CLE_SEED_RUN) === undefined) {
            this.registry.set(CLE_SEED_RUN, Math.floor(Math.random() * 0xFFFFFFFF));
            // Phase 5c.1 — marque qu'un run est actif (le bouton "Continuer"
            // du MenuScene s'en sert ; cleared à la victoire dans FinScene
            // et au démarrage d'une "Nouvelle partie").
            try { localStorage.setItem('vestige_run_actif_v1', 'true'); }
            catch (_e) { /* privacy → no-op */ }
        }
        const seedRun = this.registry.get(CLE_SEED_RUN);

        // --- Étage courant (charge depuis registry, ou génère le premier) ---
        let etageNumero = this.registry.get(CLE_ETAGE_NUMERO);
        if (etageNumero === undefined) {
            etageNumero = 1;
            this.registry.set(CLE_ETAGE_NUMERO, 1);
        }
        let etageData = this.registry.get(CLE_ETAGE_DATA);
        let etage = etageDepuisRegistry(etageData);
        if (!etage || etage.numero !== etageNumero) {
            etage = genererEtage(etageNumero, seedRun);
            this.registry.set(CLE_ETAGE_DATA, etageVersRegistry(etage));
            this.registry.remove(CLE_SALLE_COURANTE);
        }

        // Salle courante (default = entrée de l'étage)
        // En Miroir, on FORCE toujours la salle d'entrée (la Cité Marchande) —
        // pas d'exploration en Miroir, c'est un hub pur.
        let salleId = this.registry.get(CLE_SALLE_COURANTE);
        if (!salleId || !etage.salles.has(salleId)) {
            salleId = etage.salleEntreeId;
            this.registry.set(CLE_SALLE_COURANTE, salleId);
        }
        if (this.monde.getMonde() === 'miroir' && salleId !== etage.salleEntreeId) {
            salleId = etage.salleEntreeId;
            this.registry.set(CLE_SALLE_COURANTE, salleId);
        }
        const salle = etage.salles.get(salleId);

        // Marque la salle comme visitée + persiste
        marquerVisite(etage, salleId);
        this.registry.set(CLE_ETAGE_DATA, etageVersRegistry(etage));

        this.etage = etage;
        this.etageNumero = etageNumero;
        this.salleId = salleId;
        this.salle = salle;
        // Identifiant composé pour les clés persistantes (coffres, drops, ennemis)
        this.cleSalleEtage = `e${etageNumero}:${salleId}`;

        const mondeCourant = this.monde.getMonde();
        // Phase 6 — le compteur de visites Cité entre dans la sous-seed loot :
        // à chaque mort/retour, les drops changent (ennemis restent stables car
        // leur pool est seedé via une autre clé).
        const visitesCite = this.registry.get('cite_visites') ?? 0;
        this.rngLoot = creerRng(
            (seedRun ^ (etageNumero * 0x9E3779B9) ^ this._hashStr(salleId) ^
             (mondeCourant === 'miroir' ? 0xC2B2AE35 : 0) ^
             (visitesCite * 0x6A09E667)) >>> 0
        );

        // Phase 5b.2 — stats prennent en compte ITEMS + VESTIGES.
        const recalcStats = () => {
            this.statsEffectives = calculerStats(
                STATS_BASE,
                this.inventaire.getEquipement(),
                this.inventaire.getVestiges()
            );
            // Phase 6 — stats forge (Garde, vitesse attaque, hauteur saut, etc.)
            const forge = calculerStatsForge(this.inventaire.getEquipement());
            this.statsForge = forge.effectifs;
            this.flagsExo = flagsExotiquesActifs(this.inventaire.getEquipement());
            // Applique armure / vitesse attaque / parry / saut au statsEffectives legacy
            const armurePct = (forge.effectifs.armure ?? 0) / 100;
            this.armurePct = armurePct;
            if (forge.effectifs.attaqueVitesse) {
                const cdRid = (forge.effectifs.attaqueVitesse / 100);
                this.statsEffectives.attaqueCooldown = Math.max(80,
                    STATS_BASE.attaqueCooldown * (1 - cdRid));
            }
            if (forge.effectifs.parryFenetre) {
                this.statsEffectives.parryFenetre = STATS_BASE.parryFenetre + forge.effectifs.parryFenetre;
            }
            if (forge.effectifs.sautHauteur) {
                this.statsEffectives.jumpVelocity =
                    (this.statsEffectives.jumpVelocity ?? PLAYER.JUMP_VELOCITY) *
                    (1 + forge.effectifs.sautHauteur / 100);
            }
            if (forge.effectifs.attaqueDegats) {
                this.statsEffectives.attaqueDegats =
                    (this.statsEffectives.attaqueDegats ?? STATS_BASE.attaqueDegats) +
                    forge.effectifs.attaqueDegats;
            }
            // Met à jour la Garde
            this.garde.appliquerStats(forge.effectifs);
            // Rebornir la Résonance si max change (Cœur Pierreux : +20 + bonus exo)
            this._recomputerResonanceMax?.();
            // Phase 5b.2 — flag révélation totale (Œil Saigné) consulté par
            // IdentificationSystem.effetsEffectifs.
            this.registry.set(
                'vestige_revelation_totale',
                this.inventaire.aVestigeFlag?.('revelationTotale') === true
            );
        };
        recalcStats();
        this.registry.events.on('equipement:change', recalcStats);
        this.registry.events.on('vestiges:change', recalcStats);
        this.events.once('shutdown', () => {
            this.registry.events.off('equipement:change', recalcStats);
            this.registry.events.off('vestiges:change', recalcStats);
        });

        // --- HUD parallèle ---
        if (!this.scene.isActive('UIScene')) {
            this.scene.launch('UIScene');
        }

        // --- Palette + salle ---
        const enMiroir = mondeCourant === 'miroir';
        const niveau = niveauDangerEtage(etageNumero);
        // Phase 5' — la palette biome enrichit PALETTE_PRESENT au runtime.
        // En Miroir on garde la palette MIROIR pure (sanctuaire universel),
        // donc on n'expose la paletteBiome que côté Présent.
        const paletteBiome = enMiroir ? null : paletteBiomePourId(salle.biomeId);
        this.registry.set('biome_id_courant', salle.biomeId);
        this.registry.set('biome_palette_active', paletteBiome);
        // Drapeau lu par les composeurs biome pour adapter l'ambiance (mood
        // salle de boss : voile plus sombre, pluie forcée, feuilles off…).
        this.registry.set('salle_est_boss', !!salle.estBoss);
        const palette = paletteDuMonde(mondeCourant, paletteBiome);
        this.palette = palette;
        this.mondeCourant = mondeCourant;
        // Le ciel a son propre dégradé qui couvre le fond — on garde quand même
        // une couleur de secours sur la caméra au cas où une zone reste découverte.
        this.cameras.main.setBackgroundColor(palette.fond);

        // --- Bounds caméra & monde physique selon les dimensions de l'archétype ---
        this.physics.world.setBounds(0, 0, salle.dims.largeur, salle.dims.hauteur);
        this.cameras.main.setBounds(0, 0, salle.dims.largeur, salle.dims.hauteur);

        // --- Gouffre mortel : si la salle déclare gouffreMort, le joueur peut
        // tomber sous le sol (gouffres ouverts dans la géométrie) → mort instantanée.
        // Réservé Présent : en Miroir, jamais de chute mortelle (hub paisible).
        this._dimsSalle = salle.dims;
        this._gouffreMort = !enMiroir && salle.gouffreMort === true;
        this._mortGouffreEnCours = false;

        // --- COUCHES PARALLAX (du plus loin au plus proche) ---
        // Couche 1 (x0)    : ciel/abîme avec dégradé vertical, fixe à l'écran
        poserCiel(this, mondeCourant);
        // Étoiles ou poussière d'or sur le ciel (parallax x0.15)
        poserEtoilesOuPoussiere(this, salle.dims, mondeCourant);

        // Le rng du décor est seedé pour rester reproductible
        const rngDecor = creerRng((seedRun ^ 0x517CC1B7 ^ this._hashStr(salleId)) >>> 0);

        // Couches lointaines parallax — biome-spécifique en Présent (montagnes
        // brumeuses x0.15 + ruines spécifiques x0.3 + forêt morte x0.5 pour
        // les Ruines basses ; fallback générique sinon). En Miroir → silhouettes
        // urbaines génériques (Cité).
        composerParallaxBiome(this, salle.dims, mondeCourant, rngDecor, salle.biomeId);

        // Couche 3 (x0.7) : silhouettes proches + structures principales (DecorRegistry)
        // La salle d'entrée en Miroir est une CITÉ MARCHANDE — on enrichit le décor.
        const estCiteMarchande = enMiroir && salle.estEntree;
        peindreDecor(this, salle.archetype, salle.dims, mondeCourant, rngDecor, salle.plateformes, {
            estCiteMarchande,
            biomeId: salle.biomeId
        });

        // Particules d'ambiance par monde (poussière Présent, étincelles Miroir)
        poserParticulesAmbiance(this, salle.dims, mondeCourant);

        // Rayons de lumière obliques (Miroir uniquement)
        poserRayonsLumiere(this, salle.dims, mondeCourant);

        // --- Plateformes (avec ornement par-dessus) ---
        // On identifie le sol principal (plus large plateforme) pour lui donner
        // un traitement visuel plus riche (frise dorée Miroir, herbes Présent).
        let largeurMax = 0;
        for (const p of salle.plateformes) if (p.largeur > largeurMax) largeurMax = p.largeur;

        this.platforms = this.physics.add.staticGroup();
        this.oneWayPlatforms = this.physics.add.staticGroup();
        for (const p of salle.plateformes) {
            const couleur = p.oneWay
                ? this.eclaircir(palette.plateforme, 0.15)
                : palette.plateforme;
            const estSol = p.largeur === largeurMax;
            this.creerPlateforme(p.x, p.y, p.largeur, p.hauteur, couleur, p.oneWay, estSol);
        }

        // Brume au sol (Présent uniquement, après les plateformes pour être devant)
        poserBrumeSol(this, salle.dims, mondeCourant);

        // --- PNJs : tous les artisans dans la cité marchande (salle A en Miroir) ---
        // Doctrine : Présent = chasse, Miroir = atelier. Concentrer les 3 artisans
        // dans une salle stable donne au joueur un repère ("je sais où aller pour
        // transformer mes Fragments"). Pas de PNJ dans les autres salles.
        this.fondeurEntite = null;
        this.identifieurEntite = null;
        this.marchandEntite = null;
        if (estCiteMarchande) {
            const ySol = salle.dims.hauteur - HAUTEUR_SOL;
            // Positions fixes le long du sol : Fondeur à gauche (forge),
            // Identifieur au centre (autel de méditation), Marchand à droite.
            const xF = salle.dims.largeur * 0.30;
            const xI = salle.dims.largeur * 0.50;
            const xM = salle.dims.largeur * 0.72;
            this.fondeurEntite = creerVisuelFondeur(this, xF, ySol);
            this.identifieurEntite = creerVisuelIdentifieur(this, xI, ySol);
            this.marchandEntite = creerVisuelMarchand(this, xM, ySol);
        }

        // --- Joueur ---
        const positionPendante = this.registry.get(CLE_POSITION_PENDANTE);
        const porteArrivee = this.registry.get(CLE_PORTE_ARRIVEE);
        let spawn;
        if (positionPendante) {
            // Cas basculement Présent ↔ Miroir : on conserve la position exacte
            spawn = positionPendante;
            this.registry.remove(CLE_POSITION_PENDANTE);
        } else if (porteArrivee && salle.portes[porteArrivee]) {
            // Arrivée par une porte (transition entre salles voisines)
            spawn = spawnDepuisPorte(salle.portes[porteArrivee]);
            this.registry.remove(CLE_PORTE_ARRIVEE);
        } else {
            spawn = salle.spawnDefault;
        }

        // Rectangle physique invisible (porte la collision arcade)
        this.player = this.add.rectangle(spawn.x, spawn.y, PLAYER.WIDTH, PLAYER.HEIGHT, PLAYER.COLOR, 0);
        this.player.setAlpha(0);
        // Phase 6 — Mémorise le point d'entrée (sort tp_entree y retourne)
        this._posEntreeSalle = { x: spawn.x, y: spawn.y };
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);
        // Gouffre mortel : on étend les bounds du joueur vers le BAS via
        // setBoundsRectangle pour permettre la chute sous le canvas. La détection
        // dans update() (player.y > dims.hauteur + 30) déclenche le retour Cité.
        // NB : Phaser 3.70 n'a PAS Body.setBoundsCollision (uniquement sur World),
        // on passe par un Rectangle custom plus grand vers le bas.
        if (this._gouffreMort) {
            const d = this._dimsSalle;
            this.player.body.setBoundsRectangle(
                new Phaser.Geom.Rectangle(0, 0, d.largeur, d.hauteur + 200)
            );
        }
        this.physics.add.collider(this.player, this.platforms);

        // Visuel séparé : silhouette + cœur lumineux (suit la position du Rectangle)
        this.playerVisual = new JoueurVisuel(this);
        this.playerVisual.setPosition(this.player.x, this.player.y);

        // Halo lumineux qui suit le joueur en Miroir (le Vestige porte sa propre
        // lumière dans le passé)
        poserHaloJoueur(this, this.player, mondeCourant);

        // Collider one-way : le joueur peut sauter À TRAVERS par le bas (les
        // checkCollision sur les plateformes one-way bloquent les autres axes,
        // cf. creerPlateforme). Le processCallback permet le drop-through quand
        // le timer est actif.
        this.dropThroughJusqu = 0;
        this.physics.add.collider(this.player, this.oneWayPlatforms, null, () => {
            return this.time.now >= this.dropThroughJusqu;
        });

        // --- Système d'ancrage Ruines (touche A → pose plateforme) ---
        // Initialisé après les groupes physics + economy. initSalle indexe les
        // zones ancrables et dessine leurs silhouettes pulsantes.
        this.ancrage = new AncrageSystem(this, this.resonance);
        this.ancrage.initSalle(salle.zones ?? []);

        // --- Système narratif (monolithes Vestige, touche E → popup lore) ---
        // Lit les zones type 'vestige_lore' de la salle. État "lus" persisté
        // localStorage : 1ère lecture = drop Fragment Noir bonus.
        this.narrative = new NarrativeSystem(this, this.economy);
        this._zonesSalle = salle.zones ?? [];
        this.narrative.initSalle(this._zonesSalle);
        this._poserMonolithesLore(this._zonesSalle);

        // --- Caméra : 2 modes selon Phase 9 ─
        //   • Salle compacte (dimsCanvas) : caméra FIGÉE sur 0,0 → 960×540.
        //     La salle = l'écran. Pas de scroll, pas de follow, pas de zoom-out
        //     (rien à voir hors champ). Mode mini-Metroidvania Phase 9+.
        //   • Salle legacy (dims XL) : follow joueur + zoom-out TAB pour
        //     vue d'ensemble. Comportement historique Phase 8 et avant.
        const cam = this.cameras.main;
        if (salle.dimsCanvas) {
            cam.stopFollow();
            cam.setScroll(0, 0);
            cam.setZoom(1);
            this._zoomNormal = 1;
            this._zoomOut = 1;          // dézoom = pas d'effet (salle = écran)
            this._zoomCible = 1;
        } else {
            cam.startFollow(this.player, true, 0.1, 0.1);
            cam.setDeadzone(200, 150);
            cam.setZoom(1);
            this._zoomNormal = 1;
            // Cible de zoom-out : on prend le MIN entre fit-width et fit-height,
            // ce qui garantit qu'on VOIT la salle ENTIÈRE (quitte à exposer du
            // vide hors-monde sur l'axe minoritaire). C'est le bon compromis pour
            // les salles tall (puits) ET wide (chunks/handcrafted XL). Le vide
            // visible est gérable visuellement (vignette fade + parallax discret).
            const fitWidth  = cam.width  / salle.dims.largeur;
            const fitHeight = cam.height / salle.dims.hauteur;
            this._zoomOut = Math.min(Math.min(fitWidth, fitHeight), 1);
            this._zoomCible = this._zoomNormal;
        }

        // Direction de l'attaque
        this.lastDirection = 1;
        // Cooldowns
        this.cooldownAttaqueFin = 0;
        this.cooldownParryFin = 0;
        this.parryActifJusqu = 0;
        this.invincibleJusqu = 0;

        // --- Zones interactives ---
        // Portes : en Présent uniquement (le Miroir est un hub pur, on n'y
        // explore pas, on ne sort que par le vortex).
        this.portes = {};
        if (!enMiroir) {
            for (const dir of Object.keys(salle.portes)) {
                const porte = salle.portes[dir];
                this.portes[dir] = this._creerPorte(porte, salle, dir);
            }
        }
        // Vortex : uniquement en Miroir (retour Présent depuis la Cité).
        // En Présent, on ne peut PAS aller en Miroir volontairement — il faut
        // mourir (Résonance 0). Choix de design : la Cité est une récompense
        // de défaite, pas un bouton "save". Cible : finir les 10 étages avec
        // le moins de visites en Miroir possible.
        if (enMiroir) {
            this.creerVortex(salle.vortex, COULEUR_VORTEX);
        }

        // --- Coffre + drop sol ---
        if (salle.coffre && !this.inventaire.coffreEstOuvert(mondeCourant, this.cleSalleEtage)) {
            this.creerCoffre(salle.coffre);
        }
        if (salle.dropSol && !this.inventaire.dropEstRamasse(mondeCourant, this.cleSalleEtage)) {
            this.creerDropSol(salle.dropSol);
        }

        // --- Obstacles (pieux, ressorts, plateformes mobiles, vague 1+2) ---
        // Skip en Miroir : la Cité est un atelier paisible.
        this.obstacles = [];
        // État du "chant des cristaux" (Cristaux Glacés) : lien → expiration (ms).
        this._chantActif = {};
        // Group physics dédié pour les obstacles solides cassables (éboulis,
        // mur_fissure). Permet une collision bloquante + on garde une réf pour
        // les briser à l'attaque.
        this.obstaclesSolides = this.physics.add.staticGroup();
        if (!enMiroir && salle.obstacles?.length) {
            for (let idx = 0; idx < salle.obstacles.length; idx++) {
                const obsData = salle.obstacles[idx];
                // Skip si éboulis/mur_fissure DÉJÀ brisé dans cette salle (persisté
                // dans le registry pour survivre aux transit entre salles).
                const cleBrise = `eboulis:${this.cleSalleEtage}:${idx}`;
                if ((obsData.type === 'eboulis' || obsData.type === 'mur_fissure'
                     || obsData.type === 'mur_explosif' || obsData.type === 'mur_secret')
                    && this.registry.get(cleBrise) === true) continue;

                const obs = new Obstacle(this, obsData, salle.biomeId);
                if (!obs.sprite && obs.data.type !== 'anti_ancrage') continue;
                obs._cleBrise = cleBrise;
                this.obstacles.push(obs);

                const t = obs.data.type;
                if (t === 'pieu' || t === 'ressort') {
                    this.physics.add.overlap(this.player, obs.sprite, () =>
                        obs.onContactJoueur(this, this.player));
                } else if (t === 'plateforme_mobile') {
                    this.physics.add.collider(this.player, obs.sprite);
                } else if (t === 'eboulis' || t === 'mur_fissure' || t === 'mur_explosif' || t === 'mur_secret') {
                    // Bloquant : collision dure. Géré par obstaclesSolides (déjà ajouté
                    // par l'Obstacle dans _creerCassable via scene.obstaclesSolides).
                    this.physics.add.collider(this.player, obs.sprite);
                } else if (t === 'sol_effrite') {
                    // One-way + déclenchement effondrement au contact (atterrissage)
                    this.physics.add.collider(this.player, obs.sprite, () => {
                        // Seulement quand le joueur ATTERRIT dessus (vy ≥ 0 et touche down)
                        if (this.player.body.velocity.y >= 0) obs.onContactJoueur(this, this.player);
                    }, () => this.time.now >= this.dropThroughJusqu);
                } else if (t === 'roc_tombe') {
                    // Collider bloquant : le joueur ne passe pas au travers du roc.
                    // La callback applique aussi les dégâts en phase 'chute'.
                    this.physics.add.collider(this.player, obs.sprite, () =>
                        obs.onContactJoueur(this, this.player));
                } else if (t === 'plaque_pression') {
                    this.physics.add.overlap(this.player, obs.sprite, () =>
                        obs.onContactJoueur(this, this.player));
                } else if (t === 'racines_reflux') {
                    // Collider one-way en phase plateforme ; overlap dégât en phase pieu.
                    this.physics.add.collider(this.player, obs.sprite, null,
                        () => this.time.now >= this.dropThroughJusqu);
                    this.physics.add.overlap(this.player, obs.sprite, () =>
                        obs.onContactJoueur(this, this.player));
                } else if (t === 'brasier_mobile') {
                    // Zone d'overlap pure : dégâts seulement en phase 'feu'
                    // (gérée par onContactJoueur qui check this.brasierPhase).
                    this.physics.add.overlap(this.player, obs.sprite, () =>
                        obs.onContactJoueur(this, this.player));
                } else if (t === 'geyser_vapeur') {
                    // Zone d'overlap : dégâts + catapulte verticale en phase ON
                    this.physics.add.overlap(this.player, obs.sprite, () =>
                        obs.onContactJoueur(this, this.player));
                } else if (t === 'rideau_acide') {
                    // Zone d'overlap : dégâts continus
                    this.physics.add.overlap(this.player, obs.sprite, () =>
                        obs.onContactJoueur(this, this.player));
                } else if (t === 'bloc_charbon') {
                    // Dynamic body pushable : 3 colliders
                    //   1. bloc ↔ sol/platforms (gravité, repose dessus)
                    //   2. bloc ↔ joueur (push latéral)
                    //   3. bloc ↔ obstaclesSolides (s'il existe)
                    this.physics.add.collider(obs.sprite, this.platforms);
                    if (this.obstaclesSolides) {
                        this.physics.add.collider(obs.sprite, this.obstaclesSolides);
                    }
                    this.physics.add.collider(this.player, obs.sprite);
                } else if (t === 'marteau_pilon') {
                    // Sprite static qu'on déplace manuellement : overlap suffit
                    // (collide bloquant serait dangereux : le marteau pousserait le
                    // joueur hors limites pendant la chute)
                    this.physics.add.overlap(this.player, obs.sprite, () =>
                        obs.onContactJoueur(this, this.player));
                } else if (t === 'piston_thermique') {
                    // Bloquant en extension (sprite ajouté à obstaclesSolides)
                    // + overlap pour knockback à l'impact initial
                    this.physics.add.collider(this.player, obs.sprite, () =>
                        obs.onContactJoueur(this, this.player));
                } else if (t === 'scie_circulaire') {
                    // Zone d'overlap pure : dégâts continus (avec invincibilité)
                    this.physics.add.overlap(this.player, obs.sprite, () =>
                        obs.onContactJoueur(this, this.player));
                } else if (t === 'stalactite_resonance') {
                    // Collider bloquant (comme roc) : dégâts en phase 'chute'.
                    this.physics.add.collider(this.player, obs.sprite, () =>
                        obs.onContactJoueur(this, this.player));
                } else if (t === 'verglas' || t === 'faille_vide' || t === 'souffle_blizzard') {
                    // Zones d'overlap pures (effet glissant / drain / poussée)
                    this.physics.add.overlap(this.player, obs.sprite, () =>
                        obs.onContactJoueur(this, this.player));
                } else if (t === 'plateforme_resonance') {
                    // Plateforme intangible par défaut (body.enable=false) ;
                    // devient solide quand un cristal lié est frappé (setRevele).
                    this.physics.add.collider(this.player, obs.sprite);
                } else if (t === 'plateforme_miroir') {
                    // Plateforme qui clignote solide↔intangible (body.enable cyclé)
                    this.physics.add.collider(this.player, obs.sprite);
                } else if (t === 'laser_prisme') {
                    // Faisceau cyclique : overlap actif seulement en phase 'tir'
                    this.physics.add.overlap(this.player, obs.sprite, () =>
                        obs.onContactJoueur(this, this.player));
                }
                // faux_sol_miroir : intangible (pas de body), aucune physique.
                // cristal_resonant : pas de physique (frappé via tenterAttaque).
                // anti_ancrage : pas de sprite physique, lecture par AncrageSystem
            }
        }
        // Anti-ancrage : on injecte la liste dans le système
        this.ancrage?.setObstaclesAntiAncrage?.(
            this.obstacles.filter(o => o.data.type === 'anti_ancrage')
        );

        // --- Ennemis (Présent uniquement, hors salle d'entrée) ---
        // La salle d'entrée est le point de respawn après mort / sortie Miroir :
        // pas d'ennemis pour laisser au joueur le temps de se réorienter.
        this.enemies = [];
        this.projectiles = [];
        if (!enMiroir && !salle.estEntree && salle.ennemis?.length) {
            for (const e of salle.ennemis) {
                if (this.enemySystem.estMort('normal', this.cleSalleEtage, e.idx)) continue;
                const def = ENEMIES[e.enemyId];
                if (!def) continue;
                this._instancierEnnemi(def, e.x, e.y, e.idx, e.tier);
            }
        }

        // --- Boss (salle BOSS, Présent uniquement, si pas déjà tué) ---
        this.boss = null;
        this.bossVivant = false;
        if (!enMiroir && salle.estBoss &&
            !this.enemySystem.estMort('normal', this.cleSalleEtage, 'boss')) {
            const defBoss = definitionBoss(etageNumero, ENEMIES);
            if (defBoss) {
                const xBoss = salle.dims.largeur * 0.6;
                const yBoss = salle.dims.hauteur - HAUTEUR_SOL - defBoss.hauteur / 2;
                this.boss = new Boss(this, defBoss, xBoss, yBoss);
                this.boss.sprite.setDepth(DEPTH.ENTITES);
                if (defBoss.gravite) {
                    this.physics.add.collider(this.boss.sprite, this.platforms);
                }
                this.physics.add.overlap(this.player, this.boss.sprite, () => this.contactEnnemi(this.boss));
                this.enemies.push(this.boss);
                this.bossVivant = true;

                // Bandeau d'annonce
                const bandeau = this.add.text(GAME_WIDTH / 2, 90, defBoss.nom, {
                    fontFamily: 'serif', fontSize: '26px',
                    color: '#ff8060', stroke: '#000', strokeThickness: 4,
                    fontStyle: 'italic'
                }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(220);
                this.tweens.add({
                    targets: bandeau, alpha: { from: 1, to: 0 },
                    delay: 1800, duration: 800,
                    onComplete: () => bandeau.destroy()
                });
            }
        }

        // --- Hooks projectiles & boss events ---
        this._brancherEvenementsCombat();

        // Drop garanti au climax (niveau 3) — Bleu ou Noir uniquement
        this.climaxDropDu = !enMiroir && niveau === 3;

        // Phase 5b.2 — Si on entre dans la salle BOSS et qu'un Vestige est en
        // attente (drop manqué pour inventaire plein), on tente la récupération.
        if (!enMiroir && salle.estBoss) {
            this.time.delayedCall(200, () => this._tenterRecupererVestigePending?.());
        }

        // --- HUD textuel (fixe à l'écran avec setScrollFactor(0)) ---
        const labelMonde = enMiroir ? ' (Miroir)' : '';
        const labelDanger = !enMiroir ? ['Refuge', 'Calme', 'Tension', 'CLIMAX'][niveau] : '';
        const archetypeLabel = ARCHETYPES_LABELS[salle.archetype] ?? salle.archetype;
        const topoLabel = TOPOGRAPHIES_LABELS[salle.topographie] ?? salle.topographie;
        const labelBoss = salle.estBoss ? '  ·  ☠ SALLE DE BOSS' : '';
        const labelEntree = salle.estEntree ? '  ·  ENTRÉE' : '';

        this.add.text(10, 10,
            `Vestige — Étage ${etageNumero}${labelMonde}  ·  ${archetypeLabel} (${topoLabel})${labelBoss}${labelEntree}`,
            { fontFamily: 'monospace', fontSize: '14px', color: enMiroir ? '#f0c890' : '#e8e4d8' }
        ).setScrollFactor(0).setDepth(200);

        this.add.text(10, 30,
            'QD: bouger  ↑/Espace: sauter  S: descendre  X: attaque  C: parry  V: geste  E: interagir  I: inventaire  M: carte',
            { fontFamily: 'monospace', fontSize: '10px', color: '#8a8a9a' }
        ).setScrollFactor(0).setDepth(200);

        if (labelDanger && niveau >= 2) {
            this.add.text(10, 48, labelDanger, {
                fontFamily: 'monospace',
                fontSize: '11px',
                color: niveau === 3 ? '#ff8060' : '#c8a060',
                fontStyle: 'bold'
            }).setScrollFactor(0).setDepth(200);
        }

        // --- Vignette (overlay cinéma sombre aux bords, fixe à l'écran) ---
        // Réf gardée pour pouvoir la fader quand la caméra zoom-out (sinon
        // elle reste dimensionnée à 960×540 et apparaît comme un rectangle
        // sombre au centre une fois la vue élargie).
        this._vignette = poserVignette(this, 1);

        // --- Hooks selon le monde ---
        // Doctrine : Miroir = atelier paisible (pas de drain, pas de combat).
        //            Présent = chasse. La mort (Résonance 0) téléporte à la Cité.
        if (!enMiroir) {
            this.brancherBasculement();
            this.activerBaissePassive(false);
        }

        // --- Mort d'ennemi : drop éventuel + Sel + Fragment ---
        // Les ennemis spawnés (def.spawned=true, ex: mini-spectres pondés par
        // une Tombe Éclatée) ne sont PAS persistés — ils respawn à chaque
        // ponte, donc inutile de les marquer morts pour de bon.
        const handlerEnemyDead = (ennemi) => {
            if (!ennemi.def?.spawned) {
                this.enemySystem.marquerMort('normal', this.cleSalleEtage, ennemi.indexEnnemi);
            }
            this.peutEtreDrop(ennemi);
            this._dropEconomique(ennemi);
            // Phase 6 — procs exotiques sur kill (stackent avec count)
            if (this.flagsExo?.proc_soin_kill) {
                const f = this.flagsExo.proc_soin_kill;
                this.resonance.regagner((f.params.gain ?? 2) * f.count);
            }
            if (this.flagsExo?.proc_garde_kill) {
                const f = this.flagsExo.proc_garde_kill;
                this.garde?.restaurer((f.params.gain ?? 4) * f.count);
            }
            if (this.flagsExo?.proc_aoe_kill && ennemi.sprite) {
                const portee = this.flagsExo.proc_aoe_kill.params.portee ?? 80;
                const dmg = this.flagsExo.proc_aoe_kill.params.degats ?? 2;
                const cx = ennemi.sprite.x, cy = ennemi.sprite.y;
                for (const e of this.enemies) {
                    if (e === ennemi || e.mort || !e.sprite?.active) continue;
                    if (Phaser.Math.Distance.Between(cx, cy, e.sprite.x, e.sprite.y) <= portee) {
                        e.recevoirDegats(dmg);
                    }
                }
                const g = this.add.graphics().setDepth(80);
                g.setBlendMode(Phaser.BlendModes.ADD);
                g.fillStyle(0xffaa40, 0.5);
                g.fillCircle(cx, cy, portee);
                this.tweens.add({ targets: g, alpha: 0, scale: 1.3, duration: 280, onComplete: () => g.destroy() });
            }
        };
        this.events.on('enemy:dead', handlerEnemyDead);
        this.events.once('shutdown', () => this.events.off('enemy:dead', handlerEnemyDead));

        // --- Musique : sélection initiale + tick d'adaptation combat ---
        this._initialiserAudio(enMiroir);

        this.cameras.main.fadeIn(200, 0, 0, 0);
    }

    /**
     * Choisit le patch musical à l'entrée de la salle, puis lance un tick
     * périodique (250 ms) qui peut basculer combat/exploration selon la
     * proximité des ennemis vivants.
     *
     *   Miroir          → 'cite'   (constant, pas de combat)
     *   Présent + boss  → 'boss'   (tant que le boss est vivant)
     *   Présent + ennemi <320px → 'combat'
     *   Présent calme   → 'present' (retour 4s après le dernier ennemi proche)
     */
    _initialiserAudio(enMiroir) {
        this.audio = getAudioSystem(this);
        const initial = enMiroir ? 'cite'
            : (this.bossVivant ? 'boss' : 'present');
        this.audio.transitionVers(initial);

        // Petit indicateur de debug — affiche le patch musical courant.
        // À retirer une fois l'audio validé.
        this._labelPatchDebug = this.add.text(GAME_WIDTH - 10, 10, '', {
            fontFamily: 'monospace', fontSize: '10px',
            color: '#7080a0'
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(200);

        this._dernierCombatAt = 0;
        if (!enMiroir) {
            this._tickAudio = this.time.addEvent({
                delay: 250, loop: true, callback: () => this._evaluerPatchAudio()
            });
            this.events.once('shutdown', () => this._tickAudio?.remove());
        }
        // Refresh debug — boucle indépendante pour aussi montrer 'cite' en Miroir
        this._tickPatchLabel = this.time.addEvent({
            delay: 250, loop: true, callback: () => {
                if (!this._labelPatchDebug?.active) return;
                const id = this.audio?.getPatchActif() ?? '—';
                const pret = this.audio?.estPret() ? '' : ' (silencieux)';
                this._labelPatchDebug.setText(`♪ ${id}${pret}`);
            }
        });
        this.events.once('shutdown', () => this._tickPatchLabel?.remove());
    }

    _evaluerPatchAudio() {
        if (!this.audio || this._cinematiqueFinEnCours) return;

        // Boss prioritaire tant qu'il est en vie
        if (this.salle?.estBoss && this.boss && !this.boss.mort) {
            if (this.audio.getPatchActif() !== 'boss') this.audio.transitionVers('boss');
            return;
        }

        const enCombat = this._ennemiProche(320);
        const now = this.time.now;
        if (enCombat) {
            this._dernierCombatAt = now;
            if (this.audio.getPatchActif() !== 'combat') this.audio.transitionVers('combat');
        } else if (now - this._dernierCombatAt > 4000) {
            if (this.audio.getPatchActif() !== 'present') this.audio.transitionVers('present');
        }
    }

    _ennemiProche(distance) {
        if (!this.enemies || !this.player) return false;
        const d2 = distance * distance;
        for (const e of this.enemies) {
            if (!e || e.mort || !e.sprite?.active) continue;
            const dx = e.sprite.x - this.player.x;
            const dy = e.sprite.y - this.player.y;
            if (dx * dx + dy * dy < d2) return true;
        }
        return false;
    }

    update() {
        // Phase 5c — Pendant la cinématique de fin, on suspend toute la logique
        // d'input/combat/IA. Les tweens (joueur, Artefact, fade) tournent seuls.
        // Le visuel joueur continue de suivre le Rectangle physique pour
        // matcher le tween de position vers l'Artefact.
        if (this._cinematiqueFinEnCours) {
            if (this.playerVisual && this.player) {
                this.playerVisual.setPosition(this.player.x, this.player.y);
            }
            return;
        }

        this.inputSystem.update();
        const i = this.inputSystem.intentions;

        // --- Ancrage Ruines : pose une plateforme sur la zone ancrable proche ---
        if (i.ancrer && this.ancrage) {
            this.ancrage.tenterAncrage(this.player);
        }

        // --- Caméra : zoom-out fluide tant que N est maintenue ---
        if (this._zoomCible !== undefined) {
            this._zoomCible = i.zoomOutTenu ? this._zoomOut : this._zoomNormal;
            const cam = this.cameras.main;
            const z = cam.zoom;
            // Lerp ~200ms : facteur 0.12 par frame ≈ 0.5 atteint en ~14 frames @60fps
            const dz = (this._zoomCible - z) * 0.12;
            if (Math.abs(dz) > 0.0005) cam.setZoom(z + dz);
            else cam.setZoom(this._zoomCible);

            // Vignette : fade en fonction du zoom (à 1.0 = pleine, à zoomOut = 0).
            // Évite qu'elle apparaisse comme un cadre sombre rétréci au centre
            // quand on dézoome (elle est dimensionnée à la caméra d'origine).
            if (this._vignette) {
                const t = (cam.zoom - this._zoomOut) / Math.max(0.001, this._zoomNormal - this._zoomOut);
                this._vignette.setAlpha(Math.max(0, Math.min(1, t)));
            }
        }

        // --- Mouvement ---
        const body = this.player.body;
        const auSol = body.blocked.down || body.touching.down;
        const speed = this.statsEffectives.speed;
        const now = this.time.now;
        // Effet d'immobilisation (ex: web-spinner Cendre-Tisseuse). Bloque
        // déplacement + saut mais autorise attaque / parry / interaction.
        const immobilise = (this.player._immobiliseJusqu ?? 0) > now;
        // Effet glissant (Mousse / Soupir Glacial) — friction réduite quand
        // aucune input directionnelle n'est pressée.
        const surGlissant = (this.player._tileEffectGlissant ?? 0) > now;
        // Contrôles inversés (Polariseur) — swap gauche/droite
        const controleInverse = (this.player._controleInverseJusqu ?? 0) > now;
        const iGauche = controleInverse ? i.droite : i.gauche;
        const iDroite = controleInverse ? i.gauche : i.droite;
        // Gravité inversée (Inverseur de Gravité) — net = 0 (pesanteur nulle,
        // flottement) plutôt qu'une vraie force ascendante. Évite que le joueur
        // soit catapulté à grande vitesse hors du monde.
        const graviteInv = (this.player._graviteInverseJusqu ?? 0) > now;
        if (graviteInv && !this.player._graviteInverseeAppliquee) {
            const gWorld = this.physics.world.gravity.y;
            body.gravity.y = -gWorld;        // net = 0
            this.player._graviteInverseeAppliquee = true;
        } else if (!graviteInv && this.player._graviteInverseeAppliquee) {
            body.gravity.y = 0;
            this.player._graviteInverseeAppliquee = false;
        }

        // Phase 5b.2 — Pendant un dash (Sève d'Hydre), on court-circuite le
        // contrôle horizontal pour préserver la vélocité injectée par le Geste.
        const enDash = (this._dashJusqu ?? 0) > now;

        if (immobilise) {
            body.setVelocityX(0);
        } else if (enDash) {
            // Vélocité préservée — pas de write côté contrôles
        } else if (iGauche && !iDroite) {
            // Sur tile glissante, l'accélération est aussi sluggish
            if (surGlissant) {
                body.setVelocityX(body.velocity.x * 0.92 + (-speed) * 0.08);
            } else {
                body.setVelocityX(-speed);
            }
            this.lastDirection = -1;
        } else if (iDroite && !iGauche) {
            if (surGlissant) {
                body.setVelocityX(body.velocity.x * 0.92 + speed * 0.08);
            } else {
                body.setVelocityX(speed);
            }
            this.lastDirection = 1;
        } else if (surGlissant) {
            // Glissement quand input relâché : decay lent
            body.setVelocityX(body.velocity.x * 0.98);
        } else {
            body.setVelocityX(0);
        }

        // Souffle de blizzard (Cristaux Glacés) : poussée latérale constante
        // tant que le joueur est dans une zone de souffle. Lu après le set de
        // contrôle pour décaler la trajectoire (surtout en plein saut).
        if (!enDash && (this.player._blizzardJusqu ?? 0) > now) {
            body.setVelocityX(body.velocity.x + (this.player._blizzardForce ?? 0));
        }

        // Détection atterrissage : transition en l'air → au sol.
        // `_enLair` est mis à true ci-dessous quand le joueur saute OU sort
        // du sol sans sauter (chute du bord d'une plateforme).
        if (auSol && this._enLair) {
            this.audio?.jouerSfx('land');
            this._enLair = false;
        } else if (!auSol) {
            this._enLair = true;
        }

        // Phase 5b.2 — Double-saut (Vestige Voix Profonde) : 1 saut de plus
        // en l'air si flag actif. Reset au touche-sol.
        const aDoubleSaut = this.inventaire.aVestigeFlag?.('doubleSaut');
        if (auSol) {
            this.sautsRestants = aDoubleSaut ? 1 : 0;
        }
        if (i.sauter && !immobilise) {
            if (auSol) {
                body.setVelocityY(-this.statsEffectives.jumpVelocity);
                this.audio?.jouerSfx('jump');
                // Phase 6 — auto-révélation par usage (saut)
                this.revelation?.incrementer('sauts');
                // Proc "Pas du Vestige" : +1 Résonance par saut (stacke avec count)
                if (this.flagsExo?.proc_saut_resonance) {
                    const f = this.flagsExo.proc_saut_resonance;
                    this.resonance.regagner((f.params.gain ?? 1) * f.count);
                }
            } else if (this.sautsRestants > 0 && aDoubleSaut) {
                body.setVelocityY(-this.statsEffectives.jumpVelocity * 0.92);
                this.sautsRestants--;
                this.audio?.jouerSfx('jump');
                this._jouerEffetDoubleSaut?.();
            }
        }

        // --- Drop-through (descendre via plateforme one-way) ---
        // À l'appui de S/↓, on désactive la collision avec les one-way pendant 200 ms,
        // ce qui fait tomber le joueur à travers la corniche sur laquelle il est.
        if (i.descendreEdge && auSol) {
            this.dropThroughJusqu = this.time.now + 200;
        }

        // --- Combat ---
        if (i.attaquer) this.tenterAttaque();
        if (i.parry) this.tenterParry();
        if (i.geste) this._tenterGeste?.();
        // i.sort : hook réservé, pas d'effet en étape 7

        // Phase 6 — Sorts 1/2/3 (tête/corps/accessoire)
        if (i.sort1) tenterSort(this, 0);
        if (i.sort2) tenterSort(this, 1);
        if (i.sort3) tenterSort(this, 2);

        // --- Interactions / inventaire / carte ---
        if (i.interagir) this.essayerInteragir();
        if (i.ouvrirInventaire && !this.scene.isActive('InventaireScene')) {
            this.scene.pause();
            this.scene.launch('InventaireScene');
        }
        if (i.ouvrirCarte && !this.scene.isActive('MapScene')) {
            this.scene.pause();
            this.scene.launch('MapScene');
        }

        // --- Debug Résonance ---
        if (i.degatTest) this.resonance.prendreDegats(10);
        if (i.healTest) this.resonance.regagner(10);

        // --- Update des ennemis ---
        for (const e of this.enemies) e.update(this.player);

        // --- Update des projectiles + nettoyage ---
        for (const p of this.projectiles) p.update(this.player);
        this.projectiles = this.projectiles.filter(p => !p.detruit);

        // --- Update des obstacles (plateformes mobiles oscillent) ---
        for (const o of this.obstacles) o.update();

        // --- Gouffres mortels (salle.gouffreMort = true) ---
        // Si le joueur est tombé sous le bottom de la salle (gouffre du sol non
        // continu), on inflige mort = retour Cité Miroir. Le joueur a chuté dans
        // l'abîme : tu refais ton run depuis la Cité.
        if (this._gouffreMort && this.player.y > this._dimsSalle.hauteur + 30) {
            this._declencherMortGouffre();
        }

        // --- Ennemis tombés dans la fosse mortelle ---
        // Mort silencieuse (pas de drop, pas d'event 'enemy:dead') : ils sont
        // simplement engloutis par l'abîme. Évite d'avoir des ennemis qui
        // se baladent dans la fosse mortelle au lieu de mourir comme le joueur.
        if (this._gouffreMort && this.enemies) {
            const seuilMort = this._dimsSalle.hauteur + 30;
            for (const e of this.enemies) {
                if (e.mort || !e.sprite) continue;
                if (e.sprite.y > seuilMort) {
                    e.mort = true;
                    if (e.sprite.body) e.sprite.body.enable = false;
                    e.sprite.destroy();
                    e.visual?.destroy();
                }
            }
        }

        // --- Update du visuel joueur ---
        if (this.playerVisual) {
            this.playerVisual.setPosition(this.player.x, this.player.y);
            this.playerVisual.setDirection(this.lastDirection);
            this.playerVisual.setEtat({
                auSol,
                vx: this.player.body.velocity.x,
                vy: this.player.body.velocity.y
            });
        }

        // --- Phase 6 — Garde tick + Aura visuelle ---
        const dtMs = this.game.loop.delta || 16;
        this.garde?.tick(dtMs, this.time.now);
        if (!this._auraItem && this.player) {
            this._auraItem = new AuraItem(this, this.player);
        }
        this._auraItem?.update(this.inventaire.getEquipement(), this.time.now);
    }

    // ============================================================
    // COMBAT
    // ============================================================
    tenterAttaque() {
        const now = this.time.now;
        if (now < this.cooldownAttaqueFin) return;
        this.cooldownAttaqueFin = now + Math.max(100, this.statsEffectives.attaqueCooldown);
        // Track le dernier moment d'attaque (lu par Reflet-Double 3d)
        this.lastAttaqueAt = now;

        const portee = this.statsEffectives.attaquePortee;
        const dir = this.lastDirection;
        const hx = this.player.x + dir * (PLAYER.WIDTH / 2 + portee / 2);
        const hy = this.player.y;

        // === SLASH COURBE 3 COUCHES (Bézier quadratique) ===
        // Trois couches concentriques avec une courbe Bézier (traceur custom)
        // donnent un arc fluide au lieu d'un V cassant. Couleurs additives.
        const tracerCourbe = (g, lineWidth, couleur, alpha, decalage) => {
            g.lineStyle(lineWidth, couleur, alpha);
            tracerCourbeQuadratique(
                g,
                dir * 8, -PLAYER.HEIGHT / 2 - decalage,
                dir * (portee + PLAYER.WIDTH / 2 + decalage), 0,
                dir * 8, PLAYER.HEIGHT / 2 + decalage
            );
        };

        const slashOuter = this.add.graphics();
        slashOuter.x = this.player.x;
        slashOuter.y = this.player.y;
        slashOuter.setDepth(DEPTH.EFFETS);
        slashOuter.setBlendMode(Phaser.BlendModes.ADD);
        tracerCourbe(slashOuter, 16, 0xffd070, 0.3, 6);

        const slashMid = this.add.graphics();
        slashMid.x = this.player.x;
        slashMid.y = this.player.y;
        slashMid.setDepth(DEPTH.EFFETS);
        slashMid.setBlendMode(Phaser.BlendModes.ADD);
        tracerCourbe(slashMid, 7, 0xffffff, 0.75, 2);

        const slashCore = this.add.graphics();
        slashCore.x = this.player.x;
        slashCore.y = this.player.y;
        slashCore.setDepth(DEPTH.EFFETS);
        slashCore.setBlendMode(Phaser.BlendModes.ADD);
        tracerCourbe(slashCore, 2.5, 0xffffff, 1, 0);

        this.tweens.add({
            targets: [slashOuter, slashMid, slashCore],
            scaleX: { from: 0.55, to: 1.2 },
            scaleY: { from: 1.15, to: 0.85 },
            alpha: { from: 1, to: 0 },
            duration: 240,
            ease: 'Cubic.Out',
            onComplete: () => {
                slashOuter.destroy(); slashMid.destroy(); slashCore.destroy();
            }
        });

        // === Pluie d'étincelles colorées ===
        if (this.textures.exists('_particule')) {
            const burst = this.add.particles(hx, hy, '_particule', {
                lifespan: 380,
                speed: { min: 110, max: 280 },
                angle: dir > 0 ? { min: -65, max: 65 } : { min: 115, max: 245 },
                scale: { start: 0.55, end: 0 },
                tint: [0xffffff, 0xffd070, 0xff8040, 0xffd070],
                quantity: 14,
                blendMode: Phaser.BlendModes.ADD,
                alpha: { start: 1, end: 0 }
            });
            burst.setDepth(DEPTH.EFFETS);
            burst.explode(14);
            this.time.delayedCall(420, () => burst.destroy());
        }

        // Test des ennemis dans la zone — on note si on a touché pour le hit feedback
        let degats = this.statsEffectives.attaqueDegats;
        // Phase 6 — signatures : Serment du Vide (à 0 Garde, +35%)
        if (this.flagsExo?.sig_serment_vide && this.garde?.getValeur() === 0) {
            degats *= (1 + (this.flagsExo.sig_serment_vide.params.bonusPct ?? 0.35));
        }
        // Phase 6 — signature Serment du Dernier Souffle (sous 20 PV, +100%)
        if (this.flagsExo?.sig_dernier_souffle && this.resonance.getValeur() <= (this.flagsExo.sig_dernier_souffle.params.seuilPv ?? 20)) {
            degats *= (1 + (this.flagsExo.sig_dernier_souffle.params.bonusPct ?? 1.0));
        }
        const halfH = PLAYER.HEIGHT / 2 + 4;
        let aTouche = false;
        let dernierToucheRef = null;
        for (const e of this.enemies) {
            if (e.mort || !e.sprite.active) continue;
            const dx = Math.abs(e.sprite.x - hx);
            const dy = Math.abs(e.sprite.y - hy);
            if (dx < portee / 2 + e.def.largeur / 2 && dy < halfH + e.def.hauteur / 2) {
                e.recevoirDegats(degats);
                aTouche = true;
                dernierToucheRef = e.sprite;
                // Phase 6 — proc double attaque (12 % chance second hit)
                if (this.flagsExo?.proc_double_attaque && Math.random() < (this.flagsExo.proc_double_attaque.params.chance ?? 0.12)) {
                    this.time.delayedCall(80, () => {
                        if (!e.mort && e.sprite.active) e.recevoirDegats(degats);
                    });
                }
                // Phase 6 — vol de Résonance (stacke)
                if (this.flagsExo?.proc_vol_resonance) {
                    const f = this.flagsExo.proc_vol_resonance;
                    this.resonance.regagner((f.params.gain ?? 0.5) * f.count);
                }
            }
        }
        if (dernierToucheRef) this._dernierEnnemiTouche = dernierToucheRef;
        if (aTouche) this.revelation?.incrementer('hits');

        // ─── Obstacles cassables (éboulis, mur fissuré) ────────────────
        // Même zone d'attaque que pour les ennemis. Si touchés, on les
        // amoche d'1 hp. Quand hp=0, briser() émet drop events + clean up.
        if (this.obstacles) {
            for (const o of this.obstacles) {
                if (!o.sprite || !o.sprite.active) continue;
                if (o.data.type !== 'eboulis' && o.data.type !== 'mur_fissure'
                    && o.data.type !== 'mur_explosif' && o.data.type !== 'mur_secret') continue;
                const dx = Math.abs(o.sprite.x - hx);
                const dy = Math.abs(o.sprite.y - hy);
                const ow = o.sprite.width  ?? 60;
                const oh = o.sprite.height ?? 60;
                if (dx < portee / 2 + ow / 2 && dy < halfH + oh / 2) {
                    o.subirDegats(1);
                    aTouche = true;
                }
            }
        }

        // ─── Cristaux Glacés : le bruit de l'attaque réveille la cité ──────
        // Stalactites de Résonance : toute attaque dans leur rayon de bruit
        // (autour du JOUEUR, le son rayonne) les décroche.
        // Cristaux Résonants : frappés directement → chant qui révèle les
        // plateformes liées.
        if (this.obstacles) {
            for (const o of this.obstacles) {
                if (!o.sprite) continue;
                if (o.data.type === 'stalactite_resonance' && o.stalPhase === 'repos') {
                    const rayon = o.data.rayonBruit ?? o.def.rayonBruit;
                    const dxs = o.sprite.x - this.player.x;
                    const dys = o.sprite.y - this.player.y;
                    if (dxs * dxs + dys * dys <= rayon * rayon) o.declencherChuteBruit();
                } else if (o.data.type === 'cristal_resonant') {
                    const dx = Math.abs(o.sprite.x - hx);
                    const dy = Math.abs(o.sprite.y - hy);
                    const ow = o.sprite.width ?? 34, oh = o.sprite.height ?? 52;
                    if (dx < portee / 2 + ow / 2 && dy < halfH + oh / 2) {
                        this._activerChant(o.data.lien);
                        o.declencherChant();
                        aTouche = true;
                    }
                }
            }
        }

        // === HIT FEEDBACK — c'est ici que ça devient jouissif ===
        if (aTouche) {
            // 0. SFX d'impact
            this.audio?.jouerSfx('hit');

            // 1. Screen shake court et sec
            this.cameras.main.shake(110, 0.006);

            // 2. Hit-stop : on freeze le timer de la scène pendant 60 ms.
            //    Crée une sensation d'impact (la frame "se fige" sur le contact).
            const ts = this.time.timeScale;
            this.time.timeScale = 0.05;
            this.tweens.timeScale = 0.05;
            setTimeout(() => {
                this.time.timeScale = ts;
                this.tweens.timeScale = 1;
            }, 60);

            // 3. Flash écran ultra bref (overlay blanc 12% pendant 80ms)
            const flash = this.add.rectangle(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                this.cameras.main.width,
                this.cameras.main.height,
                0xffffff, 0.12
            ).setScrollFactor(0).setDepth(199);
            this.tweens.add({
                targets: flash,
                alpha: 0,
                duration: 90,
                onComplete: () => flash.destroy()
            });

            // 4. Particules supplémentaires concentriques au centre du hit
            if (this.textures.exists('_particule')) {
                const impact = this.add.particles(hx, hy, '_particule', {
                    lifespan: 280,
                    speed: { min: 60, max: 140 },
                    angle: { min: 0, max: 360 },
                    scale: { start: 0.6, end: 0 },
                    tint: [0xffffff, 0xffd070],
                    quantity: 10,
                    blendMode: Phaser.BlendModes.ADD,
                    alpha: { start: 1, end: 0 }
                });
                impact.setDepth(DEPTH.EFFETS);
                impact.explode(10);
                this.time.delayedCall(320, () => impact.destroy());
            }
        }
    }

    tenterParry() {
        const now = this.time.now;
        if (now < this.cooldownParryFin) return;
        // Lock parry par Annihilateur (Phase 3f) — touche C désactivée temporairement
        if ((this.player._parryLockJusqu ?? 0) > now) {
            this.afficherMessageFlottant?.('PARRY VERROUILLÉ', '#a040c0');
            return;
        }
        const fenetre = this.statsEffectives.parryFenetre;
        this.cooldownParryFin = now + this.statsEffectives.parryCooldown;
        this.parryActifJusqu = now + fenetre;
        this.audio?.jouerSfx('parry');

        // === Anneau doré qui s'élargit autour du joueur (signal du déclenchement) ===
        const ring = this.add.graphics();
        ring.x = this.player.x;
        ring.y = this.player.y;
        ring.setDepth(DEPTH.EFFETS);
        ring.setBlendMode(Phaser.BlendModes.ADD);
        ring.lineStyle(4, 0xffd070, 1);
        ring.strokeCircle(0, 0, 18);
        ring.lineStyle(8, 0xc8a85a, 0.4);
        ring.strokeCircle(0, 0, 14);
        this.tweens.add({
            targets: ring,
            scale: { from: 0.5, to: 1.8 },
            alpha: { from: 1, to: 0 },
            duration: fenetre,
            ease: 'Cubic.Out',
            onComplete: () => ring.destroy()
        });

        // === Halo qui suit le joueur pendant la fenêtre (attente de parade) ===
        const halo = this.add.graphics();
        halo.setDepth(DEPTH.EFFETS - 1);
        halo.setBlendMode(Phaser.BlendModes.ADD);
        halo.fillStyle(0xc8a85a, 0.45);
        halo.fillCircle(0, 0, 26);
        halo.fillStyle(0xffd070, 0.55);
        halo.fillCircle(0, 0, 14);
        halo.setPosition(this.player.x, this.player.y);

        const updHalo = () => {
            if (!halo.active) return;
            halo.setPosition(this.player.x, this.player.y);
        };
        this.events.on('postupdate', updHalo);

        this.tweens.add({
            targets: halo,
            alpha: 0,
            duration: fenetre,
            onComplete: () => {
                this.events.off('postupdate', updHalo);
                halo.destroy();
            }
        });
    }

    /**
     * Phase 5b.2 — Recalcule le max de Résonance selon les Vestiges équipés
     * (Cœur Pierreux : +20). Le registre `resonance_max` est lu par
     * ResonanceSystem (clamp) et par UIScene (affichage). Appelé à chaque
     * change d'équipement / vestige via le handler `vestiges:change`.
     */
    _recomputerResonanceMax() {
        const bonus = this.statsEffectives?.resonanceMax ?? 0;
        // Phase 6 — bonus exotique mod_resonance_max
        const bonusExo = bonusResonanceMax(this.inventaire.getEquipement());
        this.resonance?.setMaxEffectif(100 + bonus + bonusExo);
    }

    /**
     * Phase 5b.2 — Déclenche le Geste équipé en slot Vestige (touche V).
     * Cooldown propre à chaque Geste. Aucun effet si pas de Vestige Geste
     * équipé, ou si toujours en cooldown.
     */
    _tenterGeste() {
        const vestiges = this.inventaire.getVestiges();
        const id = vestiges?.geste;
        if (!id) return;
        const vestige = this.inventaire.getVestigesDefs()[0]; // slot 0 = geste
        if (!vestige?.geste?.code) return;

        const now = this.time.now;
        if (now < (this.cooldownGesteFin ?? 0)) return;
        this.cooldownGesteFin = now + (vestige.geste.cooldownMs ?? 1000);

        const ok = executerGeste(vestige.geste.code, this, this.player, vestige.geste.params ?? {});
        if (ok) {
            this.afficherMessageFlottant?.(`${vestige.nom}`, '#ff8060');
        }
    }

    /**
     * Phase 5b.2 — Effet visuel + message pour Renaissance (un coup fatal
     * annulé). Halo cramoisi expansif autour du joueur + texte poétique.
     */
    _jouerEffetRenaissance() {
        this.afficherMessageFlottant?.('✦ Renaissance', '#ff80a0');
        const halo = this.add.graphics();
        halo.x = this.player.x;
        halo.y = this.player.y;
        halo.setDepth(DEPTH.EFFETS + 2);
        halo.setBlendMode(Phaser.BlendModes.ADD);
        halo.fillStyle(0xff4060, 0.85);
        halo.fillCircle(0, 0, 48);
        halo.fillStyle(0xffffff, 0.7);
        halo.fillCircle(0, 0, 22);
        this.tweens.add({
            targets: halo,
            scale: { from: 0.3, to: 3 },
            alpha: { from: 1, to: 0 },
            duration: 700,
            ease: 'Cubic.Out',
            onComplete: () => halo.destroy()
        });
        this.cameras?.main?.shake(300, 0.012);
    }

    /**
     * Phase 5b.2 — Effet visuel du double-saut (Voix Profonde). Petit anneau
     * éphémère sous le joueur qui marque l'élan additionnel.
     */
    _jouerEffetDoubleSaut() {
        const ring = this.add.graphics();
        ring.x = this.player.x;
        ring.y = this.player.y + 18;
        ring.setDepth(DEPTH.EFFETS);
        ring.setBlendMode(Phaser.BlendModes.ADD);
        ring.lineStyle(2.5, 0x60d0ff, 1);
        ring.strokeCircle(0, 0, 14);
        ring.fillStyle(0xa0e0ff, 0.4);
        ring.fillCircle(0, 0, 10);
        this.tweens.add({
            targets: ring,
            scale: { from: 0.5, to: 2 },
            alpha: { from: 1, to: 0 },
            duration: 320,
            ease: 'Cubic.Out',
            onComplete: () => ring.destroy()
        });
    }

    /**
     * Effet visuel renforcé pour un parry réussi : flash expansif + burst doré.
     */
    _jouerEffetParryReussi() {
        // Event scene-level pour que les biomes (ex: brume réactive Ruines basses)
        // puissent réagir au parry. Émis une seule fois par parry quel que soit
        // le call site (cf. les 3 appels à _jouerEffetParryReussi dans ce fichier).
        this.events.emit('parry:success', { x: this.player.x, y: this.player.y });

        // Flash expansif additif
        const flash = this.add.graphics();
        flash.x = this.player.x;
        flash.y = this.player.y;
        flash.setDepth(DEPTH.EFFETS);
        flash.setBlendMode(Phaser.BlendModes.ADD);
        flash.fillStyle(0xffd070, 0.85);
        flash.fillCircle(0, 0, 38);
        flash.fillStyle(0xffffff, 0.7);
        flash.fillCircle(0, 0, 22);
        this.tweens.add({
            targets: flash,
            scale: { from: 0.4, to: 2.4 },
            alpha: { from: 1, to: 0 },
            duration: 320,
            ease: 'Cubic.Out',
            onComplete: () => flash.destroy()
        });

        // Burst de particules dorées explosif
        if (this.textures.exists('_particule')) {
            const burst = this.add.particles(this.player.x, this.player.y, '_particule', {
                lifespan: 480,
                speed: { min: 80, max: 220 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.6, end: 0 },
                tint: [0xffd070, 0xc8a85a, 0xffffff],
                quantity: 14,
                blendMode: Phaser.BlendModes.ADD,
                alpha: { start: 1, end: 0 }
            });
            burst.setDepth(DEPTH.EFFETS);
            burst.explode(14);
            this.time.delayedCall(520, () => burst.destroy());
        }

        // Phase 5b.2 — Slow-mo Parry (Vestige Voile-Tisseuse) : ralentit le
        // monde 1500 ms après chaque parry réussi. Anti-spam : 4000 ms entre
        // deux déclenchements possibles (lisible et puissant sans être abusable).
        if (this.inventaire.aVestigeFlag?.('slowMoParry')) {
            const now = this.time.now;
            if (now >= (this._slowMoFin ?? 0) + 4000) {
                this._declencherSlowMoParry();
            }
        }
    }

    /**
     * Phase 5b.2 — Ralentit la physique mondiale pendant 1500 ms après un
     * parry réussi (flag slowMoParry actif). FX overlay bleu-violet subtil.
     */
    _declencherSlowMoParry() {
        const dureeMs = 1500;
        const facteur = 0.35;
        this.physics.world.timeScale = 1 / facteur;  // Phaser : timeScale > 1 = ralenti
        this._slowMoFin = this.time.now + dureeMs;

        // Overlay bleu-violet diffus pendant la durée
        const overlay = this.add.rectangle(
            this.cameras.main.midPoint.x, this.cameras.main.midPoint.y,
            GAME_WIDTH * 3, GAME_HEIGHT * 3,
            0x4040ff, 0.18
        );
        overlay.setBlendMode(Phaser.BlendModes.MULTIPLY);
        overlay.setScrollFactor(0);
        overlay.setDepth(DEPTH.EFFETS + 5);
        this.tweens.add({
            targets: overlay,
            alpha: 0,
            duration: dureeMs,
            onComplete: () => overlay.destroy()
        });

        this.time.delayedCall(dureeMs, () => {
            this.physics.world.timeScale = 1;
        });
    }

    estParryActif() {
        return this.time.now < this.parryActifJusqu;
    }

    contactEnnemi(ennemi) {
        if (ennemi.mort) return;
        const now = this.time.now;
        if (now < this.invincibleJusqu) return;

        // Parry actif : on annule les dégâts + bonus Résonance + effet expansif doré
        // EXCEPTION : les Anti-Parry (Voile, Phase 3e) ne sont pas parryables.
        if (this.estParryActif() && !ennemi.def?.parryImmune) {
            this.parryActifJusqu = 0;
            this.resonance.regagner(this.statsEffectives.parryBonusResonance);
            this.afficherMessageFlottant('PARRY', '#ffd070');
            this._jouerEffetParryReussi();
            // L'ennemi est repoussé visuellement par le parry (squash inverse)
            ennemi.jouerAttaqueContact(this, this.player);
            // Phase 6 — révélation par usage + procs parry
            this.revelation?.incrementer('parries');
            if (this.flagsExo?.proc_gel_parry && Math.random() < (this.flagsExo.proc_gel_parry.params.chance ?? 0.15)) {
                ennemi._geleJusqu = this.time.now + (this.flagsExo.proc_gel_parry.params.duree ?? 1200);
                ennemi.sprite?.body?.setVelocity(0, 0);
            }
            if (this.flagsExo?.proc_parry_aoe) {
                const portee = this.flagsExo.proc_parry_aoe.params.portee ?? 100;
                const dmg = this.flagsExo.proc_parry_aoe.params.degats ?? 4;
                for (const e of this.enemies) {
                    if (e.mort || !e.sprite?.active) continue;
                    if (Phaser.Math.Distance.Between(this.player.x, this.player.y, e.sprite.x, e.sprite.y) <= portee) {
                        e.recevoirDegats(dmg);
                    }
                }
            }
            return;
        }

        // Animation d'attaque ennemi (lunge / pulse + flash + particules d'impact)
        ennemi.jouerAttaqueContact(this, this.player);

        // Dégâts + invincibilité — Phase 6 : armure (réduction %), invu sort
        if ((this._invuJusqu ?? 0) > now || (this._invisibleJusqu ?? 0) > now) return;
        let degatsRecu = ennemi.def.degatsContact;
        const armurePct = this.armurePct ?? 0;
        const reductionBuff = this._buffArmurePct ?? 0;
        const reductionTotale = Math.min(0.85, armurePct + reductionBuff);
        degatsRecu = Math.max(1, degatsRecu * (1 - reductionTotale));
        this.resonance.prendreDegats(degatsRecu);
        this.invincibleJusqu = now + DUREE_INVINCIBILITE_MS;
        this.flashJoueur(0xff6060);
    }

    flashJoueur(couleur) {
        // Le rectangle physique est invisible — on flash le visuel à la place.
        if (!this.playerVisual) return;
        if (couleur === 0xff6060) this.playerVisual.flashRouge();
        else this.playerVisual.flashBlanc();
    }

    // ============================================================
    // DROPS
    // ============================================================
    /**
     * À la mort d'un ennemi : Sel garanti + Fragment selon proba.
     * La famille est lue depuis `def.familleFragment` (cf. data/enemies.js).
     * Boss : pluie de Sel + Fragment garanti de la bonne famille.
     * Phase 3g : tier de rareté ajoute des bonus (sel, fragments, item garanti).
     */
    _dropEconomique(ennemi) {
        const estBoss = !!ennemi.estBoss;
        const tier = ennemi.def?.rarete ?? TIERS.COMMUN;
        const mod = modificateursDrop(tier);

        // Sel garanti — boss multiplié par 5, bonus tier additif
        const base = 2 + Math.floor(this.rngLoot() * 4);
        const sel = (estBoss ? base * 5 : base) + (mod.selBonus ?? 0);
        this.economy.ajouterSel(sel);

        // Fragment : 35 % en normal, 100 % pour un boss, 100 % si tier le garantit
        const probaFrag = estBoss ? 1 : (mod.fragmentGaranti ? 1 : 0.35);
        const drapFragment = this.rngLoot() < probaFrag;
        if (drapFragment) {
            const famille = ennemi.def.familleFragment ?? 'blanc';
            const nb = (estBoss ? 3 : 1) + (mod.nbFragmentsBonus ?? 0);
            this.economy.ajouterFragment(famille, nb);
            const couleur = FRAGMENTS[`fragment_${famille}`].couleur;
            const couleurCss = '#' + couleur.toString(16).padStart(6, '0');
            this.afficherMessageFlottant(`+${nb} Fragment ${famille}`, couleurCss);
        } else {
            this.afficherMessageFlottant(`+${sel} Sel`, '#e8e4d8');
        }

        // Drop item garanti pour Rare/Légendaire (en plus du fragment ci-dessus)
        if (mod.tierItemMin != null) {
            const signature = (tier === TIERS.LEGENDAIRE) ? dropSignature(ennemi, this) : null;
            if (signature) {
                this._appliquerSignatureDrop(signature);
            } else {
                this._dropItemTierMin(mod.tierItemMin, tier);
            }
        }
    }

    /**
     * Drop d'item garanti — tire un item de famille pondérée par le monde
     * (cf. tirerItem) et filtre par tier minimum. L'item entre directement
     * dans l'inventaire avec un message coloré par tier.
     */
    _dropItemTierMin(tierMin, tierEnnemi) {
        // Phase 6 — tous les drops sont des instances forgées. Le `tierMin`
        // legacy est traduit en bonus de scoreBase :
        //   tier 2 → scoreBase ~55, tier 3 → scoreBase ~70.
        const estLegendaire = tierEnnemi === TIERS.LEGENDAIRE;
        const scoreBase = estLegendaire ? 80 : (tierMin >= 3 ? 70 : 55);
        const instance = tirerItem('normal', this.rngLoot, {
            etage: this.etageNumero ?? 1,
            contexte: estLegendaire ? 'boss' : 'sol',
            scoreBase
        });
        if (!instance) return;
        if (!this.inventaire.ajouter(instance)) {
            this.afficherMessageFlottant("Inventaire plein", '#ff6060');
            return;
        }
        const couleurMsg = estLegendaire ? '#ff8090' : '#d8d8e8';
        this.afficherMessageFlottant(`Butin : ${instance.score}★ forgé`, couleurMsg);
    }

    /**
     * Applique un signature-drop Légendaire (cf. RaritySystem.dropSignature).
     * Format : { item?, sel?, fragments? : { famille, nb }, ... }
     */
    _appliquerSignatureDrop(signature) {
        if (signature.sel) this.economy.ajouterSel(signature.sel);
        if (signature.fragments) {
            this.economy.ajouterFragment(signature.fragments.famille, signature.fragments.nb);
        }
        if (signature.item) {
            if (this.inventaire.ajouter(signature.item)) {
                this.afficherMessageFlottant(`Butin signature : ${signature.item}`, '#ff8090');
            }
        }
    }

    /**
     * Instancie un ennemi normal — factorisation pour réutilisation
     * (en cas de besoin futur, et pour clarifier la création).
     *
     * @param {object} def         def brute (depuis ENEMIES)
     * @param {number} x, y, idx
     * @param {string} [tier]      rarete (commun par défaut). Pour les enfants
     *                             spawn (death-shards, sister-link), passer
     *                             commun pour éviter l'explosion combinatoire.
     */
    _instancierEnnemi(def, x, y, idx, tier = TIERS.COMMUN) {
        let defFinale;
        if (tier && tier !== TIERS.COMMUN) {
            defFinale = defAvecRarete(def, tier);
        } else if (def.rarete && def.rarete !== TIERS.COMMUN) {
            // Cas spawn enfant (sister-link, death-shards) : la def clonée
            // par le comportement parent peut hériter de `rarete` du parent
            // Légendaire. On force Commun pour éviter le cumul d'auras.
            defFinale = { ...def, rarete: TIERS.COMMUN };
        } else {
            defFinale = def;
        }

        // Phase 6 — buff statique par étage : +8 % PV et +5 % dégâts par étage
        // (cumulatif). Léger pour rester négociable même avec un loadout faible,
        // mais sensible quand on push vers le boss étage 10.
        const etage = this.etageNumero ?? 1;
        if (etage > 1 && !defFinale.spawned) {
            const facteurPv = 1 + (etage - 1) * 0.08;
            const facteurDmg = 1 + (etage - 1) * 0.05;
            defFinale = {
                ...defFinale,
                hp: Math.ceil((defFinale.hp ?? 1) * facteurPv),
                degatsContact: Math.ceil((defFinale.degatsContact ?? 1) * facteurDmg)
            };
        }
        const ennemi = new Enemy(this, defFinale, x, y, idx);
        ennemi.sprite.setDepth(DEPTH.ENTITES);
        // Gouffre mortel : étend les bounds des ennemis vers le bas (même
        // approche que le joueur, cf. _creerJoueur). Sinon ils restent collés
        // au bord bottom et se baladent dans la fosse mortelle.
        if (this._gouffreMort && ennemi.sprite?.body && this._dimsSalle) {
            const d = this._dimsSalle;
            ennemi.sprite.body.setBoundsRectangle(
                new Phaser.Geom.Rectangle(0, 0, d.largeur, d.hauteur + 200)
            );
        }
        if (defFinale.gravite) {
            this.physics.add.collider(ennemi.sprite, this.platforms);
            // Les obstacles solides (éboulis, murs fissurés) doivent bloquer
            // les ennemis aussi — sinon ils traversent et le puzzle "casser
            // pour passer" n'a aucun sens.
            if (this.obstaclesSolides) {
                this.physics.add.collider(ennemi.sprite, this.obstaclesSolides);
            }
        }
        this.physics.add.overlap(this.player, ennemi.sprite, () => this.contactEnnemi(ennemi));
        this.enemies.push(ennemi);
        return ennemi;
    }

    // ============================================================
    // PROJECTILES & ÉVÉNEMENTS DE COMBAT
    // ============================================================
    /**
     * Branche tous les events liés aux ennemis & boss (tir, smash, phase).
     */
    _brancherEvenementsCombat() {
        // Tireur normal & Boss Tisseur tirent un projectile
        const onTir = (_emetteur, params) => this._creerProjectile(params);
        this.events.on('enemy:tir', onTir);
        this.events.on('boss:tir', onTir);

        // Spawner — instancie un ennemi enfant à la position fournie (cf.
        // SpawnerSystem). idx synthétique pour ne pas collisionner avec les
        // ennemis indexés du graphe ; la def porte `spawned: true` qui
        // bypass la persistance enemySystem.marquerMort plus bas.
        const onSpawn = (parent, params) => {
            const idx = `spawn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
            const child = this._instancierEnnemi(params.def, params.x, params.y, idx);
            if (parent && child) {
                if (!parent.enfants) parent.enfants = [];
                parent.enfants.push(child);
            }
        };
        this.events.on('enemy:spawn', onSpawn);

        // Boss Colosse : telegraph + impact AOE
        const onTelegraph = (boss) => this._jouerTelegraphSmash(boss);
        const onImpact = (boss) => this._appliquerSmash(boss);
        this.events.on('boss:smash:telegraph', onTelegraph);
        this.events.on('boss:smash:impact', onImpact);

        // Phase change
        const onPhase = (boss, phase) => {
            this.afficherMessageFlottant(`PHASE ${phase}`, '#ff6060');
            this.cameras.main.shake(180, 0.008);
        };
        this.events.on('boss:phase', onPhase);

        // Boss mort : drop Vestige signature + débloquage porte + sceau d'étage
        const onBossDead = (boss) => {
            this.enemySystem.marquerMort('normal', this.cleSalleEtage, 'boss');
            this.bossVivant = false;
            // Phase 5a : sceau d'étage. marquerSceau retourne vrai si NOUVEAU
            // (déjà acquis dans un run précédent = pas de re-anim).
            if (marquerSceau(this.etageNumero)) {
                this.registry.events.emit(EVT_SCEAU_OBTENU, this.etageNumero);
            }
            // Phase 5c — Boss étage 10 : déclenche la cinématique de fin
            // (à la place du drop classique). L'Artefact est l'objet de la
            // cinématique, pas un item à ramasser au sol.
            if ((boss.def.etage ?? this.etageNumero) === 10) {
                lancerCinematiqueFin(this, boss);
                return;
            }
            // Boss étages 1-9 : drop Vestige + message standard
            this._dropBossVestige(boss);
            this.afficherMessageFlottant('La voie s\'ouvre', '#ffd070');
        };
        this.events.on('boss:dead', onBossDead);

        // Pieu touché : dégâts au joueur avec invincibilité globale
        const onPieuHit = (obs) => {
            const now = this.time.now;
            if (now < this.invincibleJusqu) return;
            // Fallback : les types d'obstacles utilisent des champs différents
            // pour leurs dégâts (degats / degatsImpact / degatsPieu). 3 par défaut.
            const degats = obs.def.degats ?? obs.def.degatsImpact ?? obs.def.degatsPieu ?? 3;
            this.resonance.prendreDegats(degats);
            this.invincibleJusqu = now + DUREE_INVINCIBILITE_MS;
            this.flashJoueur(0xff6060);
            this.afficherMessageFlottant(`-${degats}`, '#ff6060');
        };
        this.events.on('obstacle:pieu:hit', onPieuHit);

        // Mur de feu (mutator) touché : DPS gate, dgts forfaitaire 4
        const onMurFeuHit = (_player) => {
            const now = this.time.now;
            if (now < this.invincibleJusqu) return;
            this.resonance.prendreDegats(4);
            this.invincibleJusqu = now + DUREE_INVINCIBILITE_MS;
            this.flashJoueur(0xff6060);
            this.afficherMessageFlottant('-4', '#ff6060');
        };
        this.events.on('mutator:mur_feu:hit', onMurFeuHit);

        // Fissure (Brisure-Tisseuse) — explosion AOE -8 si player overlap
        const onFissureExplode = (_player) => {
            const now = this.time.now;
            if (now < this.invincibleJusqu) return;
            this.resonance.prendreDegats(8);
            this.invincibleJusqu = now + DUREE_INVINCIBILITE_MS;
            this.flashJoueur(0xff4060);
            this.afficherMessageFlottant('-8', '#ff4060');
        };
        this.events.on('mutator:fissure:explode', onFissureExplode);

        this.events.once('shutdown', () => {
            this.events.off('enemy:tir', onTir);
            this.events.off('boss:tir', onTir);
            this.events.off('enemy:spawn', onSpawn);
            this.events.off('mutator:mur_feu:hit', onMurFeuHit);
            this.events.off('mutator:fissure:explode', onFissureExplode);
            this.events.off('boss:smash:telegraph', onTelegraph);
            this.events.off('boss:smash:impact', onImpact);
            this.events.off('boss:phase', onPhase);
            this.events.off('boss:dead', onBossDead);
            this.events.off('obstacle:pieu:hit', onPieuHit);
        });
    }

    _creerProjectile(params) {
        const proj = new Projectile(this, params);
        // Collision avec plateformes (destruction)
        this.physics.add.collider(proj.sprite, this.platforms, () => proj.detruire(true));

        if (params.origine === 'joueur') {
            // Phase 5b.2 — projectile tiré par un Geste du joueur. Touche les
            // ennemis + boss (jamais le joueur). Slow-mo / parry n'intervient pas.
            const onHitEnnemi = (_proj, ennemiSprite) => {
                if (proj.detruit) return;
                const ennemi = ennemiSprite._enemy;
                if (!ennemi || ennemi.mort) return;
                ennemi.recevoirDegats(proj.degats);
                proj.detruire(true);
            };
            // Crée un overlap dynamique avec chaque ennemi + boss
            for (const e of this.enemies ?? []) {
                if (e?.sprite && !e.sprite._enemy) e.sprite._enemy = e;
                this.physics.add.overlap(proj.sprite, e.sprite, onHitEnnemi);
            }
            if (this.boss?.sprite) {
                if (!this.boss.sprite._enemy) this.boss.sprite._enemy = this.boss;
                this.physics.add.overlap(proj.sprite, this.boss.sprite, onHitEnnemi);
            }
        } else {
            // Projectile ennemi/boss : overlap avec joueur (dégâts + destruction)
            this.physics.add.overlap(this.player, proj.sprite, () => {
                if (proj.detruit) return;
                if (this.estParryActif()) {
                    this.parryActifJusqu = 0;
                    this.resonance.regagner(this.statsEffectives.parryBonusResonance);
                    this.afficherMessageFlottant('PARRY', '#ffd070');
                    this._jouerEffetParryReussi();
                    proj.detruire(true);
                    return;
                }
                const now = this.time.now;
                if (now < this.invincibleJusqu) { proj.detruire(true); return; }
                this.resonance.prendreDegats(proj.degats);
                this.invincibleJusqu = now + DUREE_INVINCIBILITE_MS;
                this.flashJoueur(0xff6060);
                // Effet additionnel à l'impact (ex: immobilisation web)
                if (typeof proj.effetImpact === 'function') {
                    proj.effetImpact(this, this.player);
                }
                proj.detruire(true);
            });
        }

        this.projectiles.push(proj);
        return proj;
    }

    _jouerTelegraphSmash(boss) {
        if (!boss?.sprite?.active) return;
        const halo = this.add.graphics();
        halo.setDepth(DEPTH.EFFETS - 1);
        halo.setBlendMode(Phaser.BlendModes.ADD);
        halo.fillStyle(0xff4040, 0.5);
        halo.fillCircle(0, 0, 40);
        halo.fillStyle(0xff8080, 0.7);
        halo.fillCircle(0, 0, 22);
        halo.setPosition(boss.sprite.x, boss.sprite.y);
        const upd = () => {
            if (!halo.active || !boss.sprite?.active) return;
            halo.setPosition(boss.sprite.x, boss.sprite.y);
        };
        this.events.on('postupdate', upd);
        this.tweens.add({
            targets: halo,
            alpha: { from: 0.4, to: 1 }, scale: { from: 0.6, to: 1.6 },
            duration: 800, ease: 'Cubic.In',
            onComplete: () => {
                this.events.off('postupdate', upd);
                halo.destroy();
            }
        });
    }

    _appliquerSmash(boss) {
        if (!boss?.sprite?.active) return;
        const cx = boss.sprite.x;
        const cy = boss.sprite.y + boss.def.hauteur / 4;
        const rayon = 160;

        // Onde de choc visible
        const onde = this.add.graphics();
        onde.setDepth(DEPTH.EFFETS);
        onde.setBlendMode(Phaser.BlendModes.ADD);
        onde.lineStyle(8, 0xff4040, 1);
        onde.strokeCircle(0, 0, rayon * 0.5);
        onde.lineStyle(3, 0xffd070, 1);
        onde.strokeCircle(0, 0, rayon * 0.4);
        onde.setPosition(cx, cy);
        this.tweens.add({
            targets: onde,
            scale: { from: 0.3, to: 1.4 }, alpha: { from: 1, to: 0 },
            duration: 460, ease: 'Cubic.Out',
            onComplete: () => onde.destroy()
        });

        // Particules de gravats (multiples)
        if (this.textures.exists('_particule')) {
            const burst = this.add.particles(cx, cy, '_particule', {
                lifespan: 600,
                speed: { min: 120, max: 280 },
                angle: { min: -160, max: -20 },
                gravityY: 600,
                scale: { start: 0.8, end: 0 },
                tint: [0x6a4a3a, 0x8a6a4a, 0xa08060, 0xff8040],
                quantity: 22,
                alpha: { start: 1, end: 0 }
            });
            burst.setDepth(DEPTH.EFFETS);
            burst.explode(22);
            this.time.delayedCall(700, () => burst.destroy());
        }

        // Screen shake
        this.cameras.main.shake(220, 0.012);

        // Dégâts AOE si joueur dans le rayon
        const dx = this.player.x - cx;
        const dy = this.player.y - cy;
        if (Math.hypot(dx, dy) <= rayon) {
            const now = this.time.now;
            if (now >= this.invincibleJusqu) {
                if (this.estParryActif()) {
                    this.parryActifJusqu = 0;
                    this.resonance.regagner(this.statsEffectives.parryBonusResonance);
                    this.afficherMessageFlottant('PARRY', '#ffd070');
                    this._jouerEffetParryReussi();
                } else {
                    this.resonance.prendreDegats(boss.def.degatsContact);
                    this.invincibleJusqu = now + DUREE_INVINCIBILITE_MS;
                    this.flashJoueur(0xff6060);
                }
            }
        }
    }

    /**
     * Drop garanti à la mort d'un boss : le Vestige signature de l'étage
     * (Phase 5b). Si le joueur le possède déjà (inventaire ou équipé), pas
     * de redrop. Cube cramoisi (doré pour Artefact étage 10) qui flotte vers
     * le joueur.
     *
     * Si l'inventaire est plein, le drop est marqué `pending` dans le registry
     * et retenté à chaque entrée de la salle BOSS tant que non récupéré.
     */
    _dropBossVestige(boss) {
        const etage = boss.def.etage ?? this.etageNumero;
        const vestige = vestigePourEtage(etage);
        if (!vestige) return;
        if (this.inventaire.possedeVestige(vestige.id)) {
            // Le joueur l'a déjà — on signale silencieusement.
            this.afficherMessageFlottant(`(${vestige.nom} déjà acquis)`, '#8a8a9a');
            return;
        }

        const couleur = COULEURS_FAMILLE[vestige.famille] ?? COULEURS_FAMILLE.noir;
        const cube = this.add.rectangle(boss.sprite.x, boss.sprite.y, 22, 22, couleur);
        cube.setStrokeStyle(2, 0xffd070, 0.9);
        cube.setDepth(DEPTH.EFFETS);

        // Étincelles cramoisi/dorées brèves au spawn du drop
        for (let k = 0; k < 5; k++) {
            const px = boss.sprite.x + (Math.random() - 0.5) * 30;
            const py = boss.sprite.y + (Math.random() - 0.5) * 30;
            const p = this.add.circle(px, py, 2, 0xffd070, 0.9);
            p.setBlendMode(Phaser.BlendModes.ADD);
            p.setDepth(DEPTH.EFFETS);
            this.tweens.add({
                targets: p, alpha: 0, scale: 0.2,
                duration: 500 + Math.random() * 300,
                onComplete: () => p.destroy()
            });
        }

        this.tweens.add({
            targets: cube,
            x: this.player.x, y: this.player.y, alpha: 0,
            duration: 700,
            ease: 'Quad.In',
            onComplete: () => {
                cube.destroy();
                if (this.inventaire.ajouter(vestige.id)) {
                    const couleurHex = this.coulHex(couleur);
                    this.afficherMessageFlottant(`✦ ${vestige.nom}`, couleurHex);
                } else {
                    // Phase 5b.2 — inventaire plein : on enregistre le Vestige
                    // comme « en attente » pour cet étage. La salle BOSS tentera
                    // automatiquement de l'ajouter au prochain passage (cf.
                    // `_tenterRecupererVestigePending` appelée en fin de create()).
                    this.registry.set(`vestige_pending_e${this.etageNumero}`, vestige.id);
                    this.afficherMessageFlottant('Inventaire plein — reviens', '#ff8060');
                }
            }
        });
    }

    /**
     * Phase 5b.2 — Si un Vestige est en attente pour l'étage courant (drop
     * manqué car inventaire plein), tenter de l'ajouter quand on entre dans
     * la salle BOSS. Affiche un cube qui flotte vers le joueur si succès.
     */
    _tenterRecupererVestigePending() {
        const cle = `vestige_pending_e${this.etageNumero}`;
        const id = this.registry.get(cle);
        if (!id) return;
        if (this.inventaire.possedeVestige(id)) {
            this.registry.remove(cle);
            return;
        }
        if (this.inventaire.estPlein()) {
            this.afficherMessageFlottant?.('Vestige en attente — inventaire plein', '#ff8060');
            return;
        }
        const vestige = vestigePourEtage(this.etageNumero);
        if (!vestige) return;
        if (this.inventaire.ajouter(vestige.id)) {
            this.registry.remove(cle);
            const couleur = COULEURS_FAMILLE[vestige.famille] ?? COULEURS_FAMILLE.noir;
            this.afficherMessageFlottant?.(`✦ ${vestige.nom}`, this.coulHex(couleur));
        }
    }

    peutEtreDrop(ennemi) {
        // Les boss gèrent leur drop (T3 garanti) via `_dropBossTier3`
        if (ennemi.estBoss) return;
        // Phase 6 (feedback user) — drops en Présent réduits de moitié pour ne
        // pas saturer l'inventaire. Climax reste à 100 % (drop chrono garanti).
        const probaBrute = this.climaxDropDu ? 1 : (ennemi.def.probaDrop * 0.45);
        if (this.rngLoot() >= probaBrute) return;

        // Phase 6 — toujours une instance forgée. Climax = score boost vers Bleu/Noir.
        let instance;
        if (this.climaxDropDu) {
            const familles = ['bleu', 'noir'];
            const famille = familles[Math.floor(this.rngLoot() * 2)];
            instance = tirerItem('normal', this.rngLoot, {
                etage: this.etageNumero ?? 1,
                contexte: 'sol', scoreBase: 65
            });
            // Force la famille climax si possible (le tirage l'a déjà variable,
            // ici on accepte la famille produite — climax = juste score boost).
            this.climaxDropDu = false;
        } else {
            instance = tirerItem('normal', this.rngLoot, { etage: this.etageNumero ?? 1 });
        }
        if (!instance) return;

        const famille = this._familleInstance(instance);
        const couleurFam = COULEURS_FAMILLE[famille] ?? 0xc8a85a;

        const cube = this.add.rectangle(
            ennemi.sprite.x, ennemi.sprite.y, 14, 14, couleurFam
        );
        this.tweens.add({
            targets: cube,
            x: this.player.x,
            y: this.player.y,
            alpha: 0,
            duration: 400,
            onComplete: () => {
                cube.destroy();
                if (this.inventaire.ajouter(instance)) {
                    this.afficherMessageFlottant(
                        `Ramassé : ${instance.score}★ forgé`,
                        this.coulHex(couleurFam)
                    );
                } else {
                    this.afficherMessageFlottant("Inventaire plein", '#ff6060');
                }
            }
        });
    }

    // Phase 6 — résout la famille d'une instance via son template
    _familleInstance(instance) {
        return TEMPLATES[instance.templateId]?.famille ?? 'blanc';
    }

    // ============================================================
    // COFFRES & DROPS SOL (cf. étape 6)
    // ============================================================
    creerCoffre(c) {
        // Coffre stylisé bois + or, neutre tant qu'il est fermé (mystère du loot).
        // Taille agrandie pour avoir plus de présence visuelle.
        const w = Math.max(28, c.largeur);
        const h = Math.max(22, c.hauteur);
        this.coffreVisuel = creerVisuelCoffre(this, c.x, c.y, w, h);
        // Référence "pivot" pour la détection d'interaction (essayerInteragir lit .x/.y)
        this.coffre = this.coffreVisuel.container;
        this.coffreData = c;
    }

    creerDropSol(d) {
        // On tire le type de consommable à la création (déterministe seedé)
        // pour que le visuel reflète le contenu avant ramassage.
        const consommable = tirerConsommable(this.rngLoot);
        if (!consommable) return;
        this.dropSolConsommable = consommable;
        this.dropSol = creerVisuelConsommable(this, d.x, d.y, consommable.id);
        this.dropSolData = d;
    }

    essayerInteragir() {
        const px = this.player.x;
        const py = this.player.y;
        const proche = (obj) => obj && Phaser.Math.Distance.Between(px, py, obj.x, obj.y) < 40;
        const prochePNJ = (obj) => obj && Phaser.Math.Distance.Between(px, py, obj.x, obj.y) < 60;
        if (this.coffre && proche(this.coffre)) { this.ouvrirCoffre(); return; }
        if (this.dropSol && proche(this.dropSol)) { this.ramasserDropSol(); return; }
        if (this.fondeurEntite && prochePNJ(this.fondeurEntite)) { this.ouvrirFondeur(); return; }
        if (this.identifieurEntite && prochePNJ(this.identifieurEntite)) { this.ouvrirIdentifieur(); return; }
        if (this.marchandEntite && prochePNJ(this.marchandEntite)) { this.ouvrirMarchand(); return; }
        // Monolithe Vestige (touche E → popup lore + Fragment Noir 1ère lecture)
        const mono = this.narrative?.monolitheProche(px, py);
        if (mono) { this._ouvrirLore(mono); return; }
        // Portes : si le joueur overlap une porte, on traverse. Priorité plus
        // basse que les interactions explicites (coffre/PNJ) pour ne pas
        // déclencher de transit accidentel si on est sur une porte ET un PNJ.
        for (const dir of Object.keys(this.portes ?? {})) {
            const p = this.portes[dir];
            if (p?.rect && this.physics.overlap(this.player, p.rect)) {
                this._traverserPorte(p.salle, p.direction);
                return;
            }
        }
    }

    ouvrirFondeur() {
        if (this.scene.isActive('FondeurScene')) return;
        const seed = this.registry.get('seed_run') ?? 0;
        const sh = this._hashStr(this.salleId);
        const rngForge = creerRng((seed ^ 0xC0FFEE ^ sh ^ this.time.now) >>> 0);
        this.scene.pause();
        this.scene.launch('FondeurScene', { rng: rngForge });
    }

    ouvrirIdentifieur() {
        if (this.scene.isActive('IdentifieurScene')) return;
        const seed = this.registry.get('seed_run') ?? 0;
        const sh = this._hashStr(this.salleId);
        const rngPhrase = creerRng((seed ^ 0xBADC0DE ^ sh ^ this.time.now) >>> 0);
        this.scene.pause();
        this.scene.launch('IdentifieurScene', { rng: rngPhrase });
    }

    ouvrirMarchand() {
        if (this.scene.isActive('MarchandScene')) return;
        const seed = this.registry.get('seed_run') ?? 0;
        const sh = this._hashStr(this.salleId);
        // Vitrine seedée sur (run + étage + salleId) — stable tant qu'on est dans cette salle.
        const cleVitrine = (seed ^ 0x9E3779B1 ^ (this.etageNumero * 1009) ^ sh) >>> 0;
        this.registry.set('marchand_room_id', cleVitrine);
        const rngVitrine = creerRng(cleVitrine);
        const rngPhrase = creerRng((seed ^ 0x517CC1B7 ^ sh ^ this.time.now) >>> 0);
        this.scene.pause();
        this.scene.launch('MarchandScene', { rngVitrine, rngPhrase });
    }

    ouvrirCoffre() {
        const monde = this.monde.getMonde();
        const cleSalle = this.cleSalleEtage;
        // Doctrine 9a : les coffres dropent en très large majorité des Fragments.
        //   Présent : 85 % Fragment / 15 % item équipable
        //   Miroir  : 95 % Fragment / 5 % item (les items déjà forgés y sont rarissimes —
        //             c'est l'atelier de transformation, on y vient pour les matières).
        // Trouver un item équipable directement reste possible, mais devient un événement.
        const probaFragment = monde === 'miroir' ? 0.95 : 0.85;
        const donneFragment = this.rngLoot() < probaFragment;

        this.inventaire.marquerCoffreOuvert(monde, cleSalle);
        const visuel = this.coffreVisuel;
        const cible = { x: this.player.x, y: this.player.y };

        if (donneFragment) {
            // Tire la famille selon le monde (mêmes proba que les items)
            const r = this.rngLoot();
            const probas = monde === 'miroir'
                ? { blanc: 0.2, bleu: 0.6, noir: 0.2 }
                : { blanc: 0.7, bleu: 0.2, noir: 0.1 };
            let famille;
            if (r < probas.blanc) famille = 'blanc';
            else if (r < probas.blanc + probas.bleu) famille = 'bleu';
            else famille = 'noir';

            this.economy.ajouterFragment(famille, 1);
            const couleur = COULEURS_FAMILLE[famille];
            jouerOuvertureCoffre(this, visuel, famille, cible, () => {
                this.afficherMessageFlottant(`Fragment ${famille}`, this.coulHex(couleur));
            });
        } else {
            // Phase 6 — coffres droppent toujours une instance forgée.
            const instance = tirerItem(monde, this.rngLoot, { etage: this.etageNumero ?? 1 });
            if (!instance) return;
            if (!this.inventaire.ajouter(instance)) {
                this.afficherMessageFlottant("Inventaire plein", '#ff6060');
                return;
            }
            const famille = this._familleInstance(instance);
            const couleur = COULEURS_FAMILLE[famille] ?? 0xc8a85a;
            jouerOuvertureCoffre(this, visuel, famille, cible, () => {
                this.afficherMessageFlottant(`Ramassé : ${instance.score}★ forgé`, this.coulHex(couleur));
            });
        }

        // Coffre passe en mode "vide" (couleur tamisée) une fois l'ouverture terminée
        this.time.delayedCall(900, () => fermerCoffreVide(this, visuel));

        // On libère la référence pour empêcher une nouvelle interaction
        this.coffre = null;
        this.coffreVisuel = null;
    }

    ramasserDropSol() {
        const consommable = this.dropSolConsommable;
        if (!consommable) return;
        const monde = this.monde.getMonde();
        this.appliquerConsommable(consommable);
        this.inventaire.marquerDropRamasse(monde, this.cleSalleEtage);
        this.afficherMessageFlottant(`${consommable.nom} — ${consommable.description}`, '#a8c8e8');
        jouerRamassageConsommable(this, this.dropSol, { x: this.player.x, y: this.player.y });
        this.dropSol = null;
        this.dropSolConsommable = null;
    }

    appliquerConsommable(c) {
        const e = c.effet;
        if (e.type === 'resonance_gain') {
            this.resonance.regagner(e.valeur);
        } else if (e.type === 'pause_miroir') {
            if (this.timerMiroir) {
                this.timerMiroir.paused = true;
                this.time.delayedCall(e.duree, () => {
                    if (this.timerMiroir) this.timerMiroir.paused = false;
                });
            }
        } else if (e.type === 'encre_temoin_gain') {
            // Stocké comme ressource (pas effet immédiat)
            this.economy.ajouterEncre(e.valeur ?? 1);
        }
    }

    // ============================================================
    // ZONES & TRANSITIONS (cf. étapes 3-5)
    // ============================================================
    /**
     * Crée une porte dans la salle. La direction (N/S/E/O) détermine
     * la salle voisine. Pour la salle BOSS, la porte E (sans voisin)
     * fait monter d'un étage.
     */
    _creerPorte(porte, salle, direction) {
        const rect = this.add.rectangle(porte.x, porte.y, porte.largeur, porte.hauteur, 0xffffff, 0);
        rect.setAlpha(0);
        this.physics.add.existing(rect, true);
        // Pas d'overlap automatique : la traversée se fait UNIQUEMENT sur
        // touche E (essayerInteragir). Le joueur peut donc longer/explorer
        // près d'une porte sans la traverser involontairement — important
        // pour les portes au milieu d'un sol (S/N).
        creerVisuelPorteSortie(this, porte.x, porte.y, porte.largeur, porte.hauteur, this.mondeCourant);
        return { rect, direction, salle };
    }

    /**
     * Traverse une porte → soit on charge la salle voisine, soit on monte
     * d'étage (porte E de la salle BOSS, après le boss).
     */
    _traverserPorte(salle, direction) {
        if (this.transitionEnCours) return;
        const voisinId = salle.voisins?.[direction];

        // Cas spécial : porte E de la salle BOSS sans voisin = transition d'étage
        if (salle.estBoss && direction === 'E' && !voisinId) {
            // Bloque tant que le boss est vivant (Présent uniquement)
            if (this.bossVivant) {
                this.afficherMessageFlottant('La voie est scellée', '#ff8060');
                return;
            }
            this.monterEtage();
            return;
        }
        if (!voisinId) return; // sécurité : pas de voisin, pas de transition

        this.transitionEnCours = true;
        const porteArrivee = directionOpposee(direction);
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.restart({ salleId: voisinId, porteArrivee });
        });
    }

    /**
     * Passage à l'étage suivant (après la salle BOSS).
     */
    monterEtage() {
        if (this.transitionEnCours) return;
        this.transitionEnCours = true;
        const prochain = (this.etageNumero ?? 1) + 1;
        // Phase A : on boucle / on plafonne à 10
        const numero = Math.min(10, prochain);
        this.registry.set(CLE_ETAGE_NUMERO, numero);
        this.registry.remove(CLE_ETAGE_DATA);     // force la régen
        this.registry.remove(CLE_SALLE_COURANTE); // entrée par défaut
        this.registry.remove(CLE_PORTE_ARRIVEE);
        this._purgerEtatsObstacles();             // nouvel étage = obstacles neufs
        this.cameras.main.fadeOut(400, 30, 30, 60);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.afficherMessageFlottant?.(`Étage ${numero}`, '#ffd070');
            this.scene.restart({});
        });
    }

    creerVortex(v, _couleur) {
        // Vortex uniquement en Miroir (Cité) — ramène en Présent avec reset d'étage.
        this.vortex = this.add.rectangle(v.x, v.y, v.largeur, v.hauteur, 0xffffff, 0);
        this.vortex.setAlpha(0);
        this.physics.add.existing(this.vortex, true);
        this.physics.add.overlap(this.player, this.vortex, () => this.retourAuNormal());
        creerVisuelVortex(this, v.x, v.y, v.largeur, v.hauteur);
    }

    basculerVersMiroir() {
        if (this.transitionEnCours) return;
        this.transitionEnCours = true;
        // Présent → Miroir : volontaire (vortex en salle d'entrée) ou involontaire
        // (mort en combat, Résonance 0). Téléport à la Cité Marchande, plein heal.
        // L'état de l'étage est figé pendant que le joueur est en Miroir — il sera
        // reset au retour via le vortex Miroir (cf. retourAuNormal).
        this.registry.remove(CLE_POSITION_PENDANTE);
        this.registry.set(CLE_SALLE_COURANTE, this.etage.salleEntreeId);
        this.registry.remove(CLE_PORTE_ARRIVEE);
        this.cameras.main.fadeOut(300, 80, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.monde.basculerVersMiroir();
            this.scene.restart({ salleId: this.etage.salleEntreeId });
        });
    }

    /**
     * Purge tous les marqueurs 'eboulis:*' du registry. Appelé au retour de la
     * Cité (reset étage) et au passage d'étage. Les obstacles cassables
     * sont remis à neuf.
     */
    _purgerEtatsObstacles() {
        const data = this.registry.values;
        for (const cle of Object.keys(data)) {
            if (cle.startsWith('eboulis:')) this.registry.remove(cle);
        }
    }

    retourAuNormal() {
        if (this.transitionEnCours) return;
        this.transitionEnCours = true;
        // Miroir → Présent : on RESET l'état de l'étage (coffres, drops, ennemis,
        // boss). Doctrine "fail and try again" : à chaque sortie de Cité, l'étage
        // est régénéré dans son état initial. Le joueur garde tout son méta
        // (inventaire, équipement, Sel, Fragments, identifications, etc.).
        this.inventaire.resetEtage(this.etageNumero);
        this.enemySystem.resetEtage(this.etageNumero);
        // Purge les marqueurs d'éboulis brisés (les obstacles cassables
        // ressuscitent quand on retourne en Présent — cohérent avec le reset
        // de l'étage).
        this._purgerEtatsObstacles();
        // Phase 6 — Incrémente le compteur de visites Cité → la sous-seed loot
        // changera, donc les coffres droppent des objets différents à chaque
        // retour. Les ennemis restent stables (pool seedé indépendamment).
        const v = (this.registry.get('cite_visites') ?? 0) + 1;
        this.registry.set('cite_visites', v);
        // Spawn forcé sur la salle d'entrée en Présent, depuis le sol (pas de
        // position pendante : ce n'est plus un déplacement contrôlé).
        this.registry.remove(CLE_POSITION_PENDANTE);
        this.registry.set(CLE_SALLE_COURANTE, this.etage.salleEntreeId);
        this.registry.remove(CLE_PORTE_ARRIVEE);
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.monde.revenirAuNormal();
            this.scene.restart({ salleId: this.etage.salleEntreeId });
        });
    }

    // ============================================================
    // HOOKS RÉSONANCE
    // ============================================================
    brancherBasculement() {
        this.handlerVide = () => this.basculerVersMiroir();
        this.registry.events.on('resonance:vide', this.handlerVide);
        this.events.once('shutdown', () => {
            this.registry.events.off('resonance:vide', this.handlerVide);
        });
    }

    // ============================================================
    // MONOLITHES VESTIGE (lore narratif, touche E)
    // ============================================================

    /**
     * Pose les visuels painterly de tous les monolithes Vestige de la salle.
     * Style : stèle de pierre debout avec runes Reflux pulsantes. Plus marqué
     * tant que le lore n'est pas lu (effet "appel").
     */
    _poserMonolithesLore(zones) {
        this._monolithesGfx = this._monolithesGfx ?? [];
        // Nettoyage des anciens (en cas de scene.restart où ce hook re-trigger)
        for (const m of this._monolithesGfx) m?.destroy?.();
        this._monolithesGfx = [];

        const monos = zones.filter(z => z?.type === 'vestige_lore');
        for (const z of monos) {
            const lu = this.narrative.estLu(z.loreId);
            const cont = this._dessinerMonolithe(z, lu);
            this._monolithesGfx.push(cont);
        }
    }

    _dessinerMonolithe(zone, lu) {
        const w = zone.largeur;
        const h = zone.hauteur;
        const cont = this.add.container(zone.x, zone.y);
        cont.setDepth(450);   // au-dessus du décor mais sous le joueur

        const g = this.add.graphics();
        // Ombre portée
        g.fillStyle(0x000000, 0.45);
        g.fillRoundedRect(-w / 2 + 2, -h / 2 + 4, w, h, 4);
        // Corps stèle — pierre sombre
        g.fillStyle(0x2a2820, 1);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 4);
        // Liseré clair (lumière oblique gauche)
        g.fillStyle(0x504838, 0.7);
        g.fillRect(-w / 2 + 2, -h / 2 + 3, 3, h - 6);
        // Crête supérieure (sommet biseauté)
        g.fillStyle(0x1a1814, 1);
        g.beginPath();
        g.moveTo(-w / 2, -h / 2);
        g.lineTo(0, -h / 2 - 4);
        g.lineTo(w / 2, -h / 2);
        g.closePath();
        g.fillPath();
        cont.add(g);

        // Runes pulsantes (3 traits horizontaux gravés au milieu)
        const runes = this.add.graphics();
        const couleurRune = lu ? 0x6a5040 : 0xb04060;  // rouge Reflux si non lu, terni si lu
        const dessinerRunes = (alpha) => {
            runes.clear();
            runes.lineStyle(2, couleurRune, alpha);
            for (let i = 0; i < 3; i++) {
                const y = -h / 4 + i * 9;
                runes.lineBetween(-w / 2 + 6, y, w / 2 - 6, y);
            }
        };
        dessinerRunes(0.9);
        cont.add(runes);

        // Tween pulse (plus marqué si non lu)
        const amplitudePulse = lu ? 0.2 : 0.6;
        const baseAlpha = lu ? 0.45 : 0.85;
        this.tweens.addCounter({
            from: 0, to: Math.PI * 2,
            duration: lu ? 4200 : 2400,
            loop: -1,
            onUpdate: (tw) => {
                const a = baseAlpha + Math.sin(tw.getValue()) * amplitudePulse * 0.5;
                dessinerRunes(Phaser.Math.Clamp(a, 0.2, 1));
            }
        });

        return cont;
    }

    /**
     * Ouvre le popup de lore du monolithe ciblé. À la 1ère lecture, drop un
     * Fragment Noir et met à jour le visuel (runes se tarnissent).
     */
    _ouvrirLore(zone) {
        if (!zone?.loreId) return;
        if (this.scene.isActive('PopupLoreScene')) return;
        const premiere = this.narrative.marquerLu(zone.loreId);
        // Si 1ère lecture, redessiner le monolithe en mode "lu" (pulse terni)
        if (premiere) {
            // Reset des visuels pour refléter le nouvel état (pulse terni)
            this._poserMonolithesLore(this._zonesSalle ?? []);
        }
        this.scene.pause();
        this.scene.launch('PopupLoreScene', {
            loreId: zone.loreId,
            premiereLecture: premiere
        });
    }

    /**
     * Chute mortelle dans un gouffre : trigger une fois quand le joueur passe
     * sous le sol d'une salle avec `gouffreMort:true`. Inflige assez de
     * Résonance pour basculer en Miroir (Cité). Le flag empêche les multi-déclenchements.
     */
    _declencherMortGouffre() {
        if (this._mortGouffreEnCours) return;
        this._mortGouffreEnCours = true;
        // Petit shake + fondu rapide pour vendre la chute
        this.cameras.main.shake(180, 0.012);
        this.cameras.main.fade(220, 0, 0, 0);
        // Tue le joueur via la pipeline normale (massive damage → resonance:vide → Cité)
        this.resonance.prendreDegats(999);
    }

    /**
     * Chant des Cristaux (Cristaux Glacés) : un cristal résonant frappé révèle
     * (solidifie) toutes les plateforme_resonance partageant le même `lien`,
     * pour `dureeRevelMs`. Re-frapper prolonge la fenêtre.
     */
    _activerChant(lien) {
        if (lien == null || !this.obstacles) return;
        const now = this.time.now;
        let duree = 4500;
        for (const o of this.obstacles) {
            if (o.data.type === 'cristal_resonant' && o.data.lien === lien) {
                duree = o.def.dureeRevelMs ?? 4500;
                break;
            }
        }
        this._chantActif[lien] = now + duree;
        for (const o of this.obstacles) {
            if (o.data.type === 'plateforme_resonance' && o.data.lien === lien) {
                o.setRevele(true);
            }
        }
        this.time.delayedCall(duree, () => {
            // Annulé si re-déclenché entre-temps (une fenêtre plus tardive existe)
            if ((this._chantActif?.[lien] ?? 0) > this.time.now) return;
            if (!this.obstacles) return;
            for (const o of this.obstacles) {
                if (o.data.type === 'plateforme_resonance' && o.data.lien === lien) {
                    o.setRevele(false);
                }
            }
        });
    }

    activerBaissePassive(_enMiroir) {
        // Présent uniquement : baisse passive si un item équipé règle
        // `passivePresent > 0` (rare). Pas de drain en Miroir (hub paisible).
        this.timerPresent = this.time.addEvent({
            delay: BAISSE_PRESENT_DELAI_MS,
            loop: true,
            callback: () => {
                const baisse = Math.max(0, this.statsEffectives.passivePresent);
                if (baisse > 0) this.resonance.prendreDegats(baisse);
            }
        });
        this.events.once('shutdown', () => {
            if (this.timerPresent) this.timerPresent.remove(false);
        });
    }

    // ============================================================
    // HELPERS
    // ============================================================
    creerPlateforme(x, y, largeur, hauteur, couleur, oneWay = false, estSol = false) {
        const rect = this.add.rectangle(x, y, largeur, hauteur, couleur);
        rect.setDepth(DEPTH.PLATEFORMES);
        const groupe = oneWay ? this.oneWayPlatforms : this.platforms;
        groupe.add(rect);
        rect.body.updateFromGameObject();
        if (oneWay) {
            rect.body.checkCollision.down = false;
            rect.body.checkCollision.left = false;
            rect.body.checkCollision.right = false;
        }

        // Ornement par-dessus la plateforme physique : pierre cassée Présent /
        // pavés ornés Miroir avec chasse-pieds doré
        peindreOrnementPlateforme(this, x, y, largeur, hauteur, this.mondeCourant, this.palette, oneWay, estSol);

        return rect;
    }

    // Éclaircit une couleur hex (0xRRGGBB) d'un facteur (0..1)
    eclaircir(couleur, facteur) {
        const r = ((couleur >> 16) & 0xff);
        const g = ((couleur >> 8) & 0xff);
        const b = (couleur & 0xff);
        const f = (c) => Math.min(255, Math.round(c + (255 - c) * facteur));
        return (f(r) << 16) | (f(g) << 8) | f(b);
    }

    afficherMessageFlottant(texte, couleurCss) {
        const t = this.add.text(this.player.x, this.player.y - 40, texte, {
            fontFamily: 'monospace',
            fontSize: '13px',
            color: couleurCss,
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5, 1).setDepth(DEPTH.EFFETS);
        this.tweens.add({
            targets: t,
            y: t.y - 40,
            alpha: { from: 1, to: 0 },
            duration: 1800,
            onComplete: () => t.destroy()
        });
    }

    coulHex(n) {
        return '#' + n.toString(16).padStart(6, '0');
    }

    /** Hash 32-bit stable d'une string (FNV-1a). Utilisé pour seed les RNG. */
    _hashStr(s) {
        let h = 2166136261;
        for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    }
}
