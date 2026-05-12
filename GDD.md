# VESTIGE — Game Design Document
> Version 0.3 — Mini-jeu 10 étages
> **Lore détaillé : voir [LORE.md](LORE.md).**
> Ce document décrit les *mécaniques actuellement implémentées* + la vision long terme. Pour le pourquoi narratif, lire LORE.md.

---

## 🎯 Vision

> *Tu explores les ruines d'une civilisation disparue. Quand ta cohérence s'effondre, tu glisses dans son passé vivant pour t'y reforger. Le loot est un langage que tu apprends seul.*

Un plateformer 2D fantasy médiéval où le joueur est un **Vestige** : un fragment de conscience capable de glisser entre le **Présent** (ruines, chasse) et le **Miroir** (passé vivant, hub d'atelier). Aucun tutoriel — il découvre les règles en jouant.

**Référence créatives :** Terraria (exploration) + Dark Souls (loot énigmatique, mort = retry) + Hollow Knight (metroidvania) + Ogame (progression méritée)

**Plateforme cible** : mobile (navigateur / PWA). Actuellement testé sur PC clavier.
**Stack technique** : JavaScript + Phaser.js (sans bundler, CDN)

---

## 🎮 Objectif court terme — Mini-jeu 10 étages

*Décidé le 2026-05-12. On se concentre sur un mini-jeu jouable et fini avant d'ajouter des couches.*

> **Vaincre les 10 étages.** À chaque étage, un boss garde la porte de l'étage supérieur. L'étage 10 contient le boss final + l'Artefact qui marque la victoire.

**Boucle de jeu actuelle :**
```
SPAWN en Présent (étage 1, salle A, refuge sans ennemis)
        ↓
    CHASSER en Présent
    Combat : attaque (X) / parry (C)
    Items Corps modifient ton style
    Drops : Sel + Fragments
        ↓
    [Tente le boss de l'étage]
   /                       \
  victoire                  mort
   ↓                         ↓
  monte d'un étage     téléport Cité Miroir (heal complet)
   ↓                         ↓
  …                    Fondeur / Identifieur / Marchand
                              ↓
                       vortex retour → RESET étage courant
                       (coffres re-fermés, ennemis respawn, boss revit)
                              ↓
                       Retente l'étage avec meilleur gear
```

**Conséquence design :** la Cité Miroir est une **récompense de défaite**, pas un bouton "save". Le joueur ne peut PAS y aller volontairement — seule la mort (Résonance 0) ou un échec de boss déclenche le téléport. Cible perso : finir les 10 étages avec ≤ 3 visites en Miroir.

**Méta-progression** : entre les Mirror-resets et entre les runs, le joueur **garde** :
- Inventaire + équipement
- Sel de Résonance + Fragments
- Identifications (effets révélés)

L'étage courant et la position de salle se réinitialisent à chaque retour Cité → vortex.

---

## 🌍 Les Deux Mondes

### Concept fondamental
Le monde de Vestige est **une mémoire en deux couches** :

- **Le Présent** — Le post-Reflux. Ruines silencieuses, structures effondrées, atmosphère froide. **Terrain de chasse.**
- **Le Miroir** — Le passé fixé, vivant. Atmosphère chaude, dorée. **Hub d'atelier paisible** où la civilisation des Sources travaille encore la Résonance.

Les deux mondes partagent **la même géographie**. La salle d'entrée de chaque étage est en Présent une ruine post-Reflux, et en Miroir devient la **Cité Marchande** où les 3 artisans œuvrent.

### 🪞 Doctrine des Deux Mondes
*Boussole pour toutes les décisions de design. Voir [LORE.md §11](LORE.md#11-doctrine-des-deux-mondes).*

> **Le Présent est où tu chasses. Le Miroir est où tu transformes. Aucun des deux ne suffit seul.**

Trois piliers (le quatrième pilier "Miroir te repousse" est ajourné post-mini-jeu) :

1. **Le Présent attire le combat** — ennemis, drops bruts (Fragments), boss gateway, gating de progression.
2. **Le Miroir attire la transformation** — marchands, forge, identification, lore, PNJ paisibles.
3. **Les deux sont indissociables** — sans matériaux du Présent, rien à transformer ; sans Miroir, le loot brut reste inerte (les Fragments sont matière première sans usage tels quels).

> Note mini-jeu : la **pression temporelle en Miroir** (drain, Absorption) est **ajournée**. Le LORE garde cette mécanique comme vision long terme, mais le mini-jeu en fait un hub purement paisible pour rester centré sur la boucle chasse-transformation-retente.

### Génération du monde — structure actuelle
- **10 étages** numérotés. Chaque étage = graphe de 7 salles (Phase A) :
  - Chaîne principale : A → B → C → D → BOSS (connectées E/O)
  - 2 dead-ends verticaux optionnels : B-haut, D-haut (connectés par N, coffre garanti)
- **5 biomes** par paires d'étages :
  - 1-2 Ruines basses (verts terreux)
  - 3-4 Halls Cendrés (ambres, gris)
  - 5-6 Cristaux Glacés (bleus glaciaux)
  - 7-8 Voile Inversé (violets spectraux)
  - 9-10 Cœur du Reflux (noir / rouge cramoisi)
- **Génération seedée** (PRNG Mulberry32). Même seed = même géométrie en Présent et Miroir.
- **Topographies** (Phase 2a) : 5 templates physiques (`arene_ouverte`, `tour_verticale`, `croix_centrale`, `puits_descente`, `double_etage`) qui décrivent dims + plateformes + portes. À étendre à 18-20 en Phase 2b.

### Présent — Règles
- Ennemis selon le biome (4 types par biome, mix de Veilleur/Traqueur/Chargeur/Tireur)
- Densité 2-4 (Ruines basses) à 7-12 (Cœur du Reflux) ennemis par salle non-entrée
- Salle d'entrée (A) : **safe respawn point** — pas d'ennemis, pas d'obstacles dangereux
- Salle BOSS : 1 boss par étage (10 boss skinned, 3 patterns), gating porte E
- Coffres : 60 % chance par salle non-boss/non-entrée. Drops : 85 % Fragment, 15 % item équipable.
- Drops sol orphelins : consommables (30 % chance si pas de coffre)

### Miroir — Règles
- **Seule la salle d'entrée (A) est accessible** : la Cité Marchande
- Portes désactivées en Miroir (Cité = hub pur, seule sortie = vortex)
- **Aucun ennemi, aucun obstacle dangereux** — atelier paisible
- 3 artisans rassemblés à des positions fixes le long du sol :
  - **Le Fondeur** (30 % de largeur) : transforme 1-2 Fragments + Sel → item Tier 3
  - **L'Identifieur** (50 %) : révèle 1 effet d'item à la fois
  - **Le Marchand / la Glaneuse** (72 %) : vitrine + rachat + fragmentation
- **Pas de drain de Résonance** (mini-jeu) — la jauge reste pleine

---

## 💀 La Résonance et la Mort (mini-jeu)

### La Résonance — jauge de cohérence
La Résonance est la jauge centrale, équivalent PV.

```
[████████████████████] 100%  — Plein
[████░░░░░░░░░░░░░░░░] 20%   — Danger
[░░░░░░░░░░░░░░░░░░░░] 0%    — Mort = téléport Cité
```

**Ce qui fait baisser la Résonance** :
- Recevoir des dégâts d'un ennemi (contact, projectile, smash AOE de boss)
- Toucher un pieu (3 dégâts)
- Certains items équipés peuvent ralentir la régen (Bleu) — *à étendre*

**Ce qui fait monter la Résonance** :
- Parry réussi (+5)
- Consommables (Larme de Résonance, etc.)
- Retour à la Cité (heal complet à 100)

**Pas de drain passif en Miroir** (mini-jeu) — différent du LORE long terme.

### Mort en Présent → Cité Miroir
Quand la Résonance atteint 0 en Présent :
- **Téléport instantané à la Cité Marchande** de l'étage courant
- **Heal complet** (Résonance = 100)
- **Pas de pénalité** : Sel / Fragments / inventaire / équipement / identifications conservés
- L'état de l'étage (coffres ouverts, ennemis tués, boss tué) est **figé** pendant que tu es en Miroir

### Vortex Cité → Présent + Reset de l'étage
Dans la Cité, le vortex (cyan-vert, posé sur une plateforme flottante) permet de retourner en Présent :
- **Spawn forcé en salle A de l'étage courant** (pas de position pendante)
- **Reset complet de l'état de l'étage** : coffres re-fermés, ennemis et boss respawn, drops sol respawn
- **Méta-progression conservée** intégralement

**Le seul moyen d'aller en Miroir = mourir (ou laisser-tomber)**. Cette contrainte transforme la Cité d'un confort en récompense.

### Vision long terme (post-mini-jeu)
Le LORE prévoit une **mécanique d'Absorption** plus stricte :
- Drain passif en Miroir
- Fenêtre de grâce 30-60s à Résonance 0 en Miroir
- Seul l'**Artefact de Résonance** (drop ultra-rare) permet le retour Présent avec heal
- Sans Artefact : Absorption = fin du run, le personnage devient un habitant du passé. Au prochain run, son cadavre apparaît en Présent comme Vestige pillable.

Cette mécanique est **hors scope du mini-jeu** mais documentée dans [LORE.md §6](LORE.md). Réactivation possible après que le mini-jeu soit solide.

---

## 💎 Le Loot — Taxonomie Inconnue

### Principe fondamental
Les objets n'ont **pas de stats explicites**. Chaque objet a :
- Une **famille** (couleur)
- Un **nom énigmatique** ("Fragment de l'Ordre Brisé", "Œil du Témoin")
- Une **description cryptique** d'une ligne
- Des **effets** révélés progressivement (3 tiers de révélation : visible / partiel / caché ★)

Le joueur découvre les règles en expérimentant. L'Identifieur permet de révéler les effets cachés.

### Les 3 familles
| Famille | Origine | Effets | Impact Résonance |
|---|---|---|---|
| ⬜ **Blanc** | Présent (ruines) | Stables, défensifs ou utilitaires | Neutre |
| 🟦 **Bleu** | Miroir (passé) | Puissants, offensifs | *Cible LORE* : drain passif tant qu'équipé (pas dans le mini-jeu) |
| ⬛ **Noir** | Reflux (entre les deux) | Très puissants, malédiction cachée | *Cible LORE* : imprévisible (pas dans le mini-jeu) |

### Système de drop (coffres)
| Source | Item équipable | Fragment |
|---|---|---|
| Coffres Présent | 15 % | 85 % |
| Coffres Miroir | 5 % | 95 % |
| Boss | T3 garanti de la famille du boss + 10-25 Sel + 3 Fragments |

Probabilités de famille (équipables ET fragments) :
- Présent : 70 % Blanc / 20 % Bleu / 10 % Noir
- Miroir : 20 % Blanc / 60 % Bleu / 20 % Noir

### Fragments — matière première
Les ennemis et coffres lâchent surtout des **Fragments** (Blanc / Bleu / Noir). Tels quels, ils sont inertes. Pour devenir des items utilisables, ils doivent être emportés en Cité Miroir :

- **Le Fondeur** : combine 1 ou 2 Fragments + Sel → item Tier 3 (9 recettes cachées au joueur)
- **L'Identifieur** : révèle 1 effet d'un item Tier 2/3 (coût en Sel ou en Encre du Témoin)
- **Le Marchand** : achète/vend items, fragmente un item en Fragments (10 % chance bonus Noir si T3)

### Slots d'équipement
- 3 slots : **Tête / Corps / Accessoire**
- N'importe quelle combinaison de couleurs autorisée
- L'item Corps modifie le combat (portée d'attaque, dégâts, cooldown, parry)

### Économie
- **Sel de Résonance** : monnaie obtenue en tuant ennemis (2-5 par mort) + drop boss (×5)
- **Fragments** : matière première (Blanc / Bleu / Noir séparés dans le HUD)
- **Encre du Témoin** : consommable rare permettant d'identifier sans Sel

---

## ⚔ Combat

### Inputs (cf. `InputSystem`)
| Action | Touche |
|---|---|
| Mouvement | QD ou ←→ |
| Saut | ↑ ou Espace |
| Descendre (drop-through plateforme one-way) | S ou ↓ |
| Attaquer | X |
| Parry | C |
| Sort | Z (hook réservé Phase 6) |
| Interagir (PNJ, coffre) | E |
| Inventaire | I |
| Carte | M |
| Debug Résonance | K (-10) / H (+10) |

### Attaque (X)
- 3-couches slash Bézier (additive) + screen shake + hit-stop 60ms + flash écran 12 %
- Cooldown : 400 ms (modifiable par item Corps)
- Portée : 35 px (modifiable)
- Direction = dernière direction de marche

### Parry (C)
- Fenêtre 300 ms : anneau doré qui s'élargit + halo qui suit le joueur
- Cooldown 600 ms
- Parry réussi : +5 Résonance + flash expansif + 14 particules dorées
- Bloque projectiles ennemis + smash de boss

### Patterns de boss
- **Colosse** : smash AOE périodique (telegraph 800ms → impact 160 px de rayon + onde de choc + 22 gravats + screen shake)
- **Tisseur** : salves de 3-5 projectiles téléguidés (homing modulable)
- **Hydre** : composite multi-phases (Colosse + Tisseur en alternance, hit-points par phase)

### Gating boss
- Porte E de la salle BOSS bloquée tant que boss vivant ("La voie est scellée")
- À mort du boss : drop T3 garanti + porte E s'ouvre → étage suivant
- **Phase 4 du mini-jeu** : remplacera l'ouverture auto par une **Clé d'étage** dropée

---

## 🏗️ Architecture Technique (Phaser.js)

### Structure des fichiers (réelle)
Voir [CLAUDE.md](CLAUDE.md#structure-du-projet-réelle-2026-05-12) pour le listing complet à jour.

Organisation :
- `data/` — définitions statiques (templates, palettes, recettes, phrases)
- `scenes/` — scènes Phaser (GameScene + overlays Cité + Inventaire + Map + UI)
- `systems/` — logique pure, pas de GameObject (Worldgen, EtageGen, ResonanceSystem, etc.)
- `entities/` — GameObjects physiques (Enemy, Boss, Projectile, Obstacle)
- `render/` — couches visuelles (containers Phaser, primitives Graphics — pas d'asset graphique)

### Principes
- **Joueur** = `Rectangle` invisible (hitbox) + `JoueurVisuel` Container animé qui suit. Même pattern pour ennemis/boss/coffre/PNJ.
- **Aucun asset graphique** : tout en primitives Phaser (Graphics, Rectangle, ParticleEmitter, Tween).
- **Registry Phaser** = état persistant. Survit aux `scene.restart()` (transitions de salle, basculements). Communication scène ↔ scène via `changedata-<cle>` events.
- **Génération seedée** (PRNG Mulberry32). Même seed → même géométrie reproductible.
- **Pas de `MirrorScene` séparée** : `GameScene` branche normal/miroir conditionnellement.
- **Tout input via `InputSystem`** (intentions sémantiques, prépare le portage mobile).
- **`Phaser.Scale.FIT`** : coordonnées internes 960×540, canvas s'adapte à la fenêtre.

### Cible mobile (à venir)
Contrôles actuels = clavier. À long terme :
- Joystick gauche virtuel : déplacement horizontal
- Bouton A : saut
- Bouton B : attaque / parry (selon timing)
- Swipe up : interagir
- Appui long sur item : description cryptique

L'architecture `InputSystem` (intentions sémantiques) est prête pour ajouter un input tactile sans toucher la logique gameplay.

---

## 📊 Scope du mini-jeu — où on en est

### ✅ Implémenté
- Personnage jouable (déplacement, saut, drop-through one-way, gravité)
- Génération procédurale d'étages (10 étages × 7 salles par graphe, Phase A)
- 5 topographies pilotes (Phase 2a) — variété en cours d'extension
- 5 biomes par paires d'étages avec palettes + pools d'ennemis distincts
- Système de Résonance + HUD (jauge, slots équipement, compteurs Sel/Fragments)
- Cité Marchande Miroir avec 3 PNJ artisans (Fondeur + Identifieur + Marchand)
- Mort = retour Cité (heal complet, sans pénalité) + vortex retour = reset étage
- Loot : 3 familles (Blanc/Bleu/Noir), 3 tiers de révélation, 3 slots équipement
- 15 items + 6 consommables + 3 types de Fragments + 9 recettes Fondeur
- 20 ennemis paramétriques (4 archétypes × 5 biomes)
- 10 boss skinned (3 patterns Colosse/Tisseur/Hydre) avec gating porte E
- Combat RPG (attaque, parry, hit-feedback, projectiles parry-ables)
- Direction artistique : parallax 4 couches, palettes Présent/Miroir, décor par archétype, animations atmosphériques, entités stylisées, Carnet du Vestige

### ⬜ Hors scope mini-jeu (= roadmap Phase 4+)
- Boss intégrés "objectif final" (drop Clé d'étage, étage 10 = victoire)
- Écran de victoire
- Sorts (touche Z hook réservé) + combos d'équipement
- Fenêtre de grâce + Artefact + Absorption (LORE long terme)
- Vestiges du run précédent (cadavres pillables)
- Phases de perception des habitants Miroir (transparence → curiosité → hostilité)
- Codex / mémoire de carte entre runs (Phase 3 partiel)
- Sons et musique
- Multijoueur

> Note : ces éléments sont *définis* dans LORE.md. Ils ne seront pas tous implémentés dans le mini-jeu, mais les choix techniques actuels les laissent ouverts.

---

*Document vivant. À mettre à jour à chaque refonte structurelle.*
