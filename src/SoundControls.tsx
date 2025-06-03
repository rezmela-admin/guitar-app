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
  upstrokeSpeedFactor: number;
  setUpstrokeSpeedFactor: React.Dispatch<React.SetStateAction<number>>;
  arpeggioBaseDuration: number;
  setArpeggioBaseDuration: React.Dispatch<React.SetStateAction<number>>;
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
  upstrokeSpeedFactor,
  setUpstrokeSpeedFactor,
  arpeggioBaseDuration,
  setArpeggioBaseDuration,
}) => {
  // Basic inline styles to replace Tailwind classes
  const containerStyle: React.CSSProperties = {
    padding: '8px', // Simulates p-2
    display: 'flex',
    flexDirection: 'column',
    gap: '24px', // Simulates space-y-6
  };

  const headingStyle: React.CSSProperties = {
    fontSize: '1.125rem', // text-lg
    fontWeight: '600', // font-semibold
    color: '#1f2937', // gray-800
    marginBottom: '12px',
    textAlign: 'center',
  };

  const subHeadingStyle: React.CSSProperties = {
    fontSize: '1rem', // text-md
    fontWeight: '600', // font-semibold
    color: '#374151', // gray-700
    marginTop: '16px',
    marginBottom: '8px',
    textAlign: 'center',
  };

  const controlGroupStyle: React.CSSProperties = {
    marginBottom: '16px', // mb-4
    padding: '12px', // p-3
    border: '1px solid #e5e7eb', // border-gray-200
    borderRadius: '0.5rem', // rounded-lg
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // shadow-sm
    backgroundColor: '#f9fafb', // bg-gray-50
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.875rem', // text-sm
    fontWeight: '500', // font-medium
    color: '#374151', // text-gray-700
    marginBottom: '4px',
  };

  const valueDisplayStyle: React.CSSProperties = {
    fontSize: '0.75rem', // text-xs
    color: '#4b5563', // text-gray-600
    marginLeft: '8px',
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    border: '1px solid #d1d5db', // border-gray-300
    borderRadius: '0.375rem', // rounded-md
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // shadow-sm
    fontSize: '0.875rem', // text-sm
    backgroundColor: 'white',
  };

  const rangeInputStyle: React.CSSProperties = { // Minimal styling for range inputs
    width: '100%',
    cursor: 'pointer',
  };


  return (
    <div style={containerStyle}>
      <h3 style={headingStyle}>Sound Customization</h3>

      <div style={controlGroupStyle}>
        <label htmlFor="playStyle" style={labelStyle}>
          Play Style
        </label>
        <select
          id="playStyle"
          value={playStyle}
          onChange={(e) => setPlayStyle(e.target.value as 'strum' | 'arpeggio')}
          style={selectStyle}
        >
          <option value="strum">Strum</option>
          <option value="arpeggio">Arpeggio</option>
        </select>
      </div>

      <div style={controlGroupStyle}>
        <label htmlFor="chordPlaySpeed" style={labelStyle}>
          Chord Play Speed
          <span style={valueDisplayStyle}>
            ({Math.round(chordPlaySpeed)} ms - {chordPlaySpeed === 100 ? "Normal" : chordPlaySpeed < 100 ? "Faster" : "Slower"})
          </span>
        </label>
        <input
          id="chordPlaySpeed"
          type="range"
          min="0"
          max="100"
          value={logPosition(chordPlaySpeed, 10, 1000)}
          onChange={(e) => setChordPlaySpeed(logScale(Number(e.target.value), 10, 1000))}
          style={rangeInputStyle}
        />
      </div>

      <div style={controlGroupStyle}>
        <label htmlFor="upstrokeSpeedFactor" style={labelStyle}>
          Upstroke Speed Factor
          <span style={valueDisplayStyle}>({upstrokeSpeedFactor.toFixed(1)}x)</span>
        </label>
        <input
          id="upstrokeSpeedFactor"
          type="range"
          min="1"
          max="4"
          step="0.1"
          value={upstrokeSpeedFactor}
          onChange={(e) => setUpstrokeSpeedFactor(Number(e.target.value))}
          style={rangeInputStyle}
        />
      </div>

      <div style={controlGroupStyle}>
        <label htmlFor="arpeggioBaseDuration" style={labelStyle}>
          Arpeggio Note Spacing
          <span style={valueDisplayStyle}>({arpeggioBaseDuration} ms)</span>
        </label>
        <input
          id="arpeggioBaseDuration"
          type="range"
          min="100"
          max="600"
          step="10"
          value={arpeggioBaseDuration}
          onChange={(e) => setArpeggioBaseDuration(Number(e.target.value))}
          style={rangeInputStyle}
        />
      </div>

      <div style={controlGroupStyle}>
        <label htmlFor="bassDampening" style={labelStyle}>
          Bass Dampening
          <span style={valueDisplayStyle}>({bassDampening.toFixed(1)})</span>
        </label>
        <input
          id="bassDampening"
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={bassDampening}
          onChange={(e) => setBassDampening(Number(e.target.value))}
          style={rangeInputStyle}
        />
      </div>

      <div style={controlGroupStyle}>
        <label htmlFor="volume" style={labelStyle}>
          Volume <span style={valueDisplayStyle}>({Math.round(volume * 100)}%)</span>
        </label>
        <input
          id="volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          style={rangeInputStyle}
        />
      </div>

      <h4 style={subHeadingStyle}>Envelope Controls</h4>
      <div style={controlGroupStyle}>
        <label htmlFor="attackTime" style={labelStyle}>
          Attack Time <span style={valueDisplayStyle}>({attackTime.toFixed(3)} s)</span>
        </label>
        <input
          id="attackTime"
          type="range"
          min="0"
          max="100"
          value={logPosition(attackTime, 0.001, 2)}
          onChange={(e) => setAttackTime(logScale(Number(e.target.value), 0.001, 2))}
          style={rangeInputStyle}
        />
      </div>
      <div style={controlGroupStyle}>
        <label htmlFor="decayTime" style={labelStyle}>
          Decay Time <span style={valueDisplayStyle}>({decayTime.toFixed(3)} s)</span>
        </label>
        <input
          id="decayTime"
          type="range"
          min="0"
          max="100"
          value={logPosition(decayTime, 0.001, 2)}
          onChange={(e) => setDecayTime(logScale(Number(e.target.value), 0.001, 2))}
          style={rangeInputStyle}
        />
      </div>
      <div style={controlGroupStyle}>
        <label htmlFor="sustainLevel" style={labelStyle}>
          Sustain Level <span style={valueDisplayStyle}>({Math.round(sustainLevel * 100)}%)</span>
        </label>
        <input
          id="sustainLevel"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={sustainLevel}
          onChange={(e) => setSustainLevel(Number(e.target.value))}
          style={rangeInputStyle}
        />
      </div>
      <div style={controlGroupStyle}>
        <label htmlFor="releaseTime" style={labelStyle}>
          Release Time <span style={valueDisplayStyle}>({releaseTime.toFixed(3)} s)</span>
        </label>
        <input
          id="releaseTime"
          type="range"
          min="0"
          max="100"
          value={logPosition(releaseTime, 0.001, 5)}
          onChange={(e) => setReleaseTime(logScale(Number(e.target.value), 0.001, 5))}
          style={rangeInputStyle}
        />
      </div>

      <div style={controlGroupStyle}>
        <label htmlFor="duration" style={labelStyle}>
          Note Duration <span style={valueDisplayStyle}>({duration} ms)</span>
        </label>
        <input
          id="duration"
          type="range"
          min="50"
          max="2000"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          style={rangeInputStyle}
        />
      </div>

      <h4 style={subHeadingStyle}>Reverb Controls</h4>
      <div style={controlGroupStyle}>
        <label htmlFor="reverbSendLevel" style={labelStyle}>
          Reverb Send <span style={valueDisplayStyle}>({Math.round(reverbSendLevel * 100)}%)</span>
        </label>
        <input
          id="reverbSendLevel"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={reverbSendLevel}
          onChange={(e) => setReverbSendLevel(parseFloat(e.target.value))}
          style={rangeInputStyle}
        />
      </div>
      <div style={controlGroupStyle}>
        <label htmlFor="reverbOutputLevel" style={labelStyle}>
          Reverb Output <span style={valueDisplayStyle}>({Math.round(reverbOutputLevel * 100)}%)</span>
        </label>
        <input
          id="reverbOutputLevel"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={reverbOutputLevel}
          onChange={(e) => setReverbOutputLevel(parseFloat(e.target.value))}
          style={rangeInputStyle}
        />
      </div>
    </div>
  );
};

export default SoundControls;