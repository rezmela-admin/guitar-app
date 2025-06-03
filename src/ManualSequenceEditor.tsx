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
    <div className="space-y-4">
      <textarea
        ref={textAreaRef}
        value={localChordSequence}
        onChange={handleTextChange}
        className={`w-full min-h-[150px] p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 
                    ${!isLocalSequenceValid ? 'border-red-500 ring-red-500' : (isDirty ? 'border-orange-500' : 'border-gray-300')}`}
        placeholder="Enter your chord sequence here, e.g., Verse: C(D D U D) G(D U D U) Am(D D U D) F(D U D U)"
      />
      {!isLocalSequenceValid && <p className="text-sm text-red-600 -mt-2 mb-2">Warning: The current sequence has an invalid format.</p>}
      <button 
        onClick={handleLoadSequenceForPlayback} 
        disabled={!isDirty || !isLocalSequenceValid}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Load Edited Sequence to App
      </button>
      {isDirty && <p className="text-xs text-gray-500 italic mt-1">You have unsaved changes in the editor.</p>}
    </div>
  );
};

export default ManualSequenceEditor;
