# VESTIGE — Cœur du Reflux (biome 9-10)
> Document de conception du dernier biome. Référence canonique.
> Décidé en session 2026-05-31. Donne sens aux décisions DA + gameplay et structure les phases 9.10 → 9.15.
> Voir aussi : [LORE.md](LORE.md) (§3 Reflux, §5 Vestige, §9 fins), [GDD.md](GDD.md), [CLAUDE.md](CLAUDE.md) (roadmap).

---

## 0. En une phrase

Le Cœur du Reflux abandonne le plateformer side-scroll et bascule en **vue de dessus**. On n'y marche plus *dans* la civilisation : on marche *sur sa mémoire*, comme le Témoin qui regarde le monde d'en haut. C'est le climax narratif (retrouver la mémoire) et le pic de skill (étages 9-10 sur 10).

---

## 1. La rupture : pourquoi la vue de dessus

Ce n'est pas un gimmick — c'est la conclusion logique de l'arc des 5 biomes, lu à travers la gravité :

| Biome | Rapport à la gravité |
|---|---|
| Ruines basses | On **subit** la gravité (gouffres, surfaces) |
| Halls Cendrés | On **survit dans la matière** (verticalité, brasiers) |
| Cristaux Glacés | On **monte vers le divin** (ascension, plateaux flottants) |
| Voile Inversé | On **questionne** la gravité (inversion locale, pendules) |
| **Cœur du Reflux** | La gravité **cesse d'être pertinente** (vue de dessus) |

Le Vestige n'arrive plus comme un corps qui tombe, mais comme une **conscience qui flotte sur une surface qui n'est plus le sol**. La vue de dessus est la perspective du **Témoin** (3ᵉ théorie du Reflux, LORE §3) : la conscience plus grande qui voit la civilisation d'au-dessus. Le joueur *devient* ce témoin pour les deux derniers étages ; quand il aura traversé, il aura *vu*, et pourra témoigner (Fin du Témoin, LORE §9).

**Continuité DA** : on est PASSÉ À TRAVERS une déchirure du Voile et on est entré DANS la Tour (cf. `biomes.js coeur_reflux` : intérieur clos, cramoisi). La bascule de perspective matérialise ce passage « à l'intérieur ».

---

## 2. Décisions verrouillées (Design Lock — 2026-05-31)

| # | Décision | Choix |
|---|----------|-------|
| 1 | Perspective | **Top-down strict 90°**. Hauteur suggérée par **ombres portées allongées** (les statues ont une ombre → on lit le relief). |
| 2 | Mobilité | **Dash** i-framé (≈0.25s, cd ≈0.8s) **remplace le saut**. Traverse projectiles, pas les murs. Impulse → impulse : symétrie narrative avec le saut. |
| 3 | Bestiaire | **3 archétypes seulement** : Résidu lent / Résidu rapide / Œil tireur. L'environnement est le vrai ennemi (le Cœur n'a pas de gardiens, il a des *anomalies*). |
| 4 | Tableaux figés | **Éditorialisés** (10-15 scénarisés main), pas génériques. Le Cœur est le climax, on accepte le coût. |
| 5 | Mort | **Système MVP intact** (retour Cité, pas de perma-mort). Le challenge vient de la densité de design, pas d'une punition imposée. |
| 6 | Boss étage 9 | **Mid-boss exigeant** (pas pédagogue tendre) : étage 9/10, ça doit envoyer. Cf. §7. |

---

## 3. Mouvement & combat en top-down

### Mouvement
- **Marche 8 directions** (axes ZQSD / flèches), vitesse = marche side-scroll actuelle.
- **Dash** (intent dédié) : tiret court i-framé, ~0.25 s, cooldown ~0.8 s. Remplace fonctionnellement le saut. Traverse les projectiles (i-frames), bute sur les murs.
- **Pas de drop-through, pas de gouffre** : le sol est plein. Les zones impraticables sont des **murs réels** ou des **zones dangereuses** (dissolution, lasers).

### Combat (touches conservées : X / C / 1-2-3)
- **Attaque X** : coup radial dans la direction du mouvement (ou dernière direction si immobile). Cône ~90°, portée courte.
- **Parry C** : bulle radiale 360°, fenêtre ~250 ms. Dévie tous les projectiles entrants. **Plus central qu'en side-scroll** : les tirs viennent de toutes les directions.
- **Sorts 1/2/3** : ciblage auto sur l'ennemi le plus proche, ou direction du mouvement. FX radiaux (cônes, ondes, ronds qui s'étendent).
- **Garde** : conservée, visuel adapté → **anneau autour du joueur** vu de dessus (pas la barre flottante side-scroll).

### Threat profile (remplace les gouffres mortels)
- **Zones de dissolution** — taches au sol, dégâts continus si on s'y attarde.
- **Lasers de surveillance** — rais qui balaient lentement la salle (lecture facile, esquive par dash).
- **Pieux mnémoniques** — pousses qui surgissent du sol sur timer (warning particules).
- **Ondes du Cœur** — pulses radiaux depuis un centre, à esquiver vers la périphérie.
- **Murs animés** — segments mobiles (toujours visibles), peuvent écraser.
- **Regards figés** — statues qui tirent un projectile lent vers le joueur quand il entre dans leur cône de vision (œil ambré qui pulse = lecture).

---

## 4. Les trois mécaniques signature

Combinables entre elles (un tableau qui s'anime dans une zone d'oubli, un courant qui traverse des tableaux figés, etc.).

### a) Tableaux qui s'animent (`tableau_anime`)
Scène de la civilisation capturée à la seconde du Reflux. Figures **immobiles**, statufiées, dont le regard suit. Un sigle au sol (ou la proximité) les **anime 2-4 s** :
- les figures bougent (cortège qui passe, mage qui trace un sigle) ;
- pendant l'animation, certaines **bloquent un passage** ;
- au re-figement, l'animation **libère un fragment** (éclat de souvenir).
- → trade-off : déclencher pour le loot, mais subir le blocage temporaire.

### b) Courants de Reflux (`courant_reflux`)
Rivières violettes au sol, **non mortelles**, qui **poussent** le joueur dans une direction (cf. `souffleBlizzard` existant, version top-down omnidirectionnelle). On peut s'en servir (déplacement rapide gratuit) ou lutter (vitesse réduite, coûteux en temps). Direction lisible par les particules qui défilent.

### c) Zones d'oubli (`zone_oubli`)
Taches grises où **tes capacités s'éteignent** : pas d'attaque, pas de sort, dash bloqué. Tu n'es plus rien : tu traverses **passivement** en évitant tout. Ennemi typique : statue à laser long et lent — trivial hors zone, dramatique dedans.

---

## 5. Direction artistique top-down

**Palette** (réutilise `coeur_reflux.paletteBiome` de `biomes.js`, réinterprétée à plat) :
- Fond : **ambre profond** (souvenir doré) veiné de **violet/cramoisi** (Reflux qui infecte la mémoire). Le cramoisi reste sur les éléments *physiques* (sol praticable, ennemis, veines pulsantes) ; les surfaces de fond restent pierre froide désaturée (doctrine 5'.24.2).
- Sol : **chaque salle a sa texture** qui raconte son tableau (marbre fissuré, parquet cassé, mosaïque fanée).
- Murs : bas-reliefs, fresques, frises, tapisseries déchirées — vus du dessus = bandes ornementées.
- Lumière : rais d'or tombant d'en haut, rendus en **colonnes de particules au sol** (on devine la lumière sans la voir).

**Particules** : motes dorés flottant lentement (poussière dans un rayon) ; échos visuels localisés sur les tableaux (un mouvement rejoué en boucle, fade out) ; lignes violettes rampant depuis les coins corrompus.

**Joueur vu de dessus** : silhouette ovale (épaules + tête), cœur lumineux centré, traînée de pas dorée éphémère (~1 s), direction indiquée par la position de l'épée (rotation autour du corps).

**Tableaux figés** : silhouettes vues du dessus + aura ambrée pâle (= « souvenir, pas ennemi ») ; à proximité, **murmure** (texte cryptique 1 ligne, comme `vestige_lore`).

**Seuils entre salles** : pas de « porte » verticale → bande de mosaïque dorée + flash blanc bref. Respiration narrative : on passe d'un tableau à l'autre.

---

## 6. Catalogue des salles (18)

Toutes 960×540 top-down (`vue: 'topDown'`). Mix puzzle-requis / transit. ≥ 4 `unique: true` (signatures, ≥ 3/5 critères de CLAUDE.md).

### Étage 9 — Antichambre du Cœur (apprentissage + accumulation)

| # | Salle | Rôle | Idée |
|---|-------|------|------|
| 1 | **Le Seuil** | entrée | Salle ambrée vide, rais de lumière, sigle *« Ne baisse pas les yeux. »* Apprend le 8-dir + dash en 5 s. Pas d'ennemi. |
| 2 | **Le Cortège Figé** | unique | Procession de 12 figures formant un mur. Sigle → le cortège avance 3 s, ouvre des fenêtres entre les marcheurs. Écrasé = dégâts forts (pas mortel). Drop fragment. |
| 3 | **La Salle aux Mille Regards** | unique | 8 statues en cercle, regards vers le centre. Entrer dans un cône → projectile lent homing. Zigzag dans les angles morts. Coffre au centre. |
| 4 | **Les Courants Croisés** | transit | 4 rivières violettes en croix. Se laisser porter (rapide) OU couper à pied (lent mais sûr). Itinéraire libre. |
| 5 | **Le Damier Mnémonique** | unique | Sol damier doré/violet, inversion toutes les 3 s. Marcher sur violet = dégâts. Lire le pattern. 2 résidus patrouillent. |
| 6 | **L'Atelier Suspendu** | transit | Atelier de mage figé : outils suspendus en plein vol (compas verticaux = anomalie visuelle géniale en top-down). Navigation entre obstacles statiques. Murmure : *« Il allait terminer. »* |
| 7 | **Le Souffle de l'Inconscient** | transit dur | Vent permanent poussant le joueur (direction change toutes les 4 s). Compenser pour avancer. Résidus volants. |
| 8 | **Le Marché Statufié** | alt / flavor | Marché du Miroir vu d'en haut, figé. 4 tableaux activables (mage, forgeron, poète, enfant). Enfant déclenché → court vers sa mère, débloque un coffre. Salle de lore. |
| 9 | **Carrefour Antichambre** | fallback | Salle ouverte 4 sorties, motes dorés au centre, lecture immédiate. (hors pool normal) |

### Étage 10 — Chambre du Cœur (intensité maximale)

| # | Salle | Rôle | Idée |
|---|-------|------|------|
| 10 | **Le Couloir d'Oubli** | unique | Long couloir entièrement en zone d'oubli. Pas d'attaque/sort/dash. 3 statues à lasers lents en sweep. Test de nerfs. |
| 11 | **Le Théâtre des Dernières Heures** | unique / narratif | 6 tableaux en cercle. Activés dans l'ordre chronologique (dates au sol), révèlent un fragment de phrase : *« Nous avons tiré… / trop fort… / sur la Trame… / et elle nous a… / rendu… / nos morts. »* Récompense : Vestige éditorialisé. |
| 12 | **Le Pouls** | unique | Salle circulaire, pré-Cœur au centre. Onde radiale toutes les 2,5 s : se coller au mur quand elle passe, courir au centre entre. 3 résidus. Coffre central après exorcisme. |
| 13 | **Les Souvenirs Concurrents** | unique | 2 tableaux qui s'animent en alternance, bloquant chacun l'autre passage. Traquer la fenêtre (1,5 s). 1 résidu rapide qui veut t'écraser. |
| 14 | **La Cartographie Vivante** | unique / ambition max | Au sol, plan de la civilisation entière vu de dessus (rappel discret des biomes traversés). On marche dessus comme un dieu ; chaque quartier s'illumine + échos audio-visuels 1 ligne. Zones d'oubli **mobiles** qui glissent sur la carte. Aucun ennemi classique. |
| 15 | **L'Écho Persistant** | unique / mécanique signature top-down | Chaque mouvement génère un **ghost doré** qui rejoue tes 3 dernières secondes en boucle ; tes ghosts te blessent. Se déplacer en laissant des couloirs vides. Récompense au centre. |
| 16 | **Le Carrefour des Lignées** | transit dur | Courants denses + zones d'oubli + 2 résidus rapides. Ne pardonne pas l'erreur. |
| 17 | **L'Antichambre du Cœur** | porte boss | Salle vide, calme, silence visuel (particules ralenties). Sigles en cercle au sol, porte du Cœur au centre. Respiration avant le boss. |
| 18 | **La Chambre du Cœur** | salle boss | Boss final — cf. §8. |

**Composition spanning-tree** :
- Étage 9 : 1 entrée + 3-4 mains + 1 alt + 1 dead-end optionnel + porte boss (boss étage 9).
- Étage 10 : 4-5 salles + Chambre du Cœur (boss étage 10).

---

## 7. Boss étage 9 — Le Doyen du Seuil (mid-boss exigeant)

### Lore
La Doctrine des Sources avait des gardiens veillant sur les réserves de Résonance. Le plus ancien — **le Doyen** — se tenait au seuil du Cœur quand le Reflux a frappé. Il n'est pas mort : il a **fusionné avec le seuil**, devenant une sentinelle qui juge si l'intrus mérite de voir la vérité. Pas maléfique : **inflexible**. Sa conviction : seul celui qui maîtrise la perspective du Témoin a le droit de contempler le Cœur.

→ Escalade : étage 9 = on affronte **un suspect** (Théorie de l'Acte, LORE §3 : quelqu'un a peut-être causé le Reflux). Étage 10 = on affronte **le verdict** (le Cœur lui-même). Le Doyen est humain, lisible (on combat *une personne*) ; le Cœur est cosmique, impersonnel.

### Visuel
Figure statufiée massive (~120 px), trônant en haut de l'arène. Robe qui, **vue de dessus**, se déploie en **mandala radial** (la symétrie circulaire = ce que la perspective offre de neuf). Or ambré + veines violettes, couronne/halo en rotation lente. Arène circulaire, anneaux de marbre concentriques.

### 3 phases — crescendo
1. **Le Jugement (100→66 %)** — *« Montre-moi que tu sais te mouvoir. »*
   - Anneaux radiaux concentriques avec trouées (tisser dans les gaps, précision 8-dir).
   - Regard balayeur : laser pivotant comme aiguille d'horloge, *clignement* bref → dash à travers.
   - 2 Résidus invoqués (fractionnent l'attention). Exigeant car anneaux + laser se chevauchent.
2. **Le Doute (66→33 %)** — *« Mais sais-tu encore qui tu es ? »*
   - 4 zones d'oubli fleurissent par quadrant sur cycle rotatif (dedans : pas d'attaque ni dash).
   - Pieux convergents qui te *herdent* vers la zone active.
   - Double laser en croix, rotations opposées.
   - Courant de Reflux circulaire sur le bord. Tu n'attaques que dans les fenêtres entre activations.
3. **La Sentence (33→0 %)** — *« Alors reçois mon verdict. »*
   - Robe déployée en mandala plein écran. Danmaku dense.
   - Spirale tournante de projectiles (mouvement constant obligatoire).
   - Ondes du Cœur toutes les 2,5 s (sois dans la trouée).
   - **Orbe de Verdict** : énorme orbe lente, one-shot un gros bout de Résonance **sauf si parée** (parry radial C). Parer → stagger + fenêtre de dégâts. Récompense la maîtrise du parry.
   - Fin de phase : spirale + ondes + verdicts simultanés. **Ça envoie.**

### Mort
Le Doyen s'agenouille (pose statue), le seuil s'ouvre. Drop : **Vestige narratif** + accès étage 10. Murmure final (`vestige_lore`) :
> *« Je gardais la porte. Je ne savais plus de quel côté. »*

### Triple fonction
Enseigne la perspective top-down (P1) ; intègre les mécaniques signature dans le combat (P2 : zones d'oubli + courants) ; pousse le skill au max via le parry-check (P3). Le Cœur d'étage 10 peut alors être plus lent/existentiel sans porter la charge mécanique.

---

## 8. Boss étage 10 — Le Cœur Lui-Même

Salle circulaire 960×540, cercles concentriques de marbre fissuré, veines violettes vives convergent vers le centre. **Le Cœur du Reflux** au centre : orbe noir-violet pulsante (~80 px), halo ambré. Il ne « bouge » pas. Il **pulse** (rythme cardiaque ~60 BPM, en lock-step avec le sous-grave audio).

> Remplace le boss actuel `BOSS[10]` (« Le Souverain du Reflux », pattern hydre side-scroll). Le déclenchement `boss.def.etage === 10 → lancerCinematiqueFin` est déjà câblé dans `GameScene` (l. ~1868) — on garde ce hook.

### 3 phases
1. **Le Souvenir** — ondes radiales lentes (esquives faciles), spawn de 3 résidus. Le Cœur « se rappelle qui tu es ».
2. **L'Écho** — le Cœur **invoque tes Vestiges précédents** : 3 silhouettes-toi (runs antérieurs) qui rejouent tes mouvements. Tu te bats contre toi-même (réf. LORE §6 : la mort = fixation comme habitant du passé). Réutilise l'esprit de `CloneIllusionSystem`.
3. **Le Témoin** — la salle se déploie (le sol craque, les murs reculent : faux zoom-out par lerp des éléments, caméra figée). Pattern danmaku dense + projections de « vérité » (mots flottants : *Excès, Acte, Témoin*).

### Mort
Le Cœur se calme, la salle se silence. Cinématique de fusion (réutilise `CinematiqueFusion.js`) : au lieu d'absorber le boss, on **absorbe la vérité** → le joueur retrouve la mémoire → `FinScene` + marker `vestige_fin_atteinte_v1`.

---

## 9. La bascule — cinématique étage 8 → 9

Pas de fondu noir banal : **la transition EST la cinématique**. Au franchissement de la porte boss de l'étage 8 (Voile) :
1. Le décor se **fige** (toutes les particules figent en plein vol).
2. La caméra **bascule de 90° vers le bas** en ~2 s (drone qui passe à la verticale).
3. Le joueur, vu de profil, **pivote** et apparaît vu du dessus.
4. Les plateformes (vues par la tranche) deviennent des **fines lignes** puis disparaissent — le sol top-down prend le relais.
5. La palette glisse du violet-corrompu (Voile) vers l'**ambre-or + cramoisi** (Mémoire + Reflux).

Pas de tutoriel : le joueur *voit* le monde changer de perspective. La 1ère salle (Le Seuil) enseigne les règles en 5 s.

**Technique** : Phaser n'a pas de vraie caméra 3D → c'est un **overlay scripté** (système dédié type `CinematiqueBascule.js`, sur le modèle de `CinematiqueFusion.js`). Le « tilt » est suggéré : les plateformes (barres horizontales) subissent un squash `scaleY → 0` pendant qu'une grille de sol monte depuis un point de fuite et fade-in. Joué **une fois par run** (flag registry / localStorage `coeur_bascule_vue_v1`).

---

## 10. Plan d'implémentation — Phases 9.10 → 9.15

Voir CLAUDE.md pour l'état d'avancement. Chaque phase testable au navigateur, un commit par phase.

### 9.10 — Fondation top-down (moteur + perspective)
- `InputSystem.js` : ajouter intents `haut`/`bas` (continus, flèches haut/bas + Z/S) et `dash` (edge). Garder l'abstraction (cible mobile).
- `GameScene.js` : flag `_topDownMode` activé quand `biomePourEtage(etage).id === 'coeur_reflux'`. Dans `update()` : `body.gravity.y = 0`, contrôle vertical symétrique de l'horizontal (`setVelocityY` depuis `haut`/`bas`), bypass `auSol`/`_enLair`/saut/double-saut, remplacer `i.sauter` par `dash` (impulse i-framé, réutilise le pattern `_dashJusqu` existant de la Sève d'Hydre).
- `render/entities/Joueur.js` (ou variante) : visuel top-down (ovale + cœur + traînée + épée orientée).
- Caméra : reste figée 960×540 (`Scale.FIT`).
- 1 salle test minimale (`coeur/coeur_seuil.js`) pour valider le feel.

### 9.11 — Décor top-down + types d'obstacles  *(FAIT)*
- ✅ **Décor top-down** : `render/biomes/CoeurTopDown.js` (`composerCoeurTopDown`) — sol ardoise dallé + fissures/veines cramoisi (pulse ~60 BPM) + mares de lumière dorées + motes. Branché dans `GameScene.create()` à la place du stack side-scroll (ciel/parallax/brume/rayons) quand `_topDownMode`. Murs restylés en blocs de pierre vus de dessus (`creerPlateforme`).
- ✅ **6 obstacles top-down** (`data/obstacles.js` + helpers `_format.js` + `entities/Obstacle.js` + wiring `GameScene`) :
  - `zone_oubli` — éteint attaque/geste/sorts/dash (overlap + flags lus dans combat/`_mouvementTopDown`).
  - `courant_reflux` — poussée directionnelle non létale (overlap + force additive).
  - `laser_surveillance` — faisceau pivotant, **hit manuel** (projection joueur/faisceau dans `update()`).
  - `onde_radiale` — anneaux concentriques périodiques, **hit manuel** (test |dist−rayon|).
  - `pieu_mnemonique` — surgit sur cycle down→warning→up (`body.enable` togglé, overlap phase-checked).
  - `regard_fige` — statue à cône de vision → tire un projectile **parry-able** (event `enemy:tir`).
- ✅ Salles démo : `coeur_courants_croises` (é9-C : courant + zone) ; `coeur_epreuves` (é9-D : laser + onde + pieu + regard). Validateur 139/139, smoke-test navigateur OK (hits/phases/cône validés, mort top-down→Cité OK, 0 erreur).
- ⬜ Entités encore side-view à passer top-down plus tard : portes (`PorteSortie`), coffre, monolithe lore.

### 9.12 — Tableaux animés + sigles + écho-ghosts  *(FAIT)*
- ✅ **`TableauSystem.js`** : tableaux figés (figures silhouettes + aura ambrée formant un mur solide), **sigle déclencheur** au sol → animation ~3 s (figures s'écartent, mur `body.enable=false` = passage ouvert) → re-figement (mur refermé) + **drop Fragment** (1ʳᵉ activation, persisté registry) + **murmure** (`afficherMessageFlottant`). Salle démo `coeur_cortege` (étage 10-B).
- ✅ **`EchoGhostSystem.js`** : enregistre l'historique {x,y,t} du joueur ; N écho-ghosts dorés rejouent sa position décalée de `i·decalageMs` ; **hit manuel** au contact (recroiser sa propre trace). Salle démo `coeur_echo` (étage 10-C).
- ✅ Propagation `result.tableaux` / `result.echoGhost` via `WorldGen.genererSalle` ; systèmes instanciés dans `GameScene` (top-down only) + updatés dans la boucle.
- ✅ Murmures : phrase courte flottante à la 1ʳᵉ activation du tableau (lore léger non bloquant). Smoke-test navigateur OK (cycle cortège + fragment, replay ghost à 850 ms, dégât on/off, mort top-down→Cité propre).
- ⚠️ Connu (pré-existant, non lié) : warning `EtageGen` étage 10 salle D (`arene_fragmentee` ne supporte pas N pour D-haut) — disparaîtra à la migration des salles é10 (9.14/9.15).

### 9.13 — Salles étage 9 + découplage entrée/Cité + refonte validateur  *(EN COURS)*
**Structure : PINNÉ ÉDITORIAL** (décidé 2026-05-31). Les étages 9-10 restent pinnés dans `etages.js` (graphe explicite A/B/C/D/BOSS), PAS en spanning-tree. Le Cœur est un *sanctum final* dont l'ordre narratif est le propos → contrôle éditorial.
- ✅ **Découplage entrée/Cité** (réponse à : « l'entrée doit-elle être en vue de dessus ? » → OUI). La salle A servait double rôle (entrée Présent + Cité Marchande Miroir, side-scroll, PNJ au sol). Fix : (a) `EtageGen` respecte un `useSalle` sur le nœud d'entrée (avant : `arene_ouverte` forcé) ; (b) `GameScene.create()` **substitue** en Miroir une géométrie de sanctuaire side-scroll (`genererSalle(arene_ouverte)`) quand l'entrée est `vue:'topDown'`. La bascule/retour ne dépendant que de `salleId`, c'est sûr. Résultat : **A = Seuil top-down en Présent, Cité side-scroll en Miroir**. Validé navigateur (les deux).
- ✅ **Étage 9 assemblé** (linéaire top-down) : A `coeur_seuil` (entrée) → B `coeur_courants_croises` → C `coeur_epreuves` → D `coeur_cortege` (pré-boss) → BOSS (arène side-scroll legacy, pending 9.14). B-haut retiré (aucune salle top-down N/S dispo ; à ré-ajouter en deadend plus tard). Étage 10 : A `coeur_seuil` (entrée découplée) aussi.
- ✅ **Refonte validateur** : `valider_salles.mjs` détecte `vue:'topDown'` → `validerTopDown()` = flood-fill de connectivité (grille 16 px, murs = obstacles, marge demi-joueur), vérifie portes + coffre joignables depuis le spawn. Les 8 salles Cœur validées (total 0).
- ✅ **Salle signature `coeur_mille_regards`** (catalogue §6 #3) : 6 statues `regard_fige` en cercle regardant le centre + coffre central (`coffreForce`) → trade-off longer le bord (sûr) vs plonger au centre pour le loot. Slottée é10-B (supprime la redite du Cortège). Étage 10 D-haut retiré (résout le warning `arene_fragmentee/N`).
- ⬜ **Reste 9.13** : autres salles catalogue §6 (Atelier Suspendu, Damier, Cartographie…) + ré-ajouter un deadend top-down.

**Assignation pinnée des salles (build list serrée — 11 salles + 2 arènes) :**
- Étage 9 : `Le Seuil` (A/entrée) → `Courants Croisés` (B) → `Atelier Suspendu` (B-haut/coffre) → `Salle aux Mille Regards` (C) → `Cortège Figé` (D/pré-boss) → **arène Doyen** (BOSS)
- Étage 10 : `Le Pouls` (A) → `Cartographie Vivante` (B) → `Couloir d'Oubli` (C) → `Théâtre des Dernières Heures` (D/pré-boss) → `Écho Persistant` (D-haut/Vestige) → **Chambre du Cœur** (BOSS)
- Réserve (substituables au test) : Damier Mnémonique, Marché Statufié, Souffle de l'Inconscient, Souvenirs Concurrents, Carrefours, Antichambre du Cœur.

### Combat top-down — corrections (retour joueur)
- ✅ **Attaque RADIALE 360°** en top-down (`tenterAttaque`) : avant, hitbox directionnelle gauche/droite uniquement → le boss/les ennemis au-dessus/en-dessous étaient intouchables. Maintenant disque autour du joueur (`estDansAttaque`), oriente le slash selon `_dirTopDown`. Touche dans toutes les directions (validé : boss frappé gauche + bas).
- ✅ **Murs traversables (dash) corrigé** : la hitbox des murs top-down est épaissie à 46 px (visuel inchangé, `setSize`) + dash réduit (×2.3) → plus de tunneling au dash. Mur du Cortège aussi épaissi.

### 9.14 — Boss étage 9 (Le Doyen, EXIGEANT) + cinématique bascule + salles é10
- ✅ **Boss Le Doyen** (`PATTERNS_BOSS.doyen`) — rendu **plus dur** (retour) : **faisceau balayeur permanent** (`faisceauBalayeur`, accélère par phase) + danmaku dense 3 phases (P1 anneaux trouée, P2 4 bras spirale + salve aimée, P3 spirale triple + anneaux + **Orbe de Verdict** fréquente à parer). `BOSS[9]` hp **130**, stationnaire. Arène `coeur_arene_doyen`. Validé (spawn centré, phases, faisceau, mort → porte).
- ✅ **Cinématique bascule 8→9** — `CinematiqueBascule.js` (`lancerCinematiqueBascule`) : à la 1ʳᵉ entrée Cœur (étage 9, Présent, entrée), overlay scripté — les barres side-scroll s'écrasent (scaleY→0), une grille top-down monte du centre, flash de palette violet→cramoisi, murmure *« Tu n'as plus à tomber. Regarde. »*, puis le voile se lève sur la salle. Input suspendu via `_cinematiqueBasculeEnCours` ; 1×/run (flag registry `coeur_bascule_vue`). Validé navigateur.
- ⬜ **Salles étage 10** : migrer C/D/D-haut en top-down (catalogue : Cartographie, Couloir d'Oubli, Théâtre, Écho/Vestige). Pour l'instant é10 = A(Seuil) → B(Cortège) → C(Écho) → D/D-haut legacy → BOSS(Chambre).

### 9.15 — Chambre du Cœur (BOSS ULTIME étage 10) + intégration fin
- ✅ **LE CŒUR — boss ultime** (`initCoeur/updateCoeur` + helpers). Mécaniques (retour « lâche-toi ») :
  - **Invulnérable par défaut** (override `recevoirDegats` : « clink » tant que fermé).
  - **Puzzle des SCEAUX** : 4 sceaux aux cardinaux ; le Cœur en **désigne** un (selon sa rotation) ; le toucher l'allume ; allumer le nombre requis (phase 1→2→3→4 = 1→2→3→4 sceaux, dans l'ordre désigné) ouvre une **fenêtre de vulnérabilité** (~5 s) où les dégâts passent. Toucher un mauvais sceau ne progresse pas.
  - **Fractionnement** : segments orbitants (0→4 selon phase) = sources de danmaku supplémentaires (`emettreSegments`).
  - **6-8 skills additifs** : anneaux, double/triple spirale, salve aimée, faisceau balayeur, ondes denses, lasers de segments, convergence, Orbe de Verdict.
  - **SECRET PHASE** : à 0 PV → **fausse mort** (le mandala s'éteint, « … ») → **resurgit** (phase 4, hp 45 %, « LE CŒUR REFUSE DE MOURIR », tout en même temps). Vraie mort en phase 4 → `lancerCinematiqueFin` → **FinScene**.
  - `BOSS[10]` hp **150**, pattern `'coeur'`. Arène `coeur_chambre`. **Validé navigateur** : gate, sceau→ouverture, dégâts en fenêtre, fausse mort→secret phase, vraie mort→FinScene, danmaku dense rendu.
- ⬜ Polish : phase Écho via `CloneIllusionSystem` (invoquer les toi-mêmes passés) ; segments en vrais corps frappables ; audio Tone.js.

### Risques / points d'attention
- **Validateur** : refonte du modèle pour le top-down = prérequis avant de produire beaucoup de salles (faire en 9.13 tôt).
- **Rider/collisions** : Phaser Arcade reste en 2D top-down (pas de gravité) — les murs sont des collisions standard, plus simple que le side-scroll.
- **Réutilisation** : un maximum d'obstacles top-down sont des reskins de mécaniques existantes (souffle, laser, brasier, clone) → limite le coût.
- **Mort en zone d'oubli** : si le joueur meurt sans attaque/dash, vérifier qu'il peut toujours subir le retour Cité normalement (pas de soft-lock).

---

## 11. Questions ouvertes (pour plus tard)
- Échos (re-respawn des salles nettoyées en Élite) : applicables au top-down ?
- Sanctuaires boss étages 6/7/8/10 (roadmap) : la Chambre du Cœur en est-elle un cas particulier ?
- Densité ennemis `coeur_reflux` actuelle (7-12) : sans doute à revoir à la baisse pour le top-down (l'environnement porte la pression).
