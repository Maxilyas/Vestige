// Fragments — matière première du système de forge.
//
// Conceptuellement DIFFÉRENTS des items équipables :
//   - Pas de slot, pas de tier, pas d'effets
//   - Inertes tels quels — uniquement utilisables au Fondeur
//   - Stockés comme COMPTEURS (pas dans l'inventaire 40 slots) pour ne pas saturer
//
// 3 types correspondant aux 3 familles d'items.

export const FRAGMENTS = {
    fragment_blanc: {
        id: 'fragment_blanc',
        nom: 'Fragment Blanc',
        famille: 'blanc',
        couleur: 0xe8e4d8,
        description: "Un éclat de Résonance stable. Inerte tel quel."
    },
    fragment_bleu: {
        id: 'fragment_bleu',
        nom: 'Fragment Bleu',
        famille: 'bleu',
        couleur: 0x5a8ac8,
        description: "Un éclat chaud du passé. Pèse étrangement."
    },
    fragment_noir: {
        id: 'fragment_noir',
        nom: 'Fragment Noir',
        famille: 'noir',
        couleur: 0x4a3858,
        description: "Un éclat du Reflux. Il oscille."
    }
};

export const FAMILLES_FRAGMENT = ['blanc', 'bleu', 'noir'];

// Mapping famille → fragment id
export function fragmentDeFamille(famille) {
    return FRAGMENTS[`fragment_${famille}`] ?? null;
}
