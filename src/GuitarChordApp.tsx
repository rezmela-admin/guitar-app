import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChordDataItem, RootNote, ChordType, Note, ChordPosition, STRING_TUNING, NOTE_SEQUENCE, chordPositions, CHORD_TYPE_LABELS, getMidiNoteFromPosition, midiToNote, StrumPattern,StrumDirection,ChordWithStrum } from './types';
import { getBarreInfo } from './transpose'; // Removed transposeShape
import { CAGED_SHAPES } from './cagedShapes'; 
import { getCagedVoicings, VoicingInfo } from './voicingUtils'; 
import ChordBrowser from './ChordBrowser';
import { useAudioSamples } from './hooks/useAudioSamples';
// Step/Skip icons removed as they are now in AdvancedPlaybackControls.tsx
import { PlayIcon, PauseIcon, RepeatIcon, StopIcon, MusicalSymbolIcon } from './IconComponents';
// import SequenceEditor from './SequenceEditor'; // Old editor, to be removed
import ManualSequenceEditor from './ManualSequenceEditor'; // New
import SequenceFeatures from './SequenceFeatures'; // New
import AdvancedPlaybackControls from './AdvancedPlaybackControls'; // New
import SoundControls from './SoundControls';
import Modal from './Modal'; // Import the Modal component
// import { introTexts } from './appIntroTexts'; // Already removed, ensure it stays removed
import { AnimationLayer, triggerNoteAnimation, resetAnimations, animationStyles } from './ChordAnimations';
import { chordFingerData, fingerColors } from './ChordFingerData';

const GuitarChordApp: React.FC = () => {

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null); // Added
  const [showFunction, setShowFunction] = useState(false);
  const [volume, setVolume] = useState(0.5); // Initialize volume to half max.
  // const [activeTab, setActiveTab] = useState<'browser' | 'sequence'>('browser'); // Removed 'sound' tab - Now removing entirely
  // Existing state variables
  const [rootNote, setRootNote] = useState<RootNote>('D');
  const [chordType, setChordType] = useState<ChordType>('major');
  const [chordSequence, setChordSequence] = useState<string>("D(D D U D), A(D D U D), Bm(D D U D), F#m(D D U D), G(D D U D), D(D D U D), G(D D U D), A(D D U D)");
  // Initial validation will be set by validateSequence function defined below
  const [isSequenceValid, setIsSequenceValid] = useState<boolean>(false); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  // const [selectedGShape, setSelectedGShape] = useState<'E-shape' | 'A-shape'>('E-shape'); // Removed
  const [availableVoicings, setAvailableVoicings] = useState<VoicingInfo[]>([]); // Added
  const [selectedVoicingIndex, setSelectedVoicingIndex] = useState<number>(0); // Added

  // Modal visibility states
  const [showChordBrowserModal, setShowChordBrowserModal] = useState(false);
  const [showSequenceEditorModal, setShowSequenceEditorModal] = useState(false);
  const [showGetSequencesModal, setShowGetSequencesModal] = useState(false);
  const [showSoundSettingsModal, setShowSoundSettingsModal] = useState(false);
  const [showAdvancedPlaybackModal, setShowAdvancedPlaybackModal] = useState(false); // Optional for now

  // Updated or new state variables
  const [playStyle, setPlayStyle] = useState<'strum' | 'arpeggio'>('arpeggio');
  const [bassDampening, setBassDampening] = useState(0.7);
  const [attackTime, setAttackTime] = useState(0.01);
  const [decayTime, setDecayTime] = useState(0.15);
  const [sustainLevel, setSustainLevel] = useState(0.2);
  const [releaseTime, setReleaseTime] = useState(0.3);
  const [reverbSendLevel, setReverbSendLevel] = useState(0.4); // Added
  const [reverbOutputLevel, setReverbOutputLevel] = useState(0.7); // Added
  const [isChordPlaying, setIsChordPlaying] = useState(false);
  const [chordPlaySpeed, setChordPlaySpeed] = useState(11);
  const [upstrokeSpeedFactor, setUpstrokeSpeedFactor] = useState(2.0);
  const [duration, setDuration] = useState(495);
  const [arpeggioBaseDuration, setArpeggioBaseDuration] = useState(350);
  
  const [isPaused, setIsPaused] = useState(false);
  const [remainingChords, setRemainingChords] = useState<ChordWithStrum[]>([]);
  // const [elapsedTime, setElapsedTime] = useState(0); // Removed
  // const intervalRef = useRef<NodeJS.Timeout | null>(null); // Removed
  const [shouldStopAtEnd, setShouldStopAtEnd] = useState(false);
  const [chordData, setChordData] = useState<ChordDataItem[]>([]);
  const [animations, setAnimations] = useState<JSX.Element[]>([]);

// Copied from SequenceEditor.tsx for initial validation and use within GuitarChordApp
const validateSequence = (sequence: string): boolean => {
  if (sequence.trim() === "") {
    return true; // Empty sequence is considered valid
  }
  const chordPattern = /([A-G][b#]?)([^(]*)\(((?:[DU]\s?)+|[0-9]+)\)/;
  const lines = sequence.split('\n');
  return lines.some(line => {
    const parts = line.split(':');
    if (parts.length === 0) return false;
    const chordsSection = parts[parts.length - 1];
    return typeof chordsSection === 'string' && chordsSection.split(',').some(part => chordPattern.test(part.trim()));
  });
};

  useEffect(() => {
    // Initialize isSequenceValid based on the default sequence
    // This will also re-run if chordSequence is changed by other means,
    // ensuring isSequenceValid stays in sync.
    setIsSequenceValid(validateSequence(chordSequence));
  }, [chordSequence]); // Added chordSequence

  
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
  duration: number,
  currentReverbSend: number, // New parameter
  currentReverbOutput: number // New parameter
) => {
  console.log(`Attempting to play and animate note: ${midiNote}`);
  playAudioNote( // This is the playNote from useAudioSamples
    midiNote, 
    volume, 
    duration, 
    attackTime, // global state attackTime
    decayTime,  // global state decayTime
    sustainLevel, // global state sustainLevel
    releaseTime,  // global state releaseTime
    currentReverbSend, // Pass through
    currentReverbOutput // Pass through
  );
  triggerNoteAnimation(midiNote, stringNumber, position, isUpstroke, setAnimations);
}, [playAudioNote, attackTime, decayTime, sustainLevel, releaseTime, setAnimations]);

  
	   useEffect(() => {
	   initializeAudio();
	   }, [initializeAudio]);

  // getNote (original definition is earlier, this one is the duplicate to be removed)
  // const getNote = useCallback((stringNote: Note, fret: number): Note => {
  //   const startIndex = NOTE_SEQUENCE.indexOf(stringNote);
  //   return NOTE_SEQUENCE[(startIndex + fret) % 12];
  // }, []);

  // getChordFunction is defined before updateChordData
  const getChordFunction = useCallback((note: Note, rootNoteValue: RootNote, chordTypeValue: ChordType): string => {
    const interval = (NOTE_SEQUENCE.indexOf(note) - NOTE_SEQUENCE.indexOf(rootNoteValue) + 12) % 12;
    switch (interval) {
      case 0: return 'R';
      case 2: return '2';
      case 3: return chordTypeValue === 'minor' || chordTypeValue === 'm7' || chordTypeValue === 'dim' ? 'b3' : '3';
      case 4: return '3';
      case 5: return '4';
      case 6: return chordTypeValue === 'dim' ? 'b5' : '4#';
      case 7: return '5';
      case 9: return '6';
      case 10: return chordTypeValue === '7' || chordTypeValue === 'm7' || chordTypeValue === '7sus4' ? 'b7' : '7';
      case 11: return '7';
      default: return note;
    }
  }, []); // NOTE_SEQUENCE is a global constant, so no need to list it as a dep if it's truly global/static.
           // If it were a prop or state, it would be needed. Assuming it's a top-level const.
	   
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
        // displayText: note, // Old version
        displayText: showFunction && note !== 'X' ? getChordFunction(note as Note, root, type) : note,
        isRootNote: note === root, 
        midiNote,
        noteName: midiNote !== null ? midiToNote(midiNote) : 'X'
      };
    });
    console.log('Updated chord data:', newChordData);
    setChordData(newChordData);
  }, [getNote, showFunction, getChordFunction]);
  
  // Update availableVoicings and chordData when rootNote or chordType changes
  useEffect(() => {
    const newVoicings = getCagedVoicings(rootNote, chordType);
    setAvailableVoicings(newVoicings);
    const newIndex = 0; 
    // Check if selectedVoicingIndex needs to be reset or if it's still valid with new voicings.
    // For simplicity, always reset to 0 when root/type changes.
    // A more complex logic might try to preserve the selected index if the voicing still exists.
    setSelectedVoicingIndex(newIndex);
    
    updateChordData(rootNote, chordType, newVoicings, newIndex);
    resetAnimations(setAnimations);
  }, [rootNote, chordType, updateChordData]);

  // New useEffect to update chordData when selectedVoicingIndex changes
  useEffect(() => {
    // Only run if there are available voicings and a valid index is selected
    if (availableVoicings.length > 0 && selectedVoicingIndex >= 0 && selectedVoicingIndex < availableVoicings.length) {
      updateChordData(rootNote, chordType, availableVoicings, selectedVoicingIndex);
      resetAnimations(setAnimations); // Also reset animations when voicing changes
    }
    // If no voicings are available or index is bad, the primary useEffect for rootNote/chordType
    // should have already set a default chordData. This effect specifically handles voicing selection.
  }, [selectedVoicingIndex, availableVoicings, rootNote, chordType, updateChordData]);


  useEffect(() => {
    if (scrollContainerRef.current && availableVoicings.length > 0 && selectedVoicingIndex < availableVoicings.length) {
      const currentVoicing = availableVoicings[selectedVoicingIndex];
      
      let targetFretToView = currentVoicing.fretOffset;

      let minFretInShape = -1;
      for (const pos of currentVoicing.displayShape) {
        if (typeof pos === 'number' && pos >= 0) {
          if (minFretInShape === -1 || pos < minFretInShape) {
            minFretInShape = pos;
          }
        }
      }
      
      if (minFretInShape !== -1) {
          targetFretToView = minFretInShape;
      }

      let targetScrollLeft = 0;
      if (targetFretToView > 1) { 
        // If the chord's lowest fret is 2 or higher, scroll to show the fret *before* it.
        targetScrollLeft = 20 + ((targetFretToView - 1) - 1) * 100; 
      } else if (targetFretToView === 1) {
        // If chord starts at fret 1, scroll to the beginning (show nut).
        targetScrollLeft = 0;
      } else {
        // If chord starts at fret 0 (nut) or targetFretToView is invalid, scroll to beginning.
        targetScrollLeft = 0;
      }
      targetScrollLeft = Math.max(0, targetScrollLeft); // Ensure not negative
      
      const svgWidth = 1350; 
      const containerWidth = scrollContainerRef.current.offsetWidth;
      // if (targetScrollLeft + containerWidth > svgWidth && svgWidth > containerWidth) { // ensure svg is actually wider
      //     targetScrollLeft = Math.max(0, svgWidth - containerWidth);
      // } else if (svgWidth <= containerWidth) { // if svg is not wider, scroll to 0
      //     targetScrollLeft = 0;
      // }
      // Refined overscroll logic:
      if (svgWidth <= containerWidth) { 
        targetScrollLeft = 0; // If SVG fits, no scroll needed from left.
      } else if (targetScrollLeft + containerWidth > svgWidth) { 
        targetScrollLeft = svgWidth - containerWidth; // Prevent overscrolling right.
      }
      targetScrollLeft = Math.max(0, targetScrollLeft); // Ensure it's not negative after adjustments


      scrollContainerRef.current.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth',
      });
    } else if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: 0,
        behavior: 'smooth',
      });
    }
  }, [selectedVoicingIndex, availableVoicings, chordData]);
  
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
  const baseStrumDuration = 50; // ms for strum
  // const baseArpeggioDuration = arpeggioBaseDuration; // ms for arpeggio - This will be defined by the state variable
  const baseDuration = actualStyle === 'arpeggio' ? arpeggioBaseDuration : baseStrumDuration;
  
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
        
        let delay = (indexInStrum * (baseDuration / shapeToPlay.filter(p => typeof p === 'number').length)) / speedMultiplier;
        if (isUpstroke) {
          delay /= upstrokeSpeedFactor;
        }
        maxDelay = Math.max(maxDelay, delay);
        
        setTimeout(() => {
          playAudioNoteWithAnimation(
            confirmedMidiNote, // Use the non-null confirmed variable
            stringNumberApi, // Use the correct string number for animation
            typeof position === 'number' ? position : -1, // Pass numeric position or -1
            isUpstroke,
            stringVolume,
            actualDuration,
            reverbSendLevel, 
            reverbOutputLevel
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
  volume,
  playAudioNoteWithAnimation,
  availableVoicings, 
  selectedVoicingIndex,
  rootNote, 
  chordType,
  reverbSendLevel, // Added
  reverbOutputLevel, // Added
  arpeggioBaseDuration,
  upstrokeSpeedFactor
]);

	// Removed unused handleChordChange useCallback

	const playSequence = useCallback(() => {
    if (!isSequenceValid) {
      console.error("Attempting to play an invalid sequence. Aborting playback.");
      alert("The current sequence is invalid and cannot be played. Please correct it in the Sequence Editor and load it again.");
      setIsPlaying(false); // Ensure UI reflects that playback is not active
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null; 
    }
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
		// updateChordData(root, type, [], 0); // Removed: This is now handled by useEffect on rootNote/chordType change
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
	  isSequenceValid, // Added to satisfy exhaustive-deps
	  // updateChordData, // Removed as per ESLint warning (indirectly called via setRootNote/setChordType)
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

  // getChordFunction was moved above updateChordData

  const getCurrentChordName = () => {
    const typeLabel = CHORD_TYPE_LABELS[chordType] || chordType;
    return `${rootNote}${typeLabel === 'major' ? '' : typeLabel}`;
  };
  
// Removed unused handleChordSequenceChange function
// const handleChordSequenceChange = (newSequence: string | ((prevState: string) => string)) => {
//   setChordSequence(newSequence);
//   // If you need to perform any additional actions when the sequence changes,
//   // you can do so here
// };

const renderCurrentInfo = () => {
  if (chordSequence) { // Always try to display the sequence text
    const chords = parseChordSequence(chordSequence); // Parse it for display
    let currentSection = "";
    const sequenceIsValidDisplay = isSequenceValid ? 
      null : 
      <span style={{ color: 'red', fontWeight: 'bold' }}> (Warning: This sequence is invalid and may not play correctly!)</span>;

    return (
      <div>
        Current Loaded Sequence: 
        {sequenceIsValidDisplay}
        <br />
        {chords.map((chord, index) => {
          const [root, type, strumPattern, section] = chord;
          const chordName = `${root}${type === 'major' ? '' : type}`;
          const chordDisplay = `${chordName}(${Array.isArray(strumPattern) ? strumPattern.join(' ') : strumPattern})`;
          
          let sectionHeader = null;
          if (section !== currentSection) {
            currentSection = section;
            sectionHeader = (
              <React.Fragment key={`section-${index}`}>
                <br />{section ? `${section}: ` : ''}
              </React.Fragment>
            );
          }
          
          return (
            <React.Fragment key={`chord-${index}`}>
              {sectionHeader}
              <span style={{
                fontWeight: index === currentChordIndex && isPlaying ? 'bold' : 'normal', // Bold only if playing and current
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
  }  else { // Fallback if chordSequence is empty or undefined (though state is initialized)
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
        duration,
        reverbSendLevel, 
        reverbOutputLevel
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

  if ((chordType === 'major' || chordType === 'minor' || chordType === 'm') && availableVoicings.length > 0 && selectedVoicingIndex < availableVoicings.length) {
    const currentVoicing = availableVoicings[selectedVoicingIndex];
    const baseShapeName = currentVoicing.shapeName;
    const fretOffset = currentVoicing.fretOffset;
    const originalShapeRoot = CAGED_SHAPES[baseShapeName]?.baseRootNote;

    if (originalShapeRoot) {
      const typeToLookup = (chordType === 'm' ? 'minor' : chordType) as ChordType;
      let baseFingeringForString = chordFingerData[originalShapeRoot as RootNote]?.[typeToLookup]?.[stringIndex];

      if (baseFingeringForString === undefined) {
        // If specific minor/major fingering for base shape is not found, default to '0'
        // This handles cases like G-minor where chordFingerData.G.minor might not exist.
        baseFingeringForString = '0';
      }

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
      fingerLetter = '0'; // Fallback if originalShapeRoot is somehow undefined (should not happen with valid CAGED_SHAPES)
    }
  } else {
    // Fallback for non-CAGED scenarios or if no voicings are available
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
	}, [playAudioNoteWithAnimation, volume, duration, rootNote, chordType, availableVoicings, selectedVoicingIndex, reverbSendLevel, reverbOutputLevel]); // Added reverb levels

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
  const activeChordDataToUse = chordData; // Use chordData directly, it's now always up-to-date.

  let displayPositionsForBarre: ChordPosition | undefined;
  let currentFretOffset = 0;

  // Determine fretOffset and shape for barre calculation based on current selection
  // Ensure this logic correctly covers all chord types that might have voicings (major, minor, m)
  if ((chordType === 'major' || chordType === 'minor' || chordType === 'm') && availableVoicings.length > 0 && selectedVoicingIndex < availableVoicings.length) {
    const currentVoicing = availableVoicings[selectedVoicingIndex];
    displayPositionsForBarre = currentVoicing.displayShape;
    currentFretOffset = currentVoicing.fretOffset;
  } else {
    // Fallback for non-CAGED type chords or if no voicings
    displayPositionsForBarre = chordPositions[rootNote]?.[chordType];
    // currentFretOffset remains 0 for non-barre chords or if no specific offset
  }

  const barreInfo = (currentFretOffset > 0 && displayPositionsForBarre) ?
                    getBarreInfo(displayPositionsForBarre, currentFretOffset) : null;
  
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
  // Ensure all dependencies that influence the fretboard rendering are included.
  // `chordData` is critical now. `rootNote`, `chordType` influence `barreInfo` logic and are used by `renderNotePosition`.
  // `availableVoicings` and `selectedVoicingIndex` are needed for `barreInfo` determination.
  // `showFunction`, `getNote`, `getChordFunction` were removed as their effects are now incorporated into `chordData` via `updateChordData`.
}, [chordData, rootNote, chordType, renderNotePosition, animations, availableVoicings, selectedVoicingIndex]);


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
          <div ref={scrollContainerRef} style={{ overflowX: 'auto', maxWidth: '100%' }}>
            {renderFretboard()}
          </div>
		  <div style={{ marginTop: '10px', textAlign: 'center' }}>
			<label>
			  <input
				type="checkbox"
				checked={showFunction}
				onChange={(e) => setShowFunction(e.target.checked)}
                style={{ marginRight: '5px' }}
			  />
			  Show Chord Function
			</label>
		  </div>
          {availableVoicings.length > 0 && (chordType === 'major' || chordType === 'minor' || chordType === 'm') && (
            <div style={{ marginTop: '10px', marginBottom: '10px', textAlign: 'center' }}>
              Voicings:
              {availableVoicings.map((voicing, index) => (
                <button
                  key={`${voicing.shapeName}-${voicing.fretOffset}`}
                  onClick={() => setSelectedVoicingIndex(index)}
                  disabled={index === selectedVoicingIndex}
                  style={{ marginLeft: '5px', 
                           padding: '5px 10px',
                           border: '1px solid #ccc',
                           borderRadius: '4px',
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
			Select a feature below or try the preloaded sequence.
		  </p>
		  <div style={{ padding: '10px', border: '1px solid #eee', borderRadius: '4px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
            {renderCurrentInfo()}
          </div>
			  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginBottom: '20px' }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Minimal Playback Controls - Step/Skip buttons moved to modal */}
				  <button 
					onClick={handlePlayPause} 
					style={{ ...iconButtonStyle, padding: '10px' }}
                    title={isPlaying ? "Pause" : "Play"}
				  >
					{isPlaying ? <PauseIcon /> : <PlayIcon />}
				  </button>
				  <button 
					onClick={stopSequence}
					style={{ ...iconButtonStyle, padding: '10px' }}
                    title="Stop"
				  >
					<StopIcon />
				  </button>
				  <button 
					  onClick={handlePlayCurrentChord}
					  disabled={isChordPlaying}
					  style={{
						...iconButtonStyle,
                        padding: '10px',
						backgroundColor: isChordPlaying ? '#cccccc' : 'transparent',
						color: isChordPlaying ? '#666666' : 'currentColor', // Ensure icon color changes when disabled
					  }}
					  title="Play Current Chord"
					>
					  <MusicalSymbolIcon />
				  </button>
				  <button 
					onClick={toggleLoop}
					style={{
					  ...iconButtonStyle,
                      padding: '8px', // Adjusted padding for visual balance
					  backgroundColor: isLooping ? '#4CAF50' : '#f0f0f0', // Green when active, default gray otherwise
                      color: isLooping ? 'white' : 'black', // Ensure icon is visible
					}}
                    title={isLooping ? "Disable Loop" : "Enable Loop"}
				  >
					<RepeatIcon />
				  </button>

				</div>
			  </div>
		</div>

		{/* New Modal Trigger Buttons - Reverted to modalButtonStyle */}
		<div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
		  <button onClick={() => setShowChordBrowserModal(true)} style={modalButtonStyle}>Browse Chords</button>
		  <button onClick={() => setShowSequenceEditorModal(true)} style={modalButtonStyle}>Edit Sequence</button>
		  <button onClick={() => setShowGetSequencesModal(true)} style={modalButtonStyle}>Load/Generate Sequence</button>
		  <button onClick={() => setShowSoundSettingsModal(true)} style={modalButtonStyle}>Sound Settings</button>
		  <button onClick={() => setShowAdvancedPlaybackModal(true)} style={modalButtonStyle}>More Playback Options</button>
		</div>

		{/* Modals */}
		{showChordBrowserModal && (
		  <Modal title="Chord Browser" isOpen={showChordBrowserModal} onClose={() => setShowChordBrowserModal(false)}>
			<ChordBrowser
			  rootNote={rootNote}
			  setRootNote={setRootNote}
			  chordType={chordType}
			  setChordType={setChordType}
			  playChord={(newRoot, newType) => playChord(newRoot, newType, [4])} // Strum pattern [4] is a placeholder, confirm if ChordBrowser needs more specific patterns
			/>
		  </Modal>
		)}

		{showSequenceEditorModal && (
		  <Modal title="Edit Current Sequence" isOpen={showSequenceEditorModal} onClose={() => setShowSequenceEditorModal(false)}>
			<ManualSequenceEditor
			  currentSequenceInApp={chordSequence}
			  onLoadSequenceToApp={(seq, isValid) => {
				setChordSequence(seq);
				setIsSequenceValid(isValid); // ManualSequenceEditor handles its own validation before calling this
			  }}
			/>
		  </Modal>
		)}

		{showGetSequencesModal && (
		  <Modal title="Load New or Generate Sequence" isOpen={showGetSequencesModal} onClose={() => setShowGetSequencesModal(false)}>
			<SequenceFeatures
			  currentSequenceForExport={chordSequence} // For the export feature
			  onLoadSequenceToApp={(seq) => {
				setChordSequence(seq);
				// GuitarChordApp's useEffect for chordSequence will call validateSequence and set isSequenceValid
			  }}
			/>
		  </Modal>
		)}

		{showSoundSettingsModal && (
		  <Modal title="Sound Settings" isOpen={showSoundSettingsModal} onClose={() => setShowSoundSettingsModal(false)}>
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
			  reverbSendLevel={reverbSendLevel}
			  setReverbSendLevel={setReverbSendLevel}
			  reverbOutputLevel={reverbOutputLevel}
			  setReverbOutputLevel={setReverbOutputLevel}
			  upstrokeSpeedFactor={upstrokeSpeedFactor}
			  setUpstrokeSpeedFactor={setUpstrokeSpeedFactor}
			  arpeggioBaseDuration={arpeggioBaseDuration}
			  setArpeggioBaseDuration={setArpeggioBaseDuration}
			/>
		  </Modal>
		)}

		{showAdvancedPlaybackModal && (
		  <Modal title="Advanced Playback Controls" isOpen={showAdvancedPlaybackModal} onClose={() => setShowAdvancedPlaybackModal(false)}>
			<AdvancedPlaybackControls
			  onStepBackward={handleStepBackward}
			  onStepForward={handleStepForward}
			  onSkipToStart={handleSkipToStart}
			  onSkipToEnd={handleSkipToEnd}
			  isPlaying={isPlaying}
			/>
		  </Modal>
		)}
		
		{!isInitialized && (
		  <button
            onClick={initializeAudio}
            style={{ marginTop: '20px', width: '100%', padding: '10px', backgroundColor: '#f0ad4e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Initialize Audio
          </button>
		)}
	  <AnimationLayer chordData={chordData} animations={animations} />
      <style>{animationStyles} </style>
	  </div>
	);
};

const iconButtonStyle: React.CSSProperties = {
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '5px',
  margin: '0 5px',
  borderRadius: '50%', // Keep it round for icon buttons
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const modalButtonStyle: React.CSSProperties = {
  padding: '10px 15px',
  fontSize: '1rem',
  margin: '5px', // Allow some margin for wrapping
  cursor: 'pointer',
  border: '1px solid #ccc',
  borderRadius: '4px',
  backgroundColor: '#f0f0f0', // A light gray, common for buttons
  color: '#333', // Dark text for readability
  textAlign: 'center',
};

export default GuitarChordApp;