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

  const baseButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 15px',
    fontSize: '1rem',
    color: 'white',
    backgroundColor: '#007bff', // Blue color
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  const disabledButtonStyle: React.CSSProperties = {
    ...baseButtonStyle,
    backgroundColor: '#cccccc',
    color: '#666666',
    cursor: 'not-allowed',
  };
  
  const getBorderColor = () => {
    if (!isLocalSequenceValid) return 'red';
    if (isDirty) return 'orange';
    return '#cccccc'; // Default gray border
  };

  const textAreaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '150px',
    padding: '10px',
    border: `1px solid ${getBorderColor()}`,
    borderRadius: '4px',
    boxSizing: 'border-box', // Ensure padding and border don't increase width
    marginBottom: '10px',
  };
  
  const warningTextStyle: React.CSSProperties = {
      color: 'red',
      fontSize: '0.875rem', // text-sm
      marginTop: '-5px', // Adjust to be similar to -mt-2
      marginBottom: '10px',
  };

  const dirtyTextStyle: React.CSSProperties = {
      color: '#555555', // gray-500
      fontStyle: 'italic',
      fontSize: '0.75rem', // text-xs
      marginTop: '5px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}> {/* Simulates space-y-4 */}
      <textarea
        ref={textAreaRef}
        value={localChordSequence}
        onChange={handleTextChange}
        style={textAreaStyle}
        placeholder="Enter your chord sequence here, e.g., Verse: C(D D U D) G(D U D U) Am(D D U D) F(D U D U)"
      />
      {!isLocalSequenceValid && <p style={warningTextStyle}>Warning: The current sequence has an invalid format.</p>}
      <button 
        onClick={handleLoadSequenceForPlayback} 
        disabled={!isDirty || !isLocalSequenceValid}
        style={(!isDirty || !isLocalSequenceValid) ? disabledButtonStyle : baseButtonStyle}
      >
        Load Edited Sequence to App
      </button>
      {isDirty && <p style={dirtyTextStyle}>You have unsaved changes in the editor.</p>}
    </div>
  );
};

export default ManualSequenceEditor;
