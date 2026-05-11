// Topographies — bibliothèque de structures physiques pour les salles.
//
// REFACTOR PHASE 2a (2026-05-12) : on découple structure (topographie) et
// thème (archétype). Une topographie possède :
//   - ses dims propres (largeur × hauteur)
//   - ses plateformes / obstacles
//   - les positions de SES portes (override de calculerPorte par défaut)
//   - un spawnDefault
//   - une liste d'archétypes thématiquement compatibles
//   - les directions de portes qu'elle sait afficher
//
// Convention 8a' : voie principale plate + verticalité bonus. Tous les sauts
// restent ≤ 70 px vert / 130 px horiz (jump apex ≈ 96 px / largeur joueur 30 px).
//
// CONTRAINTES PHYSIQUES (à respecter)
// ───────────────────────────────────
// - Jump max ≈ 96 px → 2 plateformes empilées au MÊME x doivent être au moins
//   one-way sur la basse (sinon head-bonk : 60 player + 18 plat = 78 px min
//   sans overlap entre plat haute et joueur posé sur plat basse).
// - Jump horizontal max ≈ 130 px edge-to-edge entre plateformes au même y.
// - 70 px vert est SAFE pour une montée standard.

// ─── Constantes partagées (importées par archetypes.js aussi) ───
export const HAUTEUR_SOL = 40;
export const ECART_VERT_SAFE = 70;
export const LARGEUR_PORTE = 60;
export const HAUTEUR_PORTE = 90;
export const LARGEUR_VORTEX = 60;
export const HAUTEUR_VORTEX = 90;

// ─── Helpers de construction ───
export function plateforme(x, yTop, largeur, hauteur = 16, oneWay = false) {
    return { x, y: yTop + hauteur / 2, largeur, hauteur, oneWay };
}

export function solHorizontal(yTop, xDebut, xFin, hauteur = HAUTEUR_SOL) {
    return {
        x: (xDebut + xFin) / 2,
        y: yTop + hauteur / 2,
        largeur: xFin - xDebut,
        hauteur,
        oneWay: false
    };
}

// Helpers obstacles (réutilisables si on en injecte dans des topographies)
export const pieu     = (x, y, orientation = 'sol') => ({ type: 'pieu', x, y, orientation });
export const ressort  = (x, y) => ({ type: 'ressort', x, y });
export const mobileH  = (x, y, params = {}) => ({ type: 'plateforme_mobile', x, y, axe: 'horizontale', ...params });
export const mobileV  = (x, y, params = {}) => ({ type: 'plateforme_mobile', x, y, axe: 'verticale', ...params });

// Helper porte — calcule x/y/interieur pour une direction donnée. Les
// topographies peuvent override y via options.yTopE/yTopO/yTopN/yTopS.
function portePos(direction, dims, options = {}) {
    const margeBord = 8;
    const yTopSol = options.yTopSol ?? (dims.hauteur - HAUTEUR_SOL - HAUTEUR_PORTE);
    if (direction === 'E') {
        return {
            direction: 'E',
            x: options.xE ?? (dims.largeur - LARGEUR_PORTE / 2 - margeBord),
            y: (options.yTopE ?? yTopSol) + HAUTEUR_PORTE / 2,
            largeur: LARGEUR_PORTE, hauteur: HAUTEUR_PORTE,
            interieur: 'gauche'
        };
    }
    if (direction === 'O') {
        return {
            direction: 'O',
            x: options.xO ?? (LARGEUR_PORTE / 2 + margeBord),
            y: (options.yTopO ?? yTopSol) + HAUTEUR_PORTE / 2,
            largeur: LARGEUR_PORTE, hauteur: HAUTEUR_PORTE,
            interieur: 'droite'
        };
    }
    if (direction === 'N') {
        const yTopN = options.yTopN ?? 8;
        return {
            direction: 'N',
            x: options.xN ?? (dims.largeur / 2),
            y: yTopN + HAUTEUR_PORTE / 2,
            largeur: LARGEUR_PORTE, hauteur: HAUTEUR_PORTE,
            interieur: 'bas'
        };
    }
    if (direction === 'S') {
        return {
            direction: 'S',
            x: options.xS ?? (dims.largeur / 2),
            y: (options.yTopS ?? yTopSol) + HAUTEUR_PORTE / 2,
            largeur: LARGEUR_PORTE, hauteur: HAUTEUR_PORTE,
            interieur: options.interieurS ?? 'haut'
        };
    }
    return null;
}

// ============================================================
// 🟫 ARENE_OUVERTE — Sol plat, plateformes bonus accessibles depuis le sol
// ============================================================
// Compatible : sanctuaire, hall, arene, crypte (toutes les salles à sol plat)
// Feel : combat à découvert, peu de surprises verticales. Verticalité limitée.
// Reachability : sol entire, corniches mi-haut à cx ± 320 (jump 70 ↑ depuis
// sol), centre haut à cx (jump 70 ↑ + 90 horiz depuis corniche), ciel au-dessus
// si porte N demandée.
const arene_ouverte = {
    id: 'arene_ouverte',
    nom: 'Arène Ouverte',
    dims: { largeur: 1600, hauteur: 720 },
    archetypesCompatibles: ['sanctuaire', 'hall', 'arene', 'crypte'],
    portesPossibles: ['E', 'O', 'N', 'S'],
    generer({ portesActives = ['E'] } = {}) {
        const dims = this.dims;
        const yTopSol = dims.hauteur - HAUTEUR_SOL;       // 680
        const yTopMid = yTopSol - ECART_VERT_SAFE;        // 610
        const yTopHaut = yTopMid - ECART_VERT_SAFE;       // 540
        const cx = dims.largeur / 2;                       // 800
        const plateformes = [];

        // Sol entier
        plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));

        // 2 corniches latérales mi-hauteur. Centre à cx ± 320, width 240.
        // Edge-to-edge avec centre haut (220 wide à cx) : 90 px horiz, 70 px
        // vert. Saut diagonal réalisable.
        plateformes.push(plateforme(cx - 320, yTopMid, 240, 16, false));
        plateformes.push(plateforme(cx + 320, yTopMid, 240, 16, false));

        // Plateforme centrale haute (vue dramatique, coffre rare). 220 wide
        // à cx, atteignable des deux corniches par jump diagonal.
        plateformes.push(plateforme(cx, yTopHaut, 220, 16, false));

        // Plateforme "ciel" pour la porte N (uniquement si demandée).
        // ONE-WAY pour éviter le head-bonk avec la plateforme centrale haute.
        if (portesActives.includes('N')) {
            const yTopCiel = yTopHaut - ECART_VERT_SAFE;  // 470
            plateformes.push(plateforme(cx, yTopCiel, 160, 16, true));
        }

        const portes = {};
        for (const dir of portesActives) {
            let opts = {};
            if (dir === 'N') {
                const yTopCiel = yTopHaut - ECART_VERT_SAFE;
                opts = { yTopN: yTopCiel - HAUTEUR_PORTE };
            }
            portes[dir] = portePos(dir, dims, opts);
        }

        return {
            plateformes,
            obstacles: [],
            portes,
            spawnDefault: { x: 80, y: yTopSol - 20 }
        };
    }
};

// ============================================================
// 🏯 TOUR_VERTICALE — Tour centrale one-way, sommet bonus
// ============================================================
// Compatible : sanctuaire, hall, puits, crypte
// Feel : voie main path PLATE au sol (E/O au sol). Verticalité OPTIONNELLE :
// monter au sommet du donjon central pour porte N + coffre.
// Reachability : tower en plateformes ONE-WAY empilées au même x (cx). Player
// monte en jumpant à travers chaque plate, redescend en drop-through.
const tour_verticale = {
    id: 'tour_verticale',
    nom: 'Tour Verticale',
    dims: { largeur: 1280, hauteur: 1080 },
    archetypesCompatibles: ['sanctuaire', 'hall', 'puits', 'crypte'],
    portesPossibles: ['E', 'O', 'N', 'S'],
    generer({ portesActives = ['E'] } = {}) {
        const dims = this.dims;
        const yTopSol = dims.hauteur - HAUTEUR_SOL;       // 1040
        const cx = dims.largeur / 2;                       // 640
        const plateformes = [];

        // Sol entier (voie main path plate)
        plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));

        // Tower : plateformes ONE-WAY empilées à cx. 70 px de séparation
        // verticale. Player jump-through montant, lands on top en redescendant
        // de chaque saut. Drop-through descendant (touche S/↓).
        let yTop = yTopSol - ECART_VERT_SAFE;              // 970
        const xTour = cx;
        while (yTop > 130) {
            plateformes.push(plateforme(xTour, yTop, 220, 14, true));
            yTop -= ECART_VERT_SAFE;
        }

        // Sommet : plateforme finale (one-way aussi, pour cohérence — pas de
        // head-bonk en cas de saut au sommet). Supporte porte N si demandée.
        const yTopSommet = yTop;                           // ~130
        plateformes.push(plateforme(cx, yTopSommet, 320, 16, true));

        const portes = {};
        for (const dir of portesActives) {
            let opts = {};
            if (dir === 'N') {
                opts = { yTopN: yTopSommet - HAUTEUR_PORTE };
            }
            portes[dir] = portePos(dir, dims, opts);
        }

        return {
            plateformes,
            obstacles: [],
            portes,
            spawnDefault: { x: 80, y: yTopSol - 20 }
        };
    }
};

// ============================================================
// ✦ CROIX_CENTRALE — Sol + corniches mid (E/O à mi-hauteur) + sommet (porte N)
// ============================================================
// Compatible : sanctuaire, hall, crypte
// Feel : portes E/O à MI-HAUTEUR (force la montée pour traverser), portes
// N/S en haut/bas. Échelle one-way au centre pour monter du sol au mid.
// Reachability : sol → 5 paliers one-way → hub mid → corniches latérales
// mid → top palier (porte N).
const croix_centrale = {
    id: 'croix_centrale',
    nom: 'Croix Centrale',
    dims: { largeur: 1400, hauteur: 900 },
    archetypesCompatibles: ['sanctuaire', 'hall', 'crypte'],
    portesPossibles: ['E', 'O', 'N', 'S'],
    generer({ portesActives = ['E'] } = {}) {
        const dims = this.dims;
        const yTopSol = dims.hauteur - HAUTEUR_SOL;       // 860
        const yTopMid = 440;                               // bras horizontaux + hub
        const yTopHaut = yTopMid - ECART_VERT_SAFE;        // 370, palier supérieur
        const cx = dims.largeur / 2;                       // 700
        const plateformes = [];

        // Sol entier (bras vertical bas)
        plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));

        // Échelle de plateformes one-way au centre : sol → mid (6 paliers,
        // 70 px chaque). Player saute up à travers, drop-through pour redescendre.
        // yTops : 790, 720, 650, 580, 510
        for (let i = 1; i <= 5; i++) {
            const yt = yTopSol - i * ECART_VERT_SAFE;
            plateformes.push(plateforme(cx, yt, 180, 14, true));
        }
        // Le dernier palier (yt=510) est à 70 px du hub mid (440) → saut OK.

        // Corniches latérales étendues à yTopMid (forment les bras horizontaux
        // de la croix). Couvrent la majorité du mid-floor pour supporter les
        // portes E/O et le déplacement entre portes.
        const xMargeEdge = 0;
        const halfWidth = 600;
        plateformes.push(plateforme(halfWidth / 2 + xMargeEdge, yTopMid, halfWidth, 16, false));
        plateformes.push(plateforme(dims.largeur - halfWidth / 2 - xMargeEdge, yTopMid, halfWidth, 16, false));

        // Hub central : ONE-WAY pour éviter le head-bonk avec la dernière
        // plateforme de l'échelle juste en dessous (overlap 8 px sinon).
        // Le joueur saute through-and-land normalement.
        plateformes.push(plateforme(cx, yTopMid, 220, 16, true));

        // Top palier : ONE-WAY aussi (head-bonk avec le hub qui est juste en
        // dessous à 70 px). Supporte porte N + coffre rare.
        plateformes.push(plateforme(cx, yTopHaut, 220, 16, true));

        const portes = {};
        for (const dir of portesActives) {
            let opts = {};
            if (dir === 'E') opts = { yTopE: yTopMid - HAUTEUR_PORTE };
            else if (dir === 'O') opts = { yTopO: yTopMid - HAUTEUR_PORTE };
            else if (dir === 'N') opts = { yTopN: yTopHaut - HAUTEUR_PORTE };
            portes[dir] = portePos(dir, dims, opts);
        }

        return {
            plateformes,
            obstacles: [],
            portes,
            spawnDefault: { x: 80, y: yTopSol - 20 }
        };
    }
};

// ============================================================
// 🌀 PUITS_DESCENTE — Vertical inversé, entrée au sommet, descente exploratoire
// ============================================================
// Compatible : puits, crypte
// Feel : on entre par le HAUT (porte S inversée), on descend en zigzag pour
// trouver le coffre en bas. Palier-sortie (porte E) à mi-hauteur.
// Reachability : zigzag 30/70 % de largeur 960, width 240 → gap horiz 144 px
// edge-to-edge (légèrement au-dessus du safe 130 mais reachable avec course).
const puits_descente = {
    id: 'puits_descente',
    nom: 'Puits Descendant',
    dims: { largeur: 960, hauteur: 1080 },
    archetypesCompatibles: ['puits', 'crypte'],
    portesPossibles: ['N', 'S', 'E', 'O'],
    generer({ portesActives = ['S'] } = {}) {
        const dims = this.dims;
        const yTopSol = dims.hauteur - HAUTEUR_SOL;       // 1040
        const plateformes = [];

        // Sol bas (large palier d'arrivée pour porte O/S au sol si demandée)
        plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));

        // Voie principale (sol → palier-sortie) : palier intermédiaire à yTop=970
        plateformes.push(plateforme(dims.largeur * 0.30, 970, 240, 14, false));

        // Palier-sortie (porte E) à mi-hauteur (yTop=900), s'étend de mid à droite.
        const largeurPalierSortie = dims.largeur * 0.55;
        const yTopPalierE = 900;
        plateformes.push(plateforme(
            dims.largeur - largeurPalierSortie / 2,
            yTopPalierE,
            largeurPalierSortie, 18, false
        ));

        // Zigzag montant du palier-sortie jusqu'au sommet.
        // Alternance gauche/droite à 0.30/0.70 de width, 70 px vertical.
        let yTop = 830;
        let cote = 0;
        while (yTop > 130) {
            const x = cote === 0 ? dims.largeur * 0.30 : dims.largeur * 0.70;
            plateformes.push(plateforme(x, yTop, 240, 14, false));
            yTop -= ECART_VERT_SAFE;
            cote = 1 - cote;
        }

        // Sommet : plateforme finale ÉLARGIE one-way (porte S inversée).
        plateformes.push(plateforme(dims.largeur / 2, 80, 320, 18, true));

        const portes = {};
        for (const dir of portesActives) {
            let opts = {};
            if (dir === 'S') {
                // Inversé : porte S au SOMMET, joueur spawn EN BAS de la porte
                opts = { yTopS: 80 - HAUTEUR_PORTE, interieurS: 'bas' };
            } else if (dir === 'N') {
                opts = { yTopN: 80 - HAUTEUR_PORTE };
            } else if (dir === 'E') {
                opts = { yTopE: yTopPalierE - HAUTEUR_PORTE };
            }
            portes[dir] = portePos(dir, dims, opts);
        }

        return {
            plateformes,
            obstacles: [],
            portes,
            // Spawn par défaut = au sommet (le puits est traditionnellement
            // entré par le haut). Fallback sur sol si manquant.
            spawnDefault: { x: dims.largeur / 2, y: 80 - 30 }
        };
    }
};

// ============================================================
// 🏛 DOUBLE_ETAGE — Sol bas (combat) + balcon haut (passage)
// ============================================================
// Compatible : sanctuaire, hall, pont
// Feel : porte O au sol, porte E sur le balcon — force la montée pour
// traverser. Escalier latéral 4 marches.
// Reachability : escalier à gauche (hors balcon range) sol → M1..M4, jump 70
// vert + 95 horiz vers le balcon. Balcon couvre droite jusqu'au bord pour
// supporter porte E.
const double_etage = {
    id: 'double_etage',
    nom: 'Double Étage',
    dims: { largeur: 1700, hauteur: 800 },
    archetypesCompatibles: ['sanctuaire', 'hall', 'pont'],
    portesPossibles: ['E', 'O', 'N', 'S'],
    generer({ portesActives = ['E', 'O'] } = {}) {
        const dims = this.dims;
        const yTopSol = dims.hauteur - HAUTEUR_SOL;       // 760
        const yTopBalcon = 410;                            // balcon haut
        const plateformes = [];

        // Sol entier (niveau combat)
        plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));

        // Balcon : de x=600 jusqu'au bord droit (dims.largeur). Width = 1100.
        // Couvre la zone porte E (x ~ 1662 — voir portePos).
        const xBalconDebut = 600;
        const largeurBalcon = dims.largeur - xBalconDebut;
        plateformes.push(plateforme(
            xBalconDebut + largeurBalcon / 2,
            yTopBalcon,
            largeurBalcon, 18, false
        ));

        // Escalier latéral à gauche, 4 marches step. yTop M4 = 480 → jump 70
        // vert + 95 horiz vers balcon at 410. M_n positions hors range balcon.
        // M1: x=200, yTop=690
        // M2: x=280, yTop=620
        // M3: x=360, yTop=550
        // M4: x=440, yTop=480
        const xMarche0 = 200;
        const xMarcheStep = 80;
        for (let i = 1; i <= 4; i++) {
            const yt = yTopSol - i * ECART_VERT_SAFE;
            const x = xMarche0 + (i - 1) * xMarcheStep;
            plateformes.push(plateforme(x, yt, 140, 14, false));
        }

        // Mezzanine combat au centre du sol (one-way pour drop-through).
        // Sous le balcon mais à droite des marches → safe.
        plateformes.push(plateforme(
            dims.largeur * 0.50,
            yTopSol - ECART_VERT_SAFE,
            200, 14, true
        ));

        // Plateforme "ciel" pour porte N si demandée (70 px au-dessus du balcon).
        // ONE-WAY pour éviter head-bonk avec le balcon en dessous.
        if (portesActives.includes('N')) {
            const yTopCiel = yTopBalcon - ECART_VERT_SAFE;
            plateformes.push(plateforme(dims.largeur / 2, yTopCiel, 180, 16, true));
        }

        const portes = {};
        for (const dir of portesActives) {
            let opts = {};
            if (dir === 'E') {
                // Porte E sur le balcon (force la montée)
                opts = { yTopE: yTopBalcon - HAUTEUR_PORTE };
            } else if (dir === 'N') {
                opts = { yTopN: yTopBalcon - ECART_VERT_SAFE - HAUTEUR_PORTE };
            }
            // Porte O reste au sol (default yTopSol)
            portes[dir] = portePos(dir, dims, opts);
        }

        return {
            plateformes,
            obstacles: [],
            portes,
            spawnDefault: { x: 80, y: yTopSol - 20 }
        };
    }
};

// ============================================================
// CATALOGUE
// ============================================================
export const TOPOGRAPHIES = {
    arene_ouverte,
    tour_verticale,
    croix_centrale,
    puits_descente,
    double_etage
};

/**
 * Filtre les topographies compatibles avec un archétype + supportant les portes.
 */
export function topographiesPour(archetypeId, portesNecessaires = []) {
    return Object.values(TOPOGRAPHIES).filter(t =>
        t.archetypesCompatibles.includes(archetypeId) &&
        portesNecessaires.every(d => t.portesPossibles.includes(d))
    );
}

/**
 * Choisit une topographie compatible avec l'archétype + supportant les portes.
 */
export function choisirTopographie(archetypeId, portesNecessaires, rng) {
    const candidates = topographiesPour(archetypeId, portesNecessaires);
    if (candidates.length === 0) {
        const compat = Object.values(TOPOGRAPHIES).filter(t =>
            t.archetypesCompatibles.includes(archetypeId)
        );
        if (compat.length === 0) return TOPOGRAPHIES.arene_ouverte;
        return compat[Math.floor(rng() * compat.length)];
    }
    return candidates[Math.floor(rng() * candidates.length)];
}
