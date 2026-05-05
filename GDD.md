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
- **Aucun ennemi par défaut** — les habitants des Sources sont paisibles et tu es transparent à leurs yeux
- Plus dangereux : la Résonance baisse passivement dans le Miroir
- Tu y vas pour **transformer** ton loot, pas pour te battre
- Certaines zones font baisser la Résonance très rapidement — à éviter ou traverser vite

### 🪞 Doctrine des Deux Mondes
*Boussole pour toutes les décisions de design. Voir [LORE.md §11](LORE.md#11-doctrine-des-deux-mondes) pour le détail.*

> **Le Présent est où tu chasses. Le Miroir est où tu transformes. Aucun des deux ne suffit seul.**

Quatre piliers à ne jamais casser :

1. **Le Présent attire le combat** — ennemis, drops bruts (Fragments), patterns de difficulté en cycles (refuge → climax)
2. **Le Miroir attire la transformation** — marchands, forge, identification, lore, PNJ paisibles
3. **Le Miroir te repousse** — baisse passive, vortex aléatoire, risque d'Absorption
4. **Les deux sont indissociables** — sans matériaux du Présent, rien à transformer ; sans transformations du Miroir, la chasse n'a pas de finalité

**Conséquence ludique** : `Présent (chasser) → Miroir (transformer) → Présent (chasser plus fort) → …`. Le joueur ne peut ni rester en Présent (équipement stagne), ni rester en Miroir (la Trame le tue).

### Ce qu'on trouve uniquement en Présent
- **Ennemis** — Gardiens de Pierre, Spectres de Cendre (et plus tard d'autres types)
- **Drops bruts** (Fragments) lâchés à la mort des ennemis
- **Coffres** (loot Blanc majoritaire, parfois Bleu / Noir)
- **Patterns de difficulté** — cycles refuge / tension / climax

### Ce qu'on trouve uniquement en Miroir
- **Marchands** — échangent Fragments contre Sel de Résonance ou autres items
- **Fondeur** — transforme un Fragment en item équipable
- **Identifieur** (PNJ ou autel) — révèle les effets cachés des items Tier III
- **Sanctuaires de Résonance** — recharge totale, point de sauvegarde futur
- **Inscriptions / fresques** révélant le lore et la taxonomie du loot
- **PNJ vivants** des Sources — dialogues cryptiques, indices
- **Artefacts de Résonance** (drop ultra-rare, seule issue à l'Ancrage)
- **Coffres rares Tier III** — bonus exceptionnels, contiennent souvent des items uniques

> Note MVP étape 7 : seuls les ennemis du Présent + le système de combat sont implémentés. La couche d'atelier du Miroir (marchands, forge, etc.) viendra dans des étapes ultérieures.

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
SPAWN en Présent (salle initiale, refuge)
        ↓
   CHASSER en Présent
   Combat : attaque (X) / parry (C)
   Items Corps modifient ton style
   Drops bruts (Fragments) à la mort des ennemis
   Patterns par cycles : refuge → tension → climax
        ↓
   Inventaire chargé de Fragments inertes
        ↓
   Basculer dans le Miroir
   (volontaire — Résonance pleine — ou forcé à 0)
        ↓
   ATELIER en Miroir (sous timer)
   Aucun ennemi — habitants paisibles, tu es transparent
   Marchands, Fondeur, Identifieur
   Transformer Fragments → items équipables
   Lire des inscriptions, comprendre le lore
        ↓
   Résonance baisse passivement (Trame te repousse)
        ↓
   ┌── Sortir par le Vortex (+20 Résonance bonus)
   │
   └── OU rester trop : Résonance → 0 → ANCRÉ
       Fenêtre de grâce 30-60s
       ↓
       Trouver un Artefact ?
       ├─ OUI → retour Présent, Résonance pleine
       └─ NON → ABSORPTION → fin du run
                             (méta-progression survit)
        ↓
   RETOUR Présent — équipement amélioré
   Repartir, plus fort, vers les climax suivants
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