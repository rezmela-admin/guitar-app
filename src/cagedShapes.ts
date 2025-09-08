import { ChordPosition, RootNote } from './types';

export interface CagedShapeFamily { // Renamed from CagedShapeData
  major: ChordPosition;
  minor?: ChordPosition; // Optional: not all major shapes have a common/easy minor equivalent as a movable shape
  rootStrings: number[]; // 0-indexed: 0=Low E, 5=High e. Lowest string typically used as root in barre form.
  baseRootNote: RootNote; // Root note of this shape in its open form
}

export const CAGED_SHAPES: Record<string, CagedShapeFamily> = { // Type updated
  C: {
    major: [-1, 3, 2, 0, 1, 0], // Standard Open C shape. Assumes x32010.
    minor: [-1, 3, 1, 0, 1, 0], // Cm as x3101x (often played x31010 for fuller sound if high e is fretted)
    rootStrings: [1],           // A string (C note at 3rd fret of A string) is often the reference for the movable C-shape barre chord.
    baseRootNote: 'C',
  },
  A: {
    major: [-1, 0, 2, 2, 2, 0], // Standard Open A shape. Assumes x02220.
    minor: [-1, 0, 2, 2, 1, 0], // Am as x02210
    rootStrings: [1],           // A string (open A) is the reference for the movable A-shape barre chord.
    baseRootNote: 'A',
  },
  G: {
    major: [3, 2, 0, 0, 0, 3], // Standard Open G shape. Assumes 320003.
    // minor: undefined, // Gm movable shape is often derived from Em shape.
    rootStrings: [0],           // Low E string (G note at 3rd fret of E string) is often the reference for the movable G-shape barre chord.
    baseRootNote: 'G',
  },
  E: {
    major: [0, 2, 2, 1, 0, 0], // Standard Open E shape. Assumes 022100.
    minor: [0, 2, 2, 0, 0, 0], // Em as 022000
    rootStrings: [0],           // Low E string (open E) is the reference for the movable E-shape barre chord.
    baseRootNote: 'E',
  },
  D: {
    major: [-1, -1, 0, 2, 3, 2], // Standard Open D shape. Assumes xx0232.
    minor: [-1, -1, 0, 2, 3, 1], // Dm as xx0231
    rootStrings: [2],           // D string (open D) is the reference for the movable D-shape barre chord.
    baseRootNote: 'D',
  },
};
