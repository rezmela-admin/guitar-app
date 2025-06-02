import React, { useState, useEffect, useRef } from 'react';

interface ManualSequenceEditorProps {
  currentSequenceInApp: string;
  onLoadSequenceToApp: (newSequence: string, isValid: boolean) => void;
}

const ManualSequenceEditor: React.FC<ManualSequenceEditorProps> = ({ currentSequenceInApp, onLoadSequenceToApp }) => {
  const [localChordSequence, setLocalChordSequence] = useState<string>(currentSequenceInApp);
  const [isDirty, setIsDirty] = useState(false);
  const [isLocalSequenceValid, setIsLocalSequenceValid] = useState(true);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalChordSequence(currentSequenceInApp);
    setIsLocalSequenceValid(validateSequence(currentSequenceInApp));
    setIsDirty(false); // Sequence loaded from parent is considered "clean"
  }, [currentSequenceInApp]);

  const validateSequence = (sequence: string): boolean => {
    if (sequence.trim() === "") {
      return true; 
    }
    const chordPattern = /([A-G][b#]?)([^(]*)\(((?:[DU]\s?)+|[0-9]+)\)/;
    const lines = sequence.split('\n');
    return lines.some(line => {
      const parts = line.split(':');
      if (parts.length === 0) return false;
      const chordsSection = parts[parts.length - 1];
      return typeof chordsSection === 'string' && chordsSection.split(',').some(part => chordPattern.test(part.trim()));
    });
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newSequence = event.target.value;
    setLocalChordSequence(newSequence);
    const isValid = validateSequence(newSequence);
    setIsLocalSequenceValid(isValid);
    setIsDirty(true);
  };

  const handleLoadSequenceForPlayback = () => {
    // Parent validation (isLocalSequenceValid) is already checked via button's disabled state
    // but this ensures it only loads if explicitly valid and dirty.
    if (!isDirty || !isLocalSequenceValid) {
      console.warn("Attempted to load sequence for playback when not dirty or invalid.");
      // Optionally, provide user feedback here, though button state should prevent this.
      return;
    }
    onLoadSequenceToApp(localChordSequence, isLocalSequenceValid);
    setIsDirty(false); // Reset dirty state after loading to app
  };

  return (
    <div>
      <textarea
        ref={textAreaRef}
        value={localChordSequence}
        onChange={handleTextChange}
        style={{ width: '100%', minHeight: '150px', marginBottom: '10px', border: `1px solid ${isLocalSequenceValid ? (isDirty ? 'orange' : 'gray') : 'red'}` }}
        placeholder="Enter your chord sequence here, e.g., Verse: C(D D U D) G(D U D U) Am(D D U D) F(D U D U)"
      />
      {!isLocalSequenceValid && <p style={{color: 'red', marginTop: '-10px', marginBottom: '10px'}}>Warning: The current sequence has an invalid format.</p>}
      <button 
        onClick={handleLoadSequenceForPlayback} 
        disabled={!isDirty || !isLocalSequenceValid}
        style={{ display: 'block', width: '100%'}}
      >
        Load Edited Sequence to App
      </button>
      {isDirty && <p style={{fontStyle: 'italic', fontSize: '0.9em', marginTop: '5px'}}>You have unsaved changes in the editor.</p>}
    </div>
  );
};

export default ManualSequenceEditor;
