import React, { useState } from 'react';

type CustomSequenceProps = {
  chordSequence: string;
  setChordSequence: (sequence: string) => void;
};

const CustomSequence: React.FC<CustomSequenceProps> = ({ chordSequence, setChordSequence }) => {
  const [localChordSequence, setLocalChordSequence] = useState(chordSequence);

  const handleSubmit = () => {
    setChordSequence(localChordSequence);
  };

  const importChordSequence = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && typeof event.target.result === 'string') {
            setLocalChordSequence(event.target.result);
          } else {
            console.error('Failed to read file content');
          }
        };
        reader.onerror = (error) => {
          console.error('Error reading file:', error);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const exportChordSequence = () => {
    const element = document.createElement('a');
    const file = new Blob([localChordSequence], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'chord_sequence.txt';
    document.body.appendChild(element);
    element.click();
    
    setTimeout(() => {
      document.body.removeChild(element);
      URL.revokeObjectURL(element.href);
    }, 100);
  };

  return (
    <div style={{ 
      maxWidth: '550px', 
      margin: '0 auto', 
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '5px',
	  boxSizing: 'border-box'
    }}>
      <h3 style={{ marginBottom: '10px' }}>Custom Sequence</h3>
      <textarea
        value={localChordSequence}
        onChange={(e) => setLocalChordSequence(e.target.value)}
        placeholder="Enter chord sequence (e.g., F(4), C(2), G(4))"
        style={{
          width: '100%',
          height: '100px',
          padding: '8px',
          marginBottom: '10px',
          resize: 'vertical',
          fontFamily: 'monospace',
          fontSize: '14px',
          border: '1px solid #ccc',
          borderRadius: '3px',
		  boxSizing: 'border-box'
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button 
          onClick={importChordSequence}
          style={{
            padding: '5px 10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Import Sequence
        </button>
        <button 
          onClick={handleSubmit}
          style={{
            padding: '5px 10px',
            backgroundColor: '#008CBA',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Submit Sequence
        </button>
        <button 
          onClick={exportChordSequence}
          style={{
            padding: '5px 10px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Export Sequence
        </button>
      </div>
    </div>
  );
};

export default CustomSequence;