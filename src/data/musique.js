// Musique procédurale — 5 patches Tone.js générés à la volée.
//
// Cohérent avec la DA "100 % primitives" : pas un seul asset audio chargé,
// tout est synthétisé en temps réel via Web Audio (oscillateurs + effets).
//
// Chaque patch expose la même interface :
//   {
//     bpm: number,                            // tempo cible (Tone.Transport.bpm rampera dessus)
//     build(): { gain, demarrer(), arreter() }
//       gain      : Tone.Gain branché sur la destination — l'AudioSystem
//                   ramp ce gain pour le crossfade (0 ↔ 1)
//       demarrer(): démarre les loops/séquences (Transport doit être lancé)
//       arreter() : stoppe et dispose TOUT (loops + synths + effets + gain)
//   }
//
// Tone.js est chargé via CDN dans index.html → présent comme global `Tone`.
//
// Direction sonore (cf. plan dans CLAUDE.md / commits) :
//   - menu    : Cmin9 doux, chimes éparses, mood "mémoire qui dort"
//   - cite    : Cmaj7 → Fmaj7 → G7 → Am7, harpe arpegée, mood "atelier doré"
//   - present : drone D1+A1, souffle filtré, percussions sourdes, mood "ruines hantées"
//   - combat  : sub bass pulsé Dm, kicks tribales, drone aigu, mood "tension"
//   - boss    : combat ++ + cuivres FM motif D-C-Bb-A descendant + chœur Dm

const T = () => (typeof Tone !== 'undefined' ? Tone : null);

// ────────────────────────────────────────────────────────────────────────────
// MENU — drone contemplatif, chimes lointains
// ────────────────────────────────────────────────────────────────────────────
function buildMenu() {
    const Tn = T();
    const gain = new Tn.Gain(0).toDestination();
    const reverb = new Tn.Reverb({ decay: 9, wet: 0.7 }).connect(gain);
    const filtre = new Tn.Filter(2200, 'lowpass').connect(reverb);

    const pad = new Tn.PolySynth(Tn.AMSynth, {
        envelope: { attack: 4, decay: 1, sustain: 0.9, release: 6 },
        modulationEnvelope: { attack: 5, decay: 1, sustain: 0.8, release: 6 },
        oscillator: { type: 'sine' },
        modulation: { type: 'sine' },
        volume: -10
    }).connect(filtre);

    const chimes = new Tn.PluckSynth({
        attackNoise: 0.5, dampening: 4000, resonance: 0.95, release: 4
    }).connect(reverb);
    chimes.volume.value = -16;

    const accords = [
        ['C2', 'Eb3', 'G3', 'Bb3'],   // Cmin9
        ['Ab2', 'C3', 'Eb3', 'G3']    // Abmaj7 (lumière)
    ];
    let acc = 0;
    const loopPad = new Tn.Loop((time) => {
        pad.triggerAttackRelease(accords[acc % accords.length], '2m', time);
        acc++;
    }, '2m');

    const notesChimes = ['Eb5', 'G5', 'Bb5', 'C6', 'D6', 'F5'];
    const loopChimes = new Tn.Loop((time) => {
        if (Math.random() < 0.55) {
            const note = notesChimes[Math.floor(Math.random() * notesChimes.length)];
            chimes.triggerAttackRelease(note, '8n', time);
        }
    }, '2n');

    return {
        gain,
        demarrer() { loopPad.start(0); loopChimes.start('1m'); },
        arreter() {
            loopPad.stop(); loopPad.dispose();
            loopChimes.stop(); loopChimes.dispose();
            pad.releaseAll?.(); pad.dispose();
            chimes.dispose(); filtre.dispose(); reverb.dispose();
            setTimeout(() => gain.dispose(), 50);
        }
    };
}

// ────────────────────────────────────────────────────────────────────────────
// CITÉ MIROIR — pads chauds, arpèges harpe, mood doré paisible
// ────────────────────────────────────────────────────────────────────────────
function buildCite() {
    const Tn = T();
    const gain = new Tn.Gain(0).toDestination();
    const reverb = new Tn.Reverb({ decay: 5, wet: 0.5 }).connect(gain);
    const delay = new Tn.FeedbackDelay({ delayTime: '8n.', feedback: 0.35, wet: 0.3 }).connect(reverb);

    const pad = new Tn.PolySynth(Tn.AMSynth, {
        envelope: { attack: 1.5, decay: 1, sustain: 0.8, release: 4 },
        oscillator: { type: 'triangle' },
        volume: -13
    }).connect(reverb);

    const harpe = new Tn.PluckSynth({
        attackNoise: 0.3, dampening: 6000, resonance: 0.85, release: 2
    }).connect(delay);
    harpe.volume.value = -10;

    const accordsPad = [
        ['C3', 'E3', 'G3', 'B3'],   // Cmaj7
        ['F3', 'A3', 'C4', 'E4'],   // Fmaj7
        ['G3', 'B3', 'D4', 'F4'],   // G7
        ['A2', 'C3', 'E3', 'G3']    // Am7
    ];
    let i = 0;
    const loopPad = new Tn.Loop((time) => {
        pad.triggerAttackRelease(accordsPad[i % accordsPad.length], '1m', time);
        i++;
    }, '1m');

    // Arpège harpe sur l'accord en cours, montant
    const loopHarpe = new Tn.Loop((time) => {
        const idx = (i - 1 + accordsPad.length) % accordsPad.length;
        const a = accordsPad[idx];
        const notes = [a[0], a[2], a[3], Tn.Frequency(a[2]).transpose(12).toNote()];
        notes.forEach((n, k) => {
            harpe.triggerAttackRelease(n, '16n', time + k * 0.18);
        });
    }, '1m');

    return {
        gain,
        demarrer() { loopPad.start(0); loopHarpe.start('2n'); },
        arreter() {
            loopPad.stop(); loopPad.dispose();
            loopHarpe.stop(); loopHarpe.dispose();
            pad.releaseAll?.(); pad.dispose();
            harpe.dispose(); delay.dispose(); reverb.dispose();
            setTimeout(() => gain.dispose(), 50);
        }
    };
}

// ────────────────────────────────────────────────────────────────────────────
// PRÉSENT — drone grave, souffle filtré, percussions lointaines, mood "ruines"
// ────────────────────────────────────────────────────────────────────────────
function buildPresent() {
    const Tn = T();
    const gain = new Tn.Gain(0).toDestination();
    const reverb = new Tn.Reverb({ decay: 7, wet: 0.6 }).connect(gain);

    const drone = new Tn.FMSynth({
        harmonicity: 1.5, modulationIndex: 6,
        envelope: { attack: 6, decay: 1, sustain: 1, release: 8 },
        modulationEnvelope: { attack: 4, decay: 1, sustain: 0.9, release: 4 },
        oscillator: { type: 'sawtooth' },
        modulation: { type: 'sine' },
        volume: -16
    }).connect(reverb);

    const autoFilter = new Tn.AutoFilter({
        frequency: 0.05,           // LFO très lent
        baseFrequency: 200,
        octaves: 3,
        depth: 0.5
    }).connect(reverb);

    const souffle = new Tn.Noise('brown');
    souffle.volume.value = -28;
    souffle.connect(autoFilter);

    const tambour = new Tn.MembraneSynth({
        pitchDecay: 0.1, octaves: 3,
        envelope: { attack: 0.01, decay: 0.6, sustain: 0, release: 0.6 },
        volume: -14
    }).connect(reverb);

    const loopDrone = new Tn.Loop((time) => {
        drone.triggerAttackRelease(['D1', 'A1'], '4m', time);
    }, '4m');

    const loopTambour = new Tn.Loop((time) => {
        if (Math.random() < 0.5) {
            tambour.triggerAttackRelease('D1', '4n', time);
        }
    }, '2m');

    return {
        gain,
        demarrer() {
            souffle.start();
            autoFilter.start();
            loopDrone.start(0);
            loopTambour.start('2n');
        },
        arreter() {
            loopDrone.stop(); loopDrone.dispose();
            loopTambour.stop(); loopTambour.dispose();
            souffle.stop(); souffle.dispose();
            autoFilter.stop(); autoFilter.dispose();
            drone.dispose(); tambour.dispose(); reverb.dispose();
            setTimeout(() => gain.dispose(), 50);
        }
    };
}

// ────────────────────────────────────────────────────────────────────────────
// COMBAT — sub bass pulsé, kicks tribales, drone aigu (tension)
// ────────────────────────────────────────────────────────────────────────────
function buildCombat() {
    const Tn = T();
    const gain = new Tn.Gain(0).toDestination();
    const reverb = new Tn.Reverb({ decay: 3, wet: 0.3 }).connect(gain);

    const subBass = new Tn.MonoSynth({
        oscillator: { type: 'square' },
        filter: { Q: 6, type: 'lowpass', rolloff: -24 },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.2 },
        filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.4, baseFrequency: 80, octaves: 2 },
        volume: -10
    }).connect(reverb);

    const kick = new Tn.MembraneSynth({
        pitchDecay: 0.05, octaves: 5,
        envelope: { attack: 0.005, decay: 0.4, sustain: 0, release: 0.3 },
        volume: -8
    }).connect(reverb);

    const droneAigu = new Tn.AMSynth({
        envelope: { attack: 2, decay: 1, sustain: 1, release: 3 },
        oscillator: { type: 'sawtooth' },
        modulation: { type: 'square' },
        volume: -22
    }).connect(reverb);

    // Pattern bass : D-D-_-A-D-_-F-A (croches)
    const patternBass = ['D2', 'D2', null, 'A1', 'D2', null, 'F2', 'A2'];
    let pas = 0;
    const loopBass = new Tn.Loop((time) => {
        const note = patternBass[pas % patternBass.length];
        if (note) subBass.triggerAttackRelease(note, '8n', time);
        pas++;
    }, '8n');

    // Kicks sur 1 et 3 de chaque mesure
    const loopKick = new Tn.Loop((time) => {
        kick.triggerAttackRelease('D1', '8n', time);
        kick.triggerAttackRelease('D1', '8n', time + Tn.Time('2n').toSeconds());
    }, '1m');

    const loopDrone = new Tn.Loop((time) => {
        droneAigu.triggerAttackRelease('D4', '2m', time);
    }, '2m');

    return {
        gain,
        demarrer() { loopBass.start(0); loopKick.start(0); loopDrone.start('1m'); },
        arreter() {
            loopBass.stop(); loopBass.dispose();
            loopKick.stop(); loopKick.dispose();
            loopDrone.stop(); loopDrone.dispose();
            subBass.dispose(); kick.dispose(); droneAigu.dispose();
            reverb.dispose();
            setTimeout(() => gain.dispose(), 50);
        }
    };
}

// ────────────────────────────────────────────────────────────────────────────
// BOSS — combat ++ + motif cuivres descendant + chœur Dm
// ────────────────────────────────────────────────────────────────────────────
function buildBoss() {
    const Tn = T();
    const gain = new Tn.Gain(0).toDestination();
    const reverb = new Tn.Reverb({ decay: 4, wet: 0.4 }).connect(gain);

    const sub = new Tn.MonoSynth({
        oscillator: { type: 'sawtooth' },
        filter: { Q: 4, type: 'lowpass' },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.7, release: 0.4 },
        filterEnvelope: { baseFrequency: 100, octaves: 3, attack: 0.05, decay: 0.4 },
        volume: -9
    }).connect(reverb);

    const kick = new Tn.MembraneSynth({
        pitchDecay: 0.04, octaves: 6,
        envelope: { attack: 0.005, decay: 0.5, sustain: 0, release: 0.3 },
        volume: -6
    }).connect(reverb);

    const cymbale = new Tn.MetalSynth({
        frequency: 200,
        envelope: { attack: 0.005, decay: 0.3, release: 0.3 },
        harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5
    }).connect(reverb);
    cymbale.volume.value = -28;

    const cuivre = new Tn.FMSynth({
        harmonicity: 2, modulationIndex: 14,
        envelope: { attack: 0.1, decay: 0.5, sustain: 0.5, release: 1 },
        modulationEnvelope: { attack: 0.2, decay: 1, sustain: 0.4, release: 1 },
        oscillator: { type: 'sawtooth' },
        modulation: { type: 'square' },
        volume: -12
    }).connect(reverb);

    const choeur = new Tn.PolySynth(Tn.AMSynth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 1.5, decay: 1, sustain: 0.8, release: 3 },
        volume: -18
    }).connect(reverb);

    const loopSub = new Tn.Loop((time) => {
        sub.triggerAttackRelease('D2', '8n', time);
    }, '4n');

    const loopKick = new Tn.Loop((time) => {
        kick.triggerAttackRelease('D1', '8n', time);
    }, '2n');

    const loopCymbale = new Tn.Loop((time) => {
        if (Math.random() < 0.5) cymbale.triggerAttackRelease('16n', time);
    }, '4n');

    // Motif cuivres descendant menaçant : D-C-Bb-A
    const motif = ['D4', 'C4', 'Bb3', 'A3'];
    let mi = 0;
    const loopCuivre = new Tn.Loop((time) => {
        cuivre.triggerAttackRelease(motif[mi % motif.length], '2n', time);
        mi++;
    }, '2n');

    const loopChoeur = new Tn.Loop((time) => {
        choeur.triggerAttackRelease(['D3', 'F3', 'A3'], '2m', time);
    }, '2m');

    return {
        gain,
        demarrer() {
            loopSub.start(0); loopKick.start(0);
            loopCymbale.start('4n');
            loopCuivre.start('1m'); loopChoeur.start('2n');
        },
        arreter() {
            for (const l of [loopSub, loopKick, loopCymbale, loopCuivre, loopChoeur]) {
                l.stop(); l.dispose();
            }
            choeur.releaseAll?.();
            sub.dispose(); kick.dispose(); cymbale.dispose();
            cuivre.dispose(); choeur.dispose();
            reverb.dispose();
            setTimeout(() => gain.dispose(), 50);
        }
    };
}

// ────────────────────────────────────────────────────────────────────────────

export const PATCHES_MUSIQUE = {
    menu:    { id: 'menu',    bpm: 60,  build: buildMenu },
    cite:    { id: 'cite',    bpm: 72,  build: buildCite },
    present: { id: 'present', bpm: 56,  build: buildPresent },
    combat:  { id: 'combat',  bpm: 110, build: buildCombat },
    boss:    { id: 'boss',    bpm: 90,  build: buildBoss }
};
