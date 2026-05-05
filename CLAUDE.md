# VESTIGE — Claude Code Context

## Projet
Jeu vidéo 2D plateformer fantasy médiéval en JavaScript + Phaser.js.
Prototype jouable dans le navigateur. Voir [GDD.md](GDD.md) pour le design complet.

## Concept core (lire GDD.md pour le détail)
- Deux mondes : Monde Normal (ruines) ↔ Monde Miroir (passé vivant)
- La Résonance remplace la barre de vie — tombe à 0 = Basculement
- Loot énigmatique : 3 familles (Blanc, Bleu, Noir), pas de stats explicites
- Aucun tutoriel — le joueur découvre les règles en jouant

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
4. ⬜ Système de Résonance + HUD
5. ⬜ Basculement Monde Normal ↔ Monde Miroir
6. ⬜ Système de loot (3 familles)
7. ⬜ Ennemis basiques

## État actuel
*Cette section doit être mise à jour à la fin de chaque session de travail.*

- **Dernière étape franchie :** étape 3 — `WorldGen.genererSalle(seed, index)` (fonction pure, PRNG Mulberry32). `GameScene` consomme la description et déclenche `scene.restart({ indexSalle: +1 })` quand le joueur entre dans la zone de sortie dorée à droite. Compteur de salle affiché en haut.
- **Prochain chantier :** étape 4 — Système de Résonance + HUD (probablement via une `UIScene` parallèle écoutant des événements émis par `GameScene`).
- **Points d'attention :**
  - Le joueur est toujours un `Phaser.GameObjects.Rectangle` — à remplacer par un sprite plus tard
  - Aucun asset graphique, tout est en primitives colorées
  - Seed du run hardcodée à `1337` dans `GameScene.js` — à randomiser plus tard
  - Génération linéaire (salle suivante = index+1), pas de connectivité grille
- **Décisions notables :**
  - Phaser chargé via CDN (pas de bundler), pour garder le projet ultra-simple à lancer
  - **Règle d'imports** : `config.js` ne doit RIEN importer du projet (sinon TDZ par import circulaire). L'enregistrement des scènes vit dans `main.js`.
  - PRNG Mulberry32 seedé pour reproductibilité — essentiel pour la future symétrie Normal ↔ Miroir (les deux mondes partageront la même seed)
  - Capacités physiques (portée de saut max ≈ 176 px, hauteur ≈ 96 px) calculées dans `WorldGen.js` à partir de `PLAYER`/`WORLD` pour garantir des plateformes atteignables

## Travailler avec Claude (méta)

Ces règles aident Claude à rester cohérent entre les sessions.

- **Mise à jour de ce fichier :** quand une étape MVP avance, qu'une décision technique est prise, ou qu'un point d'attention apparaît, mettre à jour la section "État actuel" et la checklist MVP avant la fin de la session.
- **Commits :** un commit par étape MVP franchie (ou sous-étape claire). Le `git log` sert de mémoire de progression.
- **Mémoire persistante :** Claude maintient une mémoire à travers les conversations (préférences, décisions de design non évidentes, retours répétés). Lui dire explicitement *"retiens ça"* la première fois qu'une règle apparaît.
- **Posture par défaut :** game dev pragmatique — code minimal qui marche dans le navigateur, pas d'abstraction prématurée, pas de couche d'outillage non demandée. Si une feature peut être testée à l'œil dans le navigateur, c'est l'étalon de validation.
- **En début de session longue :** demander *"où on en est ?"* — Claude relit ce fichier + `git log` + sa mémoire avant de coder.
