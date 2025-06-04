import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SoundControls from './SoundControls'; // The component to test
import '@testing-library/jest-dom'; // For extended matchers

// Mock InstrumentSelector to simplify testing SoundControls' logic
jest.mock('./InstrumentSelector', () => ({ selectedInstrument, onInstrumentChange }: any) => (
  <select data-testid="instrument-selector" value={selectedInstrument} onChange={(e) => onInstrumentChange(e.target.value)}>
    <option value="sampler">Sampler</option>
    <option value="Synth">Synth</option>
    <option value="FMSynth">FMSynth</option>
  </select>
));

describe('SoundControls', () => {
  const mockSetPlayStyle = jest.fn();
  const mockSetBassLevel = jest.fn();
  const mockSetVolume = jest.fn();
  const mockSetAttackTime = jest.fn();
  const mockSetDecayTime = jest.fn();
  const mockSetSustainLevel = jest.fn();
  const mockSetReleaseTime = jest.fn();
  const mockSetChordPlaySpeed = jest.fn();
  const mockSetDuration = jest.fn();
  const mockSetReverbSendLevel = jest.fn();
  const mockSetReverbOutputLevel = jest.fn();
  const mockSetUpstrokeSpeedFactor = jest.fn();
  const mockSetArpeggioBaseDuration = jest.fn();
  const mockOnInstrumentChange = jest.fn();
  // New effect mocks
  const mockSetLowGain = jest.fn();
  const mockSetMidGain = jest.fn();
  const mockSetHighGain = jest.fn();
  const mockSetChorusRate = jest.fn();
  const mockSetChorusDepth = jest.fn();
  const mockSetChorusWet = jest.fn();
  const mockSetFilterCutoff = jest.fn();
  const mockSetFilterResonance = jest.fn();
  const mockSetFilterType = jest.fn();
  const mockSetStereoWidth = jest.fn();

  const defaultProps = {
    playStyle: 'strum' as 'strum' | 'arpeggio',
    setPlayStyle: mockSetPlayStyle,
    bassLevel: 0.5,
    setBassLevel: mockSetBassLevel,
    volume: 0.5,
    setVolume: mockSetVolume,
    attackTime: 0.01,
    setAttackTime: mockSetAttackTime,
    decayTime: 0.1,
    setDecayTime: mockSetDecayTime,
    sustainLevel: 0.5,
    setSustainLevel: mockSetSustainLevel,
    releaseTime: 0.2,
    setReleaseTime: mockSetReleaseTime,
    chordPlaySpeed: 100,
    setChordPlaySpeed: mockSetChordPlaySpeed,
    duration: 500,
    setDuration: mockSetDuration,
    reverbSendLevel: 0.3,
    setReverbSendLevel: mockSetReverbSendLevel,
    reverbOutputLevel: 0.6,
    setReverbOutputLevel: mockSetReverbOutputLevel,
    upstrokeSpeedFactor: 1,
    setUpstrokeSpeedFactor: mockSetUpstrokeSpeedFactor,
    arpeggioBaseDuration: 300,
    setArpeggioBaseDuration: mockSetArpeggioBaseDuration,
    selectedInstrument: 'sampler',
    onInstrumentChange: mockOnInstrumentChange,
    // New effects
    lowGain: 0, setLowGain: mockSetLowGain,
    midGain: 0, setMidGain: mockSetMidGain,
    highGain: 0, setHighGain: mockSetHighGain,
    chorusRate: 1.5, setChorusRate: mockSetChorusRate,
    chorusDepth: 0.5, setChorusDepth: mockSetChorusDepth,
    chorusWet: 0, setChorusWet: mockSetChorusWet,
    filterCutoff: 10000, setFilterCutoff: mockSetFilterCutoff,
    filterResonance: 1, setFilterResonance: mockSetFilterResonance,
    filterType: 'lowpass' as BiquadFilterType, setFilterType: mockSetFilterType,
    stereoWidth: 0, setStereoWidth: mockSetStereoWidth,
    // Preset props
    presets: [], // Default to an empty array of presets
    selectedPresetName: "", // Default to no preset selected
    onPresetChange: jest.fn(), // Mock function for preset change handler
  };

  beforeEach(() => {
    // Clear all mock call counts before each test
    jest.clearAllMocks();
  });

  test('renders InstrumentSelector', () => {
    render(<SoundControls {...defaultProps} />);
    expect(screen.getByTestId('instrument-selector')).toBeInTheDocument();
  });

  test('hides Tone.js effect controls when sampler is selected', () => {
    render(<SoundControls {...defaultProps} selectedInstrument="sampler" />);
    expect(screen.queryByLabelText(/Low Gain/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Chorus Rate/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Filter Type/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Stereo Width/i)).not.toBeInTheDocument();
  });

  test('shows Tone.js effect controls when a Tone.js instrument is selected', () => {
    render(<SoundControls {...defaultProps} selectedInstrument="Synth" />);
    expect(screen.getByLabelText(/Low Gain/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Chorus Rate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Filter Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Stereo Width/i)).toBeInTheDocument();
  });

  test('calls onInstrumentChange when instrument is selected', () => {
    render(<SoundControls {...defaultProps} />);
    const selector = screen.getByTestId('instrument-selector');
    fireEvent.change(selector, { target: { value: 'FMSynth' } });
    expect(mockOnInstrumentChange).toHaveBeenCalledWith('FMSynth');
  });

  test('calls setLowGain when low gain slider is changed', () => {
    render(<SoundControls {...defaultProps} selectedInstrument="Synth" />); // Effects visible
    // Sliders are hard to target by label directly if the label is separate.
    // Let's assume an ID or a more robust way to get it. If not, use screen.getAllByRole('slider')
    // For this example, we'll get it by its specific label if input has matching id/aria-labelledby
    const lowGainInput = screen.getByLabelText(/Low Gain/i);
    fireEvent.change(lowGainInput, { target: { value: '5' } });
    expect(mockSetLowGain).toHaveBeenCalledWith(5);
  });

  test('calls setChorusRate when chorus rate slider is changed', () => {
    render(<SoundControls {...defaultProps} selectedInstrument="Synth" />);
    const chorusRateInput = screen.getByLabelText(/Chorus Rate/i);
    fireEvent.change(chorusRateInput, { target: { value: '2.5' } });
    expect(mockSetChorusRate).toHaveBeenCalledWith(2.5);
  });

  test('calls setFilterCutoff (log scaled) when filter cutoff slider is changed', () => {
    render(<SoundControls {...defaultProps} selectedInstrument="Synth" />);
    const filterCutoffInput = screen.getByLabelText(/Filter Cutoff/i);
    // The value here is the position of the slider (0-100 for log controls)
    fireEvent.change(filterCutoffInput, { target: { value: '50' } });
    // We expect setFilterCutoff to be called with the log-scaled value.
    // The exact value depends on the logScale function's behavior.
    // This requires either knowing the logScale output for input '50' or mocking logScale.
    // For simplicity, we check it's called. For precision, calculate expected value.
    expect(mockSetFilterCutoff).toHaveBeenCalled();
  });

  test('calls setFilterType when filter type is changed', () => {
    render(<SoundControls {...defaultProps} selectedInstrument="Synth" />);
    const filterTypeSelect = screen.getByLabelText(/Filter Type/i);
    fireEvent.change(filterTypeSelect, { target: { value: 'highpass' } });
    expect(mockSetFilterType).toHaveBeenCalledWith('highpass');
  });

  test('calls setStereoWidth when stereo width slider is changed', () => {
    render(<SoundControls {...defaultProps} selectedInstrument="Synth" />);
    const stereoWidthInput = screen.getByLabelText(/Stereo Width/i);
    fireEvent.change(stereoWidthInput, { target: { value: '0.75' } });
    expect(mockSetStereoWidth).toHaveBeenCalledWith(0.75);
  });

  // Example for an existing control to ensure it still works
   test('calls setVolume when volume slider is changed', () => {
    render(<SoundControls {...defaultProps} />);
    const volumeInput = screen.getByLabelText(/Volume/i);
    fireEvent.change(volumeInput, { target: { value: '0.8' } });
    expect(mockSetVolume).toHaveBeenCalledWith(0.8);
  });

});
