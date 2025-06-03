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
  const inputBaseClasses = "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer";
  const controlGroupClasses = "mb-4 p-3 border border-gray-200 rounded-lg shadow-sm bg-gray-50";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";
  const valueDisplayClasses = "text-xs text-gray-600 ml-2";
  const selectInputClasses = "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white";

  return (
    <div className="space-y-6 p-2"> {/* Added padding and spacing for the whole container */}
      <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">Sound Customization</h3>
      
      <div className={controlGroupClasses}>
        <label htmlFor="playStyle" className={labelClasses}>
          Play Style
        </label>
        <select 
          id="playStyle"
          value={playStyle} 
          onChange={(e) => setPlayStyle(e.target.value as 'strum' | 'arpeggio')}
          className={selectInputClasses}
        >
          <option value="strum">Strum</option>
          <option value="arpeggio">Arpeggio</option>
        </select>
      </div>

      <div className={controlGroupClasses}>
        <label htmlFor="chordPlaySpeed" className={labelClasses}>
          Chord Play Speed 
          <span className={valueDisplayClasses}>
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
          className={inputBaseClasses}
        />
      </div>

      <div className={controlGroupClasses}>
        <label htmlFor="bassDampening" className={labelClasses}>
          Bass Dampening 
          <span className={valueDisplayClasses}>({bassDampening.toFixed(1)})</span>
        </label>
        <input 
          id="bassDampening"
          type="range" 
          min="0.1" 
          max="1" 
          step="0.1" 
          value={bassDampening} 
          onChange={(e) => setBassDampening(Number(e.target.value))} 
          className={inputBaseClasses}
        />
      </div>

      <div className={controlGroupClasses}>
        <label htmlFor="volume" className={labelClasses}>
          Volume <span className={valueDisplayClasses}>({Math.round(volume * 100)}%)</span>
        </label>
        <input 
          id="volume"
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={volume} 
          onChange={(e) => setVolume(Number(e.target.value))} 
          className={inputBaseClasses}
        />
      </div>

      <h4 className="text-md font-semibold text-gray-700 mt-4 mb-2 text-center">Envelope Controls</h4>
      <div className={controlGroupClasses}>
        <label htmlFor="attackTime" className={labelClasses}>
          Attack Time <span className={valueDisplayClasses}>({attackTime.toFixed(3)} s)</span>
        </label>
        <input 
          id="attackTime"
          type="range" 
          min="0" 
          max="100" 
          value={logPosition(attackTime, 0.001, 2)}
          onChange={(e) => setAttackTime(logScale(Number(e.target.value), 0.001, 2))} 
          className={inputBaseClasses}
        />
      </div>
      <div className={controlGroupClasses}>
        <label htmlFor="decayTime" className={labelClasses}>
          Decay Time <span className={valueDisplayClasses}>({decayTime.toFixed(3)} s)</span>
        </label>
        <input 
          id="decayTime"
          type="range" 
          min="0" 
          max="100" 
          value={logPosition(decayTime, 0.001, 2)}
          onChange={(e) => setDecayTime(logScale(Number(e.target.value), 0.001, 2))} 
          className={inputBaseClasses}
        />
      </div>
      <div className={controlGroupClasses}>
        <label htmlFor="sustainLevel" className={labelClasses}>
          Sustain Level <span className={valueDisplayClasses}>({Math.round(sustainLevel * 100)}%)</span>
        </label>
        <input 
          id="sustainLevel"
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={sustainLevel} 
          onChange={(e) => setSustainLevel(Number(e.target.value))} 
          className={inputBaseClasses}
        />
      </div>
      <div className={controlGroupClasses}>
        <label htmlFor="releaseTime" className={labelClasses}>
          Release Time <span className={valueDisplayClasses}>({releaseTime.toFixed(3)} s)</span>
        </label>
        <input 
          id="releaseTime"
          type="range" 
          min="0" 
          max="100" 
          value={logPosition(releaseTime, 0.001, 5)}
          onChange={(e) => setReleaseTime(logScale(Number(e.target.value), 0.001, 5))} 
          className={inputBaseClasses}
        />
      </div>

      <div className={controlGroupClasses}>
        <label htmlFor="duration" className={labelClasses}>
          Note Duration <span className={valueDisplayClasses}>({duration} ms)</span>
        </label>
        <input 
          id="duration"
          type="range" 
          min="50" 
          max="2000" 
          value={duration} 
          onChange={(e) => setDuration(Number(e.target.value))} 
          className={inputBaseClasses}
        />
      </div>

      <h4 className="text-md font-semibold text-gray-700 mt-4 mb-2 text-center">Reverb Controls</h4>
      <div className={controlGroupClasses}>
        <label htmlFor="reverbSendLevel" className={labelClasses}>
          Reverb Send <span className={valueDisplayClasses}>({Math.round(reverbSendLevel * 100)}%)</span>
        </label>
        <input 
          id="reverbSendLevel"
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={reverbSendLevel} 
          onChange={(e) => setReverbSendLevel(parseFloat(e.target.value))} 
          className={inputBaseClasses}
        />
      </div>
      <div className={controlGroupClasses}>
        <label htmlFor="reverbOutputLevel" className={labelClasses}>
          Reverb Output <span className={valueDisplayClasses}>({Math.round(reverbOutputLevel * 100)}%)</span>
        </label>
        <input 
          id="reverbOutputLevel"
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={reverbOutputLevel} 
          onChange={(e) => setReverbOutputLevel(parseFloat(e.target.value))} 
          className={inputBaseClasses}
        />
      </div>
    </div>
  );
};

export default SoundControls;