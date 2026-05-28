// Étages — Phase 4. Table éditorialisée des 10 étages du mini-jeu.
//
// Pour chaque (étage, salleId), on fixe le couple (archétype, topographie).
// La présence d'une entrée pour 'B-haut' / 'D-haut' indique que la branche
// deadend verticale existe (sinon, pas de deadend pour cet étage).
//
// Ce qui reste seedé (variance vivante) :
//   - microgéométrie interne à chaque topographie (placement obstacles, etc.)
//   - tirage du pool d'ennemis dans le biome
//   - tier de rareté par ennemi (cf. RaritySystem)
//   - position exacte des coffres "secrets" si la topo en propose
//
// Ce qui devient déterministe (lisibilité de la progression) :
//   - structure physique de chaque salle (= identité visuelle/gameplay)
//   - présence/absence des branches deadend
//   - quel boss arena est utilisée (déjà déterministe via BOSS_ARENA_PAR_ETAGE,
//     reconfirmé ici pour cohérence)
//
// ARC NARRATIF (rythme appris run après run) :
//   1-2  Ruines basses    : initiation horizontale → premier gouffre/verticalité
//   3-4  Halls Cendrés    : multi-étages → couloirs étroits / labyrinthes
//   5-6  Cristaux Glacés  : verticalité installée → vertige (cascades, fragments)
//   7-8  Voile Inversé    : désorientation (labyrinthe) → rupture (ponts brisés)
//   9-10 Cœur du Reflux   : oppression (pieux, dalles) → culmination (palais)
//
// Tous les couples (archétype, topographie) ont été vérifiés contre
// `archetypesCompatibles` de chaque topographie (cf. data/topographies.js).

export const ETAGES = {
    // ─── 1. Ruines basses — initiation horizontale ───────────────────────
    // Phase 9 : grille 6×5 + cible 12-18 salles (mini-Metroidvania).
    // L'algo spanning tree place entrée et boss aux extrémités, génère un
    // chemin critique + branches + boucles, puis remplit jusqu'au minimum
    // si la densité naturelle est trop faible.
    1: {
        themeNarratif: 'Premiers pas. Initiation à l\'exploration et à l\'ancrage.',
        spanningTree: true,
        grille: { cols: 6, rows: 5 }
    },

    // ─── 2. Ruines basses — élargissement (Phase 9 mini-Metroidvania) ────
    // Pool Ruines existant (19 salles handcrafted), grille 6×5 et remplissage
    // densifiant. Le joueur découvre des configurations différentes à chaque run.
    2: {
        themeNarratif: 'Élargissement du réseau. Pool Ruines complet, plus de salles signature.',
        spanningTree: true,
        grille: { cols: 6, rows: 5 }
    },

    // ─── 3. Halls Cendrés — installation biome (Phase 9 mini-Metroidvania) ─
    // Pool Halls (25 salles handcrafted), mécanique signature = destruction
    // (murs fissurés, murs explosifs, sous-salles cachées, brasiers cycliques).
    3: {
        themeNarratif: 'Les feux brûlent encore. Mécanique destruction : casse murs et révèle sous-salles.',
        spanningTree: true,
        grille: { cols: 6, rows: 5 }
    },

    // ─── 4. Halls Cendrés — densification (Phase 9 mini-Metroidvania) ────
    // Même pool que l'étage 3, graphe encore plus dense + ennemis tier
    // supérieur. La variété vient de la combinatoire spanning tree.
    4: {
        themeNarratif: 'La chaleur enferme. Réseau dense, brasiers en cascade, explosions plus fréquentes.',
        spanningTree: true,
        grille: { cols: 6, rows: 5 }
    },

    // ─── 5. Cristaux Glacés — bascule froid (Phase 9.x mini-Metroidvania) ─
    // Pool Cristaux compact (20 salles handcrafted 960×540), identité
    // marbre/glace divine (Olympe). Mécaniques signature (colonnes, foudre,
    // vents, lasers) à venir en vagues toolkit ultérieures.
    5: {
        themeNarratif: 'Bascule visuelle vers le froid. Cité divine sur la glace, verticalité de marbre.',
        spanningTree: true,
        grille: { cols: 6, rows: 5 }
    },

    // ─── 6. Cristaux Glacés — vertige (Phase 9.x mini-Metroidvania) ──────
    // Même pool que l'étage 5, graphe plus dense + ennemis tier supérieur.
    6: {
        themeNarratif: 'Vertige maximal. Gouffres mortels, plateaux flottants, ponts cristallins.',
        spanningTree: true,
        grille: { cols: 6, rows: 5 }
    },

    // ─── 7. Voile Inversé — désorientation (Phase 9.x mini-Metroidvania) ─
    // Pool Voile compact (20 salles handcrafted 960×540), identité « cité
    // déchirée » (Olympe corrompue, magenta/aubergine) + hasards mix vide
    // (gouffres, failles) / échos (faux sols miroirs). Mécaniques signature
    // (inversion de gravité par salle/zone) à venir en vagues toolkit.
    7: {
        themeNarratif: 'Le monde se déchire. Cité fragmentée, gouffres de Présent, faux sols-échos.',
        spanningTree: true,
        grille: { cols: 6, rows: 5 }
    },

    // ─── 8. Voile Inversé — rupture (Phase 9.x mini-Metroidvania) ───────
    // Même pool que l'étage 7, graphe plus dense + ennemis tier supérieur.
    8: {
        themeNarratif: 'Plus de sol stable. Réseau dense, fragments flottants, ponts suspendus au-dessus du vide.',
        spanningTree: true,
        grille: { cols: 6, rows: 5 }
    },

    // ─── 9. Cœur du Reflux — oppression (pieux, montée éprouvante) ──────
    9: {
        themeNarratif: 'Le sol blesse. Pieux affleurants, dalles cryptiques, montée vers l\'arène.',
        salles: {
            'A':      { archetype: 'sanctuaire', topographie: 'arene_ouverte' },
            'B':      { archetype: 'crypte',     topographie: 'salle_pieux_sol' },
            'B-haut': { archetype: 'puits',      topographie: 'cheminee_etroite' },
            'C':      { archetype: 'crypte',     topographie: 'crypte_dalles' },
            'D':      { archetype: 'arene',      topographie: 'arene_montee' },
            'BOSS':   { archetype: 'arene',      topographie: 'arene_boss_reflux_9' }
        }
    },

    // ─── 10. Cœur du Reflux — culmination (palais final) ────────────────
    10: {
        themeNarratif: 'Le Souverain du Reflux attend. Palais à étages, tour de marches, arène fragmentée.',
        salles: {
            'A':      { archetype: 'sanctuaire', topographie: 'arene_ouverte' },
            'B':      { archetype: 'hall',       topographie: 'palais_etages' },
            'C':      { archetype: 'hall',       topographie: 'tour_marches' },
            'D':      { archetype: 'arene',      topographie: 'arene_fragmentee' },
            'D-haut': { archetype: 'puits',      topographie: 'puits_descente' },
            'BOSS':   { archetype: 'arene',      topographie: 'arene_boss_reflux_10' }
        }
    }
};

/**
 * Renvoie la configuration pinnée pour une (étage, salleId), ou null si
 * absente (fallback algorithmique côté EtageGen).
 */
export function configSalle(numero, salleId) {
    return ETAGES[numero]?.salles?.[salleId] ?? null;
}

/**
 * Renvoie la liste des IDs de salles présents dans l'étage (utile pour
 * savoir quelles branches deadend exister).
 */
export function sallesDeEtage(numero) {
    const etage = ETAGES[numero];
    if (!etage) return null;
    return Object.keys(etage.salles);
}
