# VESTIGE — Game Design Document
> Version 0.1 — Prototype

---

## 🎯 Vision

> *Tu explores les ruines d'une civilisation disparue. Mourir te projette dans son passé vivant. Ta Résonance te maintient entre les deux mondes. Le loot est un langage que tu apprends seul.*

Un plateformer 2D fantasy médiéval où la mort n'est pas une punition mais un voyage. Le joueur découvre progressivement les règles du monde — aucun tutoriel, aucune explication explicite.

**Références :** Terraria (exploration persistante) + Dark Souls (loot énigmatique) + Ogame (progression longue et méritée)

**Plateforme cible :** Mobile (navigateur / PWA)
**Stack technique :** JavaScript + Phaser.js

---

## 🌍 Le Monde

### Concept fondamental
Le monde de Vestige est **une mémoire en deux couches** :

- **Le Monde Normal** — Le présent. Des ruines, des structures effondrées, des salles vides. Ce qu'il reste d'une civilisation disparue.
- **Le Monde Miroir** — Le passé. Les mêmes lieux, mais vivants, intacts, peuplés. Ce que cette civilisation *était* avant de mourir.

Les deux mondes sont générés **ensemble, procéduralement**. Chaque salle du monde normal a son exact miroir dans le passé — même géographie, règles différentes.

### Génération procédurale
- Génération par salles connectées (pas de monde ouvert infini)
- Chaque run génère un nouveau "fragment" de monde
- Les deux mondes partagent la même seed de génération
- Profondeur croissante : plus on descend, plus c'est dangereux et riche en loot

### Monde Normal — Règles
- Ruines, pierres effondrées, végétation envahissante
- Ennemis : créatures qui habitent les ruines (fantômes, gardiens de pierre, araignées des cryptes)
- Lumière faible, atmosphère froide
- Les coffres contiennent du loot Blanc principalement

### Monde Miroir — Règles
- Les mêmes salles, mais vivantes et lumineuses
- Ennemis : habitants de la civilisation passée (gardes, mages, marchands corrompus)
- Plus dangereux : la Résonance baisse passivement dans le miroir
- Les coffres contiennent du loot Bleu et Noir principalement
- Certaines zones font baisser la Résonance très rapidement — à éviter ou traverser vite

---

## 💀 La Mort & La Résonance

### La Résonance
La Résonance est la jauge centrale du jeu. Elle remplace la "barre de vie" classique.

```
[████████████████░░░░] 80% — Monde Normal, stable
[████░░░░░░░░░░░░░░░░] 20% — Danger, Basculement imminent
[░░░░░░░░░░░░░░░░░░░░]  0% — Basculement / Ancrage
```

**Ce qui fait baisser la Résonance :**
- Recevoir des dégâts
- Rester dans le Monde Miroir (baisse passive lente)
- Équiper des objets Bleu ou Noir
- Certaines zones maudites du Miroir (baisse rapide)

**Ce qui fait monter la Résonance :**
- Collecter des Fragments de Résonance (drops rares)
- Revenir dans le Monde Normal depuis le Miroir
- Certains objets Blanc

### Le Basculement
Quand la Résonance atteint 0 dans le **Monde Normal** :
→ Le joueur bascule dans le **Monde Miroir** (même salle, version passée)
→ La Résonance se stabilise à 30% dans le miroir
→ Le joueur doit trouver un **Portail de Retour** pour revenir dans le monde normal

Quand la Résonance atteint 0 dans le **Monde Miroir** :
→ Le joueur est **ancré dans le miroir** — il ne peut plus revenir naturellement
→ Pas de game over, mais état critique : la Résonance continue de baisser lentement
→ Seul un **Artefact de Résonance** (drop très rare dans le miroir) permet de revenir
→ Tension maximale : le joueur doit explorer un monde dangereux avec quasi rien

### Portails de Retour
- Présents dans chaque salle du Miroir, mais cachés
- Certains sont visibles, d'autres nécessitent d'interagir avec l'environnement
- Dans le prototype : 1 portail visible par salle du miroir

---

## 💎 Le Loot — La Taxonomie Inconnue

### Principe fondamental
Les objets n'ont **pas de stats explicites**. Chaque objet a :
- Une **couleur** (famille)
- Un **nom énigmatique** ("Fragment de l'Ordre Brisé", "Œil du Témoin")
- Une **description cryptique** d'une ligne
- Des **effets** découverts en jouant

Le joueur apprend en expérimentant. Aucune explication dans le jeu.

### Les 3 familles du prototype

#### ⬜ Blanc — Objets du Monde Normal
- Origine : trouvés dans les ruines du monde normal
- Effets : stables, prévisibles, souvent défensifs ou utilitaires
- Impact Résonance : neutre ou légèrement positif
- Exemples d'effets : augmente la vitesse de déplacement, ralentit la baisse de Résonance, révèle les portails cachés

#### 🟦 Bleu — Objets du Monde Miroir
- Origine : trouvés dans le passé vivant
- Effets : puissants, offensifs, mais font baisser la Résonance en les portant
- Impact Résonance : baisse passive lente tant qu'équipé
- Exemples d'effets : double les dégâts, permet de voir les ennemis à travers les murs, ralentit le temps brièvement

#### ⬛ Noir — Objets Corrompus
- Origine : entre les deux mondes, lieu de drop inconnu
- Effets : très puissants, mais avec une malédiction cachée révélée après utilisation prolongée
- Impact Résonance : variable et imprévisible
- Exemples d'effets (malédiction cachée après 2 min) : l'objet qui augmente la vitesse finit par inverser les contrôles pendant 10 secondes aléatoirement

### Système de drop
```
Monde Normal  : 70% Blanc | 20% Bleu | 10% Noir
Monde Miroir  : 20% Blanc | 60% Bleu | 20% Noir
Boss          : 10% Blanc | 30% Bleu | 40% Noir | 20% drop spécial
```

### Slots d'équipement (prototype)
- 3 slots : Tête / Corps / Accessoire
- On peut équiper n'importe quelle combinaison de couleurs
- Les interactions entre objets de couleurs différentes ne sont pas documentées

---

## 🎮 Boucle de Jeu

```
SPAWN dans le Monde Normal
        ↓
   Explorer les ruines
   Trouver du loot (Blanc majoritaire)
   Découvrir les effets en jouant
        ↓
   Résonance baisse (dégâts, objets)
        ↓
   BASCULEMENT → Monde Miroir
   Même salle, vivante et dangereuse
   Loot plus puissant (Bleu, Noir)
   Résonance baisse passivement
        ↓
   Trouver un Portail de Retour
        ↓
   Revenir dans le Monde Normal
   (boucle recommence, salle suivante)
        ↓
   Si ancré dans le Miroir :
   Trouver un Artefact de Résonance
   (tension maximale)
```

---

## 🕹️ Contrôles (Mobile)

- **Joystick gauche virtuel** : déplacement horizontal
- **Bouton A** : saut (double saut possible avec certains objets)
- **Bouton B** : attaque
- **Swipe up** : interagir / ramasser
- **Appui long sur item** : lire la description cryptique

---

## 📊 Scope du Prototype

### ✅ Dans le prototype
- Personnage jouable avec déplacement, saut, gravité
- Génération procédurale de salles (5-10 salles par run)
- Monde Normal + Monde Miroir (même salle, visuel différent)
- Système de Résonance fonctionnel
- Basculement au Monde Miroir
- Portail de Retour (1 par salle miroir)
- Loot : 3 familles (Blanc, Bleu, Noir), 3 slots
- 3-5 objets par famille avec effets réels
- Ennemis basiques (2 types par monde)
- HUD minimal : jauge de Résonance + slots équipement

### ❌ Hors scope prototype
- Monde Miroir complet avec lore
- Familles Violet, Orange, ❓
- Boss
- Progression méta entre les runs
- Sons et musique
- Animations complexes
- Multijoueur

---

## 🏗️ Architecture Technique (Phaser.js)

### Structure des fichiers
```
vestige/
├── index.html
├── CLAUDE.md
├── GDD.md
├── package.json
├── src/
│   ├── main.js              ← Point d'entrée Phaser
│   ├── config.js            ← Config globale du jeu
│   ├── scenes/
│   │   ├── GameScene.js     ← Scène principale
│   │   ├── MirrorScene.js   ← Scène monde miroir
│   │   └── UIScene.js       ← HUD (scène parallèle)
│   ├── systems/
│   │   ├── WorldGen.js      ← Génération procédurale
│   │   ├── LootSystem.js    ← Gestion du loot
│   │   └── ResonanceSystem.js ← Gestion de la Résonance
│   ├── entities/
│   │   ├── Player.js        ← Joueur
│   │   └── Enemy.js         ← Ennemis
│   └── data/
│       └── items.js         ← Définition de tous les items
└── assets/
    ├── sprites/
    └── tilemaps/
```

### Principes d'architecture
- Chaque système est indépendant et communique via les événements Phaser
- Le `LootSystem` ne connaît pas le `Player` directement — il émet des événements
- La génération procédurale est seedée — reproductible si nécessaire
- Le Monde Miroir est la même scène avec un filtre visuel + règles différentes

---

*Ce document est vivant. Il sera mis à jour à chaque itération du prototype.*