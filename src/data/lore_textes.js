// Catalogue des textes de lore des monolithes Vestige.
//
// Chaque entrée correspond à un `loreId` posé via le helper `vestigeLore()`
// dans une salle handcrafted. Lu pour la 1ère fois → drop Fragment Noir +
// marker persisté localStorage. Re-lecture → popup réaffichée sans drop.
//
// Style : fragments d'archive courts (3-4 lignes max), prose énigmatique,
// pas d'exposition directe. Le joueur reconstruit le lore par accumulation.
// Ton : mélancolie + témoignage cassé + écho du Reflux.
//
// Convention : `titre` court (≤40 char), `lignes` array (chacune ≤80 char).
// Le rendu auto-wrap si dépassement.

export const LORE_TEXTES = {
    sanctuaire_suspendu: {
        titre: 'Fragment d\'Archive — Sanctuaire',
        lignes: [
            'Lorsque le Reflux est venu, ils ont scellé le sanctuaire.',
            'Le pilier devait soutenir le poids du ciel.',
            'Il soutient maintenant le poids de l\'oubli.',
            'Tu n\'es pas le premier à grimper. Tu ne seras pas le dernier à tomber.'
        ]
    },
    lames_pendulantes: {
        titre: 'Fragment d\'Archive — Les Lames',
        lignes: [
            'Les anciens posaient des lames au plafond pour mesurer le temps.',
            'À chaque siècle, une pierre cédait. À chaque siècle, une lame se balançait plus bas.',
            'Compte les balanciers, et tu sauras depuis combien de temps tu es seul.'
        ]
    },
    pont_effrite: {
        titre: 'Fragment d\'Archive — Le Pont',
        lignes: [
            'Le pont reliait la cité haute aux carrières.',
            'Mille fois traversé par les porteurs. Une fois traversé par le Reflux.',
            'Ce qui reste n\'est pas un pont — c\'est le souvenir d\'un pont.'
        ]
    },
    belvedere_pendule: {
        titre: 'Fragment d\'Archive — Le Belvédère',
        lignes: [
            'Du haut du belvédère, on voyait toute la cité.',
            'Le pendule indiquait l\'heure aux gardes, et l\'heure aux dieux.',
            'Le pendule oscille encore. Il n\'y a plus personne pour le lire.'
        ]
    },

    // ─── Cœur du Reflux (étages 9-10, vue de dessus) ───
    coeur_seuil: {
        titre: 'Au Seuil — Première Inscription',
        lignes: [
            'Ici cesse la chute. Ici commence le regard.',
            'Tu n\'avances plus contre le poids du monde — tu marches sur sa mémoire.',
            'Ne baisse pas les yeux : ce qui est en dessous te regarde déjà.'
        ]
    },
    coeur_antichambre: {
        titre: 'Antichambre — Dernier Souffle',
        lignes: [
            'Au-delà de cette porte, le Cœur bat encore.',
            'Il a tout retenu : chaque nom, chaque chute, chaque toi.',
            'Entre. Il t\'attendait depuis le premier Reflux.'
        ]
    }
};

/** Renvoie l'entrée de lore, ou null si l'id est inconnu. */
export function loreParId(id) {
    return LORE_TEXTES[id] ?? null;
}
