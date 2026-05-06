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
8a. ✅ Direction artistique — 6 archétypes architecturaux (Sanctuaire, Hall des Échos, Crypte des Murmures, Pont Suspendu, Puits Inversé, Arène du Reflux), salles dimensionnées par archétype, caméra qui suit avec deadzone, seed du run randomisée. Refonte 8a' : voie principale plate + verticalité bonus, drop-through one-way, tous les sauts confortables (≤ 70 px vert / 130 px horiz)
8b1. ✅ Décor & couches z-order — `src/render/` (PainterlyRenderer, DecorRegistry, primitives Colonne / Statue / RacineLierre), palettes Présent (Mémoire Endormie) et Miroir (Mémoire Vive), vignette globale, particules d'ambiance par monde (poussière vs étincelles dorées), z-order strict (DEPTH.*)
8b2. ✅ Diversité architecturale — 9 nouvelles primitives (Bâtiment, Tour, Dôme, Atelier, SolDecore, Lanterne, Banderole, MobilierVie : Tonneau / Caisse / PotFleurs / EtalMarchand). Couche silhouettes lointaines (depth -50, alpha 0.45). Sol décoré (pavé + végétation rampante par-dessus le sol uni). Mobilier de vie aussi en Présent sous forme dégradée. Animations dès 8b2 : flicker lanternes (halo additif `BlendModes.ADD`), ondulation banderoles, fenêtres allumées qui clignotent, drapeaux qui ondulent, fumée d'atelier en Miroir. Variation seedée des compositions par archétype.
8b3. ✅ Environnement vivant — Parallax 4 couches (ciel/abîme avec dégradé Canvas + étoiles ou poussière d'or, silhouettes lointaines x0.3, silhouettes proches x0.7, foreground x1.05/1.15). Redesign plateformes/sol via `PlateformeStyle` (pierre cassée + fissures + mousse Présent / pavés ornés + chasse-pieds doré + frise Miroir, traitement spécial pour le sol principal). Animations atmosphériques : halo lumineux qui suit le joueur en Miroir (BlendModes.ADD, pulse), brume bleutée qui rampe au sol en Présent, rayons de lumière dorée obliques en Miroir.
8b4. ✅ Direction artistique des entités — Joueur (silhouette stylisée + cœur lumineux dont la couleur reflète la Résonance, animations idle/saut/atterrissage/flash hit), Gardien de Pierre (silhouette quadrupède + œil rougeoyant additif pulsant + fissures), Spectre de Cendre (silhouette flottante + voile + traînée de fumée + yeux clignotants), Coffre (bois + cerclages dorés + serrure, animation d'ouverture : couvercle qui pivote + burst d'étincelles dorées + cube qui sort et flotte vers le joueur)
8b5. ✅ Refonte UI inventaire — Carnet du Vestige (cadre stylisé, emblèmes vectoriels, slots dorés, panneau détail avec boutons, cascade d'ouverture)
8b6. ✅ Polish UI/animations — visuels stylisés des consommables (Larme/Cendre/Sel/Œil/Pierre/Encre, chacun avec emblème vectoriel propre + halo additif pulsant + flottement), HUD équipement reskinné (slots dorés ornementés réutilisant `creerSlot` avec label TÊTE/CORPS/ACC.), animation d'attaque refaite (slash courbe Bézier 3 couches + screen shake + hit-stop + flash écran), animation de parry refaite (anneau doré qui s'élargit + halo qui suit + effet renforcé pour parry réussi), animations d'attaque ennemis signatures (Gardien : poing rocailleux + œil rouge / Spectre : 4 serres courbes Bézier en éventail + yeux qui s'enflamment), fix layout panneau détail
9a. ✅ Économie — Sel de Résonance (monnaie) + Fragments (3 familles, matière première). `EconomySystem` (compteurs dans le registry, événements). Drops modifiés : ennemis donnent toujours 2-5 Sel + 35 % chance Fragment de leur famille naturelle (Gardien=Blanc, Spectre=Bleu). Coffres : 30 % chance Fragment en Présent, 60 % en Miroir. HUD : compteur Sel doré + 3 compteurs Fragments (avec emblèmes vectoriels) sous l'équipement.
9b. ✅ Le Fondeur — table de forge avec 3 emplacements, 9 recettes (1 et 2 Fragments) cachées au joueur, phrases cryptiques contextuelles ("Curieux. L'un éteint l'autre."), coût en Sel (3/8/15), visuel signature (silhouette robuste + brasero + flammes additives + halo doré), spawn 33 % par salle Miroir, interaction touche E, overlay style Carnet du Vestige
9c. ✅ L'Identifieur — révélation 1 effet à la fois, phrases poétiques cryptiques par cible (*"Cet objet hâte ton bras."* / *"Tu portes une autre âme."*), tracking globale par itemId, coût 5/12 Sel ou 1 Encre du Témoin (choix explicite). Visuel : être hiératique en méditation, robe blanche/crème, voile blanc sur les yeux, mains paumes vers le haut, halo bleu argenté. Spawn 25 % par salle Miroir (exclusif avec Fondeur 33 %). PanneauDetail (Carnet du Vestige) respecte les révélations.
9d. ✅ Le Marchand — la Glaneuse (vitrine + rachat + fragmentation)
9e. ⬜ Recettes 3 Fragments + humeurs du Fondeur + paris du Marchand
9f. ⬜ Items générés procéduralement (variants)
8c. ⬜ Innovations mécaniques signature (aura Sanctuaire, échos Hall, drop-down Crypte, plateformes résonantes Pont, gravité inversée Puits, espace rétrécissant Arène)
8d. ⬜ Parallax 4 couches (ciel, silhouettes lointaines)
8e. ⬜ Polish (animations idle/marche du joueur, post-process)

## Roadmap macro — Étages, biomes et boss
*Refonte structurelle décidée le 2026-05-06. Passage d'un roguelike linéaire infini à un roguelike structuré en 10 étages avec objectif final (l'Artefact de Résonance au sommet, cf. LORE §6).*

- **Phase A** ✅ — Graphe d'étage + carte + fix Puits Inversé. Modèle (etage, salleId), 7 salles par étage en arbre (chaîne main A→B→C→D→BOSS + dead-ends verticaux B-haut/D-haut), portes N/S/E/O multidirectionnelles avec retour bidirectionnel, MapScene avec découverte à mesure (touche M).
- **Phase B** ⬜ — Biomes + gradient destruction/reconstruction. 10 étages → 3-4 biomes (palettes, archétypes, ennemis). Présent : ruiné en bas, reconstruit en haut. Miroir : intact en bas, effondré en haut sous le Reflux.
- **Phase C** ⬜ — Boss + objectif. 1 boss par étage, drop garanti (clé / Artefact). 1er boss prototypé.
- **Phase D** ⬜ — Polish navigation & méta (téléport vers salles visitées, mémoire de carte entre runs).

## État actuel
*Cette section doit être mise à jour à la fin de chaque session de travail.*

- **Dernière étape franchie :** **Phase A** — Graphe d'étage + carte + fix Puits Inversé. **Refonte structurelle majeure** : on quitte le roguelike linéaire (`indexSalle: 0,1,2,...`) pour un modèle (étage, salleId) avec graphe de salles bidirectionnel et 10 étages au total. Nouveau : `data/biomes.js` (placeholder Phase B, un seul biome "ruines basses" pour l'instant), `systems/EtageGen.js` (génération seedée d'un graphe d'étage : 7 salles en arbre — chaîne principale A→B→C→D→BOSS connectée E/O + 2 dead-ends verticaux B-haut / D-haut connectés par N avec coffre garanti, sérialisation `etageVersRegistry` / `etageDepuisRegistry` car le registry n'aime pas Map/Set), `scenes/MapScene.js` (overlay carte avec touche M : nœuds des salles visitées en plein, salles adjacentes-connues en pointillés, salles inconnues invisibles, salle courante surlignée pulsante, étoile rouge pour le boss, gestion `connus = visités ∪ voisins de visités`). Refactor `systems/WorldGen.js` : `genererSalle({seedEtage, etageNumero, salleId, archetype, portesActives, estBoss, estEntree})` produit `{id, archetype, dims, plateformes, portes: {N?,S?,E?,O?}, vortex, spawnDefault, coffre, dropSol, ennemis, estBoss, estEntree}`. `data/archetypes.js` étendu avec `portesPossibles: ['E','O',...]` par archétype + `calculerPorte(archetype, dims, direction)` qui calcule la position d'une porte selon la direction (E=droite sol, O=gauche sol, N=centre haut, S=centre bas) + `spawnDepuisPorte(porte)` (spawn à 60 px à l'intérieur de la porte) + `directionOpposee(dir)`. **Fix Puits Inversé** : `portesPossibles: ['N','S','E']`, plateforme du sommet élargie (320 px) pour porter une vraie porte N, porte E sur le palier-sortie à yTop=900 inchangée, porte O au sol, porte S au sol. GameScene refactoré : state model `(etageNumero, salleId)` dans le registry, génération d'étage à la volée si manquant, `_traverserPorte(salle, direction)` charge la salle voisine via `salle.voisins[direction]` et passe `porteArrivee = directionOpposee(direction)` pour spawn correct côté voisin, `monterEtage()` quand la salle BOSS est traversée par E (porte de transition d'étage sans voisin dans le graphe). Touche M dans InputSystem (`ouvrirCarte`). Clés persistantes des coffres/drops/ennemis passées en `${etage}:${salleId}` pour éviter les collisions entre étages. **Le retour entre salles fonctionne** : tu peux ressortir par la porte par laquelle tu es entré, l'état de la salle persiste (coffres ouverts restent ouverts, ennemis tués restent morts, ennemis non-tués respawn à leur position d'origine — anti-farm naturel).
- **Précédente étape :** 9d — Le Marchand (la Glaneuse). `data/phrases-marchand.js` (phrases lassées et cryptiques par contexte : accueil, vente réussie / vente pauvre, rachat, fragmentation, fragmentation bonus Reflux, inventaire plein, vitrine vide). `systems/MarchandSystem.js` (logique pure : `acheter/vendre/fragmenter` atomiques sur EconomySystem + InventaireSystem ; `genererVitrine` 4 items seedés selon proba Miroir ; prix d'achat 8/20/50 Sel par tier, rachat à 30 %, fragments rendus = tier, **10 % chance Fragment Noir bonus en T3** comme easter egg lore). `render/entities/Marchand.js` (la Glaneuse : tapis brodé étalé + 4 items silhouettes décoratifs sur le tapis, vieille femme assise jambes croisées, châle mauve à franges dorées, robe pourpre, cheveux gris en chignon, yeux mi-clos, longue pipe avec braise rougeoyante additive et fumée ParticleEmitter, halo mauve discret pour repérage). `scenes/MarchandScene.js` (overlay Carnet du Vestige avec 3 onglets cliquables VITRINE/RACHAT/FRAGMENTER, slots à gauche, panneau détail à droite, bouton d'action contextuel ACHETER/VENDRE/FRAGMENTER, animation de transaction (flash + 14 particules — dorée pour vente/rachat, couleur famille pour fragments, violette si bonus Reflux), bande ressources Sel+Encre+3 Fragments en bas). Vitrine persistée dans le registry sous clé `vitrine:<seed^salle>` : tu peux quitter et revenir, c'est la même vitrine. Spawn revisité : Fondeur 28 % / Identifieur 22 % / Marchand 22 % / rien 28 %. Interaction touche E rayon 60 px comme les autres PNJ.
- **Précédente étape :** 9c — L'Identifieur. `data/phrases-identifieur.js` (phrases poétiques par cible d'effet — JAMAIS la valeur, juste ce que ça FAIT SENTIR), `systems/IdentificationSystem.js` (tracking { itemId: [indices effets révélés] } dans le registry, calcul tier effectif, premier effet caché), `render/entities/Identifieur.js` (être hiératique en robe crème + voile blanc + cheveux blancs + mains levées paumes vers le haut + cordon doré + halo bleu argenté pulsant + tapis de méditation), `scenes/IdentifieurScene.js` (overlay : liste filtrée Tier 2/3 avec effets cachés à gauche, panneau item à droite avec effets visibles/cachés selon tier, 2 boutons RÉVÉLER (5/12 Sel ou 1 Encre du Témoin), animation de révélation flash doré + 14 particules + phrase poétique italique bleu pâle, bande ressources avec Sel + Encre + Fragments). Spawn exclusif Fondeur 33 % / Identifieur 25 % / rien 42 %. Encre du Témoin transformée en ressource cumulable (compteur `encre_temoin_stock` dans EconomySystem). PanneauDetail du Carnet du Vestige modifié pour utiliser IdentificationSystem.effetsEffectifs() — les révélations sont visibles partout dans l'inventaire.
- **Précédente étape :** 9b — Le Fondeur. `data/recettes.js` (9 combinaisons codées en dur, jamais affichées au joueur, plus phrases cryptiques contextuelles), `systems/FondeurSystem.js` (logique pure atomique : vérifie conditions, tire résultat, consomme Fragments + Sel), `render/entities/Fondeur.js` (visuel signature : silhouette robuste avec gants brûlés, brasero rougeoyant à 3 couches de flammes additives + fumée ParticleEmitter, halo doré pulsant pour repérage), `scenes/FondeurScene.js` (overlay style Carnet : phrase italique du Fondeur en haut, 3 emplacements pour Fragments, 3 boutons d'ajout par famille avec compteur de stock disponible, coût en Sel calculé live, bouton FONDRE + indication contextuelle d'échec, zone résultat avec emblème agrandi + halo + nom + ★ Tier 3, bande ressources en bas). Spawn aléatoire seedé : 33 % de chance par salle Miroir, position sur le sol entre 0.3-0.7 de la largeur. Interaction touche E avec rayon 60 px. Tout est seedé pour reproductibilité du run.
- **Précédente étape :** 9a — économie de base. `data/fragments.js` définit 3 types (blanc/bleu/noir, matière première inerte). `systems/EconomySystem.js` gère le Sel de Résonance (monnaie) et les compteurs de Fragments dans le registry, méthodes `ajouterSel/retirerSel/peutPayer/ajouterFragment/retirerFragment/retirerLot` (atomique pour les recettes). Drops d'ennemis : 2-5 Sel garanti + 35 % chance d'1 Fragment de la famille du type (Gardien=Blanc, Spectre=Bleu). Coffres : 30 % chance Fragment en Présent / 60 % en Miroir, selon les mêmes proba de famille que les items équipables. HUD étendu dans `UIScene` : compteur Sel doré (cristal en losange) + 3 compteurs Fragments alignés à droite, chacun avec emblème vectoriel cliquable (cercle/triangle/losange), sous l'équipement.
- **Précédente étape :** 8b6 — polish UI/animations. `src/render/entities/Consommable.js` ajoute un visuel par type de consommable (Larme = goutte, Cendre = nuage, Sel = cristal facetté, Œil de Verre = œil rond avec iris, Pierre d'Ancrage = forme angulaire, Encre du Témoin = flacon noir bouchon doré). Chaque consommable a un halo additif pulsant + un léger flottement. UIScene reskinné : `creerSlot` réutilisé pour les 3 slots équipés (mode équipé compact, label gravé, liseré doré). Attaque refaite : croissant lumineux additif (deux couches large+étroite) + étincelles dorées explose, tween de scale qui s'élargit. Parry refait : anneau doré qui s'élargit (signal de déclenchement) + halo qui suit le joueur pendant la fenêtre + `_jouerEffetParryReussi` (flash expansif additif + 14 particules dorées). Fix UI : `yBtn = max(yL + 24, hauteur - 44)` dans le panneau détail pour éviter le chevauchement des boutons sur les effets, panneau hauteur 320 pour accommoder 4-5 effets.
- **Précédente étape :** 8b5 — refonte UI inventaire (Carnet du Vestige). 4 nouveaux modules dans `src/render/ui/` :
  - `EmblemeFamille.js` : cercle perle Blanc / triangle élévation Bleu / losange Reflux Noir, taille paramétrable
  - `CadreInventaire.js` : fond pierre + double bordure dorée + 4 coins ornementés (motifs en L + petits losanges) + titre gravé "CARNET DU VESTIGE" avec liseré central, bouton fermer ✕ stylisé
  - `SlotInventaire.js` : slot vide ou plein avec emblème centré, étoile rouge vectorielle pour Tier III + halo, glow doré au hover, mode équipé avec cadre doré + petits coins ornementés + label sous le slot
  - `PanneauDetail.js` : emblème 38px avec halo pulsant additif, nom stroke épais coloré famille, sous-titre famille•slot, description italique encadrée, effets puces dorées selon tier (visible/partiel/caché), boutons "manuscrit" hover doré (Équiper/Jeter/Déséquiper)
  Animation d'ouverture en cascade : cadre fade-in puis slots équipés un à un puis grille inventaire entière avec délais successifs.
- **Précédente étape :** 8b4 — direction artistique des entités, portes et vortex. 4 nouveaux fichiers dans `src/render/entities/` :
  - `Joueur.js` : silhouette humanoïde sombre (tête, torse, jambes, bras suggérés) + **cœur lumineux additif** (BlendModes.ADD) dont la couleur reflète la Résonance courante (blanc bleuté → ambre → rouge → noir vacillant). Animations : respiration idle, squash-stretch en saut, squash atterrissage, flash blanc/rouge sur hit.
  - `GardienPierre.js` : silhouette quadrupède trapue + œil rougeoyant additif central qui pulse + fissures dessinées. Respiration rocailleuse lente.
  - `SpectreCendre.js` : silhouette flottante semi-transparente + voile clair + bord en zigzag + 2 yeux noirs creux qui clignotent + traînée de fumée (ParticleEmitter qui suit). Flottement vertical + ondulation de robe.
  - `Coffre.js` : Container avec corps en bois (veines + 2 cerclages dorés) + couvercle articulé (Container pivot pour rotation) + serrure dorée. Animation d'ouverture : couvercle pivote -110°, burst de 24 étincelles dorées additives, cube de la couleur de la famille qui monte puis vole vers le joueur, coffre passe en mode tamisé.
  Architecture : tous les visuels sont des Containers Phaser qui suivent un Rectangle physique invisible (alpha 0). Les Rectangle gardent les hitboxes pour la physique arcade. `Enemy.js` choisit le visuel selon `def.id`.
- **Précédente étape :** 8b3 — environnement vivant (parallax, plateformes ornées, animations atmosphériques). 3 nouveaux modules dans `src/render/` :
  - `Parallaxe.js` : ciel/abîme avec dégradé vertical Canvas (x0 fixe), étoiles Présent ou poussière d'or Miroir (x0.15), silhouettes très lointaines (x0.3) avec composition seedée
  - `AnimationsAmbiance.js` : halo lumineux additif qui suit le joueur en Miroir (BlendModes.ADD + pulse), brume bleutée rampante au sol en Présent (5 nuages cycliques), rayons de lumière dorée obliques en Miroir (3 faisceaux animés en alpha)
  - `PlateformeStyle.js` : ornement par-dessus chaque plateforme — pierre cassée + fissures + mousse + brindilles Présent / pavés joints + chasse-pieds doré + frise centrale + petites fleurs Miroir. Le sol principal reçoit un traitement spécial (frise/herbes plus fournies)
  Silhouettes proches du DecorRegistry passées à scrollFactor 0.7 pour le parallax.
- **Précédente étape :** 8b2 — diversité architecturale et de sol. 9 nouvelles primitives en `src/render/elements/` : `Batiment` (à étages avec fenêtres, allumées et clignotantes en Miroir), `Tour` (avec drapeau ondulant), `Dome` (cassé/intact, vitraux), `Atelier` (forge avec fumée animée en Miroir), `SolDecore` (pavé + végétation rampante + pierres, par-dessus le sol uni), `Lanterne` (halo lumineux additif `BlendModes.ADD` qui flicker en Miroir), `Banderole` (tissu suspendu qui ondule), `MobilierVie` (Tonneau / Caisse / PotFleurs / EtalMarchand). Plans enrichis par archétype dans `DecorRegistry` avec couche silhouettes lointaines (depth -50), structures principales, sol décoré, mobilier. Variation seedée par run. La diversité visuelle correspond enfin à l'identité "ville morte vs ville vivante".
- **Précédente étape :** 8a — direction artistique & structure architecturale. `data/archetypes.js` définit 6 archétypes (Sanctuaire 1280×540, Hall des Échos 1920×540, Crypte des Murmures 1280×540, Pont Suspendu 2200×540, Puits Inversé 960×900 *vertical*, Arène du Reflux 1280×720). Chaque archétype a son script de génération de plateformes propre (architecture forte au lieu de plateformes random). `WorldGen` choisit un archétype selon le niveau de danger (`niveauxAssocies`) avec variation aléatoire seedée. Caméra Phaser : `startFollow(player)` + `setDeadzone(200, 150)`, bounds physiques dynamiques par salle. Seed du run **randomisée à l'init** et persistée dans le registry pendant tout le run (`Math.random()` au démarrage). HUD textuel passé en `setScrollFactor(0)` pour rester fixe à l'écran malgré le scrolling.
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
  - Génération en graphe d'étage (Phase A) — 7 salles en arbre, retour bidirectionnel possible. Phase B (biomes par étage) et Phase C (boss) à venir
  - Pas encore d'Artefact de Résonance ni de fenêtre de grâce avant Absorption — l'Ancrage actuel reste statique (LORE.md §6 décrit la mécanique cible). L'objectif "récupérer l'Artefact au sommet" est décidé pour Phase C
  - La couche "capitalisation" du Présent (Sanctuaires, Fondeur, Marchands) est définie dans LORE/GDD mais pas implémentée
  - Toute proposition touchant au Miroir doit être lue à travers la Doctrine ([LORE.md §11](LORE.md))
  - Toute proposition touchant au loot doit favoriser la profondeur et le choix (préférence utilisateur en mémoire)
  - Tout input doit passer par `InputSystem` — jamais de `Keyboard` direct dans la logique gameplay (préférence en mémoire, prépare le portage mobile)
  - Phase A : la salle BOSS n'a pas encore de combat de boss, c'est juste une salle vide marquée. La porte E te fait monter d'un étage. Phase C ajoutera le combat
  - Phase A : un seul biome "ruines basses" pour les 10 étages. Phase B introduira la diversification
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
