import React from 'react';
import { StepBackwardIcon, StepForwardIcon, SkipToStartIcon, SkipToEndIcon } from './IconComponents';

interface AdvancedPlaybackControlsProps {
  onStepBackward: () => void;
  onStepForward: () => void;
  onSkipToStart: () => void;
  onSkipToEnd: () => void;
  isPlaying: boolean;
}

// controlButtonStyle and iconStyle are no longer needed as Tailwind classes will be used directly.

const AdvancedPlaybackControls: React.FC<AdvancedPlaybackControlsProps> = ({
  onStepBackward,
  onStepForward,
  onSkipToStart,
  onSkipToEnd,
  isPlaying,
}) => {
  const commonButtonClasses = "w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed";
  const iconClasses = "h-5 w-5 mr-2"; // Tailwind classes for icon size and margin

  return (
    <div className="flex flex-col space-y-3 p-1"> {/* Added small padding to the container for better spacing from modal edges */}
      <button onClick={onSkipToStart} disabled={isPlaying} className={commonButtonClasses}>
        <SkipToStartIcon className={iconClasses} /> Skip to Start
      </button>
      <button onClick={onStepBackward} disabled={isPlaying} className={commonButtonClasses}>
        <StepBackwardIcon className={iconClasses} /> Step Backward
      </button>
      <button onClick={onStepForward} disabled={isPlaying} className={commonButtonClasses}>
        <StepForwardIcon className={iconClasses} /> Step Forward
      </button>
      <button onClick={onSkipToEnd} disabled={isPlaying} className={commonButtonClasses}>
        <SkipToEndIcon className={iconClasses} /> Skip to End
      </button>
    </div>
  );
};

export default AdvancedPlaybackControls;
