import React from 'react';
import InstrumentSelector from './components/InstrumentSelector';
import { Preset } from './soundPresets'; // Corrected path

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
  bassLevel: number;
  setBassLevel: React.Dispatch<React.SetStateAction<number>>;
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
  selectedInstrument: string;
  onInstrumentChange: (instrument: string) => void;
  // EQ settings
  lowGain: number;
  setLowGain: React.Dispatch<React.SetStateAction<number>>;
  midGain: number;
  setMidGain: React.Dispatch<React.SetStateAction<number>>;
  highGain: number;
  setHighGain: React.Dispatch<React.SetStateAction<number>>;
  // Chorus settings
  chorusRate: number;
  setChorusRate: React.Dispatch<React.SetStateAction<number>>;
  chorusDepth: number;
  setChorusDepth: React.Dispatch<React.SetStateAction<number>>;
  chorusWet: number;
  setChorusWet: React.Dispatch<React.SetStateAction<number>>;
  // Filter settings
  filterCutoff: number;
  setFilterCutoff: React.Dispatch<React.SetStateAction<number>>;
  filterResonance: number;
  setFilterResonance: React.Dispatch<React.SetStateAction<number>>;
  filterType: BiquadFilterType;
  setFilterType: React.Dispatch<React.SetStateAction<BiquadFilterType>>;
  // Stereo Widener settings
  stereoWidth: number;
  setStereoWidth: React.Dispatch<React.SetStateAction<number>>;
  // Presets
  presets: Preset[]; // Array of preset objects
  selectedPresetName: string;
  onPresetChange: (presetName: string) => void; // Callback to apply preset
}

const SoundControls: React.FC<SoundControlsProps> = ({
  playStyle,
  setPlayStyle,
  bassLevel,
  setBassLevel,
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
  selectedInstrument,
  onInstrumentChange,
  // EQ
  lowGain, setLowGain,
  midGain, setMidGain,
  highGain, setHighGain,
  // Chorus
  chorusRate, setChorusRate,
  chorusDepth, setChorusDepth,
  chorusWet, setChorusWet,
  // Filter
  filterCutoff, setFilterCutoff,
  filterResonance, setFilterResonance,
  filterType, setFilterType,
  // Stereo Widener
  stereoWidth, setStereoWidth,
  // Presets
  presets,
  selectedPresetName,
  onPresetChange,
}) => {
  const [activeTab, setActiveTab] = React.useState('Main');

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

  const tabContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid #d1d5db', // border-gray-300
  };

  const tabButtonStyle: (isActive: boolean) => React.CSSProperties = (isActive) => ({
    padding: '8px 16px',
    margin: '0 4px',
    border: 'none',
    borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent', // blue-500
    backgroundColor: isActive ? '#eff6ff' : 'transparent', // blue-50
    color: isActive ? '#3b82f6' : '#374151', // blue-500 vs gray-700
    cursor: 'pointer',
    fontWeight: isActive ? '600' : '500',
    transition: 'all 0.2s ease-in-out',
  });


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

  // Dynamic label for chordPlaySpeed
  const speedLabel = chordPlaySpeed < 120 ? "Faster" : chordPlaySpeed > 250 ? "Slower" : "Normal";
  const filterTypeOptions: BiquadFilterType[] = ["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "notch", "allpass"];

  const tabs = [
    { name: 'Main', label: 'Main Settings' },
    { name: 'Playback', label: 'Playback' },
    { name: 'ToneVolume', label: 'Tone & Volume' },
    { name: 'Envelope', label: 'Envelope' },
    { name: 'Effects', label: 'Effects (Tone.js)' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Main':
        return (
          <>
            <div style={controlGroupStyle}>
              <label htmlFor="preset-selector" style={labelStyle}>Sound Preset:</label>
              <select
                id="preset-selector"
                value={selectedPresetName}
                onChange={(e) => onPresetChange(e.target.value)}
                style={selectStyle}
              >
                <option value="">
                  {selectedPresetName === "" ? "Select a Preset..." : "-- Custom Settings --"}
                </option>
                {presets.map((preset) => (
                  <option key={preset.name} value={preset.name}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>
            <InstrumentSelector
              selectedInstrument={selectedInstrument}
              onInstrumentChange={onInstrumentChange}
            />
          </>
        );
      case 'Playback':
        return (
          <>
            <div style={controlGroupStyle}>
              <label htmlFor="playStyle" style={labelStyle}>Play Style</label>
              <select id="playStyle" value={playStyle} onChange={(e) => setPlayStyle(e.target.value as 'strum' | 'arpeggio')} style={selectStyle}>
                <option value="strum">Strum</option>
                <option value="arpeggio">Arpeggio</option>
              </select>
            </div>
            <div style={controlGroupStyle}>
              <label htmlFor="chordPlaySpeed" style={labelStyle}>Chord Play Speed <span style={valueDisplayStyle}>({Math.round(chordPlaySpeed)} ms - {speedLabel})</span></label>
              <input id="chordPlaySpeed" type="range" min="0" max="100" value={100 - logPosition(chordPlaySpeed, 10, 1000)} onChange={(e) => setChordPlaySpeed(logScale(100 - Number(e.target.value), 10, 1000))} style={rangeInputStyle} />
            </div>
            <div style={controlGroupStyle}>
              <label htmlFor="upstrokeSpeedFactor" style={labelStyle}>Upstroke Speed Factor <span style={valueDisplayStyle}>({upstrokeSpeedFactor.toFixed(1)}x)</span></label>
              <input id="upstrokeSpeedFactor" type="range" min="1" max="4" step="0.1" value={upstrokeSpeedFactor} onChange={(e) => setUpstrokeSpeedFactor(Number(e.target.value))} style={rangeInputStyle} />
            </div>
            <div style={controlGroupStyle}>
              <label htmlFor="arpeggioBaseDuration" style={labelStyle}>Arpeggio Note Spacing <span style={valueDisplayStyle}>({arpeggioBaseDuration} ms)</span></label>
              <input id="arpeggioBaseDuration" type="range" min="100" max="600" step="10" value={arpeggioBaseDuration} onChange={(e) => setArpeggioBaseDuration(Number(e.target.value))} style={rangeInputStyle} />
            </div>
            <div style={controlGroupStyle}>
              <label htmlFor="duration" style={labelStyle}>Note Duration <span style={valueDisplayStyle}>({duration} ms)</span></label>
              <input id="duration" type="range" min="50" max="2000" value={duration} onChange={(e) => setDuration(Number(e.target.value))} style={rangeInputStyle} />
            </div>
          </>
        );
      case 'ToneVolume':
        return (
          <>
            <div style={controlGroupStyle}>
              <label htmlFor="volume" style={labelStyle}>Volume <span style={valueDisplayStyle}>({Math.round(volume * 100)}%)</span></label>
              <input id="volume" type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(Number(e.target.value))} style={rangeInputStyle} />
            </div>
            <div style={controlGroupStyle}>
              <label htmlFor="bassLevel" style={labelStyle}>Bass Level <span style={valueDisplayStyle}>({bassLevel.toFixed(1)})</span></label>
              <input id="bassLevel" type="range" min="0.1" max="1" step="0.1" value={bassLevel} onChange={(e) => setBassLevel(Number(e.target.value))} style={rangeInputStyle} />
            </div>
          </>
        );
      case 'Envelope':
        return (
          <>
            <div style={controlGroupStyle}>
              <label htmlFor="attackTime" style={labelStyle}>Attack Time <span style={valueDisplayStyle}>({attackTime.toFixed(3)} s)</span></label>
              <input id="attackTime" type="range" min="0" max="100" value={logPosition(attackTime, 0.001, 2)} onChange={(e) => setAttackTime(logScale(Number(e.target.value), 0.001, 2))} style={rangeInputStyle} />
            </div>
            <div style={controlGroupStyle}>
              <label htmlFor="decayTime" style={labelStyle}>Decay Time <span style={valueDisplayStyle}>({decayTime.toFixed(3)} s)</span></label>
              <input id="decayTime" type="range" min="0" max="100" value={logPosition(decayTime, 0.001, 2)} onChange={(e) => setDecayTime(logScale(Number(e.target.value), 0.001, 2))} style={rangeInputStyle} />
            </div>
            <div style={controlGroupStyle}>
              <label htmlFor="sustainLevel" style={labelStyle}>Sustain Level <span style={valueDisplayStyle}>({Math.round(sustainLevel * 100)}%)</span></label>
              <input id="sustainLevel" type="range" min="0" max="1" step="0.01" value={sustainLevel} onChange={(e) => setSustainLevel(Number(e.target.value))} style={rangeInputStyle} />
            </div>
            <div style={controlGroupStyle}>
              <label htmlFor="releaseTime" style={labelStyle}>Release Time <span style={valueDisplayStyle}>({releaseTime.toFixed(3)} s)</span></label>
              <input id="releaseTime" type="range" min="0" max="100" value={logPosition(releaseTime, 0.001, 5)} onChange={(e) => setReleaseTime(logScale(Number(e.target.value), 0.001, 5))} style={rangeInputStyle} />
            </div>
          </>
        );
      case 'Effects':
        if (selectedInstrument !== 'sampler') {
          return (
            <>
              {/* EQ3 Controls */}
              <div style={controlGroupStyle}>
                <h4 style={{...subHeadingStyle, marginTop: 0, marginBottom: '12px'}}>EQ</h4>
                <label htmlFor="lowGain" style={labelStyle}>Low Gain: <span style={valueDisplayStyle}>{lowGain.toFixed(1)} dB</span></label>
                <input type="range" id="lowGain" min="-12" max="12" step="0.5" value={lowGain} onChange={(e) => setLowGain(parseFloat(e.target.value))} style={rangeInputStyle} />
                <label htmlFor="midGain" style={labelStyle}>Mid Gain: <span style={valueDisplayStyle}>{midGain.toFixed(1)} dB</span></label>
                <input type="range" id="midGain" min="-12" max="12" step="0.5" value={midGain} onChange={(e) => setMidGain(parseFloat(e.target.value))} style={rangeInputStyle} />
                <label htmlFor="highGain" style={labelStyle}>High Gain: <span style={valueDisplayStyle}>{highGain.toFixed(1)} dB</span></label>
                <input type="range" id="highGain" min="-12" max="12" step="0.5" value={highGain} onChange={(e) => setHighGain(parseFloat(e.target.value))} style={rangeInputStyle} />
              </div>
              {/* Chorus Controls */}
              <div style={controlGroupStyle}>
                <h4 style={{...subHeadingStyle, marginTop: 0, marginBottom: '12px'}}>Chorus</h4>
                <label htmlFor="chorusRate" style={labelStyle}>Rate: <span style={valueDisplayStyle}>{chorusRate.toFixed(1)} Hz</span></label>
                <input type="range" id="chorusRate" min="0.1" max="10" step="0.1" value={chorusRate} onChange={(e) => setChorusRate(parseFloat(e.target.value))} style={rangeInputStyle} />
                <label htmlFor="chorusDepth" style={labelStyle}>Depth: <span style={valueDisplayStyle}>{(chorusDepth * 100).toFixed(0)}%</span></label>
                <input type="range" id="chorusDepth" min="0" max="1" step="0.05" value={chorusDepth} onChange={(e) => setChorusDepth(parseFloat(e.target.value))} style={rangeInputStyle} />
                <label htmlFor="chorusWet" style={labelStyle}>Wet: <span style={valueDisplayStyle}>{(chorusWet * 100).toFixed(0)}%</span></label>
                <input type="range" id="chorusWet" min="0" max="1" step="0.05" value={chorusWet} onChange={(e) => setChorusWet(parseFloat(e.target.value))} style={rangeInputStyle} />
              </div>
              {/* Filter Controls */}
              <div style={controlGroupStyle}>
                <h4 style={{...subHeadingStyle, marginTop: 0, marginBottom: '12px'}}>Filter</h4>
                <label htmlFor="filterType" style={labelStyle}>Type:</label>
                <select id="filterType" value={filterType} onChange={(e) => setFilterType(e.target.value as BiquadFilterType)} style={selectStyle}>
                  {filterTypeOptions.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
                <label htmlFor="filterCutoff" style={labelStyle}>Cutoff: <span style={valueDisplayStyle}>{filterCutoff.toFixed(0)} Hz</span></label>
                <input type="range" id="filterCutoff" min="0" max="100" value={logPosition(filterCutoff, 20, 20000)} onChange={(e) => {
                  const sliderPosition = Number(e.target.value);
                  let newValue = logScale(sliderPosition, 20, 20000);
                  let clampedValue = Math.max(20, Math.min(20000, newValue));
                  if (!isFinite(clampedValue)) { // Add a check for finite values
                    clampedValue = 15000; // Default if calculation is not finite
                  }
                  setFilterCutoff(clampedValue);
                }} style={rangeInputStyle} />
                <label htmlFor="filterResonance" style={labelStyle}>Resonance (Q): <span style={valueDisplayStyle}>{filterResonance.toFixed(1)}</span></label>
                <input type="range" id="filterResonance" min="0.1" max="20" step="0.1" value={filterResonance} onChange={(e) => setFilterResonance(parseFloat(e.target.value))} style={rangeInputStyle} />
              </div>
              {/* Stereo Widener Controls */}
              <div style={controlGroupStyle}>
                 <h4 style={{...subHeadingStyle, marginTop: 0, marginBottom: '12px'}}>Stereo Widener</h4>
                <label htmlFor="stereoWidth" style={labelStyle}>Width: <span style={valueDisplayStyle}>{(stereoWidth * 100).toFixed(0)}%</span></label>
                <input type="range" id="stereoWidth" min="0" max="1" step="0.05" value={stereoWidth} onChange={(e) => setStereoWidth(parseFloat(e.target.value))} style={rangeInputStyle} />
              </div>
               {/* Reverb Controls */}
              <div style={controlGroupStyle}>
                <h4 style={{...subHeadingStyle, marginTop: 0, marginBottom: '12px'}}>Reverb</h4>
                <label htmlFor="reverbSendLevel" style={labelStyle}>Send: <span style={valueDisplayStyle}>({Math.round(reverbSendLevel * 100)}%)</span></label>
                <input id="reverbSendLevel" type="range" min="0" max="1" step="0.01" value={reverbSendLevel} onChange={(e) => setReverbSendLevel(parseFloat(e.target.value))} style={rangeInputStyle} />
                <label htmlFor="reverbOutputLevel" style={labelStyle}>Output: <span style={valueDisplayStyle}>({Math.round(reverbOutputLevel * 100)}%)</span></label>
                <input id="reverbOutputLevel" type="range" min="0" max="1" step="0.01" value={reverbOutputLevel} onChange={(e) => setReverbOutputLevel(parseFloat(e.target.value))} style={rangeInputStyle} />
              </div>
            </>
          );
        } else {
          return <p style={{ textAlign: 'center', color: '#4b5563' }}>Effects are only available for Tone.js instruments.</p>;
        }
      default:
        return null;
    }
  };

  return (
    <div style={containerStyle}>
      <h3 style={headingStyle}>Sound Customization</h3>
      <div style={tabContainerStyle}>
        {tabs.map((tab) => (
          <button
            key={tab.name}
            style={tabButtonStyle(activeTab === tab.name)}
            onClick={() => setActiveTab(tab.name)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default SoundControls;