import React, { useState, useCallback, useEffect, useRef } from 'react';
import { RootNote, ChordType, Note, ChordPosition, STRING_TUNING, NOTE_SEQUENCE, chordPositions, CHORD_TYPE_LABELS, getMidiNoteFromPosition, noteToMidi, midiToNote } from './types';
import ChordBrowser from './ChordBrowser';
import { useAudioSamples } from './hooks/useAudioSamples';
import { PlayIcon, PauseIcon, StepBackwardIcon, StepForwardIcon, RepeatIcon, StopIcon,SkipToStartIcon, SkipToEndIcon, MusicalSymbolIcon } from './IconComponents';
import SequenceEditor from './SequenceEditor'; 
import SoundControls from './SoundControls';
import { introTexts } from './appIntroTexts';


type ChordDataItem = {
  stringNumber: number;
  position: number;
  note: string;
  displayText: string;
  isRootNote: boolean;
  midiNote: number | null;
  noteName: string;
};

interface SoundControlsProps {
  playStyle: 'strum' | 'arpeggio';
  setPlayStyle: React.Dispatch<React.SetStateAction<'strum' | 'arpeggio'>>;
  bassDampening: number;
  setBassDampening: React.Dispatch<React.SetStateAction<number>>;
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  attackTime: number;
  setAttackTime: React.Dispatch<React.SetStateAction<number>>;
  decayTime: number;
  setDecayTime: React.Dispatch<React.SetStateAction<number>>;
  sustainLevel: number;
  setSustainLevel: React.Dispatch<React.SetStateAction<number>>;
  releaseTime: number;
  setReleaseTime: React.Dispatch<React.SetStateAction<number>>;
  chordPlaySpeed: number;
  setChordPlaySpeed: React.Dispatch<React.SetStateAction<number>>;
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
}

interface ChordBrowserProps {
  rootNote: RootNote;
  setRootNote: React.Dispatch<React.SetStateAction<RootNote>>;
  chordType: ChordType;
  setChordType: React.Dispatch<React.SetStateAction<ChordType>>;
  playChord: (root: RootNote, type: ChordType) => void;
}




const GuitarChordApp: React.FC = () => {

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [showFunction, setShowFunction] = useState(false);
  const [volume, setVolume] = useState(0.5); // Initialize volume to half max.
  const [activeTab, setActiveTab] = useState<'browser' | 'sequence' | 'sound'>('browser');
  // Existing state variables
  const [rootNote, setRootNote] = useState<RootNote>('D');
  const [chordType, setChordType] = useState<ChordType>('major');
  const [chordSequence, setChordSequence] = useState<string>("D(4) A(4) Bm(4) F#m(4) G(4) D(4) G(4) A(4)");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [isLooping, setIsLooping] = useState(false);

  // Updated or new state variables
  const [playStyle, setPlayStyle] = useState<'strum' | 'arpeggio'>('arpeggio');
  const [bassDampening, setBassDampening] = useState(0.7);
  const [attackTime, setAttackTime] = useState(0.028);
  const [decayTime, setDecayTime] = useState(2.0);
  const [sustainLevel, setSustainLevel] = useState(0.55);
  const [releaseTime, setReleaseTime] = useState(5.0);
  const [isChordPlaying, setIsChordPlaying] = useState(false);
  const [chordPlaySpeed, setChordPlaySpeed] = useState(79);
  const [duration, setDuration] = useState(495);
  
  const [isPaused, setIsPaused] = useState(false);
  const [remainingChords, setRemainingChords] = useState<[RootNote, ChordType, number][]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [shouldStopAtEnd, setShouldStopAtEnd] = useState(false);
  
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



  
  const { isLoading, loadingProgress, playNote,  initializeAudio, isInitialized, errorMessage } = useAudioSamples();
  
	   useEffect(() => {
	   initializeAudio();
	   }, [initializeAudio]);
  
  const getNote = useCallback((stringNote: Note, fret: number): Note => {
    const startIndex = NOTE_SEQUENCE.indexOf(stringNote);
    return NOTE_SEQUENCE[(startIndex + fret) % 12];
  }, []);
  
	const parseChordSequence = useCallback((sequence: string): [RootNote, ChordType, number][] => {
	  console.log("Parsing sequence:", sequence);
	  const chordRegex = /([A-G])(b|#)?(m(?:inor)?|maj|7|m7|maj7|add9|sus2|sus4|5|6|7sus4|dim|°)?\((\d+)\)/g;
	  const chords: [RootNote, ChordType, number][] = [];
	  let match;
	  while ((match = chordRegex.exec(sequence)) !== null) {
		let [, root, accidental = '', type = 'major', strums] = match;
		const fullRoot = (root + accidental) as RootNote;
		if (type === 'm' || type === 'minor') type = 'minor';
		if (type === '') type = 'major';
		chords.push([fullRoot, type as ChordType, parseInt(strums, 10)]);
	  }
	  console.log("Parsed chords:", chords);
	  return chords;
	}, []);


	const handlePlayCurrentChord = () => {
	  setIsChordPlaying(true);
	  
	  // Play the chord and get the total duration
	  const totalDuration = playChord(rootNote, chordType);
	  
	  // Set a timer to re-enable the button
	  setTimeout(() => {
		setIsChordPlaying(false);
	  }, totalDuration + 100); // Add a small buffer
	};


	const playChord = useCallback((
	  root: RootNote, 
	  type: ChordType, 
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
	  const actualAttackTime = customAttackTime !== undefined ? customAttackTime : attackTime;
	  const actualDecayTime = customDecayTime !== undefined ? customDecayTime : decayTime;
	  const actualSustainLevel = customSustainLevel !== undefined ? customSustainLevel : sustainLevel;
	  const actualReleaseTime = customReleaseTime !== undefined ? customReleaseTime : releaseTime;
	  const actualVolume = customVolume !== undefined ? customVolume : volume;


	  console.log(`Playing ${root} ${type} chord as ${actualStyle}`);
	  const positions: ChordPosition = chordPositions[root][type];
	  
	  // Adjust speed multiplier calculation
	  const speedMultiplier = 0.5 + (actualChordPlaySpeed / 100);
	  
	  // Base duration for a single note
	  const baseDuration = actualStyle === 'arpeggio' ? 200 : 50; // ms
	  
	  let maxDelay = 0;

	  positions.forEach((position, stringIndex) => {
		if (position >= 0) {  // Only play unmuted strings
		  const stringNumber = (stringIndex + 1).toString();
		  const midiNote = getMidiNoteFromPosition(stringNumber, position);
		  const stringVolume = (stringIndex < 3 ? actualBassDampening : 1) * actualVolume;
		  
		  let delay: number;
		  if (actualStyle === 'arpeggio') {
			delay = (stringIndex * baseDuration) / speedMultiplier;
		  } else { // strum
			delay = (stringIndex * (baseDuration / positions.length)) / speedMultiplier;
		  }
		  maxDelay = Math.max(maxDelay, delay);
		  
		  setTimeout(() => {
			console.log(`Playing note: String ${stringNumber}, MIDI ${midiNote}, Fret ${position}`);
			playNote(
			  midiNote, 
			  volume, 
			  actualDuration,
			  actualAttackTime,
			  actualDecayTime,
			  actualSustainLevel,
			  actualReleaseTime
			);
		  }, delay);
		} else {
		  console.log(`String ${stringIndex + 1} is muted`);
		}
	  });

	  const totalDuration = maxDelay + actualDuration;
	  //const totalDuration = Math.max(maxDelay, actualDuration);  // Adjusted calculation
	  
	  return totalDuration;
	}, [
	  playStyle,
	  chordPlaySpeed,
	  bassDampening,
	  duration,
	  attackTime,
	  decayTime,
	  sustainLevel,
	  releaseTime,
	  volume, 
	  playNote,
	  chordPositions,
	  getMidiNoteFromPosition
	]);

	  const handleChordChange = useCallback((newRoot: RootNote, newType: ChordType) => {
		setRootNote(newRoot);
		setChordType(newType);
		playChord(newRoot, newType);
	  }, [playChord, setRootNote, setChordType]);


const playSequence = useCallback(() => {
  if (!isLooping && isPaused) {
    // If we're not looping and the sequence is paused, don't start playing
    return;
  }

  let chords: [RootNote, ChordType, number][];
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
        setElapsedTime(0);
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

    const [root, type, strums] = chords[index];
    setRootNote(root);
    setChordType(type);
    setCurrentChordIndex(index);
    
    const strumInterval = 1000 / (chordPlaySpeed / 50); // Time between strums
    let totalDuration = 0;

    const playStrum = (strumIndex: number) => {
      if (strumIndex < strums) {
        const strumDuration = playChord(root, type, playStyle, chordPlaySpeed, bassDampening, duration, attackTime, decayTime, sustainLevel, releaseTime);
        totalDuration += strumDuration;

        timerRef.current = setTimeout(() => {
          playStrum(strumIndex + 1);
        }, strumDuration);
      } else {
        // Move to next chord
        setElapsedTime(0);
        setRemainingChords(chords.slice(index + 1));
        
        // Schedule the next chord
        timerRef.current = setTimeout(() => {
          playNextChord(index + 1);
        }, Math.max(0, strumInterval - totalDuration));
      }
    };

    // Start playing strums
    playStrum(0);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 100);
    }, 100);
  };

  playNextChord(startIndex);

  return () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
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
  elapsedTime,
  setRemainingChords,
  setElapsedTime,
  setShouldStopAtEnd,
  timerRef,
  intervalRef,
  isPaused
]);


  const pauseSequence = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPaused(true);
    setIsPlaying(false);
  }, []);
  
  
const stopSequence = useCallback(() => {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
  }
  if (intervalRef.current) {
    clearInterval(intervalRef.current);
  }
  setIsPlaying(false);
  setIsPaused(false);
  setCurrentChordIndex(0);
  setRemainingChords([]);
  setElapsedTime(0);

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
      setElapsedTime(0);
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

  const renderCurrentInfo = () => {
  if (chordSequence) {
    const chords = parseChordSequence(chordSequence);
    return (
      <div>
        Current Sequence: {chords.map(([root, type, strums], index) => {
          const chordName = `${root}${type === 'major' ? '' : type}`;
          return (
            <span key={index} style={{
              fontWeight: index === currentChordIndex ? 'bold' : 'normal',
              marginRight: '5px'
            }}>
              {chordName}({strums})
            </span>
          );
        })}
      </div>
    );
  } else {
    return (
      <div>Current Chord: {getCurrentChordName()}</div>
    );
  }
};


const renderNotePosition = (data: ChordDataItem, visualIndex: number, actualStringNumber: number) => {
  const handleClick = () => {
    if (data.midiNote !== null) {
      console.log(`Clicked note: ${data.noteName} (MIDI: ${data.midiNote}) on string ${actualStringNumber}, fret ${data.position}`);
      playNote(data.midiNote, volume);  // Pass the current volume
    }
  };

  if (data.position > 0) {
    return (
      <g key={`position-${visualIndex}`} onClick={handleClick}>
        <circle 
          cx={20 + data.position * 100 - 50} 
          cy={40 + visualIndex * 30} 
          r={12} 
          fill={data.isRootNote ? "#FFD700" : "yellow"} 
          stroke={data.isRootNote ? "#CD853F" : "black"} 
          strokeWidth={data.isRootNote ? 3 : 1}
        />
        <text 
          x={20 + data.position * 100 - 50} 
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
  } else if (data.position === 0) {
    return (
      <g key={`open-${visualIndex}`} onClick={handleClick}>
        <circle 
          cx={10} 
          cy={40 + visualIndex * 30} 
          r={8} 
          fill={data.isRootNote ? "#FFD700" : "none"} 
          stroke={data.isRootNote ? "#CD853F" : "white"} 
          strokeWidth={data.isRootNote ? 3 : 2}
        />
        <text 
          x={10} 
          y={45 + visualIndex * 30} 
          fontFamily="Arial" 
          fontSize={12} 
          fill={data.isRootNote ? "black" : "white"} 
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
        fill="white" 
        textAnchor="middle"
      >
        ×
      </text>
    );
  }
};


const renderFretboard = useCallback(() => {
  const positions: ChordPosition = chordPositions[rootNote][chordType];

  // Data preparation (Model)
	  const chordData = positions.map((position, index) => {
		const stringNumber = index + 1; // 1 for low E, 6 for high E
		const stringNote = STRING_TUNING[index];
		const note = position >= 0 ? getNote(stringNote, position) : 'X';
		const displayText = showFunction && note !== 'X' ? getChordFunction(note, rootNote, chordType) : note;
		const isRootNote = note === rootNote;
		const midiNote = position >= 0 ? getMidiNoteFromPosition(stringNumber, position) : null;
		const noteName = midiNote !== null ? midiToNote(midiNote) : 'X';

		return {
		  stringNumber,
		  position,
		  note,
		  displayText,
		  isRootNote,
		  midiNote,
		  noteName
		};
	  });

  // Mapping logic (Controller)
  const mapDataToVisual = (data: typeof chordData[0], visualIndex: number) => {
    const actualStringNumber = 6 - visualIndex; // Convert visual index to actual string number
    return renderNotePosition(data, visualIndex, actualStringNumber);
  };

  // Helper function to render strings
const renderString = (index: number) => (
  <line 
    key={`string-${index}`} 
    x1={20} 
    y1={40 + index * 30} 
    x2={520} 
    y2={40 + index * 30} 
    stroke="#C0C0C0" 
    strokeWidth={index + 1} // Thinnest at top (index 0), thickest at bottom (index 5)
  />
);

  // Helper function to render string labels
  const renderStringLabel = (note: string, index: number) => (
    <text 
      key={`string-label-${index}`} 
      x={525} 
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
    <svg width="550" height="240" viewBox="0 0 550 240">
      <rect x="0" y="0" width="550" height="240" fill="#1e3a5f" />
      <rect x="20" y="20" width="500" height="180" fill="#3D3110" />
      
      {/* Frets */}
      {[0, 1, 2, 3, 4, 5].map((fret) => (
        <line key={`fret-${fret}`} x1={20 + fret * 100} y1={20} x2={20 + fret * 100} y2={200} stroke="#D4AF37" strokeWidth={fret === 0 ? 4 : 2} />
      ))}
      
      {/* Strings */}
      {[0, 1, 2, 3, 4, 5].map(renderString)}
      
      {/* String labels */}
      {STRING_TUNING.slice().reverse().map(renderStringLabel)}
      
      {/* Finger positions */}
      {chordData.map((data, index) => mapDataToVisual(data, 5 - index))}
      
      {/* Fret numbers */}
      {[1, 2, 3, 4, 5].map((fret) => (
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
    </svg>
  );
}, [rootNote, chordType, showFunction, getNote, getChordFunction]);




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
		  {renderFretboard()}
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
				playChord={handleChordChange}
			  />
			</div>
		  )}
		  
		  {activeTab === 'sequence' && (
			  <div>
				<p>{introTexts.chordSequenceGenerator}</p>
				<SequenceEditor 
				  chordSequence={chordSequence}
				  setChordSequence={setChordSequence}
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