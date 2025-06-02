import { RootNote, ChordType, ChordPosition, NOTE_SEQUENCE } from './types';
import { CAGED_SHAPES, CagedShapeData } from './cagedShapes';
import { transposeShape } from './transpose';

export interface VoicingInfo {
  shapeName: string;        // e.g., "C", "A", "G", "E", "D"
  fretOffset: number;       // The fret on which the barre or base of the shape lands
  displayShape: ChordPosition; // The actual fretting positions after transposition
}

export function getCagedVoicings(
  targetRoot: RootNote,
  targetType: ChordType // Initially, we'll only implement for 'major'
): VoicingInfo[] {
  const voicings: VoicingInfo[] = [];

  if (targetType !== 'major') {
    // For now, only support major chords with CAGED shapes
    // console.warn("getCagedVoicings currently only supports 'major' chords.");
    return voicings;
  }

  const targetRootIndex = NOTE_SEQUENCE.indexOf(targetRoot);
  if (targetRootIndex === -1) {
    // console.error(`Target root note ${targetRoot} not found in NOTE_SEQUENCE.`);
    return voicings;
  }

  for (const shapeKey in CAGED_SHAPES) {
    const cagedShapeData: CagedShapeData = CAGED_SHAPES[shapeKey];
    const baseRootNoteIndex = NOTE_SEQUENCE.indexOf(cagedShapeData.baseRootNote);

    if (baseRootNoteIndex === -1) {
      // console.error(`Base root note ${cagedShapeData.baseRootNote} for ${shapeKey}-shape not found.`);
      continue;
    }

    // Calculate fretOffset
    let fretOffset = targetRootIndex - baseRootNoteIndex;
    if (fretOffset < 0) {
      fretOffset += 12; // Ensure positive offset, cycle up the octave
    }
    
    // The current `baseRootNote` and `fretOffset` logic should correctly place the shape
    // such that the `baseRootNote` of the shape, when moved by `fretOffset`, becomes the `targetRoot`
    // when considering the root note on the shape's primary root string.

    // Filter out impractical voicings (e.g., offset too high)
    // Max fret for the barre or base position of the shape
    if (fretOffset > 12) { 
        // console.log(`Skipping ${shapeKey}-shape for ${targetRoot}${targetType} - offset ${fretOffset} too high.`);
        continue;
    }

    const displayShape = transposeShape(cagedShapeData.shape, fretOffset) as ChordPosition;
    
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
