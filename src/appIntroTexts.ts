// appIntroTexts.ts

export const introTexts: {
  manualSequenceEditor: string;
  sequenceFeatures: string;
  soundControls: string;
  chordBrowser: string;
  advancedPlayback: string;
  progressionGeneratorInfo: string; // New key added
} = {
  manualSequenceEditor: `
    Use the **Edit Sequence** window to manually type or paste your chord progressions. 
    Input chords using a simple format (e.g., "Am(D D U D) C(4)"). 
    Once your sequence is ready, load it into the player to hear it come to life. 
    This is perfect for quickly jotting down ideas or working with existing transcriptions.
  `,
  sequenceFeatures: `
    Discover and load chord sequences in the **Load/Generate Sequence** window:
    - **Generate Progressions:** Create sequences by selecting a key and a common chord progression (e.g., I-V-vi-IV).
    - **Stock Songs:** Explore pre-loaded progressions from popular songs.
    - **Import/Export:** Load sequences from text files or save your creations.
    Use the Strumming Pattern Guide for help with formatting.
  `,
  soundControls: `
    Fine-tune your guitar sound in the **Sound Settings** window. 
    Adjust parameters like play style (strum or arpeggio), bass dampening, 
    volume, ADSR envelope settings (Attack, Decay, Sustain, Release), reverb, and overall duration. 
    These controls allow you to customize the sound to match different playing techniques or emulate various guitar tones.
  `,
  chordBrowser: `
    Explore and select chords in the **Chord Browser** window. 
    Choose a root note and chord type (e.g., C Major, A minor). 
    The selected chord will be displayed on the fretboard, and you can hear how it sounds. 
    The chord formula is also shown to help you understand its structure.
  `,
  advancedPlayback: `
    Access additional playback options in the **More Playback Options** window.
    Here you can:
    - Step backward or forward through the chords in your loaded sequence.
    - Instantly skip to the beginning or end of the sequence.
    These controls are useful for navigating and practicing specific parts of a song.
  `,
  progressionGeneratorInfo: `Select a key and a common chord progression type (e.g., I-V-vi-IV) to automatically generate a chord sequence. This is a great way to explore new ideas or practice common patterns.`
};
