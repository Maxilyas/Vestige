# Backlog mécaniques Halls Cendrés (Phase 9.7+)

Catalogue des 30 idées d'extensions mécaniques pour le biome Halls Cendrés
après la migration compact 960×540. Classées par **coût engine** (effort
estimé pour les ajouter au moteur Phaser + visuels painterly + behaviors).

**Identité Halls** : forge industrielle déchue, palette cendre/braise.
Mécaniques signature actuelles : `brasier` (cyclique on/off), `mur_explosif`
(éclate en braises), `eboulis` (cassable), `sol_effrite` (s'effondre),
`roc_tombe`, `plaque_pression`, `pieu`, `ressort`, `mur_fissure`, `mur_secret`.

---

## Coût engine 0 — Déjà implémentables (re-skin / paramétrage)

Aucune ligne de code engine à ajouter. Juste créer des salles qui exploitent
le toolkit avec des paramètres / visuels variés.

| # | Idée | Solution avec toolkit actuel |
|---|---|---|
| 7 | Pluies de scories lourdes | `rocQuiTombe` avec visuel scorie noire |
| 12 | Faux-plafonds de suie | `solEffrite` avec délai 200ms (très fragile) |
| 15 | Brasiers à retour de flamme | `brasier` cycleMs court (1500ms) |
| 1 | Cloisons de tôle qui explosent | `murExplosif` avec orientation horizontale |
| 6 | Parois de scorie friable | `eboulis` hp=1 (casse en 1 hit) |
| 28 | Dalles détonation au saut | `plaque_pression` + effet variante "boost vertical" |

→ **6 idées exploitables immédiatement** par re-skin visuel + paramétrage.

---

## Coût engine LOW (1-2 jours chacune)

Une nouvelle entrée dans `data/obstacles.js` + une entity simple + un
visuel painterly. Pas de physique custom complexe.

| # | Idée | Spec courte | Statut |
|---|---|---|---|
| 14 | Rideaux de douches de décapage | Particule cyclique qui inflige dégâts dans zone fine verticale | ✅ Phase 9.7 (`rideau_acide`) |
| 17 | Geysers de vapeur sous pression | Zone de dégâts cyclique qui POUSSE le joueur verticalement (variante `brasier` avec impulsion physique) | ✅ Phase 9.7 (`geyser_vapeur`) |
| 5 | Blocs de charbon déplaçables | Plateforme pushable (collision + friction custom) | ✅ Phase 9.7 (`bloc_charbon`) |
| 25 | Contrepoids à briser | Composition `eboulis` + `plaque_pression` (active une autre interaction) | ⬜ |
| 11 | Décombres magnétiques | Force d'attraction vers le joueur dans zone (custom force tween) | ⬜ |

→ **3 idées low-cost livrées en Phase 9.7** (geyser + rideau acide + bloc charbon).

---

## Coût engine MEDIUM (3-5 jours chacune)

Nouvelle entity avec comportement custom, animation phaser non triviale.

| # | Idée | Spec courte | Statut |
|---|---|---|---|
| 19 | Marteaux-pilon | Cycle vertical (haut→bas) avec dégâts d'impact + shake + knockback | ✅ Phase 9.8 (`marteau_pilon`) |
| 21 | Pistons à injection thermique | Mur qui sort horizontalement, repousse joueur dans brasier mural | ✅ Phase 9.8 (`piston_thermique`) |
| 22 | Tapis roulants magnétiques | Surface qui modifie la vélocité joueur (overlap continu) | ⬜ |
| 23 | Pinces de fonderie suspendues | Hache pendulaire, oscillation arc latérale, dégâts à l'extrémité | ⬜ |
| 24 | Scies circulaires sur rails | Plateforme qui glisse le long d'un path + zone dégâts | ✅ Phase 9.8 (`scie_circulaire` H+V) |
| 2 | Conduits de gaz qui explosent en chaîne | Système d'événements : hit 1 → trigger 2 → trigger 3 | ⬜ |
| 3 | Réservoirs de fioul instables | Compte à rebours visuel + explosion radiale | ⬜ |
| 4 | Domino de hauts-fourneaux | Cascade scriptée : plusieurs `murExplosif` en séquence | ⬜ |

→ **3 idées medium livrées en Phase 9.8** (marteau-pilon + piston thermique + scie circulaire).

---

## Coût engine HIGH (1 semaine+ chacune)

Mécaniques scriptées custom, animations complexes, scripting de scène entier.

| # | Idée | Spec courte |
|---|---|---|
| 13 | Vagues de crue de fonte | Mur de dégâts qui avance horizontalement, traverse tout le canvas |
| 18 | Lave de laitier (vagues solidifiables) | Liquide qui forme plateforme temporaire après explosion |
| 16 | Tempêtes d'étincelles | Zone à drain continu de Résonance si pas à l'abri |
| 8 | Ponts roulants qui basculent | Plateforme qui pivote autour d'un point d'ancrage (physique pendulaire) |
| 9 | Avalanches de cendre dense | Fluide qui s'écoule + remplit fossé + étouffe joueur |
| 10 | Cheminées d'usine qui s'abattent | Animation custom : pilier qui pivote 90° + écrase zone |
| 20 | Broyeurs à déchets métalliques | Fond de fosse mortel avec débris-plateformes qui passent |
| 26 | Création de pont par effondrement | Mur explosif qui tombe horizontalement = nouveau sol |
| 27 | Vidange d'urgence | Fluide qui draine + révèle passage |
| 29 | Utilisation des débris comme bouclier | Roc tombant utilisable comme couvert temporaire |
| 30 | Nettoyage par surchauffe (course) | Trigger global : timer + effondrement séquentiel + course de fuite |

→ **11 idées high-cost** = 2-3 mois de travail engine.

---

## Roadmap d'implémentation suggérée

**Phase 9.7 — Extension toolkit Halls v1** ✅ LIVRÉ
- ✅ 3 idées low-cost implémentées : geyser vapeur (#17), rideau acide (#14), bloc charbon (#5)
- ✅ Combo blocs ↔ brasier (poussée + enflammage + explosion)
- ✅ 5 salles signature : `halls_geyser_central`, `halls_rideau_acide_couloir`, `halls_blocs_pousseurs`, `halls_combo_total` (NSEO), `halls_lave_jets` (NS)
- ⬜ Restantes Phase 9.7 v1.1 : 6 idées coût-0 (re-skin) + contrepoids (#25) + décombres magnétiques (#11)

**Phase 9.8 — Extension toolkit Halls v2** ✅ LIVRÉ
- ✅ 3 idées medium implémentées : marteau-pilon (#19), piston thermique (#21), scie circulaire H+V (#24)
- ✅ Marteau-pilon : cycle 5 phases (repos haut → chute → impact + shake + poussière → repos bas → remontée), knockback horizontal selon position joueur
- ✅ Piston : solide bloquant en extension, knockback horizontal fort à l'impact initial, visuel cuivré incandescent
- ✅ Scie : rotation continue, path sinusoïdal H ou V, étincelles d'usinage, dents crantées animées
- ✅ 5 salles signature : `halls_marteaux_pilons`, `halls_pistons_thermiques`, `halls_scies_couloir`, `halls_forge_meca` (NSEO combo méca v2), `halls_arene_chaos` (NSEO combo v1+v2 méga)
- ⬜ Restantes Phase 9.8 v1.1 : tapis roulants (#22), pinces pendulaires (#23), réservoirs (#3), gaz chaîne (#2), domino (#4)

**Phase 9.9 — Pièces signature scriptées** (~1 mois)
- 2-3 idées high-cost choisies : vagues de fonte (#13), cheminées qui s'abattent (#10), nettoyage par surchauffe (#30)
- 1 salle ultra-signature chacune, marquée `unique:true` + `tirageWeight:5`

---

## Catégories thématiques (vision DA)

| Catégorie | Mécaniques |
|---|---|
| **Destruction active** (le joueur déclenche) | 1, 2, 3, 4, 5, 25, 26, 27, 28, 30 |
| **Physique du chaos** (effondrements) | 7, 8, 9, 10, 11, 12, 29 |
| **Fluides incandescents** | 13, 14, 15, 16, 17, 18 |
| **Machines de forge folles** | 19, 20, 21, 22, 23, 24 |
| **Pièges environnementaux** | 6 |

Cohérence narrative : **Héphaïstos abandonné**. La forge tourne encore mais
sans maître — les machines deviennent folles, les fluides débordent, les
structures cèdent. Chaque mécanique raconte la chute d'un savoir industriel
qui dépasse maintenant ses créateurs.
