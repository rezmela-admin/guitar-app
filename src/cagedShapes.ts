import { ChordPosition, RootNote } from './types';

export interface CagedShapeData {
  shape: ChordPosition;
  rootStrings: number[]; // 0-indexed: 0=Low E, 5=High e. Lowest string typically used as root in barre form.
  baseRootNote: RootNote; // Root note of this shape in its open form
}

export const CAGED_SHAPES: Record<string, CagedShapeData> = {
  C: {
    shape: [-1, 3, 2, 0, 1, 0], // Standard Open C shape. Assumes x32010.
    rootStrings: [1],           // A string (C note at 3rd fret of A string) is often the reference for the movable C-shape barre chord.
    baseRootNote: 'C',
  },
  A: {
    shape: [-1, 0, 2, 2, 2, 0], // Standard Open A shape. Assumes x02220.
    rootStrings: [1],           // A string (open A) is the reference for the movable A-shape barre chord.
    baseRootNote: 'A',
  },
  G: {
    shape: [3, 2, 0, 0, 0, 3], // Standard Open G shape. Assumes 320003.
    rootStrings: [0],           // Low E string (G note at 3rd fret of E string) is often the reference for the movable G-shape barre chord.
    baseRootNote: 'G',
  },
  E: {
    shape: [0, 2, 2, 1, 0, 0], // Standard Open E shape. Assumes 022100.
    rootStrings: [0],           // Low E string (open E) is the reference for the movable E-shape barre chord.
    baseRootNote: 'E',
  },
  D: {
    shape: [-1, -1, 0, 2, 3, 2], // Standard Open D shape. Assumes xx0232.
    rootStrings: [2],           // D string (open D) is the reference for the movable D-shape barre chord.
    baseRootNote: 'D',
  },
};
