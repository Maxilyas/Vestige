# VESTIGE — Bestiaire de Boss (banque d'idées réutilisable)
> Catalogue de concepts de boss pour **tous les biomes** (à piocher quand on refait les boss).
> Inspiration : design d'encounters WoW (Razorgore, Mimiron, Yogg-Saron, C'Thun, Kael'thas, Sha of Fear, Twin Emperors, Atramedes, Council, Sindragosa, Lady Deathwhisper, Murozond…).
> Voir [COEUR.md](COEUR.md) pour le contexte top-down du biome 9-10.

## Cadre de conception (contrat de chaque boss)
- **Esquive** : 2 à 5 mécaniques que le joueur doit ÉVITER.
- **Faire** : 1 à 2 mécaniques que le joueur doit ACCOMPLIR (sinon il ne peut pas gagner / ne fait pas de dégâts).
- **Positionnement** : 1 règle de placement joueur↔boss↔arène (le cœur tactique).
- **Phases** : 3 phases + **SECRET PHASE** qui change *complètement ou partiellement* les règles vues avant.
- **Folie** : un gimmick signature (duplication, objets à ramasser/livrer, transformation, miroir du joueur, environnement qui mute…).

Légende fit biome : 🟫 Ruines · 🔥 Halls · ❄️ Cristaux · 🟣 Voile · 🔴 Cœur · ★ = boss-pilier potentiel.

---

## Les 20 concepts

### 1. ★ Le Doyen du Seuil 🔴 *(base actuelle — danmaku-sentinelle)*
- **Esquive** : anneaux à trouée tournante ; faisceau balayeur (« le Regard ») ; spirales contrarotatives.
- **Faire** : PARER l'Orbe de Verdict (gros projectile lent) pour stagger + fenêtre de dégâts.
- **Positionnement** : stationnaire au centre, le joueur tisse dans les trouées.
- **Phases** : Jugement → Doute → Sentence (densité croissante). **Secret** : —.
- *Statut : implémenté. Trop « tourelle » — à enrichir (cf. refonte §22).*

### 2. ★ Le Cœur du Reflux 🔴 *(base actuelle — puzzle d'invulnérabilité)*
- **Esquive** : danmaku radial dense ; ondes ; lasers de segments.
- **Faire** : allumer les **sceaux** (cardinaux) dans l'ordre désigné par la rotation du boss → fenêtre de vulnérabilité.
- **Positionnement** : courir aux sceaux désignés en esquivant.
- **Phases** : Souvenir → Écho → Témoin. **Secret** : fausse mort → resurgit (phase 4 = tout en même temps).
- *Statut : implémenté. À rendre POLYMORPHE (cf. refonte §23).*

### 3. Le Chœur des Statues ❄️🔴 — *duplication + ordre*
- **Esquive** : ondes sonores concentriques ; éclats de marbre ; la note dissonante (zone qui pulse).
- **Faire** : ne frapper QUE la statue qui chante (lumineuse), dans l'ordre de la mélodie affichée.
- **Positionnement** : 5 statues en arc ; rester face à celle qui s'illumine, dos aux silencieuses.
- **Phases** : 1 chanteuse → 2 en duo → 3 en canon. **Secret** : les statues mortes rechantent **à l'envers** (ordre inversé, faux signaux).
- *WoW : Four Horsemen / Razorgore (cibles séquencées).*

### 4. ★ L'Horloger du Reflux 🟣🔴 — *temps + cadran*
- **Esquive** : aiguilles balayeuses (grande + petite, vitesses différentes) ; « tic-tac » de pieux sur le rythme ; ondes à midi.
- **Faire** : se tenir sur l'**heure désignée** et frapper la cloche correspondante avant que l'aiguille n'arrive.
- **Positionnement** : l'arène est un cadran ; toujours rester *en avant* de l'aiguille.
- **Phases** : 1 aiguille → 2 aiguilles → 3 aiguilles (chaos). **Secret** : le **temps s'inverse** — aiguilles à rebours + les projectiles reviennent à leur source.
- *WoW : Murozond (sablier / rewind).*

### 5. ★ Le Porteur de Lanternes 🔥🟣 — *lumière/ombre + objets à livrer*
- **Esquive** : ombres rampantes (mortelles dans le noir) ; projection d'extinction ; nuée de phalènes.
- **Faire** : RAMASSER les lanternes que le boss laisse tomber et les POSER sur les vasques pour éclairer (les zones éclairées bannissent les ombres + révèlent le boss).
- **Positionnement** : gérer la carte d'ombre/lumière ; le boss n'est attaquable qu'éclairé.
- **Phases** : 1 vasque → 3 vasques → la salle s'assombrit plus vite que tu n'éclaires. **Secret** : tout s'éteint, tu portes **une seule** lanterne que le boss traque (inversion : la lumière = danger).
- *WoW : Atramedes (son/obscurité), Insanity.*

### 6. La Cariatide 🟫🔥 — *destruction environnementale*
- **Esquive** : gravats qui tombent (télégraphés) ; onde de choc au sol ; éboulement latéral.
- **Faire** : briser les **3 piliers** qui soutiennent la voûte (le boss les tient → il est immobilisé tant qu'il porte).
- **Positionnement** : l'attirer SOUS la section qui s'effondre quand un pilier cède.
- **Phases** : 3 piliers → 2 → 1 (de plus en plus de gravats). **Secret** : arrache le dernier pilier et devient **mobile** (le combat passe en chasse).
- *WoW : Mimiron / destruction de décor.*

### 7. ★ L'Essaim Mnémonique 🟣🔴 — *nuée + consolidation*
- **Esquive** : la nuée fonce en vagues ; éclats dispersés ; sillage des fragments.
- **Faire** : rabattre les fragments dans le **Puits de Mémoire** (les pousser/attirer) pour consolider le noyau → unique moment vulnérable.
- **Positionnement** : utiliser les murs/le puits pour acculer la nuée (sinon elle se re-disperse).
- **Phases** : nuée lâche → 2 nuées → la nuée se scinde quand frappée (duplication). **Secret** : tout l'essaim **fusionne en un avatar géant** (bullet-hell inversé : un seul gros corps, patterns lourds).
- *WoW : Anomalus / Yogg tentacles.*

### 8. ★ Le Tyran-Miroir 🟣 — *duel de positionnement*
- **Esquive** : il **copie tes déplacements** en miroir ; lames là où tu étais ; onde au point de symétrie.
- **Faire** : le **piéger** — se positionner pour que sa copie de ton dash le jette dans un pieu/gouffre/laser.
- **Positionnement** : tout est relatif à l'axe de symétrie (centre) ; tu pilotes SON corps via le tien.
- **Phases** : miroir horizontal → vertical → ponctuel (symétrie centrale). **Secret** : le miroir **s'inverse** (il fait l'OPPOSÉ de toi) + gravité flip — il faut désapprendre.
- *WoW : mécaniques de reflет / Lady Vashj tainted.*

### 9. Le Tribunal des Trois Masques 🟣🔴 — *council + parade ciblée*
- **Esquive** : 3 sorts simultanés (un par masque : faisceau / pluie / charge).
- **Faire** : PARER le masque qui **brille** (le bon verdict) au bon instant pour le réduire au silence.
- **Positionnement** : se placer face au masque actif tout en gardant les 2 autres dans le champ.
- **Phases** : 1 masque actif → 2 → 3. **Secret** : les masques **fusionnent** en un seul qui lance les 3 sorts en rotation.
- *WoW : Council of Blood / Assembly of Iron.*

### 9bis (★) Le Glouton du Vide 🔴 — *« ne pas attaquer » + gavage*
- **Esquive** : aspiration centrale permanente (tu glisses vers la gueule) ; rots de bombes ; renvoi de tes propres projectiles.
- **Faire** : ne PAS le frapper (il grandit/soigne) — ramasser les **bombes** qu'il crache et les lui RENDRE jusqu'à l'indigestion → vulnérable.
- **Positionnement** : lutter contre l'attraction, rester en périphérie, n'approcher que pour gaver.
- **Phases** : 1 bombe → 3 bombes → aspiration accélérée. **Secret** : **implose en trou noir** (l'attraction devient mortelle, esquive de survie pure).
- *WoW : feeding mechanics / Yogg "don't dps".*

### 10. ★ Les Jumeaux Résonants ❄️🟣 — *deux corps liés*
- **Esquive** : faisceau **tendu entre les deux** (qui pivote) ; salves alternées ; zone de résonance si trop proches l'un de l'autre.
- **Faire** : maintenir leurs **PV égaux** (si l'un meurt avec >X% d'écart, l'autre enrage et soigne).
- **Positionnement** : les SÉPARER (les garder éloignés annule la résonance qui les soigne).
- **Phases** : indépendants → liés par le faisceau → ils se cherchent (veulent fusionner). **Secret** : **fusion** en colosse à deux têtes (le faisceau devient une croix rotative).
- *WoW : Twin Emperors / Eredar Twins / Valithria-adds.*

### 11. La Tisseuse de Trame 🟣🔴 — *fils mouvants + couper*
- **Esquive** : fils tendus qui balaient ; nœuds qui éclatent ; cocon qui se referme.
- **Faire** : COUPER les fils-d'ancrage **dans l'ordre** pour la délier (chaque fil coupé ouvre une faille de vulnérabilité).
- **Positionnement** : atteindre les ancres aux bords sans se faire prendre dans la toile centrale.
- **Phases** : 4 fils → 6 → la toile se retisse derrière toi. **Secret** : elle **devient le fil** (un serpent-ligne unique à pourchasser, le sol disparaît sauf la trame).
- *WoW : Beth'tilac / Maexxna.*

### 12. L'Effigie Ardente 🔥 — *feu/eau + guider*
- **Esquive** : traînées de feu persistantes ; explosions de braises ; colonne ascendante.
- **Faire** : GUIDER l'Effigie dans les **bassins** (elle te suit) pour l'éteindre → vulnérable un temps.
- **Positionnement** : la kiter vers l'eau ; les dalles refroidies deviennent tes seules zones sûres.
- **Phases** : 1 bassin → bassins qui s'évaporent → elle évite l'eau. **Secret** : **embrase toute l'arène** ; safe-zones = uniquement les dalles que TU as refroidies.
- *WoW : Ragnaros (submerge/sons) / Baleroc.*

### 13. ★ Le Marionnettiste 🟣🔴 — *pantins du joueur*
- **Esquive** : des **pantins de TOI** (échos) qui rejouent/attaquent ; fils tranchants ; chute de croix de bois.
- **Faire** : couper les **fils** en frappant les MAINS du boss (haut de l'arène) → libère un pantin qui devient ton allié bref.
- **Positionnement** : flanquer le boss (ses mains sont sur les côtés) tout en fuyant tes pantins.
- **Phases** : 1 pantin → 3 pantins → il te marionnette toi (inversion de contrôle brève télégraphée). **Secret** : il crée un **pantin de lui-même** ; le vrai est celui qui **ne projette pas d'ombre**.
- *WoW : Maexxna web-wrap / Lady Deathwhisper mind control. Réutilise EchoGhostSystem/CloneIllusionSystem.*

### 14. L'Oracle Aveugle 🟫🟣 — *son + furtivité*
- **Esquive** : ondes dans la direction du **bruit** que tu fais ; pieux à l'aveugle ; cri panoramique.
- **Faire** : se déplacer en silence + lancer des **cailloux** (objets) pour le leurrer ailleurs, frapper quand il regarde le leurre.
- **Positionnement** : rester hors de son cône d'écoute ; attaquer = faire du bruit = risque.
- **Phases** : ouïe lente → ouïe fine → il « voit » tes attaques. **Secret** : gagne la **vue thermique** — la règle s'inverse (il faut bouger, pas se figer).
- *WoW : « stop attacking » phases / sound mechanics.*

### 15. Le Colosse de Sel 🟫❄️ — *grimper le boss*
- **Esquive** : il te secoue (knockback) ; smash au sol ; pluie de cristaux.
- **Faire** : GRIMPER sur son corps (se tenir sur ses épaules/bras) pour frapper les **points faibles** lumineux.
- **Positionnement** : monter du côté opposé au bras qu'il lève ; redescendre avant le shake.
- **Phases** : 1 point faible → 3 → il roule sur lui-même. **Secret** : **s'effrite en éclats mobiles** (duplication) qui convergent pour se reformer — empêcher la reformation.
- *WoW : Gruul / escalade type god-of-war boss.*

### 16. ★ La Constellation 🔵❄️🔴 — *relier les points*
- **Esquive** : étoiles filantes (lignes diagonales) ; pulsation des nœuds ; nova centrale.
- **Faire** : DASHER entre les **nœuds-étoiles** dans l'ordre pour tracer le **signe** → décharge sur le boss.
- **Positionnement** : optimiser le chemin du tracé pendant l'esquive (pathing).
- **Phases** : signe à 3 nœuds → 5 → 7. **Secret** : le **ciel tourne** (les nœuds bougent pendant le tracé) + faux nœuds.
- *WoW : Algalon (constellations / Big Bang) / Setthe.*

### 17. L'Architecte du Reflux 🟫🟣 — *labyrinthe en temps réel*
- **Esquive** : rais de construction ; murs qui surgissent (écrasement) ; éboulis dirigés.
- **Faire** : atteindre les **leviers** avant qu'ils ne soient murés (les leviers ouvrent la cage du boss).
- **Positionnement** : lire le labyrinthe qui se reconfigure ; ne pas se laisser enfermer.
- **Phases** : reconfigure lent → rapide → murs mobiles. **Secret** : **déconstruit le sol** (trous + l'arène rétrécit, retour furtif à une contrainte de chute).
- *WoW : Mimiron P3 / Mekkatorque.*

### 18. Le Banquet Maudit 🟫🔥 — *zones-plats + manger le bon*
- **Esquive** : couverts-projectiles ; nappe qui s'enflamme ; renversement.
- **Faire** : MANGER (rester sur) le plat-**antidote** qu'il désigne avant que le poison accumulé ne te tue.
- **Positionnement** : danser entre les plats (chaque plat = un effet sol différent).
- **Phases** : 1 plat empoisonné → 3 → tout est empoisonné sauf l'antidote. **Secret** : la **table se renverse**, les plats pleuvent du ciel (esquive verticale).
- *WoW : Gluth/Festergut bouffe-debuff / Hakkar.*

### 19. ★ L'Anti-Vestige 🟣🔴 — *miroir de ton build*
- **Esquive** : il lance **tes propres sorts/gestes équipés** ; clone-dash ; renvoi.
- **Faire** : EXPLOITER le sort qu'il vient d'utiliser (il est en cooldown comme toi → fenêtre de contre).
- **Positionnement** : duel rapproché, lecture des tells de TES propres capacités.
- **Phases** : copie 1 slot → 2 slots → 3 slots + ton Geste. **Secret** : il **absorbe ton équipement** (tu reviens aux stats de base) — duel à armes nues, qui connaît le mieux le moveset gagne.
- *WoW : Lady Deathwhisper / encounters « mirror de la classe ».*

### 20. Le Souverain Fracturé 🔴 — *segments à activer dans l'ordre selon la position*
- **Esquive** : balayage des segments ; convergence ; onde de fracture.
- **Faire** : activer les **segments** dans l'ordre dicté par la **position** du noyau (il pointe le prochain) → recompose le Souverain → vulnérable.
- **Positionnement** : le segment à activer dépend d'où le noyau s'est déplacé (jamais 2 fois le même ordre).
- **Phases** : 3 segments → 5 → ils se déplacent en activant. **Secret** : les segments **deviennent autonomes** (mini-boss simultanés) ; tuer le bon en dernier.
- *WoW : Sartharion + drakes / Kael'thas advisors.*

---

## Classement — idées favorites
**Verbes de gameplay couverts** (pour ne pas répéter le danmaku-tourelle) :
- *Identifier/ordre* : 3, 9, 20 · *Objet à livrer* : 5, 9bis, 18 · *Environnement* : 6, 12, 17 · *Miroir/duel* : 8, 13, 19 · *Nuée/duplication* : 7, 10, 15 · *Tracé/positionnement* : 4, 11, 16.

**Top 6 (les plus « fous » + implémentables ici)** : **13 Marionnettiste**, **9bis Glouton du Vide**, **5 Porteur de Lanternes**, **10 Jumeaux Résonants**, **16 Constellation**, **4 Horloger**.

**Critère pour é9 vs é10** : les deux doivent avoir des **verbes opposés**. → é9 = *mobile + objet + duplication* (anti-danmaku) ; é10 = *polymorphe* (chaque phase un verbe différent, garde la base sceaux). Voir §22-23.

---

## ✅ IMPLÉMENTÉ — §22-23 (2026-06-01)
Les deux boss ci-dessous sont **codés** (`src/systems/BossCoeurReflux.js`, helpers `BossHelpers.js`, patterns `doyen`/`coeur` dans `BossComportements.js`), avec les **ajustements esprit-WoW** intégrés :
- **Doyen** : soft-rage **DoT « Outrage au Tribunal »** en portant une Preuve ; **faucheux rétro-temporel** (retrace les 3 dernières s du joueur) ; secret phase **« La Cour se retire »** = géant central + **ondes par quadrant** (1 quadrant safe en bleu) + Orbe de Verdict à parer en courant (remplace les 4 mini-Doyens → casse la redondance avec le Cœur).
- **Cœur** : P1 **DPS-check des siphons** (sceaux verrouillés tant qu'un siphon incante ; siphon réussi → buff de dégâts permanent) ; P3 **gavage à contre-aspiration** (porter une Vérité = ancre contre l'aspiration, la jeter dans la gueule) ; secret phase **« Le Procès de tes Choix »** = miroir de TON style le plus utilisé (`scene._usageStats`) + **montée du Reflux** (disque sûr qui rétrécit) + **sceaux de pourtour** (atteints en dash — adaptation top-down du « sceaux en hauteur »).
- Adaptation top-down assumée : pas de saut → les sceaux « en hauteur » deviennent des **sceaux de pourtour** atteints en dash sous la pression du Reflux montant.

## ✅ IMPLÉMENTÉ — biomes 1-2 SIDE-SCROLL (2026-06-02)
4 boss refondus dans `src/systems/BossRuinesHalls.js` (verbes OPPOSÉS, aucun danmaku-tourelle), arènes dédiées dans `data/topographies.js` (`arene_boss_ruines_1/2`, `arene_boss_halls_3/4`), fiches `data/boss.js`, + event générique **`joueur:attaque`** (GameScene) qui laisse les patterns frapper leurs propres destructibles. Visuels dessinés par le pattern (le visuel par défaut est caché).
- **é1 #6 La Cariatide** (DÉTRUIRE l'environnement) : briser les **3 piliers** porteurs → elle ploie sous la voûte (fenêtre de vuln, cœur exposé) ; esquive = **gravats télégraphés** par colonnes + **ondes au sol à sauter** ; **secret « elle arrache la voûte »** → devient MOBILE et charge.
- **é2 #15 Le Colosse de Sel** (GRIMPER le boss) : escalader ses **corniches-corps** (= COLOSSE_LEDGES, one-way) pour frapper le **nœud de sel actif** (vulnérabilité de proximité) ; **secousse** périodique éjecte le grimpeur (test d'altitude) + relocalise le nœud ; **secret** = il se disloque en **éclats convergents** à détruire avant reformation.
- **é3 #5 Le Porteur de Lanternes** (ÉCLAIRER + objets) : arène d'**ombre** (voile + lueur perso) ; porter ses **lanternes** et allumer N **vasques** (N = phase) → il est débusqué (fenêtre ; vasques **consumées** ensuite) ; esquive = phalènes + morsure d'ombre au sol ; **secret « tout s'éteint »** → tu portes la seule lumière, il la **traque** (chasse + lunges, exposé après une charge esquivée).
- **é4 #12 L'Effigie Ardente** (KITER vers l'eau) : marcheur (gravité) qui chasse ; l'attirer dans un **bassin** → extinction (fenêtre ; cooldown anti perma-lock) ; **traînées de feu** + braises ; **secret « l'arène s'embrase »** → seuls les **bassins + dalles refroidies** (par les extinctions) sont sûrs.
- Adaptations side-scroll : melee courte → destructibles via `joueur:attaque` ; **pas de dash de base** → tout au saut/marche (sauts ≤ 96 px vert) ; gating de vuln + interception de la mort (secret phase) réutilisables (`installerGate`).

## ✅ IMPLÉMENTÉ — biomes 3-4 SIDE-SCROLL (2026-06-02)
4 boss dans `src/systems/BossCristauxVoile.js` (helpers partagés extraits dans `BossSideScrollHelpers.js`), arènes en **960×540 = caméra figée** (arène + plafond visibles). Difficulté ESCALADANTE → é8 = climax. Réutilise l'infra Cristaux (`player._tileEffectGlissant` verglas) et Voile (pendule `scene._initPendule` pour les inversions de gravité ; sol + plafond solides).
- **é5 #3 Le Chœur Pétrifié** (SÉQUENCE/MÉMOIRE) : Maestro + 5 statues sur **sol verglacé** ; ne frapper QUE la statue qui chante, **dans l'ordre** → le Maestro descend, exposé ; ondes sonores radiales + éclats de glace ; mauvaise statue = riposte + reset. **Secret** = statues-**leurres** (faux signaux) + nova.
- **é6 #10 Les Jumeaux Résonants** (DEUX CORPS LIÉS) : deux titans orbitant bas, **faisceau de résonance** qui balaie ; les affaiblir **ÉQUILIBRÉS** (tuer l'un seul → résurrection + enrage) ; soin de résonance s'ils sont proches. **Secret** = **fusion** en colosse à deux têtes (croix rotative + brèche-faiblesse mobile).
- **é7 #8 Le Tyran-Miroir** (MIROIR + GRAVITÉ) : se place en **reflet** (960-x) ; invulnérable tant qu'on ne **piège** pas son reflet dans un **laser de gel actif** → stagger/fenêtre (lasers latéraux = pièges sûrs) ; la **gravité s'inverse** en cycle (cadence ↑ par phase) ; lames différées. **Secret** = symétrie CENTRALE (désapprendre) + flips rapides.
- **é8 (ORIGINAL) Le Souverain du Voile** = **CLIMAX 2D, le plus dur** : empile danmaku dense (anneaux à trouée + spirales) + **inversions de gravité** télégraphiées + **échos de TOI** (`EchoGhostSystem`, P2+) + **Orbe du Verdict à PARER** (→ le boss descend, gravité stabilisée, fenêtre DPS) + **vide qui rétrécit** (P3). **Secret « Le Reflux te réclame »** = tout en même temps + flips serrés (2.6 s) ; vulnérable seulement en **micro-fenêtre post-flip** (~1.1 s) → DPS-check de mémoire musculaire → vraie mort → mène au Cœur.

## §22 — BOSS BIOME 9 : « Le Doyen — Procès du Vestige » (refonte)
*Garde l'identité du Doyen (juge-sentinelle + Orbe de Verdict à parer) mais devient MOBILE, à base d'objets + identification + duplication. Plus aucun « tourelle statique ».*

**Pitch** : le Doyen préside depuis 4 **tribunes** (cardinaux). Il est **invulnérable tant qu'il préside**. Pour le condamner, il faut rassembler les **Preuves** qu'il laisse tomber et les déposer sur la **Balance** centrale.

- **Faire #1 — Recueillir les Preuves** : ses attaques lâchent des Preuves (objets au sol). Les ramasser (contact) et les DÉPOSER sur la Balance centrale. N preuves déposées → **Condamnation** → le Doyen descend, vulnérable ~5 s.
- **Faire #2 — Parer le Verdict** : il lance périodiquement l'**Orbe de Verdict** (gros projectile lent). La parer (C) → stagger + lâche une Preuve bonus. *(signature conservée de la base)*
- **Esquive** (5) : (1) faisceau « Regard » depuis sa tribune courante ; (2) lignes d'accusation convergentes des 4 tribunes vers toi ; (3) **zones de Sentence retardées** qui éclatent là où tu étais il y a 2 s (ton passé jugé) ; (4) **Témoins** = échos qui marchent vers toi (EchoGhost) ; (5) l'Orbe de Verdict.
- **Positionnement** : le Doyen TÉLÉPORTE de tribune en tribune ; safe = les tribunes qu'il n'occupe pas ; il faut traverser pour ramasser/déposer en évitant sa ligne de vue (cône du Regard).
- **Phases** : P1 *Instruction* (1 preuve, lent) → P2 *Réquisitoire* (2 preuves, +Témoins, Regard rapide) → P3 *Délibéré* (3 preuves, Sentences retardées + lignes convergentes).
- **SECRET PHASE — « Le Doyen se récuse »** : à 0 PV, il se **fracture en 4 mini-Doyens** (un par tribune, PV partagés). La règle s'**inverse** : il faut déposer une Preuve à la tribune **OPPOSÉE** à celle qui préside. Quand les 4 sont condamnés simultanément → verdict final.
- **Réutilise** : `EchoGhostSystem` (Témoins), pipeline `boss:tir` (Regard/lignes), parade existante (Verdict), un **petit système d'objets** (drop/ramasse/dépose) à créer (léger : zones + flag « porté »).
- **Folie** : duplication en secret phase + objets-preuves + AoE rétro-temporelle (« ton passé est jugé »).

## §23 — BOSS BIOME 10 : « Le Cœur du Reflux — Polymorphe » (refonte)
*Garde la base sceaux/invulnérabilité + fausse-mort, mais chaque phase devient un VERBE différent → un boss qui se métamorphose. Maximalement distinct du Procès.*

**Pitch** : le Cœur ne se combat jamais deux fois de la même façon. Il mue à chaque phase.

- **P1 — Le Souvenir (sceaux + danmaku)** *(base actuelle)* : invulnérable ; allumer le sceau désigné (ordre dicté par sa rotation) → fenêtre ; esquiver anneaux lents.
- **P2 — L'Écho (fractionnement + tracé)** : le Cœur éclate en **4 battements** orbitants. **Faire** : DASHER à travers les 4 dans l'ordre où ils pulsent (relier, cf. Constellation) → re-fusion → vulnérable. **Esquive** : chaque battement crache une spirale ; faisceaux croisés.
- **P3 — Le Gouffre (gavage / ne pas attaquer)** : le Cœur ouvre une **gueule** qui aspire. **Faire** : NE PAS frapper (il se soigne des dégâts — « le Cœur dévore la violence ») ; ramasser les **Vérités** qu'il recrache et les JETER dans la gueule jusqu'à l'étouffer → vulnérable. **Esquive** : aspiration centrale + danmaku.
- **SECRET PHASE — « Le Reflux te rend tes morts »** : fausse mort → resurgit en **miroir de TOI** + invoque 3 **écho-Vestiges** (tes toi passés, EchoGhost/CloneIllusion). L'arène s'inonde de Reflux ; il faut allumer **les 4 sceaux dans une seule fenêtre** en esquivant tes propres échos. Vraie mort → FinScene.
- **Réutilise** : sceaux + gate d'invulnérabilité + fausse-mort (déjà implémentés) ; `EchoGhostSystem`/`CloneIllusionSystem` (secret phase) ; pipeline `boss:tir` ; système d'objets (Vérités, partagé avec §22).
- **Folie** : 4 verbes successifs (puzzle → tracé → gavage → miroir) + le boss se transforme visuellement à chaque phase.

---

## Notes d'implémentation transverses (pour quand on code)
- **Système d'objets portables** (Preuves / Vérités / Lanternes / Bombes) : entité simple `{ x, y, type, porte? }` + ramasse au contact (le joueur en porte 1) + dépose sur une zone-cible. Réutilisable par #5, #9bis, #18, §22, §23.
- **Cibles/sceaux/leviers** : zones à activer (déjà fait pour les sceaux du Cœur) — généraliser en `ActivationSystem`.
- **Échos du joueur** : `EchoGhostSystem` (enregistrement/rejeu) + `CloneIllusionSystem` (visuel) couvrent Marionnettiste, Anti-Vestige, secret phase du Cœur.
- **Boss mobile / téléport** : le pattern pilote `boss.sprite` position (tween/téléport) — non encore fait (les boss actuels sont stationnaires).
- **Vulnérabilité conditionnelle** : override `recevoirDegats` gaté par un flag (déjà fait pour le Cœur) — patron réutilisable.
- **AoE rétro-temporelle** : enregistrer les positions passées du joueur (comme EchoGhost) et y faire éclater une zone.
