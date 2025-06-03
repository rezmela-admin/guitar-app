import React from 'react';
import { RootNote, ChordType, ROOT_NOTES, CHORD_TYPES, CHORD_TYPE_LABELS, chordFormulas } from './types';

interface ChordBrowserProps {
  rootNote: RootNote;
  setRootNote: (note: RootNote) => void;
  chordType: ChordType;
  setChordType: (type: ChordType) => void;
  playChord: (root: RootNote, type: ChordType) => void;
}

const ChordBrowser: React.FC<ChordBrowserProps> = ({
  rootNote,
  setRootNote,
  chordType,
  setChordType,
  playChord
}) => {
  const handleRootNoteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRootNote = e.target.value as RootNote;
    setRootNote(newRootNote);
    playChord(newRootNote, chordType);
  };

  const handleChordTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newChordType = e.target.value as ChordType;
    setChordType(newChordType);
    playChord(rootNote, newChordType);
  };

  const containerStyle: React.CSSProperties = {
    padding: '10px',
    border: '1px solid #eee',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9',
    marginBottom: '10px', // Added margin for spacing if it's part of a larger layout
  };

  const selectContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px', // Space between select elements
    marginBottom: '10px',
  };

  const selectStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: 'white',
    flexGrow: 1, // Allow selects to grow and fill space
    minWidth: '100px', // Minimum width for each select
  };

  const formulaTextStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    color: '#333',
    marginTop: '10px',
  };

  return (
    <div style={containerStyle}>
      <div style={selectContainerStyle}>
        <select value={rootNote} onChange={handleRootNoteChange} style={selectStyle}>
          {ROOT_NOTES.map(note => (
            <option key={note} value={note}>{note}</option>
          ))}
        </select>
        <select value={chordType} onChange={handleChordTypeChange} style={selectStyle}>
          {CHORD_TYPES.map(type => (
            <option key={type} value={type}>{CHORD_TYPE_LABELS[type]}</option>
          ))}
        </select>
      </div>
      <div>
        <p style={formulaTextStyle}>Chord Formula: {chordFormulas[chordType]}</p>
      </div>
    </div>
  );
};

export default ChordBrowser;