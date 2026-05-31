// Salle : Cœur du Reflux — Le Cortège Figé (vue de dessus, OE)
// (Phase 9.12 — démo tableau figé animable)
//
// INTENTION : une procession statufiée barre le passage O→E. Un sigle au sol
// (côté ouest) la RÉVEILLE : les figures s'écartent ~3 s (fenêtres), le mur
// s'ouvre — on se glisse vers l'Est avant le re-figement. Première activation =
// éclat de souvenir (Fragment) + murmure.

import {
    HAUTEUR_PORTE,
    porteO, porteE
} from '../_format.js';

const W = 960;
const H = 540;

export const coeur_cortege = {
    id: 'coeur_cortege',
    biome: 'coeur_reflux',
    nom: 'Le Cortège Figé',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    vue: 'topDown',
    gouffreMort: false,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'crypte', 'pont', 'arene'],
    unique: true,
    rolesAutorises: ['main', 'alt', 'entree'],
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        // Procession : ligne verticale de figures à x≈480 (barre le couloir O→E).
        const figures = [];
        for (let y = 70; y <= 470; y += 50) {
            figures.push({ dx: 0, dy: y - 270 });
        }

        const tableaux = [{
            id: 'cortege',
            x: 480, y: 270,
            figures,
            sigil: { dx: -190, dy: 0 },          // rune côté ouest (avant le mur)
            mur: { x: 480, y: 270, w: 30, h: 470 }, // barrière quasi pleine
            dureeMs: 3200,
            fragment: 'noir',
            murmure: 'Ils marchaient vers le Cœur. Ils marchent encore.'
        }];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(H / 2 + HAUTEUR_PORTE / 2);
        if (portesActives.includes('E')) portes.E = porteE(W, H / 2 + HAUTEUR_PORTE / 2);

        return {
            plateformes: [],
            obstacles: [],
            zones: [],
            tableaux,
            portes,
            ennemisForce: [],
            spawnDefault: { x: 70, y: H / 2 }
        };
    }
};
