// Biomes — placeholder pour la Phase A.
//
// En Phase B, chaque biome aura sa palette propre, son set d'archétypes
// autorisés, sa densité d'ennemis, son ambiance. Pour Phase A on n'a qu'un
// seul biome "ruines basses" qui sert pour les 10 étages — c'est ce qui
// permet de bâtir le système d'étages d'abord, puis de différencier ensuite.

export const BIOMES = {
    ruines_basses: {
        id: 'ruines_basses',
        nom: 'Ruines basses',
        archetypesAutorises: ['sanctuaire', 'hall', 'crypte', 'pont', 'puits', 'arene'],
        // Niveaux de danger autorisés pour le tirage d'archétype dans ce biome.
        // En Phase A, on ouvre tous les niveaux pour avoir de la diversité.
        niveauxDanger: [0, 1, 2, 3]
    }
};

/**
 * Renvoie le biome pour un étage donné.
 * Phase A : un seul biome, retourné tel quel.
 * Phase B : table par numéro d'étage.
 */
export function biomePourEtage(_numero) {
    return BIOMES.ruines_basses;
}
