// Catalogue des types d'obstacles posés dans les salles.
//
// Un obstacle = élément qui altère le gameplay :
//   - pieu : statique, dégâts au contact (3 Résonance)
//   - ressort : statique, boost vertical au contact si joueur descend
//   - plateforme_mobile : se déplace en aller-retour (joueur peut atterrir)
//
// La data ici décrit les paramètres et le balance ; les visuels sont dans
// `render/entities/{Pieux,Ressort,PlateformeMobile}.js`. L'instanciation
// physique est dans `entities/Obstacle.js`.

export const TYPES_OBSTACLES = {
    pieu: {
        id: 'pieu',
        // Direction = 'sol' (pointes vers le haut) ou 'plafond' (pointes vers le bas)
        // L'orientation est passée en paramètre par chaque obstacle dans la salle.
        largeur: 24, hauteur: 18,
        degats: 3,
        // Cooldown entre 2 dégâts pour éviter le spam (comme l'invincibilité du joueur)
        invincibiliteApresHit: 600
    },
    ressort: {
        id: 'ressort',
        largeur: 28, hauteur: 14,
        // Vélocité Y appliquée quand le joueur tombe dessus.
        // Le saut max du joueur est 96 px (~ -440 vy). Ressort = 1.4× = 600 ≈ 188 px de hauteur.
        boostVy: -600,
        cooldown: 250
    },
    plateforme_mobile: {
        id: 'plateforme_mobile',
        // Variantes : direction 'horizontale' ou 'verticale'
        // amplitude = pixels de course ; periode = ms aller-retour complet
        largeur: 90, hauteur: 14,
        amplitudeDefault: 140,
        periodeDefault: 2400
    }
};
