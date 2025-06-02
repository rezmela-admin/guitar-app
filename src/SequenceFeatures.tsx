import React, { useState, useRef } from 'react';
import { KEYS }
from './types'; // Assuming RootNote, ChordType might be needed for more advanced generation later
import stockSongs from './stockSongs.json';
import { generateChordSequence } from './LibraryGenerator'; // Corrected path
import { chordProgressions } from './sequenceFormulas';
import { introTexts } from './appIntroTexts'; // For placeholder texts if needed

interface SequenceFeaturesProps {
  // This prop will send the newly generated/loaded sequence string to GuitarChordApp
  onLoadSequenceToApp: (newSequence: string) => void; 
  // This prop is for the sequence currently being edited/displayed in ManualSequenceEditor,
  // primarily for the export function.
  currentSequenceForExport: string; 
}

const SequenceFeatures: React.FC<SequenceFeaturesProps> = ({ onLoadSequenceToApp, currentSequenceForExport }) => {
  const [selectedKey, setSelectedKey] = useState<string>('C Major');
  const [selectedProgression, setSelectedProgression] = useState<string>(''); // Default to empty
  const [selectedSong, setSelectedSong] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateSequence = () => {
    if (!selectedProgression) {
      alert("Please select a chord progression.");
      return;
    }
    try {
      const generatedSequence = generateChordSequence(selectedKey, selectedProgression);
      onLoadSequenceToApp(generatedSequence); // Directly load to app
    } catch (error) {
      console.error("Error generating chord sequence:", error);
      alert(`An error occurred while generating the chord sequence: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleStockSongSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const songTitle = e.target.value;
    setSelectedSong(songTitle);
    const song = stockSongs.songs.find(s => s.title === songTitle);
    if (song) {
      onLoadSequenceToApp(song.chordSequence); // Directly load to app
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onLoadSequenceToApp(content); // Directly load to app
      };
      reader.readAsText(file);
      // Reset file input to allow importing the same file again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleExport = () => {
    if (!currentSequenceForExport || currentSequenceForExport.trim() === "") {
        alert("There is no sequence to export. Please edit or load a sequence first in the 'Edit Sequence' modal.");
        return;
    }
    const blob = new Blob([currentSequenceForExport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chord_sequence.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
        <h4>Chord Sequence Generator</h4>
        <p>{introTexts.progressionGeneratorInfo || "Select a key and a common chord progression type (e.g., I-V-vi-IV) to automatically generate a chord sequence. This is a great way to explore new ideas or practice common patterns."}</p>
        <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
            <select 
            value={selectedKey} 
            onChange={(e) => setSelectedKey(e.target.value)}
            style={{ flexGrow: 1 }}
            >
            {KEYS.map(key => <option key={key} value={key}>{key}</option>)}
            </select>
            <select 
            value={selectedProgression} 
            onChange={(e) => setSelectedProgression(e.target.value)}
            style={{ flexGrow: 1 }}
            >
            <option value="">Select a progression</option>
            {chordProgressions.map((prog, index) => (
                <option key={index} value={prog.value}>{prog.name}</option>
            ))}
            </select>
        </div>
        <button onClick={handleGenerateSequence} style={{width: '100%'}}>Generate & Load Sequence to App</button>
      </div>

      <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
        <h4>Stock Songs</h4>
        <p>{introTexts.stockSongsInfo || "Explore our collection of pre-loaded song progressions. These carefully selected chord sequences represent popular songs across various genres. Use them to learn new songs, understand common chord progressions, or as inspiration for your own compositions."}</p>
        <select 
          value={selectedSong}
          onChange={handleStockSongSelection}
          style={{ width: '100%', marginBottom: '10px' }}
        >
          <option value="">Select a stock song</option>
          {stockSongs.songs.map((song, index) => (
            <option key={index} value={song.title}>{song.title}</option>
          ))}
        </select>
        {/* The selected song is automatically loaded via onChange */}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImport}
          accept=".txt, .chords"
        />
        <button onClick={() => fileInputRef.current?.click()}>Import & Load Sequence</button>
        <button onClick={handleExport}>Export Current App Sequence</button>
      </div>

      <div>
        <h4>Strumming Pattern Guide</h4>
        <p style={{fontSize: '0.9em', color: '#555'}}>
          In the "Edit Sequence" modal, you can define strumming patterns or chord durations.
          <br />- Use <strong>D for downstrokes</strong> and <strong>U for upstrokes</strong> within parentheses, e.g., <code>C(D D U D)</code>.
          <br />- Alternatively, specify a <strong>numeric duration</strong> in beats, e.g., <code>Am(4)</code>.
          <br />- You can add labels like <code>Verse:</code> or <code>Chorus:</code> before a series of chords.
          <br />- Example: <code>Verse: G(D U D U) C(4) Em(D D)</code>
        </p>
      </div>
    </div>
  );
};

export default SequenceFeatures;
