// Salle : Cœur du Reflux — La Salle aux Mille Regards (vue de dessus, OE)
// (Phase 9.13 — salle signature catalogue §6 #3)
//
// INTENTION : 6 statues disposées en cercle, toutes le regard tourné vers le
// CENTRE. Entrer dans un cône → la statue tire un projectile (parable). Un
// coffre trône au centre, dans la zone la plus surveillée : trade-off net —
// longer le bord pour traverser O→E en sécurité, OU plonger au centre pour le
// loot en zigzaguant dans les angles morts.

import {
    HAUTEUR_PORTE,
    porteO, porteE, regardFige
} from '../_format.js';

const W = 960;
const H = 540;

export const coeur_mille_regards = {
    id: 'coeur_mille_regards',
    biome: 'coeur_reflux',
    nom: 'La Salle aux Mille Regards',
    dims: { largeur: W, hauteur: H },
    dimsCanvas: true,
    vue: 'topDown',
    gouffreMort: false,
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'crypte', 'arene'],
    unique: true,
    rolesAutorises: ['main', 'alt', 'entree'],
    tirageWeight: 3,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const cx = W / 2, cy = H / 2;
        const rayon = 205;
        const nb = 6;

        // 6 statues en cercle, chacune regardant vers le centre.
        const obstacles = [];
        for (let i = 0; i < nb; i++) {
            const a = (i / nb) * Math.PI * 2 + Math.PI / 6;   // décalage pour ne pas aligner sur O/E
            const sx = cx + Math.cos(a) * rayon;
            const sy = cy + Math.sin(a) * rayon;
            const versCentre = Math.atan2(cy - sy, cx - sx);
            obstacles.push(regardFige(sx, sy, {
                angle: versCentre, demiCone: 0.42, portee: 260, cooldownMs: 1500
            }));
        }

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(H / 2 + HAUTEUR_PORTE / 2);
        if (portesActives.includes('E')) portes.E = porteE(W, H / 2 + HAUTEUR_PORTE / 2);

        return {
            plateformes: [],
            obstacles,
            zones: [],
            portes,
            // Coffre AU CENTRE (zone la plus surveillée) : récompense du risque.
            coffreForce: { x: cx, y: cy },
            ennemisForce: [],
            spawnDefault: { x: 70, y: H / 2 }
        };
    }
};
