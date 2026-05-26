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
// 🧱 LABYRINTHE_MURS — Couloir cloisonné, sol entier + 3 murs à sauter
// ============================================================
// Compatible : hall, crypte, arene
// Feel : combat segmenté par 3 murs verticaux courts (height 80, sous jump max 96).
// Le joueur saute par-dessus chaque mur avec ~16 px de marge.
// Reachability : sol entier, traversée E-O en sautant 3 fois. Pas de verticalité
// supplémentaire (porte N/S non supportée — fallback sur une autre topographie).
const labyrinthe_murs = {
    id: 'labyrinthe_murs',
    nom: 'Couloir Cloisonné',
    dims: { largeur: 1600, hauteur: 720 },
    archetypesCompatibles: ['hall', 'crypte', 'arene'],
    portesPossibles: ['E', 'O'],
    generer({ portesActives = ['E'] } = {}) {
        const dims = this.dims;
        const yTopSol = dims.hauteur - HAUTEUR_SOL;       // 680
        const plateformes = [];

        plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));

        // 3 murs verticaux à sauter : largeur 24, hauteur 80 (= 96 - 16 marge).
        // Tops à yTopSol - 80 = 600. Player apex 96 px → clear de 16 px.
        for (const xMur of [400, 800, 1200]) {
            plateformes.push(plateforme(xMur, yTopSol - 80, 24, 80, false));
        }

        const portes = {};
        for (const dir of portesActives) {
            portes[dir] = portePos(dir, dims);
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
// 🏛 ARENE_ESTRADE — Sol plat + estrade centrale solide + 2 corniches one-way
// ============================================================
// Compatible : arene, sanctuaire, hall
// Feel : podium central dramatique (combat surélevé), corniches latérales pour
// flanquer. Vue dégagée.
// Reachability : sol plat → side-jump sur l'estrade (80 px vert, accessible par
// arc depuis x<600 ou x>900). Corniches latérales one-way 70 px depuis sol.
const arene_estrade = {
    id: 'arene_estrade',
    nom: 'Arène à Estrade',
    dims: { largeur: 1500, hauteur: 720 },
    archetypesCompatibles: ['arene', 'sanctuaire', 'hall'],
    portesPossibles: ['E', 'O', 'N'],
    generer({ portesActives = ['E'] } = {}) {
        const dims = this.dims;
        const yTopSol = dims.hauteur - HAUTEUR_SOL;       // 680
        const cx = dims.largeur / 2;                       // 750
        const plateformes = [];

        plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));

        // Estrade centrale SOLIDE (podium dramatique, 80 vert = head-bonk safe).
        const yTopEstrade = yTopSol - 80;                  // 600
        plateformes.push(plateforme(cx, yTopEstrade, 300, 16, false));

        // 2 corniches latérales one-way (flanc, 70 vert depuis sol).
        plateformes.push(plateforme(250, yTopSol - ECART_VERT_SAFE, 200, 14, true));
        plateformes.push(plateforme(dims.largeur - 250, yTopSol - ECART_VERT_SAFE, 200, 14, true));

        // Porte N : plate ciel one-way au-dessus de l'estrade (drop-through OK)
        if (portesActives.includes('N')) {
            plateformes.push(plateforme(cx, yTopEstrade - ECART_VERT_SAFE, 200, 14, true));
        }

        const portes = {};
        for (const dir of portesActives) {
            let opts = {};
            if (dir === 'N') {
                opts = { yTopN: yTopEstrade - ECART_VERT_SAFE - HAUTEUR_PORTE };
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
// ⚰ CRYPTE_DALLES — 3 dalles solides à hauteurs irrégulières
// ============================================================
// Compatible : crypte
// Feel : 3 plinthes funéraires de hauteurs variées, atmosphère sépulcrale.
// Reachability : dalle 1 (sol-80) et dalle 3 (sol-80) directes depuis sol ;
// dalle 2 (sol-130) atteignable via dalle 1 ou 3 par chaînage (gap 125 horiz).
const crypte_dalles = {
    id: 'crypte_dalles',
    nom: 'Dalles Funéraires',
    dims: { largeur: 1400, hauteur: 720 },
    archetypesCompatibles: ['crypte'],
    portesPossibles: ['E', 'O'],
    generer({ portesActives = ['E'] } = {}) {
        const dims = this.dims;
        const yTopSol = dims.hauteur - HAUTEUR_SOL;       // 680
        const plateformes = [];

        plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));

        // 3 dalles solides, hauteurs irrégulières (offset x différents → pas
        // de stacking same-x → pas de head-bonk concern)
        plateformes.push(plateforme(375,  yTopSol - 80,  200, 20, false));
        plateformes.push(plateforme(700,  yTopSol - 130, 200, 20, false));
        plateformes.push(plateforme(1025, yTopSol - 80,  200, 20, false));

        const portes = {};
        for (const dir of portesActives) {
            portes[dir] = portePos(dir, dims);
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
// ⭕ ARENE_ANNEAU — Sol plat + corniches latérales formant anneau + porte N
// ============================================================
// Compatible : arene, sanctuaire
// Feel : 2 grandes corniches forment un anneau, gap central béant. Combat au
// sol dominé par ennemis sur corniches. Porte N optionnelle via plate ciel.
// Reachability : corniches G/D solides à sol-80 (head-bonk safe : 60+16<80).
// Plate ciel (porte N) à corniche-80, atteignable depuis les bords intérieurs
// des corniches (gap 30 horiz, 80 vert).
const arene_anneau = {
    id: 'arene_anneau',
    nom: 'Arène Annulaire',
    dims: { largeur: 1500, hauteur: 720 },
    archetypesCompatibles: ['arene', 'sanctuaire'],
    portesPossibles: ['E', 'O', 'N'],
    generer({ portesActives = ['E'] } = {}) {
        const dims = this.dims;
        const yTopSol = dims.hauteur - HAUTEUR_SOL;       // 680
        const cx = dims.largeur / 2;                       // 750
        const plateformes = [];

        plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));

        // 2 corniches latérales SOLIDES, gap central de 260 px
        const yTopCorn = yTopSol - 80;                     // 600
        plateformes.push(plateforme(330, yTopCorn, 580, 16, false));
        plateformes.push(plateforme(dims.largeur - 330, yTopCorn, 580, 16, false));

        // Plate ciel pour porte N
        if (portesActives.includes('N')) {
            plateformes.push(plateforme(cx, yTopCorn - 80, 200, 14, true));
        }

        const portes = {};
        for (const dir of portesActives) {
            let opts = {};
            if (dir === 'N') {
                opts = { yTopN: yTopCorn - 80 - HAUTEUR_PORTE };
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
// 🪢 PONT_ETROIT — Sol limité aux extrémités + long pont fragile + fosse à pieux
// ============================================================
// Compatible : pont
// Feel : tightrope spectaculaire. Tomber = pieux. Ressorts d'urgence dans la
// fosse pour relancer vers le pont.
// Reachability : pont one-way 940 px de long à sol-80. Accès direct par jump
// vertical depuis les sols. Fosse à 80 sous le sol → ressorts boost (-600 vy)
// catapultent ~190 px vers le haut.
const pont_etroit = {
    id: 'pont_etroit',
    nom: 'Pont Étroit',
    dims: { largeur: 1500, hauteur: 800 },
    archetypesCompatibles: ['pont'],
    portesPossibles: ['E', 'O'],
    generer({ portesActives = ['E'] } = {}) {
        const dims = this.dims;
        const yTopSolHaut = 680;                          // sol G/D
        const yTopFosse = 760;                            // fond fosse
        const plateformes = [];

        // Sols extrémités
        plateformes.push(solHorizontal(yTopSolHaut, 0, 300));
        plateformes.push(solHorizontal(yTopSolHaut, 1200, dims.largeur));

        // Fosse (sol-80, fond meurtrier)
        plateformes.push(solHorizontal(yTopFosse, 300, 1200));

        // Pont long et étroit (one-way, overlap 20 px avec sol G/D pour accès)
        plateformes.push(plateforme(750, 600, 940, 14, true));

        // 3 pieux dans la fosse + 2 ressorts d'évacuation
        const obstacles = [];
        for (const xPieu of [600, 750, 900]) {
            obstacles.push(pieu(xPieu, yTopFosse - 9, 'sol'));
        }
        for (const xRess of [350, 1150]) {
            obstacles.push(ressort(xRess, yTopFosse - 7));
        }

        const portes = {};
        for (const dir of portesActives) {
            const opts = { yTopSol: yTopSolHaut - HAUTEUR_PORTE };
            portes[dir] = portePos(dir, dims, opts);
        }

        return {
            plateformes,
            obstacles,
            portes,
            spawnDefault: { x: 80, y: yTopSolHaut - 20 }
        };
    }
};

// ============================================================
// 🪤 SALLE_PIEUX_SOL — 5 pieux au sol + 3 paliers one-way pour bypass aérien
// ============================================================
// Compatible : crypte, arene
// Feel : champ de pieux meurtriers, bypass via plateformes hautes.
// Reachability : 3 paliers w=300 espacés (gap horiz 100), atteignables par
// jump 70 vert depuis sol. Pieux au sol = 3 dmg + 600 ms cooldown.
const salle_pieux_sol = {
    id: 'salle_pieux_sol',
    nom: 'Champ de Pieux',
    dims: { largeur: 1500, hauteur: 720 },
    archetypesCompatibles: ['crypte', 'arene'],
    portesPossibles: ['E', 'O'],
    generer({ portesActives = ['E'] } = {}) {
        const dims = this.dims;
        const yTopSol = dims.hauteur - HAUTEUR_SOL;       // 680
        const plateformes = [];

        plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));

        // 3 paliers one-way (gap edge-to-edge 100 px)
        for (const xPalier of [400, 800, 1200]) {
            plateformes.push(plateforme(xPalier, yTopSol - 70, 300, 14, true));
        }

        // 5 pieux sol équidistants
        const obstacles = [];
        for (const xPieu of [300, 500, 700, 900, 1100]) {
            obstacles.push(pieu(xPieu, yTopSol - 9, 'sol'));
        }

        const portes = {};
        for (const dir of portesActives) {
            portes[dir] = portePos(dir, dims);
        }

        return {
            plateformes,
            obstacles,
            portes,
            spawnDefault: { x: 80, y: yTopSol - 20 }
        };
    }
};


// ============================================================
// 🪨 ARENE_FRAGMENTEE — Sol divisé en 4 îlots solides séparés par 3 trous à pieux
// ============================================================
// Compatible : arene, crypte
// Feel : sol "brisé", combat par îlots, sauts continus.
// Reachability : 4 îlots de 280-300 px, gap 100 horiz (under 130 safe).
// Chaque trou descend 20 px et contient un pieu (peine si raté).
const arene_fragmentee = {
    id: 'arene_fragmentee',
    nom: 'Arène Fragmentée',
    dims: { largeur: 1500, hauteur: 720 },
    archetypesCompatibles: ['arene', 'crypte'],
    portesPossibles: ['E', 'O'],
    generer({ portesActives = ['E'] } = {}) {
        const dims = this.dims;
        const yTopSol = dims.hauteur - HAUTEUR_SOL;       // 680
        const yTopTrou = 700;                              // 20 sous le sol
        const plateformes = [];

        // 4 îlots
        plateformes.push(solHorizontal(yTopSol, 0, 320));
        plateformes.push(solHorizontal(yTopSol, 420, 720));
        plateformes.push(solHorizontal(yTopSol, 820, 1120));
        plateformes.push(solHorizontal(yTopSol, 1220, dims.largeur));

        // 3 trous remplis (sol-bas)
        plateformes.push(solHorizontal(yTopTrou, 320, 420, 20));
        plateformes.push(solHorizontal(yTopTrou, 720, 820, 20));
        plateformes.push(solHorizontal(yTopTrou, 1120, 1220, 20));

        // 1 pieu par trou
        const obstacles = [];
        for (const xPieu of [370, 770, 1170]) {
            obstacles.push(pieu(xPieu, yTopTrou - 9, 'sol'));
        }

        const portes = {};
        for (const dir of portesActives) {
            portes[dir] = portePos(dir, dims);
        }

        return {
            plateformes,
            obstacles,
            portes,
            spawnDefault: { x: 80, y: yTopSol - 20 }
        };
    }
};


// ============================================================
// 🪺 AILE_DECHIREE — Sol coupé au centre, plateforme mobile horizontale traverse
// ============================================================
// Compatible : pont, arene
// Feel : il faut TIMER le passage de la plateforme mobile. Tomber = pieux.
// Reachability : sol G (0-600) + sol D (900-1500), gap intraversable à plat.
// Plateforme mobile oscille entre x=620 et x=880 (amp 130, période 3s).
const aile_dechiree = {
    id: 'aile_dechiree',
    nom: 'Aile Déchirée',
    dims: { largeur: 1500, hauteur: 800 },
    archetypesCompatibles: ['pont', 'arene'],
    portesPossibles: ['E', 'O'],
    generer({ portesActives = ['E'] } = {}) {
        const dims = this.dims;
        const yTopSolHaut = 680;
        const yTopFosse = 760;
        const plateformes = [];

        plateformes.push(solHorizontal(yTopSolHaut, 0, 600));
        plateformes.push(solHorizontal(yTopSolHaut, 900, dims.largeur));
        plateformes.push(solHorizontal(yTopFosse, 600, 900));

        const obstacles = [];
        // Plateforme mobile horizontale (center y, amplitude 130)
        obstacles.push(mobileH(750, yTopSolHaut - 60, { amplitude: 130, periode: 3000 }));

        for (const xPieu of [650, 750, 850]) {
            obstacles.push(pieu(xPieu, yTopFosse - 9, 'sol'));
        }

        const portes = {};
        for (const dir of portesActives) {
            const opts = { yTopSol: yTopSolHaut - HAUTEUR_PORTE };
            portes[dir] = portePos(dir, dims, opts);
        }

        return {
            plateformes,
            obstacles,
            portes,
            spawnDefault: { x: 80, y: yTopSolHaut - 20 }
        };
    }
};

// ============================================================
// 🌀 PUITS_SPIRALE — Descente sur 3 positions x (0.25/0.50/0.75) en spirale
// ============================================================
// Compatible : puits, crypte
// Feel : descente immersive avec rotation des appuis (moins routinier que zigzag).
// Reachability : plates w=160 aux x=240/480/720, gap edge-to-edge 80 px.
// Step vert 70. Player passe par 3 positions cycliques.
const puits_spirale = {
    id: 'puits_spirale',
    nom: 'Puits en Spirale',
    dims: { largeur: 960, hauteur: 1080 },
    archetypesCompatibles: ['puits', 'crypte'],
    portesPossibles: ['N', 'S', 'E'],
    generer({ portesActives = ['S'] } = {}) {
        const dims = this.dims;
        const yTopSol = dims.hauteur - HAUTEUR_SOL;       // 1040
        const plateformes = [];

        plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));

        // Spirale sur 3 positions
        const positions = [240, 480, 720];
        let yTop = yTopSol - ECART_VERT_SAFE;
        let idx = 0;
        while (yTop > 130) {
            plateformes.push(plateforme(positions[idx % 3], yTop, 160, 14, false));
            yTop -= ECART_VERT_SAFE;
            idx++;
        }
        // Sommet : plate large pour porte S inversée
        const yTopSommet = yTop;
        plateformes.push(plateforme(dims.largeur / 2, yTopSommet, 320, 18, true));

        const portes = {};
        for (const dir of portesActives) {
            let opts = {};
            if (dir === 'S') opts = { yTopS: yTopSommet - HAUTEUR_PORTE, interieurS: 'bas' };
            else if (dir === 'N') opts = { yTopN: yTopSommet - HAUTEUR_PORTE };
            portes[dir] = portePos(dir, dims, opts);
        }

        return {
            plateformes,
            obstacles: [],
            portes,
            spawnDefault: { x: dims.largeur / 2, y: yTopSommet - 30 }
        };
    }
};

// ============================================================
// 🪜 TOUR_MARCHES — Sol + 6 marches alternées L/R + plate sommet (porte N)
// ============================================================
// Compatible : sanctuaire, hall
// Feel : escalier conventionnel d'un palais, monte vers une plateforme haute.
// Reachability : marches w=140, x=180/320 alternés. Edges touchent à x=250.
// Plate sommet (one-way) recouvre la fin de l'escalier.
const tour_marches = {
    id: 'tour_marches',
    nom: 'Tour aux Marches',
    dims: { largeur: 900, hauteur: 900 },
    archetypesCompatibles: ['sanctuaire', 'hall'],
    portesPossibles: ['E', 'O', 'N'],
    generer({ portesActives = ['E'] } = {}) {
        const dims = this.dims;
        const yTopSol = dims.hauteur - HAUTEUR_SOL;       // 860
        const plateformes = [];

        plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));

        // 6 marches alternées (one-way pour éviter head-bonk avec sommet et soi-même)
        const marches = [
            { x: 180, yTop: 790 },
            { x: 320, yTop: 720 },
            { x: 180, yTop: 650 },
            { x: 320, yTop: 580 },
            { x: 180, yTop: 510 },
            { x: 320, yTop: 440 }
        ];
        for (const m of marches) {
            plateformes.push(plateforme(m.x, m.yTop, 140, 14, true));
        }

        // Plate sommet (one-way) — recouvre les marches en x, supporte porte N
        const yTopSommet = 370;
        plateformes.push(plateforme(dims.largeur / 2, yTopSommet, 500, 18, true));

        const portes = {};
        for (const dir of portesActives) {
            let opts = {};
            if (dir === 'N') opts = { yTopN: yTopSommet - HAUTEUR_PORTE };
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
// 🚪 CHEMINEE_ETROITE — Puits 720 wide, plates miniatures, marges serrées
// ============================================================
// Compatible : puits
// Feel : étranglement vertical claustrophobe ; plus difficile que puits_descente.
// Reachability : plates w=180 aux x=216/504, gap edge-to-edge 108 px.
const cheminee_etroite = {
    id: 'cheminee_etroite',
    nom: 'Cheminée Étroite',
    dims: { largeur: 720, hauteur: 1100 },
    archetypesCompatibles: ['puits'],
    portesPossibles: ['N', 'S', 'E'],
    generer({ portesActives = ['S'] } = {}) {
        const dims = this.dims;
        const yTopSol = dims.hauteur - HAUTEUR_SOL;       // 1060
        const plateformes = [];

        plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));

        // Zigzag étroit
        let yTop = yTopSol - ECART_VERT_SAFE;
        let cote = 0;
        while (yTop > 130) {
            const x = cote === 0 ? dims.largeur * 0.30 : dims.largeur * 0.70;
            plateformes.push(plateforme(x, yTop, 180, 14, false));
            yTop -= ECART_VERT_SAFE;
            cote = 1 - cote;
        }
        // Sommet
        const yTopSommet = yTop;
        plateformes.push(plateforme(dims.largeur / 2, yTopSommet, 280, 18, true));

        const portes = {};
        for (const dir of portesActives) {
            let opts = {};
            if (dir === 'S') opts = { yTopS: yTopSommet - HAUTEUR_PORTE, interieurS: 'bas' };
            else if (dir === 'N') opts = { yTopN: yTopSommet - HAUTEUR_PORTE };
            portes[dir] = portePos(dir, dims, opts);
        }

        return {
            plateformes,
            obstacles: [],
            portes,
            spawnDefault: { x: dims.largeur / 2, y: yTopSommet - 30 }
        };
    }
};

// ============================================================
// 🌋 GOUFFRE_VERTICAL — Sol troué + 2 wall-climbs latéraux + top connector
// ============================================================
// Compatible : puits, pont
// Feel : 2 chemins parallèles d'ascension de chaque côté d'un gouffre central
// avec pieux. Top platform connecte les deux côtés.
// Reachability : wall-climbs one-way à x=200/900, plates w=180 step 70 vert.
// Top platform one-way (centre) à yTop=510, joint les deux wall-climbs.
const gouffre_vertical = {
    id: 'gouffre_vertical',
    nom: 'Gouffre Vertical',
    dims: { largeur: 1100, hauteur: 900 },
    archetypesCompatibles: ['puits', 'pont'],
    portesPossibles: ['E', 'O', 'N'],
    generer({ portesActives = ['E', 'O'] } = {}) {
        const dims = this.dims;
        const yTopSol = dims.hauteur - HAUTEUR_SOL;       // 860
        const yTopFosse = 880;
        const plateformes = [];

        // Sol gauche / fosse centrale / sol droit
        plateformes.push(solHorizontal(yTopSol, 0, 350));
        plateformes.push(solHorizontal(yTopFosse, 350, 750, 20));
        plateformes.push(solHorizontal(yTopSol, 750, dims.largeur));

        // 2 wall-climbs latéraux (one-way pour drop-through)
        for (const yTop of [790, 720, 650, 580]) {
            plateformes.push(plateforme(200, yTop, 180, 14, true));
            plateformes.push(plateforme(900, yTop, 180, 14, true));
        }

        // Top connector (joint les deux côtés)
        const yTopTop = 510;
        plateformes.push(plateforme(dims.largeur / 2, yTopTop, 800, 16, true));

        // 3 pieux dans la fosse
        const obstacles = [];
        for (const xPieu of [450, 550, 650]) {
            obstacles.push(pieu(xPieu, yTopFosse - 9, 'sol'));
        }

        const portes = {};
        for (const dir of portesActives) {
            let opts = {};
            if (dir === 'N') opts = { yTopN: yTopTop - HAUTEUR_PORTE };
            portes[dir] = portePos(dir, dims, opts);
        }

        return {
            plateformes,
            obstacles,
            portes,
            spawnDefault: { x: 80, y: yTopSol - 20 }
        };
    }
};

// ============================================================
// 💧 CASCADE_DROITE — Plates one-way stackées à droite + ressort d'urgence
// ============================================================
// Compatible : puits
// Feel : cascade d'appuis sur un seul côté, le ressort propulse vers le milieu.
// Reachability : plates stackées x=720 (range 620-820), 70 vert chacune.
// Ressort à x=300 boost player ~190 px → atteint plate au-dessus.
const cascade_droite = {
    id: 'cascade_droite',
    nom: 'Cascade Droite',
    dims: { largeur: 960, hauteur: 1000 },
    archetypesCompatibles: ['puits'],
    portesPossibles: ['S', 'N', 'E'],
    generer({ portesActives = ['S'] } = {}) {
        const dims = this.dims;
        const yTopSol = dims.hauteur - HAUTEUR_SOL;       // 960
        const plateformes = [];

        plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));

        // Plates stackées à droite (one-way, drop-through depuis le haut)
        const xCascade = 720;
        let yTop = yTopSol - ECART_VERT_SAFE;
        while (yTop > 130) {
            plateformes.push(plateforme(xCascade, yTop, 200, 14, true));
            yTop -= ECART_VERT_SAFE;
        }
        // Sommet centré pour porte S
        const yTopSommet = yTop;
        plateformes.push(plateforme(dims.largeur / 2, yTopSommet, 320, 18, true));

        const obstacles = [ressort(300, yTopSol - 7)];

        const portes = {};
        for (const dir of portesActives) {
            let opts = {};
            if (dir === 'S') opts = { yTopS: yTopSommet - HAUTEUR_PORTE, interieurS: 'bas' };
            else if (dir === 'N') opts = { yTopN: yTopSommet - HAUTEUR_PORTE };
            portes[dir] = portePos(dir, dims, opts);
        }

        return {
            plateformes,
            obstacles,
            portes,
            spawnDefault: { x: dims.largeur / 2, y: yTopSommet - 30 }
        };
    }
};

// ============================================================
// 🏰 MEZZANINE_HAUTE — Sol bas + tour latérale étroite + mezzanine très haute
// ============================================================
// Compatible : sanctuaire, hall
// Feel : sol = combat ; mezzanine = passage altier. Belle hauteur sous plafond.
// Reachability : tour à x=200 (7 paliers one-way, sol-70 à sol-510), puis jump
// 90 vert vers mezzanine large (sol-580).
const mezzanine_haute = {
    id: 'mezzanine_haute',
    nom: 'Mezzanine Haute',
    dims: { largeur: 1500, hauteur: 900 },
    archetypesCompatibles: ['sanctuaire', 'hall'],
    portesPossibles: ['E', 'O', 'N'],
    generer({ portesActives = ['E'] } = {}) {
        const dims = this.dims;
        const yTopSol = dims.hauteur - HAUTEUR_SOL;       // 860
        const plateformes = [];

        plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));

        // Tour gauche : plates one-way stackées
        let yTop = yTopSol - 70;
        while (yTop > 350) {
            plateformes.push(plateforme(200, yTop, 200, 14, true));
            yTop -= ECART_VERT_SAFE;
        }
        // Mezzanine : plate large à yTop=280 (90 au-dessus du dernier palier 370)
        const yTopMezz = 280;
        plateformes.push(plateforme(750, yTopMezz, 900, 16, true));

        const portes = {};
        for (const dir of portesActives) {
            let opts = {};
            if (dir === 'N') opts = { yTopN: yTopMezz - HAUTEUR_PORTE };
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
// 🏛 PALAIS_ETAGES — 3 niveaux empilés (sol/mid/haut) + escaliers d'accès
// ============================================================
// Compatible : sanctuaire, hall
// Feel : palais sur 3 étages, le combat se déroule à tous les niveaux.
// Reachability : escalier gauche (2 plates) sol → mid ; escalier droit (2 plates)
// mid → haut. Mid et haut one-way pour drop-through libre.
const palais_etages = {
    id: 'palais_etages',
    nom: 'Palais à Trois Étages',
    dims: { largeur: 1400, hauteur: 900 },
    archetypesCompatibles: ['sanctuaire', 'hall'],
    portesPossibles: ['E', 'O', 'N'],
    generer({ portesActives = ['E'] } = {}) {
        const dims = this.dims;
        const yTopSol = dims.hauteur - HAUTEUR_SOL;       // 860
        const plateformes = [];

        plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));

        // Escalier gauche (sol → mid)
        plateformes.push(plateforme(100, 790, 140, 14, true));
        plateformes.push(plateforme(240, 720, 140, 14, true));

        // Mid floor (one-way pour drop-through)
        const yTopMid = 640;
        plateformes.push(plateforme(700, yTopMid, 800, 16, true));

        // Escalier droit (mid → haut)
        plateformes.push(plateforme(1160, 570, 140, 14, true));
        plateformes.push(plateforme(1280, 500, 140, 14, true));

        // Haut floor (one-way)
        const yTopHaut = 420;
        plateformes.push(plateforme(700, yTopHaut, 800, 16, true));

        const portes = {};
        for (const dir of portesActives) {
            let opts = {};
            if (dir === 'N') opts = { yTopN: yTopHaut - HAUTEUR_PORTE };
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
// 🔒 DONJON_CELLULES — Sol + escalier + mid floor cloisonné par 2 murs internes
// ============================================================
// Compatible : crypte, arene
// Feel : prison/donjon, le mid floor est divisé en cellules par 2 murs courts.
// Reachability : escalier gauche (2 plates) sol → mid (one-way pour drop) ;
// sur le mid, 2 murs 24×80 à sauter (jump apex 96 → 16 marge).
const donjon_cellules = {
    id: 'donjon_cellules',
    nom: 'Donjon aux Cellules',
    dims: { largeur: 1400, hauteur: 900 },
    archetypesCompatibles: ['crypte', 'arene'],
    portesPossibles: ['E', 'O'],
    generer({ portesActives = ['E'] } = {}) {
        const dims = this.dims;
        const yTopSol = dims.hauteur - HAUTEUR_SOL;       // 860
        const plateformes = [];

        plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));

        // Escalier gauche d'accès au mid
        plateformes.push(plateforme(80, 790, 120, 14, true));
        plateformes.push(plateforme(200, 720, 120, 14, true));

        // Mid floor (one-way pour drop-through)
        const yTopMid = 640;
        plateformes.push(plateforme(700, yTopMid, 1100, 16, true));

        // 2 murs internes sur le mid (cellules), 24×80, jumpables
        for (const xMur of [500, 900]) {
            plateformes.push(plateforme(xMur, yTopMid - 80, 24, 80, false));
        }

        const portes = {};
        for (const dir of portesActives) {
            portes[dir] = portePos(dir, dims);
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
// 🌀 ARENE_MONTEE — Spirale ascendante de 10 plates, sommet centré
// ============================================================
// Compatible : arene, hall
// Feel : combat avec montée progressive en spirale, sommet panoramique.
// Reachability : 10 plates one-way en spirale, step 70 vert, gap horiz ≤ 150
// (avec overlap aux x adjacents → traversée fluide).
const arene_montee = {
    id: 'arene_montee',
    nom: 'Arène en Montée',
    dims: { largeur: 1400, hauteur: 1000 },
    archetypesCompatibles: ['arene', 'hall'],
    portesPossibles: ['E', 'O', 'N'],
    generer({ portesActives = ['E'] } = {}) {
        const dims = this.dims;
        const yTopSol = dims.hauteur - HAUTEUR_SOL;       // 960
        const plateformes = [];

        plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));

        // Spirale de 10 plates ascendantes (one-way pour drop-through)
        const stairs = [
            { x: 200,  yTop: 890 },
            { x: 350,  yTop: 820 },
            { x: 500,  yTop: 750 },
            { x: 700,  yTop: 680 },
            { x: 900,  yTop: 610 },
            { x: 1050, yTop: 540 },
            { x: 1200, yTop: 470 },
            { x: 1050, yTop: 400 },
            { x: 900,  yTop: 330 },
            { x: 700,  yTop: 260 }
        ];
        for (const s of stairs) {
            plateformes.push(plateforme(s.x, s.yTop, 180, 14, true));
        }

        const portes = {};
        for (const dir of portesActives) {
            let opts = {};
            if (dir === 'N') opts = { yTopN: 260 - HAUTEUR_PORTE };
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

// ════════════════════════════════════════════════════════════
// BOSS ARENAS — 1 unique par étage (1..10).
// Architecture progresse en complexité, thème suit le biome.
// archetypesCompatibles: [] → ne fuient JAMAIS dans le pool main.
// Sélection via BOSS_ARENA_PAR_ETAGE (utilisée par EtageGen pour la salle BOSS).
// ════════════════════════════════════════════════════════════

// ─── Étage 1 (Ruines basses) — Sobre, 2 colonnes brisées ───
const arene_boss_ruines_1 = {
    id: 'arene_boss_ruines_1',
    nom: 'Sanctuaire en Ruines',
    dims: { largeur: 1600, hauteur: 720 },
    archetypesCompatibles: [],
    portesPossibles: ['E', 'O'],
    generer({ portesActives = ['E', 'O'] } = {}) {
        const dims = this.dims;
        const yTopSol = dims.hauteur - HAUTEUR_SOL;
        const plateformes = [];
        plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));
        // 2 colonnes brisées (couvert minimal)
        plateformes.push(plateforme(450, yTopSol - 60, 32, 60, false));
        plateformes.push(plateforme(1150, yTopSol - 60, 32, 60, false));
        const portes = {};
        for (const dir of portesActives) portes[dir] = portePos(dir, dims);
        return { plateformes, obstacles: [], portes, spawnDefault: { x: 80, y: yTopSol - 20 } };
    }
};

// ─── Étage 2 (Ruines basses) — Corniches asymétriques + puits étroit ───
const arene_boss_ruines_2 = {
    id: 'arene_boss_ruines_2',
    nom: 'Sanctuaire Fracturé',
    dims: { largeur: 1600, hauteur: 720 },
    archetypesCompatibles: [],
    portesPossibles: ['E', 'O'],
    generer({ portesActives = ['E', 'O'] } = {}) {
        const dims = this.dims;
        const yTopSol = dims.hauteur - HAUTEUR_SOL;
        const yTopFosse = 700;
        const plateformes = [];
        // Sol avec petit puits central (100 px de large, franchissable d'un saut)
        plateformes.push(solHorizontal(yTopSol, 0, 750));
        plateformes.push(solHorizontal(yTopFosse, 750, 850, 20));
        plateformes.push(solHorizontal(yTopSol, 850, dims.largeur));
        // Corniches asymétriques (one-way)
        plateformes.push(plateforme(300, yTopSol - 80, 400, 14, true));
        plateformes.push(plateforme(1300, yTopSol - 80, 200, 14, true));
        // 2 pieux dans le puits
        const obstacles = [];
        for (const xPieu of [780, 820]) obstacles.push(pieu(xPieu, yTopFosse - 9, 'sol'));
        const portes = {};
        for (const dir of portesActives) portes[dir] = portePos(dir, dims);
        return { plateformes, obstacles, portes, spawnDefault: { x: 80, y: yTopSol - 20 } };
    }
};

// ─── Étage 3 (Halls Cendrés) — Estrade centrale + 2 corniches ───
const arene_boss_halls_3 = {
    id: 'arene_boss_halls_3',
    nom: 'Salle des Échos',
    dims: { largeur: 1600, hauteur: 720 },
    archetypesCompatibles: [],
    portesPossibles: ['E', 'O'],
    generer({ portesActives = ['E', 'O'] } = {}) {
        const dims = this.dims;
        const yTopSol = dims.hauteur - HAUTEUR_SOL;
        const plateformes = [];
        plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));
        // Estrade centrale solide
        plateformes.push(plateforme(800, yTopSol - 80, 320, 16, false));
        // 2 corniches latérales one-way
        plateformes.push(plateforme(280, yTopSol - 70, 240, 14, true));
        plateformes.push(plateforme(1320, yTopSol - 70, 240, 14, true));
        const portes = {};
        for (const dir of portesActives) portes[dir] = portePos(dir, dims);
        return { plateformes, obstacles: [], portes, spawnDefault: { x: 80, y: yTopSol - 20 } };
    }
};

// ─── Étage 4 (Halls Cendrés) — Gouffre central + 2 ponts asymétriques ───
const arene_boss_halls_4 = {
    id: 'arene_boss_halls_4',
    nom: 'Pont des Cendres',
    dims: { largeur: 1700, hauteur: 720 },
    archetypesCompatibles: [],
    portesPossibles: ['E', 'O'],
    generer({ portesActives = ['E', 'O'] } = {}) {
        const dims = this.dims;
        const yTopSol = dims.hauteur - HAUTEUR_SOL;
        const yTopFosse = 700;
        const plateformes = [];
        plateformes.push(solHorizontal(yTopSol, 0, 600));
        plateformes.push(solHorizontal(yTopFosse, 600, 1100, 20));
        plateformes.push(solHorizontal(yTopSol, 1100, dims.largeur));
        // 2 ponts asymétriques au-dessus du gouffre
        plateformes.push(plateforme(750, yTopSol - 100, 300, 14, true));
        plateformes.push(plateforme(1000, yTopSol - 180, 250, 14, true));
        // 5 pieux dans le gouffre
        const obstacles = [];
        for (const xPieu of [680, 760, 840, 920, 1020]) obstacles.push(pieu(xPieu, yTopFosse - 9, 'sol'));
        const portes = {};
        for (const dir of portesActives) portes[dir] = portePos(dir, dims);
        return { plateformes, obstacles, portes, spawnDefault: { x: 80, y: yTopSol - 20 } };
    }
};

// ─── Étage 5 (Cristaux Glacés) — Cristaux saillants (pieux) en colonnes ───
const arene_boss_cristaux_5 = {
    id: 'arene_boss_cristaux_5',
    nom: 'Caverne de Cristal',
    dims: { largeur: 1700, hauteur: 720 },
    archetypesCompatibles: [],
    portesPossibles: ['E', 'O'],
    generer({ portesActives = ['E', 'O'] } = {}) {
        const dims = this.dims;
        const yTopSol = dims.hauteur - HAUTEUR_SOL;
        const plateformes = [];
        plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));
        // 2 corniches latérales
        plateformes.push(plateforme(280, yTopSol - 80, 220, 14, true));
        plateformes.push(plateforme(1420, yTopSol - 80, 220, 14, true));
        // 6 cristaux saillants espacés
        const obstacles = [];
        for (const xPieu of [550, 720, 850, 950, 1080, 1250]) obstacles.push(pieu(xPieu, yTopSol - 9, 'sol'));
        const portes = {};
        for (const dir of portesActives) portes[dir] = portePos(dir, dims);
        return { plateformes, obstacles, portes, spawnDefault: { x: 80, y: yTopSol - 20 } };
    }
};

// ─── Étage 6 (Cristaux Glacés) — 4 îlots fragmentés + 3 plates bypass ───
const arene_boss_cristaux_6 = {
    id: 'arene_boss_cristaux_6',
    nom: 'Sanctuaire Brisé',
    dims: { largeur: 1700, hauteur: 800 },
    archetypesCompatibles: [],
    portesPossibles: ['E', 'O'],
    generer({ portesActives = ['E', 'O'] } = {}) {
        const dims = this.dims;
        const yTopSol = 680;
        const yTopFosse = 760;
        const plateformes = [];
        // 4 îlots de sol
        plateformes.push(solHorizontal(yTopSol, 0, 350));
        plateformes.push(solHorizontal(yTopSol, 500, 850));
        plateformes.push(solHorizontal(yTopSol, 1000, 1350));
        plateformes.push(solHorizontal(yTopSol, 1500, dims.largeur));
        // 3 fosses entre îlots
        plateformes.push(solHorizontal(yTopFosse, 350, 500, 40));
        plateformes.push(solHorizontal(yTopFosse, 850, 1000, 40));
        plateformes.push(solHorizontal(yTopFosse, 1350, 1500, 40));
        // 3 plates bypass au-dessus des fosses
        plateformes.push(plateforme(420, yTopSol - 80, 180, 14, true));
        plateformes.push(plateforme(920, yTopSol - 80, 180, 14, true));
        plateformes.push(plateforme(1420, yTopSol - 80, 180, 14, true));
        // Pieux dans chaque fosse
        const obstacles = [];
        for (const xPieu of [380, 420, 470, 880, 920, 960, 1380, 1420, 1470]) {
            obstacles.push(pieu(xPieu, yTopFosse - 9, 'sol'));
        }
        const portes = {};
        for (const dir of portesActives) {
            const opts = { yTopSol: yTopSol - HAUTEUR_PORTE };
            portes[dir] = portePos(dir, dims, opts);
        }
        return { plateformes, obstacles, portes, spawnDefault: { x: 80, y: yTopSol - 20 } };
    }
};

// ─── Étage 7 (Voile Inversé) — Sols minimaux + 6 plates flottantes asymétriques ───
const arene_boss_voile_7 = {
    id: 'arene_boss_voile_7',
    nom: 'Voile Suspendu',
    dims: { largeur: 1700, hauteur: 800 },
    archetypesCompatibles: [],
    portesPossibles: ['E', 'O'],
    generer({ portesActives = ['E', 'O'] } = {}) {
        const dims = this.dims;
        const yTopSol = 680;
        const yTopFosse = 770;
        const plateformes = [];
        // Petits sols aux extrémités
        plateformes.push(solHorizontal(yTopSol, 0, 280));
        plateformes.push(solHorizontal(yTopSol, 1420, dims.largeur));
        // Fosse centrale longue
        plateformes.push(solHorizontal(yTopFosse, 280, 1420, 30));
        // 6 plates flottantes (max 60 vert variation, gap horiz 20-40)
        const flottantes = [
            { x: 380,  yTop: 600 },
            { x: 600,  yTop: 540 },
            { x: 800,  yTop: 580 },
            { x: 1000, yTop: 520 },
            { x: 1200, yTop: 580 },
            { x: 1400, yTop: 520 }
        ];
        for (const f of flottantes) plateformes.push(plateforme(f.x, f.yTop, 180, 14, true));
        // 4 pieux fosse
        const obstacles = [];
        for (const xPieu of [400, 700, 1000, 1300]) obstacles.push(pieu(xPieu, yTopFosse - 9, 'sol'));
        const portes = {};
        for (const dir of portesActives) {
            const opts = { yTopSol: yTopSol - HAUTEUR_PORTE };
            portes[dir] = portePos(dir, dims, opts);
        }
        return { plateformes, obstacles, portes, spawnDefault: { x: 80, y: yTopSol - 20 } };
    }
};

// ─── Étage 8 (Voile Inversé) — Sol HAUT inversé + gouffre central + ressorts ───
const arene_boss_voile_8 = {
    id: 'arene_boss_voile_8',
    nom: 'Voile Inversé',
    dims: { largeur: 1700, hauteur: 800 },
    archetypesCompatibles: [],
    portesPossibles: ['E', 'O'],
    generer({ portesActives = ['E', 'O'] } = {}) {
        const dims = this.dims;
        const yTopSol = 600;     // sol "haut" inversé
        const yTopFosse = 760;
        const plateformes = [];
        plateformes.push(solHorizontal(yTopSol, 0, 380));
        plateformes.push(solHorizontal(yTopSol, 1320, dims.largeur));
        plateformes.push(solHorizontal(yTopFosse, 380, 1320));
        // 3 plates asym pour traverser (climbs 20 + descents 60)
        plateformes.push(plateforme(550, 580, 220, 14, true));
        plateformes.push(plateforme(850, 520, 220, 14, true));
        plateformes.push(plateforme(1150, 580, 220, 14, true));
        const obstacles = [];
        for (const xPieu of [450, 600, 750, 900, 1050, 1250]) obstacles.push(pieu(xPieu, yTopFosse - 9, 'sol'));
        // Ressorts d'évacuation près des sols haut
        obstacles.push(ressort(420, yTopFosse - 7));
        obstacles.push(ressort(1280, yTopFosse - 7));
        const portes = {};
        for (const dir of portesActives) {
            const opts = { yTopSol: yTopSol - HAUTEUR_PORTE };
            portes[dir] = portePos(dir, dims, opts);
        }
        return { plateformes, obstacles, portes, spawnDefault: { x: 80, y: yTopSol - 20 } };
    }
};

// ─── Étage 9 (Cœur du Reflux) — 3 niveaux + plate mobile + pieux ───
const arene_boss_reflux_9 = {
    id: 'arene_boss_reflux_9',
    nom: 'Cœur Battant',
    dims: { largeur: 1700, hauteur: 900 },
    archetypesCompatibles: [],
    portesPossibles: ['E', 'O'],
    generer({ portesActives = ['E', 'O'] } = {}) {
        const dims = this.dims;
        const yTopSol = dims.hauteur - HAUTEUR_SOL;       // 860
        const plateformes = [];
        plateformes.push(solHorizontal(yTopSol, 0, dims.largeur));
        // 4 paliers étagés (one-way, escalade dépendant trajectoire)
        plateformes.push(plateforme(300, yTopSol - 70,  400, 14, true));
        plateformes.push(plateforme(700, yTopSol - 140, 400, 14, true));
        plateformes.push(plateforme(1100, yTopSol - 70, 400, 14, true));
        // Sommet centré (one-way)
        plateformes.push(plateforme(dims.largeur / 2, yTopSol - 220, 500, 16, true));
        const obstacles = [];
        for (const xPieu of [550, 850, 1150]) obstacles.push(pieu(xPieu, yTopSol - 9, 'sol'));
        obstacles.push(mobileH(850, yTopSol - 200, { amplitude: 200, periode: 3000 }));
        const portes = {};
        for (const dir of portesActives) portes[dir] = portePos(dir, dims);
        return { plateformes, obstacles, portes, spawnDefault: { x: 80, y: yTopSol - 20 } };
    }
};

// ─── Étage 10 (Cœur du Reflux) — Chaos final : multi-niveaux + obstacles ───
const arene_boss_reflux_10 = {
    id: 'arene_boss_reflux_10',
    nom: 'Origine du Reflux',
    dims: { largeur: 1800, hauteur: 1000 },
    archetypesCompatibles: [],
    portesPossibles: ['E', 'O'],
    generer({ portesActives = ['E', 'O'] } = {}) {
        const dims = this.dims;
        const yTopSol = 960;
        const yTopFosse = 970;
        const plateformes = [];
        // Sol fragmenté (3 îlots)
        plateformes.push(solHorizontal(yTopSol, 0, 400));
        plateformes.push(solHorizontal(yTopSol, 600, 1200));
        plateformes.push(solHorizontal(yTopSol, 1400, dims.largeur));
        // Petites fosses entre
        plateformes.push(solHorizontal(yTopFosse, 400, 600, 30));
        plateformes.push(solHorizontal(yTopFosse, 1200, 1400, 30));
        // Paliers mid asymétriques (one-way)
        plateformes.push(plateforme(300, yTopSol - 90, 400, 14, true));   // climb 90 ✓
        plateformes.push(plateforme(900, yTopSol - 160, 350, 14, true));
        plateformes.push(plateforme(1500, yTopSol - 90, 400, 14, true));
        // Sommet centré
        plateformes.push(plateforme(dims.largeur / 2, yTopSol - 250, 600, 18, true));
        const obstacles = [];
        for (const xPieu of [500, 700, 900, 1100, 1300]) obstacles.push(pieu(xPieu, yTopSol - 9, 'sol'));
        for (const xPieu of [450, 550, 1250, 1350]) obstacles.push(pieu(xPieu, yTopFosse - 9, 'sol'));
        obstacles.push(ressort(500, yTopFosse - 7));
        obstacles.push(ressort(1300, yTopFosse - 7));
        obstacles.push(mobileH(900, yTopSol - 200, { amplitude: 220, periode: 2800 }));
        const portes = {};
        for (const dir of portesActives) portes[dir] = portePos(dir, dims);
        return { plateformes, obstacles, portes, spawnDefault: { x: 80, y: yTopSol - 20 } };
    }
};

/**
 * Mapping étage → topographie boss dédiée.
 * Utilisé par EtageGen pour la salle BOSS.
 */
export const BOSS_ARENA_PAR_ETAGE = {
    1:  arene_boss_ruines_1,
    2:  arene_boss_ruines_2,
    3:  arene_boss_halls_3,
    4:  arene_boss_halls_4,
    5:  arene_boss_cristaux_5,
    6:  arene_boss_cristaux_6,
    7:  arene_boss_voile_7,
    8:  arene_boss_voile_8,
    9:  arene_boss_reflux_9,
    10: arene_boss_reflux_10
};

// ============================================================
// CATALOGUE
// ============================================================
export const TOPOGRAPHIES = {
    arene_ouverte,
    puits_descente,
    labyrinthe_murs,
    arene_estrade,
    crypte_dalles,
    arene_anneau,
    pont_etroit,
    salle_pieux_sol,
    arene_fragmentee,
    aile_dechiree,
    puits_spirale,
    tour_marches,
    cheminee_etroite,
    gouffre_vertical,
    cascade_droite,
    mezzanine_haute,
    palais_etages,
    donjon_cellules,
    arene_montee,
    // Boss arenas — référencées via BOSS_ARENA_PAR_ETAGE, listées ici uniquement
    // pour que TOPOGRAPHIES_LABELS expose leur nom au HUD. compat=[] empêche
    // toute fuite dans le pool main.
    arene_boss_ruines_1,
    arene_boss_ruines_2,
    arene_boss_halls_3,
    arene_boss_halls_4,
    arene_boss_cristaux_5,
    arene_boss_cristaux_6,
    arene_boss_voile_7,
    arene_boss_voile_8,
    arene_boss_reflux_9,
    arene_boss_reflux_10
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
