import React from 'react';

interface EnvelopeControlsProps {
  volume: number;
  setVolume: (value: number) => void;
  duration: number;
  setDuration: (value: number) => void;
  attackTime: number;
  setAttackTime: (value: number) => void;
  decayTime: number;
  setDecayTime: (value: number) => void;
  sustainLevel: number;
  setSustainLevel: (value: number) => void;
  releaseTime: number;
  setReleaseTime: (value: number) => void;
}

const EnvelopeControls: React.FC<EnvelopeControlsProps> = ({
  volume, setVolume,
  duration, setDuration,
  attackTime, setAttackTime,
  decayTime, setDecayTime,
  sustainLevel, setSustainLevel,
  releaseTime, setReleaseTime
}) => {
  return (
    <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h3>Sound Envelope Controls</h3>
      <div>
        <label>
          Volume:
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume} 
            onChange={(e) => setVolume(Number(e.target.value))} 
          />
          {volume.toFixed(2)}
        </label>
      </div>
      <div>
        <label>
          Duration (ms):
          <input 
            type="range" 
            min="100" 
            max="3000" 
            step="100" 
            value={duration} 
            onChange={(e) => setDuration(Number(e.target.value))} 
          />
          {duration}ms
        </label>
      </div>
      <div>
        <label>
          Attack Time (s):
          <input 
            type="range" 
            min="0.001" 
            max="0.5" 
            step="0.001" 
            value={attackTime} 
            onChange={(e) => setAttackTime(Number(e.target.value))} 
          />
          {attackTime.toFixed(3)}s
        </label>
      </div>
      <div>
        <label>
          Decay Time (s):
          <input 
            type="range" 
            min="0.001" 
            max="1" 
            step="0.001" 
            value={decayTime} 
            onChange={(e) => setDecayTime(Number(e.target.value))} 
          />
          {decayTime.toFixed(3)}s
        </label>
      </div>
      <div>
        <label>
          Sustain Level:
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={sustainLevel} 
            onChange={(e) => setSustainLevel(Number(e.target.value))} 
          />
          {sustainLevel.toFixed(2)}
        </label>
      </div>
      <div>
        <label>
          Release Time (s):
          <input 
            type="range" 
            min="0.001" 
            max="2" 
            step="0.001" 
            value={releaseTime} 
            onChange={(e) => setReleaseTime(Number(e.target.value))} 
          />
          {releaseTime.toFixed(3)}s
        </label>
      </div>
    </div>
  );
};

export default EnvelopeControls;