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

  return (
    <div className="chord-browser">
      <div>
        <select value={rootNote} onChange={handleRootNoteChange}>
          {ROOT_NOTES.map(note => (
            <option key={note} value={note}>{note}</option>
          ))}
        </select>
        <select value={chordType} onChange={handleChordTypeChange}>
          {CHORD_TYPES.map(type => (
            <option key={type} value={type}>{CHORD_TYPE_LABELS[type]}</option>
          ))}
        </select>
      </div>
      <div>
        <p>Chord Formula: {chordFormulas[chordType]}</p>
      </div>
    </div>
  );
};

export default ChordBrowser;