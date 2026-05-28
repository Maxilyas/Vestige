# VESTIGE — Claude Code Context

## Projet
Jeu vidéo 2D plateformer fantasy médiéval en JavaScript + Phaser.js, jouable dans le navigateur.

**Documentation de référence :**
- [GDD.md](GDD.md) — mécaniques de jeu actuelles + scope MVP
- [LORE.md](LORE.md) — cosmologie, civilisation, Résonance, Vestiges, Reflux, Doctrine
- `git log` — historique complet des phases (ne pas dupliquer ici)

## Concept core
- **Deux mondes** : Présent (ruines post-Reflux, terrain de chasse) ↔ Miroir (passé fixé, **hub d'atelier paisible** : Fondeur + Identifieur + Marchand)
- **La Résonance** = jauge de cohérence du Vestige (équivalent PV). À 0 → mort = téléport Cité Miroir, plein heal, sans pénalité.
- **Boucle mini-jeu** : Présent (chasse) → mort/abandon → Cité (forge/identifie/vend) → vortex retour = **reset de l'étage courant** → retente plus fort. Pas de vortex volontaire en Présent : la Cité est une *récompense de défaite*, pas un bouton "save".
- **Objectif court terme** : finir les 10 étages.
- **Loot énigmatique** : 3 familles (Blanc / Bleu / Noir = Présent / Miroir / Reflux), pas de stats explicites au sol, révélation progressive via usage + Identifieur.
- **Combat RPG** : attaque (X), parry (C), sorts (1/2/3 par slot). Items modifient portée / dégâts / cooldown.
- **Aucun tutoriel** — le joueur découvre les règles en jouant.

## Stack technique
- Phaser.js 3 (via CDN dans `index.html`) — pas de bundler
- JavaScript vanilla (modules ES), pas de TypeScript
- Tout en canvas Phaser, pas de framework UI
- Serveur de dev : `npx live-server .` ou `npx vite`

## Structure du projet
```
vestige/
├── index.html
├── CLAUDE.md, GDD.md, LORE.md
└── src/
    ├── main.js              ← Boot + enregistrement scènes (MenuScene en premier)
    ├── config.js            ← Constantes globales (ne RIEN importer du projet)
    ├── data/                ← Définitions statiques
    │   ├── archetypes.js, topographies.js, biomes.js, etages.js
    │   ├── enemies.js (split par biome), boss.js, obstacles.js
    │   ├── items.js (legacy + Vestiges), fragments.js, recettes.js
    │   ├── templatesItems.js, stats.js, affixes.js, signatures.js, sorts.js  ← Phase 6
    │   └── phrases-identifieur.js, phrases-marchand.js
    ├── scenes/
    │   ├── MenuScene.js, GameScene.js, UIScene.js, FinScene.js
    │   ├── InventaireScene.js, MapScene.js
    │   └── FondeurScene.js, IdentifieurScene.js, MarchandScene.js  ← overlays Cité
    ├── systems/             ← Logique pure (pas de GameObject)
    │   ├── WorldGen.js, EtageGen.js, CarteMemoire.js
    │   ├── ResonanceSystem.js, MondeSystem.js, InputSystem.js
    │   ├── InventaireSystem.js, EconomySystem.js, IdentificationSystem.js
    │   ├── EnemySystem.js, LootSystem.js, RaritySystem.js
    │   ├── FondeurSystem.js, FondeurUpgradeSystem.js, MarchandSystem.js
    │   ├── CraftingSystem.js, ScoreSystem.js, ItemForge.js  ← Phase 6
    │   ├── GardeSystem.js, SortSystem.js, RevelationSystem.js  ← Phase 6
    │   ├── GesteSystem.js, SceauxSystem.js, CinematiqueFusion.js
    │   ├── SpawnerSystem.js, PerceptionSystem.js, PerceptionCloud.js
    │   ├── CloneIllusionSystem.js, EnvironmentMutators.js
    │   └── EnemyComportements/, BossComportements.js
    ├── entities/            ← GameObjects physiques
    │   └── Enemy.js, Boss.js, Projectile.js, Obstacle.js
    └── render/
        ├── PainterlyRenderer.js, DecorRegistry.js, Parallaxe.js
        ├── AnimationsAmbiance.js, PlateformeStyle.js
        ├── elements/        ← Primitives décor (Colonne, Statue, Cascade…)
        ├── entities/        ← Visuels animés (JoueurVisuel, EnemyVisuel, VestigeIncarne, AuraRarete, AuraItem…)
        └── ui/              ← UI (SlotInventaire, PanneauDetail, BarreGarde, EmblemeFamille…)
```

## Lancer le projet
```bash
npx live-server .
# touches : QD/← → bouger, ↑/Espace sauter, S/↓ descendre,
#           X attaque, C parry, E interagir, I inventaire, M carte, V geste,
#           1/2/3 sorts (tête/corps/accessoire)
# debug   : K (-10 Résonance), H (+10 Résonance)
```

## Règles de développement
- Une feature à la fois, testable immédiatement dans le navigateur
- Pas de sur-ingénierie — la solution la plus simple qui fonctionne
- Commenter en français
- Les systèmes communiquent via événements Phaser (`this.events.emit`) et le registry
- Ne jamais casser ce qui fonctionne déjà sans prévenir
- Pas de TypeScript, pas de transpilation
- Tout input passe par `InputSystem` — JAMAIS de `Keyboard` direct dans la logique gameplay (prépare le portage mobile)

## Roadmap — mini-jeu 10 étages
*Mini-jeu terminable depuis Phase 5c.2. Détail historique : `git log`.*

**Boucle cible :** Présent (chasse) → mort = Cité Miroir (forge/identifie/vend) → vortex = reset étage → retente. Cible perso : finir les 10 étages avec ≤ 3 visites en Miroir.

- ✅ **Phases 1 → 4** — Simplification Miroir, refactor topographie/archétype, 40 topographies, bestiaires 5 biomes, rareté, étages déterministes
- ✅ **Phase 5a → 5c.2** — Sceaux, Vestiges (fondations + capacités), MenuScene, cinématique fusion + FinScene
- ✅ **Phase 6 → 6.2** — Crafting profond (instances forgées, score 0-100, 7 tiers couleur), Garde, sorts 1/2/3, Fondeur upgrade, fixes review
- ✅ **Phase 7 (musique)** — Audio procédural Tone.js, 5 patches en crossfade adaptatif (menu/cité/présent/combat/boss), volume + mute persistés
- ⬜ **5c.3** — Polish HUD cooldown Geste (overlay tournant + label)
- ✅ **5'** — Identité visuelle par paire d'étages : ✅ Ruines basses (5'.1-2), ✅ Halls Cendrés (5'.3-7), ✅ Cristaux Glacés (5'.8-18 ; sanctuaire boss étage 6 reste à faire), ✅ Voile Inversé (5'.19-23 ; même cité corrompue), ✅ Cœur Reflux (5'.24 — chambre intérieure mur ancré + arêtes Reflux désync). Sanctuaires boss 6/7/8/10 restent à faire
- ⬜ **Phase 6.x** — Passes successives polish/équilibrage Phase 6 selon retours user
- ⬜ **Échos** — Re-respawn salles nettoyées en Élite + drop bonus (quand équilibrage 6 stable)
- ✅ **Phase 8 — Refonte génération étages (Ruines)** — Salles handcrafted XL (19 dans pool Ruines), spanning tree 5×5 algorithmique, mécanique d'ancrage joueur (touche A, 5 Résonance/ancre, FIFO 3), 7 nouveaux types d'obstacles (sol_effrite, eboulis cassable, mur_fissure, roc_tombe, plaque_pression, racines_reflux mécaniques, anti_ancrage), portes activées par E. Phase 8 ne couvre que Ruines basses (étage 1). Étages 3-10 restent sur l'ancien système topographies jusqu'à migration.
- ✅ **Phase 8.2 — Étages 2/3/4 migration + biome Halls Cendrés** — Étage 2 (Ruines pool existant) et étages 3-4 (Halls Cendrés, nouveau pool 25 salles + fallback NSEO) passent en spanning tree. Mécanique signature Halls = **destruction** : 2 nouveaux obstacles (`brasier_mobile` cycle on/off, `mur_explosif` éclate en 6 projectiles braises radiaux à la rupture). 25 salles handcrafted Halls dont 8 signature `unique` (Grand Mur HP=8, Cascade de Pierres, Brasserie verticale, Crypte effondrée, Voûte Fendue, Foyer Éteint, Réseau de Plaques). Sous-salles cachées en détours optionnels (mur fissuré → coffre/sel/fragment). Validateur étendu : 47 salles OK (seul ruines_grimpeur KO attendu = puzzle ancrage).
- ✅ **Phase 8.3 — Refonte architecturale + mur secret + gouffres mortels** — Refonte radicale des 25 salles Halls : murs latéraux qui ferment les bords, plafonds organiques cathédrale (`plafondCathedrale`), niches/foyers surélevés pour les brasiers (plus de brasiers au sol plat). Nouveau type d'obstacle `mur_secret` (visuellement IDENTIQUE à une plateforme/sol normal du biome, aucun indice avant le 1ᵉʳ hit — vrai secret Metroidvania). Système `gouffreMort: true` au niveau salle : gouffre dans le sol = chute mortelle (Résonance vidée → retour Cité). Helpers `mur`, `murLateralGauche`, `murLateralDroit`, `plafondCathedrale`, `murSecret` ajoutés. Bugs fixés : brasier overlap dégâts manquant + mur_explosif collision/attaque manquantes dans GameScene. Validateur 47/47 OK (ruines_grimpeur exclu — puzzle ancrage attendu).
- ⬜ **Phase 9 — Refonte salles compactes (mini-Metroidvania)** — Pivot architectural : salles **960×540 fixes** (= canvas), caméra figée (pas de scroll), 12-18 salles par étage au lieu de 5-7, refonte from scratch des pools de salles biome par biome. Densité forcée par contrainte spatiale + densification visuelle (layers parallaxe ×2, lighting dynamique, props et micro-animations partout). Phase de transition : tout le combat / loot / Vestiges / Fondeur reste intact, seul le pipeline spatial + rendu est refondu. Sous-phases : ✅ 9.1 fondations (grille étendue 6×5, cible 12-18 salles), ✅ 9.2 plomberie dimsCanvas + caméra figée + 1ère salle test compacte (`ruines_atrium_effondre`), ✅ 9.3b pool OE compact Ruines (+4 salles : couloir_brise/escaliers_effrites/arene_pieux/arene_ressorts), ✅ 9.3c pool compact Ruines complet (+15 salles), ✅ 9.3d cleanup post-refonte (fix doublon cheminée + 4 portes S placées trop haut + fix spawn porte + fix spawn ennemis sur voûtes ; suppression 20 salles XL Ruines + 11 topographies mortes + 6 helpers `_format.js` morts ; flag MODE_COMPACT_ONLY supprimé), ⬜ 9.4 Vague 1 — nouvelles mécaniques actives (✅ helper `plateformeMobile` + ✅ `ruines_sanctuaire_suspendu` signature timing 2 mobiles désynchronisées + ✅ validateur étendu aux pseudo-positions de mobiles + ✅ **pool diversité +11 salles Mario/Rayman** : 8 NSEO `grand_saut`/`tour_chute`/`champignons`/`lames_pendulantes`★/`ascension_ressort`/`corniches_zigzag`/`pont_effrite`★/`voutes_brisees` + 3 ciblées NE/NO/NS `tour_garde_alt`/`belvedere_pendule`★/`puits_double` — toutes les configs de portes ont ≥8 candidats, ★=signature unique:true), ✅ 9.4 v3.4 (système narratif `vestige_lore` : helper + NarrativeSystem persistance localStorage + PopupLoreScene + 4 monolithes posés signatures Ruines), ⬜ 9.4 Vagues 2-3 (secrets/combat puis lore/atmosphère), ⬜ 9.5+ densification visuelle, ✅ 9.6 migration Halls (25 salles XL → compact + 11 nouvelles diversité + backlog 30 mécaniques), ✅ 9.7 extension toolkit Halls v1 (geyser/acide/charbon + 5 signatures), ✅ 9.8 extension toolkit Halls v2 (marteau/piston/scie + 5 signatures dont 2 NSEO méga-combo), ✅ **9.x migration Cristaux Glacés — fondation** (étages 5-6 basculés en spanning tree ; pool compact from-scratch de 20 salles structurelles `cristaux_*` + 1 carrefour fallback, identité marbre/glace réutilisant mécaniques existantes reskinées ; validateur 0 inaccessible), ✅ **9.x Cristaux toolkit Vague 1 « Silence & Glace »** (5 mécaniques engine : `stalactite_resonance` tombe sur le bruit/attaque, `verglas` glisse via `_tileEffectGlissant`, `faille_vide` drain Résonance, chant `cristal_resonant`+`plateforme_resonance` révèle des plateformes, `souffle_blizzard` poussée latérale ; 4 salles signature chapelle_silence/patinoire/choeur_mnesique/faille_du_present ; validateur 104/104), ⬜ 9.x+ Cristaux Vague 2 (Miroir : plateaux Présent↔Miroir oscillants + faux sols + lasers prismatiques gel, cf. mémoire backlog) ⬜ 9.9+ pièces scriptées Halls (vagues fonte/cheminées qui s'abattent) + migration Voile/Cœur.

## Systèmes implémentés (récap pour reprise)

### Génération de monde
- **Graphe d'étage** : 5-7 salles en arbre `A → B → C → D → BOSS` + 0-2 dead-ends verticaux (coffre garanti). Structure pinnée par `data/etages.js`. Pool ennemis + rareté seedés mais stables (sous-RNG par salle). Carte `M` cumulative entre runs via localStorage.
- **Topographies** : 29 dans `data/topographies.js` (19 régulières + 10 arènes boss) — utilisées en pin éditorial pour les étages 5-10. Les Ruines (étages 1-2) sont 100% en salles handcrafted compactes 960×540.
- **5 biomes par paires d'étages** : Ruines basses / Halls Cendrés / Cristaux Glacés / Voile Inversé / Cœur du Reflux. Chacun : palette + pool de 6 ennemis + densité progressive.
- **Obstacles** : pieux, ressorts, plateformes mobiles. Désactivés en Miroir et salle d'entrée Présent.
- **PRNG Mulberry32** seedé par run. `cite_visites` XOR la seed loot à chaque retour Cité.

### Combat
- **Joueur** : Rectangle physique invisible + JoueurVisuel (silhouette + cœur lumineux). X attaque / C parry (300ms + bonus Résonance) / 1-2-3 sorts par slot équipé.
- **~30 archétypes ennemis** répartis sur les 5 biomes (4 comportements basiques + 6 innovants par biome). 4 tiers rareté (Commun / Élite / Rare / Légendaire) avec auras FX et drops boostés.
- **10 boss** : 3 patterns × 10 skins, gating porte E salle BOSS. Drop : instance score 80+ garantie + 10-25 Sel + 3 Fragments. Boss étage 10 → cinématique fusion → FinScene.
- **Projectiles** : parry-able, homing optionnel, `effetImpact` (immobilise, vulnérabilité…).

### Loot & économie — Phase 6
- **Inventaire 60 slots** + 3 slots équipement (tête/corps/accessoire) + 3 slots Vestiges (geste, maîtrise×2).
- **Tout loot = instance forgée** : `{ _instance, uid, templateId, score, affixesPrim, affixesExo, sortId, signatureId, revele, compteurs }`. Score 0-100 → 7 tiers couleur (Brisé/Commun/Étoilé/Spectral/Royal/Reliquaire/Perfect = Gris→Blanc→Vert→Bleu→Violet→Orange→Rouge).
- **Templates** (15) × **stats** (7 primaires avec diminishing returns) × **affixes** (12 exotiques, gated par tier) × **signatures** (20 effets uniques pour score ≥ 95) × **sorts** (25, portés par les items).
- **Garde** : barre de PV regen sous la Résonance. Absorbe en priorité, regen après 3s.
- **Économie** : Sel (monnaie) + 3 Fragments (matière première). Drops ennemis + coffres.
- **Vestiges** : drop boss exclusif, 10 items éditorialisés (5 Maîtrises + 4 Gestes + 1 Artefact). No-redrop.

### Cité Marchande (Miroir)
- Salle A en Miroir forcée en `arene_ouverte` thématisée Sanctuaire.
- **Fondeur** : 4 onglets — FRAGMENTS (fragments → instance), COMBINER (2 instances → 1, risque Brisé), RE-RÉSONNER (reroll Encre + lock 1 stat), AMÉLIORER (5 paliers persistés boost score + réduit risque).
- **Identifieur** : révèle exotique/sort/signature, coût Sel (6/15/30) ou 1 Encre du Témoin pour tout révéler.
- **Marchand** : VITRINE (4 instances seedées) / RACHAT (prix selon score) / FRAGMENTER (1-4 Fragments selon score, bonus Noir 10 % pour 70+).

### Direction artistique
- **Aucun asset graphique** : tout en primitives Phaser (Graphics, Rectangle, ParticleEmitter, Tween). Style "painterly vectoriel".
- **Palette Présent (Mémoire Endormie)** vs **Miroir (Mémoire Vive)**, tinte par biome.
- **Parallax 4 couches** : ciel → silhouettes lointaines → silhouettes proches → foreground.
- **Animations atmosphériques** : halo joueur Miroir, brume Présent, rayons obliques, lanternes flicker, cascades signature par biome.
- **Entités** : tous les visuels sont des Containers Phaser qui suivent un Rectangle physique invisible.

## État actuel
*À mettre à jour à la fin de chaque session. Garder court — détails dans les commits.*

- **Dernière étape franchie** : Phase 9.x — **Cristaux Glacés tranche 2, Vague 1 « Silence & Glace »** (DA glace SEREINE actée, feu abandonné). 5 mécaniques engine neuves (thèse : le bruit te menace ET t'ouvre la voie, et la glace ne te laisse jamais t'arrêter) : (1) `stalactite_resonance` — pic gris « résonance morte » qui tombe quand le joueur ATTAQUE dans son rayon (réutilise la chute du roc) ; trigger branché dans `tenterAttaque` (proximité joueur). (2) `verglas` — zone-overlap qui pose `player._tileEffectGlissant` → réutilise le mouvement glissant DÉJÀ codé (intensité modérée). (3) `faille_vide` — zone « Présent pur » qui draine 28 Résonance + knockback (pas la mort), cooldown 1.2s. (4) **Chant des cristaux** (dualité) — `cristal_resonant` violet frappé → `_activerChant(lien)` solidifie temporairement (4.5s, `body.enable` toggle) les `plateforme_resonance` du même `lien` ; bruit aux bords sûrs ↔ stalactites au centre. (5) `souffle_blizzard` — zone qui pose `_blizzardForce/_blizzardJusqu`, lu par le code de mouvement (poussée latérale). 4 salles signature `unique` tirageWeight 3 : `cristaux_chapelle_silence` (OE), `cristaux_patinoire` (OE verglas), `cristaux_choeur_mnesique` (NSEO centerpiece, plateforme N gated chant taguée `metroidvania`), `cristaux_faille_du_present` (OE). Fichiers : `data/obstacles.js` (6 defs), `salles/_format.js` (6 helpers), `entities/Obstacle.js` (palette Cristaux + routage + update + onContactJoueur + méthodes), `scenes/GameScene.js` (wiring colliders/overlaps + trigger attaque + blizzard mouvement + `_activerChant`). Validateur 104/104, 0 inaccessible. Décisions : stalactite = attaque seule, verglas modéré, chant inclus dans cette vague.
- **Dernière étape franchie (avant)** : Phase 9.x — **Migration Cristaux Glacés compact, tranche 1 (fondation)**. Étages 5-6 basculés de pins XL legacy (`salles:{}`) vers `spanningTree: true` grille 6×5 dans `etages.js`. Pool compact **from-scratch** de 21 fichiers `src/data/salles/cristaux/` : 1 carrefour fallback + 20 salles structurelles couvrant toutes les configs de portes (4 OE galerie/dallage-givre/pont-cristallin/cour-tremplins, 2 NS puits-temple/escalier-olympe, 4 coins, 4 T, 4 impasses, 2 NSEO plateaux-flottants/ascension-sacrée). Identité marbre/glace divine réutilisant les mécaniques EXISTANTES reskinées (pieu=stalactite, ressort=cristal-tremplin, sol_effrite=dalle givre, plateforme_mobile=éclat flottant, gouffreMort=vide entre plateaux) — AUCUN code engine neuf. Câblage `_index.js` (imports + TOUTES_SALLES + FALLBACK_PAR_BIOME + PAR_ID_FALLBACK + `ignoreRole` étendu à cristaux_glaces) + validateur étendu (ids cristaux). Validateur : 0 plateforme inaccessible. Décisions de scope : fondation d'abord (mécaniques signature en backlog mémoire), wall-jump différé. Le renderer parallax `CristauxGlaces.js` existait déjà (identité fond intacte).
- **Dernière étape franchie (avant)** : Phase 9.8 — **Extension toolkit Halls v2** (medium-cost) : 3 nouvelles mécaniques engine : (1) `marteau_pilon` cycle 5 phases (repos haut → chute ease-in → impact shake+poussière → repos bas → remontée ease-out), knockback horizontal selon position joueur, visuel bloc fer/cuivre rivets + ombre d'avertissement au sol pendant repos ; (2) `piston_thermique` solide bloquant en extension avec 4 phases (rentré → sortie ease-out → étendu → rétraction ease-in), knockback horizontal fort à l'impact initial, visuel tige cuivrée + tête plate + lueur incandescente en phase active ; (3) `scie_circulaire` mouvement sinusoïdal H ou V (rail visible), rotation perpétuelle = dégâts continus, 8 dents crantées animées + étincelles d'usinage. 5 salles signature : `halls_marteaux_pilons` (3 marteaux décalés), `halls_pistons_thermiques` (4 pistons latéraux + brasier menaçant), `halls_scies_couloir` (3 scies H+V + coffre haut), `halls_forge_meca` (NSEO combo méca v2 pur), `halls_arene_chaos` (NSEO combo v1+v2 ULTIME : marteau + geyser + brasier + bloc charbon). Backlog Phase 9.8 mis à jour (3 idées medium cochées). Validateur 79/79 OK.
- **Dernière étape franchie (avant)** : Phase 9.7 — Extension toolkit Halls v1 (geyser/acide/bloc charbon + 5 signatures).
- **Dernière étape franchie (avant)** : Phase 9.6 — Migration complète Halls Cendrés en compact 960×540.
- **Dernière étape franchie (avant)** : Phase 9.4 v3.4 — système narratif `vestige_lore` (4 monolithes posés signatures Ruines).
- **Dernière étape franchie (avant)** : Phase 9.4 Vague 1 — pool diversité +11 salles Mario/Rayman.
- **Dernière étape franchie (avant)** : Phase 9.4 Vague 1 v3.3 — fix engine gouffreMort en 2 itérations. Première tentative `Body.setBoundsCollision(L, R, U, D)` → écran noir au chargement de salle (méthode INEXISTANTE sur Body en Phaser 3.70, uniquement sur World, donc TypeError silencieux qui crash GameScene). Fix final : `body.setBoundsRectangle(new Phaser.Geom.Rectangle(0, 0, dims.largeur, dims.hauteur + 200))` qui étend les bounds custom du body vers le bas — le joueur (et ennemis) peut chuter jusqu'à y=740 avant nouveau bottom, largement de quoi déclencher la détection à y > dims.hauteur + 30. Même fix appliqué aux ennemis. Détection ennemi tombé dans update() → mort silencieuse (pas de drop, pas d'event 'enemy:dead'). v3.2 architecture conservée (pilier en 2 morceaux + asymétrie sols + fosse 180 px + murs secrets fonctionnels).
- **À tester en navigateur** : **Cristaux Vague 1 (étages 5-6)** — TUNING surtout : (1) `stalactite_resonance` (chapelle_silence/choeur_mnesique) : l'attaque décroche-t-elle bien les pics dans le rayon 190 ? avertissement (fissure) lisible ? respawn 2.6s OK ? pas de mur invisible au sol en phase brisée ; (2) `verglas` (patinoire) : intensité « modérée » correcte (glisse sentie mais récupérable) ? les îlots 410 sont-ils bien des refuges non glissants ? (3) `faille_vide` (faille_du_present) : drain 28 + knockback ressentis, cooldown 1.2s OK ; (4) **chant** (choeur_mnesique) : frapper un cristal de bord révèle-t-il les `plateforme_resonance` (translucide→solide 4.5s) ? grimper le centre en silence est-il faisable ? le N gated marche-t-il ? (5) `souffle_blizzard` : la poussée force -110 décale-t-elle les sauts sans frustrer ? Puis vérifier la fondation (gouffres mortels, navette mobile pont_cristallin, ennemis Cristaux). Puis (legacy) étages 3-4 (Halls). **Phase 9.8** : (1) `halls_marteaux_pilons` : timing entre chutes des 3 marteaux décalés, vérifier shake + bouffée de poussière à l'impact, knockback horizontal si touché ; (2) `halls_pistons_thermiques` : 4 pistons latéraux qui sortent du mur, solide bloquant en extension (peut servir de plateforme temporaire), knockback fort à l'impact initial vers le brasier central ; (3) `halls_scies_couloir` : 2 scies horizontales + 1 verticale, rotation continue visible, étincelles d'usinage, dégâts au contact ; (4) `halls_forge_meca` (NSEO signature) : combo marteau + 2 pistons + 1 scie ; (5) `halls_arene_chaos` (NSEO MEGA signature) : combo v1+v2 avec marteau + geyser + 2 brasiers + bloc charbon (8 mécaniques en simultané).
- **Prochain chantier** : **Cristaux Vague 2 — le Miroir** (plateaux qui oscillent Présent↔Miroir = solide on/off cyclique, réutilise la primitive `body.enable` toggle du chant ; faux sols miroirs ; lasers prismatiques = gel via `effetImpact: immobilise` existant). Backlog complet en mémoire `project_cristaux_mecaniques_backlog`. Modèle = vagues (helper + GameScene + entité render + 3-5 salles signature). OU tuning Vague 1 selon retours navigateur. OU Phase 9.9 Halls (vagues fonte/cheminées). OU wall-jump engine (débloque Sanctuaire Suspendu).

### Notes Phase 8 — conventions à respecter
- Saut max ABSOLU **96 px vert** ; saut horizontal max **130 px edge-to-edge**. ÉCART_VERT_SAFE = 70 (préféré). Mes "premiers paliers" depuis sol doivent être à ≤ 96 du sol, idéalement 70.
- Éboulis hauteur min **110 px** (sinon le joueur saute par-dessus). Pour bloquer vraiment, placer SOUS un plafond (tunnel) — sinon contournable.
- Salles SIGNATURE (puzzles forts) → marquer `unique: true` (max 1 par étage) + `rolesAutorises: ['main','alt','entree']` (exclues des deadends).
- Carrefour fallback par biome (`ruines_carrefour_compact`, `halls_carrefour_brasier`) est dans `salleFallback`, PAS dans `TOUTES_SALLES` → ne sort que si pool vide (sinon il dominerait toutes les configs).
- Le validateur `scripts/valider_salles.mjs` est l'outil canonique pour détecter les bugs de saut. À lancer après toute modif de salle.
- Touche **A** = ancrer (geste Ruines). Touche **TAB** = zoom-out caméra (continu tant que maintenu). Touche **N** = mute audio (legacy, NE PAS réutiliser).
- Coût ancrage = 5 Résonance (pas Fragment). Refusé si Résonance ≤ 5 OU si dans zone anti_ancrage.

## Compromis MVP — dette technique / narrative documentée
- **Miroir simplifié** : pas de drain, pas d'Absorption, pas de fenêtre de grâce. La Cité = respawn point amélioré. Mécanique LORE complète (cf. [LORE.md §6](LORE.md)) reste vision long terme.
- **Items qui modifient `passiveMiroir` ou consomment `pause_miroir`** sont silencieux (no-op) suite à la suppression du drain.
- **Pas encore implémenté** : malédictions temporelles des Noir, Vestiges du run précédent (cadavres pillables), codex, sons/musique, habitants Miroir avec phases de perception (cf. LORE §8).
- **Mort en combat = retour Cité sans pénalité** : choix design *fail and try again*. La méta-progression conserve tout (inventaire, Sel, Fragments, identifications, sceaux, carte).

## Points d'attention pour reprendre

### Architecture
- **Joueur** = `Phaser.GameObjects.Rectangle` invisible (hitbox physique) + `JoueurVisuel` (Container animé qui suit). Pareil pour ennemis / boss / coffre / PNJ.
- **Seed du run** randomisée au démarrage (`Math.random()`) et persistée dans le registry pour tout le run. Même seed = même géométrie en Présent et Miroir.
- **Registry Phaser** = état persistant. Survit aux `scene.restart()` (transitions de salle, basculements). Communication scène ↔ scène via `changedata-<cle>` events.
- **Pas de `MirrorScene` séparée** : `GameScene` branche normal/miroir conditionnellement.
- **`Phaser.Scale.FIT` + `CENTER_BOTH`** : coordonnées internes 960×540, canvas s'adapte à la fenêtre.

### Règles d'imports
- **`config.js` ne doit RIEN importer du projet** (sinon TDZ par import circulaire). L'enregistrement des scènes vit dans `main.js`.
- Les registries de comportements/visuels ennemis utilisent un `_registry.js` séparé pour éviter les circular imports.

### Doctrine "head-bonk" (Phase 2a)
- Joueur 60 px de haut + plateforme 18 px = 78 px minimum entre tops de plateformes empilées au même x. Avec 70 px (`ECART_VERT_SAFE`), 8 px d'overlap → la plateforme du HAUT doit être **one-way** (`oneWay: true`) sous peine de head-bonk qui rend la plateforme du bas inaccessible.
- Pour empilements latéraux (x différents, pas d'overlap), 70 px vert reste OK avec deux plateformes normales.
- Jump max ≈ 96 px vert. Jump horiz safe ≈ 130 px edge-to-edge.

### Boss & graphe d'étage
- 7 salles max : 5 main (A→BOSS) + 0-2 dead-ends verticaux. Porte E salle BOSS gère la transition d'étage.
- Boss spawnent en salle BOSS en Présent si non tués (`enemySystem.estMort('normal', cleSalleEtage, 'boss')`).
- Boss étage 10 (`boss.def.etage === 10`) bypass le drop classique → `lancerCinematiqueFin` → `FinScene` + marker `vestige_fin_atteinte_v1`.

### Préférences utilisateur retenues
- **Plan + challenge avant code** sur les features non triviales. Proposer plan + 1-3 questions de design avant de coder. Pour les fixes triviaux ou corrections explicites, exécuter direct.
- **Loot = profondeur et choix**, jamais simplification. Décisions touchant au loot doivent privilégier la richesse mécanique.
- **Innovation visuelle et mécanique forte** cohérente au lore — sortir du plateformer générique. Style "painterly vectoriel" (primitives Phaser, pas de sprite).
- **Mémoire persistante Claude** maintenue entre conversations (préférences, décisions de design non évidentes).

## Travailler avec Claude (méta)
- **Plan + challenge avant code** : pour chaque feature non triviale, proposer plan court (objectif, fichiers touchés, archi, alternatives) + 1-3 questions de design. Pas une ligne avant validation.
- **Mise à jour de ce fichier** à la fin de chaque session : juste "État actuel" (3 lignes max) + ajouter une ligne dans la Roadmap si une phase change d'état. Le détail va dans le commit, pas ici.
- **Commits** : un par étape (ou sous-étape claire). Le `git log` sert de mémoire de progression — ne pas dupliquer.
- **Mémoire Claude** : dire explicitement *"retiens ça"* la première fois qu'une règle apparaît.
- **En début de session longue** : demander *"où on en est ?"*. Claude relit CLAUDE.md + `git log` + mémoire avant de coder.

### Cadre design — Salles signature (5 critères)
Toute nouvelle salle marquée `unique: true` (signature biome) doit cocher **≥ 3/5** :
1. **Risque** — punition réelle si on rate (pieux, gouffre létal, dégâts forts)
2. **Pression** — timing serré OU ennemi qui presse OU plafond/obstacle qui contraint la trajectoire
3. **Choix** — ≥ 2 chemins/stratégies vers l'objectif avec trade-offs lisibles
4. **Combat dans l'environnement** — ≥ 1 ennemi positionné (rôle gardien/patrouille) qui interagit avec le platforming
5. **Lecture** — zones safe vs danger visuellement distinctes au coup d'œil

Salles de transit (rôle main/alt sans `unique`) peuvent rester simples.
`tirageWeight: 3` recommandé sur chaque signature (sinon noyée dans le pool, 12.5% au lieu de ~25%).

### Conventions provisoires de test
- **Touches `K` / `H`** : -10 / +10 Résonance. Provisoire pour tester rapidement mort = retour Cité.
