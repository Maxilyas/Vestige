# VESTIGE — Claude Code Context

## Projet
Jeu vidéo 2D plateformer fantasy médiéval en JavaScript + Phaser.js.
Prototype jouable dans le navigateur.

**Documentation de référence :**
- [GDD.md](GDD.md) — mécaniques de jeu, scope MVP
- [LORE.md](LORE.md) — cosmologie, civilisation, Résonance, Vestiges, Reflux, Doctrine du Miroir

## Concept core (lire GDD.md + LORE.md pour le détail)
- **Deux mondes** : Présent (ruines, post-Reflux) ↔ Miroir (passé vivant, fixé)
- **La Résonance** = mesure de cohérence d'existence du Vestige (le joueur). Baisse = on devient flou. À 0 → Basculement (Présent → Miroir) ou Absorption (Miroir → fin de run)
- **Pas de mort, mais Absorption** : Résonance 0 en Miroir → fenêtre de grâce → si pas d'Artefact, le perso devient un habitant du passé. Le run termine, méta-progression survit, son corps réapparaît en Présent comme Vestige pillable au prochain run.
- **Doctrine du Miroir** : il attire (loot, lore, raccourcis), il repousse (baisse passive, perception des habitants, Absorption), il dépend du Présent (Fragments inutilisables avant identification/forge/échange)
- **Loot énigmatique** : 3 familles (Blanc/Bleu/Noir = Présent/Miroir/Reflux), pas de stats explicites
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
7. ⬜ Ennemis basiques

## État actuel
*Cette section doit être mise à jour à la fin de chaque session de travail.*

- **Dernière étape franchie :** étape 6 — système de loot complet. `data/items.js` (15 items équipables + 6 consommables), `LootSystem` (tirage selon monde, calcul de stats effectives), `InventaireSystem` (inventaire 40 slots + 3 slots équipés dans le registry, persiste aux scene.restart), `InputSystem` (intentions abstraites, jamais de clavier direct dans la logique), `InventaireScene` (overlay grille + détail + équiper/jeter avec tier 1/2/3 de révélation et marqueur ★), coffres et drops orphelins seedés dans WorldGen, ramassage par touche E. Stats effectives calculées dynamiquement depuis l'équipement.
- **Prochain chantier :** étape 7 — Ennemis basiques. À discuter : 2 types par monde (cf. GDD), comportements simples (patrouille, suivi), drops à la mort (réutilisent `tirerItem`).
- **Compromis MVP étape 6 (dette narrative documentée) :**
  - Items du Miroir directement équipables, alors que LORE prévoit des Fragments bruts à transformer en Présent (Sanctuaires/Fondeur). Le système actuel reste compatible avec cette couche future.
  - Pas encore : malédictions temporelles des Noir, identification des Tier III par Œil-Témoin, items "game-changers" (wall-grip, drop-down, slow-mo, fil d'Ariane) — étape 6.5
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
