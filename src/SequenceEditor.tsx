import React, { useState, useRef, useEffect } from 'react';
import { KEYS } from './types';
import stockSongs from './stockSongs.json';
import { generateChordSequence } from './LibraryGenerator';
import { chordProgressions } from './sequenceFormulas';
import { introTexts } from './appIntroTexts';

interface SequenceEditorProps {
  chordSequence: string;
  setChordSequence: React.Dispatch<React.SetStateAction<string>>;
  setSequenceValidity: React.Dispatch<React.SetStateAction<boolean>>;
}

const SequenceEditor: React.FC<SequenceEditorProps> = ({ chordSequence, setChordSequence, setSequenceValidity }) => {
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [selectedKey, setSelectedKey] = useState<string>('C Major');
  const [selectedProgression, setSelectedProgression] = useState<string>('');
  const [selectedSong, setSelectedSong] = useState<string>('');
  const [localChordSequence, setLocalChordSequence] = useState<string>(chordSequence);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log("chordSequence prop updated:", chordSequence);
    setLocalChordSequence(chordSequence);
  }, [chordSequence]);

const validateSequence = (sequence: string): boolean => {
  const chordPattern = /([A-G][b#]?)([^(]*)\(((?:[DU]\s?)+|[0-9]+)\)/;
  const lines = sequence.split('\n');
  return lines.some(line => {
    const parts = line.split(':');
    const chordsSection = parts[parts.length - 1];
    return chordsSection.split(',').some(part => chordPattern.test(part.trim()));
  });
};

  const updateSequence = (newSequence: string) => {
    setLocalChordSequence(newSequence);
    const isValid = validateSequence(newSequence);
	setChordSequence(newSequence);
	setSequenceValidity(isValid);
	console.log(isValid ? "Valid sequence:" : "Invalid sequence:", newSequence);
  };
  
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
	  updateSequence(event.target.value);
  };


  const handleCursorChange = () => {
    if (textAreaRef.current) {
      setCursorPosition(textAreaRef.current.selectionStart);
    }
  };

	const updateTextAreaContent = (newContent: string) => {
	  console.log("Updating text area content:", newContent);
	  updateSequence(newContent);
	  const newPosition = newContent.length;
	  setCursorPosition(newPosition);
	  if (textAreaRef.current) {
		textAreaRef.current.focus();
		textAreaRef.current.setSelectionRange(newPosition, newPosition);
	  }
	  console.log("Text area content updated");
	};

  const generateSequence = () => {
    console.log("Generate Sequence clicked");
    console.log("Selected Key:", selectedKey);
    console.log("Selected Progression:", selectedProgression);

    if (!selectedProgression) {
      console.error("No progression selected");
      alert("Please select a chord progression");
      return;
    }

    try {
      console.log("Generating chord sequence...");
      const generatedSequence = generateChordSequence(selectedKey, selectedProgression);
      console.log("Generated Sequence:", generatedSequence);

      updateTextAreaContent(generatedSequence);
      console.log("Sequence updated successfully");
    } catch (error) {
      console.error("Error generating chord sequence:", error);
      alert("An error occurred while generating the chord sequence. Please try again.");
    }
  };

	const handleStockSongSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
	   setSelectedSong(e.target.value);
	   const song = stockSongs.songs.find(s => s.title === e.target.value);
	   if (song) {
		 updateSequence(song.chordSequence);
	   }
	};

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        updateTextAreaContent(content);
      };
      reader.readAsText(file);
    }
  };

  const handleExport = () => {
    const blob = new Blob([localChordSequence], { type: 'text/plain' });
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
      <textarea
        ref={textAreaRef}
        value={localChordSequence}
        onChange={handleTextChange}
        onKeyUp={handleCursorChange}
        onClick={handleCursorChange}
        style={{ width: '100%', height: '100px', marginBottom: '20px' }}
      />
      <div style={{ marginBottom: '20px' }}>
        <h4>Chord Sequence Generator</h4>
        <p>{introTexts.stockSongs}</p>
        <select 
          value={selectedKey} 
          onChange={(e) => setSelectedKey(e.target.value)}
          style={{ marginRight: '10px' }}
        >
          {KEYS.map(key => <option key={key} value={key}>{key}</option>)}
        </select>
        <select 
          value={selectedProgression} 
          onChange={(e) => setSelectedProgression(e.target.value)}
          style={{ marginRight: '10px' }}
        >
          <option value="">Select a progression</option>
          {chordProgressions.map((prog, index) => (
            <option key={index} value={prog.value}>{prog.name}</option>
          ))}
        </select>
        <button onClick={generateSequence}>Generate Sequence</button>
      </div>
      <div>
        <h4>Stock Songs</h4>
        <p>{introTexts.stockSongs}</p>
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
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImport}
          accept=".txt"
        />
        <button onClick={() => fileInputRef.current?.click()}>Import Sequence</button>
        <button onClick={handleExport}>Export Sequence</button>
      </div>
      <div>
        <h4>Strumming Pattern Guide</h4>
        <p>Use D for downstrokes and U for upstrokes. Example: C(D D U D) Am(D U D U)</p>
      </div>
    </div>
  );
};

export default SequenceEditor;