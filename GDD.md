# VESTIGE — Game Design Document
> Version 0.2 — Prototype
> **Lore détaillé : voir [LORE.md](LORE.md).**
> Ce document décrit les *mécaniques*. Pour le pourquoi narratif, lire LORE.md.

---

## 🎯 Vision

> *Tu explores les ruines d'une civilisation disparue. Quand ta cohérence s'effondre, tu glisses dans son passé vivant. Le loot est un langage que tu apprends seul. La mort n'existe pas — l'absorption, oui.*

Un plateformer 2D fantasy médiéval où le joueur est un **Vestige** : un fragment de conscience coupé en deux par le Reflux, capable de glisser entre le Présent (ruines) et le Miroir (passé fixé, vivant). Aucun tutoriel — il découvre les règles en jouant.

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
- Les mêmes salles, mais vivantes et lumineuses (palette chaude)
- Ennemis : habitants de la civilisation passée (gardes, mages, marchands corrompus)
- Plus dangereux : la Résonance baisse passivement dans le miroir
- Les coffres contiennent du loot Bleu et Noir principalement
- Certaines zones font baisser la Résonance très rapidement — à éviter ou traverser vite

### 🪞 Doctrine du Monde Miroir
*Boussole pour toutes les décisions de design touchant au Miroir. Voir [LORE.md §11](LORE.md#11-doctrine-du-monde-miroir) pour le détail.*

> **Le Miroir est l'unique source de compréhension et de puissance — mais il te rejette progressivement, et il ne donne rien de directement utilisable.**

Trois piliers à ne jamais casser :

1. **Le Miroir attire** — loot brut puissant, lore exclusif, raccourcis géographiques (option : avancer en Miroir = avancer dans Normal), PNJ vivants
2. **Le Miroir repousse** — baisse passive de Résonance, perception croissante des habitants, risque d'Absorption
3. **Le Miroir dépend du Présent** — les **Fragments** ramenés du Miroir doivent être identifiés / forgés / échangés en Présent (Sanctuaires, Fondeur, Marchands). Aucun loot Miroir n'est équipable directement.

**Conséquence ludique** : le cycle naturel devient `Présent (préparer) → Miroir (extraire) → Présent (capitaliser) → Miroir (extraire mieux)…`. Le joueur ne peut ni rester en Présent (rien à y trouver de neuf), ni rester en Miroir (rien d'utilisable, et il y meurt).

### Ce qu'on trouve uniquement en Présent
- **Sanctuaires de Résonance** — recharge totale, point de sauvegarde
- **Fondeur** — transforme un Fragment en item équipable
- **Identifieur** (PNJ ou autel) — révèle les effets cachés d'un objet
- **Marchands errants** — échange de Fragments / items contre du Sel de Résonance (monnaie)
- **Repos** — seul lieu où équiper / déséquiper sans pénalité

### Ce qu'on trouve uniquement en Miroir
- **Fragments bruts** (matière première du loot Bleu/Noir, inutilisables avant Présent)
- **Inscriptions / fresques** révélant le lore et la taxonomie du loot
- **PNJ vivants** des Sources — dialogues cryptiques, indices
- **Coffres scellés en Présent** ouvrables uniquement depuis leur version Miroir
- **Artefacts de Résonance** (drop ultra-rare, seule issue à l'Ancrage)

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

### Le Basculement (Présent → Miroir)
Quand la Résonance atteint 0 dans le **Présent** :
→ Le joueur bascule dans le **Miroir** (même salle, version passée vivante)
→ La Résonance se stabilise à 30 % dans le Miroir
→ Le joueur doit trouver un **Portail de Retour** pour revenir au Présent
→ Lecture lore : le Miroir te *prête* de la cohérence pour te garder en vie chez lui

### L'Absorption (Résonance = 0 en Miroir)
Quand la Résonance atteint 0 dans le **Miroir** :
→ Le joueur entre en état **Ancré** — fenêtre de grâce de 30 à 60 secondes
→ Pendant cette fenêtre : déformation visuelle, habitants te perçoivent, compte à rebours invisible
→ **Une seule issue** : trouver un **Artefact de Résonance** (drop ultra-rare en Miroir) → retour au Présent avec Résonance pleine
→ Si la fenêtre expire sans Artefact : **Absorption** → fin du run en cours

**Ce que l'Absorption coûte / préserve :**
- ❌ Tout le loot non capitalisé du run en cours est perdu
- ❌ Les progrès de salle / position sont perdus
- ✅ La méta-progression survit : codex, carte mémoire, items débloqués au pool de drop
- ✅ Au prochain run : ton ancien personnage apparaît en Présent comme **Vestige** (cadavre/fantôme) à un endroit aléatoire — il porte un objet de ton ancien équipement et délivre une phrase cryptique. Pillable une seule fois.

Cette mécanique remplace la "mort" classique : tu n'es jamais tué, tu es *intégré* au passé. Le titre prend son sens — tu *deviens* un Vestige à chaque échec.

### Le Vortex (retour Miroir → Présent)
- Une instabilité de la Trame qui s'ouvre dans chaque salle Miroir
- **Position aléatoire** (seedée par PRNG) — généralement posé sur une plateforme flottante
- Distance minimale du spawn et de la sortie pour qu'il ne soit pas trivial à atteindre
- Visible (halo cyan-vert pulsant), mais le joueur doit traverser la salle pour l'atteindre
- Quand on le touche : retour au Présent **à la même position** (continuité spatiale)
- Le basculement Présent → Miroir respecte aussi cette continuité : tu te réveilles exactement où tu étais
- Lecture lore : la Trame ne facilite pas la fuite — voir [LORE.md](LORE.md)

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
SPAWN en Présent (hub ou salle initiale)
        ↓
   Préparer : équipement Blanc, Sel de Résonance, plan
        ↓
   ┌──── Avancer en Présent (sûr, peu de loot) ───┐
   │                                              │
   │   OU                                         │
   │                                              │
   └─→ Basculer dans le Miroir (volontaire ou  ──→ Extraction
       forcé par Résonance = 0 en Présent)        │
                                                  │
       Ramasser des Fragments                     │
       Lire des inscriptions / parler aux PNJ     │
       Avancer en Miroir = avance aussi en Présent│
                                                  │
       Résonance baisse passivement               │
       Habitants te perçoivent peu à peu          │
                                                  │
       ┌──── Sortir par le Portail de Retour ─────┘
       │     (+20 Résonance bonus)
       │
       └──── OU rester trop longtemps :
             Résonance → 0 → ANCRÉ
             Fenêtre de grâce 30-60s
             ↓
             Trouver un Artefact ?
              ├─ OUI → retour Présent, Résonance pleine
              └─ NON → ABSORPTION → fin du run
                                    (méta-progression survit)
        ↓
   Retour Présent
   Capitaliser : forger, identifier, vendre, équiper
   Repartir, plus fort, vers une salle plus profonde
        ↓
   (cycle recommence)
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
- Sanctuaires / Fondeur / Identifieur / Marchands en Présent (la "couche capitalisation")
- Fenêtre de grâce + Absorption + Vestige du run précédent
- Habitants du Miroir (3 phases de perception : transparence → curiosité → hostilité)
- Inscriptions / fresques de lore en Miroir
- Familles Violet, Orange, ❓
- Boss
- Progression méta entre les runs (codex, carte mémoire)
- Sons et musique
- Animations complexes
- Multijoueur

> Note : ces éléments sont *définis* dans LORE.md et la Doctrine. Ils ne seront pas tous implémentés dans le proto, mais les choix techniques actuels ne doivent pas les rendre impossibles à ajouter plus tard.

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