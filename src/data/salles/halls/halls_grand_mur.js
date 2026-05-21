// Salle : Halls Cendrés — Le Grand Mur (signature)
//
// ARCHITECTURE : grande nef funéraire. Murs latéraux pleins (sauf portes),
// plafond cathédrale brisé avec 3 étages de stalactites. Sol continu (pas
// de gouffre — la nef est solide). Au CENTRE, un grand mur fissuré géant
// barre vraiment l'accès : casser ou contourner par le haut (exposé aux pieux).
//
// Niches signature : foyers éteints latéraux (brasiers RARES dans cuvettes
// de pierre), mur SECRET caché dans le mur lateral droit (révèle coffre).

import {
    HAUTEUR_SOL, sol, plateforme, plafondCathedrale,
    porteO, porteE,
    mur, murLateralGauche, murLateralDroit,
    murFissure, pieuPlafond, brasier, murSecret
} from '../_format.js';

const W = 2800;
const H = 1200;
const Y_SOL = H - HAUTEUR_SOL;        // 1160
const Y_PLAFOND = 60;
const X_MUR = W / 2;

export const halls_grand_mur = {
    id: 'halls_grand_mur',
    biome: 'halls_cendres',
    nom: 'Le Grand Mur',
    dims: { largeur: W, hauteur: H },
    portesPossibles: ['O', 'E'],
    archetypesCompatibles: ['hall', 'crypte'],
    rolesAutorises: ['main', 'alt', 'entree'],
    unique: true,

    generer({ portesActives = ['O', 'E'] } = {}) {
        const plateformes = [
            // ─── SOL : continu, large nef ──
            sol(0, W, Y_SOL),

            // ─── PLAFOND ORGANIQUE (cathédrale brisée, stalactites) ──
            // 3 segments de plafond à hauteurs différentes (effet voûte effondrée)
            plafondCathedrale(0,          600,        Y_PLAFOND + 80),
            plafondCathedrale(600,        1200,       Y_PLAFOND + 200),  // voûte plus haute centre
            plafondCathedrale(1200,       1600,       Y_PLAFOND + 120),  // pic central (sous le mur)
            plafondCathedrale(1600,       2200,       Y_PLAFOND + 200),
            plafondCathedrale(2200,       W,          Y_PLAFOND + 80),

            // ─── MURS LATÉRAUX (uniquement si pas de porte) ──
            // Si porte O ou E manquante, on ferme le bord. Sinon, espace ouvert
            // pour laisser passer la porte (de Y_SOL-90 à Y_SOL).
            ...(portesActives.includes('O') ? [] : [murLateralGauche(Y_PLAFOND, Y_SOL)]),
            ...(portesActives.includes('E') ? [] : [murLateralDroit(W, Y_PLAFOND, Y_SOL)]),
            // Si porte présente, mur lateral SUPÉRIEUR uniquement (de Y_PLAFOND au sommet de la porte)
            ...(portesActives.includes('O') ? [mur(15, Y_PLAFOND, Y_SOL - 100)] : []),
            ...(portesActives.includes('E') ? [mur(W - 15, Y_PLAFOND, Y_SOL - 100)] : []),

            // ─── NICHES LATÉRALES (foyers éteints, surfaces dédiées brasiers) ──
            // Niche gauche : creux dans le sol/mur à x≈200, sol de la niche surélevé
            plateforme(200, Y_SOL - 60, 200, { oneWay: false }),  // estrade foyer
            plateforme(W - 200, Y_SOL - 60, 200, { oneWay: false }),

            // ─── CÔTÉ GAUCHE : montée Δ80 vers passerelle haute ──
            plateforme(440, 1040, 130, { oneWay: true }),  // Δ60 depuis estrade foyer 1100
            plateforme(620,  960, 140, { oneWay: true }),
            plateforme(800,  880, 140, { oneWay: true }),
            plateforme(980,  800, 140, { oneWay: true }),
            plateforme(1160, 720, 140, { oneWay: true }),
            plateforme(X_MUR - 200, 640, 160, { oneWay: true }),

            // ─── CÔTÉ DROIT symétrique ──
            plateforme(W - 440, 1040, 130, { oneWay: true }),
            plateforme(W - 620,  960, 140, { oneWay: true }),
            plateforme(W - 800,  880, 140, { oneWay: true }),
            plateforme(W - 980,  800, 140, { oneWay: true }),
            plateforme(W - 1160, 720, 140, { oneWay: true }),
            plateforme(X_MUR + 200, 640, 160, { oneWay: true }),

            // ─── PASSERELLE HAUTE (contournement risqué — pieux plafond, Δ70)
            plateforme(X_MUR, 570, 320, { oneWay: false }),

            // ─── NICHE HAUTE CACHÉE (coffre derrière mur SECRET dans le plafond)
            // Chaîne depuis passerelle W/2=1400/yTop=570 vers W-200=2600/yTop=410
            // (gap horiz ≤ 130, Δ vert ≤ 90)
            plateforme(1700, 530, 140, { oneWay: true }),  // Δ40 vert, gap 30 depuis passerelle
            plateforme(1900, 490, 140, { oneWay: true }),
            plateforme(2100, 470, 140, { oneWay: true }),
            plateforme(2300, 450, 140, { oneWay: true }),
            plateforme(2500, 430, 140, { oneWay: true }),
            plateforme(W - 200, 410, 180, { oneWay: false })  // palier coffre caché
        ];

        const obstacles = [
            // Mur fissuré GÉANT central HP=8 — bloque vraiment l'accès
            // (visuellement marqué — c'est le "grand mur" éponyme)
            murFissure(X_MUR, Y_SOL - 520, { largeur: 50, hauteur: 520, hp: 8, dropSel: true, dropFragmentFamille: 'blanc' }),

            // Pieux plafond AU-DESSUS de la passerelle haute (danger contournement)
            pieuPlafond(X_MUR - 100, 540),
            pieuPlafond(X_MUR,        540),
            pieuPlafond(X_MUR + 100, 540),

            // Brasiers RARES dans les niches latérales (foyers funéraires)
            brasier(200, Y_SOL - 60, { largeur: 120, cycleMs: 4000, offsetMs: 0 }),
            brasier(W - 200, Y_SOL - 60, { largeur: 120, cycleMs: 4000, offsetMs: 2000 }),

            // Mur SECRET dans le plafond du côté droit (cache la niche coffre).
            // Visuellement IDENTIQUE à une portion du plafond — découverte pure.
            murSecret(W - 200, 445, 200, 25, { hp: 4, orientation: 'sol', dropSel: true })
        ];

        const portes = {};
        if (portesActives.includes('O')) portes.O = porteO(Y_SOL);
        if (portesActives.includes('E')) portes.E = porteE(W, Y_SOL);

        return {
            plateformes, obstacles, zones: [], portes,
            spawnDefault: { x: 80, y: Y_SOL - 20 }
        };
    }
};
