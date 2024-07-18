export type ChordType = 'major' | 'minor' | 'm' | '7' | 'm7' | 'maj7' | 'add9' | 'sus2' | 'sus4' | '5' | '6' | '7sus4' | 'dim';
export type RootNote = 'A' | 'A#' | 'Bb' | 'B' | 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab';
export type Note = 'A' | 'A#' | 'Bb' | 'B' | 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab';
export type ChordPosition = [number, number, number, number, number, number];
export type OpenStringNote = 'E' | 'A' | 'D' | 'G' | 'B';

// New types for strumming patterns
export type StrumDirection = 'D' | 'U';
export type StrumPattern = (StrumDirection | number)[];
export type ChordWithStrum = [RootNote, ChordType, StrumPattern, string];

export const STRING_TUNING: Note[] = ['E', 'A', 'D', 'G', 'B', 'E']; // Low to High
export const NOTE_SEQUENCE: Note[] = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
export const FLAT_NOTE_SEQUENCE: Note[] = ['A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab'];
export const ROOT_NOTES: RootNote[] = [
  'A', 'A#', 'Bb', 'B', 'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab'
 ];
export const CHORD_TYPES: ChordType[] = ['major', 'minor', '7', 'm7', 'maj7', 'add9', 'sus2', 'sus4', '5', '6', '7sus4', 'dim'];
export const KEYS = ['C Major', 'G Major', 'D Major', 'A Major', 'E Major', 'F Major', 'A Minor', 'E Minor', 'B Minor', 'F# Minor', 'C# Minor', 'D Minor'];

export const CHORD_TYPE_LABELS: Record<ChordType, string> = {
  'major': 'Major',
  'minor': 'Minor',
  'm': 'Minor',  // Add this line
  '7': '7 or Dom 7',
  'm7': 'Minor 7',
  'maj7': 'Major 7',
  'add9': 'Add 9',
  'sus2': 'Sus 2',
  'sus4': 'Sus 4',
  '5': 'Power (5)',
  '6': '6',
  '7sus4': '7 Sus 4',
  'dim': 'Diminished'
};

// Add the ChordDataItem type
export interface ChordDataItem {
  stringNumber: number; // 6 for low E, 1 for high E (traditional guitar string numbering
  position: number;
  note: string;
  displayText: string;
  isRootNote: boolean;
  midiNote: number | null;
  noteName: string;
}


export const chordPositions: Record<RootNote, Record<ChordType, ChordPosition>> = {
  'A': {
    major: [0, 0, 2, 2, 2, 0],
    minor: [0, 0, 2, 2, 1, 0],
	'm': [0, 0, 2, 2, 1, 0],
    '7': [0, 0, 2, 0, 2, 0],
    'm7': [0, 0, 2, 0, 1, 0],
    'maj7': [0, 0, 2, 1, 2, 0],
    'add9': [0, 0, 2, 4, 2, 0],
    'sus2': [0, 0, 2, 2, 0, 0],
    'sus4': [0, 0, 2, 2, 3, 0],
    '5': [0, 0, 2, 2, -1, 0],
    '6': [0, 0, 2, 2, 2, 2],
    '7sus4': [0, 0, 2, 0, 3, 0],
    'dim': [0, 0, 1, 2, 1, -1]
  },
  'A#': {
    major: [-1, 1, 3, 3, 3, 1],
    minor: [-1, 1, 3, 3, 2, 1],
	'm': [-1, 1, 3, 3, 2, 1],
    '7': [-1, 1, 3, 1, 3, 1],
    'm7': [-1, 1, 3, 1, 2, 1],
    'maj7': [-1, 1, 3, 2, 3, 1],
    'add9': [-1, 1, 3, 3, 3, 3],
    'sus2': [-1, 1, 3, 3, 1, 1],
    'sus4': [-1, 1, 3, 3, 4, 1],
    '5': [-1, 1, 3, 3, -1, 1],
    '6': [-1, 1, 3, 3, 3, 3],
    '7sus4': [-1, 1, 3, 1, 4, 1],
    'dim': [-1, 1, 2, 3, 2, 0]
  },
  'Bb': {
    major: [-1, 1, 3, 3, 3, 1],
    minor: [-1, 1, 3, 3, 2, 1],
	'm': [-1, 1, 3, 3, 2, 1],
    '7': [-1, 1, 3, 1, 3, 1],
    'm7': [-1, 1, 3, 1, 2, 1],
    'maj7': [-1, 1, 3, 2, 3, 1],
    'add9': [-1, 1, 3, 3, 3, 3],
    'sus2': [-1, 1, 3, 3, 1, 1],
    'sus4': [-1, 1, 3, 3, 4, 1],
    '5': [-1, 1, 3, 3, -1, 1],
    '6': [-1, 1, 3, 3, 3, 3],
    '7sus4': [-1, 1, 3, 1, 4, 1],
    'dim': [-1, 1, 2, 3, 2, 0]
  },
  'B': {
    major: [-1, 2, 4, 4, 4, 2],
    minor: [-1, 2, 4, 4, 3, 2],
	'm': [-1, 2, 4, 4, 3, 2],
    '7': [-1, 2, 1, 2, 0, 2],
    'm7': [-1, 2, 0, 2, 0, 2],
    'maj7': [-1, 2, 4, 3, 4, 2],
    'add9': [-1, 2, 4, 4, 4, 4],
    'sus2': [-1, 2, 4, 4, 2, 2],
    'sus4': [-1, 2, 4, 4, 5, 2],
    '5': [-1, 2, 4, 4, -1, 2],
    '6': [-1, 2, 4, 4, 4, 4],
    '7sus4': [-1, 2, 4, 2, 5, 2],
    'dim': [-1, 2, 3, 4, 3, -1]
  },
  'C': {
    major: [3, 3, 2, 0, 1, 0],
    minor: [-1, 3, 5, 5, 4, 3],
	'm': [-1, 3, 5, 5, 4, 3],
    '7': [0, 3, 2, 3, 1, 0],
    'm7': [-1, 3, 5, 3, 4, 3],
    'maj7': [3, 3, 2, 0, 0, 0],
    'add9': [3, 3, 2, 0, 3, 0],
    'sus2': [3, 3, 0, 0, 1, 3],
    'sus4': [3, 3, 0, 0, 1, 1],
    '5': [3, 3, 5, 5, -1, 3],
    '6': [0, 0, 2, 2, 1, 3],
    '7sus4': [3, 3, 3, 3, 1, 1],
    'dim': [-1, -1, 1, 2, 1, 2]
  },
'C#': {
    major: [-1, 4, 3, 1, 2, 1],
    minor: [-1, 4, 2, 1, 2, -1],
	'm': [-1, 4, 2, 1, 2, -1],
    '7': [-1, 4, 3, 4, 2, -1],
    'm7': [-1, 4, 2, 4, 2, -1],
    'maj7': [-1, 4, 3, 5, 2, 1],
    'add9': [-1, 4, 3, 1, 4, 4],
    'sus2': [-1, 4, 1, 1, 2, -1],
    'sus4': [-1, 4, 4, 1, 2, -1],
    '5': [-1, 4, 1, 1, -1, -1],
    '6': [-1, 4, 3, 3, 2, -1],
    '7sus4': [-1, 4, 4, 4, 2, -1],
    'dim': [-1, -1, 2, 3, 2, 3]
  },
  'Db': {
    major: [-1, 4, 3, 1, 2, 1],
    minor: [-1, 4, 2, 1, 2, -1],
	'm': [-1, 4, 2, 1, 2, -1],
    '7': [-1, 4, 3, 4, 2, -1],
    'm7': [-1, 4, 2, 4, 2, -1],
    'maj7': [-1, 4, 3, 5, 2, 1],
    'add9': [-1, 4, 3, 1, 4, 4],
    'sus2': [-1, 4, 1, 1, 2, -1],
    'sus4': [-1, 4, 4, 1, 2, -1],
    '5': [-1, 4, 1, 1, -1, -1],
    '6': [-1, 4, 3, 3, 2, -1],
    '7sus4': [-1, 4, 4, 4, 2, -1],
    'dim': [-1, -1, 2, 3, 2, 3]
  },
  'D': {
    major: [-1, -1, 0, 2, 3, 2],
    minor: [-1, -1, 0, 2, 3, 1],
	'm': [-1, -1, 0, 2, 3, 1],
    '7': [-1, -1, 0, 2, 1, 2],
    'm7': [-1, -1, 0, 2, 1, 1],
    'maj7': [-1, -1, 0, 2, 2, 2],
    'add9': [-1, -1, 0, 2, 3, 0],
    'sus2': [-1, -1, 0, 2, 3, 0],
    'sus4': [-1, -1, 0, 2, 3, 3],
    '5': [-1, -1, 0, 2, 3, -1],
    '6': [-1, -1, 0, 2, 0, 2],
    '7sus4': [-1, -1, 0, 2, 1, 3],
    'dim': [-1, -1, 0, 1, 3, 1]
  },
'D#': {
    major: [0, 0, 1, 3, 4, 3],
    minor: [0, 0, 1, 3, 4, 2],
	'm': [0, 0, 1, 3, 4, 2],
    '7': [0, 0, 1, 3, 2, 3],
    'm7': [0, 0, 1, 3, 2, 2],
    'maj7': [0, 0, 1, 3, 3, 3],
    'add9': [0, 0, 1, 3, 4, 1],
    'sus2': [0, 0, 1, 3, 4, 1],
    'sus4': [0, 0, 1, 3, 4, 4],
    '5': [0, 0, 1, 3, -1, -1],
    '6': [0, 0, 1, 3, 1, 3],
    '7sus4': [0, 0, 1, 3, 2, 4],
    'dim': [-1, -1, 1, 2, 4, 2]
  },
  'Eb': {
    major: [0, 0, 1, 3, 4, 3],
    minor: [0, 0, 1, 3, 4, 2],
	'm': [0, 0, 1, 3, 4, 2],
    '7': [0, 0, 1, 3, 2, 3],
    'm7': [0, 0, 1, 3, 2, 2],
    'maj7': [0, 0, 1, 3, 3, 3],
    'add9': [0, 0, 1, 3, 4, 1],
    'sus2': [0, 0, 1, 3, 4, 1],
    'sus4': [0, 0, 1, 3, 4, 4],
    '5': [0, 0, 1, 3, -1, -1],
    '6': [0, 0, 1, 3, 1, 3],
    '7sus4': [0, 0, 1, 3, 2, 4],
    'dim': [-1, -1, 1, 2, 4, 2]
  },
 'E': {
    major: [0, 2, 2, 1, 0, 0],
    minor: [0, 2, 2, 0, 0, 0],
	'm': [0, 2, 2, 0, 0, 0],
    '7': [0, 2, 0, 1, 0, 0],
    'm7': [0, 2, 0, 0, 0, 0],
    'maj7': [0, 2, 1, 1, 0, 0],
    'add9': [0, 2, 2, 1, 0, 2],
    'sus2': [0, 2, 2, 4, 0, 0],
    'sus4': [0, 2, 2, 2, 0, 0],
    '5': [0, 2, 2, -1, -1, 0],
    '6': [0, 2, 2, 1, 2, 0],
    '7sus4': [0, 2, 0, 2, 0, 0],
    'dim': [0, 1, 2, 0, -1, -1]
  },
  'F': {
    major: [1, 3, 3, 2, 1, 1],
    minor: [1, 3, 3, 1, 1, 1],
	'm': [1, 3, 3, 1, 1, 1],
    '7': [1, 3, 1, 2, 1, 1],
    'm7': [1, 3, 1, 1, 1, 1],
    'maj7': [1, 3, 2, 2, 1, 0],
    'add9': [1, 0, 3, 0, 1, 1],
    'sus2': [1, 3, 3, 0, 1, 1],
    'sus4': [1, 3, 3, 3, 1, 1],
    '5': [1, 3, 3, -1, -1, 1],
    '6': [1, 3, 3, 2, 3, 1],
    '7sus4': [1, 3, 1, 3, 1, 1],
    'dim': [1, 2, 3, 1, -1, -1]
  },
	'F#': {
	  major: [2, 4, 4, 3, 2, 2],
	  minor: [2, 4, 4, 2, 2, 2],
	  'm': [2, 4, 4, 2, 2, 2],
	  '7': [2, 4, 2, 3, 2, 2],
	  'm7': [2, 4, 2, 2, 2, 2],
	  'maj7': [2, 4, 3, 3, 2, 1],
	  'add9': [2, 1, 4, 1, 2, 2],
	  'sus2': [2, 4, 4, 1, 2, 2],
	  'sus4': [2, 4, 4, 4, 2, 2],
	  '5': [2, 4, 4, -1, -1, 2],
	  '6': [2, 4, 4, 3, 4, 2],
	  '7sus4': [2, 4, 2, 4, 2, 2],
	  'dim': [2, 3, 4, 2, -1, -1]
	},
  'Gb': {
	  major: [2, 4, 4, 3, 2, 2],
	  minor: [2, 4, 4, 2, 2, 2],
	  'm': [2, 4, 4, 2, 2, 2],
	  '7': [2, 4, 2, 3, 2, 2],
	  'm7': [2, 4, 2, 2, 2, 2],
	  'maj7': [2, 4, 3, 3, 2, 1],
	  'add9': [2, 1, 4, 1, 2, 2],
	  'sus2': [2, 4, 4, 1, 2, 2],
	  'sus4': [2, 4, 4, 4, 2, 2],
	  '5': [2, 4, 4, -1, -1, 2],
	  '6': [2, 4, 4, 3, 4, 2],
	  '7sus4': [2, 4, 2, 4, 2, 2],
	  'dim': [2, 3, 4, 2, -1, -1]
	},

  'G': {
    major: [3, 2, 0, 0, 0, 3],
    minor: [3, 5, 5, 3, 3, 3],
	'm': [3, 5, 5, 3, 3, 3],
    '7': [3, 2, 0, 0, 0, 1],
    'm7': [3, 5, 3, 3, 3, 3],
    'maj7': [3, 2, 0, 0, 0, 2],
    'add9': [3, 2, 0, 0, 0, 5],
    'sus2': [3, 0, 0, 0, 3, 3],
    'sus4': [3, 3, 0, 0, 1, 3],
    '5': [3, 5, 5, -1, -1, 3],
    '6': [3, 2, 0, 0, 0, 0],
    '7sus4': [3, 3, 0, 0, 1, 1],
    'dim': [3, 4, 5, 3, -1, -1]
  },
'G#': {
    major: [4, 3, 1, 1, 1, 4],
    minor: [4, 3, 1, 1, 4, 4],
	'm': [4, 3, 1, 1, 4, 4],
    '7': [4, 3, 1, 1, 1, 2],
    'm7': [4, 3, 1, 1, 4, 2],
    'maj7': [4, 3, 1, 1, 1, 3],
    'add9': [4, 3, 1, 1, 1, 0],
    'sus2': [4, 1, 1, 1, 4, 4],
    'sus4': [4, 4, 1, 1, 2, 4],
    '5': [4, 3, 1, -1, -1, 4],
    '6': [4, 3, 1, 1, 1, 1],
    '7sus4': [4, 4, 1, 1, 2, 2],
    'dim': [4, 2, 3, 4, 3, -1]
  },
  'Ab': {
    major: [4, 3, 1, 1, 1, 4],
    minor: [4, 3, 1, 1, 4, 4],
	'm': [4, 3, 1, 1, 4, 4],
    '7': [4, 3, 1, 1, 1, 2],
    'm7': [4, 3, 1, 1, 4, 2],
    'maj7': [4, 3, 1, 1, 1, 3],
    'add9': [4, 3, 1, 1, 1, 0],
    'sus2': [4, 1, 1, 1, 4, 4],
    'sus4': [4, 4, 1, 1, 2, 4],
    '5': [4, 3, 1, -1, -1, 4],
    '6': [4, 3, 1, 1, 1, 1],
    '7sus4': [4, 4, 1, 1, 2, 2],
    'dim': [4, 2, 3, 4, 3, -1]
  }
};

export const chordFormulas: Record<ChordType, string> = {
  major: '1-3-5',
  minor: '1-b3-5',
  'm': '1-b3-5',
  '7': '1-3-5-b7',
  'm7': '1-b3-5-b7',
  'maj7': '1-3-5-7',
  'add9': '1-3-5-9',
  'sus2': '1-2-5',
  'sus4': '1-4-5',
  '5': '1-5',
  '6': '1-3-5-6',
  '7sus4': '1-4-5-b7',
  'dim': '1-b3-b5'
};

export const OPEN_STRING_MIDI_MAP: Record<OpenStringNote, number> = {
  'E': 40,  // Low E (String 6)
  'A': 45,  // String 5
  'D': 50,  // String 4
  'G': 55,  // String 3
  'B': 59,  // String 2
};
// Separate constant for the high E string
export const HIGH_E_MIDI = 64; // High E (String 1), Array index 5
export const LOW_E_MIDI = 40; // 6th string (low E), Array index 0

export const getMidiNoteFromPosition = (stringNumber: string | number, fret: number): number | null => {
  if (fret < 0) return null; // Muted string
  
  const stringIndex = typeof stringNumber === 'string' ? 6 - parseInt(stringNumber) : 6 - stringNumber;
  
  if (stringIndex < 0 || stringIndex > 5) {
    console.error('Invalid string number:', stringNumber);
    return null;
  }
  
  const openStringNote = STRING_TUNING[stringIndex] as OpenStringNote;
  
  let openStringMidi: number;
  if (stringIndex === 5) { // High E string (string 1)
    openStringMidi = HIGH_E_MIDI;
  } else {
    openStringMidi = OPEN_STRING_MIDI_MAP[openStringNote];
  }
  
  return openStringMidi + fret;
};

export const noteToMidi = (noteName: string): number => {
  const noteMap: Record<string, number> = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
    'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
  };
  
  const [, note, octave] = noteName.match(/^([A-G][#]?)(-?\d)$/) || [];
  if (!note || octave === undefined) {
    throw new Error('Invalid note format. Use format like "A4", "C#5", "C-1", etc.');
  }
  
  return noteMap[note] + (parseInt(octave) + 1) * 12;
};

export const midiToNote = (midiNote: number): string => {
  if (midiNote < 0 || midiNote > 127) {
    throw new Error('MIDI note must be between 0 and 127');
  }
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midiNote / 12) - 1;
  const noteIndex = midiNote % 12;
  return `${noteNames[noteIndex]}${octave}`;
};

export function convertAccidental(note: Note): Note {
  const sharpToFlat: Record<Note, Note> = {
    'A': 'A', 'A#': 'Bb', 'B': 'B', 'C': 'C', 'C#': 'Db',
    'D': 'D', 'D#': 'Eb', 'E': 'E', 'F': 'F', 'F#': 'Gb',
    'G': 'G', 'G#': 'Ab', 'Bb': 'Bb', 'Db': 'Db', 'Eb': 'Eb',
    'Gb': 'Gb', 'Ab': 'Ab'
  };
  const flatToSharp: Record<Note, Note> = {
    'A': 'A', 'Bb': 'A#', 'B': 'B', 'C': 'C', 'Db': 'C#',
    'D': 'D', 'Eb': 'D#', 'E': 'E', 'F': 'F', 'Gb': 'F#',
    'G': 'G', 'Ab': 'G#', 'A#': 'A#', 'C#': 'C#', 'D#': 'D#',
    'F#': 'F#', 'G#': 'G#'
  };
  return (sharpToFlat[note] || flatToSharp[note] || note) as Note;
}