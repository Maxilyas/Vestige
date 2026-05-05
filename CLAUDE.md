# VESTIGE — Claude Code Context

## Projet
Jeu vidéo 2D plateformer fantasy médiéval en JavaScript + Phaser.js.
Prototype jouable dans le navigateur.

**Documentation de référence :**
- [GDD.md](GDD.md) — mécaniques de jeu, scope MVP
- [LORE.md](LORE.md) — cosmologie, civilisation, Résonance, Vestiges, Reflux, Doctrine du Miroir

## Concept core (lire GDD.md + LORE.md pour le détail)
- **Deux mondes** : Présent (ruines, post-Reflux, **terrain de chasse**) ↔ Miroir (passé vivant, **atelier paisible sous timer**)
- **La Résonance** = mesure de cohérence d'existence du Vestige (le joueur). Baisse = on devient flou. À 0 → Basculement (Présent → Miroir) ou Absorption (Miroir → fin de run)
- **Pas de mort, mais Absorption** : Résonance 0 en Miroir → fenêtre de grâce → si pas d'Artefact, le perso devient un habitant du passé. Le run termine, méta-progression survit, son corps réapparaît en Présent comme Vestige pillable au prochain run.
- **Doctrine des Deux Mondes** : *Présent = chasser, Miroir = transformer, aucun ne suffit seul*. Le Présent contient ennemis, combats, drops bruts (Fragments). Le Miroir contient marchands, forge, identification, lore — mais tu y es repoussé par la baisse passive. Cycle naturel : `chasser → transformer → chasser plus fort`.
- **Loot énigmatique** : 3 familles (Blanc/Bleu/Noir = Présent/Miroir/Reflux), pas de stats explicites, 3 tiers de révélation (visible / partiel / caché ★)
- **Combat RPG** : attaque (X), parry (C), sort (Z, hook). Toute la complexité passe par les items Corps (portée, dégâts, cooldown).
- **Aucun tutoriel** — le joueur découvre les règles en jouant

## Stack technique
- Phaser.js 3 (via CDN dans `index.html`)
- JavaScript vanilla (modules ES), pas de TypeScript
- Pas de framework UI — tout en canvas Phaser
- Serveur de dev : `npx live-server .` ou `npx vite`

## Structure du projet
```
vestige/
├── index.html
├── CLAUDE.md
├── GDD.md
├── src/
│   ├── main.js
│   ├── config.js
│   ├── scenes/         ← GameScene, MirrorScene, UIScene
│   ├── systems/        ← WorldGen, LootSystem, ResonanceSystem
│   ├── entities/       ← Player, Enemy
│   └── data/           ← items.js
└── assets/
```

## Lancer le projet
```bash
npx live-server .
# ou
npx vite
```

## Règles de développement
- Une feature à la fois, testable immédiatement dans le navigateur
- Pas de sur-ingénierie — la solution la plus simple qui fonctionne
- Commenter en français
- Les systèmes communiquent via événements Phaser (`this.events.emit`)
- Ne jamais casser ce qui fonctionne déjà sans prévenir
- Pas de TypeScript, pas de transpilation — du JS lisible directement par le navigateur

## Ordre d'implémentation (MVP)
1. ✅ GDD rédigé
2. ✅ Setup Phaser + personnage qui se déplace (rectangle + plateformes statiques + saut)
3. ✅ Génération procédurale de salles (PRNG seedé + zone de sortie + transition)
4. ✅ Système de Résonance + HUD (UIScene parallèle, registry, jauge)
5. ✅ Basculement Monde Normal ↔ Monde Miroir (palette + portail + baisse passive + ancrage)
6. ✅ Système de loot — coffres, drops orphelins (consommables), inventaire 40 slots, équipement 3 slots, 3 tiers de révélation, 15 items + 6 consommables
7. ✅ Ennemis basiques + combat RPG (attaque/parry, patterns de difficulté, drops, doctrine inversée Présent=combat / Miroir=atelier paisible)
8a. ✅ Direction artistique — 6 archétypes architecturaux (Sanctuaire, Hall des Échos, Crypte des Murmures, Pont Suspendu, Puits Inversé, Arène du Reflux), salles dimensionnées par archétype, caméra qui suit avec deadzone, seed du run randomisée
8b. ⬜ Décor & contraste Présent/Miroir (colonnes, statues, racines en Phaser Graphics — brisées vs intactes)
8c. ⬜ Innovations mécaniques signature (aura Sanctuaire, échos Hall, drop-down Crypte, plateformes résonantes Pont, gravité inversée Puits, espace rétrécissant Arène)
8d. ⬜ Parallax 4 couches + particules d'ambiance par monde + lumière
8e. ⬜ Polish (vignette, grain, animations idle/marche du joueur)

## État actuel
*Cette section doit être mise à jour à la fin de chaque session de travail.*

- **Dernière étape franchie :** étape 8a — direction artistique & structure architecturale. `data/archetypes.js` définit 6 archétypes (Sanctuaire 1280×540, Hall des Échos 1920×540, Crypte des Murmures 1280×540, Pont Suspendu 2200×540, Puits Inversé 960×900 *vertical*, Arène du Reflux 1280×720). Chaque archétype a son script de génération de plateformes propre (architecture forte au lieu de plateformes random). `WorldGen` choisit un archétype selon le niveau de danger (`niveauxAssocies`) avec variation aléatoire seedée. Caméra Phaser : `startFollow(player)` + `setDeadzone(200, 150)`, bounds physiques dynamiques par salle. Seed du run **randomisée à l'init** et persistée dans le registry pendant tout le run (`Math.random()` au démarrage). HUD textuel passé en `setScrollFactor(0)` pour rester fixe à l'écran malgré le scrolling.
- **Étape 7 (récap)** : combat RPG (X attaque / C parry / Z hook sort), 2 types ennemis Présent, patterns de difficulté en cycles 6 salles. Inversion doctrinale : Présent = chasse, Miroir = atelier paisible. Voir [LORE.md §11](LORE.md#11-doctrine-des-deux-mondes).
- **Prochain chantier :** **étape 8b — Décor & contraste**. Couches `Phaser.Graphics` pour colonnes, statues, racines, lanternes — brisées en Présent / intactes en Miroir. Palettes affinées par archétype.
- **Pistes ultérieures** : 8c (innovations mécaniques par archétype), 8d (parallax + particules + lumière), 8e (polish). Hors scope visuel : Étape 9 — couche capitalisation Miroir (marchands/fondeur), Étape 10 — Absorption complète.
  - **Étape 10** — sprites + assets graphiques (cf. discussion Rayman-like)
- **Compromis MVP (dette narrative documentée) :**
  - Items du Miroir directement équipables, alors que LORE prévoit des Fragments bruts à transformer en **Miroir** (Fondeur/Identifieur). Le système actuel reste compatible avec cette couche future.
  - Pas de marchands/forge/identifieur en Miroir pour l'instant — il est juste un terrain paisible avec coffres rares + vortex
  - Pas encore : sorts (touche Z réservée), malédictions temporelles des Noir, identification des Tier III par Œil-Témoin, items "game-changers" (wall-grip, drop-down, slow-mo, fil d'Ariane)
  - Pas d'Absorption mécanique (fenêtre de grâce + Artefact) — l'Ancrage reste statique
  - Phases de perception des habitants Miroir non implémentées — ils sont 100 % paisibles
- **Points d'attention :**
  - Le joueur est toujours un `Phaser.GameObjects.Rectangle` — à remplacer par un sprite plus tard
  - Aucun asset graphique, tout est en primitives colorées
  - Seed du run hardcodée à `1337` dans `GameScene.js` — à randomiser plus tard
  - Génération linéaire (salle suivante = index+1), pas de connectivité grille
  - Pas encore d'Artefact de Résonance ni de fenêtre de grâce avant Absorption — l'Ancrage actuel reste statique (LORE.md §6 décrit la mécanique cible)
  - La couche "capitalisation" du Présent (Sanctuaires, Fondeur, Marchands) est définie dans LORE/GDD mais pas implémentée
  - Toute proposition touchant au Miroir doit être lue à travers la Doctrine ([LORE.md §11](LORE.md))
  - Toute proposition touchant au loot doit favoriser la profondeur et le choix (préférence utilisateur en mémoire)
  - Tout input doit passer par `InputSystem` — jamais de `Keyboard` direct dans la logique gameplay (préférence en mémoire, prépare le portage mobile)
- **Points d'attention :**
  - Le joueur est toujours un `Phaser.GameObjects.Rectangle` — à remplacer par un sprite plus tard
  - Aucun asset graphique, tout est en primitives colorées
  - Seed du run hardcodée à `1337` dans `GameScene.js` — à randomiser plus tard
  - Génération linéaire (salle suivante = index+1), pas de connectivité grille
  - Pas encore d'Artefact de Résonance ni de fenêtre de grâce avant Absorption — l'Ancrage actuel reste statique (LORE.md §6 décrit la mécanique cible)
  - La couche "capitalisation" du Présent (Sanctuaires, Fondeur, Marchands) est définie dans LORE/GDD mais pas implémentée — étape 6+
  - Toute proposition touchant au Miroir doit être lue à travers la Doctrine ([LORE.md §11](LORE.md))
- **Décisions notables :**
  - Phaser chargé via CDN (pas de bundler), pour garder le projet ultra-simple à lancer
  - **Règle d'imports** : `config.js` ne doit RIEN importer du projet (sinon TDZ par import circulaire). L'enregistrement des scènes vit dans `main.js`.
  - PRNG Mulberry32 seedé pour reproductibilité — la même seed sert aux deux mondes, géométrie identique entre Normal et Miroir
  - Capacités physiques (portée de saut ≈ 176 px, hauteur ≈ 96 px) calculées dans `WorldGen.js`
  - **État du jeu (résonance, monde) dans le `registry` Phaser** : survit aux `scene.restart()` des transitions de salle / basculements. Communication scène ↔ scène via `changedata-*` events automatiques.
  - Pas de scène `MirrorScene` séparée : la `GameScene` branche normal/miroir conditionnellement (palette, hooks, zone interactive)
  - `Phaser.Scale.FIT` + `CENTER_BOTH` : on raisonne en coordonnées internes 960×540, le canvas s'adapte à la fenêtre

## Travailler avec Claude (méta)

Ces règles aident Claude à rester cohérent entre les sessions.

- **Plan + challenge avant code :** pour chaque étape MVP ou feature non triviale, Claude propose d'abord un plan court (objectif, fichiers touchés, choix d'archi, alternatives écartées) et **identifie 1-3 questions de design à trancher**. Pas une ligne de code écrite avant que l'utilisateur ait validé. Pour les fixes triviaux ou les corrections demandées explicitement, pas de plan — juste exécuter.
- **Mise à jour de ce fichier :** quand une étape MVP avance, qu'une décision technique est prise, ou qu'un point d'attention apparaît, mettre à jour la section "État actuel" et la checklist MVP avant la fin de la session.
- **Commits :** un commit par étape MVP franchie (ou sous-étape claire). Le `git log` sert de mémoire de progression.
- **Mémoire persistante :** Claude maintient une mémoire à travers les conversations (préférences, décisions de design non évidentes, retours répétés). Lui dire explicitement *"retiens ça"* la première fois qu'une règle apparaît.
- **Posture par défaut :** game dev pragmatique — code minimal qui marche dans le navigateur, pas d'abstraction prématurée, pas de couche d'outillage non demandée. Si une feature peut être testée à l'œil dans le navigateur, c'est l'étalon de validation.
- **En début de session longue :** demander *"où on en est ?"* — Claude relit ce fichier + `git log` + sa mémoire avant de coder.

### Conventions provisoires (à nettoyer plus tard)
*Outillage de test ajouté pour valider visuellement, à retirer quand les vrais déclencheurs gameplay arrivent.*

- **Touches `K` / `H`** dans `GameScene` : -10 / +10 Résonance. Provisoire — à retirer quand ennemis (étape 7) et zones du Miroir (étape 5) feront bouger la jauge naturellement.
