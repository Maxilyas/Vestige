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
| **2b** | ⬜ | **Compléter à 18-20 topographies.** `labyrinthe_murs`, `pont_brise`, `gouffre_lateral`, `corridor_pieges`, `cascade_plateformes`, `salle_pieux_plafond`, `arene_boss` dédiée, etc. |
| **3** | ⬜ | **Étages déterministes.** `data/etages.js` assigne (archétype, topographie, ennemis) fixes par (étage, salleId). Variance seedée résiduelle. Mémoire de carte entre runs. |
| **4** | ⬜ | **Boss + clés d'étage + écran de victoire.** 10 boss câblés (1 par étage), drop Clé d'étage, étage 10 = Souverain du Reflux + Artefact = fin. **Mini-jeu terminable.** |
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

- **Dernière étape franchie** : **Phase 2a — Refactor topographie / archétype**. Découplage thème ⊥ structure. Nouveau `data/topographies.js` (5 pilotes). Archétype réduit à id+nom+niveauxAssocies. `EtageGen` pick (archétype, topographie compatible+portes). `Layouts.js` supprimé. HUD étendu : `Étage X · Archétype (Topographie) · ENTRÉE`. Bugs reachability corrigés (head-bonk : plateformes hautes empilées doivent être one-way). Ennemis ne spawn plus sur plateformes one-way.

- **Précédente étape** : **Phase 1 — Simplification Miroir**. Drain retiré, Cité = hub pur, mort = retour Cité (heal complet, méta conservée), vortex retour = reset étage courant. Pas de vortex volontaire en Présent. `MondeSystem` simplifié. `InventaireSystem.resetEtage()` + `EnemySystem.resetEtage()` filtrent par `:e<numero>:`.

- **Historique compact** *(commits précédents — voir `git log` pour le détail)* :
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

- **Prochain chantier** : **Phase 2b — Compléter à 18-20 topographies**. Architecture posée, maintenant remplir : `labyrinthe_murs`, `pont_brise`, `gouffre_lateral`, `corridor_pieges` (gauntlet pieux), `cascade_plateformes`, `salle_pieux_plafond`, `arene_estrade`, `pont_double`, `arene_boss` dédiée.

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
