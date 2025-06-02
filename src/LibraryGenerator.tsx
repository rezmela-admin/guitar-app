import React, { useState } from 'react';
import { KEYS } from './types';
import stockSongs from './stockSongs.json';
import { chordProgressions } from './sequenceFormulas';

type LibraryGeneratorProps = {
  setChordSequence: (sequence: string) => void;
};

const keyMaps: Record<string, string[]> = {
  'C Major': ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim', 'Bb', 'Ab'],
  'G Major': ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim', 'F', 'Eb'],
  'D Major': ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim', 'C', 'Bb'],
  'A Major': ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim', 'G', 'F'],
  'E Major': ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim', 'D', 'C'],
  'F Major': ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim', 'Eb', 'Db'],
  'A Minor': ['Am', 'Bdim', 'C', 'Dm', 'Em', 'F', 'G', 'G', 'F'],
  'E Minor': ['Em', 'F#dim', 'G', 'Am', 'Bm', 'C', 'D', 'D', 'C'],
  'B Minor': ['Bm', 'C#dim', 'D', 'Em', 'F#m', 'G', 'A', 'A', 'G'],
  'F# Minor': ['F#m', 'G#dim', 'A', 'Bm', 'C#m', 'D', 'E', 'E', 'D'],
  'C# Minor': ['C#m', 'D#dim', 'E', 'F#m', 'G#m', 'A', 'B', 'B', 'A'],
  'D Minor': ['Dm', 'Edim', 'F', 'Gm', 'Am', 'Bb', 'C', 'C', 'Bb']
};

const defaultStrumPattern = 'D D U D';

export function generateChordSequence(key: string, progression: string): string {
  // Find the selected progression
  const selectedProgression = chordProgressions.find(prog => prog.value === progression);
  if (!selectedProgression) {
    throw new Error('Invalid progression selected');
  }

  // Check if the key is valid
  if (!KEYS.includes(key)) {
    throw new Error('Invalid key selected');
  }

  // Get the progression steps
  const progressionSteps = selectedProgression.value.split('-');

  // Get the chords for the selected key
  const chords = keyMaps[key];
  const isMinorKey = key.includes('Minor');

  // Function to get the chord index based on the step
  const getChordIndex = (step: string): number => {
    const lowercaseStep = step.toLowerCase();
    switch (lowercaseStep) {
      case 'i': return 0;
      case 'ii': return 1;
      case 'iii': return 2;
      case 'iv': return 3;
      case 'v': return 4;
      case 'vi': return 5;
      case 'vii': return 6;
      case 'bvii': return 7;
      case 'bvi': return 8;
      default: throw new Error(`Unsupported chord step: ${step}`);
    }
  };

  // Generate the chord sequence
  const chordSequence = progressionSteps.map(step => {
    const index = getChordIndex(step);
    let chord = chords[index];

    // If the step is lowercase (except 'i' in minor keys) and the chord doesn't already end with 'm' or 'dim',
    // add 'm' to make it minor
    if (step === step.toLowerCase() && !(isMinorKey && step === 'i') && !chord.endsWith('m') && !chord.endsWith('dim')) {
      chord += 'm';
    }

    return `${chord}(${defaultStrumPattern})`;
  });

  // Join the chords into a single string
  return chordSequence.join(' ');
}

const LibraryGenerator: React.FC<LibraryGeneratorProps> = ({ setChordSequence }) => {
  const [selectedKey, setSelectedKey] = useState('C Major');
  const [selectedProgression, setSelectedProgression] = useState('I-V-vi-IV');
  const [selectedSong, setSelectedSong] = useState('');

  const handleGenerate = () => {
    const generatedSequence = generateChordSequence(selectedKey, selectedProgression);
    setChordSequence(generatedSequence);
  };

  return (
    <div className="library-generator">
      <h3>Sequence Generator</h3>
      <select value={selectedKey} onChange={(e) => setSelectedKey(e.target.value)}>
        {KEYS.map(key => <option key={key} value={key}>{key}</option>)}
      </select>
      <select value={selectedProgression} onChange={(e) => setSelectedProgression(e.target.value)}>
        {chordProgressions.map((prog, index) => (
          <option key={index} value={prog.value}>{prog.name}</option>
        ))}
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