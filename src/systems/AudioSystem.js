// AudioSystem — moteur musical procédural (singleton via registry Phaser).
//
// Web Audio nécessite un user gesture pour démarrer le contexte → on
// instancie cette classe librement, mais `demarrer()` ne doit être appelée
// que dans un handler de clic / keydown. MenuScene le fait à la première
// interaction utilisateur.
//
// Crossfade entre patches : chaque patch a son propre Tone.Gain de sortie
// que l'on ramp linéairement sur 1.5s. L'ancien patch est disposé après
// extinction complète.
//
// Volume global : `Tone.Destination.volume` (en dB). Le slider UI travaille
// en 0..1 ; on convertit en dB via 20·log₁₀(v).
//
// Mute : toggle clavier global (touche N) écouté sur `document` — c'est un
// concern système, pas gameplay, donc OK de bypasser InputSystem ici.
//
// Robuste à l'absence de Tone.js : si le CDN n'a pas chargé, tous les
// appels sont no-op (le jeu reste jouable sans son).

import { PATCHES_MUSIQUE } from '../data/musique.js';
import { jouerSfx as _jouerSfx } from '../data/sfx.js';

const STORAGE_VOL  = 'vestige_audio_volume_v1';
const STORAGE_MUTE = 'vestige_audio_mute_v1';
const DUREE_CROSSFADE_S = 1.5;
const REGISTRY_KEY = 'audio_system';

export class AudioSystem {
    constructor(registry) {
        this.registry = registry;

        this.pret = false;            // Tone.start() appelée ?
        this.patchActif = null;       // { gain, demarrer, arreter }
        this.patchActifId = null;     // string ou null
        this._patchEnAttente = null;  // si transition demandée avant demarrer()
        this._listenerN = null;       // handler keydown global

        this.volume = this._chargerVolume();
        this.mute = this._chargerMute();
    }

    estPret() { return this.pret; }
    getVolume() { return this.volume; }
    estMute() { return this.mute; }
    getPatchActif() { return this.patchActifId; }

    /**
     * Démarre le contexte audio (DOIT être appelée depuis un user gesture).
     * Idempotente — appels suivants ignorés.
     * @param {string} patchInitial id du patch à jouer une fois prêt
     */
    async demarrer(patchInitial = 'menu') {
        if (this.pret) return;
        if (typeof Tone === 'undefined') return;
        try {
            await Tone.start();
            Tone.Transport.start();
            this._appliquerVolume();
            this._installerListenerMute();
            this.pret = true;
            const cible = this._patchEnAttente ?? patchInitial;
            this._patchEnAttente = null;
            this.transitionVers(cible);
        } catch (e) {
            console.warn('[AudioSystem] échec démarrage Tone', e);
        }
    }

    /**
     * Bascule vers un autre patch en crossfade. Si `id` === patch actif,
     * no-op. Si pas encore prêt, on mémorise pour démarrer plus tard.
     */
    transitionVers(id) {
        if (!this.pret) {
            this._patchEnAttente = id;
            return;
        }
        if (this.patchActifId === id) return;
        const def = PATCHES_MUSIQUE[id];
        if (!def) {
            console.warn('[AudioSystem] patch inconnu', id);
            return;
        }

        // Tempo : rampe vers le BPM du nouveau patch
        try { Tone.Transport.bpm.rampTo(def.bpm, 0.8); } catch (_) {}

        let nouveau;
        try {
            nouveau = def.build();
            nouveau.demarrer();
            nouveau.gain.gain.value = 0;
            nouveau.gain.gain.linearRampTo(1, DUREE_CROSSFADE_S);
        } catch (e) {
            console.warn('[AudioSystem] échec build patch', id, e);
            return;
        }

        if (this.patchActif) {
            const ancien = this.patchActif;
            try {
                ancien.gain.gain.linearRampTo(0, DUREE_CROSSFADE_S);
                setTimeout(() => {
                    try { ancien.arreter(); } catch (_) {}
                }, DUREE_CROSSFADE_S * 1000 + 100);
            } catch (_) {}
        }

        this.patchActif = nouveau;
        this.patchActifId = id;
    }

    /**
     * Arrête tout (fade out) — typiquement appelé en fin de jeu / FinScene.
     */
    arreterTout() {
        if (!this.pret || !this.patchActif) return;
        const ancien = this.patchActif;
        try {
            ancien.gain.gain.linearRampTo(0, 1.2);
            setTimeout(() => { try { ancien.arreter(); } catch (_) {} }, 1300);
        } catch (_) {}
        this.patchActif = null;
        this.patchActifId = null;
    }

    /**
     * Joue un SFX one-shot. Délègue à `data/sfx.js`. No-op si audio pas
     * démarré ou mute. L'intensité respecte le volume global (les SFX vont
     * à `Tone.Destination` comme la musique).
     */
    jouerSfx(name) {
        if (!this.pret || this.mute) return;
        if (this.volume < 0.001) return;
        _jouerSfx(name);
    }

    setVolume(v) {
        this.volume = Math.max(0, Math.min(1, v));
        this._sauvegarderVolume();
        this._appliquerVolume();
    }

    toggleMute() {
        this.mute = !this.mute;
        try { localStorage.setItem(STORAGE_MUTE, this.mute ? '1' : '0'); } catch (_) {}
        this._appliquerVolume();
        return this.mute;
    }

    // ── Privé ────────────────────────────────────────────────────────────

    _appliquerVolume() {
        if (typeof Tone === 'undefined') return;
        try {
            if (this.mute || this.volume < 0.001) {
                Tone.Destination.mute = true;
            } else {
                Tone.Destination.mute = false;
                const db = 20 * Math.log10(this.volume);
                Tone.Destination.volume.rampTo(db, 0.2);
            }
        } catch (_) {}
    }

    _installerListenerMute() {
        if (this._listenerN) return;
        this._listenerN = (e) => {
            // Ignore si l'utilisateur tape dans un champ texte (futur-proof)
            const t = e.target;
            if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
            if (e.key === 'n' || e.key === 'N') {
                this.toggleMute();
            }
        };
        document.addEventListener('keydown', this._listenerN);
    }

    _chargerVolume() {
        try {
            const s = localStorage.getItem(STORAGE_VOL);
            if (s === null) return 0.55;
            const v = parseFloat(s);
            return isNaN(v) ? 0.55 : Math.max(0, Math.min(1, v));
        } catch (_) { return 0.55; }
    }
    _sauvegarderVolume() {
        try { localStorage.setItem(STORAGE_VOL, String(this.volume)); } catch (_) {}
    }
    _chargerMute() {
        try { return localStorage.getItem(STORAGE_MUTE) === '1'; } catch (_) { return false; }
    }
}

/**
 * Récupère (ou crée) le singleton AudioSystem stocké dans le registry global.
 * Le registry survit aux scene.restart() donc le système persiste sur tout le run.
 */
export function getAudioSystem(scene) {
    let sys = scene.registry.get(REGISTRY_KEY);
    if (!sys) {
        sys = new AudioSystem(scene.registry);
        scene.registry.set(REGISTRY_KEY, sys);
    }
    return sys;
}
