/**
 * Represents the fret position on a guitar string.
 * 'x' denotes a muted string, a number denotes a fret.
 */
type FretPosition = number | 'x';

/**
 * Represents the fingering positions for a chord on a guitar.
 * Each element in the array corresponds to a string, typically from low E to high E.
 */
type ChordShape = FretPosition[];
type ReadonlyChordShape = ReadonlyArray<FretPosition>;

/**
 * Transposes a base chord shape by a given fret offset.
 *
 * @param baseShape - An array representing the base chord positions (e.g., `['x', 0, 2, 2, 1, 0]` for E major).
 *                    'x' means muted, a number is a fret relative to the nut or a capo if the base shape is already capoed.
 * @param fretOffset - The number of frets to shift the shape up by.
 * @returns A new array representing the transposed shape.
 *          Example: `transposeShape(['x', 0, 2, 2, 1, 0], 3)` for E major shape at 3rd fret (G major)
 *          should result in `['x', 3, 5, 5, 4, 3]`.
 */
export function transposeShape(baseShape: ReadonlyChordShape, fretOffset: number): ChordShape {
  if (fretOffset < 0) {
    // Or throw an error, depending on desired behavior for negative offsets
    console.warn("transposeShape called with negative fretOffset. Shapes can only be moved up the fretboard.");
    return [...baseShape];
  }
  if (fretOffset === 0) {
    return [...baseShape];
  }

  return baseShape.map(fret => {
    if (typeof fret === 'number') {
      return fret + fretOffset;
    }
    return fret; // 'x' remains 'x'
  });
}

/**
 * Information about a barre chord.
 * @property barreFret - The fret number where the barre is applied.
 * @property startString - The index of the highest-pitched string (thinnest string, typically index 5 for high E if 0-indexed from low E) included in the barre.
 * @property endString - The index of the lowest-pitched string (thickest string, typically index 0 for low E if 0-indexed from low E) included in the barre.
 * Note: String indexing convention here is 0 for low E, 5 for high E, matching array indices.
 */
export interface BarreInfo {
  barreFret: number;
  startString: number; // e.g., 0 (low E string index)
  endString: number;   // e.g., 5 (high e string index)
}


/**
 * Determines if a barre is present at the given fretOffset in a transposed chord shape
 * and returns information about the barre.
 *
 * @param transposedShape - The chord shape after transposition.
 * @param fretOffset - The fret at which the barre is suspected or intended to be.
 *                     This is the fret number that notes originally at fret 0 in the base shape would now occupy.
 * @returns An object with `barreFret`, `startString` (index), and `endString` (index) if a barre is formed.
 *          Returns `null` if no barre is formed by at least two strings at `fretOffset`.
 */
export function getBarreInfo(transposedShape: ReadonlyChordShape, fretOffset: number): BarreInfo | null {
  if (fretOffset <= 0) { // Barres are typically not at or below the nut unless it's a specific technique not covered here.
    return null;
  }

  const stringsAtBarreFret: number[] = [];
  transposedShape.forEach((fret, index) => {
    if (fret === fretOffset) {
      stringsAtBarreFret.push(index);
    }
  });

  if (stringsAtBarreFret.length < 2) {
    // A barre typically involves at least 2 strings.
    // Or, if the shape is E-like moved up, the lowest note at fretOffset IS the barre.
    // This logic might need refinement based on how strictly "barre" is defined.
    // For shapes like A-shape barre, this count will be higher.
    // For E-shape barre, only one string *might* be exactly `fretOffset` if other fingers replace barre notes.
    // However, the core idea is that notes that *were* open (0) are now at `fretOffset`.
    // The prompt implies we check `transposedShape` for notes at `fretOffset`.
    return null;
  }

  // Sort to easily find min and max string index
  stringsAtBarreFret.sort((a, b) => a - b);

  const startString = stringsAtBarreFret[0];
  const endString = stringsAtBarreFret[stringsAtBarreFret.length - 1];

  // A common interpretation of a barre is that it covers contiguous strings,
  // or at least the highest and lowest strings identified are part of the barre.
  // This function currently identifies the span of strings that are *exactly* at the barreFret.
  // More complex shapes (e.g. A-shape barre) might have fingers on higher frets *within* the barre span.
  // This function does not try to infer those, only what's explicitly at fretOffset.

  return {
    barreFret: fretOffset,
    startString: startString, // Lower index (e.g. high E string if using 0=high E)
    endString: endString    // Higher index (e.g. low E string if using 0=high E)
  };
}
