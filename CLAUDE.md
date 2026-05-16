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
- ⬜ **5'** — Identité visuelle par paire d'étages (polish biome par biome)
- ⬜ **Phase 6.x** — Passes successives polish/équilibrage Phase 6 selon retours user
- ⬜ **Échos** — Re-respawn salles nettoyées en Élite + drop bonus (quand équilibrage 6 stable)

## Systèmes implémentés (récap pour reprise)

### Génération de monde
- **Graphe d'étage** : 5-7 salles en arbre `A → B → C → D → BOSS` + 0-2 dead-ends verticaux (coffre garanti). Structure pinnée par `data/etages.js`. Pool ennemis + rareté seedés mais stables (sous-RNG par salle). Carte `M` cumulative entre runs via localStorage.
- **Topographies** : ~40 dans `data/topographies.js` (30 régulières + 10 arènes boss). Owns dims + plateformes + obstacles + portes + spawnDefault. Tirage uniforme par topo.
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

- **Dernière étape franchie** : Phase 7 (musique) — moteur audio procédural Tone.js, 5 patches (menu/cité/présent/combat/boss) en crossfade 1.5 s, BPM par patch, volume + mute persistés localStorage, touche N pour couper. Aucun asset audio chargé.
- **À tester en navigateur** : musique au Menu, transition Présent/Miroir en entrant en Cité, bascule combat quand un ennemi <320 px, bascule boss en salle BOSS, fade silence en FinScene, volume −/+ et N pour mute. Phase 6.1 + 6.2 toujours non validées bout-en-bout.
- **Prochain chantier** : Phase 7.x — passes successives sur la sonorité des patches selon ressenti. Phase 6.x en attente. Échos en attente que l'équilibrage Phase 6 soit stable.

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

### Conventions provisoires de test
- **Touches `K` / `H`** : -10 / +10 Résonance. Provisoire pour tester rapidement mort = retour Cité.
