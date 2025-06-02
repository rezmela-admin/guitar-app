import React from 'react';

// Utility functions for logarithmic scaling
const logScale = (position: number, min: number, max: number) => {
  const minv = Math.log(min);
  const maxv = Math.log(max);
  const scale = (maxv - minv) / 100;
  return Math.exp(minv + scale * position);
};

const logPosition = (value: number, min: number, max: number) => {
  const minv = Math.log(min);
  const maxv = Math.log(max);
  const scale = (maxv - minv) / 100;
  return (Math.log(value) - minv) / scale;
};

interface SoundControlsProps {
  playStyle: 'strum' | 'arpeggio';
  setPlayStyle: React.Dispatch<React.SetStateAction<'strum' | 'arpeggio'>>;
  bassDampening: number;
  setBassDampening: React.Dispatch<React.SetStateAction<number>>;
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  attackTime: number;
  setAttackTime: React.Dispatch<React.SetStateAction<number>>;
  decayTime: number;
  setDecayTime: React.Dispatch<React.SetStateAction<number>>;
  sustainLevel: number;
  setSustainLevel: React.Dispatch<React.SetStateAction<number>>;
  releaseTime: number;
  setReleaseTime: React.Dispatch<React.SetStateAction<number>>;
  chordPlaySpeed: number;
  setChordPlaySpeed: React.Dispatch<React.SetStateAction<number>>;
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  reverbSendLevel: number;
  setReverbSendLevel: React.Dispatch<React.SetStateAction<number>>;
  reverbOutputLevel: number;
  setReverbOutputLevel: React.Dispatch<React.SetStateAction<number>>;
}

const SoundControls: React.FC<SoundControlsProps> = ({
  playStyle,
  setPlayStyle,
  bassDampening,
  setBassDampening,
  volume,
  setVolume,
  attackTime,
  setAttackTime,
  decayTime,
  setDecayTime,
  sustainLevel,
  setSustainLevel,
  releaseTime,
  setReleaseTime,
  chordPlaySpeed,
  setChordPlaySpeed,
  duration,
  setDuration,
  reverbSendLevel,
  setReverbSendLevel,
  reverbOutputLevel,
  setReverbOutputLevel,
}) => {
  return (
    <div className="sound-controls">
      <h3>Sound Controls</h3>
      <div className="control-group">
        <label>
          Play Style:
          <select 
            value={playStyle} 
            onChange={(e) => setPlayStyle(e.target.value as 'strum' | 'arpeggio')}
          >
            <option value="strum">Strum</option>
            <option value="arpeggio">Arpeggio</option>
          </select>
        </label>
      </div>

      <div className="control-group">
        <label>
          Chord Play Speed:
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={logPosition(chordPlaySpeed, 10, 1000)}
            onChange={(e) => setChordPlaySpeed(logScale(Number(e.target.value), 10, 1000))} 
          />
          {Math.round(chordPlaySpeed)} ms ({chordPlaySpeed === 100 ? "Normal" : chordPlaySpeed < 100 ? "Faster" : "Slower"})
        </label>
      </div>

      <div className="control-group">
        <label>
          Bass Dampening:
          <input 
            type="range" 
            min="0.1" 
            max="1" 
            step="0.1" 
            value={bassDampening} 
            onChange={(e) => setBassDampening(Number(e.target.value))} 
          />
          {bassDampening.toFixed(1)}
        </label>
      </div>

      <div className="control-group">
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
          {Math.round(volume * 100)}%
        </label>
      </div>

      <h4>Envelope Controls</h4>
      <div className="control-group">
        <label>
          Attack Time:
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={logPosition(attackTime, 0.001, 2)}
            onChange={(e) => setAttackTime(logScale(Number(e.target.value), 0.001, 2))} 
          />
          {attackTime.toFixed(3)} s
        </label>
      </div>
      <div className="control-group">
        <label>
          Decay Time:
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={logPosition(decayTime, 0.001, 2)}
            onChange={(e) => setDecayTime(logScale(Number(e.target.value), 0.001, 2))} 
          />
          {decayTime.toFixed(3)} s
        </label>
      </div>
      <div className="control-group">
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
          {Math.round(sustainLevel * 100)}%
        </label>
      </div>
      <div className="control-group">
        <label>
          Release Time:
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={logPosition(releaseTime, 0.001, 5)}
            onChange={(e) => setReleaseTime(logScale(Number(e.target.value), 0.001, 5))} 
          />
          {releaseTime.toFixed(3)} s
        </label>
      </div>

      <div className="control-group">
        <label>
          Duration:
          <input 
            type="range" 
            min="50" 
            max="2000" 
            value={duration} 
            onChange={(e) => setDuration(Number(e.target.value))} 
          />
          {duration} ms
        </label>
      </div>

      <h4>Reverb Controls</h4>
      <div className="control-group">
        <label>
          Reverb Send:
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={reverbSendLevel}
            onChange={(e) => setReverbSendLevel(parseFloat(e.target.value))}
          />
          {Math.round(reverbSendLevel * 100)}%
        </label>
      </div>
      <div className="control-group">
        <label>
          Reverb Output:
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={reverbOutputLevel}
            onChange={(e) => setReverbOutputLevel(parseFloat(e.target.value))}
          />
          {Math.round(reverbOutputLevel * 100)}%
        </label>
      </div>
    </div>
  );
};

export default SoundControls;