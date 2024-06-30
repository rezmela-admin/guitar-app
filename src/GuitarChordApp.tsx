import React, { useState, useCallback, useEffect, useRef } from 'react';
import { RootNote, ChordType, Note, ChordPosition, STRING_TUNING, NOTE_SEQUENCE, chordPositions, CHORD_TYPE_LABELS } from './types';
import ChordBrowser from './ChordBrowser';
import CustomSequence from './CustomSequence';
import LibraryGenerator from './LibraryGenerator';

const GuitarChordApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'browser' | 'custom' | 'library'>('browser');
  const [rootNote, setRootNote] = useState<RootNote>('A');
  const [chordType, setChordType] = useState<ChordType>('major');
  const [chordSequence, setChordSequence] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFunction, setShowFunction] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [strumDuration, setStrumDuration] = useState(1000); // Default 1 second per strum
  const [isLooping, setIsLooping] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const parseChordSequence = useCallback((sequence: string): [RootNote, ChordType, number][] => {
    const chordRegex = /([A-G])(m|maj|7|m7|maj7|add9|sus2|sus4|5|6|7sus4|dim|°)?\((\d+)\)/g;
    const chords: [RootNote, ChordType, number][] = [];
    let match;
    while ((match = chordRegex.exec(sequence)) !== null) {
      let [, root, type = 'major', strums] = match;
      if (type === 'm') type = 'minor';
      if (type === '') type = 'major';
      if (type === '7sus4') type = '7sus4';
      if (type === '6') type = '6';
      if (type === 'dim' || type === '°') type = 'dim';
      chords.push([root as RootNote, type as ChordType, parseInt(strums, 10)]);
    }
    return chords;
  }, []);

	 const playSequence = useCallback(() => {
	  const chords = parseChordSequence(chordSequence);
	  if (chords.length === 0) return;

	  setIsPlaying(true);
	  
	  const playNextChord = (index: number) => {
		if (index >= chords.length) {
		  if (isLooping) {
			playNextChord(0);  // Start over from the beginning
		  } else {
			setIsPlaying(false);
			setCurrentChordIndex(0);  // Reset to first chord when finished
		  }
		  return;
		}

		const [root, type, strums] = chords[index];
		setRootNote(root);
		setChordType(type);
		setCurrentChordIndex(index);  // Update the current chord index

		timerRef.current = setTimeout(() => {
		  playNextChord(index + 1);
		}, strums * strumDuration);
	  };

	  playNextChord(currentChordIndex);  // Start from the current index
	}, [chordSequence, strumDuration, parseChordSequence, currentChordIndex, isLooping]);

  const stopSequence = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsPlaying(false);
  }, []);

  const handlePlayPause = () => {
    if (isPlaying) {
      stopSequence();
    } else {
      playSequence();
    }
  };

  const handlePrevious = () => {
    const chords = parseChordSequence(chordSequence);
    if (currentChordIndex > 0) {
      const newIndex = currentChordIndex - 1;
      const [root, type] = chords[newIndex];
      setRootNote(root);
      setChordType(type);
      setCurrentChordIndex(newIndex);
    }
  };

  const handleNext = () => {
    const chords = parseChordSequence(chordSequence);
    if (currentChordIndex < chords.length - 1) {
      const newIndex = currentChordIndex + 1;
      const [root, type] = chords[newIndex];
      setRootNote(root);
      setChordType(type);
      setCurrentChordIndex(newIndex);
    }
  };
  
  const toggleLoop = () => {
	  setIsLooping(!isLooping);
	};

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

  const renderFretboard = useCallback(() => {
    const positions: ChordPosition = chordPositions[rootNote][chordType];

    return (
      <svg width="550" height="240" viewBox="0 0 550 240">
        <rect x="0" y="0" width="550" height="240" fill="#1e3a5f" />
        <rect x="20" y="20" width="500" height="180" fill="#3D3110" />
        {/* Frets */}
        {[0, 1, 2, 3, 4, 5].map((fret) => (
          <line key={`fret-${fret}`} x1={20 + fret * 100} y1={20} x2={20 + fret * 100} y2={200} stroke="#D4AF37" strokeWidth={fret === 0 ? 4 : 2} />
        ))}
        {/* Strings */}
        {[0, 1, 2, 3, 4, 5].map((string) => (
          <line key={`string-${string}`} x1={20} y1={40 + string * 30} x2={520} y2={40 + string * 30} stroke="#C0C0C0" strokeWidth={string + 1} />
        ))}
        {/* String labels */}
        {STRING_TUNING.map((note, index) => (
          <text key={`string-label-${index}`} x={525} y={45 + index * 30} fontFamily="Arial" fontSize={14} fill="white" textAnchor="start">{note}</text>
        ))}
        {/* Finger positions */}
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
                  stroke={isRootNote ? "#CD853F" : "black"} 
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
                  stroke={isRootNote ? "#CD853F" : "white"} 
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
        {/* Fret numbers */}
        {[1, 2, 3, 4, 5].map((fret) => (
          <text key={`fret-label-${fret}`} x={20 + fret * 100 - 50} y={225} fontFamily="Arial" fontSize={14} fill="white" textAnchor="middle">{fret}</text>
        ))}
      </svg>
    );
  }, [rootNote, chordType, showFunction, getNote, getChordFunction]);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Guitar Chord Visualizer</h2>
      
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
        {renderCurrentInfo()}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
          <div>
            <label>
              Strum Duration (ms):
              <input
                type="number"
                value={strumDuration}
                onChange={(e) => setStrumDuration(Math.max(100, parseInt(e.target.value)))}
                min="100"
                step="100"
              />
            </label>
          </div>
          <div>
            <button onClick={handlePrevious} disabled={isPlaying}>Previous</button>
            <button onClick={handlePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
            <button onClick={handleNext} disabled={isPlaying}>Next</button>
			<button 
			  onClick={toggleLoop}
			  style={{
				backgroundColor: isLooping ? '#4CAF50' : '#f44336',
				color: 'white',
				border: 'none',
				padding: '5px 10px',
				marginLeft: '5px',
				cursor: 'pointer'
			  }}
			>
			  {isLooping ? 'Looping' : 'Loop'}
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
          onClick={() => setActiveTab('custom')} 
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'custom' ? '#f0f0f0' : 'white',
            border: 'none',
            borderBottom: activeTab === 'custom' ? '2px solid #333' : 'none',
            cursor: 'pointer'
          }}
        >
          Custom Sequence
        </button>
        <button 
          onClick={() => setActiveTab('library')} 
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'library' ? '#f0f0f0' : 'white',
            border: 'none',
            borderBottom: activeTab === 'library' ? '2px solid #333' : 'none',
            cursor: 'pointer'
          }}
        >
          Library & Generator
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'browser' && (
        <ChordBrowser 
          rootNote={rootNote}
          setRootNote={setRootNote}
          chordType={chordType}
          setChordType={setChordType}
        />
      )}

      {activeTab === 'custom' && (
        <CustomSequence 
          chordSequence={chordSequence}
          setChordSequence={setChordSequence}
        />
      )}

      {activeTab === 'library' && (
        <LibraryGenerator 
          setChordSequence={setChordSequence}
        />
      )}
    </div>
  );
};

export default GuitarChordApp;