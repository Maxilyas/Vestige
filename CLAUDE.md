# VESTIGE — Claude Code Context

## Projet
Jeu vidéo 2D plateformer fantasy médiéval en JavaScript + Phaser.js.
Prototype jouable dans le navigateur. Voir GDD.md pour le design complet.

## Concept core (lire GDD.md pour le détail)
- Deux mondes : Monde Normal (ruines) ↔ Monde Miroir (passé vivant)
- La Résonance remplace la barre de vie — tombe à 0 = Basculement
- Loot énigmatique : 3 familles (Blanc, Bleu, Noir), pas de stats explicites
- Aucun tutoriel — le joueur découvre les règles en jouant

## Stack technique
- Phaser.js 3 (CDN ou npm)
- JavaScript vanilla, pas de TypeScript
- Pas de framework UI — tout en canvas Phaser
- Serveur de dev : live-server ou Vite

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
- Les systèmes communiquent via événements Phaser (this.events.emit)
- Ne jamais casser ce qui fonctionne déjà sans prévenir

## Ordre d'implémentation (MVP)
1. ✅ GDD rédigé
2. ⬜ Setup Phaser + personnage qui se déplace
3. ⬜ Génération procédurale de salles
4. ⬜ Système de Résonance + HUD
5. ⬜ Basculement Monde Normal ↔ Monde Miroir
6. ⬜ Système de loot (3 familles)
7. ⬜ Ennemis basiques