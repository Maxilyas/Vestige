<div align="center">

# ✦ VESTIGE ✦

### *La mémoire marche entre deux mondes*

<br>

[![Phaser](https://img.shields.io/badge/Phaser-3.70-3a8cef?style=for-the-badge&logo=phaser&logoColor=white)](https://phaser.io)
[![JavaScript](https://img.shields.io/badge/Vanilla%20JS-no%20bundler-ffd070?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Status](https://img.shields.io/badge/Statut-mini--jeu%20terminable-c2a04a?style=for-the-badge)](#-roadmap)
[![License](https://img.shields.io/badge/Licence-MIT-8a7858?style=for-the-badge)](#-licence)

<br>

### [▶ Jouer en ligne](https://maxilyas.github.io/Vestige/) · [📖 Lore](LORE.md) · [🎮 Game Design](GDD.md)

<br>

---

</div>

## ❍ Le concept

Un **plateformer 2D fantasy médiéval** où le joueur est un *Vestige* — un fragment de conscience capable de glisser entre **deux états du monde** :

> *« Le Présent que tu parcours n'est que la cendre du Reflux. Quand ta cohérence s'effondre, tu glisses dans son passé vivant — et tu t'y reforges. Le loot est un langage que tu apprends seul. Aucun tutoriel. »*

Inspirations : **Terraria** (exploration) · **Dark Souls** (loot énigmatique, fail-and-retry) · **Hollow Knight** (metroidvania feel) · **Ogame** (progression méritée).

Le tout rendu en **style painterly vectoriel** — chaque pixel à l'écran est dessiné à la volée en primitives Phaser. Aucun asset graphique externe.

<br>

---

## ❍ Les deux mondes

<table>
<tr>
<td width="50%" valign="top">

### ❖ Le **Présent**
*Mémoire endormie*

Les ruines silencieuses laissées par le Reflux. Bleu nuit, brumes bleutées au sol, silhouettes lointaines de cités effondrées, lanternes éteintes. Le terrain de chasse — ennemis, pièges, coffres, boss.

Tu es **seul** dans le Présent.

</td>
<td width="50%" valign="top">

### ❖ Le **Miroir**
*Mémoire vive*

Le passé *fixé* de la civilisation des Sources, perpétuellement vivant. Or chaud, pourpres royaux, drapés ondulants, lanternes allumées, fumées d'atelier. Hub d'artisans paisibles.

Tu es **accueilli** au Miroir — comme un fantôme qu'on reconnaît.

</td>
</tr>
</table>

> Les deux mondes occupent **le même espace**. Marcher dans une ruine en Présent, c'est marcher au même endroit qu'un atelier vivant en Miroir.

<br>

---

## ❍ La Résonance

```
   ◆◆◆◆◆◆◆◆◆◆  100   sereine    cœur blanc bleuté
   ◆◆◆◆◆◆◆◆◇◇   70   inquiète   cœur ambre clair
   ◆◆◆◆◇◇◇◇◇◇   40   fragile    cœur ambre vif
   ◆◆◇◇◇◇◇◇◇◇   20   vacillante cœur rouge sang
   ◇◇◇◇◇◇◇◇◇◇    0   effondrée  retour à la Cité
```

La **Résonance** est l'équivalent des PV mais habille un concept : *la cohérence de ton Vestige*. À zéro, tu ne meurs pas — tu **glisses** dans la Cité Miroir, plein heal, sans pénalité. La mort y est *la récompense de la défaite*, pas un game over.

<br>

---

## ❍ Trois familles de Vestiges

Le loot ne révèle jamais directement ses statistiques. Trois familles, trois doctrines, trois tiers de révélation (visible · partiel · caché ★).

<table>
<tr>
<th>Famille</th><th>Origine</th><th>Lecture</th><th>Apprivoiser</th>
</tr>
<tr>
<td><strong>✦ Blanc</strong></td>
<td>Présent</td>
<td>Effets directs, bruts</td>
<td>Identifieur révèle 1 effet à la fois</td>
</tr>
<tr>
<td><strong>✦ Bleu</strong></td>
<td>Miroir</td>
<td>Effets décalés, conditionnels</td>
<td>Le geste lui-même est l'identification</td>
</tr>
<tr>
<td><strong>✦ Noir</strong></td>
<td>Reflux</td>
<td>Effets dangereux, ambigus</td>
<td>Coûte un sacrifice — temps, mémoire, Résonance</td>
</tr>
</table>

S'y ajoutent les **Vestiges signature** — un par boss vaincu (10 au total). Quatre Gestes actifs (touche `V`), quatre Maîtrises passives, et l'Artefact final.

<br>

---

## ❍ La boucle

```
┌─ PRÉSENT ────────────────────────────────┐
│  Explorer · combattre · récolter         │
│  Résonance → 0                           │
└────────────────────┬─────────────────────┘
                     ↓
┌─ CITÉ MIROIR ────────────────────────────┐
│  ✦ Fondeur     — combiner Fragments       │
│  ✦ Identifieur — révéler les effets       │
│  ✦ Marchand    — vendre, racheter, fragmenter │
└────────────────────┬─────────────────────┘
                     ↓ (vortex de retour)
        ⟲ L'étage se rejoue, plus fort
```

La Cité est un **hub paisible** où vivent les souvenirs des artisans des Sources. Trois PNJ rassemblés sur le sol marbré, sous les lanternes qui ne s'éteignent jamais.

<br>

---

## ❍ Dix étages, dix Souverains

<table>
<tr><td><strong>1–2</strong></td><td>🪨 <strong>Ruines basses</strong></td><td>Pierre fanée, mousse, racines pourpres traversantes</td></tr>
<tr><td><strong>3–4</strong></td><td>🔥 <strong>Halls Cendrés</strong></td><td>Cendre tiède, braises, tisseuses, murs de feu</td></tr>
<tr><td><strong>5–6</strong></td><td>❄ <strong>Cristaux Glacés</strong></td><td>Givre, miroirs, illusions, perception trompée</td></tr>
<tr><td><strong>7–8</strong></td><td>🜲 <strong>Voile Inversé</strong></td><td>Gravité retournée, mirages, anti-parry</td></tr>
<tr><td><strong>9–10</strong></td><td>✦ <strong>Cœur du Reflux</strong></td><td>Fissures, échos, drain de cohérence — le Souverain</td></tr>
</table>

Chaque biome porte **6 archétypes d'ennemis** uniques avec mécaniques signature (cœurs fragmentés qui explosent post-mortem, regards-laser, clones illusoires, contrôles inversés…). Plus de **40 topographies** générées avec des arènes boss dédiées.

<br>

---

## ❍ Combat

| Touche | Action | Détail |
|:------:|:-------|:-------|
| `X` | **Attaque** | 3 couches de slash Bézier · screen-shake · hit-stop · flash |
| `C` | **Parry** | Anneau doré · fenêtre 300 ms · Résonance regagnée si réussi |
| `V` | **Geste** | Capacité du Vestige équipé (onde, dash, projectile homing…) |
| `Z` | *Sort* | Hook réservé Phase 6 |

S'y ajoutent **double-saut**, **slow-mo au parry**, **renaissance** (auto-revive 1×) selon les Maîtrises équipées.

<br>

---

## ❍ Stack technique

- **Phaser 3.70** via CDN — pas de bundler, pas de build step
- **JavaScript vanilla** modules ES — pas de TypeScript, pas de transpilation
- **Tout en primitives Phaser** — `Graphics`, `Rectangle`, `ParticleEmitter`, `Tween`. Aucun asset graphique externe
- **Architecture** : `scenes/` (Phaser scenes) · `systems/` (logique pure) · `entities/` (GameObjects) · `render/` (couches visuelles) · `data/` (catalogues statiques)
- **Persistance** : `localStorage` pour la méta (sceaux, carte mémoire, marker fin) · `registry` Phaser pour l'état du run
- **Input** : abstrait via `InputSystem` — jamais de lecture clavier directe (cible : portage mobile)

<br>

---

## ❍ Jouer

### ▶ En ligne
**[maxilyas.github.io/Vestige](https://maxilyas.github.io/Vestige/)**

### ▶ En local

```bash
git clone https://github.com/Maxilyas/Vestige.git
cd Vestige
npx live-server .
```

Pas d'installation, pas de `npm install`. Le navigateur charge directement les modules ES depuis le CDN de Phaser.

<br>

---

## ❍ Toutes les touches

```
DÉPLACEMENT       Q / D ou ← / →
SAUTER            Espace ou ↑
DESCENDRE         S ou ↓ (drop-through sur plateforme one-way)
INTERAGIR         E
ATTAQUER          X
PARRY             C
GESTE             V    (Vestige actif équipé)
INVENTAIRE        I
CARTE             M
```

<br>

---

## ❍ Roadmap

| Phase | État | Description |
|:-----:|:----:|:------------|
| 1 → 4 | ✅ | Fondations · génération · combat · loot · 5 biomes · 10 boss |
| 5a | ✅ | Sceaux d'étage persistants |
| 5b | ✅ | Vestiges signature (10 items, 3 slots dédiés, 4 Gestes + 4 Maîtrises) |
| **5c.1** | ✅ | **MenuScene de démarrage** |
| **5c.2** | ✅ | **Écran de victoire + cinématique fusion + Artefact** |
| 5c.3 | ⬜ | Polish HUD cooldown Geste |
| 5' | ⬜ | Identité visuelle par paire d'étages |
| 6 | ⬜ | Spells & combos d'équipement |

> **Statut actuel** : le mini-jeu est **terminable**. Tu peux finir les 10 étages, voir la cinématique de fusion avec l'Artefact, et débloquer l'écran de fin.

Détail complet de chaque phase et de l'historique des commits dans [CLAUDE.md](CLAUDE.md).

<br>

---

## ❍ Documentation

<table>
<tr>
<td width="33%" valign="top">

### 📖 [LORE.md](LORE.md)
La cosmologie complète : Résonance, civilisation des Sources, le Reflux, doctrine du Vestige, habitants du Miroir.

</td>
<td width="33%" valign="top">

### 🎮 [GDD.md](GDD.md)
Game Design Document : mécaniques implémentées, scope MVP, vision long terme.

</td>
<td width="33%" valign="top">

### 🛠 [CLAUDE.md](CLAUDE.md)
Contexte technique : roadmap détaillée, architecture, systèmes implémentés, doctrine head-bonk, dette technique.

</td>
</tr>
</table>

<br>

---

<div align="center">

## ✦

*« Tu n'étais qu'une lueur entre deux mondes.*
*Au sommet du Reflux, l'Artefact attendait.*
*Pas une arme. Pas une couronne.*
*Un nom — le tien. »*

— *Texte de fin du mini-jeu, Phase 5c.2*

<br>

---

### Développé par [@Maxilyas](https://github.com/Maxilyas) avec [Claude Code](https://claude.com/claude-code)

**Licence MIT**

</div>
