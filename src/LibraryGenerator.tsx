import React, { useState } from 'react';
import { KEYS } from './types';
import stockSongs from './stockSongs.json';

type LibraryGeneratorProps = {
  setChordSequence: (sequence: string) => void;
};

const LibraryGenerator: React.FC<LibraryGeneratorProps> = ({ setChordSequence }) => {
  const [selectedKey, setSelectedKey] = useState('C Major');
  const [selectedProgression, setSelectedProgression] = useState('I-V-vi-IV');
  const [selectedSong, setSelectedSong] = useState('');

  const getStrumCount = (numeral: string, index: number, totalChords: number): number => {
    if (index === 0 || index === totalChords - 1) return 4;
    if (['i', 'iv', 'v'].includes(numeral.toLowerCase())) return 4;
    return 2;
  };

  const handleGenerate = () => {
    const keyMaps: Record<string, string[]> = {
      'C Major': ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
      'G Major': ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'],
      'D Major': ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'],
      'A Major': ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'],
      'E Major': ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'],
      'F Major': ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim'],
      'A Minor': ['Am', 'Bdim', 'C', 'Dm', 'Em', 'F', 'G'],
      'E Minor': ['Em', 'F#dim', 'G', 'Am', 'Bm', 'C', 'D'],
      'B Minor': ['Bm', 'C#dim', 'D', 'Em', 'F#m', 'G', 'A'],
      'F# Minor': ['F#m', 'G#dim', 'A', 'Bm', 'C#m', 'D', 'E'],
      'C# Minor': ['C#m', 'D#dim', 'E', 'F#m', 'G#m', 'A', 'B'],
      'D Minor': ['Dm', 'Edim', 'F', 'Gm', 'Am', 'Bb', 'C']
    };

    const isMinorKey = selectedKey.includes('Minor');
    const numerals = selectedProgression.split('-');
    const chords = numerals.map((numeral, index) => {
      let chordIndex;
      if (numeral.startsWith('b')) {
        chordIndex = ['', 'bII', 'bIII', '', 'bV', 'bVI', 'bVII'].indexOf(numeral);
      } else {
        chordIndex = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'].indexOf(numeral.toLowerCase());
      }

      if (chordIndex !== -1) {
        let chord = keyMaps[selectedKey][chordIndex];
        if (isMinorKey) {
          if (numeral.toLowerCase() === 'iv' || numeral.toLowerCase() === 'v') {
            if (chord.endsWith('m')) {
              chord = chord.slice(0, -1);
            }
          } else if (numeral.toUpperCase() === numeral) {
            if (chord.endsWith('m')) {
              chord = chord.slice(0, -1);
            }
          }
        } else {
          if (numeral.toLowerCase() === numeral && !chord.endsWith('m') && !chord.endsWith('dim')) {
            chord += 'm';
          }
        }
        const strumCount = getStrumCount(numeral, index, numerals.length);
        return `${chord}(${strumCount})`;
      } else {
        return numeral;
      }
    });

    setChordSequence(chords.join(', '));
  };

  return (
    <div className="library-generator">
      <h3>Sequence Generator</h3>
      <select value={selectedKey} onChange={(e) => setSelectedKey(e.target.value)}>
        {KEYS.map(key => <option key={key} value={key}>{key}</option>)}
      </select>
      <select value={selectedProgression} onChange={(e) => setSelectedProgression(e.target.value)}>
        <option value="I-V-vi-IV">Pop (I-V-vi-IV)</option>
        <option value="ii-V-I">Jazz (ii-V-I)</option>
        <option value="I-IV-V">Blues (I-IV-V)</option>
        <option value="I-vi-IV-V">50s Doo-Wop (I-vi-IV-V)</option>
        <option value="vi-IV-I-V">Pop/Rock (vi-IV-I-V)</option>
        <option value="I-V-vi-iii-IV-I-IV-V">Canon (I-V-vi-iii-IV-I-IV-V)</option>
        <option value="I-IV-vi-V">Modern Pop (I-IV-vi-V)</option>
        <option value="i-bVII-bVI-V">Minor Pop/Rock (i-bVII-bVI-V)</option>
        <option value="I-bVII-IV">Rock (I-bVII-IV)</option>
        <option value="I-V-IV">Country/Folk (I-V-IV)</option>
        <option value="ii-I-V">Jazz Turnaround (ii-I-V)</option>
        <option value="I-vi-ii-V">Jazz Standard (I-vi-ii-V)</option>
      </select>
      <button onClick={handleGenerate}>Generate Sequence</button>

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
      >
        <option value="">Select a stock song</option>
        {stockSongs.songs.map((song, index) => (
          <option key={index} value={song.title}>{song.title}</option>
        ))}
      </select>
    </div>
  );
};

export default LibraryGenerator;