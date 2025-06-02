import React from 'react';
import { StepBackwardIcon, StepForwardIcon, SkipToStartIcon, SkipToEndIcon } from './IconComponents';

interface AdvancedPlaybackControlsProps {
  onStepBackward: () => void;
  onStepForward: () => void;
  onSkipToStart: () => void;
  onSkipToEnd: () => void;
  isPlaying: boolean;
}

// Define a basic style for the buttons, similar to iconButtonStyle in GuitarChordApp
const controlButtonStyle: React.CSSProperties = {
  backgroundColor: 'transparent',
  border: '1px solid #ccc', // Add a border to make them look more like typical buttons in a modal
  cursor: 'pointer',
  padding: '10px 15px', // Make them a bit larger
  margin: '5px',
  borderRadius: '4px', // Standard border radius
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '160px', // Ensure buttons have a decent width for text + icon
};

const iconStyle: React.CSSProperties = {
    marginRight: '8px', // Space between icon and text
};

const AdvancedPlaybackControls: React.FC<AdvancedPlaybackControlsProps> = ({
  onStepBackward,
  onStepForward,
  onSkipToStart,
  onSkipToEnd,
  isPlaying,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '10px', padding: '10px' }}>
      <button onClick={onSkipToStart} disabled={isPlaying} style={controlButtonStyle}>
        <SkipToStartIcon style={iconStyle} /> Skip to Start
      </button>
      <button onClick={onStepBackward} disabled={isPlaying} style={controlButtonStyle}>
        <StepBackwardIcon style={iconStyle} /> Step Backward
      </button>
      <button onClick={onStepForward} disabled={isPlaying} style={controlButtonStyle}>
        <StepForwardIcon style={iconStyle} /> Step Forward
      </button>
      <button onClick={onSkipToEnd} disabled={isPlaying} style={controlButtonStyle}>
        <SkipToEndIcon style={iconStyle} /> Skip to End
      </button>
    </div>
  );
};

export default AdvancedPlaybackControls;
