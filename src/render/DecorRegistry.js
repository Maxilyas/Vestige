// DecorRegistry — plans de décor riches par archétype.
//
// Stratégie 8b2 : pour chaque archétype on définit
//   - une couche SILHOUETTES lointaines (bâtiments/tours/dômes en arrière, opacité 0.45)
//   - une couche STRUCTURES principales (colonnes, statues, atelier, dôme, tours)
//   - une couche SOL DÉCORÉ (pavé, végétation rampante, pierres) sur les niveaux principaux
//   - une couche MOBILIER DE VIE (lanternes, banderoles, étals, tonneaux, caisses, pots)
//
// La composition utilise un rng seedé : éléments fixes + éléments variables qui
// donnent de la variété entre deux visites de la même seed (mais reproductibles).

import { peindreColonne } from './elements/Colonne.js';
import { peindreStatue } from './elements/Statue.js';
import { peindreRacine } from './elements/RacineLierre.js';
import { peindreBatiment } from './elements/Batiment.js';
import { peindreTour } from './elements/Tour.js';
import { peindreDome } from './elements/Dome.js';
import { peindreAtelier } from './elements/Atelier.js';
import { peindreSolDecore } from './elements/SolDecore.js';
import { peindreLanterne } from './elements/Lanterne.js';
import { peindreBanderole } from './elements/Banderole.js';
import { peindreTonneau, peindreCaisse, peindrePotFleurs, peindreEtalMarchand } from './elements/MobilierVie.js';
import { paletteDuMonde } from './PainterlyRenderer.js';

const HAUTEUR_SOL = 40;

// ============================================================
// Helpers locaux
// ============================================================

// Repère le sol principal de la salle (la plateforme la plus large) pour y poser
// le sol décoré et le mobilier
function trouverSolPrincipal(plateformes, dims) {
    let max = null;
    for (const p of plateformes) {
        const xDebut = p.x - p.largeur / 2;
        const xFin = p.x + p.largeur / 2;
        const yTop = p.y - p.hauteur / 2;
        if (!max || p.largeur > max.largeur) {
            max = { ...p, xDebut, xFin, yTop };
        }
    }
    return max;
}

// ============================================================
// Plans par archétype (chacun retourne une liste typée d'éléments)
// ============================================================

function planSanctuaire(dims, rng) {
    const cx = dims.largeur / 2;
    const ySol = dims.hauteur - HAUTEUR_SOL;
    const elements = [];

    // Silhouettes lointaines (au-delà des murs)
    elements.push({ type: 'tour', x: 80, yBase: ySol, hauteur: 280, silhouette: true });
    elements.push({ type: 'tour', x: dims.largeur - 80, yBase: ySol, hauteur: 280, silhouette: true });

    // Structures principales : dôme central
    elements.push({ type: 'dome', x: cx, yBase: ySol, rayon: 70 });
    // 2 colonnes encadrant
    elements.push({ type: 'colonne', x: cx - 480, yBase: ySol, hauteur: 220 });
    elements.push({ type: 'colonne', x: cx + 480, yBase: ySol, hauteur: 220 });
    // Statue derrière l'autel
    elements.push({ type: 'statue', x: cx, yBase: ySol - 290, hauteur: 90 });

    // Racines / lierre
    elements.push({ type: 'racine', x: cx - 480, yBase: ySol - 100, dx: 0.3, dy: 1, longueur: 80 });
    elements.push({ type: 'racine', x: cx + 480, yBase: ySol - 80, dx: -0.3, dy: 1, longueur: 70 });

    // Mobilier (variable selon rng)
    if (rng() < 0.7) elements.push({ type: 'lanterne', x: cx - 250, yBase: ySol - 60 });
    if (rng() < 0.7) elements.push({ type: 'lanterne', x: cx + 250, yBase: ySol - 60 });
    if (rng() < 0.6) elements.push({ type: 'pot_fleurs', x: cx - 380, yBase: ySol });
    if (rng() < 0.6) elements.push({ type: 'pot_fleurs', x: cx + 380, yBase: ySol });

    return elements;
}

function planHall(dims, rng) {
    const cx = dims.largeur / 2;
    const ySol = dims.hauteur - HAUTEUR_SOL;
    const elements = [];

    // Silhouettes lointaines : 2-3 bâtiments + 1 tour, mix variable
    const xsBatiments = [dims.largeur * 0.18, dims.largeur * 0.50, dims.largeur * 0.82];
    for (const xb of xsBatiments) {
        const choix = rng();
        if (choix < 0.4) {
            elements.push({ type: 'batiment', x: xb, yBase: ySol, hauteur: 280, largeur: 90, silhouette: true });
        } else if (choix < 0.75) {
            elements.push({ type: 'tour', x: xb, yBase: ySol, hauteur: 320, silhouette: true });
        } else {
            elements.push({ type: 'dome', x: xb, yBase: ySol, rayon: 50, silhouette: true });
        }
    }

    // 4 colonnes principales
    const xs = [dims.largeur * 0.15, dims.largeur * 0.38, dims.largeur * 0.62, dims.largeur * 0.85];
    for (const x of xs) {
        elements.push({ type: 'colonne', x, yBase: ySol, hauteur: 240 });
    }
    // Bâtiment monumental au fond central
    elements.push({ type: 'batiment', x: cx, yBase: ySol, hauteur: 200, largeur: 140 });
    // Statue
    elements.push({ type: 'statue', x: cx + 200, yBase: ySol, hauteur: 110 });
    // Racines aux extrêmes
    elements.push({ type: 'racine', x: dims.largeur * 0.15, yBase: ySol - 30, dx: 0.4, dy: 1, longueur: 60 });
    elements.push({ type: 'racine', x: dims.largeur * 0.85, yBase: ySol - 30, dx: -0.4, dy: 1, longueur: 60 });

    // Banderoles entre certaines colonnes
    if (rng() < 0.7) {
        elements.push({
            type: 'banderole',
            x1: xs[0], y1: ySol - 220,
            x2: xs[1], y2: ySol - 220
        });
    }
    if (rng() < 0.7) {
        elements.push({
            type: 'banderole',
            x1: xs[2], y1: ySol - 220,
            x2: xs[3], y2: ySol - 220
        });
    }

    // Lanternes suspendues
    elements.push({ type: 'lanterne', x: xs[1] - 60, yBase: ySol - 160 });
    elements.push({ type: 'lanterne', x: xs[2] + 60, yBase: ySol - 160 });

    // Mobilier au sol (mix tonneaux / caisses)
    const nbMobilier = 2 + Math.floor(rng() * 3);
    for (let i = 0; i < nbMobilier; i++) {
        const xm = 100 + rng() * (dims.largeur - 200);
        const choix = rng();
        if (choix < 0.5) elements.push({ type: 'tonneau', x: xm, yBase: ySol });
        else elements.push({ type: 'caisse', x: xm, yBase: ySol });
    }

    return elements;
}

function planCrypte(dims, rng) {
    const ySol = dims.hauteur - HAUTEUR_SOL;
    const elements = [];

    // Silhouettes très peu (atmosphère oppressante)
    elements.push({ type: 'atelier', x: dims.largeur * 0.5, yBase: ySol, hauteur: 200, largeur: 110, silhouette: true });

    // 2 colonnes courtes
    elements.push({ type: 'colonne', x: dims.largeur * 0.12, yBase: ySol, hauteur: 150 });
    elements.push({ type: 'colonne', x: dims.largeur * 0.88, yBase: ySol, hauteur: 150 });
    // Atelier en avant (forge ruinée Présent / active Miroir)
    elements.push({ type: 'atelier', x: dims.largeur * 0.5, yBase: ySol, hauteur: 150, largeur: 100 });
    // Statue
    elements.push({ type: 'statue', x: dims.largeur * 0.3, yBase: ySol, hauteur: 100 });

    // Racines partout
    const nbRacines = 5;
    for (let i = 0; i < nbRacines; i++) {
        const xR = dims.largeur * (0.15 + i * 0.18);
        elements.push({
            type: 'racine',
            x: xR,
            yBase: ySol - 60 - rng() * 60,
            dx: (rng() - 0.5) * 0.4,
            dy: 1,
            longueur: 60 + rng() * 40
        });
    }

    // Mobilier de cellier (Miroir : caisses; Présent : versions dégradées)
    elements.push({ type: 'caisse', x: dims.largeur * 0.65, yBase: ySol });
    elements.push({ type: 'tonneau', x: dims.largeur * 0.7, yBase: ySol });

    return elements;
}

function planPont(dims, rng) {
    const ySol = dims.hauteur - HAUTEUR_SOL;
    const xFinGauche = dims.largeur * 0.27;
    const xDebutDroit = dims.largeur - xFinGauche;
    const elements = [];

    // Silhouettes lointaines : skyline d'une ville
    elements.push({ type: 'batiment', x: 120, yBase: ySol, hauteur: 240, largeur: 80, silhouette: true });
    elements.push({ type: 'tour', x: 220, yBase: ySol, hauteur: 320, silhouette: true });
    elements.push({ type: 'dome', x: 320, yBase: ySol, rayon: 45, silhouette: true });
    elements.push({ type: 'batiment', x: dims.largeur - 120, yBase: ySol, hauteur: 240, largeur: 80, silhouette: true });
    elements.push({ type: 'tour', x: dims.largeur - 220, yBase: ySol, hauteur: 320, silhouette: true });

    // 2 grandes tours encadrant le gouffre
    elements.push({ type: 'tour', x: xFinGauche - 60, yBase: ySol, hauteur: 280 });
    elements.push({ type: 'tour', x: xDebutDroit + 60, yBase: ySol, hauteur: 280 });

    // 2 statues plus proches
    elements.push({ type: 'statue', x: 100, yBase: ySol, hauteur: 110 });
    elements.push({ type: 'statue', x: dims.largeur - 100, yBase: ySol, hauteur: 110 });

    // Racines descendant dans le gouffre
    elements.push({ type: 'racine', x: xFinGauche, yBase: ySol, dx: 0.2, dy: 1, longueur: 100 });
    elements.push({ type: 'racine', x: xDebutDroit, yBase: ySol, dx: -0.2, dy: 1, longueur: 100 });

    // Banderole tendue entre les tours
    if (rng() < 0.85) {
        elements.push({
            type: 'banderole',
            x1: xFinGauche - 60, y1: ySol - 250,
            x2: xDebutDroit + 60, y2: ySol - 250
        });
    }

    // Lanternes suspendues le long du pont
    for (let i = 1; i <= 4; i++) {
        const xL = xFinGauche + i * ((xDebutDroit - xFinGauche) / 5);
        elements.push({ type: 'lanterne', x: xL, yBase: ySol - 200 });
    }

    return elements;
}

function planPuits(dims, rng) {
    const ySol = dims.hauteur - HAUTEUR_SOL;
    const elements = [];

    // Tour immense en silhouette qui longe toute la hauteur
    elements.push({ type: 'tour', x: dims.largeur * 0.5, yBase: ySol, hauteur: dims.hauteur - 60, silhouette: true });

    // 2 colonnes hautes
    elements.push({ type: 'colonne', x: 60, yBase: ySol, hauteur: dims.hauteur - 100 });
    elements.push({ type: 'colonne', x: dims.largeur - 60, yBase: ySol, hauteur: dims.hauteur - 100 });

    // Racines descendantes du sommet
    elements.push({ type: 'racine', x: dims.largeur * 0.4, yBase: 60, dx: 0.1, dy: 1, longueur: 200 });
    elements.push({ type: 'racine', x: dims.largeur * 0.6, yBase: 80, dx: -0.1, dy: 1, longueur: 220 });
    elements.push({ type: 'racine', x: dims.largeur * 0.5, yBase: 200, dx: 0.2, dy: 1, longueur: 180 });

    // Lanternes par "étage" du puits (tous les ~250 px)
    for (let y = ySol - 200; y > 100; y -= 280) {
        elements.push({ type: 'lanterne', x: dims.largeur * (0.25 + rng() * 0.5), yBase: y });
    }

    // Caisses au sol et à mi-hauteur
    elements.push({ type: 'caisse', x: dims.largeur * 0.4, yBase: ySol });
    elements.push({ type: 'pot_fleurs', x: dims.largeur * 0.6, yBase: ySol });

    return elements;
}

function planArene(dims, rng) {
    const cx = dims.largeur / 2;
    const ySol = dims.hauteur - HAUTEUR_SOL;
    const elements = [];

    // Silhouettes : skyline circulaire
    elements.push({ type: 'batiment', x: 100, yBase: ySol, hauteur: 200, largeur: 90, silhouette: true });
    elements.push({ type: 'dome', x: 250, yBase: ySol, rayon: 50, silhouette: true });
    elements.push({ type: 'tour', x: 400, yBase: ySol, hauteur: 240, silhouette: true });
    elements.push({ type: 'tour', x: dims.largeur - 400, yBase: ySol, hauteur: 240, silhouette: true });
    elements.push({ type: 'dome', x: dims.largeur - 250, yBase: ySol, rayon: 50, silhouette: true });
    elements.push({ type: 'batiment', x: dims.largeur - 100, yBase: ySol, hauteur: 200, largeur: 90, silhouette: true });

    // Statues circulaires autour de l'arène
    elements.push({ type: 'statue', x: cx - 540, yBase: ySol, hauteur: 130 });
    elements.push({ type: 'statue', x: cx + 540, yBase: ySol, hauteur: 130 });
    elements.push({ type: 'statue', x: cx - 200, yBase: ySol - 280, hauteur: 90 });
    elements.push({ type: 'statue', x: cx + 200, yBase: ySol - 280, hauteur: 90 });

    // 2 colonnes monumentales au fond
    elements.push({ type: 'colonne', x: cx - 380, yBase: ySol, hauteur: 320 });
    elements.push({ type: 'colonne', x: cx + 380, yBase: ySol, hauteur: 320 });

    // Banderoles tendues entre les colonnes
    if (rng() < 0.85) {
        elements.push({
            type: 'banderole',
            x1: cx - 380, y1: ySol - 290,
            x2: cx + 380, y2: ySol - 290
        });
    }

    // Étal de marchand (signature du Miroir : marché autour de l'arène)
    elements.push({ type: 'etal_marchand', x: cx - 460, yBase: ySol });
    elements.push({ type: 'etal_marchand', x: cx + 460, yBase: ySol });

    return elements;
}

const PLANS = {
    sanctuaire: planSanctuaire,
    hall: planHall,
    crypte: planCrypte,
    pont: planPont,
    puits: planPuits,
    arene: planArene
};

// ============================================================
// API publique : peindreDecor()
// ============================================================

const PEINTRES = {
    colonne: (s, e, m, p) => peindreColonne(s, e.x, e.yBase, e.hauteur, m, p),
    statue: (s, e, m, p) => peindreStatue(s, e.x, e.yBase, e.hauteur ?? 100, m, p),
    racine: (s, e, m, p) => peindreRacine(s, e.x, e.yBase, e.dx, e.dy, e.longueur, m, p),
    batiment: (s, e, m, p) => peindreBatiment(s, e.x, e.yBase, e.hauteur, e.largeur, m, p, { silhouette: e.silhouette }),
    tour: (s, e, m, p) => peindreTour(s, e.x, e.yBase, e.hauteur, m, p, { silhouette: e.silhouette }),
    dome: (s, e, m, p) => peindreDome(s, e.x, e.yBase, e.rayon, m, p, { silhouette: e.silhouette }),
    atelier: (s, e, m, p) => peindreAtelier(s, e.x, e.yBase, e.hauteur, e.largeur, m, p, { silhouette: e.silhouette }),
    lanterne: (s, e, m, p) => peindreLanterne(s, e.x, e.yBase, m, p, e.mode ?? 'suspendue'),
    banderole: (s, e, m, p) => peindreBanderole(s, e.x1, e.y1, e.x2, e.y2, m, p),
    tonneau: (s, e, m, p) => peindreTonneau(s, e.x, e.yBase, m, p),
    caisse: (s, e, m, p) => peindreCaisse(s, e.x, e.yBase, m, p),
    pot_fleurs: (s, e, m, p) => peindrePotFleurs(s, e.x, e.yBase, m, p),
    etal_marchand: (s, e, m, p) => peindreEtalMarchand(s, e.x, e.yBase, m, p)
};

/**
 * Peint le décor complet d'une salle dans la scène. Inclut :
 *   - silhouettes lointaines (depth -50)
 *   - structures principales (depth -20)
 *   - sol décoré (depth -10) sur le sol principal
 *   - mobilier de vie (depth +10)
 */
export function peindreDecor(scene, archetype, dims, monde, rng, plateformes) {
    const plan = PLANS[archetype];
    if (!plan) return [];

    const palette = paletteDuMonde(monde);
    const elements = plan(dims, rng);
    const objets = [];

    // 1. Sol décoré (par-dessus le sol uni mais sous les plateformes)
    if (plateformes) {
        const sol = trouverSolPrincipal(plateformes, dims);
        if (sol) {
            const obj = peindreSolDecore(scene, sol.xDebut, sol.xFin, sol.yTop, monde, palette, rng);
            objets.push(obj);
        }
    }

    // 2. Tous les éléments architecturaux + mobilier
    for (const el of elements) {
        const peintre = PEINTRES[el.type];
        if (!peintre) continue;
        const obj = peintre(scene, el, monde, palette);
        if (obj) objets.push(obj);
    }

    return objets;
}
