# VESTIGE — Claude Code Context

## Projet
Jeu vidéo 2D plateformer fantasy médiéval en JavaScript + Phaser.js, jouable dans le navigateur.

**Documentation de référence :**
- [GDD.md](GDD.md) — mécaniques de jeu actuelles + scope MVP
- [LORE.md](LORE.md) — cosmologie, civilisation, Résonance, Vestiges, Reflux, Doctrine

## Concept core
- **Deux mondes** : Présent (ruines post-Reflux, terrain de chasse) ↔ Miroir (passé fixé, **hub d'atelier paisible** : Fondeur + Identifieur + Marchand)
- **La Résonance** = jauge de cohérence du Vestige (équivalent PV). À 0 → mort = téléport Cité Miroir, plein heal, sans pénalité.
- **Boucle mini-jeu** : Présent (chasse) → mort/abandon → Cité (forge/identifie/vend) → vortex retour = **reset de l'étage courant** → retente plus fort. Pas de vortex volontaire en Présent : la Cité est une *récompense de défaite*, pas un bouton "save".
- **Objectif court terme** : finir les 10 étages.
- **Loot énigmatique** : 3 familles (Blanc / Bleu / Noir = Présent / Miroir / Reflux), pas de stats explicites, 3 tiers de révélation (visible / partiel / caché ★).
- **Combat RPG** : attaque (X), parry (C), sort (Z, hook). Items Corps modifient portée / dégâts / cooldown.
- **Aucun tutoriel** — le joueur découvre les règles en jouant.

## Stack technique
- Phaser.js 3 (via CDN dans `index.html`) — pas de bundler
- JavaScript vanilla (modules ES), pas de TypeScript
- Tout en canvas Phaser, pas de framework UI
- Serveur de dev : `npx live-server .` ou `npx vite`

## Structure du projet (réelle, 2026-05-12)
```
vestige/
├── index.html
├── CLAUDE.md, GDD.md, LORE.md
└── src/
    ├── main.js              ← Boot + enregistrement scènes
    ├── config.js            ← Constantes globales (PLAYER, WORLD, GAME_W/H)
    ├── data/                ← Définitions statiques (templates, palettes)
    │   ├── archetypes.js    ← 6 thèmes de salle (Sanctuaire, Hall, Crypte, Pont, Puits, Arène)
    │   ├── topographies.js  ← 5 structures physiques (Phase 2a)
    │   ├── biomes.js        ← 5 biomes × 2 étages
    │   ├── enemies.js       ← 20 ennemis paramétriques
    │   ├── boss.js          ← 10 boss skinned (3 patterns)
    │   ├── obstacles.js     ← Pieux / ressorts / plateformes mobiles
    │   ├── items.js         ← 15 items équipables + 6 consommables
    │   ├── fragments.js     ← 3 types (Blanc/Bleu/Noir)
    │   ├── recettes.js      ← 9 recettes Fondeur cachées
    │   ├── phrases-identifieur.js, phrases-marchand.js
    ├── scenes/
    │   ├── GameScene.js     ← Scène principale (Présent + Miroir conditionnel)
    │   ├── UIScene.js       ← HUD (Résonance, équipement, Sel, Fragments)
    │   ├── InventaireScene.js, MapScene.js
    │   ├── FondeurScene.js, IdentifieurScene.js, MarchandScene.js  ← Overlays Cité
    ├── systems/             ← Logique pure (pas de Phaser GameObject)
    │   ├── WorldGen.js      ← genererSalle() (orchestrateur)
    │   ├── EtageGen.js      ← graphe 7-salles par étage (Phase A)
    │   ├── ResonanceSystem.js, MondeSystem.js, InputSystem.js
    │   ├── InventaireSystem.js, EconomySystem.js, IdentificationSystem.js
    │   ├── EnemySystem.js, LootSystem.js
    │   ├── FondeurSystem.js, MarchandSystem.js
    │   ├── EnemyComportements.js, BossComportements.js  ← 4 archétypes + 3 patterns
    ├── entities/            ← GameObjects physiques
    │   ├── Enemy.js, Boss.js, Projectile.js, Obstacle.js
    └── render/              ← Couches visuelles (containers Phaser, pas de sprite)
        ├── PainterlyRenderer.js, DecorRegistry.js, Parallaxe.js
        ├── AnimationsAmbiance.js, PlateformeStyle.js
        ├── elements/        ← Primitives décor (Colonne, Statue, Lanterne, Cascade, etc.)
        ├── entities/        ← Visuels animés (Joueur, EnemyVisuel, Coffre, Fondeur, etc.)
        └── ui/              ← UI réutilisable (SlotInventaire, EmblemeFamille, etc.)
```

## Lancer le projet
```bash
npx live-server .
# touches : QD/← → bouger, ↑/Espace sauter, S/↓ descendre,
#           X attaque, C parry, E interagir, I inventaire, M carte
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

## Roadmap actuelle — mini-jeu 10 étages
*Décidée le 2026-05-12. Recentrage : finir un mini-jeu jouable (vaincre les 10 étages) avant d'ajouter des couches. Polish étage par étage.*

**Boucle cible :** Présent (chasse) → mort = Cité Miroir (forge/identifie/vend) → vortex = reset étage → retente. Cible perso : finir les 10 étages avec ≤ 3 visites en Miroir.

| Phase | État | Description |
|---|---|---|
| **1** | ✅ | **Simplification Miroir + mort = retour Cité.** Drain Miroir retiré, Cité = hub pur, vortex retour reset étage, heal complet, méta-progression conservée. |
| **2a** | ✅ | **Refactor topographie / archétype.** Découplage thème (archétype) ⊥ structure (topographie). 5 topographies pilotes. `Layouts.js` supprimé. Doctrine head-bonk documentée (plateformes empilées au même x avec 70 px vert → la plate du haut doit être one-way). |
| **2b** | ✅ | **40 topographies + tirage uniforme par topo + boss arenas dédiées.** Catalogue passé de 5 à 30 topos régulières (10 horizontales + 10 verticales ajoutées). Tirage `EtageGen` revu : uniforme par topo (plus par archétype) pour éviter la dilution des spécialisées. 10 arènes boss uniques (1/étage, complexité progressive, thème biome). Mécanisme `coffreForce` pour coffres garantis sur secrets (ex: pont haut de `corridor_ressorts`). |
| **3a** | ✅ | **Fondations bestiaire.** Split `data/enemies.js` par biome. Registry pattern pour `EnemyComportements/` (`_registry.js` séparé pour éviter circular imports). `RaritySystem` standalone (4 tiers Commun/Élite/Rare/Légendaire, probas désactivées jusqu'à 3g, hook signature-drop modulable). |
| **3b** | ✅ | **Bestiaire Ruines basses + 3 mini-systèmes transversaux.** 6 archétypes innovants : Statue Éveillée (dormant), Racine Étouffante (anchor), Mousse Glissante (trail-tile), Tombe Éclatée (spawner), Vautour de Débris (diver), Champignon-Spore (cloud). Refactor `EnemyVisuel.js` en registry. Nouveaux systèmes : `SpawnerSystem`, `EnvironmentMutators` (tile glissante), `PerceptionCloud`. Event `enemy:spawn` relayé via Enemy.js. Pool biome `ruines_basses` pondéré (50/50 basics/innovants) via duplication d'entries. |
| **3c** | ✅ | **Bestiaire Halls Cendrés.** 6 archétypes innovants : Chandelier Vivant (lighting-mod, mort = autres ennemis alpha 0.4 / 5s), Brûleur Lent (detonator, AOE explosion parryable), Cendre-Tisseuse (web-spinner, projectile `effetImpact` immobilise joueur 1s), Ardent Miroir (reflector, inverse vélocité projectiles + dgts ×1.4), Soupir Glacial (frost-trailer, tile `gele` variante glace), Tisseur d'Embrasement (wall-builder, murs feu DPS gate -4/500ms). Extensions : `EnvironmentMutators` (types `gele`+`mur_feu`), Projectile (`effetImpact`), GameScene (flag `_immobiliseJusqu` + slippery via `_tileEffectGlissant`). Pool biome `halls_cendres` pondéré. |
| **3d** | ✅ | **Bestiaire Cristaux Glacés.** 6 archétypes : Cristal-Prisme (vision-distorter, overlay sombre full-screen), Givre-Tisseur (floor-froster, tile gele sous joueur 2s), Éclat-Multiplicateur (mirror-clone, spawn clone illusoire à chaque hit), Reflet-Double (mirror-being, mime ton attaque 500ms après), Anneau de Glace (orbital, 2 éclats orbitant damaging), Polariseur (control-inverter, swap gauche/droite 1s). Systèmes : `PerceptionSystem` (5 flags), `CloneIllusionSystem`. |
| **3e** | ✅ | **Bestiaire Voile Inversé.** 6 archétypes : Anti-Bond (tire quand joueur saute), Anti-Parry (charger `parryImmune`), Mirage (phaser invisible <100px), Inverseur de Gravité (gravity-flipper, net=0 pesanteur), Trou de Mémoire (teleporter aléatoire), Reflux-Éclat (projectile applique vulnérabilité 1.5× 3s). Compromis : `parryImmune` via flag def consulté par `contactEnnemi`. |
| **3f** | ✅ | **Bestiaire Cœur du Reflux.** 6 archétypes : Cœur Fragmenté (death-shards, 3 éclats post-mortem AOE), Brisure-Tisseuse (ground-fissure, tile fissure → explose 1.5s), Regard du Reflux (gaze, rayon laser tick -2/sec), Esprit Divisé (sister-link, 3 sœurs liées via groupId, mort en chaîne), Annihilateur (parry-lock dans aura), Cohérence-Éroder (drain-aura -1/sec). Extension `EnvironmentMutators.ajouterTileFissure`. |
| **3g** | ✅ | **Rareté & polish.** Probas par étage activées (1-2 : 90/10/0/0 → 9-10 : 55/30/12/3) dans `RaritySystem`. Tirage seedé stable dans `WorldGen.genererSalle` (sous-RNG dédié). Boost Légendaire = -25 % cooldowns + comportementBoosted. FX auras (`render/entities/AuraRarete.js`) : halo doré pulsant 1.5 Hz (Élite), halo argenté + particules ascensionnelles (Rare), halo cramoisi massif + crépitement + screen-shake 220ms (Légendaire). Drops boostés par tier (sel + fragments) + item garanti T2/T3 sur Rare/Légendaire via `modificateursDrop`. Hook `dropSignature` câblé pour future intégration recettes. Enfants spawnés (sister-link, death-shards) forcés Commun pour éviter cumul d'auras. |
| **4** | ⬜ | **Étages déterministes.** `data/etages.js` assigne (archétype, topographie, pool ennemis) fixes par (étage, salleId). Variance seedée résiduelle. Mémoire de carte entre runs. |
| **5** | ⬜ | **Boss + clés d'étage + écran de victoire.** 10 boss câblés (1 par étage), drop Clé d'étage, étage 10 = Souverain du Reflux + Artefact = fin. **Mini-jeu terminable.** |
| **5** | ⬜ | **Identité visuelle par paire d'étages.** Polish itératif biome par biome. |
| **6** | ⬜ (long terme) | **Spells & combos d'équipement.** Items qui octroient un sort (touche Z), recettes re-forge combinant 2 items → nouvelle capacité. |

## Systèmes implémentés (récap pour reprise)

### Génération de monde
- **Graphe d'étage (Phase A)** : 7 salles par étage en arbre — `A → B → C → D → BOSS` (chaîne main) + dead-ends verticaux `B-haut` / `D-haut` (coffre garanti). Portes N/S/E/O bidirectionnelles. État persistant `(etage, salleId)` dans le registry. Carte avec touche M (découverte à mesure).
- **Topographies (Phase 2a)** : 5 pilotes dans `data/topographies.js` :
  - `arene_ouverte` (1600×720) : sanctuaire / hall / arene / crypte
  - `tour_verticale` (1280×1080) : sanctuaire / hall / puits / crypte
  - `croix_centrale` (1400×900) : sanctuaire / hall / crypte
  - `puits_descente` (960×1080) : puits / crypte
  - `double_etage` (1700×800) : sanctuaire / hall / pont
  - Chaque topographie owns dims + plateformes + obstacles + portes positions + spawnDefault.
- **5 biomes par paires d'étages** (`data/biomes.js`) : Ruines basses (1-2) / Halls Cendrés (3-4) / Cristaux Glacés (5-6) / Voile Inversé (7-8) / Cœur du Reflux (9-10). Chacun : palette + pool de 4 ennemis + densité (2-4 à 7-12 par salle).
- **Obstacles** (`data/obstacles.js`) : pieux (3 dégâts contact), ressorts (vy=-600), plateformes mobiles sinusoïdales. Désactivés en Miroir et en salle d'entrée Présent.
- **PRNG Mulberry32** seedé par run. Géométrie reproductible.

### Combat
- **Joueur** : Rectangle physique invisible + JoueurVisuel (silhouette + cœur lumineux dont couleur reflète Résonance). Combat X (attaque, 3-couches slash Bézier + screen shake + hit-stop + flash) / C (parry, anneau doré, fenêtre 300ms + bonus Résonance) / Z (sort, hook réservé Phase 6).
- **20 ennemis** : 4 archétypes comportementaux (Veilleur stationnaire / Traqueur volant poursuiveur / Chargeur telegraph-rush / Tireur projectile) × 5 variantes par biome. Tous en visuel paramétrique (`render/entities/EnemyVisuel.js`).
- **10 boss** : 3 patterns (Colosse smash AOE / Tisseur projectiles téléguidés / Hydre composite multi-phases) × 10 skins. Halo additif pulsant + traînée de braises. Gating : porte E salle BOSS bloquée tant que boss vivant. Drop : T3 garanti + 10-25 Sel + 3 Fragments.
- **Projectiles** : orbe + halo + traînée + homing optionnel + parry-able.

### Loot & économie
- **Inventaire 40 slots** + 3 slots équipement (tête/corps/accessoire). Persisté dans le registry.
- **15 items** équipables (3 familles × 5 par famille, plusieurs tiers). 3 tiers de révélation des effets (visible / partiel / caché ★).
- **6 consommables** : Larme / Cendre / Sel / Œil de Verre / Pierre d'Ancrage / Encre du Témoin.
- **Économie** : Sel de Résonance (monnaie) + 3 types de Fragments (matière première). Drops ennemis : 2-5 Sel + 35 % chance Fragment de famille naturelle. Coffres : 85 %+ Fragment (mini-jeu).
- **Carnet du Vestige** (UI inventaire) : cadre stylisé, emblèmes vectoriels, slots dorés, panneau détail avec révélations contextuelles.

### Cité Marchande (Miroir)
- **Salle A en Miroir** est forcée en `arene_ouverte` thématisée Sanctuaire → cité marchande majestueuse (`planCiteMarchande` dans DecorRegistry).
- **3 PNJ artisans** rassemblés sur le sol (positions fixes 30/50/72 % de largeur) :
  - **Le Fondeur** (`FondeurScene`) : combine 1-2 Fragments + Sel → item Tier 3. 9 recettes cachées. Phrases cryptiques.
  - **L'Identifieur** (`IdentifieurScene`) : révèle 1 effet à la fois, coût 5/12 Sel ou 1 Encre du Témoin. Phrases poétiques par cible.
  - **Le Marchand / la Glaneuse** (`MarchandScene`) : vitrine 4 items / rachat 30 % / fragmentation (item → Fragments, 10 % chance bonus Noir en T3). Onglets VITRINE / RACHAT / FRAGMENTER.

### Direction artistique
- **Palette Présent (Mémoire Endormie)** vs **Miroir (Mémoire Vive)**. Tinte par biome.
- **Parallax 4 couches** : ciel/abîme (Canvas dégradé) → silhouettes lointaines (x0.3) → silhouettes proches (x0.7) → foreground (x1.05-1.15).
- **Plateformes** ornées (pierre cassée + mousse Présent / pavés ornés + chasse-pieds doré Miroir).
- **Animations atmosphériques** : halo joueur additif en Miroir, brume bleutée au sol en Présent, rayons dorés obliques en Miroir, lanternes flicker, banderoles ondulent, drapeaux ondulent, fumée d'atelier.
- **Cascades signature** par biome (eau / cendres / cristaux / voile / Reflux).
- **Entités** : tous les visuels sont des Containers Phaser qui suivent un Rectangle physique invisible. Coffre = animation d'ouverture (couvercle pivote + étincelles + cube vol vers joueur).

## État actuel
*À mettre à jour à la fin de chaque session.*

- **Dernière étape franchie** : **Phase 3g — Rareté & polish**. `RaritySystem` activé : probas progressives par étage (1-2 : 90/10/0/0, 5-6 : 72/22/5/1, 9-10 : 55/30/12/3), tier seedé stable côté `WorldGen.genererSalle` via sous-RNG dédié (`seedEtage ^ 0x5A17B0B0 ^ hashStr(salleId)`) — un Légendaire est le même entre visites. Boost Légendaire = stats × selon table + -25 % sur tous les cooldowns connus (`delaiTir`, `delaiTelegraph`, `delaiCharge`, etc. avec plancher 100ms). Nouveau module `render/entities/AuraRarete.js` (halo blendMode ADD 3 cercles + pulse tween + particules ascensionnelles Rare/Légendaire + screen-shake 220ms Légendaire). Cleanup auto sur `enemy:dead`. `_dropEconomique` étendu : `modificateursDrop(tier)` ajoute sel + fragments + item garanti T2/T3 sur Rare/Légendaire. Hook `dropSignature` câblé (modulaire pour future intégration recettes). Fix latent : enfants spawnés (sister-link, death-shards) qui clonaient `def.rarete` du parent Légendaire sont forcés Commun dans `_instancierEnnemi` (sinon screen-shake × N).

- **Précédentes étapes** : **Phases 3d + 3e + 3f** Bestiaires Cristaux / Voile / Reflux (18 archétypes + `PerceptionSystem` + `CloneIllusionSystem` + tile fissure). **Phase 3c** Halls Cendrés (10 ennemis, `EnvironmentMutators` gele/mur_feu, Projectile.effetImpact). **Phase 3b** Ruines basses (6 archétypes + SpawnerSystem + PerceptionCloud + tile glissante). **Phase 3a** Fondations bestiaire (split data + registry comportements/visuels + RaritySystem standalone).

- **Historique compact** *(commits précédents — voir `git log` pour le détail)* :
  - **Phase 1** — Simplification Miroir : drain retiré, Cité = hub pur, mort = retour Cité (heal complet, méta conservée), vortex retour = reset étage courant.
  - **Variété des salles** (3c159d9) — 18 layouts + obstacles + cascades. Layouts.js depuis supprimé en 2a, mais obstacles + cascades restent.
  - **Bestiaire A+B** (4358cde) — 20 ennemis + 10 boss + 5 biomes.
  - **Étape 9d'** — Cité marchande (3 PNJ rassemblés en salle A Miroir).
  - **Phase A** (d9e87f8) — graphe d'étage 7-salles + carte M + fix Puits Inversé.
  - **Étapes 9a-9d** — économie + Fondeur + Identifieur + Marchand.
  - **Étapes 8a-8b6** — direction artistique (archétypes, décor, parallax, entités stylisées, UI Carnet du Vestige, polish animations).
  - **Étape 7** — combat RPG (X/C/Z, parry, patterns difficulté).
  - **Étape 6** — loot (3 familles, 3 tiers, inventaire 40 slots, équipement 3 slots).
  - **Étape 5** — basculement Présent ↔ Miroir (avant Phase 1 qui l'a simplifié).
  - **Étapes 2-4** — Phaser setup + génération de salles + Résonance + HUD.

- **Prochain chantier** : **Phase 4 — Étages déterministes.** `data/etages.js` à créer : assigner (archétype, topographie, pool ennemis) fixes par `(étage, salleId)` pour rendre la progression apprenable (le run N+1 reconnaît la salle B-haut de l'étage 5). Variance seedée résiduelle pour la microgéométrie. Mémoire de carte entre runs. Vérifier compat avec le tirage de tier (qui dépend déjà du seed étage + salleId — donc stable, mais on pourra envisager de pinner les tiers boss/élite à des positions narratives).

## Compromis MVP — dette technique / narrative documentée
- **Miroir simplifié** : pas de drain, pas d'Absorption, pas de fenêtre de grâce, pas d'Artefact. La Cité = juste un respawn point amélioré. La mécanique complète d'Absorption + Artefact + fenêtre de grâce (cf. [LORE.md §6](LORE.md)) reste **vision long terme post-mini-jeu**.
- **Items qui modifient `passiveMiroir` ou consomment `pause_miroir`** sont devenus silencieux (no-op) suite à la suppression du drain. À nettoyer dans la passe polish items (Phase 5).
- **Items du Miroir équipables directement** : alors que LORE prévoit que seuls les Fragments bruts existent et qu'il faut les transformer en Miroir pour obtenir des items. Le pipeline Fragment → Fondeur → item existe ; mais les coffres peuvent encore donner directement un item Tier 1-2. Compatible avec une future transition "Fragments-only" si décidée.
- **Pas encore implémenté** : sorts (Z hook réservé), malédictions temporelles des Noir, identification des Tier III par Œil-Témoin, items "game-changers" (wall-grip, drop-down, slow-mo, fil d'Ariane), Vestiges du run précédent (cadavres pillables), codex, sons/musique.
- **Habitants Miroir** : phases de perception (transparence → curiosité → hostilité, cf. LORE §8) non implémentées — ils sont 100 % paisibles et invisibles.
- **Mort en combat = retour Cité sans pénalité** : choix design *fail and try again* du mini-jeu. La méta-progression conserve tout (inventaire, Sel, Fragments, identifications).

## Points d'attention pour reprendre

### Architecture
- **Joueur** = `Phaser.GameObjects.Rectangle` invisible (hitbox physique) + `JoueurVisuel` (Container animé qui suit). Pareil pour ennemis / boss / coffre / PNJ.
- **Aucun asset graphique** : tout en primitives Phaser (Graphics, Rectangle, ParticleEmitter, Tween). Préférence utilisateur pour ce style "painterly vectoriel" — à conserver.
- **Seed du run** randomisée au démarrage (`Math.random()`) et persistée dans le registry pour tout le run. Même seed = même géométrie en Présent et Miroir.
- **Registry Phaser** = état persistant. Survit aux `scene.restart()` (transitions de salle, basculements). Communication scène ↔ scène via `changedata-<cle>` events.
- **Pas de `MirrorScene` séparée** : `GameScene` branche normal/miroir conditionnellement.
- **`Phaser.Scale.FIT` + `CENTER_BOTH`** : coordonnées internes 960×540, canvas s'adapte à la fenêtre.

### Règles d'imports
- **`config.js` ne doit RIEN importer du projet** (sinon TDZ par import circulaire). L'enregistrement des scènes vit dans `main.js`.

### Doctrine "head-bonk" (Phase 2a)
- Joueur 60 px de haut + plateforme 18 px = 78 px minimum entre tops de plateformes empilées au même x. Avec 70 px (`ECART_VERT_SAFE`), il y a 8 px d'overlap → la plateforme du HAUT doit être **one-way** (`oneWay: true`) sous peine de head-bonk qui rend la plateforme du bas inaccessible.
- Pour les empilements latéraux (x différents, pas d'overlap), 70 px vert reste OK avec les deux plateformes normales.
- Jump max ≈ 96 px vert. Jump horiz safe ≈ 130 px edge-to-edge (le legacy puits utilisait 144 px, jouable mais limite).

### Phase A — graphe d'étage
- 7 salles : 5 main (A→BOSS) + 2 dead-ends verticaux possibles. La porte E de la salle BOSS gère la transition d'étage (sans voisin dans le graphe). Phase 4 du mini-jeu remplacera ce gating par une **Clé d'étage** dropée par le boss.

### Boss
- Spawnent en salle BOSS en Présent si non tués (`enemySystem.estMort('normal', cleSalleEtage, 'boss')`). Phase A : boss FONCTIONNEL mais pas encore "objectif final" — Phase 4 ajoutera Clé d'étage + Artefact + écran victoire.

### Préférences utilisateur retenues
- **Plan + challenge avant code** sur les features non triviales. Proposer plan + 1-3 questions de design avant de coder. Pour les fixes triviaux ou corrections explicites, exécuter direct.
- **Loot = profondeur et choix**, jamais simplification. Décisions touchant au loot doivent privilégier la richesse mécanique.
- **Innovation visuelle et mécanique forte** cohérente au lore — sortir du plateformer générique. Préférence pour le style "painterly vectoriel" (primitives Phaser, pas de sprite).
- **Mémoire persistante Claude** maintenue entre conversations (préférences, décisions de design non évidentes).

## Travailler avec Claude (méta)
- **Plan + challenge avant code** : pour chaque feature non triviale, proposer plan court (objectif, fichiers touchés, archi, alternatives) + 1-3 questions de design. Pas une ligne avant validation.
- **Mise à jour de ce fichier** à la fin de chaque session : "État actuel" + roadmap. Les anciennes étapes vont en "Historique compact".
- **Commits** : un par étape MVP franchie (ou sous-étape claire). Le `git log` sert de mémoire de progression.
- **Mémoire Claude** : dire explicitement *"retiens ça"* la première fois qu'une règle apparaît.
- **En début de session longue** : demander *"où on en est ?"*. Claude relit CLAUDE.md + `git log` + mémoire avant de coder.

### Conventions provisoires de test
- **Touches `K` / `H`** : -10 / +10 Résonance. Provisoire pour tester rapidement mort = retour Cité. À retirer quand stable.
