// SFX procéduraux — petits synths Tone.js déclenchés en one-shot.
//
// Architecture : un cache module-level lazy-initialisé à la première
// demande. Chaque SFX est un (ou deux) synth(s) re-trigger-able(s).
// On ne dispose JAMAIS pendant la session — Tone.js gère bien les retriggers
// rapides sur un même synth (le précédent envelope se coupe).
//
// Routing : tous vers `Tone.Destination` → respectent volume + mute globaux
// pilotés par AudioSystem.
//
// Robuste à l'absence de Tone (CDN non chargé) : `jouerSfx` est no-op.

let cache = null;

function getCache() {
    if (cache) return cache;
    if (typeof Tone === 'undefined') return null;
    const Tn = Tone;

    cache = {
        // Parry — clang métallique brillant (feedback "tu as paré")
        parry: new Tn.MetalSynth({
            frequency: 800,
            envelope: { attack: 0.001, decay: 0.22, release: 0.12 },
            harmonicity: 4.1,
            modulationIndex: 18,
            resonance: 5500,
            octaves: 1
        }).toDestination(),

        // Hit (joueur touche un ennemi) — drum mat + pic de bruit pink
        hit: new Tn.MembraneSynth({
            pitchDecay: 0.025, octaves: 3,
            envelope: { attack: 0.001, decay: 0.16, sustain: 0, release: 0.06 }
        }).toDestination(),
        hitNoise: new Tn.NoiseSynth({
            noise: { type: 'pink' },
            envelope: { attack: 0.001, decay: 0.07, sustain: 0, release: 0.04 }
        }).toDestination(),

        // Hurt (joueur touché) — bass saw grondante + souffle brown
        hurt: new Tn.MonoSynth({
            oscillator: { type: 'sawtooth' },
            envelope: { attack: 0.005, decay: 0.22, sustain: 0, release: 0.18 },
            filterEnvelope: {
                baseFrequency: 220, octaves: 1.2,
                attack: 0.005, decay: 0.12, sustain: 0, release: 0.1
            }
        }).toDestination(),
        hurtNoise: new Tn.NoiseSynth({
            noise: { type: 'brown' },
            envelope: { attack: 0.001, decay: 0.14, sustain: 0, release: 0.1 }
        }).toDestination(),

        // Jump — bleep montant léger (deux notes en succession rapide)
        jump: new Tn.Synth({
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.003, decay: 0.06, sustain: 0, release: 0.04 }
        }).toDestination(),

        // Land — thud court grave
        land: new Tn.MembraneSynth({
            pitchDecay: 0.06, octaves: 4,
            envelope: { attack: 0.001, decay: 0.14, sustain: 0, release: 0.06 }
        }).toDestination(),
    };

    // Niveaux relatifs (en dB). Réglés à l'oreille pour s'intégrer dans le mix
    // de la musique sans dominer ni se faire enterrer.
    cache.parry.volume.value     = -10;
    cache.hit.volume.value       = -2;
    cache.hitNoise.volume.value  = -14;
    cache.hurt.volume.value      = -10;
    cache.hurtNoise.volume.value = -14;
    cache.jump.volume.value      = -26;
    cache.land.volume.value      = -12;

    return cache;
}

/**
 * Joue un SFX par nom. No-op si Tone absent ou nom inconnu.
 * AudioSystem délègue ici via `jouerSfx(name)`.
 */
export function jouerSfx(name) {
    const c = getCache();
    if (!c) return;
    try {
        switch (name) {
            case 'parry':
                // Légère variation de fréquence pour éviter la monotonie sur
                // les enchaînements rapides
                c.parry.frequency.value = 700 + Math.random() * 200;
                c.parry.triggerAttackRelease('16n');
                break;

            case 'hit':
                c.hit.triggerAttackRelease('A2', '16n');
                c.hitNoise.triggerAttackRelease('16n');
                break;

            case 'hurt':
                c.hurt.triggerAttackRelease('E2', '8n');
                c.hurtNoise.triggerAttackRelease('8n');
                break;

            case 'jump':
                c.jump.triggerAttackRelease('A4', '32n');
                // Deuxième note plus haute, 50 ms plus tard → effet "boing" montant
                setTimeout(() => {
                    try { c.jump.triggerAttackRelease('E5', '32n'); } catch (_) {}
                }, 50);
                break;

            case 'land':
                c.land.triggerAttackRelease('C2', '16n');
                break;
        }
    } catch (e) {
        // SFX raté : ne jamais casser le jeu
        console.warn('[SFX] échec', name, e);
    }
}
