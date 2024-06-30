import React from 'react';
import { RootNote, ChordType, ROOT_NOTES, CHORD_TYPES, CHORD_TYPE_LABELS, chordFormulas } from './types';

type ChordBrowserProps = {
  rootNote: RootNote;
  setRootNote: (note: RootNote) => void;
  chordType: ChordType;
  setChordType: (type: ChordType) => void;
};

const ChordBrowser: React.FC<ChordBrowserProps> = ({
  rootNote,
  setRootNote,
  chordType,
  setChordType
}) => {
  return (
    <div className="chord-browser">
      <div>
        <select value={rootNote} onChange={(e) => setRootNote(e.target.value as RootNote)}>
          {ROOT_NOTES.map(note => (
            <option key={note} value={note}>{note}</option>
          ))}
        </select>
        <select value={chordType} onChange={(e) => setChordType(e.target.value as ChordType)}>
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