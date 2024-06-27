import React, { useState, useCallback, useEffect, useRef } from 'react';
import stockSongs from './stockSongs.json';

type ChordType = 'major' | 'minor' | '7' | 'm7' | 'maj7' | 'add9' | 'sus2' | 'sus4';
type RootNote = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
type Note = 'A' | 'A#' | 'B' | 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#';
type ChordPosition = [number, number, number, number, number, number];

const STRING_TUNING: Note[] = ['E', 'B', 'G', 'D', 'A', 'E'];
const NOTE_SEQUENCE: Note[] = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
const ROOT_NOTES: RootNote[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const CHORD_TYPES: ChordType[] = ['major', 'minor', '7', 'm7', 'maj7', 'add9', 'sus2', 'sus4'];



const chordPositions: Record<RootNote, Record<ChordType, ChordPosition>> = {
  'A': { major: [0, 0, 2, 2, 2, 0], minor: [0, 0, 2, 2, 1, 0], '7': [0, 0, 2, 0, 2, 0], 'm7': [0, 0, 2, 0, 1, 0], 'maj7': [0, 0, 2, 1, 2, 0], 'add9': [0, 0, 2, 4, 2, 0], 'sus2': [0, 0, 2, 2, 0, 0], 'sus4': [0, 0, 2, 2, 3, 0] },
  'B': { major: [-1, 2, 4, 4, 4, 2], minor: [-1, 2, 4, 4, 3, 2], '7': [-1, 2, 1, 2, 0, 2], 'm7': [-1, 2, 0, 2, 0, 2], 'maj7': [-1, 2, 4, 3, 4, 2], 'add9': [-1, 2, 4, 4, 4, 4], 'sus2': [-1, 2, 4, 4, 2, 2], 'sus4': [-1, 2, 4, 4, 5, 2] },
  'C': { major: [3, 3, 2, 0, 1, 0], minor: [-1, 3, 5, 5, 4, 3], '7': [0, 3, 2, 3, 1, 0], 'm7': [-1, 3, 5, 3, 4, 3], 'maj7': [3, 3, 2, 0, 0, 0], 'add9': [3, 3, 2, 0, 3, 0], 'sus2': [3, 3, 0, 0, 1, 3], 'sus4': [3, 3, 0, 0, 1, 1] },
  'D': { major: [-1, -1, 0, 2, 3, 2], minor: [-1, -1, 0, 2, 3, 1], '7': [-1, -1, 0, 2, 1, 2], 'm7': [-1, -1, 0, 2, 1, 1], 'maj7': [-1, -1, 0, 2, 2, 2], 'add9': [-1, -1, 0, 2, 3, 0], 'sus2': [-1, -1, 0, 2, 3, 0], 'sus4': [-1, -1, 0, 2, 3, 3] },
  'E': { major: [0, 2, 2, 1, 0, 0], minor: [0, 2, 2, 0, 0, 0], '7': [0, 2, 0, 1, 0, 0], 'm7': [0, 2, 0, 0, 0, 0], 'maj7': [0, 2, 1, 1, 0, 0], 'add9': [0, 2, 2, 1, 0, 2], 'sus2': [0, 2, 2, 4, 0, 0], 'sus4': [0, 2, 2, 2, 0, 0] },
  'F': { major: [1, 3, 3, 2, 1, 1], minor: [1, 3, 3, 1, 1, 1], '7': [1, 3, 1, 2, 1, 1], 'm7': [1, 3, 1, 1, 1, 1], 'maj7': [1, 3, 2, 2, 1, 0], 'add9': [1, 0, 3, 0, 1, 1], 'sus2': [1, 3, 3, 0, 1, 1], 'sus4': [1, 3, 3, 3, 1, 1] },
  'G': { major: [3, 2, 0, 0, 0, 3], minor: [3, 5, 5, 3, 3, 3], '7': [3, 2, 0, 0, 0, 1], 'm7': [3, 5, 3, 3, 3, 3], 'maj7': [3, 2, 0, 0, 0, 2], 'add9': [3, 2, 0, 0, 0, 5], 'sus2': [3, 0, 0, 0, 3, 3], 'sus4': [3, 3, 0, 0, 1, 3] },
};

const GuitarChordDiagram: React.FC = () => {
  const [selectedSong, setSelectedSong] = useState('');
  const [rootNote, setRootNote] = useState<RootNote>('A');
  const [chordType, setChordType] = useState<ChordType>('major');
  const [showFunction, setShowFunction] = useState<boolean>(false);
  const [chordSequence, setChordSequence] = useState<string>('');
  const [currentChordIndex, setCurrentChordIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [strumDuration, setStrumDuration] = useState<number>(1000); // Default 1 second per strum

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
	const parseChordSequence = useCallback((sequence: string): [RootNote, ChordType, number][] => {
	  const chordRegex = /([A-G])(m|maj|7|m7|maj7|add9|sus2|sus4)?\((\d+)\)/g;
	  const chords: [RootNote, ChordType, number][] = [];
	  let match;
	  while ((match = chordRegex.exec(sequence)) !== null) {
		let [, root, type = 'major', strums] = match;
		// Convert shorthand notations to full chord types
		if (type === 'm') type = 'minor';
		if (type === '') type = 'major';
		chords.push([root as RootNote, type as ChordType, parseInt(strums, 10)]);
	  }
	  return chords;
	}, []);

  const playSequence = useCallback(() => {
    const chords = parseChordSequence(chordSequence);
    if (chords.length === 0) return;

    setIsPlaying(true);
    setCurrentChordIndex(0);

    const playNextChord = (index: number) => {
      if (index >= chords.length) {
        setIsPlaying(false);
        return;
      }

      const [root, type, strums] = chords[index];
      setRootNote(root);
      setChordType(type);

      timerRef.current = setTimeout(() => {
        playNextChord(index + 1);
      }, strums * strumDuration);
    };

    playNextChord(0);
  }, [chordSequence, strumDuration, parseChordSequence]);

  const stopSequence = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsPlaying(false);
    setCurrentChordIndex(0);
  }, []);

  const goToNextChord = useCallback(() => {
    const chords = parseChordSequence(chordSequence);
    if (currentChordIndex < chords.length - 1) {
      const [root, type] = chords[currentChordIndex + 1];
      setRootNote(root);
      setChordType(type);
      setCurrentChordIndex(currentChordIndex + 1);
    }
  }, [chordSequence, currentChordIndex, parseChordSequence]);

  const goToPreviousChord = useCallback(() => {
    const chords = parseChordSequence(chordSequence);
    if (currentChordIndex > 0) {
      const [root, type] = chords[currentChordIndex - 1];
      setRootNote(root);
      setChordType(type);
      setCurrentChordIndex(currentChordIndex - 1);
    }
  }, [chordSequence, currentChordIndex, parseChordSequence]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const getNote = useCallback((stringNote: Note, fret: number): Note => {
    const startIndex = NOTE_SEQUENCE.indexOf(stringNote);
    return NOTE_SEQUENCE[(startIndex + fret) % 12];
  }, []);

  const getChordFunction = useCallback((note: Note, rootNote: RootNote, chordType: ChordType): string => {
    const interval = (NOTE_SEQUENCE.indexOf(note) - NOTE_SEQUENCE.indexOf(rootNote) + 12) % 12;
    switch (interval) {
      case 0: return 'R';
      case 2: return '2';
      case 3: return chordType === 'minor' || chordType === 'm7' ? 'b3' : '3';
      case 4: return '3';
      case 5: return '4';
      case 7: return '5';
      case 10: return chordType === '7' || chordType === 'm7' ? 'b7' : '7';
      case 11: return '7';
      default: return note;
    }
  }, []);

  const renderFretboard = useCallback(() => {
    const positions = chordPositions[rootNote][chordType];

    return (
      <>
        {[0, 1, 2, 3, 4, 5].map((fret) => (
          <line key={`fret-${fret}`} x1={20 + fret * 100} y1={20} x2={20 + fret * 100} y2={200} stroke="silver" strokeWidth={fret === 0 ? 4 : 2} />
        ))}
        {[0, 1, 2, 3, 4, 5].map((string) => (
          <line key={`string-${string}`} x1={20} y1={40 + string * 30} x2={520} y2={40 + string * 30} stroke="silver" strokeWidth={string + 1} />
        ))}
        {STRING_TUNING.map((note, index) => (
          <text key={`string-label-${index}`} x={535} y={45 + index * 30} fontFamily="Arial" fontSize={14} fill="white" textAnchor="start">{note}</text>
        ))}
        {positions.map((position, index) => {
          const note = position >= 0 ? getNote(STRING_TUNING[5 - index], position) : 'X';
          const displayText = showFunction && note !== 'X' ? getChordFunction(note, rootNote, chordType) : note;
          const isRootNote = note === rootNote;
          
          if (position > 0) {
            return (
              <g key={`position-${index}`}>
                <circle 
                  cx={20 + position * 100 - 50} 
                  cy={40 + (5 - index) * 30} 
                  r={12} 
                  fill={isRootNote ? "#FFD700" : "yellow"} 
                  stroke={isRootNote ? "#DAA520" : "black"} 
                  strokeWidth={isRootNote ? 3 : 1}
                />
                <text 
                  x={20 + position * 100 - 50} 
                  y={45 + (5 - index) * 30} 
                  fontFamily="Arial" 
                  fontSize={12} 
                  fill="black" 
                  textAnchor="middle"
                  fontWeight={isRootNote ? "bold" : "normal"}
                >
                  {displayText}
                </text>
              </g>
            );
          } else if (position === 0) {
            return (
              <g key={`open-${index}`}>
                <circle 
                  cx={10} 
                  cy={40 + (5 - index) * 30} 
                  r={8} 
                  fill={isRootNote ? "#FFD700" : "none"} 
                  stroke={isRootNote ? "#DAA520" : "white"} 
                  strokeWidth={isRootNote ? 3 : 2}
                />
                <text 
                  x={10} 
                  y={45 + (5 - index) * 30} 
                  fontFamily="Arial" 
                  fontSize={12} 
                  fill={isRootNote ? "black" : "white"} 
                  textAnchor="middle"
                  fontWeight={isRootNote ? "bold" : "normal"}
                >
                  {displayText}
                </text>
              </g>
            );
          } else {
            return (
              <text key={`mute-${index}`} x={10} y={45 + (5 - index) * 30} fontFamily="Arial" fontSize={20} fill="white" textAnchor="middle">×</text>
            );
          }
        })}
        {[1, 2, 3, 4, 5].map((fret) => (
          <text key={`fret-label-${fret}`} x={20 + fret * 100 - 50} y={225} fontFamily="Arial" fontSize={14} fill="white" textAnchor="middle">{fret}</text>
        ))}
      </>
    );
  }, [rootNote, chordType, showFunction, getNote, getChordFunction]);

  return (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '550px', margin: '0 auto' }}>
    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Guitar Chord Charmer</h2>
    
    {/* Chord Browser */}
    <div style={{ width: '100%', marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
      <h3>Chord Browser</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <select 
          value={rootNote} 
          onChange={(e) => setRootNote(e.target.value as RootNote)} 
        >
          {ROOT_NOTES.map((note) => (
            <option key={note} value={note}>{note}</option>
          ))}
        </select>
        <select 
          value={chordType} 
          onChange={(e) => setChordType(e.target.value as ChordType)} 
        >
          {CHORD_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <svg viewBox="0 0 550 240" width={550} height={240}>
        <rect x={0} y={0} width={550} height={240} fill="#2c3e50" />
        <rect x={20} y={20} width={500} height={180} fill="#D2691E" />
        {renderFretboard()}
      </svg>
      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.5rem' }}>
        <input 
          type="checkbox" 
          checked={showFunction} 
          onChange={(e) => setShowFunction(e.target.checked)} 
          style={{ marginRight: '0.25rem' }}
        />
        Show Chord Function
      </label>
    </div>

    {/* Practice Controls */}
    <div style={{ width: '100%', marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
      <h3>Practice Controls</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label style={{ marginRight: '0.5rem' }}>Strum duration:</label>
          <input
            type="number"
            value={strumDuration}
            onChange={(e) => setStrumDuration(parseInt(e.target.value, 10))}
            min="100"
            max="5000"
            step="100"
            style={{ width: '80px' }}
          />
        </div>
        <div>
          <button onClick={isPlaying ? stopSequence : playSequence} style={{ marginRight: '0.5rem' }}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button onClick={goToPreviousChord} disabled={isPlaying || currentChordIndex === 0} style={{ marginRight: '0.5rem' }}>
            Previous
          </button>
          <button onClick={goToNextChord} disabled={isPlaying || currentChordIndex === parseChordSequence(chordSequence).length - 1} style={{ marginRight: '0.5rem' }}>
            Next
          </button>
          <button onClick={() => setChordSequence('')}>
            Clear
          </button>
        </div>
      </div>
    </div>

    {/* Chord Sequence Input */}
    <div style={{ width: '100%', marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
      <h3>Chord Sequence Input</h3>
      <textarea
        value={chordSequence}
        onChange={(e) => setChordSequence(e.target.value)}
        placeholder="Enter chord sequence (e.g., F(4), C(2), G(4))"
        style={{
          width: '100%',
          height: '100px',
          padding: '0.5rem',
          boxSizing: 'border-box',
          resize: 'vertical',
          overflowY: 'auto',
		  whiteSpace: 'pre-wrap' 
        }}
      />
    </div>
	{/* Stock Songs */}
	<div style={{ width: '100%', marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
	  <h3>Stock Songs</h3>
	  <select 
		value={selectedSong}
		onChange={(e) => {
		  setSelectedSong(e.target.value);
		  const song = stockSongs.songs.find(s => s.title === e.target.value);
		  if (song) {
			setChordSequence(song.chordSequence);
		  }
		}}
		style={{ width: '100%', padding: '0.5rem' }}
	  >
		<option value="">Select a stock song</option>
		{stockSongs.songs.map((song, index) => (
		  <option key={index} value={song.title}>{song.title}</option>
		))}
	  </select>
	</div>
  </div>
  );
};

export default GuitarChordDiagram;
