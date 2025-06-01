import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChordDataItem, RootNote, ChordType, Note, ChordPosition, STRING_TUNING, NOTE_SEQUENCE, chordPositions, CHORD_TYPE_LABELS, getMidiNoteFromPosition, midiToNote, StrumPattern,StrumDirection,ChordWithStrum } from './types';
import { transposeShape, getBarreInfo } from './transpose'; // Added getBarreInfo
import { CAGED_SHAPES } from './cagedShapes';
import { getCagedVoicings, VoicingInfo } from './voicingUtils';
import ChordBrowser from './ChordBrowser';
import { useAudioSamples } from './hooks/useAudioSamples';
import { PlayIcon, PauseIcon, StepBackwardIcon, StepForwardIcon, RepeatIcon, StopIcon,SkipToStartIcon, SkipToEndIcon, MusicalSymbolIcon } from './IconComponents';
import SequenceEditor from './SequenceEditor';
import SoundControls from './SoundControls';
import { introTexts } from './appIntroTexts';
import { AnimationLayer, triggerNoteAnimation, resetAnimations, animationStyles } from './ChordAnimations';
import { chordFingerData, fingerColors } from './ChordFingerData';

const GuitarChordApp: React.FC = () => {

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [showFunction, setShowFunction] = useState(false);
  const [volume, setVolume] = useState(0.5); // Initialize volume to half max.
  const [activeTab, setActiveTab] = useState<'browser' | 'sequence' | 'sound'>('browser');
  // Existing state variables
  const [rootNote, setRootNote] = useState<RootNote>('D');
  const [chordType, setChordType] = useState<ChordType>('major');
  const [chordSequence, setChordSequence] = useState<string>("D(D D U D), A(D D U D), Bm(D D U D), F#m(D D U D), G(D D U D), D(D D U D), G(D D U D), A(D D U D)");
  const [isSequenceValid, setIsSequenceValid] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  // const [selectedGShape, setSelectedGShape] = useState<'E-shape' | 'A-shape'>('E-shape'); // Removed
  const [availableVoicings, setAvailableVoicings] = useState<VoicingInfo[]>([]); // Added
  const [selectedVoicingIndex, setSelectedVoicingIndex] = useState<number>(0); // Added

  // Updated or new state variables
  const [playStyle, setPlayStyle] = useState<'strum' | 'arpeggio'>('arpeggio');
  const [bassDampening, setBassDampening] = useState(0.7);
  const [attackTime, setAttackTime] = useState(0.028);
  const [decayTime, setDecayTime] = useState(2.0);
  const [sustainLevel, setSustainLevel] = useState(0.55);
  const [releaseTime, setReleaseTime] = useState(5.0);
  const [isChordPlaying, setIsChordPlaying] = useState(false);
  const [chordPlaySpeed, setChordPlaySpeed] = useState(11);
  const [duration, setDuration] = useState(495);
  
  const [isPaused, setIsPaused] = useState(false);
  const [remainingChords, setRemainingChords] = useState<ChordWithStrum[]>([]);
  // const [elapsedTime, setElapsedTime] = useState(0); // Removed
  // const intervalRef = useRef<NodeJS.Timeout | null>(null); // Removed
  const [shouldStopAtEnd, setShouldStopAtEnd] = useState(false);
  const [chordData, setChordData] = useState<ChordDataItem[]>([]);
  const [animations, setAnimations] = useState<JSX.Element[]>([]);
  
  
    const getNote = useCallback((stringNote: Note, fret: number): Note => {
		const startIndex = NOTE_SEQUENCE.indexOf(stringNote);
		return NOTE_SEQUENCE[(startIndex + fret) % 12];
	}, []);
	
  
    useEffect(() => {
    console.log("chordSequence updated in GuitarChordApp:", chordSequence);
    }, [chordSequence]);
  
	const toggleLoop = () => {
	  setIsLooping(prevState => !prevState);
	  if (isPlaying) {
		stopSequence();
		if (!isLooping) {
		  // If we're turning looping on, start playing from the beginning
		  setCurrentChordIndex(0);
		  playSequence();
		}
	  }
	};

  
  const { 
    isLoading, 
    loadingProgress, 
    playNote: playAudioNote, 
    initializeAudio, 
    isInitialized, 
    errorMessage 
  } = useAudioSamples();

  
const playAudioNoteWithAnimation = useCallback((
  midiNote: number, 
  stringNumber: number,
  position: number,
  isUpstroke: boolean,
  volume: number, 
  duration: number
) => {
  console.log(`Attempting to play and animate note: ${midiNote}`);
  playAudioNote(midiNote, volume, duration);
  triggerNoteAnimation(midiNote, stringNumber, position, isUpstroke, setAnimations);
}, [playAudioNote]); // Removed setAnimations (stable setter) and triggerNoteAnimation (stable import)

  
	   useEffect(() => {
	   initializeAudio();
	   }, [initializeAudio]);
	   
  // Function to update chordData based on rootNote, chordType, available voicings and selected index
  const updateChordData = useCallback((root: RootNote, type: ChordType, currentVoicings: VoicingInfo[], currentIndex: number) => {
    let shapeToUse: ChordPosition;

    if (currentVoicings.length > 0 && currentIndex < currentVoicings.length) {
      const currentVoicing = currentVoicings[currentIndex];
      shapeToUse = currentVoicing.displayShape;
    } else {
      // Fallback if no CAGED voicings (e.g. for minor chords) or index issue
      shapeToUse = chordPositions[root]?.[type] ?? chordPositions.C.major;
    }

    const newChordData: ChordDataItem[] = shapeToUse.map((position, index) => {
      const stringNumber = 6 - index; // Convert index to string number (6 to 1)
      const currentStringNote = STRING_TUNING[index];
      let note: Note | 'X' = 'X';
      let midiNote: number | null = null;

      if (typeof position === 'number' && position >= 0) {
        note = getNote(currentStringNote, position);
        midiNote = getMidiNoteFromPosition(stringNumber.toString(), position);
      }

      return {
        stringNumber,
        position: typeof position === 'number' ? position : -1,
        note,
        displayText: note,
        isRootNote: note === root,
        midiNote,
        noteName: midiNote !== null ? midiToNote(midiNote) : 'X'
      };
    });
    console.log('Updated chord data:', newChordData);
    setChordData(newChordData);
  }, [getNote]); // midiToNote is stable if imported, selectedGShape removed
  
  // Update availableVoicings and chordData when rootNote or chordType changes
  useEffect(() => {
    const newVoicings = getCagedVoicings(rootNote, chordType);
    setAvailableVoicings(newVoicings);
    const newIndex = 0;
    setSelectedVoicingIndex(newIndex);

    updateChordData(rootNote, chordType, newVoicings, newIndex);
    resetAnimations(setAnimations);
  }, [rootNote, chordType, updateChordData]); // updateChordData must be stable
  
const parseChordSequence = useCallback((sequence: string): ChordWithStrum[] => {
  console.log("Parsing sequence:", sequence);
  const chordRegex = /([A-G][b#]?)([^(]*)\(((?:[DU]\s?)+|[0-9]+)\)/g;
  const chords: ChordWithStrum[] = [];
  
  let currentSection = "";
  
  // Split the sequence by lines and process each line
  const lines = sequence.split('\n');
  
  for (const line of lines) {
    if (line.trim()) {
      const parts = line.split(':');
      if (parts.length > 1) {
        // This is a label line (e.g., "Verse:", "Chorus:")
        currentSection = parts[0].trim();
        console.log(`Section: ${currentSection}`);
      }
      
      const chordsInLine = parts[parts.length - 1].split(/(?<=\))\s*/);
      for (const chordPart of chordsInLine) {
        const trimmedChordPart = chordPart.trim();
        let match;
        // Reset lastIndex to ensure we start matching from the beginning of each chord part
        chordRegex.lastIndex = 0;
        if ((match = chordRegex.exec(trimmedChordPart)) !== null) {
          let [, rootStr, chordType, strumPattern] = match;
          
          if (!isValidRootNote(rootStr)) {
            console.error(`Invalid root note: ${rootStr}`);
            continue;
          }
          const root = rootStr as RootNote;
          chordType = chordType.trim() || 'major';
          let pattern: StrumPattern;
          if (strumPattern.includes('D') || strumPattern.includes('U')) {
            pattern = strumPattern.trim().split(/\s+/) as StrumDirection[];
          } else {
            pattern = [parseInt(strumPattern, 10)];
          }
          
          chords.push([root, chordType as ChordType, pattern, currentSection]);
        }
      }
    }
  }
  
  console.log("Parsed chords:", chords);
  return chords;
}, []);

	// Helper function to check if a string is a valid RootNote
	const isValidRootNote = (note: string): note is RootNote => {
	  const validRootNotes: RootNote[] = ['A', 'A#', 'Bb', 'B', 'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab'];
	  return validRootNotes.includes(note as RootNote);
	};

	const handlePlayCurrentChord = () => {
	  setIsChordPlaying(true);
	  
	  // Play the chord and get the total duration
	  const totalDuration = playChord(rootNote, chordType, [4]);
	  
	  // Set a timer to re-enable the button
	  setTimeout(() => {
		setIsChordPlaying(false);
	  }, totalDuration + 100); // Add a small buffer
	};


const playChord = useCallback((
  root: RootNote, 
  type: ChordType, 
  strumPattern: StrumPattern,
  style?: 'strum' | 'arpeggio',
  customChordPlaySpeed?: number,
  customBassDampening?: number,
  customDuration?: number,
  customAttackTime?: number,
  customDecayTime?: number,
  customSustainLevel?: number,
  customReleaseTime?: number,
  customVolume?: number
) => {
  const actualStyle = style || playStyle;
  const actualChordPlaySpeed = customChordPlaySpeed !== undefined ? customChordPlaySpeed : chordPlaySpeed;
  const actualBassDampening = customBassDampening !== undefined ? customBassDampening : bassDampening;
  const actualDuration = customDuration !== undefined ? customDuration : duration;
  // actualAttackTime, actualDecayTime, actualSustainLevel, actualReleaseTime removed as they are not used
  const actualVolume = customVolume !== undefined ? customVolume : volume;

  console.log(`Playing ${root} ${type} chord as ${actualStyle} with pattern ${strumPattern}`);

  let shapeToPlay: ChordPosition;
  // Check if the chord being played is the currently displayed global chord with available voicings
  if (root === rootNote && type === chordType && availableVoicings.length > 0 && selectedVoicingIndex < availableVoicings.length) {
    shapeToPlay = availableVoicings[selectedVoicingIndex].displayShape;
  } else {
    // Fallback for chords from sequence player or if no CAGED voicings for current global chord
    shapeToPlay = chordPositions[root]?.[type] ?? chordPositions.C.major;
  }
  
  const speedMultiplier = 0.5 + (actualChordPlaySpeed / 100);
  const baseDuration = actualStyle === 'arpeggio' ? 200 : 50; // ms
  
  let maxDelay = 0;

  const playStrum = (isUpstroke: boolean) => {
    const stringOrder = isUpstroke ? [5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5];
    stringOrder.forEach((stringIndexInRenderOrder, indexInStrum) => {
      // stringIndexInRenderOrder is 0 (low E) to 5 (high E)
      // shapeToPlay is indexed [lowE, ..., highE]
      const position = shapeToPlay[stringIndexInRenderOrder];
      const stringNumberApi = 6 - stringIndexInRenderOrder; // API string num 1 (high E) to 6 (low E)

      let midiNote: number | null = null;
      if (typeof position === 'number' && position >=0) {
        midiNote = getMidiNoteFromPosition(stringNumberApi.toString(), position);
      }

      if (midiNote !== null) {
        const confirmedMidiNote = midiNote; // TypeScript infers this as 'number'
        // stringIndexInRenderOrder is 0,1,2 for E,A,D (bass); 3,4,5 for G,B,e (treble)
        const stringVolume = (stringIndexInRenderOrder < 3 ? actualBassDampening : 1) * actualVolume;
        
        const delay = (indexInStrum * (baseDuration / shapeToPlay.filter(p => typeof p === 'number').length)) / speedMultiplier;
        maxDelay = Math.max(maxDelay, delay);
        
        setTimeout(() => {
          playAudioNoteWithAnimation(
            confirmedMidiNote, // Use the non-null confirmed variable
            stringNumberApi, // Use the correct string number for animation
            typeof position === 'number' ? position : -1, // Pass numeric position or -1
            isUpstroke,
            stringVolume,
            actualDuration
          );
        }, delay);
      }
    });
  };

  let totalDuration = 0;
  strumPattern.forEach((strum, index) => {
    if (typeof strum === 'number') {
      // Old format: play multiple downstrokes
      for (let i = 0; i < strum; i++) {
        setTimeout(() => playStrum(false), totalDuration);
        totalDuration += baseDuration / speedMultiplier;
      }
    } else {
      // New format: play according to the pattern
      setTimeout(() => playStrum(strum === 'U'), totalDuration);
      totalDuration += baseDuration / speedMultiplier;
    }
  });

  return totalDuration + actualDuration;
}, [
  playStyle,
  chordPlaySpeed,
  bassDampening,
  duration,
  // attackTime, // Removed, not used to call playAudioNoteWithAnimation
  // decayTime, // Removed
  // sustainLevel, // Removed
  // releaseTime, // Removed
  volume,
  playAudioNoteWithAnimation,
  // chordPositions,
  // getMidiNoteFromPosition, // Removed (stable import)
  // selectedGShape, // Removed as the state variable itself is removed
  // Dependencies for when current global chord is played with its selected voicing:
  availableVoicings,
  selectedVoicingIndex,
  rootNote, // global rootNote
  chordType // global chordType
]);

	// Removed unused handleChordChange useCallback

	const playSequence = useCallback(() => {
	  if (!isLooping && isPaused) {
		// If we're not looping and the sequence is paused, don't start playing
		return;
	  }

	  let chords: ChordWithStrum[];
	  let startIndex: number;
	  
	  if (isPaused && remainingChords.length > 0) {
		chords = [...remainingChords];
		startIndex = 0;
	  } else {
		chords = parseChordSequence(chordSequence);
		startIndex = currentChordIndex;
	  }

	  if (chords.length === 0) return;
	  
	  setIsPlaying(true);
	  setIsPaused(false);
	  
	  const playNextChord = (index: number) => {
		if (index >= chords.length) {
		  if (isLooping && !shouldStopAtEnd) {
			setCurrentChordIndex(0);
			setRemainingChords(chords);
			playNextChord(0);
		  } else {
			// Stop sequence
			setIsPlaying(false);
			setIsPaused(false);
			setCurrentChordIndex(0);
			setRemainingChords([]);
			setShouldStopAtEnd(false);  // Reset the flag
			const firstChord = chords[0];
			if (firstChord) {
			  const [root, type] = firstChord;
			  setRootNote(root);
			  setChordType(type);
			}
		  }
		  return;
		}

		const [root, type, strumPattern] = chords[index];
		setRootNote(root);
		setChordType(type);
		setCurrentChordIndex(index);
		updateChordData(root, type, [], 0); // Pass empty voicings and default index for sequence chords
		const strumInterval = 1000 / (chordPlaySpeed / 50); // Time between strums
		let totalDuration = 0;

		const playStrum = (strumIndex: number) => {
		  if (strumIndex < strumPattern.length) {
			const strumDuration = playChord(root, type, [strumPattern[strumIndex]], playStyle, chordPlaySpeed, bassDampening, duration, attackTime, decayTime, sustainLevel, releaseTime);
			totalDuration += strumDuration;

			timerRef.current = setTimeout(() => {
			  playStrum(strumIndex + 1);
			}, strumDuration);
		  } else {
			// Move to next chord
			setRemainingChords(chords.slice(index + 1));
			
			// Schedule the next chord
			timerRef.current = setTimeout(() => {
			  playNextChord(index + 1);
			}, Math.max(0, strumInterval - totalDuration));
		  }
		};

		// Start playing strums
		playStrum(0);
	  };

	  playNextChord(startIndex);

	  return () => {
		if (timerRef.current) clearTimeout(timerRef.current);
	  };
	}, [
	  chordSequence,
	  parseChordSequence,
	  setIsPlaying,
	  isLooping,
	  shouldStopAtEnd,
	  setRootNote,
	  setChordType,
	  setCurrentChordIndex,
	  playChord,
	  playStyle,
	  chordPlaySpeed,
	  bassDampening,
	  duration,
	  attackTime,
	  decayTime,
	  sustainLevel,
	  releaseTime,
	  currentChordIndex,
	  remainingChords,
	  setRemainingChords,
	  setShouldStopAtEnd,
	  timerRef,
	  isPaused,
	  updateChordData,
	]);

  const pauseSequence = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsPaused(true);
    setIsPlaying(false);
  }, []);
  
  
const stopSequence = useCallback(() => {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
  }
  setIsPlaying(false);
  setIsPaused(false);
  setCurrentChordIndex(0);
  setRemainingChords([]);

  // Reset to the first chord
  const firstChord = parseChordSequence(chordSequence)[0];
  if (firstChord) {
    const [root, type] = firstChord;
    setRootNote(root);
    setChordType(type);
  }
}, [chordSequence, parseChordSequence, setRootNote, setChordType]);

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseSequence();
    } else if (isPaused) {
      playSequence();
    } else {
      setRemainingChords([]);
	  setCurrentChordIndex(0); 
      playSequence();
    }
  };

  const handleStepBackward = () => {
    const chords = parseChordSequence(chordSequence);
    if (currentChordIndex > 0) {
      const newIndex = currentChordIndex - 1;
      const [root, type] = chords[newIndex];
      setRootNote(root);
      setChordType(type);
      setCurrentChordIndex(newIndex);
    }
  };

  const handleStepForward = () => {
    const chords = parseChordSequence(chordSequence);
    if (currentChordIndex < chords.length - 1) {
      const newIndex = currentChordIndex + 1;
      const [root, type] = chords[newIndex];
      setRootNote(root);
      setChordType(type);
      setCurrentChordIndex(newIndex);
    }
  };
  
  const handleSkipToStart = () => {
  const chords = parseChordSequence(chordSequence);
  if (chords.length > 0 && currentChordIndex !== 0) {
    const [root, type] = chords[0];
    setRootNote(root);
    setChordType(type);
    setCurrentChordIndex(0);
  }
};

const handleSkipToEnd = () => {
  const chords = parseChordSequence(chordSequence);
  if (chords.length > 0 && currentChordIndex !== chords.length - 1) {
    const lastIndex = chords.length - 1;
    const [root, type] = chords[lastIndex];
    setRootNote(root);
    setChordType(type);
    setCurrentChordIndex(lastIndex);
  }
};
  

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);



  const getChordFunction = useCallback((note: Note, rootNote: RootNote, chordType: ChordType): string => {
    const interval = (NOTE_SEQUENCE.indexOf(note) - NOTE_SEQUENCE.indexOf(rootNote) + 12) % 12;
    switch (interval) {
      case 0: return 'R';
      case 2: return '2';
      case 3: return chordType === 'minor' || chordType === 'm7' || chordType === 'dim' ? 'b3' : '3';
      case 4: return '3';
      case 5: return '4';
      case 6: return chordType === 'dim' ? 'b5' : '4#';
      case 7: return '5';
      case 9: return '6';
      case 10: return chordType === '7' || chordType === 'm7' || chordType === '7sus4' ? 'b7' : '7';
      case 11: return '7';
      default: return note;
    }
  }, []);

  const getCurrentChordName = () => {
    const typeLabel = CHORD_TYPE_LABELS[chordType] || chordType;
    return `${rootNote}${typeLabel === 'major' ? '' : typeLabel}`;
  };
  
  const handleChordSequenceChange = (newSequence: string | ((prevState: string) => string)) => {
    setChordSequence(newSequence);
    // If you need to perform any additional actions when the sequence changes,
    // you can do so here
  };

const renderCurrentInfo = () => {
  if (chordSequence && isSequenceValid) {
    const chords = parseChordSequence(chordSequence);
    let currentSection = "";
    return (
      <div>
        Current Sequence: 
        {chords.map((chord, index) => {
          const [root, type, strumPattern, section] = chord;
          const chordName = `${root}${type === 'major' ? '' : type}`;
          const chordDisplay = `${chordName}(${Array.isArray(strumPattern) ? strumPattern.join(' ') : strumPattern})`;
          
          let sectionHeader = null;
          if (section !== currentSection) {
            currentSection = section;
            sectionHeader = (
              <React.Fragment key={`section-${index}`}>
                <br />{section ? `${section}:` : ''}<br />
              </React.Fragment>
            );
          }
          
          return (
            <React.Fragment key={`chord-${index}`}>
              {sectionHeader}
              <span style={{
                fontWeight: index === currentChordIndex ? 'bold' : 'normal',
                marginRight: '5px'
              }}>
                {chordDisplay}
                {index < chords.length - 1 ? ', ' : ''}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    );
  } else if (chordSequence && !isSequenceValid) {
    return (
      <div>Current Sequence: <span style={{ color: 'red' }}>Invalid sequence</span></div>
    );
  } else {
    return (
      <div>Current Chord: {getCurrentChordName()}</div>
    );
  }
};


const renderNotePosition = useCallback((data: ChordDataItem, visualIndex: number, actualStringNumber: number) => {
  const handleClick = (event: React.MouseEvent<SVGElement>) => {
    event.stopPropagation();
    event.preventDefault();
    if (data.midiNote !== null) {
      console.log(`Clicked note: ${data.noteName} (MIDI: ${data.midiNote}) on string ${actualStringNumber}, fret ${data.position}`);
      playAudioNoteWithAnimation(
        data.midiNote,
        data.stringNumber,
        data.position,
        false, // isUpstroke - set to false for individual note clicks
        volume,
        duration
      );
    }
  };

  const commonProps = {
    onClick: handleClick,
    style: { cursor: 'pointer' },
  };

  // Correct the finger assignment
  const stringIndex = 5 - visualIndex; // Reverse the index to match the chord data array (0 for low E, 5 for high E)
  const currentFretForString = data.position; // Actual fret of the note on this string for the current voicing

  let fingerLetter: string | number = '0';

  if (chordType === 'major' && availableVoicings.length > 0 && selectedVoicingIndex < availableVoicings.length) {
    const currentVoicing = availableVoicings[selectedVoicingIndex];
    const baseShapeName = currentVoicing.shapeName;
    const fretOffset = currentVoicing.fretOffset;
    const originalShapeRoot = CAGED_SHAPES[baseShapeName]?.baseRootNote;

    if (originalShapeRoot) {
      const baseFingeringForString = chordFingerData[originalShapeRoot as RootNote]?.major?.[stringIndex] ?? '0';

      if ((baseShapeName === 'E' || baseShapeName === 'A') && fretOffset > 0) {
        if (currentFretForString === fretOffset) {
          fingerLetter = 'i'; // Part of the barre
        } else if (typeof baseFingeringForString === 'string' && baseFingeringForString !== '0' && currentFretForString > fretOffset) {
          // Note is fretted higher than the barre, use original non-open finger from base shape
          fingerLetter = baseFingeringForString;
        } else if (currentFretForString === -1) { // Muted string
          fingerLetter = '0'; // Maps to unused/muted color
        } else {
          // Default for open strings in base shape now above barre, or other complex cases
          fingerLetter = '0';
        }
      } else {
        // For G, C, D shapes, or E/A shapes in open position (fretOffset === 0)
        fingerLetter = baseFingeringForString;
      }
    } else {
      fingerLetter = '0'; // Fallback if originalShapeRoot is somehow undefined
    }
  } else {
    // Fallback for non-major chords or if no CAGED voicings are determined
    fingerLetter = chordFingerData[rootNote]?.[chordType]?.[stringIndex] ?? '0';
  }

  const fingerColorMap: { [key: string]: string } = {
    '0': fingerColors[0],  // Open string or unused
    'i': fingerColors[1],  // Index finger
    'm': fingerColors[2],  // Middle finger
    'r': fingerColors[3],  // Ring finger
    'a': fingerColors[4],  // Pinky
  };
  const fingerColor = fingerColorMap[fingerLetter];

  if (data.position >= 0) { // Include open strings in this condition
    return (
      <g key={`position-${visualIndex}`} {...commonProps}>
        <circle 
          cx={data.position === 0 ? 10 : (20 + data.position * 100 - 50)}
          cy={40 + visualIndex * 30} 
          r={data.position === 0 ? 8 : 12}
          fill={fingerColor} 
          stroke={data.isRootNote ? "#CD853F" : fingerColor} 
          strokeWidth={data.isRootNote ? 3 : 1}
        />
        <text 
          x={data.position === 0 ? 10 : (20 + data.position * 100 - 50)}
          y={45 + visualIndex * 30} 
          fontFamily="Arial" 
          fontSize={12} 
          fill="black" 
          textAnchor="middle"
          fontWeight={data.isRootNote ? "bold" : "normal"}
        >
          {data.displayText}
        </text>
      </g>
    );
  } else {
    return (
      <text 
        key={`mute-${visualIndex}`} 
        x={10} 
        y={45 + visualIndex * 30} 
        fontFamily="Arial" 
        fontSize={20} 
        fill="#E0E0E0"
        textAnchor="middle"
      >
        ×
      </text>
    );
  }
	}, [playAudioNoteWithAnimation, volume, duration, rootNote, chordType, availableVoicings, selectedVoicingIndex]);

const FingerLegend: React.FC = () => {
  const legendItems = [
    { color: fingerColors[1], label: 'Index (i)' },
    { color: fingerColors[2], label: 'Middle (m)' },
    { color: fingerColors[3], label: 'Ring (r)' },
    { color: fingerColors[4], label: 'Pinky (a)' },
    { color: fingerColors[0], label: 'Open/Unused' },
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px', marginBottom: '10px' }}>
	  		Finger Color Guide: 
      {legendItems.map(({ color, label }, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}>
          <div style={{ 
            width: '15px', 
            height: '15px', 
            borderRadius: '50%', 
            backgroundColor: color, 
            marginRight: '5px' 
          }} />
          <span style={{ fontSize: '12px' }}>{label}</span>
        </div>
      ))}
    </div>
  );
};

const renderFretboard = useCallback(() => {
  // Determine the shape to display based on selected voicing or fallback
  let displayPositions: ChordPosition;
  let currentFretOffset = 0; // For barre calculation
  let activeChordDataToUse = chordData; // Default to current global chordData

  if (chordType === 'major' && availableVoicings.length > 0 && selectedVoicingIndex < availableVoicings.length) {
    const currentVoicing = availableVoicings[selectedVoicingIndex];
    displayPositions = currentVoicing.displayShape;
    currentFretOffset = currentVoicing.fretOffset;
    // Re-generate chordData specifically for this display, ensuring it matches the voicing
    activeChordDataToUse = displayPositions.map((pos, index) => {
        const stringNumber = 6 - index;
        const stringTune = STRING_TUNING[index];
        const noteVal = typeof pos === 'number' && pos >= 0 ? getNote(stringTune, pos) : 'X';
        return {
            stringNumber,
            position: typeof pos === 'number' ? pos : -1,
            note: noteVal,
            displayText: showFunction && noteVal !== 'X' ? getChordFunction(noteVal, rootNote, chordType) : noteVal,
            isRootNote: noteVal === rootNote,
            midiNote: typeof pos === 'number' && pos >= 0 ? getMidiNoteFromPosition(stringNumber, pos) : null,
            noteName: typeof pos === 'number' && pos >= 0 && getMidiNoteFromPosition(stringNumber, pos) !== null ? midiToNote(getMidiNoteFromPosition(stringNumber, pos)!) : 'X',
        };
    });
  } else {
    // This case uses the existing global chordData which is derived from chordPositions[rootNote][chordType]
    // Ensure displayPositions reflects this for barreInfo calculation if needed, though barreInfo is mainly for CAGED.
    displayPositions = chordPositions[rootNote]?.[chordType] ?? chordPositions.C.major;
    // activeChordDataToUse remains global chordData
  }

  const barreInfo = (chordType === 'major' && currentFretOffset > 0 && displayPositions) ?
                    getBarreInfo(displayPositions, currentFretOffset) : null;

  // Mapping logic (Controller)
	const mapDataToVisual = (data: ChordDataItem, visualIndex: number) => {
	  return renderNotePosition(data, visualIndex, data.stringNumber);
	};

  // Helper function to render strings
const renderString = (index: number) => (
  <line 
    key={`string-${index}`} 
    x1={20} 
    y1={40 + index * 30} 
    x2={1220} // Extended for 12 frets
    y2={40 + index * 30} 
    stroke="#C0C0C0" 
    strokeWidth={index + 1} // Thinnest at top (index 0), thickest at bottom (index 5)
  />
);

  // Helper function to render string labels
  const renderStringLabel = (note: string, index: number) => (
    <text 
      key={`string-label-${index}`} 
      x={1225} // Adjusted for 12 frets
      y={45 + index * 30} 
      fontFamily="Arial" 
      fontSize={14} 
      fill="white" 
      textAnchor="start"
    >
      {note}
    </text>
  );

  // View rendering
  return (
    <svg width="1350" height="240" viewBox="0 0 1350 240"> {/* Increased width for 12 frets */}
      <rect x="0" y="0" width="1350" height="240" fill="#1e3a5f" />
      <rect x="20" y="20" width={12 * 100} height="180" fill="#3D3110" /> {/* Increased width for 12 frets */}
      
      {/* Frets */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((fret) => ( // Extended to 12 frets
        <line key={`fret-${fret}`} x1={20 + fret * 100} y1={20} x2={20 + fret * 100} y2={200} stroke="#D4AF37" strokeWidth={fret === 0 ? 4 : 2} />
      ))}
      
      {/* Strings */}
      {[0, 1, 2, 3, 4, 5].map(renderString)}
      
      {/* Barre Line - Draw before finger positions */}
      {barreInfo && ( // barreInfo.barreFret > 0 is implicitly handled by getBarreInfo returning null if offset <=0
        <line
          key="barre-line"
          x1={20 + barreInfo.barreFret * 100 - 50}
          y1={40 + barreInfo.startString * 30}
          x2={20 + barreInfo.barreFret * 100 - 50}
          y2={40 + barreInfo.endString * 30}
          stroke={fingerColors[1]} // Use index finger color for barre
          strokeWidth="18"
          strokeLinecap="round"
        />
      )}

      {/* String labels */}
      {STRING_TUNING.slice().reverse().map(renderStringLabel)}
      
      {/* Finger positions */}
      {activeChordDataToUse.map((data, index) => mapDataToVisual(data, 5 - index))}
      
      {/* Fret numbers */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((fret) => ( // Extended to 12 frets
        <text 
          key={`fret-label-${fret}`} 
          x={20 + fret * 100 - 50} 
          y={225} 
          fontFamily="Arial" 
          fontSize={14} 
          fill="white" 
          textAnchor="middle"
        >
          {fret}
        </text>
      ))}
	  <AnimationLayer chordData={activeChordDataToUse} animations={animations}/>
    </svg>
  );
}, [rootNote, chordType, showFunction, getNote, getChordFunction, renderNotePosition, animations, availableVoicings, selectedVoicingIndex, chordData]); // Added chordData


	 if (isLoading) {
		return (
		  <div>
			<h2>Loading audio samples...</h2>
			<progress value={loadingProgress} max="100" />
			<p>{Math.round(loadingProgress)}% loaded</p>
			{errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
		  </div>
		);
	  }

	  if (errorMessage) {
		return (
		  <div>
			<h2>Error loading audio samples</h2>
			<p>{errorMessage}</p>
			<button onClick={initializeAudio}>Retry</button>
		  </div>
		);
	  }

	return (
	  <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
		<h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Interactive Chord Explorer</h2>
		
		{/* Persistent section */}
		<div style={{ marginBottom: '20px' }}>
          <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
            {renderFretboard()}
          </div>
		  <div>
			<label>
			  <input
				type="checkbox"
				checked={showFunction}
				onChange={(e) => setShowFunction(e.target.checked)}
			  />
			  Show Chord Function
			</label>
		  </div>
          {availableVoicings.length > 0 && chordType === 'major' && ( // Only show for major chords with CAGED voicings
            <div style={{ marginTop: '10px', marginBottom: '10px', textAlign: 'center' }}>
              Voicings:
              {availableVoicings.map((voicing, index) => (
                <button
                  key={`${voicing.shapeName}-${voicing.fretOffset}`}
                  onClick={() => setSelectedVoicingIndex(index)}
                  disabled={index === selectedVoicingIndex}
                  style={{ marginLeft: '5px',
                           backgroundColor: index === selectedVoicingIndex ? '#ddd' : '#fff' }}
                  title={`Plays at fret ${voicing.fretOffset +1}`}
                >
                  {voicing.shapeName}-shape (Fret {voicing.fretOffset})
                </button>
              ))}
            </div>
          )}
		  	  <FingerLegend />
		  <p style={{ textAlign: 'center', marginBottom: '20px', fontStyle: 'italic' }}>
			Try our preloaded sequence or create your own in the Sequence Editor tab!
		  </p>
		  {renderCurrentInfo()}
			  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

				  <button onClick={handleSkipToStart} disabled={isPlaying} style={iconButtonStyle}>
					<SkipToStartIcon />
				  </button>
				  <button onClick={handleStepBackward} disabled={isPlaying} style={iconButtonStyle}>
					<StepBackwardIcon />
				  </button>
				  <button 
					onClick={handlePlayPause} 
					style={{ ...iconButtonStyle, padding: '10px' }}
				  >
					{isPlaying ? <PauseIcon /> : <PlayIcon />}
				  </button>
				  <button 
					onClick={stopSequence}
					style={{ ...iconButtonStyle, padding: '10px' }}
				  >
					<StopIcon />
				  </button>
				  <button onClick={handleStepForward} disabled={isPlaying} style={iconButtonStyle}>
					<StepForwardIcon />
				  </button>
				  <button onClick={handleSkipToEnd} disabled={isPlaying} style={iconButtonStyle}>
						<SkipToEndIcon />
				  </button>
				  <button 
					  onClick={handlePlayCurrentChord}
					  disabled={isChordPlaying}
					  style={{
						...iconButtonStyle,
						backgroundColor: isChordPlaying ? '#cccccc' : 'transparent',
						color: isChordPlaying ? '#666666' : 'currentColor',
					  }}
					  title="Play Current Chord"
					>
					  <MusicalSymbolIcon />
				  </button>
				  <button 
					onClick={toggleLoop}
					style={{
					  ...iconButtonStyle,
					  backgroundColor: isLooping ? '#4CAF50' : '#f44336',
					}}
				  >
					<RepeatIcon />
				  </button>

				</div>
			  </div>
		</div>

		{/* Tab buttons */}
		<div style={{ display: 'flex', borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
		  <button 
			onClick={() => setActiveTab('browser')} 
			style={{
			  padding: '10px 20px',
			  backgroundColor: activeTab === 'browser' ? '#f0f0f0' : 'white',
			  border: 'none',
			  borderBottom: activeTab === 'browser' ? '2px solid #333' : 'none',
			  cursor: 'pointer'
			}}
		  >
			Chord Browser
		  </button>
        <button 
          onClick={() => setActiveTab('sequence')} 
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'sequence' ? '#f0f0f0' : 'white',
            border: 'none',
            borderBottom: activeTab === 'sequence' ? '2px solid #333' : 'none',
            cursor: 'pointer'
          }}
        >
          Sequence Editor
        </button>
		<button 
			onClick={() => setActiveTab('sound')} 
			style={{
			  padding: '10px 20px',
			  backgroundColor: activeTab === 'sound' ? '#f0f0f0' : 'white',
			  border: 'none',
			  borderBottom: activeTab === 'sound' ? '2px solid #333' : 'none',
			  cursor: 'pointer'
			}}
		  >
			Sound Controls
		  </button>
		</div>

		{/* Tab content */}
		{activeTab === 'browser' && (
			<div>
			  <ChordBrowser 
				rootNote={rootNote}
				setRootNote={setRootNote}
				chordType={chordType}
				setChordType={setChordType}
				playChord={(newRoot, newType) => playChord(newRoot, newType, [4])}
			  />
			</div>
		  )}
		  
		  {activeTab === 'sequence' && (
			<div>
			  <p>{introTexts.chordSequenceGenerator}</p>
			  <SequenceEditor 
				chordSequence={chordSequence}
				setChordSequence={handleChordSequenceChange}
				setSequenceValidity={setIsSequenceValid}
			  />
			</div>
		  )}

		{activeTab === 'sound' && (
		  <div>
			  <p>{introTexts.soundControls}</p>
			  <SoundControls
				playStyle={playStyle}
				setPlayStyle={setPlayStyle}
				bassDampening={bassDampening}
				setBassDampening={setBassDampening}
				volume={volume}
				setVolume={setVolume}
				attackTime={attackTime}
				setAttackTime={setAttackTime}
				decayTime={decayTime}
				setDecayTime={setDecayTime}
				sustainLevel={sustainLevel}
				setSustainLevel={setSustainLevel}
				releaseTime={releaseTime}
				setReleaseTime={setReleaseTime}
				chordPlaySpeed={chordPlaySpeed}
				setChordPlaySpeed={setChordPlaySpeed}
				duration={duration}
				setDuration={setDuration}
			  />
		  </div>
		)}
		
		{!isInitialized && (
		  <button onClick={initializeAudio}>Initialize Audio</button>
		)}
	  <AnimationLayer chordData={chordData} animations={animations} />
      <style>{animationStyles} </style>
	  </div>
	);
};

const iconButtonStyle = {
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '5px',
  margin: '0 5px',
  borderRadius: '50%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};
export default GuitarChordApp;