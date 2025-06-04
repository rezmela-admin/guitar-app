// Defines the structure of a sound preset, aligning with state variables in GuitarChordApp
// and props for useAudioSamples and SoundControls.
export interface Preset {
  name: string;
  selectedInstrument: string; // e.g., 'FMSynth', 'Synth', 'sampler'
  attackTime: number;         // seconds
  decayTime: number;          // seconds
  sustainLevel: number;       // 0.0 to 1.0
  releaseTime: number;        // seconds
  volume: number;             // 0.0 to 1.0 (master volume)

  // Reverb settings
  reverbSendLevel: number;    // 0.0 to 1.0 (maps to Tone.Reverb.wet or sampler send gain)
  reverbOutputLevel: number;  // 0.0 to 1.0 (primarily for sampler's output gain from reverb)

  // EQ settings (Tone.js EQ3)
  lowGain: number;            // dB
  midGain: number;            // dB
  highGain: number;           // dB

  // Chorus settings (Tone.js Chorus)
  chorusRate: number;         // Hz
  chorusDepth: number;        // 0.0 to 1.0
  chorusWet: number;          // 0.0 to 1.0 (dry/wet mix)

  // Filter settings (Tone.js Filter)
  filterCutoff: number;       // Hz
  filterResonance: number;    // Q value (dimensionless)
  filterType: BiquadFilterType; // e.g., 'lowpass', 'highpass'

  // Stereo Widener settings (Tone.js StereoWidener)
  stereoWidth: number;        // 0.0 (mono) to 1.0 (wide stereo)

  // Note: Other parameters like playStyle, bassLevel (for strum), chordPlaySpeed,
  // duration, upstrokeSpeedFactor, arpeggioBaseDuration are considered playback style
  // rather than core sound timbre, so they are not included in these sound presets.
  // They could be part of a separate "performance preset" or "song preset" system.
}

export const soundPresets: Preset[] = [
  {
    "name": "Ambient Pad",
    "selectedInstrument": "FMSynth",
    "attackTime": 0.8,
    "decayTime": 1.5,
    "sustainLevel": 0.7,
    "releaseTime": 2.0,
    "volume": 0.75,
    "reverbSendLevel": 0.7,
    "reverbOutputLevel": 0.7,
    "lowGain": -2,
    "midGain": 0,
    "highGain": 2,
    "chorusRate": 0.5,
    "chorusDepth": 0.4,
    "chorusWet": 0.6,
    "filterCutoff": 8000,
    "filterResonance": 1.2,
    "filterType": "lowpass",
    "stereoWidth": 0.8
  },
  {
    "name": "8-bit Lead",
    "selectedInstrument": "Synth",
    "attackTime": 0.01,
    "decayTime": 0.2,
    "sustainLevel": 0.8,
    "releaseTime": 0.1,
    "volume": 0.8,
    "reverbSendLevel": 0.2,
    "reverbOutputLevel": 0.7,
    "lowGain": -3,
    "midGain": 2,
    "highGain": 1,
    "chorusRate": 0,
    "chorusDepth": 0,
    "chorusWet": 0,
    "filterCutoff": 6000,
    "filterResonance": 1.5,
    "filterType": "lowpass",
    "stereoWidth": 0.2
  },
  {
    "name": "Deep Pluck Bass",
    "selectedInstrument": "PluckSynth",
    "attackTime": 0.01,
    "decayTime": 0.8,
    "sustainLevel": 0.1,
    "releaseTime": 0.8,
    "volume": 0.9,
    "reverbSendLevel": 0.1,
    "reverbOutputLevel": 0.7,
    "lowGain": 4,
    "midGain": -2,
    "highGain": -4,
    "chorusRate": 0,
    "chorusDepth": 0,
    "chorusWet": 0,
    "filterCutoff": 800,
    "filterResonance": 1,
    "filterType": "lowpass",
    "stereoWidth": 0.4
  },
  {
    "name": "Rhythmic Noise Pulse",
    "selectedInstrument": "NoiseSynth",
    "attackTime": 0.005,
    "decayTime": 0.1,
    "sustainLevel": 0,
    "releaseTime": 0.1,
    "volume": 0.7,
    "reverbSendLevel": 0.3,
    "reverbOutputLevel": 0.7,
    "lowGain": 0,
    "midGain": 0,
    "highGain": 0,
    "chorusRate": 1,
    "chorusDepth": 0.2,
    "chorusWet": 0.3,
    "filterCutoff": 3000,
    "filterResonance": 2,
    "filterType": "bandpass",
    "stereoWidth": 0.6
  },
  {
    "name": "Metallic Bell",
    "selectedInstrument": "MetalSynth",
    "attackTime": 0.01,
    "decayTime": 1.0,
    "sustainLevel": 0.3,
    "releaseTime": 1.5,
    "volume": 0.7,
    "reverbSendLevel": 0.6,
    "reverbOutputLevel": 0.7,
    "lowGain": -2,
    "midGain": 1,
    "highGain": 3,
    "chorusRate": 0.2,
    "chorusDepth": 0.3,
    "chorusWet": 0.4,
    "filterCutoff": 10000,
    "filterResonance": 1,
    "filterType": "highpass",
    "stereoWidth": 0.7
  },
  {
    "name": "Warm Electric Piano",
    "selectedInstrument": "AMSynth",
    "attackTime": 0.02,
    "decayTime": 0.6,
    "sustainLevel": 0.5,
    "releaseTime": 0.4,
    "volume": 0.85,
    "reverbSendLevel": 0.4,
    "reverbOutputLevel": 0.7,
    "lowGain": 1,
    "midGain": -1,
    "highGain": -2,
    "chorusRate": 2,
    "chorusDepth": 0.3,
    "chorusWet": 0.5,
    "filterCutoff": 7000,
    "filterResonance": 1,
    "filterType": "lowpass",
    "stereoWidth": 0.6
  }
];
