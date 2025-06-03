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

  // Basic styles to replace Tailwind
  const sectionStyle: React.CSSProperties = {
    padding: '16px',
    border: '1px solid #e5e7eb', // gray-200
    borderRadius: '0.5rem', // rounded-lg
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // shadow-sm
    marginBottom: '24px', // Corresponds to space-y-6 if this is the only direct child
  };

  const headingStyle: React.CSSProperties = {
    fontSize: '1.125rem', // text-lg
    fontWeight: '600', // font-semibold
    marginBottom: '8px',
    color: '#4b5563', // gray-700
  };

  const pStyle: React.CSSProperties = {
    fontSize: '0.875rem', // text-sm
    color: '#4b5563', // gray-600
    marginBottom: '12px',
  };

  const selectContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px',
  };

  const selectStyle: React.CSSProperties = {
    flexGrow: 1,
    padding: '8px',
    border: '1px solid #d1d5db', // gray-300
    borderRadius: '0.375rem', // rounded-md
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // shadow-sm
    fontSize: '0.875rem', // text-sm
  };

  const baseButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 16px',
    fontSize: '0.875rem',
    fontWeight: '600',
    borderRadius: '0.375rem',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    cursor: 'pointer',
    border: '1px solid transparent', // For consistency
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...baseButtonStyle,
    backgroundColor: '#2563eb', // blue-600
    color: 'white',
  };

  const primaryButtonDisabledStyle: React.CSSProperties = {
    ...primaryButtonStyle,
    opacity: 0.5,
    cursor: 'not-allowed',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...baseButtonStyle,
    backgroundColor: '#e5e7eb', // gray-200
    color: '#374151', // gray-700
    width: 'auto', // Allow auto width for side-by-side buttons
    flexGrow: 1, // Allow buttons to grow in flex container
  };

  const importExportContainerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row', // Default, but explicit
      gap: '12px', // Simulates gap-3 for row
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}> {/* Simulates space-y-6 */}
      <div style={sectionStyle}>
        <h4 style={headingStyle}>Chord Sequence Generator</h4>
        <p style={pStyle}>{introTexts.progressionGeneratorInfo || "Select a key and a common chord progression type (e.g., I-V-vi-IV) to automatically generate a chord sequence. This is a great way to explore new ideas or practice common patterns."}</p>
        <div style={selectContainerStyle}>
            <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            style={selectStyle}
            >
            {KEYS.map(key => <option key={key} value={key}>{key}</option>)}
            </select>
            <select
            value={selectedProgression}
            onChange={(e) => setSelectedProgression(e.target.value)}
            style={selectStyle}
            >
            <option value="">Select a progression</option>
            {chordProgressions.map((prog, index) => (
                <option key={index} value={prog.value}>{prog.name}</option>
            ))}
            </select>
        </div>
        <button
            onClick={handleGenerateSequence}
            style={!selectedProgression ? primaryButtonDisabledStyle : primaryButtonStyle}
            disabled={!selectedProgression}
        >
            Generate & Load Sequence to App
        </button>
      </div>

      <div style={sectionStyle}>
        <h4 style={headingStyle}>Stock Songs</h4>
        <p style={pStyle}>{introTexts.stockSongsInfo || "Explore our collection of pre-loaded song progressions. These carefully selected chord sequences represent popular songs across various genres. Use them to learn new songs, understand common chord progressions, or as inspiration for your own compositions."}</p>
        <select
          value={selectedSong}
          onChange={handleStockSongSelection}
          style={{...selectStyle, marginBottom: '12px', width: '100%' }} // Ensure full width for this select
        >
          <option value="">Select a stock song</option>
          {stockSongs.songs.map((song, index) => (
            <option key={index} value={song.title}>{song.title}</option>
          ))}
        </select>
      </div>

      <div style={sectionStyle}>
        <h4 style={headingStyle}>Import / Export</h4>
        <div style={importExportContainerStyle}>
            <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleImport}
            accept=".txt,.chords,.sequence"
            />
            <button onClick={() => fileInputRef.current?.click()} style={secondaryButtonStyle}>Import & Load Sequence</button>
            <button onClick={handleExport} style={secondaryButtonStyle}>Export Current App Sequence</button>
        </div>
      </div>

      <div style={{...sectionStyle, backgroundColor: '#f9fafb' /* gray-50 */ }}>
        <h4 style={headingStyle}>Strumming Pattern Guide</h4>
        <div style={{ fontSize: '0.75rem', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '4px' }}> {/* text-xs, gray-600, space-y-1 */}
            <p>In the "Edit Sequence" modal, you can define strumming patterns or chord durations.</p>
            <p>- Use <strong>D for downstrokes</strong> and <strong>U for upstrokes</strong> within parentheses, e.g., <code>C(D D U D)</code>.</p>
            <p>- Alternatively, specify a <strong>numeric duration</strong> in beats, e.g., <code>Am(4)</code>.</p>
            <p>- You can add labels like <code>Verse:</code> or <code>Chorus:</code> before a series of chords.</p>
            <p>- Example: <code>Verse: G(D U D U) C(4) Em(D D)</code></p>
        </div>
      </div>
    </div>
  );
};

export default SequenceFeatures;
