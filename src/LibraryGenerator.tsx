import { KEYS } from './types';
import { chordProgressions } from './sequenceFormulas';

const keyMaps: Record<string, string[]> = {
  'C Major': ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim', 'Bb', 'Ab'],
  'G Major': ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim', 'F', 'Eb'],
  'D Major': ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim', 'C', 'Bb'],
  'A Major': ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim', 'G', 'F'],
  'E Major': ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim', 'D', 'C'],
  'F Major': ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim', 'Eb', 'Db'],
  'A Minor': ['Am', 'Bdim', 'C', 'Dm', 'Em', 'F', 'G', 'G', 'F'],
  'E Minor': ['Em', 'F#dim', 'G', 'Am', 'Bm', 'C', 'D', 'D', 'C'],
  'B Minor': ['Bm', 'C#dim', 'D', 'Em', 'F#m', 'G', 'A', 'A', 'G'],
  'F# Minor': ['F#m', 'G#dim', 'A', 'Bm', 'C#m', 'D', 'E', 'E', 'D'],
  'C# Minor': ['C#m', 'D#dim', 'E', 'F#m', 'G#m', 'A', 'B', 'B', 'A'],
  'D Minor': ['Dm', 'Edim', 'F', 'Gm', 'Am', 'Bb', 'C', 'C', 'Bb']
};

const defaultStrumPattern = 'D D U D';

export function generateChordSequence(key: string, progression: string): string {
  const selectedProgression = chordProgressions.find(prog => prog.value === progression);
  if (!selectedProgression) {
    throw new Error('Invalid progression selected');
  }

  if (!KEYS.includes(key)) {
    throw new Error('Invalid key selected');
  }

  const progressionSteps = selectedProgression.value.split('-');
  const chords = keyMaps[key];
  const isMinorKey = key.includes('Minor');

  const getChordIndex = (step: string): number => {
    const lowercaseStep = step.toLowerCase();
    switch (lowercaseStep) {
      case 'i': return 0;
      case 'ii': return 1;
      case 'iii': return 2;
      case 'iv': return 3;
      case 'v': return 4;
      case 'vi': return 5;
      case 'vii': return 6;
      case 'bvii': return 7;
      case 'bvi': return 8;
      default:
        console.warn(`Unsupported chord step: ${step} in progression "${progression}". Defaulting to tonic.`);
        return 0;
    }
  };

  const chordSequence = progressionSteps.map(step => {
    const index = getChordIndex(step);
    let chordName = chords[index];

    if (step === step.toLowerCase() &&
        !chordName.includes('m') &&
        !chordName.includes('dim')) {
      const upperStep = step.toUpperCase();
      if (!isMinorKey && (upperStep === 'II' || upperStep === 'III' || upperStep === 'VI')) {
        chordName += 'm';
      }
    }
    return `${chordName}(${defaultStrumPattern})`;
  }).join(' ');

  return chordSequence;
}
