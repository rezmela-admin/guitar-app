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

  const primaryButtonClasses = "w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed";
  const secondaryButtonClasses = "w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75";
  const selectInputClasses = "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm";


  return (
    <div className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
        <h4 className="text-lg font-semibold mb-2 text-gray-700">Chord Sequence Generator</h4>
        <p className="text-sm text-gray-600 mb-3">{introTexts.progressionGeneratorInfo || "Select a key and a common chord progression type (e.g., I-V-vi-IV) to automatically generate a chord sequence. This is a great way to explore new ideas or practice common patterns."}</p>
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <select 
            value={selectedKey} 
            onChange={(e) => setSelectedKey(e.target.value)}
            className={`${selectInputClasses} sm:flex-grow`}
            >
            {KEYS.map(key => <option key={key} value={key}>{key}</option>)}
            </select>
            <select 
            value={selectedProgression} 
            onChange={(e) => setSelectedProgression(e.target.value)}
            className={`${selectInputClasses} sm:flex-grow`}
            >
            <option value="">Select a progression</option>
            {chordProgressions.map((prog, index) => (
                <option key={index} value={prog.value}>{prog.name}</option>
            ))}
            </select>
        </div>
        <button 
            onClick={handleGenerateSequence} 
            className={primaryButtonClasses}
            disabled={!selectedProgression} // Disable if no progression is selected
        >
            Generate & Load Sequence to App
        </button>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
        <h4 className="text-lg font-semibold mb-2 text-gray-700">Stock Songs</h4>
        <p className="text-sm text-gray-600 mb-3">{introTexts.stockSongsInfo || "Explore our collection of pre-loaded song progressions. These carefully selected chord sequences represent popular songs across various genres. Use them to learn new songs, understand common chord progressions, or as inspiration for your own compositions."}</p>
        <select 
          value={selectedSong}
          onChange={handleStockSongSelection}
          className={`${selectInputClasses} mb-3`}
        >
          <option value="">Select a stock song</option>
          {stockSongs.songs.map((song, index) => (
            <option key={index} value={song.title}>{song.title}</option>
          ))}
        </select>
        {/* The selected song is automatically loaded via onChange, no separate button needed here */}
      </div>

      <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
        <h4 className="text-lg font-semibold mb-2 text-gray-700">Import / Export</h4>
        <div className="flex flex-col sm:flex-row gap-3">
            <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleImport}
            accept=".txt,.chords,.sequence" // More specific accept types
            />
            <button onClick={() => fileInputRef.current?.click()} className={secondaryButtonClasses}>Import & Load Sequence</button>
            <button onClick={handleExport} className={secondaryButtonClasses}>Export Current App Sequence</button>
        </div>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
        <h4 className="text-lg font-semibold mb-2 text-gray-700">Strumming Pattern Guide</h4>
        <div className="text-xs text-gray-600 space-y-1">
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
