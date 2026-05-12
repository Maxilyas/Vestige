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
    1: {
        themeNarratif: 'Premiers pas. Tout est plat, doux. La verticalité existe (B-haut) mais reste optionnelle.',
        salles: {
            'A':      { archetype: 'sanctuaire', topographie: 'arene_ouverte' },
            'B':      { archetype: 'hall',       topographie: 'arene_ouverte' },
            'B-haut': { archetype: 'puits',      topographie: 'puits_descente' },
            'C':      { archetype: 'hall',       topographie: 'salle_colonnes' },
            'D':      { archetype: 'pont',       topographie: 'pont_brise' },
            'BOSS':   { archetype: 'arene',      topographie: 'arene_boss_ruines_1' }
        }
    },

    // ─── 2. Ruines basses — élargissement (gouffre + croix) ──────────────
    2: {
        themeNarratif: 'Premier vrai gouffre, première croix centrale. Le deadend bascule à D-haut.',
        salles: {
            'A':      { archetype: 'sanctuaire', topographie: 'arene_ouverte' },
            'B':      { archetype: 'hall',       topographie: 'croix_centrale' },
            'C':      { archetype: 'pont',       topographie: 'gouffre_lateral' },
            'D':      { archetype: 'crypte',     topographie: 'crypte_dalles' },
            'D-haut': { archetype: 'puits',      topographie: 'puits_descente' },
            'BOSS':   { archetype: 'arene',      topographie: 'arene_boss_ruines_2' }
        }
    },

    // ─── 3. Halls Cendrés — multi-étages installés ───────────────────────
    3: {
        themeNarratif: 'On monte. Double étage, colonnade haute, passerelles parallèles.',
        salles: {
            'A':      { archetype: 'sanctuaire', topographie: 'arene_ouverte' },
            'B':      { archetype: 'hall',       topographie: 'double_etage' },
            'B-haut': { archetype: 'puits',      topographie: 'puits_descente' },
            'C':      { archetype: 'hall',       topographie: 'colonnade_haute' },
            'D':      { archetype: 'pont',       topographie: 'passerelles_paralleles' },
            'BOSS':   { archetype: 'arene',      topographie: 'arene_boss_halls_3' }
        }
    },

    // ─── 4. Halls Cendrés — densification (couloirs, donjon) ────────────
    4: {
        themeNarratif: 'La chaleur enferme. Couloir étroit, cellules de donjon, spirale ascendante.',
        salles: {
            'A':      { archetype: 'sanctuaire', topographie: 'arene_ouverte' },
            'B':      { archetype: 'hall',       topographie: 'couloir_etroit' },
            'C':      { archetype: 'crypte',     topographie: 'donjon_cellules' },
            'D':      { archetype: 'hall',       topographie: 'tour_marches' },
            'D-haut': { archetype: 'puits',      topographie: 'puits_spirale' },
            'BOSS':   { archetype: 'arene',      topographie: 'arene_boss_halls_4' }
        }
    },

    // ─── 5. Cristaux Glacés — bascule arènes ouvertes + verticalité ─────
    5: {
        themeNarratif: 'Bascule visuelle vers le froid. Première vraie arène (anneau), mezzanine haute.',
        salles: {
            'A':      { archetype: 'sanctuaire', topographie: 'arene_ouverte' },
            'B':      { archetype: 'arene',      topographie: 'arene_anneau' },
            'B-haut': { archetype: 'crypte',     topographie: 'puits_spirale' },
            'C':      { archetype: 'hall',       topographie: 'mezzanine_haute' },
            'D':      { archetype: 'pont',       topographie: 'aile_dechiree' },
            'BOSS':   { archetype: 'arene',      topographie: 'arene_boss_cristaux_5' }
        }
    },

    // ─── 6. Cristaux Glacés — vertige (gouffres, fragments, cascade) ────
    6: {
        themeNarratif: 'Vertige maximal. Gouffre vertical, arène fragmentée, cascade de glace au deadend.',
        salles: {
            'A':      { archetype: 'sanctuaire', topographie: 'arene_ouverte' },
            'B':      { archetype: 'pont',       topographie: 'gouffre_vertical' },
            'C':      { archetype: 'arene',      topographie: 'arene_fragmentee' },
            'D':      { archetype: 'arene',      topographie: 'arene_estrade' },
            'D-haut': { archetype: 'puits',      topographie: 'cascade_droite' },
            'BOSS':   { archetype: 'arene',      topographie: 'arene_boss_cristaux_6' }
        }
    },

    // ─── 7. Voile Inversé — désorientation (labyrinthe, aile déchirée) ──
    7: {
        themeNarratif: 'Le monde se déchire. Labyrinthe de murs, aile brisée, donjon désorientant.',
        salles: {
            'A':      { archetype: 'sanctuaire', topographie: 'arene_ouverte' },
            'B':      { archetype: 'hall',       topographie: 'labyrinthe_murs' },
            'B-haut': { archetype: 'puits',      topographie: 'puits_spirale' },
            'C':      { archetype: 'pont',       topographie: 'aile_dechiree' },
            'D':      { archetype: 'crypte',     topographie: 'donjon_cellules' },
            'BOSS':   { archetype: 'arene',      topographie: 'arene_boss_voile_7' }
        }
    },

    // ─── 8. Voile Inversé — rupture (ponts impossibles) ─────────────────
    8: {
        themeNarratif: 'Plus de sol stable. Pont étroit, gouffre vertical, estrade isolée.',
        salles: {
            'A':      { archetype: 'sanctuaire', topographie: 'arene_ouverte' },
            'B':      { archetype: 'pont',       topographie: 'pont_etroit' },
            'C':      { archetype: 'pont',       topographie: 'gouffre_vertical' },
            'D':      { archetype: 'arene',      topographie: 'arene_estrade' },
            'D-haut': { archetype: 'crypte',     topographie: 'puits_descente' },
            'BOSS':   { archetype: 'arene',      topographie: 'arene_boss_voile_8' }
        }
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
