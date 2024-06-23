import React, { useState, useEffect } from 'react';
console.log('App component is rendering');

type ChordType = 'major' | 'minor' | '7';
type Note = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';
type StringTuning = [Note, Note, Note, Note, Note, Note];
type ChordPosition = [number, number, number, number, number, number];
type ChordPositions = Record<string, ChordPosition>;
type ChordTypes = Record<ChordType, ChordPositions>;

const GuitarChordDiagram: React.FC = () => {
  const [chordType, setChordType] = useState<ChordType>('minor');
  const [selectedChord, setSelectedChord] = useState<string>('Am');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [showChordFunctions, setShowChordFunctions] = useState<boolean>(false);

  const chordPositions: ChordTypes = {
    major: {
      'A': [0, 0, 2, 2, 2, 0],
      'B': [-1, 2, 4, 4, 4, 2],
      'C': [3, 3, 2, 0, 1, 0],
      'D': [-1, -1, 0, 2, 3, 2],
      'E': [0, 2, 2, 1, 0, 0],
      'F': [1, 3, 3, 2, 1, 1],
      'G': [3, 2, 0, 0, 0, 3],
    },
    minor: {
      'Am': [0, 0, 2, 2, 1, 0],
      'Bm': [-1, 2, 4, 4, 3, 2],
      'Cm': [-1, 3, 5, 5, 4, 3],
      'Dm': [-1, -1, 0, 2, 3, 1],
      'Em': [0, 2, 2, 0, 0, 0],
      'Fm': [1, 3, 3, 1, 1, 1],
      'Gm': [3, 5, 5, 3, 3, 3],
    },
    '7': {
      'A7': [0, 0, 2, 0, 2, 0],
      'B7': [-1, 2, 1, 2, 0, 2],
      'C7': [0, 3, 2, 3, 1, 0],
      'D7': [-1, -1, 0, 2, 1, 2],
      'E7': [0, 2, 0, 1, 0, 0],
      'F7': [1, 3, 1, 2, 1, 1],
      'G7': [3, 2, 0, 0, 0, 1],
    }
  };

  const stringTuning: StringTuning = ['E', 'A', 'D', 'G', 'B', 'E'];

  const noteNames: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const getNoteAtFret = (stringIndex: number, fret: number): Note => {
    const openStringNote = noteNames.indexOf(stringTuning[stringIndex]);
    return noteNames[(openStringNote + fret) % 12];
  };

  const getChordTones = (rootNote: Note, type: ChordType): Note[] => {
    const rootIndex = noteNames.indexOf(rootNote);
    switch(type) {
      case 'major':
        return [rootNote, noteNames[(rootIndex + 4) % 12], noteNames[(rootIndex + 7) % 12]];
      case 'minor':
        return [rootNote, noteNames[(rootIndex + 3) % 12], noteNames[(rootIndex + 7) % 12]];
      case '7':
        return [rootNote, noteNames[(rootIndex + 4) % 12], noteNames[(rootIndex + 7) % 12], noteNames[(rootIndex + 10) % 12]];
    }
  };

  const getChordFunction = (note: Note, rootNote: Note, chordType: ChordType): string => {
    const intervals: Record<ChordType, number[]> = {
      major: [0, 4, 7],
      minor: [0, 3, 7],
      '7': [0, 4, 7, 10]
    };
    const interval = (noteNames.indexOf(note) - noteNames.indexOf(rootNote) + 12) % 12;
    const index = intervals[chordType].indexOf(interval);
    
    switch (index) {
      case 0: return 'R';
      case 1: return chordType === 'minor' ? 'b3' : '3';
      case 2: return '5';
      case 3: return 'b7';
      default: return '';
    }
  };

  const updateChordInfo = (): void => {
    const positions = chordPositions[chordType][selectedChord];
    const rootNote = selectedChord.replace('m', '').charAt(0) as Note;
    const chordTones = getChordTones(rootNote, chordType);
    
    let info = `Debug Info for ${selectedChord} chord:\n`;
    info += `Chord tones: ${chordTones.join(', ')}\n\n`;
    
    for (let stringIndex = 5; stringIndex >= 0; stringIndex--) {
      const fret = positions[stringIndex];
      if (fret >= 0) {
        const note = getNoteAtFret(stringIndex, fret);
        const tone = chordTones.includes(note) ? note : 'non-chord tone';
        const chordFunction = getChordFunction(note, rootNote, chordType);
        info += `String ${6 - stringIndex} (${stringTuning[stringIndex]}), Fret ${fret}: Note ${note}, Tone ${tone}, Function: ${chordFunction}\n`;
      } else {
        info += `String ${6 - stringIndex} (${stringTuning[stringIndex]}): Muted\n`;
      }
    }
    setDebugInfo(info);
  };

  useEffect(() => {
    updateChordInfo();
  }, [selectedChord, chordType, showChordFunctions]);

  const renderFretboard = (): JSX.Element => {
    const positions = chordPositions[chordType][selectedChord];
    const rootNote = selectedChord.replace('m', '').charAt(0) as Note;
    const chordTones = getChordTones(rootNote, chordType);

    return (
      <>
        {[0, 1, 2, 3, 4, 5].map(fret => (
          <line 
            key={`fret-${fret}`}
            x1={20 + fret * 100} 
            y1={20} 
            x2={20 + fret * 100} 
            y2={200} 
            stroke="silver" 
            strokeWidth={fret === 0 ? 4 : 2} 
          />
        ))}
        {[0, 1, 2, 3, 4, 5].map(string => (
          <line 
            key={`string-${string}`}
            x1={20} 
            y1={40 + string * 30} 
            x2={530} 
            y2={40 + string * 30} 
            stroke="silver" 
            strokeWidth={string + 1}
          />
        ))}
        {positions.map((position, stringIndex) => {
          if (position > 0) {
            const note = getNoteAtFret(stringIndex, position);
            const chordFunction = getChordFunction(note, rootNote, chordType);
            const displayText = showChordFunctions ? chordFunction : note;
            return (
              <g key={`finger-${stringIndex}`}>
                <circle
                  cx={20 + position * 100 - 50}
                  cy={40 + (5 - stringIndex) * 30}
                  r={12}
                  fill={chordTones.includes(note) ? "yellow" : "lightgray"}
                  stroke="black"
                  strokeWidth={1}
                />
                <text
                  x={20 + position * 100 - 50}
                  y={45 + (5 - stringIndex) * 30}
                  fontFamily="Arial"
                  fontSize={12}
                  fill="black"
                  textAnchor="middle"
                >
                  {displayText}
                </text>
              </g>
            );
          } else if (position === 0) {
            const note = getNoteAtFret(stringIndex, position);
            const chordFunction = getChordFunction(note, rootNote, chordType);
            const displayText = showChordFunctions ? chordFunction : note;
            return (
              <g key={`open-${stringIndex}`}>
                <circle
                  cx={10}
                  cy={40 + (5 - stringIndex) * 30}
                  r={8}
                  fill="none"
                  stroke="black"
                  strokeWidth={2}
                />
                <text
                  x={10}
                  y={45 + (5 - stringIndex) * 30}
                  fontFamily="Arial"
                  fontSize={12}
                  fill="black"
                  textAnchor="middle"
                >
                  {displayText}
                </text>
              </g>
            );
          } else {
            return (
              <text
                key={`mute-${stringIndex}`}
                x={10}
                y={45 + (5 - stringIndex) * 30}
                fontFamily="Arial"
                fontSize={20}
                fill="black"
                textAnchor="middle"
              >
                ×
              </text>
            );
          }
        })}
      </>
    );
  };

  const handleChordTypeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const newChordType = e.target.value as ChordType;
    setChordType(newChordType);
    setSelectedChord(Object.keys(chordPositions[newChordType])[0]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Guitar Chord Diagram</h2>
      <div style={{ marginBottom: '1rem' }}>
        <select 
          value={selectedChord} 
          onChange={(e) => setSelectedChord(e.target.value)}
          style={{ marginRight: '1rem' }}
        >
          {Object.keys(chordPositions[chordType]).map(chord => (
            <option key={chord} value={chord}>{chord}</option>
          ))}
        </select>
        <select 
          value={chordType} 
          onChange={handleChordTypeChange}
          style={{ marginRight: '1rem' }}
        >
          <option value="major">Major</option>
          <option value="minor">Minor</option>
          <option value="7">7th</option>
        </select>
        <label>
          <input
            type="checkbox"
            checked={showChordFunctions}
            onChange={(e) => setShowChordFunctions(e.target.checked)}
          />
          Show Chord Functions
        </label>
      </div>
      <svg viewBox="0 0 550 220" width={550} height={220}>
        <rect x={20} y={20} width={510} height={180} fill="#D2691E" />
        {renderFretboard()}
        {stringTuning.map((label, index) => (
          <text 
            key={`string-label-${index}`}
            x={540}
            y={45 + (5 - index) * 30} 
            fontFamily="Arial" 
            fontSize={14} 
            fill="black" 
            textAnchor="start"
          >
            {label}
          </text>
        ))}
        {[1, 2, 3, 4, 5].map(fret => (
          <text 
            key={`fret-number-${fret}`}
            x={70 + (fret - 1) * 100} 
            y={215} 
            fontFamily="Arial" 
            fontSize={14} 
            fill="black" 
            textAnchor="middle"
          >
            {fret}
          </text>
        ))}
      </svg>
      <pre style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '0.8rem', maxWidth: '100%', overflow: 'auto' }}>
        {debugInfo}
      </pre>
    </div>
  );
};

export default GuitarChordDiagram;
