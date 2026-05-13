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
| **4** | ✅ | **Étages déterministes.** `data/etages.js` pin (archétype, topographie, présence deadend) par (étage, salleId) — structure fixe d'un run à l'autre. Le pool ennemis et la rareté restent seedés (variance vivante au sein d'une structure stable). Mémoire de carte cumulative entre runs via localStorage (`CarteMemoire.js`). |
| **5a** | ✅ | **Sceaux d'étage.** 10 emblèmes HUD (un par boss vaincu), persistance localStorage entre runs (`SceauxSystem.js`). Anim pop + halo doré au remplissage. Visuels thématiques par biome + couronne dorée pour le Souverain. |
| **5b.1** | ✅ | **Vestiges — fondations.** Nouvelle catégorie de loot : Vestige (drop boss exclusif). 3 slots dédiés `{geste, maitrise1, maitrise2}` séparés de tête/corps/accessoire. 10 Vestiges éditorialisés (5 Maîtrises passives + 4 Gestes actifs + 1 Artefact). Drop signature au boss, no-redrop si déjà possédé. Layout 2 colonnes dans `InventaireScene` (Équipement \| Vestiges). Panneau détail refondu en layout horizontal responsive. |
| **5b.2** | ✅ | **Vestiges — capacités.** Touche V → intention `geste`. `GesteSystem` (registry modulaire) implémente les 4 Gestes (onde du Glas / filet de Cendre / œil-témoin / sève d'Hydre). 4 Maîtrises actives : double-saut, slow-mo parry, renaissance (auto-revive 1×), révélation totale T3. Max Résonance dynamique (Cœur Pierreux +20). Panneau détail enrichi : description explicite Geste/Maîtrise. Marqueurs sur les slots (triangle/anneau/étoile). Choix MAÎT. I vs MAÎT. II. Inventaire plein → drop pending récupérable à la prochaine entrée salle BOSS. |
| **5c.2** | ✅ | **Écran de victoire + cinématique fusion + Artefact.** Boss étage 10 vaincu → cinématique scriptée (flash blanc, Artefact descend du ciel en rotation, joueur s'élève vers lui, faisceau de lumière, fusion, silhouette d'ombre → Vestige incarné) → `FinScene` (texte poétique 12 lignes en cascade + héros en hero shot + 3 boutons Recommencer/Rester contempler/Quitter). Marker localStorage `vestige_fin_atteinte_v1`. **Mini-jeu terminable.** |
| **5c.1** | ✅ | **MenuScene de démarrage.** Lancée au boot avant GameScene. Titre VESTIGE Georgia 56px doré + halo additif pulsant, sous-titre poétique (variante post-fin), 3 boutons painterly (Nouvelle partie / Continuer grisé option C / Quitter → MenuScene). Ambiance ruines au crépuscule : silhouettes lointaines, 3 lanternes éteintes au sol avec reflet doré scintillant, brume bleutée mouvante, particules de cendre, vignette. Étoile dorée à côté du titre si `vestige_fin_atteinte_v1`. Markers : `vestige_run_actif_v1` posé par GameScene + cleared par FinScene. Reset registry sur "Nouvelle partie". |
| **5c.3** | ⬜ | **Polish HUD cooldown Geste.** Overlay sombre tournant sur slot Geste du HUD + label numérique. |
| **5'** | ⬜ | **Identité visuelle par paire d'étages.** Polish itératif biome par biome. |
| **6** | ✅ | **Crafting profond + score continu + sorts + Garde — système unifié Phase 6.** Tout le loot est une INSTANCE forgée (objets `{ _instance, uid, templateId, score, affixesPrim, affixesExo, sortId, signatureId, revele, compteurs }`). Le legacy `data/items.js` n'est plus jamais drop — il sert encore aux Vestiges, mais l'inventaire ne contient plus que des instances + des Vestiges (strings). Score 0-100 continu (`ScoreSystem.js`) → 7 tiers couleur (Brisé/Commun/Étoilé/Spectral/Royal/Reliquaire/Perfect) + chiffre exact affiché. **CraftingSystem** : 3 onglets dans la Table de Forge — Fragments (produit une instance score 38-65 selon nombre/famille de fragments) / Combiner 2 items (variance + risque Brisé) / Re-Résonner (reroll avec Encre + lock 1 stat). **Identifieur Phase 6** : liste les instances avec exotique/sort/signature non révélés, coûts en Sel (6/15/30) ou 1 Encre du Témoin pour tout révéler. **Marchand Phase 6** : VITRINE (4 instances seedées par salle), RACHAT (prix selon score), FRAGMENTER (1-4 fragments selon score, bonus Noir 10 % pour score 70+). 15 templates × 7 stats primaires (armure / Garde max / Garde regen / dégâts / vitesse attaque / parry / saut) avec diminishing returns. **Affixes** : 12 exotiques (procs, mods), 20 signatures uniques pour score 95+. **Garde** : barre de PV regen au-dessus de la Résonance (absorbe en priorité, 3s avant regen). **Sorts** : 25 sorts portés par les items, touches 1/2/3 = sort par slot (tête/corps/acc), cooldown propre, coût Résonance pour les puissants. **AuraItem** : trail/halo/cœur du joueur selon score max équipé. Inventaire étendu à 60 slots (10×6). Buff statique léger par étage (+8 % PV / +5 % dmg cumulatif). Boss → instances score 80+ garanties. |

## Systèmes implémentés (récap pour reprise)

### Génération de monde
- **Graphe d'étage (Phase A)** : 5-7 salles par étage en arbre — `A → B → C → D → BOSS` (chaîne main) + 0 à 2 dead-ends verticaux `B-haut` / `D-haut` (coffre garanti). Présence des deadends pinnée par `data/etages.js` depuis Phase 4. Portes N/S/E/O bidirectionnelles. État persistant `(etage, salleId)` dans le registry. Carte avec touche M, cumulative entre runs (Phase 4, via `CarteMemoire.js` + localStorage).
- **Étages déterministes (Phase 4)** : `data/etages.js` figé pour les 10 étages (archétype, topographie, présence deadend par salleId). Le pool ennemis + tier rareté restent seedés mais stables (sous-RNG par salle dans `WorldGen`). Permet d'apprendre les étages run après run sans tomber dans la stricte répétition.
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

- **Dernière étape franchie** : **Phase 6 — Crafting profond + score continu + sorts + Garde**. Refonte massive du loot. Coexistence de deux formats dans l'inventaire : strings legacy (`'lame_sources'`) et **instances forgées Phase 6** (objets `{ _instance: true, uid, templateId, score, affixesPrim, affixesExo, sortId, signatureId, revele, compteurs }`). Helper central `resolveItemDef(entry)` dans `ItemForge.js` + extension de `getItemOuVestige` dans `data/items.js` pour gérer les deux types. **Score continu 0-100** (`ScoreSystem.js`) avec 7 tiers couleur (Brisé/Commun/Étoilé/Spectral/Royal/Reliquaire/Perfect iridescent) + chiffre exact affiché sur l'item et bord coloré par score. Distribution skewed selon contexte (sol mean ~35, boss mean ~75, forge variance ±15 + jackpot 1%). **CraftingSystem** : 3 onglets dans la Table de Forge — `FRAGMENTS` (legacy preserve via FondeurSystem), `COMBINER` (2 instances → 1 nouvelle, coût Sel exponentiel selon tier, risque Brisé 5-40 %, jackpot 1 %), `RE-RÉSONNER` (reroll consommant 1 Encre du Témoin + Sel, lock optionnel d'une stat). **Templates** (`data/templatesItems.js`) : 15 archétypes × biais de stats × pool de sorts. **Stats** (`data/stats.js`) : 7 primaires (armure, gardeMax, gardeRegen, attaqueDegats, attaqueVitesse, parryFenetre, sautHauteur) avec `calculerEffectif` qui applique des diminishing returns asymptotiques au-delà du seuil linéaire. **Affixes** (`data/affixes.js`) : 12 exotiques (proc gel parry, brûlure hit, soin/garde kill, double attaque, AOE kill, saut résonance, parry AOE, résonance max +15, dash court, éclat posthume, vol résonance) — pondérés par poids et gated par tierMin. **Signatures** (`data/signatures.js`) : 20 effets éditoriaux uniques pour score ≥ 95 (Aube de la Septième Cendre, Cœur de Marbre, etc.), affichées en italique doré sous le nom. **Sorts** (`data/sorts.js`) : 25 sorts portés par les items, dispatch via `SortSystem.js` (switch sur code : tir_conique, bond_aoe, spin, frappe_lourde, mur_temporaire, buff_garde, miroir_invu, dash_invu, buff_armure, heal_resonance, projectile_homing, charge_horizontale, aoe_souleve, super_saut, tp_entree, orbe_arme, buff_regen_garde, heal_lent, projectile_perce, projectile_eventail, gel_zone, invisibilite, rayon, tp_dernier_hit, buff_aspd, heal_garde). 3 slots → touches 1/2/3 (`InputSystem` étendu, sortTete/sortCorps/sortAccessoire). Cooldown propre, coût Résonance pour les sorts puissants. **Garde** (`GardeSystem.js`) : barre de PV regen au-dessus de la Résonance (`render/ui/BarreGarde.js`). Absorbe les dégâts en priorité (wrapper monkey-patch sur `resonance.prendreDegats`), regen après délai de 3s sans dégât. Max + vitesse pilotés par les affixes Phase 6. **RevelationSystem** : auto-révélation par usage (hits, parries, sauts) → 30/60/100 hits cumulés débloquent 1/2/3 affixes primaires. Exotiques + sort + signature restent cachés jusqu'à Identifieur (TODO). **AuraItem** (`render/entities/AuraItem.js`) : aura visuelle progressive selon score max équipé (spectral 70+ pulse violet, royal 85+ trail doré, reliquaire 95+ aura cramoisi massive, perfect 100 = cycle iridescent + trail dense). **PanneauDetail** : branche dédiée pour les instances (losange coloré, score chiffré géant, signature italique dorée, liste affixes primaires révélés/cachés, exotiques en violet, sort avec touche assignée 1/2/3 + cooldown). **SlotInventaire** : badge score chiffré + bord coloré + halo pour score ≥ 70. Inventaire étendu à **60 slots** (10×6, taille 32px). Buff statique léger par étage : +8 % PV / +5 % dégâts cumulatif (`_instancierEnnemi`). Items legacy conservés en early game (étages 1-3), instances dominantes dès étage 4 (`probaInstanceForge(etage)`), Légendaires boss forcent l'instance avec contexte boss (score skewed haut). `LootSystem.tirerItem` accepte maintenant `{ etage, forceInstance, contexte, scoreBase }`. `_dropItemTierMin` et coffres adaptés (entrée = instance ou id selon type). Signatures gameplay câblées : Serment du Vide (+35 % dmg à 0 Garde), Serment du Dernier Souffle (+100 % aspd <20 PV), Diadème Jumelé (-30 % CD sort tête). Procs câblés : gel parry, parry AOE, double attaque, vol résonance, AOE kill, soin/garde kill, saut résonance.

- **Phase 5c.1 précédente** : MenuScene de démarrage avec ambiance ruines crépuscule, titre VESTIGE doré, 3 boutons painterly (Nouvelle partie / Continuer grisé / Quitter), étoile dorée si fin atteinte, markers localStorage `vestige_run_actif_v1`. Reset registry sur Nouvelle partie.

- **Phase 5c.2 précédente** : Écran de victoire + cinématique fusion + Artefact. **Mini-jeu terminable.** Boss étage 10 (`boss.def.etage === 10`) bypass le drop classique et déclenche `lancerCinematiqueFin(scene, boss)` via le handler `boss:dead`. Nouveau `systems/CinematiqueFusion.js` : séquence scriptée freezant inputs + ennemis + projectiles via flag `scene._cinematiqueFinEnCours` (early-return d'`update()`), `UIScene` mise en sleep, gravité du joueur désactivée. Séquence en 5 temps : (1) flash blanc plein écran + screen-shake 220ms, (2) Artefact (rectangle doré incandescent + halo additif + particules ascensionnelles) descend du plafond en rotation 360° pendant 2.2s, (3) joueur tweené vers l'Artefact (Cubic.InOut 900ms) avec faisceau de lumière doré redessiné chaque frame, (4) fusion : flash blanc intense + screen-shake 350ms, Artefact disparaît (scale 0.3), `JoueurVisuel` fade alpha 0, instanciation `VestigeIncarne` 250ms après pic (masqué par flash) avec tween fade-in + pose, (5) hold contemplatif 1.5s puis fade noir 1.4s → `scene.start('FinScene')`. Marker `localStorage.setItem('vestige_fin_atteinte_v1', 'true')` posé juste avant le start. Nouveau `render/entities/VestigeIncarne.js` (mêmes proportions que JoueurVisuel pour cross-fade cohérent) : peau ivoire patiné, manteau bleu-violet profond avec reflet, plastron de cuir avec sigil losange doré central, couronne d'or fracturé sur le front (arc + 3 pointes), yeux dorés additifs, cœur doré stable, broderies + 3 fragments à la ceinture (blanc/azur/obsidienne), particules dorées ascensionnelles via `time.addEvent`. Tweens idle : respiration scaleY, pulse cœur+yeux, ondulation manteau. Nouveau `scenes/FinScene.js` : fond noir 0x080610 + vignette + particules dorées flottantes ambient (spawnées en bas, montent vers le haut), hero shot central (`VestigeIncarne` scale 2.2 à y=130 + halo additif), 12 lignes poétiques apparaissant en cascade depuis y=245 (font Georgia 13px, espacement 17px, fade 1100ms par ligne, intervalle 650ms, 3 lignes vides = pauses respiratoires), 3 boutons painterly à y=510 (Recommencer/Rester contempler/Quitter) avec hover (manteau bleu-violet + texte plus clair). "Recommencer" → fade noir + `window.location.reload()` (registry vidé, run reset, mais localStorage préservé = sceaux + carte + identifs + marker fin conservés). "Rester contempler" → fade-out des boutons, hint subtil "— recharge la page pour repartir —" qui apparaît à leur place après 1.8s. "Quitter" → fade noir + message "Le Vestige se retire." (le menu démarrage viendra en 5c.1). `main.js` expose `window.game = new Phaser.Game(...)` pour debug console.

- **Précédentes étapes** : **Phase 5b.2** Vestiges capacités (touche V + 4 Gestes + 4 Maîtrises actives + max Résonance dynamique). **Phase 5b.1** Vestiges fondations (10 items boss exclusifs + 3 slots dédiés + layout 2 colonnes + panneau détail responsive). **Phase 5a** Sceaux d'étage (10 emblèmes HUD persistés en localStorage). **Phase 4** Étages déterministes (`data/etages.js` + `CarteMemoire.js`). **Phase 3g** Rareté & polish (probas par étage + auras + drops boostés). **Phases 3d + 3e + 3f** Bestiaires Cristaux / Voile / Reflux (18 archétypes + `PerceptionSystem` + `CloneIllusionSystem` + tile fissure). **Phase 3c** Halls Cendrés (10 ennemis, `EnvironmentMutators` gele/mur_feu, Projectile.effetImpact). **Phase 3b** Ruines basses (6 archétypes + SpawnerSystem + PerceptionCloud + tile glissante). **Phase 3a** Fondations bestiaire (split data + registry comportements/visuels + RaritySystem standalone).

- **Historique compact** *(commits précédents — voir `git log` pour le détail)* :
  - **Phase 2b** — 40 topographies (30 régulières + 10 arènes boss) + tirage uniforme par topo + `coffreForce`.
  - **Phase 2a** — Refactor topographie ⊥ archétype, doctrine head-bonk documentée.
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

- **Phase 6.1 — Première passe de corrections** (suite à la review user) :
  - **Signatures undefined** : 5 signatures avaient leur `id` ≠ clé dans `data/signatures.js` (serment_du_dernier_souffle, couronne_des_quatre_vents, main_qui_n_oublie, pierre_d_avant, voile_des_ages). Aligné. Plus défense `if (!sig)` dans PanneauDetail. Et auto-sanitize au démarrage : `InventaireSystem.constructor` nettoie les sortId/signatureId orphelins dans les instances présentes en inventaire ou équipement.
  - **Stacking exotiques** : `flagsExotiquesActifs` accumule désormais `count` + `sources[]` (au lieu d'écraser). `bonusResonanceMax` multiplie par `count` → deux "Cœur dilaté" donnent +30. Idem pour les procs additifs (soin_kill, garde_kill, saut_resonance, vol_resonance).
  - **Reroll seed loot à la mort** : `cite_visites` incrémenté à chaque `retourAuNormal`, XOR dans la seed `rngLoot`. Ennemis stables, loots différents à chaque visite Cité.
  - **Palette 7 couleurs** (feedback user) : Gris → Blanc → Vert → Bleu → Violet → Orange → Rouge. Plus d'iridescent ; Perfect = rouge éclatant. `AuraItem` mis à jour pour utiliser la couleur du tier directement.
  - **Mur de cendre** : repositionné (bord bas au niveau du sol joueur), visuel painterly (corps pierre + stries verticales + bord doré + particules de cendre ascensionnelles + anim rise-from-below).
  - **Panneau détails compacté** : tailles 9px (était 10), espacement 11px (était 12-22), hauteur dynamique des descriptions exotiques avec `txt.height`, break-out au-delà de `yMax = yBtn - 8` pour empêcher l'overflow sous les boutons.
  - **Badge slot** (T/C/A) dans SlotInventaire bas-gauche pour voir tête/corps/accessoire sans cliquer. Pas affiché pour les Vestiges (marqueur dédié).
  - **Drop rates Présent réduits** : `peutEtreDrop` × 0.45. `tirerScoreDrop('sol')` recentrée autour de `base` (qui scale avec étage : +3/étage à partir d'une base 25). Donc étage 1 ≈ Brisé/Commun, étage 10 ≈ Spectral/Royal.
  - **Garde barre fine bleue** : repositionnée SOUS la Résonance (au lieu d'au-dessus), hauteur 5 px, couleur bleu vif (0x60a0e8), pas de label texte (juste valeur compacte 8px à droite).
  - **Fondeur upgrade** : nouveau `FondeurUpgradeSystem` + 5 paliers (Foyer du Vestige → Foyer du Reflux) persistés en localStorage (`vestige_fondeur_niveau_v1`). Chaque palier : +scoreBonus (0/5/10/15/20/30) et -risqueBriseReduit (0/5/10/15/20/30 %). Coûts exponentiels en Sel + Fragments. Nouvel onglet `AMÉLIORER` (touche 4) dans la Table de Forge. Le bonus s'applique automatiquement à `FondeurSystem.forger` (fragments → instance) et à `CraftingSystem.combiner` (réduction risque Brisé + boost score).

- **⚠️ Review (continuée)** : la Phase 6.1 ajoute des correctifs mais reste **non testée bout-en-bout en navigateur**. Points à valider après cette passe : (a) cleanup auto des items legacy/orphelins au démarrage, (b) signatures Médaille de l'aube + Plastron gravé affichent leur nom propre + description, (c) deux Cœur dilaté donnent bien +30 Résonance max, (d) loot change après retour Cité, (e) mur de cendre est posé devant le joueur au niveau du sol, (f) panneau détails ne dépasse plus les boutons même avec 4 stats + 2 exotiques + 1 sort + 1 signature, (g) badge T/C/A visible sur chaque item équipable de l'inventaire, (h) drop rates feels OK en early game, (i) barre Garde bleue fine sous la Résonance, (j) onglet AMÉLIORER + achat palier 1 fonctionne, (k) palier persiste après reload page.

- **Prochain chantier** : Phase 6.x — passes successives sur les retours user après tests en navigateur. Le système d'Échos (re-respawn salles nettoyées en Élite + drop bonus) reste à implémenter quand l'équilibrage de Phase 6 sera stable.

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
- 7 salles max : 5 main (A→BOSS) + 0-2 dead-ends verticaux (présence pinnée par `data/etages.js` depuis Phase 4). La porte E de la salle BOSS gère la transition d'étage (sans voisin dans le graphe). Phase 5 du mini-jeu remplacera ce gating par une **Clé d'étage** dropée par le boss.

### Boss
- Spawnent en salle BOSS en Présent si non tués (`enemySystem.estMort('normal', cleSalleEtage, 'boss')`). Phase A : boss FONCTIONNEL mais pas encore "objectif final" — Phase 5 ajoutera Clé d'étage + Artefact + écran victoire.

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
