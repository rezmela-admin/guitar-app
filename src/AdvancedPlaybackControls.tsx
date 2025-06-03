import React from 'react';
import { StepBackwardIcon, StepForwardIcon, SkipToStartIcon, SkipToEndIcon } from './IconComponents';

interface AdvancedPlaybackControlsProps {
  onStepBackward: () => void;
  onStepForward: () => void;
  onSkipToStart: () => void;
  onSkipToEnd: () => void;
  isPlaying: boolean;
}

// Basic styles to replace Tailwind classes
const controlContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px', // Simulates space-y-3
  padding: '4px', // Simulates p-1
};

const baseButtonStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 16px', // Simulates px-4 py-2
  border: '1px solid #d1d5db', // Simulates border-gray-300
  borderRadius: '0.375rem', // Simulates rounded-md
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // Simulates shadow-sm
  fontSize: '0.875rem', // Simulates text-sm
  fontWeight: '500', // Simulates font-medium
  color: '#374151', // Simulates text-gray-700
  backgroundColor: '#ffffff', // Simulates bg-white
  cursor: 'pointer',
};

const disabledButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  opacity: 0.5,
  cursor: 'not-allowed',
};

const iconStyle: React.CSSProperties = {
  height: '20px', // Simulates h-5
  width: '20px', // Simulates w-5
  marginRight: '8px', // Simulates mr-2
  display: 'inline-flex', // For better alignment control
  alignItems: 'center', // Vertically align content if icon itself has weird internal alignment
};


const AdvancedPlaybackControls: React.FC<AdvancedPlaybackControlsProps> = ({
  onStepBackward,
  onStepForward,
  onSkipToStart,
  onSkipToEnd,
  isPlaying,
}) => {
  return (
    <div style={controlContainerStyle}>
      <button 
        onClick={onSkipToStart} 
        disabled={isPlaying} 
        style={isPlaying ? disabledButtonStyle : baseButtonStyle}
      >
        <span style={iconStyle}><SkipToStartIcon /></span> Skip to Start
      </button>
      <button 
        onClick={onStepBackward} 
        disabled={isPlaying} 
        style={isPlaying ? disabledButtonStyle : baseButtonStyle}
      >
        <span style={iconStyle}><StepBackwardIcon /></span> Step Backward
      </button>
      <button 
        onClick={onStepForward} 
        disabled={isPlaying} 
        style={isPlaying ? disabledButtonStyle : baseButtonStyle}
      >
        <span style={iconStyle}><StepForwardIcon /></span> Step Forward
      </button>
      <button 
        onClick={onSkipToEnd} 
        disabled={isPlaying} 
        style={isPlaying ? disabledButtonStyle : baseButtonStyle}
      >
        <span style={iconStyle}><SkipToEndIcon /></span> Skip to End
      </button>
    </div>
  );
};

export default AdvancedPlaybackControls;
