import React from 'react';

interface InstrumentSelectorProps {
  selectedInstrument: string;
  onInstrumentChange: (instrument: string) => void;
}

const availableInstruments = [
  'sampler', // Added Sampler option
  'Synth',
  'FMSynth',
  'AMSynth',
  'MembraneSynth',
  'MetalSynth',
  'NoiseSynth',
  'PluckSynth',
];

const InstrumentSelector: React.FC<InstrumentSelectorProps> = ({
  selectedInstrument,
  onInstrumentChange,
}) => {
  return (
    <div style={{ marginBottom: '10px', marginTop: '10px' }}>
      <label htmlFor="instrument-select" style={{ marginRight: '10px' }}>Select Instrument: </label>
      <select
        id="instrument-select"
        value={selectedInstrument}
        onChange={(e) => onInstrumentChange(e.target.value)}
        style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
      >
        {availableInstruments.map((instrument) => (
          <option key={instrument} value={instrument}>
            {instrument.charAt(0).toUpperCase() + instrument.slice(1)} {/* Capitalize first letter for display */}
          </option>
        ))}
      </select>
    </div>
  );
};

export default InstrumentSelector;
