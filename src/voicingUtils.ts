import { RootNote, ChordType, ChordPosition, NOTE_SEQUENCE } from './types';
import { CAGED_SHAPES, CagedShapeFamily } from './cagedShapes'; // Updated CagedShapeData to CagedShapeFamily
import { transposeShape } from './transpose';

export interface VoicingInfo {
  shapeName: string;        // e.g., "C", "A", "G", "E", "D"
  fretOffset: number;       // The fret on which the barre or base of the shape lands
  displayShape: ChordPosition; // The actual fretting positions after transposition
}

export function getCagedVoicings(
  targetRoot: RootNote,
  targetType: ChordType
): VoicingInfo[] {
  const voicings: VoicingInfo[] = [];

  // Removed early return for non-major chords.
  // Now it will attempt to find voicings for major or minor.

  const targetRootIndex = NOTE_SEQUENCE.indexOf(targetRoot);
  if (targetRootIndex === -1) {
    // console.error(`Target root note ${targetRoot} not found in NOTE_SEQUENCE.`);
    return voicings;
  }

  for (const shapeKey in CAGED_SHAPES) {
    const cagedShapeFamily: CagedShapeFamily = CAGED_SHAPES[shapeKey]; // Use CagedShapeFamily
    
    let baseShapeToTranspose: ChordPosition | undefined;

    if (targetType === 'major') {
      baseShapeToTranspose = cagedShapeFamily.major;
    } else if (targetType === 'minor' || targetType === 'm') {
      baseShapeToTranspose = cagedShapeFamily.minor;
    } else {
      // console.warn(`Unsupported targetType: ${targetType} for CAGED voicings.`);
      continue; // Skip if chord type is not major or minor
    }

    if (!baseShapeToTranspose) {
      // console.log(`No ${targetType} shape defined for ${shapeKey}-family.`);
      continue; // Skip if the specific shape (e.g., G minor) is not defined
    }

    const baseRootNoteIndex = NOTE_SEQUENCE.indexOf(cagedShapeFamily.baseRootNote);

    if (baseRootNoteIndex === -1) {
      // console.error(`Base root note ${cagedShapeFamily.baseRootNote} for ${shapeKey}-family not found.`);
      continue;
    }

    // Calculate fretOffset
    let fretOffset = targetRootIndex - baseRootNoteIndex;
    if (fretOffset < 0) {
      fretOffset += 12; // Ensure positive offset, cycle up the octave
    }
    
    // Filter out impractical voicings (e.g., offset too high)
    if (fretOffset > 12) { 
        // console.log(`Skipping ${shapeKey}-family for ${targetRoot}${targetType} - offset ${fretOffset} too high.`);
        continue;
    }

    const displayShape = transposeShape(baseShapeToTranspose, fretOffset) as ChordPosition;
    
    // Further check: ensure no resulting fret in displayShape is excessively high
    let practicalVoicing = true;
    for (const fret of displayShape) {
        if (typeof fret === 'number' && fret > 15) { // Max practical fret on guitar for any part of the shape
            practicalVoicing = false;
            break;
        }
    }

    if (!practicalVoicing) {
        // console.log(`Skipping ${shapeKey}-shape for ${targetRoot}${targetType} at offset ${fretOffset} - resulting frets too high.`);
        continue;
    }

    voicings.push({
      shapeName: shapeKey,
      fretOffset: fretOffset,
      displayShape: displayShape,
    });
  }
  
  // Sort voicings by fretOffset (lowest position first)
  // Then by shape name for consistent ordering if offsets are equal (e.g. open G and G-shape G)
  voicings.sort((a, b) => {
    if (a.fretOffset === b.fretOffset) {
      return a.shapeName.localeCompare(b.shapeName);
    }
    return a.fretOffset - b.fretOffset;
  });

  // console.log(`Voicings for ${targetRoot}${targetType}:`, voicings);
  return voicings;
}
